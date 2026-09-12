import { describe, expect, it } from "vitest";
import {
  catalogSectionTypes,
  defaultHomepageDraft,
  defaultSectionForType,
  ensureOriginalHomepageSections,
  mergeContactAndCtaSections,
  sectionLabel,
} from "./schema";

describe("homepage content layout", () => {
  it("keeps a single merged contact section and no seed banners", () => {
    const types = defaultHomepageDraft().layout.map((item) => item.type);
    expect(types.filter((type) => type === "contact")).toEqual(["contact"]);
    expect(types).not.toContain("cta");
    expect(types).not.toContain("banners");
    expect(types).not.toContain("newsletter");
  });

  it("lists premium destination cards in the ADD SECTIONS library", () => {
    const catalog = catalogSectionTypes();
    expect(catalog).toContain("banners");
    expect(catalog).not.toContain("cta");
    expect(catalog).toContain("contact");
    expect(catalog).toContain("newsletter");
    expect(sectionLabel("banners").ar).toContain("وجهات");
    expect(defaultSectionForType("banners").type).toBe("banners");
    expect(defaultSectionForType("banners").texts.title.ar).toContain("وجهات");
  });

  it("does not auto-insert banners or a second contact slab", () => {
    const stripped = ensureOriginalHomepageSections({
      global: { navy: "#051741", emerald: "#10b981" },
      layout: defaultHomepageDraft().layout.filter((item) => item.type !== "contact"),
    });
    const types = stripped.layout.map((item) => item.type);
    expect(types).toContain("contact");
    expect(types).not.toContain("banners");
    expect(types.filter((type) => type === "contact" || type === "cta")).toHaveLength(1);
  });

  it("merges a leftover cta slab into contact", () => {
    const contact = defaultSectionForType("contact");
    const cta = defaultSectionForType("cta");
    cta.type = "cta";
    cta.texts = {
      title: { ar: "جاهز؟", en: "Ready?", tr: "Hazır?" },
      subtitle: { ar: "راسلنا", en: "Write", tr: "Yaz" },
      button: { ar: "تواصل معنا", en: "Contact us", tr: "Yazın" },
    };
    const merged = mergeContactAndCtaSections({
      global: { navy: "#051741", emerald: "#10b981" },
      layout: [contact, cta],
    });
    expect(merged.layout.map((item) => item.type)).toEqual(["contact"]);
    expect(merged.layout[0]?.texts.ctaButton?.ar).toBe("تواصل معنا");
  });

  it("strips seed newsletter from stored drafts but keeps a catalog-added instance", () => {
    const stripped = ensureOriginalHomepageSections({
      global: { navy: "#051741", emerald: "#10b981" },
      layout: [
        ...defaultHomepageDraft().layout,
        { ...defaultSectionForType("newsletter"), instanceId: "newsletter-default" },
      ],
    });
    expect(stripped.layout.some((item) => item.type === "newsletter")).toBe(false);

    const added = defaultSectionForType("newsletter");
    const kept = ensureOriginalHomepageSections({
      global: { navy: "#051741", emerald: "#10b981" },
      layout: [...defaultHomepageDraft().layout, added],
    });
    expect(kept.layout.some((item) => item.instanceId === added.instanceId)).toBe(true);
    expect(added.texts.title.ar).toContain("عروض");
    expect(added.texts.button.ar).toBeTruthy();
  });

  it("strips seed-injected banners from stored drafts", () => {
    const next = ensureOriginalHomepageSections({
      global: { navy: "#051741", emerald: "#10b981" },
      layout: [
        ...defaultHomepageDraft().layout,
        defaultSectionForType("banners"),
        { ...defaultSectionForType("banners"), instanceId: "banners-default" },
      ],
    });
    const seedBanners = next.layout.filter(
      (item) => item.type === "banners" && item.instanceId.endsWith("-default")
    );
    expect(seedBanners).toHaveLength(0);
  });
});
