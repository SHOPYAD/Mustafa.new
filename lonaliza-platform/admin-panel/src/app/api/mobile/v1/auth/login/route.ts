import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { getPocketBaseUrl } from "@/lib/pocketbase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(`mobile-login:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "email_password_required" }, { status: 400 });
  }

  try {
    const pb = new PocketBase(await getPocketBaseUrl());
    pb.autoCancellation(false);
    const auth = await pb.collection("users").authWithPassword(email, password);
    return NextResponse.json({
      ok: true,
      token: auth.token,
      user: {
        id: auth.record.id,
        email: String(auth.record.email || email),
        name: String(auth.record.name || ""),
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
}
