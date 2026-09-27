export type ModelTier = "flagship" | "balanced" | "free";

export type ModelProvider =
  | "anthropic"
  | "openai"
  | "deepseek"
  | "google"
  | "nvidia"
  | "meta"
  | "qwen"
  | "mistral"
  | "x-ai"
  | "other";

export interface OpenRouterModelInfo {
  id: string;
  name: string;
  provider: ModelProvider;
  tier: ModelTier;
  promptPricePerM: number; // Price per 1 Million prompt tokens in USD (0 for free)
  completionPricePerM: number; // Price per 1 Million completion tokens in USD (0 for free)
  contextLength: number;
  descriptionAr: string;
  recommendedFor: string;
  isFree: boolean;
}

/**
 * Curated live models as of 2026, categorized into 3 financial budget tiers:
 * 1. Flagship (فئة الفخامة القصوى - الرائدة)
 * 2. Balanced Value (الفئة المتوسطة المتوازنة - ذكاء فائق وتكلفة ضئيلة $0.10-$1.50/M)
 * 3. Free (الفئة المجانية 100% - صفر تكلفة)
 */
export const CURATED_OPENROUTER_MODELS: OpenRouterModelInfo[] = [
  // ----------------------------------------------------
  // 1. فئة الفخامة القصوى الرائدة (Flagship / Ultra-Premium Tier)
  // ----------------------------------------------------
  {
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    provider: "anthropic",
    tier: "flagship",
    promptPricePerM: 3.0,
    completionPricePerM: 15.0,
    contextLength: 200000,
    descriptionAr: "النموذج الأقوى عالمياً في السياحة والسرد الروائي والتخطيط الفاخر المنظم.",
    recommendedFor: "وكيل التخطيط والشات السياحي الفاخر (VIP Itineraries)",
    isFree: false,
  },
  {
    id: "anthropic/claude-opus-5",
    name: "Claude Opus 5",
    provider: "anthropic",
    tier: "flagship",
    promptPricePerM: 15.0,
    completionPricePerM: 75.0,
    contextLength: 200000,
    descriptionAr: "النموذج الأضخم عالمياً للمهام المعقدة والاستراتيجية والقرارات الحساسة.",
    recommendedFor: "التحليل الاستراتيجي العميق وإدارة العمليات الكبرى",
    isFree: false,
  },
  {
    id: "anthropic/claude-fable-5.1",
    name: "Claude Fable 5.1",
    provider: "anthropic",
    tier: "flagship",
    promptPricePerM: 4.5,
    completionPricePerM: 20.0,
    contextLength: 200000,
    descriptionAr: "متخصص في الصياغة التسويقية الساحرة والسرد القصصي العاطفي المؤثر.",
    recommendedFor: "وكيل النشر وصناعة محتوى الحملات والمقالات الفاخرة",
    isFree: false,
  },
  {
    id: "openai/gpt-6-astra-pro",
    name: "GPT-6 Astra Pro",
    provider: "openai",
    tier: "flagship",
    promptPricePerM: 5.0,
    completionPricePerM: 20.0,
    contextLength: 256000,
    descriptionAr: "الجيل السادس الرائد من OpenAI، قدرات استدلال استثنائية وسرعة معالجة عالية.",
    recommendedFor: "المهام المعقدة والتفاوض وحل المشكلات",
    isFree: false,
  },
  {
    id: "openai/gpt-6-astra",
    name: "GPT-6 Astra",
    provider: "openai",
    tier: "flagship",
    promptPricePerM: 2.5,
    completionPricePerM: 10.0,
    contextLength: 128000,
    descriptionAr: "الجيل السادس القياسي من OpenAI، ذكاء عام متقدم وتحليل دقيق.",
    recommendedFor: "تخطيط الرحلات واستشارات العملاء",
    isFree: false,
  },
  {
    id: "deepseek/deepseek-v4-pro-0813",
    name: "DeepSeek V4 Pro",
    provider: "deepseek",
    tier: "flagship",
    promptPricePerM: 2.0,
    completionPricePerM: 8.0,
    contextLength: 128000,
    descriptionAr: "الإصدار الاحترافي العميق من الجيل الرابع لديب سيك مع قدرات تفكير متطورة.",
    recommendedFor: "التخطيط البرمجي والتحليل المالي للباقات",
    isFree: false,
  },

  // ----------------------------------------------------
  // 2. الفئة المتوسطة الاقتصادية المتوازنة (Mid-Tier / Balanced Value Tier)
  // ----------------------------------------------------
  {
    id: "deepseek/deepseek-v4.1-flash",
    name: "DeepSeek V4.1 Flash",
    provider: "deepseek",
    tier: "balanced",
    promptPricePerM: 0.15,
    completionPricePerM: 0.6,
    contextLength: 128000,
    descriptionAr: "خارق السرعة والذكاء، يقدم أداءً يضاهي النماذج الرائدة بتكلفة 15 سنتاً فقط لكل مليون توكن!",
    recommendedFor: "وكيل المبيعات وخدمة العملاء السريعة وتوفير التكلفة القصوى",
    isFree: false,
  },
  {
    id: "openai/gpt-5.6-luna",
    name: "GPT-5.6 Luna",
    provider: "openai",
    tier: "balanced",
    promptPricePerM: 0.2,
    completionPricePerM: 0.8,
    contextLength: 128000,
    descriptionAr: "نموذج دردشة فائق السرعة من OpenAI بتكلفة 20 سنتاً فقط لكل مليون توكن.",
    recommendedFor: "محادثات الشات الفورية ودعم العملاء 24/7",
    isFree: false,
  },
  {
    id: "google/gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    provider: "google",
    tier: "balanced",
    promptPricePerM: 0.75,
    completionPricePerM: 3.0,
    contextLength: 1000000,
    descriptionAr: "الجيل 3.8 الأحدث من جوجل، نافذة سياق ضخمة (مليون توكن) مع استدعاء دقيق للأماكن الحية.",
    recommendedFor: "وكيل التخطيط السياحي والشات المدمج",
    isFree: false,
  },
  {
    id: "google/gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    provider: "google",
    tier: "balanced",
    promptPricePerM: 0.1,
    completionPricePerM: 0.4,
    contextLength: 500000,
    descriptionAr: "فائق الاقتصادية والسرعة من جوجل، مثالي للمهام التكرارية وتلخيص البيانات.",
    recommendedFor: "فرز البيانات والتحقق والتصنيف",
    isFree: false,
  },
  {
    id: "qwen/qwen3.8-flash",
    name: "Qwen 3.8 Flash",
    provider: "qwen",
    tier: "balanced",
    promptPricePerM: 0.15,
    completionPricePerM: 0.6,
    contextLength: 128000,
    descriptionAr: "نموذج فلاش متعدد اللغات قوي جداً في اللغة العربية بتكلفة 15 سنتاً فقط.",
    recommendedFor: "المحادثات العربية والترجمة السياحية",
    isFree: false,
  },
  {
    id: "z-ai/glm-5.3-flash",
    name: "GLM 5.3 Flash",
    provider: "other",
    tier: "balanced",
    promptPricePerM: 0.15,
    completionPricePerM: 0.6,
    contextLength: 128000,
    descriptionAr: "أداء متميز في التلخيص وتنسيق الجداول ومطابقة العروض.",
    recommendedFor: "تنسيق عروض الأسعار السريعة",
    isFree: false,
  },
  {
    id: "xiaomi/mimo-v2.6-pro",
    name: "MiMo V2.6 Pro",
    provider: "other",
    tier: "balanced",
    promptPricePerM: 0.435,
    completionPricePerM: 1.5,
    contextLength: 128000,
    descriptionAr: "نموذج متوازن يجمع بين القوة والتوفير الاقتصادي.",
    recommendedFor: "استفسارات تطبيق الجوال",
    isFree: false,
  },
  {
    id: "x-ai/grok-4.7",
    name: "Grok 4.7",
    provider: "x-ai",
    tier: "balanced",
    promptPricePerM: 1.6,
    completionPricePerM: 6.0,
    contextLength: 128000,
    descriptionAr: "حوار طبيعي متقدم وسرعة بديهة في فهم رغبات المسافرين.",
    recommendedFor: "الردود التفاعلية والدردشة الذكية",
    isFree: false,
  },

  // ----------------------------------------------------
  // 3. الفئة المجانية 100% (Zero-Cost / Free Tier)
  // ----------------------------------------------------
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "NVIDIA Nemotron 3 Ultra (Free)",
    provider: "nvidia",
    tier: "free",
    promptPricePerM: 0,
    completionPricePerM: 0,
    contextLength: 128000,
    descriptionAr: "نموذج عملاق فائق بـ 550 مليار بارامتر مجاني 100% بدون أي تكلفة مالية!",
    recommendedFor: "الشركات التي تريد أداءً عملاقاً بصفر تكلفة",
    isFree: true,
  },
  {
    id: "google/gemma-4-31b-it:free",
    name: "Google Gemma 4 31B (Free)",
    provider: "google",
    tier: "free",
    promptPricePerM: 0,
    completionPricePerM: 0,
    contextLength: 64000,
    descriptionAr: "الجيل الرابع من نماذج جوجل المفتوحة المجانية، ممتاز في المنطق والمحادثة.",
    recommendedFor: "الخدمات المجانية ودعم العملاء الاقتصادي",
    isFree: true,
  },
  {
    id: "qwen/qwen3.8-27b:free",
    name: "Qwen 3.8 27B (Free)",
    provider: "qwen",
    tier: "free",
    promptPricePerM: 0,
    completionPricePerM: 0,
    contextLength: 64000,
    descriptionAr: "نموذج مجاني متميز جداً في اللغة العربية والفهم السياقي.",
    recommendedFor: "الدردشة العربية المجانية",
    isFree: true,
  },
  {
    id: "z-ai/glm-5.2:free",
    name: "GLM 5.2 (Free)",
    provider: "other",
    tier: "free",
    promptPricePerM: 0,
    completionPricePerM: 0,
    contextLength: 64000,
    descriptionAr: "نموذج مجاني سريع للمحادثات الأساسية والردود الفورية.",
    recommendedFor: "المهام السريعة والاحتياطية",
    isFree: true,
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "Nemotron 3.5 Lightning (Free)",
    provider: "nvidia",
    tier: "free",
    promptPricePerM: 0,
    completionPricePerM: 0,
    contextLength: 64000,
    descriptionAr: "نموذج إنفيديا فائق السرعة مجاناً للمهام الخفيفة والمتزامنة.",
    recommendedFor: "الردود السريعة المتزامنة",
    isFree: true,
  },
  {
    id: "openrouter/free",
    name: "OpenRouter Smart Free Router",
    provider: "other",
    tier: "free",
    promptPricePerM: 0,
    completionPricePerM: 0,
    contextLength: 64000,
    descriptionAr: "الموجه الذكي من OpenRouter الذي يوزع الطلبات آلياً على أفضل النماذج المجانية المتاحة.",
    recommendedFor: "الاحتياطي المجاني التلقائي (Emergency Fallback)",
    isFree: true,
  },
];

export interface FallbackCascadeConfig {
  tier1: string; // Primary
  tier2: string; // Secondary
  tier3: string; // Tertiary
  tier4: string; // Emergency Free
  enabled: boolean;
}

export const DEFAULT_FALLBACK_CASCADE: FallbackCascadeConfig = {
  tier1: "anthropic/claude-sonnet-5",
  tier2: "deepseek/deepseek-v4.1-flash",
  tier3: "nvidia/nemotron-3-ultra-550b-a55b:free",
  tier4: "openrouter/free",
  enabled: true,
};

export interface AgentModelAssignments {
  planner_concierge?: string; // Chat & Trip Planner
  sales?: string; // Sales Agent
  social?: string; // Publishing & Content
  app_concierge?: string; // Mobile App Assistant
  b2b_landing?: string; // B2B Growth Agent
  ads?: string; // Ads Manager
  email?: string; // Email Marketing
}

export const DEFAULT_AGENT_MODELS: AgentModelAssignments = {
  planner_concierge: "anthropic/claude-sonnet-5",
  sales: "deepseek/deepseek-v4.1-flash",
  social: "anthropic/claude-fable-5.1",
  app_concierge: "openai/gpt-5.6-luna",
  b2b_landing: "deepseek/deepseek-v4.1-flash",
  ads: "deepseek/deepseek-v4.1-flash",
  email: "google/gemini-3.8-flash",
};
