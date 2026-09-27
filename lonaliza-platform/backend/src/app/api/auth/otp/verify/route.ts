import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/automation/handlers/comms";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { isOtpPurpose } from "@/lib/automation/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(`otp-verify:${clientIp(req)}`, 20, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const purpose = body.purpose;
  if (!isOtpPurpose(purpose)) {
    return NextResponse.json({ ok: false, error: "purpose" }, { status: 400 });
  }

  const result = await verifyOtp({
    to: String(body.to || ""),
    code: String(body.code || ""),
    purpose,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
