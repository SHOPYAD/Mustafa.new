#!/usr/bin/env node
/**
 * Lonaliza automation ticker.
 *
 * Does NOT restart or replace other pm2 apps. Start only this process:
 *   node scripts/automation-worker.mjs
 *   pm2 start ecosystem.config.cjs --only lonaliza-automation
 *
 * Every 60s POSTs /api/cron/automation (same pattern as email-dispatch).
 * The Next route evaluates cron, caps, and runs handler stubs.
 * Optional in-process BullMQ: npx tsx src/lib/server/automation/worker-main.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PORT = process.env.AUTOMATION_TICK_PORT || process.env.PORT || "3047";
const HOST = process.env.AUTOMATION_TICK_HOST || "127.0.0.1";
const TICK_MS = Number(process.env.AUTOMATION_TICK_MS || 60_000);

function readSecret() {
  const files = [
    resolve(ROOT, ".data/automation/cron-secret"),
    resolve(ROOT, ".data/email-cron-secret"),
  ];
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
    console.warn("[automation-worker] missing cron secret — waiting for Next to write .data/automation/cron-secret");
    return;
  }
  const url = `http://${HOST}:${PORT}/api/cron/automation`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cron-Secret": secret,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("[automation-worker] tick failed", res.status, text.slice(0, 200));
    return;
  }
  try {
    const data = JSON.parse(text);
    if (data.due || data.errors) {
      console.log("[automation-worker] tick", {
        due: data.due,
        ran: data.ran,
        errors: data.errors,
      });
    }
  } catch {
    /* ignore non-json */
  }
}

console.log(`[automation-worker] ticking ${HOST}:${PORT} every ${TICK_MS}ms`);
void tick();
setInterval(() => {
  void tick();
}, TICK_MS);
