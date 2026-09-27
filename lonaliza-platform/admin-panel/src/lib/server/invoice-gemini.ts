import { invoiceServiceTitle, type InvoiceService } from "@/lib/booking-service";
import { getGeminiPublicConfig, resolveGeminiApiKey } from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import {
  mergeInvoiceTemplate,
  sanitizeInvoiceTemplate,
} from "@/lib/server/invoice-templates-store";
import type { InvoiceTemplate, InvoiceTemplatePatch } from "@/types/invoice-template";

const GEMINI_MISSING_AR =
  "مفتاح Gemini غير مُعدّ. احفظه من إعدادات الذكاء الاصطناعي أو عيّن GEMINI_API_KEY.";

type ChatMessage = { role: "user" | "assistant"; content: string };

function extractJsonBlock(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced?.[1] || text.match(/\{[\s\S]*\}/)?.[0];
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toPatch(raw: Record<string, unknown>, service: InvoiceService): InvoiceTemplatePatch | null {
  if (!raw || typeof raw !== "object") return null;
  const merged = sanitizeInvoiceTemplate(service, { ...raw, service });
  const patch: InvoiceTemplatePatch = {};
  const keys: Array<keyof InvoiceTemplatePatch> = [
    "companyNameAr",
    "companyNameEn",
    "logoUrl",
    "logoHeight",
    "primaryColor",
    "accentColor",
    "headerText",
    "footerText",
    "language",
    "currencyFormat",
    "customCss",
    "extraHtml",
  ];
  for (const key of keys) {
    if (raw[key] !== undefined) {
      (patch as Record<string, unknown>)[key] = merged[key as keyof InvoiceTemplate];
    }
  }
  if (raw.fields && typeof raw.fields === "object") {
    const incoming = raw.fields as Record<string, unknown>;
    const fields: InvoiceTemplatePatch["fields"] = {};
    for (const key of Object.keys(merged.fields) as Array<keyof InvoiceTemplate["fields"]>) {
      if (typeof incoming[key] === "boolean") fields[key] = incoming[key];
    }
    if (Object.keys(fields).length) patch.fields = fields;
  }
  return Object.keys(patch).length > 0 ? patch : null;
}

export async function generateInvoiceTemplateWithGemini(input: {
  service: InvoiceService;
  current: InvoiceTemplate;
  messages: ChatMessage[];
}): Promise<
  | { ok: true; reply: string; template: InvoiceTemplate; patch: InvoiceTemplatePatch | null }
  | { ok: false; error: string }
> {
  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) return { ok: false, error: GEMINI_MISSING_AR };

  const config = await getGeminiPublicConfig();
  const model = normalizeGeminiModelId(config.model);
  const titles = invoiceServiceTitle(input.service);
  const prompt = input.messages
    .filter((m) => m.role === "user")
    .at(-1)
    ?.content.trim();
  if (!prompt || prompt.length < 4) {
    return { ok: false, error: "اكتب وصفاً أوضح للتعديل (4 أحرف على الأقل)." };
  }

  const system = `You are an invoice designer for Lonaliza Travel / لوناليزا للسياحة والسفر.
Edit the ${input.service} (${titles.ar} / ${titles.en}) PDF invoice template.

Return ALWAYS:
1) A short reply in the user's language explaining what changed
2) One JSON object in \`\`\`json ... \`\`\` with ONLY fields that should change

Allowed JSON keys:
companyNameAr, companyNameEn, logoUrl, logoHeight (24-120),
primaryColor, accentColor (hex like #051741 / #10b981),
headerText, footerText, language ("ar"|"en"|"tr"),
currencyFormat ("western"|"localized"),
fields: { customer, passenger, route, taxes, baseFare, baggage, fareClass, legs, hotel, room, nights, dates, payment, details } booleans,
customCss (plain CSS only, no scripts), extraHtml (safe HTML blocks: div/table/p/span only)

Rules:
- Keep RTL Arabic invoices professional. Western numerals (1 2 3) unless currencyFormat is localized.
- Navy #051741 and emerald #10b981 are the brand defaults — do not invent a new palette unless asked.
- extraHtml is for extra tables (baggage, tax breakdown, terms). No <script>, no event handlers.
- customCss can enlarge the logo (.brand img { height: 72px }), move cards, or add a tax table style.
- Do not change service type. Do not invent booking prices.
- If the user asks to add a baggage table, set fields.baggage=true and extraHtml with a sample table using classes .card .row .k .v
- If the user asks to move the tax breakdown, adjust customCss or extraHtml — do not drop money rows.

Current template JSON:
${JSON.stringify(input.current)}`;

  const contents = input.messages.slice(-8).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.45, maxOutputTokens: 4096 },
      }),
    });
  } catch {
    return { ok: false, error: "تعذّر الاتصال بـ Gemini" };
  }

  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  if (!res.ok) {
    const raw = data.error?.message || `Gemini (${res.status})`;
    return { ok: false, error: raw.split(apiKey).join("[redacted]") };
  }

  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const extracted = extractJsonBlock(text);
  const patch = extracted ? toPatch(extracted, input.service) : null;
  const template = patch ? mergeInvoiceTemplate(input.current, patch) : input.current;
  return { ok: true, reply: text, template, patch };
}
