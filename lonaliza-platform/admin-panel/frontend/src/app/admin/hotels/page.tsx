"use client";

import { useState } from "react";
import { Hotel, ShieldCheck } from "lucide-react";
import Link from "next/link";
import HotelsProviderPanel from "@/components/admin/HotelsProviderPanel";
import HotelsCatalogPage from "@/app/admin/hotels/catalog/page";
import type { HotelProvider } from "@/lib/hotels-config";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HotelsDesk = "connectors" | "catalog";

export default function AdminHotelsPage() {
  const [desk, setDesk] = useState<HotelsDesk>("connectors");
  const [, setCatalogProvider] = useState<HotelProvider>("booking");

  return (
    <AdminPage className="flex flex-col gap-6" dir="rtl" data-hotels-desk="">
      <AdminPageHeader
        breadcrumb={
          <span>
            لوحة التحكم <span className="mx-1 opacity-50">/</span> الفنادق
          </span>
        }
        icon={<Hotel className="size-5" />}
        title="مزودو الفنادق والكتالوج"
        description="الموصلات الخارجية، الحصص، المارك أب، ثم الكتالوج الداخلي — دون تغيير منطق الربط."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/hotels/supply">
              <ShieldCheck className="size-4" />
              صحة الموردين
            </Link>
          </Button>
        }
      />

      <Tabs
        value={desk}
        onValueChange={(value) => setDesk(value as HotelsDesk)}
        className="flex flex-col gap-4"
      >
        <TabsList className="h-8 w-fit shrink-0 self-start">
          <TabsTrigger value="connectors">الموصلات والحصص</TabsTrigger>
          <TabsTrigger value="catalog">الكتالوج الداخلي</TabsTrigger>
        </TabsList>
        <TabsContent value="connectors">
          <HotelsProviderPanel onProviderChange={setCatalogProvider} />
        </TabsContent>
        <TabsContent value="catalog">
          <HotelsCatalogPage embedded />
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
