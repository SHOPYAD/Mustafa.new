import type { SearchTabKey } from "@/data/search-tabs";
import { extractAirlineHints } from "@/lib/airline-match";

export const SEARCH_AGENT_STORAGE = "lonaliza_search_agent_v1";
export const SEARCH_AGENT_EVENT = "lonaliza:search-agent";
export const SEARCH_AGENT_MODE_KEY = "lonaliza_search_ai_mode";

export type SearchAgentPage = "hero" | "results" | "booking";

export type SearchAgentAction =
  | "ask"
  | "navigate"
  | "filter"
  | "book"
  | "upsell_hotels"
  | "upsell_transfers"
  | "upsell_cars"
  | "upsell_tours"
  | "upsell_visa"
  | "upsell_insurance"
  | "scan_passport"
  | "coach_payment"
  | "coach_extras"
  | "reply";

export type SearchAgentIntent =
  | "flight"
  | "hotel"
  | "cars"
  | "transfers"
  | "tours"
  | "holiday"
  | "visa"
  | "insurance"
  | "offers"
  | "booking"
  | "unknown";

export type SearchAgentFilters = {
  airlines?: string[];
  baggageKg?: 20 | 23 | "included";
  directOnly?: boolean;
  cabinClass?: "economy" | "premium" | "business" | "first";
  maxPrice?: number;
  hotelName?: string;
  stars?: number;
  sort?: "price" | "best" | "fastest";
  refundable?: boolean;
  clearFilters?: boolean;
};

export type SearchAgentExtract = {
  intent: SearchAgentIntent;
  from?: string;
  to?: string;
  date?: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  rooms?: number;
  cabinClass?: "economy" | "premium" | "business" | "first";
  flightType?: "one-way" | "round-trip";
  time?: string;
  destination?: string;
  pickup?: string;
  dropoff?: string;
  filters?: SearchAgentFilters;
  missing?: string[];
};

export type SearchAgentMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  voice?: boolean;
  /** In-memory blob URL for playback. Never persist the bytes. */
  audioUrl?: string;
  at: number;
};

export type SearchAgentSession = {
  sid: string;
  tab: SearchTabKey;
  messages: SearchAgentMessage[];
  lastHref?: string;
  lastFlightHref?: string;
  pendingFilters?: SearchAgentFilters;
  updatedAt: number;
};

export type SearchAgentResponse = {
  ok: true;
  reply: string;
  action: SearchAgentAction;
  intent: SearchAgentIntent;
  href?: string;
  filters?: SearchAgentFilters;
  missing?: string[];
  sid: string;
  transcript?: string;
};

export type SearchAgentEventDetail = SearchAgentResponse & {
  source?: SearchAgentPage;
};

export function newSearchAgentSid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `sa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function appendAgentParams(href: string, sid: string): string {
  const hashIndex = href.indexOf("#");
  const bare = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const [path, qs] = bare.split("?");
  const params = new URLSearchParams(qs || "");
  params.set("ai", "1");
  params.set("asid", sid);
  return `${path}?${params.toString()}${hash}`;
}

export function loadSearchAgentSession(): SearchAgentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SEARCH_AGENT_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SearchAgentSession;
    if (!parsed?.sid || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSearchAgentSession(session: SearchAgentSession): void {
  if (typeof window === "undefined") return;
  try {
    const next = {
      ...session,
      messages: session.messages.slice(-24).map((m) => {
        const { audioUrl: _drop, ...rest } = m;
        return rest;
      }),
      updatedAt: Date.now(),
    };
    localStorage.setItem(SEARCH_AGENT_STORAGE, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

const VOICE_CLIPS_KEY = "lonaliza_voice_clips_v1";

export function rememberVoiceClip(id: string, dataUrl: string): void {
  if (typeof window === "undefined" || !id || !dataUrl) return;
  try {
    const raw = sessionStorage.getItem(VOICE_CLIPS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[id] = dataUrl;
    const ids = Object.keys(map);
    while (ids.length > 4) {
      const drop = ids.shift();
      if (drop) delete map[drop];
    }
    sessionStorage.setItem(VOICE_CLIPS_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

export function voiceClipFor(id: string): string | undefined {
  if (typeof window === "undefined" || !id) return undefined;
  try {
    const raw = sessionStorage.getItem(VOICE_CLIPS_KEY);
    if (!raw) return undefined;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[id] || undefined;
  } catch {
    return undefined;
  }
}

export function hydrateVoiceClips(messages: SearchAgentMessage[]): SearchAgentMessage[] {
  return messages.map((m) => (m.voice && !m.audioUrl ? { ...m, audioUrl: voiceClipFor(m.id) } : m));
}

export function speechWantsFlight(text: string): boolean {
  const t = String(text || "");
  if (/طيران|تذكرة|airline|\bflight\b|\bticket\b/i.test(t)) return true;
  if (/مباشر|non-?stop|direct/i.test(t) && /رحلة|طيران|وزن|حقيبة|flight/i.test(t)) return true;
  if (/وزن|حقيبة|حقائب|أمتعة|baggage|8\s*\+?\s*20|٨\s*\+?\s*٢٠/i.test(t) && /رحلة|طيران|سفر|flight/i.test(t)) return true;
  if (/رحلة/.test(t) && /رخيص|أرخص|ارخص|مباشر|وزن|حقيبة|مطار|جدة|جده/i.test(t)) return true;
  return false;
}

export function parseAgentSearchHref(href?: string): { from?: string; to?: string; date?: string; path?: string } {
  if (!href) return {};
  try {
    const u = new URL(href, "https://lonaliza.com");
    const from =
      u.searchParams.get("from") ||
      u.searchParams.get("originIata") ||
      u.searchParams.get("originSkyId") ||
      undefined;
    const to =
      u.searchParams.get("to") ||
      u.searchParams.get("destinationIata") ||
      u.searchParams.get("destinationSkyId") ||
      undefined;
    const date = u.searchParams.get("date") || u.searchParams.get("checkIn") || undefined;
    return {
      from: from || undefined,
      to: to || undefined,
      date: date || undefined,
      path: u.pathname,
    };
  } catch {
    return {};
  }
}

export function hotelContextMeta(context: string): { city?: string; checkIn?: string; checkOut?: string } {
  const m = String(context || "").match(
    /Hotel (?:search|list)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})(?:\s+(\d{4}-\d{2}-\d{2}))?/i
  );
  if (!m) return {};
  return { city: m[1].trim(), checkIn: m[2], checkOut: m[3] };
}

/** Full page load when switching engines (hotels → flights), client nav otherwise. */
export function navigateAgentHref(href: string, push: (href: string) => void): void {
  if (typeof window === "undefined") {
    push(href);
    return;
  }
  try {
    const next = new URL(href, window.location.origin);
    const curEngine = window.location.pathname.split("/").filter(Boolean)[0] || "";
    const nextEngine = next.pathname.split("/").filter(Boolean)[0] || "";
    if (nextEngine && nextEngine !== curEngine) {
      window.location.assign(`${next.pathname}${next.search}${next.hash}`);
      return;
    }
  } catch {
    /* fall through */
  }
  push(href);
}

export function emitSearchAgentEvent(detail: SearchAgentEventDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SEARCH_AGENT_EVENT, { detail }));
}

export function inferFiltersFromText(text: string, extraText = ""): SearchAgentFilters {
  const hay = `${text}\n${extraText}`;
  const next: SearchAgentFilters = {};
  if (/مباشر|direct( flights| only)?|non[-\s]?stop/i.test(hay)) next.directOnly = true;
  if (/وزن|حقيبة|حقائب|baggage|checked bag|\b20\s*kg|\b23\s*kg|8\s*\+?\s*20|٨\s*\+?\s*٢٠|ثماني[ةه]?\s*(زائد|\+)\s*عشر/i.test(hay)) {
    next.baggageKg =
      /\b20\b/.test(hay) || /8\s*\+?\s*20/.test(hay) || /٨\s*\+?\s*٢٠/.test(hay) || /ثماني[ةه]?\s*(زائد|\+)\s*عشر/.test(hay)
        ? 20
        : 23;
  }
  if (/الغاء مجاني|إلغاء مجاني|قابل للإلغاء|refundable|free cancel/i.test(hay)) {
    next.refundable = true;
  }
  if (/ارخص|الأرخص|سعر رخيص|رخيص|cheapest|lowest price/i.test(hay)) next.sort = "price";
  if (/شيل|وسّع|وسع|بدون فلتر|clear filter|widen|كل الخيارات/i.test(text)) {
    next.clearFilters = true;
  }
  const airlines = extractAirlineHints(text) || [];
  const extraAirlines = extraText ? extractAirlineHints(extraText) : [];
  const merged = [...new Set([...airlines, ...(/فقط|اظهرهم|أعرضهم|show (them|only)|only those/i.test(text) ? extraAirlines : [])])];
  if (merged.length) next.airlines = merged;
  return next;
}

export function tabToIntent(tab: SearchTabKey): SearchAgentIntent {
  if (tab === "flight") return "flight";
  if (tab === "hotel") return "hotel";
  if (tab === "cars") return "cars";
  if (tab === "transfers") return "transfers";
  if (tab === "tours") return "tours";
  if (tab === "holiday") return "holiday";
  if (tab === "visa") return "visa";
  if (tab === "insurance") return "insurance";
  if (tab === "offers") return "offers";
  return "unknown";
}

export function searchAgentCopy(locale: string) {
  const ar = locale === "ar";
  const tr = locale === "tr";
  if (ar) {
    return {
      mode: "AI Mode",
      live: "اتصال حي",
      liveWith: "أنت في اتصال حي مع وكيل لوناليزا",
      liveHint: "يفهم لهجتك وينفّذ البحث فوراً ويحفظ سياق رحلتك",
      placeholder: "قل طلبك أو سجّل صوتك... طيران، فندق، سيارة، رحلة",
      listening: "الوكيل يستمع إليك الآن",
      thinking: "أبحث وأفتح النتائج…",
      transcribing: "يستمع للتسجيل كاملاً ويفهم الطلب…",
      playVoice: "تشغيل التسجيل",
      pauseVoice: "إيقاف",
      voiceSent: "رسالة صوتية",
      voiceSilent: "التسجيل صامت — الميكروفون لم يلتقط صوتاً. من ويندوز: إعدادات → صوت → إدخال، اختر مايك اللابتوب الصحيح، ثم أعد التسجيل أو اكتب الطلب.",
      mic: "تحدث مع الوكيل",
      stop: "إيقاف التسجيل",
      send: "إرسال",
      offline: "تعذر الاتصال بالوكيل. جرّب مرة أخرى.",
      voiceSlow: "التفريغ تأخر. اكتب طلبك مباشرة: من أي مدينة، إلى أين، التاريخ، والوزن.",
      micDenied: "الميكروفون مغلق من إعدادات المتصفح. اضغط أيقونة القفل بجانب عنوان الموقع → أذونات الموقع → الميكروفون: السماح، ثم أعد المحاولة.",
      voiceTooShort: "التسجيل قصير جداً. اضغط الزر الأخضر، تحدّث ثانية أو اثنتين، ثم اضغط لإيقاف الإرسال.",
      voiceUnsupported: "التسجيل الصوتي غير مدعوم في هذا المتصفح. اكتب طلبك أو جرّب كروم.",
      welcome: (tab: string) =>
        `أهلاً بك. أنا وكيل لوناليزا الحي على محرك ${tab}. قل وجهتك وتواريخك وعدد الأشخاص وسأفتح النتائج أمامك فوراً.`,
    };
  }
  if (tr) {
    return {
      mode: "AI Mode",
      live: "Canlı hat",
      liveWith: "Lonaliza ajanıyla canlı bağlantıdasınız",
      liveHint: "Lehçenizi anlar, aramayı anında çalıştırır ve bağlamı korur",
      placeholder: "İsteğinizi yazın veya ses kaydedin...",
      listening: "Ajan sizi dinliyor",
      thinking: "Aranıyor, sonuçlar açılıyor…",
      transcribing: "Kaydın tamamı dinleniyor…",
      playVoice: "Kaydı dinle",
      pauseVoice: "Durdur",
      voiceSent: "Sesli mesaj",
      voiceSilent: "Kayıt sessiz — mikrofon ses algılamadı. Windows ses girişini kontrol edin veya isteğinizi yazın.",
      mic: "Ajanla konuş",
      stop: "Kaydı durdur",
      send: "Gönder",
      offline: "Ajan bağlantısı kurulamadı.",
      voiceSlow: "Ses çözümü gecikti. İsteğinizi yazın: nereden, nereye, tarih, bagaj.",
      micDenied: "Mikrofon tarayıcı ayarlarından kapalı. Adres çubuğundaki kilit simgesine basıp Mikrofon: İzin ver seçin, sonra tekrar deneyin.",
      voiceTooShort: "Kayıt çok kısa. Yeşil düğmeye basın, bir-iki saniye konuşun, sonra durdurun.",
      voiceUnsupported: "Bu tarayıcı ses kaydını desteklemiyor. Yazın veya Chrome kullanın.",
      welcome: (tab: string) =>
        `Merhaba. ${tab} arama motorundayım. Gidilecek yer, tarih ve kişi sayısını söyleyin, sonuçları hemen açarım.`,
    };
  }
  return {
    mode: "AI Mode",
    live: "Live",
    liveWith: "You are live with the Lonaliza agent",
    liveHint: "Understands your dialect, runs search instantly, and keeps your trip context",
    placeholder: "Type or record: flights, hotels, cars, tours...",
    listening: "The agent is listening",
    thinking: "Searching and opening results…",
    transcribing: "Listening to the full clip…",
    playVoice: "Play recording",
    pauseVoice: "Pause",
    voiceSent: "Voice message",
    voiceSilent: "The recording is silent — the mic captured no sound. Check Windows Sound → Input, pick the laptop microphone, then record again or type the request.",
    mic: "Talk to the agent",
    stop: "Stop recording",
    send: "Send",
    offline: "Could not reach the agent. Try again.",
    voiceSlow: "Transcription timed out. Type your request: from, to, date, and bag weight.",
    micDenied: "The microphone is blocked in the site permissions. Click the lock icon next to the URL → Site settings → Microphone: Allow, then try again.",
    voiceTooShort: "Recording was too short. Hold the live button, speak for a second or two, then stop.",
    voiceUnsupported: "Voice recording is not supported here. Type your request or use Chrome.",
    welcome: (tab: string) =>
      `Hi. I am live on the ${tab} search engine. Tell me destination, dates, and guests — I will open the results now.`,
  };
}
