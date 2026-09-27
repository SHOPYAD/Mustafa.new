import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { saveServerEnv } from "@/lib/server/env-store";
import {
  getIyzicoMerchantUrls,
  getIyzicoSecrets,
  getPaymentsAdminValues,
  getPaymentsMap,
  sanitizePaymentsPatch,
} from "@/lib/server/payments-settings";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const values = await getPaymentsAdminValues();
  const secrets = await getIyzicoSecrets();
  const urls = await getIyzicoMerchantUrls();
  return NextResponse.json({
    ok: true,
    values,
    urls,
    configured: Boolean(secrets.apiKey && secrets.secretKey),
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { values?: Record<string, string> };
    const current = await getPaymentsMap();
    const patch = sanitizePaymentsPatch(body.values || {}, current);
    await saveServerEnv(patch);
    const values = await getPaymentsAdminValues();
    const secrets = await getIyzicoSecrets();
    return NextResponse.json({
      ok: true,
      values,
      configured: Boolean(secrets.apiKey && secrets.secretKey),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
