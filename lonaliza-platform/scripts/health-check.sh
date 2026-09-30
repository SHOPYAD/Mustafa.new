#!/usr/bin/env bash
# Health probes. Prints status codes only, never secret values.
set -u
fail=0
probe() {
  local name="$1" url="$2"
  local expect="${3:-}"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 "$url" || echo "000")
  if [[ -n "$expect" ]]; then
    if [[ "$code" == "$expect" ]]; then
      echo "OK  $name $code"
    else
      echo "FAIL $name $code expected $expect"
      fail=1
    fi
    return
  fi
  echo "$name $code"
  if [[ "$code" != "200" && "$code" != "301" && "$code" != "302" && "$code" != "307" ]]; then
    fail=1
  fi
}
probe site "https://lonaliza.com/"
probe flights "https://lonaliza.com/flights"
probe hotels "https://lonaliza.com/hotels"
probe blog "https://lonaliza.com/blog"
probe admin_login "https://lonaliza.com/admin/login"
probe bookings_gated "https://lonaliza.com/api/bookings" 401
probe storefront_root "http://127.0.0.1:3047/"
probe storefront_health "http://127.0.0.1:3047/api/health"
probe admin_local "http://127.0.0.1:3048/admin"
probe pocketbase "http://127.0.0.1:8090/api/health"
if pm2 jlist 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); raise SystemExit(0 if any(p.get('name')=='lonaliza-hotel-redis' and p.get('pm2_env',{}).get('status')=='online' for p in d) else 1)"; then
  echo "OK  hotel_redis online"
else
  echo "FAIL hotel_redis"
  fail=1
fi
exit "$fail"
