/**
 * Live HTTP analytics fetchers. Numbers come only from provider APIs.
 * Empty series when the API returns nothing — never invented totals.
 */

import { META_GRAPH_DEFAULT_VERSION } from "@/lib/social/env";
import { looksLikeAuthFailure, providerFetch, ProviderHttpError } from "./providers/http-base";

export const LIVE_ANALYTICS_PROVIDERS = [
  "facebook",
  "instagram",
  "instagram-standalone",
  "linkedin-page",
  "tiktok",
  "tiktok-business",
  "youtube",
  "gmb",
  "pinterest",
  "threads",
  "x",
] as const;

export type LiveAnalyticsProvider = (typeof LIVE_ANALYTICS_PROVIDERS)[number];

export type AnalyticsPoint = { total: number; date: string };

export type AnalyticsSeries = {
  label: string;
  labelAr: string;
  average?: boolean;
  data: AnalyticsPoint[];
};

export type LiveFetchInput = {
  provider: string;
  accessToken: string;
  pageAccessToken?: string;
  externalId?: string;
  pageId?: string;
  instagramUserId?: string;
  days: number;
  graphVersion?: string;
};

export type LiveFetchResult = {
  series: AnalyticsSeries[];
  fetched: boolean;
  authFailed?: boolean;
  messageAr?: string;
};

const LABEL_AR: Record<string, string> = {
  "Page Impressions": "ظهور الصفحة",
  "Posts Engagement": "تفاعل المنشورات",
  "Page followers": "متابعو الصفحة",
  "Media views": "مشاهدات الوسائط",
  Followers: "المتابعون",
  "Follower Count": "المتابعون",
  Following: "يتابع",
  Reach: "الوصول",
  Likes: "الإعجابات",
  Views: "المشاهدات",
  Comments: "التعليقات",
  Shares: "المشاركات",
  Saves: "الحفظ",
  Replies: "الردود",
  "Total Likes": "إجمالي الإعجابات",
  Videos: "المقاطع",
  "Recent Likes": "إعجابات حديثة",
  "Recent Comments": "تعليقات حديثة",
  "Recent Shares": "مشاركات حديثة",
  "Estimated Minutes Watched": "دقائق المشاهدة",
  "Average View Duration": "متوسط مدة المشاهدة",
  "Average View Percentage": "متوسط نسبة المشاهدة",
  "Subscribers Gained": "مشتركون جدد",
  "Subscribers Lost": "مشتركون غادروا",
  Subscribers: "المشتركون",
  "Page Views": "مشاهدات الصفحة",
  Clicks: "النقرات",
  Engagement: "التفاعل",
  "Organic Followers": "متابعون عضويون",
  "Paid Followers": "متابعون مدفوعون",
  Impressions: "الظهور",
  "Unique Impressions": "ظهور فريد",
  Reactions: "التفاعلات",
  "Pin click rate": "معدل نقر الدبوس",
  "Pin Clicks": "نقرات الدبوس",
  "Website Clicks": "نقرات الموقع",
  "Phone Calls": "المكالمات",
  "Direction Requests": "طلبات الاتجاه",
  "Desktop Map Views": "مشاهدات الخريطة — سطح المكتب",
  "Mobile Map Views": "مشاهدات الخريطة — الجوال",
  Reposts: "إعادة النشر",
  Quotes: "الاقتباسات",
  Bookmarks: "الإشارات",
  IMPRESSION: "الظهور",
  LIKE: "الإعجابات",
  RETWEET: "إعادة التغريد",
  REPLY: "الردود",
  QUOTE: "الاقتباسات",
  BOOKMARK: "الإشارات",
  "Profile views": "مشاهدات الملف",
  "Video views": "مشاهدات الفيديو",
};

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function unixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function sumUnknown(value: unknown): number | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    let sum = 0;
    let any = false;
    for (const item of Object.values(value as Record<string, unknown>)) {
      const n = asNumber(item);
      if (n != null) {
        sum += n;
        any = true;
      }
    }
    return any ? sum : null;
  }
  return asNumber(value);
}

function seriesOf(
  label: string,
  data: AnalyticsPoint[],
  average = false
): AnalyticsSeries | null {
  const points = data.filter((row) => Number.isFinite(row.total) && row.date);
  if (!points.length) return null;
  return { label, labelAr: LABEL_AR[label] || label, average, data: points };
}

function snapshot(label: string, total: number | null, average = false): AnalyticsSeries | null {
  if (total == null) return null;
  return seriesOf(label, [{ total, date: todayYmd() }], average);
}

function bodyLooksLikeDeadToken(status: number, body: unknown): boolean {
  if (status === 401) return true;
  const text = (() => {
    if (!body) return "";
    if (typeof body === "string") return body;
    try {
      return JSON.stringify(body);
    } catch {
      return "";
    }
  })().toLowerCase();
  return (
    text.includes("error validating access token") ||
    text.includes("invalid access token") ||
    text.includes("token expired") ||
    text.includes("revoked") ||
    text.includes("invalid_grant") ||
    text.includes("unauthenticated") ||
    text.includes("access_token_invalid") ||
    (looksLikeAuthFailure(status, body) && status !== 403)
  );
}

async function analyticsJson<T>(
  url: string,
  init: RequestInit = {}
): Promise<{ status: number; data: T }> {
  const res = await providerFetch(url, init, { timeoutMs: 25_000 });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  if (bodyLooksLikeDeadToken(res.status, data)) {
    throw new ProviderHttpError(
      "رمز المنصة غير صالح",
      res.status,
      false,
      data,
      "needs_reauth"
    );
  }
  return { status: res.status, data: data as T };
}

function graphErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const err = (data as { error?: { message?: string } }).error;
  return typeof err?.message === "string" ? err.message : "";
}

function isInvalidMetric(data: unknown): boolean {
  const msg = graphErrorMessage(data).toLowerCase();
  return msg.includes("invalid metric") || msg.includes("does not exist") || msg.includes("nonexisting field");
}

function linkedinOrgId(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/organization[:/]([^/:]+)$/i);
  if (match?.[1]) return match[1];
  return trimmed.replace(/^urn:li:organization:/i, "");
}

function gmbLocationPath(raw: string): string {
  const trimmed = raw.trim();
  const after = trimmed.split("/locations/")[1];
  if (after) return `locations/${after.split("/")[0]}`;
  if (trimmed.startsWith("locations/")) return trimmed;
  return `locations/${trimmed}`;
}

function bearer(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function resolveFacebookPageId(token: string, version: string, hinted: string): Promise<string> {
  if (hinted) return hinted;
  const { data } = await analyticsJson<{ id?: string }>(
    `https://graph.facebook.com/${version}/me?fields=id&access_token=${encodeURIComponent(token)}`
  );
  return (data.id || "").trim();
}

function mapInsightValues(
  name: string,
  values: unknown,
  totalValue?: unknown
): AnalyticsSeries | null {
  const labelMap: Record<string, string> = {
    page_total_media_view_unique: "Page Impressions",
    page_impressions: "Page Impressions",
    page_post_engagements: "Posts Engagement",
    page_daily_follows: "Page followers",
    page_fans: "Page followers",
    page_media_view: "Media views",
    follower_count: "Follower Count",
    reach: "Reach",
    likes: "Likes",
    views: "Views",
    comments: "Comments",
    shares: "Shares",
    saves: "Saves",
    replies: "Replies",
    followers: "Followers",
    reposts: "Reposts",
    quotes: "Quotes",
  };
  const label = labelMap[name] || name;
  if (totalValue != null) {
    const total = sumUnknown(
      typeof totalValue === "object" && totalValue && "value" in totalValue
        ? (totalValue as { value?: unknown }).value
        : totalValue
    );
    return snapshot(label, total);
  }
  if (!Array.isArray(values)) return null;
  const points: AnalyticsPoint[] = [];
  for (const raw of values) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as { value?: unknown; end_time?: string };
    const total = sumUnknown(row.value);
    if (total == null) continue;
    const date = row.end_time ? ymd(new Date(row.end_time)) : todayYmd();
    points.push({ total, date });
  }
  return seriesOf(label, points);
}

async function fetchFacebook(input: LiveFetchInput): Promise<LiveFetchResult> {
  const token = (input.pageAccessToken || input.accessToken).trim();
  const version = input.graphVersion || META_GRAPH_DEFAULT_VERSION;
  const hinted = (input.pageId || input.externalId || "").trim();
  const pageId = await resolveFacebookPageId(token, version, hinted);
  if (!pageId) {
    return { series: [], fetched: true, messageAr: "لا يوجد معرّف صفحة فيسبوك." };
  }
  const until = unixSeconds(new Date());
  const since = unixSeconds(daysAgo(input.days));
  const newMetrics = "page_total_media_view_unique,page_media_view,page_post_engagements,page_daily_follows";
  const oldMetrics = "page_impressions,page_post_engagements,page_fans";
  const url = (metrics: string) =>
    `https://graph.facebook.com/${version}/${encodeURIComponent(pageId)}/insights?metric=${metrics}&access_token=${encodeURIComponent(token)}&period=day&since=${since}&until=${until}`;
  let { data } = await analyticsJson<{ data?: Array<{ name?: string; values?: unknown }> }>(url(newMetrics));
  if (isInvalidMetric(data) || !Array.isArray(data.data)) {
    const retry = await analyticsJson<{ data?: Array<{ name?: string; values?: unknown }> }>(url(oldMetrics));
    data = retry.data;
  }
  const series = (data.data || [])
    .map((row) => mapInsightValues(row.name || "", row.values))
    .filter((row): row is AnalyticsSeries => Boolean(row));
  const page = await analyticsJson<{ fan_count?: number; followers_count?: number }>(
    `https://graph.facebook.com/${version}/${encodeURIComponent(pageId)}?fields=fan_count,followers_count&access_token=${encodeURIComponent(token)}`
  );
  const fans = snapshot("Page followers", asNumber(page.data.followers_count ?? page.data.fan_count));
  if (fans && !series.some((row) => row.label === "Page followers")) series.push(fans);
  return { series, fetched: true };
}

async function fetchInstagram(
  input: LiveFetchInput,
  host: "graph.facebook.com" | "graph.instagram.com"
): Promise<LiveFetchResult> {
  const token = (input.pageAccessToken || input.accessToken).trim();
  const version = host === "graph.instagram.com" ? "v25.0" : input.graphVersion || META_GRAPH_DEFAULT_VERSION;
  const id =
    (input.instagramUserId || input.externalId || (host === "graph.instagram.com" ? "me" : "")).trim() || "me";
  const until = unixSeconds(new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"));
  const since = unixSeconds(daysAgo(input.days));
  const daily = await analyticsJson<{ data?: Array<{ name?: string; values?: unknown; total_value?: unknown }> }>(
    `https://${host}/${version}/${encodeURIComponent(id)}/insights?metric=follower_count,reach&access_token=${encodeURIComponent(token)}&period=day&since=${since}&until=${until}`
  );
  const totals = await analyticsJson<{ data?: Array<{ name?: string; values?: unknown; total_value?: unknown }> }>(
    `https://${host}/${version}/${encodeURIComponent(id)}/insights?metric_type=total_value&metric=likes,views,comments,shares,saves,replies&access_token=${encodeURIComponent(token)}&period=day&since=${since}&until=${until}`
  );
  const series: AnalyticsSeries[] = [];
  for (const row of daily.data.data || []) {
    const mapped = mapInsightValues(row.name || "", row.values, row.total_value);
    if (mapped) series.push(mapped);
  }
  for (const row of totals.data.data || []) {
    const mapped = mapInsightValues(row.name || "", row.values, row.total_value);
    if (mapped) series.push(mapped);
  }
  return { series, fetched: true, messageAr: graphErrorMessage(daily.data) || graphErrorMessage(totals.data) || undefined };
}

async function fetchLinkedInPage(input: LiveFetchInput): Promise<LiveFetchResult> {
  const org = linkedinOrgId(input.pageId || input.externalId || "");
  if (!org) return { series: [], fetched: false, messageAr: "لا يوجد معرّف لصفحة لينكدإن." };
  const endDate = Date.now();
  const startDate = Date.now() - input.days * 24 * 60 * 60 * 1000;
  const headers = {
    ...bearer(input.accessToken),
    "LinkedIn-Version": "202601",
    "X-Restli-Protocol-Version": "2.0.0",
  };
  const urn = encodeURIComponent(`urn:li:organization:${org}`);
  const interval = `timeIntervals=(timeRange:(start:${startDate},end:${endDate}),timeGranularityType:DAY)`;
  const [pages, followers, shares] = await Promise.all([
    analyticsJson<{ elements?: Array<Record<string, unknown>> }>(
      `https://api.linkedin.com/v2/organizationPageStatistics?q=organization&organization=${urn}&${interval}`,
      { headers }
    ),
    analyticsJson<{ elements?: Array<Record<string, unknown>> }>(
      `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${urn}&${interval}`,
      { headers }
    ),
    analyticsJson<{ elements?: Array<Record<string, unknown>> }>(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${urn}&${interval}`,
      { headers }
    ),
  ]);
  const buckets: Record<string, AnalyticsPoint[]> = {
    "Page Views": [],
    "Organic Followers": [],
    "Paid Followers": [],
    Clicks: [],
    Shares: [],
    Engagement: [],
    Comments: [],
  };
  const rows = [...(followers.data.elements || []), ...(pages.data.elements || []), ...(shares.data.elements || [])];
  for (const current of rows) {
    const range = current.timeRange as { start?: number } | undefined;
    const date = range?.start ? ymd(new Date(range.start)) : todayYmd();
    const views = (current.totalPageStatistics as { views?: { allPageViews?: { pageViews?: unknown } } } | undefined)
      ?.views?.allPageViews?.pageViews;
    const viewN = asNumber(views);
    if (viewN != null) buckets["Page Views"].push({ total: viewN, date });
    const gains = current.followerGains as { organicFollowerGain?: unknown; paidFollowerGain?: unknown } | undefined;
    const organic = asNumber(gains?.organicFollowerGain);
    if (organic != null) buckets["Organic Followers"].push({ total: organic, date });
    const paid = asNumber(gains?.paidFollowerGain);
    if (paid != null) buckets["Paid Followers"].push({ total: paid, date });
    const share = current.totalShareStatistics as
      | { clickCount?: unknown; shareCount?: unknown; engagement?: unknown; commentCount?: unknown }
      | undefined;
    const clicks = asNumber(share?.clickCount);
    if (clicks != null) buckets.Clicks.push({ total: clicks, date });
    const shareCount = asNumber(share?.shareCount);
    if (shareCount != null) buckets.Shares.push({ total: shareCount, date });
    const engagement = asNumber(share?.engagement);
    if (engagement != null) buckets.Engagement.push({ total: engagement, date, });
    const comments = asNumber(share?.commentCount);
    if (comments != null) buckets.Comments.push({ total: comments, date });
  }
  return {
    series: Object.entries(buckets)
      .map(([label, data]) => seriesOf(label, data, label === "Engagement"))
      .filter((row): row is AnalyticsSeries => Boolean(row)),
    fetched: true,
  };
}

async function fetchTikTok(input: LiveFetchInput): Promise<LiveFetchResult> {
  const headers = bearer(input.accessToken);
  const stats = await analyticsJson<{
    data?: { user?: Record<string, unknown> };
    error?: { message?: string };
  }>("https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count", {
    headers,
  });
  const user = stats.data.data?.user || {};
  const series: AnalyticsSeries[] = [];
  const add = (label: string, key: string) => {
    const row = snapshot(label, asNumber(user[key]));
    if (row) series.push(row);
  };
  add("Followers", "follower_count");
  add("Following", "following_count");
  add("Total Likes", "likes_count");
  add("Videos", "video_count");

  const list = await analyticsJson<{ data?: { videos?: Array<{ id?: string }> } }>(
    "https://open.tiktokapis.com/v2/video/list/?fields=id",
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ max_count: 20 }),
    }
  );
  const videoIds = (list.data.data?.videos || []).map((row) => row.id).filter((id): id is string => Boolean(id));
  if (videoIds.length) {
    const query = await analyticsJson<{
      data?: { videos?: Array<{ view_count?: number; like_count?: number; comment_count?: number; share_count?: number }> };
    }>("https://open.tiktokapis.com/v2/video/query/?fields=id,like_count,comment_count,share_count,view_count", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ filters: { video_ids: videoIds } }),
    });
    const videos = query.data.data?.videos || [];
    if (videos.length) {
      const totals = videos.reduce(
        (acc, video) => {
          acc.views += asNumber(video.view_count) || 0;
          acc.likes += asNumber(video.like_count) || 0;
          acc.comments += asNumber(video.comment_count) || 0;
          acc.shares += asNumber(video.share_count) || 0;
          return acc;
        },
        { views: 0, likes: 0, comments: 0, shares: 0 }
      );
      const views = snapshot("Views", totals.views);
      const likes = snapshot("Recent Likes", totals.likes);
      const comments = snapshot("Recent Comments", totals.comments);
      const shares = snapshot("Recent Shares", totals.shares);
      if (views) series.push(views);
      if (likes) series.push(likes);
      if (comments) series.push(comments);
      if (shares) series.push(shares);
    }
  }
  return {
    series,
    fetched: true,
    messageAr: stats.data.error?.message,
  };
}

async function fetchTikTokBusiness(input: LiveFetchInput): Promise<LiveFetchResult> {
  const businessId = (input.externalId || input.pageId || "").trim();
  if (!businessId) return { series: [], fetched: false, messageAr: "لا يوجد معرّف حساب تيك توك بزنس." };
  const fields = encodeURIComponent(
    JSON.stringify(["followers_count", "profile_views", "video_views", "likes", "comments", "shares"])
  );
  const { data } = await analyticsJson<{
    code?: number;
    message?: string;
    data?: Record<string, unknown>;
  }>(
    `https://business-api.tiktok.com/open_api/v1.3/business/get/?business_id=${encodeURIComponent(businessId)}&fields=${fields}`,
    { headers: { "Access-Token": input.accessToken } }
  );
  const row = data.data || {};
  const series = [
    snapshot("Followers", asNumber(row.followers_count)),
    snapshot("Profile views", asNumber(row.profile_views)),
    snapshot("Video views", asNumber(row.video_views)),
    snapshot("Likes", asNumber(row.likes)),
    snapshot("Comments", asNumber(row.comments)),
    snapshot("Shares", asNumber(row.shares)),
  ].filter((item): item is AnalyticsSeries => Boolean(item));
  return { series, fetched: true, messageAr: data.code && data.code !== 0 ? data.message : undefined };
}

async function fetchYoutube(input: LiveFetchInput): Promise<LiveFetchResult> {
  const headers = bearer(input.accessToken);
  const endDate = todayYmd();
  const startDate = ymd(daysAgo(input.days));
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics:
      "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,likes,subscribersLost",
    dimensions: "day",
    sort: "day",
  });
  const report = await analyticsJson<{
    columnHeaders?: Array<{ name?: string }>;
    rows?: unknown[][];
    error?: { message?: string };
  }>(`https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`, { headers });
  const columns = (report.data.columnHeaders || []).map((col) => col.name || "");
  const mapped = (report.data.rows || []).map((row) => {
    const rec: Record<string, unknown> = {};
    columns.forEach((name, index) => {
      rec[name] = row[index];
    });
    return rec;
  });
  if (mapped.length) {
    const pick = (key: string, label: string, average = false) =>
      seriesOf(
        label,
        mapped
          .map((row) => {
            const total = asNumber(row[key]);
            const date = typeof row.day === "string" ? row.day : "";
            return total != null && date ? { total, date } : null;
          })
          .filter((row): row is AnalyticsPoint => Boolean(row)),
        average
      );
    return {
      series: [
        pick("views", "Views"),
        pick("estimatedMinutesWatched", "Estimated Minutes Watched"),
        pick("averageViewDuration", "Average View Duration", true),
        pick("averageViewPercentage", "Average View Percentage", true),
        pick("subscribersGained", "Subscribers Gained"),
        pick("subscribersLost", "Subscribers Lost"),
        pick("likes", "Likes"),
      ].filter((row): row is AnalyticsSeries => Boolean(row)),
      fetched: true,
    };
  }

  const id = (input.externalId || "").trim();
  const qs = id
    ? `id=${encodeURIComponent(id)}&part=statistics`
    : "mine=true&part=statistics";
  const channels = await analyticsJson<{
    items?: Array<{ statistics?: Record<string, unknown> }>;
    error?: { message?: string };
  }>(`https://www.googleapis.com/youtube/v3/channels?${qs}`, { headers });
  const stats = channels.data.items?.[0]?.statistics || {};
  const series = [
    snapshot("Views", asNumber(stats.viewCount)),
    snapshot("Subscribers", asNumber(stats.subscriberCount)),
    snapshot("Videos", asNumber(stats.videoCount)),
  ].filter((row): row is AnalyticsSeries => Boolean(row));
  return {
    series,
    fetched: true,
    messageAr: report.data.error?.message || channels.data.error?.message,
  };
}

async function fetchGmb(input: LiveFetchInput): Promise<LiveFetchResult> {
  const raw = (input.externalId || input.pageId || "").trim();
  if (!raw) return { series: [], fetched: false, messageAr: "لا يوجد معرّف موقع جوجل للأعمال." };
  const locationPath = gmbLocationPath(raw);
  const end = new Date();
  const start = daysAgo(input.days);
  const qs = [
    "dailyMetrics=WEBSITE_CLICKS",
    "dailyMetrics=CALL_CLICKS",
    "dailyMetrics=BUSINESS_DIRECTION_REQUESTS",
    "dailyMetrics=BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    "dailyMetrics=BUSINESS_IMPRESSIONS_MOBILE_MAPS",
    `dailyRange.startDate.year=${start.getUTCFullYear()}`,
    `dailyRange.startDate.month=${start.getUTCMonth() + 1}`,
    `dailyRange.startDate.day=${start.getUTCDate()}`,
    `dailyRange.endDate.year=${end.getUTCFullYear()}`,
    `dailyRange.endDate.month=${end.getUTCMonth() + 1}`,
    `dailyRange.endDate.day=${end.getUTCDate()}`,
  ].join("&");
  const { data } = await analyticsJson<{
    multiDailyMetricTimeSeries?: Array<{
      dailyMetricTimeSeries?: Array<{
        dailyMetric?: string;
        timeSeries?: { datedValues?: Array<{ value?: string; date?: { year?: number; month?: number; day?: number } }> };
      }>;
    }>;
  }>(
    `https://businessprofileperformance.googleapis.com/v1/${locationPath}:fetchMultiDailyMetricsTimeSeries?${qs}`,
    { headers: bearer(input.accessToken) }
  );
  const labels: Record<string, string> = {
    WEBSITE_CLICKS: "Website Clicks",
    CALL_CLICKS: "Phone Calls",
    BUSINESS_DIRECTION_REQUESTS: "Direction Requests",
    BUSINESS_IMPRESSIONS_DESKTOP_MAPS: "Desktop Map Views",
    BUSINESS_IMPRESSIONS_MOBILE_MAPS: "Mobile Map Views",
  };
  const series: AnalyticsSeries[] = [];
  for (const block of data.multiDailyMetricTimeSeries || []) {
    for (const metric of block.dailyMetricTimeSeries || []) {
      const label = labels[metric.dailyMetric || ""] || metric.dailyMetric || "";
      const points = (metric.timeSeries?.datedValues || [])
        .map((row) => {
          const total = asNumber(row.value);
          const d = row.date;
          if (total == null || !d?.year || !d.month || !d.day) return null;
          return {
            total,
            date: `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`,
          };
        })
        .filter((row): row is AnalyticsPoint => Boolean(row));
      const mapped = seriesOf(label, points);
      if (mapped) series.push(mapped);
    }
  }
  return { series, fetched: true };
}

async function fetchPinterest(input: LiveFetchInput): Promise<LiveFetchResult> {
  const until = todayYmd();
  const since = ymd(daysAgo(Math.min(input.days, 89)));
  const { data } = await analyticsJson<{
    all?: { daily_metrics?: Array<{ date?: string; metrics?: Record<string, unknown> }> };
  }>(`https://api.pinterest.com/v5/user_account/analytics?start_date=${since}&end_date=${until}`, {
    headers: { ...bearer(input.accessToken), "Content-Type": "application/json" },
  });
  const buckets: Record<string, AnalyticsPoint[]> = {
    "Pin click rate": [],
    Impressions: [],
    "Pin Clicks": [],
    Engagement: [],
    Saves: [],
  };
  for (const item of data.all?.daily_metrics || []) {
    const metrics = item.metrics || {};
    if (asNumber(metrics.PIN_CLICK_RATE) == null && asNumber(metrics.IMPRESSION) == null) continue;
    const date = item.date || todayYmd();
    const clickRate = asNumber(metrics.PIN_CLICK_RATE);
    if (clickRate != null) buckets["Pin click rate"].push({ total: clickRate, date });
    const impressions = asNumber(metrics.IMPRESSION);
    if (impressions != null) buckets.Impressions.push({ total: impressions, date });
    const clicks = asNumber(metrics.PIN_CLICK);
    if (clicks != null) buckets["Pin Clicks"].push({ total: clicks, date });
    const engagement = asNumber(metrics.ENGAGEMENT);
    if (engagement != null) buckets.Engagement.push({ total: engagement, date });
    const saves = asNumber(metrics.SAVE);
    if (saves != null) buckets.Saves.push({ total: saves, date });
  }
  return {
    series: Object.entries(buckets)
      .map(([label, points]) => seriesOf(label, points, label === "Pin click rate"))
      .filter((row): row is AnalyticsSeries => Boolean(row)),
    fetched: true,
  };
}

async function fetchThreads(input: LiveFetchInput): Promise<LiveFetchResult> {
  const id = (input.externalId || input.instagramUserId || "me").trim() || "me";
  const window = input.days <= 7 ? 7 : 30;
  const until = unixSeconds(new Date());
  const since = unixSeconds(daysAgo(window));
  const { data } = await analyticsJson<{
    data?: Array<{ name?: string; values?: unknown; total_value?: { value?: unknown } }>;
  }>(
    `https://graph.threads.net/v1.0/${encodeURIComponent(id)}/threads_insights?metric=views,likes,replies,reposts,quotes&access_token=${encodeURIComponent(input.accessToken)}&period=day&since=${since}&until=${until}`
  );
  const series = (data.data || [])
    .map((row) => mapInsightValues(row.name || "", row.values, row.total_value))
    .filter((row): row is AnalyticsSeries => Boolean(row));
  return { series, fetched: true };
}

async function fetchX(input: LiveFetchInput): Promise<LiveFetchResult> {
  const headers = bearer(input.accessToken);
  const me = await analyticsJson<{
    data?: { id?: string; public_metrics?: Record<string, unknown> };
  }>("https://api.twitter.com/2/users/me?user.fields=public_metrics", { headers });
  const userId = (me.data.data?.id || input.externalId || "").trim();
  const series: AnalyticsSeries[] = [];
  const metrics = me.data.data?.public_metrics || {};
  const followers = snapshot("Followers", asNumber(metrics.followers_count));
  const following = snapshot("Following", asNumber(metrics.following_count));
  if (followers) series.push(followers);
  if (following) series.push(following);
  if (!userId) return { series, fetched: true };

  const start = daysAgo(Math.min(input.days, 90)).toISOString();
  const tweets: Array<Record<string, unknown>> = [];
  let next = "";
  for (let page = 0; page < 3; page++) {
    const qs = new URLSearchParams({
      max_results: "100",
      "tweet.fields": "public_metrics,created_at",
      start_time: start,
    });
    if (next) qs.set("pagination_token", next);
    const batch = await analyticsJson<{
      data?: Array<{ public_metrics?: Record<string, unknown> }>;
      meta?: { next_token?: string };
    }>(`https://api.twitter.com/2/users/${encodeURIComponent(userId)}/tweets?${qs.toString()}`, { headers });
    tweets.push(...(batch.data.data || []));
    next = batch.data.meta?.next_token || "";
    if (!next) break;
  }
  if (tweets.length) {
    const totals = tweets.reduce(
      (acc, tweet) => {
        const pub = (tweet.public_metrics || {}) as Record<string, unknown>;
        acc.impression += asNumber(pub.impression_count) || 0;
        acc.like += asNumber(pub.like_count) || 0;
        acc.retweet += asNumber(pub.retweet_count) || 0;
        acc.reply += asNumber(pub.reply_count) || 0;
        acc.quote += asNumber(pub.quote_count) || 0;
        acc.bookmark += asNumber(pub.bookmark_count) || 0;
        return acc;
      },
      { impression: 0, like: 0, retweet: 0, reply: 0, quote: 0, bookmark: 0 }
    );
    const impressions = snapshot("Impressions", totals.impression);
    const likes = snapshot("Likes", totals.like);
    const retweets = snapshot("Shares", totals.retweet);
    const replies = snapshot("Replies", totals.reply);
    const quotes = snapshot("Quotes", totals.quote);
    const bookmarks = snapshot("Bookmarks", totals.bookmark);
    if (impressions) series.push(impressions);
    if (likes) series.push(likes);
    if (retweets) series.push(retweets);
    if (replies) series.push(replies);
    if (quotes) series.push(quotes);
    if (bookmarks) series.push(bookmarks);
  }
  return { series, fetched: true };
}

export function isLiveAnalyticsProvider(value: string): value is LiveAnalyticsProvider {
  return (LIVE_ANALYTICS_PROVIDERS as readonly string[]).includes(value);
}

export async function fetchLiveAccountAnalytics(input: LiveFetchInput): Promise<LiveFetchResult> {
  switch (input.provider) {
    case "facebook":
      return fetchFacebook(input);
    case "instagram":
      return fetchInstagram(input, "graph.facebook.com");
    case "instagram-standalone":
      return fetchInstagram(input, "graph.instagram.com");
    case "linkedin-page":
      return fetchLinkedInPage(input);
    case "tiktok":
      return fetchTikTok(input);
    case "tiktok-business":
      return fetchTikTokBusiness(input);
    case "youtube":
      return fetchYoutube(input);
    case "gmb":
      return fetchGmb(input);
    case "pinterest":
      return fetchPinterest(input);
    case "threads":
      return fetchThreads(input);
    case "x":
      return fetchX(input);
    default:
      return { series: [], fetched: false, messageAr: "هذه المنصة بلا جلب تحليلات حي." };
  }
}

export async function fetchLivePostAnalytics(
  input: LiveFetchInput & { releaseId: string }
): Promise<LiveFetchResult> {
  const releaseId = input.releaseId.trim();
  if (!releaseId) return { series: [], fetched: false };
  const token = (input.pageAccessToken || input.accessToken).trim();
  const version = input.graphVersion || META_GRAPH_DEFAULT_VERSION;
  const today = todayYmd();

  if (input.provider === "facebook") {
    const { data } = await analyticsJson<{ data?: Array<{ name?: string; values?: Array<{ value?: unknown }> }> }>(
      `https://graph.facebook.com/${version}/${encodeURIComponent(releaseId)}/insights?metric=post_total_media_view_unique,post_reactions_by_type_total,post_clicks,post_clicks_by_type&access_token=${encodeURIComponent(token)}`
    );
    const series: AnalyticsSeries[] = [];
    for (const metric of data.data || []) {
      const value = sumUnknown(metric.values?.[0]?.value);
      if (value == null) continue;
      const label =
        metric.name === "post_total_media_view_unique"
          ? "Impressions"
          : metric.name === "post_clicks" || metric.name === "post_clicks_by_type"
            ? "Clicks"
            : metric.name === "post_reactions_by_type_total"
              ? "Reactions"
              : "";
      const row = snapshot(label, value);
      if (row) series.push(row);
    }
    return { series, fetched: true };
  }

  if (input.provider === "instagram" || input.provider === "instagram-standalone") {
    const host = input.provider === "instagram-standalone" ? "graph.instagram.com" : "graph.facebook.com";
    const ver = host === "graph.instagram.com" ? "v25.0" : version;
    const { data } = await analyticsJson<{ data?: Array<{ name?: string; values?: Array<{ value?: unknown }> }> }>(
      `https://${host}/${ver}/${encodeURIComponent(releaseId)}/insights?metric=views,reach,saved,likes,comments,shares&access_token=${encodeURIComponent(token)}`
    );
    const series = (data.data || [])
      .map((metric) => mapInsightValues(metric.name || "", metric.values))
      .filter((row): row is AnalyticsSeries => Boolean(row));
    return { series, fetched: true };
  }

  if (input.provider === "youtube") {
    const { data } = await analyticsJson<{
      items?: Array<{ statistics?: Record<string, unknown> }>;
    }>(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(releaseId)}`,
      { headers: bearer(input.accessToken) }
    );
    const stats = data.items?.[0]?.statistics || {};
    return {
      series: [
        snapshot("Views", asNumber(stats.viewCount)),
        snapshot("Likes", asNumber(stats.likeCount)),
        snapshot("Comments", asNumber(stats.commentCount)),
      ].filter((row): row is AnalyticsSeries => Boolean(row)),
      fetched: true,
    };
  }

  if (input.provider === "tiktok") {
    const { data } = await analyticsJson<{
      data?: { videos?: Array<Record<string, unknown>> };
    }>("https://open.tiktokapis.com/v2/video/query/?fields=id,like_count,comment_count,share_count,view_count", {
      method: "POST",
      headers: { ...bearer(input.accessToken), "Content-Type": "application/json" },
      body: JSON.stringify({ filters: { video_ids: [releaseId] } }),
    });
    const video = data.data?.videos?.[0] || {};
    return {
      series: [
        snapshot("Views", asNumber(video.view_count)),
        snapshot("Likes", asNumber(video.like_count)),
        snapshot("Comments", asNumber(video.comment_count)),
        snapshot("Shares", asNumber(video.share_count)),
      ].filter((row): row is AnalyticsSeries => Boolean(row)),
      fetched: true,
    };
  }

  if (input.provider === "x") {
    const { data } = await analyticsJson<{ data?: { public_metrics?: Record<string, unknown> } }>(
      `https://api.twitter.com/2/tweets/${encodeURIComponent(releaseId)}?tweet.fields=public_metrics`,
      { headers: bearer(input.accessToken) }
    );
    const metrics = data.data?.public_metrics || {};
    return {
      series: [
        snapshot("Impressions", asNumber(metrics.impression_count)),
        snapshot("Likes", asNumber(metrics.like_count)),
        snapshot("Shares", asNumber(metrics.retweet_count)),
        snapshot("Replies", asNumber(metrics.reply_count)),
        snapshot("Quotes", asNumber(metrics.quote_count)),
        snapshot("Bookmarks", asNumber(metrics.bookmark_count)),
      ].filter((row): row is AnalyticsSeries => Boolean(row)),
      fetched: true,
    };
  }

  if (input.provider === "linkedin-page") {
    const org = linkedinOrgId(input.pageId || input.externalId || "");
    if (!org) return { series: [], fetched: false, messageAr: "لا يوجد معرّف لصفحة لينكدإن." };
    const headers = {
      ...bearer(input.accessToken),
      "LinkedIn-Version": "202601",
      "X-Restli-Protocol-Version": "2.0.0",
    };
    const { data } = await analyticsJson<{
      elements?: Array<{ totalShareStatistics?: Record<string, unknown> }>;
    }>(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encodeURIComponent(`urn:li:organization:${org}`)}&shares=List(${encodeURIComponent(releaseId)})`,
      { headers }
    );
    const stats = data.elements?.[0]?.totalShareStatistics || {};
    return {
      series: [
        snapshot("Impressions", asNumber(stats.impressionCount)),
        snapshot("Unique Impressions", asNumber(stats.uniqueImpressionsCount)),
        snapshot("Clicks", asNumber(stats.clickCount)),
        snapshot("Likes", asNumber(stats.likeCount)),
        snapshot("Comments", asNumber(stats.commentCount)),
        snapshot("Shares", asNumber(stats.shareCount)),
      ].filter((row): row is AnalyticsSeries => Boolean(row)),
      fetched: true,
    };
  }

  if (input.provider === "pinterest") {
    const since = ymd(daysAgo(89));
    const { data } = await analyticsJson<{
      all?: { lifetime_metrics?: Record<string, unknown>; summary_metrics?: Record<string, unknown> };
    }>(
      `https://api.pinterest.com/v5/pins/${encodeURIComponent(releaseId)}/analytics?start_date=${since}&end_date=${today}&metric_types=IMPRESSION,PIN_CLICK,OUTBOUND_CLICK,SAVE`,
      { headers: { ...bearer(input.accessToken), "Content-Type": "application/json" } }
    );
    const metrics = data.all?.lifetime_metrics || data.all?.summary_metrics || {};
    return {
      series: [
        snapshot("Impressions", asNumber(metrics.IMPRESSION)),
        snapshot("Pin Clicks", asNumber(metrics.PIN_CLICK)),
        snapshot("Clicks", asNumber(metrics.OUTBOUND_CLICK)),
        snapshot("Saves", asNumber(metrics.SAVE)),
      ].filter((row): row is AnalyticsSeries => Boolean(row)),
      fetched: true,
    };
  }

  if (input.provider === "threads") {
    const { data } = await analyticsJson<{
      data?: Array<{ name?: string; values?: Array<{ value?: unknown }>; total_value?: { value?: unknown } }>;
    }>(
      `https://graph.threads.net/v1.0/${encodeURIComponent(releaseId)}/insights?metric=views,likes,replies,reposts,quotes&access_token=${encodeURIComponent(input.accessToken)}`
    );
    const series = (data.data || [])
      .map((row) => mapInsightValues(row.name || "", row.values, row.total_value))
      .filter((row): row is AnalyticsSeries => Boolean(row));
    return { series, fetched: true };
  }

  return { series: [], fetched: false, messageAr: "لا إحصاءات على مستوى المنشور لهذه المنصة." };
}
