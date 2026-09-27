import { sendCommsEmail } from "@/lib/automation/channels/email";
import { sendTelegramMessage } from "@/lib/automation/channels/telegram";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import { loadRecentPlaceListings } from "@/lib/automation/handlers/places";
import { listAutomationLogs } from "@/lib/server/automation/logs";
import { listAutomationJobs } from "@/lib/server/automation/store";
import { getServerEnv } from "@/lib/server/env-store";
import type { AutomationJobContext, AutomationJobResult } from "@/lib/automation/types";

function weekAgo(now: Date): Date {
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}

export async function runWeeklyAdminDigest(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const dryRun = Boolean(ctx.dryRun);
  const now = ctx.now || new Date();
  const since = weekAgo(now);
  const [jobs, logs, places] = await Promise.all([
    listAutomationJobs(),
    listAutomationLogs(400),
    loadRecentPlaceListings(3),
  ]);
  const recent = logs.filter((entry) => {
    const at = new Date(entry.at);
    return !Number.isNaN(at.getTime()) && at >= since;
  });
  const errors = recent.filter((entry) => entry.level === "error");
  const enabled = jobs.filter((job) => job.enabled);
  const placeLines =
    places.length === 0
      ? ["لا تقييمات أماكن محفوظة بعد (شغّلوا places.reviews)."]
      : places.flatMap((place) => [
          `• ${place.name}${place.rating != null ? ` ★${place.rating}` : ""} — ${place.reviews.length} نص`,
          ...place.reviews.slice(0, 2).map((review) => `  «${review.text.slice(0, 120)}»`),
        ]);
  const lines = [
    `ملخص أتمتة لوناليزا — ${now.toISOString().slice(0, 10)}`,
    `وظائف مفعّلة: ${enabled.length} / ${jobs.length}`,
    `أحداث الأسبوع: ${recent.length} · أخطاء: ${errors.length}`,
    "",
    ...enabled.slice(0, 12).map((job) => `• ${job.name} (${job.type}) — آخر تشغيل: ${job.lastRunAt || "—"}`),
    "",
    "أفكار من تقييمات النشاط (نص فقط):",
    ...placeLines,
    "",
    errors.length ? "آخر أخطاء:" : "لا أخطاء مسجّلة هذا الأسبوع.",
    ...errors.slice(0, 8).map((entry) => `- ${entry.at.slice(0, 16)} ${entry.message}`),
  ];
  const text = lines.join("\n");

  if (dryRun) {
    return {
      ok: true,
      processed: 0,
      message: `تجريبي: ملخص ${recent.length} حدث — بلا إرسال.`,
      dryRun: true,
      details: { preview: text.slice(0, 400) },
    };
  }

  const settings = await getCommsSettings();
  let sent = 0;
  if (settings.telegramDefaultChatId && settings.telegramBotToken) {
    const tg = await sendTelegramMessage({ chatId: settings.telegramDefaultChatId, text });
    if (tg.ok) sent += 1;
  }
  const adminEmail = (await getServerEnv("ADMIN_DIGEST_EMAIL")) || (await getServerEnv("ADMIN_EMAIL"));
  if (adminEmail.includes("@")) {
    const mail = await sendCommsEmail({
      to: adminEmail.trim(),
      subject: "ملخص أتمتة لوناليزا الأسبوعي",
      text,
      locale: "ar",
    });
    if (mail.ok) sent += 1;
  }

  return {
    ok: sent > 0,
    processed: sent,
    message: sent ? `أُرسل الملخص عبر ${sent} قناة.` : "لا قناة إدارة مهيأة (تيليجرام أو ADMIN_DIGEST_EMAIL).",
    dryRun,
  };
}
