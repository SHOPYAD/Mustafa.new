import { NextResponse } from "next/server";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import { getServerEnv } from "@/lib/server/env-store";
import { PARTNER_AUTH_COOKIE } from "@/lib/server/partner-session";

export const runtime = "nodejs";

export async function POST() {
  const siteUrl = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
  const res = NextResponse.json({ ok: true, message: "Logged out" });
  res.headers.append(
    "Set-Cookie",
    `${PARTNER_AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
  );
  return res;
}
