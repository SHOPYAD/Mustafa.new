"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import InternalTransfersContent from "@/components/transfers/InternalTransfersContent";
import TravelpayoutsTransfers from "@/components/transfers/TravelpayoutsTransfers";
import { useTransfersConfig } from "@/hooks/useTransfersConfig";

function TransfersPageContent() {
  const { config, loading } = useTransfersConfig();

  if (loading) {
    return (
      <section className="pt-28 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </section>
    );
  }

  if (config.provider === "travelpayouts") {
    return <TravelpayoutsTransfers config={config.travelpayouts} />;
  }

  return <InternalTransfersContent />;
}

export default function TransfersPage() {
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
      <TransfersPageContent />
    </Suspense>
  );
}
