import { geoIsoList } from "./geos";
import {
  isGoogleChannel,
  parsePlatforms,
  type AdsLaunchInput,
  type GoogleChannel,
  type LaunchValidationError,
  type MetaCreativeKind,
} from "./types";

const URL_RE = /^https?:\/\/[^\s]+$/i;

export type NormalizedLaunch = {
  approved: boolean;
  dryRun: boolean;
  platforms: ReturnType<typeof parsePlatforms>;
  name: string;
  landingUrl: string;
  dailyBudget: number;
  lifetimeBudget?: number;
  currency: string;
  geoCodes: string[];
  headlines: string[];
  descriptions: string[];
  imageUrl?: string;
  keywords: string[];
  googleChannel: GoogleChannel;
  metaCreative: MetaCreativeKind;
  postId?: string;
  permalink?: string;
  pageId?: string;
  conversionAction?: string;
};

export function defaultTravelCopy(landingUrl: string): {
  headlines: string[];
  descriptions: string[];
  keywords: string[];
} {
  let host = "lonaliza.com";
  try {
    host = new URL(landingUrl).hostname.replace(/^www\./, "") || host;
  } catch {
    /* keep default */
  }
  return {
    headlines: [
      "رحلات تركيا مع لوناليزا",
      "احجز عطلتك الآن",
      "عروض سفر حصرية",
      host,
      "سياحة عائلية",
      "برامج سياحية مميزة",
    ],
    descriptions: [
      "اكتشف برامج سياحية إلى تركيا والإمارات. احجز بسهولة مع لوناليزا.",
      "عروض يومية على الرحلات والفنادق. تواصل معنا واحجز بثقة.",
    ],
    keywords: [
      "سياحة تركيا",
      "رحلات اسطنبول",
      "حجز فنادق تركيا",
      "عروض سفر",
      "برامج سياحية",
    ],
  };
}

export function validateLaunch(
  input: AdsLaunchInput,
  defaults: { geoCodes: string[]; currency: string }
): { ok: true; value: NormalizedLaunch } | { ok: false; errors: LaunchValidationError[] } {
  const errors: LaunchValidationError[] = [];
  const landingUrl = String(input.landingUrl || "").trim();
  if (!URL_RE.test(landingUrl)) {
    errors.push({ field: "landingUrl", message: "رابط الهبوط يجب أن يبدأ بـ http أو https" });
  }
  const dailyBudget = Number(input.dailyBudget);
  if (!Number.isFinite(dailyBudget) || dailyBudget <= 0) {
    errors.push({ field: "dailyBudget", message: "الميزانية اليومية مطلوبة وأكبر من صفر" });
  }
  const lifetimeRaw = input.lifetimeBudget;
  const lifetimeBudget =
    lifetimeRaw === undefined || lifetimeRaw === null || lifetimeRaw === ("" as unknown)
      ? undefined
      : Number(lifetimeRaw);
  if (lifetimeBudget !== undefined && (!Number.isFinite(lifetimeBudget) || lifetimeBudget < dailyBudget)) {
    errors.push({
      field: "lifetimeBudget",
      message: "سقف العمر إن وُجد يجب أن يكون أكبر من أو يساوي الميزانية اليومية",
    });
  }
  if (input.approved !== true) {
    errors.push({ field: "approved", message: "الإطلاق يتطلب approved=true بعد مراجعة الميزانية" });
  }

  const platforms = parsePlatforms(input.platforms);
  if (platforms.length === 0) {
    errors.push({ field: "platforms", message: "اختر google أو meta أو both" });
  }

  const rawChannel = String(input.googleChannel || "search");
  const googleChannel: GoogleChannel = isGoogleChannel(rawChannel) ? rawChannel : "search";
  const metaCreative: MetaCreativeKind = input.metaCreative === "boost" ? "boost" : "link";
  const defaultsCopy = defaultTravelCopy(landingUrl || "https://lonaliza.com");
  const headlines = (input.headlines?.length ? input.headlines : defaultsCopy.headlines)
    .map((h) => String(h || "").trim())
    .filter(Boolean)
    .slice(0, 15);
  const descriptions = (input.descriptions?.length ? input.descriptions : defaultsCopy.descriptions)
    .map((d) => String(d || "").trim())
    .filter(Boolean)
    .slice(0, 4);
  const keywords = (input.keywords?.length ? input.keywords : defaultsCopy.keywords)
    .map((k) => String(k || "").trim())
    .filter(Boolean)
    .slice(0, 20);

  if (platforms.includes("google") && headlines.length < 3) {
    errors.push({ field: "headlines", message: "جوجل يحتاج 3 عناوين على الأقل" });
  }
  if (platforms.includes("google") && descriptions.length < 2) {
    errors.push({ field: "descriptions", message: "جوجل يحتاج وصفين على الأقل" });
  }
  if (platforms.includes("meta") && metaCreative === "boost") {
    const hasPost = Boolean(String(input.postId || "").trim() || String(input.permalink || "").trim());
    if (!hasPost) {
      errors.push({
        field: "postId",
        message: "تعزيز منشور ميتا يحتاج postId أو permalink (من SOCIAL أو في جسم الطلب)",
      });
    }
  }

  const geoCodes = geoIsoList(input.geoCodes?.length ? input.geoCodes : defaults.geoCodes);
  if (geoCodes.length === 0) {
    errors.push({ field: "geoCodes", message: "حدد دولة واحدة على الأقل من دول الخليج/المغرب/العراق" });
  }

  if (errors.length) return { ok: false, errors };

  const name =
    String(input.name || "").trim() ||
    `Lonaliza ${platforms.join("+")} ${new Date().toISOString().slice(0, 10)}`;

  return {
    ok: true,
    value: {
      approved: true,
      dryRun: input.dryRun !== false,
      platforms,
      name,
      landingUrl,
      dailyBudget,
      lifetimeBudget,
      currency: String(input.currency || defaults.currency || "USD").trim() || "USD",
      geoCodes,
      headlines,
      descriptions,
      imageUrl: String(input.imageUrl || "").trim() || undefined,
      keywords,
      googleChannel,
      metaCreative,
      postId: String(input.postId || "").trim() || undefined,
      permalink: String(input.permalink || "").trim() || undefined,
      pageId: String(input.pageId || "").trim() || undefined,
      conversionAction: String(input.conversionAction || "").trim() || undefined,
    },
  };
}
