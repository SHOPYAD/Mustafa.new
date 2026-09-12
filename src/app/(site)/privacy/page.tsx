"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  FileCheck,
  Server,
  Share2,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Globe2,
  Printer,
  Sparkles,
  UserCheck,
  Mail,
  Headphones,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { LegalCompanyIdentity, LegalCustomClause } from "@/types/legal-settings";
import { DEFAULT_LEGAL_CLAUSES } from "@/lib/legal/default-clauses";

function getPrivacyIcon(sectionKey?: string, title?: string) {
  const s = (sectionKey || "").toLowerCase() + " " + (title || "").toLowerCase();
  if (s.includes("controller") || s.includes("مسؤول") || s.includes("kimlik")) return Shield;
  if (s.includes("data") || s.includes("فئات") || s.includes("kategori")) return Eye;
  if (s.includes("purpose") || s.includes("أهداف") || s.includes("amaç") || s.includes("basis")) return FileCheck;
  if (s.includes("share") || s.includes("مشاركة") || s.includes("paylaş")) return Share2;
  if (s.includes("transfer") || s.includes("نقل") || s.includes("sınır")) return Globe2;
  if (s.includes("secur") || s.includes("أمن") || s.includes("تشفير") || s.includes("güvenlik")) return Lock;
  if (s.includes("right") || s.includes("حقوق") || s.includes("haklar")) return UserCheck;
  if (s.includes("cookie") || s.includes("كوكيز") || s.includes("çerez")) return Server;
  if (s.includes("dpo") || s.includes("مكتب") || s.includes("görevli") || s.includes("contact")) return Mail;
  return Shield;
}

const ICON_THEMES = [
  "bg-purple-100 text-purple-900",
  "bg-blue-100 text-blue-900",
  "bg-amber-100 text-amber-900",
  "bg-emerald-100 text-emerald-900",
  "bg-indigo-100 text-indigo-900",
  "bg-rose-100 text-rose-900",
];

export default function PrivacyPage() {
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
              (c: LegalCustomClause) => c.targetDoc === "privacy" && c.enabled
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
  const dpoHotline = legalData?.identity?.dpoHotline || "+90 531 359 13 94";
  const officialAddress = isAr
    ? legalData?.identity?.officialAddressAr || "إسطنبول، الجمهورية التركية"
    : isTr
    ? legalData?.identity?.officialAddressTr || "İstanbul, Türkiye Cumhuriyeti"
    : isFr
    ? legalData?.identity?.officialAddressFr || "Istanbul, République de Turquie"
    : legalData?.identity?.officialAddressEn || "Istanbul, Republic of Turkey";
  const tursabDoc = legalData?.identity?.tursabLicenseNumber || "TÜRSAB Belge No: 14285 (A Grubu)";
  const chamber = legalData?.identity?.chamberOfCommerce || "İstanbul Ticaret Odası (İTO)";

  const t = {
    badge: dict.legal.privacyBadge,
    title: dict.legal.privacyTitle,
    subtitle: dict.legal.privacySubtitle,
    lastUpdated: dict.legal.lastUpdatedLabel,
    printBtn: dict.legal.printDocument,
    termsLink: dict.legal.termsOfService,
    gdprLink: dict.legal.gdprCompliance,
  };

  const activeClauses = useMemo(() => {
    if (legalData?.clauses && legalData.clauses.length > 0) {
      return [...legalData.clauses].sort((a, b) => a.order - b.order);
    }
    return DEFAULT_LEGAL_CLAUSES.filter((c) => c.targetDoc === "privacy" && c.enabled).sort(
      (a, b) => a.order - b.order
    );
  }, [legalData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20" dir={dir}>
      {/* Header Banner - Seamlessly attached to navigation */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#18082e] via-[#240c46] to-[#120524] text-white border-b border-purple-900/60 shadow-xl pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14 -mt-px">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.18),transparent_50%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md">
              <Shield className="h-4 w-4 text-amber-400" />
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
              <Link href="/terms" className="hover:text-amber-300 underline underline-offset-4">
                {t.termsLink}
              </Link>
              <span>•</span>
              <Link href="/gdpr" className="hover:text-amber-300 underline underline-offset-4">
                {t.gdprLink}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-amber-500" />
                {isAr ? "أقسام السياسة" : isTr ? "Bölümler" : isFr ? "Sections" : "Policy Outline"}
              </h3>

              <nav className="space-y-1 text-xs font-medium text-slate-700 max-h-[50vh] overflow-y-auto pr-1">
                {activeClauses.map((clause) => {
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
                          : "hover:bg-purple-50 hover:text-purple-950"
                      }`}
                    >
                      {title}
                    </a>
                  );
                })}
              </nav>

              {/* GDPR Quick Action Box */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 text-xs space-y-2">
                <p className="font-bold text-purple-950 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-purple-700" />
                  {isAr ? "إدارة بياناتك ذاتياً:" : isTr ? "Kişisel Veri Yönetimi:" : isFr ? "Gestion de vos données :" : "Self-Service Data Controls:"}
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {isAr
                    ? "يمكنك تنزيل نسخة من بياناتك بصيغة JSON أو طلب حذف حسابك فوراً من لوحة تحكم حسابك."
                    : isTr
                      ? "Profilinizi JSON formatında indirebilir veya hesabınızı doğrudan hesap panelinizden silebilirsiniz."
                      : isFr
                        ? "Téléchargez vos données au format JSON ou demandez la suppression de votre compte depuis votre espace personnel."
                        : "You can download a complete JSON export or request deletion directly from your account settings."}
                </p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <Link
                    href="/api/account/export"
                    target="_blank"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-purple-200 py-1.5 px-2 text-[11px] font-bold text-purple-900 shadow-2xs hover:bg-purple-100"
                  >
                    <Download className="h-3.5 w-3.5 text-purple-700" />
                    {isAr ? "تصدير بياناتي (JSON)" : isTr ? "Verilerimi İndir (JSON)" : isFr ? "Exporter mes données (JSON)" : "Export Data (JSON)"}
                  </Link>
                  <Link
                    href="/account"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#18082e] text-white py-1.5 px-2 text-[11px] font-bold shadow-2xs hover:bg-purple-900"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    {isAr ? "لوحة الحساب وحذف البيانات" : isTr ? "Hesap ve Veri Silme" : isFr ? "Espace Compte & Données" : "Account Data Controls"}
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Legal Clauses */}
          <main className="lg:col-span-8 space-y-8 text-sm leading-relaxed text-slate-700">
            {activeClauses.map((clause, idx) => {
              const targetId = clause.sectionKey || `sec-${clause.id}`;
              const ClauseIcon = getPrivacyIcon(clause.sectionKey, clause.titleEn);
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

              const isDpoOrContact =
                clause.sectionKey === "sec-dpo" ||
                targetId.includes("dpo") ||
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
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 shrink-0">
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

                  {/* DPO / Contact Card */}
                  {isDpoOrContact && (
                    <div className="mt-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 p-5">
                      <h4 className="font-bold text-[#18082e] text-xs sm:text-sm mb-3 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-700" />
                        <span>
                          {isAr
                            ? "مكتب مسؤول حماية البيانات والاتصال المباشر (DPO Office):"
                            : "Data Protection Officer Contact Information:"}
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                        <div>
                          <p className="font-semibold text-purple-950">{companyName}</p>
                          <p className="text-slate-600">{officialAddress}</p>
                          <p className="text-slate-600">DPO: {dpoEmail}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-purple-950">Hotline / WhatsApp:</p>
                          <p className="text-slate-600" dir="ltr">{dpoHotline}</p>
                          <p className="text-slate-600 font-mono">{tursabDoc}</p>
                        </div>
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
