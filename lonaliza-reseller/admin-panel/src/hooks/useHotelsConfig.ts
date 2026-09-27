"use client";

import { useEffect, useState } from "react";
import {
  type HotelsPublicConfig,
  getHotelsConfigFromEnv,
} from "@/lib/hotels-config";

export function useHotelsConfig(): {
  config: HotelsPublicConfig;
  loading: boolean;
} {
  const [config, setConfig] = useState<HotelsPublicConfig>(() =>
    getHotelsConfigFromEnv()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/hotels-config", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok && data.config) {
          setConfig(data.config as HotelsPublicConfig);
        }
      } catch {
        /* keep env fallback */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading };
}
