import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shallow<T>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA as object);
  const keysB = Object.keys(objB as object);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is((objA as Record<string, unknown>)[key], (objB as Record<string, unknown>)[key])
    ) {
      return false;
    }
  }
  return true;
}

/** Resolve bilingual/trilingual content field (titleAr/titleEn/titleTr etc.) */
export function tContent(
  item: object | null | undefined,
  base: string,
  locale: Locale
): string {
  if (!item) return "";
  const record = item as Record<string, unknown>;
  const arKey = `${base}Ar`;
  const enKey = `${base}En`;
  const trKey = `${base}Tr`;
  const frKey = `${base}Fr`;
  const arVal = String(record[arKey] || "");
  const enVal = String(record[enKey] || "");
  const trVal = String(record[trKey] || "");
  const frVal = String(record[frKey] || "");
  const baseVal = String(record[base] || "");
  if (locale === "ar") {
    return arVal || enVal || baseVal;
  }
  if (locale === "tr") {
    return trVal || enVal || arVal || baseVal;
  }
  if (locale === "fr") {
    return frVal || enVal || arVal || baseVal;
  }
  return enVal || arVal || baseVal;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Normalize phone to digits only (for wa.me) */
export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (/^98(5\d{9})$/.test(digits)) return `90${digits.slice(2)}`;
  return digits;
}

/**
 * Build WhatsApp chat URL.
 * @param phone e.g. +905321796763 or 905321796763
 * @param message prefilled text
 */
export function buildWhatsAppLink(phone: string, message?: string): string {
  const num = normalizeWhatsAppNumber(phone);
  if (!num) return "#";
  const base = `https://wa.me/${num}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export function mapEmbedFromCoords(lat: number, lng: number, zoom = 15): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";
  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  }
) {
  const {
    currency = "USD",
    locale = "en-US",
    minimumFractionDigits,
    maximumFractionDigits,
    noDecimals,
  } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}
