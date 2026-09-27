import { NextRequest, NextResponse } from "next/server";
import { listActiveInternalCars } from "@/lib/server/cars-store";
import { matchesInternalCar, sortFleet } from "@/lib/cars/matching";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const channels = await getChannelServices();
  if (!appEnabledKeys(channels).includes("cars")) {
    return NextResponse.json({ ok: true, cars: [], empty: true });
  }
  const q = req.nextUrl.searchParams;
  const query = {
    pickup: q.get("pickup") || q.get("from") || undefined,
    dropoff: q.get("dropoff") || q.get("to") || undefined,
    date: q.get("date") || undefined,
    returnDate: q.get("returnDate") || undefined,
    guests: q.get("guests") || undefined,
    category: q.get("category") || undefined,
  };
  const cars = sortFleet(
    (await listActiveInternalCars()).filter((car) => matchesInternalCar(car, query))
  );
  return NextResponse.json({ ok: true, cars, query });
}
