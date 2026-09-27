import { STUDIO_SCREENS, STUDIO_PAGES, type DomainId } from "./catalog";
export type ScreenId = typeof STUDIO_SCREENS[number]["id"];
export type SurfaceKind = "radial" | "dag" | "voice" | "workspace" | "hex" | "avatar";
export const SURFACES = [
  {
    "id": "01",
    "layout": "radial",
    "domains": [],
    "nodes": [
      "الحجوزات",
      "الرحلات",
      "الفنادق",
      "الخدمات",
      "المحتوى",
      "العملاء",
      "التسويق",
      "الوكلاء",
      "الأتمتة",
      "المالية",
      "B2B",
      "التكاملات"
    ],
    "fields": [
      "entityId",
      "parentId",
      "type",
      "title",
      "permissions",
      "status",
      "freshness",
      "source"
    ],
    "links": [
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16"
    ],
    "risk": "عدم مساواة عدد العلاقات بسلامة النظام؛ الحالة غير المعروفة رمادية"
  },
  {
    "id": "02",
    "layout": "radial",
    "domains": [],
    "nodes": [
      "المنصة",
      "المجال",
      "الخدمة",
      "الإجراء",
      "التنفيذ",
      "الحدث",
      "المورد",
      "الأثر"
    ],
    "fields": [
      "nodeId",
      "ancestry",
      "cursor",
      "relationType",
      "childCount",
      "version"
    ],
    "links": [
      "01",
      "18"
    ],
    "risk": "منع الدورات غير المحدودة؛ كشف cycle وإظهار رابط مرجعي بدل نسخ شجرة"
  },
  {
    "id": "03",
    "layout": "dag",
    "domains": [
      "bookings"
    ],
    "nodes": [
      "طلب الحجز",
      "التحقق",
      "المورد",
      "التأكيد",
      "سجل الحجز",
      "طلب الإلغاء",
      "الاسترداد",
      "التقييم"
    ],
    "fields": [
      "bookingId",
      "supplierRef",
      "state",
      "policyVersion",
      "currency",
      "refundableAmount",
      "traceId"
    ],
    "links": [
      "04",
      "05",
      "06",
      "08",
      "13"
    ],
    "risk": "التكرار لا ينشئ إلغاء أو استردادًا مزدوجًا؛ تغير السياسة يفرض إعادة الموافقة"
  },
  {
    "id": "04",
    "layout": "dag",
    "domains": [
      "flights"
    ],
    "nodes": [
      "طلب البحث",
      "GDS",
      "NDC",
      "مزود مباشر",
      "تجميع العروض",
      "قواعد السعر",
      "إنشاء الحجز",
      "التذاكر"
    ],
    "fields": [
      "searchId",
      "offerId",
      "supplier",
      "expiresAt",
      "fareRules",
      "bookingRef",
      "ticketStatus"
    ],
    "links": [
      "03",
      "13",
      "16"
    ],
    "risk": "انتهاء العرض أو نجاح مورد وفشل الدفع يحتاج حالة reconciliation وليس تأكيدًا وهميًا"
  },
  {
    "id": "05",
    "layout": "dag",
    "domains": [
      "hotels"
    ],
    "nodes": [
      "مورد الفندق",
      "توحيد الفنادق",
      "الكتالوج",
      "الغرف",
      "التوفر",
      "المارك أب",
      "الحجز",
      "التقييمات"
    ],
    "fields": [
      "hotelId",
      "supplierHotelId",
      "roomTypeId",
      "boardBasis",
      "occupancy",
      "rateKey",
      "cancellationPolicy"
    ],
    "links": [
      "03",
      "08",
      "13",
      "16"
    ],
    "risk": "لا دمج غرف مختلفة لمجرد تشابه الاسم؛ إظهار مصدر السعر ووقت صلاحيته"
  },
  {
    "id": "06",
    "layout": "radial",
    "domains": [
      "mobility"
    ],
    "nodes": [
      "الترانسفير",
      "VIP",
      "السيارات",
      "الجولات",
      "الباقات",
      "التأشيرات",
      "التوفر",
      "الحجز"
    ],
    "fields": [
      "serviceType",
      "itinerary",
      "participants",
      "pickup",
      "vehicleClass",
      "componentQuotes",
      "requirements"
    ],
    "links": [
      "03",
      "04",
      "05",
      "13"
    ],
    "risk": "حجز مركب يحتاج saga وتعويضات محددة؛ الوثائق الشخصية مقيدة الصلاحيات"
  },
  {
    "id": "07",
    "layout": "dag",
    "domains": [
      "cms"
    ],
    "nodes": [
      "المحرر",
      "الصفحات",
      "المقالات",
      "الترجمة",
      "الوسائط",
      "معاينة الويب",
      "PWA",
      "الجوال"
    ],
    "fields": [
      "documentId",
      "locale",
      "revision",
      "schemaVersion",
      "draft",
      "publishedAt",
      "channel"
    ],
    "links": [
      "09",
      "10",
      "15",
      "16"
    ],
    "risk": "لا نشر تلقائي من مخرجات نموذج غير معتمدة؛ تنظيف HTML وفحص روابط وحقوق الوسائط"
  },
  {
    "id": "08",
    "layout": "radial",
    "domains": [
      "customers"
    ],
    "nodes": [
      "ملف العميل",
      "الحجوزات",
      "المحادثات",
      "التذاكر",
      "التقييمات",
      "المجتمع",
      "الموافقات",
      "حذف الحساب"
    ],
    "fields": [
      "customerId",
      "conversationId",
      "consent",
      "retentionClass",
      "bookingIds",
      "assignee"
    ],
    "links": [
      "03",
      "09",
      "11",
      "15"
    ],
    "risk": "فصل tenant؛ عدم عرض بيانات دفع أو جواز في اللقطات؛ الحذف يخضع للاحتفاظ الموثق"
  },
  {
    "id": "09",
    "layout": "dag",
    "domains": [
      "publishing"
    ],
    "nodes": [
      "القنوات",
      "صناعة المحتوى",
      "المكتبة",
      "المراجعة",
      "التقويم",
      "الجدولة",
      "النشر",
      "التحليلات"
    ],
    "fields": [
      "postId",
      "channelIds",
      "mediaRights",
      "scheduledAt",
      "timezone",
      "approvalId",
      "externalPostId"
    ],
    "links": [
      "07",
      "10",
      "11",
      "12"
    ],
    "risk": "انتهاء token أو rate limit لا يعني نشرًا ناجحًا؛ الإلغاء قبل إرسال المهمة"
  },
  {
    "id": "10",
    "layout": "dag",
    "domains": [
      "growth"
    ],
    "nodes": [
      "الجمهور",
      "الإبداع",
      "الميزانية",
      "المراجعة",
      "الإعلانات",
      "البريد",
      "العمولات",
      "العائد"
    ],
    "fields": [
      "campaignId",
      "budgetCap",
      "currency",
      "audienceRef",
      "consentBasis",
      "attributionWindow"
    ],
    "links": [
      "07",
      "09",
      "13",
      "14"
    ],
    "risk": "لا إطلاق إعلان أو إرسال بريد حقيقي من النموذج؛ حدود الإنفاق enforced بالباك إند"
  },
  {
    "id": "11",
    "layout": "radial",
    "domains": [
      "agents"
    ],
    "nodes": [
      "المشرف",
      "وكيل الحجز",
      "وكيل التقييم",
      "وكيل B2B",
      "وكيل الأمن",
      "المعرفة",
      "الأدوات",
      "الموافقات"
    ],
    "fields": [
      "agentId",
      "runId",
      "toolName",
      "inputSchema",
      "evidenceRefs",
      "approval",
      "runStatus"
    ],
    "links": [
      "01",
      "03",
      "08",
      "12",
      "14",
      "15"
    ],
    "risk": "لا كشف chain-of-thought؛ النشاط من أحداث حقيقية، لا استنتاج تفكير داخلي من الزخرفة"
  },
  {
    "id": "12",
    "layout": "dag",
    "domains": [
      "automation"
    ],
    "nodes": [
      "المحفز",
      "الشرط",
      "الإجراء",
      "الموافقة",
      "الطابور",
      "المحاولة",
      "التعويض",
      "سجل التنفيذ"
    ],
    "fields": [
      "workflowId",
      "revision",
      "trigger",
      "steps",
      "dependencies",
      "retryPolicy",
      "compensation"
    ],
    "links": [
      "03",
      "09",
      "10",
      "11",
      "13"
    ],
    "risk": "DAG لا يسمح دورة تنفيذ غير محدودة؛ المحاكاة تمنع الشبكة والكتابة الفعلية"
  },
  {
    "id": "13",
    "layout": "dag",
    "domains": [
      "finance"
    ],
    "nodes": [
      "الدفع",
      "التفويض",
      "التحصيل",
      "الفاتورة",
      "المحفظة",
      "التسوية",
      "الاسترداد",
      "الولاء"
    ],
    "fields": [
      "paymentId",
      "bookingId",
      "amountMinor",
      "currency",
      "ledgerEntryIds",
      "providerEventId"
    ],
    "links": [
      "03",
      "04",
      "05",
      "10",
      "14"
    ],
    "risk": "حساب النقود بوحدات صغرى صحيحة؛ منع ازدواج webhook؛ لا حذف قيود دفتر"
  },
  {
    "id": "14",
    "layout": "radial",
    "domains": [
      "b2b"
    ],
    "nodes": [
      "الشركات",
      "رادار الشركاء",
      "الوايت ليبل",
      "النطاقات",
      "الاشتراكات",
      "المحافظ",
      "الحجوزات",
      "التراخيص"
    ],
    "fields": [
      "tenantId",
      "partnerId",
      "domainStatus",
      "plan",
      "markupRule",
      "walletId",
      "licenseStatus"
    ],
    "links": [
      "03",
      "10",
      "13",
      "15",
      "16"
    ],
    "risk": "اختبارات عزل شريكين إلزامية؛ فحص ملكية النطاق؛ هوامش لا تتجاوز صلاحية المستخدم"
  },
  {
    "id": "15",
    "layout": "radial",
    "domains": [
      "security"
    ],
    "nodes": [
      "الهوية القانونية",
      "الشروط",
      "الخصوصية",
      "الموافقة",
      "حقوق المسافر",
      "طلبات البيانات",
      "الصلاحيات",
      "التدقيق"
    ],
    "fields": [
      "policyId",
      "version",
      "consentId",
      "subjectId",
      "requestType",
      "retention",
      "actor",
      "auditId"
    ],
    "links": [
      "08",
      "11",
      "13",
      "14",
      "16"
    ],
    "risk": "لا تفسير قانوني آلي ملزم؛ اختلاف التشريع يحتاج اعتماد مختص؛ لا تسريب أسرار في trace"
  },
  {
    "id": "16",
    "layout": "dag",
    "domains": [
      "settings"
    ],
    "nodes": [
      "الإعدادات",
      "SMTP",
      "مزودو البحث",
      "PocketBase",
      "الترجمات",
      "التتبع",
      "مكتبة الوسائط",
      "حالة الاتصال"
    ],
    "fields": [
      "integrationId",
      "configVersion",
      "secretRef",
      "health",
      "lastCheckedAt",
      "locale"
    ],
    "links": [
      "04",
      "05",
      "07",
      "09",
      "14",
      "15"
    ],
    "risk": "الأسرار تبقى في خادم vault؛ الاختبار لا يرسل حملات أو يعدل مخزونًا"
  },
  {
    "id": "17",
    "layout": "voice",
    "domains": [
      "agents"
    ],
    "nodes": [
      "خمول",
      "استماع",
      "معالجة",
      "كلام",
      "تنفيذ",
      "مقاطعة"
    ],
    "fields": [
      "sessionId",
      "source",
      "rms",
      "bands",
      "partialTranscript",
      "turnId",
      "cancelledAt"
    ],
    "links": [
      "11",
      "18",
      "20"
    ],
    "risk": "الميكروفون لا يعمل تلقائيًا؛ لا تسجيل أو إرسال دون إشعار؛ حالات العرض التجريبية ليست نشاط وكيل"
  },
  {
    "id": "18",
    "layout": "workspace",
    "domains": [],
    "nodes": [
      "السيدبار",
      "التكبير",
      "تحريك العقد",
      "تحريك النوافذ",
      "تحجيم",
      "تصغير",
      "إغلاق",
      "استعادة"
    ],
    "fields": [
      "workspaceId",
      "version",
      "panels",
      "bounds",
      "zOrder",
      "graphTransform",
      "expandedIds"
    ],
    "links": [
      "01",
      "02",
      "17",
      "19"
    ],
    "risk": "النافذة لا تضيع خارج الشاشة؛ ESC وkeyboard بديل؛ reduced-motion؛ لا تعديل العلاقات بمجرد تحريك عقدة"
  },
  {
    "id": "19",
    "layout": "hex",
    "domains": [
      "overview"
    ],
    "nodes": [
      "الحجوزات",
      "الرحلات",
      "الفنادق",
      "المالية",
      "الوكلاء",
      "الأتمتة",
      "التسويق",
      "الأمن"
    ],
    "fields": [
      "metricId",
      "definition",
      "timeWindow",
      "sampledAt",
      "source",
      "severity",
      "alertId"
    ],
    "links": [
      "01",
      "03",
      "11",
      "12",
      "13",
      "15"
    ],
    "risk": "القيمة المفقودة ليست صفرًا؛ الرسم لا يخترع إيرادات أو أعطال؛ المقاييس التجريبية موسومة"
  },
  {
    "id": "20",
    "layout": "avatar",
    "domains": [
      "agents"
    ],
    "nodes": [
      "الرأس الجسيمي",
      "الهالة",
      "النواة الكهرمانية",
      "الوريد",
      "القلب",
      "موجة الصوت",
      "المجسات",
      "الوعي بالحالة"
    ],
    "fields": [
      "time",
      "outputRms",
      "inputRms",
      "frequencyBands",
      "speaking",
      "listening",
      "toolActivity"
    ],
    "links": [
      "11",
      "17",
      "18"
    ],
    "risk": "المظهر لا يثبت وجود تفكير أو قلب فعلي؛ نسخة الويب تحتاج أصول فنية وshaders مخصصة"
  }
] as const;
export function getSurface(id: string) { return SURFACES.find(s=>s.id===id); }
export function getSurfacePages(id:string) {
 const s=getSurface(id); return STUDIO_PAGES.filter(p=>p.domain && s?.domains.some(d=>d===p.domain));
}
export function screenForDomain(domain: DomainId): ScreenId {
 return (SURFACES.find(s=>s.domains.some(d=>d===domain))?.id || "01") as ScreenId;
}
export interface Observation {
 tool:string; status:"ready"|"unavailable"; observedAt?:string; readDurationMs?:number;
 facts:Array<{key:string;labelAr:string;value:string|number|boolean|null;source:string;available:boolean}>;
}
export interface StudioRecord {
 id:string; title:string; state:string; source:string; href?:string;
 fields:Record<string,string|number|boolean|null>;
}
export interface StudioSnapshot {
 ok:true; domainId:DomainId; observedAt:string; status:"ready"|"partial"|"unavailable"|"not_connected";
 observations:Observation[]; records:StudioRecord[]; warnings:string[];
}
export type PublicStage = "idle"|"listening"|"reading"|"reasoning"|"speaking"|"awaiting_approval"|"executing"|"error";
