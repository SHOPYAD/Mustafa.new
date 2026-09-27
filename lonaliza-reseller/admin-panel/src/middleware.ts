import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AFFILIATE_REF_COOKIE } from "@/lib/affiliate/types";
import {
  ADMIN_AUTH_COOKIE,
  LEGACY_ADMIN_AUTH_COOKIE,
  looksLikeSignedAdminToken,
  verifyAdminSessionToken,
} from "@/lib/admin-session-token";
import { APP_SHELL_COOKIE, APP_SHELL_HEADER } from "@/lib/mobile/app-mode";

const COOKIE_DAYS = 30;

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20);
}

function adminLoginRedirect(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

function consoleLoginRedirect(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/console/login";
  url.search = "";
  return NextResponse.redirect(url);
}

async function adminSessionOk(req: NextRequest): Promise<boolean> {
  const token =
    req.cookies.get(ADMIN_AUTH_COOKIE)?.value ||
    req.cookies.get(LEGACY_ADMIN_AUTH_COOKIE)?.value ||
    "";
  if (!token || token === "1" || !looksLikeSignedAdminToken(token)) return false;
  const secret = (process.env.ADMIN_SESSION_SECRET || "").trim();
  if (!secret) return true;
  return verifyAdminSessionToken(secret, token);
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";
  const isAdminManifest = path === "/admin/manifest.webmanifest";
  const isConsole = path.startsWith("/console");
  const isConsoleLogin = path === "/console/login";

  if (isAdmin && !isAdminLogin && !isAdminManifest && !(await adminSessionOk(req))) {
    return adminLoginRedirect(req);
  }

  if (isConsole && !isConsoleLogin && !(await adminSessionOk(req))) {
    return consoleLoginRedirect(req);
  }

  const userAgent = req.headers.get("user-agent") || "";
  const isDesktop = !/Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

  const hasAppIdentity =
    userAgent.includes("LonalizaApp") ||
    req.headers.get(APP_SHELL_HEADER) === "1" ||
    (!isDesktop && req.cookies.get(APP_SHELL_COOKIE)?.value === "1");

  const isAppReq =
    !isDesktop &&
    (hasAppIdentity ||
      req.nextUrl.searchParams.get("app") === "1" ||
      req.nextUrl.searchParams.get("view_mode") === "app" ||
      req.nextUrl.searchParams.get("shell") === "1");

  const requestHeaders = new Headers(req.headers);
  if (isAppReq) {
    requestHeaders.set(APP_SHELL_HEADER, "1");
  }

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (isAppReq && req.cookies.get(APP_SHELL_COOKIE)?.value !== "1") {
    res.cookies.set(APP_SHELL_COOKIE, "1", {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });
  } else if (isDesktop && req.cookies.has(APP_SHELL_COOKIE)) {
    // Purge rogue app cookie on desktop browsers
    res.cookies.delete(APP_SHELL_COOKIE);
  }

  const ref = req.nextUrl.searchParams.get("ref") || "";
  const code = normalizeCode(ref);
  if (code.length >= 3) {
    res.cookies.set(AFFILIATE_REF_COOKIE, code, {
      path: "/",
      maxAge: COOKIE_DAYS * 24 * 60 * 60,
      sameSite: "lax",
    });
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|tpwl|web/|content/|transfer/).*)",
  ],
};
