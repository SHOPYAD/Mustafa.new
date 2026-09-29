#!/usr/bin/env bash
# Local health probes. Prints status codes only, never secret values.
set -u
fail=0
probe() {
  local name="$1" url="$2"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 "$url" || echo "000")
  echo "$name $code"
  if [[ "$code" != "200" && "$code" != "307" && "$code" != "302" ]]; then
    fail=1
  fi
}
probe storefront_root "http://127.0.0.1:3047/"
probe storefront_flights "http://127.0.0.1:3047/flights"
probe storefront_hotels "http://127.0.0.1:3047/hotels"
probe storefront_blog "http://127.0.0.1:3047/blog"
probe storefront_health "http://127.0.0.1:3047/api/health"
probe admin_login "http://127.0.0.1:3048/admin"
probe pocketbase "http://127.0.0.1:8090/api/health"
if command -v redis-cli >/dev/null; then
  if redis-cli -p 6380 ping 2>/dev/null | grep -q PONG; then
    echo "hotel_redis PONG"
  else
    echo "hotel_redis FAIL"
    fail=1
  fi
fi
exit "$fail"
