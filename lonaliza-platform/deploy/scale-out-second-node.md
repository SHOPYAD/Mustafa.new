# Second application node (Phase 3)

1. Provision VPS in same region; private network or VPN to Redis/Postgres.
2. Clone `lonaliza-platform`; same release tag as primary.
3. Run PM2 apps **without** PocketBase/Redis if those stay on node 1 (or point env to managed services).
4. Add node IP to upstream on primary Nginx **or** use Cloudflare load balancer to multiple origins.
5. Health check: `GET /api/health` every 10s.
6. Run k6 from staging against combined LB before traffic shift.

Environment on node 2:

- `REDIS_HOST` → primary Redis or Elasticache
- `POCKETBASE_URL` → `http://10.x.x.x:8090` (private)
- `DATABASE_URL` → Postgres primary (private)
