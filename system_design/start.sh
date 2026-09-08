#!/bin/bash
set -e

# Bind to Railway's assigned port and launch the exported FastAPI application.
exec uvicorn pixtall.api:app --host 0.0.0.0 --port "${PORT:-8000}"
