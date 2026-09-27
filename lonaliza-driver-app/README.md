# LioTrip Driver App

Flutter driver/supplier app for transfer and daily-tour execution.

Cloned from `LioTripmobilapp` and stripped for driver workflows per
`docs/superpowers/specs/2026-08-21-transfer-system-design.md` §10.

## Identity

- Path: `/www/wwwroot/liotrip.com/liotrip-driver-app/`
- Dart package: `liotrip_driver`
- Android applicationId: `com.liotrip.driver`

## Screens (scaffold)

- `lib/presentation/features/driver/` — registration, fleet, offers, trip execution, earnings
- Reuses `lib/core/` network stack (Dio + Riverpod + go_router + shadcn_ui)

## Backend integration

- Telemetry ingest: `POST /api/transfers/driver/telemetry` on tourism_api (port 3011)
- GraphQL assignments: `transferAssignmentRespond`, booking status mutations (via gateway)

## Next steps

1. Wire router to driver shell instead of consumer home
2. Remove unused consumer feature modules under `lib/presentation/features/`
3. Add `firebase_messaging`, `geolocator`, `flutter_local_notifications` per spec
