import { getSiteContact } from "@/lib/server/site-contact-file";
import { getSearchTabsConfig } from "@/lib/server/search-tabs-store";
import { getChannelServices } from "@/lib/server/channel-services-store";
import { listPublicPageLinks } from "@/lib/server/pages-store";
import { getMobileAppStudioSettings } from "@/lib/server/mobile-app-studio-store";
import { defaultSiteContact } from "@/data/site-contact";
import type { StorefrontInitData } from "@/types/site-init";

let memoryCache: { data: StorefrontInitData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000; // 30s server-side memory coalescing

export async function getStorefrontInitData(forceFresh = false): Promise<StorefrontInitData> {
  const now = Date.now();
  if (!forceFresh && memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.data;
  }

  const [contact, searchTabsConfig, channels, pages, appSettings] = await Promise.all([
    getSiteContact().catch(() => null),
    getSearchTabsConfig().catch(() => null),
    getChannelServices().catch(() => null),
    listPublicPageLinks().catch(() => []),
    getMobileAppStudioSettings().catch(() => null),
  ]);

  const googlePlayUrl = appSettings?.googlePlayUrl || "https://play.google.com/store/apps/details?id=com.lonaliza.app";
  const appStoreUrl = appSettings?.appStoreUrl || "https://apps.apple.com/app/id6740000000";

  const data: StorefrontInitData = {
    contact: contact || defaultSiteContact,
    searchTabs: {
      visibility: searchTabsConfig?.visibility || {},
      order: searchTabsConfig?.order || [],
      websiteEnabled: channels?.websiteEnabled || {},
      appEnabled: channels?.appEnabled || {},
      navVisibility: channels?.navVisibility || {},
      navOrder: channels?.navOrder || [],
    },
    pages: Array.isArray(pages) ? pages : [],
    appLinks: {
      googlePlayUrl,
      appStoreUrl,
      hasCustomGoogleUrl: Boolean(appSettings?.googlePlayUrl),
      hasCustomAppleUrl: Boolean(appSettings?.appStoreUrl),
    },
    timestamp: now,
  };

  memoryCache = {
    data,
    expiresAt: now + CACHE_TTL_MS,
  };

  return data;
}

export function invalidateSiteInitCache(): void {
  memoryCache = null;
}

// Aliases for compatibility
export const getStorefrontBootstrapData = getStorefrontInitData;
export const invalidateBootstrapCache = invalidateSiteInitCache;
