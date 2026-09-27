/**
 * On-demand Google Fonts loader.
 *
 * Public pages load only the *active* Arabic family and the *active*
 * Latin family. The builder iframe uses the same helper so picking a
 * family never dumps either catalog into `<head>`.
 */
import {
  DEFAULT_ARABIC_FONT_ID,
  getArabicFontById,
  type ArabicFontEntry,
} from "./arabic-catalog";
import {
  DEFAULT_LATIN_FONT_ID,
  getLatinFontById,
  type LatinFontEntry,
} from "./latin-catalog";

export type FontSubset = "arabic" | "latin" | "latin-ext";

export const DEFAULT_LATIN_FAMILY = "Plus Jakarta Sans";

/** css2 URL with `display=swap` and an explicit subset. */
export function googleCss2Href(slug: string, subset: FontSubset): string {
  return `https://fonts.googleapis.com/css2?family=${slug}&display=swap&subset=${subset}`;
}

export function arabicFontStylesheetHref(
  id: string | undefined | null,
): string | null {
  const font = getArabicFontById(id);
  if (font.id === DEFAULT_ARABIC_FONT_ID) return null;
  return googleCss2Href(font.googleSlug, "arabic");
}

export function latinFontStylesheetHref(
  id: string | undefined | null,
): string | null {
  const font = getLatinFontById(id);
  if (font.id === DEFAULT_LATIN_FONT_ID) return null;
  return googleCss2Href(font.googleSlug, "latin-ext");
}

export function arabicFontLinkId(font: ArabicFontEntry): string {
  return `gf-ar-${font.id}`;
}

export function latinFontLinkId(font: LatinFontEntry): string {
  return `gf-latin-${font.id}`;
}

export function loadFontIntoDocument(
  target: Document,
  href: string,
  linkId: string,
): void {
  if (target.getElementById(linkId)) return;
  const link = target.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = href;
  target.head.appendChild(link);
}

/** Load one Arabic catalog family into `document` (or a preview iframe). */
export function loadFont(
  id: string,
  target: Document | null = typeof document === "undefined" ? null : document,
): void {
  if (!target) return;
  const font = getArabicFontById(id);
  loadFontIntoDocument(
    target,
    googleCss2Href(font.googleSlug, "arabic"),
    arabicFontLinkId(font),
  );
}

/** Load one Latin catalog family (latin-ext) into `document`. */
export function loadLatinFont(
  id: string,
  target: Document | null = typeof document === "undefined" ? null : document,
): void {
  if (!target) return;
  const font = getLatinFontById(id);
  loadFontIntoDocument(
    target,
    googleCss2Href(font.googleSlug, "latin-ext"),
    latinFontLinkId(font),
  );
}

/** Load an arbitrary Google css2 slug (builder per-element picker). */
export function loadGoogleSlug(
  slug: string,
  subset: FontSubset,
  target: Document | null = typeof document === "undefined" ? null : document,
): void {
  if (!target || !slug) return;
  const linkId = `gf-${slug.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  loadFontIntoDocument(target, googleCss2Href(slug, subset), linkId);
}
