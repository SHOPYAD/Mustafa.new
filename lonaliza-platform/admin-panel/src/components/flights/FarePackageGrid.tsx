"use client";

import { useMemo, useState } from "react";
import {
  Armchair,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  HelpCircle,
  Luggage,
  RefreshCw,
  Undo2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { FareAttributeState, FareFamily, FarePenalty } from "@/components/flights/types";
import { baggageStateText, fareCabinState, fareCheckedState } from "@/components/flights/normalize";
import { canonicalPenalty, collapseFarePenalties, customerFacingPenalties } from "@/lib/flights/fare-penalties";
import PromoPriceBlock from "@/components/loyalty/PromoPriceBlock";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Lang = "ar" | "en" | "tr";

const COPY: Record<
  Lang,
  {
    checked: string;
    cabin: string;
    refund: string;
    change: string;
    seat: string;
    meal: string;
    priority: string;
    included: string;
    chargeable: string;
    notAvailable: string;
    unknown: string;
    select: string;
    selected: string;
    bestPrice: string;
    derived: string;
    penalties: string;
    hidePenalties: string;
    perPerson: string;
    cancel: string;
    changeFee: string;
    noShow: string;
    free: string;
    notPermitted: string;
    confirmNote: string;
    afterDeparture: string;
  }
> = {
  ar: {
    checked: "أمتعة مسجلة",
    cabin: "حقيبة يد",
    refund: "الاسترداد",
    change: "تغيير التاريخ",
    seat: "اختيار المقعد",
    meal: "الوجبة",
    priority: "صعود أولوي",
    included: "مشمول",
    chargeable: "برسوم",
    notAvailable: "غير متاح",
    unknown: "غير متوفر",
    select: "اختيار",
    selected: "المحدد",
    bestPrice: "الأقل سعراً",
    derived: "وصف مبني على شروط التعرفة",
    penalties: "تفاصيل الرسوم",
    hidePenalties: "إخفاء الرسوم",
    perPerson: "للشخص",
    cancel: "الإلغاء",
    changeFee: "التغيير",
    noShow: "عدم الحضور",
    free: "مجاناً",
    notPermitted: "غير مسموح",
    confirmNote: "تُؤكد الأمتعة والقواعد النهائية من شركة الطيران قبل الدفع.",
    afterDeparture: "بعد الإقلاع",
  },
  en: {
    checked: "Checked bag",
    cabin: "Cabin bag",
    refund: "Refund",
    change: "Date change",
    seat: "Seat selection",
    meal: "Meal",
    priority: "Priority boarding",
    included: "Included",
    chargeable: "For a fee",
    notAvailable: "Not available",
    unknown: "Not available",
    select: "Select",
    selected: "Selected",
    bestPrice: "Lowest price",
    derived: "Label built from the fare rules",
    penalties: "Fee details",
    hidePenalties: "Hide fees",
    perPerson: "per person",
    cancel: "Cancellation",
    changeFee: "Change",
    noShow: "No-show",
    free: "Free",
    notPermitted: "Not permitted",
    confirmNote: "Final baggage and rules are confirmed by the airline before payment.",
    afterDeparture: "After departure",
  },
  tr: {
    checked: "Kayıtlı bagaj",
    cabin: "El bagajı",
    refund: "İade",
    change: "Tarih değişikliği",
    seat: "Koltuk seçimi",
    meal: "Yemek",
    priority: "Öncelikli biniş",
    included: "Dahil",
    chargeable: "Ücretli",
    notAvailable: "Mevcut değil",
    unknown: "Mevcut değil",
    select: "Seç",
    selected: "Seçili",
    bestPrice: "En düşük fiyat",
    derived: "Kural tabanlı açıklama",
    penalties: "Ücret detayları",
    hidePenalties: "Ücretleri gizle",
    perPerson: "kişi başı",
    cancel: "İptal",
    changeFee: "Değişiklik",
    noShow: "Gelmeme",
    free: "Ücretsiz",
    notPermitted: "İzin verilmez",
    confirmNote: "Nihai bagaj ve kurallar ödeme öncesinde havayolu tarafından onaylanır.",
    afterDeparture: "Kalkıştan sonra",
  },
};

function langOf(locale: string): Lang {
  return locale === "en" ? "en" : locale === "tr" ? "tr" : "ar";
}

function StateIcon({ state }: { state: FareAttributeState }) {
  if (state === "included") return <Check size={14} className="text-emerald-600 stroke-[3]" />;
  if (state === "chargeable") return <CircleDollarSign size={14} className="text-amber-600" />;
  if (state === "not_available") return <X size={14} className="text-slate-400 stroke-[3]" />;
  return <HelpCircle size={14} className="text-slate-400" />;
}

function displayAttr(state?: FareAttributeState): FareAttributeState {
  return !state || state === "unknown" ? "not_available" : state;
}

function stateText(state: FareAttributeState, c: (typeof COPY)[Lang]): string {
  const shown = displayAttr(state);
  if (shown === "included") return c.included;
  if (shown === "chargeable") return c.chargeable;
  return c.notAvailable;
}

function windowLabel(window: string | undefined, lang: Lang): string {
  const raw = String(window || "").toLowerCase();
  if (!raw) return "";
  if (raw.includes("before")) return lang === "ar" ? "قبل الإقلاع" : lang === "tr" ? "kalkıştan önce" : "before departure";
  if (raw.includes("after")) return lang === "ar" ? "بعد الإقلاع" : lang === "tr" ? "kalkıştan sonra" : "after departure";
  return window || "";
}

function penaltyText(p: FarePenalty, c: (typeof COPY)[Lang], lang: Lang): string | undefined {
  const raw = String(p.text || "").toLowerCase();
  if (!raw) return p.text;
  if (raw.includes("non-refundable") || raw.includes("not refund")) {
    return lang === "ar" ? "غير قابل للاسترداد" : lang === "tr" ? "iade edilemez" : "Non-refundable";
  }
  if (raw.includes("non-changeable") || raw.includes("not change") || raw.includes("not permitted")) {
    return lang === "ar" ? "غير قابل للتعديل" : lang === "tr" ? "değiştirilemez" : "Non-changeable";
  }
  return p.text;
}

function penaltyLine(p: FarePenalty, c: (typeof COPY)[Lang], fmt: (n: number, cur?: string) => string, fallbackCurrency: string, lang: Lang): string {
  const label = p.type === "cancel" ? c.cancel : p.type === "change" ? c.changeFee : c.noShow;
  const winRaw = windowLabel(p.window, lang);
  const win = winRaw ? ` (${winRaw})` : "";
  const text = penaltyText(p, c, lang);
  if (text && p.amount == null && p.percent == null) return `${label}${win}: ${text}`;
  if (p.percent != null) return `${label}${win}: ${p.percent === 0 ? c.free : `${p.percent}%`}`;
  if (p.amount != null) return `${label}${win}: ${p.amount === 0 ? c.free : fmt(p.amount, p.currency || fallbackCurrency)}`;
  return `${label}${win}`;
}

export function FarePackageCard({
  fare,
  selected,
  cheapest,
  onSelect,
  compact,
}: {
  fare: FareFamily;
  selected?: boolean;
  cheapest?: number;
  onSelect?: (fare: FareFamily) => void;
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const c = COPY[langOf(locale)];
  const [showPenalties, setShowPenalties] = useState(false);

  const checked = fareCheckedState(fare);
  const cabin = fareCabinState(fare);
  const attrs = fare.attributes || {
    refund: fare.refundable ? "included" : "unknown",
    change: fare.changeable ? "included" : "unknown",
    seat: "unknown" as FareAttributeState,
    meal: "unknown" as FareAttributeState,
    priority: "unknown" as FareAttributeState,
  };
  const checkedState: FareAttributeState = checked.status === "included" ? "included" : checked.status === "none" ? "not_available" : "unknown";
  const cabinState: FareAttributeState = cabin.status === "included" ? "included" : cabin.status === "none" ? "not_available" : "unknown";
  const diff = cheapest != null && fare.price > cheapest ? fare.price - cheapest : 0;
  const policy = collapseFarePenalties(fare.penalties);
  const facing = customerFacingPenalties(fare.penalties);
  const penalties = facing.penalties;
  const refundState = policy.refundable !== "unknown" ? policy.refundable : displayAttr(attrs.refund);
  const changeState = policy.changeable !== "unknown" ? policy.changeable : displayAttr(attrs.change);

  const feeFor = (type: FarePenalty["type"], attrState: FareAttributeState) => {
    const hit = canonicalPenalty(penalties, type);
    if (hit && (hit.amount != null || hit.percent != null)) {
      return penaltyLine(hit, c, formatFlightPrice, fare.currency, langOf(locale)).replace(/^[^:]+:\s*/, "");
    }
    if (!hit) return stateText(attrState, c);
    if (attrState === "not_available") return c.notPermitted;
    return penaltyLine(hit, c, formatFlightPrice, fare.currency, langOf(locale)).replace(/^[^:]+:\s*/, "");
  };
  const rows: Array<{ icon: React.ReactNode; label: string; state: FareAttributeState; value: string }> = [
    { icon: <Luggage size={14} />, label: c.checked, state: checkedState, value: baggageStateText(checked, locale, "checked") },
    { icon: <Briefcase size={14} />, label: c.cabin, state: cabinState, value: baggageStateText(cabin, locale, "cabin") },
    { icon: <Undo2 size={14} />, label: c.refund, state: refundState, value: feeFor("cancel", refundState) },
    { icon: <RefreshCw size={14} />, label: c.change, state: changeState, value: feeFor("change", changeState) },
    ...(compact
      ? []
      : [
          { icon: <Armchair size={14} />, label: c.seat, state: attrs.seat, value: stateText(attrs.seat, c) },
          { icon: <UtensilsCrossed size={14} />, label: c.meal, state: attrs.meal, value: stateText(attrs.meal, c) },
        ]),
  ];

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-white text-start transition",
        selected ? "border-purple-600 shadow-md shadow-purple-900/10 ring-2 ring-purple-200" : "border-slate-200 hover:border-purple-300 hover:shadow-2xs"
      )}
    >
      {fare.isBestPrice ? (
        <span className="absolute -top-2.5 start-3 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-2xs">{c.bestPrice}</span>
      ) : null}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 p-3 pb-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#1e1b4b]" title={fare.name}>
            {fare.name}
          </p>
          {fare.nameSource === "derived" ? <p className="text-[10px] text-slate-400">{c.derived}</p> : null}
          {fare.cabinClass ? <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-700">{fare.cabinClass.replace(/_/g, " ")}</p> : null}
        </div>
        <div className="shrink-0 text-end">
          <PromoPriceBlock
            amount={fare.price}
            currency={fare.currency}
            service="flights"
            formatPrice={formatFlightPrice}
            size="md"
            subLabel={diff > 0 ? `+${formatFlightPrice(diff, fare.currency)}` : c.perPerson}
          />
        </div>
      </div>
      <ul className="flex-1 space-y-1.5 p-3 text-[12px]">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="text-slate-400">{row.icon}</span>
              {row.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-bold",
                row.state === "included" ? "text-emerald-700" : row.state === "chargeable" ? "text-amber-700" : row.state === "not_available" ? "text-slate-400" : "text-slate-400"
              )}
            >
              <StateIcon state={row.state} />
              <span className="truncate max-w-[9.5rem]" title={row.value}>
                {row.value}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {penalties.length || facing.afterDeparture.length ? (
        <div className="border-t border-dashed border-slate-200 px-3 py-2">
          <button
            type="button"
            onClick={() => setShowPenalties((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 hover:underline cursor-pointer"
          >
            {showPenalties ? c.hidePenalties : c.penalties}
            {showPenalties ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showPenalties ? (
            <ul className="mt-1.5 space-y-1 text-[11px] text-slate-600">
              {penalties.map((p, i) => (
                <li key={i}>• {penaltyLine(p, c, formatFlightPrice, fare.currency, langOf(locale))}</li>
              ))}
              {facing.afterDeparture.length ? (
                <li className="text-slate-400">
                  • {c.afterDeparture}:{" "}
                  {facing.afterDeparture
                    .map((p) => {
                      const label = p.type === "cancel" ? c.cancel : p.type === "change" ? c.changeFee : c.noShow;
                      return `${label} ${p.amount != null && p.amount > 0 ? formatFlightPrice(p.amount, p.currency || fare.currency) : p.text ? penaltyText(p, c, langOf(locale)) : c.notPermitted}`;
                    })
                    .join(" · ")}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      ) : null}
      {(checkedState === "unknown" || cabinState === "unknown") ? (
        <p className="px-3 pb-2 text-[10px] text-slate-500">{c.confirmNote}</p>
      ) : null}
      {onSelect ? (
        <div className="p-3 pt-0">
          <button
            type="button"
            onClick={() => onSelect(fare)}
            className={cn(
              "w-full rounded-xl px-3 py-2 text-xs font-black transition active:scale-[0.98] cursor-pointer",
              selected
                ? "bg-purple-700 text-white"
                : "border border-purple-200 bg-purple-50 text-purple-950 hover:bg-purple-100"
            )}
          >
            {selected ? c.selected : c.select}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function bagScore(fare: FareFamily): number {
  const checked = fareCheckedState(fare);
  const cabin = fareCabinState(fare);
  const one = (s: ReturnType<typeof fareCheckedState>) =>
    s.status === "included" ? 10 + (s.pieces || 0) + (s.kg || 0) / 10 : s.status === "unknown" ? 1 : 0;
  return one(checked) + one(cabin);
}

function attrScore(fare: FareFamily): number {
  const rank = (s?: FareAttributeState) => (s === "included" ? 3 : s === "chargeable" ? 2 : s === "not_available" ? 0 : 1);
  const attrs = fare.attributes;
  return rank(attrs?.refund) + rank(attrs?.change);
}

function changeFeeOf(fare: FareFamily): number | null {
  const fees = (fare.penalties || []).filter((p) => p.type === "change" && p.amount != null).map((p) => Number(p.amount));
  return fees.length ? Math.min(...fees) : null;
}

function fareSig(fare: FareFamily): string {
  const checked = fareCheckedState(fare);
  return [
    (fare.name || "").trim().toUpperCase(),
    (fare.brandCode || "").trim().toUpperCase(),
    Math.round(fare.price * 100),
    checked.status === "included" ? `${checked.pieces || 0}x${checked.kg || 0}` : checked.status,
    fare.attributes?.refund || "",
    fare.attributes?.change || "",
  ].join("|");
}

function pruneDominatedFares(fares: FareFamily[]): FareFamily[] {
  const unique = new Map<string, FareFamily>();
  for (const fare of fares) {
    const key = fareSig(fare);
    if (!unique.has(key)) unique.set(key, fare);
  }
  const sorted = [...unique.values()].sort((a, b) => a.price - b.price);
  const kept: FareFamily[] = [];
  for (const fare of sorted) {
    const fareBrand = String(fare.name || fare.brandCode || "").trim().toUpperCase();
    const worse = kept.some((cheap) => {
      const cheapBrand = String(cheap.name || cheap.brandCode || "").trim().toUpperCase();
      if (fare.nameSource === "supplier" && fareBrand) return false;
      if (fareBrand && cheapBrand && fareBrand !== cheapBrand && fare.nameSource === "supplier" && cheap.nameSource === "supplier") {
        return false;
      }
      if (!(cheap.price > 0 && fare.price >= cheap.price)) return false;
      const cheapRefund = cheap.attributes?.refund;
      const dearRefund = fare.attributes?.refund;
      const cheapChange = cheap.attributes?.change;
      const dearChange = fare.attributes?.change;
      if (!cheapRefund || cheapRefund === "unknown" || !dearRefund || dearRefund === "unknown") return false;
      if (!cheapChange || cheapChange === "unknown" || !dearChange || dearChange === "unknown") return false;
      if (bagScore(cheap) < bagScore(fare)) return false;
      if (attrScore(cheap) < attrScore(fare)) return false;
      const cheapFee = changeFeeOf(cheap);
      const dearFee = changeFeeOf(fare);
      if (cheapFee != null && dearFee != null && cheapFee > dearFee + 0.5) return false;
      return true;
    });
    if (!worse) kept.push(fare);
  }
  return kept;
}

export default function FarePackageGrid({
  fares,
  selectedId,
  onSelect,
  compact,
  className,
}: {
  fares: FareFamily[];
  selectedId?: string | null;
  onSelect?: (fare: FareFamily) => void;
  compact?: boolean;
  className?: string;
}) {
  const sorted = useMemo(() => pruneDominatedFares(fares), [fares]);
  const cheapest = sorted[0]?.price;
  if (!sorted.length) return null;
  return (
    <div className={className}>
      <div
        className={cn(
          "flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 scrollbar-none sm:grid sm:overflow-visible sm:pb-0",
          sorted.length === 1
            ? "grid-cols-1 sm:max-w-sm"
            : sorted.length === 2
            ? "sm:grid-cols-2"
            : "sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {sorted.map((fare) => (
          <div
            key={fare.id}
            className="min-w-[275px] max-w-[295px] shrink-0 snap-center sm:min-w-0 sm:max-w-none sm:shrink flex-1"
          >
            <FarePackageCard
              fare={fare}
              cheapest={cheapest}
              selected={selectedId === fare.id}
              onSelect={onSelect}
              compact={compact}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
