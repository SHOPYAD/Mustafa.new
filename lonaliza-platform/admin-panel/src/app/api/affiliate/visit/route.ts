import { NextResponse } from "next/server";
import { clientIp, readRequestCookie } from "@/lib/http/cookies";
import {
  AFFILIATE_REF_COOKIE,
  isAffiliateService,
  logAffiliateVisit,
  serviceFromPath,
} from "@/lib/affiliate/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const cookieCode = readRequestCookie(req, AFFILIATE_REF_COOKIE) || "";
  const code = String(body.code || cookieCode || "").trim();
  const path = String(body.path || "/").slice(0, 300);
  if (!code || !path) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  const serviceRaw = String(body.service || "");
  const service = isAffiliateService(serviceRaw)
    ? serviceRaw
    : serviceFromPath(path);
  const visit = await logAffiliateVisit({
    code,
    path,
    service,
    ip: clientIp(req),
    ua: req.headers.get("user-agent") || "",
  });
  return NextResponse.json({ ok: true, logged: Boolean(visit) });
}
