import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { isOrigin } from "@/lib/server/deployment-role";
import { verifyLicense } from "@/lib/license/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    if (isOrigin()) {
      return NextResponse.json({
        ok: true,
        isOrigin: true,
        planType: "enterprise",
      });
    }

    const license = await verifyLicense();
    return NextResponse.json({
      ok: true,
      isOrigin: false,
      planType: license.planType || "whitelabel_free",
      boundDomain: license.boundDomain,
      valid: license.valid,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: true,
      isOrigin: false,
      planType: "whitelabel_free",
    });
  }
}
