import { promises as fs } from "fs";
import path from "path";
import type {
  NostrSocialSettings,
  NostrRelayConfig,
  TravelCategory,
  TravelDestination,
  CommunityPointsConfig,
  CommunityLevelTier,
} from "@/lib/nostr/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "nostr-social.json");

const DEFAULT_RELAYS: NostrRelayConfig[] = [
  {
    url: "wss://relay.primal.net",
    name: "Primal Relay (فائق السرعة والاستقرار)",
    active: true,
    isDefault: true,
    canRead: true,
    canWrite: true,
  },
  {
    url: "wss://relay.damus.io",
    name: "Damus Global Relay (عالمي رئيسي)",
    active: true,
    isDefault: true,
    canRead: true,
    canWrite: true,
  },
  {
    url: "wss://relay.nostr.band",
    name: "Nostr Band Indexer (فهرسة وبحث)",
    active: true,
    isDefault: true,
    canRead: true,
    canWrite: true,
  },
  {
    url: "wss://nos.today",
    name: "Nos Today Hub",
    active: true,
    isDefault: false,
    canRead: true,
    canWrite: true,
  },
];

const DEFAULT_MEDIA_SERVERS = [
  {
    url: "https://nostr.build",
    name: "Nostr.build (المعتمد الرئيسي للفيديوهات والصور)",
    active: true,
    isDefault: true,
  },
  {
    url: "https://blossom.primal.net",
    name: "Primal Blossom Server",
    active: true,
    isDefault: false,
  },
];

const DEFAULT_CATEGORIES: TravelCategory[] = [
  {
    id: "cat_hotels",
    slug: "hotels",
    nameAr: "فنادق ومنتجعات",
    nameEn: "Hotels & Resorts",
    nameTr: "Oteller ve Tatil Köyleri",
    nameFr: "Hôtels et Resorts",
    icon: "Hotel",
    color: "#059669",
    tag: "hotels",
    order: 1,
  },
  {
    id: "cat_tours",
    slug: "tours",
    nameAr: "رحلات وبرامج سياحية",
    nameEn: "Tours & Packages",
    nameTr: "Turlar ve Paketler",
    nameFr: "Circuits et Séjours",
    icon: "Compass",
    color: "#d97706",
    tag: "tours",
    order: 2,
  },
  {
    id: "cat_vip",
    slug: "vip-tours",
    nameAr: "تجارب ورحلات VIP",
    nameEn: "VIP Luxury Experiences",
    nameTr: "VIP Lüks Deneyimler",
    nameFr: "Expériences VIP",
    icon: "Crown",
    color: "#f59e0b",
    tag: "vip-tours",
    order: 3,
  },
  {
    id: "cat_cars",
    slug: "cars",
    nameAr: "سيارات مع سائق VIP",
    nameEn: "Chauffeur & VIP Transfers",
    nameTr: "Şoförlü VIP Araçlar",
    nameFr: "Voitures avec Chauffeur",
    icon: "Car",
    color: "#3b82f6",
    tag: "transfers",
    order: 4,
  },
  {
    id: "cat_flights",
    slug: "flights",
    nameAr: "طيران ومطارات",
    nameEn: "Flights & Airports",
    nameTr: "Uçuşlar ve Havalimanları",
    nameFr: "Vols et Aéroports",
    icon: "Plane",
    color: "#8b5cf6",
    tag: "flights",
    order: 5,
  },
  {
    id: "cat_activities",
    slug: "activities",
    nameAr: "أنشطة ومغامرات",
    nameEn: "Activities & Adventures",
    nameTr: "Aktiviteler ve Maceralar",
    nameFr: "Activités et Aventures",
    icon: "Mountain",
    color: "#ec4899",
    tag: "activities",
    order: 6,
  },
  {
    id: "cat_dining",
    slug: "dining",
    nameAr: "مطاعم وتجارب محلية",
    nameEn: "Dining & Lifestyle",
    nameTr: "Restoranlar ve Yaşam",
    nameFr: "Restaurants et Gastronomie",
    icon: "Utensils",
    color: "#14b8a6",
    tag: "dining",
    order: 7,
  },
];

const DEFAULT_DESTINATIONS: TravelDestination[] = [
  { id: "dest_ist", countryCode: "TR", countryNameAr: "تركيا", countryNameEn: "Turkey", cityAr: "إسطنبول", cityEn: "Istanbul", popular: true },
  { id: "dest_trz", countryCode: "TR", countryNameAr: "تركيا", countryNameEn: "Turkey", cityAr: "طرابزون والشمال التركي", cityEn: "Trabzon", popular: true },
  { id: "dest_bur", countryCode: "TR", countryNameAr: "تركيا", countryNameEn: "Turkey", cityAr: "بورصة وأولوداغ", cityEn: "Bursa", popular: true },
  { id: "dest_ant", countryCode: "TR", countryNameAr: "تركيا", countryNameEn: "Turkey", cityAr: "أنطاليا والريفييرا", cityEn: "Antalya", popular: true },
  { id: "dest_cap", countryCode: "TR", countryNameAr: "تركيا", countryNameEn: "Turkey", cityAr: "كابادوكيا والمناطيد", cityEn: "Cappadocia", popular: true },
  { id: "dest_bod", countryCode: "TR", countryNameAr: "تركيا", countryNameEn: "Turkey", cityAr: "بودروم ومارماريس", cityEn: "Bodrum", popular: true },
  { id: "dest_sap", countryCode: "TR", countryNameAr: "تركيا", countryNameEn: "Turkey", cityAr: "صبنجة والمعشوقية", cityEn: "Sapanca", popular: true },
  { id: "dest_dxb", countryCode: "AE", countryNameAr: "الإمارات", countryNameEn: "UAE", cityAr: "دبي", cityEn: "Dubai", popular: true },
  { id: "dest_auh", countryCode: "AE", countryNameAr: "الإمارات", countryNameEn: "UAE", cityAr: "أبوظبي", cityEn: "Abu Dhabi", popular: false },
  { id: "dest_ruh", countryCode: "SA", countryNameAr: "السعودية", countryNameEn: "Saudi Arabia", cityAr: "الرياض", cityEn: "Riyadh", popular: false },
  { id: "dest_ula", countryCode: "SA", countryNameAr: "السعودية", countryNameEn: "Saudi Arabia", cityAr: "العُلا", cityEn: "AlUla", popular: true },
];

const DEFAULT_POINTS_CONFIG: CommunityPointsConfig = {
  enabled: true,
  // Confirmed Lonaliza Customers (عملاء بحجز مؤكد في لوناليزا)
  pointsPerPost: 150,
  pointsPerPhoto: 100,
  pointsPerPhotoPost: 100,
  pointsPerReel: 250,
  pointsPerComment: 25,
  pointsPerLike: 5,
  pointsPerBookingShare: 300,

  // Community-only Travelers (أعضاء المجتمع بدون حجز مسبق في لوناليزا)
  guestPointsPerPost: 40,
  guestPointsPerPhoto: 30,
  guestPointsPerReel: 75,
  guestPointsPerComment: 10,
  guestPointsPerLike: 2,

  // Caps & Limits (حدود كسب النقاط لحماية المنصة)
  dailyEarnCap: 1000,
  dailyCapPoints: 1000,
  weeklyEarnCap: 5000,
  monthlyEarnCap: 15000,
  maxPostsPerDay: 5,
  maxReelsPerDay: 3,
  minCooldownSeconds: 60,
  cooldownMinutes: 1,
  pointsPerUsd: 100, // 100 pts = $1 USD discount

  // Engagement Threshold Rules for Earning Points on Publishing (شروط تفاعل الجمهور لربح نقاط النشر)
  requireEngagementForPoints: true, // تفعيل شرط تفاعل الجمهور لكسب نقاط النشر
  minLikesForPoints: 50, // 50 إعجاب
  minCommentsForPoints: 10, // 10 تعليقات
};

const DEFAULT_TIERS: CommunityLevelTier[] = [
  {
    level: 1,
    id: "bronze",
    nameAr: "مستكشف برونزي",
    nameEn: "Bronze Explorer",
    nameTr: "Bronz Kaşif",
    nameFr: "Explorateur Bronze",
    minPoints: 0,
    badgeIcon: "Compass",
    badgeColor: "#cd7f32",
    rewardMultiplier: 1.0,
  },
  {
    level: 2,
    id: "silver",
    nameAr: "مسافر فضي",
    nameEn: "Silver Voyager",
    nameTr: "Gümüş Gezgin",
    nameFr: "Voyageur Argent",
    minPoints: 500,
    badgeIcon: "Shield",
    badgeColor: "#94a3b8",
    rewardMultiplier: 1.1,
    bookingDiscountUsdBonus: 5,
  },
  {
    level: 3,
    id: "gold",
    nameAr: "رحالة ذهبي",
    nameEn: "Gold Globetrotter",
    nameTr: "Altın Seyyah",
    nameFr: "Globe-trotter Or",
    minPoints: 2000,
    badgeIcon: "Award",
    badgeColor: "#eab308",
    rewardMultiplier: 1.25,
    bookingDiscountUsdBonus: 15,
  },
  {
    level: 4,
    id: "platinum",
    nameAr: "نخبة السفر البلاتينية",
    nameEn: "Platinum Jetsetter",
    nameTr: "Platin Seçkin",
    nameFr: "Élite Platine",
    minPoints: 5000,
    badgeIcon: "Gem",
    badgeColor: "#06b6d4",
    rewardMultiplier: 1.5,
    bookingDiscountUsdBonus: 30,
  },
  {
    level: 5,
    id: "vip_ambassador",
    nameAr: "سفير لوناليزا VIP",
    nameEn: "Lonaliza VIP Ambassador",
    nameTr: "Lonaliza VIP Elçisi",
    nameFr: "Ambassadeur VIP Lonaliza",
    minPoints: 10000,
    badgeIcon: "Crown",
    badgeColor: "#f59e0b",
    rewardMultiplier: 2.0,
    bookingDiscountUsdBonus: 50,
  },
];

const DEFAULT_SETTINGS: NostrSocialSettings = {
  relays: DEFAULT_RELAYS,
  mediaServers: DEFAULT_MEDIA_SERVERS,
  categories: DEFAULT_CATEGORIES,
  destinations: DEFAULT_DESTINATIONS,
  pointsConfig: DEFAULT_POINTS_CONFIG,
  tiers: DEFAULT_TIERS,
  moderation: {
    mutedPubkeys: [],
    hiddenEventIds: [],
    bannedKeywords: ["spam", "crypto_airdrop", "scam", "adult", "porn", "casino"],
    requireApproval: false,
  },
};

let memorySettings: NostrSocialSettings | null = null;
let writeQueue = Promise.resolve();

function normalizeSettings(s: NostrSocialSettings): NostrSocialSettings {
  return {
    ...s,
    relays: (s.relays || []).map((r) => ({
      ...r,
      read: r.read ?? r.canRead ?? true,
      write: r.write ?? r.canWrite ?? true,
      canRead: r.canRead ?? r.read ?? true,
      canWrite: r.canWrite ?? r.write ?? true,
    })),
    mediaServers: (s.mediaServers || []).map((m) =>
      typeof m === "string" ? { url: m, name: m, active: true, isDefault: false } : m
    ),
    categories: (s.categories || []).map((c) => ({
      ...c,
      active: c.active !== false,
      name: c.name || {
        ar: c.nameAr || c.slug,
        en: c.nameEn || c.slug,
        tr: c.nameTr || c.nameEn || c.slug,
        fr: c.nameFr || c.nameEn || c.slug,
      },
      nameAr: c.nameAr || c.name?.ar || c.slug,
      nameEn: c.nameEn || c.name?.en || c.slug,
      nameTr: c.nameTr || c.name?.tr || c.slug,
      nameFr: c.nameFr || c.name?.fr || c.slug,
    })),
    destinations: (s.destinations || []).map((d) => ({
      ...d,
      active: d.active !== false,
      slug: d.slug || d.id || d.cityEn?.toLowerCase() || "dest",
      country: d.country || d.countryNameAr || "تركيا",
      name: d.name || {
        ar: d.cityAr || d.countryNameAr || "الوجهة",
        en: d.cityEn || d.countryNameEn || "Destination",
        tr: d.cityEn || d.countryNameEn || "Destination",
        fr: d.cityEn || d.countryNameEn || "Destination",
      },
    })),
    tiers: (s.tiers || []).map((t) => ({
      ...t,
      badge: (t.badge && !["Compass", "Shield", "Award", "Gem", "Crown"].includes(t.badge)) ? t.badge : "",
      badgeIcon: t.badgeIcon || "Compass",
      name: t.name || {
        ar: t.nameAr || t.id,
        en: t.nameEn || t.id,
        tr: t.nameTr || t.nameEn || t.id,
        fr: t.nameFr || t.nameEn || t.id,
      },
      perks: t.perks || {
        ar: `مضاعف مكافآت x${t.rewardMultiplier || 1.0} وخصم إضافي $${t.bookingDiscountUsdBonus || 0}`,
        en: `Multiplier x${t.rewardMultiplier || 1.0}`,
        tr: `Çarpan x${t.rewardMultiplier || 1.0}`,
        fr: `Multiplicateur x${t.rewardMultiplier || 1.0}`,
      },
    })),
    pointsConfig: {
      ...DEFAULT_POINTS_CONFIG,
      ...s.pointsConfig,
      pointsPerPhoto: s.pointsConfig?.pointsPerPhoto ?? s.pointsConfig?.pointsPerPhotoPost ?? 100,
      pointsPerPhotoPost: s.pointsConfig?.pointsPerPhotoPost ?? s.pointsConfig?.pointsPerPhoto ?? 100,
      guestPointsPerPost: s.pointsConfig?.guestPointsPerPost ?? 40,
      guestPointsPerPhoto: s.pointsConfig?.guestPointsPerPhoto ?? 30,
      guestPointsPerReel: s.pointsConfig?.guestPointsPerReel ?? 75,
      guestPointsPerComment: s.pointsConfig?.guestPointsPerComment ?? 10,
      guestPointsPerLike: s.pointsConfig?.guestPointsPerLike ?? 2,
      dailyEarnCap: s.pointsConfig?.dailyEarnCap ?? s.pointsConfig?.dailyCapPoints ?? 1000,
      dailyCapPoints: s.pointsConfig?.dailyCapPoints ?? s.pointsConfig?.dailyEarnCap ?? 1000,
      weeklyEarnCap: s.pointsConfig?.weeklyEarnCap ?? 5000,
      monthlyEarnCap: s.pointsConfig?.monthlyEarnCap ?? 15000,
      maxPostsPerDay: s.pointsConfig?.maxPostsPerDay ?? 5,
      maxReelsPerDay: s.pointsConfig?.maxReelsPerDay ?? 3,
      minCooldownSeconds: s.pointsConfig?.minCooldownSeconds ?? ((s.pointsConfig?.cooldownMinutes || 1) * 60),
    },
    moderation: {
      strictTourismFilter: s.moderation?.strictTourismFilter ?? true,
      aiAutoModeration: s.moderation?.aiAutoModeration ?? true,
      blockProfanity: s.moderation?.blockProfanity ?? true,
      blockNonTourism: s.moderation?.blockNonTourism ?? true,
      aiSensitivity: s.moderation?.aiSensitivity ?? "strict",
      tourismKeywords: s.moderation?.tourismKeywords ?? ["سياحة", "فندق", "رحلة", "طيران", "حجز", "منتجع", "إسطنبول", "طرابزون", "كبادوكيا", "أنطاليا", "مطعم", "معالم", "travel", "tourism", "hotel", "istanbul"],
      blacklistedKeywords: s.moderation?.blacklistedKeywords ?? s.moderation?.bannedKeywords ?? ["spam", "casino", "porn", "crypto", "قمار", "مخل", "سياسة", "شتيمة", "نصب"],
      bannedKeywords: s.moderation?.bannedKeywords ?? s.moderation?.blacklistedKeywords ?? ["spam", "casino", "porn", "crypto", "قمار", "مخل", "سياسة", "شتيمة", "نصب"],
      mutedPubkeys: s.moderation?.mutedPubkeys ?? [],
      hiddenEventIds: s.moderation?.hiddenEventIds ?? [],
      requireApproval: s.moderation?.requireApproval ?? false,
    },
  };
}

export async function getNostrSocialSettings(): Promise<NostrSocialSettings> {
  if (memorySettings) return memorySettings;
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<NostrSocialSettings>;
    const combined: NostrSocialSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      relays: Array.isArray(parsed.relays) && parsed.relays.length > 0 ? parsed.relays : DEFAULT_SETTINGS.relays,
      mediaServers: Array.isArray(parsed.mediaServers) && parsed.mediaServers.length > 0 ? parsed.mediaServers : DEFAULT_SETTINGS.mediaServers,
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_SETTINGS.categories,
      destinations: Array.isArray(parsed.destinations) && parsed.destinations.length > 0 ? parsed.destinations : DEFAULT_SETTINGS.destinations,
      pointsConfig: { ...DEFAULT_SETTINGS.pointsConfig, ...(parsed.pointsConfig || {}) },
      tiers: Array.isArray(parsed.tiers) && parsed.tiers.length > 0 ? parsed.tiers : DEFAULT_SETTINGS.tiers,
      moderation: { ...DEFAULT_SETTINGS.moderation, ...(parsed.moderation || {}) },
    };
    memorySettings = normalizeSettings(combined);
    return memorySettings;
  } catch {
    memorySettings = normalizeSettings(DEFAULT_SETTINGS);
    void saveNostrSocialSettings(DEFAULT_SETTINGS);
    return memorySettings;
  }
}

export async function saveNostrSocialSettings(settings: Partial<NostrSocialSettings>): Promise<NostrSocialSettings> {
  const current = await getNostrSocialSettings();
  const merged: NostrSocialSettings = normalizeSettings({
    ...current,
    ...settings,
    pointsConfig: { ...current.pointsConfig, ...(settings.pointsConfig || {}) },
    moderation: { ...current.moderation, ...(settings.moderation || {}) },
  });

  memorySettings = merged;

  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(merged, null, 2), "utf-8");
  });

  await writeQueue;
  return merged;
}

export const updateNostrSocialSettings = saveNostrSocialSettings;

