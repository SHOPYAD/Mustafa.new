"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CustomPageView } from "@/components/pages/CustomPageView";

function CustomPageFallback() {
  return (
    <section className="pt-28 pb-20 min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </section>
  );
}

export default function PublicCustomPage() {
  const params = useParams<{ slug: string }>();
  return (
    <Suspense fallback={<CustomPageFallback />}>
      <CustomPageView slug={params.slug} />
    </Suspense>
  );
}
