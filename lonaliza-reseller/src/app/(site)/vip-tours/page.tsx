"use client";

import { Suspense } from "react";
import VipToursContent from "@/components/transfers/VipToursContent";

export default function VipToursPage() {
  return (
    <Suspense
      fallback={
        <section className="pt-28 pb-20 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-slate-200 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      }
    >
      <VipToursContent />
    </Suspense>
  );
}
