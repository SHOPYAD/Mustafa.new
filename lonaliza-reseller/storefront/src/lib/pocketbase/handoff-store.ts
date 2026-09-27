import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import {
  PB_SUPERUSER_COOKIE,
  PB_SUPERUSER_STORAGE_KEY,
  POCKETBASE_PUBLIC_URL,
  pocketbasePublicHref,
} from "@/lib/pocketbase/constants";

const DIR = "/tmp/alrayyan-pb-handoff";
const TTL_MS = 90_000;

export type HandoffRecord = Record<string, unknown>;

type Payload = {
  token: string;
  record: HandoffRecord | null;
  exp: number;
};

function isHandoffId(id: string): boolean {
  return /^[a-f0-9]{48}$/.test(id);
}

function assertPublicHref(url: string): string {
  if (
    !url.startsWith(`${POCKETBASE_PUBLIC_URL}/`) &&
    url !== POCKETBASE_PUBLIC_URL
  ) {
    return pocketbasePublicHref("/_/");
  }
  return url;
}

export function publicHandoffUrl(nonce: string): string {
  return assertPublicHref(
    `${POCKETBASE_PUBLIC_URL}/admin-handoff?t=${encodeURIComponent(nonce)}`
  );
}

export function publicAdminUiUrl(hash = "/"): string {
  const path = hash.startsWith("#") ? hash : `#${hash}`;
  return `${POCKETBASE_PUBLIC_URL}/_/${path}`;
}

export async function createHandoff(
  token: string,
  record: HandoffRecord | null
): Promise<string> {
  const id = randomBytes(24).toString("hex");
  await fs.mkdir(DIR, { recursive: true, mode: 0o700 });
  const payload: Payload = { token, record, exp: Date.now() + TTL_MS };
  await fs.writeFile(path.join(DIR, id), JSON.stringify(payload), {
    mode: 0o600,
  });
  return id;
}

export async function consumeHandoff(
  id: string
): Promise<{ token: string; record: HandoffRecord | null } | null> {
  if (!isHandoffId(id)) return null;
  const file = path.join(DIR, id);
  try {
    const raw = await fs.readFile(file, "utf8");
    await fs.unlink(file).catch(() => undefined);
    const data = JSON.parse(raw) as Payload;
    if (!data.token || Date.now() > data.exp) return null;
    return { token: data.token, record: data.record || null };
  } catch {
    return null;
  }
}

export function superuserCookieHeader(
  token: string,
  record: HandoffRecord | null,
  opts?: { domain?: string; secure?: boolean; maxAge?: number }
): string {
  const maxAge = opts?.maxAge ?? 60 * 60 * 24 * 7;
  const value = encodeURIComponent(
    JSON.stringify({ token, record, model: record })
  );
  const parts = [
    `${PB_SUPERUSER_COOKIE}=${value}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (opts?.secure !== false) parts.push("Secure");
  if (opts?.domain) parts.push(`Domain=${opts.domain}`);
  return parts.join("; ");
}

export function handoffHtmlPage(): string {
  const loginUrl = publicAdminUiUrl("/login");
  const dashboardUrl = publicAdminUiUrl("/");
  const storageKey = PB_SUPERUSER_STORAGE_KEY;
  const cookieName = PB_SUPERUSER_COOKIE;
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>PocketBase</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0;
      display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; }
    p { opacity: .75; }
  </style>
</head>
<body>
  <p>جاري فتح قاعدة البيانات…</p>
  <script>
  (function () {
    var loginUrl = ${JSON.stringify(loginUrl)};
    var dashboardUrl = ${JSON.stringify(dashboardUrl)};
    var storageKey = ${JSON.stringify(storageKey)};
    var cookieName = ${JSON.stringify(cookieName)};
    var params = new URLSearchParams(window.location.search);
    var t = params.get("t") || "";
    if (!/^[a-f0-9]{48}$/.test(t)) {
      window.location.replace(loginUrl);
      return;
    }
    fetch("/admin-handoff?t=" + encodeURIComponent(t) + "&format=json", {
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" }
    }).then(function (res) { return res.json(); }).then(function (data) {
      if (!data || !data.token) throw new Error("missing");
      var payload = JSON.stringify({
        token: data.token,
        record: data.record || null,
        model: data.record || null
      });
      try { localStorage.setItem(storageKey, payload); } catch (e) {}
      try { localStorage.setItem(cookieName, payload); } catch (e) {}
      document.cookie = cookieName + "=" + encodeURIComponent(payload)
        + "; Path=/; Secure; SameSite=Lax; Max-Age=604800";
      window.location.replace(dashboardUrl);
    }).catch(function () {
      window.location.replace(loginUrl);
    });
  })();
  </script>
</body>
</html>`;
}
