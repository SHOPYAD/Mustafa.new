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
- Smoke: pending in this file until the build-and-probe step is recorded below.

## Typecheck

- Storefront `tsc --noEmit`: 63 errors. `ignoreBuildErrors` left on.
- Admin `tsc --noEmit`: 220 errors. `ignoreBuildErrors` left on.
