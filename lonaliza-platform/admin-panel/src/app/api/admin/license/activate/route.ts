import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { saveServerEnv, getServerEnv } from "@/lib/server/env-store";
import { verifyLicense } from "@/lib/license/client";
import { signLicensePayload } from "@/lib/license/crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { licenseKey: string };
    const licenseKey = (body.licenseKey || "").trim();

    if (!licenseKey) {
      return NextResponse.json({ ok: false, error: "License key is required" }, { status: 400 });
    }

    // Save in env store
    await saveServerEnv({
      LICENSE_KEY: licenseKey,
    });

    const originUrl = (await getServerEnv("LICENSE_ORIGIN")).trim() || "https://lonaliza.com";
    const siteUrl = (await getServerEnv("NEXT_PUBLIC_SITE_URL")).trim();
    const domain = siteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");

    // Call origin /api/license/activate
    const payload = {
      licenseKey,
      domain,
      version: "v2.0.0",
      timestamp: Date.now(),
    };
    const signature = signLicensePayload(payload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const originRes = await fetch(`${originUrl}/api/license/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, signature }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = (await originRes.json()) as {
      ok?: boolean;
      valid?: boolean;
      boundDomain?: string;
      error?: string;
    };

    if (!originRes.ok || !data?.valid) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.error || "فشل تفعيل الترخيص لدى الخادم الرئيسي",
        },
        { status: 400 }
      );
    }

    const nextState = await verifyLicense();
    return NextResponse.json({ ok: true, license: nextState, message: "تم تفعيل الترخيص بنجاح!" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Activation failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
