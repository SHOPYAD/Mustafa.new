import type { PlannerLeg, PlannerTransportMode, PlannerTrip } from "@/types/planner";
import { calculateOsrmRoute } from "./osrm";

export async function enrichTripDirections(trip: PlannerTrip): Promise<PlannerTrip> {
  const days = await Promise.all(
    trip.days.map(async (day) => {
      if (day.stops.length < 2) return { ...day, legs: [] };
      const routed = await calculateOsrmRoute(day.stops, trip.defaultMode);
      const legs: PlannerLeg[] = (routed?.legs || []).map((leg, i) => ({
        fromId: day.stops[i].id,
        toId: day.stops[i + 1].id,
        mode: trip.defaultMode,
        km: leg.km,
        minutes: leg.minutes,
        polyline: leg.polyline,
        midpoint: leg.midpoint,
      }));
      return { ...day, legs };
    })
  );
  return { ...trip, days };
}

export async function routeDayStops(
  stops: PlannerTrip["days"][number]["stops"],
  mode: PlannerTransportMode
): Promise<PlannerLeg[]> {
  if (stops.length < 2) return [];
  const routed = await calculateOsrmRoute(stops, mode);
  return (routed?.legs || []).map((leg, i) => ({
    fromId: stops[i].id,
    toId: stops[i + 1].id,
    mode,
    km: leg.km,
    minutes: leg.minutes,
    polyline: leg.polyline,
    midpoint: leg.midpoint,
  }));
}
