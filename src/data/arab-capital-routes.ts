import type { Locale } from "@/lib/i18n/types";

export type TurkeyFlightDestCode = "IST" | "TZX";

export type ArabCapital = {
  id: string;
  iata: string;
  nameAr: string;
  nameEn: string;
  nameTr: string;
};

export type TurkeyFlightDest = {
  code: TurkeyFlightDestCode;
  iata: string;
  nameAr: string;
  nameEn: string;
  nameTr: string;
  image: string;
};

/** GCC + Cairo / Amman first, then Baghdad and Beirut. */
export const ARAB_CAPITALS: ArabCapital[] = [
  { id: "riyadh", iata: "RUH", nameAr: "الرياض", nameEn: "Riyadh", nameTr: "Riyad" },
  { id: "jeddah", iata: "JED", nameAr: "جدة", nameEn: "Jeddah", nameTr: "Cidde" },
  { id: "dubai", iata: "DXB", nameAr: "دبي", nameEn: "Dubai", nameTr: "Dubai" },
  { id: "abu-dhabi", iata: "AUH", nameAr: "أبوظبي", nameEn: "Abu Dhabi", nameTr: "Abu Dabi" },
  { id: "doha", iata: "DOH", nameAr: "الدوحة", nameEn: "Doha", nameTr: "Doha" },
  { id: "kuwait", iata: "KWI", nameAr: "الكويت", nameEn: "Kuwait", nameTr: "Kuveyt" },
  { id: "manama", iata: "BAH", nameAr: "المنامة", nameEn: "Manama", nameTr: "Manama" },
  { id: "muscat", iata: "MCT", nameAr: "مسقط", nameEn: "Muscat", nameTr: "Maskat" },
  { id: "amman", iata: "AMM", nameAr: "عمّان", nameEn: "Amman", nameTr: "Amman" },
  { id: "cairo", iata: "CAI", nameAr: "القاهرة", nameEn: "Cairo", nameTr: "Kahire" },
  { id: "baghdad", iata: "BGW", nameAr: "بغداد", nameEn: "Baghdad", nameTr: "Bağdat" },
  { id: "beirut", iata: "BEY", nameAr: "بيروت", nameEn: "Beirut", nameTr: "Beyrut" },
];

export const TURKEY_FLIGHT_DESTS: TurkeyFlightDest[] = [
  {
    code: "IST",
    iata: "IST",
    nameAr: "إسطنبول",
    nameEn: "Istanbul",
    nameTr: "İstanbul",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
  },
  {
    code: "TZX",
    iata: "TZX",
    nameAr: "طرابزون",
    nameEn: "Trabzon",
    nameTr: "Trabzon",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
  },
];

export function capitalDisplayName(city: ArabCapital, locale: Locale): string {
  switch (locale) {
    case "ar":
      return city.nameAr;
    case "tr":
      return city.nameTr;
    case "en":
      return city.nameEn;
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}

export function destDisplayName(dest: TurkeyFlightDest, locale: Locale): string {
  switch (locale) {
    case "ar":
      return dest.nameAr;
    case "tr":
      return dest.nameTr;
    case "en":
      return dest.nameEn;
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}

export function destSectionTitleKey(
  code: TurkeyFlightDestCode
): "flightDealsToIstanbul" | "flightDealsToTrabzon" {
  switch (code) {
    case "IST":
      return "flightDealsToIstanbul";
    case "TZX":
      return "flightDealsToTrabzon";
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}
