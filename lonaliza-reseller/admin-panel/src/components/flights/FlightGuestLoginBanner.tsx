"use client";

import { Crown, Sparkles, UserPlus } from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  service?: string;
};

export default function FlightGuestLoginBanner({ className }: Props) {
  const { user, loading, openAuth } = useCustomerAuth();
  const { locale } = useLocale();

  if (loading || user) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-r from-[#1b053a] via-[#2e1065] to-[#3b0764] p-4 text-white shadow-lg shadow-purple-950/20 sm:p-5",
        className
      )}
    >
      {/* Decorative ambient glow */}
      <div className="pointer-events-none absolute -end-8 -top-12 h-36 w-36 rounded-full bg-amber-500/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -start-6 h-32 w-32 rounded-full bg-purple-500/25 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300/40">
            <Crown size={22} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                {locale === "ar"
                  ? "سجّل دخولك الآن واحصل على خصم إضافي 5% واكسب نقاط ولاء!"
                  : "Sign in now for an extra 5% discount & loyalty points!"}
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-amber-400/30">
                <Sparkles size={11} />
                VIP
              </span>
            </div>
            <p className="mt-1 text-xs text-purple-200/90 leading-relaxed">
              {locale === "ar"
                ? "انضم لعائلة مسافري لوناليزا لتجميع نقاط المكافآت واستبدالها برصيد حقيقي في محفظتك يخصم من رحلاتك القادمة."
                : "Join Lonaliza Travelers to accumulate rewards points and redeem them for real discounts on your next trips."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <UserPlus size={14} className="stroke-[2.5]" />
            <span>{locale === "ar" ? "تسجيل الدخول / إنشاء حساب" : "Sign In / Register"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
