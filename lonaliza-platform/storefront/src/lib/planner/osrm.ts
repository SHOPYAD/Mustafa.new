import { estimateMinutes, haversineKm } from "./geo";
import type { PlannerTransportMode } from "@/types/planner";

export type OsrmLeg = {
  minutes: number;
  km: number;
  midpoint: [number, number];
  polyline: [number, number][];
  estimated?: boolean;
};

export type OsrmRoute = {
  geojson: { type: "LineString"; coordinates: [number, number][] };
  legs: OsrmLeg[];
};

function profileOf(mode: PlannerTransportMode): "car" | "foot" {
  return mode === "drive" ? "car" : "foot";
}

function midpointOf(poly: [number, number][], a: { lat: number; lng: number }, b: { lat: number; lng: number }): [number, number] {
  if (poly.length >= 2) {
    const mid = poly[Math.floor(poly.length / 2)];
    return [mid[0], mid[1]];
  }
  return [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2];
}

function fallbackLeg(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  mode: PlannerTransportMode
): OsrmLeg {
  const km = Number(haversineKm(from, to).toFixed(2));
  return {
    km,
    minutes: estimateMinutes(km, mode),
    midpoint: midpointOf([], from, to),
    polyline: [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ],
    estimated: mode === "transit" || mode === "line",
  };
}

export async function calculateOsrmRoute(
  points: Array<{ lat: number; lng: number }>,
  mode: PlannerTransportMode = "drive"
): Promise<OsrmRoute | null> {
  if (points.length < 2) return null;
  if (mode === "line" || mode === "transit") {
    const legs = points.slice(0, -1).map((from, i) => fallbackLeg(from, points[i + 1], mode));
    return {
      geojson: {
        type: "LineString",
        coordinates: points.map((p) => [p.lng, p.lat] as [number, number]),
      },
      legs,
    };
  }

  const profile = profileOf(mode);
  const path = points.map((p) => `${p.lng},${p.lat}`).join(";");
  try {
    const url = `https://router.project-osrm.org/route/v1/${profile}/${path}?overview=full&geometries=geojson`;
    const res = await fetch(url, { next: { revalidate: 180 } });
    const json = (await res.json()) as {
      routes?: Array<{
        geometry?: { coordinates?: number[][] };
        legs?: Array<{ distance: number; duration: number }>;
      }>;
    };
    const route = json.routes?.[0];
    if (!route) return null;
    const full = (route.geometry?.coordinates || []).map((c) => [c[1], c[0]] as [number, number]);
    const legs = (route.legs || []).map((leg, i) => {
      const from = points[i];
      const to = points[i + 1] || points[i];
      const slice = full.length
        ? full.slice(
            Math.floor((full.length * i) / Math.max(1, route.legs?.length || 1)),
            Math.floor((full.length * (i + 1)) / Math.max(1, route.legs?.length || 1)) + 1
          )
        : [];
      return {
        km: Number((leg.distance / 1000).toFixed(2)),
        minutes: Math.max(1, Math.round(leg.duration / 60)),
        midpoint: midpointOf(slice, from, to),
        polyline: slice.length > 1 ? slice : fallbackLeg(from, to, mode).polyline,
      };
    });
    return {
      geojson: {
        type: "LineString",
        coordinates: (route.geometry?.coordinates || []) as [number, number][],
      },
      legs,
    };
  } catch {
    return {
      geojson: { type: "LineString", coordinates: points.map((p) => [p.lng, p.lat] as [number, number]) },
      legs: points.slice(0, -1).map((from, i) => fallbackLeg(from, points[i + 1], mode)),
    };
  }
}

export async function optimizeOsrmTrip(
  points: Array<{ lat: number; lng: number }>,
  opts?: { roundtrip?: boolean }
): Promise<{ optimizedIndices: number[]; route: OsrmRoute } | null> {
  if (points.length < 3) {
    const route = await calculateOsrmRoute(points, "drive");
    return route ? { optimizedIndices: points.map((_, i) => i), route } : null;
  }
  const path = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const roundtrip = opts?.roundtrip !== false;
  try {
    const url = `https://router.project-osrm.org/trip/v1/driving/${path}?source=first&destination=${
      roundtrip ? "any" : "last"
    }&roundtrip=${roundtrip}&overview=full&geometries=geojson`;
    const res = await fetch(url, { next: { revalidate: 120 } });
    const json = (await res.json()) as {
      waypoints?: Array<{ waypoint_index?: number }>;
      trips?: Array<{
        geometry?: { coordinates?: number[][] };
        legs?: Array<{ distance: number; duration: number }>;
      }>;
    };
    const order = (json.waypoints || [])
      .map((w, i) => ({ i, idx: Number(w.waypoint_index ?? i) }))
      .sort((a, b) => a.idx - b.idx)
      .map((w) => w.i);
    const optimized = order.length === points.length ? order : points.map((_, i) => i);
    const ordered = optimized.map((i) => points[i]);
    const route = await calculateOsrmRoute(ordered, "drive");
    if (!route) return null;
    return { optimizedIndices: optimized, route };
  } catch {
    const route = await calculateOsrmRoute(points, "drive");
    return route ? { optimizedIndices: points.map((_, i) => i), route } : null;
  }
}
