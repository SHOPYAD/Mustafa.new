"use client";

import { useState } from "react";
import PersonalFinancesPage from "@/app/admin/dashboard/finance/page";
import LegacyFinanceV1Page from "@/app/admin/dashboard/(legacy)/finance-v1/page";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, CreditCard } from "lucide-react";

export default function FinanceRoute() {
  const [activeTab, setActiveTab] = useState<"personal" | "v1">("personal");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <Banknote className="size-5 text-primary" />
          <h2 className="text-sm font-semibold text-muted-foreground">لوحة التحليلات المالية</h2>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "personal" | "v1")}>
          <TabsList className="h-9">
            <TabsTrigger value="personal" className="gap-1.5 text-xs font-medium">
              <Banknote className="size-3.5" />
              <span>Personal Finances</span>
            </TabsTrigger>
            <TabsTrigger value="v1" className="gap-1.5 text-xs font-medium">
              <CreditCard className="size-3.5" />
              <span>Finance V1 (Cash Flow & Card)</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "personal" ? <PersonalFinancesPage /> : <LegacyFinanceV1Page />}
    </div>
  );
}
