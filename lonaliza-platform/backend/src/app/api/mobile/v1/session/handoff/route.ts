import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { getPocketBaseUrl } from "@/lib/pocketbase/admin";
import { pbAuthCookieHeader, serializePbAuth } from "@/lib/pocketbase/auth";
import { isHandoffPath } from "@/lib/server/mobile/handoff-allowlist";
import { consumeHandoff, mintHandoff } from "@/lib/server/mobile/handoff-store";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* path may be missing */
  }
  const path = String(body.path || "").trim();
  if (!isHandoffPath(path)) {
    return NextResponse.json({ ok: false, error: "path_not_allowed" }, { status: 400 });
  }

  const code = await mintHandoff({
    token: auth.token,
    userId: auth.customer.id,
    email: auth.customer.email,
    name: auth.customer.name,
    path,
  });
  return NextResponse.json({
    ok: true,
    url: `/api/mobile/v1/session/handoff?code=${encodeURIComponent(code)}`,
  });
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") || "";
  const rec = code ? await consumeHandoff(code) : null;
  if (!rec) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  try {
    const pb = new PocketBase(await getPocketBaseUrl());
    pb.autoCancellation(false);
    pb.authStore.save(rec.token, null);
    const auth = await pb.collection("users").authRefresh();
    const payload = serializePbAuth(auth.token, {
      id: auth.record.id,
      email: String(auth.record.email || rec.email),
      name: String(auth.record.name || rec.name),
    });
    const location = new URL(rec.path, req.nextUrl.origin);
    const res = NextResponse.redirect(location, 302);
    res.headers.set("Set-Cookie", pbAuthCookieHeader(payload));
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
}
