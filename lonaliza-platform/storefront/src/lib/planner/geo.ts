import type { PlannerLeg, PlannerStop, PlannerTransportMode } from "@/types/planner";

export function uid(prefix = "p"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function estimateMinutes(km: number, mode: PlannerTransportMode): number {
  if (mode === "walk") return Math.max(1, Math.round((km / 4.5) * 60));
  if (mode === "transit") return Math.max(2, Math.round((km / 18) * 60) + 4);
  if (mode === "drive") return Math.max(2, Math.round((km / 28) * 60) + 3);
  return Math.max(1, Math.round((km / 40) * 60));
}

export function validLatLng(lat?: number, lng?: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat as number) <= 90 &&
    Math.abs(lng as number) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export function buildLegs(stops: PlannerStop[], mode: PlannerTransportMode): PlannerLeg[] {
  const ordered = [...stops].filter((s) => validLatLng(s.lat, s.lng)).sort((a, b) => a.order - b.order);
  const legs: PlannerLeg[] = [];
  for (let i = 0; i < ordered.length - 1; i += 1) {
    const from = ordered[i];
    const to = ordered[i + 1];
    const km = Number(haversineKm(from, to).toFixed(2));
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;
    legs.push({
      fromId: from.id,
      toId: to.id,
      mode,
      km,
      minutes: estimateMinutes(km, mode),
      polyline: [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      midpoint: validLatLng(midLat, midLng) ? [midLat, midLng] : undefined,
      estimated: mode === "transit" || mode === "line",
    });
  }
  return legs;
}

export function optimizeStops(stops: PlannerStop[]): PlannerStop[] {
  if (stops.length < 3) return stops.map((s, i) => ({ ...s, order: i + 1 }));
  const hotel = stops.find((s) => s.kind === "hotel");
  const pool = stops.filter((s) => s.kind !== "hotel");
  const used = new Set<string>();
  const path: PlannerStop[] = [];
  let current = pool[0];
  path.push(current);
  used.add(current.id);
  while (path.length < pool.length) {
    let best: PlannerStop | null = null;
    let bestKm = Infinity;
    for (const cand of pool) {
      if (used.has(cand.id)) continue;
      const km = haversineKm(current, cand);
      if (km < bestKm) {
        bestKm = km;
        best = cand;
      }
    }
    if (!best) break;
    path.push(best);
    used.add(best.id);
    current = best;
  }
  if (hotel) path.push(hotel);
  return path.map((s, i) => ({ ...s, order: i + 1 }));
}

export type CatalogCity =
  | "istanbul"
  | "antalya"
  | "trabzon"
  | "cappadocia"
  | "riyadh"
  | "barcelona"
  | "athens"
  | "fez"
  | "cairo"
  | "dubai";

export function destKey(raw: string): CatalogCity | null {
  const t = String(raw || "").toLowerCase();
  if (/athens|أثينا|اثينا|ath\b/.test(t)) return "athens";
  if (/fez|fes|فاس/.test(t)) return "fez";
  if (/cairo|القاهرة|قاهرة|giza/.test(t)) return "cairo";
  if (/dubai|دبي/.test(t)) return "dubai";
  if (/barcelona|برشلونة|برشلونه|bcn\b/.test(t)) return "barcelona";
  if (/antalya|أنطاليا|belek|kemer/.test(t)) return "antalya";
  if (/trabzon|طرابزون|rize|ayder|آيدر/.test(t)) return "trabzon";
  if (/cappadocia|كابادوكيا|göreme|goreme|nevsehir|nevşehir|urgup|ürgüp/.test(t)) return "cappadocia";
  if (/riyadh|الرياض/.test(t)) return "riyadh";
  if (/istanbul|إسطنبول|اسطنبول|sultanahmet|fatih/.test(t)) return "istanbul";
  return null;
}
