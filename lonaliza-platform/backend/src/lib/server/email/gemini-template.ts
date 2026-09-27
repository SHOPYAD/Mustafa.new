import {
  createBlock,
  defaultVisualDocument,
  sanitizeVisualDocument,
  type EmailBlock,
  type EmailBlockType,
  type EmailVisualDocument,
  isEmailBlockType,
  isEmailLinkKey,
  newBlockId,
  type EmailLinkKey,
} from "@/lib/email/visual-doc";
import { compileVisualTemplate } from "@/lib/server/email/compile-visual";
import { getEmailBrand } from "@/lib/server/email/brand";
import {
  getGeminiPublicConfig,
  resolveGeminiApiKey,
} from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import { GEMINI_MISSING_AR } from "@/lib/server/gemini-translate";
import type { EmailTemplateKind } from "@/lib/server/email/types";

function extractJson(text: string): Record<string, unknown> | null {
  const block = text.match(/```json\s*([\s\S]*?)```/);
  const raw = block ? block[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function blocksFromGemini(
  raw: unknown,
  brand: Awaited<ReturnType<typeof getEmailBrand>>
): EmailBlock[] {
  if (!Array.isArray(raw)) return [];
  const out: EmailBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const type = String(rec.type || "");
    if (!isEmailBlockType(type)) continue;
    const base = createBlock(type as EmailBlockType, brand);
    out.push({
      ...base,
      id: newBlockId(),
      text: typeof rec.text === "string" ? rec.text : base.text,
      color: typeof rec.color === "string" ? rec.color : base.color,
      background: typeof rec.background === "string" ? rec.background : base.background,
      align:
        rec.align === "center" || rec.align === "left" || rec.align === "right"
          ? rec.align
          : base.align,
      hrefKey: isEmailLinkKey(String(rec.hrefKey || ""))
        ? (String(rec.hrefKey) as EmailLinkKey)
        : base.hrefKey,
      customUrl: typeof rec.customUrl === "string" ? rec.customUrl : base.customUrl,
      src: typeof rec.src === "string" ? rec.src : base.src,
      alt: typeof rec.alt === "string" ? rec.alt : base.alt,
      rows: Array.isArray(rec.rows)
        ? rec.rows
            .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
            .map((row) => ({
              label: String(row.label || ""),
              value: String(row.value || ""),
            }))
        : base.rows,
      logoBackground: rec.logoBackground === "transparent" ? "transparent" : base.logoBackground,
    });
  }
  return out;
}

export async function generateEmailTemplateWithGemini(input: {
  prompt: string;
  kind?: EmailTemplateKind;
  audienceHint?: string;
  currentDocument?: unknown;
}): Promise<
  | {
      ok: true;
      name: string;
      subject_ar: string;
      subject_en: string;
      html_ar: string;
      html_en: string;
      text_ar: string;
      text_en: string;
      kind: EmailTemplateKind;
      document: EmailVisualDocument;
    }
  | { ok: false; error: string }
> {
  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) return { ok: false, error: GEMINI_MISSING_AR };
  const config = await getGeminiPublicConfig();
  const model = normalizeGeminiModelId(config.model);
  const brand = await getEmailBrand();
  const prompt = String(input.prompt || "").trim();
  if (prompt.length < 8) {
    return { ok: false, error: "اكتب وصفاً أوضح للحملة (8 أحرف على الأقل)." };
  }

  const current = input.currentDocument
    ? sanitizeVisualDocument(input.currentDocument, brand)
    : null;

  const system = `You are an email designer for ${brand.brandNameAr} / ${brand.brandNameEn}.
Return ONE JSON object only with keys:
name, subject_ar, subject_en, blocks
blocks is an array of visual email components. Allowed types:
header, heading, paragraph, button, image, bookingTable, divider, footer
Rules:
- Always include exactly one header (logo) as first block and one footer as last block
- header: { type:"header", logoBackground:"brand"|"transparent" }
- heading/paragraph/button: { type, text, color?, background?, align? }
- button hrefKey must be one of: home, hotels, flights, account, booking
- bookingTable rows use {{bookingId}} {{company}} {{amount}} only as values when needed
- Use placeholders {{name}} {{company}} {{bookingId}} {{amount}} — never invent customer names
- Greet with {{name}}
- Never mention oktravel, Dubai demo companies, or fake agency names
- Keep brand names exactly: ${brand.brandNameAr} / ${brand.brandNameEn}
- Professional hospitality tone, short Arabic copy
- No scripts, no prices unless the user prompt includes them
- Do not invent a company footer; footer is rendered from site brand`;

  const userText = [
    prompt,
    input.audienceHint
      ? `Audience sample (personalize with {{name}} and {{company}}):\n${input.audienceHint}`
      : "",
    current
      ? `Current template blocks JSON (edit this, do not discard useful structure):\n${JSON.stringify(current.blocks)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: { temperature: 0.55, maxOutputTokens: 4096 },
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
  const parsed = extractJson(text);
  if (!parsed) {
    return { ok: false, error: "Gemini لم يُرجع قالباً صالحاً. أعد المحاولة." };
  }

  let blocks = blocksFromGemini(parsed.blocks, brand);
  if (blocks.length === 0) {
    const fallback = defaultVisualDocument(brand);
    const heading = fallback.blocks.find((b) => b.type === "heading");
    const para = fallback.blocks.find((b) => b.type === "paragraph");
    if (heading) heading.text = String(parsed.subject_ar || prompt).slice(0, 80);
    if (para) para.text = `مرحباً {{name}}\n${prompt.slice(0, 280)}`;
    blocks = fallback.blocks;
  }
  if (!blocks.some((b) => b.type === "header")) {
    blocks = [createBlock("header", brand), ...blocks];
  }
  if (!blocks.some((b) => b.type === "footer")) {
    blocks = [...blocks, createBlock("footer", brand)];
  }

  const document = sanitizeVisualDocument(
    {
      version: 1,
      canvasBg: current?.canvasBg,
      cardBg: current?.cardBg,
      blocks,
    },
    brand
  );
  const compiled = compileVisualTemplate(document, brand);
  return {
    ok: true,
    name: String(parsed.name || prompt).slice(0, 80),
    subject_ar: String(parsed.subject_ar || "رسالة من " + brand.brandNameAr),
    subject_en: String(parsed.subject_en || "A note from " + brand.brandNameEn),
    html_ar: compiled.html,
    html_en: compiled.html,
    text_ar: compiled.text,
    text_en: compiled.text,
    kind: input.kind || "custom",
    document,
  };
}
