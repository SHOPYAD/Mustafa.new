# SLO export (manual / dashboard)

Use this checklist monthly for investor reporting.

| SLI | Target | Source |
|-----|--------|--------|
| P2 availability | ≥ 99.5% non-5xx | Nginx access log / CDN |
| P1 search non-5xx | ≥ 98% | `/api/flights/search`, `/api/hotels/search` |
| Redis cache hit | ≥ 85% | App metrics (add counter on cacheGet hit) |
| Queue success | ≥ 99% | BullMQ metrics |
| Backup restore | RTO ≤ 60m | Weekly drill log |

Export raw CSV from logs or Grafana and attach to [load-test-report-template.md](./load-test-report-template.md).
