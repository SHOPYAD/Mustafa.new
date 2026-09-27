import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createChannel } from "./channels";
import { resetPublishCryptoCache } from "./crypto";
import { resetPublishFileMemory } from "./file-store";
import {
  firePublishWebhooks,
  isBlockedHostname,
  resetPublishWebhooksMemory,
  sanitizeWebhook,
  saveWebhook,
} from "./webhooks";
import { createPost } from "./posts";

describe("publish webhooks", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;
  const prevSecret = process.env.PUBLISH_TOKEN_SECRET;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-hooks-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    process.env.PUBLISH_TOKEN_SECRET = "test-publish-token-secret-32";
    resetPublishFileMemory();
    resetPublishWebhooksMemory();
    resetPublishCryptoCache();
  });

  afterEach(() => {
    resetPublishFileMemory();
    resetPublishWebhooksMemory();
    resetPublishCryptoCache();
    if (prevDir) process.env.PUBLISH_STORE_DIR = prevDir;
    else delete process.env.PUBLISH_STORE_DIR;
    if (prevForce) process.env.PUBLISH_FORCE_FILE = prevForce;
    else delete process.env.PUBLISH_FORCE_FILE;
    if (prevSecret) process.env.PUBLISH_TOKEN_SECRET = prevSecret;
    else delete process.env.PUBLISH_TOKEN_SECRET;
    rmSync(dir, { recursive: true, force: true });
  });

  it("maps PocketBase channelIds JSON", () => {
    const row = sanitizeWebhook({
      id: "webhook11111111",
      name: "تنبيه",
      url: "https://example.com/hook",
      channelIds: [{ id: "c1" }, "c2"],
    });
    expect(row?.channelIds).toEqual(["c1", "c2"]);
  });

  it("rejects private webhook hosts", () => {
    expect(isBlockedHostname("127.0.0.1")).toBe(true);
    expect(isBlockedHostname("10.0.0.8")).toBe(true);
    expect(isBlockedHostname("localhost")).toBe(true);
    expect(isBlockedHostname("hooks.example.com")).toBe(false);
  });

  it("POSTs JSON when a post is published", async () => {
    const channel = await createChannel({
      provider: "x",
      name: "إكس",
      accessToken: "tok",
    });
    await saveWebhook({
      name: "تنبيه لوناليزا",
      url: "https://example.com/hooks/publish",
      channelIds: [channel.id],
    });
    const post = await createPost({
      channelId: channel.id,
      content: "مرحبا",
      state: "queue",
      approved: true,
    });
    const calls: Array<{ url: string; body: string }> = [];
    const fetchImpl = (async (url: string | URL, init?: RequestInit) => {
      calls.push({ url: String(url), body: String(init?.body || "") });
      return new Response("ok", { status: 200 });
    }) as typeof fetch;
    const result = await firePublishWebhooks(post, "published", fetchImpl);
    expect(result.attempted).toBe(1);
    expect(result.sent).toBe(1);
    expect(calls[0]?.url).toBe("https://example.com/hooks/publish");
    const payload = JSON.parse(calls[0]?.body || "{}") as { event?: string; post?: { id?: string } };
    expect(payload.event).toBe("published");
    expect(payload.post?.id).toBe(post.id);
  });

  it("skips webhooks bound to other channels", async () => {
    const channel = await createChannel({
      provider: "x",
      name: "إكس",
      accessToken: "tok",
    });
    await saveWebhook({
      name: "فيسبوك فقط",
      url: "https://example.com/hooks/fb",
      channelIds: ["other-channel"],
    });
    const post = await createPost({
      channelId: channel.id,
      content: "مرحبا",
      state: "queue",
      approved: true,
    });
    const result = await firePublishWebhooks(post, "error", (async () => {
      throw new Error("should not fetch");
    }) as typeof fetch);
    expect(result.attempted).toBe(0);
    expect(result.sent).toBe(0);
  });
});
