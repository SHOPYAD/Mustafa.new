"use client";

import { useEffect, useState } from "react";
import type { PublicPageLink } from "@/types/custom-page";
import { useStorefrontInit } from "@/providers/StorefrontInitProvider";

export function usePublicPages(): {
  pages: PublicPageLink[];
  headerPages: PublicPageLink[];
  footerPages: PublicPageLink[];
} {
  const init = useStorefrontInit();
  const [pages, setPages] = useState<PublicPageLink[]>(() => init.pages || []);

  useEffect(() => {
    if (init.pages && init.pages.length > 0) {
      setPages(init.pages);
      return;
    }
    // Only fetch if init didn't have pages
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/public-pages", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok && Array.isArray(data.pages)) {
          setPages(data.pages as PublicPageLink[]);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [init.pages]);

  return {
    pages,
    headerPages: pages.filter((p) => p.showInHeader),
    footerPages: pages.filter((p) => p.showInFooter),
  };
}
