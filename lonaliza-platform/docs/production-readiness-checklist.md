# Production readiness checklist

Phase 0 and Phase 5 gate. iyzico production is **not** enabled.

## Phase 0

- [x] PocketBase sqlite backup and copies of `registry.json` and `server-env.json` in `/root/lonaliza-backups/20260929T211113Z` (mode 700)
- [x] `pm2 save`
- [x] `scripts/safe-deploy.sh`
- [x] Git repo present (`4f9478ac` at start). No `git init`. No force-push.
- [x] `ignoreBuildErrors` located and left on (storefront 63 errors, admin 220)

## Phase 5 gate

- [x] Gap matrix written (209 rows)
- [ ] Zero open P0 in the matrix — **exception:** iyzico production is an intentional open item, not a code defect from this pass
- [x] Booking paths documented and sandbox search does not capture a card
- [x] Synthesizer markdown publish blocked by default (`DISABLE_SYNTHESIZER_PUBLISH` unset means off)
- [x] War-room timeline no longer completes on a 2.5–11s timer
- [x] Mutating admin routes scanned: 0 missing `assertAdminApi`
- [x] Backup taken. A full restore drill was not run against production
- [ ] `ignoreBuildErrors` off — blocked by 63 storefront and 220 admin type errors
- [x] Marketing send returns disconnected when SMTP or WhatsApp has no connector response

## Still blocked on Mustafa

- [ ] iyzico production API keys and `IYZICO_MODE=production`
- [ ] Webhook verification against the production host
- [ ] One real test payment after the keys exist

Do not flip `IYZICO_MODE` in this change set. Sandbox init may stay available because it cannot capture production funds while the mode is sandbox.

## Flags

| Flag | Unset behavior |
| --- | --- |
| `DISABLE_SYNTHESIZER_PUBLISH` | Markdown publish stays disabled |
| `OFFICIAL_CONTENT_ONLY` | Content writes stay on `official-article-pipeline` |

Set either flag to `0` only to roll back that guard.
