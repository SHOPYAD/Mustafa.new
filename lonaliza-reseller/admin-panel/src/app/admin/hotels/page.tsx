"use client";

import { useState } from "react";
import { Hotel, ShieldCheck, Layers, Building2 } from "lucide-react";
import Link from "next/link";
import HotelsProviderPanel from "@/components/admin/HotelsProviderPanel";
import HotelsCatalogPage from "@/app/admin/hotels/catalog/page";
import type { HotelProvider } from "@/lib/hotels-config";
import { EnterprisePageHeader } from "@/components/admin/enterprise/EnterprisePageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HotelsDesk = "catalog" | "connectors";

export default function AdminHotelsPage() {
  const [desk, setDesk] = useState<HotelsDesk>("catalog");
  const [, setCatalogProvider] = useState<HotelProvider>("booking");

  return (
    <div className="flex flex-col gap-6" dir="rtl" data-hotels-desk="">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "محركات السفر", href: "/admin/hotels" },
          { label: "إدارة وتوريد الفنادق" },
        ]}
        icon={<Hotel className="h-6 w-6 text-primary" />}
        title="مزودو الفنادق والكتالوج الموحد"
        subtitle="الموصلات العالمية، حصص التوريد، هوامش الربح (Markup)، وقاعدة بيانات الكتالوج الداخلي مع المزامنة اللحظية."
        actions={
          <Button
            variant="outline"
            className="rounded-xl border-border/60 bg-card/60 backdrop-blur-md hover:bg-card hover:border-primary/40 font-semibold gap-2 shadow-xs"
            asChild
          >
            <Link href="/admin/hotels/supply">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>مراقبة صحة الموردين</span>
            </Link>
          </Button>
        }
      />

      <Tabs
        value={desk}
        onValueChange={(value) => setDesk(value as HotelsDesk)}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <TabsList className="h-11 rounded-2xl bg-card/60 p-1 border border-border/50 backdrop-blur-xl">
            <TabsTrigger
              value="connectors"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md gap-2"
            >
              <Layers size={15} />
              <span>الموصلات والحصص والمارك أب</span>
            </TabsTrigger>
            <TabsTrigger
              value="catalog"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md gap-2"
            >
              <Building2 size={15} />
              <span>الكتالوج الداخلي للفنادق</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="connectors" className="mt-0 focus-visible:outline-none">
          <HotelsProviderPanel onProviderChange={setCatalogProvider} />
        </TabsContent>
        <TabsContent value="catalog" className="mt-0 focus-visible:outline-none">
          <HotelsCatalogPage embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
