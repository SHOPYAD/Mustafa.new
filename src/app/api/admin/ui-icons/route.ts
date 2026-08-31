import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getUiIcons, saveUiIcons } from "@/lib/server/ui-icons-persist";
import { normalizeUiIcons, type UiIconsFile } from "@/lib/ui-icons-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const icons = await getUiIcons();
  return NextResponse.json({ ok: true, icons });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { icons?: UiIconsFile } & Partial<UiIconsFile>;
    const payload = body.icons ?? body;
    const icons = await saveUiIcons(normalizeUiIcons(payload));
    return NextResponse.json({ ok: true, icons });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
