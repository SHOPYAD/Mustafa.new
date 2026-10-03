# Enterprise operating model (Lonaliza)

## SRE practices

- **SLI/SLO:** defined in [capacity-model.md](../capacity-model.md)
- **Error budget:** pause feature work when P2 availability burns budget in 7d window
- **On-call:** severity 1 = site down; 2 = search/degraded; 3 = admin-only

## Incident lifecycle

1. Detect (health `/api/health`, 5xx rate, PM2 restarts)
2. Mitigate (disable instance in upstream, enable circuit breaker)
3. Communicate (status template in admin)
4. Postmortem within 72h (blameless)

## Change management

- Nginx/ecosystem changes: staging + k6 smoke
- Database cutover: requires `CUTOVER` confirm in `/admin/databases`
- Rollback: flip active backend to PocketBase via same UI

## FinOps

- Track $/1M lightweight requests and $/1k search jobs
- Prefer managed Redis/Postgres after T2
