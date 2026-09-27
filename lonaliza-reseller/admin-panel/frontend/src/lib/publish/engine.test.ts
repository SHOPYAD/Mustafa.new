import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createChannel } from "./channels";
import { runPublishPost } from "./engine";
import { createPost } from "./posts";
import { createPublishRegistry, setPublishRegistryForTests } from "./registry";
import { resetPublishFileMemory } from "./file-store";
import { resetPublishCryptoCache } from "./crypto";
import type { PublishProviderHandler } from "./types";

describe("publish engine approval gate", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;
  const prevSecret = process.env.PUBLISH_TOKEN_SECRET;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    process.env.PUBLISH_TOKEN_SECRET = "test-publish-token-secret-32";
    resetPublishFileMemory();
    resetPublishCryptoCache();
    let hits = 0;
    const fake: PublishProviderHandler = {
      id: "facebook",
      label: "Facebook",
      labelAr: "فيسبوك",
      implemented: true,
      publish: async () => {
        hits += 1;
        return { ok: true, provider: "facebook", releaseId: "no-network" };
      },
    };
    (fake as PublishProviderHandler & { hits?: () => number }).hits = () => hits;
    setPublishRegistryForTests(createPublishRegistry([fake]));
    (globalThis as { __publishHits?: () => number }).__publishHits = () => hits;
  });

  afterEach(() => {
    setPublishRegistryForTests(null);
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

  it("accepts the admin compose payload without throwing", async () => {
    const channel = await createChannel({
      provider: "facebook",
      name: "صفحة تجربة",
      accessToken: "tok",
    });
    const post = await createPost({
      content: "نص الملحن",
      title: "عنوان",
      publishDate: "2026-09-14T10:00:00.000Z",
      state: "queue",
      approved: false,
      creationMethod: "web",
      delay: 0,
      group: "",
      settings: {
        perChannel: { [channel.id]: { firstComment: "تعليق", extra: "ستوري" } },
        intent: "now",
      },
      channelId: channel.id,
    });
    expect(post.content).toBe("نص الملحن");
    expect(post.state).toBe("queue");
    expect(post.settings.approved).toBe(false);
    expect(post.creationMethod).toBe("web");
  });

  it("does not call the provider unless approved === true", async () => {
    const channel = await createChannel({
      provider: "facebook",
      name: "صفحة تجربة",
      accessToken: "tok",
    });
    const post = await createPost({
      channelId: channel.id,
      content: "تجربة",
      state: "queue",
      approved: false,
    });
    const { result } = await runPublishPost(post.id, { approved: false });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("not_approved");
    expect((globalThis as { __publishHits?: () => number }).__publishHits?.()).toBe(0);
  });

  it("calls the injected provider when approved === true", async () => {
    const channel = await createChannel({
      provider: "facebook",
      name: "صفحة تجربة",
      accessToken: "tok",
    });
    const post = await createPost({
      channelId: channel.id,
      content: "تجربة",
      state: "queue",
      approved: true,
    });
    const { result, post: next } = await runPublishPost(post.id, { approved: true });
    expect(result.ok).toBe(true);
    expect(next.state).toBe("published");
    expect(next.releaseId).toBe("no-network");
    expect((globalThis as { __publishHits?: () => number }).__publishHits?.()).toBe(1);
  });
});
