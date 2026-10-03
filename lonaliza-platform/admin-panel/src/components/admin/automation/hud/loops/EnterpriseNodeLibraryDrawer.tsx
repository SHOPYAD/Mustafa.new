"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Plus,
  Zap,
  Brain,
  Plane,
  CreditCard,
  Share2,
  GitBranch,
  Terminal,
  Database,
  ShieldCheck,
  Clock,
  Radio,
  ShoppingBag,
  Bot,
  Layers,
  Sparkles,
  Building2,
  Car,
  Compass,
  FileText,
  DollarSign,
  TrendingUp,
  Video,
  Send,
  SlidersHorizontal,
  RefreshCw,
  Lock,
  Server,
  FileCode,
  CheckCircle2,
} from "lucide-react";

export type EnterpriseCategory =
  | "all"
  | "triggers"
  | "ai"
  | "travel"
  | "finance"
  | "marketing"
  | "logic"
  | "system";

export interface EnterpriseNodeDef {
  id: string;
  category: EnterpriseCategory;
  type: "trigger" | "intelligence" | "model" | "skill" | "rule" | "action" | "review";
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  badge: string;
  badgeColor: string;
  ports: { in: string; out: string };
  defaultParams: Record<string, string | number | boolean>;
}

export const ENTERPRISE_NODE_CATALOG: EnterpriseNodeDef[] = [
  // ==========================================
  // 1. المشغلات والأحداث (Triggers & Event Sinks)
  // ==========================================
  {
    id: "trig-webhook",
    category: "triggers",
    type: "trigger",
    title: "خطاف الويب الخارجي (Webhook Inbound)",
    subtitle: "/api/webhooks/inbound/events",
    description: "استقبال وتدقيق إشارات JSON الفورية من الشركاء الخارجيين وبوابات الحجز العالمية",
    icon: Radio,
    color: "#00f0ff",
    badge: "[مشغل · WEBHOOK]",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    ports: { in: "HTTP Payload", out: "Parsed JSON" },
    defaultParams: { path: "/api/webhooks/v1/event", method: "POST", authHeader: "Bearer", timeoutMs: 8000 },
  },
  {
    id: "trig-cron",
    category: "triggers",
    type: "trigger",
    title: "مجدول زمني دوري (Cron Scheduler)",
    subtitle: "Enterprise Recurring Heartbeat",
    description: "إطلاق مسار الأتمتة على فترات مجدولة (دقيقة، ساعة، يوم، أو تعبير Cron مخصص)",
    icon: Clock,
    color: "#38bdf8",
    badge: "[مشغل · CRON]",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ports: { in: "Time Tick", out: "Timestamp Context" },
    defaultParams: { cronExpression: "*/30 * * * *", timezone: "Europe/Istanbul", maxConcurrentRuns: 1 },
  },
  {
    id: "trig-db-booking",
    category: "triggers",
    type: "trigger",
    title: "حدث إنشاء حجز جديد (Booking Created)",
    subtitle: "PocketBase: collections.hotel_bookings",
    description: "رصد وتفعيل فوري عند إنشاء أي حجز طيران أو فندق أو نقل جديد على الموقع أو التطبيق",
    icon: ShoppingBag,
    color: "#34d399",
    badge: "[مشغل · DB EVENT]",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    ports: { in: "DB Hook", out: "Booking Record" },
    defaultParams: { collection: "hotel_bookings", action: "create", notifyDispatcher: true },
  },
  {
    id: "trig-db-payment",
    category: "triggers",
    type: "trigger",
    title: "حدث اكتمال الدفع بنجاح (Payment Success)",
    subtitle: "/api/payments/iyzico/callback",
    description: "الاستجابة الفورية عند إتمام دفع العميل أو الشريك بنجاح لإصدار التذاكر وإشعار السائقين",
    icon: CreditCard,
    color: "#a78bfa",
    badge: "[مشغل · PAYMENT]",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    ports: { in: "Gateway Signal", out: "Payment Proof" },
    defaultParams: { verifySignature: true, minAmountUSD: 10, autoIssueTickets: true },
  },
  {
    id: "trig-telegram-bot",
    category: "triggers",
    type: "trigger",
    title: "رسالة تلغرام واردة (Telegram Command Bot)",
    subtitle: "@LonalizaAutomationBot / Hook",
    description: "التقاط أوامر المشرف وقنوات الإشعارات الخاصة بالسفر لإطلاق المهام التشغيلية تلقائياً",
    icon: Send,
    color: "#60a5fa",
    badge: "[مشغل · TELEGRAM]",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    ports: { in: "TG Message", out: "Command & Params" },
    defaultParams: { allowedAdmins: "14829103,992144", commandPrefix: "/", logRawPayload: false },
  },
  {
    id: "trig-whatsapp-inbound",
    category: "triggers",
    type: "trigger",
    title: "رسالة واتساب واردة (WhatsApp Inbound Trigger)",
    subtitle: "Meta Cloud API Webhook Listener",
    description: "رصد استفسارات العملاء على واتساب لتمريرها لمحرك بايثون وتأكيد الحجوزات وإرسال ملفات الـ PDF",
    icon: Send,
    color: "#22c55e",
    badge: "[مشغل · WHATSAPP]",
    badgeColor: "bg-green-500/20 text-green-300 border-green-500/40",
    ports: { in: "WA Cloud Webhook", out: "User Intent + Text" },
    defaultParams: { phoneId: "109823901", autoAcknowledge: true, detectLanguage: true },
  },
  {
    id: "trig-flight-radar",
    category: "triggers",
    type: "trigger",
    title: "تنبيه رادار الطيران (Flight Radar Alert)",
    subtitle: "/api/transfers/flight-tracker",
    description: "مراقبة مسار رحلات الطيران الدولية ورصد حالات التأخير وتحديث توقيت استقبال السائقين في المطار",
    icon: Plane,
    color: "#f59e0b",
    badge: "[مشغل · FLIGHT RADAR]",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ports: { in: "IATA Telemetry", out: "Delay Delta (min)" },
    defaultParams: { checkIntervalMin: 15, alertThresholdMin: 30, autoShiftDriverPickup: true },
  },
  {
    id: "trig-abandoned-cart",
    category: "triggers",
    type: "trigger",
    title: "سلة حجز متروكة (Abandoned Cart Trigger)",
    subtitle: "Event: user_checkout_abandoned",
    description: "رصد العملاء الذين توقفوا في صفحة الدفع دون إتمام الحجز لإطلاق حملات إعادة الاستهداف الذكية",
    icon: ShoppingBag,
    color: "#f43f5e",
    badge: "[مشغل · CART DROP]",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    ports: { in: "Client Session", out: "Cart Items + Contact" },
    defaultParams: { waitMinutesBeforeTrigger: 45, discountCoupon: "DISC5_SAVE", maxAttempts: 2 },
  },

  // ==========================================
  // 2. محركات الذكاء الاصطناعي والوكلاء (AI & Agents)
  // ==========================================
  {
    id: "ai-dspy",
    category: "ai",
    type: "intelligence",
    title: "محرك بايثون الذكي (Python Brain DSPy Predictor)",
    subtitle: "Port 8100 · Compiled DSPy Signatures",
    description: "معالجة الطلبات السياحية المعقدة، التحسين الذاتي للمطابقة، وتوفير التوكنز الخارجي بنسبة 85%",
    icon: Brain,
    color: "#00f0ff",
    badge: "[ذكاء · DSPY PREDICTOR]",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    ports: { in: "Natural Query", out: "Optimized Intent" },
    defaultParams: { endpoint: "http://127.0.0.1:8100/v1/predict", temperature: 0.2, compileOptimized: true },
  },
  {
    id: "ai-langgraph",
    category: "ai",
    type: "intelligence",
    title: "مشرف الوكلاء المتعددين (LangGraph Supervisor)",
    subtitle: "Multi-Agent Consensus & Routing Engine",
    description: "تنسيق الأدوار بين وكيل الطيران، وكيل الفنادق، ووكيل النقل لاتخاذ القرار التوافقي الذاتي",
    icon: Bot,
    color: "#c084fc",
    badge: "[ذكاء · SUPERVISOR]",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    ports: { in: "Multi-Agent State", out: "Consensus Plan" },
    defaultParams: { maxAgentTurns: 5, consensusThreshold: 0.9, fallbackAgent: "supervisor_disc" },
  },
  {
    id: "ai-mem0",
    category: "ai",
    type: "intelligence",
    title: "استرجاع الذاكرة السياقية (Mem0 Context Recall)",
    subtitle: "Qdrant Vector Cluster & User Preferences",
    description: "استرجاع سجل رحلات المسافر وتفضيلات المقاعد والفنادق والمدفوعات لتخصيص العروض",
    icon: Layers,
    color: "#2dd4bf",
    badge: "[ذاكرة · MEM0 RAG]",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ports: { in: "User ID", out: "Semantic Memory Embeddings" },
    defaultParams: { topK: 5, similarityThreshold: 0.82, memoryDomain: "travel_preferences" },
  },
  {
    id: "ai-semantic-router",
    category: "ai",
    type: "intelligence",
    title: "الموجه الدلالي الذكي (Semantic Intent Router)",
    subtitle: "Domain Thesaurus Engine · 26 Clusters",
    description: "تحليل اللهجات السياحية ومطابقة الاستعلام مع المعجم وفهرس المنصة في أقل من 15ms",
    icon: Compass,
    color: "#38bdf8",
    badge: "[توجيه · SEMANTIC ROUTER]",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ports: { in: "Raw Text Query", out: "Route Target + Score" },
    defaultParams: { dialectSensitivity: "High", fallbackCluster: "hotels.luxury", minConfidence: 0.75 },
  },
  {
    id: "ai-ocr-passport",
    category: "ai",
    type: "intelligence",
    title: "قارئ الجوازات والوثائق (OCR Vision Extractor)",
    subtitle: "Vision AI · ICAO 9303 MRZ Parser",
    description: "استخراج بيانات المسافر ورقم الجواز وتاريخ الانتهاء تلقائياً من الصورة وتعبئة بيانات الحجز",
    icon: FileText,
    color: "#f59e0b",
    badge: "[رؤية · OCR EXTRACTOR]",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ports: { in: "Passport Image", out: "MRZ Extracted Object" },
    defaultParams: { mrzValidation: true, faceCrop: false, maxImageSizeMB: 10 },
  },
  {
    id: "ai-safety-guardrail",
    category: "ai",
    type: "rule",
    title: "حارس السلامة والرقابة الذاتي (AI Safety Guardrail)",
    subtitle: "Policy Gate · Financial & Semantic Firewall",
    description: "تدقيق المخرجات والتأكد من مطابقة الأسعار والحدود الائتمانية ومنع الهلوسة في تفاصيل الرحلات",
    icon: ShieldCheck,
    color: "#f43f5e",
    badge: "[حوكمة · SAFETY GATE]",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    ports: { in: "Agent Output", out: "Validated / Blocked" },
    defaultParams: { maxDiscountUSD: 100, rejectProfanity: true, strictPriceSanity: true },
  },

  // ==========================================
  // 3. بوابات السفر والسياحة الحقيقية (Travel & GDS)
  // ==========================================
  {
    id: "travel-pkfare",
    category: "travel",
    type: "action",
    title: "بوابة طيران PKFare (PKFare GDS Flight API)",
    subtitle: "/api/webhooks/pkfare · Global GDS",
    description: "البحث الفوري عن تذاكر الطيران، حجز المقاعد، إصدار أرقام PNR وتأكيد التذاكر الدولية",
    icon: Plane,
    color: "#00f0ff",
    badge: "[بوابة · PKFARE GDS]",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    ports: { in: "Flight Search Payload", out: "PNR & Live Pricing" },
    defaultParams: { cabinClass: "Economy", autoTicketing: false, currency: "USD" },
  },
  {
    id: "travel-seeru-hotels",
    category: "travel",
    type: "action",
    title: "بوابة فنادق Seeru (Seeru Hotels Aggregator)",
    subtitle: "/api/webhooks/seeru/hotels · 500k+ Hotels",
    description: "مزامنة غرف الفنادق العالمية، تدقيق التوافر اللحظي، وإصدار قسائم الحجز الفندقية",
    icon: Building2,
    color: "#ffc53d",
    badge: "[بوابة · SEERU HOTELS]",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ports: { in: "Hotel Query", out: "Confirmed Room Voucher" },
    defaultParams: { refundableOnly: true, includeBreakfast: true, rateType: "B2B_NET" },
  },
  {
    id: "travel-amadeus",
    category: "travel",
    type: "action",
    title: "بوابة طيران أماديوس (Amadeus Flight Engine)",
    subtitle: "Amadeus Travel API Integration",
    description: "التحقق من جداول الرحلات العالمية، وزن الأمتعة المسموح، وإمكانية تعديل التذاكر",
    icon: Plane,
    color: "#38bdf8",
    badge: "[بوابة · AMADEUS API]",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ports: { in: "Flight Request", out: "Airline Schedule Object" },
    defaultParams: { maxStops: 1, returnAncillaries: true, validateTicketingDeadline: true },
  },
  {
    id: "travel-fleet-dispatch",
    category: "travel",
    type: "action",
    title: "موزع أسطول النقل وسيارات VIP (Fleet Dispatcher)",
    subtitle: "/api/transfers/admin/dispatch",
    description: "تعيين السائق الأنسب (مرسيدس فيتو / سبرنتر)، إرسال إشعار المهمة، وتتبع مسار الـ GPS",
    icon: Car,
    color: "#34d399",
    badge: "[نقل · FLEET DISPATCH]",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    ports: { in: "Transfer Route", out: "Assigned Driver ID" },
    defaultParams: { vehicleClass: "Mercedes Vito VIP", autoAssignNearest: true, bufferTimeMin: 45 },
  },
  {
    id: "travel-daily-tours",
    category: "travel",
    type: "action",
    title: "محرك الجولات السياحية اليومية (Daily Tours)",
    subtitle: "/api/transfers/admin/daily-tours",
    description: "إدارة الحجوزات اليومية لجولات بورصة، سبانجا، سابنجا، وتعيين المرشدين السياحيين المرخصين",
    icon: Compass,
    color: "#35e3ff",
    badge: "[جولات · DAILY TOURS]",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    ports: { in: "Tour Itinerary", out: "Booking Pass & Guide" },
    defaultParams: { languageGuide: "Arabic", pickupZone: "Taksim / Sultanahmet", maxSeatsPerVan: 8 },
  },
  {
    id: "travel-cabins-sync",
    category: "travel",
    type: "action",
    title: "بوابة حجز الأكواخ والفلل (Cabins & Luxury Villas)",
    subtitle: "collections.cabins_villas_inventory",
    description: "مزامنة حجوزات وتوافر الأكواخ الريفية الفاخرة في صبنجة وطرابزون وأوزنجول مع الملاك المحليين",
    icon: Building2,
    color: "#f59e0b",
    badge: "[أكواخ · CABINS & VILLAS]",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ports: { in: "Cabin Dates", out: "Owner Direct Confirmation" },
    defaultParams: { instantBook: true, privatePoolRequired: true, checkInTime: "14:00" },
  },

  // ==========================================
  // 4. المدفوعات والمالية (Fintech & Payments)
  // ==========================================
  {
    id: "fin-iyzico",
    category: "finance",
    type: "action",
    title: "بوابة الدفع Iyzico (Iyzico 3D Secure Gateway)",
    subtitle: "/api/payments/iyzico/charge",
    description: "معالجة مدفوعات البطاقات الائتمانية الآمنة مع التحقق بالرسائل النصية 3D Secure",
    icon: CreditCard,
    color: "#a78bfa",
    badge: "[دفع · IYZICO 3DS]",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    ports: { in: "Card Details", out: "Transaction ID + Status" },
    defaultParams: { currency: "USD", enableInstallments: false, is3DSecure: true },
  },
  {
    id: "fin-stripe",
    category: "finance",
    type: "action",
    title: "بوابة الدفع العالمية Stripe (Stripe Connect)",
    subtitle: "Stripe API Checkout Session",
    description: "تحصيل المدفوعات العالمية والعملات الأجنبية مع ميزة كشف الاحتيال المالي Radar",
    icon: CreditCard,
    color: "#818cf8",
    badge: "[دفع · STRIPE GLOBAL]",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    ports: { in: "Customer Intent", out: "Stripe Charge Receipt" },
    defaultParams: { captureMethod: "automatic", paymentMethods: ["card", "apple_pay", "google_pay"] },
  },
  {
    id: "fin-b2b-wallet",
    category: "finance",
    type: "action",
    title: "محفظة شركاء B2B (Reseller B2B Wallet)",
    subtitle: "/api/partners/wallet · Credit Balance",
    description: "خصم قيمة الحجز الفوري من رصيد المحفظة الائتمانية للشركات والوكالات السياحية",
    icon: DollarSign,
    color: "#22c55e",
    badge: "[محفظة · B2B WALLET]",
    badgeColor: "bg-green-500/20 text-green-300 border-green-500/40",
    ports: { in: "Partner ID + Cost", out: "New Balance + Transaction" },
    defaultParams: { allowOverdraft: false, commissionRate: 0.12, autoTopupNotification: true },
  },
  {
    id: "fin-tax-invoice",
    category: "finance",
    type: "action",
    title: "مولد الفواتير الضريبية (Tax PDF Invoice Generator)",
    subtitle: "/api/partners/invoice · PDF Stream",
    description: "توليد فواتير ضريبية إلكترونية رسمية معتمدة مع رمز الاستجابة السريع QR Code",
    icon: FileText,
    color: "#38bdf8",
    badge: "[فاتورة · TAX INVOICE]",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ports: { in: "Invoice Data", out: "PDF File URL" },
    defaultParams: { taxRatePercent: 18, companyTaxId: "TR9012384", currency: "USD" },
  },
  {
    id: "fin-refund-engine",
    category: "finance",
    type: "action",
    title: "معالج استرداد الأموال الذاتي (Automated Refund)",
    subtitle: "/api/payments/refund · Automated SLA",
    description: "تسوية المبالغ المستردة عند الإلغاء وفق سياسة الفندق أو شركة الطيران وإعادة الرصيد للمصدر",
    icon: RefreshCw,
    color: "#f43f5e",
    badge: "[استرداد · REFUND ENGINE]",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    ports: { in: "Cancellation ID", out: "Refund Confirmation" },
    defaultParams: { deductCancellationFee: true, notifyClientImmediately: true, maxRefundDays: 3 },
  },

  // ==========================================
  // 5. التسويق والنشر المتعدد (Omni Marketing & Social)
  // ==========================================
  {
    id: "mkt-meta-ads",
    category: "marketing",
    type: "action",
    title: "إدارة إعلانات Meta (Meta Graph Ads & Audiences)",
    subtitle: "/api/publish/v1/integrations · Graph API",
    description: "تحديث جماهير إنستغرام وفيسبوك المخصصة تلقائياً استناداً لحجوزات المسافرين وتفضيلاتهم",
    icon: Share2,
    color: "#3b82f6",
    badge: "[إعلانات · META ADS]",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    ports: { in: "Audience Segment", out: "Meta Campaign Sync" },
    defaultParams: { adAccountId: "act_4829104", matchKey: "sha256_email", dailyBudgetUSD: 50 },
  },
  {
    id: "mkt-google-pmax",
    category: "marketing",
    type: "action",
    title: "حملات جوجل الذكية (Google Ads Performance Max)",
    subtitle: "Google Ads REST API · PMax Campaigns",
    description: "مزامنة عروض الفنادق ورحلات الطيران النشطة مع حملات البحث والـ YouTube التلقائية",
    icon: TrendingUp,
    color: "#f59e0b",
    badge: "[إعلانات · GOOGLE PMAX]",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ports: { in: "Promoted Deals", out: "PMax Feed Update" },
    defaultParams: { targetRoas: 4.5, bidStrategy: "MaximizeConversions", geoTarget: "GCC_SA_AE" },
  },
  {
    id: "mkt-whatsapp-cloud",
    category: "marketing",
    type: "action",
    title: "واتساب السحابي التجاري (WhatsApp Cloud Messaging)",
    subtitle: "Official Meta WhatsApp Business Cloud API",
    description: "إرسال قسائم الحجز، تفاصيل السائق، وتأكيدات الطيران عبر رسائل واتساب تفاعلية",
    icon: Send,
    color: "#22c55e",
    badge: "[تواصل · WA CLOUD MSG]",
    badgeColor: "bg-green-500/20 text-green-300 border-green-500/40",
    ports: { in: "Voucher Object", out: "WhatsApp Delivery Status" },
    defaultParams: { templateName: "booking_confirmation_ar", languageCode: "ar", attachPdf: true },
  },
  {
    id: "mkt-telegram-broadcast",
    category: "marketing",
    type: "action",
    title: "بوت وتنبيهات تلغرام VIP (Telegram Broadcast Channel)",
    subtitle: "/api/webhooks/telegram · VIP Alerts",
    description: "بث عروض السفر الحصرية اللحظية وإشعارات المشرف عند حدوث صفقات B2B الكبرى",
    icon: Send,
    color: "#00f0ff",
    badge: "[تواصل · TG BROADCAST]",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    ports: { in: "Broadcast Content", out: "Telegram Message ID" },
    defaultParams: { channelId: "@LonalizaVIPTravel", parseMode: "HTML", disableWebPagePreview: false },
  },
  {
    id: "mkt-reels-gen",
    category: "marketing",
    type: "action",
    title: "مولد مقاطع الريلز السياحية (AI Reels & Shorts)",
    subtitle: "/api/studio/video/generate · FFmpeg 4K",
    description: "مونتاج وإنتاج مقاطع فيديو سياحية رأسية (9:16) بالتعليق الصوتي السعودي ونشرها تلقائياً",
    icon: Video,
    color: "#ec4899",
    badge: "[فيديو · REELS CREATIVE]",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    ports: { in: "Video Topic", out: "Rendered MP4 (9:16)" },
    defaultParams: { resolution: "1080x1920", voiceModel: "Saudi Male", durationSec: 30 },
  },
  {
    id: "mkt-seo-articles",
    category: "marketing",
    type: "action",
    title: "مصنع مقالات السفر و SEO (SEO Tourism Publisher)",
    subtitle: "/api/publish/v1/posts · Content Engine",
    description: "توليد مقالات سياحية عميقة متوافقة مع معايير SEO ونشرها تلقائياً مع روابط الحجز المباشر",
    icon: FileText,
    color: "#14b8a6",
    badge: "[محتوى · SEO PUBLISHER]",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    ports: { in: "Focus Keyword", out: "Published Article URL" },
    defaultParams: { minWords: 1500, includeFaqSchema: true, autoInternalLinks: true },
  },

  // ==========================================
  // 6. المنطق والتحكم المتقدم (Flow Control & Logic)
  // ==========================================
  {
    id: "logic-condition",
    category: "logic",
    type: "rule",
    title: "تفريع شرطي ذكي (If / Else Condition)",
    subtitle: "Branching Logic Gate & Rule Checker",
    description: "توجيه مسار الأتمتة إلى مسار (أ) أو مسار (ب) بناءً على قيمة الحجز، نوع العميل، أو الرصيد",
    icon: GitBranch,
    color: "#f59e0b",
    badge: "[منطق · IF/ELSE GATE]",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ports: { in: "Input Variable", out: "True / False Branches" },
    defaultParams: { conditionOperator: "greater_than", compareField: "totalAmount", compareValue: 500 },
  },
  {
    id: "logic-switch-router",
    category: "logic",
    type: "rule",
    title: "موجه متعدد المسارات (Switch / Multi-Router)",
    subtitle: "Multi-way Routing by Category",
    description: "توزيع السريان إلى مسارات متخصصة بناءً على نوع الخدمة (طيران، فندق، سيارة، جولة سياحية)",
    icon: SlidersHorizontal,
    color: "#38bdf8",
    badge: "[منطق · SWITCH ROUTER]",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ports: { in: "Switch Key", out: "Multi Branch Array" },
    defaultParams: { switchProperty: "serviceType", defaultBranch: "general_inquiry" },
  },
  {
    id: "logic-delay",
    category: "logic",
    type: "rule",
    title: "مؤقت وتأخير زمني (Delay / Wait Timer)",
    subtitle: "Workflow Pause & Scheduled Resume",
    description: "إيقاف السريان مؤقتاً لانتظار تأكيد العميل، وصول السائق، أو إرسال استبيان الرضا بعد 24 ساعة",
    icon: Clock,
    color: "#94a3b8",
    badge: "[تأخير · DELAY TIMER]",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    ports: { in: "Trigger", out: "Delayed Trigger" },
    defaultParams: { delayDuration: 24, delayUnit: "hours" },
  },
  {
    id: "logic-batch-iterator",
    category: "logic",
    type: "rule",
    title: "تكرار على حزمة عناصر (Batch Iterator / Loop)",
    subtitle: "Array Processor & Rate Limiter",
    description: "معالجة مصفوفة من الحجوزات أو العملاء عنصراً تلو الآخر مع احترام حدود الـ Rate Limits للـ APIs",
    icon: RefreshCw,
    color: "#a78bfa",
    badge: "[تكرار · BATCH ITERATOR]",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    ports: { in: "Items Array", out: "Single Item Stream" },
    defaultParams: { batchSize: 10, delayBetweenItemsMs: 300, stopOnError: false },
  },
  {
    id: "logic-human-approval",
    category: "logic",
    type: "review",
    title: "بوابة اعتماد المشرف (Human-in-the-Loop)",
    subtitle: "Supervisor Manual Decision Gate",
    description: "إيقاف السريان مؤقتاً وعرض إشعار في لوحة الإدارة لطلب موافقة يدوية من المشرف على المبالغ الكبرى",
    icon: ShieldCheck,
    color: "#f43f5e",
    badge: "[مراجعة · APPROVAL GATE]",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    ports: { in: "Pending Task", out: "Approved / Rejected" },
    defaultParams: { autoRejectAfterHours: 12, requiredRole: "super_admin", minApprovalUSD: 2000 },
  },

  // ==========================================
  // 7. خوادم MCP وأنظمة المنصة (Liotrip MCP & Core Systems)
  // ==========================================
  {
    id: "sys-mcp-tool",
    category: "system",
    type: "action",
    title: "استدعاء أداة MCP (Liotrip MCP HTTP Tool)",
    subtitle: "PM2 Process 13 · Port 3048/mcp",
    description: "تنفيذ الأدوات والخوادم المعيارية عبر بروتوكول MCP لإدارة النظام والتحكم المباشر",
    icon: Terminal,
    color: "#00f0ff",
    badge: "[نظام · MCP PROTOCOL]",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    ports: { in: "MCP Tool Call", out: "Execution Result" },
    defaultParams: { toolName: "system_health_check", timeoutSec: 15, mcpServerId: "liotrip-mcp-http" },
  },
  {
    id: "sys-pb-crud",
    category: "system",
    type: "action",
    title: "قاعدة بيانات PocketBase (Direct CRUD Engine)",
    subtitle: "Port 8090 · Direct DB Transaction",
    description: "تنفيذ استعلامات القراءة والكتابة والتحديث المباشر على جداول قاعدة البيانات مع ضمان التماسك",
    icon: Database,
    color: "#34d399",
    badge: "[بيانات · POCKETBASE]",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    ports: { in: "Record Data", out: "Saved DB Record" },
    defaultParams: { collectionName: "hotel_bookings", operation: "update", expandRelations: true },
  },
  {
    id: "sys-worker-task",
    category: "system",
    type: "action",
    title: "مشغل المهام الخلفية (Background Worker Task)",
    subtitle: "PM2 Process 38 · Swarm Workers",
    description: "تمرير مهام المعالجة الثقيلة ومزامنة الفهارس الضخمة إلى طاقم الـ Workers في الخلفية",
    icon: Server,
    color: "#f59e0b",
    badge: "[معالجة · SWARM WORKER]",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    ports: { in: "Heavy Job Spec", out: "Async Task Job ID" },
    defaultParams: { priority: "HIGH", maxRetries: 3, memoryLimitMB: 512 },
  },
  {
    id: "sys-redis-flush",
    category: "system",
    type: "action",
    title: "تفريغ وتحديث الكاش اللحظي (Redis Cache Invalidate)",
    subtitle: "In-Memory Redis Cache Manager",
    description: "إبطال وتحديث كاش أسعار الفنادق وتذاكر الطيران فورياً لضمان دقة الأسعار المعروضة للزوار",
    icon: RefreshCw,
    color: "#f43f5e",
    badge: "[كاش · REDIS FLUSH]",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    ports: { in: "Cache Pattern", out: "Keys Evicted Count" },
    defaultParams: { pattern: "flights:quote:*", clusterSync: true },
  },
  {
    id: "sys-audit-logger",
    category: "system",
    type: "action",
    title: "سجل التدقيق المؤسسي (Audit & Security Logger)",
    subtitle: "collections.security_audit_logs",
    description: "تسجيل العمليات الحساسة، التعديلات المالية، وتغييرات الصلاحيات في سجل مشفر غير قابل للتعديل",
    icon: ShieldCheck,
    color: "#38bdf8",
    badge: "[أمان · AUDIT LOG]",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    ports: { in: "Event Object", out: "Encrypted Log Hash" },
    defaultParams: { severity: "INFO", retentionDays: 365, alertOnAnomaly: true },
  },
];

export interface EnterpriseNodeLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (nodeDef: EnterpriseNodeDef) => void;
}

export function EnterpriseNodeLibraryDrawer({
  isOpen,
  onClose,
  onAddNode,
}: EnterpriseNodeLibraryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EnterpriseCategory>("all");

  const categories = [
    { id: "all", label: "كافة العقد (42)", icon: Layers, count: 42 },
    { id: "triggers", label: "مشغلات ⚡", icon: Zap, count: 8 },
    { id: "ai", label: "ذكاء اصطناعي 🧠", icon: Brain, count: 6 },
    { id: "travel", label: "سياحة و GDS ✈️", icon: Plane, count: 6 },
    { id: "finance", label: "مدفوعات ومالية 💳", icon: CreditCard, count: 5 },
    { id: "marketing", label: "تسويق ونشر 📢", icon: Share2, count: 6 },
    { id: "logic", label: "منطق وتحكم 🔀", icon: GitBranch, count: 5 },
    { id: "system", label: "خوادم و MCP ⚙️", icon: Terminal, count: 6 },
  ];

  const filteredNodes = useMemo(() => {
    return ENTERPRISE_NODE_CATALOG.filter((n) => {
      const matchCat = selectedCategory === "all" || n.category === selectedCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="مكتبة العقد والخدمات والتكاملات المؤسسية"
      dir="rtl"
      className="fixed top-0 right-0 z-[100] h-full w-full sm:w-[560px] bg-[#020b18]/95 backdrop-blur-2xl border-l border-cyan-500/40 shadow-[-20px_0_60px_rgba(0,0,0,0.7)] flex flex-col text-slate-100 select-none animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/30 bg-[#04162e] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_16px_rgba(0,240,255,0.3)]">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              مكتبة العقد والخدمات والتكاملات المؤسسية
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                ENTERPRISE CATALOG
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              بوابات GDS · محركات الذكاء · بوابات الدفع · خوادم MCP · أدوات التحكم
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-cyan-500/20 bg-[#021024]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في أكثر من 40 عقدة وخدمة وتكامل (مثل: PKFare، حجز، واتساب، الدفع، MCP)..."
            className="w-full bg-[#010915] border border-cyan-500/40 rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-sans"
          />
          <Search size={16} className="absolute right-3 top-2.5 text-cyan-400 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-2.5 text-slate-400 hover:text-white text-xs"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="p-2 border-b border-cyan-500/15 bg-[#010815] flex gap-1.5 overflow-x-auto">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComp = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as EnterpriseCategory)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-cyan-500/25 border border-cyan-400 text-white font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "bg-cyan-950/40 border border-cyan-500/20 text-slate-400 hover:text-white hover:bg-cyan-500/10"
              }`}
            >
              <IconComp size={13} className={isSelected ? "text-cyan-300" : "text-slate-400"} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Nodes List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between px-1">
          <span>العقد المتاحة: {filteredNodes.length} عقدة جاهزة للربط</span>
          <span className="text-cyan-400">انقر على أي عقدة لإضافتها مباشرة لمسار العمل</span>
        </div>

        {filteredNodes.map((node) => {
          const IconComponent = node.icon;
          return (
            <div
              key={node.id}
              className="p-3 rounded-xl border border-cyan-500/25 bg-[#031326]/85 hover:bg-[#061d38] hover:border-cyan-400/60 transition-all duration-150 flex flex-col gap-2 group shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
            >
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-xl border flex items-center justify-center shrink-0"
                    style={{
                      background: `${node.color}15`,
                      borderColor: `${node.color}50`,
                      color: node.color,
                      boxShadow: `0 0 10px ${node.color}25`,
                    }}
                  >
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {node.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {node.subtitle}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAddNode(node)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 active:scale-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.35)] shrink-0"
                >
                  <Plus size={14} />
                  <span>إضافة</span>
                </button>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-300 leading-relaxed pr-1">
                {node.description}
              </p>

              {/* Badges & Ports Footer */}
              <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between text-[10px] font-mono">
                <span className={`px-2 py-0.5 rounded border ${node.badgeColor}`}>
                  {node.badge}
                </span>

                <div className="flex items-center gap-2 text-slate-400">
                  <span>المدخل: <strong className="text-cyan-300">{node.ports.in}</strong></span>
                  <span>←</span>
                  <span>المخرج: <strong className="text-emerald-300">{node.ports.out}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
