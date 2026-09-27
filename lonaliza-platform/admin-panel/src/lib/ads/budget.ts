import type { AdsBudgetAlert, AdsMetrics, AdsPlatform, StoredCampaign } from "./types";

export function toMicros(amount: number): number {
  return Math.round(Number(amount) * 1_000_000);
}

export function fromMicros(micros: number): number {
  return Number(micros || 0) / 1_000_000;
}

/** Meta Marketing API amounts are in the account currency's minor units (cents). */
export function toMinorUnits(amount: number): number {
  return Math.round(Number(amount) * 100);
}

export function fromMinorUnits(cents: number): number {
  return Number(cents || 0) / 100;
}

export function budgetRatio(spend: number, dailyBudget: number): number {
  if (!(dailyBudget > 0)) return 0;
  return spend / dailyBudget;
}

export function wouldExceedCap(spend: number, cap: number, incoming = 0): boolean {
  if (!(cap > 0)) return true;
  return spend + incoming >= cap - 1e-9;
}

export function evaluateBudgetAlerts(
  metrics: AdsMetrics[],
  campaigns: StoredCampaign[],
  alreadySent: { alert70: boolean; alert100: boolean }
): AdsBudgetAlert[] {
  const dailyByPlatform = new Map<AdsPlatform, number>();
  for (const row of campaigns) {
    if (row.status === "dry_run" || row.status === "draft") continue;
    dailyByPlatform.set(
      row.platform,
      (dailyByPlatform.get(row.platform) || 0) + row.dailyBudget
    );
  }

  const alerts: AdsBudgetAlert[] = [];
  for (const row of metrics) {
    const daily = dailyByPlatform.get(row.platform) || 0;
    if (!(daily > 0)) continue;
    const ratio = budgetRatio(row.spend, daily);
    if (ratio >= 1 && !alreadySent.alert100) {
      alerts.push({
        platform: row.platform,
        level: 100,
        spend: row.spend,
        dailyBudget: daily,
        ratio,
        paused: true,
      });
    } else if (ratio >= 0.7 && !alreadySent.alert70) {
      alerts.push({
        platform: row.platform,
        level: 70,
        spend: row.spend,
        dailyBudget: daily,
        ratio,
        paused: false,
      });
    }
  }
  return alerts;
}

export function lifetimeCapExceeded(
  spendLifetime: number,
  lifetimeBudget?: number
): boolean {
  if (!(lifetimeBudget && lifetimeBudget > 0)) return false;
  return spendLifetime >= lifetimeBudget - 1e-9;
}
