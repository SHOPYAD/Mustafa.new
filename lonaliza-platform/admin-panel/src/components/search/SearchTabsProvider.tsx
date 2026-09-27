"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultSearchTabOrder,
  defaultSearchTabVisibility,
  getSearchTabOrder,
  getSearchTabVisibility,
  resolveVisibleSearchTabs,
  SEARCH_TAB_KEYS,
  SEARCH_TABS_ORDER_STORAGE_KEY,
  SEARCH_TABS_ORDER_UPDATED_EVENT,
  SEARCH_TABS_STORAGE_KEY,
  SEARCH_TABS_UPDATED_EVENT,
  type SearchTabKey,
  type SearchTabVisibility,
} from "@/data/search-tabs";

type SearchTabsContextValue = {
  visibility: SearchTabVisibility;
  order: SearchTabKey[];
  enabled: SearchTabKey[];
};

const SearchTabsContext = createContext<SearchTabsContextValue>({
  visibility: defaultSearchTabVisibility,
  order: defaultSearchTabOrder,
  enabled: resolveVisibleSearchTabs(
    defaultSearchTabVisibility,
    null,
    defaultSearchTabOrder
  ),
});

export function SearchTabsProvider({
  initialVisibility,
  initialOrder,
  children,
}: {
  initialVisibility: SearchTabVisibility;
  initialOrder: SearchTabKey[];
  children: ReactNode;
}) {
  const [visibility, setVisibility] = useState<SearchTabVisibility>(initialVisibility);
  const [order, setOrder] = useState<SearchTabKey[]>(initialOrder);

  useEffect(() => {
    const applyLocal = () => {
      setVisibility(getSearchTabVisibility());
      setOrder(getSearchTabOrder());
    };

    const localHasHides = SEARCH_TAB_KEYS.some(
      (key) => getSearchTabVisibility()[key] === false
    );
    const serverHasHides = SEARCH_TAB_KEYS.some(
      (key) => initialVisibility[key] === false
    );
    if (localHasHides && !serverHasHides) applyLocal();

    const onVis = (e: Event) => {
      const detail = (e as CustomEvent<SearchTabVisibility>).detail;
      if (detail) setVisibility({ ...defaultSearchTabVisibility, ...detail });
      else applyLocal();
    };
    const onOrder = (e: Event) => {
      const detail = (e as CustomEvent<SearchTabKey[]>).detail;
      if (Array.isArray(detail) && detail.length) setOrder(detail);
      else applyLocal();
    };
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === SEARCH_TABS_STORAGE_KEY ||
        e.key === SEARCH_TABS_ORDER_STORAGE_KEY
      ) {
        applyLocal();
      }
    };

    window.addEventListener(SEARCH_TABS_UPDATED_EVENT, onVis);
    window.addEventListener(SEARCH_TABS_ORDER_UPDATED_EVENT, onOrder);
    window.addEventListener("storage", onStorage);

    void fetch("/api/search-tabs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok || !data.visibility) return;
        const incoming = { ...defaultSearchTabVisibility, ...data.visibility };
        if (!data.updatedAt) {
          const localVis = getSearchTabVisibility();
          if (SEARCH_TAB_KEYS.some((key) => localVis[key] === false)) {
            setVisibility(localVis);
            setOrder(getSearchTabOrder());
            return;
          }
        }
        setVisibility(incoming);
        if (Array.isArray(data.order) && data.order.length) setOrder(data.order);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener(SEARCH_TABS_UPDATED_EVENT, onVis);
      window.removeEventListener(SEARCH_TABS_ORDER_UPDATED_EVENT, onOrder);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const enabled = useMemo(
    () => resolveVisibleSearchTabs(visibility, null, order),
    [visibility, order]
  );

  const value = useMemo(
    () => ({ visibility, order, enabled }),
    [visibility, order, enabled]
  );

  return (
    <SearchTabsContext.Provider value={value}>{children}</SearchTabsContext.Provider>
  );
}

export function useSearchTabs(): SearchTabsContextValue {
  return useContext(SearchTabsContext);
}

export default SearchTabsProvider;
