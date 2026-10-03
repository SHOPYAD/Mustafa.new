# Lonaliza load test report (template)

Date: __YYYY-MM-DD__  
Environment: __staging | production-offpeak__  
BASE_URL: __https://…__

## Executive summary

- Overall pass/fail against [`loadtests/scenarios/thresholds.json`](../../loadtests/scenarios/thresholds.json)
- Breaking point (first failed threshold): __VU / RPS__

## Results

| Scenario | VUs / RPS | p95 ms | Error rate | Pass |
|----------|-----------|--------|------------|------|
| smoke.js | 5 | | | |
| browse-public.js | 50 peak | | | |
| search-flights.js | 10 | | | |
| search-hotels.js | 8 | | | |

## Chaos drills

| Drill | Expected | Observed |
|-------|----------|----------|
| Kill storefront-2 PM2 | Nginx routes to 3047/3050 | |
| Redis paused | Degraded cache/rate limit | |
| Provider timeout | Circuit open, no 504 storm | |

## SLO snapshot (30d if available)

- P2 availability: __%__
- P1 search non-5xx: __%__
- Redis hit rate: __%__

## Attachments

- k6 summary JSON: `artifacts/k6-____.json`
- Grafana screenshots: `artifacts/…`
