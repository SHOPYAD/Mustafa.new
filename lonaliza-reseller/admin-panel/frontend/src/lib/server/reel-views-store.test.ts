import { describe, expect, it } from "vitest";
import { shouldCountView, REEL_VIEW_DEBOUNCE_MS } from "./reel-views-store";

describe("reel view debounce", () => {
  it("counts the first watch and ignores repeats inside the window", () => {
    const now = 1_700_000_000_000;
    expect(shouldCountView(undefined, now)).toBe(true);
    expect(shouldCountView(now, now + 1_000)).toBe(false);
    expect(shouldCountView(now, now + REEL_VIEW_DEBOUNCE_MS)).toBe(true);
  });
});
