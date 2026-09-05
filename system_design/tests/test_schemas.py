import pytest
from pydantic import ValidationError

from pixtall.models import ImageQuality
from pixtall.schemas import GenerationRequest


def valid_request() -> dict[str, object]:
    return {
        "product_image_base64": "data:image/png;base64,AA==",
        "product_category": "fashion",
        "product_subcategory": "shirt",
        "scene": "studio",
        "size": "1:1",
        "model": "none",
        "intended_use": "marketplace",
        "image_count": 2,
        "quality": ImageQuality.STANDARD,
    }


def test_request_accepts_supported_generation() -> None:
    parsed = GenerationRequest.model_validate(valid_request())
    assert parsed.image_count == 2


def test_request_rejects_more_than_four_images() -> None:
    payload = valid_request()
    payload["image_count"] = 5
    with pytest.raises(ValidationError):
        GenerationRequest.model_validate(payload)


def test_request_rejects_unknown_fields() -> None:
    payload = valid_request()
    payload["email"] = "attacker@example.com"
    with pytest.raises(ValidationError):
        GenerationRequest.model_validate(payload)
