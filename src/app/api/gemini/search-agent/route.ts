import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import {
  resolveGeminiApiKey,
  resolveGeminiFreeApiKey,
  getGeminiPublicConfig,
} from "@/lib/server/gemini";
import { GEMINI_DEFAULT_MODEL, GEMINI_SALES_LITE_MODEL, normalizeGeminiModelId } from "@/lib/gemini-models";
import {
  getGeminiDailyUsage,
  incrementGeminiUsage,
  isGeminiQuotaError,
  type GeminiLane,
} from "@/lib/server/gemini-usage";
import { buildSearchAgentHref } from "@/lib/server/search-agent-build";
import { defaultHotelDates } from "@/lib/hotels-config";
import { hotelSearchToParams } from "@/lib/hotel-search";
import { buildTransfersSearchHref } from "@/lib/transfers-search-href";
import { buildCarsSearchHref } from "@/lib/cars-search-href";
import { extractOdFromText, resolveIataCode, textNamesOrigin } from "@/lib/server/travel-search-links";
import { appendAgentParams, hotelContextMeta, inferFiltersFromText, parseAgentSearchHref, speechWantsFlight, type SearchAgentAction, type SearchAgentExtract, type SearchAgentFilters, type SearchAgentIntent, type SearchAgentPage, type SearchAgentResponse } from "@/lib/search-agent";
import { hotelCityQuery, stayCheckout } from "@/lib/hotel-city-query";
import type { SearchTabKey } from "@/data/search-tabs";
import type { Locale } from "@/lib/i18n/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

function normalizeAudioMime(raw: string): string {
  const base = String(raw || "").split(";")[0].trim().toLowerCase();
  if (base === "video/webm") return "audio/webm";
  if (base === "video/mp4") return "audio/mp4";
  return base;
}

function parseLocale(raw: unknown): Locale {
  if (raw === "en") return "en";
  if (raw === "tr") return "tr";
  if (raw === "fr") return "fr";
  return "ar";
}

function parseTab(raw: unknown): SearchTabKey {
  const value = String(raw || "flight");
  const allowed: SearchTabKey[] = [
    "flight",
    "hotel",
    "cars",
    "transfers",
    "tours",
    "holiday",
    "visa",
    "insurance",
    "offers",
  ];
  return allowed.includes(value as SearchTabKey) ? (value as SearchTabKey) : "flight";
}

function parseJsonObject(text: string): Record<string, unknown> {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() || trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return {};
  try {
    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function asIntent(value: unknown): SearchAgentIntent {
  const v = String(value || "").toLowerCase();
  const allowed: SearchAgentIntent[] = [
    "flight",
    "hotel",
    "cars",
    "transfers",
    "tours",
    "holiday",
    "visa",
    "insurance",
    "offers",
    "booking",
    "unknown",
  ];
  return allowed.includes(v as SearchAgentIntent) ? (v as SearchAgentIntent) : "unknown";
}

function asAction(value: unknown, fallback: SearchAgentAction): SearchAgentAction {
  const v = String(value || "").toLowerCase();
  const allowed: SearchAgentAction[] = [
    "ask",
    "navigate",
    "filter",
    "book",
    "upsell_hotels",
    "upsell_transfers",
    "upsell_cars",
    "upsell_tours",
    "upsell_visa",
    "upsell_insurance",
    "scan_passport",
    "coach_payment",
    "coach_extras",
    "reply",
  ];
  return allowed.includes(v as SearchAgentAction) ? (v as SearchAgentAction) : fallback;
}

function looksInventedTranscript(text: string): boolean {
  const t = String(text || "");
  if (/15\s*ديسمبر|١٥\s*ديسمبر/.test(t) && /شخصين|حقيبتين|23/.test(t)) return true;
  if (/أهلاً[،,]?\s*أريد حجز رحلة إلى/.test(t) && /لشخصين|حقيبتين/.test(t)) return true;
  return false;
}

function cleanReply(text: string, locale: Locale, action: SearchAgentAction): string {
  const stripped = String(text || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (stripped && stripped.length > 8) return stripped;
  if (locale === "ar") {
    if (action === "navigate") return "فتحت لك محرك البحث الحي الآن بنفس الشروط التي ذكرتها.";
    if (action === "filter") return "طبّقت الفلتر على النتائج الظاهرة أمامك الآن.";
    if (action === "book") return "أخذتك لحجز الرحلة التي طلبتها من النتائج الحية.";
    return "أنا معك على النتائج. قل لي أي خط أو وزن أو سعر تريد وأطبّقه فوراً.";
  }
  if (action === "navigate") return "Opening the live search engine with your trip details now.";
  if (action === "filter") return "I applied that filter to the results in front of you.";
  if (action === "book") return "Taking you to booking for the flight you asked for.";
  return "I am on the live results. Tell me airline, bag, or price and I will apply it.";
}

function flightExtractFromPlainText(lastUser: string): SearchAgentExtract | null {
  const od = extractOdFromText(lastUser);
  if (!od.from || !od.to) return null;
  if (!speechWantsFlight(lastUser) && !/من\s+.+\s+(?:الى|إلى)|\bfrom\s+.+\s+to\b/i.test(lastUser)) {
    return null;
  }
  const extract: SearchAgentExtract = {
    intent: "flight",
    from: od.from,
    to: od.to,
    flightType: /عودة|ذهاب وعودة|round[-\s]?trip/i.test(lastUser) ? "round-trip" : "one-way",
  };
  if (/شخص واحد|راكب واحد|one (person|passenger)|1 adult/i.test(lastUser)) extract.adults = 1;
  if (/بعد أسبوع|الأسبوع القادم|next week/i.test(lastUser)) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    extract.date = d.toISOString().slice(0, 10);
  }
  const filters = inferFiltersFromText(lastUser);
  if (Object.keys(filters).length) extract.filters = filters;
  if (extract.flightType === "one-way") extract.returnDate = "";
  return extract;
}

function extractFromModel(raw: Record<string, unknown>): SearchAgentExtract {
  const filtersRaw = raw.filters && typeof raw.filters === "object" ? (raw.filters as Record<string, unknown>) : {};
  const filters: SearchAgentFilters = {};
  if (Array.isArray(filtersRaw.airlines)) {
    filters.airlines = filtersRaw.airlines.map((x) => String(x)).filter(Boolean).slice(0, 8);
  }
  if (filtersRaw.baggageKg === 20 || filtersRaw.baggageKg === 23 || filtersRaw.baggageKg === "included") {
    filters.baggageKg = filtersRaw.baggageKg;
  }
  if (typeof filtersRaw.directOnly === "boolean") filters.directOnly = filtersRaw.directOnly;
  if (typeof filtersRaw.maxPrice === "number") filters.maxPrice = filtersRaw.maxPrice;
  if (typeof filtersRaw.hotelName === "string") filters.hotelName = filtersRaw.hotelName;
  if (typeof filtersRaw.stars === "number") filters.stars = filtersRaw.stars;
  if (filtersRaw.sort === "price" || filtersRaw.sort === "best" || filtersRaw.sort === "fastest") {
    filters.sort = filtersRaw.sort;
  }
  if (typeof filtersRaw.refundable === "boolean") filters.refundable = filtersRaw.refundable;
  if (typeof filtersRaw.clearFilters === "boolean") filters.clearFilters = filtersRaw.clearFilters;
  const cabin = String(raw.cabinClass || filtersRaw.cabinClass || "");
  const cabinClass =
    cabin === "premium" || cabin === "business" || cabin === "first" || cabin === "economy"
      ? cabin
      : undefined;
  if (cabinClass) filters.cabinClass = cabinClass;

  return {
    intent: asIntent(raw.intent),
    from: raw.from ? String(raw.from) : undefined,
    to: raw.to ? String(raw.to) : undefined,
    date: raw.date ? String(raw.date) : undefined,
    returnDate: raw.returnDate ? String(raw.returnDate) : undefined,
    adults: Number(raw.adults) || undefined,
    children: Number(raw.children) || undefined,
    infants: Number(raw.infants) || undefined,
    rooms: Number(raw.rooms) || undefined,
    cabinClass,
    flightType: raw.flightType === "one-way" ? "one-way" : raw.flightType === "round-trip" ? "round-trip" : undefined,
    time: raw.time ? String(raw.time) : undefined,
    destination: raw.destination ? String(raw.destination) : undefined,
    pickup: raw.pickup ? String(raw.pickup) : undefined,
    dropoff: raw.dropoff ? String(raw.dropoff) : undefined,
    filters: Object.keys(filters).length ? filters : undefined,
    missing: Array.isArray(raw.missing) ? raw.missing.map((x) => String(x)) : undefined,
  };
}

function upsellHref(
  action: SearchAgentAction,
  extract: SearchAgentExtract,
  locale: Locale,
  sid: string
): string | undefined {
  const dates = defaultHotelDates(3);
  const checkIn = extract.date || dates.checkIn;
  const checkOut = stayCheckout(checkIn, extract.returnDate || dates.checkOut, 3);
  const guests = extract.adults || 2;
  const city = hotelCityQuery(extract.destination || extract.to || "");
  if (action === "upsell_hotels" && city) {
    return appendAgentParams(
      `/hotels?${hotelSearchToParams({
        q: city,
        geoId: "",
        destId: "",
        checkIn,
        checkOut,
        adults: guests,
        children: extract.children || 0,
        rooms: extract.rooms || 1,
        childrenAges: [],
      })}`,
      sid
    );
  }
  if (action === "upsell_transfers" && (extract.from || extract.to || city)) {
    return appendAgentParams(
      buildTransfersSearchHref({
        from: extract.from || `${city} airport`,
        to: extract.to || extract.destination || city,
        date: checkIn,
        guests,
      }),
      sid
    );
  }
  if (action === "upsell_cars") {
    const iata = resolveIataCode(extract.pickup || city || extract.to);
    if (!iata && !city) return "/cars";
    return appendAgentParams(
      iata
        ? buildCarsSearchHref({ iata, locale, guests, date: checkIn, returnDate: checkOut })
        : `/cars?pickup=${encodeURIComponent(city)}&date=${checkIn}&returnDate=${checkOut}&guests=${guests}`,
      sid
    );
  }
  if (action === "upsell_tours") {
    const params = new URLSearchParams();
    if (city) params.set("q", city);
    if (checkIn) params.set("date", checkIn);
    params.set("guests", String(guests));
    return appendAgentParams(`/vip-tours?${params}`, sid);
  }
  if (action === "upsell_visa") {
    return appendAgentParams(city ? `/visa?q=${encodeURIComponent(city)}` : "/visa", sid);
  }
  if (action === "upsell_insurance") {
    return appendAgentParams("/search?type=insurance", sid);
  }
  return undefined;
}

function buildSystem(locale: Locale, tab: SearchTabKey, page: SearchAgentPage, context: string): string {
  const lang = locale === "ar" ? "Arabic matching the customer dialect" : locale === "tr" ? "Turkish" : "English";
  const bookingRules =
    page === "booking"
      ? `
You are ON the flight booking page. The customer is already holding a live itinerary.
Stay on this page. Do NOT set action=navigate to start a new flight search unless they explicitly ask to change origin/destination/dates.
Use in-page tools:
- hotel / فندق / سكن → upsell_hotels (fill destination + dates + stars/hotelName)
- transfer / استقبال / توصيل → upsell_transfers
- car / سيارة مع سائق / تأجير → upsell_cars
- tour / برنامج / جولة → upsell_tours
- visa / تأشيرة → upsell_visa
- insurance / تأمين → upsell_insurance
- passport / جواز → scan_passport
- pay / ادفع / بطاقة / فيزا كارد → coach_payment (NEVER ask for card numbers, CVV, or OTP)
- baggage / مقعد / extras / وزن → coach_extras
- cheaper flight / رحلة بديلة → filter with airlines or book
The booking UI will call live hotel/transfer/car/tour providers and attach offers to the invoice.`
      : `
The active tab is only a hint. If the customer asks for a flight (رحلة / طيران / مباشر / وزن / حقيبة) while they are on hotels or cars, intent MUST be flight and action=navigate to the flight engine.
If origin + destination are known (even without a perfect date), action MUST be navigate — never only promise to search.
If they are on the SAME engine results and ask to filter (airline, baggage, direct, refundable, cheapest), action=filter.
If they want to widen / شيل الفلتر / خيارات أكثر, action=filter and filters.clearFilters=true.
If they say احجز / book + an airline (ناس / flynas / التركية…), action=book and put that airline in filters.airlines.
Never invent cities, dates, passenger counts, or baggage weights that the customer did not say.
Never say you opened results unless action=navigate and from+to are filled.`;

  return `You are Lonaliza's live sales consultant sitting ON the real website engines.
Today is ${new Date().toISOString().slice(0, 10)}.
Active search tab hint: ${tab}.
Current page: ${page}.
${context ? `Live inventory and trip context (USE THIS — do not invent flights/hotels not listed):\n${context}` : ""}

Speak ${lang} in a warm Gulf/Levant sales dialect. No emojis.
Replies must be 3 to 6 sentences: advise, compare, then say what you just executed.
When live inventory is provided, quote real airline names, prices, stops, and baggage from that list.
Compare at least two real options when advising. Mention price, stops, bag, and refundable from the list.
If the customer asks "which airline is best", pick from the listed carriers only and explain why (bag, direct, price, meals if known).
Do NOT invent meal service unless the inventory marks meal=yes or the carrier is a known full-service airline in the list (Saudia, Turkish, Emirates, Qatar, Egyptair).
Never book a different airline than the one the customer named.
${bookingRules}
If a required field is missing, action=ask and ask ONE question only.
Relative dates must become ISO yyyy-mm-dd.
Intent must be one of: flight, hotel, cars, transfers, tours, holiday, visa, insurance, offers, booking, unknown.

Return ONLY JSON:
{
  "reply": "consultative 3-6 sentence reply",
  "action": "ask|navigate|filter|book|upsell_hotels|upsell_transfers|upsell_cars|upsell_tours|upsell_visa|upsell_insurance|scan_passport|coach_payment|coach_extras|reply",
  "intent": "flight",
  "from": "Jeddah or JED",
  "to": "Istanbul or IST",
  "destination": "Jeddah",
  "date": "2026-10-12",
  "returnDate": "2026-10-19",
  "adults": 2,
  "children": 0,
  "rooms": 1,
  "cabinClass": "economy",
  "flightType": "round-trip",
  "time": "14:00",
  "pickup": "",
  "dropoff": "",
  "filters": { "airlines": ["flynas"], "baggageKg": 23, "directOnly": true, "refundable": true, "clearFilters": false, "sort": "price", "hotelName": "", "stars": 5 },
  "missing": []
}`;
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(`search-agent:${clientIp(req)}`, 40, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const locale = parseLocale(body.locale);
    const tab = parseTab(body.tab);
    const page = (body.page === "results" || body.page === "booking" ? body.page : "hero") as SearchAgentPage;
    const sid = String(body.sid || "").slice(0, 80);
    const context = typeof body.context === "string" ? body.context.slice(0, 8000) : "";
    const lastHref = typeof body.lastHref === "string" ? body.lastHref.slice(0, 800) : "";
    const lastFlightHref = typeof body.lastFlightHref === "string" ? body.lastFlightHref.slice(0, 800) : "";
    const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 800) : "";
    const audioMime = normalizeAudioMime(String(body.audioMime || "").toLowerCase());
    let audioBase64 = String(body.audioBase64 || "").replace(/\s/g, "");
    const comma = audioBase64.indexOf(",");
    if (audioBase64.startsWith("data:") && comma !== -1) audioBase64 = audioBase64.slice(comma + 1);
    if (audioBase64.length > 8_000_000) audioBase64 = "";

    if (!messages.length && !audioBase64) {
      return NextResponse.json({ ok: false, error: "messages required" }, { status: 400 });
    }

    const config = await getGeminiPublicConfig();
    const [paid, free] = await Promise.all([resolveGeminiApiKey(), resolveGeminiFreeApiKey()]);
    const usage = await getGeminiDailyUsage();
    let lane: GeminiLane | null = null;
    let apiKey: string | null = null;
    if (free.apiKey && usage.freeCount < config.dailyFreeChatLimit) {
      lane = "free";
      apiKey = free.apiKey;
    } else if (config.salesPaidKeyEnabled && paid.apiKey && usage.paidCount < config.dailyPaidChatLimit) {
      lane = "paid";
      apiKey = paid.apiKey;
    } else if (paid.apiKey) {
      lane = "paid";
      apiKey = paid.apiKey;
    }
    if (!apiKey || !lane) {
      return NextResponse.json(
        { ok: false, error: "المساعد غير جاهز الآن. أضف مفتاح Gemini من إعدادات الذكاء الاصطناعي." },
        { status: 400 }
      );
    }

    const hasAudio = Boolean(audioBase64);
    const textModel = config.salesPreferLiteModel
      ? GEMINI_SALES_LITE_MODEL
      : normalizeGeminiModelId(config.model);
    const understandModels = [
      normalizeGeminiModelId(config.model),
      GEMINI_DEFAULT_MODEL,
      "gemini-3.7-flash",
      "gemini-3.5-flash",
    ].filter((id, idx, arr) => id && arr.indexOf(id) === idx);
    const transcribeModels = ["gemini-3.5-transcribe", ...understandModels];
    let model = hasAudio ? understandModels[0] : textModel;
    const enrichedContext = [
      context,
      pageUrl ? `Current URL: ${pageUrl}` : "",
      lastFlightHref ? `Last flight search URL: ${lastFlightHref}` : "",
      lastHref && lastHref !== lastFlightHref ? `Last search URL: ${lastHref}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const system = buildSystem(locale, tab, page, enrichedContext);
    const last = messages[messages.length - 1];
    const audioMimeForModel =
      audioMime === "audio/wav" || audioMime === "audio/x-wav"
        ? "audio/wav"
        : audioMime === "audio/mpeg" || audioMime === "audio/mp3"
          ? "audio/mp3"
          : audioMime === "audio/ogg" || audioMime === "audio/opus"
            ? "audio/ogg"
            : audioMime === "audio/mp4" || audioMime === "audio/aac" || audioMime === "audio/x-m4a"
              ? "audio/mp4"
              : audioMime === "audio/webm"
                ? "audio/webm"
                : audioMime === "audio/flac"
                  ? "audio/flac"
                  : audioMime || "audio/webm";

    const callGemini = async (
      key: string,
      modelId: string,
      contents: Array<{ role: string; parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> }>,
      json = false,
      extra?: {
        includeSystem?: boolean;
        systemText?: string;
        temperature?: number;
        timeoutMs?: number;
        maxOutputTokens?: number;
        thinkingBudget?: number;
      }
    ) => {
      const includeSystem = extra?.includeSystem ?? json;
      const temperature = extra?.temperature ?? (json ? 0.5 : 0.1);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`;
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), extra?.timeoutMs || (json ? 18000 : 12000));
      const systemText = extra?.systemText ?? system;
      const generationConfig: Record<string, unknown> = {
        temperature,
        maxOutputTokens: extra?.maxOutputTokens ?? (json ? 1600 : 800),
      };
      if (json) generationConfig.responseMimeType = "application/json";
      if (extra?.thinkingBudget != null) {
        generationConfig.thinkingConfig = { thinkingBudget: extra.thinkingBudget };
      }
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            systemInstruction: includeSystem ? { parts: [{ text: systemText }] } : undefined,
            contents,
            generationConfig,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          return {
            ok: false as const,
            error: data?.error?.message || `Gemini error (${res.status})`,
            status: res.status || 400,
          };
        }
        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text || "")
            .join("") || "";
        return { ok: true as const, text };
      } catch (err) {
        const aborted = err instanceof Error && (err.name === "AbortError" || /aborted|timeout/i.test(err.message));
        return {
          ok: false as const,
          error: aborted ? "transcription timeout" : err instanceof Error ? err.message : "Gemini error",
          status: aborted ? 408 : 400,
        };
      } finally {
        clearTimeout(timer);
      }
    };

    const voiceUnderstandSystem =
      locale === "ar"
        ? `أنت وكيل سفر تسمع تسجيلاً كاملاً. استمع من أول ثانية لآخر ثانية. ممنوع التوقف بعد أول كلمة أو أول مدينة.
أفرغ كل الكلام حرفياً في transcript — الجملة كاملة: من أين، إلى أين، متى، كم شخص، والوزن.
إذا قال «من أنطاليا إلى إسطنبول» فالإقلاع أنطاليا والوصول إسطنبول.
إذا وُجدت المدينتان في الكلام: action=navigate و missing=[]. لا تسأل عن الإقلاع.`
        : `You are a travel agent listening to a complete voice clip. Hear every second. Never stop after the first word.
Put the FULL spoken utterance in transcript, then extract origin, destination, date, passengers, bags from that full text.
If both cities are spoken, action=navigate and missing=[].`;

    const transcribeVoice = async (key: string): Promise<{ ok: boolean; text: string; error?: string; status?: number }> => {
      const prompt =
        locale === "ar"
          ? "استمع للتسجيل من أوله لآخره. اكتب كل الكلام المسموع حرفياً: كل المدن والتاريخ وعدد الأشخاص والوزن. لا تلخّص. لا تتوقف بعد أول كلمة. أعد النص الكامل فقط بدون شرح."
          : "Listen to the entire clip. Write every spoken word: every city, date, passenger count, and bag weight. Do not summarize or stop after the first word. Return only the full transcript.";
      const contents = [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: audioMimeForModel, data: audioBase64 } },
            { text: prompt },
          ],
        },
      ];
      let lastErr = "voice unsupported";
      let lastStatus = 400;
      for (const modelId of transcribeModels) {
        let result = await callGemini(key, modelId, contents, false, {
          includeSystem: false,
          temperature: 0,
          timeoutMs: 35000,
          maxOutputTokens: 2048,
          thinkingBudget: 0,
        });
        if (!result.ok && /thinking|thinkingConfig|unknown name/i.test(result.error)) {
          result = await callGemini(key, modelId, contents, false, {
            includeSystem: false,
            temperature: 0,
            timeoutMs: 35000,
            maxOutputTokens: 2048,
          });
        }
        if (result.ok && result.text.trim()) {
          model = modelId;
          const spoken = result.text.replace(/```[\s\S]*?```/g, "").replace(/^["']|["']$/g, "").trim();
          if (spoken) return { ok: true, text: spoken };
        }
        lastErr = result.ok ? "empty transcript" : result.error;
        lastStatus = result.ok ? 400 : result.status;
        if (result.status === 404 || /not found|NOT_FOUND|no longer available/i.test(lastErr)) continue;
        if (!/does not support|UNSUPPORTED|invalid argument|inline.?data|mime|thinking/i.test(lastErr) && !result.ok && result.status !== 408) {
          break;
        }
      }
      return { ok: false, text: "", error: lastErr, status: lastStatus };
    };

    const understandVoiceOnce = async (
      key: string
    ): Promise<{ ok: boolean; transcript: string; parsed?: Record<string, unknown>; error?: string; status?: number }> => {
      const prompt =
        locale === "ar"
          ? "هذا التسجيل كاملاً. اسمع كل ثانية ثم أعد JSON فقط بالحقول المطلوبة، وضع الكلام كاملاً في transcript."
          : "This is the full recording. Listen to every second, then return JSON only. Put the complete spoken words in transcript.";
      const contents = [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: audioMimeForModel, data: audioBase64 } },
            { text: prompt },
          ],
        },
      ];
      let lastErr = "voice unsupported";
      let lastStatus = 400;
      for (const modelId of understandModels) {
        let result = await callGemini(key, modelId, contents, true, {
          includeSystem: true,
          systemText: `${voiceUnderstandSystem}\n${system}`,
          temperature: 0.2,
          timeoutMs: 45000,
          maxOutputTokens: 4096,
          thinkingBudget: 256,
        });
        if (!result.ok && /thinking|thinkingConfig|unknown name/i.test(result.error)) {
          result = await callGemini(key, modelId, contents, true, {
            includeSystem: true,
            systemText: `${voiceUnderstandSystem}\n${system}`,
            temperature: 0.2,
            timeoutMs: 45000,
            maxOutputTokens: 4096,
          });
        }
        if (result.ok && result.text.trim()) {
          model = modelId;
          const parsed = parseJsonObject(result.text);
          const spoken = String(parsed.transcript || parsed.text || "").trim();
          if (spoken) return { ok: true, transcript: spoken, parsed };
          if (parsed.from && parsed.to) {
            return {
              ok: true,
              transcript: `${parsed.from} ${parsed.to}`,
              parsed,
            };
          }
        }
        lastErr = result.ok ? "empty transcript" : result.error;
        lastStatus = result.ok ? 400 : result.status;
        if (result.status === 404 || /not found|NOT_FOUND|no longer available/i.test(lastErr)) continue;
      }
      return { ok: false, transcript: "", error: lastErr, status: lastStatus };
    };

    let transcript = "";
    let voiceParsed: Record<string, unknown> | undefined;
    if (hasAudio) {
      const once = await understandVoiceOnce(apiKey);
      if (once.ok && once.transcript) {
        transcript = once.transcript;
        voiceParsed = once.parsed;
        await incrementGeminiUsage(lane);
      } else if (!once.ok && lane === "free" && paid.apiKey && once.status !== 408) {
        const retry = await understandVoiceOnce(paid.apiKey);
        if (retry.ok && retry.transcript) {
          transcript = retry.transcript;
          voiceParsed = retry.parsed;
          await incrementGeminiUsage("paid");
        }
      }
      if (!transcript) {
        const heard = await transcribeVoice(apiKey);
        if (heard.ok && heard.text) {
          transcript = heard.text;
          if (!voiceParsed) await incrementGeminiUsage(lane);
        } else if (lane === "free" && paid.apiKey && heard.status !== 408) {
          const retry = await transcribeVoice(paid.apiKey);
          if (retry.ok) {
            transcript = retry.text;
            await incrementGeminiUsage("paid");
          }
        }
      }
      if (!transcript) {
        return NextResponse.json(
          {
            ok: false,
            error:
              locale === "ar"
                ? "تعذر سماع التسجيل كاملاً. سجّل الجملة كاملة مرة أخرى أو اكتب الطلب."
                : "Could not hear the full clip. Record the complete sentence again or type the request.",
          },
          { status: 400 }
        );
      }
      if (messages.length) {
        const lastIdx = [...messages].map((m, i) => (m.role === "user" ? i : -1)).filter((i) => i >= 0).pop();
        if (lastIdx != null) messages[lastIdx] = { role: "user", content: transcript };
      } else {
        messages.push({ role: "user", content: transcript });
      }
      if (looksInventedTranscript(transcript)) {
        return NextResponse.json({
          ok: true,
          reply:
            locale === "ar"
              ? "ما قدرت أسمع الطلب بوضوح دون تخمين مدن. اكتب سطراً واحداً: من أي مدينة، إلى أين، متى، كم شخص، والوزن."
              : "I could not hear that clearly without guessing cities. Type: from, to, date, passengers, bag.",
          action: "ask",
          intent: "flight",
          missing: ["from", "to"],
          sid: sid || "live",
          transcript,
        });
      }
    }

    const lastUserEarly = transcript || [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const fastFlight = flightExtractFromPlainText(lastUserEarly);
    if (fastFlight) {
      const builtFast = buildSearchAgentHref(fastFlight, tab, locale, sid || "live");
      if (builtFast.href) {
        const fromCode = resolveIataCode(fastFlight.from) || fastFlight.from;
        const toCode = resolveIataCode(fastFlight.to) || fastFlight.to;
        const bag = fastFlight.filters?.baggageKg;
        return NextResponse.json({
          ok: true,
          reply:
            locale === "ar"
              ? `فتحت أرخص الرحلات من ${fromCode} إلى ${toCode}${bag ? ` مع وزن ${bag} كجم` : ""}.`
              : `Opening cheapest flights from ${fromCode} to ${toCode}${bag ? ` with ${bag}kg bag` : ""}.`,
          action: "navigate",
          intent: "flight",
          href: builtFast.href,
          filters: fastFlight.filters,
          sid: sid || "live",
          transcript: transcript || undefined,
        } satisfies SearchAgentResponse);
      }
    }

    let parsed: Record<string, unknown> = voiceParsed || {};
    if (!Object.keys(parsed).length) {
      const contents = messages.slice(-12).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || last?.content || "..." }],
      }));

      let gemini = await callGemini(apiKey, hasAudio ? understandModels[0] : model, contents, true, {
        timeoutMs: 22000,
        maxOutputTokens: 4096,
      });
      if (!gemini.ok && lane === "free" && isGeminiQuotaError(gemini.status, gemini.error) && paid.apiKey) {
        gemini = await callGemini(paid.apiKey, textModel, contents, true);
        if (gemini.ok && !hasAudio) await incrementGeminiUsage("paid");
      } else if (gemini.ok && !hasAudio) {
        await incrementGeminiUsage(lane);
      }
      if (!gemini.ok) {
        return NextResponse.json({ ok: false, error: gemini.error }, { status: gemini.status });
      }
      parsed = parseJsonObject(gemini.text);
    }
    const extract = extractFromModel(parsed);
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")?.content || "";
    const hotelMeta = hotelContextMeta(context);
    const priorFlight = parseAgentSearchHref(lastFlightHref);
    const priorAny = parseAgentSearchHref(lastHref);
    const spokenOd = extractOdFromText(lastUser);
    if (speechWantsFlight(lastUser)) extract.intent = "flight";
    if (spokenOd.from) extract.from = spokenOd.from;
    if (spokenOd.to) extract.to = spokenOd.to;
    if (/شخص واحد|راكب واحد|one (person|passenger)|1 adult/i.test(lastUser)) extract.adults = 1;
    if (extract.intent === "flight") {
      const sameDest = /نفس الوجهة|نفس المدينة|نفس المكان|same dest/i.test(lastUser);
      if (!extract.to) {
        if (sameDest && hotelMeta.city) extract.to = hotelMeta.city;
        else if (/جدة|جده|jeddah/i.test(lastUser)) extract.to = "Jeddah";
        else if (hotelMeta.city && /الوجهة|إلى|الى|\bto\b/i.test(lastUser)) extract.to = hotelMeta.city;
      }
      const namedOrigin = textNamesOrigin(lastUser) || Boolean(spokenOd.from);
      if (namedOrigin && !spokenOd.from && !resolveIataCode(extract.from || "")) extract.from = undefined;
      if (!extract.from && !namedOrigin) {
        const fromCandidate =
          priorFlight.from || (priorAny.path?.includes("/flights") ? priorAny.from : undefined);
        const fromCode = resolveIataCode(fromCandidate || "") || "";
        const toCode = resolveIataCode(extract.to || "") || "";
        if (fromCandidate && (!toCode || !fromCode || fromCode !== toCode)) {
          extract.from = fromCandidate;
        }
      }
      const hotelCode = resolveIataCode(hotelMeta.city || "") || "";
      const fromCode = resolveIataCode(extract.from || "") || "";
      const toCode = resolveIataCode(extract.to || "") || "";
      const saidOrigin = /من\s+(جدة|جده|jeddah)|from\s+jeddah/i.test(lastUser);
      if (fromCode && hotelCode && fromCode === hotelCode && !saidOrigin) {
        extract.from = undefined;
      }
      if (fromCode && toCode && fromCode === toCode) {
        extract.from = undefined;
      }
      if (!extract.date && /بعد أسبوع|الأسبوع القادم|next week/i.test(lastUser)) {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        extract.date = d.toISOString().slice(0, 10);
      }
      if (!extract.date && hotelMeta.checkIn) extract.date = hotelMeta.checkIn;
      if (!/عودة|ذهاب وعودة|round[-\s]?trip/i.test(lastUser)) {
        extract.flightType = "one-way";
        extract.returnDate = "";
      }
    }
    const inferred = inferFiltersFromText(lastUser, lastAssistant);
    if (inferred.airlines || inferred.baggageKg || inferred.directOnly || inferred.refundable || inferred.clearFilters || inferred.sort) {
      extract.filters = {
        ...inferred,
        ...extract.filters,
        airlines: extract.filters?.airlines?.length ? extract.filters.airlines : inferred.airlines,
      };
    }

    const actionHint = asAction(parsed.action, "reply");
    const built = buildSearchAgentHref(extract, tab, locale, sid || "live");
    let action = actionHint;
    let href = built.href;
    const intent = built.intent || extract.intent;
    const crossEngine = intent === "flight" && tab !== "flight";

    const newFrom = resolveIataCode(extract.from) || "";
    const newTo = resolveIataCode(extract.to) || "";
    const currentPair = context.match(/\b([A-Z]{3})\s*(?:→|->)\s*([A-Z]{3})\b/);
    const istanbul = new Set(["IST", "ISTA", "SAW"]);
    const sameAirport = (a: string, b: string) => a === b || (istanbul.has(a) && istanbul.has(b));
    const odChanged = Boolean(
      newFrom &&
        newTo &&
        href &&
        (!currentPair || !sameAirport(currentPair[1], newFrom) || !sameAirport(currentPair[2], newTo))
    );

    if ((page !== "booking" || odChanged) && href && extract.from && extract.to && (action === "reply" || action === "ask" || odChanged || crossEngine)) {
      action = "navigate";
    }
    if (
      page === "results" &&
      !odChanged &&
      !crossEngine &&
      extract.filters &&
      (extract.filters.airlines?.length ||
        extract.filters.baggageKg ||
        extract.filters.directOnly ||
        extract.filters.refundable ||
        extract.filters.clearFilters ||
        extract.filters.hotelName ||
        extract.filters.stars ||
        extract.filters.maxPrice ||
        extract.filters.sort)
    ) {
      if (action === "navigate" || action === "reply") action = "filter";
    }
    if (!odChanged && !crossEngine && page === "results" && /شيل|وسّع|وسع|كل الخيارات|بدون فلتر|clear|widen|صفر نتائج/i.test(lastUser)) {
      action = "filter";
      extract.filters = { ...(extract.filters || {}), clearFilters: true, sort: extract.filters?.sort || "price" };
    }
    if (!odChanged && !crossEngine && page === "results" && /احجز|خذني للحجز|افتح الحجز|\bbook\b/i.test(lastUser)) {
      action = "book";
    }
    if (action === "navigate" && !href) action = "ask";
    if (crossEngine && !href) action = "ask";
    if ((action === "filter" || action === "book") && intent === "flight" && !href) action = "ask";
    if (action === "ask" && href && page === "hero" && !crossEngine) action = "navigate";
    if (crossEngine && href && extract.from && extract.to) action = "navigate";
    if (action.startsWith("upsell_")) {
      href = upsellHref(action, extract, locale, sid || "live") || href;
    }
    if (page === "booking" && action === "navigate" && intent === "flight" && !odChanged) {
      action = "reply";
    }

    let reply = cleanReply(String(parsed.reply || ""), locale, action);
    const destLabel = extract.to || hotelMeta.city || "";
    if (action === "ask" && intent === "flight" && (built.missing?.includes("from") || !extract.from)) {
      reply =
        locale === "ar"
          ? `سمعت طلبك لرحلة${destLabel ? ` إلى ${destLabel}` : ""} مباشرة${extract.filters?.baggageKg ? ` مع وزن ${extract.filters.baggageKg} كجم` : ""}. من أي مدينة الإقلاع لأفتح نتائج الطيران الحية الآن؟`
          : `I heard a${extract.filters?.directOnly ? " direct" : ""} flight request${destLabel ? ` to ${destLabel}` : ""}. Which city are you departing from so I can open live results?`;
    } else if (action !== "navigate" && action !== "book" && !action.startsWith("upsell_")) {
      const claimedNav =
        /فتحت|انتقلت|صفحة النتائج|حدّثت|حدثت|قمت ب|opened (the )?(live )?(search|results)|I opened|updated (the )?results/i.test(
          reply
        );
      if (claimedNav) {
        reply =
          locale === "ar"
            ? "أحتاج تفصيلاً واحداً ناقصاً قبل فتح نتائج الطيران. أجب باختصار وسأفتح الصفحة فوراً."
            : "I need one missing detail before opening flight results.";
      }
    }

    const payload: SearchAgentResponse = {
      ok: true,
      reply,
      action,
      intent,
      href,
      filters: extract.filters,
      missing: action === "ask" ? built.missing : undefined,
      sid: sid || "live",
      transcript: transcript || undefined,
    };
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
