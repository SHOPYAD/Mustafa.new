"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import InternalCarsContent from "@/components/cars/InternalCarsContent";
import TravelpayoutsCars from "@/components/cars/TravelpayoutsCars";
import { useCarsConfig } from "@/hooks/useCarsConfig";

function CarsPageContent() {
  const { config, loading } = useCarsConfig();

  if (loading) {
    return (
      <section className="pt-28 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </section>
    );
  }

  if (config.provider === "travelpayouts") {
    return <TravelpayoutsCars config={config.travelpayouts} />;
  }

  return <InternalCarsContent />;
}

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <section className="pt-28 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </section>
      }
    >
      <CarsPageContent />
    </Suspense>
  );
}
