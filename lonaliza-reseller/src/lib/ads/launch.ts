import { randomBytes } from "crypto";
import { wouldExceedCap } from "./budget";
import { connectionStatus, googleAdsReady, metaAdsReady, resolveAdsCredentials } from "./config";
import { fetchGoogleCampaignSpend } from "./google/insights";
import { buildGoogleLaunchOps, mutateGoogleLaunch } from "./google/campaigns";
import { fetchMetaCampaignSpend } from "./meta/insights";
import { buildMetaLaunchPayload, mutateMetaLaunch } from "./meta/campaigns";
import { listCampaigns, loadAdsSettings, upsertCampaign } from "./store";
import type { AdsLaunchInput, AdsLaunchResult, StoredCampaign } from "./types";
import { validateLaunch } from "./validate";

function newId(): string {
  return `ads_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}

async function assertHeadroomBeforeLaunch(
  creds: Awaited<ReturnType<typeof resolveAdsCredentials>>,
  platforms: StoredCampaign["platform"][],
  dailyBudget: number,
  lifetimeBudget?: number
): Promise<string | null> {
  const existing = await listCampaigns();
  for (const platform of platforms) {
    const live = existing.filter(
      (c) =>
        c.platform === platform &&
        (c.status === "enabled" || c.status === "paused" || c.status === "capped") &&
        c.providerId
    );
    for (const row of live) {
      const spend =
        platform === "google"
          ? await fetchGoogleCampaignSpend(creds, row.providerResource || row.providerId || "")
          : await fetchMetaCampaignSpend(creds, row.providerId || "");
      if (wouldExceedCap(spend.spendToday, row.dailyBudget)) {
        return `${platform}: الحملة ${row.name} بلغت سقف اليوم — إيقاف التوسيع (لا إطلاق جديد حتى إعادة الضبط)`;
      }
      if (wouldExceedCap(spend.spendAll, row.lifetimeBudget || Infinity)) {
        return `${platform}: الحملة ${row.name} بلغت سقف العمر`;
      }
    }
    void dailyBudget;
    void lifetimeBudget;
  }
  return null;
}

export async function launchAds(input: AdsLaunchInput): Promise<AdsLaunchResult> {
  const settings = await loadAdsSettings();
  const parsed = validateLaunch(input, {
    geoCodes: settings.defaultGeoCodes,
    currency: settings.currency,
  });
  if (!parsed.ok) {
    return { ok: false, dryRun: true, live: false, errors: parsed.errors, campaigns: [] };
  }
  const launch = parsed.value;
  const creds = await resolveAdsCredentials();
  const status = connectionStatus(creds);

  const wantLive = input.dryRun === false;
  const googleCanLive = launch.platforms.includes("google") && googleAdsReady(creds);
  const metaCanLive = launch.platforms.includes("meta") && metaAdsReady(creds);
  const anyLiveRequested = wantLive && (googleCanLive || metaCanLive);
  const dryRun = !anyLiveRequested || !wantLive;

  const googleOps = launch.platforms.includes("google")
    ? buildGoogleLaunchOps(launch, creds.googleCustomerId || "0000000000")
    : undefined;
  const metaPayload = launch.platforms.includes("meta")
    ? await buildMetaLaunchPayload(launch, creds)
    : undefined;

  if (wantLive && launch.platforms.includes("google") && !googleCanLive) {
    /* keep dry-run ops; do not mutate */
  }
  if (wantLive && launch.platforms.includes("meta") && !metaCanLive) {
    /* keep dry-run payload; do not mutate */
  }

  if (wantLive && (googleCanLive || metaCanLive)) {
    const blocked = await assertHeadroomBeforeLaunch(
      creds,
      launch.platforms,
      launch.dailyBudget,
      launch.lifetimeBudget
    );
    if (blocked) {
      return {
        ok: false,
        dryRun: false,
        live: false,
        reason: blocked,
        googleOps,
        metaPayload,
        campaigns: [],
      };
    }
  }

  const stored: StoredCampaign[] = [];
  let googleLive: AdsLaunchResult["googleLive"];
  let metaLive: AdsLaunchResult["metaLive"];

  if (wantLive && googleCanLive && googleOps) {
    googleLive = await mutateGoogleLaunch(creds, googleOps);
    const campaignRn = googleLive.resourceNames.find((n) => n.includes("/campaigns/"));
    const row: StoredCampaign = {
      id: newId(),
      platform: "google",
      name: launch.name,
      landingUrl: launch.landingUrl,
      dailyBudget: launch.dailyBudget,
      lifetimeBudget: launch.lifetimeBudget,
      currency: launch.currency,
      status: "enabled",
      providerId: campaignRn?.split("/").pop(),
      providerResource: campaignRn,
      createdAt: new Date().toISOString(),
      approved: true,
      dryRun: false,
      googleChannel: launch.googleChannel,
      geoCodes: launch.geoCodes,
    };
    stored.push(await upsertCampaign(row));
  } else if (launch.platforms.includes("google")) {
    stored.push(
      await upsertCampaign({
        id: newId(),
        platform: "google",
        name: launch.name,
        landingUrl: launch.landingUrl,
        dailyBudget: launch.dailyBudget,
        lifetimeBudget: launch.lifetimeBudget,
        currency: launch.currency,
        status: "dry_run",
        createdAt: new Date().toISOString(),
        approved: true,
        dryRun: true,
        googleChannel: launch.googleChannel,
        geoCodes: launch.geoCodes,
      })
    );
  }

  if (wantLive && metaCanLive && metaPayload) {
    metaLive = await mutateMetaLaunch(creds, metaPayload);
    stored.push(
      await upsertCampaign({
        id: newId(),
        platform: "meta",
        name: launch.name,
        landingUrl: launch.landingUrl,
        dailyBudget: launch.dailyBudget,
        lifetimeBudget: launch.lifetimeBudget,
        currency: launch.currency,
        status: "enabled",
        providerId: metaLive.campaignId,
        metaAdSetId: metaLive.adSetId,
        createdAt: new Date().toISOString(),
        approved: true,
        dryRun: false,
        geoCodes: launch.geoCodes,
      })
    );
  } else if (launch.platforms.includes("meta")) {
    stored.push(
      await upsertCampaign({
        id: newId(),
        platform: "meta",
        name: launch.name,
        landingUrl: launch.landingUrl,
        dailyBudget: launch.dailyBudget,
        lifetimeBudget: launch.lifetimeBudget,
        currency: launch.currency,
        status: "dry_run",
        createdAt: new Date().toISOString(),
        approved: true,
        dryRun: true,
        geoCodes: launch.geoCodes,
      })
    );
  }

  const missing: string[] = [];
  if (wantLive && launch.platforms.includes("google") && !googleCanLive) {
    missing.push(`جوجل: ${status.missingGoogle.join(", ") || "بيانات الدخول ناقصة"}`);
  }
  if (wantLive && launch.platforms.includes("meta") && !metaCanLive) {
    missing.push(`ميتا: ${status.missingMeta.join(", ") || "بيانات الدخول ناقصة"}`);
  }

  return {
    ok: true,
    dryRun,
    live: Boolean(googleLive || metaLive),
    reason: missing.length
      ? `dryRun: لا يوجد اتصال حي — ${missing.join(" | ")}`
      : dryRun
        ? "dryRun: تم التحقق من الحمولة دون mutate"
        : undefined,
    campaigns: stored,
    googleOps,
    metaPayload,
    googleLive,
    metaLive,
  };
}
