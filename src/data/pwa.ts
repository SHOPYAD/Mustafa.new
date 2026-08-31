/**
 * PWA settings — persisted in `.data/pwa.json`.
 * Brand defaults from Alrayyan navy / teal tokens.
 */

export const PWA_VERSION = 1;
export const PWA_UPDATED_EVENT = "alrayyan:pwa-updated";

export const PWA_DEFAULT_THEME_COLOR = "#051741";
export const PWA_DEFAULT_BACKGROUND_COLOR = "#051741";

export const PWA_FALLBACK_ICON_192 = "/logo.png";
export const PWA_FALLBACK_ICON_512 = "/logo.png";
export const PWA_FALLBACK_APPLE_TOUCH = "/apple-touch-icon.png";

export type PwaSettings = {
  version: number;
  updatedAt: string | null;
  enabledPublic: boolean;
  enabledAdmin: boolean;
  showBanner: boolean;
  nameAr: string;
  nameEn: string;
  nameTr: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
  icon192: string;
  icon512: string;
  appleTouchIcon: string;
};

export type PwaPatch = Partial<
  Omit<PwaSettings, "version" | "updatedAt">
>;

export type PwaPublicConfig = {
  enabledPublic: boolean;
  enabledAdmin: boolean;
  showBanner: boolean;
  nameAr: string;
  nameEn: string;
  nameTr: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
  icon192: string;
  icon512: string;
  appleTouchIcon: string;
  publicManifestUrl: string;
  adminManifestUrl: string;
};

export const DEFAULT_PWA_SETTINGS: PwaSettings = {
  version: PWA_VERSION,
  updatedAt: null,
  enabledPublic: true,
  enabledAdmin: true,
  showBanner: true,
  nameAr: "الريان للسياحة",
  nameEn: "Alrayyan Tourism",
  nameTr: "Alrayyan Turizm",
  shortName: "الريان",
  themeColor: PWA_DEFAULT_THEME_COLOR,
  backgroundColor: PWA_DEFAULT_BACKGROUND_COLOR,
  icon192: "",
  icon512: "",
  appleTouchIcon: "",
};

export function pwaNameForLocale(settings: PwaSettings, locale: string): string {
  if (locale === "en") return settings.nameEn || settings.nameAr;
  if (locale === "tr") return settings.nameTr || settings.nameEn || settings.nameAr;
  return settings.nameAr || settings.nameEn;
}

export function resolvedPwaIcon192(settings: Pick<PwaSettings, "icon192">): string {
  return settings.icon192 || PWA_FALLBACK_ICON_192;
}

export function resolvedPwaIcon512(settings: Pick<PwaSettings, "icon512" | "icon192">): string {
  return settings.icon512 || settings.icon192 || PWA_FALLBACK_ICON_512;
}

export function resolvedAppleTouchIcon(
  settings: Pick<PwaSettings, "appleTouchIcon" | "icon192">
): string {
  return settings.appleTouchIcon || settings.icon192 || PWA_FALLBACK_APPLE_TOUCH;
}

export function toPublicPwaConfig(settings: PwaSettings): PwaPublicConfig {
  return {
    enabledPublic: settings.enabledPublic,
    enabledAdmin: settings.enabledAdmin,
    showBanner: settings.showBanner,
    nameAr: settings.nameAr,
    nameEn: settings.nameEn,
    nameTr: settings.nameTr,
    shortName: settings.shortName,
    themeColor: settings.themeColor,
    backgroundColor: settings.backgroundColor,
    icon192: resolvedPwaIcon192(settings),
    icon512: resolvedPwaIcon512(settings),
    appleTouchIcon: resolvedAppleTouchIcon(settings),
    publicManifestUrl: "/manifest.webmanifest",
    adminManifestUrl: "/admin/manifest.webmanifest",
  };
}
