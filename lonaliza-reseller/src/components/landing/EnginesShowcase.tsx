"use client";

import { useState } from "react";
import {
  BadgePercent,
  Bus,
  Car,
  CheckCircle2,
  FileCheck,
  Globe,
  Hotel,
  MapPin,
  Plane,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function EnginesShowcase() {
  const { locale } = useLocale();

  const engines = [
    {
      id: "hotels",
      title: locale === "ar" ? "محرك الفنادق العالمي" : "Global Hotels Engine",
      badge: "500k+ Hotels",
      icon: Hotel,
      color: "from-emerald-500 to-teal-500",
      accent: "text-emerald-400",
      providers: ["TripAdvisor Live", "Booking.com15", "RapidAPI Live Rates"],
      description:
        locale === "ar"
          ? "تكامل مباشر مع أكبر مزودي الفنادق العالميين للبحث عن الأسعار، توفر الغرف، والمرافق مع تحديد هامش ربحك المالي التلقائي."
          : "Direct integration with top global hotel suppliers to search rates, live room availability, amenities, and dynamic markup fees.",
      features: [
        locale === "ar" ? "تفاصيل الغرف والأسرة وسياسات الإلغاء" : "Detailed room types, bedding, and cancel policies",
        locale === "ar" ? "معرض صور عالية الدقة وتقييمات النزلاء" : "HD photo galleries and real guest reviews",
        locale === "ar" ? "تأكيد فوري وتوليد قسائم حجز PDF" : "Instant confirmation with branded PDF booking vouchers",
      ],
    },
    {
      id: "flights",
      title: locale === "ar" ? "محرك الطيران الدولي GDS" : "International Flights Engine",
      badge: "900+ Airlines",
      icon: Plane,
      color: "from-cyan-500 to-blue-500",
      accent: "text-cyan-400",
      providers: ["SkyScrapper GDS", "Travelpayouts Live", "IATA Lookups"],
      description:
        locale === "ar"
          ? "محرك طيران فوري يغطي الرحلات المباشرة ورحلات الترانزيت متعددة الوجهات مع تقويم الأسعار المنخفضة واختيار فئات المقاعد."
          : "Real-time flight search engine covering direct and multi-city flights with flexible price calendar and seat classes.",
      features: [
        locale === "ar" ? "تقويم أسعار مرن للعثور على أرخص الأيام" : "Interactive price calendar for cheapest dates",
        locale === "ar" ? "تفاصيل أوزان الأمتعة ومحطات الترانزيت" : "Baggage allowance details and transit layovers",
        locale === "ar" ? "إصدار التذاكر الإلكترونية وفواتير الإيراد" : "Automated e-ticket issuing and tax invoices",
      ],
    },
    {
      id: "packages",
      title: locale === "ar" ? "محرك الباقات السياحية المتكاملة" : "Dynamic Tour Packages",
      badge: "Custom Itineraries",
      icon: Globe,
      color: "from-purple-500 to-indigo-500",
      accent: "text-purple-400",
      providers: ["Custom Package Builder", "Multi-day Trips", "AI Pricing"],
      description:
        locale === "ar"
          ? "صمم باقات عطلات متكاملة تشمل الطيران والفنادق والجولات اليومية والاستقبال مع مقارنة الباقات واختيار الفنادق المخصصة."
          : "Design complete holiday packages including flights, hotels, daily tours, and airport transfers with side-by-side comparison.",
      features: [
        locale === "ar" ? "أداة مقارنة الباقات التفاعلية للمسافرين" : "Interactive holiday package comparison drawer",
        locale === "ar" ? "جدول زمني تفصيلي للأيام والأنشطة" : "Day-by-day itinerary schedule and inclusions",
        locale === "ar" ? "تسعير ديناميكي حسب عدد الأفراد والغرف" : "Dynamic pricing based on pax count and room configs",
      ],
    },
    {
      id: "tours",
      title: locale === "ar" ? "محرك الجولات والرحلات اليومية" : "Day Tours & VIP Trips",
      badge: "Local Experiences",
      icon: MapPin,
      color: "from-amber-500 to-orange-500",
      accent: "text-amber-400",
      providers: ["Private VIP Tours", "Group Excursions", "Instant Booking"],
      description:
        locale === "ar"
          ? "إدارة وبيع الرحلات اليومية والجولات السياحية الخاصة بالمرشد والسيارة، مع تحديد برامج الزيارات ونقاط الانطلاق."
          : "Manage and sell daily guided excursions and private VIP tours with pickup locations, schedules, and custom route maps.",
      features: [
        locale === "ar" ? "خيارات جولات خاصة (VIP) وجولات جماعية" : "Private VIP tours and shared group options",
        locale === "ar" ? "تحديد مواعيد المغادرة واللغات المتاحة" : "Departure time slots and multilingual tour guides",
        locale === "ar" ? "تأكيد الحجز برمز QR وتفاصيل السائق" : "QR code ticket confirmation and driver contact info",
      ],
    },
    {
      id: "cars",
      title: locale === "ar" ? "محرك تأجير السيارات والترانسفير" : "Car Rentals & Transfers",
      badge: "Chauffeur & Self-Drive",
      icon: Car,
      color: "from-rose-500 to-pink-500",
      accent: "text-rose-400",
      providers: ["Airport Transfers", "Luxury Fleet", "Travelpayouts"],
      description:
        locale === "ar"
          ? "منظومة شاملة لحجوزات الاستقبال والتوديع من وإلى المطارات مع أسطول سيارات سياحية بسائق أو استئجار يومي مباشر."
          : "Comprehensive airport pickup and drop-off transfers with chauffeur-driven luxury fleet and daily self-drive rentals.",
      features: [
        locale === "ar" ? "تتبع رحلات الطيران لتحديد موعد الاستقبال" : "Flight number tracking for precise airport pickups",
        locale === "ar" ? "فئات سيارات متعددة (سيدان، فان VIP، ميني باص)" : "Vehicle tiers: VIP Vans, Sedans, Luxury SUVs",
        locale === "ar" ? "إضافات مخصصة (مقاعد أطفال، واي فاي، مياه)" : "Custom extras: baby seats, onboard Wi-Fi, snacks",
      ],
    },
    {
      id: "visa",
      title: locale === "ar" ? "محرك التأشيرات والخدمات القنصلية" : "Visas & Consular Services",
      badge: "Global Visa Hub",
      icon: FileCheck,
      color: "from-teal-500 to-emerald-500",
      accent: "text-teal-400",
      providers: ["Electronic Visas", "Document Upload", "Status Tracker"],
      description:
        locale === "ar"
          ? "استقبال طلبات التأشيرات السياحية إلكترونياً مع رفع الوثائق وجوازات السفر وتتبع حالة الطلب عبر بوابة العميل."
          : "Online tourist visa application processing with document/passport uploads and live tracking via customer portal.",
      features: [
        locale === "ar" ? "متطلبات وشروط التأشيرة لكل جنسية" : "Nationality-based entry requirements and checklist",
        locale === "ar" ? "رفع آمن للمستندات والشهادات والطلبات" : "Encrypted secure upload for passports and documents",
        locale === "ar" ? "إشعارات فورية بحالة الموافقة وإصدار الفيزا" : "Automated SMS/Email notifications on visa approval",
      ],
    },
  ];

  return (
    <section id="engines" className="relative py-24 bg-slate-950/90 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400">
            <Globe className="h-3.5 w-3.5 text-teal-400" />
            <span>
              {locale === "ar"
                ? "6 محركات حجز عالمية في منصة واحدة"
                : "6 Unified Booking Engines in One System"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {locale === "ar"
              ? "منظومة سياحية شاملة تغطي كافة متطلبات المسافرين"
              : "End-to-End Travel Ecosystem Covering Every Journey"}
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            {locale === "ar"
              ? "لا تحتاج لبرمجة أو ربط أنظمة متعددة؛ منصة لوناليزا تأتيك مجهزة بالكامل بـ 6 محركات سياحية متصلة بالمزودين العالميين وجاهزة لتحقيق المبيعات فوراً."
              : "No need for multi-vendor integrations; Lonaliza comes pre-configured with 6 connected travel engines ready to generate bookings immediately."}
          </p>
        </div>

        {/* 6 Engines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engines.map((eng) => {
            const Icon = eng.icon;
            return (
              <div
                key={eng.id}
                className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-7 hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 backdrop-blur-xl flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`size-12 rounded-2xl bg-gradient-to-br ${eng.color} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {eng.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {eng.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {eng.description}
                    </p>
                  </div>

                  {/* Integrations Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {eng.providers.map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-black/40 text-slate-400 border border-white/5 font-mono"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {eng.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${eng.accent}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
