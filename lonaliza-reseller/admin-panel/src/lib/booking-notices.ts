import type { Locale } from "@/lib/i18n/types";
import { invoiceLabels } from "@/lib/pdf/invoice-labels";

/** Same key as invoice PDF labels — invoice agent renders this on the receipt. */
export const ETICKET_ISSUANCE_NOTE_KEY = "issuanceNotice" as const;

export function eticketIssuanceNote(locale: Locale): string {
  return invoiceLabels(locale).issuanceNotice;
}
