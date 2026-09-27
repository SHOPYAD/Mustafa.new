import { NextResponse } from "next/server";
import {
  listStoredCommunityPosts,
  purgeNonTravelCommunityPosts,
} from "@/lib/server/community-feed-store";
import { attachReelViewCounts } from "@/lib/server/reel-views-store";
import type { ParsedTravelPost } from "@/lib/nostr/types";
import {
  canonicalMediaKey,
  isTravelEligibleContent,
} from "@/lib/community/travel-content-filter";

export const runtime = "nodejs";

const CURATED_DEMO_POSTS: ParsedTravelPost[] = [
  {
    id: "nostr_travel_post_001",
    pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
    content: "إقامة استثنائية في اسطنبول! الإطلالة على مضيق البوسفور من الفندق لا تُنسى، وجولة اليخت الخاص وقت الغروب كانت قمة في الروعة والتنظيم الفاخر مع لوناليزا. أنصح كل زائر باختيار الغرف المطلة على البوسفور مباشرة. ✨🇹🇷\n\n#اسطنبول #تركيا #لوناليزا #سياحة_فاخرة #البوسفور",
    created_at: Math.floor(Date.now() / 1000) - 3600,
    category: "hotels",
    categoryName: "الفنادق والمنتجعات",
    destination: "اسطنبول",
    rating: 5,
    images: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1000&q=80",
    ],
    likesCount: 38,
    commentsCount: 6,
    userHasLiked: false,
    author: {
      pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
      name: "أحمد بن سلطان",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AhmedSultan",
      tier: "Gold VIP Traveler",
    },
  },
  {
    id: "nostr_travel_post_002",
    pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
    content: "رحلتنا إلى طرابزون ومرتفعات أوزنجول الساحرة! الأكواخ الخشبية وسط الغيوم وتدفق الشلالات تجربة خيالية للأسر. السائق الخاص من لوناليزا كان خبيراً ودوداً ومرشداً سياحياً محترفاً بأعلى المقاييس. 🏔️🌲\n\n#طرابزون #اوزنجول #شمال_تركي #سياحة",
    created_at: Math.floor(Date.now() / 1000) - 14400,
    category: "tours",
    categoryName: "الجولات والبرامج السياحية",
    destination: "طرابزون",
    rating: 5,
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80",
    ],
    likesCount: 52,
    commentsCount: 11,
    userHasLiked: false,
    author: {
      pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
      name: "سارة المهندي",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SaraM",
      tier: "Platinum Globetrotter",
    },
  },
  {
    id: "nostr_travel_post_003",
    pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
    content: "خدمة سيارة مرسيدس فيانو VIP مع سائق خاص يتحدث العربية في اسطنبول وبورصة. دقة المواعيد وسرعة التوصيل وراحة السيارة مع شاشة وواي فاي جعلت الرحلة ممتعة بدون أي إرهاق. 🚘✨\n\n#سيارات_VIP #ترانسفير #اسطنبول #خدمات_فاخرة",
    created_at: Math.floor(Date.now() / 1000) - 28800,
    category: "transfers",
    categoryName: "الترانسفير والسيارات الخاصة",
    destination: "بورصة",
    rating: 5,
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
    ],
    likesCount: 24,
    commentsCount: 3,
    userHasLiked: false,
    author: {
      pubkey: "npub1vipguest5554443332221110009998887776665554443332221110009998",
      name: "محمد العتيبي",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Otaibi",
      tier: "VIP Ambassador",
    },
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const destination = searchParams.get("destination");
    const kind = searchParams.get("kind");
    const reels = searchParams.get("reels");
    const authorUserId = searchParams.get("authorUserId") || searchParams.get("user");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    await purgeNonTravelCommunityPosts();
    const storedPosts = await listStoredCommunityPosts();

    // Combine stored user posts first (newest on top), followed by curated posts
    const allPostsMap = new Map<string, ParsedTravelPost>();

    for (const post of storedPosts) {
      allPostsMap.set(post.id, post);
    }
    for (const post of CURATED_DEMO_POSTS) {
      if (!allPostsMap.has(post.id)) {
        allPostsMap.set(post.id, post);
      }
    }

    let results = Array.from(allPostsMap.values()).filter((p) => {
      const videoUrl = p.videos?.[0] || p.videoUrl;
      const isVideo = Boolean(p.isReel || p.isVideo || p.kind === "reel" || videoUrl);
      if (!isVideo) return true;
      return isTravelEligibleContent({
        content: p.content,
        tags: p.tags,
        category: p.category,
        destination: p.destination,
        source: "local",
      });
    });

    // Filter by category if requested
    if (category && category !== "all") {
      results = results.filter((p) => p.category === category || p.categoryName === category);
    }

    if (destination && destination !== "all") {
      results = results.filter((p) => p.destination === destination);
    }
    if (kind === "moment") {
      results = results.filter((p) => p.kind === "moment");
    }
    if (reels === "1") {
      results = results.filter(
        (p) =>
          Boolean(p.isReel || p.isVideo || p.kind === "reel" || p.videoUrl) ||
          (Array.isArray(p.videos) && p.videos.length > 0),
      );
    }
    if (authorUserId) {
      results = results.filter((p) => p.authorUserId === authorUserId);
    }

    // Sort descending by created_at
    results.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

    if (reels === "1") {
      const seenMedia = new Set<string>();
      results = results.filter((p) => {
        const key = canonicalMediaKey(p.videos?.[0] || p.videoUrl || "") || p.id;
        if (seenMedia.has(key)) return false;
        seenMedia.add(key);
        return true;
      });
    }

    const withViews = await attachReelViewCounts(results.slice(0, limit));

    return NextResponse.json({
      ok: true,
      posts: withViews,
      total: results.length,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
