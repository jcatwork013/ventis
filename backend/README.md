# ART JOURNEYS — Backend (Go API)

Independent REST/JSON API for the ART JOURNEYS platform. No HTML rendering — it
only returns JSON for the Next.js frontend to consume.

## Stack

- Go 1.22, [chi](https://github.com/go-chi/chi) router
- PostgreSQL 16 via [pgx](https://github.com/jackc/pgx) (hand-written queries)
- Redis (optional) for GET-response caching
- Clean layering: `handler → service → repository`
- Embedded SQL migrations (run automatically on boot)
- Async email via a buffered channel worker (`EmailSender` interface; SMTP + noop)

> Note: the spec mentions sqlc. To keep the project copy-paste runnable with no
> codegen step, repositories use hand-written pgx queries. The layering and
> query organisation map 1:1 onto a future sqlc migration.

## Layout

```
cmd/
  api/        # HTTP server entrypoint
  seed/       # idempotent demo-data loader
internal/
  config/     # env-based configuration
  db/         # pgx pool + embedded migrations
  cache/      # Redis / noop cache
  email/      # Sender interface, SMTP + noop, async Worker
  models/     # domain structs
  repository/ # data access (one file per aggregate)
  service/    # business logic (content reads, inquiry capture)
  handler/    # chi router, middleware, JSON handlers
```

## Run locally

```bash
cp .env.example .env          # adjust DATABASE_URL / REDIS_URL as needed
go run ./cmd/api              # migrations run automatically on startup
go run ./cmd/seed             # load demo content (idempotent)
```

The API listens on `:8080`.

## Endpoints (`/api/v1`)

| Method | Path                     | Notes                                   |
|--------|--------------------------|-----------------------------------------|
| GET    | `/journeys`              | `?theme=&destination=&page=&limit=` (cache 60s) |
| GET    | `/journeys/{slug}`       | single journey + destination ref        |
| GET    | `/destinations`          | all published destinations              |
| GET    | `/destinations/{slug}`   | destination + related journeys          |
| GET    | `/stories`               | `?page=&limit=`                         |
| GET    | `/stories/{slug}`        | single story                            |
| GET    | `/partners`              | all partners                            |
| POST   | `/inquiries`             | validated, honeypot + 5/min/IP rate limit |
| GET    | `/healthz`               | liveness probe                          |

List responses: `{ "data": [...], "meta": { "page", "limit", "total" } }`
Errors: `{ "error": { "code", "message" } }`

## Quick check

```bash
curl localhost:8080/healthz
curl "localhost:8080/api/v1/journeys?theme=craft&limit=3"
curl -X POST localhost:8080/api/v1/inquiries \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","message":"Tell me about the Kyoto craft journey."}'
```

## Tests

```bash
go test ./...                 # handler + validation tests
TEST_DATABASE_URL=postgres://... go test ./internal/repository/...   # integration
```

## Docker

```bash
docker build -t artjourneys-api .
```

Multi-stage build → distroless `nonroot` runtime image.
