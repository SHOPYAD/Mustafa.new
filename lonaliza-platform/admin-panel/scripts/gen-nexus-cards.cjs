#!/usr/bin/env node
/**
 * Generates Nexus deck cards from DOMAIN_SCREENS (every hub).
 * Output: src/lib/studio/nexus/nexus-cards.generated.ts
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src/lib/studio/nexus/nexus-cards.generated.ts");

const TONE_HEX = {
  gold: "#ff9f2a",
  cyan: "#35e3ff",
  magenta: "#d65cff",
  green: "#3cf0a8",
};

function loadDomainScreens() {
  const out = "/tmp/nexus-domain-bundle.cjs";
  execFileSync(
    "npx",
    [
      "--yes",
      "esbuild",
      path.join(ROOT, "src/lib/neural-studio/domain-systems.ts"),
      "--bundle",
      "--platform=node",
      "--format=cjs",
      `--outfile=${out}`,
      "--log-level=warning",
      `--alias:@=${path.join(ROOT, "src")}`,
    ],
    { cwd: ROOT, stdio: "inherit" }
  );
  return require(out).DOMAIN_SCREENS;
}

function slug(s) {
  return String(s)
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function buildCards(screens) {
  const cards = [];
  for (const screen of screens) {
    for (const hub of screen.hubs) {
      const features = hub.items.map((it) => it.label).filter(Boolean).slice(0, 4);
      const id = `nexus-${hub.id.replace(/\./g, "-")}`;
      cards.push({
        id,
        hubId: hub.id,
        screenId: screen.screenId,
        stationId: hub.id,
        titleAr: hub.label,
        titleEn: hub.id.toUpperCase().replace(/\./g, " · "),
        category: screen.title,
        tone: hub.tone,
        color: TONE_HEX[hub.tone] ?? TONE_HEX.cyan,
        domainIcon: hub.icon,
        href: hub.href,
        metricLabel1: "جاهزية القسم",
        metricLabel2: "سجلات حية",
        metricLabel3: "تكامل المنصة",
        description: `محور ${hub.label} ضمن ${screen.title} — ${features.join(" · ") || hub.href}`,
        quickActionCommand: `راجع إعدادات ${hub.label} وحدّث ما يلزم في ${screen.title}`,
        features: features.length ? features : [hub.label],
      });
    }
  }
  return cards;
}

function emit(cards) {
  const body = `/** AUTO-GENERATED — node scripts/gen-nexus-cards.cjs */
import type { DomainIcon, DomainTone } from "@/lib/neural-studio/domain-systems";

export type NexusCardHealth = "OPTIMAL" | "DEGRADED" | "OFFLINE";

export interface NexusHubCard {
  id: string;
  hubId: string;
  screenId: string;
  stationId: string;
  titleAr: string;
  titleEn: string;
  category: string;
  tone: DomainTone;
  color: string;
  domainIcon: DomainIcon;
  href: string;
  metricLabel1: string;
  metricLabel2: string;
  metricLabel3: string;
  description: string;
  quickActionCommand: string;
  features: string[];
}

/** ${cards.length} hubs from DOMAIN_SCREENS (screens 03–16). */
export const NEXUS_HUB_CARDS: NexusHubCard[] = ${JSON.stringify(cards, null, 2)} as NexusHubCard[];

export const NEXUS_CARD_COUNT = ${cards.length};
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body, "utf8");
  console.log(`[gen-nexus-cards] wrote ${cards.length} cards → ${path.relative(ROOT, OUT)}`);
}

const screens = loadDomainScreens();
const cards = buildCards(screens);
emit(cards);
