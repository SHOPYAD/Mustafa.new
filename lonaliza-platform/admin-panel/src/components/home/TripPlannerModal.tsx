// src/components/home/TripPlannerModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  Plane,
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  Star,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useSiteContact } from "@/hooks/useSiteContact";
import { buildWhatsAppLink } from "@/lib/utils";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const destinations = [
  {
    id: "istanbul",
    nameAr: "إسطنبول",
    nameEn: "Istanbul",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400",
    emoji: "🇹🇷",
  },
  {
    id: "antalya",
    nameAr: "أنطاليا",
    nameEn: "Antalya",
    image:
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400",
    emoji: "🏖️",
  },
  {
    id: "cappadocia",
    nameAr: "كابادوكيا",
    nameEn: "Cappadocia",
    image:
      "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=400",
    emoji: "🎈",
  },
  {
    id: "trabzon",
    nameAr: "طرابزون",
    nameEn: "Trabzon",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
    emoji: "🌲",
  },
  {
    id: "sapanca",
    nameAr: "سبانجا",
    nameEn: "Sapanca",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    emoji: "🏞️",
  },
  {
    id: "ayder",
    nameAr: "آيدر",
    nameEn: "Ayder",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
    emoji: "⛰️",
  },
];

const travelStyles = [
  {
    id: "adventure",
    nameAr: "مغامرة",
    nameEn: "Adventure",
    icon: "🏔️",
    descAr: "أنشطة مثيرة واستكشاف",
    descEn: "Thrilling activities & exploration",
  },
  {
    id: "relaxation",
    nameAr: "استرخاء",
    nameEn: "Relaxation",
    icon: "🏖️",
    descAr: "شواطئ وسبا وعافية",
    descEn: "Beaches, spas & wellness",
  },
  {
    id: "cultural",
    nameAr: "ثقافة",
    nameEn: "Cultural",
    icon: "🏛️",
    descAr: "تاريخ وفن وتقاليد محلية",
    descEn: "History, art & local traditions",
  },
  {
    id: "romantic",
    nameAr: "رومانسية",
    nameEn: "Romantic",
    icon: "💕",
    descAr: "رحلات للأزواج و شهر العسل",
    descEn: "Couples getaways & honeymoons",
  },
  {
    id: "family",
    nameAr: "عائلي",
    nameEn: "Family",
    icon: "👨‍👩‍👧‍👦",
    descAr: "أنشطة مناسبة للأطفال",
    descEn: "Kid-friendly activities",
  },
  {
    id: "luxury",
    nameAr: "فاخر",
    nameEn: "Luxury",
    icon: "👑",
    descAr: "تجارب مميزة وفاخرة",
    descEn: "Premium experiences",
  },
];

const budgetRanges = [
  { id: "budget", labelAr: "٥٠٠ – ١٬٠٠٠ $", labelEn: "$500 - $1,000", value: 750 },
  { id: "mid", labelAr: "١٬٠٠٠ – ٢٬٠٠٠ $", labelEn: "$1,000 - $2,000", value: 1500 },
  { id: "premium", labelAr: "٢٬٠٠٠ – ٣٬٥٠٠ $", labelEn: "$2,000 - $3,500", value: 2750 },
  { id: "luxury", labelAr: "٣٬٥٠٠ $+", labelEn: "$3,500+", value: 4000 },
];

export default function TripPlannerModal({
  isOpen,
  onClose,
}: TripPlannerModalProps) {
  const { locale } = useLocale();
  const contact = useSiteContact();
  const isAr = locale === "ar";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: "",
    dates: { start: "", end: "" },
    travelers: 2,
    budget: "",
    travelStyle: [] as string[],
  });

  const totalSteps = 4;

  const waMessage = isAr
    ? `مرحباً لوناليزا، أرغب بتخطيط رحلة تركيا: ${formData.destination}، مسافرون ${formData.travelers}، ميزانية ${formData.budget}`
    : `Hello Lonaliza, I'd like to plan a Turkey trip: ${formData.destination}, travelers ${formData.travelers}, budget ${formData.budget}`;
  const waLink = buildWhatsAppLink(
    contact.whatsappNumber || DEFAULT_SITE_WHATSAPP,
    waMessage
  );

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleTravelStyle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      travelStyle: prev.travelStyle.includes(id)
        ? prev.travelStyle.filter((s) => s !== id)
        : [...prev.travelStyle, id],
    }));
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setFormData({
        destination: "",
        dates: { start: "", end: "" },
        travelers: 2,
        budget: "",
        travelStyle: [],
      });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeAndReset}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-3xl border border-white/10 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeAndReset}
              className="absolute top-4 end-4 z-10 p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {isAr ? "خطّط رحلتك في تركيا" : "Plan your Turkey trip"}
                  </h2>
                  <p className="text-white/50 text-sm">
                    {isAr
                      ? `الخطوة ${step} من ${totalSteps}`
                      : `Step ${step} of ${totalSteps}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-8">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i + 1 <= step ? "bg-amber-400" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {step === 1 && (
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-amber-400" />
                    {isAr ? "اختر مدينة تركية" : "Choose a Turkey city"}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {destinations.map((d) => {
                      const name = isAr ? d.nameAr : d.nameEn;
                      const selected = formData.destination === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() =>
                            setFormData((p) => ({ ...p, destination: d.id }))
                          }
                          className={`relative rounded-2xl overflow-hidden border text-start transition-all ${
                            selected
                              ? "border-amber-400 ring-2 ring-amber-400/40"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={d.image}
                              alt={name}
                              fill
                              className="object-cover"
                              sizes="160px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            {selected && (
                              <div className="absolute top-2 end-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                            <div className="absolute bottom-2 start-2 end-2">
                              <span className="text-lg me-1">{d.emoji}</span>
                              <span className="text-white font-semibold text-sm">
                                {name}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Calendar size={18} className="text-amber-400" />
                    {isAr ? "التواريخ والمسافرون" : "Dates & travelers"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block text-white/60 text-sm">
                      {isAr ? "تاريخ البدء" : "Start date"}
                      <input
                        type="date"
                        value={formData.dates.start}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            dates: { ...p.dates, start: e.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-white"
                      />
                    </label>
                    <label className="block text-white/60 text-sm">
                      {isAr ? "تاريخ العودة" : "End date"}
                      <input
                        type="date"
                        value={formData.dates.end}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            dates: { ...p.dates, end: e.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-white"
                      />
                    </label>
                  </div>
                  <label className="block text-white/60 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Users size={16} />
                      {isAr ? "عدد المسافرين" : "Travelers"}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formData.travelers}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          travelers: Number(e.target.value) || 1,
                        }))
                      }
                      className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-white"
                    />
                  </label>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Heart size={18} className="text-amber-400" />
                    {isAr ? "أسلوب السفر" : "Travel style"}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {travelStyles.map((s) => {
                      const selected = formData.travelStyle.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleTravelStyle(s.id)}
                          className={`rounded-2xl p-4 text-start border transition-all ${
                            selected
                              ? "border-amber-400 bg-amber-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/25"
                          }`}
                        >
                          <span className="text-2xl">{s.icon}</span>
                          <p className="text-white font-semibold mt-2">
                            {isAr ? s.nameAr : s.nameEn}
                          </p>
                          <p className="text-white/45 text-xs mt-1">
                            {isAr ? s.descAr : s.descEn}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <DollarSign size={18} className="text-amber-400" />
                    {isAr ? "الميزانية التقريبية" : "Approximate budget"}
                  </h3>
                  <div className="space-y-3">
                    {budgetRanges.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, budget: b.id }))
                        }
                        className={`w-full rounded-2xl px-4 py-3.5 text-start border transition-all ${
                          formData.budget === b.id
                            ? "border-amber-400 bg-amber-500/10 text-white"
                            : "border-white/10 bg-white/5 text-white/80 hover:border-white/25"
                        }`}
                      >
                        {isAr ? b.labelAr : b.labelEn}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
                    <Star className="text-amber-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-white/60 text-sm leading-relaxed">
                      {isAr
                        ? "سنجهّز لك باقة تركيا تقريبية (فنادق + تنقلات) ونتواصل عبر واتساب للتأكيد."
                        : "We'll prepare an approximate Turkey package (hotels + transfers) and follow up on WhatsApp."}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white/70 disabled:opacity-30 hover:bg-white/10"
                >
                  <ChevronLeft size={18} className="rtl:rotate-180" />
                  {isAr ? "رجوع" : "Back"}
                </button>
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !formData.destination) ||
                      (step === 3 && formData.travelStyle.length === 0)
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-slate-950 font-semibold disabled:opacity-40 hover:bg-amber-400"
                  >
                    {isAr ? "التالي" : "Next"}
                    <ChevronRight size={18} className="rtl:rotate-180" />
                  </button>
                ) : (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400"
                  >
                    <Plane size={16} />
                    {isAr ? "أرسل عبر واتساب" : "Send on WhatsApp"}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
