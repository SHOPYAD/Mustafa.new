/**
 * Admin Theme Engine - Multi-Preset Royal System
 * Supports 15 Luxury Brand Themes, 50+ Modern Fonts & Light/Dark modes.
 */

import {
  type FontDefinition,
  readStoredAdminFont,
  persistAdminFont,
  applyAdminFont,
  getFontDefinition,
} from "@/lib/theme/fonts-catalog";

export type AdminThemePreset =
  | "royal-luxury"
  | "midnight-executive"
  | "emerald-prestige"
  | "warm-amber"
  | "oxford-navy"
  | "sapphire-executive"
  | "obsidian-gold"
  | "nordic-frost"
  | "rose-quartz"
  | "cyber-neon"
  | "terracotta-sunset"
  | "midnight-velvet"
  | "monochrome-titanium"
  | "bordeaux-prestige"
  | "forest-moss";

export type AdminThemeMode = "light" | "dark";

export interface AdminThemeConfig {
  preset: AdminThemePreset;
  mode: AdminThemeMode;
  fontFamily?: string;
}

export interface ThemePresetMeta {
  id: AdminThemePreset;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  previewBgLight: string;
  previewBgDark: string;
}

export const ADMIN_THEME_PRESETS: ThemePresetMeta[] = [
  {
    id: "royal-luxury",
    nameAr: "الملكي الفاخر (لوناليزا)",
    nameEn: "Royal Luxury",
    descriptionAr: "البنفسجي الملكي والكهرماني الذهبي المتألق",
    primaryColor: "#6d28d9",
    secondaryColor: "#f5b82e",
    accentColor: "#d97706",
    previewBgLight: "#faf7fd",
    previewBgDark: "#0c0617",
  },
  {
    id: "midnight-executive",
    nameAr: "سليت تنفيذي فخم",
    nameEn: "Midnight Executive",
    descriptionAr: "الكحلي العميق والسليت الهادئ مع أزرق إلكتريك",
    primaryColor: "#0284c7",
    secondaryColor: "#0ea5e9",
    accentColor: "#38bdf8",
    previewBgLight: "#f8fafc",
    previewBgDark: "#070c14",
  },
  {
    id: "emerald-prestige",
    nameAr: "الزمردي الإمبراطوري",
    nameEn: "Imperial Emerald",
    descriptionAr: "الأخضر الزمردي الراقي مع ذهبي شامبين",
    primaryColor: "#059669",
    secondaryColor: "#d97706",
    accentColor: "#10b981",
    previewBgLight: "#f0fdf4",
    previewBgDark: "#021a14",
  },
  {
    id: "warm-amber",
    nameAr: "الكهرماني والياقوتي الدافئ",
    nameEn: "Warm Amber & Ruby",
    descriptionAr: "الماهوجني الدافئ والكهرماني مع لمسة ياقوتية",
    primaryColor: "#d97706",
    secondaryColor: "#e11d48",
    accentColor: "#f59e0b",
    previewBgLight: "#fffbeb",
    previewBgDark: "#180b03",
  },
  {
    id: "oxford-navy",
    nameAr: "أكسفورد الكحلي والذهب الصافي",
    nameEn: "Oxford Midnight & Pure Gold",
    descriptionAr: "الكحلي البحري المهيب مع ذهب ملكي نقي وأزرق ملكي",
    primaryColor: "#1d4ed8",
    secondaryColor: "#ca8a04",
    accentColor: "#eab308",
    previewBgLight: "#f0f4f9",
    previewBgDark: "#050d18",
  },
  {
    id: "sapphire-executive",
    nameAr: "الياقوت الأزرق والبلاتين",
    nameEn: "Sapphire Platinum",
    descriptionAr: "أزرق سافاير الملوكي مع لمسات بلاتينية فاخرة لمديري العمليات",
    primaryColor: "#1d4ed8",
    secondaryColor: "#64748b",
    accentColor: "#3b82f6",
    previewBgLight: "#f3f7fd",
    previewBgDark: "#050d1e",
  },
  {
    id: "obsidian-gold",
    nameAr: "الأوبسيديان الملكي والذهب النقي",
    nameEn: "Obsidian & 24K Gold",
    descriptionAr: "الأسود الأوبسيدياني الملكي فائق التباين مع ذهب أصيل 24 قيراط",
    primaryColor: "#1c1917",
    secondaryColor: "#d97706",
    accentColor: "#facc15",
    previewBgLight: "#fcfbf7",
    previewBgDark: "#080706",
  },
  {
    id: "nordic-frost",
    nameAr: "الصقيع الإسكندنافي والفضة",
    nameEn: "Nordic Frost & Silver",
    descriptionAr: "الرمادي القطبي المنعش مع الفضة النقية لراحة بصرية تدوم طويلاً",
    primaryColor: "#0e7490",
    secondaryColor: "#64748b",
    accentColor: "#22d3ee",
    previewBgLight: "#f4f7f8",
    previewBgDark: "#091015",
  },
  {
    id: "rose-quartz",
    nameAr: "الروز كوارتز الفاخر والنبيذي",
    nameEn: "Rose Quartz & Bordeaux",
    descriptionAr: "الوردي الأرستقراطي الراقي والياقوتي العنابي للفنادق البوتيك",
    primaryColor: "#be123c",
    secondaryColor: "#fb7185",
    accentColor: "#f43f5e",
    previewBgLight: "#fdf8f9",
    previewBgDark: "#15060c",
  },
  {
    id: "cyber-neon",
    nameAr: "السايبر نيون البنفسجي والتيل",
    nameEn: "Cyber Neon & Electric Teal",
    descriptionAr: "ألوان النيون الرقمية الحادة مستوحاة من منصات الـ SaaS الأكثر جرأة",
    primaryColor: "#4f46e5",
    secondaryColor: "#06b6d4",
    accentColor: "#818cf8",
    previewBgLight: "#f6f8fb",
    previewBgDark: "#080714",
  },
  {
    id: "terracotta-sunset",
    nameAr: "غروب التراكوتا والنحاس الفاخر",
    nameEn: "Tuscan Terracotta",
    descriptionAr: "التراكوتا الإيطالي الدافئ مع النحاس المصقول للباقات الصيفية",
    primaryColor: "#c2410c",
    secondaryColor: "#d97706",
    accentColor: "#ea580c",
    previewBgLight: "#faf6f4",
    previewBgDark: "#160905",
  },
  {
    id: "midnight-velvet",
    nameAr: "المخمل الليلي والأميثست",
    nameEn: "Midnight Velvet & Amethyst",
    descriptionAr: "الظلال الليلية المخملية مع جوهر الأميثست الأرجواني الثري",
    primaryColor: "#7e22ce",
    secondaryColor: "#a855f7",
    accentColor: "#c084fc",
    previewBgLight: "#f7f5fa",
    previewBgDark: "#090412",
  },
  {
    id: "monochrome-titanium",
    nameAr: "التيتانيوم والغرافيت الأحادي",
    nameEn: "Titanium Monochrome",
    descriptionAr: "الغرافيت والتيتانيوم أحادي اللون عالي التباين (Linear / Vercel)",
    primaryColor: "#111827",
    secondaryColor: "#374151",
    accentColor: "#ffffff",
    previewBgLight: "#f9fafb",
    previewBgDark: "#000000",
  },
  {
    id: "bordeaux-prestige",
    nameAr: "البوردو العتيق والبرونز الملكي",
    nameEn: "Bordeaux & Royal Bronze",
    descriptionAr: "العنابي البوردو الأرستقراطي مع البرونز الملكي للرحلات الخاصة",
    primaryColor: "#881337",
    secondaryColor: "#b45309",
    accentColor: "#f43f5e",
    previewBgLight: "#faf5f6",
    previewBgDark: "#120408",
  },
  {
    id: "forest-moss",
    nameAr: "غابات الصنوبر والذهب الهادئ",
    nameEn: "Forest Moss & Gold",
    descriptionAr: "أخضر أشجار الصنوبر في طرابزون وأوزنجول مع ومضات الذهب الهادئ",
    primaryColor: "#166534",
    secondaryColor: "#d97706",
    accentColor: "#22c55e",
    previewBgLight: "#f3f7f4",
    previewBgDark: "#040d07",
  },
];

export const THEME_CONFIG_KEY = "lonaliza_admin_theme_config";
export const LEGACY_THEME_KEY = "lonaliza_admin_theme";

export const VALID_PRESETS: AdminThemePreset[] = ADMIN_THEME_PRESETS.map((p) => p.id);

export function readStoredThemeConfig(): AdminThemeConfig {
  const defaultFont = readStoredAdminFont();
  if (typeof window === "undefined") {
    return { preset: "royal-luxury", mode: "light", fontFamily: defaultFont };
  }
  try {
    const raw = localStorage.getItem(THEME_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminThemeConfig>;
      const preset = VALID_PRESETS.includes(parsed.preset as AdminThemePreset)
        ? (parsed.preset as AdminThemePreset)
        : "royal-luxury";
      const mode = parsed.mode === "dark" ? "dark" : "light";
      const fontFamily = parsed.fontFamily || defaultFont;
      return { preset, mode, fontFamily };
    }
    // Fallback to legacy theme key
    const legacy = localStorage.getItem(LEGACY_THEME_KEY);
    if (legacy === "dark" || legacy === "light") {
      return { preset: "royal-luxury", mode: legacy, fontFamily: defaultFont };
    }
  } catch {
    /* ignore */
  }
  return { preset: "royal-luxury", mode: "light", fontFamily: defaultFont };
}

export function applyAdminThemeConfig(config: AdminThemeConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.dataset.adminThemePreset = config.preset;
  root.dataset.adminThemeMode = config.mode;
  root.dataset.adminTheme = config.mode; // Backwards compatibility for existing layout rules

  root.classList.toggle("dark", config.mode === "dark");
  root.style.colorScheme = config.mode;

  if (config.fontFamily) {
    applyAdminFont(config.fontFamily);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lonaliza:admin-theme-change", { detail: config }));
  }
}

export function persistThemeConfig(config: AdminThemeConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify(config));
    localStorage.setItem(LEGACY_THEME_KEY, config.mode);
    if (config.fontFamily) {
      persistAdminFont(config.fontFamily);
    }
  } catch {
    /* ignore */
  }
}

// Backwards compatibility functions for existing callers
export function readStoredAdminTheme(): "light" | "dark" {
  return readStoredThemeConfig().mode;
}

export function applyAdminTheme(mode: "light" | "dark") {
  const current = readStoredThemeConfig();
  applyAdminThemeConfig({ ...current, mode });
}

export function persistAdminTheme(mode: "light" | "dark") {
  const current = readStoredThemeConfig();
  persistThemeConfig({ ...current, mode });
}

export function clearAdminTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  delete root.dataset.adminTheme;
  delete root.dataset.adminThemePreset;
  delete root.dataset.adminThemeMode;
  delete root.dataset.adminFont;
  root.classList.remove("dark");
  root.style.colorScheme = "";
}
