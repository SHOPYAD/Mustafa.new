import { NextResponse } from "next/server";
import { getAuthenticatedPartnerCompany } from "@/lib/server/partner-session";
import { testB2BHandshake } from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const company = await getAuthenticatedPartnerCompany();
    if (!company) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { apiKey?: string; apiSecret?: string };
    const apiKey = body.apiKey || company.b2bApiKeyMaster || "";
    const apiSecret = body.apiSecret || company.b2bApiSecret || "";

    const result = await testB2BHandshake(apiKey, apiSecret);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to test handshake";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
