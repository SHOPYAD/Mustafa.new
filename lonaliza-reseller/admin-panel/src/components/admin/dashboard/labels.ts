import type { DashboardCopy } from "@/components/admin/dashboard/copy";
import type { Locale } from "@/lib/i18n/types";

export function formatInt(value: number, locale: Locale): string {
  const tag = locale === "ar" ? "ar" : locale === "tr" ? "tr-TR" : "en-US";
  return new Intl.NumberFormat(tag).format(value);
}

export function formatMoney(
  value: number,
  currency: string,
  locale: Locale
): string {
  const tag = locale === "ar" ? "ar" : locale === "tr" ? "tr-TR" : "en-US";
  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
    }).format(value);
  } catch {
    return `${formatInt(Math.round(value), locale)} ${currency}`;
  }
}

export function formatDay(isoDate: string, locale: Locale): string {
  const tag = locale === "ar" ? "ar" : locale === "tr" ? "tr-TR" : "en-US";
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  if (!Number.isFinite(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat(tag, { month: "short", day: "numeric" }).format(
    d
  );
}

export function formatWhen(iso: string, locale: Locale): string {
  const tag = locale === "ar" ? "ar" : locale === "tr" ? "tr-TR" : "en-US";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Intl.DateTimeFormat(tag, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(t));
}

export function typeLabel(key: string, copy: DashboardCopy): string {
  switch (key) {
    case "flight":
      return copy.typeFlight;
    case "hotel":
      return copy.typeHotel;
    case "package":
      return copy.typePackage;
    case "transfer":
      return copy.typeTransfer;
    case "visa":
      return copy.typeVisa;
    case "tour":
      return copy.typeTour;
    case "car":
      return copy.typeCar;
    case "callback":
      return copy.typeCallback;
    case "contact":
      return copy.typeContact;
    case "general":
      return copy.typeGeneral;
    case "desktop":
      return copy.deviceDesktop;
    case "mobile":
      return copy.deviceMobile;
    case "tablet":
      return copy.deviceTablet;
    default:
      return key;
  }
}

export function statusLabel(key: string, copy: DashboardCopy): string {
  switch (key) {
    case "new":
      return copy.new;
    case "in-progress":
      return copy.inProgress;
    case "resolved":
      return copy.resolved;
    case "paid":
      return copy.paid;
    case "pending":
      return copy.pending;
    case "refunded":
      return copy.refunded;
    case "other":
      return copy.other;
    default:
      return key;
  }
}

export function statusVariant(
  key: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (key) {
    case "resolved":
    case "paid":
      return "default";
    case "new":
    case "pending":
      return "secondary";
    case "refunded":
    case "other":
      return "destructive";
    default:
      return "outline";
  }
}
