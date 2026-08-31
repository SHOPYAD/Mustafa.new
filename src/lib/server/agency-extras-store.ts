/**
 * Agency add-on packages (flights extras by default).
 * Persisted in `.data/agency-extras.json` — same file-store pattern as cars / pages.
 */

import { promises as fs } from "fs";
import path from "path";
import type { Locale } from "@/lib/i18n/types";
import {
  isAgencyExtraIcon,
  isAgencyExtraPriceType,
  isAgencyExtraService,
  type AgencyExtraInput,
  type AgencyExtraPackage,
  type AgencyExtraService,
} from "@/types/agency-extra";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "agency-extras.json");

type StoreFile = {
  packages: AgencyExtraPackage[];
  updatedAt?: string;
};

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-agency-extras.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function newId(): string {
  return `xtra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value != null ? String(value) : fallback;
}

function seedPackages(): AgencyExtraPackage[] {
  const now = new Date().toISOString();
  const rows: Array<Omit<AgencyExtraPackage, "createdAt" | "updatedAt"> & { id: string }> = [
    {
      id: "xtra_refund",
      titleAr: "ضمان استرداد كامل",
      titleEn: "Full money-back guarantee",
      titleTr: "Tam para iade garantisi",
      descAr: "استرداد كامل لمبلغ الحجز وفق سياسة الوكالة إذا أُلغي السفر قبل الموعد المحدد.",
      descEn: "Full refund of the agency booking amount if travel is cancelled within the policy window.",
      descTr: "Politika süresi içinde seyahat iptal edilirse acente tutarının tamamı iade edilir.",
      priceType: "percent",
      priceValue: 6,
      serviceTypes: ["flights"],
      isActive: true,
      sort: 10,
      icon: "refund",
    },
    {
      id: "xtra_bag",
      titleAr: "حقيبة شحن إضافية",
      titleEn: "Extra checked bag",
      titleTr: "Ek kayıtlı bagaj",
      descAr: "أضفوا حقيبة مسجّلة عبر الوكالة قبل السفر.",
      descEn: "Add a checked bag through the agency before you travel.",
      descTr: "Seyahatten önce acente üzerinden ek kayıtlı bagaj ekleyin.",
      priceType: "fixed",
      priceValue: 45,
      serviceTypes: ["flights"],
      isActive: true,
      sort: 20,
      icon: "bag",
    },
    {
      id: "xtra_insurance",
      titleAr: "تأمين السفر",
      titleEn: "Travel insurance",
      titleTr: "Seyahat sigortası",
      descAr: "تغطية طبية وإلغاء رحلة مرتبة من الوكالة.",
      descEn: "Medical and trip-cancellation cover arranged by the agency.",
      descTr: "Acente tarafından düzenlenen sağlık ve iptal teminatı.",
      priceType: "fixed",
      priceValue: 18,
      serviceTypes: ["flights"],
      isActive: true,
      sort: 30,
      icon: "insurance",
    },
    {
      id: "xtra_priority",
      titleAr: "صعود أولوية",
      titleEn: "Priority boarding",
      titleTr: "Öncelikli biniş",
      descAr: "أولوية في إجراءات الصعود عبر خدمة الوكالة.",
      descEn: "Board earlier through the agency priority service.",
      descTr: "Acente öncelik hizmetiyle daha erken binin.",
      priceType: "fixed",
      priceValue: 12,
      serviceTypes: ["flights"],
      isActive: true,
      sort: 40,
      icon: "priority",
    },
    {
      id: "xtra_sms",
      titleAr: "تذكرة عبر الرسائل",
      titleEn: "SMS e-ticket",
      titleTr: "SMS e-bilet",
      descAr: "إرسال رقم الحجز ورابط التذكرة إلى هاتفكم فور الإصدار.",
      descEn: "Send the booking reference and ticket link to your phone as soon as it is issued.",
      descTr: "Bilet düzenlenir düzenlenmez referans ve bağlantı telefonunuza gönderilir.",
      priceType: "fixed",
      priceValue: 4,
      serviceTypes: ["flights"],
      isActive: true,
      sort: 50,
      icon: "sms",
    },
    {
      id: "xtra_flex",
      titleAr: "تاريخ مرن",
      titleEn: "Flexible date",
      titleTr: "Esnek tarih",
      descAr: "تغيير تاريخ الرحلة مرة واحدة عبر الوكالة وفق التوفر.",
      descEn: "Change the flight date once through the agency, subject to availability.",
      descTr: "Müsaitliğe göre uçuş tarihini acente üzerinden bir kez değiştirin.",
      priceType: "percent",
      priceValue: 8,
      serviceTypes: ["flights"],
      isActive: true,
      sort: 60,
      icon: "calendar",
    },
  ];
  return rows.map((row) => ({ ...row, createdAt: now, updatedAt: now }));
}

function sanitizeServices(raw: unknown): AgencyExtraService[] {
  if (!Array.isArray(raw)) return ["flights"];
  const unique = new Set<AgencyExtraService>();
  for (const item of raw) {
    const value = String(item || "").trim();
    if (isAgencyExtraService(value)) unique.add(value);
  }
  return unique.size ? [...unique] : ["flights"];
}

export function sanitizeAgencyExtra(
  raw: AgencyExtraInput,
  existing?: AgencyExtraPackage
): AgencyExtraPackage | null {
  const titleEn = asString(raw.titleEn || existing?.titleEn).trim();
  const titleAr = asString(raw.titleAr || existing?.titleAr || titleEn).trim();
  if (!titleEn && !titleAr) return null;
  const now = new Date().toISOString();
  const iconRaw = asString(raw.icon || existing?.icon, "star");
  const priceTypeRaw = asString(raw.priceType || existing?.priceType, "fixed");
  return {
    id: asString(raw.id || existing?.id) || newId(),
    titleAr: titleAr || titleEn,
    titleEn: titleEn || titleAr,
    titleTr: asString(raw.titleTr || existing?.titleTr || titleEn || titleAr).trim(),
    descAr: asString(raw.descAr ?? existing?.descAr).trim(),
    descEn: asString(raw.descEn ?? existing?.descEn).trim(),
    descTr: asString(raw.descTr ?? existing?.descTr).trim(),
    priceType: isAgencyExtraPriceType(priceTypeRaw) ? priceTypeRaw : "fixed",
    priceValue: Math.max(0, Number(raw.priceValue ?? existing?.priceValue) || 0),
    serviceTypes: sanitizeServices(raw.serviceTypes ?? existing?.serviceTypes),
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : existing?.isActive !== false,
    sort: Math.max(0, Number(raw.sort ?? existing?.sort) || 0),
    icon: isAgencyExtraIcon(iconRaw) ? iconRaw : "star",
    createdAt: asString(existing?.createdAt) || now,
    updatedAt: now,
  };
}

async function writeStore(packages: AgencyExtraPackage[]): Promise<void> {
  await ensureDir();
  const payload: StoreFile = {
    packages,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(getStoreFile(), JSON.stringify(payload, null, 2), { mode: 0o600 });
}

async function persistSeed(): Promise<AgencyExtraPackage[]> {
  const packages = seedPackages();
  try {
    await writeStore(packages);
  } catch {
    /* read-only fallback */
  }
  return packages;
}

async function readStore(): Promise<AgencyExtraPackage[]> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!Array.isArray(parsed.packages) || parsed.packages.length === 0) {
      return persistSeed();
    }
    return parsed.packages
      .map((item) => sanitizeAgencyExtra(item, item) )
      .filter((item): item is AgencyExtraPackage => Boolean(item));
  } catch {
    return persistSeed();
  }
}

export async function listAgencyExtras(): Promise<AgencyExtraPackage[]> {
  const packages = await readStore();
  return packages.sort((a, b) => a.sort - b.sort || a.titleEn.localeCompare(b.titleEn));
}

export async function listActiveAgencyExtras(
  service?: AgencyExtraService
): Promise<AgencyExtraPackage[]> {
  const packages = await listAgencyExtras();
  return packages.filter((pkg) => {
    if (!pkg.isActive) return false;
    if (!service) return true;
    return pkg.serviceTypes.includes(service);
  });
}

export async function createAgencyExtra(
  input: AgencyExtraInput
): Promise<{ ok: true; extra: AgencyExtraPackage } | { ok: false; error: string }> {
  const extra = sanitizeAgencyExtra({ ...input, id: newId() });
  if (!extra) return { ok: false, error: "Title is required" };
  const packages = await readStore();
  packages.push(extra);
  await writeStore(packages);
  return { ok: true, extra };
}

export async function updateAgencyExtra(
  id: string,
  input: AgencyExtraInput
): Promise<{ ok: true; extra: AgencyExtraPackage } | { ok: false; error: string }> {
  const packages = await readStore();
  const index = packages.findIndex((pkg) => pkg.id === id);
  if (index < 0) return { ok: false, error: "Extra not found" };
  const merged = sanitizeAgencyExtra({ ...packages[index], ...input, id }, packages[index]);
  if (!merged) return { ok: false, error: "Title is required" };
  packages[index] = merged;
  await writeStore(packages);
  return { ok: true, extra: merged };
}

export async function deleteAgencyExtra(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const packages = await readStore();
  const next = packages.filter((pkg) => pkg.id !== id);
  if (next.length === packages.length) return { ok: false, error: "Extra not found" };
  await writeStore(next);
  return { ok: true };
}

export async function resetAgencyExtras(): Promise<AgencyExtraPackage[]> {
  const packages = seedPackages();
  await writeStore(packages);
  return packages;
}

export function extraTitleForLocale(pkg: AgencyExtraPackage, locale: Locale): string {
  switch (locale) {
    case "ar":
      return pkg.titleAr || pkg.titleEn;
    case "en":
      return pkg.titleEn || pkg.titleAr;
    case "tr":
      return pkg.titleTr || pkg.titleEn || pkg.titleAr;
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}
