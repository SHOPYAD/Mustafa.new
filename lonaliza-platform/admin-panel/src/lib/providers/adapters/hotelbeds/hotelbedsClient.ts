import crypto from "crypto";
import { getAdapterCredentials } from "../common/credentials";

export interface HotelbedsContext {
  apiKey: string;
  apiSecret: string;
  apiBaseUrl: string;
  contentBaseUrl: string;
  mode: "sandbox" | "production";
}

export async function getHotelbedsContext(): Promise<HotelbedsContext> {
  const { fields, mode } = await getAdapterCredentials("hotelbeds");
  const apiKey = fields.apiKey?.trim() || "";
  const apiSecret = fields.apiSecret?.trim() || "";
  if (!apiKey || !apiSecret) {
    throw new Error("بيانات اعتماد Hotelbeds مفقودة (apiKey أو apiSecret)");
  }
  const defaultBase =
    mode === "production"
      ? "https://api.hotelbeds.com/hotel-api/1.0"
      : "https://api.test.hotelbeds.com/hotel-api/1.0";
  const contentDefaultBase =
    mode === "production"
      ? "https://api.hotelbeds.com/hotel-content-api/1.0"
      : "https://api.test.hotelbeds.com/hotel-content-api/1.0";
  const apiBaseUrl = (fields.endpoint?.trim() || defaultBase).replace(/\/+$/, "");
  const contentBaseUrl = contentDefaultBase;
  return { apiKey, apiSecret, apiBaseUrl, contentBaseUrl, mode };
}

export async function hotelbedsRequest<T = any>(
  path: string,
  options: { method?: "GET" | "POST" | "DELETE"; body?: unknown; timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const ctx = await getHotelbedsContext();
  const ts = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHash("sha256")
    .update(`${ctx.apiKey}${ctx.apiSecret}${ts}`)
    .digest("hex");

  const url = `${ctx.apiBaseUrl}/${path.replace(/^\/+/, "")}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Encoding": "gzip",
    "Api-key": ctx.apiKey,
    "X-Signature": signature,
  };

  if (options.body && options.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 20_000);
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(url, {
      method: options.method || (options.body ? "POST" : "GET"),
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    const raw = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(raw);
    } catch {
      json = null;
    }

    if (!res.ok) {
      const msg = json?.error?.message || json?.message || json?.error || raw.slice(0, 200);
      return {
        ok: false,
        status: res.status,
        data: json,
        error: `Hotelbeds ${path} HTTP ${res.status}: ${msg}`,
      };
    }

    // Hotelbeds can return HTTP 200 with an `error` envelope.
    if (json?.error?.code) {
      return { ok: false, status: res.status, data: json, error: `Hotelbeds ${path}: ${json.error.code} ${json.error.message || ""}`.trim() };
    }

    return { ok: true, status: res.status, data: json as T };
  } catch (err) {
    const aborted = (err as Error)?.name === "AbortError";
    return { ok: false, status: 0, data: null, error: aborted ? `Hotelbeds ${path} timeout` : `Hotelbeds ${path}: ${String(err)}` };
  } finally {
    clearTimeout(timer);
  }
}

export async function hotelbedsContentRequest<T = any>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; timeoutMs?: number } = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const ctx = await getHotelbedsContext();
  const ts = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHash("sha256")
    .update(`${ctx.apiKey}${ctx.apiSecret}${ts}`)
    .digest("hex");

  const url = `${ctx.contentBaseUrl}/${path.replace(/^\/+/, "")}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Api-key": ctx.apiKey,
    "X-Signature": signature,
  };

  if (options.body && options.method === "POST") {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const res = await fetch(url, {
      method: options.method || (options.body ? "POST" : "GET"),
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const raw = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(raw);
    } catch {
      json = null;
    }

    if (!res.ok) {
      const msg = json?.error?.message || json?.message || json?.error || raw.slice(0, 200);
      return {
        ok: false,
        status: res.status,
        data: json,
        error: `Hotelbeds Content ${path} HTTP ${res.status}: ${msg}`,
      };
    }

    return { ok: true, status: res.status, data: json as T };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

