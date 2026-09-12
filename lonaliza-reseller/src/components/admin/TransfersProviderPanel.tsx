"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { type TransferProvider } from "@/lib/transfers-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ProvidersHub from "@/components/admin/providers/ProvidersHub";

type TransfersProviderPanelProps = {
  onProviderChange?: (provider: TransferProvider) => void;
};

export default function TransfersProviderPanel({
  onProviderChange,
}: TransfersProviderPanelProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/transfers-settings", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && data.values) {
        onProviderChange?.(
          data.values.NEXT_PUBLIC_TRANSFERS_PROVIDER === "travelpayouts"
            ? "travelpayouts"
            : "internal"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [onProviderChange]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="mb-8 flex items-center gap-2 text-white/50">
        <Loader2 size={18} className="animate-spin" />
        {t.admin.loading}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <ProvidersHub vertical="transfers" onLiveChange={() => void load()} />
    </div>
  );
}
