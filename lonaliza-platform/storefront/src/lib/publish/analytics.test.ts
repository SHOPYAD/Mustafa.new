import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getChannelAnalytics, getPostAnalytics, LIVE_ANALYTICS_PROVIDERS } from "./analytics";
import { createChannel } from "./channels";
import { resetPublishCryptoCache } from "./crypto";
import { resetPublishFileMemory } from "./file-store";
import { createPost } from "./posts";

const HOST: Record<string, string> = {
  facebook: "graph.facebook.com",
  instagram: "graph.facebook.com",
  "instagram-standalone": "graph.instagram.com",
  "linkedin-page": "api.linkedin.com",
  tiktok: "open.tiktokapis.com",
  "tiktok-business": "business-api.tiktok.com",
  youtube: "youtubeanalytics.googleapis.com",
  gmb: "businessprofileperformance.googleapis.com",
  pinterest: "api.pinterest.com",
  threads: "graph.threads.net",
  x: "api.twitter.com",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("publish live analytics", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;
  const prevSecret = process.env.PUBLISH_TOKEN_SECRET;
  const originalFetch = globalThis.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-analytics-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    process.env.PUBLISH_TOKEN_SECRET = "test-publish-token-secret-32";
    resetPublishFileMemory();
    resetPublishCryptoCache();
    fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    resetPublishFileMemory();
    resetPublishCryptoCache();
    if (prevDir) process.env.PUBLISH_STORE_DIR = prevDir;
    else delete process.env.PUBLISH_STORE_DIR;
    if (prevForce) process.env.PUBLISH_FORCE_FILE = prevForce;
    else delete process.env.PUBLISH_FORCE_FILE;
    if (prevSecret) process.env.PUBLISH_TOKEN_SECRET = prevSecret;
    else delete process.env.PUBLISH_TOKEN_SECRET;
    rmSync(dir, { recursive: true, force: true });
  });

  it("does not invent numbers or HTTP-fetch when the token is missing", async () => {
    const channel = await createChannel({
      provider: "facebook",
      name: "صفحة بلا رمز",
      extra: { pageId: "111" },
    });
    const result = await getChannelAnalytics(channel.id, 7);
    expect(result?.status).toBe("missing_token");
    expect(result?.live).toBe(false);
    expect(result?.series).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(LIVE_ANALYTICS_PROVIDERS)("HTTP-fetches live %s metrics when a token exists", async (provider) => {
    const channel = await createChannel({
      provider,
      name: provider,
      accessToken: "live-access-token",
      pageAccessToken: "live-page-token",
      extra: {
        externalId: "ext-99",
        pageId: "page-99",
        instagramUserId: "ig-99",
      },
    });
    const result = await getChannelAnalytics(channel.id, 7);
    expect(result, provider).toBeTruthy();
    expect(result?.source, provider).toBe("live");
    expect(result?.series.every((row) => row.data.every((point) => Number.isFinite(point.total))), provider).toBe(
      true
    );
    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls.length, provider).toBeGreaterThan(0);
    expect(
      urls.some((url) => url.includes(HOST[provider])),
      `${provider} → ${HOST[provider]} in ${urls.join(" | ")}`
    ).toBe(true);
  });

  it("maps Facebook Graph insight totals without inventing extra series", async () => {
    fetchMock.mockImplementation((url: unknown) => {
      const href = String(url);
      if (href.includes("/insights")) {
        return Promise.resolve(
          jsonResponse({
            data: [
              {
                name: "page_post_engagements",
                values: [{ value: 12, end_time: "2026-09-14T07:00:00+0000" }],
              },
            ],
          })
        );
      }
      return Promise.resolve(jsonResponse({ fan_count: 40, followers_count: 40 }));
    });
    const channel = await createChannel({
      provider: "facebook",
      name: "فيسبوك",
      accessToken: "user-token",
      pageAccessToken: "page-token",
      extra: { pageId: "555" },
    });
    const result = await getChannelAnalytics(channel.id, 7);
    expect(result?.status).toBe("ok");
    expect(result?.live).toBe(true);
    expect(result?.series.map((row) => ({ label: row.label, total: row.data[0]?.total }))).toEqual([
      { label: "Posts Engagement", total: 12 },
      { label: "Page followers", total: 40 },
    ]);
  });

  it("returns honest empty post analytics without a releaseId", async () => {
    const channel = await createChannel({
      provider: "youtube",
      name: "يوتيوب",
      accessToken: "yt-token",
      extra: { externalId: "UCtest" },
    });
    const post = await createPost({
      channelId: channel.id,
      content: "منشور",
      state: "draft",
      approved: false,
    });
    fetchMock.mockClear();
    const result = await getPostAnalytics(post.id, 7);
    expect(result?.missingReleaseId).toBe(true);
    expect(result?.series).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
