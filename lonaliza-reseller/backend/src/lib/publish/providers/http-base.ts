import { z } from "zod";
import { NOT_APPROVED_AR, PROVIDER_LABEL_AR, PROVIDER_LABEL_EN } from "../constants";
import type {
  PublishContext,
  PublishProviderError,
  PublishProviderHandler,
  PublishProviderResult,
} from "../types";
import { classifyMediaUrl } from "@/lib/social/media";

export const HTTP_ADAPTER_IDS = [
  "telegram",
  "linkedin",
  "linkedin-page",
  "threads",
  "gmb",
  "pinterest",
  "reddit",
  "instagram-standalone",
  "tiktok-business",
  "dribbble",
  "discord",
  "slack",
  "kick",
  "twitch",
  "mastodon",
  "bluesky",
  "lemmy",
  "wrapcast",
  "nostr",
  "vk",
  "medium",
  "devto",
  "hashnode",
  "wordpress",
  "listmonk",
  "moltbook",
  "whop",
  "skool",
  "mewe",
  "tumblr",
] as const;

export type HttpAdapterId = (typeof HTTP_ADAPTER_IDS)[number];

export type ProviderIssue = {
  code: string;
  message: string;
  field?: string;
};

export type ValidatingPublishHandler = PublishProviderHandler & {
  maxLength: number;
  settingsSchema: z.ZodTypeAny;
  validate: (ctx: PublishContext) => ProviderIssue[];
};

export const MISSING_CREDENTIALS_AR =
  "لا توجد بيانات اعتماد محفوظة لهذه القناة. أعد ربط الحساب.";
export const NEEDS_REAUTH_AR = "الحساب يحتاج إعادة تحقق. أعد ربط المنصة.";

export function isVideoPath(url: string): boolean {
  const kind = classifyMediaUrl(url);
  if (kind === "video") return true;
  return /(?:^|[./?&=])mp4(?:$|[./?&=])/i.test(url) || /\.mp4(?:$|\?)/i.test(url);
}

export function isImagePath(url: string): boolean {
  if (isVideoPath(url)) return false;
  return classifyMediaUrl(url) === "image";
}

export function providerSettings(ctx: PublishContext): Record<string, unknown> {
  const raw = ctx.post.settings || {};
  const perRaw = raw.perChannel;
  let nested: Record<string, unknown> = {};
  if (perRaw && typeof perRaw === "object" && !Array.isArray(perRaw)) {
    const row = (perRaw as Record<string, unknown>)[ctx.channel.id];
    if (row && typeof row === "object" && !Array.isArray(row)) {
      nested = row as Record<string, unknown>;
    }
  }
  return { ...raw, ...nested };
}

export function extraRecord(ctx: PublishContext): Record<string, unknown> {
  return (ctx.channel.extra || {}) as Record<string, unknown>;
}

export function stringField(...candidates: unknown[]): string {
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function numberField(...candidates: unknown[]): number | undefined {
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

export function extraString(ctx: PublishContext, ...keys: string[]): string {
  const extra = extraRecord(ctx);
  const settings = providerSettings(ctx);
  for (const key of keys) {
    const found = stringField(extra[key], settings[key]);
    if (found) return found;
  }
  return "";
}

export function firstCommentOf(settings: Record<string, unknown>): string {
  const value = settings.firstComment;
  return typeof value === "string" ? value.trim() : "";
}

export function slugifyName(input: string, fallback = "post"): string {
  const slug = input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

export function filenameOf(url: string, fallback = "file"): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").filter(Boolean).pop() || fallback);
  } catch {
    return url.split("/").pop()?.split("?")[0] || fallback;
  }
}

export function mimeFromUrl(url: string, fallback = "application/octet-stream"): string {
  const name = filenameOf(url).toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".pdf")) return "application/pdf";
  return fallback;
}

export function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(raw) as unknown;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function decodeJsonToken(token: string): Record<string, unknown> | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  const direct = parseJsonObject(trimmed);
  if (direct) return direct;
  try {
    return parseJsonObject(Buffer.from(trimmed, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

export function asBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

export function pollDelayMs(): number {
  return process.env.VITEST ? 0 : 2_200;
}

export async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function envValue(...keys: string[]): Promise<string> {
  for (const key of keys) {
    const fromProcess = (process.env[key] || "").trim();
    if (fromProcess) return fromProcess;
  }
  if (process.env.VITEST) return "";
  try {
    const { getServerEnv } = await import("@/lib/server/env-store");
    for (const key of keys) {
      const value = (await getServerEnv(key)).trim();
      if (value) return value;
    }
  } catch {
    /* tests or missing overlay */
  }
  return "";
}

export class ProviderHttpError extends Error {
  readonly status: number;
  readonly retryable: boolean;
  readonly code: "needs_reauth" | "publish_failed";
  readonly body: unknown;

  constructor(
    message: string,
    status: number,
    retryable: boolean,
    body?: unknown,
    code?: "needs_reauth" | "publish_failed"
  ) {
    super(message);
    this.name = "ProviderHttpError";
    this.status = status;
    this.retryable = retryable;
    this.body = body;
    this.code =
      code ||
      (status === 401 || status === 403 ? "needs_reauth" : "publish_failed");
  }
}

function bodyText(body: unknown): string {
  if (!body) return "";
  if (typeof body === "string") return body;
  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (!body) return fallback;
  if (typeof body === "string" && body.trim()) return body.slice(0, 400);
  if (typeof body === "object") {
    const row = body as Record<string, unknown>;
    const err = row.error;
    if (typeof err === "string" && err.trim()) return err;
    if (err && typeof err === "object") {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
    if (typeof row.message === "string" && row.message.trim()) return row.message;
    if (typeof row.error_description === "string" && row.error_description.trim()) {
      return row.error_description;
    }
    if (typeof row.description === "string" && row.description.trim()) return row.description;
  }
  return fallback;
}

export function looksLikeAuthFailure(status: number, body: unknown): boolean {
  if (status === 401 || status === 403) return true;
  const text = bodyText(body).toLowerCase();
  return (
    text.includes("invalid_grant") ||
    text.includes("unauthenticated") ||
    text.includes("error validating access token") ||
    text.includes("invalid access token") ||
    text.includes("token expired") ||
    text.includes("revoked")
  );
}

export async function providerFetch(
  url: string,
  init: RequestInit = {},
  options?: { timeoutMs?: number }
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? 45_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ProviderHttpError("انتهت مهلة الطلب", 408, true);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function providerJson<T>(
  url: string,
  init: RequestInit = {},
  options?: { timeoutMs?: number; okStatuses?: number[] }
): Promise<{ status: number; data: T; headers: Headers }> {
  const res = await providerFetch(url, init, options);
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  const okStatuses = options?.okStatuses || [200, 201, 202, 204];
  if (!okStatuses.includes(res.status)) {
    const auth = looksLikeAuthFailure(res.status, data);
    throw new ProviderHttpError(
      messageFromBody(data, `HTTP ${res.status}`),
      res.status,
      res.status === 429 || res.status >= 500,
      data,
      auth ? "needs_reauth" : "publish_failed"
    );
  }
  return { status: res.status, data: data as T, headers: res.headers };
}

export async function downloadBuffer(
  url: string,
  options?: { timeoutMs?: number; maxBytes?: number }
): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await providerFetch(url, { method: "GET" }, { timeoutMs: options?.timeoutMs ?? 90_000 });
  if (!res.ok) {
    throw new ProviderHttpError(`تعذر تنزيل الوسائط (${res.status})`, res.status, res.status >= 500);
  }
  const maxBytes = options?.maxBytes ?? 80 * 1024 * 1024;
  const length = Number(res.headers.get("content-length") || 0);
  if (length > maxBytes) {
    throw new ProviderHttpError("حجم الملف أكبر من المسموح", 400, false);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > maxBytes) {
    throw new ProviderHttpError("حجم الملف أكبر من المسموح", 400, false);
  }
  const contentType = (res.headers.get("content-type") || "application/octet-stream").split(";")[0];
  return { buffer, contentType };
}

export function fail(
  provider: string,
  code: string,
  message: string,
  retryable = false
): PublishProviderResult {
  return { ok: false, provider, error: { code, message, retryable } };
}

export function okResult(
  provider: string,
  releaseId?: string,
  releaseURL?: string
): PublishProviderResult {
  return { ok: true, provider, releaseId, releaseURL };
}

export function mapProviderError(provider: string, err: unknown): PublishProviderResult {
  if (err instanceof ProviderHttpError) {
    return fail(
      provider,
      err.code,
      err.code === "needs_reauth" ? `${NEEDS_REAUTH_AR} (${err.message})` : err.message,
      err.retryable
    );
  }
  if (err instanceof Error && err.message.trim()) {
    return fail(provider, "publish_failed", err.message, true);
  }
  return fail(provider, "publish_failed", `فشل النشر على ${provider}`, true);
}

export function characterIssues(caption: string, maxLength: number): ProviderIssue[] {
  if (caption.length <= maxLength) return [];
  return [
    {
      code: "invalid_input",
      field: "content",
      message: `النص أطول من ${maxLength} حرفاً (${caption.length}).`,
    },
  ];
}

export function parseSettings<T>(
  schema: z.ZodType<T>,
  raw: Record<string, unknown>
): { value: T; issues: ProviderIssue[] } {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return { value: parsed.data, issues: [] };
  return {
    value: raw as T,
    issues: parsed.error.issues.map((issue) => ({
      code: "invalid_input",
      field: issue.path.join(".") || undefined,
      message: issue.message,
    })),
  };
}

type HttpHandlerOptions<TSettings> = {
  id: string;
  maxLength: number;
  settingsSchema: z.ZodType<TSettings>;
  extraValidate?: (ctx: PublishContext, settings: TSettings) => ProviderIssue[];
  credentials: (
    ctx: PublishContext
  ) => Promise<{ ok: true } | { ok: false; code: "missing_credentials" | "needs_reauth"; message: string }>;
  publishApproved: (ctx: PublishContext, settings: TSettings) => Promise<PublishProviderResult>;
  refresh?: PublishProviderHandler["refresh"];
};

export function createHttpHandler<TSettings>(
  options: HttpHandlerOptions<TSettings>
): ValidatingPublishHandler {
  const validate = (ctx: PublishContext): ProviderIssue[] => {
    const raw = providerSettings(ctx);
    const parsed = parseSettings(options.settingsSchema, raw);
    const issues = [
      ...characterIssues(ctx.caption || "", options.maxLength),
      ...parsed.issues,
      ...(options.extraValidate?.(ctx, parsed.value) || []),
    ];
    return issues;
  };

  const handler: ValidatingPublishHandler = {
    id: options.id,
    label: PROVIDER_LABEL_EN[options.id] || options.id,
    labelAr: PROVIDER_LABEL_AR[options.id] || options.id,
    implemented: true,
    maxLength: options.maxLength,
    settingsSchema: options.settingsSchema,
    validate,
    async publish(ctx: PublishContext): Promise<PublishProviderResult> {
      if (ctx.approved !== true) {
        return fail(options.id, "not_approved", NOT_APPROVED_AR);
      }
      const issues = validate(ctx);
      if (issues.length) {
        return fail(options.id, issues[0].code, issues[0].message);
      }
      if (ctx.channel.refreshNeeded) {
        return fail(options.id, "needs_reauth", NEEDS_REAUTH_AR);
      }
      const creds = await options.credentials(ctx);
      if (!creds.ok) {
        return fail(options.id, creds.code, creds.message);
      }
      try {
        const settings = parseSettings(options.settingsSchema, providerSettings(ctx)).value;
        return await options.publishApproved(ctx, settings);
      } catch (err) {
        return mapProviderError(options.id, err);
      }
    },
    refresh: options.refresh,
  };
  return handler;
}

export function missingToken(
  message = MISSING_CREDENTIALS_AR
): { ok: false; code: "missing_credentials"; message: string } {
  return { ok: false, code: "missing_credentials", message };
}

export function needsReauth(
  message = NEEDS_REAUTH_AR
): { ok: false; code: "needs_reauth"; message: string } {
  return { ok: false, code: "needs_reauth", message };
}

export function errorOf(result: PublishProviderResult): PublishProviderError | undefined {
  return result.error;
}
