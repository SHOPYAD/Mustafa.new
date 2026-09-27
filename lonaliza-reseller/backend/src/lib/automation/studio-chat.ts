import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";
import { catalogForPrompt } from "./catalog";
import { parseAutomationPrompt } from "./parse-prompt";
import {
  ACCOUNTS_PLACEHOLDER,
  BUDGET_PLACEHOLDER,
  completeStudioDraft,
  type StudioJobDraft,
} from "./approval";
import { AUTOMATION_JOB_TYPES, AUTOMATION_TIMEZONE, isMessagingJobType } from "./types";

export type StudioChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type StudioChatTurn = {
  replyAr: string;
  draft: StudioJobDraft;
  usedGemini: boolean;
};

const DRAFT_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, description: "Short Arabic job name" },
    type: { type: SchemaType.STRING, format: "enum", enum: [...AUTOMATION_JOB_TYPES] },
    cron: { type: SchemaType.STRING, description: "5-field cron" },
    accounts: { type: SchemaType.STRING },
    budget: { type: SchemaType.STRING },
    locales: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING, format: "enum", enum: ["ar", "en", "tr"] },
    },
    dryRun: { type: SchemaType.BOOLEAN },
    maxPerRun: { type: SchemaType.INTEGER },
    maxPerDay: { type: SchemaType.INTEGER },
    consentSource: { type: SchemaType.STRING, nullable: true },
    summaryAr: { type: SchemaType.STRING },
  },
  required: ["name", "type", "cron", "locales", "dryRun", "maxPerRun", "maxPerDay", "summaryAr"],
};

export function studioSystemPrompt(): string {
  return `أنت وكيل أتمتة لوناليزا. المستخدم يصف وظيفة بالعربية.
ابنِ مسودة وظيفة كاملة من الكتالوج فقط. لا تخترع أنواعاً خارج القائمة.
التوقيت دائماً ${AUTOMATION_TIMEZONE}.
autoPublish يجب أن يكون false دائماً. لا تفعّل الكرون ولا النشر.
الحسابات والميزانية إن لم تُذكر تبقى نصاً توضيحياً (placeholder) — لا تخترع أرقاماً أو قوائم هواتف.
وظائف المراسلة تتطلب consentSource=crm_opt_in فقط. ممنوع قوائم مجروفة.
dryRun=true ما لم يطلب المستخدم تشغيلاً حياً صريحاً بعد الموافقة.

## الكتالوج
${catalogForPrompt()}
`;
}

export function draftFromHeuristic(prompt: string, notes?: string): StudioJobDraft {
  const text = [prompt, notes].filter(Boolean).join("\n");
  const parsed = parseAutomationPrompt(text);
  return completeStudioDraft({
    ...parsed,
    timezone: AUTOMATION_TIMEZONE,
    accounts: ACCOUNTS_PLACEHOLDER,
    budget: BUDGET_PLACEHOLDER,
    autoPublish: false,
    dryRun: !/تشغيل حي|\blive\s*run\b/i.test(text),
    consentSource: parsed.consentSource || (isMessagingJobType(parsed.type) ? "crm_opt_in" : undefined),
    summaryAr: `مسودة من الوصف: ${text.slice(0, 180)}`,
  });
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] || text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no_json");
  return JSON.parse(raw.slice(start, end + 1));
}

export function parseGeminiDraftPayload(text: string, prompt: string, notes?: string): StudioJobDraft {
  try {
    return completeStudioDraft(extractJsonObject(text));
  } catch {
    return draftFromHeuristic(prompt, notes);
  }
}

export function formatStudioAssistantReply(draft: StudioJobDraft, usedGemini: boolean): string {
  const source = usedGemini ? "Gemini + كتالوج الوظائف" : "تحليل محلي من الكتالوج";
  return [
    `جهّزت مسودة كاملة (${source}). لا كرون ولا نشر حتى تعتمدها.`,
    "",
    `• الاسم: ${draft.name}`,
    `• النوع: ${draft.type}`,
    `• الجدول: ${draft.cron} — ${draft.timezone}`,
    `• اللغات: ${draft.locales.join("، ")}`,
    `• تجريبي: ${draft.dryRun ? "نعم" : "لا"} · نشر تلقائي: لا`,
    `• الحسابات: ${draft.accounts}`,
    `• الميزانية: ${draft.budget}`,
    draft.consentSource ? `• موافقة الجمهور: ${draft.consentSource}` : "",
    "",
    draft.summaryAr,
    "",
    "راجع المعاينة ثم أرسل للاعتماد، أو اطلب تعديلاً بالعربية.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function buildStudioJobDraft(input: {
  prompt: string;
  notes?: string;
  previous?: StudioJobDraft | null;
  apiKey?: string | null;
  model?: string;
}): Promise<StudioChatTurn> {
  const prompt = input.prompt.trim();
  if (!prompt) throw new Error("وصف الوظيفة مطلوب");

  const fallback = input.previous
    ? completeStudioDraft({
        ...input.previous,
        summaryAr: input.notes
          ? `${input.previous.summaryAr}\nتعديل: ${input.notes}`
          : input.previous.summaryAr,
      })
    : draftFromHeuristic(prompt, input.notes);

  if (!input.apiKey) {
    return { draft: fallback, usedGemini: false, replyAr: formatStudioAssistantReply(fallback, false) };
  }

  try {
    const genAI = new GoogleGenerativeAI(input.apiKey);
    const model = genAI.getGenerativeModel({
      model: input.model || "gemini-2.0-flash",
      systemInstruction: studioSystemPrompt(),
      generationConfig: {
        temperature: 0.25,
        responseMimeType: "application/json",
        responseSchema: DRAFT_SCHEMA,
      },
    });
    const user = [
      `الوصف:\n${prompt}`,
      input.notes ? `ملاحظات التعديل:\n${input.notes}` : "",
      input.previous ? `المسودة السابقة:\n${JSON.stringify(input.previous)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    const result = await model.generateContent(user);
    const text = result.response.text();
    const draft = parseGeminiDraftPayload(text, prompt, input.notes);
    return { draft, usedGemini: true, replyAr: formatStudioAssistantReply(draft, true) };
  } catch {
    return { draft: fallback, usedGemini: false, replyAr: formatStudioAssistantReply(fallback, false) };
  }
}
