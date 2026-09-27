/**
 * Site-wide Latin / multilingual type library.
 *
 * Every family is selected for Google Fonts **latin-ext** coverage
 * (Turkish ğüşıöçİ, French éèàùçœ, and other Western European glyphs).
 * Public pages load only the *active* family — never this whole list.
 */

export type LatinFontCategory =
  | "grotesque"
  | "humanist"
  | "geometric"
  | "serif"
  | "slab"
  | "display";

export type LatinFontFallback = "sans-serif" | "serif";

export type LatinFontEntry = {
  id: string;
  nameAr: string;
  nameEn: string;
  category: LatinFontCategory;
  googleFamily: string;
  googleSlug: string;
  fallback: LatinFontFallback;
};

/** Plus Jakarta Sans — one face for every non-Arabic locale (EN/TR/FR/…). */
export const DEFAULT_LATIN_FONT_ID = "plus-jakarta-sans";

const SANS = "sans-serif" as const;
const SERIF = "serif" as const;

function entry(
  id: string,
  nameEn: string,
  nameAr: string,
  category: LatinFontCategory,
  slug: string,
  fallback: LatinFontFallback = SANS,
): LatinFontEntry {
  return {
    id,
    nameAr,
    nameEn,
    category,
    googleFamily: nameEn,
    googleSlug: slug,
    fallback,
  };
}

const w = (family: string, weights = "300;400;500;600;700") =>
  `${family.replace(/ /g, "+")}:wght@${weights}`;

export const LATIN_FONT_CATALOG: readonly LatinFontEntry[] = [
  /* —— Default + geometric / modern UI —— */
  entry("plus-jakarta-sans", "Plus Jakarta Sans", "بلس جاكرتا", "geometric", w("Plus Jakarta Sans")),
  entry("manrope", "Manrope", "مانروب", "geometric", w("Manrope")),
  entry("outfit", "Outfit", "أوتفيت", "geometric", w("Outfit")),
  entry("figtree", "Figtree", "فيجتري", "geometric", w("Figtree")),
  entry("urbanist", "Urbanist", "أوربانيست", "geometric", w("Urbanist")),
  entry("sora", "Sora", "سورا", "geometric", w("Sora")),
  entry("space-grotesk", "Space Grotesk", "سبيس جروتسك", "geometric", w("Space Grotesk", "300;400;500;600;700")),
  entry("onest", "Onest", "أونيست", "geometric", w("Onest")),
  entry("geologica", "Geologica", "جيولوجيكا", "geometric", w("Geologica")),
  entry("syne", "Syne", "ساين", "display", w("Syne", "400;500;600;700;800")),

  /* —— Grotesque / neo-grotesque —— */
  entry("inter", "Inter", "إنتر", "grotesque", w("Inter")),
  entry("dm-sans", "DM Sans", "دي إم سنس", "grotesque", w("DM Sans")),
  entry("ibm-plex-sans", "IBM Plex Sans", "آي بي إم بلكس", "grotesque", w("IBM Plex Sans")),
  entry("public-sans", "Public Sans", "ببلك سنس", "grotesque", w("Public Sans")),
  entry("work-sans", "Work Sans", "ورك سنس", "grotesque", w("Work Sans")),
  entry("source-sans-3", "Source Sans 3", "سورس سنس 3", "grotesque", w("Source Sans 3")),
  entry("noto-sans", "Noto Sans", "نوتو سنس", "grotesque", w("Noto Sans")),
  entry("archivo", "Archivo", "أرشيفو", "grotesque", w("Archivo")),
  entry("barlow", "Barlow", "بارلو", "grotesque", w("Barlow")),
  entry("jost", "Jost", "يوست", "grotesque", w("Jost")),
  entry("hanken-grotesk", "Hanken Grotesk", "هانكن جروتسك", "grotesque", w("Hanken Grotesk")),
  entry("schibsted-grotesk", "Schibsted Grotesk", "شيبستد جروتسك", "grotesque", w("Schibsted Grotesk")),
  entry("darker-grotesque", "Darker Grotesque", "داركر جروتسك", "grotesque", w("Darker Grotesque")),
  entry("commissioner", "Commissioner", "كوميشنر", "grotesque", w("Commissioner")),
  entry("wix-madefor-text", "Wix Madefor Text", "ويكس مادفور تكست", "grotesque", w("Wix Madefor Text")),
  entry("wix-madefor-display", "Wix Madefor Display", "ويكس مادفور ديسبلاي", "display", w("Wix Madefor Display")),
  entry("red-hat-text", "Red Hat Text", "رد هات تكست", "grotesque", w("Red Hat Text")),
  entry("red-hat-display", "Red Hat Display", "رد هات ديسبلاي", "display", w("Red Hat Display")),
  entry("spline-sans", "Spline Sans", "سبلاين سنس", "grotesque", w("Spline Sans")),
  entry("lexend", "Lexend", "لكسند", "grotesque", w("Lexend")),
  entry("epilogue", "Epilogue", "إبيلوج", "grotesque", w("Epilogue")),

  /* —— Humanist —— */
  entry("libre-franklin", "Libre Franklin", "ليبر فرانكلين", "humanist", w("Libre Franklin")),
  entry("open-sans", "Open Sans", "أوبن سنس", "humanist", w("Open Sans")),
  entry("nunito-sans", "Nunito Sans", "نونيتو سنس", "humanist", w("Nunito Sans")),
  entry("nunito", "Nunito", "نونيتو", "humanist", w("Nunito")),
  entry("mulish", "Mulish", "موليش", "humanist", w("Mulish")),
  entry("karla", "Karla", "كارلا", "humanist", w("Karla")),
  entry("cabin", "Cabin", "كابين", "humanist", w("Cabin", "400;500;600;700")),
  entry("asap", "Asap", "أساب", "humanist", w("Asap", "400;500;600;700")),
  entry("pt-sans", "PT Sans", "بي تي سنس", "humanist", "PT+Sans:wght@400;700"),
  entry("fira-sans", "Fira Sans", "فيرا سنس", "humanist", w("Fira Sans")),
  entry("ubuntu", "Ubuntu", "أوبونتو", "humanist", "Ubuntu:wght@300;400;500;700"),
  entry("titillium-web", "Titillium Web", "تيتيليوم", "humanist", "Titillium+Web:wght@300;400;600;700"),
  entry("encode-sans", "Encode Sans", "إنكود سنس", "humanist", w("Encode Sans")),
  entry("be-vietnam-pro", "Be Vietnam Pro", "بي فيتنام برو", "humanist", w("Be Vietnam Pro")),
  entry("assistant", "Assistant", "أسيستنت", "humanist", w("Assistant")),
  entry("lato", "Lato", "لاتو", "humanist", "Lato:wght@300;400;700;900"),
  entry("merriweather-sans", "Merriweather Sans", "ميريويذر سنس", "humanist", w("Merriweather Sans")),

  /* —— Popular geometric / rounded (still latin-ext) —— */
  entry("poppins", "Poppins", "بوبنز", "geometric", w("Poppins")),
  entry("montserrat", "Montserrat", "مونتسيرات", "geometric", w("Montserrat")),
  entry("raleway", "Raleway", "راليواي", "geometric", w("Raleway")),
  entry("quicksand", "Quicksand", "كويكساند", "geometric", w("Quicksand")),
  entry("rubik", "Rubik", "روبيك", "geometric", w("Rubik")),
  entry("comfortaa", "Comfortaa", "كومفرتا", "geometric", w("Comfortaa")),
  entry("varela-round", "Varela Round", "فاريلا راوند", "geometric", "Varela+Round"),

  /* —— Workhorses —— */
  entry("roboto", "Roboto", "روبوتو", "grotesque", w("Roboto")),
  entry("heebo", "Heebo", "هيبو", "grotesque", w("Heebo")),

  /* —— Serif / editorial (latin-ext) —— */
  entry("source-serif-4", "Source Serif 4", "سورس سيرف 4", "serif", w("Source Serif 4"), SERIF),
  entry("newsreader", "Newsreader", "نيوزريدر", "serif", w("Newsreader"), SERIF),
  entry("fraunces", "Fraunces", "فراونسز", "serif", w("Fraunces"), SERIF),
  entry("lora", "Lora", "لورا", "serif", w("Lora", "400;500;600;700"), SERIF),
  entry("merriweather", "Merriweather", "ميريويذر", "serif", "Merriweather:wght@300;400;700;900", SERIF),
  entry("playfair-display", "Playfair Display", "بلاي فير", "serif", w("Playfair Display", "400;500;600;700;800"), SERIF),
  entry("eb-garamond", "EB Garamond", "إي بي جاراموند", "serif", w("EB Garamond"), SERIF),
  entry("cormorant-garamond", "Cormorant Garamond", "كورمورانت", "serif", "Cormorant+Garamond:wght@300;400;500;600;700", SERIF),
  entry("spectral", "Spectral", "سبكترال", "serif", "Spectral:wght@300;400;500;600;700", SERIF),
  entry("literata", "Literata", "ليتراتا", "serif", w("Literata"), SERIF),
  entry("crimson-pro", "Crimson Pro", "كريمسون برو", "serif", w("Crimson Pro"), SERIF),
  entry("noto-serif", "Noto Serif", "نوتو سيرف", "serif", w("Noto Serif"), SERIF),
  entry("libre-baskerville", "Libre Baskerville", "ليبر باسكرفيل", "serif", "Libre+Baskerville:wght@400;700", SERIF),

  /* —— Slab —— */
  entry("bitter", "Bitter", "بيتر", "slab", w("Bitter"), SERIF),
  entry("roboto-slab", "Roboto Slab", "روبوتو سلاب", "slab", w("Roboto Slab"), SERIF),
  entry("zilla-slab", "Zilla Slab", "زيلا سلاب", "slab", "Zilla+Slab:wght@300;400;500;600;700", SERIF),
];

const BY_ID = new Map(LATIN_FONT_CATALOG.map((font) => [font.id, font]));

export function getLatinFontById(id: string | undefined | null): LatinFontEntry {
  if (id && BY_ID.has(id)) return BY_ID.get(id)!;
  return BY_ID.get(DEFAULT_LATIN_FONT_ID)!;
}

export function isLatinFontId(id: string): boolean {
  return BY_ID.has(id);
}

export function latinFontStack(id: string | undefined | null): string {
  const font = getLatinFontById(id);
  const family = font.googleFamily.includes(" ")
    ? `'${font.googleFamily}'`
    : font.googleFamily;
  return `${family}, system-ui, ${font.fallback}`;
}
