/** Marketing / SEO platform integrations (env-driven) */

export type IntegrationToggle = {
  enabled: boolean;
};

export type GoogleSearchConsoleConfig = IntegrationToggle & {
  /**
   * Content value for `<meta name="google-site-verification" content="…">`.
   * May also accept a full meta tag snippet — store normalizes to content only.
   */
  verificationMeta: string;
  /** Optional Search Console property URL (e.g. https://lonaliza.com) */
  propertyUrl: string;
};

export type GoogleAnalyticsConfig = IntegrationToggle & {
  /** Measurement ID, e.g. G-XXXXXXXX */
  measurementId: string;
};

export type GoogleTagManagerConfig = IntegrationToggle & {
  /** Container ID, e.g. GTM-XXXXXXX */
  containerId: string;
};

export type GoogleAdsConfig = IntegrationToggle & {
  /** Conversion ID, e.g. AW-XXXXXXXX */
  conversionId: string;
  /** Optional conversion label for gtag send_to */
  conversionLabel: string;
};

export type FacebookPixelConfig = IntegrationToggle & {
  /** Meta Pixel ID (digits) */
  pixelId: string;
};

export type TikTokPixelConfig = IntegrationToggle & {
  /** TikTok Pixel ID */
  pixelId: string;
};

export type SiteIntegrations = {
  googleSearchConsole: GoogleSearchConsoleConfig;
  googleAnalytics: GoogleAnalyticsConfig;
  googleTagManager: GoogleTagManagerConfig;
  googleAds: GoogleAdsConfig;
  facebookPixel: FacebookPixelConfig;
  tiktokPixel: TikTokPixelConfig;
};
