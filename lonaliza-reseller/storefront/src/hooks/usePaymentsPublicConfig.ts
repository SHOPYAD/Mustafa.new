"use client";

import { useEffect, useState } from "react";

export type PaymentsPublicFlags = {
  iyzicoEnabled: boolean;
  whatsappBankLinkEnabled: boolean;
};

export function usePaymentsPublicConfig(): {
  config: PaymentsPublicFlags | null;
  loading: boolean;
} {
  const [config, setConfig] = useState<PaymentsPublicFlags | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/payments/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: PaymentsPublicFlags & { ok?: boolean }) => {
        if (cancelled) return;
        setConfig({
          iyzicoEnabled: Boolean(data.iyzicoEnabled),
          whatsappBankLinkEnabled: data.whatsappBankLinkEnabled !== false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setConfig({
          iyzicoEnabled: false,
          whatsappBankLinkEnabled: true,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading };
}
