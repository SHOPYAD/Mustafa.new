import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { probeIyzicoConnection } from "@/lib/server/iyzico";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  let body: { IYZICO_API_KEY?: string; IYZICO_SECRET_KEY?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const result = await probeIyzicoConnection({
    apiKey: body.IYZICO_API_KEY,
    secretKey: body.IYZICO_SECRET_KEY,
  });
  return NextResponse.json({
    ok: result.ok,
    mode: result.mode,
    baseUrl: result.baseUrl,
    latencyMs: result.latencyMs,
    currencyNote: result.currencyNote,
    via: result.via || null,
    error: result.error || null,
    errorCode: result.errorCode || null,
    hintCode: result.hintCode || null,
  });
}
