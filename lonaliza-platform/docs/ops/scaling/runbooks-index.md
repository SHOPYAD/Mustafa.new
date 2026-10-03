# Runbooks index

| ID | Title | File / action |
|----|-------|----------------|
| RB-01 | Add storefront PM2 instance | Edit `ecosystem.config.cjs` + upstream port |
| RB-02 | PocketBase allowlist update | `deploy/pocketbase-allowlist.conf` + nginx reload |
| RB-03 | PostgreSQL cutover | `/admin/databases` + `CUTOVER` confirm |
| RB-04 | Manual PB→PG sync | `POST /api/admin/databases/sync` or PM2 `lonaliza-db-sync` |
| RB-05 | Load baseline | `loadtests/run-baseline.sh` |
| RB-06 | Redis failure | Verify degraded mode; restore 6380 |
| RB-07 | Provider storm | Lower `FLIGHT_SEARCH_CONCURRENCY`; circuit opens automatically |
