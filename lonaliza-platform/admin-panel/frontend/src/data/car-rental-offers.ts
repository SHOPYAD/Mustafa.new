import { PHOTO } from "@/data/catalog-photos";

export type CarRentalOffer = {
  id: string;
  iata: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  cityAr: string;
  cityEn: string;
  cityTr: string;
  taglineAr: string;
  taglineEn: string;
  taglineTr: string;
  image: string;
  /** Marketing price-from in USD per day. */
  priceFromUsd: number;
};

export const CAR_RENTAL_OFFERS: CarRentalOffer[] = [
  {
    id: "ist",
    iata: "IST",
    titleAr: "مطار إسطنبول",
    titleEn: "Istanbul Airport",
    titleTr: "İstanbul Havalimanı",
    cityAr: "إسطنبول",
    cityEn: "Istanbul",
    cityTr: "İstanbul",
    taglineAr: "استلم سيارتك عند الوصول — اقتصادي أو سيدان فاخرة",
    taglineEn: "Pick up at arrivals — economy or a luxury sedan",
    taglineTr: "Varışta teslim — ekonomik veya lüks sedan",
    image: PHOTO.luxurySedan,
    priceFromUsd: 19,
  },
  {
    id: "saw",
    iata: "SAW",
    titleAr: "مطار صبيحة كوكجن",
    titleEn: "Sabiha Gökçen Airport",
    titleTr: "Sabiha Gökçen Havalimanı",
    cityAr: "إسطنبول الآسيوية",
    cityEn: "Asian Istanbul",
    cityTr: "Anadolu yakası",
    taglineAr: "أسعار مناسبة للرحلات الداخلية والاقتصادية",
    taglineEn: "Smart rates for domestic and budget flights",
    taglineTr: "İç hat ve ekonomik uçuşlar için uygun fiyat",
    image: PHOTO.carInterior,
    priceFromUsd: 16,
  },
  {
    id: "ayt",
    iata: "AYT",
    titleAr: "مطار أنطاليا",
    titleEn: "Antalya Airport",
    titleTr: "Antalya Havalimanı",
    cityAr: "الساحل التركي",
    cityEn: "Turkish Riviera",
    cityTr: "Türk Rivierası",
    taglineAr: "انطلق من المطار إلى لارا، كونيالتي أو بيلك",
    taglineEn: "Drive from the airport to Lara, Konyaaltı, or Belek",
    taglineTr: "Havalimanından Lara, Konyaaltı veya Belek’e",
    image: PHOTO.suv,
    priceFromUsd: 21,
  },
  {
    id: "tzx",
    iata: "TZX",
    titleAr: "مطار طرابزون",
    titleEn: "Trabzon Airport",
    titleTr: "Trabzon Havalimanı",
    cityAr: "البحر الأسود",
    cityEn: "Black Sea",
    cityTr: "Karadeniz",
    taglineAr: "جولات أوزنجول وآيدر بسيارتك الخاصة",
    taglineEn: "Uzungöl and Ayder on your own schedule",
    taglineTr: "Uzungöl ve Ayder’i kendi aracınızla",
    image: PHOTO.bmw,
    priceFromUsd: 24,
  },
  {
    id: "bjv",
    iata: "BJV",
    titleAr: "مطار بودروم",
    titleEn: "Milas–Bodrum Airport",
    titleTr: "Milas-Bodrum Havalimanı",
    cityAr: "بودروم",
    cityEn: "Bodrum",
    cityTr: "Bodrum",
    taglineAr: "من المطار إلى المارينا والشواطئ في أقل من ساعة",
    taglineEn: "Airport to the marina and beaches in under an hour",
    taglineTr: "Havalimanından marina ve plajlara bir saatten az",
    image: PHOTO.mercedesSedan,
    priceFromUsd: 26,
  },
  {
    id: "adb",
    iata: "ADB",
    titleAr: "مطار إزمير",
    titleEn: "Izmir Adnan Menderes",
    titleTr: "İzmir Adnan Menderes",
    cityAr: "إزمير",
    cityEn: "Izmir",
    cityTr: "İzmir",
    taglineAr: "تشيشمه، كوش أداسي ووسط المدينة بأسعار يومية واضحة",
    taglineEn: "Çeşme, Kuşadası, and the city — clear daily rates",
    taglineTr: "Çeşme, Kuşadası ve şehir — net günlük fiyat",
    image: PHOTO.sprinter,
    priceFromUsd: 20,
  },
  {
    id: "dlm",
    iata: "DLM",
    titleAr: "مطار دالامان",
    titleEn: "Dalaman Airport",
    titleTr: "Dalaman Havalimanı",
    cityAr: "فتحية ومرمريس",
    cityEn: "Fethiye & Marmaris",
    cityTr: "Fethiye ve Marmaris",
    taglineAr: "بوابة الساحل الجنوبي — أولودينيز ومرمريس",
    taglineEn: "South-coast gateway — Ölüdeniz and Marmaris",
    taglineTr: "Güney sahil kapısı — Ölüdeniz ve Marmaris",
    image:
      "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&q=80",
    priceFromUsd: 23,
  },
  {
    id: "nav",
    iata: "NAV",
    titleAr: "مطار كابادوكيا",
    titleEn: "Cappadocia Airport",
    titleTr: "Kapadokya Havalimanı",
    cityAr: "كابادوكيا",
    cityEn: "Cappadocia",
    cityTr: "Kapadokya",
    taglineAr: "تنقّل بين غوريم وأورغوب بسيارتك",
    taglineEn: "Move between Göreme and Ürgüp in your own car",
    taglineTr: "Göreme ve Ürgüp arasında kendi aracınızla",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
    priceFromUsd: 25,
  },
];
