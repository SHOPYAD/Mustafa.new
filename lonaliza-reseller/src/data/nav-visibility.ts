/** Public header / footer service placement — localStorage CMS */

export type NavServiceKey =
  | "home"
  | "holidays"
  | "flights"
  | "hotels"
  | "vipDailyTours"
  | "transfers"
  | "cars"
  | "visa"
  | "uaeTours"
  | "blog"
  | "aiChat"
  | "contact";

export type NavPlacement = "header-footer" | "header" | "footer" | "hidden";

export type NavVisibility = Record<NavServiceKey, NavPlacement>;

const STORAGE_KEY = "alrayyan_nav_placement_v1";
const LEGACY_STORAGE_KEY = "oktravel_nav_visibility_v1";
export const NAV_VISIBILITY_UPDATED_EVENT = "liotrip:nav-visibility-updated";
export const NAV_VISIBILITY_STORAGE_KEY = STORAGE_KEY;

export const NAV_PLACEMENTS: NavPlacement[] = [
  "header-footer",
  "header",
  "footer",
  "hidden",
];

export const defaultNavVisibility: NavVisibility = {
  home: "header-footer",
  holidays: "header-footer",
  flights: "header-footer",
  hotels: "header-footer",
  vipDailyTours: "header-footer",
  transfers: "header-footer",
  cars: "header-footer",
  visa: "header-footer",
  uaeTours: "hidden",
  blog: "footer",
  aiChat: "header",
  contact: "header-footer",
};

export const NAV_SERVICE_KEYS: NavServiceKey[] = [
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
  "aiChat",
  "contact",
];

/** Items shown in the header bar before overflow moves into «More». */
export const HEADER_MAX_PRIMARY = 6;

export const defaultNavOrder: NavServiceKey[] = [...NAV_SERVICE_KEYS];

const ORDER_STORAGE_KEY = "alrayyan_nav_order_v1";
export const NAV_ORDER_STORAGE_KEY = ORDER_STORAGE_KEY;
export const NAV_ORDER_UPDATED_EVENT = "liotrip:nav-order-updated";

function normalizeOrder(raw: unknown): NavServiceKey[] {
  if (!Array.isArray(raw)) return [...defaultNavOrder];
  const seen = new Set<NavServiceKey>();
  const ordered: NavServiceKey[] = [];
  for (const item of raw) {
    if (
      typeof item === "string" &&
      NAV_SERVICE_KEYS.includes(item as NavServiceKey)
    ) {
      const key = item as NavServiceKey;
      if (!seen.has(key)) {
        seen.add(key);
        ordered.push(key);
      }
    }
  }
  for (const key of NAV_SERVICE_KEYS) {
    if (!seen.has(key)) ordered.push(key);
  }
  return ordered;
}

function emitOrder(detail: NavServiceKey[]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(NAV_ORDER_UPDATED_EVENT, { detail })
  );
}

function persistOrder(order: NavServiceKey[]) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  emitOrder(order);
}

export function getNavOrder(): NavServiceKey[] {
  if (typeof window === "undefined") return [...defaultNavOrder];
  const raw = localStorage.getItem(ORDER_STORAGE_KEY);
  if (!raw) {
    persistOrder([...defaultNavOrder]);
    return [...defaultNavOrder];
  }
  try {
    const next = normalizeOrder(JSON.parse(raw));
    return next;
  } catch {
    return [...defaultNavOrder];
  }
}

export function saveNavOrder(order: NavServiceKey[]): NavServiceKey[] {
  const next = normalizeOrder(order);
  persistOrder(next);
  return next;
}

export function moveNavOrderItem(
  key: NavServiceKey,
  direction: "up" | "down"
): NavServiceKey[] {
  const order = [...getNavOrder()];
  const index = order.indexOf(key);
  if (index < 0) return order;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= order.length) return order;
  [order[index], order[swapWith]] = [order[swapWith]!, order[index]!];
  return saveNavOrder(order);
}

export function resetNavOrder(): NavServiceKey[] {
  return saveNavOrder([...defaultNavOrder]);
}

export function compareNavOrder(
  a: NavServiceKey,
  b: NavServiceKey,
  order: NavServiceKey[] = getNavOrder()
): number {
  const indexA = order.indexOf(a);
  const indexB = order.indexOf(b);
  return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
}

export function sortByNavOrder<T>(
  items: T[],
  getKey: (item: T) => NavServiceKey | null
): T[] {
  const order = getNavOrder();
  return [...items].sort((a, b) => {
    const keyA = getKey(a);
    const keyB = getKey(b);
    if (!keyA && !keyB) return 0;
    if (!keyA) return 1;
    if (!keyB) return -1;
    return compareNavOrder(keyA, keyB, order);
  });
}

function isPlacement(value: unknown): value is NavPlacement {
  return (
    value === "header-footer" ||
    value === "header" ||
    value === "footer" ||
    value === "hidden"
  );
}

export function showsInHeader(placement: NavPlacement): boolean {
  switch (placement) {
    case "header-footer":
    case "header":
      return true;
    case "footer":
    case "hidden":
      return false;
    default: {
      const _never: never = placement;
      return _never;
    }
  }
}

export function showsInFooter(placement: NavPlacement): boolean {
  switch (placement) {
    case "header-footer":
    case "footer":
      return true;
    case "header":
    case "hidden":
      return false;
    default: {
      const _never: never = placement;
      return _never;
    }
  }
}

export function placementFromFlags(
  showInHeader: boolean,
  showInFooter: boolean
): NavPlacement {
  if (showInHeader && showInFooter) return "header-footer";
  if (showInHeader) return "header";
  if (showInFooter) return "footer";
  return "hidden";
}

export function flagsFromPlacement(placement: NavPlacement): {
  showInHeader: boolean;
  showInFooter: boolean;
} {
  switch (placement) {
    case "header-footer":
      return { showInHeader: true, showInFooter: true };
    case "header":
      return { showInHeader: true, showInFooter: false };
    case "footer":
      return { showInHeader: false, showInFooter: true };
    case "hidden":
      return { showInHeader: false, showInFooter: false };
    default: {
      const _never: never = placement;
      return _never;
    }
  }
}

function coercePlacement(key: NavServiceKey, raw: unknown): NavPlacement {
  if (isPlacement(raw)) return raw;
  if (raw === false) return "hidden";
  if (raw === true) {
    if (key === "blog") return "footer";
    if (key === "aiChat") return "header";
    if (key === "uaeTours") return "hidden";
    return "header-footer";
  }
  return defaultNavVisibility[key];
}

function normalizeStored(raw: unknown): NavVisibility {
  const parsed =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const next = { ...defaultNavVisibility };
  for (const key of NAV_SERVICE_KEYS) {
    if (key in parsed) next[key] = coercePlacement(key, parsed[key]);
  }
  return next;
}

function emit(detail: NavVisibility) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(NAV_VISIBILITY_UPDATED_EVENT, { detail })
  );
}

function persist(vis: NavVisibility) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vis));
  emit(vis);
}

function readRaw(): string | null {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) return current;
  return localStorage.getItem(LEGACY_STORAGE_KEY);
}

export function getNavVisibility(): NavVisibility {
  if (typeof window === "undefined") return { ...defaultNavVisibility };
  const raw = readRaw();
  if (!raw) {
    persist(defaultNavVisibility);
    return { ...defaultNavVisibility };
  }
  try {
    const next = normalizeStored(JSON.parse(raw));
    if (!localStorage.getItem(STORAGE_KEY)) persist(next);
    return next;
  } catch {
    return { ...defaultNavVisibility };
  }
}

export function saveNavVisibility(vis: NavVisibility): NavVisibility {
  const next = normalizeStored(vis);
  persist(next);
  return next;
}

export function setNavServicePlacement(
  key: NavServiceKey,
  placement: NavPlacement
): NavVisibility {
  const current = getNavVisibility();
  return saveNavVisibility({ ...current, [key]: placement });
}

export function setNavServiceVisible(
  key: NavServiceKey,
  visible: boolean
): NavVisibility {
  return setNavServicePlacement(
    key,
    visible ? defaultNavVisibility[key] : "hidden"
  );
}

export function resetNavVisibility(): NavVisibility {
  persist(defaultNavVisibility);
  resetNavOrder();
  return { ...defaultNavVisibility };
}

/** Map href path to visibility key */
export function navKeyFromHref(href: string): NavServiceKey | null {
  if (href === "/") return "home";
  if (href.startsWith("/holidays")) return "holidays";
  if (href.startsWith("/flights")) return "flights";
  if (href.startsWith("/hotels")) return "hotels";
  if (href.includes("type=vip_tour") || href.startsWith("/vip-tours")) {
    return "vipDailyTours";
  }
  if (href.startsWith("/transfers")) return "transfers";
  if (href.startsWith("/cars")) return "cars";
  if (href.startsWith("/visa")) return "visa";
  if (href.startsWith("/uae-tours")) return "vipDailyTours";
  if (href.startsWith("/blog")) return "blog";
  if (href.startsWith("/ai-chat")) return "aiChat";
  if (href.startsWith("/contact")) return "contact";
  return null;
}
