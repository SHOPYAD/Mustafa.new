export const AFFILIATE_REF_COOKIE = "alrayyan_ref";
export const AFFILIATE_VISIT_SESSION_PREFIX = "alrayyan_aff_visit:";
export const SITE_ORIGIN = "https://lonaliza.com";

export const AFFILIATE_SERVICES = [
  "flight",
  "hotel",
  "car",
  "transfer",
  "package",
  "other",
] as const;

export type AffiliateService = (typeof AFFILIATE_SERVICES)[number];

export type CommissionKind = "percent" | "fixed";

export type CommissionRule = {
  type: CommissionKind;
  value: number;
};

export type AffiliateCommissions = Record<AffiliateService, CommissionRule>;

export type AffiliateSettings = {
  id: string;
  enabled: boolean;
  cookie_days: number;
  min_withdraw: number;
  commissions: AffiliateCommissions;
};

export type AffiliateProfile = {
  id: string;
  user?: string;
  code: string;
  status: "active" | "paused" | "banned";
  created: string;
  updated: string;
};

export type AffiliateVisit = {
  id: string;
  code: string;
  path: string;
  service: AffiliateService;
  ip_hash?: string;
  ua?: string;
  created: string;
};

export type AffiliateConversionStatus = "pending" | "approved" | "rejected";

export type AffiliateConversion = {
  id: string;
  user?: string;
  code: string;
  service: AffiliateService;
  status: AffiliateConversionStatus;
  booking_amount: number;
  commission: number;
  notes?: string;
  tp_ref?: string;
  booking_id?: string;
  path?: string;
  created: string;
  updated: string;
};

export type AffiliateWithdrawalStatus = "pending" | "paid" | "rejected";

export type AffiliateWithdrawal = {
  id: string;
  user?: string;
  amount: number;
  binance_id: string;
  status: AffiliateWithdrawalStatus;
  note?: string;
  created: string;
  updated: string;
};

export const DEFAULT_COMMISSIONS: AffiliateCommissions = {
  flight: { type: "percent", value: 3 },
  hotel: { type: "percent", value: 5 },
  car: { type: "percent", value: 4 },
  transfer: { type: "percent", value: 4 },
  package: { type: "percent", value: 8 },
  other: { type: "percent", value: 3 },
};

export const DEFAULT_AFFILIATE_SETTINGS: Omit<AffiliateSettings, "id"> = {
  enabled: true,
  cookie_days: 30,
  min_withdraw: 100,
  commissions: DEFAULT_COMMISSIONS,
};

export const AFFILIATE_SHARE_PAGES: Array<{
  key: string;
  path: string;
  service: AffiliateService;
}> = [
  { key: "home", path: "/", service: "other" },
  { key: "flights", path: "/flights", service: "flight" },
  { key: "hotels", path: "/hotels", service: "hotel" },
  { key: "cars", path: "/cars", service: "car" },
  { key: "transfers", path: "/transfers", service: "transfer" },
  { key: "holidays", path: "/holidays", service: "package" },
  { key: "vipTours", path: "/vip-tours", service: "package" },
];

export function isAffiliateService(value: string): value is AffiliateService {
  return (AFFILIATE_SERVICES as readonly string[]).includes(value);
}

export function serviceFromPath(path: string): AffiliateService {
  const clean = path.split("?")[0] || "/";
  if (clean === "/flights" || clean.startsWith("/flights/")) return "flight";
  if (clean === "/hotels" || clean.startsWith("/hotels/")) return "hotel";
  if (clean === "/cars" || clean.startsWith("/cars/")) return "car";
  if (clean === "/transfers" || clean.startsWith("/transfers/")) return "transfer";
  if (clean === "/holidays" || clean.startsWith("/holidays/")) return "package";
  if (clean === "/vip-tours" || clean.startsWith("/vip-tours/")) return "package";
  return "other";
}

export function normalizeRefCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20);
}

export function isValidRefCode(raw: string): boolean {
  return /^[A-Z0-9_-]{3,20}$/.test(normalizeRefCode(raw));
}

export function computeCommission(
  amount: number,
  rule: CommissionRule | undefined
): number {
  if (!rule) return 0;
  const value = Number(rule.value) || 0;
  if (rule.type === "fixed") return Math.max(0, Math.round(value * 100) / 100);
  return Math.max(0, Math.round(((Number(amount) || 0) * value) / 100 * 100) / 100);
}
