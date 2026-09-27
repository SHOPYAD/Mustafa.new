import { describe, expect, it } from "vitest";
import {
  isImageContentType,
  parseSafeReelMediaUrl,
  posterCacheKey,
  siblingStillCandidates,
} from "./reel-poster-server";

describe("parseSafeReelMediaUrl", () => {
  it("allows https blossom videos and rejects private / non-https", () => {
    expect(parseSafeReelMediaUrl("https://blossom.primal.net/deadbeef.mp4")?.href).toBe(
      "https://blossom.primal.net/deadbeef.mp4",
    );
    expect(parseSafeReelMediaUrl("http://blossom.primal.net/deadbeef.mp4")).toBeNull();
    expect(parseSafeReelMediaUrl("https://127.0.0.1/secret.mp4")).toBeNull();
    expect(parseSafeReelMediaUrl("https://192.168.1.8/x.mp4")).toBeNull();
    expect(parseSafeReelMediaUrl("javascript:alert(1)")).toBeNull();
    expect(parseSafeReelMediaUrl("/uploads/community/a.mp4")?.pathname).toBe("/uploads/community/a.mp4");
    expect(parseSafeReelMediaUrl("/etc/passwd")).toBeNull();
  });
});

describe("sibling stills", () => {
  it("lists blossom image extensions from an mp4", () => {
    expect(
      siblingStillCandidates(
        "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.mp4",
      )[0],
    ).toBe(
      "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.jpg",
    );
  });

  it("hashes cache keys stably", () => {
    expect(posterCacheKey("https://cdn.example/a.mp4")).toBe(posterCacheKey("https://cdn.example/a.mp4"));
    expect(posterCacheKey("https://cdn.example/a.mp4")).not.toBe(posterCacheKey("https://cdn.example/b.mp4"));
  });

  it("accepts image content types", () => {
    expect(isImageContentType("image/jpeg; charset=binary")).toBe(true);
    expect(isImageContentType("text/html")).toBe(false);
  });
});
