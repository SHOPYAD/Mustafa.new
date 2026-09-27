/**
 * Universal Destination & Country Intelligence Engine (Admin Panel)
 */

export interface DestinationMetadata {
  cityEn: string;
  cityAr: string;
  cityTr?: string;
  countryEn: string;
  countryAr: string;
  countryTr?: string;
  destAr: string;
  destEn: string;
  destTr?: string;
  coverUrl: string;
  lat: number;
  lng: number;
  currency: string;
}

export function resolveDestinationMeta(destinationRaw?: string): DestinationMetadata {
  const norm = String(destinationRaw || "").trim().toLowerCase();

  // Morocco / Marrakech
  if (
    /marrakech|marrakesh|مراكش|morocco|المغرب|casablanca|كازابلانكا|الدار البيضاء|tangier|طنجة|rabat|الرباط|agadir|أكادير|fes|فاس/i.test(
      norm
    )
  ) {
    return {
      cityEn: "Marrakech",
      cityAr: "مراكش",
      cityTr: "Marakeş",
      countryEn: "Morocco",
      countryAr: "المغرب",
      countryTr: "Fas",
      destAr: "مراكش، المغرب",
      destEn: "Marrakech, Morocco",
      destTr: "Marakeş, Fas",
      coverUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200",
      lat: 31.6295,
      lng: -7.9811,
      currency: "MAD",
    };
  }

  // Turkey
  if (
    /istanbul|إسطنبول|اسطنبول|turkey|تركيا|bursa|بورصة|trabzon|طرابزون|antalya|أنطاليا|انطاليا|سبانجا|sapanca|cappadocia|كابادوكيا/i.test(
      norm
    )
  ) {
    const isTrabzon = /trabzon|طرابزون/i.test(norm);
    return {
      cityEn: isTrabzon ? "Trabzon" : "Istanbul",
      cityAr: isTrabzon ? "طرابزون" : "إسطنبول",
      cityTr: isTrabzon ? "Trabzon" : "İstanbul",
      countryEn: "Turkey",
      countryAr: "تركيا",
      countryTr: "Türkiye",
      destAr: isTrabzon ? "طرابزون، تركيا" : "إسطنبول، تركيا",
      destEn: isTrabzon ? "Trabzon, Turkey" : "Istanbul, Turkey",
      destTr: isTrabzon ? "Trabzon, Türkiye" : "İstanbul, Türkiye",
      coverUrl: isTrabzon
        ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200"
        : "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
      lat: isTrabzon ? 41.0027 : 41.0082,
      lng: isTrabzon ? 39.7168 : 28.9784,
      currency: "TRY",
    };
  }

  // UAE / Dubai
  if (/dubai|دبي|uae|الإمارات|الامارات|abu dhabi|أبوظبي/i.test(norm)) {
    return {
      cityEn: "Dubai",
      cityAr: "دبي",
      cityTr: "Dubai",
      countryEn: "United Arab Emirates",
      countryAr: "الإمارات",
      countryTr: "Birleşik Arap Emirlikleri",
      destAr: "دبي، الإمارات",
      destEn: "Dubai, UAE",
      destTr: "Dubai, BAE",
      coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
      lat: 25.2048,
      lng: 55.2708,
      currency: "AED",
    };
  }

  // Egypt / Cairo
  if (/cairo|القاهرة|قاهرة|egypt|مصر|giza|الجيزة|alexandria|الإسكندرية|hurghada|الغردقة|sharm|شرم الشيخ/i.test(norm)) {
    return {
      cityEn: "Cairo",
      cityAr: "القاهرة",
      cityTr: "Kahire",
      countryEn: "Egypt",
      countryAr: "مصر",
      countryTr: "Mısır",
      destAr: "القاهرة، مصر",
      destEn: "Cairo, Egypt",
      destTr: "Kahire, Mısır",
      coverUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200",
      lat: 30.0444,
      lng: 31.2357,
      currency: "EGP",
    };
  }

  const cleanName = destinationRaw ? destinationRaw.trim() : "وجهة سياحية فاخرة";
  return {
    cityEn: cleanName,
    cityAr: cleanName,
    cityTr: cleanName,
    countryEn: "International",
    countryAr: "دولي",
    countryTr: "Uluslararası",
    destAr: cleanName,
    destEn: cleanName,
    destTr: cleanName,
    coverUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200",
    lat: 31.6295,
    lng: -7.9811,
    currency: "USD",
  };
}
