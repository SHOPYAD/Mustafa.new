# Lonaliza capacity model & SLO baseline

Last updated: 2026-09-30. Production shape: single VPS + PM2 (`ecosystem.config.cjs`).

## Traffic assumptions (planning)

| Assumption | Value | Notes |
|------------|-------|--------|
| Peak concurrent visitors | 500–2,000 | Browse-heavy; not all hit origin |
| Search share of requests | 8–15% | Flights/hotels hold connections 5–120s |
| Auth/booking share | 2–5% | P0 paths |
| Target after Phase 1–2 | 100–300 lightweight RPS | With CDN + 2–4 Next instances |
| Target after Phase 3 | 30–80 search **starts**/s | Async search + Redis cache |

## Path priority

| Tier | Paths | SLO focus |
|------|-------|-----------|
| P0 | auth, bookings, payments, admin session | 99.9% success, no cache on writes |
| P1 | `/api/flights/search`, `/api/hotels/search` | 98% non-5xx; async 202 acceptable |
| P2 | `/api/public-config`, `/api/translations`, static | 99.5% availability, CDN |
| P3 | publish, swarm, cron | Best-effort; queue depth monitored |

## SLO definitions (investor-facing)

- **Availability (P2):** non-5xx ≥ 99.5% rolling 30d on `/`, `/api/public-config`, `/api/translations`.
- **Search resilience (P1):** ≥ 98% responses are 200/202/429 (not 502/504) at target load.
- **Redis cache:** ≥ 85% hit rate on repeated flight/hotel query keys after warm-up.
- **BullMQ:** ≥ 99% jobs completed; DLQ &lt; 0.5%.
- **Database:** RPO ≤ 15 min; RTO ≤ 60 min; weekly restore drill logged.

## Current bottlenecks (T0)

1. Single Next.js process on port 3047 — event loop blocked by long provider calls.
2. PocketBase single writer (SQLite) on 127.0.0.1:8090.
3. In-process rate limit & TTL cache — not shared across instances.
4. Nginx `proxy_read_timeout 120s` — slow providers pile up connections.

## Failure order under load

1. Next.js event loop saturation (search + browse mixed).
2. PocketBase write queue / lock contention.
3. Redis optional — falls back to in-memory per process.
4. OOM / PM2 restart on `max_memory_restart`.

## Capacity triggers (when to scale tier)

See [`scaling/tier-matrix.md`](scaling/tier-matrix.md). Examples:

- Add 2nd storefront instance when p95 origin latency &gt; 1.2s for P2 for 7 days.
- Enable async search when search 5xx &gt; 2% under k6 smoke.
- Move to T2 (multi-node) when sustained &gt; 150 lightweight RPS at origin.

## Measurement

- k6 suite: [`../../loadtests/README.md`](../../loadtests/README.md)
- Request correlation: `X-Request-Id` (Nginx → Next → logs)
- Baseline script: `loadtests/run-baseline.sh`
