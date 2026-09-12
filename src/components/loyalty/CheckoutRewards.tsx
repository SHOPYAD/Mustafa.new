"use client";

import { useCallback, useEffect, useState } from "react";
import { TicketPercent, Wallet } from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLoyalty } from "@/hooks/useLoyalty";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { LoyaltyQuote, LoyaltyService, LoyaltyVoucher } from "@/lib/loyalty/types";
import { cn } from "@/lib/utils";

export type CheckoutLoyaltyValue = {
  couponCode: string;
  voucherIds: string[];
  payable: number;
  original: number;
  discountUsd: number;
  coveredInFull: boolean;
  currency: string;
};

type Props = {
  service: LoyaltyService;
  amount: number;
  currency: string;
  onChange: (value: CheckoutLoyaltyValue) => void;
};

type WalletPayload = {
  ok?: boolean;
  points?: number;
  usd?: number;
  vouchers?: LoyaltyVoucher[];
};

export default function CheckoutRewards({ service, amount, currency, onChange }: Props) {
  const { t, locale } = useLocale();
  const { user, openAuth } = useCustomerAuth();
  const { formatPrice } = useCurrency();
  const { appliedCode, applyCode, clearCode } = useLoyalty(service, locale);
  const [wallet, setWallet] = useState<WalletPayload | null>(null);
  const [code, setCode] = useState(appliedCode);
  const [voucherIds, setVoucherIds] = useState<string[]>([]);
  const [quote, setQuote] = useState<LoyaltyQuote | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setCode(appliedCode);
  }, [appliedCode]);

  useEffect(() => {
    if (!user) {
      setWallet(null);
      return;
    }
    void fetch("/api/loyalty/wallet", { cache: "no-store" })
      .then((r) => r.json())
      .then((json: WalletPayload) => setWallet(json))
      .catch(() => undefined);
  }, [user]);

  const refreshQuote = useCallback(async () => {
    if (!(amount > 0)) return;
    const res = await fetch("/api/loyalty/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        service,
        couponCode: code,
        voucherIds,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; quote?: LoyaltyQuote };
    if (!json.ok || !json.quote) return;
    setQuote(json.quote);
    onChange({
      couponCode: json.quote.couponCode || "",
      voucherIds: json.quote.voucherIds,
      payable: json.quote.payableAmount,
      original: json.quote.originalAmount,
      discountUsd: json.quote.discountUsd,
      coveredInFull: json.quote.coveredInFull,
      currency: json.quote.payableCurrency,
    });
  }, [amount, code, currency, onChange, service, voucherIds]);

  useEffect(() => {
    void refreshQuote();
  }, [refreshQuote]);

  const applyManual = async () => {
    setErr("");
    const result = await applyCode(code);
    if (!result.ok) setErr(t.loyalty.applyFailed);
    else void refreshQuote();
  };

  const vouchers = wallet?.vouchers || [];

  return (
    <section className="space-y-3 rounded-2xl border border-[#eadfcf] bg-white p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-[#051741]">
        <TicketPercent size={18} className="text-emerald-600" />
        {t.loyalty.paymentTitle}
      </h2>
      <p className="text-sm text-slate-500">
        {locale === "ar"
          ? "طبّق كود خصم أو قسيمة نقاط لتخفيض قيمة حجزك (حتى 15% كحد أقصى للحجوزات المؤكدة التي تبدأ من 500$ فأكثر)."
          : t.loyalty.paymentHint}
      </p>

      {/* Financial Safeguards Notice */}
      {quote && quote.originalUsd < 500 ? (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <TicketPercent className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold text-amber-950">تنبيه شروط استخدام قسائم نقاط الولاء:</p>
            <p className="mt-0.5 text-amber-800">
              قسائم خصم نقاط الولاء متاحة للحجوزات التي تبدأ قيمتها من $500 أو أكثر فقط (قيمة حجزك الحالية: ${Math.round(quote.originalUsd)}). ستحصل على نقاط ولاء جديدة فور إتمام هذا الحجز!
            </p>
          </div>
        </div>
      ) : null}

      {quote?.voucherNotice && quote.originalUsd >= 500 ? (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <TicketPercent className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{quote.voucherNotice}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t.loyalty.codePlaceholder}
          className="min-w-[10rem] flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          dir="ltr"
        />
        <button
          type="button"
          onClick={() => void applyManual()}
          className="rounded-xl bg-[#051741] px-4 py-2.5 text-sm font-bold text-white"
        >
          {t.loyalty.applyDiscount}
        </button>
        {appliedCode ? (
          <button type="button" onClick={() => void clearCode()} className="text-sm font-semibold text-slate-500">
            {t.loyalty.clear}
          </button>
        ) : null}
      </div>
      {err ? <p className="text-xs text-red-600">{err}</p> : null}

      {!user ? (
        <button
          type="button"
          onClick={() => openAuth("login")}
          className="text-sm font-semibold text-emerald-700"
        >
          {t.loyalty.loginForVouchers}
        </button>
      ) : vouchers.length ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.loyalty.yourVouchers}</p>
            {quote && quote.originalUsd >= 500 && (
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                متاح خصم حتى 15% ($150 كحد أقصى)
              </span>
            )}
          </div>
          {vouchers.map((voucher) => {
            const on = voucherIds.includes(voucher.id);
            const isBookingTooSmall = Boolean(quote && quote.originalUsd < 500);
            return (
              <label
                key={voucher.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-all",
                  isBookingTooSmall ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200" : "cursor-pointer",
                  on && !isBookingTooSmall ? "border-emerald-400 bg-emerald-50" : "border-slate-200"
                )}
              >
                <span className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={isBookingTooSmall}
                    checked={on && !isBookingTooSmall}
                    onChange={() => {
                      if (isBookingTooSmall) return;
                      setVoucherIds((prev) =>
                        on ? prev.filter((id) => id !== voucher.id) : [...prev, voucher.id]
                      );
                    }}
                  />
                  <Wallet size={14} className="text-amber-600" />
                  <span className="font-bold text-[#051741]" dir="ltr">
                    {voucher.code}
                  </span>
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  ${voucher.remainingUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400">{t.loyalty.noVouchers}</p>
      )}

      {quote && quote.discountUsd > 0 ? (
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <div className="flex justify-between">
            <span>{t.loyalty.original}</span>
            <span>{formatPrice(quote.originalAmount, quote.originalCurrency)}</span>
          </div>
          <div className="mt-1 flex justify-between font-bold">
            <span>{t.loyalty.discount}</span>
            <span>- ${quote.discountUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="mt-1 flex justify-between font-black text-[#051741]">
            <span>{quote.coveredInFull ? t.loyalty.payWithVoucher : t.loyalty.payable}</span>
            <span>{formatPrice(quote.payableAmount, quote.payableCurrency)}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
