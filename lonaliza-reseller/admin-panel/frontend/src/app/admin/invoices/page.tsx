"use client";

import { useState } from "react";
import {
  Building2,
  Palette,
  Receipt,
} from "lucide-react";
import InvoiceTemplatesPanel from "@/components/admin/InvoiceTemplatesPanel";
import ParasutConfigPanel from "@/components/admin/invoices/ParasutConfigPanel";
import ParasutInvoicesTable from "@/components/admin/invoices/ParasutInvoicesTable";
import { AdminModule, AdminPage, AdminPageHeader } from "@/components/admin/layout";

type TabKey = "parasut" | "templates";

export default function AdminInvoicesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("parasut");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleInvoiceIssued = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AdminPage className="space-y-6 pb-12">
      <AdminPageHeader
        icon={<Receipt className="size-5" />}
        title="إدارة الفواتير والفوترة الإلكترونية"
        description="الربط المحاسبي بـ Paraşüt API v4 وتخصيص قوالب فواتير المنصة."
        actions={
          <div className="admin-range">
            <button
              type="button"
              data-active={activeTab === "parasut"}
              onClick={() => setActiveTab("parasut")}
            >
              <Building2 size={14} className="inline me-1" />
              الفاتورة الإلكترونية (Paraşüt)
            </button>
            <button
              type="button"
              data-active={activeTab === "templates"}
              onClick={() => setActiveTab("templates")}
            >
              <Palette size={14} className="inline me-1" />
              قوالب الفواتير
            </button>
          </div>
        }
      />

      {/* Tab Content */}
      {activeTab === "parasut" ? (
        <div className="space-y-6">
          <AdminModule>
            <ParasutConfigPanel onInvoiceIssued={handleInvoiceIssued} />
          </AdminModule>
          <AdminModule>
            <ParasutInvoicesTable refreshKey={refreshKey} />
          </AdminModule>
        </div>
      ) : (
        <AdminModule>
          <InvoiceTemplatesPanel />
        </AdminModule>
      )}
    </AdminPage>
  );
}
