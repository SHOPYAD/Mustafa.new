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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Receipt className="text-amber-400" size={22} />
              <span>إدارة الفواتير والفوترة الإلكترونية الرسمية</span>
            </h1>
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
              T.C. GİB e-Arşiv
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            الربط المحاسبي الكامل بـ Paraşüt API v4 وتخصيص قوالب وتصميم فواتير المنصة الفاخرة لجميع الخدمات.
          </p>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab("parasut")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "parasut"
                ? "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Building2 size={14} />
            <span>الفاتورة الإلكترونية والمحاسبة (Paraşüt v4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "templates"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Palette size={14} />
            <span>قوالب وتصميم فواتير المنصة</span>
          </button>
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
