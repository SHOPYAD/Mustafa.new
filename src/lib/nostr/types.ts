/**
 * Nostr Types & Travel Community Taxonomies
 * Lonaliza Luxury Travel Platform
 */

export interface NostrRelayConfig {
  url: string;
  name: string;
  active: boolean;
  isDefault?: boolean;
  canRead?: boolean;
  canWrite?: boolean;
  read?: boolean;
  write?: boolean;
  pingMs?: number;
  lastChecked?: string;
}

export interface NostrMediaServerConfig {
  url: string;
  name: string;
  active: boolean;
  isDefault?: boolean;
}

export interface TravelCategory {
  id: string;
  slug: string;
  nameAr?: string;
  nameEn?: string;
  nameTr?: string;
  nameFr?: string;
  name?: { ar: string; en: string; tr: string; fr: string };
  icon?: string;
  color?: string;
  tag?: string;
  order?: number;
  active?: boolean;
}

export interface TravelDestination {
  id?: string;
  slug?: string;
  countryCode?: string;
  countryNameAr?: string;
  countryNameEn?: string;
  country?: string;
  cityAr?: string;
  cityEn?: string;
  name?: { ar: string; en: string; tr: string; fr: string };
  popular?: boolean;
  active?: boolean;
}

export interface CommunityPointsConfig {
  enabled: boolean;
  // Confirmed Lonaliza Customers (عملاء بحجز مؤكد في لوناليزا)
  pointsPerPost: number;
  pointsPerPhoto?: number;
  pointsPerPhotoPost?: number;
  pointsPerReel: number;
  pointsPerComment: number;
  pointsPerReview?: number;
  pointsPerLike: number;
  pointsPerShare?: number;
  pointsPerBookingShare?: number;

  // Community-Only Travelers (أعضاء المجتمع بدون حجز مسبق في لوناليزا)
  guestPointsPerPost?: number;
  guestPointsPerPhoto?: number;
  guestPointsPerReel?: number;
  guestPointsPerComment?: number;
  guestPointsPerLike?: number;

  // Caps & Limits (حدود كسب النقاط لحماية أرباح وهوامش المنصة)
  dailyEarnCap?: number;
  dailyCapPoints?: number;
  weeklyEarnCap?: number;
  monthlyEarnCap?: number;
  maxPostsPerDay?: number;
  maxReelsPerDay?: number;
  minCooldownSeconds?: number;
  cooldownMinutes?: number;
  pointsPerUsd?: number;

  // Engagement Threshold Rules for Earning Points on Publishing (شروط تفاعل الجمهور لربح نقاط النشر)
  requireEngagementForPoints?: boolean; // شرط وصول المنشور لتفاعل الجمهور المحدد قبل منح النقاط
  minLikesForPoints?: number; // الحد الأدنى للإعجابات (افتراضياً 50)
  minCommentsForPoints?: number; // الحد الأدنى للتعليقات (افتراضياً 10)
}

export interface CommunityLevelTier {
  level?: number;
  id: string;
  nameAr?: string;
  nameEn?: string;
  nameTr?: string;
  nameFr?: string;
  name?: { ar: string; en?: string; tr?: string; fr?: string };
  minPoints: number;
  badge?: string;
  badgeIcon?: string;
  badgeColor?: string;
  perks?: { ar: string; en?: string; tr?: string; fr?: string };
  rewardMultiplier?: number;
  bookingDiscountUsdBonus?: number;
}

export interface NostrSocialSettings {
  relays: NostrRelayConfig[];
  mediaServers: any[];
  categories: TravelCategory[];
  destinations: TravelDestination[];
  pointsConfig: CommunityPointsConfig;
  tiers: CommunityLevelTier[];
  moderation: {
    strictTourismFilter?: boolean;
    aiAutoModeration?: boolean;
    blockProfanity?: boolean;
    blockNonTourism?: boolean;
    aiSensitivity?: "strict" | "balanced" | "lenient";
    tourismKeywords?: string[];
    blacklistedKeywords?: string[];
    mutedPubkeys?: string[];
    hiddenEventIds?: string[];
    bannedKeywords?: string[];
    requireApproval?: boolean;
  };
}

export interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}

export interface ParsedTravelPost {
  id: string;
  pubkey: string;
  npub?: string;
  created_at: number;
  content: string;
  translatedContent?: string;
  isTranslated?: boolean;
  detectedLang?: string;
  category?: string;
  categoryName?: string;
  location?: string;
  country?: string;
  city?: string;
  destination?: string;
  rating?: number;
  images: string[];
  videos?: string[];
  videoUrl?: string;
  videoPoster?: string;
  isVideo?: boolean;
  isReel?: boolean;
  authorName?: string;
  authorAvatar?: string;
  authorNip05?: string;
  author: {
    pubkey?: string;
    name: string;
    avatar?: string;
    tier?: string;
  };
  likesCount: number;
  commentsCount: number;
  comments?: CommunityComment[];
  repostsCount?: number;
  viewsCount?: number;
  hasLiked?: boolean;
  userHasLiked?: boolean;
  hasBookmarked?: boolean;
  tags?: string[];
  booking?: {
    id: string;
    type: string;
    typeLabel?: string;
    title: string;
    destination?: string;
    date?: string;
    verified?: boolean;
    price?: number;
    currency?: string;
  };
  authorIsAdmin?: boolean;
  sharesCount?: number;
  sharedService?: {
    id: string;
    type: "package" | "hotel" | "flight" | "car" | "tour" | string;
    typeLabel?: string;
    title: string;
    destination?: string;
    price?: number | string;
    currency?: string;
    imageUrl?: string;
    url?: string;
  };
  pointsAwarded?: boolean;
  eligiblePoints?: number;
  authorUserId?: string;
  kind?: "post" | "moment" | "reel";
  bookingId?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  authorTier?: string;
  text: string;
  createdAt: number;
  likesCount: number;
  userHasLiked?: boolean;
  parentId?: string;
  replyToName?: string;
}

export interface TravelReelItem {
  id: string;
  eventId?: string;
  pubkey: string;
  authorName?: string;
  authorAvatar?: string;
  author: {
    pubkey?: string;
    name: string;
    avatar?: string;
  };
  videoUrl: string;
  posterUrl?: string;
  title: string;
  translatedTitle?: string;
  description: string;
  translatedDesc?: string;
  category: string;
  location?: string;
  destination?: string;
  rating?: number;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  sharesCount?: number;
  created_at: number;
  hasLiked?: boolean;
  hasBookmarked?: boolean;
}
