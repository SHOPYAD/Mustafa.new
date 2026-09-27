import { toMinorUnits } from "../budget";
import { metaFrequencyControl, metaOfficialTargeting } from "../policy";
import { objectStoryId, resolvePublishedPost } from "../social-bridge";
import type { AdsCredentials, MetaLaunchPayload } from "../types";
import type { NormalizedLaunch } from "../validate";
import { loadMetaSdk, metaActId } from "./sdk";

export async function buildMetaLaunchPayload(
  launch: NormalizedLaunch,
  creds: Pick<AdsCredentials, "metaPageId" | "metaPixelId" | "metaAdAccountId">
): Promise<MetaLaunchPayload> {
  const daily = toMinorUnits(launch.dailyBudget);
  const countries = launch.geoCodes;
  let pageId = launch.pageId || creds.metaPageId;
  let postId = launch.postId;
  if (postId) {
    const published = await resolvePublishedPost("facebook", postId);
    if (published) {
      postId = published.id;
      pageId = published.pageId || pageId;
    }
  }

  const campaign: Record<string, unknown> = {
    name: launch.name,
    objective: "OUTCOME_TRAFFIC",
    status: "ACTIVE",
    special_ad_categories: [],
    daily_budget: daily,
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    is_adset_budget_sharing_enabled: true,
  };
  if (launch.lifetimeBudget) {
    delete campaign.daily_budget;
    campaign.lifetime_budget = toMinorUnits(launch.lifetimeBudget);
  }

  const adSet: Record<string, unknown> = {
    name: `${launch.name} ad set`,
    billing_event: "IMPRESSIONS",
    optimization_goal: "LINK_CLICKS",
    targeting: metaOfficialTargeting(countries),
    frequency_control_specs: metaFrequencyControl(),
    status: "ACTIVE",
    pacing_type: ["standard"],
  };
  if (creds.metaPixelId) {
    adSet.promoted_object = {
      pixel_id: creds.metaPixelId,
      custom_event_type: "PURCHASE",
    };
    adSet.optimization_goal = "OFFSITE_CONVERSIONS";
  } else if (pageId) {
    adSet.promoted_object = { page_id: pageId };
  }

  const creative: Record<string, unknown> = { name: `${launch.name} creative` };
  if (launch.metaCreative === "boost" && postId && pageId) {
    creative.object_story_id = objectStoryId(pageId, postId);
  } else {
    creative.object_story_spec = {
      page_id: pageId || undefined,
      link_data: {
        message: launch.descriptions[0] || launch.name,
        link: launch.landingUrl,
        name: launch.headlines[0] || launch.name,
        description: launch.descriptions[1] || launch.descriptions[0],
        picture: launch.imageUrl,
        call_to_action: { type: "LEARN_MORE", value: { link: launch.landingUrl } },
      },
    };
  }

  const ad: Record<string, unknown> = {
    name: `${launch.name} ad`,
    status: "ACTIVE",
  };

  return { campaign, adSet, creative, ad };
}

export async function mutateMetaLaunch(
  creds: AdsCredentials,
  payload: MetaLaunchPayload
): Promise<{ campaignId?: string; adSetId?: string; adId?: string }> {
  if (!creds.metaAccessToken || !creds.metaAdAccountId) {
    throw new Error("meta_ads_not_connected");
  }
  const sdk = await loadMetaSdk();
  sdk.FacebookAdsApi.init(creds.metaAccessToken);
  const account = new sdk.AdAccount(metaActId(creds.metaAdAccountId));

  const campaign = await account.createCampaign(["id"], payload.campaign);
  const campaignId = campaign.id;
  const adSet = await account.createAdSet(["id"], {
    ...payload.adSet,
    campaign_id: campaignId,
  });
  const adSetId = adSet.id;
  const creative = await account.createAdCreative(["id"], payload.creative);
  const ad = await account.createAd(["id"], {
    ...payload.ad,
    adset_id: adSetId,
    creative: { creative_id: creative.id },
  });
  return { campaignId, adSetId, adId: ad.id };
}

export async function pauseMetaCampaigns(
  creds: AdsCredentials,
  campaignIds: string[]
): Promise<void> {
  if (!creds.metaAccessToken || campaignIds.length === 0) return;
  const sdk = await loadMetaSdk();
  sdk.FacebookAdsApi.init(creds.metaAccessToken);
  for (const id of campaignIds) {
    const campaign = new sdk.Campaign(id);
    if (campaign.update) {
      await campaign.update([], { status: "PAUSED" });
    }
  }
}
