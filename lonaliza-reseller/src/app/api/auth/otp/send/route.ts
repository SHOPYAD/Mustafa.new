import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/automation/handlers/comms";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { isOtpChannel, isOtpPurpose } from "@/lib/automation/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(`otp-api:${clientIp(req)}`, 8, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const channel = body.channel;
  const purpose = body.purpose;
  if (!isOtpChannel(channel) || !isOtpPurpose(purpose)) {
    return NextResponse.json({ ok: false, error: "channel_or_purpose" }, { status: 400 });
  }

  const result = await sendOtp({
    channel,
    to: String(body.to || ""),
    purpose,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
