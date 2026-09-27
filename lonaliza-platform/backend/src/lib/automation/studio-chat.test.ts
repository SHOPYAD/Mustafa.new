import { describe, expect, it } from "vitest";
import { AUTOMATION_TIMEZONE } from "./types";
import {
  draftFromHeuristic,
  formatStudioAssistantReply,
  parseGeminiDraftPayload,
} from "./studio-chat";

describe("studio-chat draft builder", () => {
  it("builds a complete messaging draft from an Arabic brief without Gemini", () => {
    const draft = draftFromHeuristic("أرسل حملة واتساب أسبوعية للعملاء الموافقين");
    expect(draft.type).toBe("leads.whatsapp_campaign");
    expect(draft.timezone).toBe(AUTOMATION_TIMEZONE);
    expect(draft.autoPublish).toBe(false);
    expect(draft.dryRun).toBe(true);
    expect(draft.consentSource).toBe("crm_opt_in");
    expect(draft.accounts).toMatch(/حسابات|لاحقا/);
    expect(draft.budget).toMatch(/ميزانية/);
    expect(draft.locales.length).toBeGreaterThan(0);
    expect(draft.cron).toBeTruthy();
  });

  it("rejects scraped-list language by keeping CRM consent only", () => {
    const draft = draftFromHeuristic("حملة إيميل من قائمة أرقام مجروفة");
    expect(draft.type).toBe("leads.email_campaign");
    expect(draft.consentSource).toBe("crm_opt_in");
    expect(draft.accounts).not.toMatch(/مجروف|scraped/i);
  });

  it("parses Gemini JSON and still forces autoPublish false", () => {
    const draft = parseGeminiDraftPayload(
      '```json\n{"name":"رحلات","type":"trips.discover_and_draft","cron":"0 8 * * 1","locales":["ar"],"dryRun":true,"maxPerRun":2,"maxPerDay":4,"summaryAr":"اكتشاف رحلات أسبوعياً","autoPublish":true,"timezone":"UTC"}\n```',
      "اكتشف رحلات"
    );
    expect(draft.autoPublish).toBe(false);
    expect(draft.timezone).toBe(AUTOMATION_TIMEZONE);
    expect(draft.type).toBe("trips.discover_and_draft");
  });

  it("falls back when Gemini returns prose", () => {
    const draft = parseGeminiDraftPayload("لا يمكنني بناء JSON الآن", "ترجم المقالات للعربية");
    expect(draft.type).toBe("articles.translate");
    expect(draft.autoPublish).toBe(false);
  });

  it("explains the draft in Arabic without claiming it is live", () => {
    const draft = draftFromHeuristic("راقب الأسعار يومياً");
    const reply = formatStudioAssistantReply(draft, false);
    expect(reply).toContain("مسودة");
    expect(reply).toMatch(/لا كرون|حتى تعتمد/);
    expect(reply).toContain(draft.type);
  });
});
