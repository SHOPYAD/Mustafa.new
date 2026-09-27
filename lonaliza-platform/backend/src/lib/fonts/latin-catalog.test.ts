import { describe, expect, it } from "vitest";
import {
  DEFAULT_LATIN_FONT_ID,
  getLatinFontById,
  LATIN_FONT_CATALOG,
} from "./latin-catalog";
import { latinFontStylesheetHref } from "./load-font";

describe("latin font catalog", () => {
  it("has dozens of unique latin-ext families", () => {
    const ids = LATIN_FONT_CATALOG.map((font) => font.id);
    const families = LATIN_FONT_CATALOG.map((font) => font.googleFamily);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(families).size).toBe(families.length);
    expect(ids.length).toBeGreaterThanOrEqual(40);
  });

  it("defaults to Plus Jakarta Sans", () => {
    expect(DEFAULT_LATIN_FONT_ID).toBe("plus-jakarta-sans");
    expect(getLatinFontById(undefined).googleFamily).toBe("Plus Jakarta Sans");
  });

  it("does not emit a public stylesheet for the next/font default", () => {
    expect(latinFontStylesheetHref(DEFAULT_LATIN_FONT_ID)).toBeNull();
    expect(latinFontStylesheetHref("inter")).toContain("subset=latin-ext");
    expect(latinFontStylesheetHref("inter")).toContain("display=swap");
  });
});
