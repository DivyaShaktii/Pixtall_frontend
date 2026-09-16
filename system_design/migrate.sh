#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$project_root"

# Fail with a clear build-image error before connecting to the database.
required_revision="0007"
if [[ ! -f "setup/migrations/versions/${required_revision}_populate_usd_plan_prices.py" ]]; then
  echo "Required Alembic revision ${required_revision} is missing from the deployment image." >&2
  exit 1
fi

exec python -m alembic -c "$project_root/alembic.ini" upgrade head
