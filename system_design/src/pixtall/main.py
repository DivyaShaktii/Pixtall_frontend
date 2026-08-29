import structlog
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pixtall.api import router
from pixtall.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    structlog.configure(processors=[structlog.processors.JSONRenderer()])
    app = FastAPI(
        title="Pixtall Credit and Generation API",
        version="0.1.0",
        description="Durable credit reservation and asynchronous image-generation orchestration.",
    )
    app.state.settings = settings
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_origin_regex=(
            r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
            if settings.app_env == "development"
            else None
        ),
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Idempotency-Key", "Authorization"],
    )
    app.include_router(router)
    return app


app = create_app()


def run() -> None:
    uvicorn.run("pixtall.main:app", host="0.0.0.0", port=8000)
