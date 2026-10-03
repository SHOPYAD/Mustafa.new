"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { StorefrontInitData, MobileAppLinksData } from "@/types/site-init";
import type { SiteContact } from "@/types/site-contact";
import type { PublicPageLink } from "@/types/custom-page";

interface StorefrontInitContextValue {
  data: StorefrontInitData | null;
  contact: SiteContact | null;
  pages: PublicPageLink[];
  headerPages: PublicPageLink[];
  footerPages: PublicPageLink[];
  appLinks: MobileAppLinksData | null;
  searchTabs: StorefrontInitData["searchTabs"] | null;
  isHydrated: boolean;
  refresh: () => Promise<void>;
}

const StorefrontInitContext = createContext<StorefrontInitContextValue | null>(null);

export function StorefrontInitProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: StorefrontInitData | null;
}) {
  const [data, setData] = useState<StorefrontInitData | null>(initialData || null);
  const [isHydrated, setIsHydrated] = useState<boolean>(Boolean(initialData));

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/public-init?refresh=1");
      if (res.ok) {
        const payload = await res.json();
        if (payload?.ok && payload.data) {
          setData(payload.data);
          setIsHydrated(true);
        }
      }
    } catch {
      /* ignore background refresh failure */
    }
  }, []);

  useEffect(() => {
    // If we didn't get initialData from SSR, fetch it once on mount
    if (!data) {
      void refresh();
    }
  }, [data, refresh]);

  const value = useMemo<StorefrontInitContextValue>(() => {
    const pages = data?.pages || [];
    return {
      data,
      contact: data?.contact || null,
      pages,
      headerPages: pages.filter((p) => p.showInHeader),
      footerPages: pages.filter((p) => p.showInFooter),
      appLinks: data?.appLinks || null,
      searchTabs: data?.searchTabs || null,
      isHydrated,
      refresh,
    };
  }, [data, isHydrated, refresh]);

  return (
    <StorefrontInitContext.Provider value={value}>
      {children}
    </StorefrontInitContext.Provider>
  );
}

export function useStorefrontInit(): StorefrontInitContextValue {
  const ctx = useContext(StorefrontInitContext);
  if (!ctx) {
    return {
      data: null,
      contact: null,
      pages: [],
      headerPages: [],
      footerPages: [],
      appLinks: null,
      searchTabs: null,
      isHydrated: false,
      refresh: async () => {},
    };
  }
  return ctx;
}

// Aliases for compatibility
export const StorefrontBootstrapProvider = StorefrontInitProvider;
export const useStorefrontBootstrap = useStorefrontInit;
