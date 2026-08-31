<div align="center">

# ✈️ Alrayyan Tourism — Full-Stack Travel Booking Platform

**A production-grade travel agency platform built with Next.js 16, React 19 & TypeScript — flights, holiday packages, tours, visa services, and a complete admin panel, all in one codebase.**

![Status](https://img.shields.io/badge/status-production-success)
![Type](https://img.shields.io/badge/type-Travel%20%26%20Booking-blue)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Overview

A complete travel-agency web platform — not a landing page, a full booking system. Built for a real UAE-based travel agency, covering flights, curated holiday packages, guided tours, visa services, and destination discovery, backed by an admin panel that lets non-technical staff manage bookings and content without touching code.

> Built on the **LIOTRIP** (ليو تريب) travel platform for Alrayyan Group.

---

## Key Features

### Customer-facing
- ✈️ **Flight search & booking** — dedicated search flow with results filtering
- 🏝️ **Holiday packages** — dynamic destination pages (`/holidays/[destination]`) and package detail pages (`/package/[slug]`)
- 🗺️ **UAE tours** — curated local tour offerings
- 🛂 **Visa services** — dedicated visa information and application flow
- 📰 **Travel blog** — content marketing built into the platform
- 💬 **Trip planner modal** — guided assistant for undecided visitors
- 🔴 **Live booking toast** — real-time social-proof notifications
- 🎚️ **Currency selector** — multi-currency price display
- 📊 **Package comparison drawer** — compare multiple holiday packages side by side
- 📱 **WhatsApp integration** — direct booking enquiries via WhatsApp
- 🌟 **Testimonials carousel** & **trust badges** for credibility

### Admin panel (`/admin`)
- 🔐 Authenticated admin area (login-gated)
- 📦 **Bookings management** — view and manage customer bookings
- ✈️ **Flights, Tours, Packages, Visa** — full CRUD content management
- 📝 **Site content management** — update site copy without a redeploy

### Engineering polish
- 🎯 **Custom cursor** & **page transitions** for a premium feel
- 🌀 **Smooth scroll** & **scroll reveal** animations throughout
- ⚡ **Floating action hub** for quick access to key actions
- 🔍 **SEO-ready** — dynamic sitemap (`sitemap.ts`) and `robots.ts`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Utilities** | date-fns, clsx, tailwind-merge, class-variance-authority |

---

## Project Structure

See [`docs/README.md`](docs/README.md) for the architecture index (frontend / backend / database / hotel scraper).

```
docs/                   # Specifications and notes (not served)
hotel-engine/           # Isolated hotel scraping engine (NestJS)
pocketbase/             # Database binary, migrations, hooks
scripts/                # Ops + import tools
scripts/hotel-scraper/  # Legacy Booking scrape / seed scripts
src/app/                # Next.js App Router (site + admin + API)
src/components/         # Frontend UI
src/data/               # Client stores / seed catalogs
src/data/scraping/hotels/  # Hotel scrape dumps
src/lib/server/         # Backend services and stores
src/lib/scraping/hotels/   # Next.js adapter to hotel-engine
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** Admin credentials are read from environment variables (`NEXT_PUBLIC_ADMIN_USERNAME` / `NEXT_PUBLIC_ADMIN_PASSWORD`) with safe defaults for local development — no real credentials are stored in this repository.

---

<div align="center">

**Alrayyan Group** · platform **LIOTRIP** / ليو تريب

</div>
