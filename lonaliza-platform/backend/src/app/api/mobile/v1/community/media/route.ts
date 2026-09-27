import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  const body = (await req.json().catch(() => ({}))) as { dataBase64?: string; mimeType?: string; name?: string };
  const raw = String(body.dataBase64 || "").replace(/^data:[^;]+;base64,/, "");
  if (!raw) return NextResponse.json({ ok: false, error: "file_required" }, { status: 400 });

  const buf = Buffer.from(raw, "base64");
  if (buf.length > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
  }
  const mime = String(body.mimeType || "image/jpeg");
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("mp4") ? "mp4" : "jpg";
  const file = `cmedia_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "community");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, file), buf);
  return NextResponse.json({ ok: true, url: `/uploads/community/${file}` });
}
