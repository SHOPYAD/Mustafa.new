import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/server/env-store";
import { getGoogleOAuthCredentials } from "@/lib/pocketbase/google";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";

export const runtime = "nodejs";

const PARTNER_OAUTH_VERIFIER_COOKIE = "liotrip_partner_oauth_verifier";

function cookieHeader(name: string, value: string, maxAge: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`;
}

export async function GET(req: NextRequest) {
  const siteUrl = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
  return NextResponse.redirect(`${siteUrl}/api/auth/google?next=/partners/dashboard`, 302);
}
