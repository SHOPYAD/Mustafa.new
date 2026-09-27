import type { TravelAdvisorHotelCard } from "@/types/travel-advisor";

export type HotelRibbonKind =
  | "bestArea"
  | "hurry"
  | "nearCenter"
  | "breakfast"
  | "freeCancel";

export type HotelRibbon = {
  kind: HotelRibbonKind;
  tone: "navy" | "gold" | "teal" | "emerald";
};

function distanceKm(text: string): number | null {
  const m = String(text || "").match(/(\d+(?:[.,]\d+)?)\s*(?:كلم|كم|km|متر|m\b)/i);
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (/متر|(?<![a-z])m\b/i.test(m[0]) && n > 20) return n / 1000;
  return n;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function candidates(hotel: TravelAdvisorHotelCard): HotelRibbonKind[] {
  const out: HotelRibbonKind[] = [];
  const km = distanceKm(hotel.distanceText || hotel.locationText || "");
  if (hotel.reviewCount >= 180 && hotel.rating >= 8.4) out.push("bestArea");
  if (hotel.hurryLeft > 0 && hotel.hurryLeft <= 8) out.push("hurry");
  if (km != null && km <= 2) out.push("nearCenter");
  if (hotel.breakfastIncluded) out.push("breakfast");
  if (/free cancellation|إلغاء مجاني|ücretsiz iptal/i.test(hotel.cancellation || "")) {
    out.push("freeCancel");
  }
  return out;
}

const TONE: Record<HotelRibbonKind, HotelRibbon["tone"]> = {
  bestArea: "navy",
  hurry: "gold",
  nearCenter: "teal",
  breakfast: "emerald",
  freeCancel: "teal",
};

/** Pick one honest ribbon; rotate so neighbors rarely share the same sentence. */
export function pickHotelRibbon(
  hotel: TravelAdvisorHotelCard,
  neighborKinds: HotelRibbonKind[] = []
): HotelRibbon | null {
  const options = candidates(hotel);
  if (!options.length) return null;
  const unused = options.filter((kind) => !neighborKinds.includes(kind));
  const pool = unused.length ? unused : options;
  const kind = pool[hashId(hotel.id) % pool.length];
  return { kind, tone: TONE[kind] };
}

export function ribbonClass(tone: HotelRibbon["tone"]): string {
  switch (tone) {
    case "navy":
      return "from-[#051741] to-[#0a3a5c] text-amber-100";
    case "gold":
      return "from-amber-600 to-amber-500 text-[#1a1204]";
    case "teal":
      return "from-[#0b3d2e] to-[#126b54] text-emerald-50";
    case "emerald":
      return "from-emerald-700 to-emerald-600 text-emerald-50";
    default: {
      const _never: never = tone;
      return _never;
    }
  }
}
