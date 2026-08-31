"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import FlightBookingFunnel from "@/components/flights/FlightBookingFunnel";
import LiveFlightsGate from "@/components/flights/LiveFlightsGate";

function Fallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#f4f1ea] pt-24">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
    </div>
  );
}

export default function FlightBookingPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <LiveFlightsGate>
        <FlightBookingFunnel />
      </LiveFlightsGate>
    </Suspense>
  );
}
