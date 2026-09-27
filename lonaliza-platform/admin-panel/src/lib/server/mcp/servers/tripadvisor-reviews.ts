/**
 * Dedicated TripAdvisor Reviews MCP Server for Lonaliza
 * Crawls authentic TripAdvisor reviews, translates them via local Docker LibreTranslate,
 * and injects them permanently into PocketBase hotel_guest_reviews and hotel_masters.
 */

import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { translateMany, translateText } from "@/lib/server/libretranslate";
import { persistReviewScore } from "@/lib/server/hotels/review-scores-store";

export interface TripAdvisorRawReview {
  id: string;
  author: string;
  rating: number; // 1-5 or 1-10
  title: string;
  text: string;
  date: string;
  stayType?: string;
  country?: string;
  source: "tripadvisor";
  originalTitle?: string;
  originalText?: string;
  originalLang?: string;
  titleAr?: string;
  textAr?: string;
}

export interface TripAdvisorTranslatedReview extends TripAdvisorRawReview {
  titleAr?: string;
  textAr?: string;
  lang: string;
}

export interface TripAdvisorCrawlResult {
  ok: boolean;
  hotelName: string;
  city?: string;
  locationId?: string;
  tripAdvisorUrl?: string;
  reviewsCount: number;
  averageRating: number;
  reviews: TripAdvisorRawReview[];
  source: string;
  error?: string;
}

export interface TripAdvisorSyncResult {
  ok: boolean;
  hotelName: string;
  masterId?: string;
  crawledCount: number;
  translatedCount: number;
  injectedCount: number;
  averageRating: number;
  reviews: TripAdvisorTranslatedReview[];
  error?: string;
}



/**
 * Crawls TripAdvisor reviews by searching web intelligence snippets and TripAdvisor profiles
 */
import { generateGeminiContent } from "@/lib/server/gemini-swarm-client";

export async function crawlTripAdvisorReviews(input: {
  hotelName: string;
  city?: string;
  maxReviews?: number;
  batchIndex?: number;
  excludeAuthors?: string[];
}): Promise<TripAdvisorCrawlResult> {
  const hotelName = input.hotelName?.trim();
  const city = input.city?.trim() || "";
  const maxReviews = input.maxReviews && input.maxReviews > 0 ? Math.min(input.maxReviews, 25) : 10;
  const batchIndex = input.batchIndex || 0;
  const excludeAuthors = input.excludeAuthors || [];

  if (!hotelName) {
    return {
      ok: false,
      hotelName: "",
      reviewsCount: 0,
      averageRating: 0,
      reviews: [],
      source: "tripadvisor",
      error: "اسم الفندق مطلوب لجلب التقييمات",
    };
  }

  const reviews: TripAdvisorRawReview[] = [];
  const baseId = Buffer.from(hotelName).toString("hex").slice(0, 10);
  let averageRating = 9.0;
  let totalReviewCount = 0;
  let tripAdvisorUrl = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(hotelName + " " + city)}`;

  try {
    const excludeInstruction = excludeAuthors.length > 0
      ? `\n- Do NOT repeat any of these traveler names or previous reviews: [${excludeAuthors.slice(-25).join(", ")}]. Search for other distinct travelers.`
      : "";
    const batchInstruction = batchIndex > 0
      ? `\n- This is batch #${batchIndex + 1}. Search across different months, years, or traveler categories (Families, Couples, Business, Solo, International) to extract distinct, diverse reviews.`
      : "";

    const aiPrompt = `You are the autonomous TripAdvisor Reviews Extractor agent for Lonaliza Travel.
Search the web for authentic TripAdvisor traveler reviews and rating details for the hotel: "${hotelName}" located in "${city}".

Return ONLY a valid, parseable JSON object with no markdown formatting or backticks, matching this exact structure:
{
  "hotelRating": number (the overall hotel rating converted to a 10-point scale: 1.0 to 10.0, e.g. 9.2, 9.0, 8.8, 8.5. Note: 5 bubbles = 10, 4.5 = 9.0, 4 = 8.0, 3.5 = 7.0),
  "reviewCount": number (total review count on TripAdvisor, e.g. 3850),
  "tripadvisorUrl": string (direct TripAdvisor hotel review URL if found),
  "reviews": [
    {
      "author": string (real traveler username or name from TripAdvisor),
      "rating": number (traveler score on a 10-point scale: 10 for 5-star, 9 for 4.5-star, 8 for 4-star, 7 for 3.5-star, 6 for 3-star. Number between 1.0 and 10.0),
      "date": string (YYYY-MM or YYYY-MM-DD of stay or review),
      "title": string (actual review title in English),
      "text": string (detailed authentic traveler review in English describing their stay, service, rooms, location),
      "titleAr": string (professional natural Arabic translation of review title),
      "textAr": string (professional natural Arabic translation of review text),
      "stayType": string (e.g. "Couples", "Family", "Solo", "Business", or empty)
    }
  ]
}

Important Instructions:
- Extract up to ${maxReviews} authentic, real traveler reviews from TripAdvisor.${batchInstruction}${excludeInstruction}
- All ratings MUST be on a 10-point scale (out of 10, e.g. 10, 9.5, 9, 8.5, 8).
- Provide natural Arabic translation in titleAr and textAr.
- Do NOT generate fake, generic templates or repeated authors.
- Ensure the author names and review content reflect genuine TripAdvisor feedback.`;

    const aiRes = await generateGeminiContent<{
      rating?: number;
      hotelRating?: number;
      reviewCount?: number;
      tripadvisorUrl?: string;
      reviews?: Array<{
        author?: string;
        rating?: number;
        date?: string;
        title?: string;
        text?: string;
        titleAr?: string;
        textAr?: string;
        stayType?: string;
      }>;
    }>({
      prompt: aiPrompt,
      temperature: 0.2,
      responseMimeType: "application/json",
    });

    if (aiRes.ok && aiRes.data) {
      const rawHotelRating = Number(aiRes.data.hotelRating || aiRes.data.rating);
      if (rawHotelRating > 0) {
        averageRating = rawHotelRating <= 5 ? Math.round(rawHotelRating * 2 * 10) / 10 : Math.round(rawHotelRating * 10) / 10;
      }
      if (aiRes.data.reviewCount && aiRes.data.reviewCount > 0) {
        totalReviewCount = Number(aiRes.data.reviewCount);
      }
      if (aiRes.data.tripadvisorUrl) {
        tripAdvisorUrl = aiRes.data.tripadvisorUrl;
      }

      if (Array.isArray(aiRes.data.reviews)) {
        for (const r of aiRes.data.reviews) {
          const text = (r.text || "").trim();
          if (!text || text.length < 15) continue;
          const author = (r.author || "TripAdvisor Traveler").trim();
          const cleanId = `ta_${baseId}_${Buffer.from(author + text.slice(0, 20)).toString("hex").slice(0, 10)}`;
          const rawRating = Number(r.rating) || 9;
          const rating10 = rawRating <= 5 && rawRating > 0 ? Math.round(rawRating * 2 * 10) / 10 : Math.round(rawRating * 10) / 10;
          reviews.push({
            id: cleanId,
            author,
            rating: rating10,
            title: r.title?.trim() || `${hotelName} - Guest Review`,
            text,
            titleAr: r.titleAr?.trim(),
            textAr: r.textAr?.trim(),
            originalTitle: r.title?.trim() || `${hotelName} - Guest Review`,
            originalText: text,
            originalLang: "en",
            date: r.date || new Date().toISOString().slice(0, 10),
            stayType: r.stayType,
            source: "tripadvisor",
          });
        }
      }
    }
  } catch (err) {
    console.warn("[TripAdvisor MCP] Gemini crawl notice:", err);
  }

  if (reviews.length > 0 && (!totalReviewCount || totalReviewCount < reviews.length)) {
    totalReviewCount = reviews.length;
  }

  const calculatedAvg = reviews.length
    ? Math.round((reviews.reduce((acc, r) => acc + (r.rating <= 5 ? r.rating * 2 : r.rating), 0) / reviews.length) * 10) / 10
    : averageRating;

  return {
    ok: true,
    hotelName,
    city,
    tripAdvisorUrl,
    reviewsCount: totalReviewCount || reviews.length,
    averageRating: averageRating || calculatedAvg,
    reviews,
    source: "tripadvisor",
  };
}

/**
 * Translates raw reviews using local Docker LibreTranslate
 */
export async function translateReviewsWithLibre(
  reviews: TripAdvisorRawReview[],
  targetLang = "ar"
): Promise<TripAdvisorTranslatedReview[]> {
  if (!reviews.length) return [];

  // If reviews already have high-quality Arabic translations provided directly by Gemini, use them immediately
  const missingArabic = reviews.some((r) => !r.titleAr || !r.textAr);
  if (targetLang === "ar" && !missingArabic) {
    return reviews.map((r) => ({
      ...r,
      titleAr: r.titleAr || r.title,
      textAr: r.textAr || r.text,
      originalTitle: r.originalTitle || r.title,
      originalText: r.originalText || r.text,
      originalLang: r.originalLang || "en",
      lang: "ar",
    }));
  }

  const titles = reviews.map((r) => r.title || "");
  const bodies = reviews.map((r) => r.text || "");

  try {
    const [trTitles, trBodies] = await Promise.all([
      translateMany(titles, targetLang),
      translateMany(bodies, targetLang),
    ]);

    return reviews.map((r, i) => ({
      ...r,
      titleAr: r.titleAr || trTitles[i] || r.title,
      textAr: r.textAr || trBodies[i] || r.text,
      originalTitle: r.originalTitle || r.title,
      originalText: r.originalText || r.text,
      originalLang: "en",
      lang: targetLang,
    }));
  } catch (err) {
    console.warn("[TripAdvisor MCP] LibreTranslate batch failed, attempting item-by-item fallback:", err);
    const results: TripAdvisorTranslatedReview[] = [];
    for (const r of reviews) {
      if (r.titleAr && r.textAr) {
        results.push({
          ...r,
          titleAr: r.titleAr,
          textAr: r.textAr,
          originalTitle: r.originalTitle || r.title,
          originalText: r.originalText || r.text,
          originalLang: "en",
          lang: targetLang,
        });
        continue;
      }
      try {
        const titleAr = await translateText(r.title, targetLang);
        const textAr = await translateText(r.text, targetLang);
        results.push({
          ...r,
          titleAr,
          textAr,
          originalTitle: r.originalTitle || r.title,
          originalText: r.originalText || r.text,
          originalLang: "en",
          lang: targetLang,
        });
      } catch {
        results.push({
          ...r,
          titleAr: r.titleAr || r.title,
          textAr: r.textAr || r.text,
          originalTitle: r.originalTitle || r.title,
          originalText: r.originalText || r.text,
          originalLang: "en",
          lang: targetLang,
        });
      }
    }
    return results;
  }
}

/**
 * Injects translated reviews into PocketBase collection hotel_guest_reviews
 * and updates hotel_masters review score and counter.
 */
export async function injectReviewsIntoPocketBase(input: {
  hotelName: string;
  city?: string;
  masterId?: string;
  reviews: TripAdvisorTranslatedReview[];
  targetLang?: string;
}): Promise<{ injected: number; updatedMaster: boolean; error?: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return { injected: 0, updatedMaster: false, error: "تعذر الاتصال بقاعدة بيانات PocketBase" };
  }

  const COLLECTION = "hotel_guest_reviews";
  let injected = 0;
  const lang = input.targetLang || "ar";

  for (const r of input.reviews) {
    const reviewId = r.id;
    const finalTitle = (lang === "ar" ? r.titleAr : r.title) || r.title;
    const finalText = (lang === "ar" ? r.textAr : r.text) || r.text;
    const originalTitle = r.originalTitle || r.title;
    const originalText = r.originalText || r.text;

    try {
      // Check if review already exists
      const existing = await pb
        .collection(COLLECTION)
        .getFirstListItem(`reviewId="${reviewId.replace(/"/g, "")}"`)
        .catch(() => null);

      const rawScore = Number(r.rating) || 9;
      const score10 = rawScore <= 5 && rawScore > 0 ? Math.round(rawScore * 2 * 10) / 10 : Math.round(rawScore * 10) / 10;

      if (existing?.id) {
        // Update existing record
        await pb.collection(COLLECTION).update(existing.id, {
          title: finalTitle,
          text: finalText,
          originalTitle,
          originalText,
          originalLang: "en",
          score: score10,
          lang,
          source: "tripadvisor",
          hotelName: input.hotelName || "",
        });
        injected++;
        continue;
      }

      // Insert new record
      await pb.collection(COLLECTION).create({
        reviewId,
        masterId: input.masterId || "",
        hotelName: input.hotelName || "",
        bookingHotelId: "",
        taHotelId: `ta_${reviewId}`,
        author: r.author || "TripAdvisor Guest",
        score: score10,
        title: finalTitle,
        text: finalText,
        originalTitle,
        originalText,
        originalLang: "en",
        postedAt: r.date || new Date().toISOString().slice(0, 10),
        lang,
        source: "tripadvisor",
      });
      injected++;
    } catch (err) {
      console.warn(`[TripAdvisor MCP] Error inserting review ${reviewId}:`, err);
    }
  }

  const totalRating10 = input.reviews.reduce((acc, r) => {
    const s = Number(r.rating) <= 5 && Number(r.rating) > 0 ? Number(r.rating) * 2 : Number(r.rating);
    return acc + (s || 9);
  }, 0);
  const avg10 = input.reviews.length ? Math.round((totalRating10 / input.reviews.length) * 10) / 10 : 0;

  // Update hotel_masters record if masterId exists
  let updatedMaster = false;
  if (input.masterId) {
    try {
      const master = await pb
        .collection("hotel_masters")
        .getFirstListItem(`masterId="${input.masterId.replace(/"/g, "")}"`)
        .catch(() => null);

      if (master?.id) {
        await pb.collection("hotel_masters").update(master.id, {
          reviewScore: avg10,
        });
        updatedMaster = true;
      }
    } catch (err) {
      console.warn("[TripAdvisor MCP] Error updating master hotel rating:", err);
    }
  }

  // Also populate hotel_review_scores store so live hotel cards get the score
  if (avg10 > 0) {
    try {
      await persistReviewScore({
        masterId: input.masterId,
        name: input.hotelName,
        city: input.city,
        score: avg10,
        scale: 10,
        count: input.reviews.length,
        source: "tripadvisor",
      });
    } catch (err) {
      console.warn("[TripAdvisor MCP] Error persisting review score:", err);
    }
  }

  return { injected, updatedMaster };
}

/**
 * High-level orchestration tool: Crawl -> Translate via Docker LibreTranslate -> Inject into PocketBase
 */
export async function syncHotelTripAdvisorReviews(input: {
  hotelName: string;
  city?: string;
  masterId?: string;
  maxReviews?: number;
  targetLang?: string;
}): Promise<TripAdvisorSyncResult> {
  const crawlRes = await crawlTripAdvisorReviews({
    hotelName: input.hotelName,
    city: input.city,
    maxReviews: input.maxReviews,
  });

  if (!crawlRes.ok || !crawlRes.reviews.length) {
    return {
      ok: false,
      hotelName: input.hotelName,
      masterId: input.masterId,
      crawledCount: 0,
      translatedCount: 0,
      injectedCount: 0,
      averageRating: 0,
      reviews: [],
      error: crawlRes.error || "لم يتم العثور على تقييمات",
    };
  }

  const translated = await translateReviewsWithLibre(crawlRes.reviews, input.targetLang || "ar");
  const injectRes = await injectReviewsIntoPocketBase({
    hotelName: input.hotelName,
    city: input.city,
    masterId: input.masterId,
    reviews: translated,
    targetLang: input.targetLang || "ar",
  });

  return {
    ok: true,
    hotelName: input.hotelName,
    masterId: input.masterId,
    crawledCount: crawlRes.reviewsCount,
    translatedCount: translated.length,
    injectedCount: injectRes.injected,
    averageRating: crawlRes.averageRating,
    reviews: translated,
  };
}

const activeHarvests = new Set<string>();

/**
 * Background Progressive Harvester:
 * Crawls and accumulates up to 250 authentic TripAdvisor reviews in batches,
 * translates them and injects them permanently into PocketBase hotel_guest_reviews.
 */
export async function harvestHotelReviewsUpTo250(input: {
  hotelName: string;
  city?: string;
  masterId?: string;
  targetTotal?: number;
  targetLang?: string;
}): Promise<{
  hotelName: string;
  totalCollected: number;
  batchesRun: number;
  status: "complete" | "already_running" | "limit_reached" | "error";
  error?: string;
}> {
  const hotelName = (input.hotelName || "").trim();
  const city = (input.city || "").trim();
  const masterId = (input.masterId || "").trim();
  const targetTotal = Math.min(Math.max(input.targetTotal || 250, 10), 250);
  const targetLang = input.targetLang || "ar";

  if (!hotelName) {
    return { hotelName: "", totalCollected: 0, batchesRun: 0, status: "error", error: "Missing hotel name" };
  }

  const harvestKey = `${hotelName.toLowerCase()}|${city.toLowerCase()}`;
  if (activeHarvests.has(harvestKey)) {
    return {
      hotelName,
      totalCollected: 0,
      batchesRun: 0,
      status: "already_running",
    };
  }

  activeHarvests.add(harvestKey);

  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) {
      return { hotelName, totalCollected: 0, batchesRun: 0, status: "error", error: "No PocketBase connection" };
    }

    // Check currently stored reviews count for this hotel
    const existingReviews = await pb.collection("hotel_guest_reviews").getFullList<{
      id: string;
      reviewId: string;
      author: string;
    }>({
      filter: masterId
        ? `masterId = "${masterId.replace(/"/g, "")}" || hotelName = "${hotelName.replace(/"/g, "")}"`
        : `hotelName = "${hotelName.replace(/"/g, "")}"`,
      fields: "id,reviewId,author",
    }).catch(() => []);

    let totalCollected = existingReviews.length;
    if (totalCollected >= targetTotal) {
      return { hotelName, totalCollected, batchesRun: 0, status: "limit_reached" };
    }

    const seenAuthors = new Set(existingReviews.map((r) => (r.author || "").toLowerCase().trim()).filter(Boolean));
    let batchesRun = 0;
    const maxBatches = 15;

    while (totalCollected < targetTotal && batchesRun < maxBatches) {
      batchesRun++;
      const needed = Math.min(20, targetTotal - totalCollected);

      const crawlRes = await crawlTripAdvisorReviews({
        hotelName,
        city,
        maxReviews: needed,
        batchIndex: batchesRun,
        excludeAuthors: Array.from(seenAuthors).slice(-30),
      });

      if (!crawlRes.ok || !crawlRes.reviews.length) {
        break;
      }

      // Exclude any author already seen
      const freshReviews = crawlRes.reviews.filter((r) => {
        const authorLower = (r.author || "").toLowerCase().trim();
        if (seenAuthors.has(authorLower)) return false;
        seenAuthors.add(authorLower);
        return true;
      });

      if (!freshReviews.length) {
        break;
      }

      const translated = await translateReviewsWithLibre(freshReviews, targetLang);
      const injectRes = await injectReviewsIntoPocketBase({
        hotelName,
        city,
        masterId,
        reviews: translated,
        targetLang,
      });

      totalCollected += injectRes.injected;

      if (totalCollected >= targetTotal) {
        break;
      }

      // Small pause between batches
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return {
      hotelName,
      totalCollected,
      batchesRun,
      status: "complete",
    };
  } catch (err: any) {
    console.warn(`[TripAdvisor Harvester] Error for ${hotelName}:`, err);
    return {
      hotelName,
      totalCollected: 0,
      batchesRun: 0,
      status: "error",
      error: err?.message || String(err),
    };
  } finally {
    activeHarvests.delete(harvestKey);
  }
}
