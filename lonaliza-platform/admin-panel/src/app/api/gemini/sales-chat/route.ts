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
  plan?: SalesChatToolPlan,
  lastUserText = ""
): Promise<SalesChatPayload> {
  const parsed: HydratedSalesChat = hydrateSalesChatResponse(text, { locale });
  const router = plan ?? planSalesChatTools(lastUserText || conversationText, conversationText);
  const lastSpoken = extractOdFromText(lastUserText);
  const convoSpoken = extractOdFromText(conversationText);
  const spokenFrom = lastSpoken.from || convoSpoken.from;
  const spokenTo = lastSpoken.to || convoSpoken.to;

  function detectDestination(text: string): string {
    const t = (text || "").toLowerCase();
    if (/باريس|paris/i.test(t)) return "باريس";
    if (/إسطنبول|اسطنبول|istanbul/i.test(t)) return "إسطنبول";
    if (/طرابزون|trabzon/i.test(t)) return "طرابزون";
    if (/أنطاليا|انطاليا|antalya/i.test(t)) return "أنطاليا";
    if (/بورصة|بورصه|bursa/i.test(t)) return "بورصة";
    if (/لندن|london/i.test(t)) return "لندن";
    if (/روما|rome/i.test(t)) return "روما";
    if (/دبي|dubai/i.test(t)) return "دبي";
    if (/الدوحة|doha/i.test(t)) return "الدوحة";
    if (/الرياض|riyadh/i.test(t)) return "الرياض";
    if (/قاهرة|القاهرة|cairo/i.test(t)) return "القاهرة";
    if (/مصر|egypt/i.test(t)) return "القاهرة";
    if (/جيزة|الجيزة|giza/i.test(t)) return "القاهرة";
    if (/كوالالمبور|kuala\s*lumpur/i.test(t)) return "كوالالمبور";
    if (/بانكوك|bangkok/i.test(t)) return "بانكوك";
    if (/جورجيا|تبليسي|georgia|tbilisi/i.test(t)) return "تبليسي";
    if (/باكو|أذربيجان|baku/i.test(t)) return "باكو";
    return "";
  }

  let dest =
    String(parsed?.destination || "").trim() ||
    parsed?.itinerary?.titleAr ||
    parsed?.itinerary?.titleEn ||
    "";
  if (!dest || dest.length < 2 || dest.length > 50) {
    dest = detectDestination(lastUserText) || detectDestination(conversationText) || dest || "إسطنبول";
  }
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
            spokenFrom ||
            parsed?.flightSearch?.fromIata ||
            parsed?.flightSearch?.from,
          toIata:
            spokenTo ||
            parsed?.flightSearch?.toIata ||
            parsed?.flightSearch?.to,
          fromCity: parsed?.flightSearch?.from,
          flightType: router.flightType,
        },
        markup,
        lastUserText || conversationText,
        router
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
    const resolvedDays =
      itinerary?.days && itinerary.days.length > 0
        ? itinerary.days
        : live?.itinerary?.days && live.itinerary.days.length > 0
          ? live.itinerary.days
          : [];
    itinerary = {
      titleAr: itinerary?.titleAr || live?.itinerary?.titleAr || `برنامج ${dest} السياحي المتكامل`,
      titleEn: itinerary?.titleEn || live?.itinerary?.titleEn || `${dest} VIP Travel Package`,
      days: resolvedDays,
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

function generateLuxuryChatProposal(
  itinerary: SalesChatItinerary,
  cards: SalesChatCard[],
  destination: string,
  locale: Locale,
  whatsapp: string
): string {
  const isAr = locale === "ar";
  const daysCount = itinerary.days?.length || 3;
  const nightsCount = Math.max(1, daysCount - 1);
  const destName = destination || itinerary.titleAr || (isAr ? "الوجهة المختارة" : "Destination");

  const summary = isAr
    ? `✨ يسعدنا في **لوناليزا للسياحة والسفر** أن نضع بين أيديكم هذا البرنامج السياحي الفاخر والاستثنائي لرحلتكم إلى **${destName}** (${daysCount} أيام / ${nightsCount} ليالٍ)، المصمم خصيصاً ليمنحكم تجربة سفر ملكية تجمع بين الراحة والخصوصية وأرقى معايير الضيافة.

**أبرز مزايا ومحددات برنامجكم:**
- 🚐 **سيارة مرسيدس فيتو VIP خاصة مع سائق خاص** طوال أيام الرحلة (10 ساعات يومياً، مرونة كاملة في مواعيد الخروج من الفندق والاستراحة، شاملة الوقود، رسوم الطرق، وخدمة الاستقبال والتوديع في المطار).
- 📍 **توزيع جغرافي متناسق ومريح (15–20 كم يومياً)** يربط المعالم الأيقونية، المقاهي التراثية، والمطاعم المحلية المرموقة دون أي إجهاد مروري أو تنقلات متباعدة.
- 🏨 **خيارات إقامة فندقية فاخرة 5 نجوم** مع إفطار يومي وخدمة كونسيرج ومساعد شخصي 24/7.

🗺️ **تفاصيل البرنامج التفاعلي:**
لقد قمنا بتجهيز كامل مسار الأيام، الفنادق المعتمدة، رحلات الطيران، والخريطة الحية مباشرة في **لوحة التخطيط والكانفاس المجاورة**. يمكنكم الاطلاع على تفاصيل كل يوم والتنقل بحرية بين الأيام والمحطات.

لأي استفسار أو تخصيص مباشر: [تواصل مع كبار مستشاري السفر عبر واتساب](https://wa.me/${whatsapp})`
    : `✨ We are delighted to present your bespoke luxury travel itinerary for **${destName}** (${daysCount} Days / ${nightsCount} Nights) by **Lonaliza VIP Travel**, crafted to deliver an exceptional private journey.

**Key Highlights of Your Tour:**
- 🚐 **Dedicated VIP Mercedes-Benz Vito with Private Chauffeur** throughout the tour (10 hours daily, flexible morning departures, fuel and highway tolls included, plus private airport meet & greet).
- 📍 **Seamless Geographic Clustering (15–20 km daily)** grouping iconic landmarks, historic cafes, and authentic culinary dining to minimize travel fatigue.
- 🏨 **Handpicked 5-Star Accommodations** with daily breakfast and 24/7 VIP concierge support.

🗺️ **Interactive Travel Plan:**
Your full day-by-day timeline, verified hotels, live flight deals, and interactive route map are now live in the **adjacent Planning Canvas**.

For custom adjustments or immediate assistance: [Chat with our Senior Concierge on WhatsApp](https://wa.me/${whatsapp})`;

  return summary;
}

  let replyOut = parsed.reply || "تم.";
  if (router.intent === "INTENT_PACKAGE_PLANNER" && itinerary && itinerary.days && itinerary.days.length > 0) {
    if (!replyOut.includes("|---|") || replyOut.length < 200) {
      replyOut = generateLuxuryChatProposal(itinerary, cards, dest, locale, whatsapp);
    }
  }
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

VOICE (never a closed template):
Open with a sentence that names the customer's exact request (city, dates, travelers, service) from the last user message.
Never start two replies with the same greeting. Do not say "مرحباً بك في مستشار لوناليزا" every turn.
INTENT_FLIGHT_SEARCH: talk only about flights (airports, times, stops, baggage). Never mention hotels or cars.
INTENT_HOTEL_SEARCH: talk only about the stay (area, nights, room). Never invent a flight.
INTENT_CAR_SEARCH: talk only about the rental (pickup, days, class).
INTENT_TRANSFER_SEARCH: talk only about airport pickup/drop.
INTENT_PACKAGE_PLANNER: brief trip framing, then let itinerary + live cards carry the detail.
GEOGRAPHIC INTEGRITY & DESTINATION ACCURACY (STRICT DOMAIN EXPERTISE):
- Always match the authentic country, genuine local landmarks, correct airports, authentic luxury hotels, and local culture:
  * Morocco (Marrakech, Casablanca, Fes, Tangier, Chefchaouen): Destination is strictly Morocco (المغرب). Airport is Marrakech Menara (RAK) or Casablanca Mohammed V (CMN). Authentic landmarks: Jemaa el-Fnaa, Majorelle Garden, Bahia Palace, Koutoubia Mosque, Palmeraie, Yves Saint Laurent Museum, Ourika Valley, Agafay Desert. Authentic luxury hotels: La Mamounia, Royal Mansour Marrakech, The Oberoi, Four Seasons Resort Marrakech, Mandarin Oriental Marrakech. NEVER suggest Turkish or Egyptian attractions or hotels for Moroccan trips!
  * Turkey (Istanbul, Trabzon, Antalya, Cappadocia, Bursa, Sapanca, Bodrum): Destination is strictly Turkey (تركيا). Use authentic Turkish landmarks, Turkish 5-star hotels, and Turkish airports (IST, SAW, TZX, AYT, NAV, BJV).
  * Egypt (Cairo, Sharm El Sheikh, Hurghada, Luxor, Aswan): Destination is strictly Egypt (مصر). Airport is CAI, SSH, HRG, LXR. Use authentic Egyptian landmarks (Giza Pyramids, Grand Egyptian Museum, Khan el-Khalili, Valley of the Kings) and authentic Egyptian luxury hotels (Four Seasons Nile Plaza, Marriott Mena House, Sofitel Legend Old Cataract).
  * UAE (Dubai, Abu Dhabi): Destination is strictly UAE (الإمارات).
- NEVER cross-contaminate destinations (e.g. NEVER place Blue Mosque or Cairo hotels in Marrakech, NEVER place Marrakech in Egypt).

ITINERARY & PROGRAM GENERATION:
${plan.intent === "INTENT_PACKAGE_PLANNER" ? `When the customer asks for a travel program or itinerary:
1) "reply" MUST BE A WARM, ELEGANT, LUXURY CONCIERGE PROPOSAL (2-3 short, refined paragraphs):
   - DO NOT output large raw Markdown tables or repeat entire daily schedules in the text reply.
   - The interactive Canvas, day tabs, hotel cards, flight cards, budget tiers, and route map render automatically and simultaneously alongside your reply in the user interface.
   - In "reply", write a distinguished welcome:
     * Introduce the bespoke journey, destination, duration, and tailored ambiance.
     * Highlight key luxury pillars: private Mercedes-Benz Vito VIP chauffeur (10 hours daily, flexible schedule, airport meet & greet included), handpicked 5-star accommodations, and thoughtful daily geographic clustering (15-20 km daily) to eliminate travel fatigue.
     * Direct the customer to review and customize their full day-by-day plan, hotel options, and interactive map in the adjacent Planning Canvas.
     * Include WhatsApp link: [تواصل مع خدمة العملاء عبر واتساب](https://wa.me/${config.salesWhatsApp})
2) Concurrently populate the full, structured "itinerary" object with all days, stops, and coordinates so the visual Canvas, map, and timeline render completely.
3) Dates MUST be ISO YYYY-MM-DD.
4) Brand is strictly "لوناليزا للسياحة والسفر" (Lonaliza VIP Travel).`
    : `Single-service mode (${plan.intent}):
1) "reply" = a unique confirmation of THIS search. Ask only for missing dates/passengers if needed.
2) cards and itinerary stay empty — the server fills live cards from ${allowedTools}.
3) Do not fill transferSearch or carsSearch unless those tools are allowed.
4) Support link if needed: [تواصل مع خدمة العملاء عبر واتساب](https://wa.me/${config.salesWhatsApp})`}

Preferred reply language: ${locale === "ar" ? "Arabic" : locale === "tr" ? "Turkish" : "English"}.
Mandatory markup: ${markup}% — clientPrice = basePrice × (1 + ${markup}/100). Program prices always USD.
Company WhatsApp link for booking: https://wa.me/${config.salesWhatsApp}

Agency catalog (JSON):
${plan.intent === "INTENT_PACKAGE_PLANNER" ? JSON.stringify(catalog) : "[]"}

OUTPUT FORMAT (mandatory):
Return ONE JSON object only. You may wrap it in a single \`\`\`json fence.
"reply" = For packages (INTENT_PACKAGE_PLANNER): the complete luxury Markdown travel proposal formatted beautifully. For single-services: short motivating confirmation.
If you are still gathering dates, ask questions and use "cards": [] and "itinerary": null.
The server rebuilds booking URLs — never invent off-site booking links.
\`\`\`json
{
  "reply": "Rich luxury Markdown proposal for packages, or concise line for single services",
  "cards": [],
  "itinerary": ${plan.intent === "INTENT_PACKAGE_PLANNER" ? `{
    "titleAr": "عنوان البرنامج الفاخر",
    "titleEn": "Luxury Tour Title",
    "days": [
      { "day": 1, "titleAr": "عنوان اليوم الأول", "titleEn": "Day 1 Title", "detailAr": "سرد متكامل لليوم", "detailEn": "Day summary", "items": [{ "time": "10:00", "kind": "attraction", "labelAr": "المعلم الأول", "labelEn": "Landmark 1" }, { "time": "14:00", "kind": "attraction", "labelAr": "المعلم الثاني", "labelEn": "Landmark 2" }, { "time": "19:00", "kind": "restaurant", "labelAr": "مطعم راقٍ", "labelEn": "Restaurant" }] }
    ],
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
CRITICAL FOR ITINERARIES:
- In "itinerary.days", you MUST generate and include ALL days matching the customer's duration (e.g. if the customer requested 7 days, "days" MUST contain all 7 day objects from Day 1 to Day 7). NEVER truncate the days array to only 1 day!

LIVE SITE SEARCH:
The server calls only ${allowedTools} against live flights/hotels/transfers/cars engines. Do NOT invent $10,000 fantasy prices or a Toyota Corolla. If a service has no live number, leave clientPrice 0.
${plan.intent === "INTENT_PACKAGE_PLANNER" ? `totalClientPrice must be the sum of the selected live cards.` : "Do not build a bundle total."}

- Prefer site links (/flights, /hotels, /transfers, /cars) for allowed tools only.
- Do NOT invent live bookable flight ticket prices. Use flightSearch so the server calls search_flights.
- Never reveal agency cost or markup percentage.
- Speak as Lonaliza sales: we issue airline tickets and book hotels on this platform.
- Never say we do not issue the ticket, never say "search the market yourself", never say we do not cut the ticket.
- Short motivating line only: live lowest fare, customer comfort, book now and we will issue the ticket.
- No technical apologies and no "AI" phrasing.
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
  const modelsToTry = [
    params.model,
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ].filter((m, i, arr) => Boolean(m) && arr.indexOf(m) === i);

  let lastError = "";
  let lastStatus = 500;

  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.apiKey}`;
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

    try {
      let res = await post(params.useGoogleSearch);
      let data = await res.json();

      if (!res.ok && params.useGoogleSearch) {
        res = await post(false);
        data = await res.json();
      }

      if (res.ok) {
        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text || "")
            .join("") || "";
        if (text) {
          return { ok: true, text };
        }
      }

      lastStatus = res.status || 500;
      lastError = data?.error?.message || `Gemini error (${res.status})`;

      // If invalid API key, retrying other models won't help
      if (res.status === 401 || res.status === 403 || /API_KEY_INVALID/i.test(lastError)) {
        break;
      }
      // On 503 (high demand), 429 (quota), 404 (model unavailable), continue loop to next model
      console.warn(`[callGemini] Model ${model} returned ${lastStatus}: ${lastError}. Trying next failover model...`);
    } catch (e: any) {
      lastError = e?.message || "Network error";
    }
  }

  return {
    ok: false,
    error: lastError || "Service temporarily busy",
    status: lastStatus,
  };
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
  const limited = await rateLimit(`sales-chat:${clientIp(req)}`, 30, 60 * 60 * 1000);
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

    const fallbackConciergeText =
      locale === "ar"
        ? "أهلاً ومرحباً بك في لوناليزا للرحلات الفاخرة. يسعدنا جداً تنسيق برنامج رحلتك الخاص بأعلى معايير الرفاهية والراحة.\n\nيقوم محرك الذكاء الاصطناعي ومستشارو السفر لدينا حالياً بترتيب أفضل عروض الطيران، وفنادق 5 نجوم، والسيارة الخاصة مع سائق VIP لرحلتك.\n\nيمكنك الضغط على زر واتساب أدناه للتواصل المباشر مع فريق كونسيرج لوناليزا للمساعدة الفورية وتأكيد حجزك، أو إعادة المحاولة بعد لحظات."
        : "Welcome to Lonaliza Luxury Tours. We are delighted to curate your bespoke VIP travel experience.\n\nOur AI engine and travel designers are currently finalizing the finest flight options, 5-star hotels, and private Mercedes Vito chauffeur services for your journey.\n\nPlease contact our VIP Concierge directly on WhatsApp for instant assistance, or try again in a moment.";

    if (!wantsStream) {
      const gemini = await runWithQuota();
      const replyText = gemini.ok ? gemini.text : fallbackConciergeText;
      const customer = await getRequestCustomer(req);
      const payload = await buildPayload(
        replyText,
        markup,
        config.salesWhatsApp,
        locale,
        customer?.id,
        conversationText,
        plan,
        lastUserText
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

        send("plan", {
          intent: plan.intent,
          tools: plan.tools,
          stages,
        });
        emitStage(stages[0] || "understand", "active");

        const ticker = setInterval(() => {
          stageIndex = Math.min(stageIndex + 1, stages.length - 1);
          const id = stages[stageIndex] || lastStage;
          emitStage(id, "active");
        }, 1600);

        try {
          const gemini = await runWithQuota();
          clearInterval(ticker);
          const replyText = gemini.ok ? gemini.text : fallbackConciergeText;

          emitStage(lastStage, "active");
          const customer = await getRequestCustomer(req);
          const payload = await buildPayload(
            replyText,
            markup,
            config.salesWhatsApp,
            locale,
            customer?.id,
            conversationText,
            plan,
            lastUserText
          );
          if (transcript) payload.transcript = transcript;
          emitStage(lastStage, "done");
          send("result", payload);
        } catch (e) {
          clearInterval(ticker);
          emitStage(lastStage, "done");
          send("result", {
            reply: fallbackConciergeText,
            whatsappUrl: `https://wa.me/${config.salesWhatsApp.replace(/[^0-9]/g, "")}`,
            cards: [],
            chips: [],
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
