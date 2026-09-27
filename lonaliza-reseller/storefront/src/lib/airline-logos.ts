export const AIRLINE_LOGO_CDN = "https://images.kiwi.com/airlines/64";

/** Sky Scrapper sometimes returns non-IATA marketing codes. */
export const AIRLINE_CODE_ALIASES: Record<string, string> = {
  H9: "PC",
  "^5": "F3",
  FAD: "F3",
  PGT: "PC",
  KNE: "XY",
};

export function resolveAirlineCode(code?: string | null): string {
  const raw = String(code || "").trim().toUpperCase();
  if (!raw) return "";
  return AIRLINE_CODE_ALIASES[raw] || raw;
}

export function kiwiAirlineLogoUrl(code?: string | null): string {
  const iata = resolveAirlineCode(code);
  if (!/^[A-Z0-9]{2,3}$/.test(iata)) return "";
  return `${AIRLINE_LOGO_CDN}/${iata}.png`;
}

export function airlineInitials(name?: string | null, code?: string | null): string {
  const resolved = resolveAirlineCode(code);
  if (/^[A-Z0-9]{2,3}$/.test(resolved)) return resolved.slice(0, 2);
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "✈";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}
