import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { TravelAdvisorHotelCard } from "@/types/travel-advisor";
import { scoreOutOf10 } from "@/lib/hotel-offer-copy";

const COLLECTION = "hotel_review_scores";

export type CachedReviewScore = {
  masterId?: string;
  nameKey: string;
  cityKey: string;
  bookingHotelId?: string;
  taHotelId?: string;
  score: number;
  scale: number;
  count?: number;
  source: string;
};

const memory = new Map<string, { at: number; value: CachedReviewScore }>();
const MEMORY_TTL_MS = 30 * 60 * 1000;

export function reviewNameKey(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function memoryKey(score: Pick<CachedReviewScore, "masterId" | "nameKey" | "cityKey">): string {
  return score.masterId || `${score.nameKey}|${score.cityKey}`;
}

async function ensureScoresCollection(): Promise<boolean> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return false;
  try {
    await pb.collections.getOne(COLLECTION);
    return true;
  } catch {
    try {
      await pb.collections.create({
        name: COLLECTION,
        type: "base",
        fields: [
          { name: "masterId", type: "text" },
          { name: "nameKey", type: "text", required: true },
          { name: "cityKey", type: "text" },
          { name: "bookingHotelId", type: "text" },
          { name: "taHotelId", type: "text" },
          { name: "score", type: "number" },
          { name: "scale", type: "number" },
          { name: "count", type: "number" },
          { name: "source", type: "text" },
        ],
      });
      return true;
    } catch {
      return false;
    }
  }
}

export async function persistReviewScore(input: {
  masterId?: string;
  name?: string;
  city?: string;
  bookingHotelId?: string;
  taHotelId?: string;
  score: number;
  scale?: number;
  count?: number;
  source: string;
}): Promise<void> {
  const score10 = scoreOutOf10(input.score, input.scale || 10);
  if (!(score10 > 0)) return;
  const row: CachedReviewScore = {
    masterId: input.masterId || "",
    nameKey: reviewNameKey(input.name || ""),
    cityKey: reviewNameKey(input.city || ""),
    bookingHotelId: input.bookingHotelId || "",
    taHotelId: input.taHotelId || "",
    score: score10,
    scale: 10,
    count: input.count,
    source: input.source,
  };
  if (!row.nameKey && !row.masterId) return;
  memory.set(memoryKey(row), { at: Date.now(), value: row });

  const pb = await tryCreateAdminPocketBase();
  if (!pb) return;
  await ensureScoresCollection();
  const filters: string[] = [];
  if (row.masterId) filters.push(`masterId="${row.masterId.replace(/"/g, "")}"`);
  if (row.nameKey) filters.push(`nameKey="${row.nameKey.replace(/"/g, "")}"`);
  try {
    const existing = filters.length
      ? await pb.collection(COLLECTION).getFirstListItem(filters.join(" || "))
      : null;
    const payload = {
      masterId: row.masterId,
      nameKey: row.nameKey,
      cityKey: row.cityKey,
      bookingHotelId: row.bookingHotelId,
      taHotelId: row.taHotelId,
      score: row.score,
      scale: 10,
      count: row.count || 0,
      source: row.source,
    };
    if (existing?.id) {
      await pb.collection(COLLECTION).update(existing.id, payload);
    } else {
      await pb.collection(COLLECTION).create(payload);
    }
  } catch {
    try {
      await pb.collection(COLLECTION).create({
        masterId: row.masterId,
        nameKey: row.nameKey,
        cityKey: row.cityKey,
        bookingHotelId: row.bookingHotelId,
        taHotelId: row.taHotelId,
        score: row.score,
        scale: 10,
        count: row.count || 0,
        source: row.source,
      });
    } catch {
      /* optional */
    }
  }
}

function nameOverlap(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const wa = a.split(" ").filter((w) => w.length > 2);
  if (!wa.length) return false;
  const hits = wa.filter((w) => b.includes(w)).length;
  return hits >= Math.min(2, wa.length) && hits / wa.length >= 0.6;
}

export async function attachCachedReviewScores(
  cards: TravelAdvisorHotelCard[]
): Promise<TravelAdvisorHotelCard[]> {
  if (!cards.length) return cards;
  const fromMemory = cards.map((card) => {
    if (card.reviewScore?.score || card.rating > 0) return card;
    const key = card.masterId || `${reviewNameKey(card.name)}|${reviewNameKey(card.city)}`;
    const hit = memory.get(key);
    if (!hit || Date.now() - hit.at > MEMORY_TTL_MS) return null;
    return { card, score: hit.value };
  });

  const missing = cards.filter((card, i) => !fromMemory[i] && !card.reviewScore?.score && !(card.rating > 0));
  let rows: CachedReviewScore[] = [];
  if (missing.length) {
    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      await ensureScoresCollection();
      const cities = Array.from(new Set(missing.map((c) => reviewNameKey(c.city)).filter(Boolean))).slice(0, 4);
      const masters = missing.map((c) => c.masterId).filter(Boolean) as string[];
      const filters: string[] = [];
      if (masters.length) {
        filters.push(masters.slice(0, 30).map((id) => `masterId="${id.replace(/"/g, "")}"`).join(" || "));
      }
      if (cities.length) {
        filters.push(cities.map((city) => `cityKey="${city.replace(/"/g, "")}"`).join(" || "));
      }
      if (filters.length) {
        try {
          const list = await pb.collection(COLLECTION).getFullList<{
            masterId?: string;
            nameKey: string;
            cityKey: string;
            bookingHotelId?: string;
            taHotelId?: string;
            score: number;
            scale: number;
            count?: number;
            source: string;
          }>({
            filter: filters.join(" || "),
            fields: "masterId,nameKey,cityKey,bookingHotelId,taHotelId,score,scale,count,source",
          });
          rows = list.map((row) => ({
            masterId: row.masterId,
            nameKey: row.nameKey,
            cityKey: row.cityKey,
            bookingHotelId: row.bookingHotelId,
            taHotelId: row.taHotelId,
            score: Number(row.score) || 0,
            scale: Number(row.scale) || 10,
            count: Number(row.count) || undefined,
            source: row.source || "tripadvisor",
          }));
          for (const row of rows) memory.set(memoryKey(row), { at: Date.now(), value: row });
        } catch {
          rows = [];
        }
      }
    }
  }

  return cards.map((card) => {
    if (card.reviewScore?.score || card.rating > 0) return card;
    const nameKey = reviewNameKey(card.name);
    const cityKey = reviewNameKey(card.city);
    const hit =
      rows.find((row) => row.masterId && row.masterId === card.masterId) ||
      rows.find((row) => row.nameKey === nameKey && (!row.cityKey || !cityKey || row.cityKey === cityKey)) ||
      rows.find((row) => nameOverlap(nameKey, row.nameKey) && (!row.cityKey || !cityKey || row.cityKey === cityKey)) ||
      memory.get(card.masterId || `${nameKey}|${cityKey}`)?.value;
    if (!hit || !(hit.score > 0)) return card;
    const score10 = scoreOutOf10(hit.score, hit.scale || 10);
    return {
      ...card,
      rating: score10,
      reviewCount: hit.count || card.reviewCount || 0,
      reviewScore: {
        source: hit.source || "tripadvisor",
        score: score10,
        scale: 10,
        count: hit.count,
      },
    };
  });
}
