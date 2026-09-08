import concurrent.futures
import json
import random
import socket
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

import httpx
import structlog
from sqlalchemy import select

from pixtall.core import (
    SessionFactory,
    User,
    claim_job,
    get_settings,
    retry_job,
    settle_job,
)

log = structlog.get_logger()


class BackendCallError(Exception):
    def __init__(self, message: str, *, retryable: bool) -> None:
        super().__init__(message)
        self.retryable = retryable


@dataclass
class BackendResult:
    images: list[str | None]
    errors: dict[int, str] = field(default_factory=dict)


class RailwayBackendClient:
    """Call Pixtall's existing Railway backend and parse its NDJSON response."""

    def __init__(self, *, url: str, timeout_seconds: float) -> None:
        self.url = url
        self.timeout = httpx.Timeout(timeout_seconds)

    def generate(self, request: dict[str, Any], *, user_email: str | None) -> BackendResult:
        count = int(request["image_count"])
        payload = {
            "productImageBase64": request["product_image_base64"],
            "modelImageBase64": request.get("model_image_base64"),
            "productCategory": request["product_category"],
            "productSubcategory": request["product_subcategory"],
            "scene": request["scene"],
            "size": request["size"],
            "model": request["model"],
            "intendUse": request["intended_use"],
            "numImages": count,
            "email": user_email,
        }
        images: list[str | None] = [None] * count
        errors: dict[int, str] = {}
        try:
            with (
                httpx.Client(timeout=self.timeout) as client,
                client.stream("POST", self.url, json=payload) as response,
            ):
                if response.status_code == 429 or response.status_code >= 500:
                    raise BackendCallError(
                        f"Railway backend temporarily unavailable ({response.status_code})",
                        retryable=True,
                    )
                if response.status_code >= 400:
                    raise BackendCallError(
                        f"Railway backend rejected the request ({response.status_code})",
                        retryable=False,
                    )
                next_index = 0
                for line in response.iter_lines():
                    if not line.strip():
                        continue
                    try:
                        item = json.loads(line)
                    except json.JSONDecodeError:
                        errors[next_index] = "Railway backend returned an unreadable result"
                        next_index += 1
                        continue
                    index = item.get("index", next_index)
                    if not isinstance(index, int) or not 0 <= index < count:
                        continue
                    backend_error = item.get("error") or item.get("detail")
                    image = item.get("image") or item.get("imageUrl") or item.get("imageBase64")
                    if isinstance(image, str) and image:
                        images[index] = image
                    elif isinstance(backend_error, str):
                        errors[index] = backend_error[:500]
                    else:
                        errors[index] = "Railway backend returned no image"
                    next_index = max(next_index, index + 1)
        except httpx.RequestError as exc:
            raise BackendCallError("Could not reach the Railway backend", retryable=True) from exc

        for index, image in enumerate(images):
            if image is None and index not in errors:
                errors[index] = "Railway backend returned no result"
        return BackendResult(images=images, errors=errors)


def _process(worker_id: str) -> bool:
    settings = get_settings()
    with SessionFactory() as session:
        job = claim_job(
            session,
            worker_id=worker_id,
            lease_seconds=settings.worker_lease_seconds,
        )
        user_email = (
            session.scalar(select(User.email).where(User.id == job.user_id)) if job else None
        )
    if job is None:
        return False

    backend = RailwayBackendClient(
        url=str(settings.railway_backend_url),
        timeout_seconds=settings.backend_timeout_seconds,
    )
    try:
        result = backend.generate(job.request_payload, user_email=user_email)
    except BackendCallError as exc:
        with SessionFactory() as session:
            if exc.retryable and job.attempt_count < settings.backend_max_attempts:
                delay = min(60.0, 2 ** (job.attempt_count - 1)) + random.uniform(0, 1)
                retry_job(session, job_id=job.id, delay_seconds=delay, error=str(exc))
                log.warning("job_retry_scheduled", job_id=str(job.id), attempt=job.attempt_count)
            else:
                settle_job(
                    session,
                    job_id=job.id,
                    results=[None] * job.image_count,
                    errors={index: str(exc) for index in range(job.image_count)},
                    terminal_error=str(exc),
                )
                log.error("job_failed", job_id=str(job.id), reason=str(exc))
        return True

    with SessionFactory() as session:
        settle_job(
            session,
            job_id=job.id,
            results=result.images,
            errors=result.errors,
            terminal_error="Some images could not be generated" if result.errors else None,
        )
    log.info("job_settled", job_id=str(job.id))
    return True


def run(stop_event: threading.Event | None = None) -> None:
    settings = get_settings()
    worker_prefix = f"{socket.gethostname()}-{uuid.uuid4()}"
    with concurrent.futures.ThreadPoolExecutor(max_workers=settings.worker_concurrency) as executor:
        while stop_event is None or not stop_event.is_set():
            futures = [
                executor.submit(_process, f"{worker_prefix}-{index}")
                for index in range(settings.worker_concurrency)
            ]
            found_work = any(future.result() for future in futures)
            if not found_work:
                if stop_event is not None:
                    stop_event.wait(settings.worker_poll_seconds)
                else:
                    time.sleep(settings.worker_poll_seconds)


if __name__ == "__main__":
    run()
