import { randomBytes } from "crypto";
import { sendTelegramMessage } from "@/lib/automation/channels/telegram";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import { getServerEnv } from "@/lib/server/env-store";
import { evaluateBudgetAlerts } from "./budget";
import { googleAdsReady, metaAdsReady, resolveAdsCredentials } from "./config";
import { fetchGoogleInsights } from "./google/insights";
import { pauseGoogleCampaigns } from "./google/campaigns";
import { fetchMetaInsights } from "./meta/insights";
import { pauseMetaCampaigns } from "./meta/campaigns";
import {
  latestReport,
  listCampaigns,
  loadAdsSettings,
  patchCampaign,
  saveAdsSettings,
  saveReport,
} from "./store";
import type { AdsMetrics, AdsReport } from "./types";

function money(n: number, currency: string): string {
  return `${n.toFixed(2)} ${currency}`;
}

function formatDigest(report: AdsReport): string {
  const lines = [
    "إعلانات لوناليزا — تقرير يومي",
    `التاريخ: ${report.date}`,
    report.mode === "dryRun" ? "الوضع: dryRun (بدون إنفاق حي)" : "الوضع: حي",
    "",
  ];
  for (const row of report.metrics) {
    const label = row.platform === "google" ? "Google Ads" : "Meta Ads";
    lines.push(
      `${label}: إنفاق ${money(row.spend, row.currency)} | نقرات ${row.clicks} | CTR ${row.ctr.toFixed(2)}% | تحويلات ${row.conversions}`
    );
    if (row.invalidClicks != null) {
      lines.push(`  نقرات غير صالحة (فلتر جوجل الرسمي): ${row.invalidClicks}`);
    }
  }
  if (report.alerts.length) {
    lines.push("");
    for (const alert of report.alerts) {
      const label = alert.platform === "google" ? "Google" : "Meta";
      lines.push(
        alert.level === 100
          ? `تنبيه ${label}: 100% من الميزانية اليومية — تم الإيقاف`
          : `تنبيه ${label}: 70% من الميزانية اليومية`
      );
    }
  }
  return lines.join("\n");
}

async function resolveReportChatId(override?: string): Promise<string> {
  if (override?.trim()) return override.trim();
  const settings = await loadAdsSettings();
  if (settings.telegramChatId) return settings.telegramChatId;
  const envChat = (await getServerEnv("ADS_TELEGRAM_CHAT_ID")).trim();
  if (envChat) return envChat;
  const comms = await getCommsSettings();
  return comms.telegramDefaultChatId || "";
}

export async function collectAdsMetrics(): Promise<{
  metrics: AdsMetrics[];
  mode: "dryRun" | "live";
}> {
  const [creds, settings] = await Promise.all([resolveAdsCredentials(), loadAdsSettings()]);
  const currency = settings.currency || "USD";
  const metrics: AdsMetrics[] = [];
  let live = false;
  if (googleAdsReady(creds)) {
    metrics.push(await fetchGoogleInsights(creds, currency));
    live = true;
  } else {
    metrics.push({
      platform: "google",
      spend: 0,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      conversions: 0,
      invalidClicks: 0,
      currency,
    });
  }
  if (metaAdsReady(creds)) {
    metrics.push(await fetchMetaInsights(creds, currency));
    live = true;
  } else {
    metrics.push({
      platform: "meta",
      spend: 0,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      conversions: 0,
      currency,
    });
  }
  return { metrics, mode: live ? "live" : "dryRun" };
}

export async function runAdsTelegramReport(options?: {
  chatId?: string;
  force?: boolean;
}): Promise<AdsReport> {
  const today = new Date().toISOString().slice(0, 10);
  const [settings, campaigns, collected] = await Promise.all([
    loadAdsSettings(),
    listCampaigns(),
    collectAdsMetrics(),
  ]);
  const already70 = settings.alert70SentOn === today;
  const already100 = settings.alert100SentOn === today;
  const alerts = evaluateBudgetAlerts(collected.metrics, campaigns, {
    alert70: already70 && !options?.force,
    alert100: already100 && !options?.force,
  });

  const creds = await resolveAdsCredentials();
  let paused = false;
  for (const alert of alerts) {
    if (alert.level !== 100) continue;
    const targets = campaigns.filter(
      (c) => c.platform === alert.platform && c.status === "enabled" && c.providerId
    );
    if (alert.platform === "google") {
      await pauseGoogleCampaigns(
        creds,
        targets.map((c) => c.providerResource || "").filter(Boolean)
      );
    } else {
      await pauseMetaCampaigns(
        creds,
        targets.map((c) => c.providerId || "").filter(Boolean)
      );
    }
    for (const row of targets) {
      await patchCampaign(row.id, { status: "capped" });
    }
    paused = paused || targets.length > 0;
    alert.paused = paused;
  }

  if (alerts.some((a) => a.level === 70)) {
    await saveAdsSettings({ alert70SentOn: today });
  }
  if (alerts.some((a) => a.level === 100)) {
    await saveAdsSettings({ alert100SentOn: today });
  }

  const report: AdsReport = {
    id: `rpt_${Date.now().toString(36)}_${randomBytes(3).toString("hex")}`,
    generatedAt: new Date().toISOString(),
    date: today,
    mode: collected.mode,
    metrics: collected.metrics,
    alerts,
    telegramSent: false,
  };

  const chatId = await resolveReportChatId(options?.chatId);
  if (chatId) {
    const sent = await sendTelegramMessage({ chatId, text: formatDigest(report) });
    report.telegramSent = sent.ok;
    report.telegramError = sent.error;
  } else {
    report.telegramError = "telegram_chat_missing";
  }

  await saveReport(report);
  return report;
}

export async function lastAdsReport(): Promise<AdsReport | null> {
  return latestReport();
}

export { formatDigest };
