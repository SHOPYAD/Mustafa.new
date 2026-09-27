"use client";

import { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessageCircle,
  Sparkles,
  Plane,
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export type LegalTab = "terms" | "privacy" | "gdpr" | "whatsapp";

export default function TermsModal({
  open,
  onClose,
  onAccept,
  initialTab = "terms",
}: {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
  initialTab?: LegalTab;
}) {
  const { locale: currentLocale } = useLocale();
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab || "terms");
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialTab]);

  if (!open) return null;

  const isAr = currentLocale === "ar";
  const isTr = currentLocale === "tr";
  const isFr = currentLocale === "fr";

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-label={isAr ? "إغلاق" : "Close"}
      />

      {/* Full-viewport sheet on mobile, constrained dialog on desktop */}
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="relative flex h-[min(100dvh,100%)] w-full max-h-[100dvh] flex-col overflow-hidden rounded-t-3xl border border-purple-500/40 bg-gradient-to-br from-[#1b0833] via-[#240c46] to-[#140626] text-slate-100 shadow-2xl sm:h-auto sm:max-h-[min(90dvh,44rem)] sm:max-w-3xl sm:rounded-3xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 border-b border-purple-800/60 bg-purple-950/80 px-4 py-3 sm:px-6 sm:py-4"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/20 p-2 text-amber-400">
              <ShieldCheck size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-snug text-white">
                {isAr
                  ? "الشروط القانونية وحماية البيانات"
                  : isTr
                    ? "Yasal Şartlar ve Veri Koruma"
                    : isFr
                      ? "Conditions Générales et protection des données"
                      : "Legal Terms & Data Protection"}
              </h2>
              <p className="mt-1 text-[11px] font-semibold text-amber-300">TÜRSAB · IATA · GDPR</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/16"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-800/40 bg-purple-950/40 p-2 gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "terms"
                ? "bg-amber-400 text-purple-950 shadow-sm"
                : "text-purple-200/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <Plane size={14} />
            {isAr ? "شروط الاستخدام والتذاكر" : isTr ? "Bilet ve Hizmet Koşulları" : isFr ? "Conditions de Billet" : "Booking Terms"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "privacy"
                ? "bg-amber-400 text-purple-950 shadow-sm"
                : "text-purple-200/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <Lock size={14} />
            {isAr ? "سياسة الخصوصية (KVKK)" : isTr ? "Gizlilik & KVKK" : isFr ? "Confidentialité" : "Privacy & KVKK"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gdpr")}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "gdpr"
                ? "bg-amber-400 text-purple-950 shadow-sm"
                : "text-purple-200/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck size={14} />
            {isAr ? "حماية البيانات (GDPR)" : isTr ? "GDPR Hakları" : isFr ? "Protection RGPD" : "GDPR Rights"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === "whatsapp"
                ? "bg-amber-400 text-purple-950 shadow-sm"
                : "text-purple-200/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageCircle size={14} />
            {isAr ? "إشعارات الواتساب" : isTr ? "WhatsApp Bildirimleri" : isFr ? "WhatsApp OTP" : "WhatsApp Alerts"}
          </button>
        </div>

        {/* Content Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed custom-scrollbar">
          {/* TAB 1: TERMS */}
          {activeTab === "terms" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                <h3 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-2">
                  <Sparkles size={16} />
                  {isAr
                    ? "عقد الوساطة السياحية وإصدار التذاكر (وفق معايير TÜRSAB & IATA):"
                    : "Intermediary Travel Agreement (TÜRSAB & IATA Standards):"}
                </h3>
                <p className="text-amber-100/90 text-xs leading-relaxed">
                  {isAr
                    ? "منصة لوناليزا (Lonaliza) هي وكالة سفر معتمدة ووسيط تقني رسمي لربط المسافرين مع شركات الطيران العالمية والفنادق ومنظمي الرحلات. يخضع عقد النقل الجوي والإقامة لشروط الناقل أو الفندق المصدر."
                    : "Lonaliza functions as an accredited travel intermediary connecting travelers with global flight and accommodation suppliers under IATA and local regulations."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">
                  {isAr ? "1. قواعد إصدار التذاكر والأسماء:" : "1. Ticketing & Passenger Name Rules:"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? "يجب إدخال اسم المسافر مطابقاً تماماً لجواز السفر. لا يُسمح بتعديل اسم المسافر بعد إصدار التذكرة طبقاً لقوانين شركات الطيران وأنظمة التوزيع العالمية (GDS)."
                    : "Passenger names must match valid passports strictly. Airline regulations strictly forbid complete name alterations after ticket issuance."}
                </p>

                <h4 className="font-bold text-white text-sm mt-3">
                  {isAr ? "2. ميزة حماية التذاكر الذكية (Koşulsuz Bilet İptali):" : "2. Lonaliza Smart Protection Guarantee:"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? "ميزة حصرية مستوحاة من أفضل معايير Turna: عند تفعيل باقة الحماية الذكية، يحق لك إلغاء تذكرتك لأي سبب حتى ساعتين قبل الرحلة واسترداد حتى 90% من قيمتها كرصيد فوري في محفظتك أو وسيلة دفعك الأصلية."
                    : "Unconditional flight cancellation up to 2 hours before scheduled departure with up to 90% refund credit directly to your account or payment method."}
                </p>

                <h4 className="font-bold text-white text-sm mt-3">
                  {isAr ? "3. التعديل والإلغاء والاسترجاع:" : "3. Voluntary Changes & Cancellation:"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? "تخضع التذاكر الاقتصادية الأساسية غير القابلة للاسترجاع لسياسة شركات الطيران. يتم تقديم كافة طلبات الاسترجاع والتعديل مباشرة عبر صفحة تفاصيل الحجز (/account/bookings/[id])."
                    : "Non-refundable promotional fares adhere to carrier tariffs. Change requests can be seamlessly initiated through the dedicated booking details page."}
                </p>

                <div className="pt-2 text-center sm:text-start">
                  <Link
                    href="/terms"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                  >
                    {isAr ? "قراءة اتفاقية الشروط الكاملة (10 بنود مفصلة) ↗" : "Read Full Terms Document (10 Detailed Sections) ↗"}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-purple-500/30 bg-purple-900/30 p-4">
                <h3 className="font-bold text-purple-300 text-sm mb-1 flex items-center gap-2">
                  <Lock size={16} />
                  {isAr
                    ? "الالتزام بقانون حماية البيانات الشخصية التركي (KVKK 6698):"
                    : "Turkish Personal Data Protection Law (KVKK 6698) Compliance:"}
                </h3>
                <p className="text-purple-100/85 text-xs leading-relaxed">
                  {isAr
                    ? "تخضع بياناتك الشخصية كمسافر لأعلى معايير الحماية المشفرة، ولا يتم بيعها أو مشاركتها لأي أغراض إعلانية. تتم مشاركتها حصراً مع شركات الطيران وسلطات الطيران المدني لإصدار التذاكر."
                    : "Your personal data is encrypted and safeguarded. We strictly transmit required manifests to operating airlines and civil aviation authorities for ticketing compliance."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">
                  {isAr ? "1. البيانات التي نجمعها:" : "1. Collected Information:"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? "الاسم، بيانات جواز السفر، البريد الإلكتروني، رقم الهاتف، وبيانات البطاقة المشفرة عبر بوابات معتمدة متوافقة مع معيار PCI-DSS."
                    : "Full names, passport credentials, contact emails, mobile numbers, and tokenized payments processed via PCI-DSS certified gateways."}
                </p>

                <h4 className="font-bold text-white text-sm mt-3">
                  {isAr ? "2. النقل الدولي والتشفير:" : "2. International Transfer & Cryptography:"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? "يتم نقل بيانات الرحلات إلى الخوادم والناقلين الدوليين بموجب بروتوكول TLS 1.3 وتشفير AES-256 للبيانات المخزنة."
                    : "Flight manifests transferred to foreign destination carriers are secured with TLS 1.3 and military-grade AES-256 storage."}
                </p>

                <div className="pt-2 text-center sm:text-start">
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                  >
                    {isAr ? "قراءة سياسة الخصوصية الكاملة وحقوق KVKK ↗" : "Read Full Privacy Policy & KVKK Information ↗"}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GDPR */}
          {activeTab === "gdpr" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4">
                <h3 className="font-bold text-emerald-300 text-sm mb-1 flex items-center gap-2">
                  <ShieldCheck size={16} />
                  {isAr
                    ? "حقوق المسافرين بموجب النظام الأوروبي العام (GDPR 2016/679):"
                    : "EU GDPR Data Subject Rights (Regulation 2016/679):"}
                </h3>
                <p className="text-emerald-100/85 text-xs leading-relaxed">
                  {isAr
                    ? "تلتزم منصة لوناليزا بتمكين المسافرين الأوروبيين والدوليين من ممارسة حقوقهم الرقمية الكاملة عبر أدوات الخدمة الذاتية الفورية."
                    : "Empowering European travelers with full autonomy over their personal data through instant self-service controls."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="font-bold text-amber-300 mb-1">
                    {isAr ? "تصدير البيانات (Art. 20):" : "Data Portability (Art. 20):"}
                  </p>
                  <p className="text-slate-300">
                    {isAr
                      ? "يمكنك تحميل نسخة JSON كاملة من جميع بياناتك بضغطة زر واحدة."
                      : "Download your complete machine-readable profile and booking ledger."}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="font-bold text-rose-300 mb-1">
                    {isAr ? "الحق في النسيان (Art. 17):" : "Right to Erasure (Art. 17):"}
                  </p>
                  <p className="text-slate-300">
                    {isAr
                      ? "إمكانية مسح حسابك وكافة جلساتك وبياناتك الشخصية نهائياً من لوحة الحساب."
                      : "Permanently delete your customer account and stored records anytime."}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center sm:text-start">
                <Link
                  href="/gdpr"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  {isAr ? "زيارة بوابة الامتثال للائحة الأوروبية (GDPR Portal) ↗" : "Visit Dedicated GDPR Compliance Portal ↗"}
                </Link>
              </div>
            </div>
          )}

          {/* TAB 4: WHATSAPP */}
          {activeTab === "whatsapp" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4">
                <h3 className="font-bold text-emerald-300 text-sm mb-1 flex items-center gap-2">
                  <MessageCircle size={16} />
                  {isAr
                    ? "إقرار استلام رسائل الواتساب للحجوزات والتحقق:"
                    : "WhatsApp Booking Updates & Verification Consent:"}
                </h3>
                <p className="text-emerald-100/85 text-xs leading-relaxed">
                  {isAr
                    ? "بموافقتك، تمنح منصة لوناليزا الإذن لإرسال إشعارات الحساب المباشرة وأكواد التحقق OTP وتذاكر الطيران إلى هاتفك عبر تطبيق الواتساب."
                    : "Authorize Lonaliza to dispatch essential transactional messages, OTP passcodes, and e-tickets to your WhatsApp."}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <h4 className="font-bold text-white text-sm">
                  {isAr ? "أنواع الرسائل المستلمة وحرية إلغاء الاشتراك:" : "Notification Types & Opt-out:"}
                </h4>
                <ul className="list-disc pr-5 space-y-1">
                  <li>{isAr ? "أكواد التحقق اللحظية (OTP) لتأكيد هويتك وحماية حسابك." : "Instant OTP security verification codes."}</li>
                  <li>{isAr ? "إشعارات تأكيد الحجوزات الفندقية وتذاكر الطيران وقسائم الإقامة." : "E-tickets, boarding updates, and hotel check-in vouchers."}</li>
                  <li>{isAr ? "يحق لك في أي وقت إيقاف الإشعارات بضغطة زر من صفحة حسابك (/account)." : "You can disconnect WhatsApp or turn off notifications anytime from /account."}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-purple-800/60 bg-purple-950/80 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-2xl px-4 text-xs font-semibold text-purple-200 hover:bg-white/10 hover:text-white"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>

          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-black shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>{isAr ? "أوافق على جميع الشروط والمتابعة" : "I Agree & Continue"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
