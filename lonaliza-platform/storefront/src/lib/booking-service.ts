export const INVOICE_SERVICES = [
  "flight",
  "hotel",
  "transfer",
  "car",
  "package",
  "tour",
  "visa",
] as const;

export type InvoiceService = (typeof INVOICE_SERVICES)[number];

export function isInvoiceService(value: unknown): value is InvoiceService {
  return INVOICE_SERVICES.includes(value as InvoiceService);
}

export function detectInvoiceService(input: {
  provider?: unknown;
  hotel_id?: unknown;
  offer_snapshot?: unknown;
  type?: unknown;
}): InvoiceService {
  const snap =
    input.offer_snapshot && typeof input.offer_snapshot === "object"
      ? (input.offer_snapshot as Record<string, unknown>)
      : {};
  const raw = String(
    snap.booking_type || snap.service_type || input.type || input.provider || ""
  )
    .trim()
    .toLowerCase();
  const id = String(input.hotel_id || snap.hotel_id || "").toLowerCase();

  if (raw === "flight" || raw.startsWith("flight") || id.startsWith("flight:")) return "flight";
  if (raw === "transfer" || raw.startsWith("transfer") || id.startsWith("transfer:")) return "transfer";
  if (raw === "car" || raw === "cars" || raw.startsWith("car") || id.startsWith("car:")) return "car";
  if (raw === "package" || raw === "packages" || id.startsWith("package:")) return "package";
  if (raw === "tour" || raw === "tours" || id.startsWith("tour:")) return "tour";
  if (raw === "visa" || raw === "visas" || id.startsWith("visa:")) return "visa";
  return "hotel";
}

export function invoiceServicePath(service: InvoiceService): "/flights/booking" | "/hotels/book" {
  switch (service) {
    case "flight":
      return "/flights/booking";
    case "hotel":
    case "transfer":
    case "car":
    case "package":
    case "tour":
    case "visa":
      return "/hotels/book";
    default: {
      const _exhaustive: never = service;
      return _exhaustive;
    }
  }
}

export function invoiceServiceTitle(service: InvoiceService): { ar: string; en: string; tr: string } {
  switch (service) {
    case "flight":
      return { ar: "فاتورة تذكرة طيران", en: "Flight e-ticket / invoice", tr: "Uçuş bileti / fatura" };
    case "hotel":
      return { ar: "فاتورة حجز فندق", en: "Hotel booking invoice", tr: "Otel rezervasyon faturası" };
    case "transfer":
      return { ar: "فاتورة نقل / ترانسفير", en: "Transfer invoice", tr: "Transfer faturası" };
    case "car":
      return { ar: "فاتورة تأجير سيارة", en: "Car rental invoice", tr: "Araç kiralama faturası" };
    case "package":
      return { ar: "فاتورة باقة سياحية", en: "Holiday package invoice", tr: "Tatil paketi faturası" };
    case "tour":
      return { ar: "فاتورة جولة سياحية", en: "Tour invoice", tr: "Tur faturası" };
    case "visa":
      return { ar: "فاتورة طلب تأشيرة", en: "Visa request invoice", tr: "Vize talep faturası" };
    default: {
      const _exhaustive: never = service;
      return _exhaustive;
    }
  }
}
