import { NextRequest, NextResponse } from "next/server";
import {
  pbAuthCookieHeader,
  serializePbAuth,
} from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { upsertCustomerFromUser } from "@/lib/pocketbase/customers";
import { createAdminNotification } from "@/lib/admin-notifications/server";
import { getServerEnv } from "@/lib/server/env-store";
import {
  OAUTH_NEXT_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  resolveSitePublicUrl,
} from "@/lib/pocketbase/constants";
import {
  authWithGoogleCode,
  ensureUsersGoogleProviderFromEnv,
  googleFailRedirectPath,
  logGoogleAuthError,
  safeGoogleFailReason,
  safeOAuthNextPath,
} from "@/lib/pocketbase/google";

export const runtime = "nodejs";

function readCookie(req: Request, name: string): string {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("=") || "");
  }
  return "";
}

function clearCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}

export async function GET(req: NextRequest) {
  const origin = resolveSitePublicUrl(
    await getServerEnv("NEXT_PUBLIC_SITE_URL")
  );
  const redirectUri = `${origin}/api/auth/callback`;
  const next = safeOAuthNextPath(readCookie(req, OAUTH_NEXT_COOKIE) || "/account");

  const fail = (reason: string) => {
    const safe = safeGoogleFailReason(reason);
    console.error("[auth-google]", "redirect-fail", { reason: safe });
    const res = NextResponse.redirect(`${origin}${googleFailRedirectPath(safe)}`, 302);
    res.headers.append("Set-Cookie", clearCookie(OAUTH_VERIFIER_COOKIE));
    res.headers.append("Set-Cookie", clearCookie(OAUTH_NEXT_COOKIE));
    return res;
  };

  const code = req.nextUrl.searchParams.get("code") || "";
  const error = req.nextUrl.searchParams.get("error") || "";
  if (error || !code) {
    return fail(error || "google_denied");
  }

  const verifier = readCookie(req, OAUTH_VERIFIER_COOKIE);
  if (!verifier) {
    return fail("google_expired");
  }

  try {
    const synced = await ensureUsersGoogleProviderFromEnv();
    if (!synced.ok) {
      logGoogleAuthError("ensure-provider", new Error(synced.error || "sync_failed"));
    }

    const auth = await authWithGoogleCode({ code, verifier, redirectUri });

    const admin = await tryCreateAdminPocketBase();
    if (admin) {
      try {
        const upserted = await upsertCustomerFromUser(admin, {
          id: auth.user.id,
          email: auth.user.email,
          name: auth.user.name,
        });
        if (upserted.created) {
          await createAdminNotification({
            type: "register",
            body_ar: [auth.user.name, auth.user.email]
              .filter(Boolean)
              .join(" · "),
            href: "/admin/customers",
            meta: {
              email: auth.user.email,
              name: auth.user.name,
              source: "google",
              userId: auth.user.id,
            },
          });
        }
      } catch (customerErr) {
        logGoogleAuthError("upsert-customer", customerErr);
      }
    }

    const payload = serializePbAuth(auth.token, auth.user);
    const res = NextResponse.redirect(`${origin}${next}`, 302);
    res.headers.append("Set-Cookie", pbAuthCookieHeader(payload));
    res.headers.append("Set-Cookie", clearCookie(OAUTH_VERIFIER_COOKIE));
    res.headers.append("Set-Cookie", clearCookie(OAUTH_NEXT_COOKIE));
    console.log("[auth-google]", "ok", { userId: auth.user.id });
    return res;
  } catch (err) {
    logGoogleAuthError("callback", err);
    return fail("google_failed");
  }
}
