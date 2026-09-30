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

type Audience = "customer" | "staff" | "agent";

function audienceOf(req: Request, ua: string, ip: string): Audience {
  if (readRequestCookie(req, "liotrip_admin_auth") || readRequestCookie(req, "oktravel_admin_auth")) return "staff";
  if (/playwright|puppeteer|headless|node-fetch|undici|python-requests|curl\/|wget\/|axios/i.test(ua)) return "agent";
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) return "agent";
  return "customer";
}

function deviceOf(ua: string): "phone" | "tablet" | "computer" {
  if (/iPad|Tablet|SM-T/i.test(ua)) return "tablet";
  if (/Mobile|iPhone|Android/i.test(ua)) return "phone";
  return "computer";
}

function browserOf(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "";
}

const DEVICE_AR = { phone: "هاتف", tablet: "جهاز لوحي", computer: "كمبيوتر" } as const;
const AUDIENCE_TITLE: Record<Audience, string> = {
  customer: "عميل خارجي زار الموقع",
  staff: "زيارة داخلية من لوحة الإدارة",
  agent: "زيارة آلية من وكيل أو أداة",
};

async function countryOf(req: Request, ip: string): Promise<string> {
  const header = (req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "").trim().toUpperCase();
  if (header && header !== "XX" && header !== "T1") return header;
  if (!ip || /^(127\.|10\.|192\.168\.|172\.|::1)/.test(ip)) return "";
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,country_code`, { signal: AbortSignal.timeout(1200) });
    const data = (await res.json()) as { success?: boolean; country?: string; country_code?: string };
    if (!data.success) return "";
    return data.country || data.country_code || "";
  } catch {
    return "";
  }
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
  const ip = clientIp(req);
  const ipHash = hashIp(ip);
  const audience = audienceOf(req, ua, ip);
  const device = deviceOf(ua);
  const browser = browserOf(ua);
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
    const country = await countryOf(req, ip);
    const bits = [
      `الجهاز: ${DEVICE_AR[device]}`,
      country ? `الدولة: ${country}` : "",
      browser ? `المتصفح: ${browser}` : "",
      `الصفحة: ${path}`,
    ].filter(Boolean);
    await createAdminNotification({
      type: "visit",
      title_ar: AUDIENCE_TITLE[audience],
      body_ar: bits.join(" · "),
      href: "",
      meta: {
        path,
        ip_hash: ipHash,
        session_id: sid,
        ua: ua.slice(0, 240),
        audience,
        device,
        browser,
        country,
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
