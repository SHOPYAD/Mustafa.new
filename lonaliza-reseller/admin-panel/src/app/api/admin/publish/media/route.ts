import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listMedia, saveMedia } from "@/lib/publish/media-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const media = await listMedia();
    return NextResponse.json({ ok: true, media });
  } catch {
    return NextResponse.json({ ok: true, media: [] });
  }
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const item = await saveMedia(await req.json());
    return NextResponse.json({ ok: true, media: item, item });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر حفظ الوسيط" },
      { status: 400 }
    );
  }
}
