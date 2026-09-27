import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  const allowedFiles = [
    "bust_pos.bin",
    "bust_col.bin",
    "bust_attrs.bin",
    "mountain_pos.bin",
    "mountain_col.bin",
    "mountain_gold.bin",
    "crown_pos.bin",
    "crown_col.bin",
    "master_cyber_backdrop.png",
    "master_lightning_mask.png",
  ];

  if (!file || !allowedFiles.includes(file)) {
    return new NextResponse("Invalid file request", { status: 400 });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "avatar-data",
    file
  );

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const contentType = file.endsWith(".png") ? "image/png" : "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
