const THEME_MODE_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
] as const;

export const THEME_MODE_VALUES = THEME_MODE_OPTIONS.map((o) => o.value);
export type ThemeMode = (typeof THEME_MODE_VALUES)[number];
export type ResolvedThemeMode = "light" | "dark";

export const THEME_PRESET_OPTIONS = [
  {
    label: "Lonaliza Royal (الملكي الأرجواني والذهبي)",
    value: "lonaliza-royal",
    primary: {
      light: "#7c3aed",
      dark: "#a78bfa",
    },
    description: "الأرجواني الفاخر مع لمسات الذهب الملكي",
  },
  {
    label: "Emerald Luxury (الزمردي الإمبراطوري)",
    value: "emerald-luxury",
    primary: {
      light: "#059669",
      dark: "#10b981",
    },
    description: "الأخضر الزمردي الراقي مع إشعاع النعناع",
  },
  {
    label: "Midnight Navy (أزرق المحيط الليلي)",
    value: "midnight-navy",
    primary: {
      light: "#0284c7",
      dark: "#38bdf8",
    },
    description: "أزرق المحيط العميق مع درجات السيان المضيء",
  },
  {
    label: "Tangerine Sunset (البرتقالي الغروبي)",
    value: "tangerine",
    primary: {
      light: "#ea580c",
      dark: "#f97316",
    },
    description: "البرتقالي الحيوي المشرق مستوحى من الغروب",
  },
  {
    label: "Crimson Velvet (المخملي القرمزي)",
    value: "crimson-velvet",
    primary: {
      light: "#e11d48",
      dark: "#f43f5e",
    },
    description: "الياقوت القرمزي الفاخر مع لمسات روز متميزة",
  },
  {
    label: "Violet Elegance (الأرجواني المخملي العميق)",
    value: "violet-elegance",
    primary: {
      light: "#9333ea",
      dark: "#c084fc",
    },
    description: "البنفسجي الإمبراطوري المتدرج",
  },
  {
    label: "Brutalist Sharp (البروتالي عالي التباين)",
    value: "brutalist",
    primary: {
      light: "#000000",
      dark: "#ffffff",
    },
    description: "حواف حادة 0px وتباعد عالي التباين",
  },
  {
    label: "Soft Pop (الباستيل العصري المبهج)",
    value: "soft-pop",
    primary: {
      light: "#d946ef",
      dark: "#e879f9",
    },
    description: "ألوان الباستيل العصرية المبهجة مع حواف ناعمة",
  },
  {
    label: "Amber Gold (الذهبي الملكي الخالص)",
    value: "amber-gold",
    primary: {
      light: "#d97706",
      dark: "#f59e0b",
    },
    description: "الذهب الإمبراطوري الخالص والعنبر الدافئ",
  },
  {
    label: "Slate Executive (الرمادي التقني التنفيذي)",
    value: "slate-executive",
    primary: {
      light: "#334155",
      dark: "#94a3b8",
    },
    description: "رمادي الأعمال التقني المحايد والأنيق",
  },
  {
    label: "Cyberpunk Neon (السايبربانك النيون)",
    value: "cyberpunk-neon",
    primary: {
      light: "#0d9488",
      dark: "#14b8a6",
    },
    description: "التيل النيوني المستقبلي عالي التفاعل",
  },
  {
    label: "Rose Gold & Noir (روز جولد ونوار)",
    value: "rose-gold",
    primary: {
      light: "#be185d",
      dark: "#fb7185",
    },
    description: "الوردي الذهبي الفاخر مع الأسود الأبنوسي",
  },
  {
    label: "Default (الافتراضي)",
    value: "default",
    primary: {
      light: "#0f172a",
      dark: "#fafafa",
    },
    description: "النمط الكلاسيكي الافتراضي للوحة",
  },
] as const;

export const THEME_PRESET_VALUES = THEME_PRESET_OPTIONS.map((p) => p.value);

export type ThemePreset = (typeof THEME_PRESET_OPTIONS)[number]["value"];
