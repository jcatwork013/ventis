# ventis.9bricks.com — deployment (live on this host)

The stack is already built, running, and wired into the host nginx. You only need
to point DNS — then it serves immediately.

## What is already set up

| Piece                | State                                                        |
|----------------------|--------------------------------------------------------------|
| Frontend container   | `127.0.0.1:13100` (Next.js, `restart: unless-stopped`)       |
| Backend container    | `127.0.0.1:18090` (Go API, `restart: unless-stopped`)        |
| Postgres + Redis     | internal docker network only (not published)                 |
| Seed data            | loaded (6 destinations, 8 journeys, 4 stories, 6 partners)   |
| nginx `ventis.9bricks.com`     | → `127.0.0.1:13100` (enabled, reloaded)            |
| nginx `api-ventis.9bricks.com` | → `127.0.0.1:18090` (enabled, reloaded)            |
| Client API URL baked | `https://api-ventis.9bricks.com`                             |
| CORS allowed origin  | `https://ventis.9bricks.com`                                 |

Server public IP: **62.146.239.31**

## Step 1 — DNS (Cloudflare zone `9bricks.com`)

Add two **A** records, both pointing at the host, **Proxied (orange cloud)**:

```
Type  Name         Content          Proxy
A     ventis       62.146.239.31    Proxied
A     api-ventis   62.146.239.31    Proxied
```

(Single-level subdomains with a dash — covered by Cloudflare Universal SSL.)

## Step 2 — SSL mode

**For an instant test:** Cloudflare → SSL/TLS → Overview → set mode **Flexible**.
Cloudflare terminates HTTPS at the edge and talks HTTP to this origin (port 80,
already serving). `https://ventis.9bricks.com` works the moment DNS propagates —
no cert needed on the box.

**For production-grade (recommended after testing):** issue real origin certs and
switch Cloudflare to **Full (strict)**:

```bash
sudo certbot --nginx -d ventis.9bricks.com
sudo certbot --nginx -d api-ventis.9bricks.com
# then in Cloudflare: SSL/TLS mode → Full (strict)
```

certbot edits the two configs in `/etc/nginx/sites-available/` to add the 443
block + http→https redirect automatically.

## Operating the stack

```bash
cd /root/source/ventis
# start / rebuild
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
# logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend frontend
# reseed (idempotent)
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint /app/seed backend
# stop
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Verify without DNS (already passing)

```bash
curl -H 'Host: api-ventis.9bricks.com' http://127.0.0.1/healthz
curl -H 'Host: ventis.9bricks.com'     http://127.0.0.1/ | grep -o 'ART JOURNEYS'
```

## If you change the API domain or origin

- API origin baked into the browser bundle = `NEXT_PUBLIC_API_URL` build arg in
  `docker-compose.prod.yml`. Change it, then rebuild the frontend image.
- Backend CORS = `ALLOWED_ORIGINS` env in `docker-compose.prod.yml`.
