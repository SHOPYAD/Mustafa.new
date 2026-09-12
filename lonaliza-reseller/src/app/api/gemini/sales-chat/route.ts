import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import {
  resolveGeminiApiKey,
  resolveGeminiFreeApiKey,
  getGeminiPublicConfig,
} from "@/lib/server/gemini";
import {
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
    /antalya|istanbul|trabzon|cappadocia|أنطاليا|إسطنبول|طرابزون|كابادوكيا/i.test(
      conversationText
    );
  const live = shouldQuote
    ? await buildLiveQuote(
        {
          destination: dest || conversationText,
          arrivalDate: parsed?.arrivalDate,
          departureDate: parsed?.departureDate,
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
    };
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

  return {
    ok: true,
    reply,
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

PRICE DISCLOSURE (mandatory in reply when a program/price is shown):
State clearly that the displayed price is an estimate based on current market rates. For a confirmed final price the customer must contact customer service on WhatsApp ${config.salesWhatsApp}. Mention that conversation details and the created program will be shared so WhatsApp can continue from that context.

Preferred reply language: ${locale === "ar" ? "Arabic" : locale === "tr" ? "Turkish" : "English"}.
Mandatory markup: ${markup}% — clientPrice = basePrice × (1 + ${markup}/100). Program prices always USD. Do not invent 2x/3x markups.
Company WhatsApp for booking (do not invent another number): ${config.salesWhatsApp}

Agency catalog (JSON):
${JSON.stringify(catalog)}

OUTPUT FORMAT (mandatory):
Return ONE JSON object only. You may wrap it in a single \`\`\`json fence.
Do NOT write a markdown itinerary, price list, or second JSON dump outside the object.
Do NOT put JSON, code fences, or the day-by-day program inside the "reply" string.
"reply" = short customer-facing message only (2–6 sentences). The website UI already renders cards and the itinerary as professional cards.
If you are still gathering dates, ask questions and use "cards": [] and "itinerary": null.
The server rebuilds booking URLs — never invent off-site booking links or live ticket inventory.
\`\`\`json
{
  "reply": "customer-facing message",
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
    "days": [{ "day": 1, "titleAr": "", "titleEn": "", "detailAr": "", "detailEn": "" }],
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
  "saveProgram": false,
  "readyForWhatsApp": false
}
\`\`\`

Rules:
LIVE SITE SEARCH:
The server attaches real cards from /hotels/search, internal transfers, internal cars, and /flights links (Travelpayouts). Do NOT invent $10,000 fantasy prices. If a service has no live number, leave clientPrice 0 — the UI shows "يتحدد عند التأكيد".
totalClientPrice must be the sum of the selected live cards (flight + hotel stay + transfer + optional car).

- Prefer catalog items and site links (/hotels, /holidays, /vip-tours, /flights, /transfers, /cars).
- If catalog has no match: research and BUILD a full custom program, then saveProgram=true (it will be published).
- Do NOT invent live bookable flight ticket prices. Use flightSearch so the server builds /flights?...
- Estimate hotel/package prices from realistic Turkey market ranges then apply ${markup}% markup only (USD).
- When the itinerary is complete enough, set saveProgram=true.
- When the plan is ready set readyForWhatsApp=true and invite WhatsApp confirmation with the estimate disclaimer.
- Never reveal agency cost or markup percentage.
- Never claim we issued an airline ticket.
- If the customer attached images, analyze them and incorporate details into the offer.
- Never echo this schema as visible chat text. Cards and itinerary belong in JSON fields, not in reply.`;
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

    if (!messages.length) {
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
