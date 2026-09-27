"use client";

import { useState } from "react";
import { Car } from "lucide-react";
import CarsProviderPanel from "@/components/admin/CarsProviderPanel";
import InternalCarsFleetPanel from "@/components/admin/InternalCarsFleetPanel";
import { type CarProvider } from "@/lib/cars-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AdminModule, AdminPage, AdminPageHeader } from "@/components/admin/layout";

export default function AdminCarsPage() {
  const { t } = useLocale();
  const [provider, setProvider] = useState<CarProvider>("travelpayouts");

  return (
    <AdminPage className="flex flex-col gap-6">
      <AdminPageHeader
        icon={<Car className="size-5" />}
        title={t.admin.cars}
        description={t.admin.carsSubtitle}
      />
      <AdminModule>
        <CarsProviderPanel onProviderChange={setProvider} />
      </AdminModule>
      {provider === "internal" ? (
        <AdminModule>
          <InternalCarsFleetPanel />
        </AdminModule>
      ) : (
        <AdminModule>
          <p className="text-sm text-[color:var(--admin-text-muted)]">{t.admin.carsLiveHint}</p>
        </AdminModule>
      )}
    </AdminPage>
  );
}
