// src/components/transfers/AITourPlannerModal.tsx
"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Compass,
  MapPin,
  Clock,
  Car,
  Calendar,
  Download,
  CheckCircle2,
  ChevronRight,
  Printer,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTourToBook?: (tourOffer: any) => void;
}

export const AITourPlannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectTourToBook,
}) => {
  const { locale } = useLocale();
  const { formatPrice } = useCurrency();
  const isAr = locale === "ar";

  const [hubCity, setHubCity] = useState("istanbul");
  const [durationHours, setDurationHours] = useState(8);
  const [theme, setTheme] = useState("nature");
  const [vehicleClass, setVehicleClass] = useState("vc-vito-vip");
  const [guestName, setGuestName] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGeneratePlan = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const res = await fetch("/api/transfers/ai-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hubCity,
          durationHours,
          theme,
          vehicleClassId: vehicleClass,
          guestName: guestName.trim() || "ضيف لوناليزا الكريم",
          hotelName: hotelName.trim() || "بهو الفندق",
          date,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "تعذر توليد جدول الجولة الذكي");
      }

      setGeneratedPlan(data);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالمساعد الذكي");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBookGeneratedTour = () => {
    if (!generatedPlan || !onSelectTourToBook) return;
    const offer = {
      offer_id: `ai-tour-${Date.now()}`,
      vehicleClassId: vehicleClass,
      car_class: {
        title: generatedPlan.plan.vehicleClassName || "مرسيدس فيتو VIP",
        capacity: 7,
        luggage: 6,
      },
      price: generatedPlan.plan.estimatedPrice,
      currency: generatedPlan.plan.currency || "USD",
      supplier: "Lonaliza Fleet VIP",
      fromLabel: hotelName || `${hubCity.toUpperCase()} Hotel`,
      toLabel: `${generatedPlan.plan.title} (${durationHours}h Tour)`,
      date,
      time: "09:30",
      mode: "hourly" as const,
      hours: durationHours,
    };
    onSelectTourToBook(offer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-radial from-amber-500/20 via-slate-50 dark:via-slate-900 to-white dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 rtl:left-auto rtl:right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center gap-1">
              <Sparkles size={12} />
              AI Tour Assistant
            </span>
            <span className="text-xs text-slate-500 font-mono">
              مساعد التخطيط والجداول السياحية الذكية في تركيا
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "صمم جولتك الخاصة مع السائق بنقرة زر واحدة 🗺️" : "Craft Your Bespoke Daily Tour with AI 🗺️"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {isAr
              ? "اختر المدينة التركية والموضوع المفضل، وسيقوم المساعد الذكي بتنسيق جدول زمني دقيق للمحطات، مع سيارة مرسيدس وسائق خاص."
              : "Select Turkish hub and theme; AI crafts a minute-by-minute itinerary with luxury chauffeur."}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* City Hub */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                <MapPin size={13} className="text-amber-500" />
                <span>{isAr ? "المدينة / المركز السياحي" : "Hub City"}</span>
              </label>
              <select
                value={hubCity}
                onChange={(e) => setHubCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:border-amber-500"
              >
                <option value="istanbul">إسطنبول (Istanbul & Bosphorus)</option>
                <option value="trabzon">طرابزون والشمال التركي (Trabzon & Uzungol)</option>
                <option value="bursa">بورصة وجبل أولوداغ (Bursa & Uludag)</option>
                <option value="sapanca">سبانجا والمعشوقية (Sapanca & Masukiye)</option>
                <option value="antalya">أنطاليا وشلالات دودان (Antalya Coast)</option>
                <option value="cappadocia">كابادوكيا والمناطيد (Cappadocia)</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Clock size={13} className="text-sky-500" />
                <span>{isAr ? "مدة الجولة بالساعات" : "Tour Duration"}</span>
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:border-amber-500"
              >
                <option value={4}>4 ساعات (نصف يوم Express)</option>
                <option value={8}>8 ساعات (يوم كامل Classic VIP)</option>
                <option value={10}>10 ساعات (يوم كامل شامل الغروب)</option>
                <option value={12}>12 ساعة (جولة ممتدة بين المدن)</option>
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Compass size={13} className="text-emerald-500" />
                <span>{isAr ? "طابع الجولة المفضل" : "Tour Theme"}</span>
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:border-amber-500"
              >
                <option value="nature">طبيعة وشلالات وإطلالات بانورامية</option>
                <option value="historical">تاريخية ومعالم وأسواق أثرية</option>
                <option value="shopping">تسوق فاخر ومولات وأوتليت</option>
                <option value="family">عائلية وأنشطة أطفال وتلفريك</option>
                <option value="bosphorus">البوسفور والقصور العثمانية</option>
              </select>
            </div>

            {/* Vehicle Class */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Car size={13} className="text-purple-500" />
                <span>{isAr ? "فئة السيارة المطلوبة" : "Vehicle Class"}</span>
              </label>
              <select
                value={vehicleClass}
                onChange={(e) => setVehicleClass(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:border-amber-500"
              >
                <option value="vc-vito-vip">مرسيدس فيتو VIP (حتى 7 ركاب)</option>
                <option value="vc-sprinter-vip">مرسيدس سبرينتر VIP (حتى 15 راكب)</option>
                <option value="vc-maybach-s">مايباخ S-Class VIP (حتى 3 ركاب)</option>
                <option value="vc-sedan-business">سيدان أعمال Business (حتى 3 ركاب)</option>
              </select>
            </div>

            {/* Guest Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                {isAr ? "اسم الضيف الكريم" : "Guest Name"}
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={isAr ? "مثال: عبد العزيز الشمري" : "Guest Name"}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Hotel Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                {isAr ? "فندق الإقامة (نقطة الانطلاق)" : "Hotel / Pickup Spot"}
              </label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder={isAr ? "مثال: فندق الفورسيزونز" : "Four Seasons Hotel"}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Action Button to Generate */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] transition-all disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? "جاري ابتكار خطة الجولة بواسطة الذكاء الاصطناعي..." : "AI is generating your tour..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? "توليد الجدول الزمني الذكي للرحلة 🚀" : "Generate Bespoke Tour Plan 🚀"}</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Tour Results Display */}
          {generatedPlan && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
              <div className="p-4 sm:p-5 rounded-2xl bg-radial from-amber-500/10 via-slate-50 dark:via-slate-800/80 to-white dark:to-slate-800 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black">
                      خطة معتمدة
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {durationHours} Hours | {generatedPlan.plan.vehicleClassName}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {generatedPlan.plan.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {generatedPlan.plan.summary}
                  </p>
                </div>

                <div className="text-right rtl:text-left shrink-0">
                  <div className="text-[11px] text-slate-400 font-sans">{isAr ? "السعر الشامل المقدر" : "Total Estimated"}</div>
                  <div className="text-2xl font-black text-amber-500 font-mono">
                    ${generatedPlan.plan.estimatedPrice} <span className="text-xs font-sans">{generatedPlan.plan.currency}</span>
                  </div>
                </div>
              </div>

              {/* Itinerary Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-500" />
                  <span>{isAr ? "الجدول الزمني المقترح للمحطات:" : "Detailed Timeline Stops:"}</span>
                </h4>

                <div className="relative border-r-2 rtl:border-r-2 ltr:border-l-2 border-amber-500/30 mr-3 rtl:mr-3 ltr:ml-3 pr-4 rtl:pr-4 ltr:pl-4 space-y-3 text-xs">
                  {generatedPlan.plan.stops?.map((stop: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -right-[23px] rtl:-right-[23px] ltr:-left-[23px] top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {stop.stopName}
                          </span>
                          <span className="font-mono text-[11px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                            {stop.time} ({stop.durationMinutes} دقيقة)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {stop.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 block">
                  {isAr ? "ما تشمله الجولة الفاخرة:" : "Tour Inclusions:"}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={13} /> <span>سائق خاص يتحدث العربية</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={13} /> <span>شامل الوقود ورسوم الطرق</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={13} /> <span>إنترنت WiFi ومياه مجانية</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={13} /> <span>تنسيق مواعيد الدخول للمعالم</span>
                  </div>
                </div>
              </div>

              {/* Actions: Book Now or Print Voucher */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (generatedPlan.voucherHtml) {
                      const win = window.open("", "_blank");
                      if (win) {
                        win.document.write(generatedPlan.voucherHtml);
                        win.document.close();
                      }
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors"
                >
                  <Printer size={15} />
                  <span>{isAr ? "معاينة وطباعة جدول الرحلة (PDF/Voucher)" : "Print/View PDF Itinerary"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBookGeneratedTour}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all"
                >
                  <span>{isAr ? "حجز هذه الجولة الآن ➔" : "Book This Tour Now ➔"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
