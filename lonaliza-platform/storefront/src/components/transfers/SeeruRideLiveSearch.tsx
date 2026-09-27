"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Search,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  LayoutGrid,
  List,
  Wifi,
  Tv,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { buildWhatsAppLink } from "@/lib/utils";
import { TransferBookingModal } from "@/components/transfers/TransferBookingModal";
import { AITourPlannerModal } from "@/components/transfers/AITourPlannerModal";

interface RideLocation {
  place_id: string;
  label: string;
  type: string;
}

interface RideOffer {
  offer_id: string;
  car_class: {
    title: string;
    capacity: number;
    luggage: number;
    image?: string;
  };
  price: number;
  basePrice: number;
  currency: string;
  supplier?: string;
  route?: {
    distance_km?: number;
    estimated_minutes?: number;
  };
}

export default function SeeruRideLiveSearch() {
  const { locale } = useLocale();
  const { formatPrice } = useCurrency();

  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode");
  const urlCity = searchParams.get("city");
  const urlHours = searchParams.get("hours");
  const urlFrom = searchParams.get("from");
  const urlTo = searchParams.get("to");
  const urlDate = searchParams.get("date");
  const urlTime = searchParams.get("time");
  const urlGuests = searchParams.get("guests") || searchParams.get("pax");

  const [fromQuery, setFromQuery] = useState(
    urlMode === "daily_tour" || urlMode === "hourly"
      ? urlCity || (locale === "ar" ? "إسطنبول" : "Istanbul")
      : urlFrom || ""
  );
  const [selectedFrom, setSelectedFrom] = useState<RideLocation | null>(null);
  const [fromSuggestions, setFromSuggestions] = useState<RideLocation[]>([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);

  const [toQuery, setToQuery] = useState(urlTo || "");
  const [selectedTo, setSelectedTo] = useState<RideLocation | null>(null);
  const [toSuggestions, setToSuggestions] = useState<RideLocation[]>([]);
  const [toLoading, setToLoading] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [date, setDate] = useState(() => {
    if (urlDate) return urlDate;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState(urlTime || "10:00");
  const [pax, setPax] = useState(Number(urlGuests) || 2);
  const [luggage, setLuggage] = useState(2);
  const [mode, setMode] = useState<"transfer" | "hourly">(
    urlMode === "daily_tour" || urlMode === "hourly" ? "hourly" : "transfer"
  );
  const [hours, setHours] = useState(Number(urlHours) || 8);

  const [searching, setSearching] = useState(false);
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [resultsViewMode, setResultsViewMode] = useState<"grid" | "list">("grid");

  const [selectedOfferForBooking, setSelectedOfferForBooking] = useState<any | null>(null);
  const [isAITourPlannerOpen, setIsAITourPlannerOpen] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete From
  useEffect(() => {
    if (!fromQuery || fromQuery.length < 2 || (selectedFrom && selectedFrom.label === fromQuery)) {
      setFromSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setFromLoading(true);
      try {
        const res = await fetch(`/api/transfers/locations?q=${encodeURIComponent(fromQuery)}&lang=${locale}`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.locations)) {
          setFromSuggestions(data.locations);
          setShowFromDropdown(true);
        }
      } catch (err) {
        console.warn("Location query error:", err);
      } finally {
        setFromLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [fromQuery, locale, selectedFrom]);

  // Autocomplete To
  useEffect(() => {
    if (!toQuery || toQuery.length < 2 || (selectedTo && selectedTo.label === toQuery)) {
      setToSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setToLoading(true);
      try {
        const res = await fetch(`/api/transfers/locations?q=${encodeURIComponent(toQuery)}&lang=${locale}`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.locations)) {
          setToSuggestions(data.locations);
          setShowToDropdown(true);
        }
      } catch (err) {
        console.warn("Location query error:", err);
      } finally {
        setToLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [toQuery, locale, selectedTo]);

  const handleSearch = async () => {
    const fromId = selectedFrom ? selectedFrom.place_id : fromQuery.trim();
    if (!fromId) {
      setSearchError(isAr ? "يرجى تحديد نقطة الانطلاق" : "Please specify a pickup location");
      return;
    }

    setSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const payload = {
        fromPlaceId: fromId,
        toPlaceId: selectedTo ? selectedTo.place_id : toQuery.trim() || undefined,
        date,
        time,
        mode,
        hours: mode === "hourly" ? hours : undefined,
        pax,
        luggage,
      };

      const res = await fetch("/api/transfers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok && Array.isArray(data.offers)) {
        setOffers(data.offers);
        if (data.offers.length === 0) {
          setSearchError(
            isAr
              ? "لم تتوفر عروض مباشرة لهذا المسار حالياً، تواصل معنا عبر واتساب لترتيب سيارة خاصة فوراً"
              : "No direct ride offers found for this route. Contact us on WhatsApp for custom VIP booking."
          );
        }
      } else {
        setOffers([]);
        setSearchError(data.error || (isAr ? "تعذر جلب عروض التوصيل" : "Failed to fetch ride offers"));
      }
    } catch (err: any) {
      setOffers([]);
      setSearchError(err.message || (isAr ? "حدث خطأ أثناء البحث" : "Error searching rides"));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 -mt-10 relative z-20">
      {/* Search Container Box */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl">
              <Car size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isAr ? "بحث التوصيل والترانسفير المباشر" : "Live Airport & City Transfers"}</span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                  Live GDS
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? "شبكة ترانسفير عالمية فورية مع سيارات سيدان، فانات VIP، وسيارات دفع رباعي"
                  : "Instant global rides with standard sedans, VIP minivans, and executive SUVs"}
              </p>
            </div>
          </div>

          {/* Controls: Mode Switcher & AI Tour Assistant */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAITourPlannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles size={13} />
              <span>{isAr ? "مساعد الجولات الذكي AI 🗺️" : "AI Tour Assistant 🗺️"}</span>
            </button>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode("transfer")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === "transfer"
                    ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {isAr ? "توصيل من نقطة لنقطة" : "Point to Point"}
              </button>
              <button
                type="button"
                onClick={() => setMode("hourly")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === "hourly"
                    ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {isAr ? "حجز بالساعة (مع سائق)" : "By the Hour"}
              </button>
            </div>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pickup Location */}
          <div ref={fromRef} className="relative">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-sky-500" />
              <span>{isAr ? "نقطة الانطلاق (مطار أو فندق أو عنوان)" : "Pickup Location"}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  setSelectedFrom(null);
                }}
                onFocus={() => {
                  if (fromSuggestions.length > 0) setShowFromDropdown(true);
                }}
                placeholder={isAr ? "مثال: مطار اسطنبول (IST)" : "e.g. Istanbul Airport (IST)"}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
              {fromLoading && (
                <Loader2 size={14} className="absolute right-3 top-3 animate-spin text-slate-400" />
              )}
            </div>

            {/* Suggestions dropdown */}
            {showFromDropdown && fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-56 overflow-y-auto">
                {fromSuggestions.map((loc) => (
                  <button
                    key={loc.place_id}
                    type="button"
                    onClick={() => {
                      setSelectedFrom(loc);
                      setFromQuery(loc.label);
                      setShowFromDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-sky-50 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                  >
                    <MapPin size={12} className="text-sky-500 shrink-0" />
                    <span className="truncate">{loc.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Location (Transfer Mode) OR Duration in Hours (Hourly Mode) */}
          {mode === "hourly" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                <span>{isAr ? "مدة الجولة بالساعات" : "Tour Duration"}</span>
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full h-[42px] px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <option value={4}>{isAr ? "4 ساعات (نصف يوم)" : "4 Hours (Half Day)"}</option>
                <option value={8}>{isAr ? "8 ساعات (يوم كامل ★ موصى به)" : "8 Hours (Full Day ★ Recommended)"}</option>
                <option value={10}>{isAr ? "10 ساعات (يوم مطوّل)" : "10 Hours (Extended Day)"}</option>
                <option value={12}>{isAr ? "12 ساعة (يوم شامل كامل)" : "12 Hours (Comprehensive Day)"}</option>
              </select>
            </div>
          ) : (
            <div ref={toRef} className="relative">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-500" />
                <span>{isAr ? "وجهة الوصول (فندق أو حي أو مطار)" : "Dropoff Location"}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={toQuery}
                  onChange={(e) => {
                    setToQuery(e.target.value);
                    setSelectedTo(null);
                  }}
                  onFocus={() => {
                    if (toSuggestions.length > 0) setShowToDropdown(true);
                  }}
                  placeholder={isAr ? "مثال: تقسيم، اسطنبول" : "e.g. Taksim, Istanbul"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                {toLoading && (
                  <Loader2 size={14} className="absolute right-3 top-3 animate-spin text-slate-400" />
                )}
              </div>

              {/* Suggestions dropdown */}
              {showToDropdown && toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-56 overflow-y-auto">
                  {toSuggestions.map((loc) => (
                    <button
                      key={loc.place_id}
                      type="button"
                      onClick={() => {
                        setSelectedTo(loc);
                        setToQuery(loc.label);
                        setShowToDropdown(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                    >
                      <MapPin size={12} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{loc.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-amber-500" />
                <span>{isAr ? "التاريخ" : "Date"}</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock size={13} className="text-amber-500" />
                <span>{isAr ? "الوقت" : "Time"}</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          {/* Passengers & Luggage / Action */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Users size={13} className="text-purple-500" />
                <span>{isAr ? "الركاب" : "Passengers"}</span>
              </label>
              <select
                value={pax}
                onChange={(e) => setPax(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 18].map((n) => (
                  <option key={n} value={n}>
                    {n} {isAr ? "أشخاص" : "pax"}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="flex-1 h-[42px] px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 shrink-0"
            >
              {searching ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isAr ? "جاري البحث..." : "Searching..."}</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>{isAr ? "بحث حي" : "Search"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results Display */}
        {hasSearched && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            {searchError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs sm:text-sm mb-4">
                {searchError}
              </div>
            )}

            {offers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-sky-500" />
                    <span>{isAr ? "خيارات التوصيل المتاحة فوراً" : "Available Live Rides"}</span>
                    <span className="text-xs text-slate-500">({offers.length})</span>
                  </h3>

                  {/* View Mode Switcher: Grid vs List */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setResultsViewMode("grid")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        resultsViewMode === "grid"
                          ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <LayoutGrid size={13} />
                      <span>{isAr ? "شبكة" : "Grid"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResultsViewMode("list")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        resultsViewMode === "list"
                          ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <List size={13} />
                      <span>{isAr ? "قائمة" : "List"}</span>
                    </button>
                  </div>
                </div>

                {/* ── GRID VIEW ── */}
                {resultsViewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.map((offer, idx) => {
                      const carTitle = offer.car_class?.title || (offer as any).vehicleClassName || (offer as any).tourTitle || "Mercedes-Benz VIP";
                      const carCapacity = offer.car_class?.capacity || (offer as any).capacity || 6;
                      const carLuggage = offer.car_class?.luggage || (offer as any).luggage || 4;
                      const carPrice = offer.price ?? (offer as any).pricing?.finalTotal ?? (offer as any).pricing?.basePrice ?? 120;
                      const carCurrency = offer.currency || (offer as any).pricing?.currency || "USD";
                      const img = (offer as any).images?.[0] || (offer as any).matchedVehicle?.images?.[0] || offer.car_class?.image || "https://images.unsplash.com/photo-1544620341-f53c95b3b9a7?w=800&q=80";
                      const offerId = offer.offer_id || (offer as any).vehicleClassId || `offer-${idx}`;

                      const waText = isAr
                        ? `مرحباً، أود حجز: ${carTitle} (${mode === "hourly" ? `جولة ${hours} ساعات` : "ترانسفير"}) من ${fromQuery} إلى ${toQuery || "الوجهة"} بتاريخ ${date} ${time} بسعر ${carPrice} ${carCurrency}`
                        : `Hello, I'd like to book: ${carTitle} (${mode === "hourly" ? `${hours}h Tour` : "Transfer"}) from ${fromQuery} on ${date} ${time} for ${carPrice} ${carCurrency}`;
                      const waLink = buildWhatsAppLink("+905528888800", waText);

                      return (
                        <div
                          key={offerId}
                          className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                        >
                          {/* Image with Badges */}
                          <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                            <img
                              src={img}
                              alt={carTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-black text-[10px] uppercase shadow-xs">
                                VIP
                              </span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white font-semibold">
                                {offer.supplier || "VIP Fleet"}
                              </span>
                            </div>

                            <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                              <span className="font-black text-sm">{carTitle}</span>
                              <span className="flex items-center gap-1 text-amber-300 font-bold text-[11px]">
                                <Sparkles size={11} className="text-amber-400" />
                                <span>98% نظافة VIP</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                            {/* Capacity and Features */}
                            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
                              <span className="flex items-center gap-1 font-bold">
                                <Users size={13} className="text-purple-600 dark:text-purple-400" />
                                <span>{carCapacity} {isAr ? "ركاب" : "pax"}</span>
                              </span>
                              <span className="flex items-center gap-1 font-bold">
                                <Briefcase size={13} className="text-amber-600 dark:text-amber-400" />
                                <span>{carLuggage} {isAr ? "حقائب" : "bags"}</span>
                              </span>
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                {isAr ? "سائق عربي" : "Arabic Chauffeur"}
                              </span>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-slate-400 block leading-tight">
                                    {isAr ? "السعر شامل الوقود والرسوم" : "All-inclusive total"}
                                  </span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-amber-500">
                                      {formatPrice(carPrice, carCurrency)}
                                    </span>
                                    <span className="text-[10px] text-emerald-500 font-bold">
                                      {isAr ? "(خصم 10%)" : "(10% off)"}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedOfferForBooking({
                                      ...offer,
                                      fromLabel: selectedFrom ? selectedFrom.label : fromQuery,
                                      toLabel: selectedTo ? selectedTo.label : toQuery,
                                      date,
                                      time,
                                      mode,
                                      hours: mode === "hourly" ? hours : undefined,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                                >
                                  <span>{isAr ? "احجز الآن VIP" : "Book VIP Now"}</span>
                                  <ArrowRight size={13} className="rtl:rotate-180" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                                <span>{isAr ? "إلغاء مجاني قبل 24 ساعة" : "Free cancel 24h before"}</span>
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:underline flex items-center gap-1 font-bold"
                                >
                                  <MessageCircle size={12} />
                                  <span>{isAr ? "واتساب" : "WhatsApp"}</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── LIST VIEW ── */}
                {resultsViewMode === "list" && (
                  <div className="space-y-3">
                    {offers.map((offer, idx) => {
                      const carTitle = offer.car_class?.title || (offer as any).vehicleClassName || (offer as any).tourTitle || "Mercedes-Benz VIP";
                      const carCapacity = offer.car_class?.capacity || (offer as any).capacity || 6;
                      const carLuggage = offer.car_class?.luggage || (offer as any).luggage || 4;
                      const carPrice = offer.price ?? (offer as any).pricing?.finalTotal ?? (offer as any).pricing?.basePrice ?? 120;
                      const carCurrency = offer.currency || (offer as any).pricing?.currency || "USD";
                      const img = (offer as any).images?.[0] || (offer as any).matchedVehicle?.images?.[0] || offer.car_class?.image || "https://images.unsplash.com/photo-1544620341-f53c95b3b9a7?w=800&q=80";
                      const offerId = offer.offer_id || (offer as any).vehicleClassId || `offer-list-${idx}`;

                      const waText = isAr
                        ? `مرحباً، أود حجز: ${carTitle} (${mode === "hourly" ? `جولة ${hours} ساعات` : "ترانسفير"}) من ${fromQuery} إلى ${toQuery || "الوجهة"} بتاريخ ${date} ${time} بسعر ${carPrice} ${carCurrency}`
                        : `Hello, I'd like to book: ${carTitle} (${mode === "hourly" ? `${hours}h Tour` : "Transfer"}) from ${fromQuery} on ${date} ${time} for ${carPrice} ${carCurrency}`;
                      const waLink = buildWhatsAppLink("+905528888800", waText);

                      return (
                        <div
                          key={offerId}
                          className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row items-stretch"
                        >
                          <div className="relative sm:w-56 w-full h-40 sm:h-auto bg-slate-950 shrink-0 overflow-hidden">
                            <img
                              src={img}
                              alt={carTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[9px] uppercase">
                              VIP
                            </div>
                            <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between text-white text-[10px] font-bold">
                              <span className="flex items-center gap-1 text-amber-300">
                                <Sparkles size={10} />
                                <span>98% نظافة</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <h4 className="text-base font-black text-slate-900 dark:text-white">
                                  {carTitle}
                                </h4>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {offer.supplier || "Lonaliza Fleet"} • {isAr ? "سائق يتحدث العربية" : "Arabic Chauffeur"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs">
                                  <Users size={13} />
                                  <span>{carCapacity} {isAr ? "ركاب" : "pax"}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs">
                                  <Briefcase size={13} />
                                  <span>{carLuggage} {isAr ? "حقائب" : "bags"}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
                              <div>
                                <span className="text-[10px] text-slate-400 block">
                                  {isAr ? "السعر شامل الوقود والرسوم" : "All-inclusive"}
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-black text-amber-500">
                                    {formatPrice(carPrice, carCurrency)}
                                  </span>
                                  <span className="text-[10px] text-emerald-500 font-bold">
                                    {isAr ? "(خصم 10%)" : "(10% off)"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors"
                                >
                                  <MessageCircle size={13} />
                                  <span>واتساب</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedOfferForBooking({
                                      ...offer,
                                      fromLabel: selectedFrom ? selectedFrom.label : fromQuery,
                                      toLabel: selectedTo ? selectedTo.label : toQuery,
                                      date,
                                      time,
                                      mode,
                                      hours: mode === "hourly" ? hours : undefined,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                                >
                                  <span>{isAr ? "احجز الآن VIP" : "Book VIP Now"}</span>
                                  <ArrowRight size={13} className="rtl:rotate-180" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Checkout Modal */}
      <TransferBookingModal
        isOpen={!!selectedOfferForBooking}
        offer={selectedOfferForBooking}
        onClose={() => setSelectedOfferForBooking(null)}
      />

      {/* AI Tour Planner Assistant Modal */}
      <AITourPlannerModal
        isOpen={isAITourPlannerOpen}
        onClose={() => setIsAITourPlannerOpen(false)}
        onSelectTourToBook={(tourOffer) => setSelectedOfferForBooking(tourOffer)}
      />
    </div>
  );
}
