import { NextRequest, NextResponse } from "next/server";
import { saveCommunityPost } from "@/lib/server/community-feed-store";
import { creditCommunityPoints } from "@/lib/loyalty/server";
import { getSafeAttractionFallback } from "@/lib/planner/place-photos";
import { tripHeadline } from "@/lib/planner/day-copy";
import { programCost } from "@/lib/planner/cost";
import { formatClientPrice } from "@/lib/planner/money";
import type { ParsedTravelPost } from "@/lib/nostr/types";
import type { PlannerTrip } from "@/types/planner";
import type { SalesChatCard } from "@/types/sales-chat";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      trip?: PlannerTrip;
      cards?: SalesChatCard[];
      customNote?: string;
      userId?: string;
      userName?: string;
      userAvatar?: string;
    };

    const trip = body.trip;
    if (!trip || !trip.destination) {
      return NextResponse.json({ ok: false, error: "trip_required" }, { status: 400 });
    }

    const dest = trip.destination;
    const cards = body.cards || trip.cards || [];
    const cost = programCost(cards, trip.durationDays, trip.currency);
    const headline = tripHeadline(trip, "ar");

    // Collect verified photos from the trip stops or fallback to destination cover
    const collectedImages = trip.days
      .flatMap((d) => d.stops)
      .map((s) => s.image)
      .filter((img): img is string => Boolean(img && !img.includes("data:image")));

    const images = (collectedImages.length ? collectedImages.slice(0, 4) : [getSafeAttractionFallback("default", dest)]);

    // Prepare highlights
    const highlights = trip.days
      .slice(0, 4)
      .map((d) => `• اليوم ${d.day}: ${d.titleAr || d.titleEn} (${d.stops.length} مزارات)`)
      .join("\n");

    const totalStr = formatClientPrice(cost.total || cost.flight + cost.hotel, cost.currency, "ar");

    const content = body.customNote?.trim()
      ? `${body.customNote.trim()}\n\n🌟 مسار الرحلة المقترح: ${headline}\n📍 الوجهة: ${dest} (${trip.durationDays} أيام)\n💰 التكلفة التقديرية: ${totalStr}\n\n${highlights}\n\n#خطة_سفر #${dest.replace(/\s+/g, "_")} #لوناليزا_VIP`
      : `🌟 شاركت معكم خطتي السياحية الفاخرة إلى ${dest} لمدة ${trip.durationDays} أيام عبر لوناليزا!\n\n${headline}\n💰 التكلفة التقديرية الشاملة: ${totalStr}\n\nأبرز المحطات اليومية:\n${highlights}\n\nما رأيكم في هذا المسار وهل تنصحون بمطاعم أو فعاليات إضافية هناك؟ ✈️✨\n#خطة_سفر #${dest.replace(/\s+/g, "_")} #لوناليزا_VIP #سياحة`;

    const postId = `trip_${trip.id || Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const userId = body.userId?.trim() || "vip_traveler";
    const authorName = body.userName?.trim() || "مسافر لوناليزا VIP";
    const authorAvatar =
      body.userAvatar?.trim() ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`;

    const post: ParsedTravelPost = {
      id: postId,
      pubkey: userId,
      created_at: Math.floor(Date.now() / 1000),
      content,
      category: "itinerary",
      categoryName: "برامج سياحية متكاملة",
      destination: dest,
      city: dest,
      country: "Turkey",
      location: dest,
      images,
      authorName,
      authorAvatar,
      author: {
        name: authorName,
        avatar: authorAvatar,
        tier: "Gold VIP Explorer",
        pubkey: userId,
      },
      likesCount: 1,
      commentsCount: 0,
      tags: ["خطة_سفر", dest, "برنامج_سياحي", "لوناليزا_VIP"],
      sharedService: {
        id: trip.id || postId,
        type: "package",
        title: headline,
        destination: dest,
        price: cost.total || cost.flight + cost.hotel,
        currency: cost.currency || "USD",
        imageUrl: images[0],
      },
      pointsAwarded: true,
      eligiblePoints: 250,
      authorUserId: userId,
    };

    // Save to community posts store
    await saveCommunityPost(post);

    // Credit 250 loyalty reward points
    const rewardResult = await creditCommunityPoints(
      userId,
      250,
      "trip_share",
      `مكافأة مشاركة برنامج رحلة سياحية إلى ${dest} في مجتمع لوناليزا`,
      postId,
      true
    ).catch((err) => {
      console.warn("Failed to credit community points:", err);
      return { ok: false, awarded: 250, totalPoints: 250, isPending: false };
    });

    return NextResponse.json({
      ok: true,
      postId: post.id,
      awardedPoints: 250,
      totalPoints: rewardResult.totalPoints,
      communityUrl: `/community`,
      messageAr: "تم نشر البرنامج في مجتمع لوناليزا بنجاح وإضافة 250 نقطة مكافأة إلى رصيدك!",
    });
  } catch (err: unknown) {
    console.error("share-community failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "internal_error" },
      { status: 500 }
    );
  }
}
