import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { getResellerSettings, saveResellerSettings, type ResellerSettings } from "@/lib/server/resale-store";
import { assertOriginOnly } from "@/lib/server/deployment-role";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    assertOriginOnly("Reseller Settings API");
    const settings = await getResellerSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load settings";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    assertOriginOnly("Reseller Settings API");
    const body = (await req.json()) as Partial<ResellerSettings>;
    const updated = await saveResellerSettings(body);
    return NextResponse.json({ ok: true, settings: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
