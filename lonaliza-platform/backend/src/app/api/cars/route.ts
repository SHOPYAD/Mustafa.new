import { NextRequest, NextResponse } from "next/server";
import { listActiveInternalCars } from "@/lib/server/cars-store";
import {
  matchesInternalCar,
  sortFleet,
  type InternalCarsSearchQuery,
} from "@/lib/cars/matching";
import { TURKEY_LOCATIONS } from "@/lib/cars/turkey-locations";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query: InternalCarsSearchQuery = {
    pickup:
      searchParams.get("pickup") ||
      searchParams.get("from") ||
      searchParams.get("location") ||
      undefined,
    dropoff:
      searchParams.get("dropoff") || searchParams.get("to") || undefined,
    date: searchParams.get("date") || undefined,
    returnDate: searchParams.get("returnDate") || undefined,
    guests: searchParams.get("guests") || undefined,
    category: searchParams.get("category") || undefined,
  };

  const cars = sortFleet(
    (await listActiveInternalCars()).filter((car) =>
      matchesInternalCar(car, query)
    )
  );

  const includeLocations = searchParams.get("locations") === "1";

  return NextResponse.json({
    ok: true,
    cars,
    query,
    ...(includeLocations ? { locations: TURKEY_LOCATIONS } : {}),
  });
}
