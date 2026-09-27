"use client";

import { useState } from "react";
import {
  Building2,
  Palette,
  Receipt,
  FileCheck2,
} from "lucide-react";
import InvoiceTemplatesPanel from "@/components/admin/InvoiceTemplatesPanel";
import ParasutConfigPanel from "@/components/admin/invoices/ParasutConfigPanel";
import ParasutInvoicesTable from "@/components/admin/invoices/ParasutInvoicesTable";
import { EnterprisePageHeader } from "@/components/admin/enterprise";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabKey = "parasut" | "templates";

export default function AdminInvoicesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("parasut");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleInvoiceIssued = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "المالية والخزينة", href: "/admin/invoices" },
          { label: "الفواتير الإلكترونية والقوالب" },
        ]}
        icon={<Receipt className="h-6 w-6 text-primary" />}
        title="الفواتير الإلكترونية والتكامل المحاسبي"
        subtitle="الربط المحاسبي المباشر بنظام Paraşüt e-Fatura / e-Arşiv وتخصيص قوالب وتصميم فواتير المنصة."
      />

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TabKey)}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <TabsList className="h-11 rounded-2xl bg-card/60 p-1 border border-border/50 backdrop-blur-xl">
            <TabsTrigger
              value="parasut"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md gap-2"
            >
              <FileCheck2 size={15} />
              <span>الفاتورة الإلكترونية المعتمدة (Paraşüt API)</span>
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md gap-2"
            >
              <Palette size={15} />
              <span>قوالب وتصميم الفواتير</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="parasut" className="mt-0 focus-visible:outline-none space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card/70 p-6 backdrop-blur-xl shadow-xs">
            <ParasutConfigPanel onInvoiceIssued={handleInvoiceIssued} />
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/70 p-6 backdrop-blur-xl shadow-xs">
            <ParasutInvoicesTable refreshKey={refreshKey} />
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-0 focus-visible:outline-none">
          <div className="rounded-2xl border border-border/50 bg-card/70 p-6 backdrop-blur-xl shadow-xs">
            <InvoiceTemplatesPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
