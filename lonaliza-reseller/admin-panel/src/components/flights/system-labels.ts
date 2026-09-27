function extractCountryMap(payload: unknown): Record<string, string> {
  const map: Record<string, string> = {};
  const visit = (value: unknown, depth: number) => {
    if (depth > 5 || value == null) return;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          const code = String(rec.code || rec.countryCode || rec.iso || rec.id || "").trim();
          const name = String(rec.name || rec.country || rec.title || rec.label || rec.localizedName || "").trim();
          if (code && name && code.length <= 3) map[code.toUpperCase()] = name;
        }
        visit(item, depth + 1);
      }
      return;
    }
    if (typeof value === "object") {
      const rec = value as Record<string, unknown>;
      for (const [key, child] of Object.entries(rec)) {
        if (/country|countries|market|locale/i.test(key)) visit(child, depth + 1);
      }
    }
  };
  visit(payload, 0);
  return map;
}

let countryMap: Record<string, string> | null = null;
let inflight: Promise<Record<string, string>> | null = null;

export async function loadFlightCountryLabels(): Promise<Record<string, string>> {
  if (countryMap) return countryMap;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/flights/config", { cache: "force-cache" });
      const json = (await res.json()) as { system?: { config?: unknown; locale?: unknown } };
      const fromConfig = extractCountryMap(json.system?.config);
      const fromLocale = extractCountryMap(json.system?.locale);
      countryMap = { ...fromLocale, ...fromConfig };
      return countryMap;
    } catch {
      countryMap = {};
      return countryMap;
    }
  })();
  return inflight;
}

export function displayCountry(name: string, labels: Record<string, string>): string {
  const raw = name.trim();
  if (!raw) return raw;
  return labels[raw.toUpperCase()] || labels[raw] || raw;
}

