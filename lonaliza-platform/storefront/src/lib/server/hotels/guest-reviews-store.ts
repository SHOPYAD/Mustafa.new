import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { persistReviewScore } from "@/lib/server/hotels/review-scores-store";
import { translateMany } from "@/lib/server/libretranslate";
import { scoreOutOf10 } from "@/lib/hotel-offer-copy";
import type { TravelAdvisorReview, TravelAdvisorReviewScore } from "@/types/travel-advisor";

const COLLECTION = "hotel_guest_reviews";

async function ensureReviewsCollection(): Promise<boolean> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return false;
  try {
    const col = await pb.collections.getOne(COLLECTION);
    const existing = new Set<string>();
    const fieldsList = ((col.fields || (col as Record<string, unknown>).schema || []) as Array<{ name: string }>);
    for (const f of fieldsList) {
      if (f.name) existing.add(f.name);
    }
    const needed = ["originalTitle", "originalText", "originalLang", "hotelName"];
    const missing = needed.filter((n) => !existing.has(n));
    if (missing.length) {
      const updatedFields = [...fieldsList, ...missing.map((n) => ({ name: n, type: "text" }))];
      try {
        if (col.fields) {
          await pb.collections.update(col.id, { fields: updatedFields });
        } else {
          await pb.collections.update(col.id, { schema: updatedFields });
        }
      } catch (err) {
        console.warn("[ensureReviewsCollection] update fields notice:", err);
      }
    }
    return true;
  } catch {
    try {
      await pb.collections.create({
        name: COLLECTION,
        type: "base",
        fields: [
          { name: "reviewId", type: "text", required: true },
          { name: "masterId", type: "text" },
          { name: "hotelName", type: "text" },
          { name: "bookingHotelId", type: "text" },
          { name: "taHotelId", type: "text" },
          { name: "author", type: "text" },
          { name: "score", type: "number" },
          { name: "title", type: "text" },
          { name: "text", type: "text" },
          { name: "postedAt", type: "text" },
          { name: "lang", type: "text" },
          { name: "source", type: "text" },
          { name: "originalTitle", type: "text" },
          { name: "originalText", type: "text" },
          { name: "originalLang", type: "text" },
        ],
      });
      return true;
    } catch {
      return false;
    }
  }
}

export type StoredGuestReview = TravelAdvisorReview & {
  masterId?: string;
  bookingHotelId?: string;
  taHotelId?: string;
  source?: TravelAdvisorReview["source"] | string;
  lang?: string;
  originalTitle?: string;
  originalText?: string;
  originalLang?: string;
};

function todayYmd(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function reviewKey(review: TravelAdvisorReview): string {
  return `${review.source || ""}:${review.id || review.text.slice(0, 48)}`;
}

function mergeReviews(...groups: TravelAdvisorReview[][]): TravelAdvisorReview[] {
  const seen = new Set<string>();
  const out: TravelAdvisorReview[] = [];
  for (const group of groups) {
    for (const row of group) {
      if (!row.text) continue;
      const key = reviewKey(row);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        ...row,
        originalTitle: row.originalTitle || row.title,
        originalText: row.originalText || row.text,
        originalLang: row.originalLang || "en",
      });
    }
  }
  out.sort((a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0));
  return out;
}

async function localizeReviews(reviews: TravelAdvisorReview[], lang: string): Promise<TravelAdvisorReview[]> {
  if (!reviews.length) return reviews;
  const titles = reviews.map((r) => r.title || "");
  const bodies = reviews.map((r) => r.text || "");
  try {
    const translated = Promise.all([translateMany(titles, lang), translateMany(bodies, lang)]).then(
      ([trTitles, trBodies]) =>
        reviews.map((row, i) => ({
          ...row,
          title: trTitles[i] || row.title,
          text: trBodies[i] || row.text,
          originalTitle: row.originalTitle || row.title,
          originalText: row.originalText || row.text,
          originalLang: row.originalLang || "en",
        }))
    );
    const timed = new Promise<TravelAdvisorReview[]>((resolve) => {
      setTimeout(() => resolve(reviews), 5000);
    });
    return await Promise.race([translated, timed]);
  } catch {
    return reviews;
  }
}

const FAKE_AUTHORS = new Set([
  "Fahad Al-Otaibi",
  "Elena Rostova",
  "Tariq Mansour",
  "Sophie Dubois",
  "Nasser Al-Hajri",
  "Marcus Vance",
  "Layla Al-Kuwari",
  "Alessandro Rossi",
  "Sarah Jenkins",
  "Dr. Khaled Al-Mutawa",
  "Amina Benali",
  "Carlos Mendez",
  "Fatima Al-Zahrani",
  "Lukas Weber",
  "Mariam Al-Kaabi",
  "David Chen",
  "Huda Al-Dosari",
  "Jean-Pierre Blanc",
  "Reem Al-Sabah",
  "Oliver Smith",
  "Noor Al-Ghamdi",
  "Zaid Al-Omari",
  "Chloe Martin",
  "Sultan Al-Shamsi",
  "Emma Watson",
]);

export function isFakeTemplateReview(review: { author?: string; title?: string }): boolean {
  if (!review) return false;
  if (review.author && FAKE_AUTHORS.has(review.author.trim())) return true;
  if (review.title && review.title.includes("Verified Guest Review Highlight")) return true;
  return false;
}

export async function loadStoredGuestReviews(input: {
  masterId?: string;
  hotelId?: string;
  hotelName?: string;
  bookingHotelId?: string;
  taHotelId?: string;
}): Promise<StoredGuestReview[]> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return [];
  await ensureReviewsCollection();
  const filters: string[] = [];
  if (input.masterId) filters.push(`masterId="${input.masterId.replace(/"/g, "")}"`);
  if (input.hotelId && input.hotelId !== input.masterId) filters.push(`masterId="${input.hotelId.replace(/"/g, "")}"`);
  if (input.bookingHotelId) filters.push(`bookingHotelId="${input.bookingHotelId.replace(/"/g, "")}"`);
  if (input.taHotelId) filters.push(`taHotelId="${input.taHotelId.replace(/"/g, "")}"`);
  if (input.hotelName && input.hotelName.trim().length > 3) {
    filters.push(`hotelName="${input.hotelName.trim().replace(/"/g, "")}"`);
  }
  if (!filters.length) return [];
  try {
    const rows = await pb.collection(COLLECTION).getFullList<{
      reviewId: string;
      author: string;
      score: number;
      title: string;
      text: string;
      postedAt: string;
      masterId?: string;
      hotelName?: string;
      bookingHotelId?: string;
      taHotelId?: string;
      source?: string;
      lang?: string;
      originalTitle?: string;
      originalText?: string;
      originalLang?: string;
    }>({
      filter: filters.join(" || "),
      sort: "-postedAt",
      fields: "reviewId,author,score,title,text,postedAt,masterId,hotelName,bookingHotelId,taHotelId,source,lang,originalTitle,originalText,originalLang",
    });
    return rows
      .filter((row) => !isFakeTemplateReview(row))
      .map((row) => {
        const rawScore = Number(row.score) || 0;
        const score10 = rawScore > 0 && rawScore <= 5 ? Math.round(rawScore * 2 * 10) / 10 : rawScore;
        return {
          id: row.reviewId || "",
          author: row.author || "TripAdvisor Guest",
          rating: score10,
          title: row.title || "",
          text: row.text || "",
          originalTitle: row.originalTitle || row.title || "",
          originalText: row.originalText || row.text || "",
          originalLang: row.originalLang || "en",
          date: row.postedAt || "",
          masterId: row.masterId,
          bookingHotelId: row.bookingHotelId,
          taHotelId: row.taHotelId,
          source: "tripadvisor" as const,
          lang: row.lang,
        };
      });
  } catch {
    return [];
  }
}

async function persistGuestReviews(input: {
  masterId?: string;
  hotelName?: string;
  bookingHotelId?: string;
  taHotelId?: string;
  lang: string;
  reviews: TravelAdvisorReview[];
}): Promise<void> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb || !input.reviews.length) return;
  await ensureReviewsCollection();
  for (const review of input.reviews) {
    if (isFakeTemplateReview(review)) continue;
    const reviewId = String(review.id || "").slice(0, 80);
    if (!reviewId || !review.text) continue;
    try {
      const existing = await pb.collection(COLLECTION).getFirstListItem(`reviewId="${reviewId.replace(/"/g, "")}"`);
      if (existing?.id) {
        if (!existing.hotelName && input.hotelName) {
          await pb.collection(COLLECTION).update(existing.id, { hotelName: input.hotelName });
        }
        continue;
      }
    } catch {
      /* create */
    }
    try {
      await pb.collection(COLLECTION).create({
        reviewId,
        masterId: input.masterId || "",
        hotelName: input.hotelName || "",
        bookingHotelId: input.bookingHotelId || "",
        taHotelId: input.taHotelId || `ta_${reviewId}`,
        author: String(review.author || "TripAdvisor Guest").slice(0, 160),
        score: Number(review.rating) || 5,
        title: String(review.title || "").slice(0, 240),
        text: String(review.text || "").slice(0, 8000),
        originalTitle: String(review.originalTitle || review.title || "").slice(0, 240),
        originalText: String(review.originalText || review.text || "").slice(0, 8000),
        originalLang: review.originalLang || "en",
        postedAt: String(review.date || "").slice(0, 40),
        lang: input.lang.slice(0, 8),
        source: "tripadvisor",
      });
    } catch (err) {
      console.warn("[Reviews Store] Error persisting review:", err);
    }
  }
}

export type GuestReviewsResult = {
  reviews: TravelAdvisorReview[];
  bookingHotelId: string;
  taHotelId: string;
  cached: boolean;
  reviewScore?: { source: string; score: number; scale: number; count?: number };
  reviewScores: TravelAdvisorReviewScore[];
};

function scoreFromReviews(
  reviews: TravelAdvisorReview[],
  fallback?: { source: string; score: number; scale: number; count?: number }
): GuestReviewsResult["reviewScore"] {
  if (fallback && fallback.score > 0) {
    const s10 = fallback.scale === 5 ? scoreOutOf10(fallback.score, 5) : fallback.score;
    return { ...fallback, score: s10, scale: 10 };
  }
  const rated = reviews.filter((row) => row.rating > 0);
  if (!rated.length) return undefined;
  const avg = rated.reduce((sum, row) => sum + row.rating, 0) / rated.length;
  const score10 = avg <= 5 ? scoreOutOf10(avg, 5) : Math.round(avg * 10) / 10;
  return { source: "tripadvisor", score: score10, scale: 10, count: reviews.length };
}

const CITY_SEARCH_ALIASES: Record<string, string> = {
  istanbul: "Istanbul",
  "اسطنبول": "Istanbul",
  "إسطنبول": "Istanbul",
  antalya: "Antalya",
  "انطاليا": "Antalya",
  "أنطاليا": "Antalya",
  trabzon: "Trabzon",
  "طرابزون": "Trabzon",
  cappadocia: "Cappadocia",
  "كابادوكيا": "Cappadocia",
  sapanca: "Sapanca",
  "سبانجا": "Sapanca",
};

function searchCity(city?: string): string {
  const raw = String(city || "").trim();
  if (!raw) return "";
  return CITY_SEARCH_ALIASES[raw] || CITY_SEARCH_ALIASES[raw.toLowerCase()] || (/[\u0600-\u06ff]/.test(raw) ? "" : raw);
}

export async function getOrFetchGuestReviews(input: {
  hotelId?: string;
  bookingHotelId?: string;
  masterId?: string;
  name?: string;
  city?: string;
  lat?: number;
  lng?: number;
  lang?: string;
  forceRefresh?: boolean;
}): Promise<GuestReviewsResult> {
  const lang = input.lang || "ar";
  const hotelName = (input.name || "").trim();
  const city = searchCity(input.city) || input.city || "";
  const effectiveMasterId = input.masterId || input.hotelId || "";

  // 1. Check local PocketBase storage first (instant response < 10ms)
  const stored = await loadStoredGuestReviews({
    masterId: effectiveMasterId,
    hotelId: input.hotelId,
    hotelName,
    bookingHotelId: input.bookingHotelId,
  });

  if (stored.length > 0 && !input.forceRefresh) {
    // If stored reviews count is less than target (250), trigger progressive background harvest
    if (stored.length < 250 && hotelName) {
      import("@/lib/server/mcp/servers/tripadvisor-reviews")
        .then(({ harvestHotelReviewsUpTo250 }) => {
          void harvestHotelReviewsUpTo250({
            hotelName,
            city: input.city || city,
            masterId: effectiveMasterId,
            targetTotal: 250,
            targetLang: lang,
          });
        })
        .catch((err) => console.warn("[Reviews Store] Background harvest trigger error:", err));
    }

    const localized = await localizeReviews(stored, lang);
    return {
      reviews: localized,
      bookingHotelId: "",
      taHotelId: stored.find((row) => row.taHotelId)?.taHotelId || "",
      cached: true,
      reviewScore: scoreFromReviews(stored),
      reviewScores: [],
    };
  }

  // 2. Invoke TripAdvisor Reviews MCP Server powered by Gemini AI web search
  let taReviews: TravelAdvisorReview[] = [];
  let taRating = 0;
  let taReviewCount = 0;

  if (hotelName) {
    try {
      const { callBuiltinTool } = await import("@/lib/server/mcp/builtin");
      const mcpRes = await callBuiltinTool("liotrip-tripadvisor-reviews", "tripadvisor.sync_hotel", {
        hotelName,
        city: input.city || city,
        masterId: effectiveMasterId,
        targetLang: lang,
      });

      if (mcpRes.ok && mcpRes.content) {
        const parsed = JSON.parse(mcpRes.content);
        if (parsed.averageRating) {
          const rawRating = Number(parsed.averageRating);
          taRating = rawRating <= 5 && rawRating > 0 ? Math.round(rawRating * 2 * 10) / 10 : rawRating;
        }
        if (parsed.crawledCount) {
          taReviewCount = Number(parsed.crawledCount);
        }
        if (parsed.reviews && Array.isArray(parsed.reviews)) {
          for (const r of parsed.reviews) {
            if (isFakeTemplateReview(r)) continue;
            const rawScore = Number(r.rating) || 9;
            const score10 = rawScore <= 5 && rawScore > 0 ? Math.round(rawScore * 2 * 10) / 10 : rawScore;
            taReviews.push({
              id: r.id,
              author: r.author || "TripAdvisor Guest",
              rating: score10,
              title: (lang === "ar" ? r.titleAr : r.title) || r.title,
              text: (lang === "ar" ? r.textAr : r.text) || r.text,
              originalTitle: r.originalTitle || r.title,
              originalText: r.originalText || r.text,
              originalLang: "en",
              date: r.date || "",
              source: "tripadvisor" as const,
            });
          }
        }
      }

      // Also trigger progressive background harvest to reach 250 reviews
      import("@/lib/server/mcp/servers/tripadvisor-reviews")
        .then(({ harvestHotelReviewsUpTo250 }) => {
          void harvestHotelReviewsUpTo250({
            hotelName,
            city: input.city || city,
            masterId: effectiveMasterId,
            targetTotal: 250,
            targetLang: lang,
          });
        })
        .catch((err) => console.warn("[Reviews Store] Background harvest trigger error:", err));
    } catch (err) {
      console.warn("[Reviews Store] TripAdvisor AI MCP Agent error:", err);
    }
  }

  const cleanMerged = mergeReviews(taReviews, stored).filter((row) => !isFakeTemplateReview(row));
  const reviews = await localizeReviews(cleanMerged, lang);

  // Score calculation: All scores strictly on 10-point scale
  const avg = taRating > 0
    ? taRating
    : cleanMerged.length
      ? cleanMerged.reduce((sum, r) => sum + r.rating, 0) / cleanMerged.length
      : 0;

  const score10 = avg > 0 ? (avg <= 5 ? Math.round(avg * 2 * 10) / 10 : Math.round(avg * 10) / 10) : 0;
  const reviewScore = score10 > 0
    ? {
        source: "tripadvisor",
        score: score10,
        scale: 10,
        count: taReviewCount || cleanMerged.length || undefined,
      }
    : undefined;

  // Persist review score in memory/DB cache
  if (reviewScore && reviewScore.score > 0) {
    void persistReviewScore({
      masterId: effectiveMasterId,
      name: input.name,
      city: input.city,
      score: reviewScore.score,
      scale: 10,
      count: reviewScore.count,
      source: "tripadvisor",
    });
  }

  // Also persist in PocketBase if newly crawled
  if (cleanMerged.length && !stored.length) {
    void persistGuestReviews({
      masterId: effectiveMasterId,
      hotelName,
      lang,
      reviews: cleanMerged,
    });
  }

  return {
    reviews,
    bookingHotelId: "",
    taHotelId: (cleanMerged.find((r) => (r as any).taHotelId) as any)?.taHotelId || "",
    cached: false,
    reviewScore,
    reviewScores: [],
  };
}
