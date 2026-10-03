import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getPocketBaseHealth } from "@/lib/pocketbase/admin";
import {
  postgresHealth,
  readDatabasePlatformSettings,
  writeDatabasePlatformSettings,
} from "@/lib/server/database-platform";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await assertAdminApi(req);
  if (!auth.ok) return auth.response;

  const [settings, pb, pg] = await Promise.all([
    readDatabasePlatformSettings(),
    getPocketBaseHealth(),
    postgresHealth(),
  ]);

  return NextResponse.json({
    ok: true,
    settings,
    pocketbase: {
      healthy: pb.healthy,
      collectionsCount: pb.collectionsCount,
      url: pb.url,
      error: pb.error || "",
    },
    postgres: pg,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await assertAdminApi(req);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    activeBackend?: "pocketbase" | "postgres";
    standbySyncEnabled?: boolean;
    confirm?: string;
  };

  if (body.activeBackend && body.confirm !== "CUTOVER") {
    return NextResponse.json(
      { ok: false, error: "confirm_cutover_required", hint: 'Send confirm: "CUTOVER"' },
      { status: 400 }
    );
  }

  if (body.activeBackend === "postgres") {
    const pg = await postgresHealth();
    if (!pg.ok) {
      return NextResponse.json({ ok: false, error: "postgres_not_ready", detail: pg.error }, { status: 503 });
    }
  }

  const next = await writeDatabasePlatformSettings({
    ...(body.activeBackend ? { activeBackend: body.activeBackend, lastCutoverAt: new Date().toISOString() } : {}),
    ...(typeof body.standbySyncEnabled === "boolean"
      ? { standbySyncEnabled: body.standbySyncEnabled }
      : {}),
  });

  return NextResponse.json({ ok: true, settings: next });
}
