/**
 * Dedicated Autonomous TripAdvisor Reviews Agent
 * Scans PocketBase hotel_masters for properties needing guest reviews,
 * orchestrates the TripAdvisor Reviews MCP server to crawl real reviews,
 * translates them via local Docker LibreTranslate, and injects them permanently.
 */

import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { callBuiltinTool } from "@/lib/server/mcp/builtin";

export interface ReviewAgentRunOptions {
  batchSize?: number;
  specificHotelId?: string;
  specificHotelName?: string;
  city?: string;
  targetLang?: string;
  dryRun?: boolean;
}

export interface ReviewAgentHotelSummary {
  masterId: string;
  hotelName: string;
  city: string;
  reviewsCreated: number;
  translatedCount: number;
  averageRating: number;
  status: "success" | "skipped" | "failed";
  error?: string;
}

export interface ReviewAgentRunResult {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  hotelsProcessed: number;
  totalReviewsInjected: number;
  totalReviewsTranslated: number;
  details: ReviewAgentHotelSummary[];
  error?: string;
}

let lastAgentRunResult: ReviewAgentRunResult | null = null;
let isAgentRunning = false;

export function getTripAdvisorAgentStatus(): {
  isRunning: boolean;
  lastRun: ReviewAgentRunResult | null;
} {
  return {
    isRunning: isAgentRunning,
    lastRun: lastAgentRunResult,
  };
}

/**
 * Runs the autonomous TripAdvisor Reviews Agent
 */
export async function runTripAdvisorReviewsAgent(
  options: ReviewAgentRunOptions = {}
): Promise<ReviewAgentRunResult> {
  if (isAgentRunning) {
    return {
      ok: false,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: 0,
      hotelsProcessed: 0,
      totalReviewsInjected: 0,
      totalReviewsTranslated: 0,
      details: [],
      error: "وكيل التقييمات قيد التشغيل بالفعل حالياً",
    };
  }

  isAgentRunning = true;
  const startedAt = new Date();
  const batchSize = Math.min(Math.max(options.batchSize || 5, 1), 25);
  const targetLang = options.targetLang || "ar";

  const details: ReviewAgentHotelSummary[] = [];
  let totalReviewsInjected = 0;
  let totalReviewsTranslated = 0;

  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) {
      throw new Error("تعذر الاتصال بقاعدة بيانات PocketBase الرئيسية");
    }

    // Determine target hotels
    const hotelsToProcess: Array<{ masterId: string; name: string; city: string }> = [];

    if (options.specificHotelName) {
      hotelsToProcess.push({
        masterId: options.specificHotelId || "",
        name: options.specificHotelName,
        city: options.city || "Istanbul",
      });
    } else {
      // Find hotels from hotel_masters that have 0 reviews or low/no reviewScore
      try {
        const mastersList = await pb.collection("hotel_masters").getList(1, batchSize, {
          filter: "status != 'inactive'",
          sort: "created",
        });

        for (const item of mastersList.items) {
          const hotelName = String(item.name || item.nameAr || "");
          if (!hotelName) continue;

          // Check if this hotel already has reviews in hotel_guest_reviews
          const existingReviews = await pb
            .collection("hotel_guest_reviews")
            .getList(1, 1, {
              filter: `masterId = "${item.masterId}" || taHotelId ~ "${item.masterId}"`,
            })
            .catch(() => ({ totalItems: 0 }));

          if (existingReviews.totalItems === 0) {
            hotelsToProcess.push({
              masterId: item.masterId || item.id,
              name: hotelName,
              city: item.city || "Istanbul",
            });
          }
        }
      } catch (err) {
        console.warn("[Reviews Agent] Error querying hotel_masters:", err);
      }
    }

    // Fallback if no hotels qualified (enrich top showcase hotels)
    if (hotelsToProcess.length === 0) {
      hotelsToProcess.push(
        { masterId: "m_ciragan_kempinski", name: "Ciragan Palace Kempinski Istanbul", city: "Istanbul" },
        { masterId: "m_raffles_istanbul", name: "Raffles Istanbul Zorlu Center", city: "Istanbul" },
        { masterId: "m_mardan_palace", name: "Titanic Mardan Palace Antalya", city: "Antalya" }
      );
    }

    // Process each hotel using TripAdvisor Reviews MCP
    for (const hotel of hotelsToProcess) {
      try {
        const mcpRes = await callBuiltinTool(
          "liotrip-tripadvisor-reviews",
          "tripadvisor.sync_hotel",
          {
            hotelName: hotel.name,
            city: hotel.city,
            masterId: hotel.masterId,
            targetLang,
          }
        );

        if (!mcpRes.ok) {
          details.push({
            masterId: hotel.masterId,
            hotelName: hotel.name,
            city: hotel.city,
            reviewsCreated: 0,
            translatedCount: 0,
            averageRating: 0,
            status: "failed",
            error: mcpRes.error || "فشل استدعاء أداة MCP",
          });
          continue;
        }

        const parsed = JSON.parse(mcpRes.content);
        const injected = Number(parsed.injectedCount) || 0;
        const translated = Number(parsed.translatedCount) || 0;
        const avg = Number(parsed.averageRating) || 0;

        totalReviewsInjected += injected;
        totalReviewsTranslated += translated;

        details.push({
          masterId: hotel.masterId,
          hotelName: hotel.name,
          city: hotel.city,
          reviewsCreated: injected,
          translatedCount: translated,
          averageRating: avg,
          status: "success",
        });
      } catch (err: any) {
        details.push({
          masterId: hotel.masterId,
          hotelName: hotel.name,
          city: hotel.city,
          reviewsCreated: 0,
          translatedCount: 0,
          averageRating: 0,
          status: "failed",
          error: err.message || String(err),
        });
      }
    }

    const finishedAt = new Date();
    const result: ReviewAgentRunResult = {
      ok: true,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      hotelsProcessed: details.length,
      totalReviewsInjected,
      totalReviewsTranslated,
      details,
    };

    lastAgentRunResult = result;
    return result;
  } catch (error: any) {
    const finishedAt = new Date();
    const result: ReviewAgentRunResult = {
      ok: false,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      hotelsProcessed: details.length,
      totalReviewsInjected,
      totalReviewsTranslated,
      details,
      error: error.message || String(error),
    };
    lastAgentRunResult = result;
    return result;
  } finally {
    isAgentRunning = false;
  }
}
