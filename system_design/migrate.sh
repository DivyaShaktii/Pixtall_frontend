#!/bin/bash
set -e

# Run migrations using alembic
python -m alembic upgrade head
