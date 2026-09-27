import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getLegalSettings, saveLegalSettings } from "@/lib/server/legal-store";
import { getDeletionRequests } from "@/lib/server/deletion-requests-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const [settings, deletionRequests] = await Promise.all([
      getLegalSettings(),
      getDeletionRequests(),
    ]);

    return NextResponse.json({
      ok: true,
      settings,
      deletionRequests,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load legal management data" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const updated = await saveLegalSettings(body);
    return NextResponse.json({ ok: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to save legal settings" },
      { status: 500 }
    );
  }
}
