import { describe, expect, it } from "vitest";
import {
  guessBlossomPoster,
  isGuessedBlossomStill,
  isMockReelSource,
  proxiedReelPoster,
  resolveReelPoster,
  splitReelCopy,
  stripMediaUrls,
  wordSafeTruncate,
} from "./reel-media";

describe("reel copy", () => {
  it("strips media URLs and replacement characters", () => {
    expect(
      stripMediaUrls("حضور العرض https://cdn.example/a.mp4 في يني كابي\uFFFD"),
    ).toBe("حضور العرض في يني كابي");
  });

  it("does not cut Arabic mid-word and avoids repeating the title in the body", () => {
    const content =
      "حضور العرض الجوي بمناسبة عيد النصر في ساحة يني كابي كان بدون شك أحد أجمل الفعاليات التي شهدتها مع عائلتي خلال رحلتي في اسطنبول";
    const { title, description } = splitReelCopy(content);
    expect(title.endsWith("الج")).toBe(false);
    expect(title.length).toBeLessThanOrEqual(48);
    expect(description.startsWith(title)).toBe(false);
    expect(description).toContain("اسطنبول");
  });

  it("word-safe truncate keeps a readable fragment", () => {
    expect(wordSafeTruncate("حضور العرض الجوي بمناسبة عيد النصر", 12)).toBe("حضور العرض");
  });
});

describe("mock reel purge", () => {
  it("flags demo ids, fake pubkeys, mixkit and local demo files", () => {
    expect(isMockReelSource({ id: "home_reel_01" })).toBe(true);
    expect(isMockReelSource({ pubkey: "npub1lonaliza1" })).toBe(true);
    expect(isMockReelSource({ videoUrl: "https://assets.mixkit.co/videos/preview/x.mp4" })).toBe(
      true,
    );
    expect(isMockReelSource({ videoUrl: "/videos/reels/bosphorus_sunset.mp4" })).toBe(true);
    expect(
      isMockReelSource({
        id: "post_123",
        pubkey: "abc",
        videoUrl: "https://blossom.primal.net/deadbeef.mp4",
      }),
    ).toBe(false);
  });
});

describe("poster strategy", () => {
  it("maps blossom mp4 hashes to sibling jpg stills", () => {
    const mp4 =
      "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.mp4";
    expect(guessBlossomPoster(mp4)).toBe(
      "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.jpg",
    );
    expect(isGuessedBlossomStill(guessBlossomPoster(mp4), mp4)).toBe(true);
    expect(proxiedReelPoster(mp4)).toBe("/api/community/reel-poster?src=" + encodeURIComponent(mp4));
  });

  it("prefers explicit poster then still image then same-origin proxy", () => {
    expect(
      resolveReelPoster({
        posterUrl: "https://cdn.example/poster.jpg",
        videoUrl: "https://cdn.example/clip.mp4",
      }),
    ).toBe("https://cdn.example/poster.jpg");
    expect(
      resolveReelPoster({
        images: ["https://cdn.example/still.webp"],
        videoUrl: "https://cdn.example/clip.mp4",
      }),
    ).toBe("https://cdn.example/still.webp");
    expect(resolveReelPoster({ videoUrl: "https://cdn.example/clip.mp4" })).toBe(
      "/api/community/reel-poster?src=" + encodeURIComponent("https://cdn.example/clip.mp4"),
    );
  });

  it("does not treat a guessed blossom sibling as a real poster", () => {
    const videoUrl =
      "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.mp4";
    expect(
      resolveReelPoster({
        posterUrl: guessBlossomPoster(videoUrl),
        videoUrl,
      }),
    ).toBe("/api/community/reel-poster?src=" + encodeURIComponent(videoUrl));
  });
});
