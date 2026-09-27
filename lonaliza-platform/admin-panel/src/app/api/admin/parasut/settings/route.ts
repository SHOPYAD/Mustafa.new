import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getMaskedParasutConfig, saveParasutConfig } from "@/lib/server/parasut/parasut-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const config = await getMaskedParasutConfig();
    return NextResponse.json({ ok: true, config });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const patch = body.config || body;

    const companyId = patch.companyId ?? patch.company_id;
    const clientId = patch.clientId ?? patch.client_id;
    const clientSecret = patch.clientSecret ?? patch.client_secret;
    const vatExemptionReasonCode = patch.vatExemptionReasonCode ?? patch.vat_exemption_code;
    const autoIssueOnPayment = patch.autoIssueOnPayment ?? patch.auto_issue_on_payment;

    await saveParasutConfig({
      enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : undefined,
      companyId: companyId !== undefined ? String(companyId).trim() : undefined,
      clientId: clientId !== undefined ? String(clientId).trim() : undefined,
      clientSecret: clientSecret !== undefined ? String(clientSecret).trim() : undefined,
      username: patch.username !== undefined ? String(patch.username).trim() : undefined,
      password: patch.password !== undefined ? String(patch.password).trim() : undefined,
      environment: patch.environment === "sandbox" ? "sandbox" : "production",
      defaultProductId: patch.defaultProductId !== undefined ? String(patch.defaultProductId).trim() : undefined,
      vatExemptionReasonCode: vatExemptionReasonCode !== undefined ? String(vatExemptionReasonCode).trim() : undefined,
      vatExemptionReason: patch.vatExemptionReason,
      note: patch.note,
    });

    const config = await getMaskedParasutConfig();
    return NextResponse.json({ ok: true, config });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
