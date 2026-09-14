"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Download,
  Trash2,
  Lock,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Database,
  UserX,
  Clock,
  Headphones,
  Scale,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LegalPageHero from "@/components/legal/LegalPageHero";
import { displayLegalTitle } from "@/lib/legal/display-title";
import type {
  LegalCompanyIdentity,
  LegalCustomClause,
  GdprRetentionPolicy,
} from "@/types/legal-settings";
import { DEFAULT_LEGAL_CLAUSES } from "@/lib/legal/default-clauses";

const ICON_THEMES = [
  "bg-purple-100 text-purple-900",
  "bg-amber-100 text-amber-900",
  "bg-emerald-100 text-emerald-900",
  "bg-blue-100 text-blue-900",
  "bg-indigo-100 text-indigo-900",
  "bg-rose-100 text-rose-900",
];

export default function GdprPage() {
  const { t: dict, locale: systemLocale, dir } = useLocale();
  const lang = systemLocale;

  const [legalData, setLegalData] = useState<{
    identity: LegalCompanyIdentity;
    clauses: LegalCustomClause[];
    retention: GdprRetentionPolicy;
  } | null>(null);

  useEffect(() => {
    fetch("/api/public-legal")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok) {
          setLegalData({
            identity: data.identity,
            clauses: (data.clauses || []).filter(
              (c: LegalCustomClause) => c.targetDoc === "gdpr" && c.enabled
            ),
            retention: data.retention,
          });
        }
      })
      .catch(() => {});
  }, []);

  const isAr = lang === "ar";
  const isTr = lang === "tr";
  const isFr = lang === "fr";

  const companyName = isAr
    ? legalData?.identity?.companyNameAr || "شركة لوناليزا للسياحة (Lonaliza Turizm)"
    : isTr
    ? legalData?.identity?.companyNameTr || "Lonaliza Turizm Tic. Ltd. Şti."
    : isFr
    ? legalData?.identity?.companyNameFr || "Lonaliza Tourisme Agence de Voyages"
    : legalData?.identity?.companyNameEn || "Lonaliza Tourism Travel Agency";

  const brandName = legalData?.identity?.brandName || "Lonaliza";
  const dpoEmail = legalData?.identity?.dpoEmail || "privacy@lonaliza.com";
  const dpoHotline = legalData?.identity?.dpoHotline || "+90 531 359 13 94";
  const retentionDays = legalData?.retention?.retentionPeriodDays || 30;
  const retentionNotice = isAr
    ? legalData?.retention?.retentionNoticeAr ||
      `يتم الاحتفاظ ببيانات الحساب المعطل لمدة ${retentionDays} يوماً كفترة سماح وفق معايير اللائحة العامة لحماية البيانات، يمكن خلالها استعادة الحساب قبل المسح النهائي.`
    : isTr
    ? legalData?.retention?.retentionNoticeTr ||
      `Devre dışı bırakılan hesaplar, kalıcı silinmeden önce GDPR standartları gereğince ${retentionDays} gün boyunca güvenli şekilde bekletilir.`
    : isFr
    ? legalData?.retention?.retentionNoticeFr ||
      `Les comptes désactivés sont conservés pendant ${retentionDays} jours conformément au RGPD avant effacement irréversible.`
    : `Deactivated accounts are retained in an encrypted holding state for ${retentionDays} days under GDPR compliance before irreversible erasure.`;

  const t = {
    badge: dict.legal.gdprBadge,
    title: dict.legal.gdprTitle,
    subtitle: dict.legal.gdprSubtitle,
    lastUpdated: dict.legal.lastUpdatedLabel,
    exportBtn: isAr ? "تنزيل بياناتي كملف JSON" : isTr ? "Verilerimi İndir (JSON)" : isFr ? "Télécharger mes données (JSON)" : "Download My Data (JSON)",
    deleteBtn: isAr ? "الانتقال لأداة حذف الحساب" : isTr ? "Hesap Silme Aracına Git" : isFr ? "Accéder à la suppression" : "Go to Account Deletion",
  };

  const activeClauses = useMemo(() => {
    if (legalData?.clauses && legalData.clauses.length > 0) {
      return [...legalData.clauses].sort((a, b) => a.order - b.order);
    }
    return DEFAULT_LEGAL_CLAUSES.filter((c) => c.targetDoc === "gdpr" && c.enabled).sort(
      (a, b) => a.order - b.order
    );
  }, [legalData]);

  return (
    <div className="lonaliza-legal-page min-h-screen w-full min-w-0 max-w-full bg-slate-50 text-slate-800 pb-20" dir={dir}>
      <LegalPageHero
        title={t.title}
        subtitle={t.subtitle}
        badge={t.badge}
        lastUpdated={t.lastUpdated}
        printLabel={isAr ? "طباعة الوثيقة" : isTr ? "Yazdır" : isFr ? "Imprimer" : "Print"}
        badgeIcon={ShieldCheck}
        links={[
          { href: "/terms", label: isAr ? "شروط الاستخدام" : isTr ? "Kullanıcı Sözleşmesi" : isFr ? "Conditions Générales" : "Terms of Service" },
          { href: "/privacy", label: isAr ? "سياسة الخصوصية" : isTr ? "Gizlilik Politikası" : isFr ? "Politique de Confidentialité" : "Privacy Policy" },
        ]}
      />

      {/* Main Container */}
      <div className="mx-auto mt-8 max-w-6xl space-y-8 px-4 sm:mt-10 sm:px-6 lg:px-8">
        {/* Interactive Self-Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Data Export (Art. 20) */}
          <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-900 mb-4">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#18082e] text-base mb-1.5">
                {isAr
                  ? "الحق في نقل البيانات (Art. 20)"
                  : isTr
                    ? "Veri Taşınabilirliği Hakkı (Madde 20)"
                    : isFr
                      ? "Droit à la portabilité (Art. 20)"
                      : "Data Portability (Art. 20)"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {isAr
                  ? "احصل على نسخة كاملة مهيكلة ومقروءة آلياً (JSON) تشمل ملفك الشخصي، سجل حجوزاتك، محفظتك، وسجلات موافقاتك القانونية."
                  : isTr
                    ? "Profilinizi, seyahat geçmişinizi, cüzdanınızı ve onay kayıtlarınızı içeren eksiksiz makine tarafından okunabilir bir JSON dosyası indirin."
                    : isFr
                      ? "Téléchargez un export JSON complet et lisible par machine de votre profil, historique de voyages, portefeuille et consentements légaux."
                      : "Download a machine-readable JSON export of your complete profile, travel history, wallet ledger, and consent timestamps."}
              </p>
            </div>
            <a
              href="/api/account/export"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#18082e] px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-900 transition-colors shadow-2xs"
            >
              <Download className="h-4 w-4 text-amber-400" />
              <span>{t.exportBtn}</span>
            </a>
          </div>

          {/* Card 2: Right to Erasure (Art. 17) */}
          <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 mb-4">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#18082e] text-base mb-1.5">
                {isAr
                  ? "الحق في النسيان والمحو (Art. 17)"
                  : isTr
                    ? "Unutulma ve Silinme Hakkı (Madde 17)"
                    : isFr
                      ? "Droit à l'effacement / Droit à l'oubli (Art. 17)"
                      : "Right to Erasure (Art. 17)"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {retentionNotice}
              </p>
            </div>
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-2xs"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t.deleteBtn}</span>
            </Link>
          </div>

          {/* Card 3: DPO Contact */}
          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#18082e] text-base mb-1.5">
                {isAr
                  ? "مكتب مسؤول حماية البيانات (DPO)"
                  : isTr
                    ? "Veri Koruma Görevlisi (DPO)"
                    : isFr
                      ? "Délégué à la protection des données"
                      : "Data Protection Officer (DPO)"}
              </h3>
              <div className="text-xs text-slate-600 space-y-1 mb-4">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${dpoEmail}`} className="text-purple-700 hover:underline">
                    {dpoEmail}
                  </a>
                </p>
                <p>
                  <strong>Hotline / WhatsApp:</strong> <span dir="ltr">{dpoHotline}</span>
                </p>
              </div>
            </div>
            <a
              href={`mailto:${dpoEmail}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-[#18082e] hover:bg-amber-400 transition-colors shadow-2xs"
            >
              <Mail className="h-4 w-4" />
              <span>{dpoEmail}</span>
            </a>
          </div>
        </div>

        {/* Detailed Articles Grid - Dynamically Rendered */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8">
          <div className="border-b border-slate-200 pb-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#18082e] mb-2">
              {isAr
                ? "حقوق المسافرين والامتثال التنظيمي للائحة العامة لحماية البيانات (GDPR)"
                : isTr
                  ? "GDPR Kapsamında Yolcu Hakları (AB 2016/679)"
                  : isFr
                    ? "Droits des passagers en vertu du RGPD (UE 2016/679)"
                    : "Passenger Rights & Compliance under EU Regulation 2016/679"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {isAr
                ? `تضمن منصة ${brandName} (${companyName}) تنفيذ كافة المواد القانونية المنصوص عليها في التشريع الأوروبي وقوانين حماية البيانات الدولية:`
                : `The ${brandName} platform strictly upholds every regulatory provision mandated under international data protection statutes:`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            {activeClauses.map((clause, idx) => {
              const iconTheme = ICON_THEMES[idx % ICON_THEMES.length];
              const title = displayLegalTitle(
                isAr
                  ? clause.titleAr || clause.titleEn
                  : isTr
                    ? clause.titleTr || clause.titleEn
                    : isFr
                      ? clause.titleFr || clause.titleEn
                      : clause.titleEn || clause.titleAr,
                lang
              );

              const content = isAr
                ? clause.contentAr || clause.contentEn
                : isTr
                ? clause.contentTr || clause.contentEn
                : isFr
                ? clause.contentFr || clause.contentEn
                : clause.contentEn || clause.contentAr;

              return (
                <div
                  key={clause.id}
                  id={clause.sectionKey || `gdpr-${clause.id}`}
                  className="scroll-mt-4 space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:bg-slate-50 lg:scroll-mt-28"
                >
                  <div className="flex items-center gap-2 text-[#18082e] font-bold flex-wrap">
                    {clause.badge && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200 shrink-0">
                        {clause.badge}
                      </span>
                    )}
                    <h4 className="text-sm font-black text-[#18082e] leading-snug">
                      {title}
                    </h4>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                    {content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
