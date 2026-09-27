import { getAdapterCredentials } from "../common/credentials";

export interface BiletbankContext {
  clientKey: string;
  username?: string;
  password?: string;
  agencyCode?: string;
  apiBaseUrl: string;
  mode: "sandbox" | "production";
}

export async function getBiletbankContext(): Promise<BiletbankContext> {
  const { fields, mode } = await getAdapterCredentials("biletbank");
  const clientKey = (fields.clientKey || fields.apiKey || "").trim();
  const username = (fields.username || "").trim();
  const password = (fields.password || "").trim();
  const agencyCode = (fields.agencyCode || "").trim();

  const defaultBase =
    mode === "production"
      ? "https://api.biletbank.com"
      : "https://api-test.biletbank.com";

  const apiBaseUrl = (fields.endpoint?.trim() || defaultBase).replace(/\/+$/, "");

  return {
    clientKey,
    username,
    password,
    agencyCode,
    apiBaseUrl,
    mode,
  };
}

export async function biletbankRequest<T = any>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const ctx = await getBiletbankContext();
  const url = `${ctx.apiBaseUrl}/${path.replace(/^\/+/, "")}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(ctx.clientKey ? { "Client-key": ctx.clientKey } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      method: options.method || (options.body ? "POST" : "GET"),
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const raw = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(raw);
    } catch {
      json = null;
    }

    if (!res.ok) {
      const msg =
        json?.message ||
        json?.error?.message ||
        json?.error ||
        json?.Message ||
        raw.slice(0, 250);
      return {
        ok: false,
        status: res.status,
        data: json,
        error: `BiletBank ${path} HTTP ${res.status}: ${msg}`,
      };
    }

    return { ok: true, status: res.status, data: json as T };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: `BiletBank network error on ${path}: ${err?.message || String(err)}`,
    };
  }
}
