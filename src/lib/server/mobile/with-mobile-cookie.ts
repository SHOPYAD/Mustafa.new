import { PB_AUTH_COOKIE, serializePbAuth } from "@/lib/pocketbase/auth";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export async function withMobileCookie(
  req: Request,
  handler: (req: Request) => Promise<Response>,
  opts?: { optional?: boolean }
): Promise<Response> {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) {
    if (opts?.optional) return handler(req);
    return auth;
  }

  const payload = serializePbAuth(auth.token, auth.customer);
  const headers = new Headers(req.headers);
  const existing = headers.get("cookie") || "";
  const pair = `${PB_AUTH_COOKIE}=${encodeURIComponent(payload)}`;
  headers.set("cookie", existing ? `${existing}; ${pair}` : pair);

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }
  return handler(new Request(req.url, init));
}
