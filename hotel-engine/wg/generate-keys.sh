#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
umask 077

if ! command -v wg >/dev/null 2>&1; then
  echo "wireguard-tools (wg) is not installed. On Ubuntu: apt install wireguard"
  exit 1
fi

SERVER_PRIV="$ROOT/server.private.key"
SERVER_PUB="$ROOT/server.public.key"
PHONE_PRIV="$ROOT/phone.private.key"
PHONE_PUB="$ROOT/phone.public.key"

if [[ ! -f "$SERVER_PRIV" ]]; then
  wg genkey | tee "$SERVER_PRIV" | wg pubkey > "$SERVER_PUB"
fi
if [[ ! -f "$PHONE_PRIV" ]]; then
  wg genkey | tee "$PHONE_PRIV" | wg pubkey > "$PHONE_PUB"
fi

SERVER_PUBLIC_IP="${SERVER_PUBLIC_IP:-$(curl -sS --max-time 8 https://api.ipify.org || true)}"
WG_PORT="${WG_PORT:-51831}"

cat > "$ROOT/wg-lonaliza.conf" <<EOF
[Interface]
Address = 10.88.0.1/24
ListenPort = ${WG_PORT}
PrivateKey = $(cat "$SERVER_PRIV")
# Keep this interface dedicated to Lonaliza hotel-engine. Do not add liotrip peers.

[Peer]
PublicKey = $(cat "$PHONE_PUB")
AllowedIPs = 10.88.0.2/32
PersistentKeepalive = 25
EOF

cat > "$ROOT/phone.conf" <<EOF
[Interface]
Address = 10.88.0.2/24
PrivateKey = $(cat "$PHONE_PRIV")
DNS = 1.1.1.1

[Peer]
PublicKey = $(cat "$SERVER_PUB")
Endpoint = ${SERVER_PUBLIC_IP:-YOUR_VPS_PUBLIC_IP}:${WG_PORT}
AllowedIPs = 10.88.0.1/32
PersistentKeepalive = 25
EOF

chmod 600 "$ROOT"/*.key "$ROOT/wg-lonaliza.conf" "$ROOT/phone.conf"
echo "Wrote $ROOT/wg-lonaliza.conf and $ROOT/phone.conf"
echo "Install on the VPS (once): wg-quick up $ROOT/wg-lonaliza.conf"
echo "Copy phone.conf into the official WireGuard Android app."
echo "On the phone, run a SOCKS5 listener on 10.88.0.2:1080 then set HOTEL_PROXY_URL=socks5://10.88.0.2:1080"
