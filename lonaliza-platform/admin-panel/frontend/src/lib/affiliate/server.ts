import { createHash, randomBytes } from "crypto";
import type PocketBase from "pocketbase";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import {
  AFFILIATE_REF_COOKIE,
  DEFAULT_AFFILIATE_SETTINGS,
  DEFAULT_COMMISSIONS,
  SITE_ORIGIN,
  AFFILIATE_SHARE_PAGES,
  computeCommission,
  isAffiliateService,
  isValidRefCode,
  normalizeRefCode,
  serviceFromPath,
  type AffiliateCommissions,
  type AffiliateConversion,
  type AffiliateProfile,
  type AffiliateService,
  type AffiliateSettings,
  type AffiliateVisit,
  type AffiliateWithdrawal,
  type CommissionRule,
} from "@/lib/affiliate/types";

export {
  AFFILIATE_REF_COOKIE,
  SITE_ORIGIN,
  AFFILIATE_SHARE_PAGES,
  computeCommission,
  isAffiliateService,
  isValidRefCode,
  normalizeRefCode,
  serviceFromPath,
};

function hashIp(ip: string): string {
  if (!ip) return "";
  return createHash("sha256").update(`alrayyan-aff:${ip}`).digest("hex").slice(0, 20);
}

function sanitizeCommissions(raw: unknown): AffiliateCommissions {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const next = { ...DEFAULT_COMMISSIONS };
  for (const key of Object.keys(next) as AffiliateService[]) {
    const item = src[key];
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const type = rec.type === "fixed" ? "fixed" : "percent";
    const value = Number(rec.value);
    next[key] = {
      type,
      value: Number.isFinite(value) ? value : DEFAULT_COMMISSIONS[key].value,
    };
  }
  return next;
}

function settingsFromRecord(row: Record<string, unknown>): AffiliateSettings {
  return {
    id: String(row.id || ""),
    enabled: row.enabled !== false,
    cookie_days: Math.max(1, Math.round(Number(row.cookie_days) || 30)),
    min_withdraw: Math.max(0, Number(row.min_withdraw) || 100),
    commissions: sanitizeCommissions(row.commissions),
  };
}

export async function getAffiliateSettings(
  pb?: PocketBase | null
): Promise<AffiliateSettings> {
  const admin = pb || (await tryCreateAdminPocketBase());
  if (!admin) {
    return { id: "", ...DEFAULT_AFFILIATE_SETTINGS };
  }
  try {
    const rows = await admin.collection("affiliate_settings").getFullList({
      sort: "-id",
    });
    if (rows[0]) return settingsFromRecord(rows[0] as unknown as Record<string, unknown>);
    const created = await admin.collection("affiliate_settings").create({
      ...DEFAULT_AFFILIATE_SETTINGS,
    });
    return settingsFromRecord(created as unknown as Record<string, unknown>);
  } catch {
    return { id: "", ...DEFAULT_AFFILIATE_SETTINGS };
  }
}

export async function saveAffiliateSettings(
  patch: Partial<AffiliateSettings>
): Promise<AffiliateSettings> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) throw new Error("PocketBase unavailable");
  const current = await getAffiliateSettings(pb);
  const next = {
    enabled: patch.enabled ?? current.enabled,
    cookie_days: patch.cookie_days ?? current.cookie_days,
    min_withdraw: patch.min_withdraw ?? current.min_withdraw,
    commissions: patch.commissions
      ? sanitizeCommissions(patch.commissions)
      : current.commissions,
  };
  if (current.id) {
    const updated = await pb.collection("affiliate_settings").update(current.id, next);
    return settingsFromRecord(updated as unknown as Record<string, unknown>);
  }
  const created = await pb.collection("affiliate_settings").create(next);
  return settingsFromRecord(created as unknown as Record<string, unknown>);
}

function randomCode(prefix = "AR"): string {
  const body = randomBytes(3).toString("hex").toUpperCase().slice(0, 5);
  return normalizeRefCode(`${prefix}${body}`);
}

export async function getOrCreateAffiliateProfile(
  userId: string,
  name?: string
): Promise<AffiliateProfile> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) throw new Error("PocketBase unavailable");
  try {
    return await pb
      .collection("affiliate_profiles")
      .getFirstListItem<AffiliateProfile>(`user = "${userId}"`);
  } catch {
    /* create */
  }

  const prefix = String(name || "AR")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase() || "AR";

  for (let i = 0; i < 8; i++) {
    const code = randomCode(prefix);
    try {
      return await pb.collection("affiliate_profiles").create<AffiliateProfile>({
        user: userId,
        code,
        status: "active",
      });
    } catch {
      /* unique collision — retry */
    }
  }
  throw new Error("Could not allocate referral code");
}

export async function findAffiliateByCode(
  code: string,
  pb?: PocketBase | null
): Promise<AffiliateProfile | null> {
  const normalized = normalizeRefCode(code);
  if (!isValidRefCode(normalized)) return null;
  const admin = pb || (await tryCreateAdminPocketBase());
  if (!admin) return null;
  try {
    return await admin
      .collection("affiliate_profiles")
      .getFirstListItem<AffiliateProfile>(`code = "${normalized}"`);
  } catch {
    return null;
  }
}

export function refCookieHeader(code: string, days: number): string {
  const maxAge = Math.max(1, days) * 24 * 60 * 60;
  return `${AFFILIATE_REF_COOKIE}=${encodeURIComponent(normalizeRefCode(code))}; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

export async function logAffiliateVisit(opts: {
  code: string;
  path: string;
  service?: AffiliateService;
  ip?: string;
  ua?: string;
}): Promise<AffiliateVisit | null> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  const settings = await getAffiliateSettings(pb);
  if (!settings.enabled) return null;
  const code = normalizeRefCode(opts.code);
  const profile = await findAffiliateByCode(code, pb);
  if (!profile || profile.status !== "active") return null;
  const path = (opts.path || "/").split("?")[0].slice(0, 300) || "/";
  const service = opts.service && isAffiliateService(opts.service) ? opts.service : "other";
  return pb.collection("affiliate_visits").create<AffiliateVisit>({
    code,
    path,
    service,
    ip_hash: hashIp(opts.ip || ""),
    ua: String(opts.ua || "").slice(0, 240),
  });
}

export async function createPendingConversion(opts: {
  code: string;
  service: AffiliateService;
  bookingAmount?: number;
  commission?: number;
  notes?: string;
  tpRef?: string;
  bookingId?: string;
  path?: string;
}): Promise<AffiliateConversion | null> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  const settings = await getAffiliateSettings(pb);
  if (!settings.enabled) return null;
  const code = normalizeRefCode(opts.code);
  const profile = await findAffiliateByCode(code, pb);
  if (!profile || profile.status !== "active") return null;
  const amount = Math.max(0, Number(opts.bookingAmount) || 0);
  const rule: CommissionRule | undefined = settings.commissions[opts.service];
  const commission =
    typeof opts.commission === "number"
      ? Math.max(0, opts.commission)
      : computeCommission(amount, rule);
  return pb.collection("affiliate_conversions").create<AffiliateConversion>({
    user: profile.user || "",
    code,
    service: opts.service,
    status: "pending",
    booking_amount: amount,
    commission,
    notes: String(opts.notes || "").slice(0, 2000),
    tp_ref: String(opts.tpRef || "").slice(0, 200),
    booking_id: String(opts.bookingId || "").slice(0, 80),
    path: String(opts.path || "").slice(0, 300),
  });
}

export type WalletSummary = {
  approved: number;
  pending: number;
  withdrawn: number;
  pendingWithdraw: number;
  rejectedWithdraw: number;
  balance: number;
};

export async function getWalletSummary(userId: string): Promise<WalletSummary> {
  const pb = await tryCreateAdminPocketBase();
  const empty: WalletSummary = {
    approved: 0,
    pending: 0,
    withdrawn: 0,
    pendingWithdraw: 0,
    rejectedWithdraw: 0,
    balance: 0,
  };
  if (!pb) return empty;

  const [conversions, withdrawals] = await Promise.all([
    pb.collection("affiliate_conversions").getFullList<AffiliateConversion>({
      filter: `user = "${userId}"`,
      sort: "-id",
    }),
    pb.collection("affiliate_withdrawals").getFullList<AffiliateWithdrawal>({
      filter: `user = "${userId}"`,
      sort: "-id",
    }),
  ]);

  const approved = conversions
    .filter((c) => c.status === "approved")
    .reduce((s, c) => s + (Number(c.commission) || 0), 0);
  const pending = conversions
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + (Number(c.commission) || 0), 0);
  const withdrawn = withdrawals
    .filter((w) => w.status === "paid")
    .reduce((s, w) => s + (Number(w.amount) || 0), 0);
  const pendingWithdraw = withdrawals
    .filter((w) => w.status === "pending")
    .reduce((s, w) => s + (Number(w.amount) || 0), 0);
  const rejectedWithdraw = withdrawals
    .filter((w) => w.status === "rejected")
    .reduce((s, w) => s + (Number(w.amount) || 0), 0);

  return {
    approved: roundMoney(approved),
    pending: roundMoney(pending),
    withdrawn: roundMoney(withdrawn),
    pendingWithdraw: roundMoney(pendingWithdraw),
    rejectedWithdraw: roundMoney(rejectedWithdraw),
    balance: roundMoney(approved - withdrawn - pendingWithdraw),
  };
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function shareLinksForCode(code: string): Array<{
  key: string;
  path: string;
  service: AffiliateService;
  url: string;
  shortUrl: string;
}> {
  const normalized = normalizeRefCode(code);
  return AFFILIATE_SHARE_PAGES.map((page) => ({
    ...page,
    url: `${SITE_ORIGIN}${page.path === "/" ? "/" : page.path}?ref=${normalized}`,
    shortUrl: `${SITE_ORIGIN}/r/${normalized}`,
  }));
}
