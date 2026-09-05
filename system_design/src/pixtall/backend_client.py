import json
from dataclasses import dataclass, field
from typing import Any

import httpx


class BackendCallError(Exception):
    def __init__(self, message: str, *, retryable: bool) -> None:
        super().__init__(message)
        self.retryable = retryable


@dataclass
class BackendResult:
    images: list[str | None]
    errors: dict[int, str] = field(default_factory=dict)


class RailwayBackendClient:
    """Calls Pixtall's existing Railway backend, never the underlying image provider."""

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
