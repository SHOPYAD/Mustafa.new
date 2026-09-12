import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import {
  asBookingComHotelId,
  fetchHotelReviewsPage,
  forgetPersistedBookingHotelId,
  getHotelReviewScores,
  parseReviewScoresPayload,
  resolveBookingHotelId,
} from "@/lib/server/hotel-rooms-provider";
import {
  fetchTravelAdvisorReviews,
  resolveTravelAdvisorHotelId,
} from "@/lib/server/travel-advisor";
import { persistReviewScore } from "@/lib/server/hotels/review-scores-store";
import { translateMany } from "@/lib/server/libretranslate";
import { scoreOutOf10 } from "@/lib/hotel-offer-copy";
import type { TravelAdvisorReview, TravelAdvisorReviewScore } from "@/types/travel-advisor";

const COLLECTION = "hotel_guest_reviews";

async function ensureReviewsCollection(): Promise<boolean> {
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
          { name: "reviewId", type: "text", required: true },
          { name: "masterId", type: "text" },
          { name: "bookingHotelId", type: "text" },
          { name: "taHotelId", type: "text" },
          { name: "author", type: "text" },
          { name: "score", type: "number" },
          { name: "title", type: "text" },
          { name: "text", type: "text" },
          { name: "postedAt", type: "text" },
          { name: "lang", type: "text" },
          { name: "source", type: "text" },
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
      out.push(row);
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

export async function loadStoredGuestReviews(input: {
  masterId?: string;
  bookingHotelId?: string;
  taHotelId?: string;
}): Promise<StoredGuestReview[]> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return [];
  await ensureReviewsCollection();
  const filters: string[] = [];
  if (input.masterId) filters.push(`masterId="${input.masterId.replace(/"/g, "")}"`);
  if (input.bookingHotelId) filters.push(`bookingHotelId="${input.bookingHotelId.replace(/"/g, "")}"`);
  if (input.taHotelId) filters.push(`taHotelId="${input.taHotelId.replace(/"/g, "")}"`);
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
      bookingHotelId?: string;
      taHotelId?: string;
      source?: string;
      lang?: string;
    }>({
      filter: filters.join(" || "),
      sort: "-postedAt",
      fields: "reviewId,author,score,title,text,postedAt,masterId,bookingHotelId,taHotelId,source,lang",
    });
    return rows.map((row) => ({
      id: row.reviewId || "",
      author: row.author || "Guest",
      rating: Number(row.score) || 0,
      title: row.title || "",
      text: row.text || "",
      date: row.postedAt || "",
      masterId: row.masterId,
      bookingHotelId: row.bookingHotelId,
      taHotelId: row.taHotelId,
      source: (row.source as TravelAdvisorReview["source"]) || undefined,
      lang: row.lang,
    }));
  } catch {
    return [];
  }
}

async function persistGuestReviews(input: {
  masterId?: string;
  bookingHotelId?: string;
  taHotelId?: string;
  lang: string;
  reviews: TravelAdvisorReview[];
}): Promise<void> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb || !input.reviews.length) return;
  await ensureReviewsCollection();
  for (const review of input.reviews) {
    const reviewId = String(review.id || "").slice(0, 80);
    if (!reviewId || !review.text) continue;
    try {
      const existing = await pb.collection(COLLECTION).getFirstListItem(`reviewId="${reviewId.replace(/"/g, "")}"`);
      if (existing?.id) continue;
    } catch {
      /* create */
    }
    try {
      await pb.collection(COLLECTION).create({
        reviewId,
        masterId: input.masterId || "",
        bookingHotelId: input.bookingHotelId || "",
        taHotelId: input.taHotelId || "",
        author: String(review.author || "Guest").slice(0, 160),
        score: Number(review.rating) || 0,
        title: String(review.title || "").slice(0, 240),
        text: String(review.text || "").slice(0, 8000),
        postedAt: String(review.date || "").slice(0, 40),
        lang: input.lang.slice(0, 8),
        source: review.source || "booking_com15",
      });
    } catch {
      try {
        await pb.collection(COLLECTION).create({
          reviewId,
          masterId: input.masterId || "",
          bookingHotelId: input.bookingHotelId || "",
          author: String(review.author || "Guest").slice(0, 160),
          score: Number(review.rating) || 0,
          title: String(review.title || "").slice(0, 240),
          text: String(review.text || "").slice(0, 8000),
          postedAt: String(review.date || "").slice(0, 40),
          lang: input.lang.slice(0, 8),
          source: review.source || "booking_com15",
        });
      } catch {
        /* optional */
      }
    }
  }
  if (input.masterId && (input.bookingHotelId || input.taHotelId)) {
    try {
      const master = await pb.collection("hotel_masters").getFirstListItem(`masterId="${input.masterId.replace(/"/g, "")}"`);
      if (master?.id) {
        await pb.collection("hotel_masters").update(master.id, {
          ...(input.bookingHotelId ? { bookingHotelId: input.bookingHotelId } : {}),
          ...(input.taHotelId ? { taHotelId: input.taHotelId } : {}),
        });
      }
    } catch {
      /* field may not exist until migration */
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
  if (fallback && fallback.score > 0) return fallback;
  const rated = reviews.filter((row) => row.rating > 0);
  if (!rated.length) return undefined;
  const avg = rated.reduce((sum, row) => sum + row.rating, 0) / rated.length;
  const source = rated.some((row) => row.source === "tripadvisor") ? "tripadvisor" : "booking_com15";
  const scale = avg <= 5 ? 5 : 10;
  return { source, score: Math.round(avg * 10) / 10, scale, count: reviews.length };
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

function explicitBookingHotelId(input: { hotelId?: string; bookingHotelId?: string }): string {
  const fromParam = asBookingComHotelId(input.bookingHotelId);
  if (fromParam) return fromParam;
  const raw = String(input.hotelId || "").trim();
  if (/^bk-\d+$/i.test(raw)) return asBookingComHotelId(raw);
  return "";
}

async function liveBookingReviews(bookingHotelId: string, lang: string): Promise<TravelAdvisorReview[]> {
  if (!bookingHotelId) return [];
  const pages = await Promise.all([
    fetchHotelReviewsPage({ hotelId: bookingHotelId, page: 1, lang }),
    fetchHotelReviewsPage({ hotelId: bookingHotelId, page: 2, lang }),
  ]).catch(() => [] as TravelAdvisorReview[][]);
  return mergeReviews(...(Array.isArray(pages) ? pages : [])).map((row) => ({
    ...row,
    source: "booking_com15" as const,
  }));
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
}): Promise<GuestReviewsResult> {
  const lang = input.lang || "ar";
  const hotelName = (input.name || "").trim();
  const city = searchCity(input.city);
  const givenBookingId = explicitBookingHotelId(input);
  const stored = await loadStoredGuestReviews({
    masterId: input.masterId,
    bookingHotelId: givenBookingId || undefined,
  });
  if (stored.length >= 25) {
    const localized = await localizeReviews(stored, lang);
    return {
      reviews: localized,
      bookingHotelId: stored.find((row) => row.bookingHotelId)?.bookingHotelId || givenBookingId || "",
      taHotelId: stored.find((row) => row.taHotelId)?.taHotelId || "",
      cached: true,
      reviewScore: scoreFromReviews(stored),
      reviewScores: [],
    };
  }

  const roomsQuery = {
    hotelName,
    city,
    bookingHotelId: givenBookingId || undefined,
    latitude: input.lat,
    longitude: input.lng,
    checkIn: todayYmd(14),
    checkOut: todayYmd(16),
    adults: 2,
    lang,
  };

  const [bookingResolved, taResolved] = await Promise.all([
    hotelName
      ? resolveBookingHotelId("", "", hotelName, city, roomsQuery).catch(() => null)
      : Promise.resolve(null),
    hotelName
      ? resolveTravelAdvisorHotelId({ name: hotelName, city }).catch(() => null)
      : Promise.resolve(null),
  ]);

  let bookingHotelId = bookingResolved && bookingResolved.ok ? bookingResolved.id : givenBookingId;
  const taHotelId = taResolved?.id || "";

  let [bookingReviews, bookingScoresRes, taBundle] = await Promise.all([
    liveBookingReviews(bookingHotelId, lang),
    bookingHotelId
      ? getHotelReviewScores({ hotelId: bookingHotelId, lang }).catch(() => null)
      : Promise.resolve(null),
    taHotelId
      ? fetchTravelAdvisorReviews({ contentId: taHotelId, lang }).catch(() => null)
      : Promise.resolve(null),
  ]);

  if (!bookingReviews.length && hotelName && bookingHotelId) {
    await forgetPersistedBookingHotelId(hotelName, city, bookingHotelId);
    await forgetPersistedBookingHotelId(hotelName, input.city || "", bookingHotelId);
    const retry = await resolveBookingHotelId("", "", hotelName, city, {
      ...roomsQuery,
      bookingHotelId: undefined,
    }).catch(() => null);
    const retryId = retry && retry.ok ? retry.id : "";
    if (retryId && retryId !== bookingHotelId) {
      bookingHotelId = retryId;
      const [retried, retriedScores] = await Promise.all([
        liveBookingReviews(bookingHotelId, lang),
        getHotelReviewScores({ hotelId: bookingHotelId, lang }).catch(() => null),
      ]);
      bookingReviews = retried;
      if (retriedScores) bookingScoresRes = retriedScores;
    }
  }

  const storedForResolved = bookingHotelId
    ? await loadStoredGuestReviews({
        masterId: input.masterId,
        bookingHotelId,
        taHotelId: taHotelId || undefined,
      })
    : stored;
  const taReviews = (taBundle?.reviews || []).map((row) => ({
    ...row,
    source: "tripadvisor" as const,
  }));
  const merged = mergeReviews(taReviews, bookingReviews, storedForResolved);
  const reviews = await localizeReviews(merged, lang);

  const reviewScores =
    bookingScoresRes && "ok" in bookingScoresRes && bookingScoresRes.ok
      ? parseReviewScoresPayload(bookingScoresRes.payload)
      : [];
  const bookingOverall = reviewScores.find((row) => /overall|total|score/i.test(row.name));
  const reviewScore =
    taBundle?.rating
      ? {
          source: "tripadvisor",
          score: taBundle.rating,
          scale: taBundle.rating <= 5 ? 5 : 10,
          count: taBundle.reviewCount || taReviews.length || undefined,
        }
      : bookingOverall
        ? { source: "booking_com15", score: bookingOverall.score, scale: bookingOverall.score <= 5 ? 5 : 10, count: bookingReviews.length || undefined }
        : scoreFromReviews(merged);

  if (merged.length) {
    void persistGuestReviews({
      masterId: input.masterId,
      bookingHotelId,
      taHotelId,
      lang,
      reviews: merged,
    });
  }
  if (reviewScore && reviewScore.score > 0) {
    void persistReviewScore({
      masterId: input.masterId,
      name: input.name,
      city: input.city,
      bookingHotelId,
      taHotelId,
      score: reviewScore.score,
      scale: reviewScore.scale,
      count: reviewScore.count,
      source: reviewScore.source,
    });
  }

  return {
    reviews,
    bookingHotelId,
    taHotelId,
    cached: false,
    reviewScore: reviewScore
      ? {
          ...reviewScore,
          score: scoreOutOf10(reviewScore.score, reviewScore.scale),
          scale: 10,
        }
      : undefined,
    reviewScores,
  };
}
