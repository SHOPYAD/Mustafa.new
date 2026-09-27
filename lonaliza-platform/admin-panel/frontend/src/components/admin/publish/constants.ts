import type { PublishChannel, PublishState } from "./types";

export const PUBLISH_STATE_AR: Record<PublishState, string> = {
  draft: "مسودة",
  queue: "في الطابور",
  published: "منشور",
  error: "خطأ",
};

export const PUBLISH_STATE_CLASS: Record<PublishState, string> = {
  draft: "bg-[color:var(--admin-bg-subtle)] text-slate-700 border-slate-200 dark:bg-[color:var(--admin-bg-subtle)] dark:text-slate-200 dark:border-slate-700",
  queue: "bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)] border-[color:var(--admin-border-subtle)]   ",
  published: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40  dark:border-amber-800",
  error: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
};

export const WEEKDAY_AR = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"] as const;

export const PROVIDER_LABEL_AR: Record<string, string> = {
  facebook: "فيسبوك",
  instagram: "إنستغرام",
  "instagram-standalone": "إنستغرام المستقل",
  youtube: "يوتيوب",
  tiktok: "تيك توك",
  "tiktok-business": "تيك توك للأعمال",
  x: "إكس (تويتر)",
  "linkedin-page": "لينكدإن — صفحة الشركة",
  linkedin: "لينكدإن",
  threads: "ثريدز",
  pinterest: "بنترست",
  gmb: "جوجل أعمالي",
  telegram: "تيليغرام",
};

/** Five live Lonaliza channels — labels only, not fake connected accounts. */
export const FALLBACK_CHANNEL_OPTIONS: PublishChannel[] = [
  { id: "facebook", provider: "facebook", name: "فيسبوك", disabled: false, refreshNeeded: false },
  { id: "instagram", provider: "instagram", name: "إنستغرام", disabled: false, refreshNeeded: false },
  { id: "youtube", provider: "youtube", name: "يوتيوب", disabled: false, refreshNeeded: false },
  { id: "tiktok", provider: "tiktok", name: "تيك توك", disabled: false, refreshNeeded: false },
  { id: "x", provider: "x", name: "إكس (تويتر)", disabled: false, refreshNeeded: false },
];

/** Postiz account-level analytics platforms (10 unique identifiers). */
export const ANALYTICS_PLATFORMS: Array<{ id: string; nameAr: string; note: string }> = [
  { id: "facebook", nameAr: "فيسبوك", note: "الوصول والتفاعل على مستوى الصفحة" },
  { id: "instagram", nameAr: "إنستغرام", note: "المنشورات والريلز عبر حساب الأعمال" },
  { id: "instagram-standalone", nameAr: "إنستغرام المستقل", note: "تحليلات الحساب المباشر دون صفحة فيسبوك" },
  { id: "linkedin-page", nameAr: "لينكدإن — صفحة الشركة", note: "إحصاءات الصفحة فقط وليس الحساب الشخصي" },
  { id: "tiktok", nameAr: "تيك توك", note: "المشاهدات والمتابعين على المقاطع القصيرة" },
  { id: "tiktok-business", nameAr: "تيك توك للأعمال", note: "إحصاءات حساب الأعمال عبر Business API" },
  { id: "youtube", nameAr: "يوتيوب", note: "المشاهدات والمشتركون والشورتس" },
  { id: "gmb", nameAr: "جوجل أعمالي", note: "زيارات الملف المحلي والإجراءات" },
  { id: "pinterest", nameAr: "بنترست", note: "الانطباعات والنقرات والحفظ — آخر 90 يوماً" },
  { id: "threads", nameAr: "ثريدز", note: "نوافذ 7 و30 يوماً" },
  { id: "x", nameAr: "إكس (تويتر)", note: "الانطباعات والتفاعل على التغريدات" },
];

export const PUBLISH_SUBNAV: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: "/admin/publish", label: "التقويم", exact: true },
  { href: "/admin/publish/compose", label: "الملحن" },
  { href: "/admin/publish/media", label: "المكتبة" },
  { href: "/admin/publish/analytics", label: "التحليلات" },
  { href: "/admin/publish/automations", label: "الأتمتة" },
  { href: "/admin/publish/agent", label: "الوكيل" },
  { href: "/admin/publish/settings", label: "الإعدادات" },
];
