import {
  resolveGeminiApiKey,
  getGeminiPublicConfig,
} from "@/lib/server/gemini";
import { buildBuilderAgentSystemPrompt } from "@/lib/server/builder-agent-prompt";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import {
  customSlugFromPageId,
  isBuiltinPageId,
  isCustomPageId,
  pageGeminiCapabilities,
} from "@/lib/builder-pages";
import {
  createCustomPage,
  getCustomPageBySlug,
  updateCustomPage,
} from "@/lib/server/pages-store";
import { upsertPageTheme } from "@/lib/server/page-themes-store";
import type {
  CustomPage,
  CustomPageInput,
  CustomPageSection,
  PageLayoutHints,
  PageThemeTokens,
} from "@/types/custom-page";
import {
  executeGeminiBuilderTool,
  HOMEPAGE_FILE_TOOLS,
} from "@/lib/server/gemini-builder-tools"; /* Agent C: copilot pipeline */

export type GeminiChatMessage = { role: "user" | "assistant"; content: string };

export type GeminiBuilderRequest = {
  messages: GeminiChatMessage[];
  pageId?: string;
  templateDraft?: unknown;
  homepageContext?: unknown;
  pageSnapshot?: unknown;
  canvasLocale?: string;
  selectedSection?: unknown;
  model?: string;
};

export type GeminiBuilderResult = {
  ok: true;
  reply: string;
  homepagePatch: Record<string, unknown> | null;
  templatePatch: Record<string, unknown> | null;
  pageThemePatch: {
    tokens?: PageThemeTokens;
    layoutHints?: PageLayoutHints;
  } | null;
  customPage: CustomPage | null;
  created: boolean;
  pageId: string;
  filesChanged: Array<{ path: string; action: string }>;
  copilotSection: {
    slug: string;
    html: string;
    css: string;
    titleAr: string;
    titleEn: string;
    titleTr: string;
  } | null;
};

const HOMEPAGE_SYSTEM = `أنت محرر الصفحة الرئيسية لموقع وكالة سفر (لوناليزا للسياحة والسفر / Lonaliza Travel).
/* Agent C: the agent SHOULD redesign structure when asked, not only tweak tokens. */
لديك مساران:
أ) تعديل عميق على الملفات: resolveSectionSource → readProjectFile → applyProjectPatch أو createHomepageSection
   استخدمه عند «أعد التصميم من الصفر» أو تغيير هيكلي (تخطيط، مكوّنات، تايبوغرافي، CSS حقيقي).
ب) TemplatePatch JSON للتعديلات الخفيفة فقط (نص / لون / إخفاء / ترتيب).

عندما تلمس ملفات المصدر، اذكر كل ملف تغيّر في الرد. لا تكتفِ بتغيير ألوان/حشوات إذا طُلب إعادة تصميم.

عندما يطلب المستخدم تعديلاً خفيفاً، أعد دائماً:
1) ردّاً قصيراً بلغة المستخدم يوضح ما تغيّر
2) كتلة JSON داخل \`\`\`json ... \`\`\` بصيغة TemplatePatch

صيغة TemplatePatch (أرسل فقط الحقول المطلوبة):
{
  "updateSectionText": { "instanceId":"", "field":"title|subtitle|eyebrow|cta|button|placeholder|...", "locale":"ar|en|tr", "value":"", "ar":"", "en":"", "tr":"" },
  "updateSectionTexts": { "instanceId":"", "texts": { "title": { "ar":"", "en":"", "tr":"" } } },
  "updateSectionStyles": { "instanceId":"", "styles": { "background":"#051741", "accent":"#10b981", "textColor":"", "overlay":"" } },
  "updateSectionSettings": { "instanceId":"", "settings": { "travelers": 1500 } },
  "hideSection": "instanceId",
  "showSection": "instanceId",
  "removeSection": "instanceId",
  "reorder": ["id1","id2"],
  "addSection": { "type":"hero|search|categories|destinations|flashDeals|packages|hotels|cars|transfers|visa|flightDeals|vipTours|whyUs|stats|testimonials|trust|partners|blog|newsletter|contact|cta|copilot", "afterInstanceId":"" },
  "setGlobal": { "navy":"#051741", "emerald":"#10b981" },
  "updateMany": [ { "instanceId":"", "texts":{}, "styles":{}, "hidden": false } ]
}

قواعد:
- إذا وُجد قسم موسوم (selectedSection.instanceId) ركّز التعديل عليه
- عند تعديل نص استخدم اللغة الحالية canvasLocale ما لم يُطلب غير ذلك — ويفضّل تعبئة ar+en+tr معاً
- «أخفِ هذا القسم» → hideSection
- «أضف قسماً» → addSection بالنوع المناسب بعد القسم الموسوم
- «اجعله كحلياً / زمردياً» → updateSectionStyles أو setGlobal
- لا تحذف قسماً إلا إذا طُلب صراحة
- لا تخترع instanceId — استخدم الموجود في القالب
- إعادة تصميم من الصفر / هيكلي → أدوات الملفات أولاً، ثم TemplatePatch إن لزم
- createHomepageSection ينشئ type=copilot (أضف addSection type=copilot في الـ JSON بعد إنشائه)
- ابقَ داخل ملفات هذا المشروع فقط. لا تلمس أسراراً ولا SearchWidget كتابةً

صيغة HomepagePatch القديمة ما زالت مقبولة للتوافق إن لم يوجد قالب:

صيغة HomepagePatch المسموحة (أرسل فقط الحقول المطلوبة):
{
  "addOffer": { OfferCard },
  "addHeroSlide": { HeroSlide },
  "addDestination": { DestinationCard },
  "addFeature": { Feature },
  "addSection": { SectionBlock },
  "replaceLayout": "classic" | "editorial" | "minimal" | "bold" | "immersive",
  "layoutVariant": "classic" | "editorial" | "minimal" | "bold" | "immersive",
  "replaceOffers": [ { OfferCard } ],
  "upsertOffer": { OfferCard },
  "removeOfferId": "o1",
  "replaceHeroSlides": [ { HeroSlide } ],
  "upsertHeroSlide": { HeroSlide },
  "removeHeroSlideId": "h1",
  "replaceDestinations": [ { DestinationCard } ],
  "upsertDestination": { DestinationCard },
  "removeDestinationId": "d1",
  "replaceFeatures": [ { Feature } ],
  "upsertFeature": { Feature },
  "removeFeatureId": "f1",
  "replaceExtraSections": [ { SectionBlock } ],
  "removeSectionId": "s1",
  "features": [ { Feature } ],
  "cta": { ... },
  "sections": { "offersTitleAr": "", "offersTitleEn": "", ... }
}

OfferCard:
{ "id","titleAr","titleEn","destinationAr","destinationEn","image","originalPrice","salePrice","endsAt"(ISO),"seatsLeft","totalSeats","href","badgeAr?","badgeEn?" }

HeroSlide:
{ "id","nameAr","nameEn","taglineAr","taglineEn","image","price","durationAr","durationEn","rating","ctaLabelAr?","ctaLabelEn?","ctaHref?" }

DestinationCard:
{ "id","nameAr","nameEn","countryAr","countryEn","image","packages","rating","reviews","taglineAr","taglineEn","startingPrice","href" }

Feature:
{ "id","icon":"shield|headphones|zap|award|sparkles|star","titleAr","titleEn","descriptionAr","descriptionEn" }

SectionBlock (قسم تصميم جديد على الصفحة):
{ "id","type":"promoBanner|textBlock|imageRow|ctaStrip|custom","titleAr","titleEn","subtitleAr?","subtitleEn?","bodyAr?","bodyEn?","image?","ctaLabelAr?","ctaLabelEn?","ctaHref?","accent?" }

قواعد مهمة للإضافة (وليس التعديل فقط):
- عندما يقول المستخدم «أضف عرض جديد» أو «أضف شريحة هيرو» أو «أضف تصميم قسم جديد» استخدم addOffer / addHeroSlide / addDestination / addFeature / addSection (لا تستبدل المصفوفة كاملة إلا إذا طُلب ذلك صراحة)
- عند إضافة عنصر جديد استخدم id فريداً مثل o-{timestamp} أو h-{timestamp} أو s-{timestamp}
- «أضف تصميم قسم جديد» → addSection مع type مناسب ونصوص عربية+إنجليزية وصورة إن لزم
- «غيّر تصميم الصفحة» أو «استبدل التخطيط» → replaceLayout بأحد: classic, editorial, minimal, bold, immersive
- استخدم صوراً من images.unsplash.com بروابط كاملة https
- اكتب عربي + إنجليزي لكل النصوص
- الأسعار أرقام بالدولار
- لا تحذف أقساماً كاملة إلا إذا طُلب صراحة
- endsAt يجب أن يكون تاريخ ISO في المستقبل (1-7 أيام)

المحرر البصري:
- إذا وُجد قسم موسوم (selectedSection) ركّز التعديل على ذلك القسم/العنصر فقط ما لم يطلب المستخدم غير ذلك
- «عدّل هذا» / «غيّر هذا القسم» → طبّق على القسم الموسوم (hero→heroSlides, flashDeals→offers, destinations→destinations, features→features, cta→cta, extraSection→extraSections بالـ id)
- «أضف قسماً أسفل/فوق المحدد» أو «أضف قسم جديد» → addSection
- «أضف بطاقة عرض» مع وسم flashDeals → addOffer
- عند وسم عنصر (itemId) استخدم upsert* أو remove* لذلك الـ id`;

const THEME_SYSTEM = `أنت مصمم صفحات لموقع لوناليزا للسياحة والسفر (Lonaliza Travel).
الصفحة الحالية ليست الصفحة الرئيسية — لا تعدّل أقسام قالب الهوم.
يمكنك فقط تطبيق رموز هوية (theme tokens) وتلميحات تخطيط بسيطة.

أعد دائماً:
1) ردّاً قصيراً بلغة المستخدم
2) كتلة JSON داخل \`\`\`json ... \`\`\`

الصيغة:
{
  "setThemeTokens": { "navy":"#051741", "emerald":"#10b981", "background":"#ffffff", "text":"#0f172a", "accent":"#10b981" },
  "setLayoutHints": { "heroAlign":"start|center", "maxWidth":"narrow|default|wide", "showHero": true, "compactHeader": false },
  "createPage": { "slug":"latin-kebab", "titleAr":"", "titleEn":"", "titleTr":"", "published": false }
}

قواعد:
- أرسل فقط الحقول المطلوبة
- createPage فقط إذا طلب المستخدم إنشاء صفحة جديدة
- لا تخترع أسعاراً أو مسارات غير موجودة`;

const CUSTOM_SYSTEM = `أنت محرر صفحات مخصصة على المسار /p/[slug] لموقع لوناليزا للسياحة والسفر.
يمكنك تغيير العنوان وقائمة الأقسام والألوان.

أعد دائماً:
1) ردّاً قصيراً بلغة المستخدم
2) كتلة JSON داخل \`\`\`json ... \`\`\`

{
  "updatePage": { "titleAr":"", "titleEn":"", "titleTr":"", "seoTitle":"", "seoDescription":"" },
  "setThemeTokens": { "navy":"", "emerald":"", "background":"", "text":"", "accent":"" },
  "setLayoutHints": { "heroAlign":"start|center", "maxWidth":"narrow|default|wide", "showHero": true },
  "setSections": [ { "id":"sec_1", "type":"heading|text|image|cta|html", "hidden": false, "titleAr":"", "titleEn":"", "titleTr":"", "bodyAr":"", "bodyEn":"", "image":"", "ctaLabelAr":"", "ctaHref":"", "background":"", "textColor":"" } ],
  "updateSection": { "id":"", "titleAr":"", "bodyAr":"", "hidden": false },
  "addSection": { "type":"heading|text|image|cta|html", "afterId":"", "titleAr":"", "titleEn":"", "bodyAr":"", "bodyEn":"" },
  "hideSection": "id",
  "showSection": "id",
  "removeSection": "id",
  "reorder": ["id1","id2"],
  "createPage": { "slug":"", "titleAr":"", "titleEn":"", "published": false }
}

قواعد:
- لا تخترع id غير موجود إلا عند addSection (استخدم sec-{timestamp})
- HTML بسيط فقط داخل type=html
- العربي + الإنجليزي (+ تركي إن أمكن)
- لا تحذف قسماً إلا إذا طُلب صراحة`;

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

function isTemplatePatch(parsed: Record<string, unknown>): boolean {
  return Boolean(
    parsed.updateSectionText ||
      parsed.updateSectionTexts ||
      parsed.updateSectionStyles ||
      parsed.updateSectionSettings ||
      parsed.hideSection ||
      parsed.showSection ||
      parsed.addSection ||
      parsed.setGlobal ||
      parsed.updateMany ||
      parsed.reorder ||
      parsed.removeSection
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function tokensFromUnknown(value: unknown): PageThemeTokens | undefined {
  const rec = asRecord(value);
  if (!rec) return undefined;
  const tokens: PageThemeTokens = {};
  if (typeof rec.navy === "string") tokens.navy = rec.navy;
  if (typeof rec.emerald === "string") tokens.emerald = rec.emerald;
  if (typeof rec.background === "string") tokens.background = rec.background;
  if (typeof rec.text === "string") tokens.text = rec.text;
  if (typeof rec.accent === "string") tokens.accent = rec.accent;
  return Object.keys(tokens).length ? tokens : undefined;
}

function hintsFromUnknown(value: unknown): PageLayoutHints | undefined {
  const rec = asRecord(value);
  if (!rec) return undefined;
  const hints: PageLayoutHints = {};
  if (rec.heroAlign === "start" || rec.heroAlign === "center") hints.heroAlign = rec.heroAlign;
  if (rec.maxWidth === "narrow" || rec.maxWidth === "default" || rec.maxWidth === "wide") {
    hints.maxWidth = rec.maxWidth;
  }
  if (typeof rec.showHero === "boolean") hints.showHero = rec.showHero;
  if (typeof rec.compactHeader === "boolean") hints.compactHeader = rec.compactHeader;
  return Object.keys(hints).length ? hints : undefined;
}

function sectionFromUnknown(value: unknown, index: number): CustomPageSection | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const type = String(rec.type || "text");
  return {
    id: typeof rec.id === "string" && rec.id.trim() ? rec.id : `sec_${Date.now()}_${index}`,
    type:
      type === "heading" ||
      type === "text" ||
      type === "image" ||
      type === "cta" ||
      type === "html"
        ? type
        : "text",
    hidden: Boolean(rec.hidden),
    titleAr: typeof rec.titleAr === "string" ? rec.titleAr : undefined,
    titleEn: typeof rec.titleEn === "string" ? rec.titleEn : undefined,
    titleTr: typeof rec.titleTr === "string" ? rec.titleTr : undefined,
    bodyAr: typeof rec.bodyAr === "string" ? rec.bodyAr : undefined,
    bodyEn: typeof rec.bodyEn === "string" ? rec.bodyEn : undefined,
    bodyTr: typeof rec.bodyTr === "string" ? rec.bodyTr : undefined,
    image: typeof rec.image === "string" ? rec.image : undefined,
    ctaLabelAr: typeof rec.ctaLabelAr === "string" ? rec.ctaLabelAr : undefined,
    ctaLabelEn: typeof rec.ctaLabelEn === "string" ? rec.ctaLabelEn : undefined,
    ctaLabelTr: typeof rec.ctaLabelTr === "string" ? rec.ctaLabelTr : undefined,
    ctaHref: typeof rec.ctaHref === "string" ? rec.ctaHref : undefined,
    background: typeof rec.background === "string" ? rec.background : undefined,
    textColor: typeof rec.textColor === "string" ? rec.textColor : undefined,
    accent: typeof rec.accent === "string" ? rec.accent : undefined,
  };
}

function mergeSection(
  current: CustomPageSection,
  patch: CustomPageSection
): CustomPageSection {
  return {
    ...current,
    ...Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined)
    ),
  } as CustomPageSection;
}

async function applyCustomPatch(
  page: CustomPage,
  parsed: Record<string, unknown>
): Promise<CustomPage> {
  const update = asRecord(parsed.updatePage) || {};
  let sections = [...(page.sections || [])];

  if (Array.isArray(parsed.setSections)) {
    sections = parsed.setSections
      .map((item, index) => sectionFromUnknown(item, index))
      .filter((item): item is CustomPageSection => item != null);
  }

  const updateSection = asRecord(parsed.updateSection);
  if (updateSection && typeof updateSection.id === "string") {
    const patch = sectionFromUnknown(updateSection, 0);
    sections = sections.map((item) =>
      item.id === updateSection.id && patch ? mergeSection(item, patch) : item
    );
  }

  const addSection = asRecord(parsed.addSection);
  if (addSection && typeof addSection.type === "string") {
    const created = sectionFromUnknown(
      { ...addSection, id: `sec_${Date.now()}` },
      sections.length
    );
    if (created) {
      const afterId = typeof addSection.afterId === "string" ? addSection.afterId : "";
      const index = afterId ? sections.findIndex((item) => item.id === afterId) : -1;
      if (index >= 0) sections.splice(index + 1, 0, created);
      else sections.push(created);
    }
  }

  if (typeof parsed.hideSection === "string") {
    sections = sections.map((item) =>
      item.id === parsed.hideSection ? { ...item, hidden: true } : item
    );
  }
  if (typeof parsed.showSection === "string") {
    sections = sections.map((item) =>
      item.id === parsed.showSection ? { ...item, hidden: false } : item
    );
  }
  if (typeof parsed.removeSection === "string") {
    sections = sections.filter((item) => item.id !== parsed.removeSection);
  }
  if (Array.isArray(parsed.reorder)) {
    const ids = parsed.reorder.filter((id): id is string => typeof id === "string");
    const byId = new Map(sections.map((item) => [item.id, item]));
    const ordered: CustomPageSection[] = [];
    for (const id of ids) {
      const item = byId.get(id);
      if (item) {
        ordered.push(item);
        byId.delete(id);
      }
    }
    ordered.push(...byId.values());
    sections = ordered;
  }

  const input: CustomPageInput = {
    titleAr: typeof update.titleAr === "string" ? update.titleAr : undefined,
    titleEn: typeof update.titleEn === "string" ? update.titleEn : undefined,
    titleTr: typeof update.titleTr === "string" ? update.titleTr : undefined,
    seoTitle: typeof update.seoTitle === "string" ? update.seoTitle : undefined,
    seoDescription:
      typeof update.seoDescription === "string" ? update.seoDescription : undefined,
    sections,
    theme: tokensFromUnknown(parsed.setThemeTokens) || page.theme,
    layoutHints: hintsFromUnknown(parsed.setLayoutHints) || page.layoutHints,
  };

  const saved = await updateCustomPage(page.id, input);
  return saved.ok ? saved.page : page;
}

async function applyCreatePage(
  parsed: Record<string, unknown>
): Promise<{ page: CustomPage | null; created: boolean }> {
  const create = asRecord(parsed.createPage);
  if (!create) return { page: null, created: false };
  const input: CustomPageInput = {
    slug: typeof create.slug === "string" ? create.slug : undefined,
    titleAr: typeof create.titleAr === "string" ? create.titleAr : undefined,
    titleEn: typeof create.titleEn === "string" ? create.titleEn : undefined,
    titleTr: typeof create.titleTr === "string" ? create.titleTr : undefined,
    published: typeof create.published === "boolean" ? create.published : false,
  };
  const saved = await createCustomPage(input);
  if (!saved.ok) return { page: null, created: false };
  return { page: saved.page, created: true };
}

export async function runGeminiBuilderChat(
  body: GeminiBuilderRequest,
  onDelta?: (chunk: string) => void
): Promise<GeminiBuilderResult | { ok: false; error: string; status: number }> {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return { ok: false, error: "messages required", status: 400 };
  }

  const pageId =
    typeof body.pageId === "string" && body.pageId.trim() ? body.pageId.trim() : "home";
  const templateDraft = body.templateDraft || body.homepageContext || body.pageSnapshot || {};
  const canvasLocale = typeof body.canvasLocale === "string" ? body.canvasLocale : "ar";
  const selectedSection = body.selectedSection || null;
  const capabilities = pageGeminiCapabilities(pageId);

  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 400,
      error:
        "مفتاح Gemini غير مُعدّ. احفظه من إعدادات الذكاء الاصطناعي أو عيّن GEMINI_API_KEY.",
    };
  }

  const config = await getGeminiPublicConfig();
  const model = normalizeGeminiModelId(
    (typeof body.model === "string" && body.model.trim()) || config.model
  );

  const selectionBlock = selectedSection
    ? `
القسم الموسوم حالياً في المحرر البصري (ركّز التعديل هنا):
${JSON.stringify(selectedSection, null, 2)}
`
    : `
لا يوجد قسم موسوم حالياً — طبّق التعديل حسب طلب المستخدم عموماً.
`;

  const roleSystem = isCustomPageId(pageId)
    ? CUSTOM_SYSTEM
    : pageId === "home" || capabilities.includes("homepage-template")
      ? HOMEPAGE_SYSTEM
      : THEME_SYSTEM;

  const packScope = isCustomPageId(pageId) ? "pages" : "editor";
  const agentPrompt = await buildBuilderAgentSystemPrompt(packScope);

  const system = `${roleSystem}

${agentPrompt}

تعليمات إضافية من الأدمن:
${config.systemInstructions || ""}

قواعد الكتابة:
${config.writingRules || ""}

${selectionBlock}

لغة اللوحة الحالية: ${canvasLocale}
معرّف الصفحة: ${pageId}
قدرات هذه الصفحة: ${capabilities.join(", ") || "none"}

لقطة الصفحة / القالب الحالي (JSON):
${JSON.stringify(templateDraft, null, 2)}
`;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const useFileTools = pageId === "home" || capabilities.includes("homepage-template");
  const payload: GeminiGeneratePayload = {
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: {
      temperature: 0.55,
      maxOutputTokens: 8192,
    },
    ...(useFileTools
      ? {
          tools: [{ functionDeclarations: HOMEPAGE_FILE_TOOLS }],
          toolConfig: { functionCallingConfig: { mode: "AUTO" } },
        }
      : {}),
  };

  const filesChanged: Array<{ path: string; action: string }> = [];
  const createdSections: Array<{
    slug: string;
    html: string;
    css: string;
    titleAr: string;
    titleEn: string;
    titleTr: string;
  }> = [];
  const streamed = useFileTools
    ? await runGeminiToolLoop(apiKey, model, payload, filesChanged, createdSections, onDelta)
    : await streamGeminiGenerateContent(apiKey, model, payload, onDelta);
  if (!streamed.ok) {
    return { ok: false, status: streamed.status, error: streamed.error };
  }
  const text = streamed.text;

  let homepagePatch: Record<string, unknown> | null = null;
  let templatePatch: Record<string, unknown> | null = null;
  let pageThemePatch: GeminiBuilderResult["pageThemePatch"] = null;
  let customPage: CustomPage | null = null;
  let created = false;

  const parsed = extractJsonBlock(text);
  if (parsed) {
    if (parsed.templatePatch && typeof parsed.templatePatch === "object") {
      templatePatch = parsed.templatePatch as Record<string, unknown>;
    } else if (pageId === "home" && isTemplatePatch(parsed)) {
      templatePatch = parsed;
    } else if (pageId === "home") {
      homepagePatch = parsed;
    }

    const tokens = tokensFromUnknown(parsed.setThemeTokens);
    const hints = hintsFromUnknown(parsed.setLayoutHints);
    if ((tokens || hints) && pageId !== "home") {
      if (isBuiltinPageId(pageId)) {
        const saved = await upsertPageTheme(pageId, { tokens, layoutHints: hints });
        pageThemePatch = { tokens: saved.tokens, layoutHints: saved.layoutHints };
      } else {
        pageThemePatch = { tokens, layoutHints: hints };
      }
    }

    if (isCustomPageId(pageId)) {
      const slug = customSlugFromPageId(pageId);
      const existing = slug ? await getCustomPageBySlug(slug) : null;
      if (existing) {
        customPage = await applyCustomPatch(existing, parsed);
      }
    }

    if (createdSections.length) {
      const afterInstanceId =
        selectedSection && typeof selectedSection === "object" && "instanceId" in selectedSection
          ? String((selectedSection as { instanceId?: string }).instanceId || "")
          : "";
      const existingAdd = asRecord(templatePatch?.addSection);
      templatePatch = {
        ...(templatePatch || {}),
        addSection: existingAdd?.type
          ? existingAdd
          : { type: "copilot", afterInstanceId },
      };
    }

    if (asRecord(parsed.createPage)) {
      const made = await applyCreatePage(parsed);
      if (made.page) {
        customPage = made.page;
        created = made.created;
      }
    }
  }

  return {
    ok: true,
    reply: text,
    homepagePatch,
    templatePatch,
    pageThemePatch,
    customPage,
    created,
    pageId,
    filesChanged,
    copilotSection: createdSections[createdSections.length - 1] || null,
  };
}

type GeminiGeneratePayload = {
  systemInstruction: { parts: Array<{ text: string }> };
  contents: Array<{ role: string; parts: Array<Record<string, unknown>> }>;
  generationConfig: { temperature: number; maxOutputTokens: number };
  tools?: Array<{ functionDeclarations: typeof HOMEPAGE_FILE_TOOLS }>;
  toolConfig?: { functionCallingConfig: { mode: string } };
};

type GeminiPart = {
  text?: string;
  functionCall?: { name?: string; args?: Record<string, unknown> };
};

async function generateGeminiTurn(
  apiKey: string,
  model: string,
  payload: GeminiGeneratePayload
): Promise<
  | { ok: true; text: string; calls: Array<{ name: string; args: Record<string, unknown>; raw: GeminiPart }> }
  | { ok: false; error: string; status: number }
> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  };
  if (!res.ok) {
    return {
      ok: false,
      status: 400,
      error: data?.error?.message || `Gemini error (${res.status})`,
    };
  }
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part.text || "").join("");
  const calls = parts.flatMap((part) => {
    const name = part.functionCall?.name;
    if (!name) return [];
    return [{ name, args: part.functionCall?.args || {}, raw: part }];
  });
  return { ok: true, text, calls };
}

async function runGeminiToolLoop(
  apiKey: string,
  model: string,
  payload: GeminiGeneratePayload,
  filesChanged: Array<{ path: string; action: string }>,
  createdSections: Array<{
    slug: string;
    html: string;
    css: string;
    titleAr: string;
    titleEn: string;
    titleTr: string;
  }>,
  onDelta?: (chunk: string) => void
): Promise<{ ok: true; text: string } | { ok: false; error: string; status: number }> {
  const contents = [...payload.contents];
  let lastText = "";
  for (let step = 0; step < 12; step += 1) {
    const turn = await generateGeminiTurn(apiKey, model, { ...payload, contents });
    if (!turn.ok) return turn;
    if (!turn.calls.length) {
      lastText = turn.text;
      if (lastText) onDelta?.(lastText);
      return { ok: true, text: lastText };
    }
    contents.push({
      role: "model",
      parts: turn.calls.map((call) => ({ functionCall: { name: call.name, args: call.args } })),
    });
    const responseParts: Array<Record<string, unknown>> = [];
    for (const call of turn.calls) {
      onDelta?.(`[${call.name}]\n`);
      const exec = await executeGeminiBuilderTool({ name: call.name, args: call.args });
      filesChanged.push(...exec.changed);
      if (exec.createdSection) createdSections.push(exec.createdSection);
      responseParts.push({
        functionResponse: { name: call.name, response: { result: exec.text.slice(0, 24_000) } },
      });
    }
    contents.push({ role: "user", parts: responseParts });
    if (turn.text) lastText += turn.text;
  }
  return { ok: true, text: lastText || "تم تطبيق التعديلات على الملفات." };
}

async function streamGeminiGenerateContent(
  apiKey: string,
  model: string,
  payload: GeminiGeneratePayload,
  onDelta?: (chunk: string) => void
): Promise<{ ok: true; text: string } | { ok: false; error: string; status: number }> {
  const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const streamRes = await fetch(streamUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (streamRes.ok && streamRes.body) {
    const reader = streamRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const raw = trimmed.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;
        try {
          const json = JSON.parse(raw) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const chunk =
            json.candidates?.[0]?.content?.parts
              ?.map((part) => part.text || "")
              .join("") || "";
          if (chunk) {
            text += chunk;
            onDelta?.(chunk);
          }
        } catch {
          /* ignore partial SSE */
        }
      }
    }
    if (text.trim()) return { ok: true, text };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  if (!res.ok) {
    return {
      ok: false,
      status: 400,
      error: data?.error?.message || `Gemini error (${res.status})`,
    };
  }
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || "";
  if (text) onDelta?.(text);
  return { ok: true, text };
}

export async function runGeminiBuilderChatStream(
  body: GeminiBuilderRequest,
  onDelta: (chunk: string) => void
): Promise<GeminiBuilderResult | { ok: false; error: string; status: number }> {
  return runGeminiBuilderChat(body, onDelta);
}
