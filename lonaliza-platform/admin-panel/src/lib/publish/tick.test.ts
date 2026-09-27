import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetPublishCryptoCache } from "./crypto";
import { resetPublishFileMemory } from "./file-store";
import { resetPublishPlugsMemory } from "./plugs";
import { resetPublishRssMemory } from "./rss";
import { tickPublishEngine } from "./tick";
import { resetPublishWebhooksMemory } from "./webhooks";

describe("publish worker tick automations", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;
  const prevSecret = process.env.PUBLISH_TOKEN_SECRET;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-tick-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    process.env.PUBLISH_TOKEN_SECRET = "test-publish-token-secret-32";
    resetPublishFileMemory();
    resetPublishRssMemory();
    resetPublishPlugsMemory();
    resetPublishWebhooksMemory();
    resetPublishCryptoCache();
  });

  afterEach(() => {
    resetPublishFileMemory();
    resetPublishRssMemory();
    resetPublishPlugsMemory();
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

  it("returns rss and plugs stats on every tick", async () => {
    const result = await tickPublishEngine("test");
    expect(result.rss).toEqual({
      checked: 0,
      created: 0,
      fired: 0,
      skipped: 0,
      errors: 0,
    });
    expect(result.plugs).toEqual({
      checked: 0,
      created: 0,
      fired: 0,
      skipped: 0,
      errors: 0,
    });
    expect(result.due).toBe(0);
  });
});
