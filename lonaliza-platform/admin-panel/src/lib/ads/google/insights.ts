import { fromMicros } from "../budget";
import type { AdsCredentials, AdsMetrics } from "../types";
import { createGoogleAdsHandle } from "./client";

export async function fetchGoogleInsights(
  creds: AdsCredentials,
  currency: string
): Promise<AdsMetrics> {
  const empty: AdsMetrics = {
    platform: "google",
    spend: 0,
    clicks: 0,
    impressions: 0,
    ctr: 0,
    conversions: 0,
    invalidClicks: 0,
    currency,
  };
  const handle = createGoogleAdsHandle(creds);
  if (!handle) return empty;

  const rows = await handle.customer.report({
    entity: "customer",
    metrics: [
      "metrics.cost_micros",
      "metrics.clicks",
      "metrics.impressions",
      "metrics.ctr",
      "metrics.conversions",
      "metrics.invalid_clicks",
    ],
    date_constant: "TODAY",
  });

  const first = (rows as Array<Record<string, { [k: string]: number | string | undefined } | undefined>>)[0];
  const metrics = first?.metrics ?? {};
  const spend = fromMicros(Number(metrics.cost_micros || 0));
  const clicks = Number(metrics.clicks || 0);
  const impressions = Number(metrics.impressions || 0);
  const ctr = Number(metrics.ctr || 0) * (Number(metrics.ctr || 0) > 1 ? 1 : 100);
  return {
    platform: "google",
    spend,
    clicks,
    impressions,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : ctr,
    conversions: Number(metrics.conversions || 0),
    invalidClicks: Number(metrics.invalid_clicks || 0),
    currency,
  };
}

export async function fetchGoogleCampaignSpend(
  creds: AdsCredentials,
  resourceName: string
): Promise<{ spendToday: number; spendAll: number }> {
  const handle = createGoogleAdsHandle(creds);
  if (!handle) return { spendToday: 0, spendAll: 0 };
  const id = resourceName.split("/").pop() || "";
  const [today, all] = await Promise.all([
    handle.customer.report({
      entity: "campaign",
      attributes: ["campaign.id"],
      metrics: ["metrics.cost_micros"],
      constraints: id ? [{ key: "campaign.id", op: "=", val: id }] : undefined,
      date_constant: "TODAY",
    }),
    handle.customer.report({
      entity: "campaign",
      attributes: ["campaign.id"],
      metrics: ["metrics.cost_micros"],
      constraints: id ? [{ key: "campaign.id", op: "=", val: id }] : undefined,
      from_date: "2020-01-01",
      to_date: new Date().toISOString().slice(0, 10),
    }),
  ]);
  const cost = (rows: unknown) => {
    const first = (rows as Array<{ metrics?: { cost_micros?: number } }>)[0];
    return fromMicros(Number(first?.metrics?.cost_micros || 0));
  };
  return { spendToday: cost(today), spendAll: cost(all) };
}
