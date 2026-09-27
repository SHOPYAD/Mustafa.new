import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AGENT_QUESTION_REPLY_AR,
  extractCaption,
  handlePublishAgentMessage,
  isQuestionOnly,
} from "./agent";
import { createChannel } from "./channels";
import { resetPublishCryptoCache } from "./crypto";
import { resetPublishFileMemory } from "./file-store";

describe("publish agent", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;
  const prevSecret = process.env.PUBLISH_TOKEN_SECRET;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-agent-"));
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

  it("treats questions as compose/calendar guidance", () => {
    expect(isQuestionOnly("هل يمكن النشر من هنا؟")).toBe(true);
    expect(extractCaption('جدول كابشن: "مرحبا كابادوكيا"')).toBe("مرحبا كابادوكيا");
  });

  it("does not create a post for a question", async () => {
    const result = await handlePublishAgentMessage({
      message: "كيف أجدول منشوراً على إنستغرام؟",
      creationMethod: "agent",
    });
    expect(result.posts).toEqual([]);
    expect(result.approved).toBe(false);
    expect(result.reply).toBe(AGENT_QUESTION_REPLY_AR);
  });

  it("creates an unapproved draft when asked to schedule with a caption", async () => {
    const channel = await createChannel({
      provider: "instagram",
      name: "إنستغرام لوناليزا",
      accessToken: "tok",
    });
    const result = await handlePublishAgentMessage({
      message: 'جدول غداً على إنستغرام كابشن: "ريل كابادوكيا"',
      creationMethod: "agent",
    });
    expect(result.approved).toBe(false);
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].channelId).toBe(channel.id);
    expect(result.posts[0].content).toBe("ريل كابادوكيا");
    expect(result.posts[0].state).toBe("draft");
    expect(result.posts[0].creationMethod).toBe("agent");
    expect(result.posts[0].settings.approved).toBe(false);
  });
});
