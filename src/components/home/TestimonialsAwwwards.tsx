// src/components/home/TestimonialsAwwwards.tsx
"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    roleAr: "مدونة سفر",
    roleEn: "Travel Blogger",
    locationAr: "الرياض، السعودية",
    locationEn: "Riyadh, Saudi Arabia",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    rating: 5,
    textAr:
      "نظّمت الريان للسياحة رحلتنا إلى إسطنبول وكابادوكيا بدقة مذهلة — سيارة خاصة، فندق على البوسفور، ومنطاد عند الفجر. تجربة فاخرة بدون أي قلق.",
    textEn:
      "Alrayyan Tourism planned our Istanbul and Cappadocia trip perfectly — private car, Bosphorus hotel, and a dawn balloon flight. Luxury without stress.",
    destinationAr: "إسطنبول",
    destinationEn: "Istanbul",
    tripImage:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600",
  },
  {
    id: 2,
    name: "James Chen",
    roleAr: "رئيس تنفيذي",
    roleEn: "CEO, Tech Startup",
    locationAr: "دبي",
    locationEn: "Dubai",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    rating: 5,
    textAr:
      "ترانسفير المطار وجولة بورصة اليومية مع سائق محترف كانت في الموعد تماماً. فريق الريان يعرف تركيا جيداً.",
    textEn:
      "Airport transfer and our Bursa day tour with a professional driver were perfectly on time. Alrayyan really knows Turkey.",
    destinationAr: "بورصة",
    destinationEn: "Bursa",
    tripImage:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    roleAr: "مسافرة عائلية",
    roleEn: "Family Traveler",
    locationAr: "الكويت",
    locationEn: "Kuwait",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    rating: 5,
    textAr:
      "أخذنا الأطفال إلى سبانجا وآيدر — كبائن هادئة، طبيعة خضراء، وترانسفير مريح. الريان للسياحة جعلت الرحلة سهلة للعائلة.",
    textEn:
      "We took the kids to Sapanca and Ayder — quiet cabins, green nature, and comfortable transfers. Alrayyan made family travel easy.",
    destinationAr: "سبانجا",
    destinationEn: "Sapanca",
    tripImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
  },
];

export default function TestimonialsAwwwards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useLocale();

  const next = () =>
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

  const active = testimonials[activeIndex];
  const role = (locale === "ar" || locale === "tr") ? active.roleAr : active.roleEn;
  const location = (locale === "ar" || locale === "tr") ? active.locationAr : active.locationEn;
  const text = (locale === "ar" || locale === "tr") ? active.textAr : active.textEn;
  const destination =
    (locale === "ar" || locale === "tr") ? active.destinationAr : active.destinationEn;

  return (
    <section
      ref={containerRef}
      className="relative py-32 bg-white overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1/2 h-full bg-slate-50" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-orange-500 text-sm tracking-[0.3em] uppercase mb-4"
            >
              {t.home.testimonials}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-12"
              style={{ fontFamily: "var(--font-sora)" }}
            >
              {t.home.testimonialsTitle}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                {t.home.testimonialsHighlight}
              </span>
            </motion.h2>

            <div className="relative min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Quote size={48} className="text-orange-500/20 mb-6" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(active.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className="text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-xl md:text-2xl text-slate-700 leading-relaxed mb-8">
                    &ldquo;{text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                      <Image
                        src={active.image}
                        alt={active.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {active.name}
                      </h4>
                      <p className="text-slate-500 text-sm">{role}</p>
                      <p className="text-orange-500 text-sm">{location}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={20} className="text-slate-600 rtl:rotate-180" />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={20} className="text-slate-600 rtl:rotate-180" />
              </button>
              <div className="ms-4 text-slate-400">
                <span className="text-slate-900 font-bold">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="mx-2">/</span>
                <span>{String(testimonials.length).padStart(2, "0")}</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] max-w-lg mx-auto lg:ms-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  className="relative h-full rounded-3xl overflow-hidden shadow-2xl"
                >
                  <Image
                    src={active.tripImage}
                    alt={destination}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-6 start-6 end-6">
                    <p className="text-white/70 text-sm mb-1">
                      {t.home.traveledTo}
                    </p>
                    <p className="text-3xl font-bold text-white">{destination}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -start-8 top-8 bg-white p-4 rounded-2xl shadow-xl hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <Star size={24} className="text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">4.9</p>
                    <p className="text-slate-500 text-sm">{t.home.reviewsCount}</p>
                  </div>
                </div>
              </motion.div>

              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-8 bg-orange-500"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
