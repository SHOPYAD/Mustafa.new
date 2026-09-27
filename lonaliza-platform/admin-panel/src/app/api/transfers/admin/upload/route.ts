import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = "/www/wwwroot/lonaliza.com/downloads/vehicles";
const PUBLIC_ADMIN_DIR = "/www/wwwroot/lonaliza.com/lonaliza-platform/admin-panel/public/downloads/vehicles";
const PUBLIC_STORE_DIR = "/www/wwwroot/lonaliza.com/lonaliza-platform/storefront/public/downloads/vehicles";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".mp4",
  ".webm",
  ".mov",
]);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ ok: false, error: "لم يتم تحديد أي ملف للرفع" }, { status: 400 });
    }

    const rawName = file.name || "upload";
    const ext = path.extname(rawName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          ok: false,
          error: `امتداد الملف غير مدعوم (${ext}). الصيغ المسموحة: الصور (JPG, PNG, WEBP) والفيديوهات (MP4, WEBM, MOV)`,
        },
        { status: 400 }
      );
    }

    // Limit size: 100MB for video, 15MB for images
    const isVideo = [".mp4", ".webm", ".mov"].includes(ext);
    const maxBytes = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;

    if (file.size > maxBytes) {
      const limitMb = isVideo ? 100 : 15;
      return NextResponse.json(
        { ok: false, error: `حجم الملف يتجاوز الحد الأقصى المسموح (${limitMb} ميجابايت)` },
        { status: 400 }
      );
    }

    // Ensure target directories exist
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    try {
      await fs.mkdir(PUBLIC_ADMIN_DIR, { recursive: true });
      await fs.mkdir(PUBLIC_STORE_DIR, { recursive: true });
    } catch {}

    // Unique clean safe name
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedBase = path
      .basename(rawName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 30);
    const fileName = `lona_v_${timestamp}_${sanitizedBase}_${randomSuffix}${ext}`;

    const filePath = path.join(UPLOAD_DIR, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Sync to public directories for dev fallback
    try {
      await fs.writeFile(path.join(PUBLIC_ADMIN_DIR, fileName), buffer);
      await fs.writeFile(path.join(PUBLIC_STORE_DIR, fileName), buffer);
    } catch {}

    const publicUrl = `https://lonaliza.com/downloads/vehicles/${fileName}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      fileName,
      mediaType: isVideo ? "video" : "image",
      size: file.size,
    });
  } catch (err: any) {
    console.error("Vehicle media upload error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "فشل رفع الملف" },
      { status: 500 }
    );
  }
}
