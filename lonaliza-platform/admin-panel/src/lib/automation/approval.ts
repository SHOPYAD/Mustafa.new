import { z } from "zod";
import { catalogEntry } from "./catalog";
import {
  AUTOMATION_JOB_TYPES,
  AUTOMATION_LOCALES,
  AUTOMATION_TIMEZONE,
  isMessagingJobType,
  type AutomationJobType,
  type AutomationLocale,
} from "./types";

export const APPROVAL_STATES = ["draft", "awaiting_approval", "active", "rejected"] as const;
export type ApprovalState = (typeof APPROVAL_STATES)[number];

export const APPROVAL_EVENTS = ["submit", "approve", "reject", "edit"] as const;
export type ApprovalEvent = (typeof APPROVAL_EVENTS)[number];

export const APPROVAL_ID_PREFIX = "appr_";

const TRANSITIONS: Record<ApprovalState, Partial<Record<ApprovalEvent, ApprovalState>>> = {
  draft: { submit: "awaiting_approval", edit: "draft" },
  awaiting_approval: { approve: "active", reject: "rejected", edit: "draft" },
  active: {},
  rejected: { edit: "draft" },
};

export class ApprovalTransitionError extends Error {
  readonly from: ApprovalState;
  readonly event: ApprovalEvent;

  constructor(from: ApprovalState, event: ApprovalEvent) {
    super(`انتقال غير مسموح: ${from} ← ${event}`);
    this.name = "ApprovalTransitionError";
    this.from = from;
    this.event = event;
  }
}

export function isApprovalState(value: unknown): value is ApprovalState {
  return typeof value === "string" && (APPROVAL_STATES as readonly string[]).includes(value);
}

export function isApprovalEvent(value: unknown): value is ApprovalEvent {
  return typeof value === "string" && (APPROVAL_EVENTS as readonly string[]).includes(value);
}

export function nextApprovalState(from: ApprovalState, event: ApprovalEvent): ApprovalState {
  const next = TRANSITIONS[from][event];
  if (!next) throw new ApprovalTransitionError(from, event);
  return next;
}

/** Cron may run only after an explicit approve → active. */
export function canEnableCron(state: ApprovalState): boolean {
  return state === "active";
}

export function assertNeverApprovalState(state: never): never {
  throw new Error(`Unhandled approval state: ${String(state)}`);
}

export function assertNeverApprovalEvent(event: never): never {
  throw new Error(`Unhandled approval event: ${String(event)}`);
}

export function describeApprovalState(state: ApprovalState): string {
  switch (state) {
    case "draft":
      return "مسودة";
    case "awaiting_approval":
      return "بانتظار الموافقة";
    case "active":
      return "نشطة";
    case "rejected":
      return "مرفوضة";
    default:
      return assertNeverApprovalState(state);
  }
}

const localeSchema = z.enum(AUTOMATION_LOCALES);
const jobTypeSchema = z.enum(AUTOMATION_JOB_TYPES);

export const studioJobDraftSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: jobTypeSchema,
  cron: z.string().trim().min(1).max(80),
  timezone: z.literal(AUTOMATION_TIMEZONE),
  accounts: z.string().trim().min(1).max(200),
  budget: z.string().trim().min(1).max(200),
  locales: z.array(localeSchema).min(1),
  dryRun: z.boolean(),
  autoPublish: z.literal(false),
  maxPerRun: z.number().int().min(1).max(100),
  maxPerDay: z.number().int().min(1).max(500),
  consentSource: z.string().trim().min(1).max(80).optional(),
  summaryAr: z.string().trim().min(8).max(800),
});

export type StudioJobDraft = z.infer<typeof studioJobDraftSchema>;

export const ACCOUNTS_PLACEHOLDER = "حسابات التواصل — تُحدَّد لاحقاً (CRM / موافقة فقط)";
export const BUDGET_PLACEHOLDER = "ميزانية غير محددة — مراجعة يدوية قبل أي إنفاق";
export const DEFAULT_CONSENT_SOURCE = "crm_opt_in";

export function completeStudioDraft(raw: unknown): StudioJobDraft {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const type = jobTypeSchema.safeParse(rec.type);
  const resolvedType: AutomationJobType = type.success ? type.data : "articles.research_and_publish";
  const locales = Array.isArray(rec.locales)
    ? rec.locales.filter((item): item is AutomationLocale => localeSchema.safeParse(item).success)
    : [];
  const messaging = isMessagingJobType(resolvedType);
  const consent =
    typeof rec.consentSource === "string" && rec.consentSource.trim()
      ? rec.consentSource.trim()
      : messaging
        ? DEFAULT_CONSENT_SOURCE
        : undefined;
  const maxPerRun = clampInt(rec.maxPerRun, 3, 1, 100);
  const parsed = studioJobDraftSchema.parse({
    name: String(rec.name || "").trim() || catalogEntry(resolvedType).titleAr,
    type: resolvedType,
    cron: String(rec.cron || "").trim() || "0 9 * * *",
    timezone: AUTOMATION_TIMEZONE,
    accounts: String(rec.accounts || "").trim() || ACCOUNTS_PLACEHOLDER,
    budget: String(rec.budget || "").trim() || BUDGET_PLACEHOLDER,
    locales: locales.length ? [...new Set(locales)] : [...AUTOMATION_LOCALES],
    dryRun: rec.dryRun !== false,
    autoPublish: false,
    maxPerRun,
    maxPerDay: clampInt(rec.maxPerDay, Math.max(maxPerRun * 2, 10), 1, 500),
    consentSource: consent,
    summaryAr:
      String(rec.summaryAr || "").trim() ||
      `مسودة ${catalogEntry(resolvedType).titleAr} — بدون نشر تلقائي حتى الموافقة.`,
  });
  return parsed;
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export type ApprovalActor = "studio" | "copilot" | "telegram";

export type ApprovalRecord = {
  id: string;
  state: ApprovalState;
  prompt: string;
  draft: StudioJobDraft;
  jobId: string | null;
  telegramChatId: string | null;
  telegramMessageId: string | null;
  editNotes: string;
  rejectReason: string;
  actor: ApprovalActor;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  decidedAt: string | null;
};

export type TelegramApprovalIntent =
  | { kind: "approve"; mode: "publish" | "launch"; approvalId?: string }
  | { kind: "reject"; reason: string; approvalId?: string }
  | { kind: "edit"; notes: string; approvalId?: string }
  | { kind: "none" };

const TASHKEEL = /[\u064B-\u065F\u0670\u0640]/g;
const APPROVAL_ID_RE = /\b(appr_[a-z0-9]+)\b/i;
const OTP_ONLY_RE = /^\d{4,8}$/;

const PUBLISH_TOKENS = new Set(["انشر", "نشر", "انشري", "انشرها", "انشرو", "publish", "approve"]);
const LAUNCH_TOKENS = new Set(["اطلق", "اطلقي", "اطلقها", "اطلقو", "فعل", "فعلها", "launch", "activate"]);
const REJECT_TOKENS = new Set(["ارفض", "رفض", "ارفضي", "رفضها", "reject", "deny"]);
const EDIT_TOKENS = new Set(["عدل", "تعديل", "عدلي", "راجع", "edit", "revise"]);

const SLASH_MAP: Record<string, TelegramApprovalIntent["kind"] | "publish" | "launch"> = {
  "/publish": "publish",
  "/approve": "publish",
  "/launch": "launch",
  "/activate": "launch",
  "/reject": "reject",
  "/deny": "reject",
  "/edit": "edit",
  "/revise": "edit",
};

function foldArabic(text: string): string {
  return text
    .normalize("NFKC")
    .replace(TASHKEEL, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .toLowerCase();
}

export function normalizeApprovalCommandText(text: string): string {
  return foldArabic(String(text || ""))
    .replace(/[«»""''`]/g, " ")
    .replace(/[^\p{L}\p{N}#/_.\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractApprovalId(text: string): string | undefined {
  const match = String(text || "").match(APPROVAL_ID_RE);
  return match?.[1]?.toLowerCase();
}

function classifyToken(token: string): "publish" | "launch" | "reject" | "edit" | null {
  const bare = token.replace(/^\/+/, "");
  if (PUBLISH_TOKENS.has(bare)) return "publish";
  if (LAUNCH_TOKENS.has(bare)) return "launch";
  if (REJECT_TOKENS.has(bare)) return "reject";
  if (EDIT_TOKENS.has(bare)) return "edit";
  return null;
}

function startsWithNegation(tokens: string[]): boolean {
  if (!tokens.length) return false;
  const first = tokens[0];
  if (first === "لا" || first === "لات" || first === "dont" || first === "don't" || first === "not") {
    return true;
  }
  return first.startsWith("لات") || first === "دون";
}

/**
 * Maps admin Telegram replies to an approval intent.
 * Start/near-start verb matching — not a loose includes() scan.
 */
export function parseTelegramApprovalCommand(text: string): TelegramApprovalIntent {
  const raw = String(text || "").trim();
  if (!raw) return { kind: "none" };

  const approvalId = extractApprovalId(raw);
  const stripped = raw.replace(APPROVAL_ID_RE, " ").replace(/#/g, " ");
  const normalized = normalizeApprovalCommandText(stripped);
  if (!normalized || OTP_ONLY_RE.test(normalized.replace(/\s/g, ""))) {
    return { kind: "none" };
  }

  const tokens = normalized.split(" ");
  if (startsWithNegation(tokens)) return { kind: "none" };

  if (tokens[0]?.startsWith("/") && !SLASH_MAP[tokens[0]]) {
    return { kind: "none" };
  }

  const slash = tokens[0]?.startsWith("/") ? SLASH_MAP[tokens[0]] : undefined;
  const scanLimit = tokens.length <= 6 ? Math.min(tokens.length, 3) : 1;
  let verb: "publish" | "launch" | "reject" | "edit" | null = null;
  let verbIndex = -1;

  if (slash === "publish" || slash === "launch" || slash === "reject" || slash === "edit") {
    verb = slash;
    verbIndex = 0;
  } else {
    for (let i = 0; i < scanLimit; i += 1) {
      const hit = classifyToken(tokens[i]);
      if (hit) {
        verb = hit;
        verbIndex = i;
        break;
      }
    }
  }

  if (!verb || verbIndex < 0) return { kind: "none" };

  const rest = tokens.slice(verbIndex + 1).join(" ").trim();

  switch (verb) {
    case "publish":
      return { kind: "approve", mode: "publish", approvalId };
    case "launch":
      return { kind: "approve", mode: "launch", approvalId };
    case "reject":
      return { kind: "reject", reason: rest, approvalId };
    case "edit":
      return { kind: "edit", notes: rest, approvalId };
    default: {
      const _never: never = verb;
      return _never;
    }
  }
}

export function formatTelegramReviewCard(record: ApprovalRecord): string {
  const { draft } = record;
  const entry = catalogEntry(draft.type);
  const dry = draft.dryRun ? "نعم (تجريبي)" : "لا";
  return [
    "طلب موافقة أتمتة — لوناليزا",
    `#${record.id}`,
    "",
    `الحالة: ${describeApprovalState(record.state)}`,
    `الاسم: ${draft.name}`,
    `النوع: ${entry.titleAr} (${draft.type})`,
    `الجدول: ${draft.cron}`,
    `التوقيت: ${draft.timezone}`,
    `اللغات: ${draft.locales.join("، ")}`,
    `الحد/تشغيل: ${draft.maxPerRun} · الحد/يوم: ${draft.maxPerDay}`,
    `تجريبي: ${dry}`,
    "النشر التلقائي: لا — لا يُفعَّل الكرون قبل موافقتك",
    `الحسابات: ${draft.accounts}`,
    `الميزانية: ${draft.budget}`,
    draft.consentSource ? `مصدر الموافقة: ${draft.consentSource}` : "",
    "",
    `الملخص: ${draft.summaryAr}`,
    "",
    "للموافقة على النشر: انشر",
    "لتفعيل الجدولة: أطلق",
    "للرفض: ارفض ثم السبب",
    "للتعديل: عدّل ثم ملاحظتك",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function formatApprovalDecisionReply(
  record: ApprovalRecord,
  event: ApprovalEvent
): string {
  switch (event) {
    case "approve":
      return `تم الاعتماد. الوظيفة نشطة: ${record.draft.name} (${record.id})${record.jobId ? ` → ${record.jobId}` : ""}. الكرون مفعّل بتوقيت ${AUTOMATION_TIMEZONE}. النشر التلقائي للمحتوى يبقى مغلقاً.`;
    case "reject":
      return `رُفض الطلب ${record.id}. ${record.rejectReason || "بدون سبب إضافي."}`;
    case "edit":
      return `عادت المسودة ${record.id} للتعديل. ${record.editNotes || "أرسِل وصفاً محدثاً من الاستوديو."}`;
    case "submit":
      return `بانتظار موافقتك على ${record.id}. أجب: انشر / أطلق / ارفض / عدّل.`;
    default:
      return assertNeverApprovalEvent(event);
  }
}

export function newApprovalId(now = Date.now()): string {
  return `${APPROVAL_ID_PREFIX}${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
