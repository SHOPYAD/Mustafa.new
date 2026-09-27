import { searchAirports } from "@/components/flights/api";
import type { AirportPick } from "@/components/flights/types";
import type { Locale } from "@/lib/i18n/types";

export async function resolveNamedAirport(value: string, locale: Locale): Promise<AirportPick | null> {
  const text = value.trim();
  if (!text) return null;
  if (text.includes("|")) {
    const [skyId, entityId] = text.split("|");
    if (skyId && entityId) {
      return { skyId, entityId, iata: skyId.slice(0, 4), name: skyId, city: skyId, country: "", kind: "airport" };
    }
  }
  try {
    const hits = await searchAirports(text, locale);
    return hits[0] || null;
  } catch {
    return null;
  }
}
