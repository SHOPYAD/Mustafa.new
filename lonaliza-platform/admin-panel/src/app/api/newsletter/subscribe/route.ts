import { NextResponse } from "next/server";
import { recordNewsletterOptIn } from "@/lib/automation/optin-store";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = await rateLimit(`newsletter:${clientIp(req)}`, 8, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const ok = await recordNewsletterOptIn(email);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
