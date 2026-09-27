/**
 * UI icon assignments — Header + homepage search tabs.
 *
 * STABLE KEY NAMES — do not rename (Header and search engine read these):
 *   nav.home
 *   nav.holidays
 *   nav.flights
 *   nav.hotels
 *   nav.vipDailyTours
 *   nav.transfers
 *   nav.cars
 *   nav.visa
 *   nav.uaeTours
 *   nav.blog
 *   nav.aiChat
 *   nav.contact
 *   nav.custom:{slug}          — extra header CMS pages
 *
 *   searchTab.flights
 *   searchTab.hotels
 *   searchTab.tours
 *   searchTab.transfers
 *   searchTab.cars
 *
 * Persist path: `.data/ui-icons.json`
 * Search engine (Agent A): resolve a widget tab via `searchEngineTabToIconKey(tab)`
 * then `getIconRef(store, key)`. Widget tab ids `flight` / `hotel` map to the
 * plural keys above. Do not change those key strings.
 */

export const UI_ICONS_VERSION = 1;
export const UI_ICONS_UPDATED_EVENT = "alrayyan:ui-icons-updated";

export const NAV_ICON_IDS = [
  "home",
  "holidays",
  "flights",
  "hotels",
  "vipDailyTours",
  "transfers",
  "cars",
  "visa",
  "uaeTours",
  "blog",
  "community",
  "aiChat",
  "contact",
] as const;

export const SEARCH_TAB_ICON_IDS = [
  "flights",
  "hotels",
  "tours",
  "transfers",
  "cars",
] as const;

export type NavIconId = (typeof NAV_ICON_IDS)[number];
export type SearchTabIconId = (typeof SEARCH_TAB_ICON_IDS)[number];

export type NavIconKey = `nav.${string}`;
export type SearchTabIconKey = `searchTab.${SearchTabIconId}`;
export type UiIconSlotKey = NavIconKey | SearchTabIconKey;

export type UiIconSource = "lucide" | "svg";

export type UiIconRef = {
  source: UiIconSource;
  /** Lucide kebab-case name (`plane`) or custom SVG id. */
  name: string;
  /** Inline SVG markup when `source === "svg"`. */
  svg?: string;
};

export type CustomSvgDef = {
  id: string;
  label: string;
  svg: string;
};

export type UiIconsFile = {
  version: number;
  nav: Record<string, UiIconRef>;
  searchTab: Record<SearchTabIconId, UiIconRef>;
  customSvgs: CustomSvgDef[];
};

export const SEARCH_TAB_ICON_KEYS: readonly SearchTabIconKey[] = [
  "searchTab.flights",
  "searchTab.hotels",
  "searchTab.tours",
  "searchTab.transfers",
  "searchTab.cars",
];

export const DEFAULT_NAV_ICONS: Record<NavIconId, UiIconRef> = {
  home: { source: "lucide", name: "house" },
  holidays: { source: "lucide", name: "palmtree" },
  flights: { source: "lucide", name: "plane" },
  hotels: { source: "lucide", name: "hotel" },
  vipDailyTours: { source: "lucide", name: "tickets" },
  transfers: { source: "lucide", name: "car-front" },
  cars: { source: "lucide", name: "car" },
  visa: { source: "lucide", name: "stamp" },
  uaeTours: { source: "lucide", name: "landmark" },
  blog: { source: "lucide", name: "newspaper" },
  community: { source: "lucide", name: "share-2" },
  aiChat: { source: "lucide", name: "sparkles" },
  contact: { source: "lucide", name: "phone" },
};

export const DEFAULT_SEARCH_TAB_ICONS: Record<SearchTabIconId, UiIconRef> = {
  flights: { source: "lucide", name: "plane" },
  hotels: { source: "lucide", name: "hotel" },
  tours: { source: "lucide", name: "palmtree" },
  transfers: { source: "lucide", name: "car-front" },
  cars: { source: "lucide", name: "car" },
};

export const FALLBACK_ICON: UiIconRef = { source: "lucide", name: "circle" };

export const DEFAULT_UI_ICONS: UiIconsFile = {
  version: UI_ICONS_VERSION,
  nav: { ...DEFAULT_NAV_ICONS },
  searchTab: { ...DEFAULT_SEARCH_TAB_ICONS },
  customSvgs: [],
};

export function navIconKey(id: string): NavIconKey {
  return `nav.${id}`;
}

export function searchTabIconKey(id: SearchTabIconId): SearchTabIconKey {
  return `searchTab.${id}`;
}

/**
 * Map homepage search-widget tab ids (including singular Agent A ids)
 * onto the stable `searchTab.*` keys. Unknown tabs return null.
 */
export function searchEngineTabToIconKey(tab: string): SearchTabIconKey | null {
  switch (tab) {
    case "flight":
    case "flights":
      return "searchTab.flights";
    case "hotel":
    case "hotels":
      return "searchTab.hotels";
    case "tours":
      return "searchTab.tours";
    case "transfers":
      return "searchTab.transfers";
    case "cars":
      return "searchTab.cars";
    default:
      return null;
  }
}

export function isSearchTabIconId(value: string): value is SearchTabIconId {
  return (SEARCH_TAB_ICON_IDS as readonly string[]).includes(value);
}

export function lucideNameToKebab(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  if (trimmed.includes("-") || trimmed === trimmed.toLowerCase()) {
    return trimmed.toLowerCase().replace(/_/g, "-");
  }
  return trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export function sanitizeSvgMarkup(raw: string): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const start = trimmed.search(/<svg[\s>]/i);
  if (start < 0) return null;
  const sliced = trimmed.slice(start);
  const end = sliced.toLowerCase().lastIndexOf("</svg>");
  if (end < 0) return null;
  let svg = sliced.slice(0, end + 6);
  svg = svg
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<animate\b[\s\S]*?<\/animate>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "");
  if (!/^<svg[\s>]/i.test(svg)) return null;
  if (!/\sxmlns=/.test(svg)) {
    svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (svg.length > 80_000) return null;
  return svg;
}

function asIconRef(value: unknown, fallback: UiIconRef): UiIconRef {
  if (!value || typeof value !== "object") return { ...fallback };
  const row = value as Record<string, unknown>;
  const source = row.source === "svg" ? "svg" : "lucide";
  const name =
    typeof row.name === "string" && row.name.trim()
      ? source === "lucide"
        ? lucideNameToKebab(row.name)
        : row.name.trim()
      : fallback.name;
  const svg =
    typeof row.svg === "string" ? sanitizeSvgMarkup(row.svg) || undefined : undefined;
  if (source === "svg") {
    const markup = svg || (typeof fallback.svg === "string" ? fallback.svg : "");
    if (!markup) return { ...fallback };
    return { source: "svg", name, svg: markup };
  }
  return { source: "lucide", name: name || fallback.name };
}

function asCustomSvg(value: unknown): CustomSvgDef | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.trim() : "";
  const label = typeof row.label === "string" ? row.label.trim() : "";
  const svg = typeof row.svg === "string" ? sanitizeSvgMarkup(row.svg) : null;
  if (!id || !svg) return null;
  return { id, label: label || id, svg };
}

export function normalizeUiIcons(input: unknown): UiIconsFile {
  const raw =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const navIn =
    raw.nav && typeof raw.nav === "object"
      ? (raw.nav as Record<string, unknown>)
      : {};
  const tabIn =
    raw.searchTab && typeof raw.searchTab === "object"
      ? (raw.searchTab as Record<string, unknown>)
      : {};

  const nav: Record<string, UiIconRef> = {};
  for (const id of NAV_ICON_IDS) {
    nav[id] = asIconRef(navIn[id], DEFAULT_NAV_ICONS[id]);
  }
  for (const [id, value] of Object.entries(navIn)) {
    if (nav[id]) continue;
    if (!id.trim()) continue;
    nav[id] = asIconRef(value, FALLBACK_ICON);
  }

  const searchTab = { ...DEFAULT_SEARCH_TAB_ICONS };
  for (const id of SEARCH_TAB_ICON_IDS) {
    searchTab[id] = asIconRef(tabIn[id], DEFAULT_SEARCH_TAB_ICONS[id]);
  }

  const customRaw = Array.isArray(raw.customSvgs) ? raw.customSvgs : [];
  const customSvgs: CustomSvgDef[] = [];
  const seen = new Set<string>();
  for (const item of customRaw) {
    const def = asCustomSvg(item);
    if (!def || seen.has(def.id)) continue;
    seen.add(def.id);
    customSvgs.push(def);
  }

  return {
    version: UI_ICONS_VERSION,
    nav,
    searchTab,
    customSvgs,
  };
}

export function getIconRef(store: UiIconsFile, key: string): UiIconRef {
  if (key.startsWith("nav.")) {
    const id = key.slice(4);
    return store.nav[id] ?? DEFAULT_NAV_ICONS[id as NavIconId] ?? FALLBACK_ICON;
  }
  if (key.startsWith("searchTab.")) {
    const id = key.slice("searchTab.".length);
    if (isSearchTabIconId(id)) {
      return store.searchTab[id] ?? DEFAULT_SEARCH_TAB_ICONS[id];
    }
  }
  return FALLBACK_ICON;
}

export function setIconRef(
  store: UiIconsFile,
  key: string,
  icon: UiIconRef
): UiIconsFile {
  const next = normalizeUiIcons(store);
  const ref = asIconRef(icon, FALLBACK_ICON);
  if (key.startsWith("nav.")) {
    const id = key.slice(4).trim();
    if (id) next.nav[id] = ref;
    return next;
  }
  if (key.startsWith("searchTab.")) {
    const id = key.slice("searchTab.".length);
    if (isSearchTabIconId(id)) next.searchTab[id] = ref;
    return next;
  }
  return next;
}

export function resolveCustomSvg(
  store: UiIconsFile,
  ref: UiIconRef
): string | null {
  if (ref.source !== "svg") return null;
  if (ref.svg) return sanitizeSvgMarkup(ref.svg);
  const found = store.customSvgs.find((item) => item.id === ref.name);
  return found ? found.svg : null;
}
