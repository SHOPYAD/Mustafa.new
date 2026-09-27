import { describe, expect, it } from "vitest";
import { getApplicableBlocks } from "./block-applicability";
import type { SelectedElement } from "@/lib/builder/editor-store";

function selected(partial: Partial<SelectedElement>): SelectedElement {
  return {
    id: "hero-default.image",
    sectionInstanceId: "hero-default",
    sectionType: "hero",
    ...partial,
  };
}

describe("getApplicableBlocks", () => {
  it("shows one image block and not content for a hero img", () => {
    const blocks = getApplicableBlocks(
      selected({
        tagName: "IMG",
        field: "image",
        src: "https://images.unsplash.com/photo-1",
      })
    );
    expect(blocks.has("image")).toBe(true);
    expect(blocks.has("content")).toBe(false);
  });

  it("shows logos when a partner tile is selected", () => {
    const blocks = getApplicableBlocks(
      selected({
        id: "partners-default.logo.partners.rixos",
        sectionInstanceId: "partners-default",
        sectionType: "partners",
        tagName: "IMG",
        field: "logo.partners.rixos",
        src: "/hotels/rixos.svg",
      })
    );
    expect(blocks.has("image")).toBe(true);
    expect(blocks.has("logos")).toBe(true);
    expect(blocks.has("content")).toBe(false);
  });

  it("keeps text content for headings", () => {
    const blocks = getApplicableBlocks(
      selected({
        tagName: "H1",
        field: "title",
        text: "تحجز بثقة",
      })
    );
    expect(blocks.has("content")).toBe(true);
    expect(blocks.has("image")).toBe(false);
  });
});
