"use client";

import { memo, useCallback, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Check,
  Clock,
  Luggage,
  Plus,
  Plane,
  ShieldCheck,
  Timer,
  Info,
  Sparkles,
  Share2,
  Ticket,
} from "lucide-react";
import FlightTrajectoryAnimation from "@/components/flights/FlightTrajectoryAnimation";
import FarePackageGrid from "@/components/flights/FarePackageGrid";
import PaidBaggageModal from "@/components/flights/PaidBaggageModal";
import type { PaidBagOption } from "@/components/flights/api";
import PromoPriceBlock from "@/components/loyalty/PromoPriceBlock";
import AirlineLogo from "@/components/flights/AirlineLogo";
import type { FlightCopy } from "@/components/flights/copy";
import {
  baggageStateText,
  fareCabinState,
  fareCheckedState,
  formatBaggageText,
  formatClock,
  formatDuration,
  hasValidFarePrices,
  parseBaggageKg,
} from "@/components/flights/normalize";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import LoyaltyPointsRow from "@/components/loyalty/LoyaltyPointsRow";
import type {
  FareFamily,
  FlightPlace,
  FlightSearchQuery,
  Itinerary,
  SelectedFare,
} from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { ShareToCommunityButton } from "@/components/community/ShareToCommunityButton";
import { getLocalizedAirlineName } from "@/lib/flights/airline-dictionary";
import { getLocalizedPlace } from "@/lib/flights/airport-dictionary";

type Props = {
  item: Itinerary;
  query?: FlightSearchQuery;
  copy: FlightCopy;
  sessionId?: string;
  onSelect: (selection: SelectedFare) => void;
  onOpenDetails?: (item?: Itinerary) => void;
};

function terminalOf(place: FlightPlace): string {
  if (!place.terminal) return "";
  const t = String(place.terminal).replace(/^t/i, "");
  return t ? `T${t}` : "";
}

function checkedBaggageLabel(item: Itinerary, copy: FlightCopy, locale: string): string | null {
  if (item.checkedBaggage) {
    const raw = item.checkedBaggage.trim().toLowerCase();
    if (raw === "0" || raw === "0kg" || raw === "0 kg" || raw === "none" || raw === "cabin" || raw === "no" || raw === "—") {
      return null;
    }
    const formatted = formatBaggageText(item.checkedBaggage, locale);
    if (formatted) return formatted;
    const kg = parseBaggageKg(item.checkedBaggage);
    if (kg > 0) return `${kg} kg`;
  }
  const baseFare = item.fareFamilies[0];
  if (baseFare?.baggage) {
    const kg = parseBaggageKg(baseFare.baggage);
    if (kg > 0) return formatBaggageText(baseFare.baggage, locale) || `${kg} kg`;
    return null;
  }
  return null;
}

function FlightResultCardComponent({ item, query, copy, sessionId, onSelect, onOpenDetails }: Props) {
  const { dir, locale } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const [faresOpen, setFaresOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [paidBag, setPaidBag] = useState<PaidBagOption | null>(null);
  const [bagOffered, setBagOffered] = useState(true);
  const hideBags = useCallback(() => setBagOffered(false), []);
  const displayPrice = item.price + (paidBag?.price || 0);
  const outbound = item.legs[0];
  const carrier = outbound?.carriers[0] || outbound?.segments[0]?.marketingCarrier;
  const operating = outbound?.segments[0]?.operatingCarrier;
  const checkedBag = useMemo(() => checkedBaggageLabel(item, copy, locale), [item, copy, locale]);
  const baseFareForBags = useMemo(() => item.fareFamilies.find((f) => f.isBestPrice) || item.fareFamilies[0] || null, [item.fareFamilies]);
  const checkedState = useMemo(() => {
    const st = fareCheckedState(baseFareForBags);
    if (st.status !== "unknown") return st;
    return checkedBag ? ({ status: "included", text: checkedBag } as const) : st;
  }, [baseFareForBags, checkedBag]);
  const cabinState = useMemo(() => {
    const st = fareCabinState(baseFareForBags);
    if (st.status !== "unknown") return st;
    return item.cabinBaggage ? ({ status: "included", text: item.cabinBaggage } as const) : st;
  }, [baseFareForBags, item.cabinBaggage]);
  const totalDuration = useMemo(() => item.legs.reduce((sum, leg) => sum + leg.durationInMinutes, 0), [item.legs]);
  const fareBrand = item.fareBrand || item.fareFamilies[0]?.name;

  // Localized carrier names
  const carrierFullName = useMemo(
    () => getLocalizedAirlineName(carrier?.code || carrier?.name, locale) || carrier?.name || "—",
    [carrier, locale]
  );
  const operatingFullName = useMemo(
    () => (operating?.name ? getLocalizedAirlineName(operating?.code || operating?.name, locale) : ""),
    [operating, locale]
  );

  // Multi-carrier detection across segments
  const allCarriers = useMemo(() => {
    const map = new Map<string, { code?: string; name: string; logoUrl?: string }>();
    for (const leg of item.legs) {
      for (const seg of leg.segments) {
        const c = seg.marketingCarrier;
        if (c?.code && !map.has(c.code)) {
          map.set(c.code, {
            code: c.code,
            name: getLocalizedAirlineName(c.code || c.name, locale),
            logoUrl: c.logoUrl,
          });
        }
      }
      for (const c of leg.carriers) {
        if (c.code && !map.has(c.code)) {
          map.set(c.code, {
            code: c.code,
            name: getLocalizedAirlineName(c.code || c.name, locale),
            logoUrl: c.logoUrl,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [item, locale]);

  const isMultiCarrier = allCarriers.length > 1;

  // Strict non-conflicting refundability check
  const isStrictlyFreeRefund = Boolean(
    item.isRefundable &&
      item.farePolicy?.isCancellationAllowed &&
      !item.farePolicy?.isPartiallyRefundable
  );
  const isRefundableWithFee = Boolean(
    !isStrictlyFreeRefund &&
      (item.isRefundable ||
        item.farePolicy?.isCancellationAllowed ||
        item.farePolicy?.isPartiallyRefundable ||
        item.fareFamilies.some((f) => f.refundable))
  );

  const flightNos = outbound?.segments
    .map((s) => s.flightNumber || s.flightNo)
    .filter(Boolean)
    .join(" · ");

  const extrasOf = () => ({
    extraBag: Boolean(paidBag),
    insurance: false,
    priorityBoarding: false,
    paidBaggage: paidBag
      ? {
          id: paidBag.id,
          weightKg: paidBag.weightKg,
          label: paidBag.label,
          price: paidBag.price,
          currency: paidBag.currency,
        }
      : undefined,
  });

  const pickDefault = () => {
    const fare: FareFamily | null = item.fareFamilies[0] || null;
    onSelect({
      itinerary: item,
      fare,
      extras: extrasOf(),
    });
  };

  const pickFare = (fare: FareFamily) => {
    onSelect({
      itinerary: item,
      fare,
      extras: extrasOf(),
    });
  };

  const handleShareToCommunity = () => {
    const origLoc = outbound ? getLocalizedPlace(outbound.origin.displayCode, outbound.origin.name, outbound.origin.city, locale) : null;
    const destLoc = outbound ? getLocalizedPlace(outbound.destination.displayCode, outbound.destination.name, outbound.destination.city, locale) : null;
    const carrierName = carrierFullName;

    const payload = {
      id: item.id || `flight_${Date.now()}`,
      type: "flight",
      typeLabel: locale === "ar" ? "تذكرة طيران مميزة" : "Flight Ticket Deal",
      title: `${locale === "ar" ? "رحلة طيران" : "Flight"}: ${origLoc?.city || origLoc?.name || ""} ← ${destLoc?.city || destLoc?.name || ""} (${carrierName})`,
      destination: destLoc?.city || destLoc?.name || "رحلة جوية",
      price: item.price,
      currency: item.currency,
      imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
      url: typeof window !== "undefined" ? window.location.href : "/flights",
    };

    try {
      sessionStorage.setItem("pendingCommunityShare", JSON.stringify(payload));
    } catch {}

    const q = new URLSearchParams({
      shareService: "1",
      id: payload.id,
      type: payload.type,
      title: payload.title,
      dest: payload.destination,
      price: String(payload.price),
      currency: payload.currency,
      img: payload.imageUrl,
      url: payload.url,
    });
    window.open(`/community?${q.toString()}`, "_blank");
  };

  const showFareTiers = hasValidFarePrices(item.fareFamilies) && item.fareFamilies.length > 1;

  return (
    <article
      className="group relative z-0 overflow-visible rounded-3xl border border-[#2e1065]/12 bg-white shadow-[0_8px_24px_rgba(26,5,51,0.06)] transition hover:z-40 hover:border-[#2e1065]/35 hover:shadow-[0_14px_32px_rgba(26,5,51,0.1)]"
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 overflow-visible p-3.5">
          {/* Top Carrier & Badges Bar */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {/* Stacked overlapping carrier logos if multi-carrier */}
              {isMultiCarrier ? (
                <div className="flex items-center -space-x-3 rtl:space-x-reverse">
                  {allCarriers.slice(0, 3).map((c, i) => (
                    <div key={c.code || i} className="relative z-[3] rounded-2xl ring-2 ring-white shadow-xs">
                      <AirlineLogo code={c.code} name={c.name} logoUrl={c.logoUrl} size="md" />
                    </div>
                  ))}
                </div>
              ) : (
                <AirlineLogo
                  code={carrier?.code}
                  name={carrierFullName}
                  logoUrl={carrier?.logoUrl}
                  size="lg"
                />
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-base font-black text-[#1e1b4b]">
                    {carrierFullName}
                  </p>
                  {isMultiCarrier ? (
                    <span className="shrink-0 rounded-md bg-purple-100/90 px-1.5 py-0.5 text-[10px] font-bold text-purple-950 border border-purple-200">
                      {locale === "ar" ? "خطوط متعددة" : "Multi-Carrier"}
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs font-semibold text-slate-500">
                  {flightNos || carrier?.code}
                  {outbound?.segments[0]?.aircraft ? ` · ${outbound.segments[0].aircraft}` : ""}
                </p>
                {operatingFullName && operatingFullName !== carrierFullName ? (
                  <p className="truncate text-[11px] text-slate-400">
                    {copy.operatingCarrier} {operatingFullName}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Mobile: priority badges + overflow. Desktop: full badge row. */}
            {(() => {
              const badges: { key: string; node: ReactNode }[] = [];
              if (item.tags.includes("cheapest")) {
                badges.push({
                  key: "cheapest",
                  node: (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-900 border border-amber-200/80">
                      {copy.cheapest}
                    </span>
                  ),
                });
              }
              if (item.tags.includes("best")) {
                badges.push({
                  key: "best",
                  node: (
                    <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-950 border border-purple-200/60">
                      {copy.bestValue}
                    </span>
                  ),
                });
              }
              if (item.tags.includes("fastest")) {
                badges.push({
                  key: "fastest",
                  node: (
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700">
                      {copy.fastest}
                    </span>
                  ),
                });
              }
              if (isStrictlyFreeRefund) {
                badges.push({
                  key: "refund-free",
                  node: (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-950 border border-purple-200">
                      <ShieldCheck size={11} className="text-purple-700" />
                      {copy.refundableFree}
                    </span>
                  ),
                });
              } else if (isRefundableWithFee) {
                badges.push({
                  key: "refund-fee",
                  node: (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 border border-slate-200">
                      <ShieldCheck size={11} className="text-slate-500" />
                      {locale === "ar" ? "إلغاء متاح برسوم" : copy.refundableFee}
                    </span>
                  ),
                });
              }
              const mobileBadges = badgesOpen ? badges : badges.slice(0, 2);
              const overflow = badges.length - 2;
              return (
                <>
                  <button
                    type="button"
                    onClick={handleShareToCommunity}
                    className="inline-flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-2xs active:scale-95"
                    title={locale === "ar" ? "شارك واربح" : "Share & Earn"}
                    aria-label={locale === "ar" ? "شارك واربح" : "Share & Earn"}
                  >
                    <Share2 size={14} />
                  </button>
                  <div className="hidden lg:flex flex-wrap items-center gap-1.5">
                    {badges.map((badge) => (
                      <span key={badge.key}>{badge.node}</span>
                    ))}
                    {!isStrictlyFreeRefund && !isRefundableWithFee ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200">
                        {copy.nonRefundable}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleShareToCommunity}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 px-3 py-1 text-[10px] font-black text-slate-950 shadow-2xs hover:shadow transition-all active:scale-95 cursor-pointer"
                      title={locale === "ar" ? "شارك هذه الرحلة في مجتمع لوناليزا واكسب نقاط ولاء" : "Share flight to community and earn points"}
                    >
                      <Sparkles size={11} className="text-slate-950 animate-pulse" />
                      <span>{locale === "ar" ? "شارك واربح 🎁" : "Share & Earn 🎁"}</span>
                    </button>
                  </div>
                  <div className="flex w-full lg:hidden flex-wrap items-center gap-1.5">
                    {mobileBadges.map((badge) => (
                      <span key={badge.key}>{badge.node}</span>
                    ))}
                    {!badgesOpen && overflow > 0 ? (
                      <button
                        type="button"
                        onClick={() => setBadgesOpen(true)}
                        className="inline-flex h-7 items-center rounded-full bg-slate-100 px-2 text-[10px] font-black text-slate-700"
                      >
                        +{overflow}
                      </button>
                    ) : null}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Flight Legs Section with Stops Popover */}
          <div className="space-y-4">
            {item.legs.map((leg, index) => {
              const originPlace = getLocalizedPlace(
                leg.origin.displayCode,
                leg.origin.name,
                leg.origin.city,
                locale
              );
              const destPlace = getLocalizedPlace(
                leg.destination.displayCode,
                leg.destination.name,
                leg.destination.city,
                locale
              );
              const originTerm = terminalOf(leg.origin);
              const destTerm = terminalOf(leg.destination);

              return (
                <div key={leg.id || leg.departure} className="relative z-0 rounded-2xl bg-slate-50/80 p-2.5 md:p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <span>{index === 0 ? copy.departure : copy.return}</span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Timer size={12} />
                      {formatDuration(leg.durationInMinutes)}
                    </span>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-2 gap-y-1 lg:flex lg:items-start lg:gap-3">
                    {/* Origin */}
                    <div className="min-w-0 text-start lg:flex-1">
                      <p className="text-xl font-black leading-none tabular-nums text-[#1e1b4b] lg:text-2xl lg:font-bold">
                        {formatClock(leg.departure)}
                      </p>
                      <p className="mt-1.5 truncate text-sm font-bold text-[#1e1b4b]">{originPlace.city}</p>
                      <p className="hidden truncate text-xs text-slate-600 lg:block">{originPlace.airport}</p>
                      <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-slate-400">
                        {originPlace.code}
                        {originTerm ? ` · ${copy.terminalLabel} ${originTerm}` : ""}
                      </p>
                    </div>

                    {/* Flight Path & Interactive Stops Popover on Hover */}
                    <div className="relative min-w-[4.75rem] px-0.5 pt-0.5 text-center lg:min-w-[9.5rem] lg:flex-1 lg:pt-1">
                      <div className="group/stop relative z-10 inline-block hover:z-50">
                        <button
                          type="button"
                          className="inline-flex min-h-8 items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-purple-900 cursor-pointer transition-colors"
                        >
                          <span>
                            {leg.stopCount === 0
                              ? (locale === "ar" ? "مباشر" : copy.nonstop)
                              : `${leg.stopCount} ${leg.stopCount === 1 ? copy.oneStop : copy.twoPlus}`}
                          </span>
                          <Info size={11} className="text-slate-400 group-hover/stop:text-purple-700" />
                        </button>

                        {/* Interactive Hover Popover */}
                        <div className="pointer-events-none opacity-0 group-hover/stop:pointer-events-auto group-hover/stop:opacity-100 transition-all duration-200 absolute bottom-full mb-2.5 z-[200] hidden w-72 max-w-[85vw] rounded-2xl border border-purple-200 bg-white p-4 text-start shadow-2xl shadow-purple-950/25 lg:block sm:w-84 -start-24 sm:-start-32">
                          <div className="absolute -bottom-1.5 start-28 sm:start-36 w-3 h-3 rotate-45 border-b border-e border-purple-200 bg-white" />
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                            <span className="text-xs font-black text-purple-950">
                              {leg.stopCount === 0
                                ? (locale === "ar" ? "رحلة مباشرة بدون توقف" : "Direct Non-Stop Flight")
                                : (locale === "ar" ? `تفاصيل محطات التوقف (${leg.stopCount})` : `Layover Details (${leg.stopCount})`)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {formatDuration(leg.durationInMinutes)}
                            </span>
                          </div>

                          {leg.stopCount === 0 ? (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {locale === "ar"
                                ? `رحلة مباشرة مستمرة تقلع من ${originPlace.city} (${originPlace.code}) وتصل إلى ${destPlace.city} (${destPlace.code}) دون أي تغيير في الطائرة أو انتظار ترانزيت.`
                                : `Direct flight departing from ${originPlace.city} (${originPlace.code}) arriving in ${destPlace.city} (${destPlace.code}) without layovers.`}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {leg.layovers.map((layover, lIdx) => {
                                const layoverPlace = getLocalizedPlace(
                                  layover.airport,
                                  layover.airport,
                                  layover.city,
                                  locale
                                );
                                const nextSeg = leg.segments[lIdx + 1] || leg.segments[0];
                                const nextCarrierName = getLocalizedAirlineName(
                                  nextSeg?.marketingCarrier?.code || nextSeg?.marketingCarrier?.name,
                                  locale
                                );
                                return (
                                  <div
                                    key={`layover-${lIdx}`}
                                    className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs"
                                  >
                                    <div className="flex items-center justify-between font-bold text-slate-900">
                                      <span>{layoverPlace.airport}</span>
                                      <span className="font-mono text-purple-900 bg-purple-100/80 px-1.5 py-0.5 rounded text-[10px]">
                                        {layoverPlace.code}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                                      <span>{layoverPlace.city}</span>
                                      <span className="font-bold text-amber-800">
                                        {locale === "ar" ? "مدة الانتظار:" : "Layover:"}{" "}
                                        {formatDuration(layover.durationInMinutes)}
                                      </span>
                                    </div>
                                    {nextSeg ? (
                                      <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center gap-2 text-[11px]">
                                        <AirlineLogo
                                          code={nextSeg.marketingCarrier?.code}
                                          name={nextCarrierName}
                                          size="sm"
                                        />
                                        <div>
                                          <span className="font-bold text-slate-800">{nextCarrierName}</span>
                                          <span className="text-slate-500 ms-1 text-[10px]">
                                            · {nextSeg.flightNumber || nextSeg.flightNo}
                                          </span>
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}

                              {/* Baggage transfer details */}
                              <div className="pt-1">
                                {item.isSelfTransfer ? (
                                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-900 leading-relaxed font-semibold">
                                    ⚠️{" "}
                                    <strong>
                                      {locale === "ar" ? "نقل ذاتي للأمتعة:" : "Self-Transfer Baggage:"}
                                    </strong>{" "}
                                    {locale === "ar"
                                      ? "يجب على المسافر استلام الحقائب المسجلة في مطار التوقف وإعادة وزنها وشحنها."
                                      : "Passenger must collect checked baggage at the layover airport and re-check it with the next carrier."}
                                  </div>
                                ) : (
                                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-[10px] text-emerald-900 leading-relaxed font-semibold">
                                    ✅{" "}
                                    <strong>
                                      {locale === "ar" ? "نقل الأمتعة تلقائي:" : "Baggage Checked-Through:"}
                                    </strong>{" "}
                                    {locale === "ar"
                                      ? "يتم نقل الحقائب المسجلة تلقائياً لوجهتك النهائية دون الحاجة لاستلامها أثناء التوقف."
                                      : "Baggage is automatically transferred to your final destination by the airlines."}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <FlightTrajectoryAnimation stopCount={leg.stopCount} isRtl={dir === "rtl"} />
                      <p className="text-[11px] font-bold text-[#1e1b4b]">
                        {formatDuration(leg.durationInMinutes)}
                      </p>
                    </div>

                    {/* Destination */}
                    <div className="min-w-0 text-end lg:flex-1">
                      <p className="text-xl font-black leading-none tabular-nums text-[#1e1b4b] lg:text-2xl lg:font-bold">
                        {formatClock(leg.arrival)}
                        {leg.timeDeltaInDays > 0 ? (
                          <span className="ms-1 text-[10px] font-bold text-[#d97706]">
                            +{leg.timeDeltaInDays}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1.5 truncate text-sm font-bold text-[#1e1b4b]">{destPlace.city}</p>
                      <p className="hidden truncate text-xs text-slate-600 lg:block">{destPlace.airport}</p>
                      <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-slate-400">
                        {destPlace.code}
                        {destTerm ? ` · ${copy.terminalLabel} ${destTerm}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Baggage & Fare Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {cabinState.status !== "unknown" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-purple-100">
                <Briefcase size={13} className="text-purple-700" />
                {baggageStateText(cabinState, locale, "cabin")}
              </span>
            ) : null}
            {checkedState.status === "included" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 ring-1 ring-emerald-200">
                <Luggage size={13} className="text-emerald-700" />
                {checkedBag || baggageStateText(checkedState, locale, "checked")}
              </span>
            ) : checkedState.status === "none" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-slate-400 ring-1 ring-slate-100">
                <Luggage size={13} />
                {copy.noCheckedBag}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-slate-500 ring-1 ring-slate-100" title={baggageStateText(checkedState, locale, "checked")}>
                <Luggage size={13} />
                {baggageStateText(checkedState, locale, "checked")}
              </span>
            )}
            {bagOffered && item.canAddPaidBaggage && sessionId && /^pk/i.test(item.id) ? (
              <button
                type="button"
                onClick={() => setBagOpen(true)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black transition cursor-pointer",
                  paidBag
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-100"
                    : "bg-amber-50 text-amber-950 ring-1 ring-amber-300 hover:bg-amber-100"
                )}
                title={paidBag ? copy.addBagSelected : copy.addBag}
                aria-label={paidBag ? copy.addBagSelected : copy.addBag}
              >
                {paidBag ? <Check size={12} className="stroke-[3]" /> : <Plus size={12} className="stroke-[3]" />}
                {paidBag ? `${copy.addBagSelected} · +${paidBag.weightKg} kg` : copy.addBag}
              </button>
            ) : null}
            {fareBrand ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-900 font-bold px-2.5 py-1 ring-1 ring-purple-200">
                {copy.fareBrand}: {fareBrand}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-purple-100">
              <Timer size={13} className="text-purple-700" />
              {formatDuration(totalDuration)} {copy.totalDuration}
            </span>
            {item.isSelfTransfer ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 ring-1 ring-amber-100">
                <ShieldCheck size={13} />
                {copy.selfTransfer}
              </span>
            ) : null}
            {paidBag ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-bold text-amber-900 ring-1 ring-amber-200">
                <Luggage size={13} />
                +{paidBag.weightKg} kg
              </span>
            ) : null}
          </div>
        </div>

        {/* Price & Action Section: Compact Sleek Horizontal Bar on Mobile (< lg), Rich Column on Desktop (lg:) */}
        <div className="relative isolate flex w-full shrink-0 flex-col overflow-hidden rounded-b-3xl lg:w-[220px] lg:rounded-b-none lg:rounded-e-3xl">
          <div className="absolute inset-0 bg-[#140428]" />
          <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(88,28,135,0.45)_0%,transparent_42%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(245,158,11,0.32),transparent_46%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-amber-300/90 via-amber-200/30 to-transparent" />
          <div className="hidden lg:block absolute inset-y-4 start-0 w-px bg-gradient-to-b from-amber-300/55 via-violet-300/15 to-transparent" />

          {/* --- MOBILE COMPACT FOOTER (< lg) --- */}
          <div className="relative flex lg:hidden items-end gap-3 p-3 text-white">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-bold text-amber-300/90">
                {copy.perPerson}
                <span className="ms-1 font-medium text-white/55">
                  · {locale === "ar" ? "شامل الرسوم" : locale === "tr" ? "Vergiler dahil" : "Taxes in"}
                </span>
              </p>
              <PromoPriceBlock
                amount={displayPrice}
                currency={item.currency}
                service="flights"
                formatPrice={formatFlightPrice}
                align="start"
                tone="dark"
                size="md"
                className="w-full min-w-0"
              />
              <LoyaltyPointsRow
                amount={item.price}
                currency={item.currency}
                service="flights"
                className="mt-1.5 text-[11px] font-bold text-amber-200"
              />
            </div>
            <div className="flex w-[9.5rem] shrink-0 flex-col gap-1.5">
              <button
                type="button"
                onClick={pickDefault}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-l from-amber-400 via-amber-500 to-amber-400 px-3 text-sm font-black text-[#1a0533] shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-[0.99]"
              >
                {copy.selectFlight}
              </button>
              {showFareTiers ? (
                <button
                  type="button"
                  onClick={() => setFaresOpen((open) => !open)}
                  className="inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2 text-[11px] font-bold text-amber-200"
                >
                  <span>{copy.fareTiers}</span>
                  {faresOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenDetails?.(item)}
                  className="inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2 text-[11px] font-bold text-white/85"
                >
                  <span>{copy.showDetails}</span>
                  <ChevronLeft size={12} className={cn("shrink-0", dir === "rtl" ? "" : "rotate-180")} />
                </button>
              )}
            </div>
          </div>

          {/* --- DESKTOP VIEW (lg:) --- */}
          <div className="relative hidden lg:flex h-full flex-col justify-between gap-3 p-3.5 text-white">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300/90">
                {copy.perPerson}
              </p>
              <PromoPriceBlock
                amount={displayPrice}
                currency={item.currency}
                service="flights"
                formatPrice={formatFlightPrice}
                align="start"
                tone="dark"
                className="w-full min-w-0"
                subLabel={paidBag ? `${copy.addBagPlusFlight} · +${paidBag.weightKg} kg` : undefined}
              />
              <p className="mt-1.5 text-[10px] font-bold text-white/55">
                {locale === "ar" ? "شامل الضرائب والرسوم" : locale === "tr" ? "Vergiler dahil" : "All taxes included"}
              </p>
              <LoyaltyPointsRow
                amount={item.price}
                currency={item.currency}
                service="flights"
                className="mt-2 font-bold text-amber-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={pickDefault}
                className="w-full rounded-xl bg-gradient-to-l from-amber-400 via-amber-500 to-amber-400 px-4 py-2.5 text-sm font-black text-[#1a0533] transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
              >
                {copy.selectFlight}
              </button>
              <div className="flex gap-2">
                {showFareTiers ? (
                  <button
                    type="button"
                    onClick={() => setFaresOpen((open) => !open)}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/8 px-2 py-1.5 text-[11px] font-bold text-amber-100 transition hover:bg-white/14 cursor-pointer"
                  >
                    {copy.fareTiers}
                    {faresOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onOpenDetails?.(item)}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/8 px-2 py-1.5 text-[11px] font-bold text-white/85 transition hover:bg-white/14 cursor-pointer"
                >
                  <span className="whitespace-nowrap">{copy.showDetails}</span>
                  <ChevronLeft size={12} className={cn("shrink-0", dir === "rtl" ? "" : "rotate-180")} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sessionId ? (
        <PaidBaggageModal
          open={bagOpen}
          onClose={() => setBagOpen(false)}
          copy={copy}
          sessionId={sessionId}
          itineraryId={item.id}
          fareId={item.fareFamilies[0]?.id}
          adults={query?.adults || 1}
          children={query?.childrens || query?.children || 0}
          infants={query?.infants || 0}
          currency={item.currency}
          selectedId={paidBag?.id}
          flightPrice={item.price}
          onSelect={setPaidBag}
          onEmpty={hideBags}
        />
      ) : null}

      {showFareTiers && faresOpen ? (
        <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 md:px-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            {copy.fareTiers}
          </p>
          <FarePackageGrid fares={item.fareFamilies} onSelect={pickFare} compact />
        </div>
      ) : null}
    </article>
  );
}

const FlightResultCard = memo(FlightResultCardComponent, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.price === next.item.price &&
    prev.item.checkedBaggage === next.item.checkedBaggage &&
    prev.onSelect === next.onSelect &&
    prev.onOpenDetails === next.onOpenDetails &&
    prev.copy === next.copy &&
    prev.sessionId === next.sessionId
  );
});

export default FlightResultCard;
