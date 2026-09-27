import { describe, expect, it } from "vitest";
import {
  looksLikeUrl,
  resolveBoundImage,
  unwrapCssUrl,
} from "./live-bind";
import { defaultSectionForType } from "./schema";

describe("unwrapCssUrl", () => {
  it("strips url() wrappers so img src can apply", () => {
    expect(unwrapCssUrl("url('/airlines/04/TK.png')")).toBe("/airlines/04/TK.png");
    expect(unwrapCssUrl('url("https://cdn.example/a.jpg")')).toBe("https://cdn.example/a.jpg");
    expect(unwrapCssUrl("/uploads/hero.jpg")).toBe("/uploads/hero.jpg");
  });

  it("treats unwrapped css urls as real urls", () => {
    expect(looksLikeUrl("url('/hotels/hilton.svg')")).toBe(true);
  });
});

describe("resolveBoundImage", () => {
  it("does not let a specific card field fall back to the hero image", () => {
    const instance = defaultSectionForType("hero");
    instance.settings.image = "/hero-old.jpg";
    instance.settings["image.hero-pkg-live-tp-03"] = "/card-new.jpg";
    expect(resolveBoundImage(instance, "hero-pkg-live-tp-03", "/catalog.jpg")).toBe("/card-new.jpg");
    expect(resolveBoundImage(instance, "image", "/catalog.jpg")).toBe("/hero-old.jpg");
  });

  it("unwraps stored css urls", () => {
    const instance = defaultSectionForType("hero");
    instance.settings.image = "url('/hero-new.jpg')";
    expect(resolveBoundImage(instance, "image", "/fallback.jpg")).toBe("/hero-new.jpg");
  });
});
