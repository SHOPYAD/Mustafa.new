import { sendTelegramDocument, sendTelegramMessage, sendTelegramPhoto } from "@/lib/automation/channels/telegram";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import { siteOrigin } from "@/lib/automation/site-url";
import type { AutomationJobContext, AutomationJobResult } from "@/lib/automation/types";
import { generateNanoBananaImage } from "@/lib/studio/creative/nano-banana";
import {
  publicStudioUrl,
  sanitizeStudioFileName,
  writeStudioBuffer,
} from "@/lib/studio/creative/store";
import { writeStudioLastOutput } from "@/lib/studio/last-output";
import { saveWeeklyPlan } from "@/lib/studio/planner/store";
import { generateWeeklyTourismPlan } from "@/lib/studio/planner/weekly-plan";
import { generateStudioVideo } from "@/lib/studio/video/generate";
import { publishApprovedStudio } from "@/lib/automation/publish-approved";
import { queueStudioPublishApproval } from "@/lib/server/mcp/connectors/studio-handoff";

function promptFrom(ctx: AutomationJobContext, fallback: string): string {
  const settings = { ...(ctx.job?.settings || {}), ...(ctx.job?.payload || {}) };
  return String(settings.prompt || settings.topic || ctx.job?.name || fallback).trim();
}

async function notifyAdmin(text: string, media?: { photoPath?: string; docPath?: string; caption?: string }) {
  const settings = await getCommsSettings();
  const chatId = settings.telegramDefaultChatId;
  if (!chatId) return { sent: false, reason: "no_admin_chat" };
  if (media?.photoPath) {
    await sendTelegramPhoto({ chatId, filePath: media.photoPath, caption: media.caption || text.slice(0, 1024) });
  } else if (media?.docPath) {
    await sendTelegramDocument({ chatId, filePath: media.docPath, caption: media.caption || text.slice(0, 1024) });
  } else {
    await sendTelegramMessage({ chatId, text });
  }
  return { sent: true };
}

async function markPendingAndQueue(caption: string): Promise<string | undefined> {
  const queued = await queueStudioPublishApproval(caption);
  await writeStudioLastOutput({
    caption,
    pendingPublish: true,
    approvalId: queued.approvalId || null,
  });
  return queued.approvalId;
}

export async function runWeeklyStudioPlan(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const dryRun = Boolean(ctx.dryRun);
  const settings = { ...(ctx.job?.settings || {}) };
  const plan = await generateWeeklyTourismPlan({
    locale: settings.locale || ctx.locales?.[0] || "ar",
    now: ctx.now,
  });
  if (dryRun) {
    return {
      ok: true,
      processed: plan.items.length,
      message: `تجريبي: خطة ${plan.weekStart} بـ ${plan.items.length} عناصر — بلا إرسال.`,
      dryRun: true,
      details: { planId: plan.id },
    };
  }
  const saved = await saveWeeklyPlan(plan);
  const caption = `خطة الأسبوع ${plan.weekStart}\n${plan.items
    .slice(0, 7)
    .map((item) => `${item.date} · ${item.platform} · ${item.topic}`)
    .join("\n")}\n\nللنشر بعد الاعتماد: انشر`;
  await writeStudioLastOutput({
    caption: plan.items[0]?.captionDraft || caption,
    platforms: [...new Set(plan.items.map((item) => item.platform))],
    pendingPublish: false,
  });
  await notifyAdmin(caption);
  return {
    ok: true,
    processed: plan.items.length,
    message: `حُفظت خطة ${plan.id} وأُرسلت للمراجعة.`,
    dryRun,
    details: { planId: plan.id, path: saved.relativePath, url: saved.url },
  };
}

export async function runStudioGenerateImage(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const dryRun = Boolean(ctx.dryRun);
  const prompt = promptFrom(ctx, "منظر سياحي لتركيا من لوناليزا للسياحة");
  if (dryRun) {
    return { ok: true, processed: 0, message: `تجريبي: ستُولَّد صورة «${prompt.slice(0, 80)}»`, dryRun: true };
  }
  const { image, tried } = await generateNanoBananaImage({ prompt, aspectRatio: "4:5" });
  const fileName = sanitizeStudioFileName(prompt, image.mimeType.includes("jpeg") ? ".jpg" : ".png");
  const saved = await writeStudioBuffer({ folder: "images", fileName, buffer: image.buffer });
  const url = publicStudioUrl("creative", saved.relativePath);
  const origin = siteOrigin();
  const absolute = `${origin}${url}`;
  await writeStudioLastOutput({
    caption: prompt,
    imagePaths: [saved.absolutePath],
    imageUrls: [absolute],
    pendingPublish: true,
  });
  const approvalId = await markPendingAndQueue(prompt);
  return {
    ok: true,
    processed: 1,
    message: `وُلدت صورة عبر ${image.model} وأُرسلت لتيليجرام — بانتظار «انشر»`,
    dryRun,
    details: { path: saved.relativePath, url: absolute, tried, approvalId },
  };
}

export async function runStudioGenerateVideo(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const dryRun = Boolean(ctx.dryRun);
  const prompt = promptFrom(ctx, "ريل سياحي قصير عن تركيا");
  if (dryRun) {
    return { ok: true, processed: 0, message: `تجريبي: فيديو «${prompt.slice(0, 80)}»`, dryRun: true };
  }
  const result = await generateStudioVideo({ prompt, durationMinutes: 1, locale: "ar" });
  if (!result.ok || !result.video) {
    return {
      ok: false,
      processed: 0,
      message: result.error || "تعذّر توليد الفيديو",
      dryRun,
      details: { attempts: result.attempts, ffmpeg: result.ffmpeg },
    };
  }
  const origin = siteOrigin();
  const absolute = result.video.url.startsWith("http") ? result.video.url : `${origin}${result.video.url}`;
  await writeStudioLastOutput({
    caption: prompt,
    videoPaths: [result.video.absolutePath],
    videoUrls: [absolute],
    pendingPublish: true,
  });
  const approvalId = await markPendingAndQueue(prompt);
  return {
    ok: true,
    processed: 1,
    message: `فيديو عبر ${result.engine}/${result.model} وأُرسل لتيليجرام — بانتظار «انشر»`,
    dryRun,
    details: {
      path: result.video.relativePath,
      url: absolute,
      ffmpeg: result.ffmpeg,
      attempts: result.attempts,
      approvalId,
    },
  };
}

export async function runStudioSchedulePublish(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const dryRun = Boolean(ctx.dryRun);
  const settings = { ...(ctx.job?.settings || {}) };
  const approved = settings.approved === true || ctx.job?.settings?.approved === true;
  if (!approved) {
    return {
      ok: true,
      processed: 0,
      skipped: 1,
      message: "بانتظار موافقة «انشر». لم يُنشر شيء.",
      dryRun,
    };
  }
  if (dryRun) {
    return {
      ok: true,
      processed: 0,
      message: "تجريبي: سيُستدعى publishToConnectedAccounts بعد الاعتماد.",
      dryRun: true,
    };
  }
  const budget = Number(settings.budget || settings.dailyBudget || 0) || undefined;
  const boost = settings.boost === true && Boolean(budget && budget > 0);
  const published = await publishApprovedStudio({
    caption: String(settings.caption || ctx.job?.name || ""),
    approved: true,
    boost,
    budget,
  });
  await writeStudioLastOutput({ pendingPublish: false });
  return {
    ok: published.ok,
    processed: published.results.filter((row) => row.ok).length,
    message: published.ok ? "نُشر للحسابات المتصلة." : "النشر الجزئي أو فشل — راجع التفاصيل.",
    dryRun: false,
    details: published,
  };
}
