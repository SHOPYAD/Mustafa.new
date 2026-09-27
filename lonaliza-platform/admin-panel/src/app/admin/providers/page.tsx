"use client";

import { Plug } from "lucide-react";
import ProvidersHub from "@/components/admin/providers/ProvidersHub";

export default function AdminProvidersPage() {
  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <div className="flex items-start gap-3">
        <span className='size-11 rounded-2xl border border-border bg-primary/10 flex items-center justify-center text-primary shrink-0'>
          <Plug size={20} />
        </span>
        <div>
          <h1 className='text-2xl font-bold text-foreground tracking-tight'>مزودو البحث والحجز وشبكات GDS</h1>
          <p className='text-sm text-muted-foreground mt-1 leading-relaxed'>
            طيران، فنادق، سيارات، وترانسفير — اتصال مباشر بواجهات API وموزعي الجملة العالميين مع حماية الهامش الربحي.
          </p>
        </div>
      </div>

      {/* Providers Telemetry KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">شبكات التوزيع العالمية</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">8 مزودين</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">موزعو الجملة و GDS</p>
          <p className="text-[11px] text-muted-foreground">Paximum · Hotelbeds · Amadeus</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">الفنادق المتزامنة</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">ربط مباشر</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">5,954</p>
          <p className="text-[11px] text-muted-foreground">فندق نشط في الكتالوج الموحد</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">مسارات الطيران</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">نشطة</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">24 مسار</p>
          <p className="text-[11px] text-muted-foreground">خطوط تركية وخليجية مباشرة</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">الأسطول والترانسفير</span>
            <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">أسطول VIP</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">31 مسار ومركبة</p>
          <p className="text-[11px] text-muted-foreground">تغطية مطار إسطنبول وصبيحة</p>
        </div>
      </div>

      <ProvidersHub />
    </div>
  );
}
