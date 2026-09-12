import { promises as fs } from "fs";
import path from "path";
import { sendTelegramDocument, sendTelegramMessage, sendTelegramPhoto } from "@/lib/automation/channels/telegram";
import { publishApprovedStudio } from "@/lib/automation/publish-approved";
import { readStudioLastOutput, writeStudioLastOutput } from "@/lib/studio/last-output";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import {
  ApprovalTransitionError,
  canEnableCron,
  completeStudioDraft,
  formatApprovalDecisionReply,
  formatTelegramReviewCard,
  isApprovalState,
  newApprovalId,
  nextApprovalState,
  parseTelegramApprovalCommand,
  type ApprovalActor,
  type ApprovalEvent,
  type ApprovalRecord,
  type StudioJobDraft,
} from "@/lib/automation/approval";
import { buildStudioJobDraft } from "@/lib/automation/studio-chat";
import { AUTOMATION_TIMEZONE, isMessagingJobType } from "@/lib/automation/types";
import { getGeminiPublicConfig, resolveGeminiApiKey } from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import { automationDataDir } from "./paths";
import { upsertAutomationJob } from "./store";

type ApprovalsFile = {
  version: 1;
  items: ApprovalRecord[];
  updatedAt: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function approvalsStoreFile(): string {
  return path.join(automationDataDir(), "approvals.json");
}

function emptyFile(): ApprovalsFile {
  return { version: 1, items: [], updatedAt: nowIso() };
}

function normalizeRecord(raw: unknown): ApprovalRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  if (typeof rec.id !== "string" || !isApprovalState(rec.state) || typeof rec.prompt !== "string") {
    return null;
  }
  try {
    return {
      id: rec.id,
      state: rec.state,
      prompt: rec.prompt,
      draft: completeStudioDraft(rec.draft),
      jobId: typeof rec.jobId === "string" ? rec.jobId : null,
      telegramChatId: typeof rec.telegramChatId === "string" ? rec.telegramChatId : null,
      telegramMessageId: typeof rec.telegramMessageId === "string" ? rec.telegramMessageId : null,
      editNotes: typeof rec.editNotes === "string" ? rec.editNotes : "",
      rejectReason: typeof rec.rejectReason === "string" ? rec.rejectReason : "",
      actor: rec.actor === "telegram" || rec.actor === "copilot" ? rec.actor : "studio",
      createdAt: typeof rec.createdAt === "string" ? rec.createdAt : nowIso(),
      updatedAt: typeof rec.updatedAt === "string" ? rec.updatedAt : nowIso(),
      submittedAt: typeof rec.submittedAt === "string" ? rec.submittedAt : null,
      decidedAt: typeof rec.decidedAt === "string" ? rec.decidedAt : null,
    };
  } catch {
    return null;
  }
}

let writeChain: Promise<void> = Promise.resolve();

async function mutate<T>(fn: (file: ApprovalsFile) => T | Promise<T>): Promise<T> {
  let result!: T;
  writeChain = writeChain.then(async () => {
    const file = await readFile();
    result = await fn(file);
    file.version = 1;
    file.updatedAt = nowIso();
    await fs.mkdir(path.dirname(approvalsStoreFile()), { recursive: true });
    await fs.writeFile(approvalsStoreFile(), JSON.stringify(file, null, 2), { mode: 0o600 });
  });
  await writeChain;
  return result;
}

async function readFile(): Promise<ApprovalsFile> {
  try {
    const raw = JSON.parse(await fs.readFile(approvalsStoreFile(), "utf8")) as ApprovalsFile;
    const items = (Array.isArray(raw.items) ? raw.items : []).map(normalizeRecord).filter((item): item is ApprovalRecord => item != null);
    return { version: 1, items, updatedAt: raw.updatedAt || nowIso() };
  } catch {
    return emptyFile();
  }
}

export async function listApprovals(): Promise<ApprovalRecord[]> {
  return (await readFile()).items.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getApproval(id: string): Promise<ApprovalRecord | null> {
  const items = await listApprovals();
  return items.find((item) => item.id === id) || null;
}

export async function latestAwaitingApproval(chatId?: string): Promise<ApprovalRecord | null> {
  const items = await listApprovals();
  return (
    items.find((item) => {
      if (item.state !== "awaiting_approval") return false;
      if (chatId && item.telegramChatId && item.telegramChatId !== chatId) return false;
      return true;
    }) || null
  );
}

export async function resolvePendingApproval(approvalId?: string, chatId?: string): Promise<ApprovalRecord | null> {
  if (approvalId) {
    const found = await getApproval(approvalId);
    if (found) return found;
  }
  return latestAwaitingApproval(chatId);
}

async function saveRecord(next: ApprovalRecord): Promise<ApprovalRecord> {
  return mutate((file) => {
    const idx = file.items.findIndex((item) => item.id === next.id);
    if (idx >= 0) file.items[idx] = next;
    else file.items.unshift(next);
    return next;
  });
}

export async function deleteApprovalRecord(id: string): Promise<void> {
  await mutate((file) => {
    file.items = file.items.filter((item) => item.id !== id);
  });
}

export async function purgeApprovalByJobId(jobId: string): Promise<void> {
  await mutate((file) => {
    file.items = file.items.filter((item) => item.jobId !== jobId);
  });
}

export async function proposeAutomationDraft(input: {
  prompt: string;
  notes?: string;
  previousId?: string;
  actor?: ApprovalActor;
}): Promise<{ record: ApprovalRecord; replyAr: string; usedGemini: boolean }> {
  const prompt = input.prompt.trim();
  if (!prompt) throw new Error("وصف الوظيفة مطلوب");

  const previous = input.previousId ? await getApproval(input.previousId) : null;
  const [{ apiKey }, config] = await Promise.all([resolveGeminiApiKey(), getGeminiPublicConfig()]);
  const turn = await buildStudioJobDraft({
    prompt,
    notes: input.notes,
    previous: previous?.draft || null,
    apiKey: apiKey,
    model: normalizeGeminiModelId(config.model),
  });

  const ts = nowIso();
  const reuse = Boolean(previous && previous.state !== "active");
  const record: ApprovalRecord = {
    id: reuse && previous ? previous.id : newApprovalId(),
    state: "draft",
    prompt,
    draft: turn.draft,
    jobId: reuse && previous ? previous.jobId : null,
    telegramChatId: reuse && previous ? previous.telegramChatId : null,
    telegramMessageId: null,
    editNotes: input.notes?.trim() || previous?.editNotes || "",
    rejectReason: "",
    actor: input.actor || "studio",
    createdAt: reuse && previous ? previous.createdAt : ts,
    updatedAt: ts,
    submittedAt: null,
    decidedAt: null,
  };
  await saveRecord(record);
  return { record, replyAr: turn.replyAr, usedGemini: turn.usedGemini };
}

async function materializeLiveJob(record: ApprovalRecord): Promise<string> {
  if (!canEnableCron(record.state)) {
    throw new Error("لا يمكن تفعيل الكرون قبل الاعتماد");
  }
  const { draft } = record;
  const job = await upsertAutomationJob({
    id: record.jobId || undefined,
    name: draft.name,
    type: draft.type,
    enabled: true,
    cron: draft.cron,
    timezone: AUTOMATION_TIMEZONE,
    maxPerRun: draft.maxPerRun,
    maxPerDay: draft.maxPerDay,
    locales: draft.locales,
    dryRun: draft.dryRun,
    consentSource: draft.consentSource || (isMessagingJobType(draft.type) ? "crm_opt_in" : undefined),
    settings: {
      sourcePrompt: record.prompt,
      accounts: draft.accounts,
      budget: draft.budget,
      autoPublish: false,
      approvalId: record.id,
      studio: true,
    },
  });
  return job.id;
}

export async function applyApprovalEvent(input: {
  id: string;
  event: ApprovalEvent;
  actor?: ApprovalActor;
  reason?: string;
  notes?: string;
  nextDraft?: StudioJobDraft;
  telegramChatId?: string;
  publishMode?: "publish" | "launch";
}): Promise<{ record: ApprovalRecord; message: string }> {
  const existing = await getApproval(input.id);
  if (!existing) throw new Error("طلب الاعتماد غير موجود");

  const nextState = nextApprovalState(existing.state, input.event);
  const ts = nowIso();
  let record: ApprovalRecord = {
    ...existing,
    state: nextState,
    actor: input.actor || existing.actor,
    updatedAt: ts,
    editNotes: input.notes?.trim() || existing.editNotes,
    rejectReason: input.event === "reject" ? (input.reason || existing.rejectReason || "").trim() : existing.rejectReason,
    submittedAt: input.event === "submit" ? ts : existing.submittedAt,
    decidedAt: input.event === "approve" || input.event === "reject" ? ts : existing.decidedAt,
    draft: input.nextDraft ? completeStudioDraft(input.nextDraft) : existing.draft,
    telegramChatId: input.telegramChatId || existing.telegramChatId,
  };

  if (input.event === "approve") {
    record.state = "active";
    if (!canEnableCron(record.state)) {
      throw new ApprovalTransitionError(existing.state, input.event);
    }
    record.jobId = await materializeLiveJob(record);
    if (input.publishMode === "publish" || input.publishMode === "launch") {
      const budgetMatch = String(record.draft.budget || "").match(/(\d+(?:\.\d+)?)/);
      const budget = budgetMatch ? Number(budgetMatch[1]) : 0;
      const wantBoost = input.publishMode === "launch" || budget > 0;
      await publishApprovedStudio({
        approved: true,
        caption: record.draft.summaryAr || record.draft.name,
        boost: wantBoost && budget > 0,
        budget: budget > 0 ? budget : wantBoost ? 20 : undefined,
      });
      await writeStudioLastOutput({ pendingPublish: false });
    }
  }

  if (input.event === "submit") {
    const settings = await getCommsSettings();
    const chatId = (input.telegramChatId || settings.telegramDefaultChatId || "").trim();
    if (chatId) {
      const last = await readStudioLastOutput();
      if (last?.imagePaths[0]) {
        await sendTelegramPhoto({
          chatId,
          filePath: last.imagePaths[0],
          caption: formatTelegramReviewCard(record).slice(0, 1024),
        });
      } else if (last?.videoPaths[0]) {
        await sendTelegramDocument({
          chatId,
          filePath: last.videoPaths[0],
          caption: formatTelegramReviewCard(record).slice(0, 1024),
        });
      }
      const sent = await sendTelegramMessage({
        chatId,
        text: formatTelegramReviewCard(record),
      });
      record = {
        ...record,
        telegramChatId: chatId,
        telegramMessageId: sent.providerId || record.telegramMessageId,
      };
    }
  }

  if (input.event === "edit" && input.notes?.trim() && !input.nextDraft) {
    const rebuilt = await proposeAutomationDraft({
      prompt: existing.prompt,
      notes: input.notes,
      previousId: existing.id,
      actor: input.actor,
    });
    return { record: rebuilt.record, message: rebuilt.replyAr };
  }

  const saved = await saveRecord(record);
  return { record: saved, message: formatApprovalDecisionReply(saved, input.event) };
}

export async function submitForApproval(id: string, actor: ApprovalActor = "studio"): Promise<{ record: ApprovalRecord; message: string }> {
  return applyApprovalEvent({ id, event: "submit", actor });
}

export async function approveAutomation(id: string, actor: ApprovalActor = "studio"): Promise<{ record: ApprovalRecord; message: string }> {
  return applyApprovalEvent({ id, event: "approve", actor });
}

export async function rejectAutomation(
  id: string,
  reason?: string,
  actor: ApprovalActor = "studio"
): Promise<{ record: ApprovalRecord; message: string }> {
  return applyApprovalEvent({ id, event: "reject", actor, reason });
}

export async function reviseAutomation(
  id: string,
  notes: string,
  actor: ApprovalActor = "studio"
): Promise<{ record: ApprovalRecord; message: string }> {
  return applyApprovalEvent({ id, event: "edit", actor, notes });
}

export function isTelegramApprovalAdminChat(chatId: string, defaultChatId: string, pending: ApprovalRecord | null): boolean {
  const incoming = String(chatId || "").trim();
  if (!incoming) return false;
  if (defaultChatId && incoming === defaultChatId.trim()) return true;
  return Boolean(pending?.telegramChatId && pending.telegramChatId === incoming);
}

export async function handleTelegramApprovalText(
  chatId: string,
  text: string
): Promise<{ handled: boolean; reply?: string }> {
  const intent = parseTelegramApprovalCommand(text);
  if (intent.kind === "none") return { handled: false };

  const settings = await getCommsSettings();
  const pending = await resolvePendingApproval(intent.approvalId, chatId);
  if (!isTelegramApprovalAdminChat(chatId, settings.telegramDefaultChatId, pending)) {
    return { handled: false };
  }
  if (!pending) {
    if (intent.kind === "approve") {
      const last = await readStudioLastOutput();
      const hasMedia =
        Boolean(last?.pendingPublish) &&
        Boolean((last?.imageUrls?.length || 0) + (last?.videoUrls?.length || 0));
      if (hasMedia && last) {
        const published = await publishApprovedStudio({
          approved: true,
          caption: last.caption,
          boost: intent.mode === "launch",
          budget: intent.mode === "launch" ? 20 : undefined,
        });
        await writeStudioLastOutput({ pendingPublish: false });
        return {
          handled: true,
          reply: published.ok
            ? intent.mode === "launch"
              ? "نُشر للحسابات المتصلة وطُلب تعزيز إعلاني (يتطلب مفاتيح ميتا وميزانية)."
              : "نُشر للحسابات المتصلة بعد موافقة «انشر»."
            : `تعذّر النشر: ${published.results
                .map((r) => (r.ok ? r.platform : `${r.platform}:${r.error.message}`))
                .join(", ") || "فشل"}`,
        };
      }
    }
    return { handled: true, reply: "لا يوجد طلب أتمتة بانتظار الموافقة." };
  }

  try {
    let result: { record: ApprovalRecord; message: string };
    switch (intent.kind) {
      case "approve":
        result = await applyApprovalEvent({
          id: pending.id,
          event: "approve",
          actor: "telegram",
          publishMode: intent.mode,
        });
        break;
      case "reject":
        result = await rejectAutomation(pending.id, intent.reason, "telegram");
        break;
      case "edit":
        result = await reviseAutomation(pending.id, intent.notes, "telegram");
        break;
      default: {
        const _never: never = intent;
        return _never;
      }
    }
    return { handled: true, reply: result.message };
  } catch (error) {
    return {
      handled: true,
      reply: error instanceof Error ? error.message : "تعذّر تنفيذ أمر الاعتماد",
    };
  }
}
