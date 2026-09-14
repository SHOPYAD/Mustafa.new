import type {
  SalesChatCard,
  SalesChatCardType,
  SalesChatItinerary,
  SalesChatStructured,
} from "@/types/sales-chat";

export type HydratedSalesChat = {
  reply: string;
  cards: SalesChatCard[];
  itinerary: SalesChatItinerary | null;
  readyForWhatsApp: boolean;
  saveProgram?: boolean;
  destination?: string;
  nights?: number;
  people?: number;
  arrivalDate?: string;
  departureDate?: string;
  thumbnail?: string;
  includesAr?: string[];
  includesEn?: string[];
  flightSearch?: SalesChatStructured["flightSearch"];
  transferSearch?: SalesChatStructured["transferSearch"];
  carsSearch?: SalesChatStructured["carsSearch"];
  suggestedFlightHref?: string;
  transferHref?: string;
  carsHref?: string;
  perks?: SalesChatStructured["perks"];
  bundleCheckoutPayload?: SalesChatStructured["bundleCheckoutPayload"];
};

const CARD_TYPES: readonly SalesChatCardType[] = [
  "hotel",
  "flight",
  "package",
  "transfer",
  "car",
];

const SALES_KEY_RE =
  /"(?:reply|cards|itinerary|readyForWhatsApp|saveProgram|flightSearch|transferSearch|carsSearch)"\s*:/;

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function pickNum(...vals: unknown[]): number {
  for (const v of vals) {
    const n = typeof v === "string" ? Number(v.replace(/[^\d.-]/g, "")) : Number(v);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
}

function pickStrList(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.map((x) => String(x || "").trim()).filter(Boolean);
  return out.length ? out : undefined;
}

function looksLikeSalesObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.reply === "string" ||
    Array.isArray(o.cards) ||
    o.itinerary != null ||
    o.flightSearch != null ||
    o.transferSearch != null ||
    o.carsSearch != null ||
    typeof o.readyForWhatsApp === "boolean"
  );
}

function looksLikeRawJson(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/^```(?:json|JSON|javascript|js)?\s*\{/.test(t)) return true;
  if (t.startsWith("{") && SALES_KEY_RE.test(t)) return true;
  return false;
}

function extractBalancedObject(text: string, start: number): string | null {
  if (start < 0 || start >= text.length || text[start] !== "{") return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

function findObjectStarts(text: string): number[] {
  const starts: number[] = [];
  const re = /\{\s*"(?:reply|cards|itinerary|readyForWhatsApp|saveProgram)"\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) starts.push(m.index);
  return starts;
}

function repairTruncatedJson(raw: string): string {
  let s = raw.trim();
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }

  if (inString) s += '"';
  s = s.replace(/,\s*$/, "");
  while (stack.length) s += stack.pop();
  return s;
}

function tryParseObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
  if (!trimmed) return null;

  const attempts = [
    trimmed,
    trimmed.replace(/,\s*([}\]])/g, "$1"),
    repairTruncatedJson(trimmed.replace(/,\s*([}\]])/g, "$1")),
  ];

  for (const attempt of attempts) {
    try {
      const value = JSON.parse(attempt) as unknown;
      if (looksLikeSalesObject(value)) return value;
    } catch {
      /* try next */
    }
  }
  return null;
}

function collectJsonCandidates(text: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();
  const push = (raw?: string | null) => {
    const v = raw?.trim();
    if (!v || seen.has(v)) return;
    seen.add(v);
    candidates.push(v);
  };

  const fenceRe = /```(?:json|JSON|javascript|js)?\s*([\s\S]*?)```/gi;
  let fence: RegExpExecArray | null;
  while ((fence = fenceRe.exec(text))) {
    push(fence[1]);
  }

  const unclosed = text.match(/```(?:json|JSON|javascript|js)?\s*(\{[\s\S]*)$/i);
  if (unclosed?.[1]) push(unclosed[1]);

  for (const start of findObjectStarts(text)) {
    push(extractBalancedObject(text, start));
  }

  const trimmed = text.trim();
  if (trimmed.startsWith("{")) push(trimmed);

  return candidates;
}

export function extractSalesChatObject(
  text: string
): Record<string, unknown> | null {
  if (!text || !text.trim()) return null;
  for (const candidate of collectJsonCandidates(text)) {
    const parsed = tryParseObject(candidate);
    if (parsed) return parsed;
  }
  return null;
}

export function stripSalesChatJson(text: string): string {
  if (!text) return "";
  let out = text.replace(
    /```(?:json|JSON|javascript|js)?\s*[\s\S]*?(```|$)/gi,
    "\n"
  );

  const starts = findObjectStarts(out);
  for (let i = starts.length - 1; i >= 0; i--) {
    const start = starts[i];
    const extracted = extractBalancedObject(out, start);
    if (!extracted) continue;
    if (tryParseObject(extracted) || SALES_KEY_RE.test(extracted)) {
      out = `${out.slice(0, start)}${out.slice(start + extracted.length)}`;
    }
  }

  out = out.replace(/```(?:json|JSON|javascript|js)?\s*$/gi, "");
  out = out.replace(/\n{3,}/g, "\n\n").trim();
  if (looksLikeRawJson(out)) return "";
  return out;
}

export function normalizeCardType(raw: unknown): SalesChatCardType | null {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if ((CARD_TYPES as readonly string[]).includes(s)) {
    return s as SalesChatCardType;
  }
  if (s.includes("hotel") || s.includes("resort") || s.includes("فندق")) {
    return "hotel";
  }
  if (s.includes("flight") || s.includes("airline") || s.includes("طيران")) {
    return "flight";
  }
  if (
    s.includes("package") ||
    s.includes("holiday") ||
    s.includes("برنامج") ||
    s.includes("باقة")
  ) {
    return "package";
  }
  if (s.includes("transfer") || s.includes("shuttle") || s.includes("ترانسفير")) {
    return "transfer";
  }
  if (s.includes("car") || s.includes("rent") || s.includes("سيارة")) {
    return "car";
  }
  return null;
}

export function normalizeSalesChatCard(raw: unknown): SalesChatCard | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const type = normalizeCardType(c.type);
  if (!type) return null;
  const titleAr = pickStr(c.titleAr, c.title, c.name, c.nameAr);
  const titleEn = pickStr(c.titleEn, c.title, c.name, c.nameEn);
  if (!titleAr && !titleEn) return null;
  return {
    type,
    id: pickStr(c.id) || undefined,
    titleAr: titleAr || titleEn,
    titleEn: titleEn || titleAr,
    subtitleAr: pickStr(c.subtitleAr, c.subtitle, c.location, c.locationAr) || undefined,
    subtitleEn: pickStr(c.subtitleEn, c.subtitle, c.location, c.locationEn) || undefined,
    image: pickStr(c.image, c.imageUrl, c.photo) || undefined,
    basePrice: pickNum(c.basePrice, c.cost, c.price),
    clientPrice: pickNum(c.clientPrice, c.price, c.total, c.amount),
    currency: pickStr(c.currency) || "USD",
    href: pickStr(c.href, c.url, c.link) || undefined,
    badges: pickStrList(c.badges) || [],
    highlights: pickStrList(c.highlights) || pickStrList(c.features) || [],
    pricePending: Boolean(c.pricePending),
    unitPrice: pickNum(c.unitPrice) || undefined,
    unitLabelAr: pickStr(c.unitLabelAr) || undefined,
    unitLabelEn: pickStr(c.unitLabelEn) || undefined,
    nights: pickNum(c.nights) || undefined,
    days: pickNum(c.days) || undefined,
    source:
      c.source === "live" || c.source === "catalog" || c.source === "pending"
        ? c.source
        : undefined,
    stars: pickNum(c.stars) || undefined,
    roomName: pickStr(c.roomName, c.roomType) || undefined,
    airline: pickStr(c.airline, c.carrier) || undefined,
    airlineCode: pickStr(c.airlineCode, c.carrierCode) || undefined,
    airlineLogo: pickStr(c.airlineLogo, c.logo) || undefined,
    fromIata: pickStr(c.fromIata, c.origin) || undefined,
    toIata: pickStr(c.toIata, c.destination) || undefined,
    departAt: pickStr(c.departAt, c.departure, c.departTime) || undefined,
    arriveAt: pickStr(c.arriveAt, c.arrival, c.arriveTime) || undefined,
    returnDepartAt: pickStr(c.returnDepartAt) || undefined,
    returnArriveAt: pickStr(c.returnArriveAt) || undefined,
    durationMinutes: pickNum(c.durationMinutes, c.duration) || undefined,
    stopCount: pickNum(c.stopCount, c.stops) || undefined,
    flightNumber: pickStr(c.flightNumber) || undefined,
    tripType:
      c.tripType === "round-trip" || c.tripType === "one-way"
        ? c.tripType
        : undefined,
  };
}

function normalizeItineraryDay(
  raw: unknown,
  index: number
): NonNullable<SalesChatItinerary["days"]>[number] | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const titleAr = pickStr(d.titleAr, d.title, d.name, d.nameAr, d.heading);
  const titleEn = pickStr(d.titleEn, d.title, d.name, d.nameEn, d.heading);
  const detailAr = pickStr(
    d.detailAr,
    d.detail,
    d.description,
    d.descriptionAr,
    d.text,
    d.textAr,
    d.body
  );
  const detailEn = pickStr(
    d.detailEn,
    d.detail,
    d.description,
    d.descriptionEn,
    d.text,
    d.textEn,
    d.body
  );
  const itemsRaw = Array.isArray(d.items) ? d.items : [];
  const items = itemsRaw
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const it = raw as Record<string, unknown>;
      const labelAr = pickStr(it.labelAr, it.label, it.title, it.titleAr);
      const labelEn = pickStr(it.labelEn, it.label, it.title, it.titleEn);
      if (!labelAr && !labelEn && !pickStr(it.time)) return null;
      const kindRaw = String(it.kind || it.type || "").toLowerCase();
      const kind =
        kindRaw === "flight" || kindRaw === "hotel" || kindRaw === "transfer" || kindRaw === "activity"
          ? (kindRaw as "flight" | "hotel" | "transfer" | "activity")
          : undefined;
      return {
        time: pickStr(it.time) || undefined,
        kind,
        labelAr: labelAr || labelEn || undefined,
        labelEn: labelEn || labelAr || undefined,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  if (!titleAr && !titleEn && !detailAr && !detailEn && !items.length) return null;
  return {
    day: Math.max(1, Math.round(pickNum(d.day, index + 1) || index + 1)),
    titleAr: titleAr || titleEn,
    titleEn: titleEn || titleAr,
    detailAr: detailAr || undefined,
    detailEn: detailEn || undefined,
    items: items.length ? items : undefined,
  };
}

export function normalizeSalesChatItinerary(
  raw: unknown
): SalesChatItinerary | null {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const days = raw
      .map((d, i) => normalizeItineraryDay(d, i))
      .filter((d): d is NonNullable<typeof d> => Boolean(d));
    if (!days.length) return null;
    return {
      titleAr: "",
      titleEn: "",
      days,
      totalBasePrice: 0,
      totalClientPrice: 0,
      currency: "USD",
    };
  }
  if (typeof raw !== "object") return null;
  const it = raw as Record<string, unknown>;
  const daysRaw = Array.isArray(it.days) ? it.days : [];
  const days = daysRaw
    .map((d, i) => normalizeItineraryDay(d, i))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const titleAr = pickStr(it.titleAr, it.title, it.name);
  const titleEn = pickStr(it.titleEn, it.title, it.name);
  const totalClientPrice = pickNum(
    it.totalClientPrice,
    it.total,
    it.price,
    it.totalPrice
  );
  if (!titleAr && !titleEn && !days.length && totalClientPrice <= 0) return null;
  return {
    titleAr: titleAr || titleEn,
    titleEn: titleEn || titleAr,
    days,
    totalBasePrice: pickNum(it.totalBasePrice, it.baseTotal, it.cost),
    totalClientPrice,
    currency: pickStr(it.currency) || "USD",
    arrivalDate: pickStr(it.arrivalDate, it.checkIn, it.date) || undefined,
    departureDate: pickStr(it.departureDate, it.checkOut, it.returnDate) || undefined,
    destination: pickStr(it.destination) || undefined,
  };
}

function fallbackReply(locale?: string): string {
  if (locale === "tr") return "İşte size özel teklif.";
  if (locale === "en") return "Here is a tailored offer for your trip.";
  return "إليك العرض المقترح لرحلتك.";
}

function extractMarkdownItinerary(text: string): SalesChatItinerary | null {
  if (!text) return null;
  const heading =
    /(?:^|\n)\s*(?:\*\*|__|#{1,3}\s*)?(?:اليوم|يوم|Day|Gün)\s*[:.]?\s*(\d+)\s*[:.\-—–]?\s*(.*)$/gim;
  const matches = [...text.matchAll(heading)];
  if (matches.length < 2) return null;

  const days: NonNullable<SalesChatItinerary["days"]> = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = (match.index || 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index || text.length : text.length;
    const title = String(match[2] || "")
      .replace(/\*+/g, "")
      .trim();
    const detail = text
      .slice(start, end)
      .replace(/```[\s\S]*$/g, "")
      .replace(/\*+/g, "")
      .trim();
    days.push({
      day: Number(match[1]) || i + 1,
      titleAr: title,
      titleEn: title,
      detailAr: detail || undefined,
      detailEn: detail || undefined,
    });
  }

  return {
    titleAr: "",
    titleEn: "",
    days,
    totalBasePrice: 0,
    totalClientPrice: 0,
    currency: "USD",
  };
}

function stripMarkdownItinerary(text: string): string {
  if (!text) return "";
  const cut = text.search(
    /(?:^|\n)\s*(?:\*\*|__|#{1,3}\s*)?(?:اليوم|يوم|Day|Gün)\s*[:.]?\s*\d+/m
  );
  if (cut < 0) return text.trim();
  return text.slice(0, cut).trim();
}

export function hydrateSalesChatResponse(
  text: string,
  extras?: {
    cards?: unknown;
    itinerary?: unknown;
    locale?: string;
  }
): HydratedSalesChat {
  const parsed = extractSalesChatObject(text);
  const cardsFromText = Array.isArray(parsed?.cards)
    ? parsed!.cards.map(normalizeSalesChatCard).filter((c): c is SalesChatCard => Boolean(c))
    : [];
  const extraCards = extras?.cards;
  const hasExtraCards = Array.isArray(extraCards);
  const cardsFromExtras = hasExtraCards
    ? extraCards.map(normalizeSalesChatCard).filter((c): c is SalesChatCard => Boolean(c))
    : [];
  const cards = hasExtraCards ? cardsFromExtras : cardsFromText;

  const itineraryFromExtras = normalizeSalesChatItinerary(extras?.itinerary);
  const itineraryFromText = normalizeSalesChatItinerary(parsed?.itinerary);
  let itinerary = itineraryFromExtras || itineraryFromText;

  let reply = stripSalesChatJson(pickStr(parsed?.reply, ""));
  if (!reply) reply = stripSalesChatJson(text);
  if (looksLikeRawJson(reply)) reply = "";

  if (!itinerary) {
    itinerary = extractMarkdownItinerary(reply);
  }
  if (itinerary?.days && itinerary.days.length > 0) {
    reply = stripMarkdownItinerary(reply);
    if (reply.length > 520) {
      reply = reply.split(/\n{2,}/).slice(0, 2).join("\n\n").trim();
    }
  }

  if (itinerary && itinerary.totalClientPrice <= 0 && cards.length) {
    itinerary = {
      ...itinerary,
      totalClientPrice: cards.reduce(
        (sum, card) => sum + (Number(card.clientPrice) || 0),
        0
      ),
    };
  }

  if (!reply && (cards.length || itinerary)) {
    reply = fallbackReply(extras?.locale);
  }
  if (!reply && pickStr(parsed?.reply)) reply = fallbackReply(extras?.locale);

  return {
    reply,
    cards,
    itinerary,
    readyForWhatsApp:
      Boolean(parsed?.readyForWhatsApp) || cards.length > 0 || Boolean(itinerary),
    saveProgram: Boolean(parsed?.saveProgram),
    destination: pickStr(parsed?.destination) || undefined,
    nights: pickNum(parsed?.nights) || undefined,
    people: pickNum(parsed?.people) || undefined,
    arrivalDate: pickStr(parsed?.arrivalDate) || undefined,
    departureDate: pickStr(parsed?.departureDate) || undefined,
    thumbnail: pickStr(parsed?.thumbnail) || undefined,
    includesAr: pickStrList(parsed?.includesAr),
    includesEn: pickStrList(parsed?.includesEn),
    flightSearch:
      (parsed?.flightSearch as SalesChatStructured["flightSearch"]) || undefined,
    transferSearch:
      (parsed?.transferSearch as SalesChatStructured["transferSearch"]) ||
      undefined,
    carsSearch:
      (parsed?.carsSearch as SalesChatStructured["carsSearch"]) || undefined,
    suggestedFlightHref: pickStr(parsed?.suggestedFlightHref) || undefined,
    transferHref: pickStr(parsed?.transferHref) || undefined,
    carsHref: pickStr(parsed?.carsHref) || undefined,
    perks: (parsed?.perks as SalesChatStructured["perks"]) || (extras as any)?.perks || undefined,
    bundleCheckoutPayload: (parsed?.bundleCheckoutPayload as SalesChatStructured["bundleCheckoutPayload"]) || (extras as any)?.bundleCheckoutPayload || undefined,
  };
}
