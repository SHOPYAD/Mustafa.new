# Lonaliza publish clone — gap report

Pinned Postiz: `_reference/POSTIZ_PIN.txt` (`v1.47.0`, SHA `3cbe20b86bf3b2243843d51bb63dcec8773babf7`).  
Inventory: `_reference/FEATURE_INVENTORY.md`.  
Date: 2026-09-15 (final reconcile after OAuth / analytics / public API / preview / MCP generate).

This is an in-house capability clone under `/admin/publish*` + `src/lib/publish`. It is not an embed of Postiz. Tourism / GDS / site chrome were not rewritten.

---

## Verification

| Check | Result |
|-------|--------|
| `npx vitest run src/lib/publish src/lib/server/mcp/catalog.test.ts` | **103 passed / 0 failed** (18 files) |
| Broken imports in publish / oauth / admin publish after parallel writes | **none** (local modules and named exports resolve) |
| Site | No `pm2 stop`, no `next build`, no `_reference/postiz-app` delete, no tourism/GDS rewrite |

PocketBase migrations `1789332100`–`1789332113` exist under `pocketbase/pb_migrations/`. They may still be unapplied on the live PB instance; the engine falls back to `.data/publish/`.

**Production `next start` may be stale** until a future zero-downtime deploy. Source on disk is ahead of whatever process is currently serving.

---

## Implemented at depth

- **Provider registry (35 ids).** All Postiz `socialIntegrationList` identifiers except `mastodon-custom`. Five Lonaliza social adapters (`facebook`, `instagram`, `youtube`, `tiktok`, `x`) plus HTTP adapters for the rest (LinkedIn / Page, Threads, GMB, Pinterest, Telegram, Reddit, Instagram Standalone, TikTok Business, blogs, chat, fediverse, community). Unknown ids stay stubs.
- **OAuth for the six extra networks.** Routes exist:
  - `/api/oauth/linkedin` + callback
  - `/api/oauth/linkedin-page` + callback + select
  - `/api/oauth/threads` + callback
  - `/api/oauth/pinterest` + callback
  - `/api/oauth/gmb` + callback + select
  - `/api/oauth/telegram` (bot token + chat picker, not OAuth2)
  Platforms live under `src/lib/social/platforms/{linkedin,threads,pinterest,gmb,telegram}.ts`. Tokens upsert into the publish channel store.
- **Live analytics.** `analytics.ts` + `analytics-live.ts` fetch Graph / YouTube / TikTok / Pinterest / Threads / LinkedIn Page / GMB / X insight HTTP. Empty series when the API returns nothing — no invented charts. Admin: `/api/admin/publish/analytics*`. Public: `/api/publish/v1/analytics*`.
- **Public API `/api/publish/v1`.** Key-gated (`lzpub_` via Bearer / `x-api-key`): `posts`, `integrations`, `upload-from-url`, `analytics` (+ per-integration / per-post). Immediate publish still requires `approved === true`.
- **Public preview.** Unlisted approval page at `/publish/p/[id]` (`src/app/publish/p/[id]/page.tsx`). Not the marketing `/p/[slug]` builder pages. No public comments thread.
- **MCP generate tools.** Catalog + `builtin.ts`: `publish.channels`, `publish.posts`, `publish.schedule`, `publish.media_from_url`, **`publish.generate_image`**, **`publish.generate_video`**. Generate writes to the media library only — does not publish.
- **Approval gate.** Nothing hits a network unless `approved === true` (engine, MCP `publish.schedule`, composer «الآن», public API `publishNow`).
- **Admin surfaces.** Calendar, composer, media, analytics, automations, agent, settings under `/admin/publish*`. Marketing nav in `admin-nav.ts`.
- **Composer.** Global caption, per-channel override, thread parts + delay, firstComment, TikTok/IG/YouTube/GMB/Pinterest/LinkedIn settings, `intervalInDays`, media validation (`provider-rules` + `validateMedia`), AI generate image/video (saved to library, not published).
- **Media.** Library + upload-from-url + AI generate (Nano Banana / studio video options). Generating media does not publish.
- **Settings.** Signatures, channel sets, developer API key (`lzpub_`).
- **Automations.** Plugs catalog + store; RSS parse / next slot / hourly tick create `autopost` QUEUE posts; HTTPS webhooks on `published` / `error` (SSRF host block). Tick returns `rss` + `plugs` stats.
- **Missing `releaseId`.** Admin `GET/PUT /api/admin/publish/missing-release` + calendar/API helpers (`missing-release.ts`).
- **Agent.** Draft/schedule helper; never publishes.
- **Worker tick.** Due QUEUE posts + RSS + plugs; BullMQ optional.

---

## Partial

| Area | What exists | What is thin |
|------|-------------|--------------|
| **Plugs** | Catalog for x / threads / linkedin / linkedin-page / bluesky; `likesFetcher` can queue a follow-up comment/repost | No live like polling from networks. Without a fetcher, tick skips (does not invent engagement). |
| **Skool** | Handler is implemented and registered | Cookie-session only (no official OAuth). Arabic `missing_credentials` if cookie/group missing. |
| **Video generators** | Studio list: `image-text-slides`, `veo`, `omni`, `seedance`. Slides/Veo/Omni use Lonaliza studio. Canva + Higgsfield MCP cards exist | Postiz ElevenLabs / Transloadit / FAL slides stack is not cloned. **HeyGen / Reel.Farm unused.** Seedance stays unavailable without `EVOLINK_API_KEY`. |
| **RSS AI rewrite** | Feed flag `generateContent` stored | Tick does not call an LLM rewrite; it uses title + description + link. |
| **Tags / comments / mentions / notifications** | PB collections + migrations | No admin UI or API for tags, internal post comments, mention autocomplete, or `publish_notifications`. Preview has no public comments. |
| **Public API vs Postiz `/public/v1`** | `/api/publish/v1` posts + integrations + upload + analytics | No public missing-release or trigger endpoints; path is Lonaliza `/api/publish/v1`, not Postiz `/public/v1`. |
| **MCP vs Postiz tool list** | 6 publish tools including generate image/video | Postiz also has `integrationSchema`, `triggerTool`, group/settings tools, MCP OAuth / DCR (`pos_` keys). |

---

## Missing (honest)

Do **not** treat these as done.

1. **`mastodon-custom`** — commented out upstream; omitted here on purpose.
2. **Temporal / orchestrator** workflows (`postWorkflowV112`, `refreshTokenWorkflow`, `autoPostWorkflow`, `missingPostWorkflow`, `generateVideoWorkflow`). Lonaliza uses cron tick + optional BullMQ.
3. **Chrome extension / provider bridge / `/modal/*`.**
4. **Skool cookies** — session cookie + group id, not OAuth.
5. **HeyGen unused** — no HeyGen / Reel.Farm third-party import. Canva and Higgsfield MCP connectors exist instead.
6. **Production `next start` may be stale** until a future zero-downtime deploy. Do not `pm2 stop` or `next build` as part of this reconcile.
7. **MCP OAuth / DCR** (`/oauth/authorize`, `mcp:read mcp:write`, `pos_` keys). Lonaliza MCP is the builtin catalog, not Postiz OAuth apps.
8. **Mastra agent** (`/agents`, copilot chat, `mastra_*` tables) — out of scope; we have a draft-only publish agent.
9. **Per-channel `@Tool` methods** (boards, Discord channels, WP categories) exposed via integration-settings + integration-trigger.
10. **Intentionally not cloned** (inventory §8): Stripe billing, marketplace orders, affiliate, UGC/AgentMedia, SocialMediaAgency, Gitroom stars, streak emails.

---

## Small fills done in this reconcile

- Confirmed OAuth routes + `platforms/*.ts` for LinkedIn, LinkedIn Page, Threads, Pinterest, GMB, Telegram.
- Confirmed live analytics fetchers (not placeholder-only).
- Confirmed `/api/publish/v1`, `/publish/p/[id]`, MCP `publish.generate_image` / `publish.generate_video`.
- Import scan of publish / oauth / admin publish: no broken modules or named exports after the three parallel writes.
- Tests: **103 green** on the requested suite (18 files). No `pm2 stop`, no `next build`, `_reference/postiz-app` left in place.

---

## Suggested next slices (do not start here unless asked)

1. Zero-downtime deploy so production `next start` picks up this source.
2. Optional public comments on `/publish/p/[id]`.
3. Live plug like-polling once tokens exist.
4. MCP OAuth / DCR only if external MCP clients need Postiz-compatible apps.
