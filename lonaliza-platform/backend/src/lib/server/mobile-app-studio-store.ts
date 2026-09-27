import { promises as fs } from "fs";
import path from "path";

export type {
  HomeSectionConfig,
  FlashDealConfig,
  BottomNavTabConfig,
  SplashSlideConfig,
  MobileAppStudioSettings,
  MobileAppBuildStatus,
} from "@/lib/mobile-app-types";

export {
  DEFAULT_HOME_SECTIONS,
  DEFAULT_FLASH_DEAL,
  DEFAULT_BOTTOM_NAV_TABS,
  DEFAULT_SPLASH_SLIDES,
  DEFAULT_MOBILE_APP_STUDIO,
  ensureBottomNavTabs,
} from "@/lib/mobile-app-types";

import {
  DEFAULT_HOME_SECTIONS,
  DEFAULT_FLASH_DEAL,
  DEFAULT_SPLASH_SLIDES,
  DEFAULT_MOBILE_APP_STUDIO,
  ensureBottomNavTabs,
  type MobileAppStudioSettings,
  type MobileAppBuildStatus,
} from "@/lib/mobile-app-types";


const DATA_DIR = path.join(process.cwd(), ".data");
const SETTINGS_FILE = path.join(DATA_DIR, "mobile-app-studio.json");
const BUILD_FILE = path.join(DATA_DIR, "mobile-app-build-status.json");
const BUILD_LOG_FILE = path.join(DATA_DIR, "mobile-app-build.log");

export async function getMobileAppStudioSettings(): Promise<MobileAppStudioSettings> {
  try {
    const raw = JSON.parse(await fs.readFile(SETTINGS_FILE, "utf8")) as Partial<MobileAppStudioSettings>;
    return {
      ...DEFAULT_MOBILE_APP_STUDIO,
      ...raw,
      homeSections: Array.isArray(raw.homeSections) && raw.homeSections.length ? raw.homeSections : DEFAULT_HOME_SECTIONS,
      flashDeal: raw.flashDeal ? { ...DEFAULT_FLASH_DEAL, ...raw.flashDeal } : DEFAULT_FLASH_DEAL,
      bottomNavTabs: ensureBottomNavTabs(raw.bottomNavTabs),
      splashSlides: Array.isArray(raw.splashSlides) && raw.splashSlides.length ? raw.splashSlides : DEFAULT_SPLASH_SLIDES,
    };
  } catch {
    return DEFAULT_MOBILE_APP_STUDIO;
  }
}

export async function saveMobileAppStudioSettings(
  patch: Partial<MobileAppStudioSettings>
): Promise<MobileAppStudioSettings> {
  const current = await getMobileAppStudioSettings();
  const next: MobileAppStudioSettings = {
    ...current,
    ...sanitize(patch, current),
  };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf8");

  if (typeof patch.pwaBannerEnabled === "boolean") {
    try {
      const { savePwaSettings } = await import("@/lib/server/pwa-store");
      await savePwaSettings({ showBanner: patch.pwaBannerEnabled });
    } catch {}
  }

  return next;
}

export async function getMobileAppBuildStatus(): Promise<MobileAppBuildStatus> {
  try {
    const status = JSON.parse(await fs.readFile(BUILD_FILE, "utf8")) as MobileAppBuildStatus;
    try {
      const logsRaw = await fs.readFile(BUILD_LOG_FILE, "utf8");
      const lines = logsRaw.split("\n").filter(Boolean);
      status.logs = lines.slice(-80); // Last 80 lines of output
    } catch {
      status.logs = status.logs || [];
    }
    return status;
  } catch {
    return { state: "idle", logs: [] };
  }
}

export async function writeMobileAppBuildStatus(status: MobileAppBuildStatus): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BUILD_FILE, JSON.stringify(status, null, 2), "utf8");
}

export async function appendBuildLog(message: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  await fs.appendFile(BUILD_LOG_FILE, entry, "utf8");
}

export async function clearBuildLog(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BUILD_LOG_FILE, "", "utf8");
}

function sanitize(
  patch: Partial<MobileAppStudioSettings>,
  current: MobileAppStudioSettings
): Partial<MobileAppStudioSettings> {
  const next: Partial<MobileAppStudioSettings> = {};
  if (typeof patch.displayName === "string") next.displayName = patch.displayName.trim().slice(0, 40) || "Lonaliza";
  if (typeof patch.displayNameAr === "string") next.displayNameAr = patch.displayNameAr.trim().slice(0, 40) || "لوناليزا";
  if (typeof patch.displayNameEn === "string") next.displayNameEn = patch.displayNameEn.trim().slice(0, 40) || "Lonaliza";
  if (typeof patch.applicationId === "string" && /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i.test(patch.applicationId)) {
    next.applicationId = patch.applicationId.trim();
  }
  if (typeof patch.apiBase === "string" && /^https:\/\//i.test(patch.apiBase)) {
    next.apiBase = patch.apiBase.trim().replace(/\/$/, "");
  }
  if (typeof patch.primaryColor === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(patch.primaryColor)) {
    next.primaryColor = patch.primaryColor;
  }
  if (typeof patch.royalPurple === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(patch.royalPurple)) {
    next.royalPurple = patch.royalPurple;
  }
  if (typeof patch.amberColor === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(patch.amberColor)) {
    next.amberColor = patch.amberColor;
  }
  if (typeof patch.pageBg === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(patch.pageBg)) {
    next.pageBg = patch.pageBg;
  }
  if (typeof patch.logoUrl === "string") next.logoUrl = patch.logoUrl.trim();
  if (typeof patch.iconUrl === "string") next.iconUrl = patch.iconUrl.trim();
  if (typeof patch.splashSloganAr === "string") next.splashSloganAr = patch.splashSloganAr.trim();
  if (typeof patch.splashSloganEn === "string") next.splashSloganEn = patch.splashSloganEn.trim();

  if (Array.isArray(patch.homeSections)) {
    next.homeSections = patch.homeSections.map((sec, idx) => ({
      id: String(sec.id || `sec_${idx}`),
      nameAr: String(sec.nameAr || ""),
      nameEn: String(sec.nameEn || ""),
      enabled: Boolean(sec.enabled),
      order: typeof sec.order === "number" ? sec.order : idx + 1,
      badge: sec.badge ? String(sec.badge) : undefined,
      subtitleAr: sec.subtitleAr ? String(sec.subtitleAr) : undefined,
      subtitleEn: sec.subtitleEn ? String(sec.subtitleEn) : undefined,
    })).sort((a, b) => a.order - b.order);
  }

  if (patch.flashDeal && typeof patch.flashDeal === "object") {
    next.flashDeal = {
      ...current.flashDeal,
      enabled: Boolean(patch.flashDeal.enabled),
      titleAr: String(patch.flashDeal.titleAr || current.flashDeal.titleAr),
      titleEn: String(patch.flashDeal.titleEn || current.flashDeal.titleEn),
      discountPercent: Number(patch.flashDeal.discountPercent || current.flashDeal.discountPercent),
      endsAt: String(patch.flashDeal.endsAt || current.flashDeal.endsAt),
      targetRoute: String(patch.flashDeal.targetRoute || current.flashDeal.targetRoute),
      badgeText: String(patch.flashDeal.badgeText || current.flashDeal.badgeText),
    };
  }

  if (typeof patch.githubRepo === "string") {
    next.githubRepo = patch.githubRepo.replace(/[^a-zA-Z0-9._\-\/]/g, "").slice(0, 120);
  }
  if (typeof patch.githubToken === "string") {
    next.githubToken = patch.githubToken.trim().slice(0, 200);
  }
  if (typeof patch.githubBranch === "string") {
    next.githubBranch = patch.githubBranch.trim().slice(0, 60) || "main";
  }
  if (typeof patch.githubWorkflowAndroid === "string") {
    next.githubWorkflowAndroid = patch.githubWorkflowAndroid.trim().slice(0, 80) || "mobile-android.yml";
  }
  if (typeof patch.githubWorkflowIos === "string") {
    next.githubWorkflowIos = patch.githubWorkflowIos.trim().slice(0, 80) || "mobile-ios.yml";
  }
  if (typeof patch.googlePlayUrl === "string") {
    next.googlePlayUrl = patch.googlePlayUrl.trim().slice(0, 500);
  }
  if (typeof patch.appStoreUrl === "string") {
    next.appStoreUrl = patch.appStoreUrl.trim().slice(0, 500);
  }
  if (typeof patch.pwaBannerEnabled === "boolean") {
    next.pwaBannerEnabled = patch.pwaBannerEnabled;
  }

  return next;
}
