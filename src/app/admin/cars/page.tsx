"use client";

import { useState } from "react";
import { Car } from "lucide-react";
import CarsProviderPanel from "@/components/admin/CarsProviderPanel";
import InternalCarsFleetPanel from "@/components/admin/InternalCarsFleetPanel";
import { type CarProvider } from "@/lib/cars-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function AdminCarsPage() {
  const { t } = useLocale();
  const [provider, setProvider] = useState<CarProvider>("travelpayouts");

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Car className="text-emerald-400" size={28} />
            {t.admin.cars}
          </h1>
          <p className="text-white/50 mt-1">{t.admin.carsSubtitle}</p>
        </div>
      </div>

      <CarsProviderPanel onProviderChange={setProvider} />

      {provider === "internal" ? (
        <InternalCarsFleetPanel />
      ) : (
        <p className="text-white/35 text-sm">{t.admin.carsLiveHint}</p>
      )}
    </div>
  );
}
