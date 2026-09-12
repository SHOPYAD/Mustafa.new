import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import {
  loadWalletsFromPocketBase,
  saveWalletsToPocketBase,
} from "@/lib/loyalty/pb-wallets";
import {
  DEFAULT_LOYALTY_SETTINGS,
  emptyLocalized,
  isCouponDiscountType,
  isLoyaltyService,
  normalizeCouponCode,
  type CouponRedemption,
  type LocalizedCopy,
  type LoyaltyCoupon,
  type LoyaltyLedgerEntry,
  type LoyaltyService,
  type LoyaltySettings,
  type LoyaltyVoucher,
  type LoyaltyWallet,
} from "@/lib/loyalty/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "loyalty.json");

type StoreFile = {
  settings: LoyaltySettings;
  coupons: LoyaltyCoupon[];
  wallets: LoyaltyWallet[];
  redemptions: CouponRedemption[];
};

let writeChain: Promise<void> = Promise.resolve();

function isServerlessHosting(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

function getStoreFile(): string {
  if (isServerlessHosting()) return path.join("/tmp", "alrayyan-loyalty.json");
  return STORE_FILE;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function newLoyaltyId(prefix: string): string {
  return `${prefix}_${randomBytes(5).toString("hex")}`;
}

function lona10Coupon(at: string): LoyaltyCoupon {
  return {
    id: "cpn_lona10_public",
    code: "LONA10",
    service: "all",
    discountType: "percent",
    discountValue: 10,
    currency: "USD",
    validFrom: at.slice(0, 10),
    validTo: "2027-12-31",
    maxUsesTotal: 0,
    maxUsesPerUser: 0,
    minBookingAmount: 0,
    minBookingCurrency: "USD",
    newUserOnly: false,
    firstBookingOnly: false,
    active: true,
    title: {
      ar: "خصم لوناليزا 10%",
      en: "Lonaliza 10% off",
      tr: "Lonaliza %10 indirim",
    },
    description: {
      ar: "خصم عام يظهر على أسعار البحث ويُطبَّق عند الدفع",
      en: "Public discount shown on search prices and applied at checkout",
      tr: "Arama fiyatlarında görünen ve ödemede uygulanan genel indirim",
    },
    usedCount: 0,
    createdAt: at,
    updatedAt: at,
  };
}

function seedCoupons(at: string): LoyaltyCoupon[] {
  return [
    lona10Coupon(at),
    {
      id: newLoyaltyId("cpn"),
      code: "FIRST20",
      service: "all",
      discountType: "percent",
      discountValue: 20,
      currency: "USD",
      validFrom: at.slice(0, 10),
      validTo: "2027-12-31",
      maxUsesTotal: 0,
      maxUsesPerUser: 1,
      minBookingAmount: 0,
      minBookingCurrency: "USD",
      newUserOnly: false,
      firstBookingOnly: true,
      active: true,
      title: {
        ar: "خصم الحجز الأول 20%",
        en: "First booking 20% off",
        tr: "İlk rezervasyonda %20",
      },
      description: {
        ar: "عروض الحجز الأول لعملاء لوناليزا",
        en: "First booking offer for Alrayyan guests",
        tr: "Alrayyan ilk rezervasyon teklifi",
      },
      usedCount: 0,
      createdAt: at,
      updatedAt: at,
    },
    {
      id: newLoyaltyId("cpn"),
      code: "NEW350",
      service: "all",
      discountType: "fixed",
      discountValue: 50,
      currency: "USD",
      validFrom: at.slice(0, 10),
      validTo: "2027-12-31",
      maxUsesTotal: 0,
      maxUsesPerUser: 1,
      minBookingAmount: 80,
      minBookingCurrency: "USD",
      newUserOnly: true,
      firstBookingOnly: false,
      active: true,
      title: {
        ar: "خصم المستخدم الجديد حتى $50",
        en: "New guest discount up to $50",
        tr: "Yeni üye indirimi $50'ye kadar",
      },
      description: {
        ar: "رمز خصم للمستخدم الجديد",
        en: "Promo code for new guests",
        tr: "Yeni kullanıcı promosyon kodu",
      },
      usedCount: 0,
      createdAt: at,
      updatedAt: at,
    },
  ];
}

function sanitizeLocalized(raw: unknown): LocalizedCopy {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    ar: String(rec.ar || "").slice(0, 160),
    en: String(rec.en || "").slice(0, 160),
    tr: String(rec.tr || "").slice(0, 160),
  };
}

function sanitizeSettings(raw: unknown): LoyaltySettings {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const byService: LoyaltySettings["pointsPerUsdByService"] = {};
  const src = rec.pointsPerUsdByService && typeof rec.pointsPerUsdByService === "object"
    ? (rec.pointsPerUsdByService as Record<string, unknown>)
    : {};
  for (const key of Object.keys(src)) {
    if (!isLoyaltyService(key) || key === "all") continue;
    const n = Number(src[key]);
    if (Number.isFinite(n) && n >= 0) byService[key] = n;
  }
  const pointsPerUsd = Number(rec.pointsPerUsd);
  const redeem = Number(rec.pointsPerUsdRedeem);
  const minConvert = Number(rec.minConvertPoints);
  const minBooking = Number(rec.minBookingAmountUsd);
  const maxDiscount = Number(rec.maxDiscountPercent);
  const maxVoucherUsd = Number(rec.maxVoucherDiscountUsd);

  return {
    enabled: rec.enabled !== false,
    pointsPerUsd: Number.isFinite(pointsPerUsd) && pointsPerUsd >= 0 ? pointsPerUsd : DEFAULT_LOYALTY_SETTINGS.pointsPerUsd,
    pointsPerUsdByService: byService,
    pointsPerUsdRedeem:
      Number.isFinite(redeem) && redeem > 0 ? redeem : DEFAULT_LOYALTY_SETTINGS.pointsPerUsdRedeem,
    minConvertPoints:
      Number.isFinite(minConvert) && minConvert >= 0
        ? Math.round(minConvert)
        : DEFAULT_LOYALTY_SETTINGS.minConvertPoints,
    requireAdminApproval:
      rec.requireAdminApproval !== undefined ? Boolean(rec.requireAdminApproval) : DEFAULT_LOYALTY_SETTINGS.requireAdminApproval,
    minBookingAmountUsd:
      Number.isFinite(minBooking) && minBooking >= 0
        ? minBooking
        : DEFAULT_LOYALTY_SETTINGS.minBookingAmountUsd,
    maxDiscountPercent:
      Number.isFinite(maxDiscount) && maxDiscount > 0 && maxDiscount <= 100
        ? maxDiscount
        : DEFAULT_LOYALTY_SETTINGS.maxDiscountPercent,
    maxVoucherDiscountUsd:
      Number.isFinite(maxVoucherUsd) && maxVoucherUsd >= 0
        ? maxVoucherUsd
        : DEFAULT_LOYALTY_SETTINGS.maxVoucherDiscountUsd,
    autoApproveVerifiedBookings:
      rec.autoApproveVerifiedBookings !== undefined
        ? Boolean(rec.autoApproveVerifiedBookings)
        : DEFAULT_LOYALTY_SETTINGS.autoApproveVerifiedBookings,
  };
}

function sanitizeCoupon(raw: unknown, fallback?: LoyaltyCoupon): LoyaltyCoupon | null {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const code = normalizeCouponCode(String(rec.code || fallback?.code || ""));
  if (!code) return null;
  const discountValue = Number(rec.discountValue ?? fallback?.discountValue ?? 0);
  const maxUsesTotal = Number(rec.maxUsesTotal ?? fallback?.maxUsesTotal ?? 0);
  const maxUsesPerUser = Number(rec.maxUsesPerUser ?? fallback?.maxUsesPerUser ?? 1);
  const minBookingAmount = Number(rec.minBookingAmount ?? fallback?.minBookingAmount ?? 0);
  const at = nowIso();
  return {
    id: String(rec.id || fallback?.id || newLoyaltyId("cpn")),
    code,
    service: isLoyaltyService(rec.service) ? rec.service : fallback?.service || "all",
    discountType: isCouponDiscountType(rec.discountType)
      ? rec.discountType
      : fallback?.discountType || "percent",
    discountValue: Number.isFinite(discountValue) && discountValue > 0 ? discountValue : 0,
    currency: String(rec.currency || fallback?.currency || "USD").toUpperCase().slice(0, 3),
    validFrom: String(rec.validFrom || fallback?.validFrom || at.slice(0, 10)).slice(0, 10),
    validTo: String(rec.validTo || fallback?.validTo || "2027-12-31").slice(0, 10),
    maxUsesTotal: Number.isFinite(maxUsesTotal) && maxUsesTotal >= 0 ? Math.round(maxUsesTotal) : 0,
    maxUsesPerUser:
      Number.isFinite(maxUsesPerUser) && maxUsesPerUser >= 0 ? Math.round(maxUsesPerUser) : 1,
    minBookingAmount:
      Number.isFinite(minBookingAmount) && minBookingAmount >= 0 ? minBookingAmount : 0,
    minBookingCurrency: String(
      rec.minBookingCurrency || fallback?.minBookingCurrency || "USD"
    )
      .toUpperCase()
      .slice(0, 3),
    newUserOnly: Boolean(rec.newUserOnly ?? fallback?.newUserOnly),
    firstBookingOnly: Boolean(rec.firstBookingOnly ?? fallback?.firstBookingOnly),
    active: rec.active === undefined ? (fallback?.active ?? true) : Boolean(rec.active),
    title: Object.values(sanitizeLocalized(rec.title)).some(Boolean)
      ? sanitizeLocalized(rec.title)
      : fallback?.title || emptyLocalized(),
    description: Object.values(sanitizeLocalized(rec.description)).some(Boolean)
      ? sanitizeLocalized(rec.description)
      : fallback?.description || emptyLocalized(),
    usedCount: Math.max(0, Math.round(Number(rec.usedCount ?? fallback?.usedCount ?? 0) || 0)),
    createdAt: String(rec.createdAt || fallback?.createdAt || at),
    updatedAt: at,
  };
}

function emptyWallet(userId: string): LoyaltyWallet {
  return { userId, points: 0, pendingPoints: 0, vouchers: [], ledger: [] };
}

function sanitizeWallet(raw: unknown): LoyaltyWallet | null {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const userId = String(rec.userId || "").trim();
  if (!userId) return null;
  const vouchers: LoyaltyVoucher[] = [];
  if (Array.isArray(rec.vouchers)) {
    for (const row of rec.vouchers) {
      const item = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
      const amountUsd = Number(item.amountUsd);
      const remainingUsd = Number(item.remainingUsd);
      if (!item.id || !Number.isFinite(amountUsd)) continue;
      const voucher: LoyaltyVoucher = {
        id: String(item.id),
        userId,
        code: String(item.code || ""),
        source: item.source === "coupon" ? "coupon" : "points",
        amountUsd,
        remainingUsd: Number.isFinite(remainingUsd) ? remainingUsd : amountUsd,
        service: isLoyaltyService(item.service) ? item.service : "all",
        active: item.active !== false,
        createdAt: String(item.createdAt || nowIso()),
      };
      if (item.couponId) voucher.couponId = String(item.couponId);
      if (item.expiresAt) voucher.expiresAt = String(item.expiresAt);
      vouchers.push(voucher);
    }
  }
  const ledger: LoyaltyLedgerEntry[] = [];
  if (Array.isArray(rec.ledger)) {
    for (const row of rec.ledger) {
      const item = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
      const points = Number(item.points);
      if (!item.id || !Number.isFinite(points)) continue;
      const kind = item.kind;
      if (kind !== "earn" && kind !== "convert" && kind !== "redeem" && kind !== "adjust") {
        continue;
      }
      const statusRaw = String(item.status || "");
      const status: LoyaltyLedgerEntry["status"] =
        statusRaw === "pending" || statusRaw === "rejected" ? statusRaw : "confirmed";
      const entry: LoyaltyLedgerEntry = {
        id: String(item.id),
        userId,
        kind,
        status,
        points,
        usdValue: Number(item.usdValue) || 0,
        createdAt: String(item.createdAt || nowIso()),
      };
      if (item.bookingId) entry.bookingId = String(item.bookingId);
      if (isLoyaltyService(item.service)) entry.service = item.service;
      if (item.couponId) entry.couponId = String(item.couponId);
      if (item.voucherId) entry.voucherId = String(item.voucherId);
      if (item.note) entry.note = String(item.note);
      if (item.rejectionReason) entry.rejectionReason = String(item.rejectionReason);
      if (item.approvedAt) entry.approvedAt = String(item.approvedAt);
      if (item.approvedBy) entry.approvedBy = String(item.approvedBy);
      ledger.push(entry);
    }
  }
  return {
    userId,
    points: Math.max(0, Number(rec.points) || 0),
    pendingPoints: Math.max(0, Number(rec.pendingPoints) || 0),
    vouchers,
    ledger,
  };
}

function defaultStore(): StoreFile {
  const at = nowIso();
  return {
    settings: { ...DEFAULT_LOYALTY_SETTINGS },
    coupons: seedCoupons(at),
    wallets: [],
    redemptions: [],
  };
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = JSON.parse(await fs.readFile(getStoreFile(), "utf8")) as Record<string, unknown>;
    const coupons = Array.isArray(raw.coupons)
      ? raw.coupons.map((row) => sanitizeCoupon(row)).filter((row): row is LoyaltyCoupon => Boolean(row))
      : [];
    const wallets = Array.isArray(raw.wallets)
      ? raw.wallets.map(sanitizeWallet).filter((row): row is LoyaltyWallet => Boolean(row))
      : [];
    const redemptions: CouponRedemption[] = [];
    if (Array.isArray(raw.redemptions)) {
      for (const row of raw.redemptions) {
        const item = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        if (!item.id || !item.couponId || !item.userId) continue;
        const redemption: CouponRedemption = {
          id: String(item.id),
          couponId: String(item.couponId),
          userId: String(item.userId),
          createdAt: String(item.createdAt || nowIso()),
        };
        if (item.bookingId) redemption.bookingId = String(item.bookingId);
        redemptions.push(redemption);
      }
    }
    const at = nowIso();
    const merged = coupons.length ? coupons : seedCoupons(at);
    if (!merged.some((c) => c.code === "LONA10")) merged.unshift(lona10Coupon(at));
    const store: StoreFile = {
      settings: sanitizeSettings(raw.settings),
      coupons: merged,
      wallets,
      redemptions,
    };
    const pbWallets = await loadWalletsFromPocketBase();
    if (pbWallets && pbWallets.length) store.wallets = pbWallets;
    return store;
  } catch {
    return defaultStore();
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await ensureDir();
  await fs.writeFile(getStoreFile(), JSON.stringify(store, null, 2), { mode: 0o600 });
  await saveWalletsToPocketBase(store.wallets).catch(() => false);
}

async function mutate<T>(fn: (store: StoreFile) => T | Promise<T>): Promise<T> {
  let result!: T;
  writeChain = writeChain.then(async () => {
    const store = await readStore();
    result = await fn(store);
    await writeStore(store);
  });
  await writeChain;
  return result;
}

export async function getLoyaltyStore(): Promise<StoreFile> {
  const store = await readStore();
  if (!store.coupons.some((c) => c.code === "LONA10")) {
    store.coupons.unshift(lona10Coupon(nowIso()));
    await writeStore(store);
  }
  return store;
}

export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  return (await readStore()).settings;
}

export async function saveLoyaltySettings(patch: Partial<LoyaltySettings>): Promise<LoyaltySettings> {
  return mutate((store) => {
    store.settings = sanitizeSettings({ ...store.settings, ...patch });
    return store.settings;
  });
}

export async function listCoupons(): Promise<LoyaltyCoupon[]> {
  return (await readStore()).coupons;
}

export async function upsertCoupon(input: unknown, id?: string): Promise<LoyaltyCoupon> {
  return mutate((store) => {
    const existing = id ? store.coupons.find((c) => c.id === id) : undefined;
    const next = sanitizeCoupon(input, existing);
    if (!next || next.discountValue <= 0) throw new Error("invalid_coupon");
    const clash = store.coupons.find((c) => c.code === next.code && c.id !== next.id);
    if (clash) throw new Error("code_taken");
    if (existing) {
      store.coupons = store.coupons.map((c) => (c.id === existing.id ? next : c));
    } else {
      store.coupons.unshift(next);
    }
    return next;
  });
}

export async function deleteCoupon(id: string): Promise<boolean> {
  return mutate((store) => {
    const before = store.coupons.length;
    store.coupons = store.coupons.filter((c) => c.id !== id);
    return store.coupons.length < before;
  });
}

export function findWallet(store: StoreFile, userId: string): LoyaltyWallet {
  return store.wallets.find((w) => w.userId === userId) || emptyWallet(userId);
}

export function putWallet(store: StoreFile, wallet: LoyaltyWallet): void {
  const idx = store.wallets.findIndex((w) => w.userId === wallet.userId);
  if (idx >= 0) store.wallets[idx] = wallet;
  else store.wallets.push(wallet);
}

export { mutate, emptyWallet, nowIso };
