import { getLoyaltySettings, getLoyaltyStore, listCoupons } from "@/lib/loyalty/store";
import { localizedText, type LoyaltyCoupon, type LoyaltySettings } from "@/lib/loyalty/types";

export type ActiveOffer = {
  couponCode: string;
  couponTitle: string;
  couponDescription: string;
  discountLabel: string;
  pointsEnabled: boolean;
  pointsPerUsd: number;
  pointsPerUsdRedeem: number;
  minConvertPoints: number;
};

function dateOnly(value = new Date().toISOString()): string {
  return value.slice(0, 10);
}

export function couponIsLive(coupon: LoyaltyCoupon, today = dateOnly()): boolean {
  if (!coupon.active) return false;
  if (coupon.validFrom && today < coupon.validFrom) return false;
  if (coupon.validTo && today > coupon.validTo) return false;
  if (coupon.maxUsesTotal > 0 && coupon.usedCount >= coupon.maxUsesTotal) return false;
  return true;
}

export async function listLiveCoupons(): Promise<LoyaltyCoupon[]> {
  const coupons = await listCoupons();
  return coupons.filter((coupon) => couponIsLive(coupon));
}

export function formatDiscount(coupon: LoyaltyCoupon): string {
  if (coupon.discountType === "percent") return `${coupon.discountValue}%`;
  return `${coupon.discountValue} ${coupon.currency || "USD"}`;
}

export async function getActiveOffer(locale = "ar"): Promise<ActiveOffer> {
  const [settings, coupons] = await Promise.all([getLoyaltySettings(), listLiveCoupons()]);
  const first = coupons[0];
  return offerFrom(settings, first, locale);
}

export async function getOfferForUser(
  userId: string | undefined,
  locale = "ar"
): Promise<ActiveOffer & { pointsBalance: number }> {
  const [settings, coupons, store] = await Promise.all([
    getLoyaltySettings(),
    listLiveCoupons(),
    getLoyaltyStore(),
  ]);
  const wallet = userId ? store.wallets.find((row) => row.userId === userId) : undefined;
  return {
    ...offerFrom(settings, coupons[0], locale),
    pointsBalance: wallet?.points || 0,
  };
}

function offerFrom(settings: LoyaltySettings, coupon: LoyaltyCoupon | undefined, locale: string): ActiveOffer {
  return {
    couponCode: coupon?.code || "",
    couponTitle: coupon ? localizedText(coupon.title, locale) : "",
    couponDescription: coupon ? localizedText(coupon.description, locale) : "",
    discountLabel: coupon ? formatDiscount(coupon) : "",
    pointsEnabled: settings.enabled,
    pointsPerUsd: settings.pointsPerUsd,
    pointsPerUsdRedeem: settings.pointsPerUsdRedeem,
    minConvertPoints: settings.minConvertPoints,
  };
}

export function formatOfferText(offer: ActiveOffer, locale = "ar"): string {
  const parts: string[] = [];
  if (offer.couponCode) {
    if (locale === "en") {
      parts.push(`Coupon ${offer.couponCode} — ${offer.discountLabel} ${offer.couponTitle}`.trim());
    } else {
      parts.push(`كوبون ${offer.couponCode} — خصم ${offer.discountLabel} ${offer.couponTitle}`.trim());
    }
  }
  if (offer.pointsEnabled) {
    if (locale === "en") {
      parts.push(`Loyalty: ${offer.pointsPerUsd} points / USD (redeem ${offer.pointsPerUsdRedeem} pts = $1).`);
    } else {
      parts.push(`النقاط: ${offer.pointsPerUsd} نقطة لكل دولار (الاستبدال ${offer.pointsPerUsdRedeem} نقطة = 1$).`);
    }
  }
  return parts.join("\n");
}
