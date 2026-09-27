"use client";

import { useState } from "react";
import { Check, Copy, Gift, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";

type Props = {
  originCity?: string;
  destinationCity?: string;
};

export default function FlightAffiliateBanner({ originCity, destinationCity }: Props) {
  const { locale } = useLocale();
  const { user } = useCustomerAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id ? user.id.slice(0, 8).toUpperCase() : "LONALIZA";

  const handleCopy = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("ref", referralCode);
    void navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="my-4 overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-r from-[#21094e] via-[#2e1065] to-[#170536] p-5 md:p-6 text-white shadow-xl shadow-purple-950/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
            <Gift size={24} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-400/20 px-3 py-0.5 text-[11px] font-black text-amber-300 border border-amber-400/30">
                {locale === "ar" ? "برنامج تسويق الأفلييت والشركاء" : "Affiliate & Partner Program"}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
                <Sparkles size={12} className="text-amber-400" />
                {locale === "ar" ? "عمولة نقدية حتى $30 لكل حجز" : "Up to $30 Cash / Booking"}
              </span>
            </div>
            <h3 className="mt-1.5 text-base md:text-lg font-black text-white leading-snug">
              {locale === "ar"
                ? "شارك عروض هذه الرحلات مع أصدقائك واربح عمولات نقدية ونقاط ولاء فورية!"
                : "Share these flight deals with friends & earn cash commissions + loyalty points!"}
            </h3>
            <p className="mt-1 text-xs text-purple-100/85 leading-relaxed max-w-xl">
              {locale === "ar"
                ? "انسخ رابط نتائج البحث المخصص لك وشاركه. كل مسافر يحجز تذكرته عبر رابطك ستحصل أنت فوراً على عمولة نقدية ونقاط ولاء في محفظتك الرقمية."
                : "Copy your personalized search results link and share it. Every traveler booking through your link earns you instant cash rewards & loyalty points."}
            </p>
          </div>
        </div>

        {/* Copy Referral Link Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 md:pt-0 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 px-5 py-3 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            {copied ? <Check size={16} className="text-slate-950 stroke-[3]" /> : <Copy size={16} />}
            <span>
              {copied
                ? locale === "ar"
                  ? "تم نسخ الرابط المخصص بنجاح!"
                  : "Link Copied Successfully!"
                : locale === "ar"
                ? "نسخ رابط المشاركة المخصص"
                : "Copy Referral Link"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
