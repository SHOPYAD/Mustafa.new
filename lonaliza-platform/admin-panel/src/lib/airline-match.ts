const GROUPS: Array<{ keys: string[]; hint: string }> = [
  { keys: ["ناس", "فلاي ناس", "flynas", "nas air", "nas", "xy"], hint: "flynas" },
  { keys: ["النيل", "نبيل", "nile air", "nile", "np"], hint: "nile" },
  { keys: ["السعودية", "سعود", "saudia", "saudi arabian", "sv"], hint: "saudia" },
  { keys: ["التركية", "تركيا", "turkish", "thy", "tk"], hint: "turkish" },
  { keys: ["القطرية", "qatar", "qr"], hint: "qatar" },
  { keys: ["الإمارات", "emirates", "ek"], hint: "emirates" },
  { keys: ["الاتحاد", "etihad", "ey"], hint: "etihad" },
  { keys: ["بيغاسوس", "بيغاسس", "pegasus", "pc"], hint: "pegasus" },
  { keys: ["أجنحة الشام", "aj", "cham"], hint: "cham" },
  { keys: ["مصر", "egyptair", "ms"], hint: "egypt" },
  { keys: ["فلاي دبي", "flydubai", "fz"], hint: "flydubai" },
];

function norm(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function airlineMatches(requested: string, actualName: string, actualCode = ""): boolean {
  const req = norm(requested);
  const name = norm(actualName);
  const code = norm(actualCode);
  if (!req || !name) return false;
  if (name === req || name.includes(req) || req.includes(name)) return true;
  if (code && (code === req || req === code)) return true;
  return GROUPS.some((group) => {
    const want = group.keys.some((key) => req.includes(norm(key)) || norm(key).includes(req));
    const got = group.keys.some((key) => name.includes(norm(key))) || name.includes(group.hint);
    return want && got;
  });
}

export function resolveAirlineNames(requested: string[], inventory: Array<{ name: string; code?: string }>): string[] {
  const hits = new Set<string>();
  for (const req of requested) {
    for (const row of inventory) {
      if (airlineMatches(req, row.name, row.code)) hits.add(row.name);
    }
  }
  return [...hits];
}

const EXTRACT_SKIP = new Set(["تركيا", "مصر", "سعود"]);

export function extractAirlineHints(text: string): string[] {
  const hay = norm(text);
  if (!hay) return [];
  const hits: string[] = [];
  for (const group of GROUPS) {
    const matched = group.keys.some((key) => {
      if (EXTRACT_SKIP.has(key)) return false;
      const k = norm(key);
      return k.length >= 3 && hay.includes(k);
    });
    if (matched) hits.push(group.keys[0]);
  }
  return hits;
}

export function itineraryAirline(item: {
  legs?: Array<{
    carriers?: Array<{ name?: string; code?: string }>;
    segments?: Array<{ marketingCarrier?: { name?: string; code?: string } }>;
  }>;
}): { name: string; code: string } {
  const carrier = item.legs?.[0]?.carriers?.[0] || item.legs?.[0]?.segments?.[0]?.marketingCarrier;
  return { name: carrier?.name || "", code: carrier?.code || "" };
}
