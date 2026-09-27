/**
 * Same-origin Intui proxy. Nginx/Node TLS is challenged by Cloudflare;
 * curl HTTP/1.1 from this host is not. Used by /intui, /getoffers, /ajax.
 */
import { execFile } from "child_process";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const INTUI_ORIGIN = "https://en.intui.travel";
const FIND_ORIGIN = "https://find.intui.travel";
const SITE_ORIGIN = "https://lonaliza.com";
const CURL_BIN = "/usr/bin/curl";
const MAX_BODY = 8 * 1024 * 1024;

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

export type IntuiUpstream = "page" | "find";

function upstreamOrigin(kind: IntuiUpstream): string {
  return kind === "find" ? FIND_ORIGIN : INTUI_ORIGIN;
}

function rewriteSetCookie(raw: string): string {
  return raw
    .replace(/;\s*domain=\.?intui\.travel/gi, "; Domain=lonaliza.com")
    .replace(/;\s*domain=en\.intui\.travel/gi, "; Domain=lonaliza.com")
    .replace(/;\s*domain=www\.intui\.travel/gi, "; Domain=lonaliza.com")
    .replace(/;\s*domain=find\.intui\.travel/gi, "; Domain=lonaliza.com");
}

function hideIntuiHelp(html: string): string {
  if (!/id=["']kHelp["']/.test(html)) return html;
  if (html.includes("id=\"alrayyan-hide-khelp\"")) return html;
  return html.replace(
    /<\/head>/i,
    '<style id="alrayyan-hide-khelp">#kHelp,[id^="kayako"],.kayako-widget{display:none!important}</style></head>'
  );
}

function rewriteHtml(html: string): string {
  const rewritten = html
    .replace(/https:\/\/find\.intui\.travel/gi, `${SITE_ORIGIN}/intui-find`)
    .replace(/http:\/\/find\.intui\.travel/gi, `${SITE_ORIGIN}/intui-find`)
    .replace(/\/\/find\.intui\.travel/gi, `//lonaliza.com/intui-find`)
    .replace(/(["'`])find\.intui\.travel/gi, `$1lonaliza.com/intui-find`)
    .replace(/https?:\/\/(?:en|www)\.intui\.travel\/web\//gi, "/web/")
    .replace(/https?:\/\/(?:en|www)\.intui\.travel\/public\//gi, "/intui/public/")
    .replace(/https?:\/\/(?:en|www)\.intui\.travel\/content\//gi, "/content/")
    // Intui emits `src ="/public/..."` (space before =) on the loader gif.
    .replace(
      /(src|href|data-src|action)\s*=\s*(["'])\/(?!intui(?:-find)?\/)(web|public)\//gi,
      (_, attr: string, quote: string, folder: string) =>
        folder === "public" ? `${attr}=${quote}/intui/public/` : `${attr}=${quote}/web/`
    )
    .replace(/url\(\s*(['"]?)\/(?!intui\/)(web|public)\//gi, (_, quote: string, folder: string) =>
      folder === "public" ? `url(${quote}/intui/public/` : `url(${quote}/web/`
    )
    .replace(/<script[^>]+cdn-cgi\/challenge-platform[^>]*><\/script>/gi, "")
    .replace(
      /constructor=1&color_scheme=/g,
      "constructor=1&currency=USD&curr=USD&color_scheme="
    );
  return hideIntuiHelp(rewritten);
}

/** Next.js 308-strips /getoffers/{token}/; Intui only returns the car list at the slashed URL. */
function normalizeUpstreamPath(path: string): string {
  if (/^\/getoffers\/[^/]+$/.test(path)) return `${path}/`;
  return path;
}

function ensureUsdQuery(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (!params.get("currency") && !params.get("curr")) {
    params.set("currency", "USD");
    params.set("curr", "USD");
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function parseHeaderBlock(raw: string): { status: number; headers: Headers } {
  const blocks = raw.split(/\r?\n\r?\n/).filter((b) => /HTTP\/\d/i.test(b));
  const last = blocks[blocks.length - 1] || raw;
  const lines = last.split(/\r?\n/);
  const statusMatch = lines[0]?.match(/HTTP\/[\d.]+\s+(\d+)/);
  const status = statusMatch ? Number(statusMatch[1]) : 502;
  const headers = new Headers();
  for (const line of lines.slice(1)) {
    const idx = line.indexOf(":");
    if (idx < 1) continue;
    const name = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    const lower = name.toLowerCase();
    if (
      lower === "transfer-encoding" ||
      lower === "content-encoding" ||
      lower === "content-length" ||
      lower === "x-frame-options" ||
      lower === "content-security-policy" ||
      lower === "content-security-policy-report-only"
    ) {
      continue;
    }
    if (lower === "set-cookie") {
      headers.append("set-cookie", rewriteSetCookie(value));
      continue;
    }
    headers.append(name, value);
  }
  headers.set("cache-control", "private, no-store");
  return { status, headers };
}

export async function proxyIntuiRequest(
  request: Request,
  kind: IntuiUpstream,
  upstreamPath: string
): Promise<Response> {
  const incoming = new URL(request.url);
  const search =
    kind === "page" ? ensureUsdQuery(incoming.search) : incoming.search;
  const target = `${upstreamOrigin(kind)}${normalizeUpstreamPath(upstreamPath || "/")}${search}`;

  const id = randomBytes(8).toString("hex");
  const dir = join(tmpdir(), `intui-${id}`);
  await fs.mkdir(dir, { recursive: true });
  const headerFile = join(dir, "h");
  const bodyFile = join(dir, "b");
  const payloadFile = join(dir, "p");

  try {
    const args = [
      "-sS",
      "-L",
      "--http2",
      "--compressed",
      "--noproxy",
      "*",
      "--max-time",
      "45",
      "-D",
      headerFile,
      "-o",
      bodyFile,
      "-A",
      request.headers.get("user-agent") || BROWSER_UA,
      "-H",
      `Accept-Language: ${request.headers.get("accept-language") || "en-US,en;q=0.9"}`,
      "-H",
      `Accept: ${
        kind === "find"
          ? request.headers.get("accept") || "application/json, text/plain, */*"
          : request.headers.get("accept") || "text/html,application/xhtml+xml,*/*;q=0.8"
      }`,
    ];

    // find.intui.travel returns 403 (empty) unless Origin is an Intui host.
    // The widget POSTs JSON to /intui-find/api:find; without this header
    // suggestions fail silently after res.json() throws.
    // Do not attach Origin/Referer on page fetches — Cloudflare challenges
    // constructor URLs when those headers are present.
    if (kind === "find") {
      args.push("-H", `Origin: ${INTUI_ORIGIN}`);
      args.push("-H", `Referer: ${INTUI_ORIGIN}/`);
    }

    // Results page $.ajax({ type: "GET" }) re-GETs /getoffers/{token}/.
    // Intui returns the vehicle HTML fragment only when this header is set;
    // without it the same URL is the "Please wait, loading..." shell.
    const xhr = request.headers.get("x-requested-with");
    if (xhr) args.push("-H", `X-Requested-With: ${xhr}`);

    const cookie = request.headers.get("cookie");
    args.push(
      "-H",
      cookie ? `Cookie: mylang=2; def_curr=USD; ${cookie}` : "Cookie: mylang=2; def_curr=USD"
    );

    const method = request.method.toUpperCase();
    if (method !== "GET" && method !== "HEAD") {
      args.push("-X", method);
      const buf = Buffer.from(await request.arrayBuffer());
      if (buf.length > MAX_BODY) {
        return new Response("payload too large", { status: 413 });
      }
      if (buf.length) {
        await fs.writeFile(payloadFile, buf);
        args.push("--data-binary", `@${payloadFile}`);
      }
      const contentType = request.headers.get("content-type");
      if (contentType) args.push("-H", `Content-Type: ${contentType}`);
    }

    args.push(target);

    try {
      await execFileAsync(CURL_BIN, args, {
        maxBuffer: MAX_BODY,
        env: {
          ...process.env,
          HTTP_PROXY: "",
          HTTPS_PROXY: "",
          http_proxy: "",
          https_proxy: "",
          ALL_PROXY: "",
          all_proxy: "",
          SOCKS_PROXY: "",
          SOCKS5_PROXY: "",
          socks_proxy: "",
          socks5_proxy: "",
          NO_PROXY: "*",
          no_proxy: "*",
        },
      });
    } catch (error) {
      const err = error as { stderr?: string; code?: number | string; message?: string };
      console.error("intui curl", err.code, err.stderr || err.message, target);
    }

    const headerRaw = await fs.readFile(headerFile, "utf8").catch(() => "");
    const body = await fs.readFile(bodyFile).catch(() => Buffer.alloc(0));
    if (!headerRaw && !body.length) {
      return new Response("intui proxy failed", { status: 502 });
    }
    const parsed = parseHeaderBlock(headerRaw);
    const type = (parsed.headers.get("content-type") || "").toLowerCase();
    const isText =
      type.includes("text/html") ||
      type.includes("javascript") ||
      type.includes("json") ||
      type.includes("text/plain") ||
      type.includes("text/css");

    let out: Buffer = body;
    if (isText && body.length) {
      out = Buffer.from(rewriteHtml(body.toString("utf8")), "utf8");
    }
    parsed.headers.append(
      "set-cookie",
      "def_curr=USD; Path=/; Max-Age=84000; Secure; SameSite=Lax"
    );
    parsed.headers.append(
      "set-cookie",
      "mylang=2; Path=/; Max-Age=86400; Secure; SameSite=Lax"
    );
    parsed.headers.delete("content-length");
    return new Response(new Uint8Array(out), {
      status: parsed.status,
      headers: parsed.headers,
    });
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export function intuiUpstreamPath(segments: string[] | undefined, prefix: string): string {
  const safe = (segments || []).filter(
    (part) => part && !part.includes("..") && !part.includes("://")
  );
  const rest = safe.join("/");
  if (!prefix) return rest ? `/${rest}` : "/";
  return rest ? `${prefix}/${rest}` : `${prefix}/`;
}
