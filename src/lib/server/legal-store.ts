import { promises as fs } from "fs";
import path from "path";
import type {
  LegalSettingsPayload,
  LegalCompanyIdentity,
  LegalCustomClause,
  GdprRetentionPolicy,
} from "@/types/legal-settings";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "legal-policies.json");

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-legal-policies.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

export const DEFAULT_LEGAL_IDENTITY: LegalCompanyIdentity = {
  companyNameAr: "شركة لوناليزا للسياحة (Lonaliza Turizm Tic. Ltd. Şti.)",
  companyNameEn: "Lonaliza Tourism Travel Agency (Lonaliza Turizm Tic. Ltd. Şti.)",
  companyNameTr: "Lonaliza Turizm Seyahat Acentası (Tic. Ltd. Şti.)",
  companyNameFr: "Lonaliza Tourisme Agence de Voyages (Tic. Ltd. Şti.)",
  brandName: "Lonaliza",
  officialAddressAr: "إسطنبول، الجمهورية التركية",
  officialAddressEn: "Istanbul, Republic of Turkey",
  officialAddressTr: "İstanbul, Türkiye Cumhuriyeti",
  officialAddressFr: "Istanbul, République de Turquie",
  officialEmail: "info@lonaliza.com",
  officialPhone: "+90 531 359 13 94",
  dpoEmail: "privacy@lonaliza.com",
  dpoHotline: "+90 531 359 13 94",
  tursabLicenseNumber: "TÜRSAB Belge No: 14285 (A Grubu)",
  taxNumber: "Vergi No: 6091248921",
  chamberOfCommerce: "İstanbul Ticaret Odası (İTO)",
  jurisdictionCityAr: "محاكم إسطنبول المركزية (Çağlayan) وهيئات التحكيم التجاري",
  jurisdictionCityEn: "Istanbul Central Commercial Courts (Çağlayan)",
  jurisdictionCityTr: "İstanbul Merkez Mahkemeleri (Çağlayan) ve Tüketici Hakem Heyetleri",
  jurisdictionCityFr: "Tribunaux de commerce d'Istanbul (Çağlayan)",
  lastUpdated: "سبتمبر 2026",
  policyVersion: "3.4",
};

export const DEFAULT_RETENTION_POLICY: GdprRetentionPolicy = {
  retentionPeriodDays: 30,
  allowImmediatePurge: true,
  autoPurgeAfterDays: false,
  notifyDpoOnRequest: true,
  retentionNoticeAr:
    "يتم الاحتفاظ ببيانات الحساب المعطل لمدة 30 يوماً كفترة سماح وفق معايير اللائحة العامة لحماية البيانات، يمكن خلالها إلغاء الطلب قبل المسح النهائي.",
  retentionNoticeEn:
    "Deactivated accounts are retained in an encrypted holding state for 30 days under GDPR compliance before irreversible erasure.",
  retentionNoticeTr:
    "Devre dışı bırakılan hesaplar, kalıcı silinmeden önce GDPR standartları gereğince 30 gün boyunca güvenli şekilde bekletilir.",
  retentionNoticeFr:
    "Les comptes désactivés sont conservés pendant 30 jours conformément au RGPD avant effacement irréversible.",
};

import { DEFAULT_LEGAL_CLAUSES } from "./default-legal-clauses";

const DEFAULT_STORE: LegalSettingsPayload = {
  identity: DEFAULT_LEGAL_IDENTITY,
  clauses: DEFAULT_LEGAL_CLAUSES,
  retention: DEFAULT_RETENTION_POLICY,
  updatedAt: new Date().toISOString(),
};

export async function getLegalSettings(): Promise<LegalSettingsPayload> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<LegalSettingsPayload>;

    // Ensure all 27 comprehensive official clauses are present
    const existingClauses = Array.isArray(parsed.clauses) ? parsed.clauses : [];
    let mergedClauses = existingClauses;
    if (existingClauses.length < 10) {
      // Merge defaults with any custom clauses user may have added
      const existingIds = new Set(existingClauses.map((c) => c.id));
      mergedClauses = [
        ...existingClauses,
        ...DEFAULT_LEGAL_CLAUSES.filter((c) => !existingIds.has(c.id)),
      ];
      // Save back to disk
      await ensureDir();
      await fs.writeFile(
        getStoreFile(),
        JSON.stringify(
          {
            identity: { ...DEFAULT_LEGAL_IDENTITY, ...(parsed.identity || {}) },
            clauses: mergedClauses,
            retention: { ...DEFAULT_RETENTION_POLICY, ...(parsed.retention || {}) },
            updatedAt: new Date().toISOString(),
          },
          null,
          2
        ),
        "utf8"
      );
    }

    return {
      identity: {
        ...DEFAULT_LEGAL_IDENTITY,
        ...(parsed.identity || {}),
      },
      clauses: mergedClauses,
      retention: {
        ...DEFAULT_RETENTION_POLICY,
        ...(parsed.retention || {}),
      },
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    await ensureDir();
    await fs.writeFile(getStoreFile(), JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
    return DEFAULT_STORE;
  }
}

export async function saveLegalSettings(
  patch: Partial<LegalSettingsPayload>
): Promise<LegalSettingsPayload> {
  await ensureDir();
  const current = await getLegalSettings();

  const updated: LegalSettingsPayload = {
    identity: {
      ...current.identity,
      ...(patch.identity || {}),
    },
    clauses: Array.isArray(patch.clauses) ? patch.clauses : current.clauses,
    retention: {
      ...current.retention,
      ...(patch.retention || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(getStoreFile(), JSON.stringify(updated, null, 2), "utf8");
  return updated;
}

export async function addOrUpdateClause(
  clause: LegalCustomClause
): Promise<LegalCustomClause> {
  const settings = await getLegalSettings();
  const existingIdx = settings.clauses.findIndex((c) => c.id === clause.id);

  let updatedClause: LegalCustomClause;
  if (existingIdx >= 0) {
    updatedClause = {
      ...settings.clauses[existingIdx],
      ...clause,
      updatedAt: new Date().toISOString(),
    };
    settings.clauses[existingIdx] = updatedClause;
  } else {
    updatedClause = {
      ...clause,
      id: clause.id || `clause_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    settings.clauses.push(updatedClause);
  }

  await saveLegalSettings({ clauses: settings.clauses });
  return updatedClause;
}

export async function deleteClause(clauseId: string): Promise<boolean> {
  const settings = await getLegalSettings();
  const nextClauses = settings.clauses.filter((c) => c.id !== clauseId);
  if (nextClauses.length === settings.clauses.length) return false;
  await saveLegalSettings({ clauses: nextClauses });
  return true;
}
