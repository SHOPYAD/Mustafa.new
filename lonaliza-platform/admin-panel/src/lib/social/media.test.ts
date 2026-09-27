import { describe, expect, it } from "vitest";
import { classifyMediaUrl, sanitizeMediaUrls } from "./media";

describe("social media helpers", () => {
  it("classifies image and video URLs", () => {
    expect(classifyMediaUrl("https://cdn.example.com/a.jpg")).toBe("image");
    expect(classifyMediaUrl("https://cdn.example.com/a.MP4?x=1")).toBe("video");
    expect(classifyMediaUrl("not-a-url")).toBe("unknown");
  });

  it("drops javascript and duplicate URLs", () => {
    expect(
      sanitizeMediaUrls([
        "https://cdn.example.com/a.jpg",
        "https://cdn.example.com/a.jpg",
        "javascript:alert(1)",
        "  ",
      ])
    ).toEqual(["https://cdn.example.com/a.jpg"]);
  });
});
