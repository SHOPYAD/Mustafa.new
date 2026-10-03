import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { getPocketBaseUrl } from "@/lib/pocketbase/admin";
import { pbAuthCookieHeader, serializePbAuth } from "@/lib/pocketbase/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = await rateLimit(`auth-login:${clientIp(req)}`, 10, 15 * 60 * 1000);
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
    return NextResponse.json(
      { ok: false, error: "أدخل الإيميل وكلمة المرور" },
      { status: 400 }
    );
  }

  try {
    const pb = new PocketBase(await getPocketBaseUrl());
    pb.autoCancellation(false);
    const auth = await pb.collection("users").authWithPassword(email, password);
    const payload = serializePbAuth(auth.token, {
      id: auth.record.id,
      email: String(auth.record.email || email),
      name: String(auth.record.name || ""),
    });
    return NextResponse.json(
      {
        ok: true,
        user: {
          id: auth.record.id,
          email: auth.record.email,
          name: auth.record.name || "",
        },
      },
      { headers: { "Set-Cookie": pbAuthCookieHeader(payload) } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "بيانات الدخول غير صحيحة" },
      { status: 401 }
    );
  }
}
