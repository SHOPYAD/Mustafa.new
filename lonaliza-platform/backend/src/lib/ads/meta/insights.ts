import type { AdsCredentials, AdsMetrics } from "../types";
import { loadMetaSdk, metaActId } from "./sdk";

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchMetaInsights(
  creds: AdsCredentials,
  currency: string
): Promise<AdsMetrics> {
  const empty: AdsMetrics = {
    platform: "meta",
    spend: 0,
    clicks: 0,
    impressions: 0,
    ctr: 0,
    conversions: 0,
    currency,
  };
  if (!creds.metaAccessToken || !creds.metaAdAccountId) return empty;
  const sdk = await loadMetaSdk();
  sdk.FacebookAdsApi.init(creds.metaAccessToken);
  const account = new sdk.AdAccount(metaActId(creds.metaAdAccountId));
  if (!account.getInsights) return empty;
  const rows = await account.getInsights(
    ["spend", "clicks", "impressions", "ctr", "actions"],
    { date_preset: "today", level: "account" }
  );
  const first = rows[0] || {};
  const actions = Array.isArray(first.actions)
    ? (first.actions as Array<{ action_type?: string; value?: string }>)
    : [];
  const conversions = actions
    .filter((a) =>
      /purchase|lead|offsite_conversion|omni_purchase|complete_registration/i.test(
        String(a.action_type || "")
      )
    )
    .reduce((sum, a) => sum + num(a.value), 0);
  const clicks = num(first.clicks);
  const impressions = num(first.impressions);
  return {
    platform: "meta",
    spend: num(first.spend),
    clicks,
    impressions,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : num(first.ctr),
    conversions,
    currency,
  };
}

export async function fetchMetaCampaignSpend(
  creds: AdsCredentials,
  campaignId: string
): Promise<{ spendToday: number; spendAll: number }> {
  if (!creds.metaAccessToken || !campaignId) return { spendToday: 0, spendAll: 0 };
  const sdk = await loadMetaSdk();
  sdk.FacebookAdsApi.init(creds.metaAccessToken);
  const campaign = new sdk.Campaign(campaignId);
  if (!campaign.getInsights) return { spendToday: 0, spendAll: 0 };
  const [today, all] = await Promise.all([
    campaign.getInsights(["spend"], { date_preset: "today" }),
    campaign.getInsights(["spend"], { date_preset: "maximum" }),
  ]);
  return {
    spendToday: num(today[0]?.spend),
    spendAll: num(all[0]?.spend),
  };
}
