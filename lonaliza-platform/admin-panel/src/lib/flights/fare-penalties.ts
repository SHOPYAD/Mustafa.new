export type FareAttributeState = "included" | "chargeable" | "not_available" | "unknown";

export type FarePenalty = {
  type: "change" | "cancel" | "no_show";
  amount?: number;
  currency?: string;
  percent?: number;
  window?: string;
  text?: string;
};

function windowKey(window?: string): "before" | "after" | "other" {
  const raw = String(window || "").toLowerCase();
  if (!raw || raw.includes("before")) return "before";
  if (raw.includes("after")) return "after";
  return "other";
}

function isPaid(p: FarePenalty): boolean {
  return (p.amount != null && p.amount > 0) || (p.percent != null && p.percent > 0);
}

function isFree(p: FarePenalty): boolean {
  if (isPaid(p)) return false;
  return p.amount === 0 || p.percent === 0 || /^free$/i.test(String(p.text || "").trim());
}

function isForbidden(p: FarePenalty): boolean {
  if (isPaid(p) || isFree(p)) return false;
  return /non-|not permitted|not allowed|غير قابل|غير مسموح/i.test(String(p.text || ""));
}

function pickSameWindow(rows: FarePenalty[]): FarePenalty {
  const paid = rows.find(isPaid);
  if (paid) return paid;
  const forbidden = rows.find(isForbidden);
  if (forbidden) return forbidden;
  const free = rows.find(isFree);
  if (free) return free;
  return rows[0];
}

function summarizeType(rows: FarePenalty[]): FareAttributeState {
  const before = rows.filter((p) => windowKey(p.window) === "before");
  const use = before.length ? before : rows;
  if (!use.length) return "unknown";
  if (use.some(isPaid)) return "chargeable";
  if (use.some(isForbidden)) return "not_available";
  if (use.every(isFree)) return "included";
  return "unknown";
}

const TYPE_ORDER: Record<FarePenalty["type"], number> = { cancel: 0, change: 1, no_show: 2 };
const WINDOW_ORDER = { before: 0, other: 1, after: 2 };

/** One supplier row per action+window. Summary follows the before-departure rule only. */
export function collapseFarePenalties(penalties: FarePenalty[] | undefined): {
  penalties: FarePenalty[];
  refundable: FareAttributeState;
  changeable: FareAttributeState;
} {
  const list = penalties || [];
  const buckets = new Map<string, FarePenalty[]>();
  for (const p of list) {
    const key = `${p.type}|${windowKey(p.window)}`;
    const cur = buckets.get(key) || [];
    cur.push(p);
    buckets.set(key, cur);
  }
  const collapsed = Array.from(buckets.values())
    .map(pickSameWindow)
    .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || WINDOW_ORDER[windowKey(a.window)] - WINDOW_ORDER[windowKey(b.window)]);
  return {
    penalties: collapsed,
    refundable: summarizeType(collapsed.filter((p) => p.type === "cancel")),
    changeable: summarizeType(collapsed.filter((p) => p.type === "change")),
  };
}

export function canonicalPenalty(penalties: FarePenalty[] | undefined, type: FarePenalty["type"]): FarePenalty | undefined {
  const collapsed = collapseFarePenalties(penalties).penalties.filter((p) => p.type === type);
  return collapsed.find((p) => windowKey(p.window) === "before") || collapsed[0];
}

/**
 * Booking-time rows only. PKFare/GDS always also send after-departure
 * (usually forbidden). Showing that next to the before-departure fee looks
 * like free + paid + forbidden on the same brand.
 */
export function customerFacingPenalties(penalties: FarePenalty[] | undefined): {
  penalties: FarePenalty[];
  afterDeparture: FarePenalty[];
} {
  const collapsed = collapseFarePenalties(penalties).penalties;
  const afterDeparture = collapsed.filter((p) => windowKey(p.window) === "after");
  const booking = collapsed.filter((p) => windowKey(p.window) !== "after");
  const facing: FarePenalty[] = [];
  for (const type of ["cancel", "change", "no_show"] as const) {
    const rows = booking.filter((p) => p.type === type);
    if (!rows.length) continue;
    const before = rows.filter((p) => windowKey(p.window) === "before");
    facing.push(pickSameWindow(before.length ? before : rows));
  }
  if (!facing.length && afterDeparture.length) {
    return { penalties: afterDeparture, afterDeparture: [] };
  }
  return { penalties: facing, afterDeparture };
}
