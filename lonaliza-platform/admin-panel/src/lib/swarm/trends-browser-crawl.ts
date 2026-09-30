import { existsSync } from "fs";
import path from "path";
import { chromium, type Page, type Response } from "playwright";
import type { TrendHit } from "@/lib/swarm/article-pipeline-types";
import { getSwarmRedisConnection } from "@/lib/swarm/swarm-queue";
import { FRANCE_TREND_QUERIES, hitsFromRelatedBody, trendsBlockReason } from "@/lib/swarm/trends-browser";

const CACHE_KEY = "trends:france:browser:v1";
const CACHE_TTL_SECONDS = 24 * 60 * 60;

export type FranceTrendsCrawl = {
  hits: TrendHit[];
  note: string;
  error: string | null;
};

function chromePath(): string | undefined {
  const fromEnv = process.env.PLAYWRIGHT_CHROME || process.env.CHROME_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const home = process.env.HOME || "/root";
  const candidates = [
    path.join(home, ".cache/ms-playwright/chromium-1243/chrome-linux64/chrome"),
    "/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
  ];
  return candidates.find((file) => existsSync(file));
}

function dedupe(hits: TrendHit[]): TrendHit[] {
  const seen = new Set<string>();
  const rows: TrendHit[] = [];
  for (const hit of hits) {
    const key = `${hit.geo}|${hit.query.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(hit);
  }
  return rows;
}

async function dismissNotices(page: Page): Promise<void> {
  const button = page.getByRole("button", { name: /OK, got it|Accept all|I agree|قبول الكل|موافق/i }).first();
  if (await button.isVisible().catch(() => false)) {
    await button.click({ timeout: 2000 }).catch(() => undefined);
  }
}

async function readQuery(page: Page, query: { q: string; geo: string; hl: string }): Promise<{ hits: TrendHit[]; problem?: string }> {
  const chunks: Array<{ status: number; url: string; body: Promise<string> }> = [];
  const onResponse = (response: Response) => {
    const url = response.url();
    const explore = url.includes("/trends/api/explore?") && !url.includes("/pickers/");
    const related = url.includes("/trends/api/widgetdata/relatedsearches");
    if (!explore && !related) return;
    chunks.push({ status: response.status(), url, body: response.text().catch(() => "") });
  };
  page.on("response", onResponse);
  const target = `https://trends.google.com/trends/explore?q=${encodeURIComponent(query.q)}&date=today%2012-m&geo=${query.geo}&hl=${query.hl}`;
  try {
    const nav = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 40000 }).catch((error: unknown) => error);
    const navStatus = nav && typeof nav === "object" && "status" in nav && typeof nav.status === "function" ? nav.status() : null;
    const navError = nav instanceof Error ? nav.message : null;
    await dismissNotices(page);
    await page.mouse.wheel(0, 1600).catch(() => undefined);
    await page.waitForTimeout(7000);
    await Promise.all(chunks.map((chunk) => chunk.body));
    const title = await page.title().catch(() => "");
    const url = page.url();
    const body = await page.locator("body").innerText().catch(() => "");
    const block = trendsBlockReason({ navStatus, title, url, body });
    if (navError && !block) {
      return { hits: [], problem: `geo=${query.geo} q=${query.q}: ${navError}` };
    }
    if (block) return { hits: [], problem: `geo=${query.geo} q=${query.q}: ${block}` };
    const exploreFailures = chunks.filter((chunk) => chunk.url.includes("/trends/api/explore?") && chunk.status !== 200);
    if (exploreFailures.length && chunks.every((chunk) => !chunk.url.includes("relatedsearches") || chunk.status !== 200)) {
      return { hits: [], problem: `geo=${query.geo} q=${query.q}: browser explore HTTP ${exploreFailures[0].status}` };
    }
    const hits: TrendHit[] = [];
    for (const chunk of chunks) {
      if (!chunk.url.includes("relatedsearches") || chunk.status !== 200) continue;
      hits.push(...hitsFromRelatedBody(await chunk.body, query.geo));
    }
    if (!hits.length) {
      return { hits: [], problem: `geo=${query.geo} q=${query.q}: related and rising lists were empty` };
    }
    return { hits };
  } finally {
    page.off("response", onResponse);
  }
}

export async function crawlFranceTrends(): Promise<FranceTrendsCrawl> {
  const executablePath = chromePath();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const context = await browser.newContext({
      locale: "en-US",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    const home = await page.goto("https://www.google.com/?hl=en", { waitUntil: "domcontentloaded", timeout: 30000 }).catch((error: unknown) => error);
    if (home instanceof Error) {
      return { hits: [], note: "playwright.chromium", error: `playwright.chromium google.com: ${home.message}` };
    }
    const trendsHome = await page
      .goto("https://trends.google.com/trends/?geo=US&hl=en-US", { waitUntil: "domcontentloaded", timeout: 40000 })
      .catch((error: unknown) => error);
    if (trendsHome instanceof Error) {
      return { hits: [], note: "playwright.chromium", error: `playwright.chromium trends home: ${trendsHome.message}` };
    }
    const homeStatus = typeof trendsHome.status === "function" ? trendsHome.status() : 0;
    const homeTitle = await page.title().catch(() => "");
    const homeBlock = trendsBlockReason({
      navStatus: homeStatus,
      title: homeTitle,
      url: page.url(),
      body: await page.locator("body").innerText().catch(() => ""),
    });
    if (homeBlock) {
      return { hits: [], note: "playwright.chromium", error: `playwright.chromium trends home: ${homeBlock}` };
    }
    await dismissNotices(page);
    const hits: TrendHit[] = [];
    const problems: string[] = [];
    for (const query of FRANCE_TREND_QUERIES) {
      const result = await readQuery(page, query);
      hits.push(...result.hits);
      if (result.problem) problems.push(result.problem);
      await page.waitForTimeout(600);
    }
    const rows = dedupe(hits);
    const note = `playwright.chromium sequential ${FRANCE_TREND_QUERIES.length} queries rows=${rows.length}`;
    if (!rows.length) {
      return { hits: [], note, error: problems.join(" | ") || "playwright.chromium read no related or rising rows" };
    }
    return { hits: rows, note: problems.length ? `${note} | ${problems.join(" | ")}` : note, error: null };
  } finally {
    await browser.close().catch(() => undefined);
  }
}

export async function readFranceTrendsCache(): Promise<{ hits: TrendHit[]; note: string } | null> {
  try {
    const raw = await getSwarmRedisConnection().get(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { hits?: TrendHit[]; note?: string };
    if (!Array.isArray(parsed.hits) || parsed.hits.length === 0) return null;
    const hits = parsed.hits.filter((hit) => hit && typeof hit.query === "string" && typeof hit.geo === "string");
    if (!hits.length) return null;
    return { hits, note: parsed.note || "redis cache" };
  } catch {
    return null;
  }
}

export async function writeFranceTrendsCache(hits: TrendHit[], note: string): Promise<void> {
  if (!hits.length) return;
  await getSwarmRedisConnection().set(
    CACHE_KEY,
    JSON.stringify({ hits, note, cachedAt: new Date().toISOString() }),
    "EX",
    CACHE_TTL_SECONDS
  );
}
