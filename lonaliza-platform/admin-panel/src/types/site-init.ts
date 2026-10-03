import type { SiteContact } from "./site-contact";
import type { PublicPageLink } from "./custom-page";

export interface MobileAppLinksData {
  googlePlayUrl: string;
  appStoreUrl: string;
  hasCustomGoogleUrl: boolean;
  hasCustomAppleUrl: boolean;
  googlePlayQr?: string;
  appStoreQr?: string;
}

export interface StorefrontInitData {
  contact: SiteContact;
  searchTabs: {
    visibility: Record<string, boolean>;
    order: string[];
    websiteEnabled: Record<string, boolean>;
    appEnabled: Record<string, boolean>;
    navVisibility: Record<string, boolean>;
    navOrder: string[];
  };
  pages: PublicPageLink[];
  appLinks: MobileAppLinksData;
  timestamp: number;
}

// Backward-compatibility alias
export type StorefrontBootstrapData = StorefrontInitData;
