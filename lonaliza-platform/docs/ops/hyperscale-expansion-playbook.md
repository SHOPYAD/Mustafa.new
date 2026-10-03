# Hyperscale expansion playbook (Lonaliza)

**Version:** 1.0 (2026-09-30)  
**Audience:** platform engineers, SRE, investor technical due diligence

## 1. Executive summary

Lonaliza evolves from a **modular monolith** on a single VPS (T0) to a **multi-node, CDN-fronted** travel platform (T3+) with PostgreSQL as the transactional source of truth, PocketBase as legacy/file admin optional backend, Redis for cache/queues/rate limits, and async search workers for provider isolation.

## 2. Scaling tiers T0–T5

See [scaling/tier-matrix.md](./scaling/tier-matrix.md).

- **T0:** 1× Next storefront, 1× PocketBase — current baseline.
- **T1:** Nginx upstream, 2–3 Next, Redis unified — **implemented in repo** (`ecosystem.config.cjs`, `deploy/lonaliza-storefront-upstream.conf`).
- **T2:** Managed Redis + PG replica + CDN rules — [cloudflare-cdn-rules.md](../../deploy/cloudflare-cdn-rules.md).
- **T3:** Worker pools, 6–20 app nodes, Redis Cluster.
- **T4:** Multi-AZ autoscaling, object storage for media.
- **T5:** Multi-region read path + DR region.

## 3. Load distribution decisions

- **L7** for HTTP routing and TLS; **least_conn** upstream for long-lived search polls.
- **Health:** `/api/health` on storefront and admin.
- **Sticky sessions:** only if WebSocket admin features require it; prefer Redis-backed sessions.
- **Bulkheads:** `FLIGHT_SEARCH_CONCURRENCY`, hotel-engine separate process (3051).

## 4. Service extraction path

1. Async flight search (202 + poll) — **done** (`/api/flights/search/status`).
2. Extract dedicated search worker PM2 from publish worker pattern.
3. Booking command API with outbox to Postgres.
4. Comms/automation already isolated workers.

## 5. Data plane at scale

- **PostgreSQL:** schema [`database/postgres/schema/001_core.sql`](../../database/postgres/schema/001_core.sql); expand via migrations.
- **Dual backend switch:** `/admin/databases`, settings in `database/data/platform-db-settings.json`.
- **Sync:** `scripts/db-sync-orchestrator.mjs` (incremental; extend with PG upsert).
- **Sharding (T5):** hash by `tenant_id` when hot tables &gt; 10M rows.

## 6. External travel providers

- Circuit breaker + bulkhead in [`packages/server-core`](../../packages/server-core).
- Provider gateway cluster with global concurrency budget per vendor contract.

## 7. Observability & SRE

- **Request ID:** `x-request-id` Nginx → Next middleware.
- **Golden signals:** latency, traffic, errors, saturation per tier.
- **Stack target:** Prometheus + Grafana + Loki (or Datadog).
- **Incidents:** see [enterprise-operating-model.md](./scaling/enterprise-operating-model.md).

## 8. Security at scale

- PocketBase public vhost: IP allowlist [`deploy/pocketbase-allowlist.conf`](../../deploy/pocketbase-allowlist.conf).
- UFW guide: [`deploy/ops/firewall-hardening.sh`](../../deploy/ops/firewall-hardening.sh).
- Zero-trust between nodes (private VPC, mTLS optional T3+).

## 9. Infrastructure as Code

- Terraform modules (recommended): network, LB, Redis, RDS, PM2 bootstrap.
- Staging mini-T2 for k6 promotion gate.

## 10. Migration checklist T1 → T3

1. Enable upstream + 3 storefront PM2 processes.
2. Deploy Redis HA ([redis-sentinel example](../../deploy/redis-sentinel.docker-compose.example.yml)).
3. Apply CDN cache rules.
4. Run k6 baseline + fill [load-test-report-template.md](./load-test-report-template.md).
5. PG cutover rehearsal in staging with `CUTOVER` confirm.

## 11. FinOps

- Measure cost per 1M lightweight requests before adding nodes.
- Managed Redis/RDS break-even typically after T2 sustained load.

## 12. Appendix — service ports

| Service | Port |
|---------|------|
| Storefront | 3047, 3049, 3050 |
| Admin | 3048 |
| Hotel engine | 3051 |
| Redis | 6380 |
| PocketBase | 8090 |

## Changelog

- **1.0** — Initial playbook aligned with Enterprise Scale implementation.
