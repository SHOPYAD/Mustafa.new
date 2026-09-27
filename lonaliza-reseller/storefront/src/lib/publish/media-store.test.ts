import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listMedia, resetPublishMediaMemory, sanitizeMedia, saveMedia } from "./media-store";

describe("publish media store", () => {
  let dir: string;
  const prevDir = process.env.PUBLISH_STORE_DIR;
  const prevForce = process.env.PUBLISH_FORCE_FILE;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "lonaliza-publish-media-"));
    process.env.PUBLISH_STORE_DIR = dir;
    process.env.PUBLISH_FORCE_FILE = "1";
    resetPublishMediaMemory();
  });

  afterEach(() => {
    resetPublishMediaMemory();
    if (prevDir) process.env.PUBLISH_STORE_DIR = prevDir;
    else delete process.env.PUBLISH_STORE_DIR;
    if (prevForce) process.env.PUBLISH_FORCE_FILE = prevForce;
    else delete process.env.PUBLISH_FORCE_FILE;
    rmSync(dir, { recursive: true, force: true });
  });

  it("maps PocketBase media path / originalName / fileSize", () => {
    const row = sanitizeMedia({
      id: "mediaid11111111",
      name: "",
      originalName: "cappadocia.jpg",
      path: "/uploads/studio/images/x-publish.jpg",
      type: "image",
      fileSize: 2048,
      thumbnail: "/uploads/studio/images/x-publish.jpg",
      alt: "كابادوكيا",
      created: "2026-09-14T10:00:00.000Z",
    });
    expect(row?.id).toBe("mediaid11111111");
    expect(row?.name).toBe("cappadocia.jpg");
    expect(row?.url).toBe("/uploads/studio/images/x-publish.jpg");
    expect(row?.size).toBe(2048);
    expect(row?.alt).toBe("كابادوكيا");
  });

  it("persists media metadata to the file fallback", async () => {
    const saved = await saveMedia({
      name: "ريل كابادوكيا",
      url: "https://cdn.example.com/reel.mp4",
      type: "video",
      mime: "video/mp4",
      size: 1000,
    });
    resetPublishMediaMemory();
    const rows = await listMedia();
    expect(rows.find((row) => row.id === saved.id)).toEqual(
      expect.objectContaining({
        id: saved.id,
        name: "ريل كابادوكيا",
        url: "https://cdn.example.com/reel.mp4",
        type: "video",
      })
    );
  });
});
