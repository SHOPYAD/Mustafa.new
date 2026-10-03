# Load & stress tests (k6)

## Prerequisites

Install [k6](https://k6.io/docs/get-started/installation/):

```bash
# Debian/Ubuntu example
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17F747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

## Environment

```bash
export BASE_URL="${BASE_URL:-https://lonaliza.com}"
export K6_VUS="${K6_VUS:-10}"
export K6_DURATION="${K6_DURATION:-1m}"
```

For staging/local:

```bash
export BASE_URL=http://127.0.0.1:3047
```

## Scenarios

| Script | Purpose |
|--------|---------|
| `k6/smoke.js` | Minimal health + public-config |
| `k6/browse-public.js` | Home + public APIs |
| `k6/search-flights.js` | Flight search (use `MOCK_PROVIDER=1` in app for staging) |
| `k6/search-hotels.js` | Hotel search API |
| `k6/auth-otp.js` | Rate limit behavior (expect 429) |

Thresholds: `scenarios/thresholds.json`.

## Run

```bash
./run-baseline.sh
# or
k6 run --env BASE_URL="$BASE_URL" k6/smoke.js
```

## Safety

- Do **not** run high-VU tests against production without maintenance window.
- Prefer off-peak or dedicated staging mirroring prod nginx upstream.
