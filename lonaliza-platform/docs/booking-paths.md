# Booking paths

Visitor runtime versus the provider registry. Recorded 2026-09-29 on the live tree. Secret values are not included.

## Flights

| | |
| --- | --- |
| Visitor path | `/flights`, `/flights/search`, `/flights/booking` |
| Runtime flag | `NEXT_PUBLIC_FLIGHTS_PROVIDER=live` |
| Registry | `pkfare` and `seeru` enabled, mode `sandbox`. `travelpayouts_flights`, `travelport_flights`, `amadeus_flights`, `biletbank` disabled. |
| What the visitor hits | `LiveFlightsGate` sends `travelpayouts` config to the white-label widget. `runFlightSearch` returns `provider_travelpayouts` when the runtime is affiliate-only. |
| Class | Hybrid. Affiliate widget and sandbox GDS flags coexist. The working affiliate path was not disabled. |
| Money | Search does not capture a card. |

## Hotels

| | |
| --- | --- |
| Visitor path | `/hotels`, `/hotels/[slug]`, `/hotels/book` |
| Runtime flag | `NEXT_PUBLIC_HOTELS_PROVIDER=internal` |
| Registry | `hotelbeds` and `travelport_hotels` enabled, mode `sandbox`. `ratehawk`, `seeru_hotels`, `hotel_engine` disabled. `hotel_engine` mode is `production` but the flag is off. |
| What the visitor hits | `runPublicHotelSearch` uses live suppliers when one of ratehawk, hotelbeds, travelport hotels, or seeru hotels is enabled. Otherwise it uses the legacy Booking/TravelAdvisor list. |
| Label | Legacy results set `liveSupplier: false` and the results page states they are catalog display, not a live supplier confirmation. |
| Engine | PM2 `lonaliza-hotel-engine` and Redis are up. The registry `hotel_engine` provider stays off. |

## Transfers and cars

| | |
| --- | --- |
| Visitor path | `/transfers`, `/cars` |
| Registry | `seeru` (air/ride sandbox) enabled. `seeru_transfers` and `travelpayouts_transfers` disabled. `transfers_internal` disabled, mode `production`. Car GDS and affiliate rows are disabled. |
| Class | Hybrid. Internal/affiliate widgets can render while the transfer GDS rows are off. A control-panel probe does not report Seeru-enabled as a completed ride search. |

## Packages, tours, visa

| | |
| --- | --- |
| Packages / tours | `/package`, `/tours`, `/vip-tours`. Internal catalog stores (`packages-store`, `tours-store`), not a live GDS. |
| Visa | `/visa` and `/admin/visa`. Internal `defaultVisaData` catalog. The swarm read hook says it is not an embassy connector. |

## Account and checkout

| | |
| --- | --- |
| Account | `/account` uses PocketBase customer auth. |
| Payments | `IYZICO_MODE=sandbox`. `PAYMENTS_IYZICO_ENABLED` is on for sandbox init. Production API host is not selected. |
| Affiliate vs GDS | Staff provider cards label GDS as GDS and keep the sandbox/production mode on the card. Affiliate category stays separate. |

## What was not changed

iyzico production keys were not written. No GDS row was promoted from sandbox to production.
