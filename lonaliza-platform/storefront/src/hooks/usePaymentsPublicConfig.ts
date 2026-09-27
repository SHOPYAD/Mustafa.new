"use client";

import { useEffect, useState } from "react";

export type ActiveGatewayPublic = {
  kind: string;
  displayName: string;
  type: string;
  testMode: boolean;
  isSystemDefault: boolean;
  logo: string;
};

export type PaymentsPublicFlags = {
  iyzicoEnabled: boolean;
  whatsappBankLinkEnabled: boolean;
  onlinePaymentEnabled?: boolean;
  activeGateway?: ActiveGatewayPublic;
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
          onlinePaymentEnabled: Boolean(data.onlinePaymentEnabled ?? data.iyzicoEnabled),
          activeGateway: data.activeGateway,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setConfig({
          iyzicoEnabled: false,
          whatsappBankLinkEnabled: true,
          onlinePaymentEnabled: false,
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
