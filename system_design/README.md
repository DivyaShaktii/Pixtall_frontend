# Pixtall Credit and Generation Service

This directory is an independent Python service. It does not import, modify, or run inside the React frontend. Its public API creates durable jobs; a separate worker calls the configured Pixtall Railway backend URL and settles reserved credits. The underlying image-generation provider remains entirely hidden behind that existing backend.

## Why this service exists

The integrated frontend no longer keeps one HTTP connection open while Railway streams generated images. The asynchronous boundary works as follows:

1. The client submits a request with an idempotency key.
2. The API locks the wallet, reserves credits, and creates a queued job in one PostgreSQL transaction.
3. The client receives `202 Accepted` and a Job ID immediately.
4. A worker atomically claims the job using `FOR UPDATE SKIP LOCKED`.
5. The worker consumes Railway's NDJSON response and records each output.
6. Settlement consumes credits for successful images and releases the rest.
7. The client polls the job endpoint even after a refresh or lost connection.

## Local setup

Requirements: Python 3.12, Docker, and Docker Compose.

```bash
cp .env.example .env
make install
make db
make migrate
make seed
make api
```

Run `make worker` in a second terminal. Open `http://localhost:8000/docs` for the generated OpenAPI interface. The development identity owns 10,000 seeded credits and a Creator subscription.

To use Supabase, replace `DATABASE_URL` with its direct or session-pooler PostgreSQL connection string. Copied `postgres://` and `postgresql://` URLs are normalized automatically to the installed `psycopg` driver. Alembic must connect to a migration-capable endpoint. Transaction pooling can be used by the API only when its limitations are acceptable.

## Example request

```bash
curl -X POST http://localhost:8000/v1/generation-jobs \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: demo-request-0001' \
  -d '{
    "product_image_base64":"data:image/png;base64,...",
    "model_image_base64":null,
    "product_category":"fashion",
    "product_subcategory":"shirt",
    "scene":"studio",
    "size":"1:1",
    "model":"none",
    "intended_use":"marketplace",
    "image_count":2,
    "quality":"standard"
  }'
```

Use the returned `Location` endpoint to poll. Reusing the same `Idempotency-Key` for the same user returns the original job and does not reserve credits twice.

## Authentication

`AUTH_MODE=development` deliberately ignores client identity and uses `DEV_USER_ID`. Configuration validation refuses this mode when `APP_ENV=production`.

For future Supabase Auth integration, set `AUTH_MODE=supabase`, the JWT issuer, audience, and JWKS URL. The service verifies signature, issuer, audience, and expiry, then uses the JWT `sub` as the user ID. Emails in generation payloads are rejected.

## Commands

- `make migrate`: apply the schema and seed immutable plan definitions.
- `make seed`: create only the local development user, wallet, and subscription.
- `make api`: start FastAPI.
- `make worker`: start the bounded worker pool.
- `make check`: run Ruff, mypy, and unit tests.
- `make integration`: run PostgreSQL integration tests using `DATABASE_URL`.

## Deployment boundary

This service is deployed separately rather than copied into frontend code. Set production configuration, apply migrations once, run the API command in one service/process group and the worker command in another. The React frontend already submits generation jobs, polls their status, and reads wallet balances through `VITE_SYSTEM_API_BASE_URL`. Production deployment must set that variable to the public service URL and activate Supabase Auth.

Before production, generated base64 output should be moved to object storage and `result_reference` should contain a signed or access-controlled object key. The backend client preserves the current Railway response for compatibility, so base64 returned by Railway is currently stored.

Billing tables contain integer-paise totals and payment references, but checkout, GST invoicing, webhooks, and renewals are intentionally not implemented.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the detailed design and [CODE_WALKTHROUGH.md](CODE_WALKTHROUGH.md) for why each module exists.

## Executable teaching notebook

`Pixtall_System_Design_Walkthrough.ipynb` follows the complete request lifecycle beginning immediately after the frontend's **Generate** click. Part A reads the actual job created by FastAPI, reruns request validation and pricing as visible functions, resolves the user and active plan, reconstructs the atomic credit reservation from its real ledger row, and shows the immediate `202 Accepted` response. Part B acts as the manual worker: it claims that job, calls the configured Railway backend, and settles outputs and credits. It imports no project functions and creates no tables. Every important call prints a safe summary of its input and output; Base64 data and the database secret are never printed.

For Google Colab, upload the notebook and add the Supabase **Session Pooler** PostgreSQL connection string to Colab Secrets with the name `DATABASE_URL`. Colab generally cannot reach Supabase's IPv6-only direct endpoint (`db.[project-ref].supabase.co`), while the shared Session Pooler is IPv4-compatible. Obtain it from the Supabase project's **Connect → Session pooler** option. Do not use the Supabase REST project URL or anon key. Then:

1. Run `make api` locally and start the frontend with `npm run dev`.
2. Keep `make worker` stopped because the notebook temporarily performs that role.
3. Click **Generate** in the frontend.
4. Run the notebook cells from top to bottom.

If a retry is scheduled, wait until the displayed `available_at` time and rerun from the peek cell. For another generation, submit another frontend job and rerun from the peek cell.

The same notebook can be opened locally when a browser-based walkthrough is preferred:

```bash
make notebook-install
make notebook
```
