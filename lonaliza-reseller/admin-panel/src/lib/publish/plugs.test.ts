import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createChannel } from "./channels";
import { resetPublishCryptoCache } from "./crypto";
import { resetPublishFileMemory } from "./file-store";
import {
  resetPublishPlugsMemory,
  runDuePlugs,
  sanitizePlug,
  savePlug,
} from "./plugs";
import { createPost } from "./posts";
import { saveStoredPost } from "./store";
import { toPublished, toQueued } from "./state";
import { listStoredPosts } from "./store";

describe("publish plugs", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;
  const prevSecret = process.env.PUBLISH_TOKEN_SECRET;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-plugs-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    process.env.PUBLISH_TOKEN_SECRET = "test-publish-token-secret-32";
    resetPublishFileMemory();
    resetPublishPlugsMemory();
    resetPublishCryptoCache();
  });

  afterEach(() => {
    resetPublishFileMemory();
    resetPublishPlugsMemory();
    resetPublishCryptoCache();
    if (prevDir) process.env.PUBLISH_STORE_DIR = prevDir;
    else delete process.env.PUBLISH_STORE_DIR;
    if (prevForce) process.env.PUBLISH_FORCE_FILE = prevForce;
    else delete process.env.PUBLISH_FORCE_FILE;
    if (prevSecret) process.env.PUBLISH_TOKEN_SECRET = prevSecret;
    else delete process.env.PUBLISH_TOKEN_SECRET;
    rmSync(dir, { recursive: true, force: true });
  });

  it("maps PocketBase channel relation and data JSON", () => {
    const row = sanitizePlug({
      id: "plugid111111111",
      plugFunction: "autoRepostPost",
      channel: "chanid111111111",
      activated: true,
      data: [{ name: "likesAmount", value: "12" }],
    });
    expect(row?.channelId).toBe("chanid111111111");
    expect(row?.plugFunction).toBe("autoRepostPost");
    expect(row?.data).toEqual([{ name: "likesAmount", value: "12" }]);
    expect(row?.activated).toBe(true);
  });

  it("queues a comment plug when likes meet the threshold", async () => {
    const channel = await createChannel({
      provider: "x",
      name: "إكس",
      accessToken: "tok",
    });
    await savePlug({
      channelId: channel.id,
      plugFunction: "autoPlugPost",
      activated: true,
      data: [
        { name: "likesAmount", value: "5" },
        { name: "post", value: "احجز مع لوناليزا" },
      ],
    });
    const draft = await createPost({
      channelId: channel.id,
      content: "ريل كابادوكيا",
      state: "queue",
      approved: true,
      publishDate: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    });
    await saveStoredPost(
      toPublished(toQueued(draft, draft.publishDate), { releaseId: "tweet-1" }),
      false
    );

    const stats = await runDuePlugs({
      now: new Date(),
      likesFetcher: async () => 9,
    });
    expect(stats.fired).toBe(1);
    expect(stats.created).toBe(1);
    const posts = await listStoredPosts();
    const follow = posts.find((row) => row.parentPostId === draft.id);
    expect(follow?.content).toBe("احجز مع لوناليزا");
    expect(follow?.creationMethod).toBe("autopost");
    expect(follow?.settings.approved).toBe(true);
    expect(follow?.settings.plugKind).toBe("comment");
  });

  it("does not fire when likes are below the threshold", async () => {
    const channel = await createChannel({
      provider: "x",
      name: "إكس",
      accessToken: "tok",
    });
    await savePlug({
      channelId: channel.id,
      plugFunction: "autoRepostPost",
      activated: true,
      data: [{ name: "likesAmount", value: "20" }],
    });
    const draft = await createPost({
      channelId: channel.id,
      content: "تجربة",
      state: "queue",
      approved: true,
      publishDate: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    });
    await saveStoredPost(
      toPublished(toQueued(draft, draft.publishDate), { releaseId: "tweet-2" }),
      false
    );
    const stats = await runDuePlugs({
      now: new Date(),
      likesFetcher: async () => 3,
    });
    expect(stats.fired).toBe(0);
    const posts = await listStoredPosts();
    expect(posts.filter((row) => row.parentPostId === draft.id)).toHaveLength(0);
  });
});
