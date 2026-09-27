import { getAdapterCredentials } from "../common/credentials";

export interface RateHawkContext {
  keyId: string;
  apiKey: string;
  apiBaseUrl: string;
  mode: "sandbox" | "production";
}

export async function getRateHawkContext(): Promise<RateHawkContext> {
  const { fields, mode } = await getAdapterCredentials("ratehawk");
  const keyId = fields.keyId?.trim() || "";
  const apiKey = fields.apiKey?.trim() || "";
  if (!keyId || !apiKey) {
    throw new Error("بيانات اعتماد RateHawk مفقودة (keyId أو apiKey)");
  }
  const defaultBase = "https://api.worldota.net/api/b2b/v3";
  const apiBaseUrl = (fields.endpoint?.trim() || defaultBase).replace(/\/+$/, "");
  return { keyId, apiKey, apiBaseUrl, mode };
}

export async function ratehawkPostJson<T = any>(
  path: string,
  body: Record<string, unknown>,
  options: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<T> {
  const ctx = await getRateHawkContext();
  const url = `${ctx.apiBaseUrl}/${path.replace(/^\/+/, "")}`;
  const creds = Buffer.from(`${ctx.keyId}:${ctx.apiKey}`).toString("base64");

  // serp/region can take a while for big regions; booking finish/status are quick.
  const defaultTimeout = /serp\/region/.test(path) ? 45_000 : /prebook|booking/.test(path) ? 30_000 : 20_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || defaultTimeout);
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip",
      },
      body: JSON.stringify(body),
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
      const msg = json?.error || json?.message || raw.slice(0, 200);
      throw new Error(`RateHawk ${path} HTTP ${res.status}: ${msg}`);
    }

    return json as T;
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw new Error(`RateHawk ${path} timeout`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
