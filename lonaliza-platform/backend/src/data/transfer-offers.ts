import { PHOTO } from "@/data/catalog-photos";

export type TransferOffer = {
  id: string;
  from: string;
  to: string;
  fromIata?: string;
  toIata?: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  routeAr: string;
  routeEn: string;
  routeTr: string;
  taglineAr: string;
  taglineEn: string;
  taglineTr: string;
  image: string;
  /** Marketing price-from in USD per vehicle. */
  priceFromUsd: number;
};

/**
 * Popular Turkey airport ↔ hotel pairs.
 * `from` / `to` are English Intui constructor labels (widget locale=en).
 */
export const TRANSFER_OFFERS: TransferOffer[] = [
  {
    id: "ist-taksim",
    from: "Istanbul Airport",
    to: "Taksim",
    fromIata: "IST",
    titleAr: "مطار إسطنبول → تقسيم",
    titleEn: "Istanbul Airport → Taksim",
    titleTr: "İstanbul Havalimanı → Taksim",
    routeAr: "IST → وسط المدينة",
    routeEn: "IST → city center",
    routeTr: "IST → şehir merkezi",
    taglineAr: "من المطار الجديد إلى قلب إسطنبول الأوروبية",
    taglineEn: "New airport to the heart of European Istanbul",
    taglineTr: "Yeni havalimanından Avrupa yakasının kalbine",
    image: PHOTO.istanbulSkyline,
    priceFromUsd: 35,
  },
  {
    id: "taksim-ist",
    from: "Taksim",
    to: "Istanbul Airport",
    toIata: "IST",
    titleAr: "تقسيم → مطار إسطنبول",
    titleEn: "Taksim → Istanbul Airport",
    titleTr: "Taksim → İstanbul Havalimanı",
    routeAr: "فندق → IST",
    routeEn: "Hotel → IST",
    routeTr: "Otel → IST",
    taglineAr: "توصيل من الفندق إلى المطار في الوقت المحدد",
    taglineEn: "Hotel pickup timed for your departure",
    taglineTr: "Otelden kalkış saatinize göre transfer",
    image: PHOTO.nightCity,
    priceFromUsd: 35,
  },
  {
    id: "saw-kadikoy",
    from: "Sabiha Gokcen Airport",
    to: "Kadikoy",
    fromIata: "SAW",
    titleAr: "صبيحة → كاديكوي",
    titleEn: "Sabiha Gökçen → Kadıköy",
    titleTr: "Sabiha Gökçen → Kadıköy",
    routeAr: "SAW → الجانب الآسيوي",
    routeEn: "SAW → Asian side",
    routeTr: "SAW → Anadolu yakası",
    taglineAr: "من مطار صبيحة إلى كاديكوي والمدن الآسيوية",
    taglineEn: "SAW to Kadıköy and the Asian districts",
    taglineTr: "SAW’dan Kadıköy ve Anadolu semtlerine",
    image: PHOTO.bosphorus,
    priceFromUsd: 28,
  },
  {
    id: "ist-sultanahmet",
    from: "Istanbul Airport",
    to: "Sultanahmet",
    fromIata: "IST",
    titleAr: "مطار إسطنبول → السلطان أحمد",
    titleEn: "Istanbul Airport → Sultanahmet",
    titleTr: "İstanbul Havalimanı → Sultanahmet",
    routeAr: "IST → السلطان أحمد",
    routeEn: "IST → Sultanahmet",
    routeTr: "IST → Sultanahmet",
    taglineAr: "إلى الفنادق التاريخية قرب آيا صوفيا والجامع الأزرق",
    taglineEn: "Historic hotels by Hagia Sophia and the Blue Mosque",
    taglineTr: "Ayasofya ve Sultanahmet Camii otellerine",
    image: PHOTO.hagiaSophia,
    priceFromUsd: 38,
  },
  {
    id: "ayt-lara",
    from: "Antalya Airport",
    to: "Lara",
    fromIata: "AYT",
    titleAr: "مطار أنطاليا → لارا",
    titleEn: "Antalya Airport → Lara",
    titleTr: "Antalya Havalimanı → Lara",
    routeAr: "AYT → لارا",
    routeEn: "AYT → Lara",
    routeTr: "AYT → Lara",
    taglineAr: "من المطار إلى فنادق الشاطئ في لارا",
    taglineEn: "Airport to Lara beach hotels",
    taglineTr: "Havalimanından Lara sahil otellerine",
    image: PHOTO.antalyaCoast,
    priceFromUsd: 22,
  },
  {
    id: "ayt-belek",
    from: "Antalya Airport",
    to: "Belek",
    fromIata: "AYT",
    titleAr: "مطار أنطاليا → بيلك",
    titleEn: "Antalya Airport → Belek",
    titleTr: "Antalya Havalimanı → Belek",
    routeAr: "AYT → بيلك",
    routeEn: "AYT → Belek",
    routeTr: "AYT → Belek",
    taglineAr: "منتجعات الجولف والشواطئ شرق أنطاليا",
    taglineEn: "Golf and beach resorts east of Antalya",
    taglineTr: "Antalya’nın doğusunda golf ve sahil tesisleri",
    image: PHOTO.mediterraneanBeach,
    priceFromUsd: 26,
  },
  {
    id: "tzx-uzungol",
    from: "Trabzon Airport",
    to: "Uzungol",
    fromIata: "TZX",
    titleAr: "مطار طرابزون → أوزنجول",
    titleEn: "Trabzon Airport → Uzungöl",
    titleTr: "Trabzon Havalimanı → Uzungöl",
    routeAr: "TZX → أوزنجول",
    routeEn: "TZX → Uzungöl",
    routeTr: "TZX → Uzungöl",
    taglineAr: "من المطار إلى البحيرة والجبال في أوزنجول",
    taglineEn: "Airport to the lake and mountains of Uzungöl",
    taglineTr: "Havalimanından Uzungöl gölü ve dağlarına",
    image: PHOTO.alpineLake,
    priceFromUsd: 45,
  },
  {
    id: "bjv-bodrum",
    from: "Milas-Bodrum Airport",
    to: "Bodrum",
    fromIata: "BJV",
    titleAr: "مطار بودروم → المدينة",
    titleEn: "Bodrum Airport → city",
    titleTr: "Bodrum Havalimanı → şehir",
    routeAr: "BJV → بودروم",
    routeEn: "BJV → Bodrum",
    routeTr: "BJV → Bodrum",
    taglineAr: "من المطار إلى المارينا والبلدة القديمة",
    taglineEn: "Airport to the marina and old town",
    taglineTr: "Havalimanından marina ve çarşıya",
    image: PHOTO.yachtHarbor,
    priceFromUsd: 32,
  },
];

export const DEFAULT_TRANSFER_OFFER = TRANSFER_OFFERS[0];
