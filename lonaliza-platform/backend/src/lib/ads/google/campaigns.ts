import { enums, ResourceNames, toMicros, type MutateOperation } from "google-ads-api";
import { resolveGeos } from "../geos";
import {
  GOOGLE_CONTENT_LABEL_EXCLUSIONS,
  GOOGLE_IN_MARKET_TRAVEL_IDS,
  googleEuPoliticalField,
  googleFrequencyCaps,
  googleGeoTargetTypeSetting,
  googleNetworkSettings,
} from "../policy";
import type { AdsCredentials, GoogleMutateOp } from "../types";
import type { NormalizedLaunch } from "../validate";
import { createGoogleAdsHandle } from "./client";

function tempName(
  kind: "campaignBudget" | "campaign" | "adGroup" | "customAudience" | "assetGroup",
  customerId: string,
  tempId: string
): string {
  switch (kind) {
    case "campaignBudget":
      return ResourceNames.campaignBudget(customerId, tempId);
    case "campaign":
      return ResourceNames.campaign(customerId, tempId);
    case "adGroup":
      return ResourceNames.adGroup(customerId, tempId);
    case "customAudience":
      return ResourceNames.customAudience(customerId, tempId);
    case "assetGroup":
      return ResourceNames.assetGroup(customerId, tempId);
    default: {
      const _never: never = kind;
      return String(_never);
    }
  }
}

function channelType(channel: NormalizedLaunch["googleChannel"]) {
  switch (channel) {
    case "search":
      return enums.AdvertisingChannelType.SEARCH;
    case "pmax":
      return enums.AdvertisingChannelType.PERFORMANCE_MAX;
    case "demand_gen":
      return enums.AdvertisingChannelType.DEMAND_GEN;
    default: {
      const _never: never = channel;
      return _never;
    }
  }
}

export function buildGoogleLaunchOps(
  launch: NormalizedLaunch,
  customerId: string
): GoogleMutateOp[] {
  const cid = customerId.replace(/-/g, "") || "0000000000";
  const budgetRn = tempName("campaignBudget", cid, "-1");
  const campaignRn = tempName("campaign", cid, "-2");
  const adGroupRn = tempName("adGroup", cid, "-3");
  const audienceRn = tempName("customAudience", cid, "-4");
  const assetGroupRn = tempName("assetGroup", cid, "-5");
  const geos = resolveGeos(launch.geoCodes);
  const channel = launch.googleChannel;
  const status = enums.CampaignStatus.ENABLED;
  const ops: GoogleMutateOp[] = [];

  ops.push({
    entity: "campaign_budget",
    operation: "create",
    resource: {
      resource_name: budgetRn,
      name: `${launch.name} budget`,
      delivery_method: enums.BudgetDeliveryMethod.STANDARD,
      amount_micros: toMicros(launch.dailyBudget),
      explicitly_shared: false,
      ...(launch.lifetimeBudget
        ? { total_amount_micros: toMicros(launch.lifetimeBudget) }
        : {}),
    },
  });

  const campaign: Record<string, unknown> = {
    resource_name: campaignRn,
    name: launch.name,
    status,
    advertising_channel_type: channelType(channel),
    campaign_budget: budgetRn,
    contains_eu_political_advertising: googleEuPoliticalField(),
    geo_target_type_setting: googleGeoTargetTypeSetting(),
    maximize_conversions: {},
  };
  const network = googleNetworkSettings(channel);
  if (network) campaign.network_settings = network;
  const caps = googleFrequencyCaps(channel);
  if (caps) campaign.frequency_caps = caps;
  ops.push({ entity: "campaign", operation: "create", resource: campaign });

  for (const geo of geos) {
    ops.push({
      entity: "campaign_criterion",
      operation: "create",
      resource: {
        campaign: campaignRn,
        location: { geo_target_constant: ResourceNames.geoTargetConstant(geo.googleCriterionId) },
      },
    });
  }

  // Official junk-placement exclusions (content labels) — not competitor IP lists.
  for (const label of GOOGLE_CONTENT_LABEL_EXCLUSIONS) {
    ops.push({
      entity: "campaign_criterion",
      operation: "create",
      resource: {
        campaign: campaignRn,
        negative: true,
        content_label: { type: label },
      },
    });
  }

  ops.push({
    entity: "custom_audience",
    operation: "create",
    resource: {
      resource_name: audienceRn,
      name: `${launch.name} travel intent`,
      type: enums.CustomAudienceType.AUTO,
      description: "In-market / custom intent travel (official audience, not competitor blocking)",
      members: [
        { member_type: enums.CustomAudienceMemberType.URL, url: launch.landingUrl },
        ...launch.keywords.slice(0, 8).map((keyword) => ({
          member_type: enums.CustomAudienceMemberType.KEYWORD,
          keyword,
        })),
      ],
    },
  });

  for (const interestId of GOOGLE_IN_MARKET_TRAVEL_IDS) {
    ops.push({
      entity: "campaign_criterion",
      operation: "create",
      resource: {
        campaign: campaignRn,
        user_interest: { user_interest_category: ResourceNames.userInterest(cid, interestId) },
      },
    });
  }

  if (channel === "search") {
    ops.push({
      entity: "ad_group",
      operation: "create",
      resource: {
        resource_name: adGroupRn,
        campaign: campaignRn,
        name: `${launch.name} search`,
        status: enums.AdGroupStatus.ENABLED,
        type: enums.AdGroupType.SEARCH_STANDARD,
      },
    });
    for (const keyword of launch.keywords) {
      ops.push({
        entity: "ad_group_criterion",
        operation: "create",
        resource: {
          ad_group: adGroupRn,
          status: enums.AdGroupCriterionStatus.ENABLED,
          keyword: {
            text: keyword,
            match_type: enums.KeywordMatchType.PHRASE,
          },
        },
      });
    }
    ops.push({
      entity: "ad_group_ad",
      operation: "create",
      resource: {
        ad_group: adGroupRn,
        status: enums.AdGroupAdStatus.ENABLED,
        ad: {
          final_urls: [launch.landingUrl],
          responsive_search_ad: {
            headlines: launch.headlines.slice(0, 15).map((text) => ({ text: text.slice(0, 30) })),
            descriptions: launch.descriptions.slice(0, 4).map((text) => ({ text: text.slice(0, 90) })),
          },
        },
      },
    });
  } else if (channel === "pmax" || channel === "demand_gen") {
    ops.push({
      entity: "asset_group",
      operation: "create",
      resource: {
        resource_name: assetGroupRn,
        campaign: campaignRn,
        name: `${launch.name} assets`,
        final_urls: [launch.landingUrl],
        status: enums.AssetGroupStatus.ENABLED,
      },
    });
  } else {
    const _never: never = channel;
    void _never;
  }

  return ops;
}

export async function mutateGoogleLaunch(
  creds: AdsCredentials,
  ops: GoogleMutateOp[]
): Promise<{ resourceNames: string[] }> {
  const handle = createGoogleAdsHandle(creds);
  if (!handle) {
    throw new Error("google_ads_not_connected");
  }
  const mutations = ops as MutateOperation<Record<string, unknown>>[];
  const result = await handle.customer.mutateResources(mutations);
  const resourceNames: string[] = [];
  for (const row of result.mutate_operation_responses || []) {
    const rec = row as unknown as Record<string, { resource_name?: string } | undefined>;
    for (const value of Object.values(rec)) {
      if (value && typeof value === "object" && value.resource_name) {
        resourceNames.push(value.resource_name);
      }
    }
  }
  return { resourceNames };
}

export async function pauseGoogleCampaigns(
  creds: AdsCredentials,
  resourceNames: string[]
): Promise<void> {
  const handle = createGoogleAdsHandle(creds);
  if (!handle || resourceNames.length === 0) return;
  const ops = resourceNames
    .filter((name) => name.includes("/campaigns/"))
    .map((resource_name) => ({
      entity: "campaign" as const,
      operation: "update" as const,
      resource: {
        resource_name,
        status: enums.CampaignStatus.PAUSED,
      },
    }));
  if (!ops.length) return;
  await handle.customer.mutateResources(ops as MutateOperation<Record<string, unknown>>[]);
}
