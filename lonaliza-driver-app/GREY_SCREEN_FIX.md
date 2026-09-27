# LioTrip Driver APK — Grey Screen Fix (2026-08-23)

## Symptom
After installing `liotrip-driver.apk`, the app showed only a **grey screen** with no login or home UI.

## Root cause
**Startup crash in `MaterialApp` before the first Flutter frame.**

1. **`onGenerateTitle` + l10n delegate mismatch (primary)**
   - `lib/main.dart` registered **local** `AppLocalizations` delegates (`lib/l10n/…`).
   - `lib/core/extensions/context_l10n.dart` looked up **`package:liotrip`** `AppLocalizations` (different Dart type).
   - `onGenerateTitle: (context) => context.l10n.appTitle` ran during app bootstrap, `AppLocalizations.of(context)` returned `null`, and the `!` operator threw → uncaught exception → no UI rendered.

2. **Android `NormalTheme` grey window**
   - `android/app/src/main/res/values/styles.xml` sets `NormalTheme` background to `?android:colorBackground` (system grey).
   - When Flutter crashes before drawing, users see this native grey window — not a Flutter widget.

3. **Missing `INTERNET` permission**
   - `AndroidManifest.xml` had no `<uses-permission android:name="android.permission.INTERNET" />`.
   - Would block all API calls after UI loaded; fixed proactively.

## Fixes applied
| File | Change |
|------|--------|
| `lib/main.dart` | Removed `onGenerateTitle`; use static `title: 'LioTrip Driver'`; white scaffold background; `FlutterError.onError` |
| `lib/core/extensions/context_l10n.dart` | Import local `../../l10n/app_localizations.dart` instead of `package:liotrip` |
| `lib/presentation/features/splash/views/splash_page.dart` | Navigate to `/register` after splash; logo `errorBuilder` fallback |
| `android/app/src/main/AndroidManifest.xml` | `INTERNET`, `ACCESS_NETWORK_STATE`, network security config, app label |
| `android/app/src/main/res/xml/network_security_config.xml` | HTTPS-only production domains |
| `scripts/build-apk.sh` | Auto-copy APK to `/www/wwwroot/liotrip.com/downloads/` |

## API verification
- Gateway health: `https://dashboard-pro.liotrip.com/gateway/health` → **200** `ok`
- Driver commission: `https://dashboard-pro.liotrip.com/pl:tourism/api/transfers/driver/commission` (header `x-subdomain: alrayyan`) → **200**

## Published APK
- **Primary URL:** https://dashboard-pro.liotrip.com/downloads/liotrip-driver.apk
- **Alternate URL:** https://liotrip.com/downloads/liotrip-driver.apk
- **Path:** `/www/wwwroot/liotrip.com/downloads/liotrip-driver.apk`
- **SHA256:** `5674da4a3c9ea3b086d98c88426b3714bdaacf480a9ea111e32aef1f88529d75`
- **Package:** `com.liotrip.driver`

## Reinstall instructions (user)
1. Uninstall the old **LioTrip Driver** app from the phone.
2. Download the new APK from https://dashboard-pro.liotrip.com/downloads/liotrip-driver.apk (or https://liotrip.com/downloads/liotrip-driver.apk).
3. Install and open — you should see the **white splash with logo**, then **Driver registration**.
4. If Android blocks the install, enable “Install unknown apps” for the browser/files app used to download.
