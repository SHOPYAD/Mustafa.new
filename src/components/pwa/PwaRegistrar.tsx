"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { applyPwaDocumentChrome, fetchPwaConfig, syncPwaWorkers } from "@/lib/pwa/client";
import { isStandaloneDisplay } from "@/lib/pwa/detect";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Registers the public or admin service worker only when that PWA is enabled.
 * Injects manifest + Apple meta. Does not nag when disabled.
 */
export default function PwaRegistrar() {
  const pathname = usePathname();
  const { locale } = useLocale();

  useEffect(() => {
    let cancelled = false;
    const isAdmin = pathname.startsWith("/admin");

    void (async () => {
      const config = await fetchPwaConfig();
      if (cancelled) return;
      applyPwaDocumentChrome({ config, isAdmin, locale });
      document.documentElement.classList.toggle("pwa-standalone", isStandaloneDisplay());
      document.documentElement.style.setProperty("--pwa-theme", config.themeColor);
      await syncPwaWorkers(config);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, locale]);

  return null;
}
