import type { InvoiceService } from "@/lib/booking-service";

export const INVOICE_LANGUAGES = ["ar", "en", "tr"] as const;
export type InvoiceLanguage = (typeof INVOICE_LANGUAGES)[number];

export const INVOICE_CURRENCY_FORMATS = ["western", "localized"] as const;
export type InvoiceCurrencyFormat = (typeof INVOICE_CURRENCY_FORMATS)[number];

export const INVOICE_FIELD_KEYS = [
  "customer",
  "passenger",
  "route",
  "taxes",
  "baseFare",
  "baggage",
  "fareClass",
  "legs",
  "hotel",
  "room",
  "nights",
  "dates",
  "payment",
  "details",
] as const;

export type InvoiceFieldKey = (typeof INVOICE_FIELD_KEYS)[number];

export type InvoiceVisibleFields = Record<InvoiceFieldKey, boolean>;

export type InvoiceTemplate = {
  service: InvoiceService;
  companyNameAr: string;
  companyNameEn: string;
  logoUrl: string;
  logoHeight: number;
  primaryColor: string;
  accentColor: string;
  headerText: string;
  footerText: string;
  language: InvoiceLanguage;
  currencyFormat: InvoiceCurrencyFormat;
  fields: InvoiceVisibleFields;
  customCss: string;
  extraHtml: string;
};

export type InvoiceTemplatesFile = {
  templates: Record<InvoiceService, InvoiceTemplate>;
  updatedAt?: string;
};

export type InvoiceTemplatePatch = Partial<Omit<InvoiceTemplate, "service" | "fields">> & {
  fields?: Partial<InvoiceVisibleFields>;
};

export function isInvoiceLanguage(value: unknown): value is InvoiceLanguage {
  return INVOICE_LANGUAGES.includes(value as InvoiceLanguage);
}

export function isInvoiceCurrencyFormat(value: unknown): value is InvoiceCurrencyFormat {
  return INVOICE_CURRENCY_FORMATS.includes(value as InvoiceCurrencyFormat);
}

export function isInvoiceFieldKey(value: unknown): value is InvoiceFieldKey {
  return INVOICE_FIELD_KEYS.includes(value as InvoiceFieldKey);
}
