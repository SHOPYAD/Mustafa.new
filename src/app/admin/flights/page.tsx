"use client";

import AirlinesDatabasePanel from "@/components/admin/AirlinesDatabasePanel";
import AirportsDatabasePanel from "@/components/admin/AirportsDatabasePanel";
import FlightExtrasPanel from "@/components/admin/FlightExtrasPanel";
import FlightsProviderPanel from "@/components/admin/FlightsProviderPanel";

export default function AdminFlightsPage() {
  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <FlightExtrasPanel />
      <AirportsDatabasePanel />
      <AirlinesDatabasePanel />
      <FlightsProviderPanel />
    </div>
  );
}
