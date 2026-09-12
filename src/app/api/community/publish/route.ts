import { NextResponse } from "next/server";
import { saveCommunityPost } from "@/lib/server/community-feed-store";
import { getNostrSocialSettings } from "@/lib/server/nostr-social-store";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import type { ParsedTravelPost } from "@/lib/nostr/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      content,
      category = "hotels",
      categoryName,
      destination = "اسطنبول",
      rating = 5,
      images = [],
      videos = [],
      authorName = "مسافر لوناليزا VIP",
      authorAvatar,
      authorTier = "Gold VIP Traveler",
      authorPubkey,
      booking,
      sharedService,
      authorIsAdmin = false,
      kind,
      bookingId,
    } = body;

    if (!content?.trim() && (!Array.isArray(images) || images.length === 0) && (!Array.isArray(videos) || videos.length === 0) && !sharedService) {
      return NextResponse.json(
        { ok: false, error: "محتوى المنشور أو الوسائط أو الخدمة مطلوبة للنشر" },
        { status: 400 }
      );
    }

    const user = await getRequestCustomer(req);
    const settings = await getNostrSocialSettings();
    const pointsCfg = settings.pointsConfig;

    // Determine points earned (sharing verified booking or service awards bonus points)
    let awardedPoints = pointsCfg.pointsPerPost || 50;
    if (booking) {
      awardedPoints = pointsCfg.pointsPerBookingShare || 300;
    } else if (sharedService) {
      awardedPoints = pointsCfg.pointsPerShare || 200;
    } else if (videos && videos.length > 0) {
      awardedPoints = pointsCfg.pointsPerReel || 250;
    } else if (images && images.length > 0) {
      awardedPoints = pointsCfg.pointsPerPhoto || 100;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const pubkey = authorPubkey || `npub1user${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const authorUserId = user?.id || pubkey;

    const requireEngagement = Boolean(pointsCfg.requireEngagementForPoints ?? true);
    const minLikes = pointsCfg.minLikesForPoints ?? 50;
    const minComments = pointsCfg.minCommentsForPoints ?? 10;

    // Resolve category title
    const catObj = settings.categories.find((c) => c.slug === category);
    const resolvedCategoryName = categoryName || catObj?.nameAr || catObj?.name?.ar || category;

    const createdPost: ParsedTravelPost = {
      id: postId,
      pubkey,
      content: content ? content.trim() : (sharedService ? `مشاركة مميزة لخدمة: ${sharedService.title}` : ""),
      created_at: nowSec,
      category,
      categoryName: resolvedCategoryName,
      destination,
      rating: Number(rating) || 5,
      images: Array.isArray(images) ? images : [],
      videos: Array.isArray(videos) ? videos : [],
      likesCount: 1, // Author like
      commentsCount: 0,
      userHasLiked: true,
      booking: booking && typeof booking === "object" ? booking : undefined,
      sharedService: sharedService && typeof sharedService === "object" ? sharedService : undefined,
      authorIsAdmin: Boolean(authorIsAdmin),
      author: {
        pubkey,
        name: authorIsAdmin ? "إدارة المنصة العامة" : (authorName || "مسافر لوناليزا VIP"),
        avatar: authorIsAdmin ? "/favicon.png" : (authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${pubkey.slice(0, 10)}`),
        tier: authorIsAdmin ? "إدارة المنصة العامة (Official Admin)" : (authorTier || "Gold VIP Traveler"),
      },
      pointsAwarded: !requireEngagement,
      eligiblePoints: awardedPoints,
      authorUserId,
      kind: kind === "moment" ? "moment" : videos.length > 0 ? "reel" : "post",
      bookingId: bookingId ? String(bookingId) : booking?.id ? String(booking.id) : undefined,
      isReel: videos.length > 0 || kind === "reel",
      isVideo: videos.length > 0,
      videoUrl: Array.isArray(videos) && videos[0] ? String(videos[0]) : undefined,
    };

    // 1. Immediately save to persistent store so it is guaranteed to appear
    await saveCommunityPost(createdPost);

    // 2. Award loyalty points to user wallet ONLY if engagement condition is disabled
    if (!requireEngagement) {
      try {
        const { creditCommunityPoints } = await import("@/lib/loyalty/server");
        await creditCommunityPoints(
          authorUserId,
          awardedPoints,
          videos.length > 0 ? "reel" : images.length > 0 ? "photo" : "post",
          `مكافأة نشر تجربة سياحية في ${destination}`,
          postId
        );
      } catch {
        // Non-critical fallback
      }
    }

    // 3. Asynchronously propagate to active Nostr relays in background
    (async () => {
      try {
        const WebSocketModule = (await import("ws")).default;
        const activeRelays = settings.relays.filter((r) => r.active && r.canWrite !== false);
        const tags: string[][] = [
          ["t", "lonaliza"],
          ["t", "travel"],
          ["c", category],
          ["d", destination],
          ["rating", String(rating)],
        ];
        if (videos.length > 0) {
          tags.push(["t", "reels"]);
          tags.push(["video", videos[0]]);
        }
        images.forEach((img: string) => tags.push(["image", img]));

        const eventData = {
          id: postId,
          pubkey,
          created_at: nowSec,
          kind: videos.length > 0 ? 34235 : 1,
          tags,
          content: content.trim(),
        };

        const msg = JSON.stringify(["EVENT", eventData]);
        for (const relay of activeRelays) {
          try {
            const ws = new WebSocketModule(relay.url);
            ws.on("open", () => {
              ws.send(msg);
              setTimeout(() => {
                try { ws.close(); } catch {}
              }, 1500);
            });
            ws.on("error", () => {});
          } catch {}
        }
      } catch {}
    })();

    const message = requireEngagement
      ? `تم نشر مشاركتك بنجاح! ستُضاف النقاط (+${awardedPoints} نقطة) تلقائياً لمحفظتك فور وصول المنشور إلى تفاعل الجمهور المحدد (${minLikes} إعجاب و ${minComments} تعليقات).`
      : `تم نشر مشاركتك السياحية بنجاح واحتساب +${awardedPoints} نقطة في محفظتك!`;

    return NextResponse.json({
      ok: true,
      post: createdPost,
      awardedPoints: requireEngagement ? 0 : awardedPoints,
      eligiblePoints: awardedPoints,
      requireEngagement,
      minLikes,
      minComments,
      message,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
