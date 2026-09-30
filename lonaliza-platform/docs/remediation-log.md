# Remediation log

## Batch 0 — backups

- Time: 2026-09-29T21:11:13Z
- Path: `/root/lonaliza-backups/20260929T211113Z` (mode 700)
- Contents: `registry.json`, `server-env.json`, `mcp-registry.json`, `pocketbase-data.db`, `pocketbase-auxiliary.db`
- `pm2 save` wrote `/root/.pm2/dump.pm2`
- Git HEAD before edits: `4f9478ac8b83d9233ceeccc47319c8071d74e582` on `main`
- Dirty tree at start: Qdrant storage files under `lonaliza-platform/.data/qdrant_storage`. Those files are not part of this change set.
- Rollback: restore the sqlite backups only with PocketBase stopped. Code rollback is `git revert` of the hardening commit, then rebuild the affected app.

## Batch 1 — truth, wiring, blog UI

- Branch: `cursor/production-hardening-96a6`
- Changes: synthesizer markdown publish blocked; timeline timer removed; Flow/Istanbul defaults cleared; catalog search no longer reported as live; read hooks for visa, coupons, affiliate, reviews, cancellations, gift cards; SMTP/WhatsApp disconnected responses; blog dedup gate; blog index layout; health script and `/api/health`; provider GDS label.
- iyzico production: not enabled.
- Customer bookings, users, and existing blog posts: not deleted.
- Commit: `c4085652`
- Smoke after `safe-deploy.sh both` (builds succeeded, `nginx -t` ok, nginx was not reloaded):
  - `https://lonaliza.com/` 200, `/flights` 200, `/hotels` 200, `/blog` 200, `/admin/login` 200
  - bookings API without a session: 401
  - storefront `/api/health` 200
  - PocketBase `/api/health` 200
  - flight search `RUH`→`CDG` on 2026-11-15: HTTP 200, `ok: true`, 121 itineraries, no card capture
  - hotel search Paris 2026-11-15/18: HTTP 200, `source: supplier`, 20 hotels
  - blog HTML: hero present, 41 card titles, 0 empty titles, article JSON-LD `BlogPosting` present
- `IYZICO_MODE` remained `sandbox`
- Rollback pointer: `git revert c4085652` then `safe-deploy.sh both`

## Typecheck

- Storefront `tsc --noEmit`: 63 errors. `ignoreBuildErrors` left on.
- Admin `tsc --noEmit`: 220 errors. `ignoreBuildErrors` left on.
