/**
 * Site marketing integrations — env / server-store driven.
 * Re-exports helpers used by tracking scripts and admin status UI.
 */

export {
  PLATFORM_DASHBOARD_URLS,
  sanitizeTrackingId,
  extractGoogleSiteVerification,
  getIntegrationsFromEnv,
  getIntegrationsFromValues,
  shouldLoadGtag,
  shouldLoadGtm,
  shouldLoadFacebookPixel,
  shouldLoadTikTokPixel,
  getGscVerificationContent,
  maskValue,
  getIntegrationStatusRows,
  type IntegrationStatusRow,
} from "@/lib/integrations-env";

import { getIntegrationsFromEnv } from "@/lib/integrations-env";
import type { SiteIntegrations } from "@/types/site-integrations";

/** @deprecated Use getIntegrationsFromEnv — kept for call-site compatibility */
export function getSiteIntegrations(): SiteIntegrations {
  return getIntegrationsFromEnv();
}
