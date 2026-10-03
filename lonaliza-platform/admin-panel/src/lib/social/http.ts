import pRetry, { AbortError } from "p-retry";
import { rateLimit } from "@/lib/server/rate-limit";
import type { SocialPlatform } from "./types";

export class SocialHttpError extends Error {
  readonly status: number;
  readonly retryable: boolean;
  readonly body?: unknown;

  constructor(
    message: string,
    status: number,
    retryable: boolean,
    body?: unknown
  ) {
    super(message);
    this.name = "SocialHttpError";
    this.status = status;
    this.retryable = retryable;
    this.body = body;
  }
}

const PUBLISH_WINDOW_MS = 60_000;
const PUBLISH_LIMIT: Record<SocialPlatform, number> = {
  facebook: 8,
  instagram: 6,
  youtube: 4,
  tiktok: 4,
  x: 8,
};

export async function assertPublishRateLimit(platform: SocialPlatform): Promise<void> {
  const check = await rateLimit(
    `social-publish:${platform}`,
    PUBLISH_LIMIT[platform],
    PUBLISH_WINDOW_MS
  );
  if (!check.ok) {
    throw new SocialHttpError(
      `تم تجاوز حد النشر لمنصة ${platform}. أعد المحاولة بعد ${check.retryAfterSec} ث.`,
      429,
      true
    );
  }
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") {
    return typeof body === "string" && body.trim() ? body.slice(0, 280) : fallback;
  }
  const row = body as Record<string, unknown>;
  const err = row.error;
  if (err && typeof err === "object") {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof row.message === "string" && row.message.trim()) return row.message;
  if (typeof row.error_description === "string" && row.error_description.trim()) {
    return row.error_description;
  }
  return fallback;
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options?: { retries?: number; timeoutMs?: number }
): Promise<Response> {
  const retries = options?.retries ?? 4;
  const timeoutMs = options?.timeoutMs ?? 30_000;

  return pRetry(
    async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          ...init,
          signal: controller.signal,
        });
        if (isRetryableStatus(res.status)) {
          const body = await readBody(res);
          throw new SocialHttpError(
            errorMessage(body, `HTTP ${res.status}`),
            res.status,
            true,
            body
          );
        }
        return res;
      } catch (err) {
        if (err instanceof SocialHttpError) throw err;
        if (err instanceof Error && err.name === "AbortError") {
          throw new SocialHttpError("انتهت مهلة الطلب", 408, true);
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }
    },
    {
      retries,
      factor: 2,
      minTimeout: 400,
      maxTimeout: 8_000,
      randomize: true,
    }
  );
}

export async function fetchJsonWithRetry<T>(
  url: string,
  init: RequestInit = {},
  options?: { retries?: number; timeoutMs?: number }
): Promise<T> {
  const res = await fetchWithRetry(url, init, options);
  const body = await readBody(res);
  if (!res.ok) {
    const err = new SocialHttpError(
      errorMessage(body, `HTTP ${res.status}`),
      res.status,
      isRetryableStatus(res.status),
      body
    );
    if (!err.retryable) throw new AbortError(err);
    throw err;
  }
  return body as T;
}

export async function fetchFormJson<T>(
  url: string,
  fields: Record<string, string>,
  options?: { retries?: number; method?: "GET" | "POST" }
): Promise<T> {
  const method = options?.method ?? "POST";
  const encoded = new URLSearchParams(fields);
  if (method === "GET") {
    const joined = url.includes("?")
      ? `${url}&${encoded.toString()}`
      : `${url}?${encoded.toString()}`;
    return fetchJsonWithRetry<T>(joined, { method: "GET" }, options);
  }
  return fetchJsonWithRetry<T>(
    url,
    {
      method,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encoded.toString(),
    },
    options
  );
}
