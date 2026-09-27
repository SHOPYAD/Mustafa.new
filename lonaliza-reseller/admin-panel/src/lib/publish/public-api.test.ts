import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createChannel } from "./channels";
import { resetPublishCryptoCache } from "./crypto";
import { resetPublishFileMemory } from "./file-store";
import { NOT_APPROVED_AR } from "./constants";
import {
  createPublicApiPost,
  PublicApiApprovalError,
  wantsImmediatePublish,
} from "./public-api";
import { extractPublishApiKey } from "./public-auth";
import {
  generateDevKey,
  resetPublishSettingsMemory,
  verifyPublishDevKey,
} from "./settings-store";

describe("publish public API helpers", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;
  const prevSecret = process.env.PUBLISH_TOKEN_SECRET;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-public-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    process.env.PUBLISH_TOKEN_SECRET = "test-publish-token-secret-32";
    resetPublishFileMemory();
    resetPublishCryptoCache();
    resetPublishSettingsMemory();
  });

  afterEach(() => {
    resetPublishFileMemory();
    resetPublishCryptoCache();
    resetPublishSettingsMemory();
    if (prevDir) process.env.PUBLISH_STORE_DIR = prevDir;
    else delete process.env.PUBLISH_STORE_DIR;
    if (prevForce) process.env.PUBLISH_FORCE_FILE = prevForce;
    else delete process.env.PUBLISH_FORCE_FILE;
    if (prevSecret) process.env.PUBLISH_TOKEN_SECRET = prevSecret;
    else delete process.env.PUBLISH_TOKEN_SECRET;
    rmSync(dir, { recursive: true, force: true });
  });

  it("treats publishNow, published state, and intent=now as immediate", () => {
    expect(wantsImmediatePublish({ publishNow: true })).toBe(true);
    expect(wantsImmediatePublish({ state: "published" })).toBe(true);
    expect(wantsImmediatePublish({ settings: { intent: "now" } })).toBe(true);
    expect(wantsImmediatePublish({ state: "draft" })).toBe(false);
    expect(wantsImmediatePublish({ state: "queue" })).toBe(false);
  });

  it("rejects immediate publish without approved=true", async () => {
    await expect(
      createPublicApiPost({
        channelId: "c1",
        content: "الآن",
        publishNow: true,
        approved: false,
      })
    ).rejects.toBeInstanceOf(PublicApiApprovalError);
    await expect(
      createPublicApiPost({
        channelId: "c1",
        content: "الآن",
        state: "published",
      })
    ).rejects.toThrow(NOT_APPROVED_AR);
  });

  it("creates an API draft without approval", async () => {
    const channel = await createChannel({
      provider: "facebook",
      name: "صفحة",
      accessToken: "tok",
    });
    const post = await createPublicApiPost({
      channelId: channel.id,
      content: "مسودة واجهة عامة",
      state: "draft",
    });
    expect(post.creationMethod).toBe("api");
    expect(post.state).toBe("draft");
    expect(post.settings.approved).toBeUndefined();
  });

  it("creates an approved now post as queue", async () => {
    const channel = await createChannel({
      provider: "facebook",
      name: "صفحة",
      accessToken: "tok",
    });
    const post = await createPublicApiPost({
      integrationId: channel.id,
      content: "نشر معتمد",
      publishNow: true,
      approved: true,
    });
    expect(post.state).toBe("queue");
    expect(post.settings.approved).toBe(true);
    expect(post.creationMethod).toBe("api");
  });

  it("extracts and verifies the developer API key", async () => {
    const generated = await generateDevKey();
    const req = new Request("https://lonaliza.com/api/publish/v1/posts", {
      headers: { Authorization: `Bearer ${generated.apiKey}` },
    });
    expect(extractPublishApiKey(req)).toBe(generated.apiKey);
    expect(await verifyPublishDevKey(generated.apiKey)).toBe(true);
    const headerReq = new Request("https://lonaliza.com/api/publish/v1/posts", {
      headers: { "x-api-key": generated.apiKey },
    });
    expect(extractPublishApiKey(headerReq)).toBe(generated.apiKey);
  });
});
