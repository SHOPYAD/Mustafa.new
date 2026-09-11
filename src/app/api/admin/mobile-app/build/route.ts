import { spawn } from "child_process";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getMobileAppBuildStatus,
  writeMobileAppBuildStatus,
} from "@/lib/server/mobile-app-studio-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const current = await getMobileAppBuildStatus();
  if (current.state === "running" || current.state === "queued") {
    return NextResponse.json({ ok: false, error: "build_in_progress", build: current }, { status: 409 });
  }

  await writeMobileAppBuildStatus({ state: "queued", startedAt: new Date().toISOString() });
  const worker = path.join(process.cwd(), "scripts/mobile-app-build-worker.mjs");
  const child = spawn(process.execPath, [worker], {
    detached: true,
    stdio: "ignore",
    cwd: process.cwd(),
    env: {
      ...process.env,
      MOBILE_APP_BUILD: "1",
    },
  });
  child.unref();

  return NextResponse.json({ ok: true, build: { state: "queued" } });
}
