/**
 * Homepage search widget tab visibility — website channel.
 * App-channel enablement is `appEnabled` in the channel-services store.
 * Do not reuse `visibility` as the app switch.
 */

export type SearchTabKey =
  | "flight"
  | "holiday"
  | "hotel"
  | "tours"
  | "transfers"
  | "cars"
  | "insurance"
  | "visa"
  | "offers";

export type SearchTabVisibility = Record<SearchTabKey, boolean>;

const STORAGE_KEY = "alrayyan_search_tabs_v2";
const ORDER_STORAGE_KEY = "alrayyan_search_tabs_order_v1";
export const SEARCH_TABS_UPDATED_EVENT = "alrayyan:search-tabs-updated";
export const SEARCH_TABS_STORAGE_KEY = STORAGE_KEY;
export const SEARCH_TABS_ORDER_STORAGE_KEY = ORDER_STORAGE_KEY;
export const SEARCH_TABS_ORDER_UPDATED_EVENT = "alrayyan:search-tabs-order-updated";

export const defaultSearchTabVisibility: SearchTabVisibility = {
  flight: true,
  holiday: true,
  hotel: true,
  tours: true,
  transfers: true,
  cars: true,
  insurance: true,
  visa: true,
  offers: true,
};

export const SEARCH_TAB_KEYS: SearchTabKey[] = [
  "flight",
  "holiday",
  "hotel",
  "tours",
  "transfers",
  "cars",
  "insurance",
  "visa",
  "offers",
];

export const defaultSearchTabOrder: SearchTabKey[] = [...SEARCH_TAB_KEYS];

function isSearchTabKey(value: unknown): value is SearchTabKey {
  return (
    typeof value === "string" && SEARCH_TAB_KEYS.includes(value as SearchTabKey)
  );
}

function normalizeOrder(raw: unknown): SearchTabKey[] {
  if (!Array.isArray(raw)) return [...defaultSearchTabOrder];
  const seen = new Set<SearchTabKey>();
  const ordered: SearchTabKey[] = [];
  for (const item of raw) {
    if (isSearchTabKey(item) && !seen.has(item)) {
      seen.add(item);
      ordered.push(item);
    }
  }
  for (const key of SEARCH_TAB_KEYS) {
    if (!seen.has(key)) ordered.push(key);
  }
  return ordered;
}

function emitOrder(detail: SearchTabKey[]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SEARCH_TABS_ORDER_UPDATED_EVENT, { detail })
  );
}

function persistOrder(order: SearchTabKey[]) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  emitOrder(order);
}

export function getSearchTabOrder(): SearchTabKey[] {
  if (typeof window === "undefined") return [...defaultSearchTabOrder];
  const raw = localStorage.getItem(ORDER_STORAGE_KEY);
  if (!raw) {
    persistOrder([...defaultSearchTabOrder]);
    return [...defaultSearchTabOrder];
  }
  try {
    return normalizeOrder(JSON.parse(raw));
  } catch {
    return [...defaultSearchTabOrder];
  }
}

export function saveSearchTabOrder(order: SearchTabKey[]): SearchTabKey[] {
  const next = normalizeOrder(order);
  persistOrder(next);
  return next;
}

export function moveSearchTabOrderItem(
  key: SearchTabKey,
  direction: "up" | "down"
): SearchTabKey[] {
  const order = [...getSearchTabOrder()];
  const index = order.indexOf(key);
  if (index < 0) return order;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= order.length) return order;
  [order[index], order[swapWith]] = [order[swapWith]!, order[index]!];
  return saveSearchTabOrder(order);
}

export function reorderSearchTabs(
  fromKey: SearchTabKey,
  toKey: SearchTabKey
): SearchTabKey[] {
  const order = [...getSearchTabOrder()];
  const from = order.indexOf(fromKey);
  const to = order.indexOf(toKey);
  if (from < 0 || to < 0 || from === to) return order;
  const [item] = order.splice(from, 1);
  if (!item) return order;
  order.splice(to, 0, item);
  return saveSearchTabOrder(order);
}

export function resetSearchTabOrder(): SearchTabKey[] {
  return saveSearchTabOrder([...defaultSearchTabOrder]);
}

function emit(detail: SearchTabVisibility) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SEARCH_TABS_UPDATED_EVENT, { detail })
  );
}

function persist(vis: SearchTabVisibility) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vis));
  emit(vis);
}

export function getSearchTabVisibility(): SearchTabVisibility {
  if (typeof window === "undefined") return { ...defaultSearchTabVisibility };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Migrate v1 if present
    const legacy = localStorage.getItem("alrayyan_search_tabs_v1");
    if (legacy) {
      try {
        const merged = {
          ...defaultSearchTabVisibility,
          ...JSON.parse(legacy),
          cars: true,
        } as SearchTabVisibility;
        persist(merged);
        localStorage.removeItem("alrayyan_search_tabs_v1");
        return merged;
      } catch {
        /* fall through */
      }
    }
    persist(defaultSearchTabVisibility);
    return { ...defaultSearchTabVisibility };
  }
  try {
    return { ...defaultSearchTabVisibility, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSearchTabVisibility };
  }
}

export function saveSearchTabVisibility(
  vis: SearchTabVisibility
): SearchTabVisibility {
  const next = { ...defaultSearchTabVisibility, ...vis };
  persist(next);
  return next;
}

export function resetSearchTabVisibility(): SearchTabVisibility {
  persist(defaultSearchTabVisibility);
  resetSearchTabOrder();
  return { ...defaultSearchTabVisibility };
}

export function getEnabledSearchTabs(): SearchTabKey[] {
  return resolveVisibleSearchTabs(
    getSearchTabVisibility(),
    null,
    getSearchTabOrder()
  );
}

/**
 * Single visibility rule for every breakpoint.
 * A tab is shown only when admin AND homepage appearance both allow it.
 * Never fall back to re-showing explicitly hidden tabs.
 */
export function resolveVisibleSearchTabs(
  adminVis: SearchTabVisibility | null | undefined,
  appearanceVis: Partial<Record<SearchTabKey, boolean>> | null | undefined,
  order: SearchTabKey[] = defaultSearchTabOrder
): SearchTabKey[] {
  const ordered = normalizeOrder(order);
  return ordered.filter((key) => {
    if (adminVis && adminVis[key] === false) return false;
    if (appearanceVis && appearanceVis[key] === false) return false;
    return true;
  });
}
