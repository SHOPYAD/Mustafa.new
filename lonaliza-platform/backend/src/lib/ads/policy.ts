import { enums } from "google-ads-api";
import type { GoogleChannel } from "./types";

/**
 * Official invalid-traffic / brand-safety only.
 *
 * Google automatically filters invalid clicks (IVT). We only apply settings
 * the Google Ads API exposes: Search-only networks, presence geo, content-label
 * exclusions (parked domains, adult, tragedy…), and frequency caps where the
 * channel supports them. Metrics include metrics.invalid_clicks for reports.
 *
 * Meta automatically filters invalid traffic. We only apply Marketing API
 * delivery fields: brand_safety_content_filter_levels, publisher platform
 * allow-list (Facebook + Instagram — exclude Audience Network junk), and
 * frequency_control_specs.
 *
 * FORBIDDEN — never implement:
 * - hiding ads from named competitors
 * - click-fraud bots / click farms
 * - IP spoofing or residential-proxy click blocking
 * - "block competitor clicks" via IP lists, user-agent tricks, or third-party
 *   click-fraud tools outside Google/Meta official invalid-traffic filters
 * - storing credit cards (billing stays on the advertiser's Google/Meta accounts)
 * - scraping phone numbers
 */

export const GOOGLE_IN_MARKET_TRAVEL_IDS = [
  "80428", // Travel
  "80432", // Air Travel
  "80440", // Hotels & Accommodations
] as const;

export const GOOGLE_CONTENT_LABEL_EXCLUSIONS = [
  enums.ContentLabelType.PARKED_DOMAIN,
  enums.ContentLabelType.SEXUALLY_SUGGESTIVE,
  enums.ContentLabelType.PROFANITY,
  enums.ContentLabelType.TRAGEDY,
  enums.ContentLabelType.SOCIAL_ISSUES,
  enums.ContentLabelType.JUVENILE,
] as const;

export const META_TRAVEL_INTERESTS = [
  { id: "6003107902433", name: "Travel" },
  { id: "6003348594589", name: "Adventure travel" },
  { id: "6004037902730", name: "Tourism" },
] as const;

/** Official Search quality: Google Search + search partners off content/junk. */
export function googleNetworkSettings(channel: GoogleChannel) {
  if (channel === "search") {
    return {
      target_google_search: true,
      target_search_network: true,
      target_content_network: false,
      target_partner_search_network: false,
    };
  }
  return undefined;
}

export function googleGeoTargetTypeSetting() {
  return {
    positive_geo_target_type: enums.PositiveGeoTargetType.PRESENCE,
    negative_geo_target_type: enums.NegativeGeoTargetType.PRESENCE,
  };
}

/** Frequency cap is supported on Demand Gen (and some video), not Search. */
export function googleFrequencyCaps(channel: GoogleChannel) {
  if (channel !== "demand_gen") return undefined;
  return [
    {
      key: {
        level: enums.FrequencyCapLevel.CAMPAIGN,
        event_type: enums.FrequencyCapEventType.IMPRESSION,
        time_unit: enums.FrequencyCapTimeUnit.WEEK,
        time_length: 1,
      },
      cap: 4,
    },
  ];
}

export function googleEuPoliticalField() {
  return enums.EuPoliticalAdvertisingStatus.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING;
}

/**
 * Meta official delivery: FB+IG only (drop Audience Network junk),
 * standard brand-safety filter, weekly frequency cap.
 */
export function metaOfficialTargeting(countries: string[]) {
  return {
    geo_locations: { countries },
    interests: META_TRAVEL_INTERESTS.map((row) => ({ id: row.id, name: row.name })),
    publisher_platforms: ["facebook", "instagram"],
    facebook_positions: ["feed", "facebook_reels", "story"],
    instagram_positions: ["stream", "story", "reels"],
    brand_safety_content_filter_levels: ["FACEBOOK_STANDARD"],
  };
}

export function metaFrequencyControl() {
  return [{ event: "IMPRESSIONS", interval_days: 7, max_frequency: 4 }];
}
