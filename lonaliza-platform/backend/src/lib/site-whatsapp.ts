import { DEFAULT_SITE_WHATSAPP, getSiteContact } from "@/data/site-contact";
import { buildWhatsAppLink, normalizeWhatsAppNumber } from "@/lib/utils";

/** Legacy demo numbers that must never appear in production CTAs */
const LEGACY_DEMO_WHATSAPP = new Set([
  "971585255484",
  "9715852554840",
  "971525376367",
]);

export function resolveBusinessWhatsAppNumber(candidate?: string): string {
  const fromSite = normalizeWhatsAppNumber(getSiteContact().whatsappNumber);
  if (fromSite && !LEGACY_DEMO_WHATSAPP.has(fromSite)) return fromSite;

  const fromCandidate = normalizeWhatsAppNumber(candidate || "");
  if (fromCandidate && !LEGACY_DEMO_WHATSAPP.has(fromCandidate)) {
    return fromCandidate;
  }

  return DEFAULT_SITE_WHATSAPP;
}

export function getBusinessWhatsAppNumber(): string {
  return resolveBusinessWhatsAppNumber();
}

export function buildBusinessWhatsAppLink(message?: string): string {
  return buildWhatsAppLink(getBusinessWhatsAppNumber(), message);
}

export function formatWhatsAppDisplay(number?: string): string {
  const digits = resolveBusinessWhatsAppNumber(number);
  if (digits.startsWith("90") && digits.length >= 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return `+${digits}`;
}
