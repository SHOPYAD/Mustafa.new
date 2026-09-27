import { NextResponse } from "next/server";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { signLicensePayload } from "@/lib/license/crypto";
import { assertOriginOnly } from "@/lib/server/deployment-role";

export const runtime = "nodejs";

function cleanDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

export async function POST(req: Request) {
  try {
    assertOriginOnly("License Heartbeat API");
    const body = (await req.json()) as {
      licenseKey: string;
      domain: string;
      version?: string;
      timestamp: number;
    };

    const { licenseKey, version } = body;
    const domain = cleanDomain(body.domain || "");

    if (!licenseKey || !domain) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const pb = await createAdminPocketBase();
    const records = await pb.collection("reseller_licenses").getFullList({
      filter: `licenseKey="${licenseKey.trim()}"`,
      limit: 1,
    });

    if (records.length === 0) {
      return NextResponse.json(
        { ok: false, valid: false, error: "License not found", code: "license_not_found" },
        { status: 403 }
      );
    }

    const license = records[0];
    const boundDomain = cleanDomain(license.boundDomain || "");

    if (license.status === "revoked") {
      return NextResponse.json(
        { ok: false, valid: false, error: "License revoked", code: "license_revoked" },
        { status: 403 }
      );
    }

    if (boundDomain && boundDomain !== domain) {
      try {
        await pb.collection("reseller_heartbeats").create({
          license: license.id,
          domain,
          version: version || "1.0.0",
          status: "domain_mismatch",
        });
      } catch {
        /* non-blocking */
      }

      return NextResponse.json(
        { ok: false, valid: false, error: "Domain mismatch", code: "domain_mismatch" },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    await pb.collection("reseller_licenses").update(license.id, {
      lastHeartbeat: now,
      online: true,
      currentVersion: version || license.currentVersion || "v1.0.0",
    });

    // Check updates subscription status
    const subs = await pb.collection("reseller_subscriptions").getFullList({
      filter: `company="${license.company}" && status="active"`,
      limit: 1,
    });
    const hasActiveUpdates = subs.length > 0;

    let planType = "enterprise";
    try {
      if (license.company) {
        const comp = await pb.collection("reseller_companies").getOne(license.company);
        if (comp?.planType) {
          planType = comp.planType;
        }
      }
    } catch {
      /* non-blocking */
    }

    const resPayload = {
      ok: true,
      valid: true,
      licenseKey,
      boundDomain: boundDomain || domain,
      hasActiveUpdates,
      planType,
      latestVersion: "v2.1.0",
      timestamp: Date.now(),
    };

    const sig = signLicensePayload(resPayload);
    return NextResponse.json({ ...resPayload, signature: sig });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Heartbeat error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
