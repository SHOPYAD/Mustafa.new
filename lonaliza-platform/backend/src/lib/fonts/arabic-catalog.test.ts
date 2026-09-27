import { describe, expect, it } from "vitest";
import {
  ARABIC_FONT_CATALOG,
  DEFAULT_ARABIC_FONT_ID,
  getArabicFontById,
} from "./arabic-catalog";
import { arabicFontStylesheetHref } from "./load-font";

describe("arabic font catalog", () => {
  it("has at least 30 unique families", () => {
    const ids = ARABIC_FONT_CATALOG.map((font) => font.id);
    const families = ARABIC_FONT_CATALOG.map((font) => font.googleFamily);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(families).size).toBe(families.length);
    expect(ids.length).toBeGreaterThanOrEqual(30);
  });

  it("defaults to IBM Plex Sans Arabic", () => {
    expect(DEFAULT_ARABIC_FONT_ID).toBe("ibm-plex-sans-arabic");
    expect(getArabicFontById(undefined).googleFamily).toBe(
      "IBM Plex Sans Arabic",
    );
  });

  it("does not emit a public stylesheet for the next/font default", () => {
    expect(arabicFontStylesheetHref(DEFAULT_ARABIC_FONT_ID)).toBeNull();
    expect(arabicFontStylesheetHref("amiri")).toContain("subset=arabic");
    expect(arabicFontStylesheetHref("amiri")).toContain("display=swap");
  });
});
