import { describe, expect, it } from "vitest";
import { ruleFor, validateCaption, validateMedia } from "./provider-rules";

describe("composer provider rules", () => {
  it("blocks extra-length captions per platform", () => {
    expect(validateCaption("threads", "x".repeat(501))).toContain("500");
    expect(validateCaption("x", "ok")).toBeNull();
  });

  it("forbids extra thread parts on youtube/tiktok/pinterest", () => {
    expect(ruleFor("youtube").allowsThreadParts).toBe(false);
    expect(ruleFor("tiktok").allowsThreadParts).toBe(false);
    expect(ruleFor("pinterest").allowsThreadParts).toBe(false);
    expect(ruleFor("threads").allowsThreadParts).toBe(true);
  });

  it("validates pinterest video cover requirement", () => {
    expect(validateMedia("pinterest", ["https://cdn.example/clip.mp4"])).toMatch(/غلاف/);
    expect(validateMedia("gmb", ["https://cdn.example/clip.mp4"])).toMatch(/فيديو/);
  });
});
