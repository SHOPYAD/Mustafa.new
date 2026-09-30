import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { getTripAdvisorAgentStatus, runTripAdvisorReviewsAgent } from "@/lib/automation/tripadvisor-reviews-agent";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

export const dynamic = "force-dynamic";

/**
 * GET: Returns status of TripAdvisor Reviews Autonomous Agent and DB review stats
 */
export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const status = getTripAdvisorAgentStatus();
    let totalTripAdvisorReviews = 0;
    let totalHotelsWithReviews = 0;

    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      try {
        const countRes = await pb.collection("hotel_guest_reviews").getList(1, 1, {
          filter: "source = 'tripadvisor'",
        });
        totalTripAdvisorReviews = countRes.totalItems;

        const allReviews = await pb.collection("hotel_guest_reviews").getList(1, 1);
        totalHotelsWithReviews = allReviews.totalItems;
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      agent: {
        id: "tripadvisor-reviews-autonomous-agent",
        nameAr: "وكيل تقييمات تريب أدفايزر الذكي المستقل",
        mcpServer: "liotrip-tripadvisor-reviews",
        translator: "Docker LibreTranslate (127.0.0.1:5000)",
        destinationDb: "PocketBase (hotel_guest_reviews)",
        ...status,
      },
      stats: {
        totalTripAdvisorReviews,
        totalReviewsAllSources: totalHotelsWithReviews,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to get TripAdvisor agent status" },
      { status: 500 }
    );
  }
}

/**
 * POST: Triggers the TripAdvisor Reviews Agent to crawl, translate, and inject reviews
 */
export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => ({}));
    const { batchSize, specificHotelName, specificHotelId, city, targetLang } = body;

    const result = await runTripAdvisorReviewsAgent({
      batchSize: typeof batchSize === "number" ? batchSize : 3,
      specificHotelName: typeof specificHotelName === "string" ? specificHotelName : undefined,
      specificHotelId: typeof specificHotelId === "string" ? specificHotelId : undefined,
      city: typeof city === "string" ? city : undefined,
      targetLang: typeof targetLang === "string" ? targetLang : "ar",
    });

    return NextResponse.json({
      ok: result.ok,
      message: result.ok
        ? `نجح وكيل التقييمات في معالجة ${result.hotelsProcessed} فنادق وحقن ${result.totalReviewsInjected} تقييماً مترجماً للعربية بنجاح!`
        : `واجه الوكيل تنبيهاً: ${result.error}`,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to execute TripAdvisor reviews agent" },
      { status: 500 }
    );
  }
}
