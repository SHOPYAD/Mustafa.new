import type { LoyaltyService } from "@/lib/loyalty/types";

export const PUBLIC_DISPLAY_COUPON_CODE = "LONA10";

export type DisplayCoupon = {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  currency?: string;
  firstBookingOnly?: boolean;
  newUserOnly?: boolean;
};

export type DisplayPrice = {
  original: number;
  discounted: number;
  saved: number;
  code: string;
  hasDiscount: boolean;
};

export function isPublicDisplayCoupon(coupon: DisplayCoupon | null | undefined): boolean {
  if (!coupon) return false;
  if (coupon.firstBookingOnly || coupon.newUserOnly) return false;
  return coupon.discountValue > 0;
}

export function pickDisplayCoupon(
  coupons: DisplayCoupon[],
  appliedCode?: string
): DisplayCoupon | null {
  const applied = appliedCode
    ? coupons.find((c) => c.code === appliedCode && isPublicDisplayCoupon(c))
    : undefined;
  if (applied) return applied;
  return (
    coupons.find((c) => c.code === PUBLIC_DISPLAY_COUPON_CODE && isPublicDisplayCoupon(c)) ||
    coupons.find((c) => isPublicDisplayCoupon(c)) ||
    null
  );
}

export function applyDisplayCoupon(amount: number, coupon: DisplayCoupon | null | undefined): DisplayPrice {
  const original = Number(amount);
  if (!Number.isFinite(original) || original <= 0 || !coupon || !isPublicDisplayCoupon(coupon)) {
    return { original: Number.isFinite(original) ? original : 0, discounted: Number.isFinite(original) ? original : 0, saved: 0, code: "", hasDiscount: false };
  }
  let saved = 0;
  if (coupon.discountType === "percent") {
    saved = original * (coupon.discountValue / 100);
  } else {
    saved = coupon.discountValue;
  }
  saved = Math.round(Math.min(original, Math.max(0, saved)) * 100) / 100;
  const discounted = Math.round((original - saved) * 100) / 100;
  return {
    original: Math.round(original * 100) / 100,
    discounted,
    saved,
    code: coupon.code,
    hasDiscount: saved > 0.009 && discounted < original,
  };
}

export function displayCouponForService(
  coupons: DisplayCoupon[],
  _service: LoyaltyService,
  appliedCode?: string
): DisplayCoupon | null {
  return pickDisplayCoupon(coupons, appliedCode);
}
