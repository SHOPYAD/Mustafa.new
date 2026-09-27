import { getMetaSocialEnv } from "@/lib/social/env";
import { decryptChannelSecrets } from "./channels";
import { PROVIDER_LABEL_AR } from "./constants";
import { getPost } from "./posts";
import { refreshChannelOrRecord } from "./refresh";
import { getStoredChannel, listStoredChannels } from "./store";
import {
  fetchLiveAccountAnalytics,
  fetchLivePostAnalytics,
  isLiveAnalyticsProvider,
  LIVE_ANALYTICS_PROVIDERS,
  type AnalyticsSeries,
} from "./analytics-live";
import { ProviderHttpError } from "./providers/http-base";
import type { StoredPublishChannel } from "./types";

export { LIVE_ANALYTICS_PROVIDERS, isLiveAnalyticsProvider } from "./analytics-live";

export const ANALYTICS_RECONNECT_URL = "/admin/social-accounts";

export const ANALYTICS_WINDOWS: Record<string, number[]> = {
  facebook: [7, 30, 90],
  instagram: [7, 30, 90],
  "instagram-standalone": [7, 30, 90],
  "linkedin-page": [7, 30, 90],
  tiktok: [7, 30],
  "tiktok-business": [7, 30],
  youtube: [7, 30, 90],
  gmb: [7, 30, 90],
  pinterest: [7, 30, 90],
  threads: [7, 30],
  x: [7, 30, 90],
};

export const ANALYTICS_CATALOG = LIVE_ANALYTICS_PROVIDERS.map((id) => ({
  id,
  nameAr: PROVIDER_LABEL_AR[id] || id,
  windows: ANALYTICS_WINDOWS[id] || [7, 30, 90],
  live: true,
}));

export type PublishChannelAnalytics = {
  channelId: string;
  provider: string;
  name: string;
  status: "ok" | "missing_token" | "needs_reconnect" | "empty";
  source: "live" | "none";
  live: boolean;
  reconnectUrl: string;
  messageAr: string;
  windows: number[];
  range: { days: number };
  series: AnalyticsSeries[];
};

export type PublishPostAnalytics = {
  postId: string;
  channelId: string;
  provider: string;
  releaseId?: string;
  status: "ok" | "missing_token" | "needs_reconnect" | "empty";
  live: boolean;
  reconnectUrl: string;
  messageAr: string;
  series: AnalyticsSeries[];
  missingReleaseId?: boolean;
};

export type PublishAnalyticsOverview = {
  date: number;
  reconnectUrl: string;
  liveProviders: string[];
  placeholderProviders: string[];
  catalog: typeof ANALYTICS_CATALOG;
  channels: PublishChannelAnalytics[];
};

const MISSING_TOKEN_AR = "لا يوجد رمز وصول محفوظ. أعد ربط الحساب.";
const NEEDS_RECONNECT_AR = "الحساب يحتاج إعادة ربط.";
const EMPTY_AR = "لم تُرجع واجهة المنصة نقاطاً. لن نختلق رسماً بيانياً.";

export function parseAnalyticsDays(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 7;
  return Math.min(90, Math.max(1, Math.round(n)));
}

function windowsOf(provider: string): number[] {
  return ANALYTICS_WINDOWS[provider] || [7, 30, 90];
}

function clampDays(provider: string, days: number): number {
  const windows = windowsOf(provider);
  if (windows.includes(days)) return days;
  return windows.reduce((best, window) => (Math.abs(window - days) < Math.abs(best - days) ? window : best), windows[0]);
}

function emptyResult(
  channel: StoredPublishChannel,
  days: number,
  status: PublishChannelAnalytics["status"],
  messageAr: string,
  live = false
): PublishChannelAnalytics {
  return {
    channelId: channel.id,
    provider: channel.provider,
    name: channel.name,
    status,
    source: live ? "live" : "none",
    live,
    reconnectUrl: ANALYTICS_RECONNECT_URL,
    messageAr,
    windows: windowsOf(channel.provider),
    range: { days },
    series: [],
  };
}

function tokenExpired(channel: StoredPublishChannel): boolean {
  if (!channel.tokenExpiresAt) return false;
  const expires = Date.parse(channel.tokenExpiresAt);
  if (!Number.isFinite(expires)) return false;
  return expires - 60_000 <= Date.now();
}

async function maybeRefresh(channel: StoredPublishChannel): Promise<StoredPublishChannel> {
  if (!tokenExpired(channel) && !channel.refreshNeeded) return channel;
  const { channel: next } = await refreshChannelOrRecord(channel);
  return next;
}

async function resolveSecrets(channel: StoredPublishChannel): Promise<{
  channel: StoredPublishChannel;
  accessToken: string;
  pageAccessToken: string;
}> {
  const refreshed = await maybeRefresh(channel);
  const secrets = await decryptChannelSecrets(refreshed);
  return {
    channel: refreshed,
    accessToken: secrets.accessToken.trim(),
    pageAccessToken: secrets.pageAccessToken.trim(),
  };
}

function hasUsableToken(provider: string, accessToken: string, pageAccessToken: string): boolean {
  if (provider === "facebook" || provider === "instagram") {
    return Boolean(pageAccessToken || accessToken);
  }
  return Boolean(accessToken);
}

async function graphVersion(): Promise<string> {
  try {
    const env = await getMetaSocialEnv();
    return env.graphVersion || "v21.0";
  } catch {
    return "v21.0";
  }
}

function fromLive(
  channel: StoredPublishChannel,
  days: number,
  series: AnalyticsSeries[],
  messageAr?: string,
  authFailed?: boolean
): PublishChannelAnalytics {
  if (authFailed) {
    return emptyResult(channel, days, "needs_reconnect", messageAr || NEEDS_RECONNECT_AR, true);
  }
  if (!series.length) {
    return emptyResult(channel, days, "empty", messageAr || EMPTY_AR, true);
  }
  return {
    channelId: channel.id,
    provider: channel.provider,
    name: channel.name,
    status: "ok",
    source: "live",
    live: true,
    reconnectUrl: ANALYTICS_RECONNECT_URL,
    messageAr: messageAr || "",
    windows: windowsOf(channel.provider),
    range: { days },
    series,
  };
}

export async function getChannelAnalytics(
  channelId: string,
  daysInput?: number
): Promise<PublishChannelAnalytics | null> {
  const stored = await getStoredChannel(channelId);
  if (!stored) return null;
  const days = clampDays(stored.provider, parseAnalyticsDays(daysInput));
  if (!isLiveAnalyticsProvider(stored.provider)) {
    return emptyResult(stored, days, "empty", "هذه المنصة بلا جلب تحليلات حي.");
  }
  try {
    const resolved = await resolveSecrets(stored);
    if (!hasUsableToken(resolved.channel.provider, resolved.accessToken, resolved.pageAccessToken)) {
      return emptyResult(resolved.channel, days, "missing_token", MISSING_TOKEN_AR);
    }
    const live = await fetchLiveAccountAnalytics({
      provider: resolved.channel.provider,
      accessToken: resolved.accessToken,
      pageAccessToken: resolved.pageAccessToken,
      externalId: resolved.channel.extra.externalId,
      pageId: resolved.channel.extra.pageId,
      instagramUserId: resolved.channel.extra.instagramUserId,
      days,
      graphVersion: await graphVersion(),
    });
    if (!live.fetched && !live.series.length) {
      return emptyResult(resolved.channel, days, "missing_token", live.messageAr || MISSING_TOKEN_AR);
    }
    return fromLive(resolved.channel, days, live.series, live.messageAr, live.authFailed);
  } catch (err) {
    if (err instanceof ProviderHttpError && err.code === "needs_reauth") {
      return emptyResult(stored, days, "needs_reconnect", err.message || NEEDS_RECONNECT_AR, true);
    }
    return emptyResult(
      stored,
      days,
      "empty",
      err instanceof Error && err.message.trim() ? err.message : EMPTY_AR,
      true
    );
  }
}

export async function getAnalyticsOverview(daysInput?: number): Promise<PublishAnalyticsOverview> {
  const days = parseAnalyticsDays(daysInput);
  const stored = (await listStoredChannels()).filter(
    (row) => !row.disabled && isLiveAnalyticsProvider(row.provider)
  );
  const channels = await Promise.all(stored.map((row) => getChannelAnalytics(row.id, days)));
  return {
    date: days,
    reconnectUrl: ANALYTICS_RECONNECT_URL,
    liveProviders: [...LIVE_ANALYTICS_PROVIDERS],
    placeholderProviders: [],
    catalog: ANALYTICS_CATALOG,
    channels: channels.filter((row): row is PublishChannelAnalytics => Boolean(row)),
  };
}

export async function getPostAnalytics(
  postId: string,
  daysInput?: number
): Promise<PublishPostAnalytics | null> {
  const post = await getPost(postId);
  if (!post) return null;
  const stored = await getStoredChannel(post.channelId);
  const days = clampDays(stored?.provider || "", parseAnalyticsDays(daysInput));
  if (!stored) {
    return {
      postId,
      channelId: post.channelId,
      provider: "",
      status: "empty",
      live: false,
      reconnectUrl: ANALYTICS_RECONNECT_URL,
      messageAr: "القناة غير موجودة.",
      series: [],
    };
  }
  if (!isLiveAnalyticsProvider(stored.provider)) {
    return {
      postId,
      channelId: stored.id,
      provider: stored.provider,
      releaseId: post.releaseId,
      status: "empty",
      live: false,
      reconnectUrl: ANALYTICS_RECONNECT_URL,
      messageAr: "هذه المنصة بلا جلب تحليلات للمنشور.",
      series: [],
    };
  }
  if (!post.releaseId) {
    return {
      postId,
      channelId: stored.id,
      provider: stored.provider,
      status: "empty",
      live: false,
      reconnectUrl: ANALYTICS_RECONNECT_URL,
      messageAr: "بلا releaseId — الإحصاءات البعيدة غير متاحة.",
      series: [],
      missingReleaseId: true,
    };
  }
  try {
    const resolved = await resolveSecrets(stored);
    if (!hasUsableToken(resolved.channel.provider, resolved.accessToken, resolved.pageAccessToken)) {
      return {
        postId,
        channelId: stored.id,
        provider: stored.provider,
        releaseId: post.releaseId,
        status: "missing_token",
        live: false,
        reconnectUrl: ANALYTICS_RECONNECT_URL,
        messageAr: MISSING_TOKEN_AR,
        series: [],
      };
    }
    const live = await fetchLivePostAnalytics({
      provider: resolved.channel.provider,
      accessToken: resolved.accessToken,
      pageAccessToken: resolved.pageAccessToken,
      externalId: resolved.channel.extra.externalId,
      pageId: resolved.channel.extra.pageId,
      instagramUserId: resolved.channel.extra.instagramUserId,
      days,
      graphVersion: await graphVersion(),
      releaseId: post.releaseId,
    });
    if (live.authFailed) {
      return {
        postId,
        channelId: stored.id,
        provider: stored.provider,
        releaseId: post.releaseId,
        status: "needs_reconnect",
        live: true,
        reconnectUrl: ANALYTICS_RECONNECT_URL,
        messageAr: live.messageAr || NEEDS_RECONNECT_AR,
        series: [],
      };
    }
    return {
      postId,
      channelId: stored.id,
      provider: stored.provider,
      releaseId: post.releaseId,
      status: live.series.length ? "ok" : "empty",
      live: live.fetched,
      reconnectUrl: ANALYTICS_RECONNECT_URL,
      messageAr: live.series.length ? "" : live.messageAr || EMPTY_AR,
      series: live.series,
    };
  } catch (err) {
    if (err instanceof ProviderHttpError && err.code === "needs_reauth") {
      return {
        postId,
        channelId: stored.id,
        provider: stored.provider,
        releaseId: post.releaseId,
        status: "needs_reconnect",
        live: true,
        reconnectUrl: ANALYTICS_RECONNECT_URL,
        messageAr: err.message || NEEDS_RECONNECT_AR,
        series: [],
      };
    }
    return {
      postId,
      channelId: stored.id,
      provider: stored.provider,
      releaseId: post.releaseId,
      status: "empty",
      live: true,
      reconnectUrl: ANALYTICS_RECONNECT_URL,
      messageAr: err instanceof Error && err.message.trim() ? err.message : EMPTY_AR,
      series: [],
    };
  }
}
