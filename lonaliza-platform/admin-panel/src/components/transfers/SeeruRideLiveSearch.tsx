"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { buildWhatsAppLink } from "@/lib/utils";

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
  const [fromQuery, setFromQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<RideLocation | null>(null);
  const [fromSuggestions, setFromSuggestions] = useState<RideLocation[]>([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);

  const [toQuery, setToQuery] = useState("");
  const [selectedTo, setSelectedTo] = useState<RideLocation | null>(null);
  const [toSuggestions, setToSuggestions] = useState<RideLocation[]>([]);
  const [toLoading, setToLoading] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("12:00");
  const [pax, setPax] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [mode, setMode] = useState<"transfer" | "hourly">("transfer");
  const [hours, setHours] = useState(4);

  const [searching, setSearching] = useState(false);
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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

          {/* Mode Switcher: Transfer vs Hourly */}
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

          {/* Destination Location */}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-sky-500" />
                    <span>{isAr ? "خيارات التوصيل المتاحة فوراً" : "Available Live Rides"}</span>
                    <span className="text-xs text-slate-500">({offers.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offers.map((offer) => {
                    const waText = isAr
                      ? `مرحباً، أود حجز ترانسفير: ${offer.car_class.title} من ${fromQuery} إلى ${toQuery || "الوجهة"} بتاريخ ${date} ${time} بسعر ${offer.price} ${offer.currency}`
                      : `Hello, I'd like to book a ride: ${offer.car_class.title} from ${fromQuery} to ${toQuery || "destination"} on ${date} ${time} for ${offer.price} ${offer.currency}`;
                    const waLink = buildWhatsAppLink("+905528888800", waText);

                    return (
                      <div
                        key={offer.offer_id}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <span className="font-bold text-slate-900 dark:text-white text-base">
                              {offer.car_class.title}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
                              {offer.supplier || "Instant Ride"}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 mb-4">
                            <span className="flex items-center gap-1">
                              <Users size={14} className="text-slate-400" />
                              <span>{offer.car_class.capacity} {isAr ? "ركاب" : "seats"}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase size={14} className="text-slate-400" />
                              <span>{offer.car_class.luggage} {isAr ? "حقائب" : "bags"}</span>
                            </span>
                            {offer.route?.estimated_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock size={14} className="text-slate-400" />
                                <span>{offer.route.estimated_minutes} {isAr ? "دقيقة" : "min"}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] text-slate-400 block">
                              {isAr ? "السعر الإجمالي شامل الرسوم" : "Total all-inclusive"}
                            </span>
                            <span className="text-xl font-black text-sky-600 dark:text-sky-400">
                              {formatPrice(offer.price, offer.currency || "USD")}
                            </span>
                          </div>

                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                          >
                            <MessageCircle size={14} />
                            <span>{isAr ? "حجز فوري عبر واتساب" : "Book via WhatsApp"}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
