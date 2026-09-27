import { describe, expect, it } from "vitest";
import { shouldCountReelWatch } from "./reel-view-client";

describe("reel view watch gate", () => {
  it("requires three seconds of playback", () => {
    expect(shouldCountReelWatch(0)).toBe(false);
    expect(shouldCountReelWatch(2.9)).toBe(false);
    expect(shouldCountReelWatch(3)).toBe(true);
  });
});
