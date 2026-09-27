# LioTrip Driver App — User Flow (2026-08-23)

## Launch flow

1. **Splash** (`/splash`) — LioTrip purple + gold branding, AR/EN/TR
2. **Start now** → **Registration** (`/register`)
3. After register → **Catalog** (`/catalog`) — pick vehicles/tours, upload documents
4. **Home** (`/`) — pending approval until admin approves supplier

## API endpoints (driver mobile)

All REST calls use **gateway prefix** (nginx strips `/gateway/` → gateway `pl:tourism/…`):

| Action | Method | Path |
|--------|--------|------|
| Health | GET | `/gateway/pl:tourism/api/transfers/driver/health` |
| Commission | GET | `/gateway/pl:tourism/api/transfers/driver/commission` |
| Register | POST | `/gateway/pl:tourism/api/transfers/driver/register` |
| Profile | GET/PATCH | `/gateway/pl:tourism/api/transfers/driver/profile` |
| Platform catalog | GET | `/gateway/pl:tourism/api/transfers/driver/catalog` |
| Fleet | GET/POST | `/gateway/pl:tourism/api/transfers/driver/fleet` |
| New vehicle class | POST | `/gateway/pl:tourism/api/transfers/driver/fleet/new-class` |
| Fleet pricing | PATCH | `/gateway/pl:tourism/api/transfers/driver/fleet/:vehicleId/pricing` |
| Tour offers | GET/POST | `/gateway/pl:tourism/api/transfers/driver/tour-offers` |
| Active trips | GET | `/gateway/pl:tourism/api/transfers/driver/bookings/active` |
| Trip history | GET | `/gateway/pl:tourism/api/transfers/driver/bookings/history` |
| Trip status | POST | `/gateway/pl:tourism/api/transfers/driver/bookings/:id/status` |
| Complete trip | POST | `/gateway/pl:tourism/api/transfers/driver/bookings/:id/complete` |
| Earnings | GET | `/gateway/pl:tourism/api/transfers/driver/earnings` |
| Payouts | GET | `/gateway/pl:tourism/api/transfers/driver/payouts` |
| Sub-drivers | GET/POST | `/gateway/pl:tourism/api/transfers/driver/drivers` |
| Documents | POST | `/gateway/pl:tourism/api/transfers/driver/documents` |
| File upload | POST | `/gateway/pl:tourism/api/transfers/driver/upload` |
| Telemetry | POST | `/gateway/pl:tourism/api/transfers/driver/telemetry` |

**Headers:** `x-subdomain: alrayyan` (tenant data only — never shown in UI), `Content-Type: application/json`

**Base URL:** `https://dashboard-pro.liotrip.com`

## Download

- **URL:** https://dashboard-pro.liotrip.com/downloads/liotrip-driver.apk
- **SHA256:** `419825c610fb0ac83f9f3b9a68a2409c8dc6e15fe2452d8f1cd32ee19152d5ad`
- **Package:** `com.liotrip.driver`

## Brand / UI

- Theme: LioTrip purple `#1A0F2E` / `#2D1B4E` + gold `#C9A227` / `#D4AF37`
- Languages: Arabic, English, Turkish (`/settings`)
- No Al Rayyan branding in the app (platform parent product only)
