import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createChannel } from "./channels";
import { resetPublishCryptoCache } from "./crypto";
import { resetPublishFileMemory } from "./file-store";
import {
  isMissingReleaseId,
  listMissingReleasePosts,
  MISSING_RELEASE_CANDIDATES_AR,
  patchReleaseId,
} from "./missing-release";
import { createPost } from "./posts";
import { saveStoredPost } from "./store";

describe("publish missing releaseId", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;
  const prevSecret = process.env.PUBLISH_TOKEN_SECRET;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-missing-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    process.env.PUBLISH_TOKEN_SECRET = "test-publish-token-secret-32";
    resetPublishFileMemory();
    resetPublishCryptoCache();
  });

  afterEach(() => {
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

  it("lists published posts without releaseId and patches one", async () => {
    const channel = await createChannel({
      provider: "facebook",
      name: "صفحة لوناليزا",
      accessToken: "tok",
    });
    const missing = await createPost({
      channelId: channel.id,
      content: "منشور بلا معرف",
      state: "draft",
    });
    await saveStoredPost(
      { ...missing, state: "published", releaseId: undefined },
      false
    );
    const withId = await createPost({
      channelId: channel.id,
      content: "منشور مربوط",
      state: "draft",
    });
    await saveStoredPost(
      { ...withId, state: "published", releaseId: "remote-99" },
      false
    );
    const draft = await createPost({
      channelId: channel.id,
      content: "مسودة",
      state: "draft",
    });

    expect(isMissingReleaseId({ ...missing, state: "published" })).toBe(true);
    expect(isMissingReleaseId({ ...withId, state: "published", releaseId: "remote-99" })).toBe(
      false
    );
    expect(isMissingReleaseId(draft)).toBe(false);

    const listed = await listMissingReleasePosts();
    expect(listed.candidates).toEqual([]);
    expect(listed.messageAr).toBe(MISSING_RELEASE_CANDIDATES_AR);
    expect(listed.posts).toHaveLength(1);
    expect(listed.posts[0]?.id).toBe(missing.id);
    expect(listed.posts[0]?.channelName).toBe("صفحة لوناليزا");

    const patched = await patchReleaseId(missing.id, "graph-123", "https://example.com/p/123");
    expect(patched?.releaseId).toBe("graph-123");
    expect(patched?.releaseURL).toBe("https://example.com/p/123");

    const after = await listMissingReleasePosts();
    expect(after.posts).toHaveLength(0);
  });
});
