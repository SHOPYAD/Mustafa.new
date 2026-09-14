import { buildWhatsAppLink } from "@/lib/utils";

export type BankTransferWhatsAppInput = {
  phone: string;
  message: string;
  reservationId?: string;
  totalLabel?: string;
};

/** Always https://wa.me — never whatsapp:// — so Flutter/WebView can intercept. */
export function bankTransferWhatsAppHref(input: BankTransferWhatsAppInput): string {
  const reservation = String(input.reservationId || "").trim();
  const total = String(input.totalLabel || "").trim();
  const body = String(input.message || "").trim();
  const lines = [body];
  if (reservation && !body.includes(reservation)) {
    lines.push(`Reservation: ${reservation}`);
  }
  if (total && !body.includes(total)) {
    lines.push(`Total: ${total}`);
  }
  const href = buildWhatsAppLink(input.phone, lines.filter(Boolean).join("\n"));
  return href.startsWith("https://wa.me/") ? href : "";
}

export function openBankTransferWhatsApp(input: BankTransferWhatsAppInput): string {
  const href = bankTransferWhatsAppHref(input);
  if (!href || typeof window === "undefined") return href;
  window.open(href, "_blank", "noopener,noreferrer");
  return href;
}
