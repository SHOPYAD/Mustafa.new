# Postiz feature inventory (Phase 0)

Pinned clone: `_reference/postiz-app`  
SHA: `3cbe20b86bf3b2243843d51bb63dcec8773babf7` (2026-09-12, `v1.47.0`)  
Remote: https://github.com/gitroomhq/postiz-app.git  
Purpose: implement Lonaliza capability clone against this tree. Do not run Postiz. Do not treat this clone as product source.

---

## 1. Directory map

Monorepo (`pnpm-workspace.yaml`: `apps/*`, `libraries/*`). Apps of interest:

### `apps/frontend` (Next.js calendar / composer / settings)

```
apps/frontend/
  src/app/
    (app)/
      (site)/                 # authenticated product chrome
        launches/             # calendar (composer is a modal, not a route)
        analytics/
        media/
        plugs/
        agents/ + agents/[id]
        settings/             # tabs: global, teams, webhooks, autopost, sets, signatures, developers/API, approved apps
        third-party/          # HeyGen / Reel.Farm media integrations
        billing/ + billing/lifetime   # Stripe — DO NOT CLONE
        admin/errors, admin/stats
        err/
      (preview)/p/[id]        # public post preview + comments
      integrations/social/[provider]  # OAuth continue / channel connect
      auth/                   # login, activate, forgot
      oauth/authorize         # MCP / OAuth app authorize
      api/uploads/[[...path]] # local upload proxy
    (provider)/provider/[p] + provider/add   # chrome-extension / external provider bridge
    (extension)/modal/[style]/[platform]
  src/components/
    launches/                 # calendar.tsx, time.table, tags, customers, comments, missing-release
    new-launch/               # composer modal (add.edit.modal.tsx, manage.modal.tsx)
    new-launch/providers/     # per-channel composer settings UI
    media/, plugs/, agents/, analytics/, settings/, public-api/, videos/, webhooks/, sets/, autopost/
```

There is **no `/composer` route**. Composer = `src/components/new-launch/add.edit.modal.tsx` opened from `/launches`.

### `apps/backend` (NestJS HTTP + MCP)

```
apps/backend/src/
  main.ts                     # startMcp(app); Temporal Runtime.install
  app.module.ts
  api/
    api.module.ts
    routes/                   # session API used by frontend
      posts.controller.ts         /posts
      integrations.controller.ts  /integrations
      media.controller.ts         /media
      analytics.controller.ts     /analytics
      notifications.controller.ts /notifications
      settings.controller.ts      /settings (teams, shortlink)
      signature.controller.ts     /signatures
      sets.controller.ts          /sets
      webhooks.controller.ts      /webhooks
      autopost.controller.ts      /autopost
      third-party.controller.ts   /third-party
      copilot.controller.ts       /copilot (agent chat)
      users.controller.ts         /user
      auth.controller.ts          /auth
      oauth.controller.ts         /oauth  (DCR + MCP OAuth)
      oauth-app.controller.ts     /user/oauth-app
      approved-apps.controller.ts /user/approved-apps
      announcements.controller.ts /announcements
      admin.controller.ts         /admin
      billing.controller.ts       /billing   # DO NOT CLONE
      stripe.controller.ts        /stripe    # DO NOT CLONE
      payment.controller.ts       /payment   # DO NOT CLONE
      enterprise.controller.ts    /enterprise
      monitor.controller.ts       /monitor
      public.controller.ts        /public (preview, comments, tracking)
      no.auth.integrations.controller.ts  /integrations (connect callbacks)
      root.controller.ts
  public-api/
    public.api.module.ts
    routes/v1/public.integrations.controller.ts   # /public/v1/*  (API key)
  services/auth/              # login providers: github, google, apple, farcaster, wallet, oauth
```

### `apps/orchestrator` (Temporal worker)

```
apps/orchestrator/src/
  main.ts                     # health on ORCHESTRATOR_PORT (default 3002)
  app.module.ts               # getTemporalModule(true, ./workflows, activities)
  health.controller.ts
  activities/
    post.activity.ts          # publish, missing-posts sweep, webhooks, releaseURL
    integrations.activity.ts  # refreshToken
    autopost.activity.ts      # RSS autoPost
    video.activity.ts
    email.activity.ts
  workflows/
    post-workflows/post.workflow.v1.0.1 … v1.1.2   # current start: postWorkflowV112
    missing.post.workflow.ts
    refresh.token.workflow.ts
    autopost.workflow.ts
    generate.video.workflow.ts
    send.email.workflow.ts
    digest.email.workflow.ts
    streak.workflow.ts
  signals/                    # email.signal, send.email.signal
```

Other apps (not required for Lonaliza publish clone, but present): `apps/commands` (CLI tasks), `apps/extension` (Chrome), `apps/sdk`.

### `libraries/nestjs-libraries` (core)

```
libraries/nestjs-libraries/src/
  integrations/               # provider registry + social/*.provider.ts
  videos/                     # seedance, images-slides, video.manager
  temporal/                   # nestjs-temporal-core wiring, infinite missing-post register
  database/prisma/            # schema.prisma + repositories/services
    schema.prisma
    posts/, integrations/, media/, notifications/, signatures/,
    sets/, webhooks/, autopost/, third-party/, errors/,
    organizations/, users/, oauth/, subscriptions/, agencies/, announcements/
  chat/                       # Mastra agent + MCP tools (start.mcp.ts, tools/)
  3rdparties/                 # heygen, reelfarm (media import, not social publish)
  dtos/                       # validation for posts, media, plugs, videos, …
  openai/, upload/, redis/, emails/, sentry/, throttler/, track/
  short-linking/, newsletter/, agent/, user/, services/ (stripe, payment — skip)
```

Also: `libraries/react-shared-libraries` (forms, i18n, toaster), `libraries/helpers` (auth, plugs decorator, swagger).

**Missing from this shallow clone:** `libraries/plugins/` does not exist. `.gitmodules` declares:

```
[submodule "libraries/plugins/src/list/public-api"]
  path = libraries/plugins/src/list/public-api
  url = git@github.com:gitroomhq/public-api.git
```

Private SSH submodule; not fetched. Public HTTP API that Lonaliza needs **is already in-tree** at `apps/backend/src/public-api/`.

---

## 2. Social providers (complete)

Registry: `libraries/nestjs-libraries/src/integrations/integration.manager.ts` → `socialIntegrationList`.

Prisma field `Integration.providerIdentifier` stores the class `identifier` below.

**Count: 35 registered + 1 file present but commented out (`mastodon-custom`) = 36 provider files.**

| # | identifier (`providerIdentifier`) | Display name | File | Registered |
|---|-----------------------------------|--------------|------|------------|
| 1 | `x` | X | `libraries/nestjs-libraries/src/integrations/social/x.provider.ts` | yes |
| 2 | `linkedin` | LinkedIn | `…/social/linkedin.provider.ts` | yes |
| 3 | `linkedin-page` | LinkedIn Page | `…/social/linkedin.page.provider.ts` | yes |
| 4 | `reddit` | Reddit | `…/social/reddit.provider.ts` | yes |
| 5 | `instagram` | Instagram (Facebook Business) | `…/social/instagram.provider.ts` | yes |
| 6 | `instagram-standalone` | Instagram (Standalone) | `…/social/instagram.standalone.provider.ts` | yes |
| 7 | `facebook` | Facebook Page | `…/social/facebook.provider.ts` | yes |
| 8 | `threads` | Threads | `…/social/threads.provider.ts` | yes |
| 9 | `youtube` | YouTube | `…/social/youtube.provider.ts` | yes |
| 10 | `gmb` | Google My Business | `…/social/gmb.provider.ts` | yes |
| 11 | `tiktok` | Tiktok | `…/social/tiktok.provider.ts` | yes |
| 12 | `tiktok-business` | TikTok | `…/social/tiktok.business.provider.ts` | yes |
| 13 | `pinterest` | Pinterest | `…/social/pinterest.provider.ts` | yes |
| 14 | `dribbble` | Dribbble | `…/social/dribbble.provider.ts` | yes |
| 15 | `discord` | Discord | `…/social/discord.provider.ts` | yes |
| 16 | `slack` | Slack | `…/social/slack.provider.ts` | yes |
| 17 | `kick` | Kick | `…/social/kick.provider.ts` | yes |
| 18 | `twitch` | Twitch | `…/social/twitch.provider.ts` | yes |
| 19 | `mastodon` | Mastodon | `…/social/mastodon.provider.ts` | yes |
| 20 | `bluesky` | Bluesky | `…/social/bluesky.provider.ts` | yes |
| 21 | `lemmy` | Lemmy | `…/social/lemmy.provider.ts` | yes |
| 22 | `wrapcast` | Farcaster | `…/social/farcaster.provider.ts` | yes — **identifier is `wrapcast`, not `farcaster`** |
| 23 | `telegram` | Telegram | `…/social/telegram.provider.ts` | yes |
| 24 | `nostr` | Nostr | `…/social/nostr.provider.ts` | yes |
| 25 | `vk` | VK | `…/social/vk.provider.ts` | yes |
| 26 | `medium` | Medium | `…/social/medium.provider.ts` | yes |
| 27 | `devto` | Dev.to | `…/social/dev.to.provider.ts` | yes |
| 28 | `hashnode` | Hashnode | `…/social/hashnode.provider.ts` | yes |
| 29 | `wordpress` | WordPress | `…/social/wordpress.provider.ts` | yes |
| 30 | `listmonk` | ListMonk | `…/social/listmonk.provider.ts` | yes |
| 31 | `moltbook` | Moltbook | `…/social/moltbook.provider.ts` | yes |
| 32 | `whop` | Whop | `…/social/whop.provider.ts` | yes |
| 33 | `skool` | Skool | `…/social/skool.provider.ts` | yes |
| 34 | `mewe` | MeWe | `…/social/mewe.provider.ts` | yes |
| 35 | `tumblr` | Tumblr | `…/social/tumblr.provider.ts` | yes |
| 36 | `mastodon-custom` | M. Instance | `…/social/mastodon.custom.provider.ts` | **commented out** in `socialIntegrationList` |

Supporting files (not providers):

- `social.abstract.ts`, `social.integrations.interface.ts`
- `tool.decorator.ts` (`@Tool` for MCP/API channel tools)
- `refresh.integration.service.ts`
- `integration.missing.scopes.ts`
- `hashnode.tags.ts`

Env knobs: `HIDDEN_PROVIDERS` (comma identifiers), `MIGRATE_PROVIDERS` (`from:to`, e.g. `tiktok:tiktok-business`).

Composer UI mirrors most providers under `apps/frontend/src/components/new-launch/providers/{x,linkedin,reddit,instagram,facebook,…}/`.

### Plugs (automation on published posts)

`@Plug` (scheduled engagement) on: `x`, `threads`, `linkedin-page`, `bluesky`.  
`@PostPlug` (internal, per-post) on: `x` (`x-repost-post-users`), `linkedin` (`linkedin-add-comment`, `linkedin-repost-post-users`).

Stored in Prisma `Plugs` + `ExisingPlugData`.

---

## 3. Prisma models → PocketBase mapping

Source: `libraries/nestjs-libraries/src/database/prisma/schema.prisma`.

Lonaliza already has a `customers` collection (tourism). Postiz `Customer` is a **channel grouping label** (agency client), not a hotel guest. Use a distinct collection name (e.g. `publish_customers`) to avoid colliding with existing `customers`.

### Must clone (publish core)

#### `Integration` → `publish_integrations`

Key fields: `id` (cuid), `internalId`, `organizationId`, `name`, `picture`, **`providerIdentifier`**, `type`, `token`, `disabled`, `tokenExpiration`, `refreshToken`, `profile`, `deletedAt`, `inBetweenSteps`, `refreshNeeded`, `postingTimes` (JSON string of `{time}` minutes), `customInstanceDetails`, `customerId`, `rootInternalId`, `additionalSettings` (JSON string, default `[]`).

Unique: `(organizationId, internalId)`.

#### `Post` → `publish_posts`

Key fields: `id` (cuid), `state` (`QUEUE` \| `PUBLISHED` \| `ERROR` \| `DRAFT`), `publishDate`, `organizationId`, `integrationId`, `content` (HTML/JSON string), `delay`, **`group`** (thread/campaign id), `title`, `description`, `parentPostId` (thread children), **`releaseId`**, **`releaseURL`**, `settings` (provider-specific JSON), `image` (JSON array of media), `intervalInDays` (repeat), `error`, `creationMethod` (`UNKNOWN` \| `WEB` \| `MCP` \| `API` \| `AUTOPOST` \| `CLI`), `deletedAt`.

Skip marketplace-only: `submittedForOrderId`, `submittedForOrganizationId`, `approvedSubmitForOrder`, `lastMessageId`.

#### `Media` → `publish_media`

`id`, `name`, `originalName`, `path`, `organizationId`, `fileSize`, `type` (`image` default), `thumbnail`, `alt`, `thumbnailTimestamp`, `deletedAt`.

#### `Tags` + `TagsPosts` → `publish_tags` + join

`Tags`: `id`, `name`, `color`, `orgId`, `deletedAt`.  
`TagsPosts`: composite `(postId, tagId)`.

#### `Customer` → `publish_customers` (channel groups)

`id`, `name`, `orgId`, `deletedAt`. Unique `(orgId, name, deletedAt)`. Integrations optionally belong to a customer.

#### `Sets` → `publish_sets`

Reusable composer templates: `id`, `organizationId`, `name`, `content` (JSON).

#### `Signatures` → `publish_signatures`

`id`, `organizationId`, `content`, `autoAdd`, `deletedAt`.

#### `Comments` → `publish_comments`

Internal collaboration on a post (not social comments): `id`, `content`, `organizationId`, `postId`, `userId`, `deletedAt`.

#### `Plugs` + `ExisingPlugData` → `publish_plugs` (+ optional plug data)

`Plugs`: `organizationId`, `plugFunction`, `data` (JSON), `integrationId`, `activated`. Unique `(plugFunction, integrationId)`.  
`ExisingPlugData`: `integrationId`, `methodName`, `value`.

#### `AutoPost` → `publish_autoposts`

RSS → schedule: `organizationId`, `title`, `content`, `onSlot`, `syncLast`, `url`, `lastUrl`, `active`, `addPicture`, `generateContent`, `integrations` (JSON id list), `deletedAt`. Workflow polls hourly via Temporal `autoPostWorkflow`.

#### `Webhooks` + `IntegrationsWebhooks` → `publish_webhooks` + join

`Webhooks`: `name`, `organizationId`, `url`, `deletedAt`. M2M to integrations.

#### `Notifications` → `publish_notifications`

`organizationId`, `content`, `link`, `deletedAt`. (Do not confuse with existing `admin_notifications`.)

#### `Errors` → `publish_errors`

Failed publish log: `message`, `platform`, `organizationId`, `postId`, `body` (JSON default `{}`).

#### `Mentions` → `publish_mentions`

Autocomplete cache: composite id `(name, username, platform, image)`.

#### `ThirdParty` → `publish_third_parties`

HeyGen / Reel.Farm connections: `organizationId`, `identifier`, `name`, `internalId`, `apiKey`, `deletedAt`. Unique `(organizationId, internalId)`.

### Org/user scaffolding (map to existing Lonaliza users, do not duplicate Stripe orgs)

Postiz `Organization` is a workspace with `apiKey`, `shortlink` preference, trial flags. Map to Lonaliza company/workspace + store `apiKey` on a small `publish_workspaces` (or org settings) record.  
`UserOrganization` roles: `SUPERADMIN` \| `ADMIN` \| `USER`.

`OAuthApp` / `OAuthAuthorization` — clone only if MCP/public API OAuth is in scope (`clientId`, `clientSecret`, PKCE, scopes `mcp:read mcp:write`).

### Do NOT map / do not clone

- `Subscription`, `Credits`, `UsedCodes` — Stripe billing
- `Orders`, `OrderItems`, `Messages`, `MessagesGroup`, `PayoutProblems` — marketplace UGC orders
- `SocialMediaAgency`, `SocialMediaAgencyNiche` — Postiz agency marketplace
- `GitHub`, `Star`, `Trending`, `TrendingLog`, `ItemUser` — Gitroom-era GitHub stars
- `mastra_*` tables (`mastra_ai_spans`, `mastra_evals`, `mastra_messages`, `mastra_resources`, `mastra_scorers`, `mastra_threads`, `mastra_traces`, `mastra_workflow_snapshot`) — Mastra agent persistence
- `Announcement` — Postiz cloud banners (optional later)

Enums to preserve for posts: `State`, `CreationMethod`.

---

## 4. Temporal / orchestrator job types

Worker loads all exports from `apps/orchestrator/src/workflows/index.ts`. Task queue: `main` (plus per-provider queues derived from `providerIdentifier.split('-')[0]`).

| Workflow | File | Trigger | What it does |
|----------|------|---------|--------------|
| **`postWorkflowV112`** (current) | `workflows/post-workflows/post.workflow.v1.1.2.ts` | `PostsService` `workflow.start('postWorkflowV112', { workflowId: post_${id} })` | **Schedule / publish a post.** Sleeps until `publishDate`, calls provider `post` / `postPending`, writes `releaseId`/`releaseURL`, fires webhooks, repeats via `intervalInDays`. Older `postWorkflowV101`–`V111` kept for in-flight runs only. |
| **`refreshTokenWorkflow`** | `workflows/refresh.token.workflow.ts` | `RefreshIntegrationService` after connect | Sleeps until `tokenExpiration`, then `refresh(integration)`. Exits if deleted / `refreshNeeded`. |
| **`autoPostWorkflow`** | `workflows/autopost.workflow.ts` | Autopost create/activate (`workflowId: autopost-${id}`) | **RSS autopost.** Hourly loop → `AutopostService.startAutopost` (`rss-parser` on `AutoPost.url`, optional AI rewrite + DALL·E image, then create QUEUE posts). |
| **`missingPostWorkflow`** | `workflows/missing.post.workflow.ts` | Infinite register if `RUN_CRON` (`workflowId: missing-post-workflow`) | Hourly sweep of QUEUE posts with `publishDate` in last 2 days; `signalWithStart('postWorkflowV112', signal: 'poke')`. Recovers dead schedule workflows. **Not** the same as missing `releaseId`. |
| **`generateVideoWorkflow`** | `workflows/generate.video.workflow.ts` | Media generate-video | Runs video generator (no retry — consumes a credit in Postiz). |
| `sendEmailWorkflow` | `workflows/send.email.workflow.ts` | notifications | Transactional email |
| `digestEmailWorkflow` | `workflows/digest.email.workflow.ts` | batched email signal | Hourly digest |
| `streakWorkflow` | `workflows/streak.workflow.ts` | org streak | Reminder emails — skip (Postiz gamification) |

### Missing `releaseId` (not a Temporal cron)

Providers that publish asynchronously (or when analytics need the remote id) leave `Post.releaseId` empty. UI: `apps/frontend/src/components/launches/missing-release.modal.tsx`.

HTTP:

- `GET /posts/:id/missing` and `GET /public/v1/posts/:id/missing` — list remote posts to attach
- `PUT /posts/:id/release-id` and `PUT /public/v1/posts/:id/release-id` `{ releaseId }` — bind id, then statistics work

Implement as an API + calendar modal, not a Temporal job.

Search attributes registered: `organizationId`, `postId`.

---

## 5. Frontend routes (`apps/frontend`)

Product nav (`components/layout/top.menu.tsx`):

| Route | Role | Component |
|-------|------|-----------|
| `/launches` | Calendar | `components/launches/launches.component.tsx` + `calendar.tsx` |
| *(composer)* | Modal from calendar | `components/new-launch/add.edit.modal.tsx` |
| `/analytics` | Per-channel analytics | `components/platform-analytics/platform.analytics.tsx` |
| `/media` | Media library + video generators | `components/new-layout/layout.media.component.tsx` |
| `/plugs` | Channel plugs | `components/plugs/plugs.tsx` |
| `/agents` → `/agents/new`, `/agents/[id]` | Mastra chat agent | `components/agents/agent.chat.tsx` |
| `/third-party` | HeyGen / Reel.Farm | `components/third-parties/` |
| `/settings` | Tabs below | `components/layout/settings.component.tsx` |
| `/billing`, `/billing/lifetime` | Stripe | **DO NOT CLONE** |
| UGC menu item | AgentMedia modal | **DO NOT CLONE** (Postiz cloud) |
| Affiliate | `https://affiliate.postiz.com` | **DO NOT CLONE** |

Settings tabs: `global_settings`, `teams`, `webhooks`, `autopost` (RSS), `sets`, `signatures`, `api` (Developers / Public API + MCP), `approved_apps`.

Other routes: `/auth/*`, `/integrations/social/[provider]`, `/oauth/authorize`, `/p/[id]` (public preview + comments), `/admin/errors`, `/admin/stats`, `/provider/*`, `/modal/*`.

---

## 6. Public API (`/public/v1`) and MCP tools

Controller: `apps/backend/src/public-api/routes/v1/public.integrations.controller.ts`  
Auth: org API key (`pos_` OAuth token or `Organization.apiKey`) via `PublicAuthMiddleware`.

| Method | Path | Notes |
|--------|------|-------|
| POST | `/public/v1/upload` | multipart file |
| POST | `/public/v1/upload-from-url` | SSRF-safe fetch |
| GET | `/public/v1/find-slot/:id` | next free posting slot |
| GET | `/public/v1/posts` | list |
| POST | `/public/v1/posts` | create/schedule (`creationMethod` API\|CLI) |
| DELETE | `/public/v1/posts/:id` | |
| DELETE | `/public/v1/posts/group/:group` | |
| GET | `/public/v1/is-connected` | health |
| GET | `/public/v1/groups` | customers |
| GET | `/public/v1/integrations` | channels |
| GET | `/public/v1/social/:integration` | OAuth URL |
| GET | `/public/v1/users` | super-admin impersonate |
| GET | `/public/v1/notifications` | |
| POST | `/public/v1/generate-video` | |
| POST | `/public/v1/video/function` | |
| DELETE | `/public/v1/integrations/:id` | |
| GET | `/public/v1/integration-settings/:id` | rules, maxLength, tools |
| GET | `/public/v1/posts/:id/missing` | missing releaseId picker |
| PUT | `/public/v1/posts/:id/settings` | |
| PUT | `/public/v1/posts/:id/status` | |
| PUT | `/public/v1/posts/:id/release-id` | |
| GET | `/public/v1/analytics/:integration` | |
| GET | `/public/v1/analytics/post/:postId` | |
| POST | `/public/v1/integration-trigger/:id` | run `@Tool` on a channel |

### MCP tool ids

Mounted in `libraries/nestjs-libraries/src/chat/start.mcp.ts` (`Postiz MCP` 1.0.0). Tool list: `libraries/nestjs-libraries/src/chat/tools/tool.list.ts`.

| Tool id | File |
|---------|------|
| `integrationList` | `chat/tools/integration.list.tool.ts` |
| `groupList` | `chat/tools/group.list.tool.ts` |
| `integrationSchema` | `chat/tools/integration.validation.tool.ts` |
| `triggerTool` | `chat/tools/integration.trigger.tool.ts` |
| `schedulePostTool` | `chat/tools/integration.schedule.post.ts` |
| `postsListTool` | `chat/tools/posts.list.tool.ts` |
| `postSettingsTool` | `chat/tools/post.settings.tool.ts` |
| `generateVideoOptions` | `chat/tools/generate.video.options.tool.ts` |
| `videoFunctionTool` | `chat/tools/video.function.tool.ts` |
| `generateVideoTool` | `chat/tools/generate.video.tool.ts` |
| `videoStatusTool` | `chat/tools/video.status.tool.ts` |
| `generateImageTool` | `chat/tools/generate.image.tool.ts` |
| `uploadFromUrlTool` | `chat/tools/upload.from.url.tool.ts` |

Claude-directory MCP hides the five video/image tools. Paths: `/mcp`, `/mcp/:id`, `/sse/:id`, `/mcp-oauth`, `/mcp-oauth-claude`, `/mcp-oauth-dynamic`.

Per-channel `@Tool` methods (boards, Discord channels, WP categories, etc.) are also exposed via `integration-settings` + `integration-trigger`.

---

## 7. Video generator types

Registry: `libraries/nestjs-libraries/src/videos/video.module.ts` (providers `ImagesSlides`, `Seedance`).

| identifier | Title | Placement | File | Gating env |
|------------|-------|-----------|------|------------|
| `image-text-slides` | Image Text Slides | `text-to-image` | `videos/images-slides/images.slides.ts` | `ELEVENSLABS_API_KEY`, `TRANSLOADIT_*`, `OPENAI_API_KEY`, `FAL_KEY` |
| `seedance` | Seedance 2.0 (Audio + Video) | `text-to-image` | `videos/seedance/seedance.ts` | `EVOLINK_API_KEY` |

Placement union in `video.interface.ts`: `'text-to-image' \| 'image-to-video' \| 'video-to-video'`. Only the two above are implemented.

Third-party **media** (not Temporal video jobs): `heygen`, `reelfarm` under `3rdparties/`.

---

## 8. What NOT to clone

| Area | Where in Postiz | Why |
|------|-----------------|-----|
| Stripe billing | `Subscription`, `Credits`, `/billing`, `stripe.controller`, `billing.controller`, frontend `/billing` | Lonaliza has its own billing |
| Marketplace Orders | `Orders`, `OrderItems`, `Messages*`, `PayoutProblems`, `submittedForOrder*` on Post | UGC freelancer marketplace |
| Mastra tables | all `mastra_*` Prisma models | Agent tracing/storage; optional later, not PocketBase |
| Postiz affiliate | menu → `affiliate.postiz.com` | Cloud program |
| UGC / AgentMedia | menu UGC modal, `GET /user/agent-media-sso` | Postiz cloud |
| SocialMediaAgency marketplace | `SocialMediaAgency*` | Marketplace profiles |
| Gitroom GitHub stars | `GitHub`, `Star`, `Trending*` | Unrelated product |
| Streak emails | `streakWorkflow` | Gamification |

Keep: calendar, composer, providers, media library, plugs, RSS autopost, webhooks, signatures, sets, tags, comments, notifications, errors, mentions, third-party media import, public API, MCP tools, video generators, missing-releaseId UX.

---

## 9. Clone surprises / completeness notes

1. **`libraries/plugins` submodule missing.** `.gitmodules` points at private `git@github.com:gitroomhq/public-api.git`. Depth-1 HTTPS clone did not initialize it. In-repo `apps/backend/src/public-api` is sufficient for API inventory.
2. **Shallow clone is complete enough** for integrations, frontend routes, orchestrator workflows, videos, Prisma. Size ~34M. No `pnpm install` was run.
3. **Farcaster identifier is `wrapcast`.** Composer folder is `new-launch/providers/warpcast/`.
4. **Two Instagram and two TikTok identifiers.** Migration via `MIGRATE_PROVIDERS`.
5. **`mastodon-custom` exists but is commented out** of `socialIntegrationList`.
6. **Composer is not a route** — modal on `/launches`.
7. **Missing releaseId** is HTTP + modal, not the Temporal `missingPostWorkflow` (that one restarts dead QUEUE publishes).
8. **`Customer` name collision** with Lonaliza tourism `customers`.
9. Postiz `version.txt` = `v1.47.0`. Latest commit message on pin: `feat: wallet rejection`.
