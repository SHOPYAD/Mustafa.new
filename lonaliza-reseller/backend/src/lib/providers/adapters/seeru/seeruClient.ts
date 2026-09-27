import crypto from "crypto";
import { getAdapterCredentials } from "../common/credentials";
import { getServerEnv } from "@/lib/server/env-store";

export interface SeeruClientContext {
  token: string;
  baseUrl: string;
  mode: "sandbox" | "production";
  agencyCode?: string;
  timeoutMs: number;
}

/**
 * Resolves configuration for Seeru Hotels API v1.0.0
 */
export async function getSeeruHotelContext(): Promise<SeeruClientContext> {
  const { fields, mode } = await getAdapterCredentials("seeru_hotels");
  let token = (fields.apiKey || fields.jwtToken || "").trim();

  // Fallback to flight seeru credentials or env if not provided
  if (!token) {
    const flightCreds = await getAdapterCredentials("seeru");
    token = (flightCreds.fields.apiKey || flightCreds.fields.jwtToken || "").trim();
  }
  if (!token) {
    token = (await getServerEnv("SEERU_LIVE_JWT_TOKEN")) || (await getServerEnv("SEERU_JWT_TOKEN")) || "";
  }
  token = token.replace(/^bearer\s+/i, "").trim();

  const defaultHotelBase =
    mode === "production"
      ? "https://live-api.seeru.travel/v1/hotels"
      : "https://sandbox-api.seeru.travel/v1/hotels";
  const baseUrl = (fields.endpoint?.trim() || defaultHotelBase).replace(/\/+$/, "");

  return {
    token,
    baseUrl,
    mode,
    agencyCode: fields.agencyCode || undefined,
    timeoutMs: 35000,
  };
}

/**
 * Resolves configuration for Seeru Ride API v1.0.0
 */
export async function getSeeruRideContext(): Promise<SeeruClientContext> {
  const { fields, mode } = await getAdapterCredentials("seeru_transfers");
  let token = (fields.apiKey || fields.jwtToken || "").trim();

  // Fallback to flight seeru credentials or env if not provided
  if (!token) {
    const flightCreds = await getAdapterCredentials("seeru");
    token = (flightCreds.fields.apiKey || flightCreds.fields.jwtToken || "").trim();
  }
  if (!token) {
    token = (await getServerEnv("SEERU_LIVE_JWT_TOKEN")) || (await getServerEnv("SEERU_JWT_TOKEN")) || "";
  }
  token = token.replace(/^bearer\s+/i, "").trim();

  const defaultRideBase =
    mode === "production"
      ? "https://live-api.seeru.travel/v1/ride"
      : "https://sandbox-api.seeru.travel/v1/ride";
  const baseUrl = (fields.endpoint?.trim() || defaultRideBase).replace(/\/+$/, "");

  return {
    token,
    baseUrl,
    mode,
    agencyCode: fields.agencyCode || undefined,
    timeoutMs: 35000,
  };
}

/**
 * Performs a typed HTTP request to Seeru API with official headers
 */
export async function seeruRequest<T = any>(
  ctx: SeeruClientContext,
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    params?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const method = options.method || "GET";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${ctx.baseUrl}${cleanPath}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(options.params)) {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const requestId = crypto.randomUUID();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Client-Platform": "lonaliza-web-v1",
    "X-Request-Id": requestId,
    ...(options.headers || {}),
  };

  if (ctx.token) {
    headers["Authorization"] = `Bearer ${ctx.token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ctx.timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawText: text };
    }

    if (!res.ok) {
      const errMsg =
        data?.message ||
        data?.error ||
        data?.status_message ||
        `Seeru API error ${res.status}: ${res.statusText}`;
      const err = new Error(errMsg);
      (err as any).status = res.status;
      (err as any).response = { data, status: res.status };
      throw err;
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`انتهت مهلة استجابة خادم Seeru (${ctx.timeoutMs}ms) - Request ID: ${requestId}`);
    }
    throw err;
  }
}
