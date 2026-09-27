import { describe, expect, it } from "vitest";
import {
  clampDurationMinutes,
  targetSecondsFromMinutes,
} from "@/lib/studio/video/ffmpeg";
import {
  parseStudioRelativePath,
  sanitizeStudioFileName,
} from "@/lib/studio/creative/store";

describe("studio duration helpers", () => {
  it("clamps minutes and converts to exact seconds", () => {
    expect(clampDurationMinutes(undefined)).toBe(1);
    expect(clampDurationMinutes(0)).toBe(1);
    expect(clampDurationMinutes(12)).toBe(10);
    expect(targetSecondsFromMinutes(1)).toBe(60);
    expect(targetSecondsFromMinutes(0.5)).toBe(30);
  });

  it("rejects path traversal in studio artifacts", () => {
    expect(parseStudioRelativePath("../etc/passwd")).toBeNull();
    expect(parseStudioRelativePath("video/ok.mp4")).toEqual({
      folder: "video",
      file: "ok.mp4",
    });
    expect(parseStudioRelativePath("plans/week-2026-08-31-ar.json")).toBeTruthy();
    expect(sanitizeStudioFileName("كابادوكيا-slide", ".webp")).toMatch(
      /^[a-z0-9][a-z0-9._-]*\.webp$/i
    );
  });
});
