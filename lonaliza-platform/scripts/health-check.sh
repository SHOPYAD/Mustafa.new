#!/usr/bin/env bash
set -euo pipefail
FAIL=0
check() {
  local name="$1" url="$2"
  code="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "$url" || echo 000)"
  if [[ "$code" =~ ^(200|301|302)$ ]]; then
    echo "OK  $name $code"
  else
    echo "FAIL $name $code"
    FAIL=1
  fi
}
check site https://lonaliza.com/
check admin_login https://lonaliza.com/admin/login
code="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 https://lonaliza.com/api/bookings || echo 000)"
if [[ "$code" == "401" ]]; then
  echo "OK  bookings_gated 401"
else
  echo "FAIL bookings_gated $code (expected 401)"
  FAIL=1
fi
exit "$FAIL"
