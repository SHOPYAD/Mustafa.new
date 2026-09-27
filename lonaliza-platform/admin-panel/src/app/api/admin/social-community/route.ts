import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getNostrSocialSettings,
  updateNostrSocialSettings,
} from "@/lib/server/nostr-social-store";
import type { NostrSocialSettings } from "@/lib/nostr/types";
import { listStoredCommunityPosts } from "@/lib/server/community-feed-store";
import { getLoyaltyStore } from "@/lib/loyalty/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const settings = await getNostrSocialSettings();
  const posts = await listStoredCommunityPosts().catch(() => []);
  const loyalty = await getLoyaltyStore().catch(() => ({ settings: null, coupons: [], wallets: [], redemptions: [] }));

  // Calculate real metrics directly from database
  const totalPosts = posts.length;
  const reelsPosts = posts.filter((p) => (p.videos && p.videos.length > 0) || p.isReel);
  const photoPosts = posts.filter((p) => p.images && p.images.length > 0 && !p.isReel && (!p.videos || p.videos.length === 0));
  const writtenPosts = posts.filter((p) => (!p.videos || p.videos.length === 0) && (!p.images || p.images.length === 0));

  const totalReels = reelsPosts.length;
  const totalPhotos = photoPosts.length;
  const totalWritten = writtenPosts.length;

  // Active travelers: unique pubkeys or authors
  const travelerSet = new Set<string>();
  posts.forEach((p) => {
    if (p.pubkey) travelerSet.add(p.pubkey);
    if (p.author?.pubkey) travelerSet.add(p.author.pubkey);
    if (p.authorName) travelerSet.add(p.authorName);
  });
  if (Array.isArray(loyalty.wallets)) {
    loyalty.wallets.forEach((w) => {
      if (w.userId) travelerSet.add(w.userId);
    });
  }
  const activeTravelers = Math.max(travelerSet.size, 1);

  // Real loyalty points awarded & discounts redeemed
  let walletPoints = 0;
  let redeemedUsd = 0;
  if (Array.isArray(loyalty.wallets)) {
    for (const w of loyalty.wallets) {
      walletPoints += (w.points || 0) + (w.pendingPoints || 0);
      if (Array.isArray(w.ledger)) {
        for (const entry of w.ledger) {
          if (entry.kind === "redeem") {
            redeemedUsd += entry.usdValue || ((entry.points || 0) / 100);
          }
        }
      }
    }
  }

  // Community interaction points generated
  const postPoints =
    totalReels * (settings.pointsConfig.pointsPerReel || 150) +
    totalPhotos * (settings.pointsConfig.pointsPerPhoto || 50) +
    totalWritten * (settings.pointsConfig.pointsPerReview || 100);
  const totalAwardedPoints = walletPoints + postPoints;

  // Real Content Ratios
  const reelsRatio = totalPosts > 0 ? Number(((totalReels / totalPosts) * 100).toFixed(1)) : 0;
  const photosRatio = totalPosts > 0 ? Number(((totalPhotos / totalPosts) * 100).toFixed(1)) : 0;
  const writtenRatio = totalPosts > 0 ? Number(((totalWritten / totalPosts) * 100).toFixed(1)) : 0;

  // Real Destination Distribution
  const destinationMap = new Map<string, { posts: number; reels: number; photos: number; points: number }>();
  
  // Seed recognized destination buckets
  const mainDests = [
    { key: "إسطنبول", name: "إسطنبول (Istanbul)" },
    { key: "طرابزون", name: "طرابزون وأوزنجول (Trabzon)" },
    { key: "كابادوكيا", name: "كابادوكيا والمناطيد (Cappadocia)" },
    { key: "أنطاليا", name: "أنطاليا والريفيرا (Antalya)" },
    { key: "بورصة", name: "بورصة وجبل أولوداغ (Bursa)" },
  ];

  mainDests.forEach((d) => {
    destinationMap.set(d.name, { posts: 0, reels: 0, photos: 0, points: 0 });
  });

  posts.forEach((p) => {
    const rawDest = (p.destination || "").trim();
    let matchedName = "إسطنبول (Istanbul)";
    if (/طرابزون|أوزنجول|اوزنجول|آيدر|ريزا/i.test(rawDest)) {
      matchedName = "طرابزون وأوزنجول (Trabzon)";
    } else if (/كابادوكيا|كبادوكيا|cappadocia/i.test(rawDest)) {
      matchedName = "كابادوكيا والمناطيد (Cappadocia)";
    } else if (/أنطاليا|انطاليا|antalya|بيليك|كيمير/i.test(rawDest)) {
      matchedName = "أنطاليا والريفيرا (Antalya)";
    } else if (/بورصة|بورصه|bursa|أولوداغ/i.test(rawDest)) {
      matchedName = "بورصة وجبل أولوداغ (Bursa)";
    } else if (/إسطنبول|اسطنبول|بوسفور|istanbul/i.test(rawDest)) {
      matchedName = "إسطنبول (Istanbul)";
    } else if (rawDest) {
      matchedName = rawDest;
    }

    const current = destinationMap.get(matchedName) || { posts: 0, reels: 0, photos: 0, points: 0 };
    current.posts += 1;
    if ((p.videos && p.videos.length > 0) || p.isReel) current.reels += 1;
    else if (p.images && p.images.length > 0) current.photos += 1;
    current.points += (p.likesCount || 1) * 25 + ((p.videos && p.videos.length > 0) ? 150 : 50);
    destinationMap.set(matchedName, current);
  });

  const topDestinations = Array.from(destinationMap.entries())
    .map(([name, data]) => ({
      name,
      posts: data.posts,
      reels: data.reels,
      photos: data.photos,
      points: data.points,
      percentage: totalPosts > 0 ? Number(((data.posts / totalPosts) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.posts - a.posts || b.points - a.points);

  // Total Interactions
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalComments = posts.reduce(
    (sum, p) => sum + (p.commentsCount || (p.comments ? p.comments.length : 0)),
    0
  );
  const totalVerifiedBookings = posts.filter((p) => p.booking?.verified === true).length;

  // Real Top Travelers Leaderboard
  const travelersMap = new Map<
    string,
    {
      name: string;
      avatar: string;
      pubkey: string;
      postsCount: number;
      reelsCount: number;
      totalPoints: number;
      tier: string;
    }
  >();

  posts.forEach((p) => {
    const key = p.pubkey || p.author?.pubkey || p.authorName || p.author?.name || "anonymous";
    const name =
      p.authorName ||
      p.author?.name ||
      (p.pubkey ? `${p.pubkey.slice(0, 10)}...` : "مسافر لوناليزا VIP");
    const avatar =
      p.authorAvatar ||
      p.author?.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    const isReel = (p.videos && p.videos.length > 0) || p.isReel;
    const pts =
      (isReel
        ? settings.pointsConfig.pointsPerReel || 150
        : settings.pointsConfig.pointsPerPhoto || 50) +
      (p.likesCount || 0) * 15;

    const existing = travelersMap.get(key) || {
      name,
      avatar,
      pubkey: key,
      postsCount: 0,
      reelsCount: 0,
      totalPoints: 0,
      tier: "مستكشف برونزي 🥉",
    };

    existing.postsCount += 1;
    if (isReel) existing.reelsCount += 1;
    existing.totalPoints += pts;
    travelersMap.set(key, existing);
  });

  const sortedTiers = [...(settings.tiers || [])].sort((a, b) => b.minPoints - a.minPoints);
  const topTravelers = Array.from(travelersMap.values())
    .map((t) => {
      const matched = sortedTiers.find((tier) => t.totalPoints >= tier.minPoints);
      if (matched && matched.nameAr) t.tier = matched.nameAr;
      return t;
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 6);

  // Real Recent Media Feed
  const recentMedia = posts
    .filter((p) => (p.videos && p.videos.length > 0) || (p.images && p.images.length > 0))
    .slice(0, 6)
    .map((p) => {
      const isReel = (p.videos && p.videos.length > 0) || p.isReel;
      return {
        id: p.id,
        type: isReel ? ("reel" as const) : ("photo" as const),
        mediaUrl: isReel ? p.videos![0] : p.images![0],
        content: p.content?.slice(0, 75) || "محتوى سياحي فاخر",
        destination: p.destination || "إسطنبول",
        authorName: p.authorName || p.author?.name || "مسافر لوناليزا",
        likes: p.likesCount || 0,
        createdAt: p.created_at || Math.floor(Date.now() / 1000),
      };
    });

  // Source Audit Details
  const databaseSourceAudit = {
    postsSourceFile: ".data/community-posts.json",
    postsCount: totalPosts,
    loyaltySourceFile: ".data/loyalty-store.json",
    walletsCount: Array.isArray(loyalty.wallets) ? loyalty.wallets.length : 0,
    settingsSourceFile: ".data/nostr-social-settings.json",
    activeRelaysCount: settings.relays.filter((r) => r.active).length,
    activeTiersCount: settings.tiers?.length || 0,
    blossomMediaServer: (settings as any).blossomServer || "https://blossom.primal.net",
    lastVerificationIso: new Date().toISOString(),
  };

  const stats = {
    totalPosts,
    totalReels,
    totalPhotos,
    totalWritten,
    totalLikes,
    totalComments,
    totalVerifiedBookings,
    activeTravelers,
    totalAwardedPoints,
    totalRedeemedUsd: Number(redeemedUsd.toFixed(2)),
    reelsRatio,
    photosRatio,
    writtenRatio,
    topDestinations,
    topTravelers,
    recentMedia,
    databaseSourceAudit,
  };

  return NextResponse.json({ ok: true, settings, stats });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as Partial<NostrSocialSettings>;
    const updated = await updateNostrSocialSettings(body);
    return NextResponse.json({ ok: true, settings: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 400 });
  }
}
