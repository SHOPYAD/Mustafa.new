"use client";

import { useState } from "react";
import { Plane } from "lucide-react";
import AirlinesDatabasePanel from "@/components/admin/AirlinesDatabasePanel";
import AirportsDatabasePanel from "@/components/admin/AirportsDatabasePanel";
import FlightExtrasPanel from "@/components/admin/FlightExtrasPanel";
import FlightsProviderPanel from "@/components/admin/FlightsProviderPanel";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FlightsDesk = "connectors" | "inventory";

export default function AdminFlightsPage() {
  const [desk, setDesk] = useState<FlightsDesk>("connectors");

  return (
    <AdminPage className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        breadcrumb={
          <span>
            لوحة التحكم <span className="mx-1 opacity-50">/</span> الطيران
          </span>
        }
        icon={<Plane className="size-5" />}
        title="تذاكر الطيران وموزعو GDS"
        description="مفاتيح الربط، صحة الحصص، المارك أب، ثم المطارات والخطوط والإضافات — نفس الحقول والواجهات البرمجية."
      />

      <Tabs
        value={desk}
        onValueChange={(value) => setDesk(value as FlightsDesk)}
        className="flex flex-col gap-4"
      >
        <TabsList className="h-8 w-fit shrink-0 self-start">
          <TabsTrigger value="connectors">الموصلات والمارك أب</TabsTrigger>
          <TabsTrigger value="inventory">المخزون التشغيلي</TabsTrigger>
        </TabsList>
        <TabsContent value="connectors">
          <FlightsProviderPanel />
        </TabsContent>
        <TabsContent value="inventory" className="flex flex-col gap-5">
          <FlightExtrasPanel />
          <AirportsDatabasePanel />
          <AirlinesDatabasePanel />
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
