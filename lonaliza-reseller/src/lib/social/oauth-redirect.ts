import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { clearOAuthCookieHeader } from "./oauth-state";
import { resolveSocialOrigin } from "./env";

export async function requireAdminForOAuth(req: Request): Promise<NextResponse | null> {
  const denied = await assertAdminApi(req);
  if (!denied) return null;
  const origin = await resolveSocialOrigin(req);
  return NextResponse.redirect(`${origin}/admin/login`, 302);
}

export async function redirectSocialAdmin(
  req: Request,
  params: Record<string, string>
): Promise<NextResponse> {
  const origin = await resolveSocialOrigin(req);
  const search = new URLSearchParams(params);
  const res = NextResponse.redirect(
    `${origin}/admin/social-accounts?${search.toString()}`,
    302
  );
  res.headers.append("Set-Cookie", clearOAuthCookieHeader(origin));
  return res;
}
