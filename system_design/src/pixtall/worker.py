import concurrent.futures
import random
import socket
import time
import uuid

import structlog
from sqlalchemy import select

from pixtall.backend_client import BackendCallError, RailwayBackendClient
from pixtall.config import get_settings
from pixtall.db import SessionFactory
from pixtall.models import User
from pixtall.services import claim_job, retry_job, settle_job

log = structlog.get_logger()


def _process(worker_id: str) -> bool:
    settings = get_settings()
    with SessionFactory() as session:
        job = claim_job(session, worker_id=worker_id, lease_seconds=settings.worker_lease_seconds)
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


def run() -> None:
    settings = get_settings()
    worker_prefix = f"{socket.gethostname()}-{uuid.uuid4()}"
    with concurrent.futures.ThreadPoolExecutor(max_workers=settings.worker_concurrency) as executor:
        while True:
            futures = [
                executor.submit(_process, f"{worker_prefix}-{index}")
                for index in range(settings.worker_concurrency)
            ]
            found_work = any(future.result() for future in futures)
            if not found_work:
                time.sleep(settings.worker_poll_seconds)


if __name__ == "__main__":
    run()
