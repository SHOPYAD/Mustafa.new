"use client";

import { useState } from "react";
import { Plane, Layers, Database, ShieldAlert, Cpu } from "lucide-react";
import AirlinesDatabasePanel from "@/components/admin/AirlinesDatabasePanel";
import AirportsDatabasePanel from "@/components/admin/AirportsDatabasePanel";
import FlightExtrasPanel from "@/components/admin/FlightExtrasPanel";
import FlightsProviderPanel from "@/components/admin/FlightsProviderPanel";
import { EnterprisePageHeader } from "@/components/admin/enterprise";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FlightsDesk = "connectors" | "inventory";

export default function AdminFlightsPage() {
  const [desk, setDesk] = useState<FlightsDesk>("connectors");

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "محركات السفر", href: "/admin/flights" },
          { label: "حجوزات وتوريد الطيران" },
        ]}
        icon={<Plane className="h-6 w-6 text-primary" />}
        title="تذاكر الطيران وموزعو أنظمة GDS"
        subtitle="إدارة مفاتيح الربط ومزودي الطيران (PKFare, Seeru, Amadeus)، مراقبة صحة الحصص، قواعد المارك أب، والمخزون التشغيلي للمطارات والخطوط الجوية."
      />

      <Tabs
        value={desk}
        onValueChange={(value) => setDesk(value as FlightsDesk)}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <TabsList className="h-11 rounded-2xl bg-card/60 p-1 border border-border/50 backdrop-blur-xl">
            <TabsTrigger
              value="connectors"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md gap-2"
            >
              <Cpu size={15} />
              <span>الموصلات ومحركات الأسعار والمارك أب</span>
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md gap-2"
            >
              <Database size={15} />
              <span>المخزون التشغيلي والمطارات والخطوط</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="connectors" className="mt-0 focus-visible:outline-none">
          <FlightsProviderPanel />
        </TabsContent>
        <TabsContent value="inventory" className="mt-0 focus-visible:outline-none flex flex-col gap-5">
          <FlightExtrasPanel />
          <AirportsDatabasePanel />
          <AirlinesDatabasePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
