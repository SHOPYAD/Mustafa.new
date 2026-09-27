import { completeStudioDraft } from "@/lib/automation/approval";
import { applyApprovalEvent, proposeAutomationDraft, submitForApproval } from "@/lib/server/automation/approval-store";
import { siteOrigin } from "@/lib/automation/site-url";
import {
  publicStudioUrl,
  sanitizeStudioFileName,
  writeStudioBuffer,
} from "@/lib/studio/creative/store";
import { writeStudioLastOutput } from "@/lib/studio/last-output";

export type HandoffKind = "image" | "video";

export type SavedStudioAsset = {
  kind: HandoffKind;
  fileName: string;
  relativePath: string;
  absolutePath: string;
  url: string;
  absoluteUrl: string;
};

export async function saveGeneratedStudioAsset(input: {
  kind: HandoffKind;
  buffer: Buffer;
  ext: ".png" | ".jpg" | ".jpeg" | ".webp" | ".mp4";
  fileHint: string;
  caption: string;
}): Promise<SavedStudioAsset> {
  const folder = input.kind === "video" ? "video" : "images";
  const ext = input.ext === ".jpeg" ? ".jpg" : input.ext;
  const fileName = sanitizeStudioFileName(input.fileHint, ext);
  const saved = await writeStudioBuffer({ folder, fileName, buffer: input.buffer });
  const url = publicStudioUrl(input.kind === "video" ? "video" : "creative", saved.relativePath);
  const origin = siteOrigin();
  const absoluteUrl = `${origin}${url}`;
  if (input.kind === "video") {
    await writeStudioLastOutput({
      caption: input.caption,
      videoPaths: [saved.absolutePath],
      videoUrls: [absoluteUrl],
    });
  } else {
    await writeStudioLastOutput({
      caption: input.caption,
      imagePaths: [saved.absolutePath],
      imageUrls: [absoluteUrl],
    });
  }
  return {
    kind: input.kind,
    fileName: saved.fileName,
    relativePath: saved.relativePath,
    absolutePath: saved.absolutePath,
    url,
    absoluteUrl,
  };
}

export async function notifyStudioReadyForApproval(input: {
  caption: string;
  asset: SavedStudioAsset;
}): Promise<{ sent: boolean; approvalId?: string }> {
  // Media is already in last-output; submitForApproval sends sendPhoto/sendDocument.
  const queued = await queueStudioPublishApproval(input.caption);
  await writeStudioLastOutput({
    caption: input.caption,
    pendingPublish: true,
    approvalId: queued.approvalId || null,
  });
  return { sent: true, approvalId: queued.approvalId };
}

export async function queueStudioPublishApproval(caption: string): Promise<{
  ok: boolean;
  content: string;
  approvalId?: string;
}> {
  const prompt = `نشر أصل الاستوديو بعد الاعتماد فقط: ${caption.slice(0, 200)}`;
  const proposed = await proposeAutomationDraft({
    prompt,
    actor: "studio",
  });
  await applyApprovalEvent({
    id: proposed.record.id,
    event: "edit",
    actor: "studio",
    nextDraft: completeStudioDraft({
      ...proposed.record.draft,
      type: "studio.schedule_publish",
      name: caption.slice(0, 80) || "نشر استوديو معتمد",
      dryRun: true,
      autoPublish: false,
      summaryAr: `إرسال للاعتماد ثم النشر عبر الحسابات المتصلة فقط — بلا نشر تلقائي. ${caption.slice(0, 200)}`,
    }),
  });
  const submitted = await submitForApproval(proposed.record.id, "studio");
  return {
    ok: true,
    content: submitted.message,
    approvalId: submitted.record.id,
  };
}

export async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`تعذّر تنزيل الأصل (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}
