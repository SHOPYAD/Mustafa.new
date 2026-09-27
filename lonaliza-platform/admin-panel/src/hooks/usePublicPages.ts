"use client";

import { useEffect, useState } from "react";
import type { PublicPageLink } from "@/types/custom-page";

export function usePublicPages(): {
  pages: PublicPageLink[];
  headerPages: PublicPageLink[];
  footerPages: PublicPageLink[];
} {
  const [pages, setPages] = useState<PublicPageLink[]>([]);

  useEffect(() => {
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
  }, []);

  return {
    pages,
    headerPages: pages.filter((p) => p.showInHeader),
    footerPages: pages.filter((p) => p.showInFooter),
  };
}
