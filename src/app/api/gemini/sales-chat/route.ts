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
} from "@/lib/sales-price-copy";
import { buildLiveQuote, mergeLiveCards } from "@/lib/server/ai-quote";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import {
  buildAdvisorCarsHref,
  buildAdvisorFlightHref,
  buildAdvisorTransferHref,
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
};

async function buildPayload(
  text: string,
  markup: number,
  whatsapp: string,
  locale: Locale,
  userId?: string,
  conversationText = ""
): Promise<SalesChatPayload> {
  const parsed: HydratedSalesChat = hydrateSalesChatResponse(text, { locale });
  const reply = appendEstimateNote(parsed.reply || "تم.", locale, whatsapp);

  const dest =
    String(parsed?.destination || "").trim() ||
    parsed?.itinerary?.titleAr ||
    parsed?.itinerary?.titleEn ||
    "";
  const shouldQuote =
    Boolean(dest) ||
    Boolean(parsed?.flightSearch?.fromIata || parsed?.flightSearch?.toIata) ||
    /antalya|istanbul|trabzon|cappadocia|أنطاليا|إسطنبول|طرابزون|كابادوكيا|riyadh|الرياض|jeddah|جدة/i.test(
      conversationText
    );
  const live = shouldQuote
    ? await buildLiveQuote(
        {
          destination: dest || conversationText,
          arrivalDate: parsed?.arrivalDate || parsed?.flightSearch?.date,
          departureDate: parsed?.departureDate || parsed?.flightSearch?.returnDate,
          nights: parsed?.nights,
          people: parsed?.people,
          fromIata: parsed?.flightSearch?.fromIata || parsed?.flightSearch?.from,
          toIata: parsed?.flightSearch?.toIata || parsed?.flightSearch?.to,
          fromCity: parsed?.flightSearch?.from,
        },
        markup,
        conversationText
      ).catch(() => null)
    : null;

  const cards = applyCardMarkup(mergeLiveCards(parsed.cards, live), markup);
  let itinerary = parsed.itinerary;
  if (itinerary || live) {
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
  }

  let replyOut = reply;
  if (live && !cards.length) {
    const emptyNote =
      locale === "tr"
        ? "Bu tarihler için canlı rezervasyon sonucu yok. Lütfen tarih veya destinasyonu değiştirin."
        : locale === "ar"
          ? "لا توجد نتائج حية قابلة للحجز بهذه التواريخ حالياً. جرّب تاريخاً أقرب أو وجهة أخرى."
          : "No live bookable results for these dates. Try nearby dates or another destination.";
    if (!replyOut.includes(emptyNote)) {
      replyOut = [replyOut.trim(), emptyNote].filter(Boolean).join("\n\n");
    }
  }

  const flightHref =
    live?.flightHref ||
    buildAdvisorFlightHref(parsed?.flightSearch, parsed?.suggestedFlightHref);
  const transferHref =
    live?.transferHref ||
    buildAdvisorTransferHref(parsed?.transferSearch, parsed?.transferHref);
  const carsHref =
    live?.carsHref ||
    buildAdvisorCarsHref(parsed?.carsSearch, parsed?.carsHref, locale);

  let savedProgramId: string | undefined;
  let programSaved = false;

  if (itinerary && (parsed?.saveProgram || isProgramCompleteEnough({
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
  const clientTotal = itinerary?.totalClientPrice || cards.reduce((sum, c) => sum + (c.clientPrice || 0), 0);
  const originalPriceUsd = rawPerks?.originalPriceUsd || (clientTotal > 0 ? Math.round(clientTotal * 1.25) : 0);
  const bundlePriceUsd = rawPerks?.bundlePriceUsd || clientTotal;
  const savingsUsd = rawPerks?.savingsUsd || Math.max(0, originalPriceUsd - bundlePriceUsd);
  const savingsPercent = rawPerks?.savingsPercent || (originalPriceUsd > 0 ? Math.round((savingsUsd / originalPriceUsd) * 100) : 20);

  const perks = {
    originalPriceUsd,
    bundlePriceUsd,
    savingsUsd,
    savingsPercent,
    loyaltyPointsEarned: rawPerks?.loyaltyPointsEarned || Math.round(bundlePriceUsd * 2),
    loyaltyCashValue: rawPerks?.loyaltyCashValue || Math.round(bundlePriceUsd * 0.02),
    affiliateCommissionEarned: rawPerks?.affiliateCommissionEarned || Math.round(bundlePriceUsd * 0.04),
    socialRewardNotice: rawPerks?.socialRewardNotice || "اربح نقاطاً ومكافآت كاش فورية عند مشاركة أول صورة لرحلتك في مجتمع لوناليزا!",
  };

  const bundleCheckoutPayload = parsed?.bundleCheckoutPayload || (clientTotal > 0 ? {
    destinationCity: dest || "",
    departDate: live?.arrivalDate || parsed?.arrivalDate,
    returnDate: live?.departureDate || parsed?.departureDate,
    totalPrice: bundlePriceUsd,
    originalPrice: originalPriceUsd,
  } : undefined);

  return {
    ok: true,
    reply: replyOut,
    cards,
    itinerary,
    readyForWhatsApp: Boolean(parsed?.readyForWhatsApp) || cards.length > 0,
    whatsappNumber: whatsapp,
    markupPercent: markup,
    flightHref,
    transferHref,
    carsHref,
    hotelsHref: live?.hotelsHref,
    savedProgramId,
    programSaved,
    perks,
    bundleCheckoutPayload,
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

function inferNeededStages(messages: ChatMessage[]): SalesChatStageId[] {
  const blob = messages
    .map((m) => m.content)
    .join("\n")
    .toLowerCase();
  const stages: SalesChatStageId[] = ["understand", "dates"];
  if (
    /flight|طيران|تذكر|airport|مطار|iata|dxb|ist/.test(blob) ||
    messages.length <= 4
  ) {
    stages.push("flights");
  }
  if (
    /transfer|ترانسفير|shuttle|pickup|توصيل/.test(blob) ||
    messages.length <= 4
  ) {
    stages.push("transfers");
  }
  if (/car|سيارة|تأجير|rent/.test(blob) || messages.length <= 4) {
    stages.push("cars");
  }
  stages.push("program");
  return stages;
}

function buildSystemPrompt(
  config: Awaited<ReturnType<typeof getGeminiPublicConfig>>,
  locale: Locale,
  catalog: ReturnType<typeof buildSalesCatalogSnapshot>,
  markup: number
): string {
  return `${config.salesInstructions}

TONE:
${config.salesTone}

BEHAVIOR RULES (mandatory, admin-editable):
${config.salesBehaviorRules}

UPSELL:
${config.salesUpsellNotes}

WHEN TO SAVE A PROGRAM:
${config.salesSaveProgramRules}

MARKET PRICING (mandatory, realistic Turkey rates — never fantasy prices):
${MARKET_PRICING_RULES}

CATALOG FIRST, THEN RESEARCH:
1) If an agency catalog package/hotel/VIP tour matches the request, use it.
2) If nothing matches, research from travel knowledge (and web search if available) and compose a complete custom itinerary: real hotel names, day-by-day details, cover image URL, transfers, inclusions, market-based USD price after the ${markup}% markup only.
3) Then set saveProgram=true so the server PUBLISHES the program to admin programs + public /holidays + /ai-chat.

ITINERARY & PROGRAM GENERATION (CRITICAL):
When the customer asks for a travel program or itinerary:
1) Put the day-by-day schedule ONLY in the structured "itinerary" object (days[].titleAr/titleEn, detailAr/detailEn, optional items[] with time + kind=flight|hotel|transfer|activity).
2) "reply" = 1–3 short sentences. NEVER dump day-by-day Markdown, never repeat the itinerary in reply, never paste JSON.
3) Dates MUST be ISO YYYY-MM-DD (example 2026-09-20). Never put night-count or year alone in arrivalDate/departureDate.
4) Do NOT invent live hotel/flight/transfer prices or names. The server attaches live inventory cards. Leave cards [] unless you are only listing catalog package ids.
5) If customer support is needed, link: [تواصل مع خدمة العملاء عبر واتساب](https://wa.me/${config.salesWhatsApp}) — never a bare phone number, never whatsapp://
6) NO EMOJIS. Brand is strictly "لوناليزا للسياحة والسفر" (Lonaliza Travel).

Preferred reply language: ${locale === "ar" ? "Arabic" : locale === "tr" ? "Turkish" : "English"}.
Mandatory markup: ${markup}% — clientPrice = basePrice × (1 + ${markup}/100). Program prices always USD.
Company WhatsApp link for booking: https://wa.me/${config.salesWhatsApp}

Agency catalog (JSON):
${JSON.stringify(catalog)}

OUTPUT FORMAT (mandatory):
Return ONE JSON object only. You may wrap it in a single \`\`\`json fence.
"reply" = short customer-facing summary (no day-by-day dump, no JSON, no emojis).
If you are still gathering dates, ask questions and use "cards": [] and "itinerary": null.
The server rebuilds booking URLs — never invent off-site booking links.
\`\`\`json
{
  "reply": "detailed customer-facing response without emojis",
  "cards": [
    {
      "type": "hotel|package|transfer|car",
      "id": "optional",
      "titleAr": "",
      "titleEn": "",
      "subtitleAr": "",
      "subtitleEn": "",
      "image": "https://...",
      "basePrice": 1000,
      "clientPrice": ${Math.round(1000 * (1 + markup / 100))},
      "currency": "USD",
      "href": "/hotels/slug",
      "badges": ["5★"],
      "highlights": ["..."]
    }
  ],
  "itinerary": {
    "titleAr": "",
    "titleEn": "",
    "days": [{ "day": 1, "titleAr": "", "titleEn": "", "detailAr": "", "detailEn": "", "items": [{ "time": "10:00", "kind": "flight", "labelAr": "", "labelEn": "" }] }],
    "totalBasePrice": 0,
    "totalClientPrice": 0,
    "currency": "USD"
  },
  "destination": "Istanbul",
  "nights": 4,
  "people": 2,
  "arrivalDate": "2026-09-10",
  "departureDate": "2026-09-14",
  "includesAr": ["إقامة", "إفطار"],
  "includesEn": ["Hotel", "Breakfast"],
  "thumbnail": "",
  "flightSearch": {
    "fromIata": "DXB",
    "toIata": "IST",
    "date": "2026-09-10",
    "returnDate": "2026-09-14",
    "guests": 2,
    "flightType": "round-trip",
    "alreadyBookedFlights": false
  },
  "transferSearch": {
    "from": "IST Airport",
    "to": "Sultanahmet hotel",
    "date": "2026-09-10",
    "time": "14:00",
    "guests": 2
  },
  "carsSearch": {
    "iata": "IST",
    "date": "2026-09-11",
    "returnDate": "2026-09-14",
    "guests": 2
  },
  "perks": {
    "originalPriceUsd": 1850,
    "bundlePriceUsd": 1420,
    "savingsUsd": 430,
    "savingsPercent": 23,
    "loyaltyPointsEarned": 2840,
    "loyaltyCashValue": 28,
    "affiliateCommissionEarned": 56,
    "socialRewardNotice": "اربح نقاطاً ومكافآت كاش فورية عند مشاركة أول صورة لرحلتك في مجتمع لوناليزا!"
  },
  "bundleCheckoutPayload": {
    "destinationCity": "Istanbul",
    "departDate": "2026-09-10",
    "returnDate": "2026-09-14",
    "totalPrice": 1420,
    "originalPrice": 1850
  },
  "saveProgram": false,
  "readyForWhatsApp": false
}
\`\`\`

Rules:
LIVE SITE SEARCH:
The server attaches real cards from /hotels/search, internal transfers, internal cars, and /flights links (Travelpayouts). Do NOT invent $10,000 fantasy prices. If a service has no live number, leave clientPrice 0 — the UI shows "يتحدد عند التأكيد".
totalClientPrice must be the sum of the selected live cards (flight + hotel stay + transfer + optional car).

PSYCHOLOGICAL PRICE ANCHORING & PLATFORM PERKS (MANDATORY):
- When recommending a program, hotel, or bundle, always populate the "perks" object.
- originalPriceUsd must be realistically 20%–30% higher than bundlePriceUsd (showing the customer the clear monetary savings of bundling services together).
- Calculate loyaltyPointsEarned (bundlePriceUsd * 2), loyaltyCashValue (bundlePriceUsd * 0.02), and affiliateCommissionEarned (bundlePriceUsd * 0.04).
- In the reply text, warmly highlight the bundle savings, the loyalty points earned, and how sharing their booking with friends or on the Lonaliza social community earns them cash commissions!

- Prefer catalog items and site links (/hotels, /holidays, /vip-tours, /flights, /transfers, /cars).
- If catalog has no match: research and BUILD a full custom program, then saveProgram=true (it will be published).
- Do NOT invent live bookable flight ticket prices. Use flightSearch so the server builds /flights?...
- Estimate hotel/package prices from realistic Turkey market ranges then apply ${markup}% markup only (USD).
- When the itinerary is complete enough, set saveProgram=true.
- When the plan is ready set readyForWhatsApp=true and invite WhatsApp confirmation with the estimate disclaimer.
- Never reveal agency cost or markup percentage.
- Never claim we issued an airline ticket.
- If the customer attached images (or a passport image), analyze them and incorporate details into the offer.
- Never echo this schema as visible chat text. Cards and itinerary belong in JSON fields, not in reply.
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
    const system = buildSystemPrompt(config, locale, catalog, markup);

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
    const looksLikeProgramRequest =
      /antalya|istanbul|trabzon|cappadocia|أنطاليا|إسطنبول|طرابزون|كابادوكيا|برنامج|ليال|أيام|honeymoon|شهر عسل/i.test(
        lastUserText
      ) &&
      /\d+|يوم|ليل|day|night|تاريخ|june|يونيو|مايو|أغسطس/i.test(lastUserText);
    const useGoogleSearch =
      Boolean(config.salesUseGoogleSearch) || looksLikeProgramRequest;

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
        messages.map((m) => m.content).join("\n")
      );
      if (transcript) payload.transcript = transcript;
      return NextResponse.json(payload);
    }

    const encoder = new TextEncoder();
    const stages = inferNeededStages(messages);
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

        emitStage("understand", "active");

        const ticker = setInterval(() => {
          stageIndex = Math.min(stageIndex + 1, stages.length - 1);
          const id = stages[stageIndex] || "program";
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

          emitStage("program", "active");
          const customer = await getRequestCustomer(req);
          const payload = await buildPayload(
            gemini.text,
            markup,
            config.salesWhatsApp,
            locale,
            customer?.id,
            messages.map((m) => m.content).join("\n")
          );
          if (transcript) payload.transcript = transcript;
          emitStage("program", "done");
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
