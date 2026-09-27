"use client";

import { useEffect, useState } from "react";
import {
  type CarsPublicConfig,
  getCarsConfigFromEnv,
} from "@/lib/cars-config";

export function useCarsConfig(): {
  config: CarsPublicConfig;
  loading: boolean;
} {
  const [config, setConfig] = useState<CarsPublicConfig>(() =>
    getCarsConfigFromEnv()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/cars-config", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok && data.config) {
          setConfig(data.config as CarsPublicConfig);
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
