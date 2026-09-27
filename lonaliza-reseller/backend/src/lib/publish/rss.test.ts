import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createChannel } from "./channels";
import { resetPublishCryptoCache } from "./crypto";
import { resetPublishFileMemory } from "./file-store";
import { listStoredPosts } from "./store";
import {
  findNextFreeSlot,
  parseRssXml,
  resetPublishRssMemory,
  runRssAutopost,
  sanitizeRssFeed,
  saveRssFeed,
} from "./rss";

const SAMPLE_RSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>لوناليزا</title>
    <item>
      <title>كابادوكيا</title>
      <link>https://lonaliza.com/blog/cappadocia</link>
      <pubDate>Mon, 14 Sep 2026 10:00:00 GMT</pubDate>
      <description>منطاد فوق الكابادوكيا</description>
    </item>
    <item>
      <title>قديم</title>
      <link>https://lonaliza.com/blog/old</link>
      <pubDate>Mon, 01 Jan 2024 10:00:00 GMT</pubDate>
      <description>قديم</description>
    </item>
  </channel>
</rss>`;

describe("publish RSS autopost", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;
  const prevSecret = process.env.PUBLISH_TOKEN_SECRET;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-rss-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    process.env.PUBLISH_TOKEN_SECRET = "test-publish-token-secret-32";
    resetPublishFileMemory();
    resetPublishRssMemory();
    resetPublishCryptoCache();
  });

  afterEach(() => {
    resetPublishFileMemory();
    resetPublishRssMemory();
    resetPublishCryptoCache();
    if (prevDir) process.env.PUBLISH_STORE_DIR = prevDir;
    else delete process.env.PUBLISH_STORE_DIR;
    if (prevForce) process.env.PUBLISH_FORCE_FILE = prevForce;
    else delete process.env.PUBLISH_FORCE_FILE;
    if (prevSecret) process.env.PUBLISH_TOKEN_SECRET = prevSecret;
    else delete process.env.PUBLISH_TOKEN_SECRET;
    rmSync(dir, { recursive: true, force: true });
  });

  it("parses RSS items and picks the newest link", () => {
    const items = parseRssXml(SAMPLE_RSS);
    expect(items).toHaveLength(2);
    expect(items[0]?.url).toBe("https://lonaliza.com/blog/cappadocia");
  });

  it("maps PocketBase integrations JSON", () => {
    const row = sanitizeRssFeed({
      id: "rssfeed11111111",
      title: "مدونة",
      url: "https://lonaliza.com/rss.xml",
      onSlot: true,
      syncLast: false,
      generateContent: true,
      integrations: [{ id: "chan-a" }, "chan-b"],
      lastUrl: "https://lonaliza.com/blog/old",
      active: true,
    });
    expect(row?.integrations).toEqual([{ id: "chan-a" }, { id: "chan-b" }]);
    expect(row?.lastUrl).toBe("https://lonaliza.com/blog/old");
    expect(row?.onSlot).toBe(true);
  });

  it("finds the next free posting slot", () => {
    const now = new Date("2026-09-14T10:30:00.000Z");
    const slot = findNextFreeSlot(
      {
        id: "c1",
        provider: "x",
        name: "إكس",
        disabled: false,
        refreshNeeded: false,
        postingTimes: [{ time: 8 * 60 }, { time: 16 * 60 }],
      },
      [],
      now
    );
    expect(slot).toBe("2026-09-14T16:00:00.000Z");
  });

  it("creates queued autoposts for a new RSS item", async () => {
    const channel = await createChannel({
      provider: "x",
      name: "إكس لوناليزا",
      accessToken: "tok",
    });
    await saveRssFeed({
      title: "مدونة",
      url: "https://lonaliza.com/rss.xml",
      active: true,
      onSlot: false,
      syncLast: true,
      generateContent: false,
      addPicture: false,
      integrations: [{ id: channel.id }],
    });
    const fetchImpl = (async () =>
      new Response(SAMPLE_RSS, {
        status: 200,
        headers: { "Content-Type": "application/rss+xml" },
      })) as typeof fetch;
    const stats = await runRssAutopost({ fetchImpl, force: true });
    expect(stats.created).toBe(1);
    expect(stats.fired).toBe(1);
    const posts = await listStoredPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0]?.creationMethod).toBe("autopost");
    expect(posts[0]?.state).toBe("queue");
    expect(posts[0]?.settings.approved).toBe(true);
    expect(posts[0]?.content).toContain("https://lonaliza.com/blog/cappadocia");
  });

  it("skips when lastUrl already matches the newest item", async () => {
    const channel = await createChannel({
      provider: "x",
      name: "إكس",
      accessToken: "tok",
    });
    await saveRssFeed({
      title: "مدونة",
      url: "https://lonaliza.com/rss.xml",
      active: true,
      syncLast: false,
      lastUrl: "https://lonaliza.com/blog/cappadocia",
      generateContent: false,
      integrations: [{ id: channel.id }],
    });
    const fetchImpl = (async () => new Response(SAMPLE_RSS, { status: 200 })) as typeof fetch;
    const stats = await runRssAutopost({ fetchImpl, force: true });
    expect(stats.created).toBe(0);
    expect(stats.skipped).toBe(1);
    expect(await listStoredPosts()).toHaveLength(0);
  });
});
