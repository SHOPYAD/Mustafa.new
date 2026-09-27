import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const ROOT = process.cwd();
const STORE_DIR = path.join(ROOT, "public/app/store-assets");

export async function GET() {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    const playIconPath = path.join(STORE_DIR, "google-play-icon-512.png");
    const appStoreIconPath = path.join(STORE_DIR, "app-store-icon-1024.png");

    const hasPlay = await fs.stat(playIconPath).then(() => true).catch(() => false);
    const hasIos = await fs.stat(appStoreIconPath).then(() => true).catch(() => false);

    return NextResponse.json({
      ok: true,
      googlePlayIcon: hasPlay ? "/app/store-assets/google-play-icon-512.png" : "/icon.png",
      appStoreIcon: hasIos ? "/app/store-assets/app-store-icon-1024.png" : "/icon.png",
      requirements: {
        googlePlay: "512x512 PNG 32-bit, max 1024KB",
        appStore: "1024x1024 PNG, flat no alpha, square corners",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });

    let masterPath = path.join(STORE_DIR, "master-icon.png");

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("icon") as File | null;
      if (!file) {
        return NextResponse.json({ ok: false, error: "No icon file provided" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(masterPath, buffer);
    } else {
      const body = await req.json();
      if (body.imageBase64) {
        const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        await fs.writeFile(masterPath, buffer);
      } else {
        masterPath = path.join(ROOT, "public/icon.png");
      }
    }

    // Run python script to generate all densities
    const scriptPath = path.join(ROOT, "scripts/generate-app-icons.py");
    await execAsync(`python3 ${scriptPath} "${masterPath}"`, { cwd: ROOT });

    return NextResponse.json({
      ok: true,
      message: "تم توليد وتطبيق أيقونات التطبيق للمتاجر وأندرويد بنجاح!",
      googlePlayIcon: "/app/store-assets/google-play-icon-512.png",
      appStoreIcon: "/app/store-assets/app-store-icon-1024.png",
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
