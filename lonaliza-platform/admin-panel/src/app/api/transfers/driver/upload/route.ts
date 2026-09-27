// src/app/api/transfers/driver/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "../storefront/public/uploads/driver-docs"
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, dataBase64, mimeType } = body;

    if (!dataBase64) {
      return NextResponse.json(
        { ok: false, message: "لم يتم استلام أي بيانات للملف" },
        { status: 400 }
      );
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const safeName = (filename || "document.jpg")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    const buffer = Buffer.from(dataBase64, "base64");
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/driver-docs/${uniqueName}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      fileUrl: publicUrl,
      filename: uniqueName,
    });
  } catch (err: any) {
    console.error("Driver document upload error:", err);
    return NextResponse.json(
      { ok: false, message: err.message || "فشل رفع المستند" },
      { status: 500 }
    );
  }
}
