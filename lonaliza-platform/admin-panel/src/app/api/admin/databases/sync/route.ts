import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { readDatabasePlatformSettings, writeDatabasePlatformSettings } from "@/lib/server/database-platform";
import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await assertAdminApi(req);
  if (!auth.ok) return auth.response;

  const settings = await readDatabasePlatformSettings();
  if (!settings.standbySyncEnabled) {
    return NextResponse.json({ ok: false, error: "standby_sync_disabled" }, { status: 400 });
  }

  const script = path.join(process.cwd(), "..", "scripts/db-sync-orchestrator.mjs");
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      env: { ...process.env, DB_SYNC_ONCE: "1", DB_SYNC_INTERVAL_MS: "0" },
      stdio: "ignore",
    });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`sync_exit_${code}`))));
    setTimeout(() => {
      child.kill("SIGTERM");
      resolve();
    }, 15_000);
  }).catch(() => undefined);

  const updated = await writeDatabasePlatformSettings({ lastSyncAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, settings: updated, message: "sync_triggered" });
}
