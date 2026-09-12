import type { BrandColors } from "@/types/branding";
import {
  DEFAULT_ARABIC_FONT_ID,
  getArabicFontById,
} from "@/lib/fonts/arabic-catalog";
import {
  DEFAULT_LATIN_FONT_ID,
  latinFontStack,
} from "@/lib/fonts/latin-catalog";

export const BRAND_THEME_VERSION = 2;
export const BRAND_THEME_UPDATED_EVENT = "alrayyan:brand-theme-updated";
export const BRAND_THEME_REV_KEY = "alrayyan:brand-theme-rev";
export const FACTORY_PRESET_ID = "alrayyan-default";

export type ImageTreatment = "none" | "rounded" | "shadow" | "lift" | "film";

export type ThemeRadius = {
  button: string;
  card: string;
  input: string;
};

export type ThemeBorder = {
  width: string;
  color: string;
};

export type ThemeImage = {
  treatment: ImageTreatment;
  radius: string;
};

/** Full chrome a theme may restyle. One schema — public site reads these tokens only. */
export type ThemeChrome = {
  pageBg: string;
  sectionBg: string;
  cardBg: string;
  headerBg: string;
  footerBg: string;
  overlayBg: string;
  textHeading: string;
  textBody: string;
  textMuted: string;
  textInverse: string;
  textLink: string;
  primary: string;
  secondary: string;
  success: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  buttonHoverBg: string;
  buttonHoverText: string;
  buttonActiveBg: string;
  buttonDisabledBg: string;
  buttonDisabledText: string;
  buttonRadius: string;
  buttonShadow: string;
  cardHoverBg: string;
  cardHoverShadow: string;
  navHover: string;
  chipHover: string;
  borderColor: string;
  borderWidth: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radiusCard: string;
  radiusInput: string;
  headerGlass: string;
  cardGlass: string;
  searchGlass: string;
  focusRing: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  inputBg: string;
  inputText: string;
  inputBorder: string;
  inputPlaceholder: string;
  tabActiveBg: string;
  tabActiveText: string;
  tabIdleBg: string;
  tabIdleText: string;
  badgeBg: string;
  badgeText: string;
  iconChrome: string;
};

export type BrandTheme = {
  version: number;
  updatedAt: string;
  presetId: string;
  colors: BrandColors;
  radius: ThemeRadius;
  border: ThemeBorder;
  image: ThemeImage;
  /** Catalog id from `src/lib/fonts/arabic-catalog.ts`. */
  arabicFontId: string;
  /** Catalog id from `src/lib/fonts/latin-catalog.ts`. */
  latinFontId: string;
  chrome: ThemeChrome;
};

export function notifyBrandTheme(theme: BrandTheme) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BRAND_THEME_UPDATED_EVENT, { detail: theme }));
  try {
    localStorage.setItem(BRAND_THEME_REV_KEY, String(Date.now()));
  } catch {
    /* private mode */
  }
  document.querySelectorAll("iframe").forEach((frame) => {
    try {
      frame.contentWindow?.postMessage(
        { type: "themeUpdate", brandTheme: theme },
        window.location.origin
      );
    } catch {
      /* detached */
    }
  });
}

export type ThemePreset = {
  id: string;
  nameAr: string;
  nameEn: string;
  nameTr: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionTr: string;
  theme: Omit<BrandTheme, "version" | "updatedAt" | "presetId">;
};

export function imageTreatmentVars(treatment: ImageTreatment): {
  shadow: string;
  filter: string;
} {
  switch (treatment) {
    case "none":
      return { shadow: "none", filter: "none" };
    case "rounded":
      return { shadow: "none", filter: "none" };
    case "shadow":
      return {
        shadow: "0 12px 28px rgba(15, 23, 42, 0.16)",
        filter: "none",
      };
    case "lift":
      return {
        shadow: "0 18px 40px rgba(15, 23, 42, 0.2)",
        filter: "none",
      };
    case "film":
      return {
        shadow: "0 10px 24px rgba(15, 23, 42, 0.14)",
        filter: "contrast(1.06) saturate(0.92)",
      };
    default: {
      const _never: never = treatment;
      return _never;
    }
  }
}

/** Lonaliza default — royal purple / luxury violet. */
export const FACTORY_CHROME: ThemeChrome = {
  pageBg: "#f7f4fc",
  sectionBg: "#ece4f7",
  cardBg: "#fdfbff",
  headerBg: "#2e1065",
  footerBg: "#2e1065",
  overlayBg: "rgba(46, 16, 101, 0.55)",
  textHeading: "#2e1065",
  textBody: "#3b2466",
  textMuted: "#6b5280",
  textInverse: "#f5f3ff",
  textLink: "#6d28d9",
  primary: "#7c3aed",
  secondary: "#c4b5fd",
  success: "#d97706",
  buttonBg: "#2e1065",
  buttonText: "#ffffff",
  buttonBorder: "transparent",
  buttonHoverBg: "#3b0764",
  buttonHoverText: "#ffffff",
  buttonActiveBg: "#4c1d95",
  buttonDisabledBg: "#94a3b8",
  buttonDisabledText: "#f8fafc",
  buttonRadius: "0.5rem",
  buttonShadow: "0 14px 28px -10px rgba(46, 16, 101, 0.35)",
  cardHoverBg: "#fdfbff",
  cardHoverShadow: "0 24px 48px -16px rgba(46, 16, 101, 0.36)",
  navHover: "rgba(196, 181, 253, 0.16)",
  chipHover: "rgba(15, 23, 42, 0.06)",
  borderColor: "#ddd6fe",
  borderWidth: "1px",
  radiusSm: "0.25rem",
  radiusMd: "0.5rem",
  radiusLg: "0.75rem",
  radiusXl: "1.25rem",
  radiusCard: "0.75rem",
  radiusInput: "0.5rem",
  headerGlass: "rgba(46, 16, 101, 0.94)",
  cardGlass: "rgba(253, 251, 255, 0.92)",
  searchGlass: "rgba(253, 251, 255, 0.95)",
  focusRing: "#7c3aed",
  shadowSm: "0 8px 18px -10px rgba(46, 16, 101, 0.28)",
  shadowMd: "0 16px 36px rgba(46, 16, 101, 0.28)",
  shadowLg: "0 28px 56px -16px rgba(46, 16, 101, 0.42)",
  inputBg: "#fdfbff",
  inputText: "#2e1065",
  inputBorder: "#ddd6fe",
  inputPlaceholder: "#a78bb8",
  tabActiveBg: "#2e1065",
  tabActiveText: "#ffffff",
  tabIdleBg: "transparent",
  tabIdleText: "#1e1b4b",
  badgeBg: "#ede9fe",
  badgeText: "#5b21b6",
  iconChrome: "#1e1b4b",
};

export function colorsFromChrome(chrome: ThemeChrome): BrandColors {
  const accentColor = chrome.textHeading || chrome.footerBg || "#2e1065";
  return {
    primary: chrome.primary,
    secondary: chrome.sectionBg,
    accent: accentColor === "#ffffff" ? "#2e1065" : accentColor,
    header: chrome.headerBg,
    footer: chrome.footerBg,
    button: chrome.buttonBg,
    whatsapp: "",
  };
}

export function radiusFromChrome(chrome: ThemeChrome): ThemeRadius {
  return {
    button: chrome.buttonRadius,
    card: chrome.radiusCard,
    input: chrome.radiusInput,
  };
}

export function borderFromChrome(chrome: ThemeChrome): ThemeBorder {
  return {
    width: chrome.borderWidth,
    color: chrome.borderColor,
  };
}

export function factoryTheme(): BrandTheme {
  return {
    version: BRAND_THEME_VERSION,
    updatedAt: "",
    presetId: FACTORY_PRESET_ID,
    colors: colorsFromChrome(FACTORY_CHROME),
    radius: radiusFromChrome(FACTORY_CHROME),
    border: borderFromChrome(FACTORY_CHROME),
    image: { treatment: "rounded", radius: FACTORY_CHROME.radiusCard },
    arabicFontId: DEFAULT_ARABIC_FONT_ID,
    latinFontId: DEFAULT_LATIN_FONT_ID,
    chrome: { ...FACTORY_CHROME },
  };
}

export function themeToCssVars(theme: BrandTheme): Record<string, string> {
  const chrome = theme.chrome || FACTORY_CHROME;
  const image = imageTreatmentVars(theme.image.treatment);
  const accentResolved =
    theme.colors?.accent && theme.colors.accent !== "#ffffff"
      ? theme.colors.accent
      : chrome.textHeading && chrome.textHeading !== "#ffffff"
      ? chrome.textHeading
      : "#2e1065";
  const vars: Record<string, string> = {
    "--brand-primary": chrome.primary,
    "--brand-secondary": chrome.secondary,
    "--brand-accent": accentResolved,
    "--brand-header": chrome.headerBg,
    "--brand-footer": chrome.footerBg,
    "--brand-button": chrome.buttonBg,
    "--brand-success": chrome.success,
    "--brand-gold": "#d97706",
    "--primary": chrome.primary,
    "--accent": accentResolved,
    "--navy": "#1e1b4b",
    "--heading": chrome.textHeading,
    "--radius-button": chrome.buttonRadius,
    "--radius-card": chrome.radiusCard,
    "--radius-input": chrome.radiusInput,
    "--radius-sm": chrome.radiusSm,
    "--radius-md": chrome.radiusMd,
    "--radius-lg": chrome.radiusLg,
    "--radius-xl": chrome.radiusXl,
    "--theme-border-width": chrome.borderWidth,
    "--theme-border-color": chrome.borderColor,
    "--image-radius": theme.image.radius,
    "--image-shadow": image.shadow,
    "--image-filter": image.filter,
    "--theme-page-bg": chrome.pageBg,
    "--theme-section-bg": chrome.sectionBg,
    "--theme-card-bg": chrome.cardBg,
    "--theme-overlay": chrome.overlayBg,
    "--theme-text-heading": chrome.textHeading,
    "--theme-text-body": chrome.textBody,
    "--theme-text-muted": chrome.textMuted,
    "--theme-text-inverse": chrome.textInverse,
    "--theme-text-link": chrome.textLink,
    "--theme-btn-text": chrome.buttonText,
    "--theme-btn-border": chrome.buttonBorder,
    "--theme-btn-hover-bg": chrome.buttonHoverBg,
    "--theme-btn-hover-text": chrome.buttonHoverText,
    "--theme-btn-active-bg": chrome.buttonActiveBg,
    "--theme-btn-disabled-bg": chrome.buttonDisabledBg,
    "--theme-btn-disabled-text": chrome.buttonDisabledText,
    "--theme-btn-shadow": chrome.buttonShadow,
    "--theme-card-hover-bg": chrome.cardHoverBg,
    "--theme-card-hover-shadow": chrome.cardHoverShadow,
    "--theme-nav-hover": chrome.navHover,
    "--theme-chip-hover": chrome.chipHover,
    "--theme-header-glass": chrome.headerGlass,
    "--theme-card-glass": chrome.cardGlass,
    "--theme-search-glass": chrome.searchGlass,
    "--theme-focus-ring": chrome.focusRing,
    "--theme-shadow-sm": chrome.shadowSm,
    "--theme-shadow-md": chrome.shadowMd,
    "--theme-shadow-lg": chrome.shadowLg,
    "--theme-input-bg": chrome.inputBg,
    "--theme-input-text": chrome.inputText,
    "--theme-input-border": chrome.inputBorder,
    "--theme-input-placeholder": chrome.inputPlaceholder,
    "--theme-tab-active-bg": chrome.tabActiveBg,
    "--theme-tab-active-text": chrome.tabActiveText,
    "--theme-tab-idle-bg": chrome.tabIdleBg,
    "--theme-tab-idle-text": chrome.tabIdleText,
    "--theme-badge-bg": chrome.badgeBg,
    "--theme-badge-text": chrome.badgeText,
    "--theme-icon-chrome": chrome.iconChrome,
    "--background": chrome.pageBg,
    "--foreground": chrome.textBody,
    "--card": chrome.cardBg,
    "--muted": chrome.sectionBg,
    "--muted-foreground": chrome.textMuted,
    "--ring": chrome.focusRing,
  };
  const arabicId = theme.arabicFontId || DEFAULT_ARABIC_FONT_ID;
  if (arabicId !== DEFAULT_ARABIC_FONT_ID) {
    const font = getArabicFontById(arabicId);
    vars["--font-ar"] = font.googleFamily.includes(" ")
      ? `'${font.googleFamily}'`
      : font.googleFamily;
  }
  const latinId = theme.latinFontId || DEFAULT_LATIN_FONT_ID;
  if (latinId !== DEFAULT_LATIN_FONT_ID) {
    vars["--font-latin"] = latinFontStack(latinId);
  }
  return vars;
}

export function themeToCssText(theme: BrandTheme): string {
  const vars = themeToCssVars(theme);
  const body = Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
  return `:root { ${body} } html { ${body} }`;
}

const APPLIED_VAR_KEYS = [
  "--brand-primary",
  "--brand-secondary",
  "--brand-accent",
  "--brand-header",
  "--brand-footer",
  "--brand-button",
  "--brand-success",
  "--brand-gold",
  "--primary",
  "--accent",
  "--navy",
  "--heading",
  "--radius-button",
  "--radius-card",
  "--radius-input",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--theme-border-width",
  "--theme-border-color",
  "--image-radius",
  "--image-shadow",
  "--image-filter",
  "--theme-page-bg",
  "--theme-section-bg",
  "--theme-card-bg",
  "--theme-overlay",
  "--theme-text-heading",
  "--theme-text-body",
  "--theme-text-muted",
  "--theme-text-inverse",
  "--theme-text-link",
  "--theme-btn-text",
  "--theme-btn-border",
  "--theme-btn-hover-bg",
  "--theme-btn-hover-text",
  "--theme-btn-active-bg",
  "--theme-btn-disabled-bg",
  "--theme-btn-disabled-text",
  "--theme-btn-shadow",
  "--theme-card-hover-bg",
  "--theme-card-hover-shadow",
  "--theme-nav-hover",
  "--theme-chip-hover",
  "--theme-header-glass",
  "--theme-card-glass",
  "--theme-search-glass",
  "--theme-focus-ring",
  "--theme-shadow-sm",
  "--theme-shadow-md",
  "--theme-shadow-lg",
  "--theme-input-bg",
  "--theme-input-text",
  "--theme-input-border",
  "--theme-input-placeholder",
  "--theme-tab-active-bg",
  "--theme-tab-active-text",
  "--theme-tab-idle-bg",
  "--theme-tab-idle-text",
  "--theme-badge-bg",
  "--theme-badge-text",
  "--theme-icon-chrome",
  "--background",
  "--foreground",
  "--card",
  "--muted",
  "--muted-foreground",
  "--ring",
  "--font-ar",
  "--font-latin",
] as const;

export function applyBrandTheme(theme: BrandTheme, root: HTMLElement = document.documentElement) {
  const vars = themeToCssVars(theme);
  const isDark =
    root.classList.contains("dark") ||
    root.dataset.siteTheme === "dark" ||
    root.dataset.adminTheme === "dark";

  const darkOverrides: Record<string, string> = {
    "--theme-page-bg": "#07090e",
    "--theme-section-bg": "#0d121e",
    "--theme-card-bg": "#111827",
    "--theme-text-heading": "#f8fafc",
    "--theme-text-body": "#cbd5e1",
    "--theme-text-muted": "#94a3b8",
    "--theme-border-color": "rgba(255, 255, 255, 0.12)",
    "--background": "#07090e",
    "--foreground": "#cbd5e1",
    "--card": "#111827",
    "--muted": "#0d121e",
    "--muted-foreground": "#94a3b8",
    "--border": "rgba(255, 255, 255, 0.12)",
    "--theme-header-glass": "rgba(7, 9, 14, 0.94)",
    "--theme-card-glass": "rgba(17, 24, 39, 0.9)",
    "--theme-search-glass": "rgba(17, 24, 39, 0.95)",
    "--theme-input-bg": "#0d121e",
    "--theme-input-text": "#f8fafc",
    "--theme-input-border": "rgba(255, 255, 255, 0.16)",
    "--brand-header": "#07090e",
    "--brand-footer": "#07090e",
  };

  for (const key of APPLIED_VAR_KEYS) {
    if (isDark && darkOverrides[key]) {
      root.style.setProperty(key, darkOverrides[key]);
    } else if (vars[key]) {
      root.style.setProperty(key, vars[key]);
    } else {
      root.style.removeProperty(key);
    }
  }

  const arabicId = theme.arabicFontId || DEFAULT_ARABIC_FONT_ID;
  if (arabicId === DEFAULT_ARABIC_FONT_ID) {
    root.style.removeProperty("--font-ar");
  }
  const latinId = theme.latinFontId || DEFAULT_LATIN_FONT_ID;
  if (latinId === DEFAULT_LATIN_FONT_ID) {
    root.style.removeProperty("--font-latin");
  }
  root.dataset.themePreset = theme.presetId;
  root.dataset.imageTreatment = theme.image.treatment;
  root.dataset.arabicFont = arabicId;
  root.dataset.latinFont = latinId;
  const whatsapp = theme.colors.whatsapp.trim() || "#22c55e";
  root.style.setProperty("--brand-whatsapp", whatsapp);
}
