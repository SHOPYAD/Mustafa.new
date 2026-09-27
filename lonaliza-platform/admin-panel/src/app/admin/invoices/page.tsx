"use client";

import { useState } from "react";
import {
  Building2,
  FileCheck,
  FileText,
  Palette,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import InvoiceTemplatesPanel from "@/components/admin/InvoiceTemplatesPanel";
import ParasutConfigPanel from "@/components/admin/invoices/ParasutConfigPanel";
import ParasutInvoicesTable from "@/components/admin/invoices/ParasutInvoicesTable";

type TabKey = "parasut" | "templates";

export default function AdminInvoicesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("parasut");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleInvoiceIssued = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Tab Switcher */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5'>
        <div>
          <div className="flex items-center gap-2">
            <h1 className='text-xl font-black text-foreground flex items-center gap-2'>
              <Receipt className='text-secondary' size={22} />
              <span>إدارة الفواتير والفوترة الإلكترونية الرسمية</span>
            </h1>
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
              T.C. GİB e-Arşiv
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            الربط المحاسبي الكامل بـ Paraşüt API v4 وتخصيص قوالب وتصميم فواتير المنصة الفاخرة لجميع الخدمات.
          </p>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className='flex items-center rounded-2xl border border-border bg-card p-1 shadow-xs'>
          <button
            type="button"
            onClick={() => setActiveTab("parasut")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "parasut"
                ? "bg-primary text-white font-bold shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 size={14} className={activeTab === "parasut" ? "text-white stroke-white" : ""} />
            <span className={activeTab === "parasut" ? "text-white" : ""}>الفاتورة الإلكترونية والمحاسبة (Paraşüt v4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "templates"
                ? "bg-primary text-white font-bold shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Palette size={14} className={activeTab === "templates" ? "text-white stroke-white" : ""} />
            <span className={activeTab === "templates" ? "text-white" : ""}>قوالب وتصميم فواتير المنصة</span>
          </button>
        </div>
      </div>

      {/* Enterprise Telemetry KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">نظام الفوترة الإلكترونية</span>
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              GİB e-Arşiv v4
            </span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">Paraşüt API</p>
          <p className="text-[11px] text-muted-foreground">ربط محاسبي معتمد تركي</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">حالة الإصدار التلقائي</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">نشط</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">فوري بعد الدفع</p>
          <p className="text-[11px] text-muted-foreground">توليد PDF وإرسال إيميل</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">العملات المعتمدة</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">متعدد العملات</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">TRY · USD · SAR · EUR</p>
          <p className="text-[11px] text-muted-foreground">حساب ضريبة KDV تلقائياً</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">قوالب الفواتير</span>
            <span className="rounded-md bg-secondary/20 px-1.5 py-0.5 text-[10px] font-bold text-foreground">4 قوالب</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">VIP & Corporate</p>
          <p className="text-[11px] text-muted-foreground">عربي · English · Türkçe</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "parasut" ? (
        <div className="space-y-8">
          <ParasutConfigPanel onInvoiceIssued={handleInvoiceIssued} />
          <ParasutInvoicesTable refreshKey={refreshKey} />
        </div>
      ) : (
        <div>
          <InvoiceTemplatesPanel />
        </div>
      )}
    </div>
  );
}
