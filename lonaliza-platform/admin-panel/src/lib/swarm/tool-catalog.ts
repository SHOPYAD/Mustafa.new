import type { SwarmToolKey } from "./types";

export type SwarmToolCatalogEntry = {
  key: SwarmToolKey;
  nameAr: string;
  descriptionAr: string;
  kind: "read" | "write";
};

export const SWARM_TOOL_CATALOG: SwarmToolCatalogEntry[] = [
  { key: "whatsapp_slots", nameAr: "حالة أرقام واتساب", descriptionAr: "عدد الأرقام المتصلة وإعدادات الرد الذكي", kind: "read" },
  { key: "comms_conversations", nameAr: "محادثات التواصل", descriptionAr: "محادثات الواتساب/تيليجرام الفعلية", kind: "read" },
  { key: "packages_list", nameAr: "البرامج السياحية", descriptionAr: "الباقات المعتمدة في المخزن", kind: "read" },
  { key: "blog_list", nameAr: "مقالات المدونة", descriptionAr: "المقالات المنشورة فعلياً", kind: "read" },
  { key: "b2b_sessions", nameAr: "جلسات B2B", descriptionAr: "محادثات صفحة الهبوط للشركات", kind: "read" },
  { key: "dashboard_bookings", nameAr: "الحجوزات والإيراد", descriptionAr: "إحصاءات لوحة التحكم من PocketBase", kind: "read" },
  { key: "hotels_runtime", nameAr: "محرك الفنادق", descriptionAr: "حالة مزودي الفنادق الفعلية", kind: "read" },
  { key: "flights_runtime", nameAr: "محرك الطيران", descriptionAr: "حالة مزود الطيران", kind: "read" },
  { key: "cars_list", nameAr: "أسطول السيارات", descriptionAr: "السيارات الداخلية النشطة", kind: "read" },
  { key: "ads_status", nameAr: "ربط الإعلانات", descriptionAr: "هل توكنات Meta/Google مربوطة", kind: "read" },
  { key: "nostr_social", nameAr: "السوشيال ونوستر", descriptionAr: "إعدادات المجتمع والريلايز النشطة", kind: "read" },
  { key: "tours_list", nameAr: "الجولات VIP", descriptionAr: "الجولات المحفوظة في النظام", kind: "read" },
  { key: "create_blog", nameAr: "إنشاء مقال", descriptionAr: "نشر مقال سياحي في المدونة", kind: "write" },
  { key: "create_tour", nameAr: "إنشاء جولة", descriptionAr: "إضافة جولة VIP إلى الموقع", kind: "write" },
  { key: "create_automation_job", nameAr: "إنشاء أتمتة", descriptionAr: "جدولة وظيفة أتمتة حقيقية", kind: "write" },
  { key: "launch_meta_ad", nameAr: "إطلاق إعلان Meta", descriptionAr: "إنشاء حملة Meta عند توفر التوكن", kind: "write" },
  { key: "publish_travel_package", nameAr: "نشر برنامج سياحي", descriptionAr: "تحويل برنامج AI إلى باقة سياحية معتمدة في كتالوج الموقع", kind: "write" },
  { key: "launch_maps_scrape", nameAr: "إطلاق مسح خرائط جوجل", descriptionAr: "إطلاق مهمة مسح رادار الشركات واستخراج بيانات مكاتب السياحة", kind: "write" },
  { key: "leads_database", nameAr: "قاعدة ليدات الشركات B2B", descriptionAr: "إحصائيات وبيانات الشركات السياحية المكتشفة", kind: "read" },
];

export const SWARM_TOOL_KEYS = SWARM_TOOL_CATALOG.map((t) => t.key);

export function isSwarmToolKey(value: unknown): value is SwarmToolKey {
  return typeof value === "string" && SWARM_TOOL_KEYS.includes(value as SwarmToolKey);
}
