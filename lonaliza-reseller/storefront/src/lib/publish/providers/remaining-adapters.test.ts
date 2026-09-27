import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NOT_APPROVED_AR } from "../constants";
import { createPublishRegistry } from "../registry";
import type { PublishContext, PublishPost, StoredPublishChannel } from "../types";
import { HTTP_ADAPTER_IDS } from "./http-adapters";
import type { ValidatingPublishHandler } from "./http-base";

const NEW_IDS = [
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

const HEX_SK = "aa".repeat(32);

function jsonResponse(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function fakeCtx(
  provider: string,
  patch: Partial<PublishContext> & {
    settings?: Record<string, unknown>;
    extra?: Record<string, unknown>;
  } = {}
): PublishContext {
  const post: PublishPost = {
    id: "p1",
    state: "queue",
    publishDate: new Date().toISOString(),
    channelId: "c1",
    content: patch.caption || "تجربة",
    delay: 0,
    group: "",
    settings: { approved: true, ...(patch.settings || {}) },
    creationMethod: "web",
  };
  const channel: StoredPublishChannel = {
    id: "c1",
    provider,
    name: "test",
    disabled: false,
    refreshNeeded: false,
    accessTokenEnc: "",
    refreshTokenEnc: "",
    pageAccessTokenEnc: "",
    extra: {
      externalId: "ext-1",
      pageId: "page-1",
      username: "lonaliza",
      ...(patch.extra || {}),
    },
  };
  return {
    post,
    channel,
    approved: patch.approved ?? true,
    caption: patch.caption ?? "تجربة",
    mediaUrls: patch.mediaUrls ?? [],
    accessToken: patch.accessToken === undefined ? "access-token" : patch.accessToken,
    refreshToken: patch.refreshToken,
  };
}

describe("remaining Postiz HTTP adapters", () => {
  const registry = createPublishRegistry();
  const originalFetch = globalThis.fetch;
  const originalWs = globalThis.WebSocket;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    process.env.DISCORD_BOT_TOKEN = "discord-bot";
    process.env.TWITCH_CLIENT_ID = "twitch-app";
    process.env.NEYNAR_SECRET_KEY = "neynar-key";
    process.env.MEWE_APP_ID = "mewe-app";
    process.env.MEWE_API_KEY = "mewe-key";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.WebSocket = originalWs;
    delete process.env.DISCORD_BOT_TOKEN;
    delete process.env.TWITCH_CLIENT_ID;
    delete process.env.NEYNAR_SECRET_KEY;
    delete process.env.MEWE_APP_ID;
    delete process.env.MEWE_API_KEY;
    vi.restoreAllMocks();
  });

  it("registers every remaining provider as implemented", () => {
    for (const id of NEW_IDS) {
      const handler = registry.get(id) as ValidatingPublishHandler;
      expect(handler.implemented, id).toBe(true);
      expect(handler.maxLength, id).toBeGreaterThan(0);
      expect(handler.settingsSchema, id).toBeTruthy();
      expect(HTTP_ADAPTER_IDS).toContain(id);
    }
  });

  it("never hits the network when approved is not true", async () => {
    for (const id of NEW_IDS) {
      const result = await registry.get(id).publish(
        fakeCtx(id, {
          approved: false,
          settings: { title: "t", subreddit: "travel", channel: "ch", group: "g", experience: "e", publication: "p", list: 1, subject: "s" },
          mediaUrls: ["https://cdn.example/a.jpg"],
        })
      );
      expect(result.ok, id).toBe(false);
      expect(result.error?.code, id).toBe("not_approved");
      expect(result.error?.message, id).toBe(NOT_APPROVED_AR);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns Arabic missing_credentials without network", async () => {
    const cases: Array<{ id: string; settings?: Record<string, unknown>; extra?: Record<string, unknown>; mediaUrls?: string[] }> = [
      { id: "reddit", settings: { subreddit: "travel", title: "رحلة" } },
      { id: "instagram-standalone", mediaUrls: ["https://cdn.example/a.jpg"] },
      { id: "tiktok-business", mediaUrls: ["https://cdn.example/a.mp4"] },
      { id: "dribbble", settings: { title: "لقطة" }, mediaUrls: ["https://cdn.example/a.jpg"] },
      { id: "discord", settings: { channel: "111" } },
      { id: "slack", settings: { channel: "C1" } },
      { id: "kick", extra: { externalId: "99" } },
      { id: "twitch" },
      { id: "mastodon" },
      { id: "bluesky" },
      { id: "lemmy", settings: { subreddit: [{ value: { id: "1", title: "t" } }] } },
      { id: "wrapcast" },
      { id: "nostr" },
      { id: "vk" },
      { id: "medium", settings: { title: "مقال" } },
      { id: "devto", settings: { title: "مقال" } },
      { id: "hashnode", settings: { title: "مقال", publication: "pub" } },
      { id: "wordpress", settings: { title: "مقال" } },
      { id: "listmonk", settings: { subject: "نشرة", list: 1 } },
      { id: "moltbook" },
      { id: "whop", settings: { experience: "exp" } },
      { id: "skool", settings: { group: "g1" } },
      { id: "mewe", settings: { group: "g1" } },
      { id: "tumblr" },
    ];
    for (const row of cases) {
      if (row.id === "discord") delete process.env.DISCORD_BOT_TOKEN;
      if (row.id === "wrapcast") delete process.env.NEYNAR_SECRET_KEY;
      if (row.id === "mewe") delete process.env.MEWE_APP_ID;
      if (row.id === "twitch") delete process.env.TWITCH_CLIENT_ID;
      const result = await registry.get(row.id).publish(
        fakeCtx(row.id, {
          accessToken: "",
          settings: row.settings,
          extra: row.extra,
          mediaUrls: row.mediaUrls,
        })
      );
      expect(result.ok, row.id).toBe(false);
      expect(result.error?.code, row.id).toBe("missing_credentials");
      expect(result.error?.message, row.id).toMatch(/أعد ربط|لا يوجد|احفظ|أضف|يحتاج/);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates Postiz media/char/thread rules without network", () => {
    const reddit = registry.get("reddit") as ValidatingPublishHandler;
    expect(reddit.validate(fakeCtx("reddit"))[0]?.message).toMatch(/مجتمع/);
    expect(
      reddit.validate(
        fakeCtx("reddit", {
          settings: { subreddit: [{ value: { subreddit: "travel", title: "t", type: "media" } }] },
        })
      )[0]?.message
    ).toMatch(/ملفاً واحداً/);

    const ig = registry.get("instagram-standalone") as ValidatingPublishHandler;
    expect(ig.validate(fakeCtx("instagram-standalone"))[0]?.message).toMatch(/وسائط/);
    expect(
      ig.validate(
        fakeCtx("instagram-standalone", {
          settings: { is_trial_reel: true },
          mediaUrls: ["https://cdn.example/a.jpg"],
        })
      )[0]?.message
    ).toMatch(/فيديو/);

    const tk = registry.get("tiktok-business") as ValidatingPublishHandler;
    expect(
      tk.validate(
        fakeCtx("tiktok-business", {
          mediaUrls: ["https://cdn.example/a.mp4", "https://cdn.example/b.jpg"],
        })
      )[0]?.message
    ).toMatch(/صور فقط/);

    const bsky = registry.get("bluesky") as ValidatingPublishHandler;
    expect(bsky.validate(fakeCtx("bluesky", { caption: "س".repeat(301) }))[0]?.message).toMatch(/300/);
    expect(
      bsky.validate(
        fakeCtx("bluesky", {
          mediaUrls: ["https://cdn.example/a.mp4", "https://cdn.example/b.jpg"],
        })
      )[0]?.message
    ).toMatch(/فيديو واحد/);

    const wrap = registry.get("wrapcast") as ValidatingPublishHandler;
    expect(
      wrap.validate(fakeCtx("wrapcast", { mediaUrls: ["https://cdn.example/a.mp4"] }))[0]?.message
    ).toMatch(/صور فقط/);

    const hashnode = registry.get("hashnode") as ValidatingPublishHandler;
    expect(hashnode.validate(fakeCtx("hashnode", { settings: { title: "t" } }))[0]?.message).toMatch(/publication/);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reddit: submits a self post", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ json: { errors: [], data: { id: "abc123", url: "https://www.reddit.com/r/travel/abc123" } } }));
    const result = await registry.get("reddit").publish(
      fakeCtx("reddit", { settings: { subreddit: "travel", title: "رحلة إسطنبول" } })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("abc123");
    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/oauth\.reddit\.com\/api\/submit/);
  });

  it("instagram-standalone: creates and publishes a single image on graph.instagram.com", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("media_publish")) return jsonResponse({ id: "ig-9" });
      if (url.includes("/media?")) return jsonResponse({ id: "container-1" });
      if (url.includes("fields=status")) return jsonResponse({ status_code: "FINISHED" });
      if (url.includes("permalink")) return jsonResponse({ permalink: "https://www.instagram.com/p/ig-9" });
      if (url.includes("/comments")) return jsonResponse({ id: "c1" });
      return jsonResponse({});
    });
    const result = await registry.get("instagram-standalone").publish(
      fakeCtx("instagram-standalone", { mediaUrls: ["https://cdn.example/photo.jpg"] })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("ig-9");
    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/graph\.instagram\.com/);
  });

  it("tiktok-business: publishes a video via the Business API", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/business/video/publish/")) return jsonResponse({ code: 0, data: { share_id: "share-1" } });
      if (url.includes("/business/publish/status/")) {
        return jsonResponse({ code: 0, data: { status: "PUBLISH_COMPLETE", post_ids: ["777"] } });
      }
      return jsonResponse({ code: 0, data: {} });
    });
    const result = await registry.get("tiktok-business").publish(
      fakeCtx("tiktok-business", { mediaUrls: ["https://cdn.example/clip.mp4"] })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("777");
    expect(result.releaseURL).toContain("/video/777");
  });

  it("discord: posts a text message with the bot token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "m-1" }));
    const result = await registry.get("discord").publish(fakeCtx("discord", { settings: { channel: "333" } }));
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("m-1");
    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/discord\.com\/api\/channels\/333\/messages/);
  });

  it("slack: joins, posts, and reads permalink", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("conversations.join")) return jsonResponse({ ok: true });
      if (url.includes("chat.postMessage")) return jsonResponse({ ok: true, ts: "1.2", channel: "C1" });
      if (url.includes("chat.getPermalink")) return jsonResponse({ ok: true, permalink: "https://slack.com/archives/C1/p12" });
      return jsonResponse({ ok: true });
    });
    const result = await registry.get("slack").publish(fakeCtx("slack", { settings: { channel: "C1" } }));
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("1.2");
    expect(result.releaseURL).toContain("slack.com");
  });

  it("mastodon: posts a text status", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "st-1" }));
    const result = await registry.get("mastodon").publish(fakeCtx("mastodon"));
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("st-1");
    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/mastodon\.social\/api\/v1\/statuses/);
  });

  it("medium: publishes markdown to the user endpoint", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { id: "med-1", url: "https://medium.com/p/med-1" } }));
    const result = await registry.get("medium").publish(fakeCtx("medium", { settings: { title: "دليل إسطنبول" } }));
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("med-1");
  });

  it("wrapcast: publishes a Neynar cast", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ cast: { hash: "0xabc", author: { username: "lonaliza" } } })
    );
    const result = await registry.get("wrapcast").publish(fakeCtx("wrapcast"));
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("0xabc");
    expect(result.releaseURL).toContain("warpcast.com");
  });

  it("wordpress: creates a REST post", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 88, link: "https://blog.example/p/88" }));
    const result = await registry.get("wordpress").publish(
      fakeCtx("wordpress", {
        extra: { domain: "https://blog.example", username: "ed", password: "app-pass" },
        settings: { title: "مقال" },
      })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("88");
  });

  it("tumblr: creates a text NPF post", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ response: { id_string: "t-9" } }));
    const result = await registry.get("tumblr").publish(fakeCtx("tumblr", { extra: { externalId: "lonaliza" } }));
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("t-9");
  });

  it("nostr: signs and publishes over WebSocket", async () => {
    class FakeWs {
      static OPEN = 1;
      readyState = 1;
      listeners: Record<string, Array<(ev?: { data?: string }) => void>> = {};
      addEventListener(type: string, fn: (ev?: { data?: string }) => void) {
        this.listeners[type] = this.listeners[type] || [];
        this.listeners[type].push(fn);
        if (type === "open") queueMicrotask(() => fn());
      }
      send(data: string) {
        const parsed = JSON.parse(data) as [string, { id?: string }];
        const id = parsed[1]?.id || "evt";
        for (const fn of this.listeners.message || []) {
          fn({ data: JSON.stringify(["OK", id, true]) });
        }
      }
      close() {}
    }
    globalThis.WebSocket = FakeWs as unknown as typeof WebSocket;
    const result = await registry.get("nostr").publish(
      fakeCtx("nostr", { extra: { password: HEX_SK } })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toMatch(/^[0-9a-f]{64}$/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps 401 to needs_reauth", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: "Invalid token" } }, 401));
    const result = await registry.get("mastodon").publish(fakeCtx("mastodon"));
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("needs_reauth");
    expect(result.error?.message).toMatch(/إعادة تحقق/);
  });
});
