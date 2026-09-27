"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { type CarProvider } from "@/lib/cars-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ProvidersHub from "@/components/admin/providers/ProvidersHub";

type CarsProviderPanelProps = {
  onProviderChange?: (provider: CarProvider) => void;
};

export default function CarsProviderPanel({
  onProviderChange,
}: CarsProviderPanelProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cars-settings", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && data.values) {
        onProviderChange?.(
          data.values.NEXT_PUBLIC_CARS_PROVIDER === "internal"
            ? "internal"
            : "travelpayouts"
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
      <div className='mb-8 flex items-center gap-2 text-muted-foreground'>
        <Loader2 size={18} className="animate-spin" />
        {t.admin.loading}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <ProvidersHub vertical="cars" onLiveChange={() => void load()} />
    </div>
  );
}
