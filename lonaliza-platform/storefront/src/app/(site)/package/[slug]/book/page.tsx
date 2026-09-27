import { Suspense } from "react";
import type { Metadata } from "next";
import { PackageBookingCheckout } from "@/components/packages/PackageBookingCheckout";

export const metadata: Metadata = {
  title: "حجز مباشر للبرنامج السياحي | لوناليزا للسياحة والسفر",
  description: "احجز برنامجك السياحي مباشرة مع تأكيد فوري وخطة تنقل VIP وسيارة خاصة.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PackageSlugBookPage({ params }: Props) {
  const { slug } = await params;

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
      <PackageBookingCheckout initialSlug={slug} />
    </Suspense>
  );
}
