import { randomBytes, createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";

export type ResellerSettings = {
  id?: string;
  lifetimePrice: number;
  updatePrice: number;
  currency: string;
  contaboSpecs: string;
  deliveryHours: string;
  supportWhatsapp: string;
  features: string[];
  whatsappBankEnabled: boolean;
  active: boolean;
};

export type ResellerCompany = {
  id: string;
  googleId?: string;
  email: string;
  companyName: string;
  companyNameAr?: string;
  logo?: string;
  requestedDomain?: string;
  phone?: string;
  status: "registered" | "paid" | "provisioning" | "active" | "suspended";
  notes?: string;
  planType?: "ownership" | "whitelabel_free" | "whitelabel_paid";
  subdomain?: string;
  customDomain?: string;
  customDomainStatus?: "none" | "pending" | "verified" | "active" | "rejected";
  taxId?: string;
  commercialReg?: string;
  legalAddress?: string;
  walletBalance?: number;
  walletHoldBalance?: number;
  b2bApiKeyMaster?: string;
  b2bApiSecret?: string;
  b2bApiKeyFlights?: string;
  b2bApiKeyHotels?: string;
  b2bApiKeyTransfers?: string;
  subscriptionStatus?: "active" | "suspended" | "cancelled" | "provisioning";
  updateSubscriptionActive?: boolean;
  updateSubscriptionExpiresAt?: string;
  monthlyPlanPrice?: number;
  autoRenewalMethod?: "card" | "wallet" | "none";
  cardToken?: string;
  cardLast4?: string;
  cardBrand?: string;
  lastBilledAt?: string;
  nextBillingAt?: string;
  created: string;
  updated: string;
};

export type ResellerLicense = {
  id: string;
  company: string;
  companyName?: string;
  companyEmail?: string;
  licenseKey: string;
  status: "issued" | "bound" | "revoked" | "expired";
  boundDomain?: string;
  firstActivation?: string;
  lastHeartbeat?: string;
  currentVersion?: string;
  online: boolean;
  created: string;
  updated: string;
};

export type ResellerStageTemplate = {
  id: string;
  titleAr: string;
  titleEn: string;
  titleTr?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  sortOrder: number;
  isDefault: boolean;
  icon?: string;
};

export type ResellerCompanyProgress = {
  id: string;
  company: string;
  stage: string;
  stageInfo?: ResellerStageTemplate;
  status: "pending" | "in_progress" | "done" | "skipped";
  notes?: string;
  completedAt?: string;
  created: string;
  updated: string;
};

export type ResellerServer = {
  id: string;
  company: string;
  ipAddress: string;
  aapanelUrl?: string;
  aapanelNotes?: string;
  contaboId?: string;
  region?: string;
  provisionedAt?: string;
  created: string;
  updated: string;
};

export type ResellerOrder = {
  id: string;
  company: string;
  orderType: "lifetime" | "update_subscription";
  amount: number;
  currency: string;
  method: "iyzico" | "whatsapp_bank";
  iyzicoToken?: string;
  iyzicoPaymentId?: string;
  status: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
  created: string;
  updated: string;
};

const DEFAULT_SETTINGS: ResellerSettings = {
  lifetimePrice: 1990,
  updatePrice: 50,
  currency: "USD",
  contaboSpecs: "Cloud VPS 6 — 6 vCPU Cores, 12 GB RAM, 200 GB NVMe SSD, Unlimited Traffic, DDoS Protection",
  deliveryHours: "12–24",
  supportWhatsapp: "+905015709201",
  features: [
    "نظام حجوزات طيران وفنادق وباقات وجولات وسيارات وترانسفير وتأشيرات موحد",
    "تكاملات RapidAPI و Travelpayouts و iyzico مفعلة",
    "لوحة تحكم إدارية شاملة مع إدارة العملاء والمدونة والترجمة الفورية",
    "محرر بصري متطور للصفحة الرئيسية والصفحات المخصصة",
    "ذكاء اصطناعي مدمج لتوليد البرامج السياحية والشات والتسعير الذكي",
    "استضافة سحابية سنة كاملة على سيرفر Contabo VPS مع لوحة aaPanel وشهادة SSL",
    "ربط الدومين الخاص بشركتك مع حساب كلاودفلير والبريد الرسمي",
  ],
  whatsappBankEnabled: true,
  active: true,
};

const DATA_DIR = path.join(process.cwd(), ".data");
const SETTINGS_FILE = path.join(DATA_DIR, "reseller-settings.json");

/**
 * Get reseller settings from PocketBase or local JSON cache.
 */
export async function getResellerSettings(): Promise<ResellerSettings> {
  try {
    const pb = await createAdminPocketBase();
    const records = await pb.collection("reseller_settings").getFullList({ limit: 1 });
    if (records.length > 0) {
      const r = records[0];
      let features: string[] = [];
      try {
        features = typeof r.features === "string" ? JSON.parse(r.features) : (r.features || []);
      } catch {
        features = DEFAULT_SETTINGS.features;
      }
      return {
        id: r.id,
        lifetimePrice: Number(r.lifetimePrice) || DEFAULT_SETTINGS.lifetimePrice,
        updatePrice: Number(r.updatePrice) || DEFAULT_SETTINGS.updatePrice,
        currency: r.currency || DEFAULT_SETTINGS.currency,
        contaboSpecs: r.contaboSpecs || DEFAULT_SETTINGS.contaboSpecs,
        deliveryHours: r.deliveryHours || DEFAULT_SETTINGS.deliveryHours,
        supportWhatsapp: r.supportWhatsapp || DEFAULT_SETTINGS.supportWhatsapp,
        features: Array.isArray(features) && features.length > 0 ? features : DEFAULT_SETTINGS.features,
        whatsappBankEnabled: r.whatsappBankEnabled ?? DEFAULT_SETTINGS.whatsappBankEnabled,
        active: r.active ?? DEFAULT_SETTINGS.active,
      };
    }
  } catch {
    /* fallback to local file */
  }

  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save reseller settings to PocketBase and local JSON backup.
 */
export async function saveResellerSettings(patch: Partial<ResellerSettings>): Promise<ResellerSettings> {
  const current = await getResellerSettings();
  const next: ResellerSettings = { ...current, ...patch };

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {
    /* non-blocking */
  }

  try {
    const pb = await createAdminPocketBase();
    const records = await pb.collection("reseller_settings").getFullList({ limit: 1 });
    const payload = {
      lifetimePrice: next.lifetimePrice,
      updatePrice: next.updatePrice,
      currency: next.currency,
      contaboSpecs: next.contaboSpecs,
      deliveryHours: next.deliveryHours,
      supportWhatsapp: next.supportWhatsapp,
      features: next.features,
      whatsappBankEnabled: next.whatsappBankEnabled,
      active: next.active,
    };
    if (records.length > 0) {
      await pb.collection("reseller_settings").update(records[0].id, payload);
    } else {
      await pb.collection("reseller_settings").create(payload);
    }
  } catch {
    /* file persisted */
  }

  return next;
}

/**
 * Generate a cryptographically secure license key.
 * Format: LIOTRIP-XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(): string {
  const bytes = randomBytes(16);
  const hex = bytes.toString("hex").toUpperCase();
  return `LONALIZA-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

/**
 * Get all reseller companies with license info.
 */
const COMPANIES_FILE = path.join(DATA_DIR, "reseller-companies.json");

function mapCompanyRecord(r: Record<string, unknown>): ResellerCompany {
  return {
    id: String(r.id || ""),
    googleId: String(r.googleId || ""),
    email: String(r.email || ""),
    companyName: String(r.companyName || ""),
    companyNameAr: String(r.companyNameAr || ""),
    logo: String(r.logo || ""),
    requestedDomain: String(r.requestedDomain || ""),
    phone: String(r.phone || ""),
    status: (r.status as ResellerCompany["status"]) || "registered",
    notes: String(r.notes || ""),
    planType: (r.planType as ResellerCompany["planType"]) || "ownership",
    subdomain: String(r.subdomain || ""),
    customDomain: String(r.customDomain || ""),
    customDomainStatus: (r.customDomainStatus as ResellerCompany["customDomainStatus"]) || "none",
    taxId: String(r.taxId || ""),
    commercialReg: String(r.commercialReg || ""),
    legalAddress: String(r.legalAddress || ""),
    walletBalance: Number(r.walletBalance) || 0,
    walletHoldBalance: Number(r.walletHoldBalance) || 0,
    b2bApiKeyMaster: String(r.b2bApiKeyMaster || ""),
    b2bApiSecret: String(r.b2bApiSecret || ""),
    b2bApiKeyFlights: String(r.b2bApiKeyFlights || ""),
    b2bApiKeyHotels: String(r.b2bApiKeyHotels || ""),
    b2bApiKeyTransfers: String(r.b2bApiKeyTransfers || ""),
    subscriptionStatus: (r.subscriptionStatus as ResellerCompany["subscriptionStatus"]) || "active",
    updateSubscriptionActive: typeof r.updateSubscriptionActive === "boolean" ? r.updateSubscriptionActive : true,
    updateSubscriptionExpiresAt: String(r.updateSubscriptionExpiresAt || ""),
    monthlyPlanPrice: typeof r.monthlyPlanPrice === "number" ? r.monthlyPlanPrice : undefined,
    autoRenewalMethod: (r.autoRenewalMethod as ResellerCompany["autoRenewalMethod"]) || "wallet",
    cardToken: String(r.cardToken || ""),
    cardLast4: String(r.cardLast4 || ""),
    cardBrand: String(r.cardBrand || ""),
    lastBilledAt: String(r.lastBilledAt || ""),
    nextBillingAt: String(r.nextBillingAt || ""),
    created: String(r.created || new Date().toISOString()),
    updated: String(r.updated || new Date().toISOString()),
  };
}

export async function getResellerCompanies(): Promise<ResellerCompany[]> {
  try {
    const pb = await createAdminPocketBase();
    const records = await pb.collection("reseller_companies").getFullList({
      sort: "-created",
    });
    const list = records.map((r) => mapCompanyRecord(r as unknown as Record<string, unknown>));
    try {
      await fs.writeFile(COMPANIES_FILE, JSON.stringify(list, null, 2), "utf8");
    } catch {}
    return list;
  } catch {
    /* fallback to local JSON file */
  }

  try {
    const raw = await fs.readFile(COMPANIES_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Get a single company by ID.
 */
export async function getResellerCompany(id: string): Promise<ResellerCompany | null> {
  try {
    const pb = await createAdminPocketBase();
    const r = await pb.collection("reseller_companies").getOne(id);
    return mapCompanyRecord(r as unknown as Record<string, unknown>);
  } catch {
    /* fallback to file */
  }

  const all = await getResellerCompanies();
  return all.find((c) => c.id === id) || null;
}

/**
 * Get company by email (for Google OAuth login).
 */
export async function getResellerCompanyByEmail(email: string): Promise<ResellerCompany | null> {
  const clean = email.trim().toLowerCase().replace(/"/g, "");
  try {
    const pb = await createAdminPocketBase();
    const r = await pb.collection("reseller_companies").getFirstListItem(`email="${clean}"`);
    return mapCompanyRecord(r as unknown as Record<string, unknown>);
  } catch {
    /* fallback */
  }

  const all = await getResellerCompanies();
  return all.find((c) => c.email.toLowerCase() === clean) || null;
}

/**
 * Upsert company on Google OAuth sign-in.
 */
export async function upsertResellerCompanyFromGoogle(opts: {
  email: string;
  name: string;
  googleId: string;
}): Promise<ResellerCompany> {
  const email = opts.email.trim().toLowerCase();
  const existing = await getResellerCompanyByEmail(email);

  if (existing) {
    if (opts.googleId && existing.googleId !== opts.googleId) {
      await updateResellerCompany(existing.id, { googleId: opts.googleId });
      existing.googleId = opts.googleId;
    }
    return existing;
  }

  const payload = {
    email,
    companyName: opts.name || email.split("@")[0] || "Partner Company",
    googleId: opts.googleId,
    status: "registered" as const,
    planType: "ownership" as const,
    walletBalance: 0,
    walletHoldBalance: 0,
  };

  try {
    const pb = await createAdminPocketBase();
    const created = await pb.collection("reseller_companies").create(payload);
    return mapCompanyRecord(created as unknown as Record<string, unknown>);
  } catch {
    // Local creation
    const newCo: ResellerCompany = {
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...payload,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    const all = await getResellerCompanies();
    all.unshift(newCo);
    try {
      await fs.writeFile(COMPANIES_FILE, JSON.stringify(all, null, 2), "utf8");
    } catch {}
    return newCo;
  }
}

export async function updateResellerCompany(
  id: string,
  patch: Partial<ResellerCompany>
): Promise<ResellerCompany | null> {
  let updatedRecord: ResellerCompany | null = null;
  try {
    const pb = await createAdminPocketBase();
    const updated = await pb.collection("reseller_companies").update(id, patch);
    updatedRecord = mapCompanyRecord(updated as unknown as Record<string, unknown>);
  } catch {
    /* non-blocking if offline */
  }

  // Update in local file
  try {
    const all = await getResellerCompanies();
    const idx = all.findIndex((c) => c.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...patch, updated: new Date().toISOString() };
      await fs.writeFile(COMPANIES_FILE, JSON.stringify(all, null, 2), "utf8");
      if (!updatedRecord) updatedRecord = all[idx];
    }
  } catch {}

  return updatedRecord;
}

/**
 * Delete a reseller company completely from PocketBase and local file.
 */
export async function deleteResellerCompany(id: string): Promise<boolean> {
  try {
    const pb = await createAdminPocketBase();
    await pb.collection("reseller_companies").delete(id);
  } catch {
    /* non-blocking */
  }

  try {
    const all = await getResellerCompanies();
    const filtered = all.filter((c) => c.id !== id);
    await fs.writeFile(COMPANIES_FILE, JSON.stringify(filtered, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all licenses.
 */
export async function getResellerLicenses(): Promise<ResellerLicense[]> {
  try {
    const pb = await createAdminPocketBase();
    const records = await pb.collection("reseller_licenses").getFullList({
      expand: "company",
      sort: "-created",
    });
    return records.map((r) => {
      const comp = r.expand?.company as Record<string, unknown> | undefined;
      return {
        id: r.id,
        company: r.company,
        companyName: String(comp?.companyName || ""),
        companyEmail: String(comp?.email || ""),
        licenseKey: r.licenseKey,
        status: r.status || "issued",
        boundDomain: r.boundDomain || "",
        firstActivation: r.firstActivation || "",
        lastHeartbeat: r.lastHeartbeat || "",
        currentVersion: r.currentVersion || "",
        online: Boolean(r.online),
        created: r.created,
        updated: r.updated,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Get license for a company.
 */
export async function getCompanyLicense(companyId: string): Promise<ResellerLicense | null> {
  try {
    const pb = await createAdminPocketBase();
    const r = await pb.collection("reseller_licenses").getFirstListItem(`company="${companyId}"`);
    return {
      id: r.id,
      company: r.company,
      licenseKey: r.licenseKey,
      status: r.status || "issued",
      boundDomain: r.boundDomain || "",
      firstActivation: r.firstActivation || "",
      lastHeartbeat: r.lastHeartbeat || "",
      currentVersion: r.currentVersion || "",
      online: Boolean(r.online),
      created: r.created,
      updated: r.updated,
    };
  } catch {
    return null;
  }
}

/**
 * Issue or retrieve a license for a company.
 */
export async function issueLicenseForCompany(companyId: string): Promise<ResellerLicense> {
  const existing = await getCompanyLicense(companyId);
  if (existing) return existing;

  const pb = await createAdminPocketBase();
  const key = generateLicenseKey();
  const created = await pb.collection("reseller_licenses").create({
    company: companyId,
    licenseKey: key,
    status: "issued",
    online: false,
  });

  return {
    id: created.id,
    company: created.company,
    licenseKey: created.licenseKey,
    status: "issued",
    online: false,
    created: created.created,
    updated: created.updated,
  };
}

/**
 * Get all stage templates.
 */
export async function getStageTemplates(): Promise<ResellerStageTemplate[]> {
  try {
    const pb = await createAdminPocketBase();
    const records = await pb.collection("reseller_stage_templates").getFullList({
      sort: "sortOrder",
    });
    return records.map((r) => ({
      id: r.id,
      titleAr: r.titleAr,
      titleEn: r.titleEn,
      titleTr: r.titleTr || "",
      descriptionAr: r.descriptionAr || "",
      descriptionEn: r.descriptionEn || "",
      sortOrder: Number(r.sortOrder) || 0,
      isDefault: Boolean(r.isDefault),
      icon: r.icon || "",
    }));
  } catch {
    return [];
  }
}

/**
 * Get company delivery progress.
 */
export async function getCompanyProgress(companyId: string): Promise<ResellerCompanyProgress[]> {
  try {
    const pb = await createAdminPocketBase();
    const records = await pb.collection("reseller_progress").getFullList({
      filter: `company="${companyId}"`,
      expand: "stage",
      sort: "stage.sortOrder",
    });
    return records.map((r) => {
      const stage = r.expand?.stage as Record<string, unknown> | undefined;
      return {
        id: r.id,
        company: r.company,
        stage: r.stage,
        stageInfo: stage
          ? {
              id: String(stage.id),
              titleAr: String(stage.titleAr || ""),
              titleEn: String(stage.titleEn || ""),
              titleTr: String(stage.titleTr || ""),
              sortOrder: Number(stage.sortOrder) || 0,
              isDefault: Boolean(stage.isDefault),
              icon: String(stage.icon || ""),
            }
          : undefined,
        status: r.status || "pending",
        notes: r.notes || "",
        completedAt: r.completedAt || "",
        created: r.created,
        updated: r.updated,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Initialize progress stages for a newly paid company.
 */
export async function initCompanyProgress(companyId: string): Promise<void> {
  try {
    const pb = await createAdminPocketBase();
    const stages = await getStageTemplates();
    const existing = await getCompanyProgress(companyId);
    const existingStages = new Set(existing.map((e) => e.stage));

    for (const stage of stages) {
      if (!existingStages.has(stage.id)) {
        await pb.collection("reseller_progress").create({
          company: companyId,
          stage: stage.id,
          status: stage.sortOrder === 1 ? "done" : "pending",
          completedAt: stage.sortOrder === 1 ? new Date().toISOString() : null,
        });
      }
    }
  } catch (err) {
    console.error("[initCompanyProgress] error:", err);
  }
}

/**
 * Get or create server details for a company.
 */
export async function getCompanyServer(companyId: string): Promise<ResellerServer | null> {
  try {
    const pb = await createAdminPocketBase();
    const r = await pb.collection("reseller_servers").getFirstListItem(`company="${companyId}"`);
    return {
      id: r.id,
      company: r.company,
      ipAddress: r.ipAddress,
      aapanelUrl: r.aapanelUrl || "",
      aapanelNotes: r.aapanelNotes || "",
      contaboId: r.contaboId || "",
      region: r.region || "",
      provisionedAt: r.provisionedAt || "",
      created: r.created,
      updated: r.updated,
    };
  } catch {
    return null;
  }
}

/**
 * Save server details for a company (sets server IP, which unblocks the domain binding instructions).
 */
export async function saveCompanyServer(
  companyId: string,
  data: { ipAddress: string; aapanelUrl?: string; aapanelNotes?: string; contaboId?: string }
): Promise<ResellerServer> {
  const pb = await createAdminPocketBase();
  const existing = await getCompanyServer(companyId);

  if (existing) {
    const updated = await pb.collection("reseller_servers").update(existing.id, {
      ipAddress: data.ipAddress.trim(),
      aapanelUrl: data.aapanelUrl?.trim() || "",
      aapanelNotes: data.aapanelNotes?.trim() || "",
      contaboId: data.contaboId?.trim() || "",
    });
    return {
      id: updated.id,
      company: updated.company,
      ipAddress: updated.ipAddress,
      aapanelUrl: updated.aapanelUrl || "",
      aapanelNotes: updated.aapanelNotes || "",
      contaboId: updated.contaboId || "",
      created: updated.created,
      updated: updated.updated,
    };
  }

  const created = await pb.collection("reseller_servers").create({
    company: companyId,
    ipAddress: data.ipAddress.trim(),
    aapanelUrl: data.aapanelUrl?.trim() || "",
    aapanelNotes: data.aapanelNotes?.trim() || "",
    contaboId: data.contaboId?.trim() || "",
    provisionedAt: new Date().toISOString(),
  });

  return {
    id: created.id,
    company: created.company,
    ipAddress: created.ipAddress,
    aapanelUrl: created.aapanelUrl || "",
    aapanelNotes: created.aapanelNotes || "",
    contaboId: created.contaboId || "",
    created: created.created,
    updated: created.updated,
  };
}

/**
 * Overall resale statistics for the super admin dashboard.
 */
export async function getResellerOverviewStats(): Promise<{
  totalCompanies: number;
  paidCompanies: number;
  activeLicenses: number;
  onlineInstances: number;
  totalRevenueUsd: number;
}> {
  try {
    const [companies, licenses, orders] = await Promise.all([
      getResellerCompanies(),
      getResellerLicenses(),
      (async () => {
        try {
          const pb = await createAdminPocketBase();
          return await pb.collection("reseller_orders").getFullList({ filter: 'status="paid"' });
        } catch {
          return [];
        }
      })(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const paidCompanies = companies.filter((c) => c.status !== "registered").length;
    const activeLicenses = licenses.filter((l) => l.status === "bound" || l.status === "issued").length;
    const onlineInstances = licenses.filter((l) => l.online).length;

    return {
      totalCompanies: companies.length,
      paidCompanies,
      activeLicenses,
      onlineInstances,
      totalRevenueUsd: totalRevenue,
    };
  } catch {
    return {
      totalCompanies: 0,
      paidCompanies: 0,
      activeLicenses: 0,
      onlineInstances: 0,
      totalRevenueUsd: 0,
    };
  }
}
