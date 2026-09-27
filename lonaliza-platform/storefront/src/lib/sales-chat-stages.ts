export const SALES_CHAT_STAGE_IDS = [
  "understand",
  "dates",
  "flights",
  "hotels",
  "transfers",
  "cars",
  "program",
] as const;

export type SalesChatStageId = (typeof SALES_CHAT_STAGE_IDS)[number];

export type SalesChatStageStatus = "pending" | "active" | "done";

export type SalesChatStageEvent = {
  id: SalesChatStageId;
  status: SalesChatStageStatus;
  index?: number;
};

export const SALES_CHAT_STAGE_LABELS: Record<
  SalesChatStageId,
  { ar: string; en: string; tr: string }
> = {
  understand: {
    ar: "فهم الطلب",
    en: "Understanding the request",
    tr: "Talebi anlama",
  },
  dates: {
    ar: "سؤال التواريخ وعدد الأشخاص",
    en: "Dates and travelers",
    tr: "Tarihler ve yolcu sayısı",
  },
  flights: {
    ar: "البحث عن الطيران",
    en: "Searching flights",
    tr: "Uçuş araması",
  },
  hotels: {
    ar: "البحث عن الفندق",
    en: "Searching hotels",
    tr: "Otel araması",
  },
  transfers: {
    ar: "البحث عن الترانسفير",
    en: "Searching transfers",
    tr: "Transfer araması",
  },
  cars: {
    ar: "البحث عن السيارات",
    en: "Searching cars",
    tr: "Araç araması",
  },
  program: {
    ar: "تجهيز البرنامج",
    en: "Preparing the program",
    tr: "Program hazırlama",
  },
};

export function isSalesChatStageId(value: string): value is SalesChatStageId {
  return (SALES_CHAT_STAGE_IDS as readonly string[]).includes(value);
}
