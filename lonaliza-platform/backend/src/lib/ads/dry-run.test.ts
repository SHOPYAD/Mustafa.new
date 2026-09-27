import { describe, expect, it } from "vitest";
import { budgetRatio, evaluateBudgetAlerts, toMicros, wouldExceedCap } from "./budget";
import { DEFAULT_GEO_CODES, resolveGeos } from "./geos";
import { buildGoogleLaunchOps } from "./google/campaigns";
import { metaOfficialTargeting } from "./policy";
import { validateLaunch } from "./validate";
import type { StoredCampaign } from "./types";

const base = {
  approved: true,
  landingUrl: "https://lonaliza.com/tours",
  dailyBudget: 25,
  platforms: "google" as const,
};

describe("ads launch validation", () => {
  it("rejects launch without approved=true", () => {
    const result = validateLaunch({ ...base, approved: false }, { geoCodes: DEFAULT_GEO_CODES, currency: "USD" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === "approved")).toBe(true);
    }
  });

  it("rejects missing daily budget", () => {
    const result = validateLaunch(
      { ...base, dailyBudget: 0 },
      { geoCodes: DEFAULT_GEO_CODES, currency: "USD" }
    );
    expect(result.ok).toBe(false);
  });

  it("rejects invalid landing url", () => {
    const result = validateLaunch(
      { ...base, landingUrl: "not-a-url" },
      { geoCodes: DEFAULT_GEO_CODES, currency: "USD" }
    );
    expect(result.ok).toBe(false);
  });

  it("normalizes GCC + Maghreb geos and travel copy", () => {
    const result = validateLaunch(base, { geoCodes: DEFAULT_GEO_CODES, currency: "USD" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.geoCodes).toContain("SA");
      expect(result.value.geoCodes).toContain("MA");
      expect(result.value.geoCodes).toContain("IQ");
      expect(result.value.headlines.length).toBeGreaterThanOrEqual(3);
      expect(result.value.dryRun).toBe(true);
    }
  });
});

describe("google dry-run mutate payload", () => {
  it("builds Search ops with official network + content-label exclusions", () => {
    const parsed = validateLaunch(base, { geoCodes: ["SA", "AE"], currency: "USD" });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const ops = buildGoogleLaunchOps(parsed.value, "1234567890");
    expect(ops.some((o) => o.entity === "campaign_budget")).toBe(true);
    expect(ops.some((o) => o.entity === "campaign")).toBe(true);
    expect(ops.some((o) => o.entity === "ad_group_ad")).toBe(true);
    const campaign = ops.find((o) => o.entity === "campaign")?.resource as {
      network_settings?: { target_content_network?: boolean };
    };
    expect(campaign.network_settings?.target_content_network).toBe(false);
    const negatives = ops.filter(
      (o) => o.entity === "campaign_criterion" && (o.resource as { negative?: boolean }).negative
    );
    expect(negatives.length).toBeGreaterThanOrEqual(4);
    expect(toMicros(25)).toBe(25_000_000);
  });
});

describe("meta official targeting", () => {
  it("excludes Audience Network and keeps travel interests", () => {
    const targeting = metaOfficialTargeting(resolveGeos(["SA", "AE"]).map((g) => g.iso2));
    expect(targeting.publisher_platforms).toEqual(["facebook", "instagram"]);
    expect(targeting.publisher_platforms).not.toContain("audience_network");
    expect(targeting.interests.length).toBeGreaterThan(0);
    expect(targeting.brand_safety_content_filter_levels).toContain("FACEBOOK_STANDARD");
  });
});

describe("budget hard stop", () => {
  it("flags 70% and 100% without competitor-click logic", () => {
    expect(budgetRatio(18, 25)).toBeGreaterThan(0.7);
    expect(wouldExceedCap(25, 25)).toBe(true);
    const campaigns: StoredCampaign[] = [
      {
        id: "1",
        platform: "google",
        name: "t",
        landingUrl: "https://lonaliza.com",
        dailyBudget: 25,
        currency: "USD",
        status: "enabled",
        createdAt: new Date().toISOString(),
        approved: true,
        dryRun: false,
        geoCodes: ["SA"],
      },
    ];
    const alerts = evaluateBudgetAlerts(
      [
        {
          platform: "google",
          spend: 25,
          clicks: 10,
          impressions: 100,
          ctr: 10,
          conversions: 1,
          currency: "USD",
        },
      ],
      campaigns,
      { alert70: false, alert100: false }
    );
    expect(alerts.some((a) => a.level === 100 && a.paused)).toBe(true);
  });
});
