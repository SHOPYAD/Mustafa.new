#!/usr/bin/env node
/**
 * Lonaliza in-house publish ENGINE ticker.
 *
 * Does NOT restart or replace other pm2 apps. Start only this process:
 *   node scripts/publish-worker.mjs
 *
 * Every 60s POSTs /api/admin/publish/tick (same pattern as automation-worker).
 * The Next route: due `queue` posts, RSS hourly autopost, activated plugs.
 * Optional in-process BullMQ:

 *   npx tsx src/lib/publish/worker-main.ts
 *
 * Commented pm2 example — do NOT run a full ecosystem restart:
 *   # pm2 start ecosystem.config.cjs --only lonaliza-publish
 *   # pm2 start scripts/publish-worker.mjs --name lonaliza-publish
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PORT = process.env.PUBLISH_TICK_PORT || process.env.AUTOMATION_TICK_PORT || process.env.PORT || "3047";
const HOST = process.env.PUBLISH_TICK_HOST || process.env.AUTOMATION_TICK_HOST || "127.0.0.1";
const TICK_MS = Number(process.env.PUBLISH_TICK_MS || 60_000);

function readSecret() {
  const files = [
    resolve(ROOT, ".data/publish/cron-secret"),
    resolve(ROOT, ".data/automation/cron-secret"),
    resolve(ROOT, ".data/email-cron-secret"),
  ];
  for (const file of files) {
    if (!existsSync(file)) continue;
    const value = readFileSync(file, "utf8").trim();
    if (value) return value;
  }
  return (
    process.env.PUBLISH_CRON_SECRET ||
    process.env.AUTOMATION_CRON_SECRET ||
    process.env.EMAIL_CRON_SECRET ||
    ""
  );
}

async function tick() {
  const secret = readSecret();
  if (!secret) {
    console.warn(
      "[publish-worker] missing cron secret — waiting for Next to write .data/publish/cron-secret"
    );
    return;
  }
  const url = `http://${HOST}:${PORT}/api/admin/publish/tick`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cron-Secret": secret,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("[publish-worker] tick failed", res.status, text.slice(0, 200));
    return;
  }
  try {
    const data = JSON.parse(text);
    if (data.due || data.errors || data.rss?.fired || data.plugs?.fired || data.rss?.errors || data.plugs?.errors) {
      console.log("[publish-worker] tick", {
        due: data.due,
        ran: data.ran,
        skipped: data.skipped,
        enqueued: data.enqueued,
        errors: data.errors,
        rss: data.rss,
        plugs: data.plugs,
      });
    }
  } catch {
    /* ignore non-json */
  }
}

console.log(`[publish-worker] ticking ${HOST}:${PORT} every ${TICK_MS}ms`);
void tick();
setInterval(() => {
  void tick();
}, TICK_MS);
