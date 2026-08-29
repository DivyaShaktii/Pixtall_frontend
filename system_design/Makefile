.PHONY: install notebook-install notebook db migrate seed api worker test integration lint typecheck check

install:
	python3.12 -m venv .venv
	.venv/bin/pip install -e '.[dev]'

notebook-install:
	.venv/bin/pip install -e '.[notebook]'

notebook:
	.venv/bin/jupyter lab Pixtall_System_Design_Walkthrough.ipynb

db:
	docker compose up -d postgres

migrate:
	.venv/bin/alembic upgrade head

seed:
	.venv/bin/python -m pixtall.dev_seed

api:
	.venv/bin/uvicorn pixtall.main:app --reload

worker:
	.venv/bin/python -m pixtall.worker

test:
	.venv/bin/pytest -m 'not integration'

integration:
	TEST_DATABASE_URL="$$(.venv/bin/python -c 'from pixtall.config import get_settings; print(get_settings().database_url)')" .venv/bin/pytest tests/integration

lint:
	.venv/bin/ruff check .

typecheck:
	.venv/bin/mypy src

check: lint typecheck test
