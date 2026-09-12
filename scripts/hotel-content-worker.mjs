#!/usr/bin/env node
/**
 * Lonaliza hotel content worker (plan A1).
 *
 * Does NOT restart or replace other pm2 apps. Start only this process:
 *   node scripts/hotel-content-worker.mjs
 *   pm2 start ecosystem.config.cjs --only lonaliza-hotel-content
 *
 * Every HOTEL_CONTENT_TICK_MS (default 3 min) POSTs /api/cron/hotel-content. The Next route runs one
 * quota-aware ingestion tick (Hotelbeds Content by destination, Travelport propertiesdetail backfill,
 * RateHawk dumps, identity re-clustering) and persists into PocketBase.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PORT = process.env.HOTEL_CONTENT_TICK_PORT || process.env.PORT || "3047";
const HOST = process.env.HOTEL_CONTENT_TICK_HOST || "127.0.0.1";
const TICK_MS = Number(process.env.HOTEL_CONTENT_TICK_MS || 3 * 60_000);
const BUDGET_MS = Number(process.env.HOTEL_CONTENT_BUDGET_MS || 45_000);

function readSecret() {
  const files = [resolve(ROOT, ".data/automation/cron-secret"), resolve(ROOT, ".data/email-cron-secret")];
  for (const file of files) {
    if (!existsSync(file)) continue;
    const value = readFileSync(file, "utf8").trim();
    if (value) return value;
  }
  return process.env.AUTOMATION_CRON_SECRET || process.env.EMAIL_CRON_SECRET || "";
}

async function tick() {
  const secret = readSecret();
  if (!secret) {
    console.warn("[hotel-content-worker] missing cron secret — waiting for Next to write .data/automation/cron-secret");
    return;
  }
  const url = `http://${HOST}:${PORT}/api/cron/hotel-content?budgetMs=${BUDGET_MS}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BUDGET_MS + 60_000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "X-Cron-Secret": secret }, signal: controller.signal });
    const text = await res.text();
    if (!res.ok) {
      console.error("[hotel-content-worker] tick failed", res.status, text.slice(0, 300));
      return;
    }
    const data = JSON.parse(text);
    const summary = (data.steps || []).map((s) => `${s.step}:${s.status}${s.count != null ? `(${s.count})` : ""}${s.detail ? ` ${s.detail}` : ""}`);
    console.log("[hotel-content-worker] tick", `${data.durationMs}ms`, summary.join(" | "));
  } finally {
    clearTimeout(timer);
  }
}

async function loop() {
  for (;;) {
    try {
      await tick();
    } catch (err) {
      console.error("[hotel-content-worker] tick error", err instanceof Error ? err.message : err);
    }
    await new Promise((r) => setTimeout(r, TICK_MS));
  }
}

console.log(`[hotel-content-worker] started → http://${HOST}:${PORT}/api/cron/hotel-content every ${TICK_MS / 1000}s`);
loop();
