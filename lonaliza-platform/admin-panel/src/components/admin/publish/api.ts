import type {
  PublishChannel,
  PublishCreationMethod,
  PublishMediaItem,
  PublishPlug,
  PublishPlugCatalog,
  PublishPlugField,
  PublishPost,
  PublishSet,
  PublishAnalyticsOverview,
  PublishChannelAnalytics,
  PublishPostAnalytics,
  PublishRssFeed,
  PublishSettingsPayload,
  PublishSignature,
  PublishState,
  PublishVideoOption,
  PublishWebhook,
} from "./types";

export type SafeResult<T> = {
  ok: boolean;
  status: number;
  missing: boolean;
  data: T | null;
  error?: string;
};

const POSTS_URL = "/api/admin/publish/posts";
const CHANNELS_URL = "/api/admin/publish/channels";
const MEDIA_URL = "/api/admin/publish/media";
const SETTINGS_URL = "/api/admin/publish/settings";
const AGENT_URL = "/api/admin/publish/agent";
const SIGNATURES_URL = "/api/admin/publish/signatures";
const SETS_URL = "/api/admin/publish/sets";
const PLUGS_URL = "/api/admin/publish/plugs";
const RSS_URL = "/api/admin/publish/rss";
const WEBHOOKS_URL = "/api/admin/publish/webhooks";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

function pickArray(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  const rec = asRecord(payload);
  if (!rec) return [];
  for (const key of keys) {
    const value = rec[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function isState(value: string): value is PublishState {
  return value === "draft" || value === "queue" || value === "published" || value === "error";
}

function isMethod(value: string): value is PublishCreationMethod {
  return value === "web" || value === "mcp" || value === "api" || value === "autopost" || value === "agent";
}

export function normalizePost(raw: unknown): PublishPost | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = asString(rec.id);
  if (!id) return null;
  const stateRaw = asString(rec.state, "draft");
  const methodRaw = asString(rec.creationMethod || rec.creation_method, "web");
  const settingsRaw = rec.settings;
  return {
    id,
    state: isState(stateRaw) ? stateRaw : "draft",
    publishDate: asString(rec.publishDate || rec.publish_date || rec.publishAt, new Date().toISOString()),
    channelId: asString(rec.channelId || rec.channel_id || rec.channel || rec.integrationId),
    content: asString(rec.content || rec.caption || rec.text || rec.message),
    delay: asNumber(rec.delay, 0),
    group: asString(rec.group || rec.groupId || rec.group_id),
    title: asString(rec.title) || undefined,
    settings: asRecord(settingsRaw) ?? {},
    releaseId: asString(rec.releaseId || rec.release_id) || undefined,
    releaseURL: asString(rec.releaseURL || rec.releaseUrl || rec.release_url) || undefined,
    intervalInDays: rec.intervalInDays == null && rec.interval_in_days == null
      ? undefined
      : asNumber(rec.intervalInDays ?? rec.interval_in_days),
    error: asString(rec.error || rec.lastError) || undefined,
    parentPostId: asString(rec.parentPostId || rec.parent_post_id) || undefined,
    creationMethod: isMethod(methodRaw) ? methodRaw : "web",
  };
}

export function normalizeChannel(raw: unknown): PublishChannel | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = asString(rec.id);
  const provider = asString(rec.provider || rec.identifier || rec.platform);
  if (!id && !provider) return null;
  const postingRaw = rec.postingTimes ?? rec.posting_times;
  const postingTimes = Array.isArray(postingRaw)
    ? postingRaw
        .map((row) => {
          const item = asRecord(row);
          const time = asNumber(item?.time ?? row, NaN);
          return Number.isFinite(time) ? { time } : null;
        })
        .filter((row): row is { time: number } => Boolean(row))
    : undefined;
  return {
    id: id || provider,
    provider: provider || id,
    name: asString(rec.name || rec.displayName || rec.display_name, provider || id),
    picture: asString(rec.picture || rec.image || rec.avatar) || undefined,
    disabled: asBool(rec.disabled),
    refreshNeeded: asBool(rec.refreshNeeded || rec.refresh_needed),
    groupId: asString(rec.groupId || rec.group_id) || undefined,
    postingTimes,
  };
}

export function normalizeMedia(raw: unknown): PublishMediaItem | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = asString(rec.id);
  const url = asString(rec.url || rec.path || rec.src || rec.file);
  if (!id && !url) return null;
  return {
    id: id || url,
    name: asString(rec.name || rec.filename || rec.title, "وسيط"),
    url: url || undefined,
    thumbnail: asString(rec.thumbnail || rec.thumb || rec.preview || url) || undefined,
    type: asString(rec.type || rec.kind) || undefined,
    mime: asString(rec.mime || rec.mimeType) || undefined,
    size: rec.size == null ? undefined : asNumber(rec.size),
    alt: asString(rec.alt) || undefined,
    createdAt: asString(rec.createdAt || rec.created_at || rec.timestamp) || undefined,
  };
}

export function normalizeSignature(raw: unknown): PublishSignature | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = asString(rec.id);
  if (!id) return null;
  return {
    id,
    name: asString(rec.name, "توقيع"),
    content: asString(rec.content || rec.text),
    autoAdd: asBool(rec.autoAdd || rec.auto_add),
  };
}

export function normalizeSet(raw: unknown): PublishSet | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = asString(rec.id);
  if (!id) return null;
  const idsRaw = rec.channelIds ?? rec.channel_ids ?? rec.channels;
  const channelIds = Array.isArray(idsRaw) ? idsRaw.map((row) => asString(row)).filter(Boolean) : [];
  return { id, name: asString(rec.name, "مجموعة"), channelIds };
}

async function safeFetch<T>(url: string, init?: RequestInit): Promise<SafeResult<T>> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
      ...init,
    });
    if (res.status === 404) {
      return { ok: false, status: 404, missing: true, data: null };
    }
    const json = (await res.json().catch(() => null)) as T | { error?: string; message?: string; ok?: boolean } | null;
    const rec = asRecord(json);
    const payloadFailed = rec?.ok === false;
    if (!res.ok || payloadFailed) {
      return {
        ok: false,
        status: res.ok && payloadFailed ? 400 : res.status,
        missing: false,
        data: null,
        error: asString(rec?.error || rec?.message, `تعذّر الطلب (${res.status})`),
      };
    }
    return { ok: true, status: res.status, missing: false, data: json as T };
  } catch {
    return { ok: false, status: 0, missing: false, data: null, error: "تعذّر الاتصال بمحرك النشر" };
  }
}

export async function fetchPublishPosts(params?: {
  from?: string;
  to?: string;
  channel?: string;
  state?: string;
}): Promise<SafeResult<PublishPost[]>> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.channel) {
    search.set("channelId", params.channel);
    search.set("channel", params.channel);
  }
  if (params?.state) search.set("state", params.state);
  const qs = search.toString();
  const result = await safeFetch<unknown>(`${POSTS_URL}${qs ? `?${qs}` : ""}`);
  if (!result.ok) return { ...result, data: null };
  const posts = pickArray(result.data, ["posts", "items", "data", "records"])
    .map(normalizePost)
    .filter((row): row is PublishPost => Boolean(row));
  return { ...result, data: posts };
}

export async function fetchPublishChannels(): Promise<SafeResult<PublishChannel[]>> {
  const result = await safeFetch<unknown>(CHANNELS_URL);
  if (!result.ok) return { ...result, data: null };
  const channels = pickArray(result.data, ["channels", "integrations", "items", "data", "records"])
    .map(normalizeChannel)
    .filter((row): row is PublishChannel => Boolean(row));
  return { ...result, data: channels };
}

export async function fetchPublishMedia(): Promise<SafeResult<PublishMediaItem[]>> {
  const result = await safeFetch<unknown>(MEDIA_URL);
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  const media = pickArray(result.data, ["media", "items", "files", "data", "records"])
    .map(normalizeMedia)
    .filter((row): row is PublishMediaItem => Boolean(row));
  return {
    ...result,
    missing: asBool(rec?.stub) && media.length === 0,
    data: media,
  };
}

export async function fetchPublishSettings(): Promise<SafeResult<PublishSettingsPayload>> {
  const result = await safeFetch<unknown>(SETTINGS_URL);
  if (result.ok) {
    const rec = asRecord(result.data) ?? {};
    const nested = asRecord(rec.settings) ?? rec;
    const stub = asBool(nested.stub ?? rec.stub);
    return {
      ...result,
      missing: stub,
      data: {
        signatures: pickArray(nested.signatures ?? rec.signatures, []).map(normalizeSignature).filter((row): row is PublishSignature => Boolean(row)),
        sets: pickArray(nested.sets ?? rec.sets, []).map(normalizeSet).filter((row): row is PublishSet => Boolean(row)),
        apiKeyMasked: asString(nested.apiKeyMasked || nested.api_key_masked || rec.apiKeyMasked) || undefined,
        hasApiKey: asBool(nested.hasApiKey ?? rec.hasApiKey),
      },
    };
  }
  if (!result.missing) return { ...result, data: null };

  const [signaturesRes, setsRes] = await Promise.all([
    safeFetch<unknown>(SIGNATURES_URL),
    safeFetch<unknown>(SETS_URL),
  ]);
  if (signaturesRes.missing && setsRes.missing) {
    return { ...result, data: null };
  }
  const sigStub = asBool(asRecord(signaturesRes.data)?.stub);
  const setStub = asBool(asRecord(setsRes.data)?.stub);
  return {
    ok: signaturesRes.ok || setsRes.ok,
    status: signaturesRes.ok ? signaturesRes.status : setsRes.status,
    missing: (signaturesRes.missing || sigStub) && (setsRes.missing || setStub),
    data: {
      signatures: pickArray(signaturesRes.data, ["signatures", "items", "data"]).map(normalizeSignature).filter((row): row is PublishSignature => Boolean(row)),
      sets: pickArray(setsRes.data, ["sets", "items", "data"]).map(normalizeSet).filter((row): row is PublishSet => Boolean(row)),
    },
    error: signaturesRes.error || setsRes.error,
  };
}

export async function createPublishPost(body: Record<string, unknown>): Promise<SafeResult<PublishPost>> {
  const result = await safeFetch<unknown>(POSTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  const post = normalizePost(rec?.post ?? rec?.item ?? result.data);
  return { ...result, data: post };
}

export async function createPublishPostsForChannels(
  channelIds: string[],
  body: Omit<Record<string, unknown>, "channelId">
): Promise<SafeResult<{ created: number }>> {
  let created = 0;
  let missing = false;
  let lastError = "";
  let lastStatus = 0;
  for (const channelId of channelIds) {
    const result = await createPublishPost({ ...body, channelId });
    lastStatus = result.status;
    if (result.missing) {
      missing = true;
      lastError = result.error || lastError;
      break;
    }
    if (!result.ok) {
      lastError = result.error || lastError;
      continue;
    }
    created += 1;
  }
  if (missing) {
    return { ok: false, status: 404, missing: true, data: null, error: lastError };
  }
  if (created === 0) {
    return {
      ok: false,
      status: lastStatus || 400,
      missing: false,
      data: null,
      error: lastError || "تعذّر إنشاء المنشورات",
    };
  }
  return { ok: true, status: 200, missing: false, data: { created } };
}

export async function changePublishPostStatus(
  id: string,
  body: { state: "draft" | "queue"; publishDate?: string; approved?: boolean }
): Promise<SafeResult<PublishPost>> {
  const result = await safeFetch<unknown>(`${POSTS_URL}/${encodeURIComponent(id)}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: normalizePost(rec?.post ?? result.data) };
}

export async function deletePublishPost(id: string): Promise<SafeResult<{ deleted: boolean }>> {
  const result = await safeFetch<unknown>(`${POSTS_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!result.ok) return { ...result, data: null };
  return { ...result, data: { deleted: true } };
}

export async function duplicatePublishPost(post: PublishPost): Promise<SafeResult<PublishPost>> {
  return createPublishPost({
    channelId: post.channelId,
    content: post.content,
    title: post.title,
    publishDate: post.publishDate,
    state: "draft",
    delay: post.delay,
    group: post.group,
    settings: { ...(post.settings || {}), duplicatedFrom: post.id, approved: false },
    intervalInDays: post.intervalInDays,
    creationMethod: "web",
    mediaUrls: Array.isArray(post.settings?.mediaUrls)
      ? (post.settings.mediaUrls as unknown[]).filter((row): row is string => typeof row === "string")
      : [],
    approved: false,
  });
}

export async function requestPublishApproval(input: {
  postIds: string[];
  summary: string;
}): Promise<SafeResult<{ notified?: boolean }>> {
  return safeFetch("/api/admin/publish/request-approval", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function uploadPublishFromUrl(url: string): Promise<SafeResult<{ url?: string }>> {
  return safeFetch("/api/admin/publish/upload-from-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export async function generatePublishApiKey(): Promise<
  SafeResult<{ apiKey?: string; apiKeyMasked?: string; hasApiKey?: boolean }>
> {
  const result = await safeFetch<unknown>(SETTINGS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ generateApiKey: true }),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data) ?? {};
  const apiKey = asString(rec.apiKey || rec.api_key).trim();
  const apiKeyMasked = asString(rec.apiKeyMasked || rec.api_key_masked).trim();
  return {
    ...result,
    data: {
      apiKey: apiKey || undefined,
      apiKeyMasked: apiKeyMasked || undefined,
      hasApiKey: asBool(rec.hasApiKey ?? rec.has_api_key) || Boolean(apiKey || apiKeyMasked),
    },
  };
}

export async function createPublishSignature(body: {
  content: string;
  autoAdd?: boolean;
  name?: string;
}): Promise<SafeResult<PublishSignature>> {
  const result = await safeFetch<unknown>(SIGNATURES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: body.content,
      autoAdd: Boolean(body.autoAdd),
      ...(body.name?.trim() ? { name: body.name.trim() } : {}),
    }),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  const signature = normalizeSignature(rec?.signature ?? rec?.item ?? result.data);
  return { ...result, data: signature };
}

export async function deletePublishSignature(id: string): Promise<SafeResult<{ deleted: boolean }>> {
  const result = await safeFetch<unknown>(`${SIGNATURES_URL}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: { deleted: rec ? asBool(rec.deleted ?? rec.ok) : true } };
}

export async function createPublishSet(body: {
  name: string;
  channelIds: string[];
}): Promise<SafeResult<PublishSet>> {
  const result = await safeFetch<unknown>(SETS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: body.name,
      channelIds: body.channelIds,
    }),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  const set = normalizeSet(rec?.set ?? rec?.item ?? result.data);
  return { ...result, data: set };
}

export async function deletePublishSet(id: string): Promise<SafeResult<{ deleted: boolean }>> {
  const result = await safeFetch<unknown>(`${SETS_URL}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: { deleted: rec ? asBool(rec.deleted ?? rec.ok) : true } };
}

export async function sendPublishAgentMessage(message: string): Promise<SafeResult<{ reply?: string }>> {
  return safeFetch<{ reply?: string; text?: string; message?: string }>(AGENT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, creationMethod: "agent" }),
  });
}

export function extractAgentReply(payload: unknown): string {
  const rec = asRecord(payload);
  if (!rec) return "";
  return asString(rec.reply || rec.text || rec.message || rec.content);
}

const ANALYTICS_URL = "/api/admin/publish/analytics";

export async function fetchPublishAnalyticsOverview(
  days?: number
): Promise<SafeResult<PublishAnalyticsOverview>> {
  const qs = days ? `?date=${encodeURIComponent(String(days))}` : "";
  const result = await safeFetch<unknown>(`${ANALYTICS_URL}${qs}`);
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data) ?? {};
  const catalog = pickArray(rec.catalog, []).map((row) => {
    const item = asRecord(row) ?? {};
    return {
      id: asString(item.id),
      nameAr: asString(item.nameAr, asString(item.id)),
      windows: Array.isArray(item.windows) ? item.windows.map((n) => asNumber(n)).filter(Boolean) : [7, 30, 90],
      live: asBool(item.live),
    };
  });
  return {
    ...result,
    data: {
      date: asNumber(rec.date, 7),
      reconnectUrl: asString(rec.reconnectUrl, "/admin/social-accounts"),
      liveProviders: Array.isArray(rec.liveProviders) ? rec.liveProviders.map((row) => asString(row)).filter(Boolean) : [],
      placeholderProviders: Array.isArray(rec.placeholderProviders)
        ? rec.placeholderProviders.map((row) => asString(row)).filter(Boolean)
        : [],
      catalog,
      channels: pickArray(rec.channels, []).map(normalizeChannelAnalytics).filter((row): row is PublishChannelAnalytics => Boolean(row)),
    },
  };
}

function normalizeSeries(raw: unknown): PublishChannelAnalytics["series"][number] | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const label = asString(rec.label);
  if (!label) return null;
  const data = Array.isArray(rec.data)
    ? rec.data
        .map((point) => {
          const row = asRecord(point);
          if (!row) return null;
          return { total: asNumber(row.total), date: asString(row.date) };
        })
        .filter((row): row is { total: number; date: string } => Boolean(row))
    : [];
  return { label, labelAr: asString(rec.labelAr, label), average: asBool(rec.average), data };
}

function normalizeChannelAnalytics(raw: unknown): PublishChannelAnalytics | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const series = Array.isArray(rec.series)
    ? rec.series.map(normalizeSeries).filter((row): row is NonNullable<typeof row> => Boolean(row))
    : [];
  return {
    channelId: asString(rec.channelId || rec.id),
    provider: asString(rec.provider),
    name: asString(rec.name),
    status: asString(rec.status, "empty"),
    source: asString(rec.source, "none"),
    live: asBool(rec.live),
    reconnectUrl: asString(rec.reconnectUrl) || undefined,
    messageAr: asString(rec.messageAr),
    windows: Array.isArray(rec.windows) ? rec.windows.map((n) => asNumber(n)).filter(Boolean) : [7],
    range: rec.range && typeof rec.range === "object" ? { days: asNumber(asRecord(rec.range)?.days, 7) } : undefined,
    series,
  };
}

export async function fetchPublishChannelAnalytics(
  channelId: string,
  days?: number
): Promise<SafeResult<PublishChannelAnalytics>> {
  const qs = days ? `?date=${encodeURIComponent(String(days))}` : "";
  const result = await safeFetch<unknown>(`${ANALYTICS_URL}/${encodeURIComponent(channelId)}${qs}`);
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  const analytics = normalizeChannelAnalytics(rec?.analytics ?? rec);
  return { ...result, data: analytics };
}

export async function fetchPublishPostAnalytics(
  postId: string,
  days?: number
): Promise<SafeResult<PublishPostAnalytics>> {
  const qs = days ? `?date=${encodeURIComponent(String(days))}` : "";
  const result = await safeFetch<unknown>(`${ANALYTICS_URL}/post/${encodeURIComponent(postId)}${qs}`);
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(asRecord(result.data)?.analytics) ?? asRecord(result.data);
  if (!rec) return { ...result, data: null };
  const series = Array.isArray(rec.series)
    ? rec.series.map(normalizeSeries).filter((row): row is NonNullable<typeof row> => Boolean(row))
    : [];
  return {
    ...result,
    data: {
      postId: asString(rec.postId),
      channelId: asString(rec.channelId),
      provider: asString(rec.provider),
      releaseId: asString(rec.releaseId) || undefined,
      status: asString(rec.status, "empty"),
      live: asBool(rec.live),
      reconnectUrl: asString(rec.reconnectUrl) || undefined,
      messageAr: asString(rec.messageAr),
      series,
      missingReleaseId: asBool(rec.missingReleaseId),
    },
  };
}

export async function fetchPublishVideoOptions(): Promise<SafeResult<PublishVideoOption[]>> {
  const result = await safeFetch<unknown>("/api/admin/publish/video");
  if (!result.ok) return { ...result, data: null };
  const rows = pickArray(result.data, ["video", "options", "items"]).map((row) => {
    const rec = asRecord(row);
    if (!rec) return null;
    return {
      identifier: asString(rec.identifier),
      title: asString(rec.title),
      titleAr: asString(rec.titleAr, asString(rec.title)),
      description: asString(rec.description),
      available: asBool(rec.available),
      reasonAr: asString(rec.reasonAr) || undefined,
    };
  });
  return {
    ...result,
    data: rows.flatMap((row) => (row?.identifier ? [row] : [])),
  };
}

export async function generatePublishImage(body: {
  prompt: string;
  aspectRatio?: "9:16" | "4:5" | "1:1";
}): Promise<SafeResult<{ url?: string; media?: PublishMediaItem }>> {
  const result = await safeFetch<unknown>("/api/admin/publish/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data) ?? {};
  const media = normalizeMedia(rec.media ?? rec.item ?? rec);
  return { ...result, data: { url: media?.url, media: media || undefined } };
}

export async function generatePublishVideo(body: {
  prompt: string;
  identifier?: string;
  output?: "vertical" | "horizontal";
}): Promise<SafeResult<{ url?: string; media?: PublishMediaItem }>> {
  const result = await safeFetch<unknown>("/api/admin/publish/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data) ?? {};
  const media = normalizeMedia(rec.media ?? rec.item ?? rec);
  return { ...result, data: { url: media?.url, media: media || undefined } };
}

function normalizePlug(raw: unknown): PublishPlug | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = asString(rec.id);
  const channelId = asString(rec.channelId || rec.channel_id || rec.integrationId);
  const plugFunction = asString(rec.plugFunction || rec.func || rec.methodName);
  if (!id || !channelId || !plugFunction) return null;
  const dataRaw = rec.data ?? rec.fields;
  const data: PublishPlugField[] = Array.isArray(dataRaw)
    ? dataRaw
        .map((row) => {
          const item = asRecord(row);
          const name = asString(item?.name);
          return name ? { name, value: asString(item?.value) } : null;
        })
        .filter((row): row is PublishPlugField => Boolean(row))
    : [];
  return {
    id,
    channelId,
    plugFunction,
    data,
    activated: asBool(rec.activated),
  };
}

function normalizeRssFeed(raw: unknown): PublishRssFeed | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = asString(rec.id);
  if (!id) return null;
  const integrationsRaw = rec.integrations ?? rec.channelIds ?? rec.channels;
  const integrations = Array.isArray(integrationsRaw)
    ? integrationsRaw
        .map((row) => {
          if (typeof row === "string") return { id: row };
          const item = asRecord(row);
          const channelId = asString(item?.id || item?.channelId);
          return channelId ? { id: channelId } : null;
        })
        .filter((row): row is { id: string } => Boolean(row))
    : [];
  return {
    id,
    title: asString(rec.title),
    content: asString(rec.content),
    onSlot: asBool(rec.onSlot || rec.on_slot),
    syncLast: asBool(rec.syncLast || rec.sync_last),
    url: asString(rec.url),
    lastUrl: asString(rec.lastUrl || rec.last_url),
    active: asBool(rec.active),
    addPicture: asBool(rec.addPicture || rec.add_picture),
    generateContent: asBool(rec.generateContent || rec.generate_content),
    integrations,
  };
}

function normalizeWebhook(raw: unknown): PublishWebhook | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = asString(rec.id);
  if (!id) return null;
  const idsRaw = rec.channelIds ?? rec.channel_ids ?? rec.channels ?? rec.integrations;
  const channelIds = Array.isArray(idsRaw)
    ? idsRaw
        .map((row) => {
          if (typeof row === "string") return row;
          return asString(asRecord(row)?.id || asRecord(row)?.channelId);
        })
        .filter(Boolean)
    : [];
  return {
    id,
    name: asString(rec.name),
    url: asString(rec.url),
    channelIds,
  };
}

export async function fetchPublishPlugs(): Promise<
  SafeResult<{ plugs: PublishPlug[]; catalog: PublishPlugCatalog[] }>
> {
  const result = await safeFetch<unknown>(PLUGS_URL);
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data) ?? {};
  const plugs = pickArray(result.data, ["plugs", "items", "data"])
    .map(normalizePlug)
    .filter((row): row is PublishPlug => Boolean(row));
  const catalog = pickArray(rec.catalog, [])
    .map((row) => {
      const item = asRecord(row);
      if (!item) return null;
      const identifier = asString(item.identifier);
      if (!identifier) return null;
      return {
        identifier,
        name: asString(item.name, identifier),
        nameAr: asString(item.nameAr, identifier),
        plugs: Array.isArray(item.plugs) ? item.plugs : [],
      } as PublishPlugCatalog;
    })
    .filter((row): row is PublishPlugCatalog => Boolean(row));
  return { ...result, data: { plugs, catalog } };
}

export async function savePublishPlug(body: Record<string, unknown>): Promise<SafeResult<PublishPlug>> {
  const result = await safeFetch<unknown>(PLUGS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: normalizePlug(rec?.plug ?? rec?.item ?? result.data) };
}

export async function deletePublishPlug(id: string): Promise<SafeResult<{ deleted: boolean }>> {
  const result = await safeFetch<unknown>(`${PLUGS_URL}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: { deleted: rec ? asBool(rec.deleted ?? rec.ok) : true } };
}

export async function fetchPublishRssFeeds(): Promise<SafeResult<PublishRssFeed[]>> {
  const result = await safeFetch<unknown>(RSS_URL);
  if (!result.ok) return { ...result, data: null };
  const feeds = pickArray(result.data, ["feeds", "rss", "items", "data"])
    .map(normalizeRssFeed)
    .filter((row): row is PublishRssFeed => Boolean(row));
  return { ...result, data: feeds };
}

export async function savePublishRssFeed(body: Record<string, unknown>): Promise<SafeResult<PublishRssFeed>> {
  const result = await safeFetch<unknown>(RSS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: normalizeRssFeed(rec?.feed ?? rec?.item ?? result.data) };
}

export async function previewPublishRss(url: string): Promise<
  SafeResult<{ success: boolean; url?: string; description?: string; error?: string }>
> {
  const result = await safeFetch<unknown>(RSS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ previewUrl: url }),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data) ?? {};
  const nested = asRecord(rec.preview) ?? rec;
  return {
    ...result,
    data: {
      success: asBool(nested.success ?? rec.success ?? rec.ok),
      url: asString(nested.url) || undefined,
      description: asString(nested.description) || undefined,
      error: asString(nested.error || rec.error) || undefined,
    },
  };
}

export async function deletePublishRssFeed(id: string): Promise<SafeResult<{ deleted: boolean }>> {
  const result = await safeFetch<unknown>(`${RSS_URL}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: { deleted: rec ? asBool(rec.deleted ?? rec.ok) : true } };
}

export async function fetchPublishWebhooks(): Promise<SafeResult<PublishWebhook[]>> {
  const result = await safeFetch<unknown>(WEBHOOKS_URL);
  if (!result.ok) return { ...result, data: null };
  const webhooks = pickArray(result.data, ["webhooks", "items", "data"])
    .map(normalizeWebhook)
    .filter((row): row is PublishWebhook => Boolean(row));
  return { ...result, data: webhooks };
}

export async function savePublishWebhook(body: {
  id?: string;
  name: string;
  url: string;
  channelIds: string[];
}): Promise<SafeResult<PublishWebhook>> {
  const result = await safeFetch<unknown>(WEBHOOKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: normalizeWebhook(rec?.webhook ?? rec?.item ?? result.data) };
}

export async function deletePublishWebhook(id: string): Promise<SafeResult<{ deleted: boolean }>> {
  const result = await safeFetch<unknown>(`${WEBHOOKS_URL}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: { deleted: rec ? asBool(rec.deleted ?? rec.ok) : true } };
}

const MISSING_RELEASE_URL = "/api/admin/publish/missing-release";

export type MissingReleaseRow = {
  id: string;
  content: string;
  title?: string;
  channelId: string;
  channelName?: string;
  provider?: string;
  publishDate: string;
  state: PublishState;
  releaseId?: string;
  releaseURL?: string;
};

export async function fetchMissingReleasePosts(): Promise<
  SafeResult<{ posts: MissingReleaseRow[]; messageAr: string }>
> {
  const result = await safeFetch<unknown>(MISSING_RELEASE_URL);
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data) ?? {};
  const posts = pickArray(result.data, ["posts"])
    .map((row): MissingReleaseRow | null => {
      const item = asRecord(row);
      if (!item) return null;
      const id = asString(item.id);
      if (!id) return null;
      const stateRaw = asString(item.state, "published");
      return {
        id,
        content: asString(item.content),
        title: asString(item.title) || undefined,
        channelId: asString(item.channelId),
        channelName: asString(item.channelName) || undefined,
        provider: asString(item.provider) || undefined,
        publishDate: asString(item.publishDate),
        state: isState(stateRaw) ? stateRaw : "published",
        releaseId: asString(item.releaseId) || undefined,
        releaseURL: asString(item.releaseURL || item.releaseUrl) || undefined,
      };
    })
    .filter((row): row is MissingReleaseRow => Boolean(row));
  return {
    ...result,
    data: { posts, messageAr: asString(rec.messageAr) },
  };
}

export async function patchPublishReleaseId(
  id: string,
  releaseId: string,
  releaseURL?: string
): Promise<SafeResult<PublishPost>> {
  const result = await safeFetch<unknown>(MISSING_RELEASE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, releaseId, releaseURL }),
  });
  if (!result.ok) return { ...result, data: null };
  const rec = asRecord(result.data);
  return { ...result, data: normalizePost(rec?.post ?? result.data) };
}
