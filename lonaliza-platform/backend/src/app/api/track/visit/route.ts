import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { clientIp, readRequestCookie } from "@/lib/http/cookies";
import {
  createAdminNotification,
  findRecentVisitNotifications,
} from "@/lib/admin-notifications/server";

export const runtime = "nodejs";

const VISIT_COOKIE = "alrayyan_vsid";
const THROTTLE_MS = 10 * 60 * 1000;

function hashIp(ip: string): string {
  if (!ip) return "";
  return createHash("sha256")
    .update(`alrayyan-visit:${ip}`)
    .digest("hex")
    .slice(0, 24);
}

function isBot(ua: string): boolean {
  return /bot|crawler|spider|preview|lighthouse|headless|slurp|bingpreview/i.test(
    ua
  );
}

function sanitizePath(raw: string): string {
  const path = raw.trim() || "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  if (path.startsWith("/admin") || path.startsWith("/api")) return "";
  return path.slice(0, 200);
}

function sidCookie(sid: string): string {
  return `${VISIT_COOKIE}=${sid}; Path=/; SameSite=Lax; Max-Age=86400; HttpOnly`;
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  if (isBot(ua)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const path = sanitizePath(String(body.path || "/"));
  if (!path) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const existingSid = readRequestCookie(req, VISIT_COOKIE) || "";
  const sid = existingSid || randomBytes(12).toString("hex");
  const ipHash = hashIp(clientIp(req));
  const since = Date.now() - THROTTLE_MS;

  const recent = await findRecentVisitNotifications();
  const throttled = recent.some((item) => {
    const meta = item.meta || {};
    const sameSession = String(meta.session_id || "") === sid;
    const createdAt = Date.parse(item.created);
    const sameIpPath =
      Boolean(ipHash) &&
      Number.isFinite(createdAt) &&
      createdAt >= since &&
      String(meta.ip_hash || "") === ipHash &&
      String(meta.path || "") === path;
    return sameSession || sameIpPath;
  });

  if (!throttled) {
    await createAdminNotification({
      type: "visit",
      body_ar: `زار ${path}`,
      href: "",
      meta: {
        path,
        ip_hash: ipHash,
        session_id: sid,
        ua: ua.slice(0, 240),
      },
    });
  }

  const res = NextResponse.json({
    ok: true,
    recorded: !throttled,
  });
  if (!existingSid) {
    res.headers.set("Set-Cookie", sidCookie(sid));
  }
  return res;
}
