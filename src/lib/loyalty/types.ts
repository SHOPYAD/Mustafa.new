export const LOYALTY_SERVICES = [
  "flights",
  "hotels",
  "transfers",
  "cars",
  "packages",
  "all",
] as const;

export type LoyaltyService = (typeof LOYALTY_SERVICES)[number];

export type CouponDiscountType = "percent" | "fixed";

export type LocalizedCopy = {
  ar: string;
  en: string;
  tr: string;
};

export type LoyaltyCoupon = {
  id: string;
  code: string;
  service: LoyaltyService;
  discountType: CouponDiscountType;
  discountValue: number;
  currency: string;
  validFrom: string;
  validTo: string;
  maxUsesTotal: number;
  maxUsesPerUser: number;
  minBookingAmount: number;
  minBookingCurrency: string;
  newUserOnly: boolean;
  firstBookingOnly: boolean;
  active: boolean;
  title: LocalizedCopy;
  description: LocalizedCopy;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
};

export type LoyaltySettings = {
  enabled: boolean;
  pointsPerUsd: number;
  pointsPerUsdByService: Partial<Record<LoyaltyService, number>>;
  pointsPerUsdRedeem: number;
  minConvertPoints: number;
};

export type LoyaltyLedgerKind = "earn" | "convert" | "redeem" | "adjust";

export type LoyaltyLedgerStatus = "pending" | "confirmed";

export type LoyaltyLedgerEntry = {
  id: string;
  userId: string;
  kind: LoyaltyLedgerKind;
  status: LoyaltyLedgerStatus;
  points: number;
  usdValue: number;
  bookingId?: string;
  service?: LoyaltyService;
  couponId?: string;
  voucherId?: string;
  note?: string;
  createdAt: string;
};

export type LoyaltyVoucher = {
  id: string;
  userId: string;
  code: string;
  source: "points" | "coupon";
  amountUsd: number;
  remainingUsd: number;
  service: LoyaltyService;
  couponId?: string;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
};

export type CouponRedemption = {
  id: string;
  couponId: string;
  userId: string;
  bookingId?: string;
  createdAt: string;
};

export type LoyaltyWallet = {
  userId: string;
  points: number;
  pendingPoints: number;
  vouchers: LoyaltyVoucher[];
  ledger: LoyaltyLedgerEntry[];
};

export type LoyaltyQuote = {
  originalAmount: number;
  originalCurrency: string;
  originalUsd: number;
  discountUsd: number;
  payableUsd: number;
  payableAmount: number;
  payableCurrency: string;
  couponCode?: string;
  couponId?: string;
  voucherIds: string[];
  coveredInFull: boolean;
  pointsEarn: number;
  pointsUsd: number;
};

export const LOYALTY_COUPON_COOKIE = "alrayyan_coupon";

export const DEFAULT_LOYALTY_SETTINGS: LoyaltySettings = {
  enabled: true,
  pointsPerUsd: 10,
  pointsPerUsdByService: {},
  pointsPerUsdRedeem: 100,
  minConvertPoints: 100,
};

export function isLoyaltyService(value: unknown): value is LoyaltyService {
  return LOYALTY_SERVICES.includes(value as LoyaltyService);
}

export function isCouponDiscountType(value: unknown): value is CouponDiscountType {
  return value === "percent" || value === "fixed";
}

export function emptyLocalized(): LocalizedCopy {
  return { ar: "", en: "", tr: "" };
}

export function localizedText(copy: LocalizedCopy, locale: string): string {
  if (locale === "ar") return copy.ar || copy.en || copy.tr;
  if (locale === "tr") return copy.tr || copy.en || copy.ar;
  return copy.en || copy.ar || copy.tr;
}

export function serviceMatches(couponService: LoyaltyService, bookingService: LoyaltyService): boolean {
  return couponService === "all" || couponService === bookingService;
}

export function normalizeCouponCode(raw: string): string {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 24);
}

export function bookingServiceFromProvider(provider: string, hotelId = ""): LoyaltyService {
  const raw = `${provider} ${hotelId}`.toLowerCase();
  if (raw.includes("flight")) return "flights";
  if (raw.includes("transfer")) return "transfers";
  if (raw.includes("car")) return "cars";
  if (raw.includes("package") || raw.includes("holiday")) return "packages";
  return "hotels";
}
