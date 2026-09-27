/**
 * Curated multi-script font catalog (≈300 families).
 *
 * Why this lives in its own file:
 *   - keeps the FontFamilyCombobox file readable (the picker logic is
 *     small but the data is huge),
 *   - lets other inspector controls (e.g. typography presets) reuse the
 *     exact same metadata without duplicating slugs/weights,
 *   - the `category` field powers the language tabs in the picker so a
 *     user can scope the search to "Arabic" or "Turkish" instead of
 *     scrolling through 300 mostly-irrelevant Latin sans-serifs.
 *
 * Subset notes:
 *   - Latin/Latin-Extended families implicitly cover Turkish glyphs
 *     (Ç, Ğ, İ, Ö, Ş, Ü) — Google Fonts emits the right unicode-range
 *     when we request `display=swap` without a `subset=` param. We mark
 *     the families that explicitly *also* render well in Turkish layouts
 *     with `category: "turkish"`.
 *   - Arabic families ship the Arabic shaping subset by default; we
 *     keep them grouped under `category: "arabic"`.
 *   - Display & monospace are split so writers can shortlist headline
 *     and code-style picks quickly.
 */

import { ARABIC_FONT_CATALOG } from "@/lib/fonts/arabic-catalog";
import { LATIN_FONT_CATALOG } from "@/lib/fonts/latin-catalog";

export type FontCategory =
  | "system"
  | "latin"
  | "serif"
  | "display"
  | "mono"
  | "arabic"
  | "turkish";

export interface FontEntry {
  /** Display label inside the picker. */
  label: string;
  /** CSS `font-family` value, including fallback stack. */
  value: string;
  /** Google Fonts URL slug — `null` for system stacks. */
  gf: string | null;
  /** One primary tab the font belongs to. */
  category: FontCategory;
  /** Optional sample text to render the preview in the picker. */
  sample?: string;
}

/* ------------------------------------------------------------------ */
/* SYSTEM / DEFAULT                                                    */
/* ------------------------------------------------------------------ */
export const SYSTEM_STACK: FontEntry[] = [
  { label: "Inherit", value: "", gf: null, category: "system" },
  {
    label: "System (default)",
    value:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    gf: null,
    category: "system",
  },
  { label: "Inter (built-in)", value: "Inter, sans-serif", gf: null, category: "system" },
];

/* Helper to keep the catalog readable. */
const gf = (
  label: string,
  family: string,
  slug: string,
  category: FontCategory,
  fallback = "sans-serif",
  sample?: string,
): FontEntry => ({
  label,
  value: family.includes(" ") ? `'${family}', ${fallback}` : `${family}, ${fallback}`,
  gf: slug,
  category,
  sample,
});

const wgt = (s: string) => `${s}:wght@300;400;500;600;700;800`;

/* ------------------------------------------------------------------ */
/* LATIN — site catalog (every family ships latin-ext).                */
/* ------------------------------------------------------------------ */
const LATIN_SAMPLE = "İstanbul · été · œuvre";
const LATIN_SANS: FontEntry[] = LATIN_FONT_CATALOG.map((font) =>
  gf(
    font.nameEn,
    font.googleFamily,
    font.googleSlug,
    "latin",
    font.fallback,
    LATIN_SAMPLE,
  ),
);

/* ------------------------------------------------------------------ */
/* SERIF                                                               */
/* ------------------------------------------------------------------ */
const SERIF: FontEntry[] = [
  gf("Playfair Display", "Playfair Display", "Playfair+Display:wght@400;500;600;700;800;900", "serif", "serif"),
  gf("Merriweather", "Merriweather", "Merriweather:wght@300;400;700;900", "serif", "serif"),
  gf("Lora", "Lora", "Lora:wght@400;500;600;700", "serif", "serif"),
  gf("PT Serif", "PT Serif", "PT+Serif:wght@400;700", "serif", "serif"),
  gf("Crimson Text", "Crimson Text", "Crimson+Text:wght@400;600;700", "serif", "serif"),
  gf("Cormorant Garamond", "Cormorant Garamond", "Cormorant+Garamond:wght@300;400;500;600;700", "serif", "serif"),
  gf("EB Garamond", "EB Garamond", "EB+Garamond:wght@400;500;600;700;800", "serif", "serif"),
  gf("Bitter", "Bitter", wgt("Bitter"), "serif", "serif"),
  gf("Roboto Slab", "Roboto Slab", wgt("Roboto+Slab"), "serif", "serif"),
  gf("Source Serif 4", "Source Serif 4", "Source+Serif+4:wght@400;500;600;700", "serif", "serif"),
  gf("Libre Baskerville", "Libre Baskerville", "Libre+Baskerville:wght@400;700", "serif", "serif"),
  gf("Spectral", "Spectral", "Spectral:wght@300;400;500;600;700", "serif", "serif"),
  gf("Cardo", "Cardo", "Cardo:wght@400;700", "serif", "serif"),
  gf("Cormorant", "Cormorant", "Cormorant:wght@300;400;500;600;700", "serif", "serif"),
  gf("Cormorant Infant", "Cormorant Infant", "Cormorant+Infant:wght@300;400;500;600;700", "serif", "serif"),
  gf("Bree Serif", "Bree Serif", "Bree+Serif", "serif", "serif"),
  gf("Slabo 27px", "Slabo 27px", "Slabo+27px", "serif", "serif"),
  gf("Old Standard TT", "Old Standard TT", "Old+Standard+TT:wght@400;700", "serif", "serif"),
  gf("Vollkorn", "Vollkorn", wgt("Vollkorn"), "serif", "serif"),
  gf("Cinzel", "Cinzel", "Cinzel:wght@400;500;600;700;800", "serif", "serif"),
  gf("DM Serif Display", "DM Serif Display", "DM+Serif+Display", "serif", "serif"),
  gf("DM Serif Text", "DM Serif Text", "DM+Serif+Text", "serif", "serif"),
  gf("Fraunces", "Fraunces", wgt("Fraunces"), "serif", "serif"),
  gf("Frank Ruhl Libre", "Frank Ruhl Libre", "Frank+Ruhl+Libre:wght@300;400;500;700;900", "serif", "serif"),
  gf("Gentium Plus", "Gentium Plus", "Gentium+Plus:wght@400;700", "serif", "serif"),
  gf("Glegoo", "Glegoo", "Glegoo:wght@400;700", "serif", "serif"),
  gf("Halant", "Halant", "Halant:wght@300;400;500;600;700", "serif", "serif"),
  gf("Inknut Antiqua", "Inknut Antiqua", "Inknut+Antiqua:wght@300;400;500;600;700;800;900", "serif", "serif"),
  gf("Italiana", "Italiana", "Italiana", "serif", "serif"),
  gf("Josefin Slab", "Josefin Slab", wgt("Josefin+Slab"), "serif", "serif"),
  gf("Kameron", "Kameron", "Kameron:wght@400;700", "serif", "serif"),
  gf("Karma", "Karma", "Karma:wght@300;400;500;600;700", "serif", "serif"),
  gf("Kreon", "Kreon", "Kreon:wght@300;400;500;600;700", "serif", "serif"),
  gf("Libre Bodoni", "Libre Bodoni", wgt("Libre+Bodoni"), "serif", "serif"),
  gf("Lusitana", "Lusitana", "Lusitana:wght@400;700", "serif", "serif"),
  gf("Marcellus", "Marcellus", "Marcellus", "serif", "serif"),
  gf("Marvel", "Marvel", "Marvel:wght@400;700", "serif", "serif"),
  gf("Neuton", "Neuton", "Neuton:wght@200;300;400;700;800", "serif", "serif"),
  gf("Newsreader", "Newsreader", wgt("Newsreader"), "serif", "serif"),
  gf("Noto Serif", "Noto Serif", wgt("Noto+Serif"), "serif", "serif"),
  gf("Petrona", "Petrona", wgt("Petrona"), "serif", "serif"),
  gf("Piazzolla", "Piazzolla", wgt("Piazzolla"), "serif", "serif"),
  gf("Prata", "Prata", "Prata", "serif", "serif"),
  gf("Sorts Mill Goudy", "Sorts Mill Goudy", "Sorts+Mill+Goudy:wght@400;700", "serif", "serif"),
  gf("Tenor Sans", "Tenor Sans", "Tenor+Sans", "serif", "serif"),
];

/* ------------------------------------------------------------------ */
/* DISPLAY                                                             */
/* ------------------------------------------------------------------ */
const DISPLAY: FontEntry[] = [
  gf("Bebas Neue", "Bebas Neue", "Bebas+Neue", "display"),
  gf("Oswald", "Oswald", wgt("Oswald"), "display"),
  gf("Anton", "Anton", "Anton", "display"),
  gf("Archivo Black", "Archivo Black", "Archivo+Black", "display"),
  gf("Alfa Slab One", "Alfa Slab One", "Alfa+Slab+One", "display"),
  gf("Bowlby One", "Bowlby One", "Bowlby+One", "display"),
  gf("Bowlby One SC", "Bowlby One SC", "Bowlby+One+SC", "display"),
  gf("Carter One", "Carter One", "Carter+One", "display"),
  gf("Caveat Brush", "Caveat Brush", "Caveat+Brush", "display"),
  gf("Chakra Petch", "Chakra Petch", wgt("Chakra+Petch"), "display"),
  gf("Cormorant SC", "Cormorant SC", "Cormorant+SC:wght@300;400;500;600;700", "display"),
  gf("Crete Round", "Crete Round", "Crete+Round", "display"),
  gf("Days One", "Days One", "Days+One", "display"),
  gf("Dela Gothic One", "Dela Gothic One", "Dela+Gothic+One", "display"),
  gf("Domine Display", "Domine", "Domine:wght@400;500;600;700", "display"),
  gf("Dosis", "Dosis", wgt("Dosis"), "display"),
  gf("Faster One", "Faster One", "Faster+One", "display"),
  gf("Fascinate", "Fascinate", "Fascinate", "display"),
  gf("Fjalla One", "Fjalla One", "Fjalla+One", "display"),
  gf("Forum", "Forum", "Forum", "display"),
  gf("Fugaz One", "Fugaz One", "Fugaz+One", "display"),
  gf("Galada", "Galada", "Galada", "display"),
  gf("Gravitas One", "Gravitas One", "Gravitas+One", "display"),
  gf("Holtwood One SC", "Holtwood One SC", "Holtwood+One+SC", "display"),
  gf("Impact (Anton)", "Anton", "Anton", "display"),
  gf("Krona One", "Krona One", "Krona+One", "display"),
  gf("Lobster", "Lobster", "Lobster", "display"),
  gf("Major Mono Display", "Major Mono Display", "Major+Mono+Display", "display", "monospace"),
  gf("Megrim", "Megrim", "Megrim", "display"),
  gf("Monoton", "Monoton", "Monoton", "display"),
  gf("Mr Dafoe", "Mr Dafoe", "Mr+Dafoe", "display"),
  gf("Pacifico", "Pacifico", "Pacifico", "display"),
  gf("Patua One", "Patua One", "Patua+One", "display"),
  gf("Permanent Marker", "Permanent Marker", "Permanent+Marker", "display"),
  gf("Press Start 2P", "Press Start 2P", "Press+Start+2P", "display"),
  gf("Quintessential", "Quintessential", "Quintessential", "display"),
  gf("Racing Sans One", "Racing Sans One", "Racing+Sans+One", "display"),
  gf("Righteous", "Righteous", "Righteous", "display"),
  gf("Rye", "Rye", "Rye", "display"),
  gf("Sacramento", "Sacramento", "Sacramento", "display"),
  gf("Satisfy", "Satisfy", "Satisfy", "display"),
  gf("Shrikhand", "Shrikhand", "Shrikhand", "display"),
  gf("Special Elite", "Special Elite", "Special+Elite", "display"),
  gf("Stalemate", "Stalemate", "Stalemate", "display"),
  gf("Staatliches", "Staatliches", "Staatliches", "display"),
  gf("Tilt Neon", "Tilt Neon", "Tilt+Neon", "display"),
  gf("Yatra One", "Yatra One", "Yatra+One", "display"),
];

/* ------------------------------------------------------------------ */
/* MONO                                                                */
/* ------------------------------------------------------------------ */
const MONO: FontEntry[] = [
  gf("JetBrains Mono", "JetBrains Mono", "JetBrains+Mono:wght@400;500;700", "mono", "monospace"),
  gf("Fira Code", "Fira Code", "Fira+Code:wght@400;500;600;700", "mono", "monospace"),
  gf("Source Code Pro", "Source Code Pro", "Source+Code+Pro:wght@400;500;600;700", "mono", "monospace"),
  gf("IBM Plex Mono", "IBM Plex Mono", "IBM+Plex+Mono:wght@400;500;600;700", "mono", "monospace"),
  gf("Roboto Mono", "Roboto Mono", "Roboto+Mono:wght@300;400;500;600;700", "mono", "monospace"),
  gf("Space Mono", "Space Mono", "Space+Mono:wght@400;700", "mono", "monospace"),
  gf("Ubuntu Mono", "Ubuntu Mono", "Ubuntu+Mono:wght@400;700", "mono", "monospace"),
  gf("Cousine", "Cousine", "Cousine:wght@400;700", "mono", "monospace"),
  gf("Anonymous Pro", "Anonymous Pro", "Anonymous+Pro:wght@400;700", "mono", "monospace"),
  gf("Inconsolata", "Inconsolata", wgt("Inconsolata"), "mono", "monospace"),
  gf("Cutive Mono", "Cutive Mono", "Cutive+Mono", "mono", "monospace"),
  gf("Overpass Mono", "Overpass Mono", "Overpass+Mono:wght@300;400;600;700", "mono", "monospace"),
  gf("PT Mono", "PT Mono", "PT+Mono", "mono", "monospace"),
  gf("VT323", "VT323", "VT323", "mono", "monospace"),
];

/* ------------------------------------------------------------------ */
/* ARABIC — sourced from the site catalog (unique families only).      */
/* ------------------------------------------------------------------ */
const ARABIC_SAMPLE = "أهلًا بكم في ليوتريب";
const ARABIC: FontEntry[] = ARABIC_FONT_CATALOG.map((font) =>
  gf(
    font.nameEn,
    font.googleFamily,
    font.googleSlug,
    "arabic",
    font.fallback,
    ARABIC_SAMPLE,
  ),
);

/* ------------------------------------------------------------------ */
/* TURKISH — same latin-ext catalog, TR sample for the tab filter.     */
/* ------------------------------------------------------------------ */
const TURKISH_SAMPLE = "İçeriği şekil değiştirir";
const TURKISH: FontEntry[] = LATIN_FONT_CATALOG.map((font) =>
  gf(
    `${font.nameEn} (TR)`,
    font.googleFamily,
    font.googleSlug,
    "turkish",
    font.fallback,
    TURKISH_SAMPLE,
  ),
);

/* ------------------------------------------------------------------ */
/* COMBINED EXPORTS                                                    */
/* ------------------------------------------------------------------ */

/** Strict per-tab order (controls which tab a duplicate falls into). */
export const FONT_GROUPS: Array<{ id: FontCategory; label: string; entries: FontEntry[] }> = [
  { id: "system", label: "System", entries: SYSTEM_STACK },
  { id: "latin", label: "Latin", entries: LATIN_SANS },
  { id: "serif", label: "Serif", entries: SERIF },
  { id: "display", label: "Display", entries: DISPLAY },
  { id: "mono", label: "Mono", entries: MONO },
  { id: "arabic", label: "Arabic", entries: ARABIC },
  { id: "turkish", label: "Turkish", entries: TURKISH },
];

/** Flat union — order: system → latin → serif → display → mono → arabic → turkish. */
export const ALL_FONTS: FontEntry[] = FONT_GROUPS.flatMap((g) => g.entries);

/** Lookup map keyed by `value` for stylesheet injection. */
export const FONT_BY_VALUE = new Map<string, FontEntry>(
  ALL_FONTS.filter((f) => f.gf).map((f) => [f.value, f]),
);
