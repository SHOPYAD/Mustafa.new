import type { AirportPick } from "@/components/flights/types";

export type AirportCityGroup = {
  city: string;
  cityPick: AirportPick | null;
  airports: AirportPick[];
};

export type AirportCountryGroup = {
  country: string;
  cities: AirportCityGroup[];
};

function cityKey(hit: AirportPick): string {
  return (hit.city || hit.name || hit.skyId).trim().toLowerCase();
}

export function groupAirports(hits: AirportPick[]): AirportCountryGroup[] {
  const countries = new Map<string, Map<string, AirportCityGroup>>();

  for (const hit of hits) {
    const country = hit.country.trim() || "—";
    const key = cityKey(hit);
    if (!countries.has(country)) countries.set(country, new Map());
    const cities = countries.get(country)!;
    if (!cities.has(key)) {
      cities.set(key, {
        city: hit.city || hit.name,
        cityPick: null,
        airports: [],
      });
    }
    const bucket = cities.get(key)!;
    if (hit.kind === "city") {
      bucket.cityPick = hit;
      if (!bucket.city) bucket.city = hit.name;
    } else {
      bucket.airports.push(hit);
    }
  }

  return Array.from(countries.entries()).map(([country, cities]) => ({
    country,
    cities: Array.from(cities.values()).filter((row) => row.cityPick || row.airports.length),
  }));
}
