import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiApiKey, resolveGeminiFreeApiKey } from "@/lib/server/gemini";
import {
  timelineFromGeminiStages,
  type DynamicTimelineResult,
  type GeminiTimelineStageInput,
} from "./dynamic-timeline-stages";

const MODELS = ["gemini-3.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

async function resolveKey(): Promise<string | null> {
  const primary = await resolveGeminiApiKey();
  if (primary.apiKey) return primary.apiKey;
  const free = await resolveGeminiFreeApiKey();
  return free.apiKey || null;
}

function parseStages(raw: string): GeminiTimelineStageInput[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  const parsed = JSON.parse(match[0]) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = String(row.label || "").trim();
      if (!label) return null;
      return {
        id: typeof row.id === "string" ? row.id : undefined,
        label,
        description: typeof row.description === "string" ? row.description : "",
        logs: Array.isArray(row.logs) ? row.logs.map((line) => String(line)).slice(0, 4) : [],
      } satisfies GeminiTimelineStageInput;
    })
    .filter((item): item is GeminiTimelineStageInput => Boolean(item));
}

export async function generateGeminiTimeline(directive: string): Promise<DynamicTimelineResult> {
  const prompt = `أنت مخطط تنفيذ لمنصة لوناليزا للسياحة.
المهمة ليست مقالاً ولا فيديو ولا حملة ولا حجزاً ولا إعدادات لوحة.
المهمة حرفياً: "${directive}"

أعد JSON فقط كمصفوفة من 4 خطوات تنفيذ حقيقية لهذه المهمة، بدون شرح:
[
  {"id":"step_1","label":"عنوان قصير بالعربية","description":"ماذا يحدث","logs":["سطر سجل واحد"]}
]
لا تفترض تركيا أو المغرب إلا إذا وردا في المهمة.`;

  const apiKey = await resolveKey();
  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    for (const modelId of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelId });
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("GeminiTimeout")), 20000)
        );
        const res = await Promise.race([model.generateContent(prompt), timeout]);
        const text = res.response.text();
        const stages = parseStages(text);
        if (stages.length >= 3) {
          return timelineFromGeminiStages(directive, stages, {
            isProcessing: false,
            hasFinished: false,
          });
        }
      } catch (err) {
        console.warn(`[Timeline Gemini] ${modelId}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  const words = directive.trim().slice(0, 80);
  return timelineFromGeminiStages(
    directive,
    [
      { id: "read_request", label: `قراءة الطلب: ${words}`, description: "تفكيك المهمة كما وردت", logs: ["لا نموذج متاح، الخطة مبنية على نص الطلب"] },
      { id: "collect_tools", label: "اختيار أدوات المنصة المناسبة", description: "مطابقة أدوات MCP مع نص المهمة", logs: ["MCP gateway"] },
      { id: "execute", label: "تنفيذ الخطوات على النظام الحي", description: directive.slice(0, 140), logs: ["تنفيذ ميداني"] },
      { id: "report", label: "تسليم النتيجة للمدير", description: "ملخص ما تغيّر", logs: ["تقرير ختامي"] },
    ],
    { isProcessing: false, hasFinished: false }
  );
}
