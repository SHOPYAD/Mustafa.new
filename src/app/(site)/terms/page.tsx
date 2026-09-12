"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Plane,
  Building2,
  Car,
  RotateCcw,
  CreditCard,
  FileCheck,
  AlertTriangle,
  Scale,
  Headphones,
  Sparkles,
  Printer,
  FileText,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { LegalCompanyIdentity, LegalCustomClause } from "@/types/legal-settings";
import { DEFAULT_LEGAL_CLAUSES } from "@/lib/legal/default-clauses";

function getClauseIcon(sectionKey?: string, title?: string) {
  const s = (sectionKey || "").toLowerCase() + " " + (title || "").toLowerCase();
  if (s.includes("flight") || s.includes("air") || s.includes("طيران") || s.includes("uçak")) return Plane;
  if (s.includes("protect") || s.includes("حماي") || s.includes("güvence") || s.includes("insur")) return ShieldCheck;
  if (s.includes("hotel") || s.includes("room") || s.includes("فندق") || s.includes("otel")) return Building2;
  if (s.includes("transfer") || s.includes("car") || s.includes("نقل") || s.includes("سيار") || s.includes("araç")) return Car;
  if (s.includes("change") || s.includes("cancel") || s.includes("إلغاء") || s.includes("تعديل") || s.includes("iptal")) return RotateCcw;
  if (s.includes("pay") || s.includes("tax") || s.includes("دفع") || s.includes("ضرائب") || s.includes("fiyat") || s.includes("ödem")) return CreditCard;
  if (s.includes("traveler") || s.includes("doc") || s.includes("مسافر") || s.includes("جواز") || s.includes("pasaport") || s.includes("yolcu")) return FileCheck;
  if (s.includes("liab") || s.includes("force") || s.includes("مسؤول") || s.includes("قاهرة") || s.includes("sorumluluk")) return AlertTriangle;
  return Scale;
}

const ICON_THEMES = [
  "bg-purple-100 text-purple-900",
  "bg-amber-100 text-amber-900",
  "bg-emerald-100 text-emerald-900",
  "bg-blue-100 text-blue-900",
  "bg-indigo-100 text-indigo-900",
  "bg-rose-100 text-rose-900",
];

export default function TermsPage() {
  const { t: dict, locale: systemLocale, dir } = useLocale();
  const lang = systemLocale;
  const [activeSection, setActiveSection] = useState<string>("");

  const [legalData, setLegalData] = useState<{
    identity: LegalCompanyIdentity;
    clauses: LegalCustomClause[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/public-legal")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok) {
          setLegalData({
            identity: data.identity,
            clauses: (data.clauses || []).filter(
              (c: LegalCustomClause) => c.targetDoc === "terms" && c.enabled
            ),
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
  const officialEmail = legalData?.identity?.officialEmail || "info@lonaliza.com";
  const officialPhone = legalData?.identity?.officialPhone || "+90 531 359 13 94";
  const dpoEmail = legalData?.identity?.dpoEmail || "privacy@lonaliza.com";
  const officialAddress = isAr
    ? legalData?.identity?.officialAddressAr || "إسطنبول، الجمهورية التركية"
    : isTr
    ? legalData?.identity?.officialAddressTr || "İstanbul, Türkiye Cumhuriyeti"
    : isFr
    ? legalData?.identity?.officialAddressFr || "Istanbul, République de Turquie"
    : legalData?.identity?.officialAddressEn || "Istanbul, Republic of Turkey";
  const jurisdictionCourt = isAr
    ? legalData?.identity?.jurisdictionCityAr || "محاكم إسطنبول المركزية (Çağlayan) وهيئات التحكيم التجاري"
    : isTr
    ? legalData?.identity?.jurisdictionCityTr || "İstanbul Merkez Mahkemeleri (Çağlayan)"
    : isFr
    ? legalData?.identity?.jurisdictionCityFr || "Tribunaux de commerce d'Istanbul (Çağlayan)"
    : legalData?.identity?.jurisdictionCityEn || "Istanbul Central Commercial Courts (Çağlayan)";
  const tursabDoc = legalData?.identity?.tursabLicenseNumber || "TÜRSAB Belge No: 14285 (A Grubu)";
  const taxId = legalData?.identity?.taxNumber || "Vergi No: 6091248921";

  const t = {
    badge: dict.legal.termsBadge,
    title: dict.legal.termsTitle,
    subtitle: dict.legal.termsSubtitle,
    lastUpdated: dict.legal.lastUpdatedLabel,
    printBtn: dict.legal.printDocument,
    privacyLink: dict.legal.privacyPolicy,
    gdprLink: dict.legal.gdprCompliance,
  };

  // Active Clauses (Dynamic from Legal Store, or Default Fallback)
  const activeClauses = useMemo(() => {
    if (legalData?.clauses && legalData.clauses.length > 0) {
      return [...legalData.clauses].sort((a, b) => a.order - b.order);
    }
    return DEFAULT_LEGAL_CLAUSES.filter((c) => c.targetDoc === "terms" && c.enabled).sort(
      (a, b) => a.order - b.order
    );
  }, [legalData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20" dir={dir}>
      {/* Hero Header - Seamlessly attached to navigation */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#18082e] via-[#240c46] to-[#120524] text-white border-b border-purple-900/60 shadow-xl pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14 -mt-px">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.18),transparent_50%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>{t.badge}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => typeof window !== "undefined" && window.print()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{t.printBtn}</span>
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            {t.title}
          </h1>
          <p className="max-w-3xl text-sm sm:text-base text-purple-200/90 leading-relaxed mb-6">
            {t.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-amber-300/90 font-medium">
            <span className="inline-flex items-center gap-1.5 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {t.lastUpdated}
            </span>
            <div className="flex items-center gap-3 text-slate-300">
              <Link href="/privacy" className="hover:text-amber-300 underline underline-offset-4">
                {t.privacyLink}
              </Link>
              <span>•</span>
              <Link href="/gdpr" className="hover:text-amber-300 underline underline-offset-4">
                {t.gdprLink}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Navigation Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-950 mb-3 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-amber-500" />
                {isAr ? "فهرس بنود الاتفاقية" : isTr ? "Sözleşme Başlıkları" : isFr ? "Sommaire" : "Terms Navigation"}
              </h3>
              <nav className="space-y-1 text-xs font-medium max-h-[60vh] overflow-y-auto pr-1">
                {activeClauses.map((clause, idx) => {
                  const targetId = clause.sectionKey || `sec-${clause.id}`;
                  const title = isAr
                    ? clause.titleAr || clause.titleEn
                    : isTr
                    ? clause.titleTr || clause.titleEn
                    : isFr
                    ? clause.titleFr || clause.titleEn
                    : clause.titleEn || clause.titleAr;

                  return (
                    <a
                      key={clause.id}
                      href={`#${targetId}`}
                      onClick={() => setActiveSection(targetId)}
                      className={`block py-2 px-3 rounded-xl transition-colors truncate ${
                        activeSection === targetId
                          ? "bg-purple-100 text-purple-950 font-bold"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-950"
                      }`}
                    >
                      {title}
                    </a>
                  );
                })}
              </nav>

              <div className="mt-6 pt-5 border-t border-slate-100 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60">
                <p className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                  {isAr
                    ? "🛡️ هل تحتاج لمساعدة أو استفسار بخصوص حجزك؟"
                    : "🛡️ Need assistance regarding your booking?"}
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  {isAr
                    ? "فريق الدعم الفني وخدمة العملاء متواجد على مدار 24/7 عبر الواتساب والبريد الإلكتروني."
                    : "Our 24/7 operations desk is available on WhatsApp and email."}
                </p>
                <a
                  href={`https://wa.me/${officialPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  <span dir="ltr">{officialPhone}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Legal Clauses */}
          <main className="lg:col-span-8 space-y-8 text-sm leading-relaxed text-slate-700">
            {activeClauses.map((clause, idx) => {
              const targetId = clause.sectionKey || `sec-${clause.id}`;
              const ClauseIcon = getClauseIcon(clause.sectionKey, clause.titleEn);
              const iconTheme = ICON_THEMES[idx % ICON_THEMES.length];

              const title = isAr
                ? clause.titleAr || clause.titleEn
                : isTr
                ? clause.titleTr || clause.titleEn
                : isFr
                ? clause.titleFr || clause.titleEn
                : clause.titleEn || clause.titleAr;

              const content = isAr
                ? clause.contentAr || clause.contentEn
                : isTr
                ? clause.contentTr || clause.contentEn
                : isFr
                ? clause.contentFr || clause.contentEn
                : clause.contentEn || clause.contentAr;

              const isLegalJurisdiction =
                clause.sectionKey === "sec-legal" ||
                targetId.includes("legal") ||
                idx === activeClauses.length - 1;

              return (
                <section
                  key={clause.id}
                  id={targetId}
                  className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all scroll-mt-28"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconTheme}`}>
                      <ClauseIcon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {clause.badge && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                          {clause.badge}
                        </span>
                      )}
                      <h2 className="text-base sm:text-lg font-black text-[#18082e]">
                        {title}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3 text-slate-700 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                    <p>{content}</p>
                  </div>

                  {/* If this is the legal/governing clause, display official corporate identity */}
                  {isLegalJurisdiction && (
                    <div className="mt-6 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50/50 p-5">
                      <h4 className="font-bold text-[#18082e] text-xs sm:text-sm mb-3 flex items-center gap-2">
                        <Scale className="h-4 w-4 text-purple-700" />
                        <span>
                          {isAr
                            ? "المعلومات القانونية الرسمية للشركة وبيانات الاختصاص:"
                            : "Official Company Information & License:"}
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                        <div>
                          <p className="font-semibold text-purple-950">{companyName}</p>
                          <p className="text-slate-600">{officialAddress}</p>
                          <p className="text-slate-600">Email: {officialEmail}</p>
                          <p className="text-slate-600 font-mono font-bold text-purple-900">{tursabDoc}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-purple-950">Phone & WhatsApp:</p>
                          <p className="text-slate-600" dir="ltr">{officialPhone}</p>
                          <p className="text-slate-600">DPO: {dpoEmail}</p>
                          <p className="text-slate-600 font-mono">{taxId}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-purple-100 text-[11px] text-purple-900 font-medium">
                        <strong>{isAr ? "المحكمة المختصة:" : "Competent Court:"}</strong> {jurisdictionCourt}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </main>
        </div>
      </div>
    </div>
  );
}
