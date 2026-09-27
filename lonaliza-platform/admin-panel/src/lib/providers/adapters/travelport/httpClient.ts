import { randomUUID } from "crypto";
import { getAdapterCredentials } from "../common/credentials";

export interface TravelportContext {
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
  targetBranch: string;
  accessGroup?: string;
  oauthUrl: string;
  apiBaseUrl: string;
  mode: "sandbox" | "production";
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getTravelportContext(
  providerId: "travelport_flights" | "travelport_hotels" = "travelport_flights"
): Promise<TravelportContext> {
  const { fields, mode } = await getAdapterCredentials(providerId);

  // Fallback to other travelport vertical if current vertical lacks credentials
  let effectiveFields = { ...fields };
  if (!effectiveFields.clientId && !effectiveFields.username) {
    const fallbackId =
      providerId === "travelport_flights" ? "travelport_hotels" : "travelport_flights";
    const fallback = await getAdapterCredentials(fallbackId);
    if (fallback.fields.clientId || fallback.fields.username) {
      effectiveFields = { ...fallback.fields, ...effectiveFields };
    }
  }

  const username = effectiveFields.username?.trim() || "";
  const password = effectiveFields.password?.trim() || "";
  const clientId = effectiveFields.clientId?.trim() || "";
  const clientSecret = effectiveFields.clientSecret?.trim() || "";
  const targetBranch = (effectiveFields.targetBranch || effectiveFields.pcc || "").trim();
  let accessGroup = (effectiveFields.accessGroup || "").trim();
  if (!accessGroup || accessGroup === targetBranch || accessGroup === "7K7L") {
    accessGroup = "50C1BCC1-615D-4F7F-AD66-919730C8FD0C";
  }

  // Modern Travelport OAuth endpoints
  // Sandbox: https://auth.pp.travelport.net/oauth/token
  // Production: https://auth.travelport.net/oauth/token
  const defaultOAuth =
    mode === "production"
      ? "https://auth.travelport.net/oauth/token"
      : "https://auth.pp.travelport.net/oauth/token";
  const oauthUrl = effectiveFields.oauthUrl?.trim() || defaultOAuth;

  // Modern Travelport API endpoints
  // Sandbox: https://api.pp.travelport.net
  // Production: https://api.travelport.net
  const defaultBase =
    mode === "production"
      ? "https://api.travelport.net"
      : "https://api.pp.travelport.net";
  const apiBaseUrl = (effectiveFields.endpoint?.trim() || defaultBase).replace(/\/+$/, "");

  return {
    username,
    password,
    clientId,
    clientSecret,
    targetBranch,
    accessGroup,
    oauthUrl,
    apiBaseUrl,
    mode,
  };
}

export async function obtainTravelportToken(
  ctx: TravelportContext,
  forceRefresh = false
): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }

  if (!ctx.clientId && !ctx.username) {
    throw new Error("بيانات اعتماد ترافلبورت غير مكتملة (Client ID أو Username مفقود)");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  let lastError: Error | null = null;

  // Flow 1: Modern Travelport Password Grant (verified with Liotrip credentials)
  if (ctx.username && ctx.password) {
    try {
      const body = new URLSearchParams();
      body.set("grant_type", "password");
      body.set("username", ctx.username);
      body.set("password", ctx.password);
      if (ctx.clientId) body.set("client_id", ctx.clientId);
      if (ctx.clientSecret) body.set("client_secret", ctx.clientSecret);
      body.set("scope", "openid");

      const res = await fetch(ctx.oauthUrl, {
        method: "POST",
        headers,
        body: body.toString(),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      if (res.ok && data?.access_token) {
        const expiresInSec = Number(data.expires_in || 1800);
        cachedToken = {
          token: String(data.access_token),
          expiresAt: now + expiresInSec * 1000,
        };
        return cachedToken.token;
      }

      const errDesc =
        data?.error_description || data?.message || data?.error || raw.slice(0, 200);
      lastError = new Error(`Travelport Password OAuth (${res.status}): ${errDesc}`);
    } catch (err: any) {
      lastError = err;
    }
  }

  // Flow 2: Standard Client Credentials Grant (fallback if username/password not accepted or empty)
  {
    const body = new URLSearchParams();
    body.set("grant_type", "client_credentials");
    if (ctx.clientId) body.set("client_id", ctx.clientId);
    if (ctx.clientSecret) body.set("client_secret", ctx.clientSecret);
    if (ctx.username) body.set("username", ctx.username);
    if (ctx.password) body.set("password", ctx.password);

    const credsHeaders = { ...headers };
    if (ctx.clientId && ctx.clientSecret) {
      const creds = Buffer.from(`${ctx.clientId}:${ctx.clientSecret}`).toString("base64");
      credsHeaders["Authorization"] = `Basic ${creds}`;
    }

    const res = await fetch(ctx.oauthUrl, {
      method: "POST",
      headers: credsHeaders,
      body: body.toString(),
    });

    const raw = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }

    if (res.ok && data?.access_token) {
      const expiresInSec = Number(data.expires_in || 1800);
      cachedToken = {
        token: String(data.access_token),
        expiresAt: now + expiresInSec * 1000,
      };
      return cachedToken.token;
    }

    const errDesc =
      data?.error_description || data?.message || data?.error || raw.slice(0, 200);
    throw new Error(
      lastError
        ? `${lastError.message} | Client Credentials (${res.status}): ${errDesc}`
        : `فشل مصادقة Travelport OAuth (${res.status}): ${errDesc}`
    );
  }
}

export async function travelportRequest<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    providerId?: "travelport_flights" | "travelport_hotels";
    traceId?: string;
    acceptVersion?: string | number;
    contentVersion?: string | number;
    timeoutMs?: number;
    signal?: AbortSignal;
    correlationId?: string;
  } = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const ctx = await getTravelportContext(options.providerId || "travelport_flights");
  const token = await obtainTravelportToken(ctx);
  const traceId = options.traceId || randomUUID();

  const url = `${ctx.apiBaseUrl}/${endpoint.replace(/^\/+/, "")}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Travelport-TraceId": traceId,
    TraceId: traceId,
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate",
  };
  if (options.correlationId) headers["TVP-Correlation-Id"] = options.correlationId;

  const accessGroup = ctx.accessGroup || ctx.targetBranch;
  if (accessGroup) {
    headers["XAUTH_TRAVELPORT_ACCESSGROUP"] = accessGroup;
  }
  if (ctx.targetBranch) {
    headers["TVP-PCC-Core"] = ctx.targetBranch;
  }

  if (options.acceptVersion) {
    headers["Accept-Version"] = String(options.acceptVersion);
  }
  if (options.contentVersion) {
    headers["Content-Version"] = String(options.contentVersion);
  }

  if (options.body && options.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 30_000);
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
    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg =
        data?.statusMessage ||
        data?.message ||
        data?.errors?.[0]?.message ||
        data?.ErrorResponse?.Result?.Error?.[0]?.Message ||
        raw.slice(0, 250);
      return {
        ok: false,
        status: res.status,
        data,
        error: `Travelport ${endpoint} HTTP ${res.status}: ${msg}`,
      };
    }

    return { ok: true, status: res.status, data: data as T };
  } catch (err) {
    const aborted = (err as Error)?.name === "AbortError";
    return { ok: false, status: 0, data: null, error: aborted ? `Travelport ${endpoint} timeout` : `Travelport ${endpoint}: ${String(err)}` };
  } finally {
    clearTimeout(timer);
  }
}
