import { KNOWN_CITY_AIRPORTS } from "@/lib/server/airports-db";

function cleanIata(code?: string | null): string {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/^LOC-[AC]-/i, "");
}

/** Sky city ids → IATA city codes PKFare buyer uses (PAR, IST, LON). */
const PKFARE_CITY_IATA: Record<string, string> = {
  PARI: "PAR",
  PAR: "PAR",
  ISTA: "IST",
  IST: "IST",
  LOND: "LON",
  LON: "LON",
  NYCA: "NYC",
  NYC: "NYC",
  MILA: "MIL",
  MIL: "MIL",
  TYOA: "TYO",
  TYO: "TYO",
  MOSC: "MOW",
  MOW: "MOW",
  ROME: "ROM",
  ROM: "ROM",
  CASA: "CAS",
  CMN: "CAS",
  CAS: "CAS",
  DUBA: "DXB",
  DXB: "DXB",
  DWC: "DXB",
};

export function toPkfareCityIata(code?: string | null): string {
  const clean = cleanIata(code);
  if (!clean) return "";
  if (PKFARE_CITY_IATA[clean]) return PKFARE_CITY_IATA[clean];
  const airports = KNOWN_CITY_AIRPORTS[clean];
  if (airports && airports.length > 1 && /^[A-Z]{3}$/.test(clean) && airports[0] !== clean) {
    return clean;
  }
  return "";
}

/**
 * PKFare airport-pair shopping accepts 3-letter airport IATA codes.
 * City skyIds (ISTA, LOND, NYCA, PARI) must not be sent as-is on airport pairs.
 */
export function toPkfareAirportIata(code?: string | null): string {
  const clean = cleanIata(code);
  if (!clean) return "";
  const mapped = KNOWN_CITY_AIRPORTS[clean];
  if (mapped?.[0]) return mapped[0];
  if (/^[A-Z]{3}$/.test(clean)) return clean;
  if (clean.length >= 3) return clean.slice(0, 3);
  return clean;
}
