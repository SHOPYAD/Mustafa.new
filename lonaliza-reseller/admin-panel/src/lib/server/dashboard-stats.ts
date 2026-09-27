import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { listInternalCars } from "@/lib/server/cars-store";
import { getGeminiSettingsSnapshot } from "@/lib/server/gemini";
import { listCustomPages } from "@/lib/server/pages-store";
import { getRapidApiQuotaStats } from "@/lib/server/rapidapi-quota-stats";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";
import { reverseHotelMarkup } from "@/lib/hotels-runtime";
import { getLoyaltyStore } from "@/lib/loyalty/store";
import { usdFromPoints } from "@/lib/loyalty/server";
import { convertAmountSafe } from "@/lib/server/fx-service";
import type {
  DashboardAffiliateStats,
  DashboardCouponStats,
  DashboardEconomicsRow,
  DashboardEconomicsStats,
  DashboardLoyaltyStats,
  DashboardNamedCount,
  DashboardQuotaSnap,
  DashboardRecentBooking,
  DashboardStats,
} from "@/types/dashboard-stats";

const VISIT_SAMPLE = 500;
const RECENT_LIMIT = 8;

const ECONOMICS_KEYS = [
  "hotel",
  "flight",
  "package",
  "transfer",
  "car",
  "tour",
  "visa",
  "other",
] as const;

type EconomicsKey = (typeof ECONOMICS_KEYS)[number];

function dayKey(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  return new Date(t).toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)
    );
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function bump(map: Map<string, number>, key: string, by = 1) {
  const k = key.trim() || "unknown";
  map.set(k, (map.get(k) || 0) + by);
}

function namedFromMap(
  map: Map<string, number>,
  order?: string[]
): DashboardNamedCount[] {
  if (order?.length) {
    return order.map((key) => ({ key, count: map.get(key) || 0 }));
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count }));
}

function fillDays(counts: Map<string, number>, n = 14) {
  return lastNDays(n).map((date) => ({
    date,
    count: counts.get(date) || 0,
  }));
}

function paymentBucket(status: string, paymentStatus: string): "paid" | "pending" | "refunded" | "other" {
  const raw = `${status} ${paymentStatus}`.toLowerCase();
  if (/refund/.test(raw)) return "refunded";
  if (/\bpaid\b|success|captured/.test(raw)) return "paid";
  if (/pending|init|waiting|created/.test(raw)) return "pending";
  if (/cancel|fail|reject/.test(raw)) return "other";
  return "other";
}

function asRecord(row: unknown): Record<string, unknown> {
  return row && typeof row === "object" ? (row as Record<string, unknown>) : {};
}

function str(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v != null && String(v).trim()) return String(v);
  }
  return "";
}

function num(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const n = Number(row[key]);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function deviceFromUa(ua: string): "mobile" | "tablet" | "desktop" {
  const raw = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(raw)) return "tablet";
  if (/mobi|iphone|android(?!.*tablet)|webos|blackberry|iemobile/.test(raw)) return "mobile";
  return "desktop";
}

function economicsKeyFromType(type: string): EconomicsKey {
  const raw = type.toLowerCase();
  if (raw.includes("hotel")) return "hotel";
  if (raw.includes("flight")) return "flight";
  if (raw.includes("package") || raw.includes("holiday")) return "package";
  if (raw.includes("transfer")) return "transfer";
  if (raw.includes("car")) return "car";
  if (raw.includes("tour")) return "tour";
  if (raw.includes("visa")) return "visa";
  return "other";
}

async function toUsd(amount: number, currency: string): Promise<number> {
  const n = Number(amount);
  if (!Number.isFinite(n) || n === 0) return 0;
  const code = String(currency || "USD").toUpperCase();
  if (code === "USD") return Math.round(n * 100) / 100;
  const usd = await convertAmountSafe(n, code, "USD");
  return Math.round((Number.isFinite(usd) ? usd : 0) * 100) / 100;
}

async function countCollection(
  pb: NonNullable<Awaited<ReturnType<typeof tryCreateAdminPocketBase>>>,
  name: string,
  filter?: string
): Promise<number> {
  try {
    const page = await pb.collection(name).getList(1, 1, filter ? { filter } : {});
    return page.totalItems;
  } catch {
    return 0;
  }
}

function toQuotaSnap(
  snap: Awaited<ReturnType<typeof getRapidApiQuotaStats>>["booking"]
): DashboardQuotaSnap {
  return {
    provider: snap.provider,
    monthKey: snap.monthKey,
    liveCalls: snap.liveCalls,
    success: snap.success,
    failed: snap.failed,
    quota429: snap.quota429,
    headerLimit: snap.headerLimit,
    headerRemaining: snap.headerRemaining,
    headerReset: snap.headerReset,
    lastCallAt: snap.lastCallAt,
    changeKey: snap.advice.changeKey,
  };
}

function emptyAffiliate(): DashboardAffiliateStats {
  return {
    available: false,
    marketers: 0,
    visits: 0,
    conversions: 0,
    earningsPaidUsd: 0,
    earningsPendingUsd: 0,
  };
}

function emptyLoyalty(): DashboardLoyaltyStats {
  return {
    available: false,
    pointsIssued: 0,
    pointsRedeemed: 0,
    pointsUsd: 0,
    walletBalance: 0,
    pendingPoints: 0,
    wallets: 0,
  };
}

function emptyCoupons(): DashboardCouponStats {
  return {
    available: false,
    created: 0,
    used: 0,
    discountUsd: 0,
    byService: [],
  };
}

function emptyEconomics(): DashboardEconomicsStats {
  return {
    available: false,
    estimated: false,
    costUsd: 0,
    profitUsd: 0,
    paidUsd: 0,
    hotelMarkupProfitUsd: 0,
    flightMarkupProfitUsd: 0,
    byService: ECONOMICS_KEYS.map((key) => ({
      key,
      costUsd: 0,
      profitUsd: 0,
      paidUsd: 0,
      bookings: 0,
    })),
    last14Days: lastNDays(14).map((date) => ({ date, cost: 0, profit: 0, paid: 0 })),
  };
}

async function collectLoyaltyAndCoupons(): Promise<{
  loyalty: DashboardLoyaltyStats;
  coupons: DashboardCouponStats;
}> {
  try {
    const store = await getLoyaltyStore();
    let issued = 0;
    let redeemed = 0;
    let walletBalance = 0;
    let pendingPoints = 0;
    let couponDiscountUsd = 0;
    for (const wallet of store.wallets) {
      walletBalance += wallet.points;
      pendingPoints += wallet.pendingPoints;
      for (const entry of wallet.ledger) {
        if (entry.kind === "earn" && entry.status === "confirmed") {
          issued += entry.points;
        }
        if (entry.kind === "redeem" || entry.kind === "convert") {
          redeemed += Math.abs(entry.points);
        }
        if (entry.couponId && entry.usdValue > 0) {
          couponDiscountUsd += entry.usdValue;
        }
      }
    }
    const byService = new Map<string, number>();
    let used = 0;
    for (const coupon of store.coupons) {
      used += coupon.usedCount;
      bump(byService, coupon.service, coupon.usedCount);
      if (coupon.discountType === "fixed") {
        const usd = await toUsd(coupon.discountValue * coupon.usedCount, coupon.currency);
        couponDiscountUsd += usd;
      }
    }
    return {
      loyalty: {
        available: true,
        pointsIssued: issued,
        pointsRedeemed: redeemed,
        pointsUsd: usdFromPoints(store.settings, issued),
        walletBalance,
        pendingPoints,
        wallets: store.wallets.length,
      },
      coupons: {
        available: true,
        created: store.coupons.length,
        used: Math.max(used, store.redemptions.length),
        discountUsd: Math.round(couponDiscountUsd * 100) / 100,
        byService: namedFromMap(byService),
      },
    };
  } catch {
    return { loyalty: emptyLoyalty(), coupons: emptyCoupons() };
  }
}

async function collectAffiliate(
  pb: NonNullable<Awaited<ReturnType<typeof tryCreateAdminPocketBase>>> | null
): Promise<DashboardAffiliateStats> {
  if (!pb) return emptyAffiliate();
  try {
    const [marketers, visits, conversionRows, withdrawalRows] = await Promise.all([
      countCollection(pb, "affiliate_profiles"),
      countCollection(pb, "affiliate_visits"),
      pb
        .collection("affiliate_conversions")
        .getFullList({ fields: "id,status,commission" })
        .catch(() => []),
      pb
        .collection("affiliate_withdrawals")
        .getFullList({ fields: "id,status,amount" })
        .catch(() => []),
    ]);
    let pending = 0;
    let paid = 0;
    for (const raw of conversionRows) {
      const row = asRecord(raw);
      const commission = num(row, "commission");
      const status = str(row, "status");
      if (status === "approved") pending += commission;
      if (status === "pending") pending += commission;
    }
    for (const raw of withdrawalRows) {
      const row = asRecord(raw);
      const amount = num(row, "amount");
      const status = str(row, "status");
      if (status === "paid") paid += amount;
      if (status === "pending") pending += amount;
    }
    return {
      available: true,
      marketers,
      visits,
      conversions: conversionRows.length,
      earningsPaidUsd: Math.round(paid * 100) / 100,
      earningsPendingUsd: Math.round(pending * 100) / 100,
    };
  } catch {
    return { ...emptyAffiliate(), available: true };
  }
}

export async function collectDashboardStats(): Promise<DashboardStats> {
  const [cars, pages, gemini, quotas, loyaltyBundle, hotelsRuntime, flightsRuntime] =
    await Promise.all([
      listInternalCars().catch(() => []),
      listCustomPages().catch(() => []),
      getGeminiSettingsSnapshot(),
      getRapidApiQuotaStats(),
      collectLoyaltyAndCoupons(),
      getHotelsRuntime(),
      getFlightsRuntime(),
    ]);

  const empty: DashboardStats = {
    pocketbase: false,
    generatedAt: new Date().toISOString(),
    bookings: {
      total: 0,
      enquiries: 0,
      hotelBookings: 0,
      byStatus: [],
      byType: [],
      last14Days: fillDays(new Map()),
      recent: [],
    },
    customers: { total: 0 },
    payments: {
      records: 0,
      paid: 0,
      pending: 0,
      refunded: 0,
      other: 0,
      totalsByCurrency: [],
      available: false,
    },
    services: {
      cars: {
        total: cars.length,
        active: cars.filter((c) => c.isActive).length,
      },
      pages: { total: pages.length },
      ownedHotels: 0,
    },
    gemini: {
      date: gemini.usageToday.date,
      freeCount: gemini.usageToday.freeCount,
      paidCount: gemini.usageToday.paidCount,
      freeLimit: gemini.dailyFreeChatLimit,
      paidLimit: gemini.dailyPaidChatLimit,
    },
    providers: {
      booking: toQuotaSnap(quotas.booking),
      travel_advisor: toQuotaSnap(quotas.travel_advisor),
      sky_scrapper: toQuotaSnap(quotas.sky_scrapper),
    },
    traffic: {
      source: "admin_notifications.visit",
      available: false,
      sampled: 0,
      total: 0,
      uniqueSessions: 0,
      uniqueIps: 0,
      topPages: [],
      last14Days: fillDays(new Map()),
      countriesAvailable: false,
      devicesAvailable: false,
      devices: [],
      countries: [],
    },
    affiliate: emptyAffiliate(),
    loyalty: loyaltyBundle.loyalty,
    coupons: loyaltyBundle.coupons,
    economics: emptyEconomics(),
  };

  const pb = await tryCreateAdminPocketBase();
  if (!pb) return empty;

  const affiliate = await collectAffiliate(pb);

  try {
    const [enquiryRows, hotelRows, visitPage, customerTotal, ownedHotels, trafficLogPage] = await Promise.all([
      pb
        .collection("enquiry_bookings")
        .getFullList({
          fields: "id,type,status,customer_name,service_name,created",
          sort: "-created",
        })
        .catch(() => []),
      pb
        .collection("hotel_bookings")
        .getFullList({
          fields:
            "id,status,payment_status,customer_name,hotel_name,charged_amount,charged_currency,display_amount,display_currency,price,currency,provider,created",
          sort: "-created",
        })
        .catch(() => []),
      pb
        .collection("admin_notifications")
        .getList(1, VISIT_SAMPLE, {
          filter: 'type = "visit"',
          fields: "id,meta,created",
          sort: "-created",
        })
        .catch(() => null),
      countCollection(pb, "customers"),
      countCollection(pb, "owned_hotels"),
      pb
        .collection("site_traffic_logs")
        .getList(1, VISIT_SAMPLE, {
          sort: "-created",
        })
        .catch(() => null),
    ]);

    const statusMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const dayMap = new Map<string, number>();
    const recent: DashboardRecentBooking[] = [];

    for (const raw of enquiryRows) {
      const row = asRecord(raw);
      const status = str(row, "status") || "new";
      const type = str(row, "type") || "general";
      bump(statusMap, status);
      bump(typeMap, type);
      const created = str(row, "created");
      const day = dayKey(created);
      if (day) bump(dayMap, day);
      recent.push({
        id: str(row, "id"),
        name: str(row, "customer_name") || "—",
        service: str(row, "service_name") || type,
        type,
        status,
        createdAt: created,
      });
    }

    const pay = {
      records: hotelRows.length,
      paid: 0,
      pending: 0,
      refunded: 0,
      other: 0,
      totals: new Map<string, { paid: number; refunded: number }>(),
    };

    const ecoRows = new Map<EconomicsKey, DashboardEconomicsRow>();
    for (const key of ECONOMICS_KEYS) {
      ecoRows.set(key, { key, costUsd: 0, profitUsd: 0, paidUsd: 0, bookings: 0 });
    }
    const ecoDays = new Map<string, { cost: number; profit: number; paid: number }>();
    for (const date of lastNDays(14)) {
      ecoDays.set(date, { cost: 0, profit: 0, paid: 0 });
    }
    let hotelMarkupProfitUsd = 0;
    let flightMarkupProfitUsd = 0;

    for (const raw of hotelRows) {
      const row = asRecord(raw);
      const status = str(row, "status") || "new";
      const paymentStatus = str(row, "payment_status");
      bump(statusMap, status === "cancelled" ? "resolved" : "new");
      bump(typeMap, "hotel");
      const created = str(row, "created");
      const day = dayKey(created);
      if (day) bump(dayMap, day);
      recent.push({
        id: `hotel:${str(row, "id")}`,
        name: str(row, "customer_name") || "—",
        service: str(row, "hotel_name") || "hotel",
        type: "hotel",
        status: status === "cancelled" ? "resolved" : "new",
        createdAt: created,
      });

      const bucket = paymentBucket(status, paymentStatus);
      if (bucket === "paid") pay.paid += 1;
      else if (bucket === "pending") pay.pending += 1;
      else if (bucket === "refunded") pay.refunded += 1;
      else pay.other += 1;
      const currency =
        str(row, "charged_currency", "display_currency", "currency") || "TRY";
      const amount =
        num(row, "charged_amount", "display_amount", "price") || 0;
      const cur = pay.totals.get(currency) || { paid: 0, refunded: 0 };
      if (bucket === "paid") cur.paid += amount;
      if (bucket === "refunded") cur.refunded += amount;
      pay.totals.set(currency, cur);

      if (bucket === "paid" && amount > 0) {
        const paidUsd = await toUsd(amount, currency);
        const reversed = reverseHotelMarkup(paidUsd, hotelsRuntime.markupRules, {
          provider: str(row, "provider") || "booking",
          currency,
        });
        const hotelRow = ecoRows.get("hotel")!;
        hotelRow.paidUsd += paidUsd;
        hotelRow.costUsd += reversed.cost;
        hotelRow.profitUsd += reversed.profit;
        hotelRow.bookings += 1;
        hotelMarkupProfitUsd += reversed.profit;
        if (day && ecoDays.has(day)) {
          const slot = ecoDays.get(day)!;
          slot.paid += paidUsd;
          slot.cost += reversed.cost;
          slot.profit += reversed.profit;
        }
      }
    }

    for (const raw of enquiryRows) {
      const row = asRecord(raw);
      const type = str(row, "type") || "general";
      const key = economicsKeyFromType(type);
      if (key === "hotel") continue;
      ecoRows.get(key)!.bookings += 1;
    }
    const flightRules = flightsRuntime.markupRules.filter((rule) => rule.enabled && rule.value > 0);
    if (flightRules.length && flightMarkupProfitUsd === 0) {
      flightMarkupProfitUsd = 0;
    }

    recent.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    const visitDays = new Map<string, number>();
    const pageMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();
    const sessions = new Set<string>();
    const ips = new Set<string>();
    const visitItems = visitPage?.items ?? [];
    for (const raw of visitItems) {
      const row = asRecord(raw);
      const meta = asRecord(row.meta);
      const path = str(meta, "path") || "/";
      bump(pageMap, path);
      const sid = str(meta, "session_id");
      const ip = str(meta, "ip_hash");
      const ua = str(meta, "ua", "user_agent");
      if (sid) sessions.add(sid);
      if (ip) ips.add(ip);
      if (ua) bump(deviceMap, deviceFromUa(ua));
      const day = dayKey(str(row, "created"));
      if (day) bump(visitDays, day);
    }

    const trafficLogItems = trafficLogPage?.items ?? [];
    for (const raw of trafficLogItems) {
      const row = asRecord(raw);
      const path = str(row, "path") || "/";
      bump(pageMap, path);
      const sid = str(row, "session_id");
      const device = str(row, "device") || "mobile";
      if (sid) sessions.add(sid);
      bump(deviceMap, device);
      const day = dayKey(str(row, "created"));
      if (day) bump(visitDays, day);
    }

    const topPages = [...pageMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key, count]) => ({ key, count }));

    const ecoByService = [...ecoRows.values()];
    const economics: DashboardEconomicsStats = {
      available: true,
      estimated: hotelMarkupProfitUsd > 0,
      costUsd: Math.round(ecoByService.reduce((s, r) => s + r.costUsd, 0) * 100) / 100,
      profitUsd: Math.round(ecoByService.reduce((s, r) => s + r.profitUsd, 0) * 100) / 100,
      paidUsd: Math.round(ecoByService.reduce((s, r) => s + r.paidUsd, 0) * 100) / 100,
      hotelMarkupProfitUsd: Math.round(hotelMarkupProfitUsd * 100) / 100,
      flightMarkupProfitUsd: Math.round(flightMarkupProfitUsd * 100) / 100,
      byService: ecoByService,
      last14Days: lastNDays(14).map((date) => {
        const slot = ecoDays.get(date) || { cost: 0, profit: 0, paid: 0 };
        return {
          date,
          cost: Math.round(slot.cost * 100) / 100,
          profit: Math.round(slot.profit * 100) / 100,
          paid: Math.round(slot.paid * 100) / 100,
        };
      }),
    };

    return {
      ...empty,
      pocketbase: true,
      bookings: {
        total: enquiryRows.length + hotelRows.length,
        enquiries: enquiryRows.length,
        hotelBookings: hotelRows.length,
        byStatus: namedFromMap(statusMap, ["new", "in-progress", "resolved"]),
        byType: namedFromMap(typeMap),
        last14Days: fillDays(dayMap),
        recent: recent.slice(0, RECENT_LIMIT),
      },
      customers: { total: customerTotal },
      payments: {
        records: pay.records,
        paid: pay.paid,
        pending: pay.pending,
        refunded: pay.refunded,
        other: pay.other,
        totalsByCurrency: [...pay.totals.entries()]
          .filter(([, v]) => v.paid > 0 || v.refunded > 0)
          .map(([currency, v]) => ({
            currency,
            paid: Math.round(v.paid * 100) / 100,
            refunded: Math.round(v.refunded * 100) / 100,
          })),
        available: true,
      },
      services: {
        ...empty.services,
        ownedHotels,
      },
      traffic: {
        source: "admin_notifications.visit",
        available: true,
        sampled: visitItems.length,
        total: visitPage?.totalItems ?? visitItems.length,
        uniqueSessions: sessions.size,
        uniqueIps: ips.size,
        topPages,
        last14Days: fillDays(visitDays),
        countriesAvailable: false,
        devicesAvailable: deviceMap.size > 0,
        devices: namedFromMap(deviceMap, ["desktop", "mobile", "tablet"]),
        countries: [],
      },
      affiliate,
      economics,
    };
  } catch {
    return { ...empty, pocketbase: true, affiliate };
  }
}
