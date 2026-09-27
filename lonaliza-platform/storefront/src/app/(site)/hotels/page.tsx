"use client";

import TravelAdvisorHotels from "@/components/hotels/TravelAdvisorHotels";
import InternalHotelsContent from "@/components/hotels/InternalHotelsContent";
import { useHotelsConfig } from "@/hooks/useHotelsConfig";

export default function HotelsPage() {
  const { config, loading } = useHotelsConfig();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#051741] pt-24">
        <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (config.provider === "internal") {
    return <InternalHotelsContent />;
  }

  return <TravelAdvisorHotels />;
}
