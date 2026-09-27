"use client";

import { useState } from "react";
import { Car, KeyRound, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import CarsProviderPanel from "@/components/admin/CarsProviderPanel";
import InternalCarsFleetPanel from "@/components/admin/InternalCarsFleetPanel";
import { type CarProvider } from "@/lib/cars-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { EnterprisePageHeader } from "@/components/admin/enterprise";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminCarsPage() {
  const { t } = useLocale();
  const [provider, setProvider] = useState<CarProvider>("travelpayouts");

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "محركات السفر", href: "/admin/cars" },
          { label: "تأجير السيارات والأسطول" },
        ]}
        icon={<Car className="h-6 w-6 text-primary" />}
        title={t.admin.cars || "إدارة أسطول وتأجير السيارات"}
        subtitle={t.admin.carsSubtitle || "إدارة موفري تأجير السيارات العالميين (Travelpayouts / DiscoverCars) والأسطول الداخلي المباشر للشركة."}
      />

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-xl shadow-xs">
          <CarsProviderPanel onProviderChange={setProvider} />
        </div>

        {provider === "internal" ? (
          <div className="rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-6 backdrop-blur-xl shadow-xs">
            <InternalCarsFleetPanel />
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-xl flex items-start gap-4 text-sm text-foreground">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500">
              <Globe2 size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">المزود الخارجي المباشر نشط</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t.admin.carsLiveHint || "يتم جلب عروض وتوافر وأسعار تأجير السيارات لحظياً عبر واجهة الربط المباشرة مع المورد الخارجي وفق إعدادات المارك أب المسجلة."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
