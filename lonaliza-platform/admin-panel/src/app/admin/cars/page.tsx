// src/app/admin/cars/page.tsx
"use client";

import { useState } from "react";
import {
  Car,
  ShieldCheck,
  Fuel,
  Users,
  Key,
  SlidersHorizontal,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import CarsProviderPanel from "@/components/admin/CarsProviderPanel";
import InternalCarsFleetPanel from "@/components/admin/InternalCarsFleetPanel";
import { type CarProvider } from "@/lib/cars-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type CarTab = "fleet" | "providers";

export default function AdminCarsPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<CarTab>("fleet");
  const [provider, setProvider] = useState<CarProvider>("travelpayouts");

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-8" dir="rtl">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
              الأسطول الفاخر وتأجير السيارات
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              VIP Chauffeur & Luxury Rental Fleet
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Car className="text-amber-500 size-7" />
            إدارة أسطول السيارات والتأجير (Luxury Cars & Fleet Operations)
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            التحكم بأسطول السيارات الفارهة (Mercedes Maybach, S-Class, V-Class VIP)، الأسعار اليومية، وخيارات السائق الخاص.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "fleet" ? "providers" : "fleet")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all shadow-xs"
          >
            <SlidersHorizontal className="size-3.5 text-amber-500" />
            <span>{activeTab === "fleet" ? "إعدادات مزودي الـ API" : "عرض أسطول السيارات"}</span>
          </button>
        </div>
      </div>

      {/* Real KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>الأسطول الفاخر المباشر</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">13 مركبة VIP</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            مرسيدس، رينج روفر، وبي إم دبليو
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>خيارات السائق</span>
            <Sparkles className="size-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">سائق خاص VIP</div>
          <div className="text-[11px] text-muted-foreground mt-1">يتحدثون العربية والإنجليزية</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>التأمين والترخيص</span>
            <ShieldCheck className="size-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">شامل 100%</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
            تأمين سياحي وترخيص TÜRSAB رسمي
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>متوسط الإيجار اليومي</span>
            <span className="text-xs text-muted-foreground font-mono">USD</span>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">$185 / يوم</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
            شامل الكيلومترات المفتوحة
          </div>
        </div>
      </div>

      {/* Navigation Tab Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setActiveTab("fleet")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "fleet"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Car className="size-4" />
          <span>أسطول السيارات الفاخرة (13 مركبة VIP)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("providers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "providers"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <SlidersHorizontal className="size-4" />
          <span>محركات الربط والتأجير الخارجي (Rental APIs)</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "fleet" && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <InternalCarsFleetPanel />
        </div>
      )}

      {activeTab === "providers" && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <CarsProviderPanel onProviderChange={setProvider} />
        </div>
      )}
    </div>
  );
}
