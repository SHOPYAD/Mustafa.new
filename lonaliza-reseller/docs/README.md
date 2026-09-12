# Architecture index

Alrayyan Group site on the **LIOTRIP** platform. This folder holds existing specs and notes only — it is not served publicly.

## Layout

| Layer | Path | Role |
| --- | --- | --- |
| Frontend | `src/app/(site)`, `src/app/admin`, `src/components` | Next.js App Router UI. Routes stay under `src/app`. |
| Backend | `src/app/api`, `src/lib/server`, `src/middleware.ts` | API routes, session/auth, stores, providers. Alias: `@/server/*` → `src/lib/server/*`. |
| Database | `pocketbase/` (binary, `pb_migrations`, `pb_hooks`), `.data/` (runtime JSON), `src/data/` (client seeds / stores) | PocketBase is the live DB. `.data` is server-side JSON; do not commit secrets. |
| Hotel scraper | `hotel-engine/` + `src/lib/scraping/hotels` + `src/data/scraping/hotels` + `scripts/hotel-scraper/` | Isolated NestJS engine; Next.js adapter; scrape dumps; legacy seed scripts. |

Do not move `node_modules`, `.next`, `uploads` / branding files, or `.env*`.

## Hotel scraping engine

```
hotel-engine/src/main.ts          # entry
hotel-engine/src/hotels/          # HTTP API
hotel-engine/src/types/           # shared hotel types
hotel-engine/src/parsers/         # catalog → card/details normalize
hotel-engine/src/crawl/           # provider / crawler
hotel-engine/src/catalog/         # seed catalog + types
hotel-engine/src/redis/           # cache / queues
hotel-engine/src/snapshots/       # crawl snapshots
src/lib/scraping/hotels/          # Next.js client (HOTEL_ENGINE_URL)
src/data/scraping/hotels/         # raw / parsed dumps
scripts/hotel-scraper/            # one-off Booking scrape & seed tools
```

See `hotel-engine/README.md` for run instructions.

## Docs map

| File | Topic |
| --- | --- |
| [hotels/Hotel_Mobile_Proxy_Scraping_Plan.md](hotels/Hotel_Mobile_Proxy_Scraping_Plan.md) | Mobile-proxy scrape plan |
| [hotels/cursor_hotel_mobile_proxy_plan.md](hotels/cursor_hotel_mobile_proxy_plan.md) | Cursor notes for the same plan |
| [hotels/hotels-plan.md](hotels/hotels-plan.md) | Hotels product plan |
| [flights/Flight_Engine_Integration_and_UIUX_Specification.md](flights/Flight_Engine_Integration_and_UIUX_Specification.md) | Flight engine + UI |
| [flights/Sky_Scrapper_Flight_Endpoints.md](flights/Sky_Scrapper_Flight_Endpoints.md) | Sky Scrapper endpoints |
| [archive/cursor_travel_platform_analysis.md](archive/cursor_travel_platform_analysis.md) | Historical platform analysis (OKTRAVEL mentions kept as forensic log) |
