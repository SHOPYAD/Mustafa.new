import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { getPocketBaseUrl, tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { localeFromRequest, rememberCustomerLocale } from "@/lib/server/email/recipient-locale";
import { ensureEmailCollections } from "@/lib/server/email/collections";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(`mobile-register:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  if (!email || !password || password.length < 8 || !name) {
    return NextResponse.json({ ok: false, error: "invalid_register" }, { status: 400 });
  }

  try {
    const pb = new PocketBase(await getPocketBaseUrl());
    pb.autoCancellation(false);
    const record = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      name,
    });
    const auth = await pb.collection("users").authWithPassword(email, password);
    const locale = localeFromRequest(req, body);
    const admin = await tryCreateAdminPocketBase();
    if (admin) {
      await ensureEmailCollections(admin);
      await admin.collection("customers").create({
        user: record.id,
        name,
        email,
        phone,
        locale,
      });
    } else {
      await rememberCustomerLocale(email, locale, { name, phone, userId: record.id });
    }
    return NextResponse.json(
      {
        ok: true,
        token: auth.token,
        user: {
          id: auth.record.id,
          email: String(auth.record.email || email),
          name: String(auth.record.name || name),
        },
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "register_failed" },
      { status: 400 }
    );
  }
}
