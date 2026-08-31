import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { saveUploadedImage } from "@/lib/server/branding-files";
import { getPwaSettings, savePwaSettings } from "@/lib/server/pwa-store";

export const runtime = "nodejs";

const SLOT_KEYS = ["icon192", "icon512", "appleTouchIcon"] as const;
type IconSlot = (typeof SLOT_KEYS)[number];

function isSlot(value: string): value is IconSlot {
  return (SLOT_KEYS as readonly string[]).includes(value);
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "file required" },
        { status: 400 }
      );
    }
    const slotRaw = String(form.get("slot") || "icon192");
    const slot: IconSlot = isSlot(slotRaw) ? slotRaw : "icon192";
    const saved = await saveUploadedImage({ file, folder: "pwa" });
    const current = await getPwaSettings();
    const settings = await savePwaSettings({
      ...current,
      [slot]: saved.path,
    });
    return NextResponse.json({ ok: true, slot, ...saved, settings });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
