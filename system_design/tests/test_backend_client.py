import json

import httpx
import pytest

from pixtall.backend_client import BackendCallError, RailwayBackendClient


def request_payload(count: int = 2) -> dict[str, object]:
    return {
        "product_image_base64": "data:image/png;base64,AA==",
        "model_image_base64": None,
        "product_category": "fashion",
        "product_subcategory": "shirt",
        "scene": "studio",
        "size": "1:1",
        "model": "none",
        "intended_use": "marketplace",
        "image_count": count,
    }


def test_reads_backend_ndjson_and_tracks_partial_results(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    body = b"\n".join(
        [
            json.dumps({"index": 0, "imageUrl": "https://cdn.example/0.png"}).encode(),
            json.dumps({"index": 1, "error": "generation failed"}).encode(),
        ]
    )

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url == httpx.URL("https://railway.example/generate_image")
        assert json.loads(request.content)["email"] == "user@example.com"
        return httpx.Response(200, content=body)

    transport = httpx.MockTransport(handler)
    real_client = httpx.Client
    monkeypatch.setattr(httpx, "Client", lambda **kwargs: real_client(transport=transport))
    result = RailwayBackendClient(
        url="https://railway.example/generate_image", timeout_seconds=1
    ).generate(request_payload(), user_email="user@example.com")
    assert result.images == ["https://cdn.example/0.png", None]
    assert result.errors == {1: "generation failed"}


@pytest.mark.parametrize("status_code", [429, 500, 503])
def test_retryable_backend_statuses(monkeypatch: pytest.MonkeyPatch, status_code: int) -> None:
    transport = httpx.MockTransport(lambda request: httpx.Response(status_code))
    real_client = httpx.Client
    monkeypatch.setattr(httpx, "Client", lambda **kwargs: real_client(transport=transport))
    with pytest.raises(BackendCallError) as caught:
        RailwayBackendClient(
            url="https://railway.example/generate_image", timeout_seconds=1
        ).generate(request_payload(1), user_email="user@example.com")
    assert caught.value.retryable is True


def test_non_retryable_backend_client_error(monkeypatch: pytest.MonkeyPatch) -> None:
    transport = httpx.MockTransport(lambda request: httpx.Response(400))
    real_client = httpx.Client
    monkeypatch.setattr(httpx, "Client", lambda **kwargs: real_client(transport=transport))
    with pytest.raises(BackendCallError) as caught:
        RailwayBackendClient(
            url="https://railway.example/generate_image", timeout_seconds=1
        ).generate(request_payload(1), user_email="user@example.com")
    assert caught.value.retryable is False
