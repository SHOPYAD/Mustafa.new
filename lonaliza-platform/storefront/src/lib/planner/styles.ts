import type { PlannerPrefs, PlannerStyle } from "@/types/planner";

export const ALL_PLANNER_STYLES: PlannerStyle[] = [
  "cultural",
  "historical",
  "nature",
  "classic",
  "cityscape",
  "beaches",
  "relaxation",
  "adventure",
  "family",
  "shopping",
  "food",
  "luxury",
  "romantic",
  "photography",
];

export function prefsStyles(prefs?: PlannerPrefs | null): PlannerStyle[] {
  const extra = (prefs?.styles || []).filter(Boolean);
  const primary = prefs?.style;
  const list = extra.length ? extra : primary ? [primary] : ["cultural"];
  return Array.from(new Set<PlannerStyle>(list as PlannerStyle[]));
}

export function stylesFromText(raw: string): PlannerStyle[] {
  const t = String(raw || "").toLowerCase();
  const out: PlannerStyle[] = [];
  if (/beach|sea|coast|yacht|island|شاط|بحر|جزيرة|يخت|سواحل/.test(t)) out.push("beaches");
  if (/museum|mosque|church|cultural|heritage|متحف|مسجد|كنيسة|ثقاف/.test(t)) out.push("cultural");
  if (/castle|palace|ruin|historic|monastery|قصر|قلعة|دير|تاريخ|أثر/.test(t)) out.push("historical");
  if (/lake|valley|waterfall|mountain|park|plateau|cave|بحيرة|شلال|هضبة|وادي|طبيعة|غاب/.test(t)) out.push("nature");
  if (/bazaar|market|harbor|square|old town|سوق|ميناء|ميدان|مدينة/.test(t)) out.push("cityscape");
  if (/hike|trek|raft|climb|paraglid|مغامر|باراشوت|تلفريك/.test(t)) out.push("adventure");
  if (/family|kids|aquarium|theme park|zoo|أطفال|عائل|ملاهي/.test(t)) out.push("family");
  if (/food|restaurant|cuisine|مطعم|أكل|تذوق|طهي/.test(t)) out.push("food");
  if (/shop|mall|bazaar|outlet|تسوق|بازار|مول/.test(t)) out.push("shopping");
  if (/spa|hammam|relax|thermal|wellness|ينبوع|استرخ|سبا|حمام تركي/.test(t)) out.push("relaxation");
  if (/vip|luxury|exclusive|palace|فاخر|نخبة|ملكي/.test(t)) out.push("luxury");
  if (/view|viewpoint|sunset|balloon|منظر|غروب|منطاد|تصوير/.test(t)) out.push("photography");
  if (/romantic|couple|honeymoon|رومانس|شهر عسل/.test(t)) out.push("romantic");
  return out.length ? out : ["classic"];
}

export function styleLabel(style: PlannerStyle, locale: string): string {
  const ar: Record<PlannerStyle, string> = {
    cultural: "ثقافي وتراثي",
    historical: "تاريخي وآثار",
    nature: "طبيعة وريف",
    classic: "كلاسيكي وأيقوني",
    cityscape: "أجواء المدينة",
    beaches: "شواطئ وبحرية",
    relaxation: "استجمام وسبا",
    adventure: "مغامرة وتشويق",
    family: "ترفيه عائلي",
    shopping: "تسوق وبازارات",
    food: "طهي وتذوق",
    luxury: "فاخر ونخبة VIP",
    romantic: "رومانسي وشهر عسل",
    photography: "تصوير ومناظر",
  };
  const en: Record<PlannerStyle, string> = {
    cultural: "Cultural & Heritage",
    historical: "Historical Landmarks",
    nature: "Nature & Countryside",
    classic: "Classic & Iconic",
    cityscape: "City Life",
    beaches: "Beaches & Coastal",
    relaxation: "Relaxation & Spa",
    adventure: "Adventure & Thrills",
    family: "Family & Entertainment",
    shopping: "Shopping & Bazaars",
    food: "Gastronomy & Culinary",
    luxury: "Luxury & VIP",
    romantic: "Romantic & Honeymoon",
    photography: "Photography & Scenic",
  };
  const tr: Record<PlannerStyle, string> = {
    cultural: "Kültür & Miras",
    historical: "Tarihi Yerler",
    nature: "Doğa & Kırsal",
    classic: "Klasik & İkonik",
    cityscape: "Şehir Yaşamı",
    beaches: "Plaj & Sahil",
    relaxation: "Dinlenme & Spa",
    adventure: "Macera & Heyecan",
    family: "Aile & Eğlence",
    shopping: "Alışveriş & Çarşı",
    food: "Gastronomi & Lezzet",
    luxury: "Lüks & VIP",
    romantic: "Romantik",
    photography: "Fotoğraf & Manzara",
  };
  const fr: Record<PlannerStyle, string> = {
    cultural: "Culturel & Patrimoine",
    historical: "Historique",
    nature: "Nature & Campagne",
    classic: "Classique & Iconique",
    cityscape: "Vie urbaine",
    beaches: "Plages & Littoral",
    relaxation: "Détente & Spa",
    adventure: "Aventure",
    family: "Famille & Loisirs",
    shopping: "Shopping & Bazars",
    food: "Gastronomie",
    luxury: "Luxe & VIP",
    romantic: "Romantique",
    photography: "Photo & Panoramas",
  };
  if (locale === "tr") return tr[style] || style;
  if (locale === "fr") return fr[style] || style;
  if (locale === "en") return en[style] || style;
  return ar[style] || style;
}
