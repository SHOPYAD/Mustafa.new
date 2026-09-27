/**
 * Sky Scrapper (apiheya) RapidAPI client.
 * Host/paths from Sky_Scrapper_Flight_Endpoints.md only.
 * Uses SKY_SCRAPPER_RAPIDAPI_KEY — never hotel RapidAPI keys.
 */

import {
  SKY_SCRAPPER_HOST,
  flightEndpointEnabled,
  type FlightsRuntimeSettings,
} from "@/lib/flights-config";
import { directFetch } from "@/lib/server/direct-network";
import { getServerEnvMap } from "@/lib/server/env-store";
import { recordRapidApiLiveCall } from "@/lib/server/rapidapi-quota-stats";

const HTTP_TIMEOUT_MS = 45_000;
const MAX_429_RETRIES = 2;

export type FlightProviderErrorCode =
  | "not_configured"
  | "invalid_key"
  | "quota"
  | "endpoint_disabled"
  | "search_failed"
  | "zero_results"
  | "provider_travelpayouts";

export type SkyScrapperOk = {
  ok: true;
  status: number;
  path: string;
  payload: unknown;
};

export type SkyScrapperErr = {
  ok: false;
  status: number;
  path: string;
  errorCode: FlightProviderErrorCode;
  body: string;
  retryAfterMs?: number;
};

export type SkyScrapperResult = SkyScrapperOk | SkyScrapperErr;

export type SkyScrapperQuery = Record<string, string | number | undefined | null>;

function redact(text: string): string {
  return String(text || "")
    .replace(/x-rapidapi-key["\s:=]+[^\s"]+/gi, "x-rapidapi-key:[redacted]")
    .replace(/rapidapi[_-]?key["\s:=]+[^\s"]+/gi, "[redacted]")
    .slice(0, 300);
}

export async function getSkyScrapperAuth(): Promise<{
  key: string;
  host: string;
}> {
  const map = await getServerEnvMap(["SKY_SCRAPPER_RAPIDAPI_KEY", "SKY_SCRAPPER_HOST"]);
  return {
    key: (map.SKY_SCRAPPER_RAPIDAPI_KEY || "").trim(),
    host: (map.SKY_SCRAPPER_HOST || "").trim() || SKY_SCRAPPER_HOST,
  };
}

function classifyFailure(status: number, body: string): FlightProviderErrorCode {
  if (status === 401 || status === 403) return "invalid_key";
  if (status === 429) return "quota";
  const lower = body.toLowerCase();
  if (/not subscribed|invalid.*key|forbidden|unauthorized/.test(lower)) {
    return "invalid_key";
  }
  if (/quota|rate limit|too many/.test(lower)) return "quota";
  return "search_failed";
}

function retryDelayMs(attempt: number, headers: Headers): number {
  const retryAfter = headers.get("retry-after");
  if (retryAfter && /^\d+$/.test(retryAfter.trim())) {
    return Math.min(15_000, Number(retryAfter.trim()) * 1000);
  }
  return Math.min(8_000, 500 * 2 ** attempt);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(host: string, apiPath: string, query: SkyScrapperQuery): string {
  const url = new URL(`https://${host}${apiPath}`);
  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export async function skyScrapperGet(
  runtime: FlightsRuntimeSettings,
  endpointId: string,
  apiPath: string,
  query: SkyScrapperQuery
): Promise<SkyScrapperResult> {
  if (!flightEndpointEnabled(runtime, endpointId) && !flightEndpointEnabled(runtime, apiPath)) {
    return {
      ok: false,
      status: 204,
      path: apiPath,
      errorCode: "endpoint_disabled",
      body: "endpoint-disabled",
    };
  }

  const auth = await getSkyScrapperAuth();
  if (!auth.key) {
    return {
      ok: false,
      status: 503,
      path: apiPath,
      errorCode: "not_configured",
      body: "sky-scrapper-key-missing",
    };
  }

  let last: SkyScrapperResult = {
    ok: false,
    status: 0,
    path: apiPath,
    errorCode: "search_failed",
    body: "network",
  };

  for (let attempt = 0; attempt <= MAX_429_RETRIES; attempt += 1) {
    last = await skyScrapperOnce(auth.host, auth.key, apiPath, query);
    if (last.ok) return last;
    if (last.errorCode !== "quota" || attempt === MAX_429_RETRIES) return last;
    const wait = last.retryAfterMs || retryDelayMs(attempt, new Headers());
    await sleep(wait);
  }

  return last;
}

async function skyScrapperOnce(
  host: string,
  key: string,
  apiPath: string,
  query: SkyScrapperQuery
): Promise<SkyScrapperResult> {
  const url = buildUrl(host, apiPath, query);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const res = await directFetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": host,
        "x-rapidapi-key": key,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await res.text();
    recordRapidApiLiveCall({
      provider: "sky_scrapper",
      path: apiPath,
      status: res.status,
      headers: res.headers,
      ok: res.ok,
    });
    if (!res.ok) {
      const errorCode = classifyFailure(res.status, text);
      return {
        ok: false,
        status: res.status,
        path: apiPath,
        errorCode,
        body: redact(text),
        retryAfterMs: errorCode === "quota" ? retryDelayMs(0, res.headers) : 0,
      };
    }
    try {
      return {
        ok: true,
        status: res.status,
        path: apiPath,
        payload: JSON.parse(text) as unknown,
      };
    } catch {
      return {
        ok: false,
        status: res.status,
        path: apiPath,
        errorCode: "search_failed",
        body: "invalid-json",
      };
    }
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      status: 0,
      path: apiPath,
      errorCode: "search_failed",
      body: aborted ? "timeout" : "network",
    };
  } finally {
    clearTimeout(timer);
  }
}
