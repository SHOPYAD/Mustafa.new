import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  isUploadFolder,
  saveUploadedImage,
  type UploadFolder,
} from "@/lib/server/branding-files";

export const runtime = "nodejs";

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
    const requested = String(form.get("folder") || "branding");
    const folder: UploadFolder = isUploadFolder(requested)
      ? requested
      : "branding";
    const saved = await saveUploadedImage({ file, folder });
    return NextResponse.json({ ok: true, ...saved });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
