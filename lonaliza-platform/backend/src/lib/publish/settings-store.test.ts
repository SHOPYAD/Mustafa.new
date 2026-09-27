import { mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  generateDevKey,
  getDevKeyPublic,
  listSets,
  listSignatures,
  maskApiKey,
  resetPublishSettingsMemory,
  sanitizeSet,
  sanitizeSignature,
  saveSet,
  saveSignature,
  verifyPublishDevKey,
} from "./settings-store";

describe("publish settings store", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-settings-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    resetPublishSettingsMemory();
  });

  afterEach(() => {
    resetPublishSettingsMemory();
    if (prevDir) process.env.PUBLISH_STORE_DIR = prevDir;
    else delete process.env.PUBLISH_STORE_DIR;
    if (prevForce) process.env.PUBLISH_FORCE_FILE = prevForce;
    else delete process.env.PUBLISH_FORCE_FILE;
    rmSync(dir, { recursive: true, force: true });
  });

  it("maps PocketBase signature fields without a name", () => {
    const row = sanitizeSignature({
      id: "sigid1111111111",
      content: "— لوناليزا للسفر",
      autoAdd: true,
      actorId: "admin",
    });
    expect(row?.id).toBe("sigid1111111111");
    expect(row?.content).toBe("— لوناليزا للسفر");
    expect(row?.autoAdd).toBe(true);
    expect(row?.name).toBe("— لوناليزا للسفر");
  });

  it("maps PocketBase set content JSON to channelIds", () => {
    const row = sanitizeSet({
      id: "setid1111111111",
      name: "لوناليزا",
      content: { channelIds: ["c1", "c2"] },
    });
    expect(row?.channelIds).toEqual(["c1", "c2"]);
  });

  it("persists signatures and sets to the file fallback", async () => {
    const signature = await saveSignature({
      name: "خاتمة",
      content: "احجز مع لوناليزا",
      autoAdd: true,
    });
    const set = await saveSet({
      name: "شبكات أساسية",
      channelIds: ["chan-a", "chan-b"],
    });
    resetPublishSettingsMemory();
    const signatures = await listSignatures();
    const sets = await listSets();
    expect(signatures).toEqual([
      expect.objectContaining({
        id: signature.id,
        name: "خاتمة",
        content: "احجز مع لوناليزا",
        autoAdd: true,
      }),
    ]);
    expect(sets).toEqual([
      expect.objectContaining({
        id: set.id,
        name: "شبكات أساسية",
        channelIds: ["chan-a", "chan-b"],
      }),
    ]);
  });

  it("generates a reveal-once key stored hashed and plain", async () => {
    const generated = await generateDevKey();
    expect(generated.apiKey.startsWith("lzpub_")).toBe(true);
    expect(generated.hasApiKey).toBe(true);
    expect(generated.apiKeyMasked).toBe(maskApiKey(generated.apiKey));
    expect(generated.apiKeyMasked.includes(generated.apiKey)).toBe(false);

    const disk = JSON.parse(readFileSync(path.join(dir, "dev-key.json"), "utf8")) as {
      hash: string;
      plain: string;
      revealed: boolean;
    };
    expect(disk.plain).toBe(generated.apiKey);
    expect(disk.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(disk.hash).not.toBe(generated.apiKey);
    expect(disk.revealed).toBe(true);

    resetPublishSettingsMemory();
    const publicView = await getDevKeyPublic();
    expect(publicView.hasApiKey).toBe(true);
    expect(publicView.apiKeyMasked).toBe(generated.apiKeyMasked);
    expect(JSON.stringify(publicView)).not.toContain(generated.apiKey);
    expect(await verifyPublishDevKey(generated.apiKey)).toBe(true);
    expect(await verifyPublishDevKey("wrong")).toBe(false);
  });
});
