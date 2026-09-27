import { type SalesChatStageId } from "@/lib/sales-chat-stages";

export const SALES_CHAT_INTENTS = [
  "INTENT_FLIGHT_SEARCH",
  "INTENT_HOTEL_SEARCH",
  "INTENT_CAR_SEARCH",
  "INTENT_TRANSFER_SEARCH",
  "INTENT_PACKAGE_PLANNER",
  "INTENT_CLARIFY",
] as const;

export type SalesChatIntent = (typeof SALES_CHAT_INTENTS)[number];

export type SalesChatToolName =
  | "search_flights"
  | "search_hotels"
  | "search_cars"
  | "search_transfers";

export type QuoteService = "flight" | "hotel" | "car" | "transfer";

export type GroundTransportMode = "none" | "car" | "transfer" | "both";

export type SalesChatToolPlan = {
  intent: SalesChatIntent;
  tools: SalesChatToolName[];
  services: QuoteService[];
  groundMode: GroundTransportMode;
  flightType: "one-way" | "round-trip";
  stages: SalesChatStageId[];
};

const TOOL_TO_SERVICE: Record<SalesChatToolName, QuoteService> = {
  search_flights: "flight",
  search_hotels: "hotel",
  search_cars: "car",
  search_transfers: "transfer",
};

const PACKAGE_RE =
  /برنامج|باقة|رحلة\s*شاملة|عطلة\s*شاملة|شهر\s*عسل|\bhoneymoon\b|\bpackage\b|\bitinerary\b|\bbundled\b|شامل(?:ة)?\s*(?:ال)?(?:طيران|فنادق|فندق|جولات|كوخ)|طيران\s*و(?:\s*)?(?:ال)?(?:فندق|فنادق|إقامة)|(?:فندق|فنادق|إقامة)\s*و(?:\s*)?(?:ال)?طيران|flight\s*and\s*hotel|hotel\s*and\s*flight|كوخ\s*والجولات/i;

const FLIGHT_RE =
  /رحلة\s*طيران|تذاكر?\s*(?:طيران)?|طي(?:ا)?ران|\bflights?\b|\bairfare\b|\btickets?\b|مباشر(?:ة)?|أ?متع[ةه]|\bbaggage\b|cabin\s*bag|one[-\s]?way|اتجاه\s*واحد/i;

const HOTEL_RE =
  /فنادق|فندق|\bhotels?\b|\bresorts?\b|إقامة|\bstay\b|كوخ/i;

const CAR_RENTAL_RE =
  /تأجير\s*سيارج?|استئجار\s*سيارج?|rent(?:al)?\s*(?:a\s*)?car|car\s*hire|hire\s*a\s*car/i;

const TRANSFER_RE =
  /ترانسفير|\btransfers?\b|\bshuttle\b|استقبال(?:\s*المطار)?|توصيل(?:\s*المطار)?|فيتو|\bvito\b|سيارة\s*خاصة|private\s+(?:van|car|transfer|driver)/i;

const BOTH_GROUND_RE =
  /(?:ترانسفير|transfer).{0,48}(?:تأجير|rental|rent\s*a\s*car)|(?:تأجير|rental|rent\s*a\s*car).{0,48}(?:ترانسفير|transfer)|سيارة.{0,24}و.{0,24}ترانسفير|ترانسفير.{0,24}و.{0,24}(?:تأجير|سيارة)/i;

const RETURN_RE =
  /ذهاب\s*وعودة|عودة|round[-\s]?trip|return(?:\s*date)?/i;

const ONE_WAY_RE = /اتجاه\s*واحد|one[-\s]?way|مباشر(?:ة)?/i;

const OD_RE =
  /من\s+\S.+\s+(?:الى|إلى)\s+\S+|\bfrom\s+\S.+\s+to\s+\S+/i;

function normalizeText(raw: string): string {
  return String(raw || "").replace(/\s+/g, " ").trim();
}

export function detectGroundMode(text: string): GroundTransportMode {
  const blob = normalizeText(text);
  if (!blob) return "none";
  if (BOTH_GROUND_RE.test(blob)) return "both";
  const rental = CAR_RENTAL_RE.test(blob);
  const transfer = TRANSFER_RE.test(blob);
  if (rental && transfer) return "both";
  if (rental) return "car";
  if (transfer) return "transfer";
  return "none";
}

function isHotelDropoffOnly(blob: string): boolean {
  return (
    /(?:ترانسفير|\btransfer\b)/i.test(blob) &&
    /(?:الى|إلى|\bto)\s+(?:ال)?فندق|\bto\s+(?:the\s+)?hotel/i.test(blob) &&
    !/فنادق|\bhotels\b|إقامة|ليال/i.test(blob)
  );
}

export function classifySalesChatIntent(text: string): SalesChatIntent {
  const blob = normalizeText(text);
  if (!blob) return "INTENT_CLARIFY";
  if (PACKAGE_RE.test(blob)) return "INTENT_PACKAGE_PLANNER";

  const hotel = HOTEL_RE.test(blob) && !isHotelDropoffOnly(blob);
  const car = CAR_RENTAL_RE.test(blob);
  const transfer = TRANSFER_RE.test(blob) && !car;
  const explicitFlight = FLIGHT_RE.test(blob);
  const flight =
    explicitFlight || (OD_RE.test(blob) && !hotel && !transfer && !car);

  const hits = [
    flight ? "flight" : "",
    hotel ? "hotel" : "",
    car ? "car" : "",
    transfer ? "transfer" : "",
  ].filter(Boolean);

  if (hits.length > 1) {
    if (flight && hotel) return "INTENT_PACKAGE_PLANNER";
    if (transfer && !explicitFlight) return "INTENT_TRANSFER_SEARCH";
    if (car && !explicitFlight) return "INTENT_CAR_SEARCH";
    if (flight) return "INTENT_FLIGHT_SEARCH";
  }
  if (hits.length === 1) {
    if (flight) return "INTENT_FLIGHT_SEARCH";
    if (hotel) return "INTENT_HOTEL_SEARCH";
    if (car) return "INTENT_CAR_SEARCH";
    if (transfer) return "INTENT_TRANSFER_SEARCH";
  }
  return "INTENT_CLARIFY";
}

export function toolsForIntent(
  intent: SalesChatIntent,
  groundMode: GroundTransportMode = "none"
): SalesChatToolName[] {
  switch (intent) {
    case "INTENT_FLIGHT_SEARCH":
      return ["search_flights"];
    case "INTENT_HOTEL_SEARCH":
      return ["search_hotels"];
    case "INTENT_CAR_SEARCH":
      return ["search_cars"];
    case "INTENT_TRANSFER_SEARCH":
      return ["search_transfers"];
    case "INTENT_PACKAGE_PLANNER": {
      const tools: SalesChatToolName[] = ["search_flights", "search_hotels"];
      if (groundMode === "car" || groundMode === "both") tools.push("search_cars");
      if (groundMode === "transfer" || groundMode === "both") {
        tools.push("search_transfers");
      }
      return tools;
    }
    default:
      return [];
  }
}

export function quoteServicesFromTools(
  tools: SalesChatToolName[]
): QuoteService[] {
  return tools.map((tool) => TOOL_TO_SERVICE[tool]);
}

export function filterRequestedTools(
  intent: SalesChatIntent,
  requested: SalesChatToolName[],
  groundMode: GroundTransportMode = "none"
): SalesChatToolName[] {
  const allowed = new Set(toolsForIntent(intent, groundMode));
  return requested.filter((tool) => allowed.has(tool));
}

export function applyGroundTransportXor<T extends { type: string }>(
  cards: T[],
  mode: GroundTransportMode
): T[] {
  if (mode === "both") return cards;
  return cards.filter((card) => {
    if (mode === "car") return card.type !== "transfer";
    if (mode === "transfer") return card.type !== "car";
    return card.type !== "car" && card.type !== "transfer";
  });
}

function detectFlightType(
  text: string,
  intent: SalesChatIntent
): "one-way" | "round-trip" {
  const blob = normalizeText(text);
  if (RETURN_RE.test(blob) && !ONE_WAY_RE.test(blob)) return "round-trip";
  if (intent === "INTENT_PACKAGE_PLANNER") return "round-trip";
  if (intent === "INTENT_FLIGHT_SEARCH") return "one-way";
  if (ONE_WAY_RE.test(blob)) return "one-way";
  return "round-trip";
}

function stagesForIntent(
  intent: SalesChatIntent,
  groundMode: GroundTransportMode
): SalesChatStageId[] {
  const stages: SalesChatStageId[] = ["understand", "dates"];
  const tools = toolsForIntent(intent, groundMode);
  if (tools.includes("search_flights")) stages.push("flights");
  if (tools.includes("search_hotels")) stages.push("hotels");
  if (tools.includes("search_transfers")) stages.push("transfers");
  if (tools.includes("search_cars")) stages.push("cars");
  if (intent === "INTENT_PACKAGE_PLANNER") stages.push("program");
  return stages.filter((id, i, all) => all.indexOf(id) === i);
}

export function planSalesChatTools(
  lastUserText: string,
  conversationText = ""
): SalesChatToolPlan {
  const last = normalizeText(lastUserText);
  const convo = normalizeText(conversationText);
  const blob = last.length >= 12 ? last : [convo, last].filter(Boolean).join("\n");
  const intent = classifySalesChatIntent(blob);
  const groundMode =
    intent === "INTENT_PACKAGE_PLANNER"
      ? detectGroundMode(blob)
      : intent === "INTENT_CAR_SEARCH"
        ? "car"
        : intent === "INTENT_TRANSFER_SEARCH"
          ? "transfer"
          : "none";
  const tools = toolsForIntent(intent, groundMode);
  return {
    intent,
    tools,
    services: quoteServicesFromTools(tools),
    groundMode,
    flightType: detectFlightType(blob, intent),
    stages: stagesForIntent(intent, groundMode),
  };
}

export function isSalesChatToolName(value: string): value is SalesChatToolName {
  return value in TOOL_TO_SERVICE;
}
