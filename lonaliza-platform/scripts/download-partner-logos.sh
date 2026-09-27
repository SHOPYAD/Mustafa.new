#!/usr/bin/env bash
set -uo pipefail
DIR="/www/wwwroot/lonaliza.com/storefront/public/partners"
mkdir -p "$DIR"
UA="Mozilla/5.0 (compatible; AlrayyanLogoFetch/1.0)"

save_first() {
  local dest="$1"
  shift
  local tmp
  tmp="$(mktemp)"
  for url in "$@"; do
    if curl -sSL --max-time 20 -A "$UA" "$url" -o "$tmp" && [[ -s "$tmp" ]]; then
      local kind
      kind="$(file -b --mime-type "$tmp" || true)"
      local size
      size="$(wc -c < "$tmp")"
      if [[ "$size" -gt 400 ]] && [[ "$kind" == image/* || "$kind" == application/xml || "$kind" == text/xml || "$kind" == text/plain || "$kind" == image/svg+xml ]]; then
        if [[ "$kind" == image/svg+xml || "$kind" == text/xml || "$kind" == application/xml || "$kind" == text/plain ]]; then
          if grep -qi "<svg" "$tmp"; then
            mv "$tmp" "${dest%.png}.svg"
            echo "OK svg $dest <- $url ($size)"
            return 0
          fi
        fi
        mv "$tmp" "$dest"
        echo "OK $kind $dest <- $url ($size)"
        return 0
      fi
    fi
  done
  rm -f "$tmp"
  echo "FAIL $dest"
  return 1
}

save_first "$DIR/booking.png" \
  "https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg" \
  "https://logo.clearbit.com/booking.com" \
  "https://cdn.simpleicons.org/bookingdotcom/003580"

save_first "$DIR/agoda.png" \
  "https://upload.wikimedia.org/wikipedia/commons/0/0b/Agoda_logo.svg" \
  "https://upload.wikimedia.org/wikipedia/commons/a/a4/Agoda_logo.svg" \
  "https://logo.clearbit.com/agoda.com" \
  "https://cdn.simpleicons.org/agoda/5C2E91"

save_first "$DIR/expedia.png" \
  "https://upload.wikimedia.org/wikipedia/commons/5/5b/Expedia_Logo_2023.svg" \
  "https://upload.wikimedia.org/wikipedia/commons/8/8c/Expedia_Logo.svg" \
  "https://logo.clearbit.com/expedia.com" \
  "https://cdn.simpleicons.org/expedia/000000"

save_first "$DIR/hotelscom.png" \
  "https://upload.wikimedia.org/wikipedia/commons/d/d4/Hotels.com_logo.svg" \
  "https://upload.wikimedia.org/wikipedia/commons/5/51/Hotels.com_logo.svg" \
  "https://logo.clearbit.com/hotels.com" \
  "https://cdn.simpleicons.org/hotelsdotcom/D32F2F"

save_first "$DIR/priceline.png" \
  "https://upload.wikimedia.org/wikipedia/commons/7/7e/Priceline.com_Logo.svg" \
  "https://logo.clearbit.com/priceline.com" \
  "https://cdn.simpleicons.org/priceline/1868DB"

save_first "$DIR/tripcom.png" \
  "https://upload.wikimedia.org/wikipedia/commons/8/86/Trip.com_logo.svg" \
  "https://logo.clearbit.com/trip.com" \
  "https://cdn.simpleicons.org/tripdotcom/287DFA"

save_first "$DIR/tripadvisor.png" \
  "https://upload.wikimedia.org/wikipedia/commons/0/02/TripAdvisor_Logo.svg" \
  "https://logo.clearbit.com/tripadvisor.com" \
  "https://cdn.simpleicons.org/tripadvisor/00AF87"

save_first "$DIR/kayak.png" \
  "https://upload.wikimedia.org/wikipedia/commons/6/6a/Kayak_Logo.svg" \
  "https://logo.clearbit.com/kayak.com" \
  "https://cdn.simpleicons.org/kayak/FF690F"

save_first "$DIR/vio.png" \
  "https://logo.clearbit.com/vio.com" \
  "https://cdn.simpleicons.org/viacomcbs/000000"

save_first "$DIR/hopper.png" \
  "https://logo.clearbit.com/hopper.com" \
  "https://cdn.simpleicons.org/hopper/FF6B6B"

save_first "$DIR/zenhotels.png" \
  "https://logo.clearbit.com/zenhotels.com" \
  "https://www.google.com/s2/favicons?sz=128&domain=zenhotels.com"

save_first "$DIR/stayforlong.png" \
  "https://logo.clearbit.com/stayforlong.com" \
  "https://www.google.com/s2/favicons?sz=128&domain=stayforlong.com"

save_first "$DIR/prestigia.png" \
  "https://logo.clearbit.com/prestigia.com" \
  "https://www.google.com/s2/favicons?sz=128&domain=prestigia.com"

save_first "$DIR/hotelscombined.png" \
  "https://logo.clearbit.com/hotelscombined.com" \
  "https://cdn.simpleicons.org/hotelscombined/E31C3D"

ls -la "$DIR"
