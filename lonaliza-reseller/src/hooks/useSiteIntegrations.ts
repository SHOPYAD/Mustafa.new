"use client";

/**
 * Loads tracking config from the server store (admin-saved values).
 */
import { useEffect, useState } from "react";
import { getIntegrationsFromEnv } from "@/lib/integrations-env";
import type { SiteIntegrations } from "@/types/site-integrations";

export function useSiteIntegrations(): SiteIntegrations {
  const [integrations, setIntegrations] = useState<SiteIntegrations>(() =>
    getIntegrationsFromEnv()
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/tracking-config", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok && data.integrations) {
          setIntegrations(data.integrations as SiteIntegrations);
        }
      } catch {
        /* keep env fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return integrations;
}
