import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { convertAmountSafe } from "@/lib/server/fx-service";
import {
  emptyWallet,
  findWallet,
  getLoyaltyStore,
  mutate,
  newLoyaltyId,
  nowIso,
  putWallet,
} from "@/lib/loyalty/store";
import {
  isLoyaltyService,
  localizedText,
  normalizeCouponCode,
  serviceMatches,
  type LoyaltyCoupon,
  type LoyaltyLedgerEntry,
  type LoyaltyQuote,
  type LoyaltyService,
  type LoyaltySettings,
  type LoyaltyVoucher,
  type LoyaltyWallet,
} from "@/lib/loyalty/types";

export function earnRateFor(settings: LoyaltySettings, service: LoyaltyService): number {
  if (service !== "all" && settings.pointsPerUsdByService[service] != null) {
    return settings.pointsPerUsdByService[service] || 0;
  }
  return settings.pointsPerUsd;
}

export function pointsFromUsd(settings: LoyaltySettings, usd: number, service: LoyaltyService): number {
  if (!settings.enabled || usd <= 0) return 0;
  return Math.max(0, Math.round(usd * earnRateFor(settings, service)));
}

export function usdFromPoints(settings: LoyaltySettings, points: number): number {
  const rate = settings.pointsPerUsdRedeem > 0 ? settings.pointsPerUsdRedeem : 100;
  return Math.round((points / rate) * 100) / 100;
}

export async function amountToUsd(amount: number, currency: string): Promise<number> {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const code = String(currency || "USD").toUpperCase();
  if (code === "USD") return Math.round(n * 100) / 100;
  const usd = await convertAmountSafe(n, code, "USD");
  return Math.round((Number.isFinite(usd) ? usd : 0) * 100) / 100;
}

export async function usdToAmount(usd: number, currency: string): Promise<number> {
  const n = Number(usd);
  if (!Number.isFinite(n)) return 0;
  const code = String(currency || "USD").toUpperCase();
  if (code === "USD") return Math.round(n * 100) / 100;
  const out = await convertAmountSafe(n, "USD", code);
  return Math.round((Number.isFinite(out) ? out : 0) * 100) / 100;
}

function dateOnly(value: string): string {
  return String(value || "").slice(0, 10);
}

function couponInWindow(coupon: LoyaltyCoupon, today = dateOnly(nowIso())): boolean {
  if (!coupon.active) return false;
  if (coupon.validFrom && today < coupon.validFrom) return false;
  if (coupon.validTo && today > coupon.validTo) return false;
  return true;
}

export async function userBookingStats(userId: string): Promise<{
  total: number;
  paid: number;
  isNewUser: boolean;
}> {
  if (!userId) return { total: 0, paid: 0, isNewUser: true };
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { total: 0, paid: 0, isNewUser: true };
  let total = 0;
  let paid = 0;
  let created = "";
  try {
    const hotels = await pb.collection("hotel_bookings").getFullList<HotelBookingRecord>({
      filter: `user = "${userId}"`,
      fields: "id,status,payment_status",
    });
    total += hotels.length;
    paid += hotels.filter(
      (row) =>
        row.status === "paid" || String(row.payment_status || "").toLowerCase() === "paid"
    ).length;
  } catch {
    /* optional */
  }
  try {
    const enquiries = await pb.collection("enquiry_bookings").getFullList({
      filter: `user = "${userId}"`,
      fields: "id,status",
    });
    total += enquiries.length;
  } catch {
    /* optional */
  }
  try {
    const user = await pb.collection("users").getOne(userId);
    created = String(user.created || "");
  } catch {
    /* optional */
  }
  const ageMs = created ? Date.now() - new Date(created).getTime() : 0;
  const isNewUser = total === 0 || (ageMs > 0 && ageMs < 1000 * 60 * 60 * 24 * 30);
  return { total, paid, isNewUser };
}

export function publicCoupon(coupon: LoyaltyCoupon, locale: string) {
  return {
    id: coupon.id,
    code: coupon.code,
    service: coupon.service,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    currency: coupon.currency,
    newUserOnly: coupon.newUserOnly,
    firstBookingOnly: coupon.firstBookingOnly,
    minBookingAmount: coupon.minBookingAmount,
    minBookingCurrency: coupon.minBookingCurrency,
    title: localizedText(coupon.title, locale),
    description: localizedText(coupon.description, locale),
  };
}

export async function listPublicCoupons(
  service: LoyaltyService,
  locale: string
): Promise<ReturnType<typeof publicCoupon>[]> {
  const store = await getLoyaltyStore();
  return store.coupons
    .filter((c) => couponInWindow(c) && serviceMatches(c.service, service))
    .map((c) => publicCoupon(c, locale));
}

async function couponUsable(
  coupon: LoyaltyCoupon,
  userId: string | undefined,
  amountUsd: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!couponInWindow(coupon)) return { ok: false, error: "inactive" };
  if (coupon.maxUsesTotal > 0 && coupon.usedCount >= coupon.maxUsesTotal) {
    return { ok: false, error: "exhausted" };
  }
  if (coupon.minBookingAmount > 0) {
    const minUsd = await amountToUsd(coupon.minBookingAmount, coupon.minBookingCurrency || "USD");
    if (amountUsd + 0.01 < minUsd) return { ok: false, error: "min_amount" };
  }
  if (!userId) {
    if (coupon.newUserOnly || coupon.firstBookingOnly) return { ok: false, error: "login_required" };
    return { ok: true };
  }
  const store = await getLoyaltyStore();
  const used = store.redemptions.filter((r) => r.couponId === coupon.id && r.userId === userId).length;
  if (coupon.maxUsesPerUser > 0 && used >= coupon.maxUsesPerUser) {
    return { ok: false, error: "per_user_limit" };
  }
  if (coupon.newUserOnly || coupon.firstBookingOnly) {
    const stats = await userBookingStats(userId);
    if (coupon.firstBookingOnly && stats.total > 0) return { ok: false, error: "not_first" };
    if (coupon.newUserOnly && !stats.isNewUser) return { ok: false, error: "not_new" };
  }
  return { ok: true };
}

async function couponDiscountUsd(coupon: LoyaltyCoupon, amountUsd: number): Promise<number> {
  if (coupon.discountType === "percent") {
    return Math.round(amountUsd * (coupon.discountValue / 100) * 100) / 100;
  }
  const fixedUsd = await amountToUsd(coupon.discountValue, coupon.currency || "USD");
  return Math.min(amountUsd, Math.round(fixedUsd * 100) / 100);
}

export async function quoteLoyalty(input: {
  amount: number;
  currency: string;
  service: LoyaltyService;
  userId?: string;
  couponCode?: string;
  voucherIds?: string[];
}): Promise<LoyaltyQuote> {
  const store = await getLoyaltyStore();
  const currency = String(input.currency || "USD").toUpperCase();
  const originalUsd = await amountToUsd(input.amount, currency);
  let discountUsd = 0;
  let couponCode: string | undefined;
  let couponId: string | undefined;
  const code = normalizeCouponCode(input.couponCode || "");
  if (code) {
    const coupon = store.coupons.find((c) => c.code === code);
    if (coupon && serviceMatches(coupon.service, input.service)) {
      const check = await couponUsable(coupon, input.userId, originalUsd);
      if (check.ok) {
        discountUsd += await couponDiscountUsd(coupon, originalUsd);
        couponCode = coupon.code;
        couponId = coupon.id;
      }
    }
  }
  const voucherIds: string[] = [];
  let voucherNotice: string | undefined;
  if (input.userId && input.voucherIds?.length) {
    const minBookingUsd = store.settings.minBookingAmountUsd ?? 500;
    if (originalUsd + 0.01 < minBookingUsd) {
      voucherNotice = `تنبيه: قسائم نقاط الولاء مخصصة للحجوزات التي تبدأ من $${minBookingUsd} فأكثر فقط. قيمة حجزك الحالية $${Math.round(originalUsd)}.`;
    } else {
      const maxPercent = store.settings.maxDiscountPercent ?? 15;
      const maxCapUsd = store.settings.maxVoucherDiscountUsd ?? 150;
      const maxVoucherAllowed = Math.min(
        Math.round(originalUsd * (maxPercent / 100) * 100) / 100,
        maxCapUsd
      );
      let appliedVoucherDiscount = 0;
      const wallet = findWallet(store, input.userId);
      for (const id of input.voucherIds) {
        const voucher = wallet.vouchers.find((v) => v.id === id && v.active && v.remainingUsd > 0);
        if (!voucher) continue;
        if (!serviceMatches(voucher.service, input.service)) continue;
        const availableBudget = Math.max(0, maxVoucherAllowed - appliedVoucherDiscount);
        const take = Math.min(voucher.remainingUsd, availableBudget);
        if (take <= 0) continue;
        appliedVoucherDiscount += take;
        voucherIds.push(voucher.id);
      }
      discountUsd += appliedVoucherDiscount;
      if (input.voucherIds.length > voucherIds.length) {
        voucherNotice = `تم تطبيق الحد الأقصى للخصم المسموح به (${maxPercent}% بما يعادل $${Math.round(appliedVoucherDiscount)}).`;
      }
    }
  }
  discountUsd = Math.min(originalUsd, Math.round(discountUsd * 100) / 100);
  const payableUsd = Math.max(0, Math.round((originalUsd - discountUsd) * 100) / 100);
  const payableAmount = await usdToAmount(payableUsd, currency);
  const pointsEarn = pointsFromUsd(store.settings, payableUsd > 0 ? payableUsd : originalUsd, input.service);
  return {
    originalAmount: Number(input.amount) || 0,
    originalCurrency: currency,
    originalUsd,
    discountUsd,
    payableUsd,
    payableAmount,
    payableCurrency: currency,
    couponCode,
    couponId,
    voucherIds,
    coveredInFull: voucherIds.length > 0 ? false : payableUsd <= 0.009,
    pointsEarn,
    pointsUsd: usdFromPoints(store.settings, pointsEarn),
    voucherNotice,
  };
}

export async function applyCouponToSession(
  codeRaw: string,
  service: LoyaltyService,
  userId?: string
): Promise<{ ok: true; coupon: ReturnType<typeof publicCoupon> } | { ok: false; error: string }> {
  const code = normalizeCouponCode(codeRaw);
  if (!code) return { ok: false, error: "invalid_code" };
  const store = await getLoyaltyStore();
  const coupon = store.coupons.find((c) => c.code === code);
  if (!coupon) return { ok: false, error: "not_found" };
  if (!serviceMatches(coupon.service, service)) return { ok: false, error: "service" };
  const check = await couponUsable(coupon, userId, 999999);
  if (!check.ok) return check;
  return { ok: true, coupon: publicCoupon(coupon, "en") };
}

function appendLedger(wallet: LoyaltyWallet, entry: LoyaltyLedgerEntry): void {
  wallet.ledger.unshift(entry);
  wallet.ledger = wallet.ledger.slice(0, 200);
}

export async function getWalletForUser(userId: string): Promise<LoyaltyWallet> {
  if (!userId) return emptyWallet("");
  const store = await getLoyaltyStore();
  return findWallet(store, userId);
}

export async function convertPointsToVoucher(
  userId: string,
  pointsRaw: number
): Promise<{ ok: true; voucher: LoyaltyVoucher; wallet: LoyaltyWallet } | { ok: false; error: string }> {
  const points = Math.floor(Number(pointsRaw) || 0);
  return mutate((store) => {
    const settings = store.settings;
    if (points < settings.minConvertPoints) return { ok: false as const, error: "min_points" };
    const wallet = findWallet(store, userId);
    if (wallet.points < points) return { ok: false as const, error: "insufficient" };
    const usd = usdFromPoints(settings, points);
    if (usd <= 0) return { ok: false as const, error: "invalid_amount" };
    wallet.points = Math.round((wallet.points - points) * 100) / 100;
    const voucher: LoyaltyVoucher = {
      id: newLoyaltyId("vch"),
      userId,
      code: `AR${newLoyaltyId("P").slice(-6).toUpperCase()}`,
      source: "points",
      amountUsd: usd,
      remainingUsd: usd,
      service: "all",
      active: true,
      createdAt: nowIso(),
    };
    wallet.vouchers.unshift(voucher);
    appendLedger(wallet, {
      id: newLoyaltyId("ldg"),
      userId,
      kind: "convert",
      status: "confirmed",
      points: -points,
      usdValue: usd,
      voucherId: voucher.id,
      note: "points_to_voucher",
      createdAt: nowIso(),
    });
    putWallet(store, wallet);
    return { ok: true as const, voucher, wallet };
  });
}

export async function redeemOnBooking(input: {
  userId: string;
  bookingId: string;
  service: LoyaltyService;
  amount: number;
  currency: string;
  couponCode?: string;
  voucherIds?: string[];
  confirmEarn: boolean;
}): Promise<LoyaltyQuote> {
  const quote = await quoteLoyalty({
    amount: input.amount,
    currency: input.currency,
    service: input.service,
    userId: input.userId,
    couponCode: input.couponCode,
    voucherIds: input.voucherIds,
  });
  const couponOnly = quote.couponCode
    ? await quoteLoyalty({
        amount: input.amount,
        currency: input.currency,
        service: input.service,
        userId: input.userId,
        couponCode: quote.couponCode,
      })
    : null;
  let voucherBudget = Math.max(0, quote.discountUsd - (couponOnly?.discountUsd || 0));

  await mutate((store) => {
    const wallet = findWallet(store, input.userId);
    if (quote.couponId) {
      const already = store.redemptions.some(
        (r) => r.couponId === quote.couponId && r.bookingId === input.bookingId
      );
      if (!already) {
        store.redemptions.push({
          id: newLoyaltyId("rdm"),
          couponId: quote.couponId,
          userId: input.userId,
          bookingId: input.bookingId,
          createdAt: nowIso(),
        });
        store.coupons = store.coupons.map((c) =>
          c.id === quote.couponId ? { ...c, usedCount: c.usedCount + 1, updatedAt: nowIso() } : c
        );
      }
    }
    for (const id of quote.voucherIds) {
      const voucher = wallet.vouchers.find((v) => v.id === id);
      if (!voucher) continue;
      const take = Math.min(voucher.remainingUsd, voucherBudget);
      if (take <= 0) continue;
      voucherBudget = Math.max(0, voucherBudget - take);
      voucher.remainingUsd = Math.round((voucher.remainingUsd - take) * 100) / 100;
      if (voucher.remainingUsd <= 0.009) voucher.active = false;
      appendLedger(wallet, {
        id: newLoyaltyId("ldg"),
        userId: input.userId,
        kind: "redeem",
        status: "confirmed",
        points: 0,
        usdValue: -take,
        bookingId: input.bookingId,
        voucherId: voucher.id,
        service: input.service,
        createdAt: nowIso(),
      });
    }
    const alreadyEarn = wallet.ledger.some(
      (row) => row.kind === "earn" && row.bookingId === input.bookingId
    );
    if (!alreadyEarn && quote.pointsEarn > 0 && store.settings.enabled) {
      const entry: LoyaltyLedgerEntry = {
        id: newLoyaltyId("ldg"),
        userId: input.userId,
        kind: "earn",
        status: input.confirmEarn ? "confirmed" : "pending",
        points: quote.pointsEarn,
        usdValue: quote.pointsUsd,
        bookingId: input.bookingId,
        service: input.service,
        createdAt: nowIso(),
      };
      appendLedger(wallet, entry);
      if (input.confirmEarn) wallet.points += quote.pointsEarn;
      else wallet.pendingPoints += quote.pointsEarn;
    }
    putWallet(store, wallet);
  });
  return quote;
}

export async function confirmBookingPoints(bookingId: string, userId?: string): Promise<void> {
  if (!bookingId) return;
  await mutate((store) => {
    const wallets = userId
      ? [findWallet(store, userId)]
      : store.wallets.filter((w) => w.ledger.some((row) => row.bookingId === bookingId));
    for (const wallet of wallets) {
      if (!wallet.userId) continue;
      let changed = false;
      wallet.ledger = wallet.ledger.map((row) => {
        if (row.kind !== "earn" || row.bookingId !== bookingId || row.status === "confirmed") {
          return row;
        }
        wallet.pendingPoints = Math.max(0, wallet.pendingPoints - row.points);
        wallet.points += row.points;
        changed = true;
        return { ...row, status: "confirmed" as const };
      });
      if (changed) putWallet(store, wallet);
    }
  });
}

export function enquiryTypeToService(type: string): LoyaltyService {
  switch (type) {
    case "flight":
      return "flights";
    case "hotel":
      return "hotels";
    case "transfer":
      return "transfers";
    case "car":
      return "cars";
    case "package":
    case "tour":
      return "packages";
    default:
      return "all";
  }
}

export function walletSummary(wallet: LoyaltyWallet, settings: LoyaltySettings) {
  const activeVouchers = wallet.vouchers.filter((v) => v.active && v.remainingUsd > 0);
  return {
    points: wallet.points,
    pendingPoints: wallet.pendingPoints,
    usd: usdFromPoints(settings, wallet.points),
    pendingUsd: usdFromPoints(settings, wallet.pendingPoints),
    vouchers: activeVouchers,
    ledger: wallet.ledger.slice(0, 40),
    settings: {
      pointsPerUsd: settings.pointsPerUsd,
      pointsPerUsdRedeem: settings.pointsPerUsdRedeem,
      minConvertPoints: settings.minConvertPoints,
      enabled: settings.enabled,
      requireAdminApproval: settings.requireAdminApproval,
      minBookingAmountUsd: settings.minBookingAmountUsd,
      maxDiscountPercent: settings.maxDiscountPercent,
      maxVoucherDiscountUsd: settings.maxVoucherDiscountUsd,
      autoApproveVerifiedBookings: settings.autoApproveVerifiedBookings,
    },
  };
}

export function isLoyaltyServiceName(value: string): value is LoyaltyService {
  return isLoyaltyService(value);
}

export async function creditCommunityPoints(
  userId: string,
  points: number,
  action: string,
  note: string,
  eventId?: string,
  isVerifiedBookingCustomer?: boolean
): Promise<{ ok: boolean; awarded: number; totalPoints: number; isPending: boolean }> {
  if (!userId || points <= 0) return { ok: false, awarded: 0, totalPoints: 0, isPending: false };
  return mutate((store) => {
    const wallet = findWallet(store, userId);
    if (eventId && wallet.ledger.some((l) => l.note?.includes(eventId))) {
      return { ok: false, awarded: 0, totalPoints: wallet.points, isPending: false };
    }
    const settings = store.settings;
    const requireApproval = Boolean(settings.requireAdminApproval);
    const autoApprove = Boolean(settings.autoApproveVerifiedBookings && isVerifiedBookingCustomer);
    const isPending = requireApproval && !autoApprove;

    if (isPending) {
      wallet.pendingPoints = Math.round((wallet.pendingPoints + points) * 100) / 100;
    } else {
      wallet.points = Math.round((wallet.points + points) * 100) / 100;
    }

    const entry: LoyaltyLedgerEntry = {
      id: newLoyaltyId("soc"),
      userId,
      kind: "earn",
      status: isPending ? "pending" : "confirmed",
      points,
      usdValue: usdFromPoints(store.settings, points),
      note: `${note}${eventId ? ` [${eventId}]` : ""}`,
      createdAt: nowIso(),
    };
    appendLedger(wallet, entry);
    putWallet(store, wallet);
    return { ok: true, awarded: points, totalPoints: wallet.points, isPending };
  });
}

export async function listAllPendingPoints(): Promise<{
  pendingCount: number;
  pendingTotalPoints: number;
  pendingTotalUsd: number;
  items: Array<{
    id: string;
    userId: string;
    points: number;
    usdValue: number;
    note?: string;
    createdAt: string;
    bookingId?: string;
    kind: string;
  }>;
}> {
  const store = await getLoyaltyStore();
  const items: Array<{
    id: string;
    userId: string;
    points: number;
    usdValue: number;
    note?: string;
    createdAt: string;
    bookingId?: string;
    kind: string;
  }> = [];

  let pendingTotalPoints = 0;
  let pendingTotalUsd = 0;

  for (const wallet of store.wallets) {
    for (const row of wallet.ledger) {
      if (row.status === "pending") {
        items.push({
          id: row.id,
          userId: wallet.userId,
          points: row.points,
          usdValue: row.usdValue,
          note: row.note,
          createdAt: row.createdAt,
          bookingId: row.bookingId,
          kind: row.kind,
        });
        pendingTotalPoints += row.points;
        pendingTotalUsd += row.usdValue;
      }
    }
  }

  items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

  return {
    pendingCount: items.length,
    pendingTotalPoints,
    pendingTotalUsd: Math.round(pendingTotalUsd * 100) / 100,
    items,
  };
}

export async function approvePointEntry(
  entryId: string,
  adminUser = "إدارة المنصة"
): Promise<{ ok: boolean; message?: string }> {
  return mutate((store) => {
    let targetWallet: LoyaltyWallet | undefined;
    let targetEntry: LoyaltyLedgerEntry | undefined;

    for (const wallet of store.wallets) {
      const match = wallet.ledger.find((l) => l.id === entryId && l.status === "pending");
      if (match) {
        targetWallet = wallet;
        targetEntry = match;
        break;
      }
    }

    if (!targetWallet || !targetEntry) {
      return { ok: false, message: "السجل غير موجود أو تم البت فيه مسبقاً" };
    }

    targetEntry.status = "confirmed";
    targetEntry.approvedAt = nowIso();
    targetEntry.approvedBy = adminUser;

    targetWallet.pendingPoints = Math.max(0, targetWallet.pendingPoints - targetEntry.points);
    targetWallet.points = Math.round((targetWallet.points + targetEntry.points) * 100) / 100;

    putWallet(store, targetWallet);
    return { ok: true, message: "تم اعتماد النقاط بنجاح ونقلها للرصيد المؤكد" };
  });
}

export async function rejectPointEntry(
  entryId: string,
  reason = "مرفوض من قبل الإدارة"
): Promise<{ ok: boolean; message?: string }> {
  return mutate((store) => {
    let targetWallet: LoyaltyWallet | undefined;
    let targetEntry: LoyaltyLedgerEntry | undefined;

    for (const wallet of store.wallets) {
      const match = wallet.ledger.find((l) => l.id === entryId && l.status === "pending");
      if (match) {
        targetWallet = wallet;
        targetEntry = match;
        break;
      }
    }

    if (!targetWallet || !targetEntry) {
      return { ok: false, message: "السجل غير موجود أو تم البت فيه مسبقاً" };
    }

    targetEntry.status = "rejected";
    targetEntry.rejectionReason = reason;

    targetWallet.pendingPoints = Math.max(0, targetWallet.pendingPoints - targetEntry.points);

    putWallet(store, targetWallet);
    return { ok: true, message: "تم رفض النقاط وتجميدها" };
  });
}

export async function approveAllPendingPoints(
  adminUser = "إدارة المنصة"
): Promise<{ ok: boolean; approvedCount: number }> {
  return mutate((store) => {
    let count = 0;
    const now = nowIso();
    for (const wallet of store.wallets) {
      let walletChanged = false;
      for (const row of wallet.ledger) {
        if (row.status === "pending") {
          row.status = "confirmed";
          row.approvedAt = now;
          row.approvedBy = adminUser;
          wallet.pendingPoints = Math.max(0, wallet.pendingPoints - row.points);
          wallet.points = Math.round((wallet.points + row.points) * 100) / 100;
          walletChanged = true;
          count++;
        }
      }
      if (walletChanged) {
        putWallet(store, wallet);
      }
    }
    return { ok: true, approvedCount: count };
  });
}


