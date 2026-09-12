<div align="center">

<img src="public/logo.png" alt="Lonaliza" width="88" />

# Lonaliza

**منصة تشغيل سياحي متكاملة — موقع، تطبيق، لوحة إدارة، ووكلاء ذكاء اصطناعي.**

A production travel operating system: live GDS booking, a Flutter customer app, an AI-operated back office, and white-label resale — not a brochure website.

[lonaliza.com](https://lonaliza.com)

![Status](https://img.shields.io/badge/status-production-0f766e)
![Product](https://img.shields.io/badge/product-Travel%20OS-7c3aed)
![Languages](https://img.shields.io/badge/i18n-AR%20·%20EN%20·%20TR%20·%20FR-2e1065)

[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Flutter](https://img.shields.io/badge/Flutter-3-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![PocketBase](https://img.shields.io/badge/PocketBase-0.28-b8d9eb)](https://pocketbase.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## What Lonaliza is

Lonaliza is a **full travel commerce stack** for agencies that sell flights, hotels, transfers, cars, packages, tours, visas, and gift cards from one branded storefront — then operate the same inventory from a staff console, a native mobile app, and licensed white-label copies.

The public site, `/admin`, `/api/mobile/v1`, and the Flutter client share one catalog, one customer identity, and one booking engine.

| Surface | Role |
|---|---|
| **Website** | Customer storefront, search, checkout, account, community, legal |
| **Admin** | Inventory, GDS providers, finance, AI agents, marketing, compliance |
| **Flutter app** (`Lonalizamobilapp`) | Native iOS/Android client on the same BFF |
| **Reseller origin** | License, provision, and update white-label agency copies |

---

## Product capabilities

### Live travel inventory

- **Flights** — multi-GDS shopping, fare families, ancillaries, extras, seat-aware booking, price calendar, and post-booking ticket / change flows. Providers include Travelport, PKFARE, Seeru, BiletBank, and Sky Scrapper.
- **Hotels** — supplier search plus an owned catalog. RateHawk / ETG, Hotelbeds, Seeru Hotels, Travelport Hotels, and the internal `hotel-engine` run behind one quote → book path with photos, reviews, and vouchers.
- **Transfers** — Seeru Ride live search and booking for airport and city transfers.
- **Ground services** — car rental, holiday packages, day tours, and visa applications as first-class catalog products.
- **Commerce extras** — gift cards, coupons, loyalty points, affiliate wallets, and promo pricing on the same checkout.

### Customer account

- PocketBase auth (email, OTP, Google) shared between website and app
- Bookings inbox with tickets, hotel vouchers, invoices, and post-booking changes
- Saved cards, recently viewed, loyalty convert, affiliate withdraw
- GDPR export / delete, privacy, and terms served from the legal center

### Mobile app

- Flutter client branded **Lonaliza Royal Purple**
- Home services loaded from website bootstrap — enable a product once, it appears on web and app
- Native search for flights, hotels, transfers, cars, packages, tours
- Community feed, gift cards, AI sales / search agents, iyzico payments
- WebView handoff for authenticated website sessions

### AI operations

- **Agent War Room** — live coordination across sales, builder, and ops agents
- **Automation Studio** — scheduled and conversational workflows (WhatsApp QR, Telegram, email, abandoned-cart recovery)
- **Builder agent** — visual homepage editor and page generation
- **B2B landing agent** — floating commercial chat for partner / reseller pages
- **Search & sales agents** — Gemini-backed trip planning on web and mobile
- MCP specification servers for Travelport, PKFARE, Seeru, Hotelbeds, RateHawk, Paraşüt, and related provider contracts

### Admin & finance

- Visual homepage editor, blog, PWA, translations, and icon library
- Provider hub with connection tests, markups, and logo uploads
- iyzico payments, multi-currency FX, invoice templates, and **Paraşüt** e-invoice / e-archive
- B2B supplier deposit wallet and partner wallets
- Email marketing, paid ads, social OAuth (Meta, TikTok, X, YouTube), Nostr community
- Legal / GDPR workspace: identity, terms, privacy, and deletion requests
- PocketBase console, SMTP, media keys, and server-env management from the panel

### White-label resale

Origin deployments can license the stack to other agencies:

- Company onboarding, encrypted license binding to a domain
- Delivery stages, custom domains, partner wallets, and B2B booking ledger
- Nightly updates for subscribed tenants
- Client instances run without the origin resale console (`DEPLOYMENT_ROLE=client`)

---

## Architecture

```
┌──────────────┐   ┌──────────────────┐   ┌────────────────────┐
│  Next.js 16  │   │ Flutter customer │   │  Reseller / origin │
│  storefront  │◄──┤  Lonalizamobilapp│   │  licenses & demos  │
│  + /admin    │   │  /api/mobile/v1  │   │  /partners · /demo │
└──────┬───────┘   └────────┬─────────┘   └─────────┬──────────┘
       │                    │                       │
       └────────────┬───────┴───────────┬───────────┘
                    ▼                   ▼
           PocketBase + .data      Provider adapters
           customers · bookings    Travelport · PKFARE
           licenses · community    Seeru · Hotelbeds · ETG
                                   iyzico · Paraşüt
```

```
docs/                   Architecture, provider specs, MCP servers
hotel-engine/           Isolated hotel supply / scrape engine
Lonalizamobilapp/       Flutter iOS & Android client
lonaliza-reseller/      White-label reseller edition
pocketbase/             Migrations and hooks
scripts/                Workers, provisioning, hotel content
src/app/                App Router — site, admin, public APIs, mobile BFF
src/components/         Storefront, admin, flights, hotels, community
src/lib/server/         Booking engines, invoices, license, agents
src/lib/providers/      GDS / hotel / transfer adapters
```

See [`docs/README.md`](docs/README.md) for the provider and MCP index.

---

## Tech stack

| Layer | Choice |
|---|---|
| Web | Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4 |
| Motion | Framer Motion |
| Mobile | Flutter, Riverpod, GoRouter |
| Data | PocketBase, JSON file stores, Redis / BullMQ workers |
| Payments | iyzico |
| Accounting | Paraşüt API v4 |
| AI | Gemini, CopilotKit, MCP tool servers |
| Messaging | WhatsApp (Baileys), Telegram, SMTP, web push |
| Community | Nostr relays + in-app social commerce |

---

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin credentials come from environment variables (`NEXT_PUBLIC_ADMIN_USERNAME` / `NEXT_PUBLIC_ADMIN_PASSWORD`) or the Integrations panel. **Do not commit secrets.** Runtime keys live in `.env.local` and `.data/server-env.json`.

```bash
# Flutter customer app
cd Lonalizamobilapp
flutter pub get
flutter run
```

The app talks to the same origin through `/api/mobile/v1`. Point `AppConstants` at your local or production site URL.

---

## Repository notes

This tree is the **Lonaliza production source**: website, admin, mobile BFF, Flutter client, hotel engine, and reseller edition.

Secrets, PocketBase data, `.next`, APKs, and vendor API dumps are gitignored. Provider documentation that *is* checked in lives under [`docs/`](docs/).

---

<div align="center">

**Lonaliza** · travel commerce, operations, and white-label distribution

[lonaliza.com](https://lonaliza.com)

</div>
