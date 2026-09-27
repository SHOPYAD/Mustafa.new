import { describe, expect, it } from "vitest";
import {
  ApprovalTransitionError,
  canEnableCron,
  completeStudioDraft,
  describeApprovalState,
  extractApprovalId,
  formatTelegramReviewCard,
  nextApprovalState,
  normalizeApprovalCommandText,
  parseTelegramApprovalCommand,
  type ApprovalRecord,
  type StudioJobDraft,
} from "./approval";
import { AUTOMATION_TIMEZONE } from "./types";

function draft(over: Partial<StudioJobDraft> = {}): StudioJobDraft {
  return completeStudioDraft({
    name: "مقالات صباحية",
    type: "articles.research_and_publish",
    cron: "0 9 * * *",
    summaryAr: "ثلاثة مقالات يومياً عن تركيا دون نشر تلقائي.",
    ...over,
  });
}

function record(over: Partial<ApprovalRecord> = {}): ApprovalRecord {
  return {
    id: "appr_test1",
    state: "awaiting_approval",
    prompt: "انشر 3 مقالات يومياً",
    draft: draft(),
    jobId: null,
    telegramChatId: "123",
    telegramMessageId: null,
    editNotes: "",
    rejectReason: "",
    actor: "studio",
    createdAt: "2026-08-31T00:00:00.000Z",
    updatedAt: "2026-08-31T00:00:00.000Z",
    submittedAt: "2026-08-31T00:00:00.000Z",
    decidedAt: null,
    ...over,
  };
}

describe("approval state machine", () => {
  it("follows draft → awaiting_approval → active", () => {
    expect(nextApprovalState("draft", "submit")).toBe("awaiting_approval");
    expect(nextApprovalState("awaiting_approval", "approve")).toBe("active");
  });

  it("follows draft → awaiting_approval → rejected", () => {
    expect(nextApprovalState("awaiting_approval", "reject")).toBe("rejected");
  });

  it("returns awaiting drafts to draft on edit", () => {
    expect(nextApprovalState("awaiting_approval", "edit")).toBe("draft");
    expect(nextApprovalState("rejected", "edit")).toBe("draft");
    expect(nextApprovalState("draft", "edit")).toBe("draft");
  });

  it("forbids enabling or skipping approval", () => {
    expect(() => nextApprovalState("draft", "approve")).toThrow(ApprovalTransitionError);
    expect(() => nextApprovalState("active", "submit")).toThrow(ApprovalTransitionError);
    expect(() => nextApprovalState("active", "reject")).toThrow(ApprovalTransitionError);
    expect(() => nextApprovalState("rejected", "approve")).toThrow(ApprovalTransitionError);
  });

  it("enables cron only in active", () => {
    expect(canEnableCron("draft")).toBe(false);
    expect(canEnableCron("awaiting_approval")).toBe(false);
    expect(canEnableCron("rejected")).toBe(false);
    expect(canEnableCron("active")).toBe(true);
  });

  it("labels states in Arabic", () => {
    expect(describeApprovalState("draft")).toBe("مسودة");
    expect(describeApprovalState("awaiting_approval")).toBe("بانتظار الموافقة");
    expect(describeApprovalState("active")).toBe("نشطة");
    expect(describeApprovalState("rejected")).toBe("مرفوضة");
  });
});

describe("completeStudioDraft", () => {
  it("forces Istanbul timezone and autoPublish false", () => {
    const next = completeStudioDraft({
      name: "حملة",
      type: "leads.email_campaign",
      timezone: "UTC",
      autoPublish: true,
      dryRun: false,
      summaryAr: "حملة بريد للعملاء الموافقين فقط من CRM.",
    });
    expect(next.timezone).toBe(AUTOMATION_TIMEZONE);
    expect(next.autoPublish).toBe(false);
    expect(next.consentSource).toBe("crm_opt_in");
    expect(next.accounts.length).toBeGreaterThan(3);
    expect(next.budget.length).toBeGreaterThan(3);
  });
});

describe("parseTelegramApprovalCommand", () => {
  it("maps انشر / أطلق / ارفض / عدّل with diacritics", () => {
    expect(parseTelegramApprovalCommand("انشر")).toEqual({ kind: "approve", mode: "publish", approvalId: undefined });
    expect(parseTelegramApprovalCommand("أَطْلِق")).toEqual({ kind: "approve", mode: "launch", approvalId: undefined });
    expect(parseTelegramApprovalCommand("ارفض الميزانية مرتفعة")).toEqual({
      kind: "reject",
      reason: "الميزانية مرتفعة",
      approvalId: undefined,
    });
    const edited = parseTelegramApprovalCommand("عدّل غيّر الكرون إلى كل ساعة");
    expect(edited.kind).toBe("edit");
    if (edited.kind === "edit") {
      expect(edited.notes).toContain("الكرون");
    }
  });

  it("binds the pending approval id", () => {
    const parsed = parseTelegramApprovalCommand("انشر #appr_abc123");
    expect(parsed).toEqual({ kind: "approve", mode: "publish", approvalId: "appr_abc123" });
  });

  it("accepts slash commands and short courtesy prefixes", () => {
    expect(parseTelegramApprovalCommand("/launch appr_zz9")).toEqual({
      kind: "approve",
      mode: "launch",
      approvalId: "appr_zz9",
    });
    expect(parseTelegramApprovalCommand("حسنا انشر")).toEqual({
      kind: "approve",
      mode: "publish",
      approvalId: undefined,
    });
    expect(parseTelegramApprovalCommand("/reject not seasonal")).toEqual({
      kind: "reject",
      reason: "not seasonal",
      approvalId: undefined,
    });
  });

  it("does not treat briefs, OTP, or negated phrases as commands", () => {
    expect(parseTelegramApprovalCommand("أريد أن أنشر 3 مقالات يومياً عن إسطنبول")).toEqual({ kind: "none" });
    expect(parseTelegramApprovalCommand("لا تنشر")).toEqual({ kind: "none" });
    expect(parseTelegramApprovalCommand("482917")).toEqual({ kind: "none" });
    expect(parseTelegramApprovalCommand("/start")).toEqual({ kind: "none" });
    expect(parseTelegramApprovalCommand("مرحبا")).toEqual({ kind: "none" });
  });

  it("does not match انشر via a loose includes() on a long inbound opt-in message", () => {
    const inbound = "شكرا لانضمامي للقناة هل يمكن انشر رقم هاتفي لاحقاً للتواصل؟";
    expect(inbound.includes("انشر")).toBe(true);
    expect(parseTelegramApprovalCommand(inbound)).toEqual({ kind: "none" });
  });
});

describe("telegram review card", () => {
  it("includes the approval id and command legend", () => {
    const card = formatTelegramReviewCard(record());
    expect(card).toContain("#appr_test1");
    expect(card).toContain("انشر");
    expect(card).toContain("أطلق");
    expect(card).toContain("ارفض");
    expect(card).toContain("عدّل");
    expect(card).toContain(AUTOMATION_TIMEZONE);
    expect(card).not.toMatch(/autoPublish:\s*true/i);
  });

  it("extracts ids independently of command verbs", () => {
    expect(extractApprovalId("راجع appr_hello1 من فضلك")).toBe("appr_hello1");
    expect(normalizeApprovalCommandText("أَنْشُر")).toBe("انشر");
  });
});
