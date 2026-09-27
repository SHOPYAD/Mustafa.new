import {
  AUTOMATION_JOB_TYPES,
  isMessagingJobType,
  type AutomationJobType,
} from "./types";

export type AutomationJobOwner = "AUTO-CONTENT" | "AUTO-COMMS" | "AUTO-CORE";

export type AutomationJobCatalogEntry = {
  type: AutomationJobType;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  owner: AutomationJobOwner;
  handlerName: string;
  handlerPath: string;
  messaging: boolean;
  consentRequired: boolean;
};

const ENTRIES: Record<AutomationJobType, Omit<AutomationJobCatalogEntry, "type" | "messaging" | "consentRequired">> = {
  "articles.research_and_publish": {
    titleAr: "بحث ونشر مقالات",
    titleEn: "Research and publish articles",
    descriptionAr: "يبحث عن مواضيع سياحية ويسلّمها لوكيل المحتوى للكتابة والنشر.",
    owner: "AUTO-CONTENT",
    handlerName: "researchAndPublishArticles",
    handlerPath: "src/lib/automation/interfaces/content.ts",
  },
  "trips.discover_and_draft": {
    titleAr: "اكتشاف مسودات الرحلات",
    titleEn: "Discover and draft trips",
    descriptionAr: "يكتشف رحلات مرشّحة ويمرّرها كمسودات — بدون كتابة نص المقالة.",
    owner: "AUTO-CONTENT",
    handlerName: "discoverAndDraftTrips",
    handlerPath: "src/lib/automation/interfaces/content.ts",
  },
  "programs.discover_and_draft": {
    titleAr: "اكتشاف مسودات البرامج",
    titleEn: "Discover and draft programs",
    descriptionAr: "يكتشف برامج سياحية ويمرّرها كمسودات لوكيل المحتوى.",
    owner: "AUTO-CONTENT",
    handlerName: "discoverAndDraftPrograms",
    handlerPath: "src/lib/automation/interfaces/content.ts",
  },
  "activities.discover_and_draft": {
    titleAr: "اكتشاف مسودات الأنشطة",
    titleEn: "Discover and draft activities",
    descriptionAr: "يكتشف أنشطة ويمرّرها كمسودات.",
    owner: "AUTO-CONTENT",
    handlerName: "discoverAndDraftActivities",
    handlerPath: "src/lib/automation/interfaces/content.ts",
  },
  "leads.email_campaign": {
    titleAr: "حملة بريد للعملاء",
    titleEn: "Lead email campaign",
    descriptionAr: "يجهّز حملة بريد لجهات CRM الموافقة فقط. الإرسال عبر AUTO-COMMS.",
    owner: "AUTO-COMMS",
    handlerName: "sendLeadEmailCampaign",
    handlerPath: "src/lib/automation/interfaces/comms.ts",
  },
  "leads.whatsapp_campaign": {
    titleAr: "حملة واتساب",
    titleEn: "Lead WhatsApp campaign",
    descriptionAr: "واجهة فقط — الإرسال ينفّذه AUTO-COMMS بعد التحقق من الموافقة.",
    owner: "AUTO-COMMS",
    handlerName: "sendLeadWhatsAppCampaign",
    handlerPath: "src/lib/automation/interfaces/comms.ts",
  },
  "leads.telegram_campaign": {
    titleAr: "حملة تيليغرام",
    titleEn: "Lead Telegram campaign",
    descriptionAr: "واجهة فقط — الإرسال ينفّذه AUTO-COMMS بعد التحقق من الموافقة.",
    owner: "AUTO-COMMS",
    handlerName: "sendLeadTelegramCampaign",
    handlerPath: "src/lib/automation/interfaces/comms.ts",
  },
  "otp.send": {
    titleAr: "إرسال رمز OTP",
    titleEn: "Send OTP",
    descriptionAr: "واجهة إرسال رمز تحقق فقط — لا يولّد المحرك الرموز بنفسه.",
    owner: "AUTO-COMMS",
    handlerName: "sendOtp",
    handlerPath: "src/lib/automation/interfaces/comms.ts",
  },
  "booking.abandoned_reminder": {
    titleAr: "تذكير حجز متروك",
    titleEn: "Abandoned booking reminder",
    descriptionAr: "تذكير لجهات وافقت على التواصل بعد ترك سلة/حجز.",
    owner: "AUTO-COMMS",
    handlerName: "sendAbandonedBookingReminder",
    handlerPath: "src/lib/automation/interfaces/comms.ts",
  },
  "booking.post_trip_review": {
    titleAr: "طلب تقييم بعد الرحلة",
    titleEn: "Post-trip review request",
    descriptionAr: "طلب تقييم من عملاء أكملوا رحلة ولديهم موافقة.",
    owner: "AUTO-COMMS",
    handlerName: "sendPostTripReviewRequest",
    handlerPath: "src/lib/automation/interfaces/comms.ts",
  },
  "visa.alert": {
    titleAr: "تنبيه تأشيرة",
    titleEn: "Visa alert",
    descriptionAr: "تنبيه تغييرات تأشيرة لجهات مشتركة في التنبيهات.",
    owner: "AUTO-COMMS",
    handlerName: "sendVisaAlert",
    handlerPath: "src/lib/automation/interfaces/comms.ts",
  },
  "marketing.seasonal_campaign": {
    titleAr: "حملة موسمية",
    titleEn: "Seasonal campaign",
    descriptionAr: "حملة موسمية (صيف/عيد/مواسم تركيا) لجمهور موافِق.",
    owner: "AUTO-COMMS",
    handlerName: "sendSeasonalCampaign",
    handlerPath: "src/lib/automation/interfaces/comms.ts",
  },
  "pricing.watch": {
    titleAr: "مراقبة الأسعار",
    titleEn: "Price watch",
    descriptionAr: "يراقب تغيّر أسعار ويكتب سجلّاً — بدون إرسال رسائل.",
    owner: "AUTO-CORE",
    handlerName: "watchPrices",
    handlerPath: "src/lib/automation/interfaces/content.ts",
  },
  "articles.translate": {
    titleAr: "ترجمة مقال متعدد اللغات",
    titleEn: "Translate article",
    descriptionAr: "يطلب ترجمة مقال موجود إلى ar/tr/en — يملأها AUTO-CONTENT.",
    owner: "AUTO-CONTENT",
    handlerName: "translateArticle",
    handlerPath: "src/lib/automation/interfaces/content.ts",
  },
  "marketing.birthday_offer": {
    titleAr: "عرض عيد ميلاد",
    titleEn: "Birthday offer",
    descriptionAr: "عرض لعملاء لديهم تاريخ ميلاد وموافقة تسويق.",
    owner: "AUTO-COMMS",
    handlerName: "sendBirthdayOffer",
    handlerPath: "src/lib/automation/interfaces/comms.ts",
  },
  "leads.score": {
    titleAr: "تقييم العملاء المحتملين",
    titleEn: "Lead score",
    descriptionAr: "يحسب درجة اهتمام من بيانات CRM الموجودة فقط.",
    owner: "AUTO-CORE",
    handlerName: "scoreLeads",
    handlerPath: "src/lib/automation/interfaces/content.ts",
  },
  "studio.weekly_plan": {
    titleAr: "خطة محتوى أسبوعية",
    titleEn: "Weekly content plan",
    descriptionAr: "يبني خطة أسبوعية للمنصات ثم يرسلها للاعتماد قبل أي نشر.",
    owner: "AUTO-CONTENT",
    handlerName: "runWeeklyStudioPlan",
    handlerPath: "src/lib/automation/handlers/studio.ts",
  },
  "studio.generate_image": {
    titleAr: "توليد صورة (Nano Banana)",
    titleEn: "Generate studio image",
    descriptionAr: "يولّد صورة سياحية ويحفظها ويرسلها لتيليجرام للموافقة.",
    owner: "AUTO-CONTENT",
    handlerName: "runStudioGenerateImage",
    handlerPath: "src/lib/automation/handlers/studio.ts",
  },
  "studio.generate_video": {
    titleAr: "توليد فيديو (Veo/Omni)",
    titleEn: "Generate studio video",
    descriptionAr: "يولّد فيديو أو قصة مصورة عبر ffmpeg ويرسل الملف للاعتماد.",
    owner: "AUTO-CONTENT",
    handlerName: "runStudioGenerateVideo",
    handlerPath: "src/lib/automation/handlers/studio.ts",
  },
  "studio.schedule_publish": {
    titleAr: "جدولة نشر معتمد",
    titleEn: "Schedule approved publish",
    descriptionAr: "ينشر للحسابات المتصلة فقط بعد موافقة «انشر» — بلا إعلان تلقائي.",
    owner: "AUTO-CONTENT",
    handlerName: "runStudioSchedulePublish",
    handlerPath: "src/lib/automation/handlers/studio.ts",
  },
  "admin.weekly_digest": {
    titleAr: "ملخص أسبوعي للإدارة",
    titleEn: "Weekly admin digest",
    descriptionAr: "يرسل ملخص الوظائف والسجل إلى تيليجرام/البريد المعتمد للإدارة.",
    owner: "AUTO-COMMS",
    handlerName: "runWeeklyAdminDigest",
    handlerPath: "src/lib/automation/handlers/digest.ts",
  },
  "places.reviews": {
    titleAr: "مراجعات النشاط التجاري",
    titleEn: "Business listing reviews",
    descriptionAr: "يجلب اسم النشاط ونص التقييمات فقط — بدون هواتف أو إيميلات شخصية.",
    owner: "AUTO-CONTENT",
    handlerName: "runPlacesReviews",
    handlerPath: "src/lib/automation/handlers/places.ts",
  },
  "ads.lookalike": {
    titleAr: "جمهور مشابه من العملاء",
    titleEn: "CRM lookalike audience",
    descriptionAr: "يبني جمهوراً مشابهاً من عملاء PocketBase بموافقة فقط (إيميل/هاتف مشفّر) عبر ميتا الرسمية.",
    owner: "AUTO-CORE",
    handlerName: "runLookalikeAudience",
    handlerPath: "src/lib/automation/handlers/ads-audience.ts",
  },
  "ads.ctwa": {
    titleAr: "إعلان Click-to-WhatsApp",
    titleEn: "Click-to-WhatsApp ads",
    descriptionAr: "ينشئ حملة CTWA متوقفة عبر Marketing API بعد موافقة وميزانية — بلا واتساب ويب/QR.",
    owner: "AUTO-CORE",
    handlerName: "runCtwaCampaign",
    handlerPath: "src/lib/automation/handlers/ads-audience.ts",
  },
  "ads.ctwa_lookalike": {
    titleAr: "جمهور مشابه + إعلان واتساب",
    titleEn: "CTWA + lookalike",
    descriptionAr: "تشغيل مشترك: جمهور مشابه ثم حملة CTWA — كلاهما بعد موافقة وميزانية.",
    owner: "AUTO-CORE",
    handlerName: "runCtwaLookalike",
    handlerPath: "src/lib/automation/handlers/ads-audience.ts",
  },
};

export const AUTOMATION_JOB_CATALOG: AutomationJobCatalogEntry[] = AUTOMATION_JOB_TYPES.map((type) => {
  const messaging = isMessagingJobType(type);
  return {
    type,
    ...ENTRIES[type],
    messaging,
    consentRequired: messaging,
  };
});

export function catalogEntry(type: AutomationJobType): AutomationJobCatalogEntry {
  const found = AUTOMATION_JOB_CATALOG.find((item) => item.type === type);
  if (!found) {
    throw new Error(`Unknown automation job type: ${type}`);
  }
  return found;
}

export function catalogForPrompt(): string {
  return AUTOMATION_JOB_CATALOG.map(
    (item) =>
      `- ${item.type}: ${item.titleAr} / ${item.titleEn}` +
      (item.consentRequired ? " [requires consentSource — CRM/opt-in only]" : "")
  ).join("\n");
}
