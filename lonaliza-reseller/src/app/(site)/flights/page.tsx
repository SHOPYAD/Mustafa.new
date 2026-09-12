"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import InternalFlightsContent from "@/components/flights/InternalFlightsContent";
import TravelpayoutsFlights from "@/components/flights/TravelpayoutsFlights";
import { useFlightsConfig } from "@/hooks/useFlightsConfig";

function FlightsPageContent() {
  const { config, loading } = useFlightsConfig();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#051741] pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (config.provider === "travelpayouts") {
    return <TravelpayoutsFlights config={config.travelpayouts} />;
  }

  return <InternalFlightsContent />;
}

export default function FlightsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-[#051741] pt-24">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <FlightsPageContent />
    </Suspense>
  );
}
