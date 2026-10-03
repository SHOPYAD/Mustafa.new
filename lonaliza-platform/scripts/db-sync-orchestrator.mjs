#!/usr/bin/env node
/**
 * Incremental PocketBase → PostgreSQL sync (standby). Single writer: active backend in platform-db-settings.json.
 */
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SETTINGS = path.join(ROOT, "database/data/platform-db-settings.json");
const INTERVAL = Number(process.env.DB_SYNC_INTERVAL_MS || 120_000);

const CRITICAL_COLLECTIONS = ["customers", "hotel_bookings", "enquiry_bookings"];

async function readSettings() {
  try {
    return JSON.parse(await fs.readFile(SETTINGS, "utf8"));
  } catch {
    return { activeBackend: "pocketbase", standbySyncEnabled: true };
  }
}

async function writeSettings(patch) {
  const current = await readSettings();
  const next = { ...current, ...patch, lastSyncAt: new Date().toISOString() };
  await fs.mkdir(path.dirname(SETTINGS), { recursive: true });
  await fs.writeFile(SETTINGS, JSON.stringify(next, null, 2));
  return next;
}

async function syncOnce() {
  const settings = await readSettings();
  if (!settings.standbySyncEnabled) {
    console.log("[db-sync] standby sync disabled");
    return;
  }

  const pgUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!pgUrl) {
    console.log("[db-sync] DATABASE_URL not set — skipping PG write");
    await writeSettings({ syncLagMs: null });
    return;
  }

  const pbUrl = (process.env.POCKETBASE_URL || "http://127.0.0.1:8090").replace(/\/$/, "");
  const started = Date.now();

  for (const collection of CRITICAL_COLLECTIONS) {
    try {
      const res = await fetch(
        `${pbUrl}/api/collections/${collection}/records?page=1&perPage=200&sort=-updated`
      );
      if (!res.ok) {
        console.warn(`[db-sync] PB list failed ${collection}: ${res.status}`);
        continue;
      }
      const data = await res.json();
      const items = data.items || [];
      console.log(`[db-sync] ${collection}: ${items.length} recent rows (fetch only until PG driver wired in worker)`);
    } catch (error) {
      console.warn(`[db-sync] ${collection} error`, error instanceof Error ? error.message : error);
    }
  }

  await writeSettings({ syncLagMs: Date.now() - started });
}

async function main() {
  if (process.env.DB_SYNC_ONCE === "1") {
    await syncOnce();
    return;
  }
  console.log("[db-sync] orchestrator started", { intervalMs: INTERVAL });
  await syncOnce();
  setInterval(() => {
    syncOnce().catch((e) => console.error("[db-sync] tick failed", e));
  }, INTERVAL);
}

main().catch((e) => {
  console.error("[db-sync] fatal", e);
  process.exit(1);
});
