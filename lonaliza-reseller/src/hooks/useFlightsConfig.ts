"use client";

import { useEffect, useState } from "react";
import {
  type FlightsPublicConfig,
  getFlightsConfigFromEnv,
} from "@/lib/flights-config";

export function useFlightsConfig(): {
  config: FlightsPublicConfig;
  loading: boolean;
} {
  const [config, setConfig] = useState<FlightsPublicConfig>(() =>
    getFlightsConfigFromEnv()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/flights-config", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok && data.config) {
          setConfig(data.config as FlightsPublicConfig);
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
