import { CONTENT_FETCH_UA } from "@/lib/automation/content/sources";

export async function fetchText(
  url: string,
  opts?: { timeoutMs?: number; headers?: Record<string, string> }
): Promise<{ ok: boolean; status: number; text: string }> {
  const timeoutMs = opts?.timeoutMs ?? 9000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": CONTENT_FETCH_UA,
        Accept: "application/rss+xml, application/xml, text/xml, application/json, text/html;q=0.5",
        ...(opts?.headers || {}),
      },
      cache: "no-store",
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  } finally {
    clearTimeout(timer);
  }
}

export function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripGoogleJsonPreamble(raw: string): string {
  return raw.replace(/^\)\]\}',?\s*/, "");
}
