import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import {
  resolveGeminiApiKey,
  resolveGeminiFreeApiKey,
  getGeminiPublicConfig,
} from "@/lib/server/gemini";
import {
  GEMINI_DEFAULT_MODEL,
  GEMINI_SALES_LITE_MODEL,
  normalizeGeminiModelId,
} from "@/lib/gemini-models";
import {
  getGeminiDailyUsage,
  incrementGeminiUsage,
  isGeminiQuotaError,
  type GeminiLane,
} from "@/lib/server/gemini-usage";
import {
  buildSalesCatalogSnapshot,
  applyMarkup,
} from "@/lib/server/sales-catalog";
import {
  isProgramCompleteEnough,
  saveAiProgram,
} from "@/lib/server/ai-programs-store";
import { publishAiProgramToCatalog } from "@/lib/server/packages-store";
import { saveUserAiProgram } from "@/lib/ai-programs-pb";
import {
  MARKET_PRICING_RULES,
  appendEstimateNote,
  stripEstimateNote,
} from "@/lib/sales-price-copy";
import { buildLiveQuote, mergeLiveCards } from "@/lib/server/ai-quote";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import {
  buildAdvisorCarsHref,
  buildAdvisorFlightHref,
  buildAdvisorTransferHref,
  extractOdFromText,
  sanitizeSiteHref,
} from "@/lib/server/travel-search-links";
import {
  SALES_CHAT_STAGE_IDS,
  type SalesChatStageId,
} from "@/lib/sales-chat-stages";
import type { Locale } from "@/lib/i18n/types";
import {
  hydrateSalesChatResponse,
  type HydratedSalesChat,
} from "@/lib/sales-chat-parse";
import type {
  SalesChatCard,
  SalesChatStructured,
} from "@/types/sales-chat";
import {
  planSalesChatTools,
  type SalesChatToolPlan,
} from "@/lib/sales-chat-intent";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatAttachment = {
  name: string;
  mimeType: string;
  dataBase64: string;
};

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Gemini can ingest these as inline multimodal parts */
const INLINE_MIMES = new Set([...IMAGE_MIMES, "application/pdf"]);

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const MAX_ATTACHMENTS = 4;

function applyCardMarkup(
  cards: SalesChatCard[],
  markup: number
): SalesChatCard[] {
  return cards.map((c) => {
    const href = sanitizeSiteHref(c.href);
    const pending = Boolean(c.pricePending);
    const live = c.source === "live" || c.source === "catalog";
    const base = Number(c.basePrice) || 0;
    const given = Number(c.clientPrice) || 0;
    if (pending) {
      return { ...c, href, clientPrice: 0, currency: "USD" };
    }
    if (live && given > 0) {
      return { ...c, href, currency: "USD" };
    }
    return {
      ...c,
      href,
      basePrice: base,
      clientPrice: given > 0 ? given : applyMarkup(base, markup),
      currency: "USD",
    };
  });
}

type SalesChatPayload = {
  ok: true;
  reply: string;
  cards: SalesChatCard[];
  itinerary: SalesChatStructured["itinerary"];
  readyForWhatsApp: boolean;
  whatsappNumber: string;
  markupPercent: number;
  flightHref?: string;
  transferHref?: string;
  carsHref?: string;
  hotelsHref?: string;
  savedProgramId?: string;
  programSaved?: boolean;
  perks?: SalesChatStructured["perks"];
  bundleCheckoutPayload?: SalesChatStructured["bundleCheckoutPayload"];
  transcript?: string;
  liveInventory?: boolean;
};

function emptyInventoryNote(locale: Locale, plan: SalesChatToolPlan): string {
  if (plan.intent === "INTENT_FLIGHT_SEARCH") {
    return locale === "tr"
      ? "Bu güzergahta canlı uçuş bileti yok. Tahmini araç veya transfer göstermiyoruz."
      : locale === "ar"
        ? "لا توجد تذاكر طيران حية قابلة للحجز على هذا المسار حالياً. لم نعرض سيارة أو ترانسفير كبديل."
        : "No live flight tickets for this route right now. We did not substitute a car or transfer.";
  }
  return locale === "tr"
    ? "Bu tarihler için canlı rezervasyon sonucu yok. Lütfen tarih veya destinasyonu değiştirin."
    : locale === "ar"
      ? "لا توجد نتائج حية قابلة للحجز بهذه التواريخ حالياً. جرّب تاريخاً أقرب أو وجهة أخرى."
      : "No live bookable results for these dates. Try nearby dates or another destination.";
}

function hasLiveFares(cards: SalesChatCard[]): boolean {
  return cards.some(
    (c) => (c.source === "live" || c.source === "catalog") && Number(c.clientPrice) > 0
  );
}

async function buildPayload(
  text: string,
  markup: number,
  whatsapp: string,
  locale: Locale,
  userId?: string,
  conversationText = "",
  plan?: SalesChatToolPlan
): Promise<SalesChatPayload> {
  const parsed: HydratedSalesChat = hydrateSalesChatResponse(text, { locale });
  const router = plan ?? planSalesChatTools(conversationText, conversationText);
  const spoken = extractOdFromText(conversationText);

  const dest =
    String(parsed?.destination || "").trim() ||
    parsed?.itinerary?.titleAr ||
    parsed?.itinerary?.titleEn ||
    "";
  const shouldQuote = router.tools.length > 0;
  const live = shouldQuote
    ? await buildLiveQuote(
        {
          destination: dest || conversationText,
          arrivalDate: parsed?.arrivalDate || parsed?.flightSearch?.date,
          departureDate: parsed?.departureDate || parsed?.flightSearch?.returnDate,
          nights: parsed?.nights,
          people: parsed?.people,
          fromIata:
            spoken.from ||
            parsed?.flightSearch?.fromIata ||
            parsed?.flightSearch?.from,
          toIata:
            spoken.to ||
            parsed?.flightSearch?.toIata ||
            parsed?.flightSearch?.to,
          fromCity: parsed?.flightSearch?.from,
          flightType: router.flightType,
        },
        markup,
        conversationText,
        {
          services: router.services,
          groundMode: router.groundMode,
          flightType: router.flightType,
        }
      ).catch(() => null)
    : null;

  const cards = applyCardMarkup(mergeLiveCards(parsed.cards, live), markup);
  let itinerary = parsed.itinerary;
  if (router.intent === "INTENT_PACKAGE_PLANNER" && (itinerary || live)) {
    const selectedSum =
      live?.totalClientPrice ||
      cards
        .filter((c) => c.type !== "package")
        .reduce((s, c) => s + (c.clientPrice || 0), 0);
    const base = Number(itinerary?.totalBasePrice) || 0;
    itinerary = {
      titleAr: itinerary?.titleAr || dest,
      titleEn: itinerary?.titleEn || dest,
      days: itinerary?.days || [],
      totalBasePrice: base,
      totalClientPrice: selectedSum || Number(itinerary?.totalClientPrice) || 0,
      currency: "USD",
      arrivalDate: live?.arrivalDate || parsed?.arrivalDate,
      departureDate: live?.departureDate || parsed?.departureDate,
      destination: dest || itinerary?.destination,
    };
  } else if (router.intent !== "INTENT_PACKAGE_PLANNER") {
    if (router.intent === "INTENT_FLIGHT_SEARCH") {
      itinerary = null;
    }
  }

  let replyOut = parsed.reply || "تم.";
  const liveFares = hasLiveFares(cards);
  if (liveFares) {
    replyOut = stripEstimateNote(replyOut);
  } else if (live && !cards.length) {
    const emptyNote = emptyInventoryNote(locale, router);
    replyOut = stripEstimateNote(replyOut);
    if (!replyOut.includes(emptyNote)) {
      replyOut = [replyOut.trim(), emptyNote].filter(Boolean).join("\n\n");
    }
  } else {
    replyOut = appendEstimateNote(replyOut, locale, whatsapp);
  }

  const flightHref = router.tools.includes("search_flights")
    ? live?.flightHref ||
      buildAdvisorFlightHref(parsed?.flightSearch, parsed?.suggestedFlightHref)
    : undefined;
  const transferHref = router.tools.includes("search_transfers")
    ? live?.transferHref ||
      buildAdvisorTransferHref(parsed?.transferSearch, parsed?.transferHref)
    : undefined;
  const carsHref = router.tools.includes("search_cars")
    ? live?.carsHref ||
      buildAdvisorCarsHref(parsed?.carsSearch, parsed?.carsHref, locale)
    : undefined;

  let savedProgramId: string | undefined;
  let programSaved = false;

  if (router.intent === "INTENT_PACKAGE_PLANNER" && itinerary && (parsed?.saveProgram || isProgramCompleteEnough({
    titleAr: itinerary.titleAr,
    titleEn: itinerary.titleEn,
    destination: String(parsed?.destination || itinerary.titleAr || ""),
    nights: parsed?.nights,
    people: parsed?.people,
    arrivalDate: parsed?.arrivalDate,
    departureDate: parsed?.departureDate,
    priceFromUsd: itinerary.totalClientPrice,
    thumbnail: parsed?.thumbnail || cards.find((c) => c.image)?.image,
    includesAr: parsed?.includesAr,
    includesEn: parsed?.includesEn,
    itinerary,
    flightHref,
    transferHref,
    carsHref,
  }))) {
    try {
      const destination =
        String(parsed?.destination || "").trim() ||
        itinerary.titleAr ||
        itinerary.titleEn;
      const saved = await saveAiProgram({
        titleAr: itinerary.titleAr,
        titleEn: itinerary.titleEn,
        destination,
        nights:
          parsed?.nights ??
          live?.nights ??
          Math.max(0, (itinerary.days?.length || 1) - 1),
        people: parsed?.people ?? live?.people,
        arrivalDate: parsed?.arrivalDate || live?.arrivalDate,
        departureDate: parsed?.departureDate || live?.departureDate,
        priceFromUsd: itinerary.totalClientPrice,
        thumbnail: parsed?.thumbnail || cards.find((c) => c.image)?.image,
        includesAr: parsed?.includesAr,
        includesEn: parsed?.includesEn,
        itinerary,
        cards,
        flightHref,
        transferHref,
        carsHref,
      });
      savedProgramId = saved.program.id;
      programSaved = !saved.deduped;
      saved.program.cards = cards;
      try {
        await publishAiProgramToCatalog(saved.program);
      } catch {
        /* catalog publish is best-effort */
      }
      if (userId) {
        await saveUserAiProgram(userId, saved.program, cards);
      }
    } catch {
      /* incomplete or store error — skip persist */
    }
  }

  const rawPerks = parsed?.perks;
  const clientTotal =
    router.intent === "INTENT_PACKAGE_PLANNER"
      ? itinerary?.totalClientPrice || cards.reduce((sum, c) => sum + (c.clientPrice || 0), 0)
      : cards.reduce((sum, c) => sum + (c.clientPrice || 0), 0);
  const originalPriceUsd = rawPerks?.originalPriceUsd || (clientTotal > 0 ? Math.round(clientTotal * 1.25) : 0);
  const bundlePriceUsd = rawPerks?.bundlePriceUsd || clientTotal;
  const savingsUsd = rawPerks?.savingsUsd || Math.max(0, originalPriceUsd - bundlePriceUsd);
  const savingsPercent = rawPerks?.savingsPercent || (originalPriceUsd > 0 ? Math.round((savingsUsd / originalPriceUsd) * 100) : 20);

  const perks =
    router.intent === "INTENT_PACKAGE_PLANNER"
      ? {
          originalPriceUsd,
          bundlePriceUsd,
          savingsUsd,
          savingsPercent,
          loyaltyPointsEarned: rawPerks?.loyaltyPointsEarned || Math.round(bundlePriceUsd * 2),
          loyaltyCashValue: rawPerks?.loyaltyCashValue || Math.round(bundlePriceUsd * 0.02),
          affiliateCommissionEarned: rawPerks?.affiliateCommissionEarned || Math.round(bundlePriceUsd * 0.04),
          socialRewardNotice: rawPerks?.socialRewardNotice || "اربح نقاطاً ومكافآت كاش فورية عند مشاركة أول صورة لرحلتك في مجتمع لوناليزا!",
        }
      : undefined;

  const bundleCheckoutPayload =
    router.intent === "INTENT_PACKAGE_PLANNER"
      ? parsed?.bundleCheckoutPayload ||
        (clientTotal > 0
          ? {
              destinationCity: dest || "",
              departDate: live?.arrivalDate || parsed?.arrivalDate,
              returnDate: live?.departureDate || parsed?.departureDate,
              totalPrice: bundlePriceUsd,
              originalPrice: originalPriceUsd,
            }
          : undefined)
      : undefined;

  return {
    ok: true,
    reply: replyOut,
    cards,
    itinerary: router.intent === "INTENT_PACKAGE_PLANNER" ? itinerary : null,
    readyForWhatsApp: Boolean(parsed?.readyForWhatsApp) || cards.length > 0,
    whatsappNumber: whatsapp,
    markupPercent: markup,
    flightHref,
    transferHref,
    carsHref,
    hotelsHref: router.tools.includes("search_hotels") ? live?.hotelsHref : undefined,
    savedProgramId,
    programSaved,
    perks,
    bundleCheckoutPayload,
    liveInventory: liveFares,
  };
}

function sanitizeAttachments(raw: unknown): ChatAttachment[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatAttachment[] = [];
  for (const item of raw.slice(0, MAX_ATTACHMENTS)) {
    if (!item || typeof item !== "object") continue;
    const a = item as Record<string, unknown>;
    const name = String(a.name || "file").slice(0, 200);
    const mimeType = String(a.mimeType || "application/octet-stream")
      .toLowerCase()
      .slice(0, 100);
    let dataBase64 = String(a.dataBase64 || "").replace(/\s/g, "");
    const comma = dataBase64.indexOf(",");
    if (dataBase64.startsWith("data:") && comma !== -1) {
      dataBase64 = dataBase64.slice(comma + 1);
    }
    if (!dataBase64) continue;
    const approxBytes = Math.floor((dataBase64.length * 3) / 4);
    if (approxBytes > MAX_ATTACHMENT_BYTES) continue;
    out.push({ name, mimeType, dataBase64 });
  }
  return out;
}

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

function buildUserParts(
  content: string,
  attachments: ChatAttachment[],
  isLastUser: boolean
): GeminiPart[] {
  const parts: GeminiPart[] = [];
  let text = content || "";

  if (isLastUser && attachments.length > 0) {
    const notes: string[] = [];
    for (const att of attachments) {
      if (INLINE_MIMES.has(att.mimeType) || IMAGE_MIMES.has(att.mimeType)) {
        notes.push(
          IMAGE_MIMES.has(att.mimeType)
            ? `[Attached image: ${att.name}]`
            : `[Attached PDF: ${att.name}]`
        );
      } else {
        notes.push(
          `[Attached document "${att.name}" (${att.mimeType}) — content not extracted; use filename and any customer description to help.]`
        );
      }
    }
    if (notes.length) {
      text = [text.trim(), ...notes].filter(Boolean).join("\n");
    }
  }

  if (text.trim()) parts.push({ text });

  if (isLastUser) {
    for (const att of attachments) {
      if (INLINE_MIMES.has(att.mimeType)) {
        parts.push({
          inlineData: {
            mimeType: att.mimeType === "image/jpg" ? "image/jpeg" : att.mimeType,
            data: att.dataBase64,
          },
        });
      }
    }
  }

  if (!parts.length) parts.push({ text: "(empty)" });
  return parts;
}

function buildSystemPrompt(
  config: Awaited<ReturnType<typeof getGeminiPublicConfig>>,
  locale: Locale,
  catalog: ReturnType<typeof buildSalesCatalogSnapshot>,
  markup: number,
  plan: SalesChatToolPlan
): string {
  const allowedTools = plan.tools.length ? plan.tools.join(", ") : "(none — ask a clarifying question)";
  const searchFields = [
    plan.tools.includes("search_flights")
      ? `"flightSearch": { "fromIata": "IST", "toIata": "LHR", "date": "2026-09-29", "flightType": "${plan.flightType}", "guests": 1 }`
      : null,
    plan.tools.includes("search_transfers")
      ? `"transferSearch": { "from": "IST Airport", "to": "hotel", "date": "2026-09-29", "guests": 2 }`
      : null,
    plan.tools.includes("search_cars")
      ? `"carsSearch": { "iata": "IST", "date": "2026-09-29", "returnDate": "2026-10-04", "guests": 2 }`
      : null,
  ]
    .filter(Boolean)
    .join(",\n  ");

  return `${config.salesInstructions}

TONE:
${config.salesTone}

BEHAVIOR RULES (mandatory, admin-editable):
${config.salesBehaviorRules}

UPSELL:
${plan.intent === "INTENT_PACKAGE_PLANNER" ? config.salesUpsellNotes : "Do not upsell hotels, cars, transfers, or packages unless the classified intent is a bundled trip."}

WHEN TO SAVE A PROGRAM:
${plan.intent === "INTENT_PACKAGE_PLANNER" ? config.salesSaveProgramRules : "Do not save a program. This is a single-service request."}

SERVER INTENT ROUTER (locked — you cannot override):
Classified intent: ${plan.intent}
Allowed live tools (server will call these GDS/catalog engines; you cannot add others): ${allowedTools}
Ground transport XOR: ${plan.groundMode} (never include both private transfer and rental car unless mode is both).
If the customer asked only for flights, reply about flights only. Never invent a car (e.g. Toyota Corolla) as a flight substitute.
If live search returns no offers, say so honestly. Never fabricate market-estimate ticket prices.

${plan.intent === "INTENT_PACKAGE_PLANNER" ? `MARKET PRICING (only when live inventory is empty):\n${MARKET_PRICING_RULES}` : "Use live GDS/hotel/car/transfer prices only. Do not append تقديرى/estimated-market copy when live fares exist."}

CATALOG FIRST, THEN RESEARCH:
1) If an agency catalog package/hotel/VIP tour matches AND the intent allows it, use it.
2) The server attaches live inventory cards by calling: ${allowedTools}.
3) saveProgram=true only for INTENT_PACKAGE_PLANNER.

ITINERARY & PROGRAM GENERATION:
${plan.intent === "INTENT_PACKAGE_PLANNER" ? `When the customer asks for a travel program or itinerary:
1) Put the day-by-day schedule ONLY in the structured "itinerary" object.
2) "reply" = 1–3 short sentences. NEVER dump day-by-day Markdown.
3) Dates MUST be ISO YYYY-MM-DD.
4) Do NOT invent live hotel/flight/transfer prices or names. The server attaches live cards.
5) If customer support is needed, link: [تواصل مع خدمة العملاء عبر واتساب](https://wa.me/${config.salesWhatsApp})
6) NO EMOJIS. Brand is strictly "لوناليزا للسياحة والسفر" (Lonaliza Travel).`
    : `Single-service mode (${plan.intent}):
1) "reply" = short confirmation of the search. Ask only for missing dates/passengers if needed.
2) cards and itinerary stay empty — the server fills live cards from ${allowedTools}.
3) Do not fill transferSearch or carsSearch unless those tools are allowed.
4) NO EMOJIS. Brand is strictly "لوناليزا للسياحة والسفر" (Lonaliza Travel).
5) Support link if needed: [تواصل مع خدمة العملاء عبر واتساب](https://wa.me/${config.salesWhatsApp})`}

Preferred reply language: ${locale === "ar" ? "Arabic" : locale === "tr" ? "Turkish" : "English"}.
Mandatory markup: ${markup}% — clientPrice = basePrice × (1 + ${markup}/100). Program prices always USD.
Company WhatsApp link for booking: https://wa.me/${config.salesWhatsApp}

Agency catalog (JSON):
${plan.intent === "INTENT_PACKAGE_PLANNER" ? JSON.stringify(catalog) : "[]"}

OUTPUT FORMAT (mandatory):
Return ONE JSON object only. You may wrap it in a single \`\`\`json fence.
"reply" = short customer-facing summary (no JSON, no emojis).
If you are still gathering dates, ask questions and use "cards": [] and "itinerary": null.
The server rebuilds booking URLs — never invent off-site booking links.
\`\`\`json
{
  "reply": "short customer-facing response without emojis",
  "cards": [],
  "itinerary": ${plan.intent === "INTENT_PACKAGE_PLANNER" ? `{
    "titleAr": "",
    "titleEn": "",
    "days": [{ "day": 1, "titleAr": "", "titleEn": "", "detailAr": "", "detailEn": "", "items": [{ "time": "10:00", "kind": "flight", "labelAr": "", "labelEn": "" }] }],
    "totalBasePrice": 0,
    "totalClientPrice": 0,
    "currency": "USD"
  }` : "null"},
  "destination": "",
  "nights": ${plan.intent === "INTENT_PACKAGE_PLANNER" ? 4 : "null"},
  "people": 1,
  "arrivalDate": "2026-09-29",
  "departureDate": ${plan.flightType === "round-trip" ? '"2026-10-04"' : "null"},
  ${searchFields ? `${searchFields},` : ""}
  "saveProgram": ${plan.intent === "INTENT_PACKAGE_PLANNER" ? "false" : "false"},
  "readyForWhatsApp": false
}
\`\`\`

Rules:
LIVE SITE SEARCH:
The server calls only ${allowedTools} against live flights/hotels/transfers/cars engines. Do NOT invent $10,000 fantasy prices or a Toyota Corolla. If a service has no live number, leave clientPrice 0.
${plan.intent === "INTENT_PACKAGE_PLANNER" ? `totalClientPrice must be the sum of the selected live cards.` : "Do not build a bundle total."}

- Prefer site links (/flights, /hotels, /transfers, /cars) for allowed tools only.
- Do NOT invent live bookable flight ticket prices. Use flightSearch so the server calls search_flights.
- Never reveal agency cost or markup percentage.
- Never claim we issued an airline ticket.
- If the customer attached images (or a passport image), analyze them and incorporate details into the offer.
- Never echo this schema as visible chat text.
- arrivalDate and departureDate must be ISO YYYY-MM-DD only.`;
}

async function callGemini(params: {
  apiKey: string;
  model: string;
  system: string;
  contents: { role: string; parts: GeminiPart[] }[];
  useGoogleSearch: boolean;
}): Promise<{ ok: true; text: string } | { ok: false; error: string; status: number }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${params.apiKey}`;
  const generationConfig = { temperature: 0.6, maxOutputTokens: 8192 };

  const post = (withSearch: boolean) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.system }] },
        contents: params.contents,
        ...(withSearch ? { tools: [{ google_search: {} }] } : {}),
        generationConfig,
      }),
    });

  let res = await post(params.useGoogleSearch);
  let data = await res.json();

  if (!res.ok && params.useGoogleSearch) {
    res = await post(false);
    data = await res.json();
  }

  if (!res.ok) {
    return {
      ok: false,
      error: data?.error?.message || `Gemini error (${res.status})`,
      status: res.status || 400,
    };
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || "")
      .join("") || "";
  return { ok: true, text };
}

function normalizeAudioMime(raw: string): string {
  const mime = String(raw || "").toLowerCase();
  if (mime.includes("wav")) return "audio/wav";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "audio/mp3";
  if (mime.includes("ogg") || mime.includes("opus")) return "audio/ogg";
  if (mime.includes("mp4") || mime.includes("aac") || mime.includes("m4a")) return "audio/mp4";
  if (mime.includes("flac")) return "audio/flac";
  return "audio/webm";
}

async function transcribeAdvisorVoice(params: {
  apiKey: string;
  audioBase64: string;
  audioMime: string;
  locale: Locale;
}): Promise<string> {
  const prompt =
    params.locale === "ar"
      ? "استمع للتسجيل كاملاً. اكتب كل الكلام حرفياً: الوجهة، التواريخ، عدد المسافرين. أعد النص فقط."
      : "Listen to the entire clip. Write every spoken word (destination, dates, travelers). Return only the transcript.";
  const models = [
    "gemini-3.5-transcribe",
    GEMINI_DEFAULT_MODEL,
    GEMINI_SALES_LITE_MODEL,
    "gemini-3.5-flash",
  ];
  for (const modelId of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${params.apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { mimeType: params.audioMime, data: params.audioBase64 } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: { temperature: 0, maxOutputTokens: 2048 },
        }),
      });
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text || "")
          .join("")
          .replace(/```[\s\S]*?```/g, "")
          .replace(/^["']|["']$/g, "")
          .trim() || "";
      if (res.ok && text) return text;
    } catch {
      /* try next model */
    }
  }
  return "";
}

export async function GET() {
  const config = await getGeminiPublicConfig();
  return NextResponse.json({
    ok: true,
    welcomeAr: config.salesWelcomeAr,
    welcomeEn: config.salesWelcomeEn,
    whatsappNumber: config.salesWhatsApp,
    markupPercent: config.salesMarkupPercent,
  });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(`sales-chat:${clientIp(req)}`, 30, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : [];
    const locale: Locale =
      body.locale === "en" ? "en" : body.locale === "tr" ? "tr" : "ar";
    const attachments = sanitizeAttachments(body.attachments);
    const wantsStream =
      body.stream === true ||
      (req.headers.get("accept") || "").includes("text/event-stream");
    let audioBase64 = String(body.audioBase64 || "").replace(/\s/g, "");
    const comma = audioBase64.indexOf(",");
    if (audioBase64.startsWith("data:") && comma !== -1) {
      audioBase64 = audioBase64.slice(comma + 1);
    }
    if (audioBase64.length > 8_000_000) audioBase64 = "";
    const audioMime = normalizeAudioMime(String(body.audioMime || ""));

    if (!messages.length && !audioBase64) {
      return NextResponse.json(
        { ok: false, error: "messages required" },
        { status: 400 }
      );
    }

    const config = await getGeminiPublicConfig();
    const [paid, free] = await Promise.all([
      resolveGeminiApiKey(),
      resolveGeminiFreeApiKey(),
    ]);
    const usage = await getGeminiDailyUsage();
    const freeLimit = config.dailyFreeChatLimit;
    const paidLimit = config.dailyPaidChatLimit;

    let lane: GeminiLane | null = null;
    let apiKey: string | null = null;
    if (free.apiKey && usage.freeCount < freeLimit) {
      lane = "free";
      apiKey = free.apiKey;
    } else if (
      config.salesPaidKeyEnabled &&
      paid.apiKey &&
      usage.paidCount < paidLimit
    ) {
      lane = "paid";
      apiKey = paid.apiKey;
    }

    if (!apiKey || !lane) {
      const noKeys = !free.apiKey && !paid.apiKey;
      return NextResponse.json(
        {
          ok: false,
          error: noKeys
            ? "المساعد غير جاهز الآن. أضف مفتاح الحد المجاني من إعدادات الذكاء الاصطناعي."
            : config.salesPaidKeyEnabled
              ? "انتهى حد اليوم. جرّب غداً أو فعّل المفتاح المدفوع مؤقتاً من الإعدادات."
              : "انتهى الحد المجاني لليوم. يمكنك تفعيل المفتاح المدفوع من الإعدادات إذا أردت المتابعة.",
        },
        { status: noKeys ? 400 : 429 }
      );
    }

    const catalog = buildSalesCatalogSnapshot();
    const markup = config.salesMarkupPercent;
    const model = config.salesPreferLiteModel
      ? GEMINI_SALES_LITE_MODEL
      : normalizeGeminiModelId(config.model);

    let transcript = "";
    if (audioBase64) {
      transcript = await transcribeAdvisorVoice({
        apiKey,
        audioBase64,
        audioMime,
        locale,
      });
      if (transcript) {
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser && !String(lastUser.content || "").trim()) {
          lastUser.content = transcript;
        } else if (!messages.length) {
          messages.push({ role: "user", content: transcript });
        } else if (lastUser && lastUser.content.trim().length < 8) {
          lastUser.content = transcript;
        }
      }
    }

    if (!messages.length) {
      return NextResponse.json(
        { ok: false, error: locale === "ar" ? "تعذر تفريغ التسجيل. أعد المحاولة." : "Could not transcribe the clip. Try again." },
        { status: 400 }
      );
    }

    const lastUserText = [...messages]
      .reverse()
      .find((m) => m.role === "user")
      ?.content || "";
    const conversationText = messages.map((m) => m.content).join("\n");
    const plan = planSalesChatTools(lastUserText, conversationText);
    const system = buildSystemPrompt(config, locale, catalog, markup, plan);
    const useGoogleSearch =
      Boolean(config.salesUseGoogleSearch) ||
      plan.intent === "INTENT_PACKAGE_PLANNER";

    const lastUserIdx = (() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") return i;
      }
      return -1;
    })();

    const contents = messages.map((m, idx) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: buildUserParts(
        m.content,
        attachments,
        m.role === "user" && idx === lastUserIdx
      ),
    }));

    const runModel = async (key: string) =>
      callGemini({
        apiKey: key,
        model,
        system,
        contents,
        useGoogleSearch,
      });

    const runWithQuota = async () => {
      let gemini = await runModel(apiKey);
      if (gemini.ok) {
        await incrementGeminiUsage(lane);
        return gemini;
      }
      if (
        lane === "free" &&
        isGeminiQuotaError(gemini.status, gemini.error) &&
        config.salesPaidKeyEnabled &&
        paid.apiKey &&
        usage.paidCount < paidLimit
      ) {
        gemini = await runModel(paid.apiKey);
        if (gemini.ok) await incrementGeminiUsage("paid");
        return gemini;
      }
      return gemini;
    };

    if (!wantsStream) {
      const gemini = await runWithQuota();
      if (!gemini.ok) {
        return NextResponse.json(
          { ok: false, error: gemini.error },
          { status: gemini.status }
        );
      }
      const customer = await getRequestCustomer(req);
      const payload = await buildPayload(
        gemini.text,
        markup,
        config.salesWhatsApp,
        locale,
        customer?.id,
        conversationText,
        plan
      );
      if (transcript) payload.transcript = transcript;
      return NextResponse.json(payload);
    }

    const encoder = new TextEncoder();
    const stages = plan.stages.length ? plan.stages : (["understand", "dates"] as SalesChatStageId[]);
    const lastStage = stages[stages.length - 1] || "understand";
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        let stageIndex = 0;
        const emitStage = (id: SalesChatStageId, status: "active" | "done") => {
          send("stage", { id, status, index: SALES_CHAT_STAGE_IDS.indexOf(id) });
        };

        emitStage(stages[0] || "understand", "active");

        const ticker = setInterval(() => {
          stageIndex = Math.min(stageIndex + 1, stages.length - 1);
          const id = stages[stageIndex] || lastStage;
          emitStage(id, "active");
        }, 1600);

        try {
          const gemini = await runWithQuota();
          clearInterval(ticker);
          if (!gemini.ok) {
            send("error", { ok: false, error: gemini.error });
            controller.close();
            return;
          }

          emitStage(lastStage, "active");
          const customer = await getRequestCustomer(req);
          const payload = await buildPayload(
            gemini.text,
            markup,
            config.salesWhatsApp,
            locale,
            customer?.id,
            conversationText,
            plan
          );
          if (transcript) payload.transcript = transcript;
          emitStage(lastStage, "done");
          send("result", payload);
        } catch (e) {
          clearInterval(ticker);
          send("error", {
            ok: false,
            error: e instanceof Error ? e.message : "Unknown error",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
