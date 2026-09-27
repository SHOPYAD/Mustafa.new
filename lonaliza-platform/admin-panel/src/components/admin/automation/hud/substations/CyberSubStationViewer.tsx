"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Plane,
  Building2,
  Car,
  Palmtree,
  Network,
  CreditCard,
  TrendingUp,
  Share2,
  Smartphone,
  ShieldCheck,
  Zap,
  Activity,
  Sliders,
  RefreshCw,
  Send,
  Database,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpRight,
  Server,
  Layers,
  Lock,
} from "lucide-react";

export interface CyberSubStationData {
  id: string;
  nameAr: string;
  nameEn: string;
  route: string;
  sectorName: string;
  sectorId: string;
  iconName: string;
  colorHex: string;
  metrics: {
    activeCount: string;
    dailyVolume: string;
    marginRate: string;
    latencyMs: number;
    healthStatus: "OPTIMAL" | "NOMINAL" | "ALERT";
  };
  records: Array<{
    id: string;
    label: string;
    sublabel: string;
    metric: string;
    status: "ACTIVE" | "PENDING" | "SYNCED" | "WARN";
  }>;
  tacticalToggles: Array<{
    id: string;
    title: string;
    enabled: boolean;
  }>;
  gateways: Array<{
    name: string;
    type: string;
    status: "ONLINE" | "STANDBY" | "SYNCING";
    latency: string;
    quota: string;
  }>;
  copilotPrompt: string;
}

export const SUB_STATIONS_CATALOG: Record<string, CyberSubStationData> = {
  // Sector 1: Aviation (Real GDS & Aggregators)
  flights: {
    id: "flights",
    nameAr: "محطة الطيران والربط العالمي GDS المعتمدة",
    nameEn: "Aviation & Live GDS Hub (PKFare, Seeru, Travelport)",
    route: "flights",
    sectorName: "قطاع الطيران والتنقل الدولي",
    sectorId: "aviation",
    iconName: "Plane",
    colorHex: "#00e5ff",
    metrics: {
      activeCount: "4 بوابات GDS مدمجة",
      dailyVolume: "$182,400",
      marginRate: "+18.0% مقفل",
      latencyMs: 124,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "PK-101", label: "Turkish Airlines (IST -> JED)", sublabel: "PKFare MD5 Engine • ShoppingV10 • هامش ربح +18%", metric: "$420.00", status: "ACTIVE" },
      { id: "SR-102", label: "Saudia (JED -> TZX طرابزون)", sublabel: "Seeru Flights JWT Bearer • حجز لحظي مباشر • هامش +18%", metric: "$390.00", status: "ACTIVE" },
      { id: "BB-103", label: "Pegasus (SAW -> DXB)", sublabel: "Biletbank BBOST REST API • مباشر من الناقل التركي • هامش +18%", metric: "$280.00", status: "SYNCED" },
      { id: "TP-104", label: "Emirates (DXB -> IST)", sublabel: "Travelport Universal API & REST v11 • فرع 7K7L • حجز NDC", metric: "$510.00", status: "SYNCED" },
      { id: "BB-105", label: "SunExpress (AYT أنطاليا -> FRA)", sublabel: "Biletbank BBOST • رحلات الطيران السياحي المباشر", metric: "$240.00", status: "ACTIVE" },
      { id: "SR-106", label: "Flynas (RUH -> IST)", sublabel: "Seeru Flight Engine • تذاكر مؤكدة وإصدار آلي PNR", metric: "$310.00", status: "ACTIVE" },
    ],
    tacticalToggles: [
      { id: "pkfare_sync", title: "تفعيل محرك بكفير المباشر (PKFare MD5 shoppingV10 - نشط بالسجل)", enabled: true },
      { id: "seeru_flights_sync", title: "تفعيل بوابة سيرو للطيران (Seeru Flights JWT Bearer - نشط بالسجل)", enabled: true },
      { id: "travelport_air_lock", title: "بوابة ترافلبورت العالمية (Travelport Universal API & REST v11)", enabled: true },
      { id: "biletbank_bbost", title: "اتصال بيلت بانك المباشر للخطوط التركية وبيغاسوس (BBOST API)", enabled: true },
      { id: "markup_18_lock", title: "قفل هامش الربح الإجباري الموحد (+18% mk_default_all_18)", enabled: true },
    ],
    gateways: [
      { name: "PKFare Flights GDS", type: "Consolidator (MD5 API)", status: "ONLINE", latency: "142ms", quota: "مفعل (Sandbox)" },
      { name: "Seeru Air Connector", type: "Regional GDS (JWT)", status: "ONLINE", latency: "98ms", quota: "مفعل (Sandbox)" },
      { name: "Travelport Air GDS", type: "Global GDS (PCC: 7K7L)", status: "ONLINE", latency: "165ms", quota: "جاهز للربط" },
      { name: "Biletbank BBOST", type: "Direct Turkish NDC", status: "ONLINE", latency: "110ms", quota: "جاهز للربط" },
    ],
    copilotPrompt: "وكيل الطيران: تم ربط بكفير وسيرو وترافلبورت وتطبيق هامش الربح الإجباري +18% على كافة التذاكر الصادرة.",
  },

  // Sector 2: Hotels (Real Bedbanks & Adapters)
  hotels: {
    id: "hotels",
    nameAr: "محطة الفنادق وبنوك الأسرة المعتمدة",
    nameEn: "Global Hospitality & BedBanks Hub",
    route: "hotels",
    sectorName: "قطاع الفنادق وسلاسل التوريد",
    sectorId: "hospitality",
    iconName: "Building2",
    colorHex: "#10b981",
    metrics: {
      activeCount: "140 فندقاً حياً من GDS",
      dailyVolume: "$94,320",
      marginRate: "+15.0% مقفل",
      latencyMs: 148,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "HT-BAR", label: "W Barcelona (برشلونة)", sublabel: "ترافلبورت Travelport GDS • SearchComplete • يبدأ من $1,038 / 3 ليالٍ", metric: "$1,038", status: "SYNCED" },
      { id: "HT-MAD", label: "The Westin Palace (مدريد)", sublabel: "ترافلبورت Travelport GDS • SearchComplete • يبدأ من $669 / 3 ليالٍ", metric: "$669", status: "SYNCED" },
      { id: "HT-BAL", label: "The Ritz-Carlton Bali (بالي)", sublabel: "ترافلبورت Travelport GDS • فلل شاطئية • يبدأ من $287 / 3 ليالٍ", metric: "$287", status: "SYNCED" },
      { id: "HT-SEO", label: "Signiel Seoul Tower (سيول)", sublabel: "ترافلبورت Travelport GDS • إطلالة بانورامية • يبدأ من $342 / 3 ليالٍ", metric: "$342", status: "SYNCED" },
      { id: "HT-TBZ", label: "Radisson Blu Trabzon Boztepe", sublabel: "هوتل بيدس Hotelbeds SHA-256 • جناح مطل على البحر الأسود", metric: "$180 / ليلة", status: "ACTIVE" },
      { id: "HT-UZG", label: "Uzungol Inan Kardesler Bungalow", sublabel: "الكتالوج المحلي المباشر • أكواخ أوزنجول الخشبية العائلية", metric: "$210 / ليلة", status: "ACTIVE" },
    ],
    tacticalToggles: [
      { id: "travelport_hotels_sync", title: "المزامنة الحية مع ترافلبورت Travelport GDS (مفعلة: 140 فندقاً)", enabled: true },
      { id: "hotelbeds_sha256", title: "بوابة هوتل بيدس العالمية بالتوقيع التشفيري الديناميكي SHA-256 (مفعلة)", enabled: true },
      { id: "ratehawk_b2b", title: "محرك ريت هوك RateHawk B2B عبر WorldOTA (جاهز للربط)", enabled: false },
      { id: "seeru_hotels_api", title: "واجهة فنادق سيرو Seeru Hotels API v1.0.0 (جاهز للربط)", enabled: false },
      { id: "markup_15_lock", title: "قفل هامش الربح الإجباري (+15% hmk_default_all_15)", enabled: true },
    ],
    gateways: [
      { name: "Travelport Hospitality v11", type: "Global GDS (PCC: 7K7L)", status: "ONLINE", latency: "148ms", quota: "مفعل بالسجل (140 فندق)" },
      { name: "Hotelbeds BedsOnline", type: "BedBank (SHA-256)", status: "ONLINE", latency: "135ms", quota: "مفعل بالسجل" },
      { name: "RateHawk (WorldOTA)", type: "B2B BedBank", status: "STANDBY", latency: "160ms", quota: "محول جاهز" },
      { name: "Seeru Hotels API", type: "Regional BedBank", status: "STANDBY", latency: "105ms", quota: "محول جاهز" },
    ],
    copilotPrompt: "وكيل الفنادق: تم جلب 140 فندقاً حقيقياً من ترافلبورت وهوتربيدس مع تطبيق هامش ربح 15% الإجباري.",
  },

  // Sector 3: Fleet & VIP Transfers (Real Fleet & FlightRadar)
  transfers: {
    id: "transfers",
    nameAr: "محطة أسطول مرسيدس VIP ورادار الطيران",
    nameEn: "VIP Mercedes Fleet & FlightRadar Station",
    route: "transfers",
    sectorName: "قطاع التنقل والأسطول المباشر",
    sectorId: "fleet",
    iconName: "Car",
    colorHex: "#8b5cf6",
    metrics: {
      activeCount: "86 مركبة مرسيدس VIP",
      dailyVolume: "$31,500",
      marginRate: "24.0% هامش",
      latencyMs: 65,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "TR-IST", label: "مطار إسطنبول (IST) → سلطان أحمت", sublabel: "Mercedes-Benz E-Class VIP • استقبال الصالة وتتبع الرحلة", metric: "$55.00", status: "ACTIVE" },
      { id: "TR-TBZ", label: "مطار طرابزون (TZX) → أوزنجول", sublabel: "Mercedes Vito VIP • مقاعد جلدية فاخرة • ثلاجة ومشروبات", metric: "$120.00", status: "ACTIVE" },
      { id: "TR-AYD", label: "طرابزون → آيدر والشلالات (جولة يوم كامل)", sublabel: "Mercedes Vito VIP مع سائق مرشد خاص يتحدث العربية", metric: "$190.00", status: "ACTIVE" },
      { id: "TR-SAW", label: "مطار صبيحة (SAW) → تقسيم", sublabel: "Mercedes Sprinter VIP • 16 مقعداً للعائلات والمجموعات", metric: "$85.00", status: "ACTIVE" },
      { id: "TR-AYT", label: "مطار أنطاليا (AYT) → بيليك وكونياالتي", sublabel: "Mercedes Vito VIP • تكييف ممتاز ومساحة حقائب واسعة", metric: "$65.00", status: "ACTIVE" },
    ],
    tacticalToggles: [
      { id: "flightradar_delay_rescheduler", title: "تعديل موعد إرسال السائق آلياً عبر رادار الطيران عند التأخير", enabled: true },
      { id: "vito_vip_dispatch", title: "التوزيع والتوجيه الآلي لأسطول مرسيدس فيتو وسبرينتر حسب الإحداثيات", enabled: true },
      { id: "seeru_ride_gateway", title: "محرك سيرو للنقل Seeru Ride v1.0.0 (جاهز للربط)", enabled: false },
    ],
    gateways: [
      { name: "Lonaliza VIP Fleet Engine", type: "Internal Telematics", status: "ONLINE", latency: "35ms", quota: "100% نشط" },
      { name: "FlightRadar24 Live Webhook", type: "Flight Delay Tracker", status: "ONLINE", latency: "65ms", quota: "1,420 رحلة متبوعة" },
      { name: "Seeru Ride Connector", type: "Transport API", status: "STANDBY", latency: "90ms", quota: "محول جاهز" },
    ],
    copilotPrompt: "وكيل الأسطول: رادار الرحلات مربوط لحظياً، وتم تعديل موعد 18 سائقاً في طرابزون وإسطنبول لتأخر الرحلات تلقائياً.",
  },

  // Sector 4: Packages & Tours
  packages: {
    id: "packages",
    nameAr: "محطة البرامج والعطلات المتكاملة",
    nameEn: "Curated Packages & Tourism Programs",
    route: "packages",
    sectorName: "قطاع البرامج السياحية والتأشيرات",
    sectorId: "tourism",
    iconName: "Palmtree",
    colorHex: "#f59e0b",
    metrics: {
      activeCount: "70 باقة سياحية",
      dailyVolume: "$68,900",
      marginRate: "22.5%",
      latencyMs: 110,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "PKG-01", label: "برنامج عروس الشمال (طرابزون وأوزنجول وآيدر 7 أيام)", sublabel: "فنادق 5 نجوم + سيارة خاصة + سائق مرشد + جولات كاملة", metric: "$1,850", status: "ACTIVE" },
      { id: "PKG-02", label: "برنامج سحر البوسفور (إسطنبول وبورصة وسابانجا 6 أيام)", sublabel: "تذاكر طيران + فنادق البوسفور + يخت خاص", metric: "$1,420", status: "ACTIVE" },
      { id: "PKG-03", label: "برنامج صلالة الخريف والشلالات", sublabel: "شامل الطيران والتنقلات والإقامة الفاخرة", metric: "$2,100", status: "SYNCED" },
    ],
    tacticalToggles: [
      { id: "ai_itinerary_builder", title: "مولد الجداول السياحية بالذكاء الاصطناعي", enabled: true },
      { id: "dynamic_pricing", title: "التسعير التكيفي حسب فترات الذروة والمواسم", enabled: true },
      { id: "instant_voucher", title: "إصدار وتوقيع قسائم البرامج السياحية آلياً", enabled: true },
    ],
    gateways: [
      { name: "AI Tour Builder Engine", type: "Generative AI", status: "ONLINE", latency: "350ms", quota: "100%" },
      { name: "Google Places World Explorer", type: "Place API", status: "ONLINE", latency: "85ms", quota: "مفعل بالسجل" },
    ],
    copilotPrompt: "وكيل البرامج: تم تجهيز باقات الصيف الجديدة ومزامنة أسعار الفنادق والجولات الخاصة تلقائياً.",
  },

  // Sector 5: Resale & B2B Whitelabel (Real Reseller System)
  resale: {
    id: "resale",
    nameAr: "محطة شبكة الموزعين ووايت ليبل B2B",
    nameEn: "B2B Distribution & Reseller Network",
    route: "resale",
    sectorName: "قطاع شبكة الموزعين والامتياز التجاري",
    sectorId: "reseller",
    iconName: "Network",
    colorHex: "#ec4899",
    metrics: {
      activeCount: "42 شركة مرخصة",
      dailyVolume: "$145,800",
      marginRate: "8.5%",
      latencyMs: 82,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "B2B-11", label: "وكالة المسافر الذكي (الرياض)", sublabel: "باقة Enterprise • ديبوزيت نشط $28,400 • وايت ليبل مع حجب الموردين", metric: "38 حجزاً اليوم", status: "ACTIVE" },
      { id: "B2B-12", label: "شركة مسافر دبي للسفر", sublabel: "باقة Pro • دومين مخصص مسجل • بوابة دفع مستقلة", metric: "24 حجزاً اليوم", status: "ACTIVE" },
      { id: "B2B-13", label: "وكالة السفير الذهبي (الكويت)", sublabel: "باقة Starter • وايت ليبل مخصص • ديبوزيت $12,500", metric: "15 حجزاً اليوم", status: "SYNCED" },
    ],
    tacticalToggles: [
      { id: "supplier_shield_isolation", title: "حجب الموردين الأصليين (Travelport, PKFare, Hotelbeds) عن لوحات الشركاء", enabled: true },
      { id: "auto_gmaps_scraper", title: "التنقيب الآلي اليومي عن وكالات السفر عبر خرائط جوجل في السعودية والخليج", enabled: true },
      { id: "instant_deposit_approval", title: "التدقيق الآلي لإيصالات الشحن البنكي والودائع المالية", enabled: true },
    ],
    gateways: [
      { name: "B2B Client Isolation Guard", type: "Security Middleware", status: "ONLINE", latency: "12ms", quota: "100% نشط" },
      { name: "Google Maps Agency Scraper", type: "Prospecting Core", status: "ONLINE", latency: "90ms", quota: "نشط بالخلفية" },
      { name: "Corporate Deposit Ledger", type: "Financial Core", status: "ONLINE", latency: "60ms", quota: "100%" },
    ],
    copilotPrompt: "مدير شبكة الموزعين: تم حماية بيانات الموردين الأصليين عن لوحات العملاء الفرعيين، وحجم ودائع الشركاء يتجاوز $380,000.",
  },

  // Sector 6: Payments & Treasury (Real Iyzico & PayTR Gateways)
  payments: {
    id: "payments",
    nameAr: "محطة الخزينة وبوابات الدفع (Iyzico / PayTR / B2B)",
    nameEn: "Treasury & Payment Gateways (Iyzico / PayTR)",
    route: "payments",
    sectorName: "قطاع المالية والمحافظ والعملات",
    sectorId: "treasury",
    iconName: "CreditCard",
    colorHex: "#38bdf8",
    metrics: {
      activeCount: "Iyzico نشطة + PayTR",
      dailyVolume: "$214,500",
      marginRate: "99.8% Success",
      latencyMs: 165,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "GATE-01", label: "Iyzico Payment Gateway (تركيا والدولية)", sublabel: "البوابة النشطة الحالية • 3D Secure 2.0 • Sandbox Key مفعّل", metric: "$118,200", status: "ACTIVE" },
      { id: "GATE-02", label: "PayTR Virtual POS (الاحتياطية التركية)", sublabel: "Merchant: 123456 • توكن تشفيري مدمج • جاهزة للتبديل", metric: "Standby", status: "SYNCED" },
      { id: "GATE-03", label: "B2B Corporate Wallet & Bank Wire", sublabel: "دفتر أستاذ الودائع البنكية • تحوط آلي لأسعار الصرف FX", metric: "$84,100", status: "ACTIVE" },
    ],
    tacticalToggles: [
      { id: "iyzico_3ds_enforce", title: "إلزام التحقق الثلاثي 3D Secure 2.0 لبوابة Iyzico لحماية المعاملات", enabled: true },
      { id: "fx_auto_hedge", title: "تثبيت وتحديث أسعار صرف العملات آلياً عبر iyzico-fx-cache.json", enabled: true },
      { id: "b2b_wallet_instant_credit", title: "الإفراج الآلي عن الائتمان بعد مطابقة إشعار التحويل البنكي", enabled: true },
    ],
    gateways: [
      { name: "Iyzico Virtual POS Direct", type: "Active Gateway", status: "ONLINE", latency: "120ms", quota: "مفعل (Sandbox)" },
      { name: "PayTR Virtual POS Engine", type: "Alternative Gateway", status: "STANDBY", latency: "115ms", quota: "مضبوط بالسجل" },
      { name: "Multi-Currency FX Cache", type: "Currency Hedging", status: "ONLINE", latency: "8ms", quota: "100% نشط" },
    ],
    copilotPrompt: "أمين الخزينة: بوابة Iyzico هي البوابة المعتمدة حالياً مع حماية كاملة ضد الاحتيال وتحديث لحظي لأسعار الصرف.",
  },

  // Sector 7: Marketing & Growth
  ads: {
    id: "ads",
    nameAr: "محطة الإعلانات الذكية والنمو",
    nameEn: "Automated Ads & Omnichannel Marketing",
    route: "ads",
    sectorName: "قطاع التسويق والنمو والإعلانات",
    sectorId: "growth",
    iconName: "TrendingUp",
    colorHex: "#eab308",
    metrics: {
      activeCount: "16 حملة نشطة",
      dailyVolume: "3.8x ROAS",
      marginRate: "$0.42 CPC",
      latencyMs: 140,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "CAMP-01", label: "حملة طرابزون VIP الفاخرة (السعودية والإمارات)", sublabel: "Meta Ads • Video Reels • تحويل واتساب وحجز فوري", metric: "3.9x ROAS", status: "ACTIVE" },
      { id: "CAMP-02", label: "حملة شهر العسل في إسطنبول والبوسفور", sublabel: "Google Search Ads • كلمات بحث حصرية عالية التحويل", metric: "4.2x ROAS", status: "ACTIVE" },
      { id: "CAMP-03", label: "إعادة الاستهداف الذكي لزوار الموقع والتطبيق", sublabel: "Dynamic Retargeting • عروض مخصصة", metric: "5.1x ROAS", status: "ACTIVE" },
    ],
    tacticalToggles: [
      { id: "auto_budget_scale", title: "زيادة ميزانية الحملات الرابحة آلياً (+20%)", enabled: true },
      { id: "creative_optimizer", title: "تبديل التصاميم والنصوص الإعلانية الضعيفة آلياً", enabled: true },
      { id: "whatsapp_click_sync", title: "ربط إعلانات الواتساب بمحادثات الذكاء الاصطناعي", enabled: true },
    ],
    gateways: [
      { name: "Meta Graph Marketing API", type: "Ad Manager", status: "ONLINE", latency: "185ms", quota: "99.5%" },
      { name: "Google Ads REST API v17", type: "Search Engine", status: "ONLINE", latency: "190ms", quota: "98.9%" },
    ],
    copilotPrompt: "وكيل الإعلانات: الحملات الإعلانية تحقق عائداً قدره 3.8 ضعف الإنفاق، تم تفعيل إعادة الاستهداف.",
  },

  // Sector 8: Publishing & Content
  publish: {
    id: "publish",
    nameAr: "محطة النشر والمحتوى الفيروسي",
    nameEn: "Omnichannel Publishing Engine",
    route: "publish",
    sectorName: "قطاع صناعة المحتوى والإعلام",
    sectorId: "publishing",
    iconName: "Share2",
    colorHex: "#06b6d4",
    metrics: {
      activeCount: "128 مقالاً ومنشوراً",
      dailyVolume: "420K مشاهدة",
      marginRate: "SEO Top 3",
      latencyMs: 75,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "PUB-01", label: "دليل السياحة الشامل في طرابزون وأوزنجول 2026", sublabel: "مقال مدونة سيو متقدم • 8,000 كلمة • صور 4K", metric: "Rank #1 Google", status: "ACTIVE" },
      { id: "PUB-02", label: "أفضل 10 أكواخ ريفية على نهر آيدر وريزا", sublabel: "منشور فيروسي إنستغرام وتيك توك", metric: "145K تفاعل", status: "ACTIVE" },
      { id: "PUB-03", label: "النشرة البريدية الأسبوعية لعروض الطيران المخفض", sublabel: "حملة بريد مرسلة لـ 35,000 مسافر نشط", metric: "48% Open Rate", status: "SYNCED" },
    ],
    tacticalToggles: [
      { id: "ai_article_generator", title: "توليد ونشر مقالات السيو آلياً بالذكاء الاصطناعي", enabled: true },
      { id: "auto_social_scheduler", title: "الجدولة التلقائية على إنستغرام وتيك توك وتويتر", enabled: true },
      { id: "seo_schema_markup", title: "حقن بيانات Schema السياحية لمحركات البحث", enabled: true },
    ],
    gateways: [
      { name: "Lonaliza CMS Engine", type: "Headless Content", status: "ONLINE", latency: "38ms", quota: "100%" },
      { name: "Brevo / Resend Email API", type: "Mailing Core", status: "ONLINE", latency: "95ms", quota: "99.9%" },
    ],
    copilotPrompt: "وكيل النشر: المقال الجديد عن ريف طرابزون يتصدر نتائج البحث الأولى على محرك جوجل.",
  },

  // Sector 9: Mobile & Concierge
  mobile: {
    id: "mobile",
    nameAr: "محطة تطبيقات الموبايل والكونسيرج",
    nameEn: "Mobile Guest App & Concierge",
    route: "mobile-app",
    sectorName: "قطاع تجربة النزيل وتطبيقات الجوال",
    sectorId: "mobile",
    iconName: "Smartphone",
    colorHex: "#14b8a6",
    metrics: {
      activeCount: "8,940 مستخدماً نشطاً",
      dailyVolume: "99.2% Uptime",
      marginRate: "4.9/5 Rating",
      latencyMs: 58,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "MOB-01", label: "تطبيق النزلاء iOS (Apple App Store)", sublabel: "الإصدار 3.4.0 • دعم الإشعارات الحية وموقع السائق", metric: "4.9 Stars", status: "ACTIVE" },
      { id: "MOB-02", label: "تطبيق النزلاء Android (Google Play)", sublabel: "الإصدار 3.4.0 • مسار الرحلة دون اتصال بالإنترنت", metric: "4.8 Stars", status: "ACTIVE" },
      { id: "MOB-03", label: "مساعد الكونسيرج الذكي داخل الغرف والسيارات", sublabel: "محادثة فورية بالصوت والنص لتلبية رغبات المسافرين", metric: "1.2s Response", status: "ACTIVE" },
    ],
    tacticalToggles: [
      { id: "push_notifications", title: "إرسال الإشعارات التفاعلية اللحظية (تحديثات الرحلة)", enabled: true },
      { id: "offline_itinerary", title: "إتاحة تذاكر الطيران والفنادق دون اتصال بالإنترنت", enabled: true },
      { id: "sos_location_beacon", title: "زر الاستغاثة وتحديد الموقع السياحي للطوارئ", enabled: true },
    ],
    gateways: [
      { name: "Firebase Cloud Messaging (FCM)", type: "Push Notifications", status: "ONLINE", latency: "48ms", quota: "100%" },
      { name: "Apple APNs Production Mesh", type: "Push Core", status: "ONLINE", latency: "52ms", quota: "100%" },
    ],
    copilotPrompt: "وكيل الموبايل: تطبيق النزلاء يعمل بكفاءة 100%، تم إرسال 450 إشعار استقبال مطار اليوم بنجاح.",
  },

  // Sector 10: Sovereign Brain & Security
  security: {
    id: "security",
    nameAr: "محطة الأمان السيادي وقواعد البيانات",
    nameEn: "Sovereign Security & Brain Vector Engine",
    route: "automation",
    sectorName: "قطاع الأمان السيبراني وقواعد البيانات",
    sectorId: "security",
    iconName: "ShieldCheck",
    colorHex: "#ef4444",
    metrics: {
      activeCount: "81 وحدة نظام مؤمنة",
      dailyVolume: "0 خروقات",
      marginRate: "TLS 1.3 Strict",
      latencyMs: 18,
      healthStatus: "OPTIMAL",
    },
    records: [
      { id: "SEC-01", label: "محرك المتجهات Qdrant Vector DB", sublabel: "35,000 Embeddings • 3-Branch Cognitive Search", metric: "4ms Search", status: "ACTIVE" },
      { id: "SEC-02", label: "قاعدة بيانات PocketBase SQLite Core", sublabel: "حماية التشفير AES-256 • نسخ احتياطي كل 6 ساعات", metric: "Healthy", status: "ACTIVE" },
      { id: "SEC-03", label: "طابور المهام الموزعة Redis & BullMQ", sublabel: "3 عمال نشطين • معالجة المهام الخلفية", metric: "0 Delayed", status: "ACTIVE" },
    ],
    tacticalToggles: [
      { id: "ddos_shield", title: "درع الحماية من هجمات الحرمان من الخدمة (DDoS Shield)", enabled: true },
      { id: "vector_auto_index", title: "الفهرسة التلقائية لبيانات الفنادق والرحلات في Qdrant", enabled: true },
      { id: "backup_encryption", title: "تشفير النسخ الاحتياطية وإرسالها لخوادم سيادية معزولة", enabled: true },
    ],
    gateways: [
      { name: "Qdrant Vector Engine :6333", type: "Vector Database", status: "ONLINE", latency: "6ms", quota: "100%" },
      { name: "PocketBase Enterprise :8090", type: "Primary DB", status: "ONLINE", latency: "12ms", quota: "100%" },
      { name: "Redis Cache & BullMQ :6380", type: "Message Queue", status: "ONLINE", latency: "2ms", quota: "100%" },
    ],
    copilotPrompt: "مسؤول الأمان السيبراني: جميع قنوات التشفير نشطة وشهادات SSL محدثة، ولا توجد أي محاولات اختراق.",
  },
};

interface CyberSubStationViewerProps {
  stationId: string;
  onClose: () => void;
  onSendDirective?: (directive: string) => void;
}

export default function CyberSubStationViewer({
  stationId,
  onClose,
  onSendDirective,
}: CyberSubStationViewerProps) {
  // Find station or fallback to flights
  const station = SUB_STATIONS_CATALOG[stationId] || SUB_STATIONS_CATALOG.flights;
  const [activeTab, setActiveTab] = useState<"records" | "toggles" | "gateways">("records");
  const [toggles, setToggles] = useState(station.tacticalToggles);
  const [searchQuery, setSearchQuery] = useState("");
  const [customDirective, setCustomDirective] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleToggle = (id: string) => {
    setToggles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDirective.trim()) return;
    onSendDirective?.(`[${station.nameEn}] : ${customDirective.trim()}`);
    setCustomDirective("");
  };

  const filteredRecords = station.records.filter((rec) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.label.toLowerCase().includes(q) ||
      rec.sublabel.toLowerCase().includes(q) ||
      rec.id.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-6xl h-[90vh] rounded-3xl bg-[#020b18] border-2 border-cyan-500/60 shadow-[0_0_100px_rgba(0,229,255,0.35)] flex flex-col overflow-hidden font-mono text-xs">
        {/* ========================================================================= */}
        {/* 1. Sub-Station Header Bar                                                 */}
        {/* ========================================================================= */}
        <div className="h-18 px-6 py-3 flex items-center justify-between border-b-2 border-cyan-500/40 bg-[#03152d]/98 shrink-0">
          <div className="flex items-center gap-4">
            <div
              className="size-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${station.colorHex}25`,
                border: `2px solid ${station.colorHex}`,
                boxShadow: `0 0 20px ${station.colorHex}40`,
              }}
            >
              <Zap size={24} style={{ color: station.colorHex }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-black text-white font-sans">{station.nameAr}</span>
                <span
                  className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: `${station.colorHex}30`, color: station.colorHex, border: `1px solid ${station.colorHex}60` }}
                >
                  [{station.sectorName}]
                </span>
              </div>
              <span className="text-[11px] text-cyan-300 font-sans">{station.nameEn} • /admin/{station.route}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Status indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#041a38] border border-cyan-500/40 text-emerald-300 font-mono text-[11px]">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">STATUS: {station.metrics.healthStatus}</span>
            </div>

            {/* Direct Link to Real Admin Section */}
            <a
              href={`/admin/${station.route}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 hover:text-white border border-cyan-400/60 transition-all shadow-[0_0_15px_rgba(0,229,255,0.25)] font-sans text-xs font-bold"
              title="فتح هذا القسم في لوحة التحكم الموسعة"
            >
              <ExternalLink size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">لوحة التحكم الموسعة</span>
            </a>

            {/* High-Visibility Glowing Red/Amber Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/60 text-white border-2 border-rose-500/80 transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] font-sans text-xs font-black active:scale-95 group"
              title="إغلاق المحطة والعودة للاستوديو"
            >
              <X size={16} className="text-white group-hover:rotate-90 transition-transform" />
              <span>إغلاق المحطة</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Sub-Station Telemetry Meters Grid                                      */}
        {/* ========================================================================= */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#031124] border-b border-cyan-500/30 shrink-0">
          <div className="p-3 rounded-xl bg-[#020b18] border border-cyan-500/40 shadow-inner">
            <span className="text-[10px] text-slate-300 font-bold block">الوحدات والعمليات النشطة</span>
            <span className="text-base sm:text-xl font-black text-white mt-0.5 block">{station.metrics.activeCount}</span>
            <span className="text-[9px] text-cyan-300 font-bold block mt-1">تحديث لحظي مستمر</span>
          </div>

          <div className="p-3 rounded-xl bg-[#020b18] border border-emerald-500/40 shadow-inner">
            <span className="text-[10px] text-slate-300 font-bold block">حجم التداول المالي اليومي</span>
            <span className="text-base sm:text-xl font-black text-emerald-300 mt-0.5 block">{station.metrics.dailyVolume}</span>
            <span className="text-[9px] text-emerald-400 font-bold block mt-1">مدفوع ومؤكد بالكامل</span>
          </div>

          <div className="p-3 rounded-xl bg-[#020b18] border border-amber-500/40 shadow-inner">
            <span className="text-[10px] text-slate-300 font-bold block">معدل هامش الربح المؤسسي</span>
            <span className="text-base sm:text-xl font-black text-amber-300 mt-0.5 block">{station.metrics.marginRate}</span>
            <span className="text-[9px] text-amber-400 font-bold block mt-1">وفق سياسة التسعير السيادي</span>
          </div>

          <div className="p-3 rounded-xl bg-[#020b18] border border-purple-500/40 shadow-inner">
            <span className="text-[10px] text-slate-300 font-bold block">سرعة الاستجابة (Latency)</span>
            <span className="text-base sm:text-xl font-black text-purple-300 mt-0.5 block">{station.metrics.latencyMs} ms</span>
            <span className="text-[9px] text-purple-400 font-bold block mt-1">Sub-second Local Mesh</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. Deep Operational Tab Navigation                                        */}
        {/* ========================================================================= */}
        <div className="h-11 px-6 flex items-center justify-between border-b border-cyan-500/20 bg-[#020e1f] shrink-0 font-sans text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("records")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "records"
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_#00e5ff]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity size={14} />
              <span>العمليات الميدانية والبيانات الحية ({station.records.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("toggles")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "toggles"
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_#00e5ff]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sliders size={14} />
              <span>المفاتيح التكتيكية والسياسات الآلية ({toggles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("gateways")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "gateways"
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_#00e5ff]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Server size={14} />
              <span>محركات الربط والموردين ({station.gateways.length})</span>
            </button>
          </div>

          {activeTab === "records" && (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في السجلات..."
                className="ps-8 pe-3 py-1 rounded-lg bg-[#03152d] border border-cyan-500/40 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. Tab Workspace Body                                                     */}
        {/* ========================================================================= */}
        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden min-h-0">
          {/* Main Content Area (Col 1 & 2) */}
          <div className="lg:col-span-2 rounded-2xl bg-[#020b18] border-2 border-cyan-500/30 p-4 flex flex-col overflow-hidden">
            {activeTab === "records" && (
              <div className="flex-1 overflow-y-auto space-y-2 pe-1 custom-scrollbar">
                {filteredRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <Database size={24} className="text-slate-500" />
                    <span>لا توجد سجلات تطابق البحث</span>
                  </div>
                ) : (
                  filteredRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-[#03152d] border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="px-2.5 py-1 rounded-md text-xs font-black bg-cyan-950 text-cyan-300 border border-cyan-700 shrink-0">
                          {rec.id}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-white font-bold text-sm truncate group-hover:text-cyan-300 font-sans">
                            {rec.label}
                          </span>
                          <span className="text-xs text-slate-300 truncate mt-0.5 font-sans">{rec.sublabel}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black text-amber-300 font-mono">{rec.metric}</span>
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                            rec.status === "ACTIVE"
                              ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/50"
                              : rec.status === "SYNCED"
                              ? "bg-cyan-500/25 text-cyan-200 border border-cyan-500/50"
                              : "bg-amber-500/25 text-amber-200 border border-amber-500/50"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "toggles" && (
              <div className="flex-1 overflow-y-auto space-y-3 pe-1 custom-scrollbar">
                <span className="text-xs font-bold text-cyan-300 font-sans block mb-2">
                  تحكم مباشر في أتمتة وسياسات هذا القسم:
                </span>
                {toggles.map((tog) => (
                  <div
                    key={tog.id}
                    onClick={() => handleToggle(tog.id)}
                    className="p-3.5 rounded-xl bg-[#03152d] border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all flex items-center justify-between select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-3 rounded-full ${tog.enabled ? "bg-cyan-400 shadow-[0_0_8px_#00e5ff]" : "bg-slate-600"}`} />
                      <span className="text-sm text-white font-bold font-sans">{tog.title}</span>
                    </div>
                    <button
                      type="button"
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        tog.enabled ? "bg-cyan-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`size-4 rounded-full bg-white absolute top-1 transition-transform ${
                          tog.enabled ? "left-1" : "left-6"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "gateways" && (
              <div className="flex-1 overflow-y-auto space-y-3 pe-1 custom-scrollbar">
                <span className="text-xs font-bold text-cyan-300 font-sans block mb-2">
                  بوابات الربط والـ API النشطة لهذا القطاع:
                </span>
                {station.gateways.map((gw, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#03152d] border border-cyan-500/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm font-sans">{gw.name}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700">
                          {gw.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-300 mt-1 block">الحصة الشهرية: {gw.quota}</span>
                    </div>

                    <div className="flex items-center gap-3 text-end">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-purple-300">{gw.latency}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">{gw.status}</span>
                      </div>
                      <span className="size-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Co-Pilot Directives & Intelligence (Col 3) */}
          <div className="flex flex-col gap-3 overflow-y-auto pe-1 custom-scrollbar">
            {/* Quick Link to Master Admin Section */}
            <div className="p-4 rounded-2xl bg-[#03152d] border border-cyan-500/40 space-y-2">
              <span className="font-bold text-white tracking-wide flex items-center gap-2 font-sans text-sm">
                <ExternalLink size={16} className="text-cyan-400" />
                <span>الربط السيبراني الكامل</span>
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                هذه المحطة متصلة لحظياً بالوحدة المركزية على المسار:
                <code className="text-cyan-300 block font-mono mt-1 bg-[#020b18] p-2 rounded border border-cyan-500/20">
                  /admin/{station.route}
                </code>
              </p>
              <a
                href={`/admin/${station.route}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs transition-all text-center flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
              >
                <span>فتح القسم بالكامل في تبويب جديد</span>
                <ArrowUpRight size={14} />
              </a>
            </div>

            {/* Agent Co-Pilot Callout & Quick Directive */}
            <div className="p-4 rounded-2xl bg-[#03152d] border border-amber-500/40 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="font-bold text-amber-300 tracking-wide flex items-center gap-2 font-sans mb-2 text-sm">
                  <Zap size={16} className="text-amber-400" />
                  <span>الوكيل المشرف على هذا القسم</span>
                </span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed bg-[#020b18] p-3 rounded-xl border border-amber-500/30">
                  {station.copilotPrompt}
                </p>
              </div>

              <form onSubmit={handleSendPrompt} className="space-y-2 mt-3">
                <label className="text-[11px] text-slate-300 block font-sans font-bold">
                  إصدار أمر فوري لوكيل {station.nameAr}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDirective}
                    onChange={(e) => setCustomDirective(e.target.value)}
                    placeholder="اكتب التوجيه الفوري للوكيل..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#020b18] border border-cyan-500/40 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-400 font-sans"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black transition-all shadow-[0_0_15px_rgba(0,229,255,0.5)] shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
