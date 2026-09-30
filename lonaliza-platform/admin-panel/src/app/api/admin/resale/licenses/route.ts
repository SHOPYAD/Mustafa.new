import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { getResellerLicenses } from "@/lib/server/resale-store";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { assertOriginOnly } from "@/lib/server/deployment-role";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    assertOriginOnly("Reseller Licenses API");
    const licenses = await getResellerLicenses();
    return NextResponse.json({ ok: true, licenses });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load licenses";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    assertOriginOnly("Reseller Licenses API");
    const body = (await req.json()) as {
      action: "revoke" | "rebind" | "activate";
      licenseId: string;
      newDomain?: string;
    };

    if (!body.licenseId) {
      return NextResponse.json({ ok: false, error: "licenseId is required" }, { status: 400 });
    }

    const pb = await createAdminPocketBase();

    if (body.action === "revoke") {
      await pb.collection("reseller_licenses").update(body.licenseId, {
        status: "revoked",
        online: false,
      });
      return NextResponse.json({ ok: true, message: "License revoked successfully" });
    }

    if (body.action === "rebind" && body.newDomain) {
      const cleanDomain = body.newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
      await pb.collection("reseller_licenses").update(body.licenseId, {
        status: "bound",
        boundDomain: cleanDomain,
      });
      return NextResponse.json({ ok: true, message: `License rebound to ${cleanDomain}` });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update license";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
