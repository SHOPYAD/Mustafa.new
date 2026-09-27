import { PHOTO } from "@/data/catalog-photos";
import type { TopicDestination } from "@/lib/automation/types";

export type DestinationPack = {
  id: TopicDestination;
  nameAr: string;
  nameEn: string;
  nameTr: string;
  photoQuery: string;
  catalogPhoto: string;
  holidayHref: string;
  packageSlugs: string[];
  keywords: string[];
};

export const DESTINATION_PACKS: Record<
  Exclude<TopicDestination, "visa" | "season" | "events" | "turkey">,
  DestinationPack
> = {
  istanbul: {
    id: "istanbul",
    nameAr: "إسطنبول",
    nameEn: "Istanbul",
    nameTr: "İstanbul",
    photoQuery: "Istanbul Hagia Sophia Turkey travel",
    catalogPhoto: PHOTO.istanbulSkyline || PHOTO.hagiaSophia,
    holidayHref: "/holidays/istanbul",
    packageSlugs: [
      "istanbul-classic-4-days",
      "istanbul-heritage-5-days",
      "istanbul-luxury-6-days",
      "istanbul-family-7-days",
      "istanbul-weekend-3-days",
    ],
    keywords: ["istanbul", "إسطنبول", "اسطنبول", "istanbul", "ayasofya", "bosphorus"],
  },
  antalya: {
    id: "antalya",
    nameAr: "أنطاليا",
    nameEn: "Antalya",
    nameTr: "Antalya",
    photoQuery: "Antalya beach Mediterranean Turkey",
    catalogPhoto: PHOTO.antalyaCoast,
    holidayHref: "/holidays/antalya",
    packageSlugs: [
      "antalya-beach-5-days",
      "antalya-beach-culture-7-days",
      "antalya-family-all-inclusive-8-days",
      "antalya-luxury-resort-6-days",
    ],
    keywords: ["antalya", "أنطاليا", "belek", "kemer", "side", "lara"],
  },
  trabzon: {
    id: "trabzon",
    nameAr: "طرابزون",
    nameEn: "Trabzon",
    nameTr: "Trabzon",
    photoQuery: "Trabzon Uzungol lake Turkey mountains",
    catalogPhoto: PHOTO.alpineLake,
    holidayHref: "/holidays/trabzon",
    packageSlugs: [
      "trabzon-uzungol-4-days",
      "trabzon-ayder-5-days",
      "trabzon-rize-highlands-6-days",
      "black-sea-family-7-days",
    ],
    keywords: ["trabzon", "طرابزون", "uzungol", "أوزونغول", "ayder", "rize"],
  },
  cappadocia: {
    id: "cappadocia",
    nameAr: "كابادوكيا",
    nameEn: "Cappadocia",
    nameTr: "Kapadokya",
    photoQuery: "Cappadocia hot air balloons Goreme",
    catalogPhoto: PHOTO.cappadociaBalloons,
    holidayHref: "/holidays/cappadocia",
    packageSlugs: [
      "cappadocia-classic-4-days",
      "cappadocia-balloon-5-days",
      "istanbul-cappadocia-classic-7-days",
      "cappadocia-luxury-cave-5-days",
    ],
    keywords: ["cappadocia", "كابادوكيا", "kapadokya", "goreme", "balloon"],
  },
  bursa: {
    id: "bursa",
    nameAr: "بورصة",
    nameEn: "Bursa",
    nameTr: "Bursa",
    photoQuery: "Bursa Uludag Turkey mosque",
    catalogPhoto: PHOTO.forest,
    holidayHref: "/holidays/bursa",
    packageSlugs: ["bursa-uludag-4-days", "bursa-thermal-5-days", "istanbul-bursa-5-days"],
    keywords: ["bursa", "بورصة", "uludag", "أولوداغ"],
  },
  sapanca: {
    id: "sapanca",
    nameAr: "سبانجا",
    nameEn: "Sapanca",
    nameTr: "Sapanca",
    photoQuery: "Sapanca lake Turkey nature",
    catalogPhoto: PHOTO.landscape,
    holidayHref: "/holidays/sapanca",
    packageSlugs: [
      "sapanca-lake-3-days",
      "sapanca-family-nature-4-days",
      "istanbul-sapanca-4-days",
    ],
    keywords: ["sapanca", "سبانجا", "masukiye", "معشوقية"],
  },
  bodrum: {
    id: "bodrum",
    nameAr: "بودروم",
    nameEn: "Bodrum",
    nameTr: "Bodrum",
    photoQuery: "Bodrum marina Aegean Turkey",
    catalogPhoto: PHOTO.yachtHarbor,
    holidayHref: "/holidays/bodrum",
    packageSlugs: ["bodrum-beach-5-days", "bodrum-luxury-6-days", "bodrum-ephesus-7-days"],
    keywords: ["bodrum", "بودروم"],
  },
  izmir: {
    id: "izmir",
    nameAr: "إزمير",
    nameEn: "Izmir",
    nameTr: "İzmir",
    photoQuery: "Izmir Konak Turkey Aegean",
    catalogPhoto: PHOTO.aegeanCoast,
    holidayHref: "/holidays/izmir",
    packageSlugs: ["izmir-ephesus-4-days", "izmir-cesme-5-days", "izmir-culture-5-days"],
    keywords: ["izmir", "إزمير", "ephesus", "çesme", "cesme"],
  },
};

export type EvergreenTopicSeed = {
  id: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  destination: TopicDestination;
  angle: string;
  queryAr: string;
  queryEn: string;
  baseInterest: number;
};

export const EVERGREEN_TOPICS: EvergreenTopicSeed[] = [
  {
    id: "istanbul-season-guide",
    titleAr: "أفضل وقت لزيارة إسطنبول: دليل المواسم للعائلات والأزواج",
    titleEn: "Best time to visit Istanbul: a seasonal guide",
    titleTr: "İstanbul’u ziyaret etmek için en iyi zaman",
    destination: "istanbul",
    angle: "seasons",
    queryAr: "أفضل وقت للسفر إلى إسطنبول",
    queryEn: "best time to visit Istanbul",
    baseInterest: 88,
  },
  {
    id: "antalya-summer",
    titleAr: "أنطاليا في الصيف: شواطئ، منتجعات، وكيف تختار البرنامج المناسب",
    titleEn: "Antalya in summer: beaches, resorts, and the right program",
    titleTr: "Yazın Antalya: plajlar ve tatil programı",
    destination: "antalya",
    angle: "beach",
    queryAr: "سياحة أنطاليا صيف",
    queryEn: "Antalya summer holiday",
    baseInterest: 84,
  },
  {
    id: "trabzon-nature",
    titleAr: "طرابزون وأوزونغول: طبيعة البحر الأسود للعائلات الخليجية",
    titleEn: "Trabzon and Uzungöl: Black Sea nature for families",
    titleTr: "Trabzon ve Uzungöl doğa tatili",
    destination: "trabzon",
    angle: "nature",
    queryAr: "سياحة طرابزون أوزونغول",
    queryEn: "Trabzon Uzungol travel",
    baseInterest: 82,
  },
  {
    id: "cappadocia-balloons",
    titleAr: "كابادوكيا ومنطاد الفجر: كيف تخطط الرحلة دون مفاجآت",
    titleEn: "Cappadocia sunrise balloons: how to plan the trip",
    titleTr: "Kapadokya balon turu planı",
    destination: "cappadocia",
    angle: "balloons",
    queryAr: "منطاد كابادوكيا",
    queryEn: "Cappadocia hot air balloon",
    baseInterest: 90,
  },
  {
    id: "turkey-visa-gcc",
    titleAr: "تأشيرة تركيا للمسافرين من الخليج: ما الذي تتحقق منه قبل الحجز",
    titleEn: "Turkey visa for GCC travelers: what to check before booking",
    titleTr: "Körfez’den Türkiye vizesi: rezervasyon öncesi kontrol",
    destination: "visa",
    angle: "visa",
    queryAr: "تأشيرة تركيا للسعودية",
    queryEn: "Turkey visa Saudi Arabia",
    baseInterest: 86,
  },
  {
    id: "istanbul-cappadocia-combo",
    titleAr: "برنامج إسطنبول وكابادوكيا: كم يوماً يكفي وكيف تقسّم الرحلة",
    titleEn: "Istanbul and Cappadocia combo: how many days you need",
    titleTr: "İstanbul + Kapadokya kaç gün sürer",
    destination: "cappadocia",
    angle: "combo",
    queryAr: "برنامج إسطنبول كابادوكيا",
    queryEn: "Istanbul Cappadocia itinerary",
    baseInterest: 80,
  },
  {
    id: "turkey-seasons",
    titleAr: "مواسم السياحة في تركيا: متى تذهب للبحر ومتى للجبال",
    titleEn: "Turkey travel seasons: sea vs highlands",
    titleTr: "Türkiye’de seyahat mevsimleri",
    destination: "season",
    angle: "seasons",
    queryAr: "أفضل موسم للسياحة في تركيا",
    queryEn: "best season to visit Turkey",
    baseInterest: 78,
  },
  {
    id: "bursa-uludag",
    titleAr: "بورصة وأولوداغ: رحلة قريبة من إسطنبول بين التاريخ والجبل",
    titleEn: "Bursa and Uludağ: a short trip from Istanbul",
    titleTr: "Bursa ve Uludağ İstanbul’a yakın kaçamak",
    destination: "bursa",
    angle: "short-trip",
    queryAr: "رحلة بورصة من إسطنبول",
    queryEn: "Bursa day trip from Istanbul",
    baseInterest: 70,
  },
];

export function inferDestination(text: string): TopicDestination {
  const hay = text.toLowerCase();
  const cityEntries = Object.values(DESTINATION_PACKS);
  for (const pack of cityEntries) {
    if (pack.keywords.some((k) => hay.includes(k.toLowerCase()))) {
      return pack.id;
    }
  }
  if (/visa|تأشير|vize/.test(hay)) return "visa";
  if (/festival|event|مهرجان|etkinlik|bayram/.test(hay)) return "events";
  if (/موسم|season|yaz|kış|صيف|شتاء|ربيع|خريف/.test(hay)) return "season";
  return "turkey";
}

export function packFor(destination: TopicDestination): DestinationPack | null {
  switch (destination) {
    case "istanbul":
    case "antalya":
    case "trabzon":
    case "cappadocia":
    case "bursa":
    case "sapanca":
    case "bodrum":
    case "izmir":
      return DESTINATION_PACKS[destination];
    case "visa":
    case "season":
    case "events":
    case "turkey":
      return DESTINATION_PACKS.istanbul;
    default: {
      const _never: never = destination;
      return _never;
    }
  }
}
