import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { isCatalogProviderId } from "@/lib/providers/types";
import { saveFixedUpload } from "@/lib/server/branding-files";
import { saveProviderLogo } from "@/lib/server/providers-registry-store";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const LEGACY_DIR = path.join(process.cwd(), "public", "providers", "custom");

/** Detect real image type from magic bytes (rejects HTML/JSON error pages). */
function detectImageExt(buffer: Buffer): string | null {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "png";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  const head = buffer.slice(0, Math.min(512, buffer.length)).toString("utf8").trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) {
    return "svg";
  }
  return null;
}

/** Strip executable bits from SVG so browsers treat it as an image. */
function sanitizeSvg(buffer: Buffer): Buffer {
  let text = buffer.toString("utf8");
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  text = text.replace(/javascript:/gi, "");
  return Buffer.from(text, "utf8");
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const form = await req.formData();
    const idRaw = String(form.get("id") || "");
    if (!isCatalogProviderId(idRaw)) {
      return NextResponse.json({ ok: false, error: "مزود غير معروف" }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "لم يُرسل ملف" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "حجم الملف يجب أن يكون أقل من 2MB" }, { status: 400 });
    }

    let buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectImageExt(buffer);
    if (!detected) {
      return NextResponse.json(
        { ok: false, error: "الملف ليس صورة صالحة (png / jpg / webp / svg)" },
        { status: 400 }
      );
    }
    // Prefer magic-byte type over client MIME / filename (avoids HTML error pages saved as .jpg)
    const ext = detected;
    if (ext === "svg") {
      buffer = Buffer.from(sanitizeSvg(buffer));
    }

    const filename = `${idRaw}.${ext}`;
    const saved = await saveFixedUpload({
      folder: "providers",
      filename,
      buffer,
    });

    // Clean legacy public/providers/custom copies (Next production never served post-build files)
    try {
      const existing = await fs.readdir(LEGACY_DIR);
      await Promise.all(
        existing
          .filter((name) => name.startsWith(`${idRaw}.`))
          .map((name) => fs.unlink(path.join(LEGACY_DIR, name)).catch(() => undefined))
      );
    } catch {
      /* legacy dir may be empty */
    }

    await saveProviderLogo(idRaw, saved.path);

    return NextResponse.json({
      ok: true,
      customLogo: saved.path,
      url: saved.url,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "فشل رفع الشعار" },
      { status: 500 }
    );
  }
}
