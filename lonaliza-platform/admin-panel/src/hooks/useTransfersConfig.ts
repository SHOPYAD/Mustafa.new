"use client";

import { useEffect, useState } from "react";
import {
  type TransfersPublicConfig,
  getTransfersConfigFromEnv,
} from "@/lib/transfers-config";

export function useTransfersConfig(): {
  config: TransfersPublicConfig;
  loading: boolean;
} {
  const [config, setConfig] = useState<TransfersPublicConfig>(() =>
    getTransfersConfigFromEnv()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/transfers-config", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok && data.config) {
          setConfig(data.config as TransfersPublicConfig);
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
