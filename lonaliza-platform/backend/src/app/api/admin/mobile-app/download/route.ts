import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const type = req.nextUrl.searchParams.get("type") || req.nextUrl.searchParams.get("target") || "apk";
  const appDir = path.join(process.cwd(), "Lonalizamobilapp");

  if (type === "apk") {
    const apkPath = path.join(appDir, "build/app/outputs/flutter-apk/app-lonaliza-release.apk");
    try {
      const stat = await fs.stat(apkPath);
      const fileStream = await fs.readFile(apkPath);
      return new NextResponse(fileStream, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.android.package-archive",
          "Content-Disposition": 'attachment; filename="lonaliza-release.apk"',
          "Content-Length": String(stat.size),
        },
      });
    } catch {
      return NextResponse.json(
        { ok: false, error: "apk_not_found. Please trigger build first." },
        { status: 404 }
      );
    }
  }

  if (type === "ios") {
    const iosZipPath = path.join(appDir, "build/ios-export-bundle.zip");
    try {
      const stat = await fs.stat(iosZipPath);
      const fileStream = await fs.readFile(iosZipPath);
      return new NextResponse(fileStream, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="lonaliza-ios-bundle.zip"',
          "Content-Length": String(stat.size),
        },
      });
    } catch {
      return NextResponse.json(
        { ok: false, error: "ios_bundle_not_found. Please trigger build first." },
        { status: 404 }
      );
    }
  }

  if (type === "source" || type === "flutter") {
    const zipPath = path.join("/tmp", "lonaliza-flutter-source.zip");
    try {
      const { execSync } = await import("child_process");
      execSync('zip -r -q /tmp/lonaliza-flutter-source.zip Lonalizamobilapp -x "Lonalizamobilapp/.dart_tool/*" "Lonalizamobilapp/build/*"', {
        cwd: process.cwd(),
      });
      const stat = await fs.stat(zipPath);
      const fileStream = await fs.readFile(zipPath);
      return new NextResponse(fileStream, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="lonaliza-flutter-source.zip"',
          "Content-Length": String(stat.size),
        },
      });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Failed to package Flutter source code" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
}
