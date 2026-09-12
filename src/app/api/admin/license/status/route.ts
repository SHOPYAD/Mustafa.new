import { NextResponse } from "next/server";
import { verifyLicense } from "@/lib/license/client";
import { isOrigin } from "@/lib/server/deployment-role";
import { getServerEnv } from "@/lib/server/env-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (isOrigin()) {
      return NextResponse.json({
        ok: true,
        license: {
          valid: true,
          licenseKey: "ORIGIN_PLATFORM_MASTER",
          boundDomain: "lonaliza.com",
        },
      });
    }

    const license = await verifyLicense();
    return NextResponse.json({ ok: true, license });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load license status";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
