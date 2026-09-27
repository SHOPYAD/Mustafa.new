import { NextResponse } from "next/server";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { verifyLicenseSignature, signLicensePayload } from "@/lib/license/crypto";
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
    assertOriginOnly("License Activation API");
    const body = (await req.json()) as {
      licenseKey: string;
      domain: string;
      version?: string;
      timestamp: number;
      signature?: string;
    };

    const { licenseKey, version, timestamp } = body;
    const domain = cleanDomain(body.domain || "");

    if (!licenseKey || !domain) {
      return NextResponse.json(
        { ok: false, error: "licenseKey and domain are required" },
        { status: 400 }
      );
    }

    const pb = await createAdminPocketBase();
    const records = await pb.collection("reseller_licenses").getFullList({
      filter: `licenseKey="${licenseKey.trim()}"`,
      limit: 1,
    });

    if (records.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid license key", code: "license_not_found" },
        { status: 403 }
      );
    }

    const license = records[0];

    // If revoked
    if (license.status === "revoked") {
      return NextResponse.json(
        { ok: false, error: "License has been revoked", code: "license_revoked" },
        { status: 403 }
      );
    }

    const boundDomain = cleanDomain(license.boundDomain || "");

    // If already bound to another domain
    if (boundDomain && boundDomain !== domain) {
      // Log domain mismatch heartbeat
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
        {
          ok: false,
          error: `License is bound to domain (${boundDomain}), cannot be used on (${domain})`,
          code: "domain_mismatch",
          boundDomain,
        },
        { status: 403 }
      );
    }

    // First time activation: lock the license to this domain!
    const now = new Date().toISOString();
    await pb.collection("reseller_licenses").update(license.id, {
      boundDomain: domain,
      status: "bound",
      firstActivation: license.firstActivation || now,
      lastHeartbeat: now,
      currentVersion: version || "v1.0.0",
      online: true,
    });

    // Check if company has an active update subscription
    const subs = await pb.collection("reseller_subscriptions").getFullList({
      filter: `company="${license.company}" && status="active"`,
      limit: 1,
    });
    const hasActiveUpdates = subs.length > 0;

    const responsePayload = {
      ok: true,
      valid: true,
      licenseKey,
      boundDomain: domain,
      activatedAt: now,
      hasActiveUpdates,
      timestamp: Date.now(),
    };

    const sig = signLicensePayload(responsePayload);

    return NextResponse.json({ ...responsePayload, signature: sig });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Activation failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
