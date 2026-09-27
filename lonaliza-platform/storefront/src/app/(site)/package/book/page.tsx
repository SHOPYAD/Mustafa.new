import { Suspense } from "react";
import type { Metadata } from "next";
import { PackageBookingCheckout } from "@/components/packages/PackageBookingCheckout";

export const metadata: Metadata = {
  title: "حجز مباشر للبرامج السياحية | لوناليزا للسياحة والسفر",
  description:
    "احجز برنامجك السياحي المتكامل في تركيا مباشرة مع تأكيد فوري، سيارة خاصة VIP، ودعم مستشار الحجز الذكي طوال الرحلة.",
};

interface Props {
  searchParams: Promise<{
    slug?: string;
    customTrip?: string;
    tripId?: string;
    dest?: string;
    title?: string;
    days?: string;
    total?: string;
    price?: string;
    date?: string;
    people?: string;
  }>;
}

export default async function PackageBookPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 pt-28 pb-20">
          <div className="mx-auto max-w-5xl px-4">
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      }
    >
      <PackageBookingCheckout
        initialSlug={params.slug}
        customTrip={params.customTrip === "1" || Boolean(params.dest)}
        tripId={params.tripId}
        customDest={params.dest}
        customTitle={params.title}
        customDays={params.days ? Number(params.days) : undefined}
        customTotal={params.total ? Number(params.total) : params.price ? Number(params.price) : undefined}
        customDate={params.date}
        customPeople={params.people ? Number(params.people) : undefined}
      />
    </Suspense>
  );
}
