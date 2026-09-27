import { NextResponse } from "next/server";
import { getPaymentsPublicConfig } from "@/lib/server/payments-settings";

export const runtime = "nodejs";

export async function GET() {
  const config = await getPaymentsPublicConfig();
  return NextResponse.json(
    { ok: true, ...config },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
