# ART JOURNEYS

Curated art & cultural travel platform — a scroll-based editorial landing site
backed by a real CMS-style API with lead/booking capture.

Two **independent** services, deployed separately, talking over REST/JSON:

```
                         ┌──────────────────────────────────────────┐
                         │                Browser                    │
                         │   https://ventis.9bricks.com (frontend)   │
                         └───────────────┬───────────────────────────┘
                                         │ HTTPS (JSON)
                       fetch NEXT_PUBLIC_API_URL
                                         │
           ┌─────────────────────────────▼─────────────────────────────┐
           │  frontend/  Next.js 15 (App Router, TS, Tailwind, Framer)  │
           │  SSR/ISR · zod-typed API layer · no DB access              │
           └─────────────────────────────┬─────────────────────────────┘
                                         │ REST  /api/v1/*
                                         │
           ┌─────────────────────────────▼─────────────────────────────┐
           │  backend/   Go 1.22 REST API (chi, pgx)                    │
           │  handler → service → repository · JSON only · no HTML      │
           └───────────┬───────────────────────────────┬───────────────┘
                       │                               │
              ┌────────▼────────┐             ┌────────▼────────┐
              │  PostgreSQL 16  │             │    Redis 7      │
              │  (source of     │             │  (GET cache)    │
              │   truth)        │             │                 │
              └─────────────────┘             └─────────────────┘
```

- **Public site is read-only.** The only write path is `POST /inquiries`
  (lead capture), which is validated, honeypot-protected, IP rate-limited,
  written to Postgres, and notified by async email.

## Quick start (Docker, full stack)

```bash
cp backend/.env.example  backend/.env      # optional; compose injects its own env
cp frontend/.env.example frontend/.env

make up        # build + start db, redis, backend, frontend
make seed      # load demo content (6 destinations, 8 journeys, 4 stories, 6 partners)
```

| Service   | URL                     |
|-----------|-------------------------|
| Frontend  | http://localhost:3000   |
| API       | http://localhost:8080   |
| Postgres  | localhost:5432          |
| Redis     | localhost:6379          |

```bash
make logs      # tail all services
make down      # stop
make clean     # stop + drop volumes
```

> If ports 3000/8080 are taken on your machine, edit the `ports:` in
> `docker-compose.yml`.

## Run services individually (no Docker)

**Backend** (needs a local Postgres):
```bash
cd backend
cp .env.example .env
go run ./cmd/api      # auto-applies migrations on boot
go run ./cmd/seed     # demo content
```

**Frontend**:
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev           # http://localhost:3000
```

## Environment variables

### Backend
| Var               | Purpose                                   |
|-------------------|-------------------------------------------|
| `DATABASE_URL`    | PostgreSQL connection string              |
| `REDIS_URL`       | Redis URL (empty → caching disabled)      |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins              |
| `SMTP_*`          | SMTP delivery (empty `SMTP_HOST` → log-only) |
| `MAIL_TO`         | Inbox that receives inquiry notifications |

### Frontend
| Var                    | Purpose                                          |
|------------------------|--------------------------------------------------|
| `NEXT_PUBLIC_API_URL`  | API base URL inlined into the browser bundle     |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (metadata, sitemap, robots)      |
| `API_INTERNAL_URL`     | Optional server-side API URL (container network) |

## Tests & CI

```bash
make backend-test     # go test ./...
cd frontend && npm run lint && npm run build
```

`.github/workflows/ci.yml` runs Go vet+test (with a Postgres service) and the
Next.js lint+build on every push/PR.

## Design system

Dark editorial palette locked in `frontend/tailwind.config.ts` +
`frontend/app/globals.css`:

| Token        | Value     | Use                       |
|--------------|-----------|---------------------------|
| `bg-base`    | `#0E0E10` | primary background        |
| `bg-elev`    | `#16161A` | elevated cards/sections   |
| `ink`        | `#F4F1EA` | primary text (ivory)      |
| `ink-muted`  | `#9A968C` | secondary text            |
| `accent`     | `#C9A227` | champagne gold accent     |
| `line`       | `#2A2A2E` | hairline rules            |

Serif display headings (Fraunces), Inter body, IBM Plex Mono eyebrows/indices.
Sections are numbered `01`–`06` in the landing scroll.

## Production deploy — ventis.9bricks.com

Target topology:

| Component | Domain                           | Suggested host          |
|-----------|----------------------------------|-------------------------|
| Frontend  | `https://ventis.9bricks.com`     | Vercel                  |
| API       | `https://api-ventis.9bricks.com` | Fly.io / Railway        |
| Database  | managed Postgres                 | Neon / Supabase         |
| Redis     | managed Redis                    | Upstash / provider Redis|

> Both domains are **single-level** subdomains of `9bricks.com` (note the dash in
> `api-ventis`, not `api.ventis`) so Cloudflare's Universal SSL `*.9bricks.com`
> certificate covers them — a `api.ventis.9bricks.com` (two levels) would not be
> covered on the free Cloudflare plan.

DNS (Cloudflare zone `9bricks.com`):

```
ventis        CNAME  cname.vercel-dns.com.        # frontend host (proxied)
api-ventis    CNAME  <your-api-host>              # Fly/Railway target (proxied)
```

Frontend env (Vercel project → see `frontend/.env.production.example`):
```
NEXT_PUBLIC_SITE_URL=https://ventis.9bricks.com
NEXT_PUBLIC_API_URL=https://api-ventis.9bricks.com
```

Backend env (see `backend/.env.production.example`):
```
ALLOWED_ORIGINS=https://ventis.9bricks.com
DATABASE_URL=postgres://...sslmode=require
REDIS_URL=rediss://...
SMTP_HOST=... SMTP_USER=... SMTP_PASS=... SMTP_FROM=no-reply@ventis.9bricks.com
```

After the API is live, seed once:
```bash
# from a machine with the production DATABASE_URL exported
cd backend && DATABASE_URL=... go run ./cmd/seed
```

> The API only needs CORS to allow `https://ventis.9bricks.com` (set
> `ALLOWED_ORIGINS=https://ventis.9bricks.com`). If you ever prefer a single
> domain, put the API behind `https://ventis.9bricks.com/api` via a reverse proxy
> and set `NEXT_PUBLIC_API_URL=https://ventis.9bricks.com/api` instead — no code
> changes required.

## Layout

```
backend/    Go API (cmd/, internal/{config,db,cache,email,models,repository,service,handler})
frontend/   Next.js app (app/, components/, lib/)
docker-compose.yml   full local stack
Makefile             up / down / migrate / seed / logs
.github/workflows/   CI
```
# ventis
