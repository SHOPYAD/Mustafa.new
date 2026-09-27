import { classifyMediaUrl } from "@/lib/social/media";

export type ProviderRule = {
  id: string;
  maxLength: number;
  allowsThreadParts: boolean;
  allowsFirstComment: boolean;
  maxMedia: number;
  requiresMedia: boolean;
  videoOnly: boolean;
  imageOnly: boolean;
  notesAr: string;
};

/** Duplicated from Postiz composer + Lonaliza HTTP adapters — not imported from `@/lib/publish` (server handlers). */
export const PROVIDER_RULES: Record<string, ProviderRule> = {
  facebook: {
    id: "facebook",
    maxLength: 63206,
    allowsThreadParts: true,
    allowsFirstComment: true,
    maxMedia: 10,
    requiresMedia: false,
    videoOnly: false,
    imageOnly: false,
    notesAr: "منشور أو ألبوم، مع تعليق أول اختياري.",
  },
  instagram: {
    id: "instagram",
    maxLength: 2200,
    allowsThreadParts: false,
    allowsFirstComment: true,
    maxMedia: 10,
    requiresMedia: true,
    videoOnly: false,
    imageOnly: false,
    notesAr: "منشور / ريل / ستوري. التعليق الأول بلا وسائط.",
  },
  "instagram-standalone": {
    id: "instagram-standalone",
    maxLength: 2200,
    allowsThreadParts: false,
    allowsFirstComment: true,
    maxMedia: 10,
    requiresMedia: true,
    videoOnly: false,
    imageOnly: false,
    notesAr: "نفس قواعد إنستغرام المستقل.",
  },
  youtube: {
    id: "youtube",
    maxLength: 5000,
    allowsThreadParts: false,
    allowsFirstComment: false,
    maxMedia: 1,
    requiresMedia: true,
    videoOnly: true,
    imageOnly: false,
    notesAr: "فيديو واحد. بلا خيوط أو تعليقات إضافية.",
  },
  tiktok: {
    id: "tiktok",
    maxLength: 2200,
    allowsThreadParts: false,
    allowsFirstComment: false,
    maxMedia: 1,
    requiresMedia: true,
    videoOnly: false,
    imageOnly: false,
    notesAr: "نشر مباشر أو صندوق الوارد. بلا أجزاء إضافية.",
  },
  "tiktok-business": {
    id: "tiktok-business",
    maxLength: 2200,
    allowsThreadParts: false,
    allowsFirstComment: false,
    maxMedia: 1,
    requiresMedia: true,
    videoOnly: false,
    imageOnly: false,
    notesAr: "تيك توك للأعمال — بلا خيوط.",
  },
  x: {
    id: "x",
    maxLength: 280,
    allowsThreadParts: true,
    allowsFirstComment: false,
    maxMedia: 4,
    requiresMedia: false,
    videoOnly: false,
    imageOnly: false,
    notesAr: "خيط تغريدات مع تأخير بين الأجزاء.",
  },
  linkedin: {
    id: "linkedin",
    maxLength: 3000,
    allowsThreadParts: false,
    allowsFirstComment: true,
    maxMedia: 20,
    requiresMedia: false,
    videoOnly: false,
    imageOnly: false,
    notesAr: "منشور شخصي أو كاروسيل صور. تعليق أول اختياري.",
  },
  "linkedin-page": {
    id: "linkedin-page",
    maxLength: 3000,
    allowsThreadParts: false,
    allowsFirstComment: true,
    maxMedia: 20,
    requiresMedia: false,
    videoOnly: false,
    imageOnly: false,
    notesAr: "صفحة الشركة. كاروسيل من صورتين فأكثر.",
  },
  threads: {
    id: "threads",
    maxLength: 500,
    allowsThreadParts: true,
    allowsFirstComment: true,
    maxMedia: 10,
    requiresMedia: false,
    videoOnly: false,
    imageOnly: false,
    notesAr: "خيط ثريدز مع تأخير، وتعليق أول كرد.",
  },
  telegram: {
    id: "telegram",
    maxLength: 4096,
    allowsThreadParts: false,
    allowsFirstComment: true,
    maxMedia: 10,
    requiresMedia: false,
    videoOnly: false,
    imageOnly: false,
    notesAr: "رسالة ثم رد متأخر كتعليق أول.",
  },
  gmb: {
    id: "gmb",
    maxLength: 1500,
    allowsThreadParts: false,
    allowsFirstComment: false,
    maxMedia: 1,
    requiresMedia: false,
    videoOnly: false,
    imageOnly: true,
    notesAr: "تحديث / فعالية / عرض. صورة واحدة بلا فيديو.",
  },
  pinterest: {
    id: "pinterest",
    maxLength: 500,
    allowsThreadParts: false,
    allowsFirstComment: false,
    maxMedia: 5,
    requiresMedia: true,
    videoOnly: false,
    imageOnly: false,
    notesAr: "لوحة مطلوبة. فيديو يحتاج غلاف. بلا أجزاء إضافية.",
  },
};

export const DEFAULT_PROVIDER_RULE: ProviderRule = {
  id: "default",
  maxLength: 2200,
  allowsThreadParts: true,
  allowsFirstComment: true,
  maxMedia: 10,
  requiresMedia: false,
  videoOnly: false,
  imageOnly: false,
  notesAr: "قواعد عامة.",
};

export function ruleFor(provider: string): ProviderRule {
  return PROVIDER_RULES[provider] || DEFAULT_PROVIDER_RULE;
}

export function validateCaption(provider: string, caption: string): string | null {
  const rule = ruleFor(provider);
  if (caption.length > rule.maxLength) {
    return `تجاوز الحد (${caption.length}/${rule.maxLength}) على ${provider}.`;
  }
  return null;
}

export function validateMedia(provider: string, urls: string[]): string | null {
  const rule = ruleFor(provider);
  const kinds = urls.map((url) => classifyMediaUrl(url));
  if (rule.requiresMedia && urls.length === 0) {
    return `${provider} يتطلب وسائط.`;
  }
  if (urls.length > rule.maxMedia) {
    return `${provider} يقبل حتى ${rule.maxMedia} ملفات.`;
  }
  if (rule.videoOnly && kinds.some((kind) => kind !== "video" && kind !== "unknown")) {
    return `${provider} يقبل فيديو فقط.`;
  }
  if (rule.imageOnly && kinds.some((kind) => kind === "video")) {
    return `${provider} لا يدعم الفيديو.`;
  }
  if (provider === "pinterest") {
    const videos = kinds.filter((kind) => kind === "video").length;
    const images = kinds.filter((kind) => kind !== "video").length;
    if (videos > 0 && (videos > 1 || urls.length > 2 || images === 0)) {
      return "فيديو بنترست يحتاج ملفاً واحداً مع صورة غلاف.";
    }
  }
  if ((provider === "linkedin" || provider === "linkedin-page") && kinds.filter((k) => k === "video").length && urls.length > 1) {
    return "لينكدإن يقبل فيديو واحداً فقط في المنشور.";
  }
  return null;
}
