#!/usr/bin/env bash
set -euo pipefail
source /etc/profile.d/android-sdk.sh
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FLUTTER_BIN="${FLUTTER_BIN:-/opt/flutter-latest/bin/flutter}"
"$FLUTTER_BIN" pub get

echo "Building Flutter Web Release..."
"$FLUTTER_BIN" build web --release

echo "Building Flutter Android APK Release..."
"$FLUTTER_BIN" build apk --release

APK_OUT="build/app/outputs/flutter-apk/app-release.apk"
ls -lh "$APK_OUT"

mkdir -p /www/wwwroot/lonaliza.com/downloads
mkdir -p /www/wwwroot/lonaliza.com/lonaliza-platform/storefront/public/downloads
mkdir -p /www/wwwroot/lonaliza.com/lonaliza-platform/admin-panel/public/downloads

DOWNLOADS="/www/wwwroot/lonaliza.com/downloads/lonaliza-driver.apk"
cp "$APK_OUT" "$DOWNLOADS"
cp "$APK_OUT" "/www/wwwroot/lonaliza.com/downloads/lonaliza-driver-arm64.apk"
cp "$APK_OUT" "/www/wwwroot/lonaliza.com/downloads/lonaliza-driver-universal.apk"

# Sync to web app public mirrors
cp "$APK_OUT" "/www/wwwroot/lonaliza.com/lonaliza-platform/storefront/public/downloads/lonaliza-driver.apk"
cp "$APK_OUT" "/www/wwwroot/lonaliza.com/lonaliza-platform/admin-panel/public/downloads/lonaliza-driver.apk"

SHA256="$(sha256sum "$DOWNLOADS" | awk '{print $1}')"
BUILD_DATE="$(date -u +"%Y-%m-%d %H:%M UTC")"

VERSION_JSON="/www/wwwroot/lonaliza.com/downloads/lonaliza-driver-version.json"
cat > "$VERSION_JSON" <<EOF
{"version":"1.0.0+4","buildDate":"$BUILD_DATE","sha256":"$SHA256","apkUrl":"https://lonaliza.com/downloads/lonaliza-driver.apk"}
EOF

cp "$VERSION_JSON" "/www/wwwroot/lonaliza.com/lonaliza-platform/storefront/public/downloads/lonaliza-driver-version.json"
cp "$VERSION_JSON" "/www/wwwroot/lonaliza.com/lonaliza-platform/admin-panel/public/downloads/lonaliza-driver-version.json"

echo "Successfully built and published new Driver APK (v1.0.0+4) to all endpoints!"
