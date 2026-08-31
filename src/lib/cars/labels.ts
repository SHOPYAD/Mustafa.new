import type { Locale } from "@/lib/i18n/types";
import type { CarCategory, CarExtraKey, CarTransmission } from "@/types/car";

export function carCategoryLabel(category: CarCategory, locale: Locale): string {
  switch (category) {
    case "economy":
      return locale === "ar" ? "اقتصادية" : locale === "tr" ? "Ekonomik" : "Economy";
    case "compact":
      return locale === "ar" ? "مدمجة" : locale === "tr" ? "Kompakt" : "Compact";
    case "sedan":
      return locale === "ar" ? "سيدان" : locale === "tr" ? "Sedan" : "Sedan";
    case "suv":
      return locale === "ar" ? "دفع رباعي" : locale === "tr" ? "SUV" : "SUV";
    case "minivan":
      return locale === "ar" ? "ميني فان" : locale === "tr" ? "Minivan" : "Minivan";
    case "luxury":
      return locale === "ar" ? "فاخرة" : locale === "tr" ? "Lüks" : "Luxury";
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

export function carTransmissionLabel(
  transmission: CarTransmission,
  locale: Locale
): string {
  switch (transmission) {
    case "automatic":
      return locale === "ar" ? "أوتوماتيك" : locale === "tr" ? "Otomatik" : "Automatic";
    case "manual":
      return locale === "ar" ? "عادي" : locale === "tr" ? "Manuel" : "Manual";
    default: {
      const _exhaustive: never = transmission;
      return _exhaustive;
    }
  }
}

export function carExtraLabel(key: CarExtraKey, locale: Locale): string {
  switch (key) {
    case "additionalDriver":
      return locale === "ar"
        ? "سائق إضافي"
        : locale === "tr"
          ? "Ek sürücü"
          : "Additional driver";
    case "childSeat":
      return locale === "ar"
        ? "مقعد أطفال"
        : locale === "tr"
          ? "Çocuk koltuğu"
          : "Child seat";
    case "gps":
      return locale === "ar" ? "نظام GPS" : locale === "tr" ? "GPS" : "GPS";
    case "fullInsurance":
      return locale === "ar"
        ? "تأمين شامل"
        : locale === "tr"
          ? "Tam kasko"
          : "Full insurance";
    case "excessReduction":
      return locale === "ar"
        ? "تخفيض التحمل"
        : locale === "tr"
          ? "Muafiyet düşürme"
          : "Excess reduction";
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export function carDisplayName(
  car: { name: string; nameAr?: string; nameTr?: string },
  locale: Locale
): string {
  if (locale === "ar") return car.nameAr || car.name;
  if (locale === "tr") return car.nameTr || car.name;
  return car.name;
}
