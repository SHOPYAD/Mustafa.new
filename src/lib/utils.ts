// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
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
    // 98 + Turkish mobile (5xxxxxxxxx) is a common 90 typo; keep the intended TR number.
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
