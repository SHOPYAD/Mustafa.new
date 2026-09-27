import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { getPocketBaseUrl, tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { pbAuthCookieHeader, serializePbAuth } from "@/lib/pocketbase/auth";
import { createAdminNotification } from "@/lib/admin-notifications/server";
import { localeFromRequest, rememberCustomerLocale } from "@/lib/server/email/recipient-locale";
import { ensureEmailCollections } from "@/lib/server/email/collections";
import { sendOtpIfEnabled } from "@/lib/automation/handlers/comms";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(`auth-register:${clientIp(req)}`, 10, 15 * 60 * 1000);
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
    return NextResponse.json(
      { ok: false, error: "الاسم والإيميل وكلمة مرور من 8 أحرف مطلوبة" },
      { status: 400 }
    );
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

    await createAdminNotification({
      type: "register",
      body_ar: [name, email].filter(Boolean).join(" · "),
      href: "/admin/customers",
      meta: { email, name, source: "password", userId: record.id },
    });

    const otp = await sendOtpIfEnabled({
      phone,
      email,
      purpose: "register",
    }).catch(() => null);

    const payload = serializePbAuth(auth.token, {
      id: auth.record.id,
      email: String(auth.record.email || email),
      name: String(auth.record.name || name),
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: auth.record.id,
          email: auth.record.email,
          name: auth.record.name || name,
        },
        otpSent: Boolean(otp?.ok),
        otpChannel: otp?.ok ? otp.channel : undefined,
        otpTo: otp?.ok ? otp.to : undefined,
      },
      {
        status: 201,
        headers: { "Set-Cookie": pbAuthCookieHeader(payload) },
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
