# Code Walkthrough

## Configuration and startup

`config.py` is the only environment-variable parser. Its immutable validated settings stop insecure production startup before the API listens. `main.py` creates FastAPI, configures JSON logging, and attaches routes. `db.py` owns the SQLAlchemy engine and short-lived session factory.

## HTTP boundary

`schemas.py` defines accepted and returned data. `extra="forbid"` rejects accidental or hostile fields such as an email identity. `auth.py` exposes one `Identity` regardless of development or Supabase mode. `api.py` translates domain failures into HTTP responses and contains no balance arithmetic.

The idempotency key is a header because it describes delivery semantics, not generation content. Job creation returns `202` and `Location` because work is queued rather than completed in the request.

## Persistence and transactions

`models.py` maps the domain records and enums. Alembic owns the deployable schema; application startup never creates tables implicitly. Plan pricing is inserted by migration so every environment starts with the same versioned data.

`services.py` contains transaction-sensitive behavior:

- `submit_job` finds the active plan, calculates cost, locks the wallet, reserves credits, writes the job and ledger, and commits once.
- `claim_job` uses row locking and a time-limited lease. Railway is never called while a database transaction remains open.
- `retry_job` clears the lease and delays availability without touching credits.
- `settle_job` locks job and wallet, calculates per-image consumption, creates output rows, balances the reservation, and commits once. A terminal status makes repeated calls harmless.

The ledger helper is private because callers must not write a transaction without updating the wallet in the same unit of work.
Expected domain exceptions live beside these services because this small package has only one application-service boundary; a separate exception module would add navigation without adding isolation.

## Railway backend client and worker

`backend_client.py` is the only module that understands Railway's field names and NDJSON format. It calls the configured Pixtall backend, not the underlying image provider. The worker obtains the trusted user's stored email from PostgreSQL for Railway compatibility; public generation requests still cannot choose an email identity. This isolation permits changing the backend contract without changing wallet logic. Backend error text is bounded before persistence; credentials are never part of request payloads or logs.

`worker.py` owns concurrency, retry timing, and orchestration. Each thread claims at most one job per pass. A fresh database session is used for claiming and another for settlement, avoiding a long transaction during the external HTTP call.

## Development and verification

`dev_seed.py` is an explicit, development-only convenience and cannot run in other environments. Unit tests cover configuration guards, request validation, and the Railway backend contract. PostgreSQL integration tests exercise real reservation, idempotency, and settlement behavior when `TEST_DATABASE_URL` is supplied.

The code deliberately has no payment processor, frontend imports, Redis abstraction, generic repository base class, or automatic schema creation. Those additions would create code without solving a current requirement.
