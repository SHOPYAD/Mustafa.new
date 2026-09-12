# Flights Page UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a flights landing page that visually matches the provided Trip.com screenshot and is split into focused widgets following the existing `Hotels` feature structure.

**Architecture:** Keep `FlightsPage` as a light composition layer, just like `HotelsPage`. Put each visual section into its own widget so the page stays easy to evolve later when search behavior is added.

**Tech Stack:** Flutter `material`, existing app theme/styles, local image assets

---

### Task 1: Compose the Flights page shell

**Files:**
- Modify: `lib/presentation/features/flights/views/flights_page.dart`
- Create: `lib/presentation/features/flights/widgets/flights_hero_header.dart`
- Create: `lib/presentation/features/flights/widgets/flights_search_card.dart`
- Create: `lib/presentation/features/flights/widgets/flights_quick_actions_row.dart`
- Create: `lib/presentation/features/flights/widgets/flights_promo_card.dart`
- Create: `lib/presentation/features/flights/widgets/flights_inspiration_section.dart`

- [ ] Build `FlightsPage` as a simple `ListView` page with a top hero, an overlapping white search card, quick actions, promo card, and inspiration section.
- [ ] Mirror the `HotelsPage` spacing pattern so the page feels consistent with the rest of the app.
- [ ] Keep the whole first pass static: no search logic, only visual UI.

### Task 2: Match the hero and search card to the reference

**Files:**
- Create: `lib/presentation/features/flights/widgets/flights_hero_header.dart`
- Create: `lib/presentation/features/flights/widgets/flights_search_card.dart`

- [ ] Add a hero area with a back button, brand text, promo copy, decorative plane badge, and the small yellow profile circle shown in the screenshot.
- [ ] Build the white search card with trip-type tabs, route rows, date row, passenger/class row, bundle checkbox, and blue search button.
- [ ] Keep the controls visually styled as inputs, but static for now.

### Task 3: Build the supporting content blocks

**Files:**
- Create: `lib/presentation/features/flights/widgets/flights_quick_actions_row.dart`
- Create: `lib/presentation/features/flights/widgets/flights_promo_card.dart`
- Create: `lib/presentation/features/flights/widgets/flights_inspiration_section.dart`

- [ ] Add the three quick actions from the reference: `Anywhere`, `Price alerts`, and `More`.
- [ ] Add the warm promo card `Business class top picks` with an `Explore` CTA.
- [ ] Add the `Travel inspiration` section with location text and a large blue destination card inspired by the screenshot.

### Task 4: Verify the implementation

**Files:**
- Verify: `lib/presentation/features/flights/views/flights_page.dart`
- Verify: `lib/presentation/features/flights/widgets/*.dart`

- [ ] Run IDE lints on the edited files and fix any issues.
- [ ] Run `flutter analyze lib/presentation/features/flights lib/presentation/providers lib/data lib/domain`.
- [ ] Confirm the new files follow the same import and structure conventions as `Hotels`.
