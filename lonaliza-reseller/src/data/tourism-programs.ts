import { PHOTO, photos } from "@/data/catalog-photos";
import { samplePackageReviews } from "@/data/sample-reviews";
import type {
  HolidayPackage,
  ImageAsset,
  ItineraryDay,
  PackageTheme,
  TripMode,
} from "@/types/package";

type L3 = { ar: string; en: string; tr: string };

type DayInput = {
  title: L3;
  desc: L3;
  lat?: number;
  lng?: number;
};

const COUNTRY: L3 = { ar: "تركيا", en: "Turkey", tr: "Türkiye" };

const STD_IN: L3[] = [
  { ar: "إقامة فندقية حسب الليالي المحددة", en: "Hotel stay for the listed nights", tr: "Belirtilen geceler otel konaklaması" },
  { ar: "إفطار يومي", en: "Daily breakfast", tr: "Günlük kahvaltı" },
  { ar: "استقبال وتوديع المطار بسيارة خاصة", en: "Private airport meet-and-greet", tr: "Havalimanında özel karşılama" },
  { ar: "تنقلات البرنامج بسيارة خاصة مع سائق", en: "Program transfers in a private car with driver", tr: "Program transferleri özel araçla" },
  { ar: "مرشد ناطق بالعربية في الجولات المدرجة", en: "Arabic-speaking guide on scheduled tours", tr: "Planlı turlarda Arapça rehber" },
  { ar: "دعم واتساب طوال الرحلة", en: "WhatsApp support throughout the trip", tr: "Seyahat boyunca WhatsApp desteği" },
];

const STD_EX: L3[] = [
  { ar: "تذاكر الطيران الدولية", en: "International flights", tr: "Uluslararası uçak biletleri" },
  { ar: "رسوم التأشيرة", en: "Visa fees", tr: "Vize ücretleri" },
  { ar: "وجبات الغداء والعشاء إلا إذا ذُكرت", en: "Lunch and dinner unless stated", tr: "Belirtilmedikçe öğle ve akşam yemeği" },
  { ar: "تذاكر دخول المعالم إلا إذا ذُكرت", en: "Attraction tickets unless stated", tr: "Belirtilmedikçe müze girişleri" },
  { ar: "المصاريف الشخصية والبقشيش", en: "Personal expenses and tips", tr: "Kişisel harcamalar ve bahşiş" },
];

const AMENITIES: L3[] = [
  { ar: "فندق مختار", en: "Selected hotel", tr: "Seçili otel" },
  { ar: "ترانسفير خاص", en: "Private transfer", tr: "Özel transfer" },
  { ar: "إفطار", en: "Breakfast", tr: "Kahvaltı" },
];

function loc(ar: string, en: string, tr: string): L3 {
  return { ar, en, tr };
}

function day(title: L3, desc: L3, lat?: number, lng?: number): DayInput {
  return { title, desc, lat, lng };
}

function itineraryOf(items: DayInput[], locale: keyof L3): ItineraryDay[] {
  return items.map((item, index) => ({
    day: index + 1,
    title: item.title[locale],
    description: item.desc[locale],
    lat: item.lat,
    lng: item.lng,
  }));
}

function defineProgram(opts: {
  id: string;
  slug: string;
  title: L3;
  destination: L3;
  destinations?: L3[];
  days: number;
  price: number;
  rating?: number;
  featured?: boolean;
  theme?: PackageTheme;
  tripMode?: TripMode;
  images: ImageAsset[];
  overview: L3;
  itinerary: DayInput[];
  includes?: L3[];
  excludes?: L3[];
  amenities?: L3[];
  lat: number;
  lng: number;
  groupMin?: number;
  groupMax?: number;
}): HolidayPackage {
  const nights = Math.max(1, opts.days - 1);
  const destList = opts.destinations ?? [opts.destination];
  const includes = opts.includes ?? STD_IN;
  const excludes = opts.excludes ?? STD_EX;
  const amenities = opts.amenities ?? AMENITIES;
  const itinerary = opts.itinerary.slice(0, opts.days).map((item, index, arr) => {
    const isEdge = index === 0 || index === arr.length - 1;
    if (isEdge) {
      return {
        ...item,
        desc: loc(
          `${item.desc.ar} يؤكد فريق الريان توقيت السيارة عبر واتساب قبل الموعد، ويبقى المندوب معكم حتى استقرار الأمتعة في الفندق أو صالة المغادرة.`,
          `${item.desc.en} Alrayyan confirms the car timing on WhatsApp beforehand, and the driver stays with you until bags are in the hotel or the departure hall.`,
          `${item.desc.tr} Alrayyan alış saatini WhatsApp ile önceden teyit eder; şoför otelde veya gidiş salonunda bagaj yerleşene kadar sizinle kalır.`
        ),
      };
    }
    return {
      ...item,
      desc: loc(
        `${item.desc.ar} نتحرك بسيارة خاصة مع السائق، مع توقفات تصوير واستراحة غداء حرّة في مطعم محلي حسب اختياركم. يمكن تقديم أو تأخير محطة ضمن ساعات اليوم المتفق عليها، دون تحويل اليوم إلى جولة حافلة عامة.`,
        `${item.desc.en} You move in a private car with a driver, with photo stops and a free lunch window at a local restaurant you choose. Stops can be brought forward or delayed within the booked hours — this is not a public coach tour.`,
        `${item.desc.tr} Özel araç ve şoförle ilerlersiniz; fotoğraf molaları ve seçtiğiniz yerel restoranda serbest öğle arası vardır. Duraklar rezerve saatler içinde kaydırılabilir — bu bir halk otobüsü turu değildir.`
      ),
    };
  });

  const overview = loc(
    `${opts.overview.ar}\n\nهذا برنامج سياحي متعدد الأيام من الريان للسياحة داخل تركيا: إقامة فندقية بعدد الليالي المحدد، إفطار يومي، واستقبال المطار بسيارة خاصة. ليس بطاقة فندق منفردة وليس جولة يوم واحد. الأسعار بالدولار للشخص تقريبية وقابلة للتخصيص عبر واتساب حسب تواريخكم وعدد النجوم.`,
    `${opts.overview.en}\n\nThis is a multi-day Turkey program from Alrayyan Tourism: hotel nights as listed, daily breakfast, and a private airport meet-and-greet. It is not a hotel-only card and not a single day tour. USD prices are per person, approximate, and can be tailored on WhatsApp by dates and hotel class.`,
    `${opts.overview.tr}\n\nBu, Alrayyan Turizm’in Türkiye’deki çok günlük programıdır: belirtilen gece otel, günlük kahvaltı ve havalimanında özel karşılama. Tek otel kartı veya tek günlük tur değildir. USD kişi başı fiyatlar yaklaşıktır; tarih ve otel sınıfına göre WhatsApp’tan özelleştirilir.`
  );

  return {
    id: opts.id,
    slug: opts.slug,
    title: opts.title.en,
    titleAr: opts.title.ar,
    titleEn: opts.title.en,
    titleTr: opts.title.tr,
    destination: opts.destination.en,
    destinationAr: opts.destination.ar,
    destinationEn: opts.destination.en,
    destinationTr: opts.destination.tr,
    country: COUNTRY.en,
    countryAr: COUNTRY.ar,
    countryEn: COUNTRY.en,
    countryTr: COUNTRY.tr,
    destinations: destList.map((d) => d.en),
    destinationsAr: destList.map((d) => d.ar),
    destinationsEn: destList.map((d) => d.en),
    destinationsTr: destList.map((d) => d.tr),
    durationDays: opts.days,
    durationNights: nights,
    price: opts.price,
    currency: "USD",
    rating: opts.rating ?? 4.8,
    images: opts.images.map((img, i) => ({
      ...img,
      alt: `${opts.title.en} ${i + 1}`,
    })),
    amenities: amenities.map((a) => a.en),
    amenitiesAr: amenities.map((a) => a.ar),
    amenitiesTr: amenities.map((a) => a.tr),
    isFeatured: Boolean(opts.featured),
    theme: opts.theme ?? "classic",
    description: overview.en,
    descriptionAr: overview.ar,
    descriptionEn: overview.en,
    descriptionTr: overview.tr,
    inclusions: includes.map((x) => x.en),
    inclusionsAr: includes.map((x) => x.ar),
    inclusionsEn: includes.map((x) => x.en),
    inclusionsTr: includes.map((x) => x.tr),
    exclusions: excludes.map((x) => x.en),
    exclusionsAr: excludes.map((x) => x.ar),
    exclusionsEn: excludes.map((x) => x.en),
    exclusionsTr: excludes.map((x) => x.tr),
    itinerary: itineraryOf(itinerary, "en"),
    itineraryAr: itineraryOf(itinerary, "ar"),
    itineraryEn: itineraryOf(itinerary, "en"),
    itineraryTr: itineraryOf(itinerary, "tr"),
    reviews: samplePackageReviews(opts.id, 12),
    tripMode: opts.tripMode ?? "private_vip",
    groupSizeMin: opts.groupMin ?? 2,
    groupSizeMax: opts.groupMax ?? 8,
    lat: opts.lat,
    lng: opts.lng,
  };
}

const IST = loc("إسطنبول", "Istanbul", "İstanbul");
const ANT = loc("أنطاليا", "Antalya", "Antalya");
const CAP = loc("كابادوكيا", "Cappadocia", "Kapadokya");
const TRB = loc("طرابزون", "Trabzon", "Trabzon");
const BUR = loc("بورصة", "Bursa", "Bursa");
const SAP = loc("سبانجا", "Sapanca", "Sapanca");
const BOD = loc("بودروم", "Bodrum", "Bodrum");
const IZM = loc("إزمير", "Izmir", "İzmir");
const PAM = loc("باموكالي", "Pamukkale", "Pamukkale");
const ANK = loc("أنقرة", "Ankara", "Ankara");
const GAZ = loc("غازي عنتاب", "Gaziantep", "Gaziantep");
const FET = loc("فتحية", "Fethiye", "Fethiye");
const KON = loc("قونية", "Konya", "Konya");
const AYD = loc("آيدر", "Ayder", "Ayder");

function arrival(city: L3, hotelNote: L3, lat: number, lng: number): DayInput {
  return day(
    loc(`وصول ${city.ar}`, `Arrival in ${city.en}`, `${city.tr} varışı`),
    loc(
      `استقبال من المطار والانتقال إلى الفندق. ${hotelNote.ar} بقية اليوم حرة للراحة أو نزهة قصيرة في الحي.`,
      `Airport meet-and-greet and hotel transfer. ${hotelNote.en} The rest of the day is free to rest or take a short neighborhood walk.`,
      `Havalimanı karşılama ve otele transfer. ${hotelNote.tr} Günün kalanı dinlenme veya kısa bir mahalle yürüyüşü için serbest.`
    ),
    lat,
    lng
  );
}

function departure(city: L3, lat: number, lng: number): DayInput {
  return day(
    loc(`مغادرة ${city.ar}`, `Departure from ${city.en}`, `${city.tr} çıkışı`),
    loc(
      `إفطار في الفندق ثم ترانسفير خاص إلى المطار حسب توقيت الرحلة.`,
      `Hotel breakfast then a private transfer to the airport according to your flight time.`,
      `Otel kahvaltısı sonrası uçuş saatinize göre havalimanına özel transfer.`
    ),
    lat,
    lng
  );
}

export const tourismPrograms: HolidayPackage[] = [
  defineProgram({
    id: "tp-01",
    slug: "istanbul-classic-4-days",
    title: loc("إسطنبول الكلاسيكية — 4 أيام", "Classic Istanbul — 4 Days", "Klasik İstanbul — 4 Gün"),
    destination: IST,
    days: 4,
    price: 449,
    featured: true,
    images: photos(PHOTO.hagiaSophia, PHOTO.blueMosque, PHOTO.istanbulSkyline, PHOTO.grandBazaar, PHOTO.luxuryHotel),
    overview: loc(
      "أربعة أيام في قلب إسطنبول: شبه الجزيرة التاريخية، البوسفور، والأسواق. إقامة مركزية وترانسفير خاص — برنامج سياحي متعدد الأيام وليس بطاقة فندق فقط.",
      "Four days in central Istanbul: the historic peninsula, the Bosphorus, and the bazaars. A central stay and private transfers — a real multi-day program, not a hotel-only card.",
      "İstanbul’un merkezinde dört gün: tarihi yarımada, Boğaz ve çarşılar. Merkezi konaklama ve özel transfer — yalnızca otel kartı değil, gerçek bir program."
    ),
    itinerary: [
      arrival(IST, loc("الفندق في سلطان أحمت أو تقسيم.", "Hotel in Sultanahmet or Taksim.", "Otel Sultanahmet veya Taksim’de."), 41.0082, 28.9784),
      day(loc("السلطان أحمد وآيا صوفيا", "Sultanahmet & Hagia Sophia", "Sultanahmet ve Ayasofya"), loc("زيارة آيا صوفيا والمسجد الأزرق وساحة السلطان أحمد مع وقت حر في الحي.", "Visit Hagia Sophia, the Blue Mosque, and Sultanahmet Square with free time nearby.", "Ayasofya, Sultanahmet Camii ve meydan ziyareti; civarda serbest zaman."), 41.0086, 28.9802),
      day(loc("البوسفور والبازار", "Bosphorus & Bazaar", "Boğaz ve Çarşı"), loc("جولة على مضيق البوسفور ثم السوق الكبير ومصر.", "Bosphorus waterfront circuit then the Grand Bazaar and Spice Market.", "Boğaz güzergâhı, ardından Kapalıçarşı ve Mısır Çarşısı."), 41.0256, 28.9744),
      departure(IST, 41.2753, 28.7519),
    ],
    lat: 41.0082,
    lng: 28.9784,
  }),
  defineProgram({
    id: "tp-02",
    slug: "istanbul-heritage-5-days",
    title: loc("إسطنبول التراثية — 5 أيام", "Istanbul Heritage — 5 Days", "İstanbul Mirası — 5 Gün"),
    destination: IST,
    days: 5,
    price: 599,
    featured: true,
    images: photos(PHOTO.blueMosque, PHOTO.hagiaSophia, PHOTO.mosqueInterior, PHOTO.bosphorus, PHOTO.hotelRoom),
    overview: loc(
      "خمسة أيام لإيقاع أهدأ: قصر توبكابي، آيا إيريني، غلطة، وجانب آسيوي قصير دون استعجال.",
      "Five days at a calmer pace: Topkapi, Hagia Irene, Galata, and a short Asian-side visit without rushing.",
      "Daha sakin beş gün: Topkapı, Aya İrini, Galata ve kısa bir Anadolu yakası ziyareti."
    ),
    itinerary: [
      arrival(IST, loc("إقامة قرب السلطان أحمد.", "Stay near Sultanahmet.", "Sultanahmet civarı konaklama."), 41.0082, 28.9784),
      day(loc("توبكابي وآيا صوفيا", "Topkapi & Hagia Sophia", "Topkapı ve Ayasofya"), loc("قصر توبكابي وحدائقه ثم آيا صوفيا.", "Topkapi Palace and gardens, then Hagia Sophia.", "Topkapı Sarayı ve bahçeleri, ardından Ayasofya."), 41.0115, 28.9833),
      day(loc("غلطة وكاراتشوي", "Galata & Karaköy", "Galata ve Karaköy"), loc("برج غلطة وجسر الغلاطة ومقاهي كاراتشوي.", "Galata Tower, the bridge, and Karaköy cafes.", "Galata Kulesi, köprü ve Karaköy kahveleri."), 41.0256, 28.9744),
      day(loc("أسكودار وأورتاكوي", "Üsküdar & Ortaköy", "Üsküdar ve Ortaköy"), loc("عبور إلى الجانب الآسيوي ثم أورتاكوي على البوسفور.", "Cross to the Asian side then Ortaköy on the Bosphorus.", "Anadolu yakasına geçiş, ardından Boğaz’da Ortaköy."), 41.0214, 29.0152),
      departure(IST, 41.2753, 28.7519),
    ],
    lat: 41.0082,
    lng: 28.9784,
  }),
  defineProgram({
    id: "tp-03",
    slug: "istanbul-luxury-6-days",
    title: loc("إسطنبول الفاخرة — 6 أيام", "Luxury Istanbul — 6 Days", "Lüks İstanbul — 6 Gün"),
    destination: IST,
    days: 6,
    price: 899,
    theme: "luxury",
    featured: true,
    images: photos(PHOTO.luxuryHotel, PHOTO.hotelPool, PHOTO.bosphorus, PHOTO.hagiaSophia, PHOTO.hotelLobby),
    overview: loc(
      "ستة أيام بإقامة فاخرة على البوسفور أو في بيشكتاش: جولات خاصة، وتيرة هادئة، ووقت حر للسبا.",
      "Six days in a luxury Bosphorus or Beşiktaş stay: private tours, a slower pace, and spa time.",
      "Boğaz veya Beşiktaş’ta lüks altı gün: özel turlar, yavaş tempo ve spa zamanı."
    ),
    itinerary: [
      arrival(IST, loc("فندق 5 نجوم على البوسفور.", "Five-star hotel on the Bosphorus.", "Boğaz’da 5 yıldızlı otel."), 41.043, 29.007),
      day(loc("شبه الجزيرة الخاصة", "Private historic peninsula", "Özel tarihi yarımada"), loc("جولات صباحية مبكرة لتجنب الازدحام.", "Early-morning visits to avoid crowds.", "Kalabalıktan kaçınmak için erken ziyaretler."), 41.0086, 28.9802),
      day(loc("دولمابهتشه وأورتاكوي", "Dolmabahçe & Ortaköy", "Dolmabahçe ve Ortaköy"), loc("قصر دولمابهتشه ثم غداء على المضيق.", "Dolmabahçe Palace then lunch on the strait.", "Dolmabahçe Sarayı, ardından Boğaz’da öğle yemeği."), 41.0391, 29.0002),
      day(loc("يوم سبا حر", "Spa free day", "Spa serbest günü"), loc("صباح حر في الفندق وخيار رحلة قصيرة إلى جزر الأميرات.", "Hotel morning plus optional short Princes’ Islands outing.", "Otelde serbest sabah; isteğe Prens Adaları."), 40.874, 29.093),
      day(loc("الأسواق والجانب الآسيوي", "Markets & Asian side", "Çarşılar ve Anadolu"), loc("بازار التوابل ثم كاديكوي ومودا.", "Spice Market then Kadıköy and Moda.", "Mısır Çarşısı, ardından Kadıköy ve Moda."), 40.9889, 29.0256),
      departure(IST, 41.2753, 28.7519),
    ],
    lat: 41.043,
    lng: 29.007,
  }),
  defineProgram({
    id: "tp-04",
    slug: "istanbul-family-7-days",
    title: loc("إسطنبول العائلية — 7 أيام", "Istanbul Family Week — 7 Days", "Ailece İstanbul — 7 Gün"),
    destination: IST,
    days: 7,
    price: 749,
    theme: "family",
    images: photos(PHOTO.istanbulSkyline, PHOTO.hotelRoom, PHOTO.bosphorus, PHOTO.forest, PHOTO.breakfast),
    overview: loc(
      "أسبوع عائلي بإيقاع خفيف: معالم الصباح، حدائق، ويوم طبيعة قصير إلى سبانجا دون إجهاد الأطفال.",
      "A gentle family week: morning sights, parks, and a short Sapanca nature day without tiring the children.",
      "Sakin bir aile haftası: sabah gezileri, parklar ve çocukları yormayan kısa Sapanca günü."
    ),
    itinerary: [
      arrival(IST, loc("غرف عائلية قرب تقسيم.", "Family rooms near Taksim.", "Taksim yakınında aile odaları."), 41.037, 28.985),
      day(loc("السلطان أحمد للأطفال", "Sultanahmet with kids", "Çocuklarla Sultanahmet"), loc("معالم قصيرة مع استراحات متكررة.", "Short landmark visits with frequent breaks.", "Sık molalı kısa ziyaretler."), 41.0054, 28.9768),
      day(loc("حديقة يلدز والبوسفور", "Yıldız Park & Bosphorus", "Yıldız Parkı ve Boğaz"), loc("نزهة حدائق ومشاهدة المضيق.", "Park walk and Bosphorus views.", "Park yürüyüşü ve Boğaz manzarası."), 41.048, 29.015),
      day(loc("يوم حر في الفندق", "Hotel free day", "Otel serbest günü"), loc("راحة أو مول قريب حسب رغبة العائلة.", "Rest or a nearby mall, as the family prefers.", "Dinlenme veya yakındaki AVM."), 41.037, 28.985),
      day(loc("سبانجا والمعشوقية", "Sapanca & Maşukiye", "Sapanca ve Maşukiye"), loc("يوم طبيعة: بحيرة وشلال وعودة مساءً.", "Nature day: lake, waterfall, evening return.", "Doğa günü: göl, şelale, akşam dönüş."), 40.6914, 30.2678),
      day(loc("جزر الأميرات", "Princes’ Islands", "Prens Adaları"), loc("عبّارة إلى بيوك أدا وعربات خيل أو دراجات.", "Ferry to Büyükada with horse carriages or bikes.", "Büyükada feribotu; fayton veya bisiklet."), 40.874, 29.093),
      departure(IST, 41.2753, 28.7519),
    ],
    lat: 41.037,
    lng: 28.985,
    groupMax: 7,
  }),
  defineProgram({
    id: "tp-05",
    slug: "istanbul-honeymoon-5-days",
    title: loc("شهر عسل إسطنبول — 5 أيام", "Istanbul Honeymoon — 5 Days", "İstanbul Balayı — 5 Gün"),
    destination: IST,
    days: 5,
    price: 829,
    theme: "honeymoon",
    featured: true,
    images: photos(PHOTO.bosphorus, PHOTO.luxuryHotel, PHOTO.nightCity, PHOTO.hotelPool, PHOTO.hagiaSophia),
    overview: loc(
      "خمسة أيام للزوجين: غروب على البوسفور، عشاء خاص، وجولات قصيرة دون مجموعات.",
      "Five days for couples: Bosphorus sunset, a private dinner, and short tours without groups.",
      "Çiftler için beş gün: Boğaz gün batımı, özel akşam yemeği ve grupsuz kısa turlar."
    ),
    itinerary: [
      arrival(IST, loc("غرفة بإطلالة مضيق إن توفرت.", "Strait-view room when available.", "Müsaitse Boğaz manzaralı oda."), 41.043, 29.007),
      day(loc("جولة صباحية هادئة", "Quiet morning tour", "Sakin sabah turu"), loc("آيا صوفيا والمسجد الأزرق قبل الزحام.", "Hagia Sophia and the Blue Mosque before the crowds.", "Kalabalıktan önce Ayasofya ve Sultanahmet Camii."), 41.0086, 28.9802),
      day(loc("البوسفور عند الغروب", "Bosphorus at sunset", "Gün batımında Boğaz"), loc("مسار خاص على المضيق وتوقف في أورتاكوي.", "Private waterfront drive and an Ortaköy stop.", "Özel sahil güzergâhı ve Ortaköy molası."), 41.0553, 29.0267),
      day(loc("يوم حر رومانسي", "Romantic free day", "Romantik serbest gün"), loc("سبا أو تسوق في نيشانتاشي حسب رغبتكم.", "Spa or Nişantaşı shopping as you prefer.", "İsteğe spa veya Nişantaşı alışverişi."), 41.048, 28.994),
      departure(IST, 41.2753, 28.7519),
    ],
    lat: 41.043,
    lng: 29.007,
    groupMin: 2,
    groupMax: 2,
  }),
  defineProgram({
    id: "tp-06",
    slug: "istanbul-bursa-5-days",
    title: loc("إسطنبول وبورصة — 5 أيام", "Istanbul & Bursa — 5 Days", "İstanbul ve Bursa — 5 Gün"),
    destination: IST,
    destinations: [IST, BUR],
    days: 5,
    price: 649,
    images: photos(PHOTO.hagiaSophia, PHOTO.mountains, PHOTO.mosqueInterior, PHOTO.istanbulSkyline, PHOTO.hotelRoom),
    overview: loc(
      "ثلاثة ليالٍ في إسطنبول وليلة في بورصة: أول عاصمة عثمانية وأولوداغ دون برنامج يوم واحد فقط.",
      "Three nights in Istanbul and one in Bursa: the first Ottoman capital and Uludağ — not a one-day card.",
      "İstanbul’da üç, Bursa’da bir gece: ilk Osmanlı başkenti ve Uludağ."
    ),
    itinerary: [
      arrival(IST, loc("إقامة مركزية.", "Central stay.", "Merkezi konaklama."), 41.0082, 28.9784),
      day(loc("إسطنبول التاريخية", "Historic Istanbul", "Tarihi İstanbul"), loc("آيا صوفيا والسوق الكبير.", "Hagia Sophia and the Grand Bazaar.", "Ayasofya ve Kapalıçarşı."), 41.0107, 28.9685),
      day(loc("الانتقال إلى بورصة", "Transfer to Bursa", "Bursa’ya geçiş"), loc("عبور جسر مرمرة ثم المسجد الأخضر والبازار.", "Cross the Marmara Bridge then the Green Mosque and bazaar.", "Marmara Köprüsü, Yeşil Camii ve çarşı."), 40.1826, 29.0669),
      day(loc("أولوداغ والعودة", "Uludağ and return", "Uludağ ve dönüş"), loc("تلفريك أولوداغ ثم العودة إلى إسطنبول مساءً أو المطار.", "Uludağ cable car then evening return to Istanbul or the airport.", "Uludağ teleferik, akşam İstanbul veya havalimanı."), 40.1089, 29.0089),
      departure(IST, 41.2753, 28.7519),
    ],
    lat: 41.0082,
    lng: 28.9784,
  }),
  defineProgram({
    id: "tp-07",
    slug: "istanbul-sapanca-4-days",
    title: loc("إسطنبول وسبانجا — 4 أيام", "Istanbul & Sapanca — 4 Days", "İstanbul ve Sapanca — 4 Gün"),
    destination: IST,
    destinations: [IST, SAP],
    days: 4,
    price: 529,
    theme: "nature",
    images: photos(PHOTO.alpineLake, PHOTO.waterfall, PHOTO.istanbulSkyline, PHOTO.forest, PHOTO.luxuryHotel),
    overview: loc(
      "ليلتان في المدينة وليلة بجانب بحيرة سبانجا — طبيعة قريبة دون تحويل البرنامج إلى جولة يومية فقط.",
      "Two city nights and one beside Lake Sapanca — nearby nature, not a day-tour-only listing.",
      "İki şehir gecesi ve Sapanca Gölü’nde bir gece — yalnızca günlük tur değil."
    ),
    itinerary: [
      arrival(IST, loc("فندق وسط المدينة.", "Downtown hotel.", "Şehir merkezi oteli."), 41.0082, 28.9784),
      day(loc("معالم إسطنبول", "Istanbul highlights", "İstanbul öne çıkanlar"), loc("السلطان أحمد والبوسفور.", "Sultanahmet and the Bosphorus.", "Sultanahmet ve Boğaz."), 41.0086, 28.9802),
      day(loc("سبانجا والمعشوقية", "Sapanca & Maşukiye", "Sapanca ve Maşukiye"), loc("البحيرة والشلال والمبيت بجانب الغابة.", "Lake, waterfall, and an overnight by the forest.", "Göl, şelale ve orman kenarında geceleme."), 40.6914, 30.2678),
      departure(IST, 41.2753, 28.7519),
    ],
    lat: 40.6914,
    lng: 30.2678,
  }),
  defineProgram({
    id: "tp-08",
    slug: "istanbul-weekend-3-days",
    title: loc("عطلة نهاية أسبوع إسطنبول — 3 أيام", "Istanbul Weekend — 3 Days", "İstanbul Hafta Sonu — 3 Gün"),
    destination: IST,
    days: 3,
    price: 349,
    images: photos(PHOTO.istanbulSkyline, PHOTO.hagiaSophia, PHOTO.grandBazaar, PHOTO.hotelRoom),
    overview: loc(
      "ثلاث أيام / ليلتان لمن يزور إسطنبول في عطلة قصيرة: استقبال، يوم معالم كامل، ومغادرة.",
      "Three days / two nights for a short Istanbul break: meet-and-greet, one full sightseeing day, and departure.",
      "Kısa İstanbul kaçıngı: karşılama, tam bir gezi günü ve dönüş."
    ),
    itinerary: [
      arrival(IST, loc("تسجيل وصول بعد الظهر.", "Afternoon check-in.", "Öğleden sonra giriş."), 41.0082, 28.9784),
      day(loc("يوم المعالم الكامل", "Full sightseeing day", "Tam gezi günü"), loc("آيا صوفيا، المسجد الأزرق، البازار، وبرج غلطة.", "Hagia Sophia, Blue Mosque, bazaar, and Galata Tower.", "Ayasofya, Sultanahmet Camii, çarşı ve Galata."), 41.0086, 28.9802),
      departure(IST, 41.2753, 28.7519),
    ],
    lat: 41.0082,
    lng: 28.9784,
  }),
  defineProgram({
    id: "tp-09",
    slug: "istanbul-cappadocia-classic-7-days",
    title: loc("إسطنبول وكابادوكيا الكلاسيكية — 7 أيام", "Classic Istanbul & Cappadocia — 7 Days", "Klasik İstanbul ve Kapadokya — 7 Gün"),
    destination: IST,
    destinations: [IST, CAP],
    days: 7,
    price: 1099,
    featured: true,
    images: photos(PHOTO.cappadociaBalloons, PHOTO.hagiaSophia, PHOTO.cappadociaValley, PHOTO.caveHotel, PHOTO.bosphorus),
    overview: loc(
      "البرنامج التركي الأشهر: أربع ليالٍ إسطنبول وثلاث ليالٍ كابادوكيا مع طيران داخلي. ليس إقامة فندقية فقط.",
      "Turkey’s classic combo: four Istanbul nights and three in Cappadocia with a domestic flight. Not a hotel-only stay.",
      "Klasik Türkiye programı: dört İstanbul, üç Kapadokya gecesi; iç hat uçuşuyla."
    ),
    itinerary: [
      arrival(IST, loc("إقامة مركزية.", "Central stay.", "Merkezi konaklama."), 41.0082, 28.9784),
      day(loc("إسطنبول القديمة", "Old Istanbul", "Eski İstanbul"), loc("آيا صوفيا والمسجد الأزرق وتوبكابي.", "Hagia Sophia, Blue Mosque, Topkapi.", "Ayasofya, Sultanahmet Camii, Topkapı."), 41.0086, 28.9802),
      day(loc("البوسفور", "Bosphorus day", "Boğaz günü"), loc("مسار المضيق والبازار.", "Strait circuit and bazaar.", "Boğaz güzergâhı ve çarşı."), 41.0256, 28.9744),
      day(loc("الطيران إلى كابادوكيا", "Fly to Cappadocia", "Kapadokya uçuşu"), loc("ترانسفير المطار وإقامة في غوريم أو أورغوب.", "Airport transfer and stay in Göreme or Ürgüp.", "Havalimanı transferi; Göreme veya Ürgüp."), 38.6431, 34.8289),
      day(loc("وادي غوريم وأوشحيصار", "Göreme & Uçhisar", "Göreme ve Uçhisar"), loc("المتحف المفتوح وقلعة أوشحيصار ووادي الحب.", "Open-Air Museum, Uçhisar Castle, Love Valley.", "Açık Hava Müzesi, Uçhisar, Aşk Vadisi."), 38.6431, 34.8289),
      day(loc("أفانوس والمدن تحت الأرض", "Avanos & underground city", "Avanos ve yeraltı şehri"), loc("ورشة فخار ومدينة تحت الأرض حسب الموسم.", "Pottery workshop and a seasonal underground city.", "Çömlek atölyesi ve mevsimsel yeraltı şehri."), 38.7156, 34.8467),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 38.6431,
    lng: 34.8289,
  }),
  defineProgram({
    id: "tp-10",
    slug: "istanbul-cappadocia-balloon-8-days",
    title: loc("إسطنبول وكابادوكيا مع المنطاد — 8 أيام", "Istanbul, Cappadocia & Balloon — 8 Days", "İstanbul, Kapadokya ve Balon — 8 Gün"),
    destination: CAP,
    destinations: [IST, CAP],
    days: 8,
    price: 1299,
    featured: true,
    images: photos(PHOTO.balloonsSunrise, PHOTO.cappadociaBalloons, PHOTO.hagiaSophia, PHOTO.caveHotel, PHOTO.cappadociaValley),
    overview: loc(
      "ثمانية أيام مع صباح منطاد اختياري فوق المداخن الجنية. السعر للشخص يشمل البرنامج الأرضي؛ المنطاد يُحجز حسب الطقس.",
      "Eight days with an optional sunrise balloon morning over the fairy chimneys. Per-person price is the ground program; the balloon is weather-dependent.",
      "Peri bacaları üzerinde isteğe bağlı gün doğumu balonu. Kişi başı fiyat yer programıdır; balon hava durumuna bağlıdır."
    ),
    itinerary: [
      arrival(IST, loc("إقامة إسطنبول.", "Istanbul stay.", "İstanbul konaklaması."), 41.0082, 28.9784),
      day(loc("معالم إسطنبول", "Istanbul sights", "İstanbul gezisi"), loc("شبه الجزيرة التاريخية.", "Historic peninsula.", "Tarihi yarımada."), 41.0086, 28.9802),
      day(loc("البوسفور والأسواق", "Bosphorus & markets", "Boğaz ve pazarlar"), loc("مضيق وأسواق التوابل.", "Strait and spice markets.", "Boğaz ve baharat çarşıları."), 41.0165, 28.9706),
      day(loc("يوم حر إسطنبول", "Istanbul free day", "İstanbul serbest günü"), loc("تسوق أو سبا.", "Shopping or spa.", "Alışveriş veya spa."), 41.037, 28.985),
      day(loc("كابادوكيا", "Arrive Cappadocia", "Kapadokya varışı"), loc("طيران داخلي وإقامة كهفية.", "Domestic flight and cave-style stay.", "İç hat uçuşu ve mağara tarzı konaklama."), 38.6431, 34.8289),
      day(loc("المنطاد والأودية", "Balloon & valleys", "Balon ve vadiler"), loc("صباح منطاد اختياري ثم غوريم.", "Optional balloon morning then Göreme.", "İsteğe balon, ardından Göreme."), 38.6431, 34.8289),
      day(loc("أوشحيصار وأفانوس", "Uçhisar & Avanos", "Uçhisar ve Avanos"), loc("قلعة ووادي وفخار.", "Castle, valley, pottery.", "Kale, vadi, çömlek."), 38.6289, 34.8056),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 38.6431,
    lng: 34.8289,
  }),
  defineProgram({
    id: "tp-11",
    slug: "istanbul-cappadocia-honeymoon-8-days",
    title: loc("شهر عسل إسطنبول وكابادوكيا — 8 أيام", "Istanbul & Cappadocia Honeymoon — 8 Days", "İstanbul ve Kapadokya Balayı — 8 Gün"),
    destination: CAP,
    destinations: [IST, CAP],
    days: 8,
    price: 1599,
    theme: "honeymoon",
    images: photos(PHOTO.cappadociaBalloons, PHOTO.luxuryHotel, PHOTO.caveHotel, PHOTO.bosphorus, PHOTO.hotelPool),
    overview: loc(
      "برنامج شهر عسل بإقامة فاخرة في المدينتين، عشاء خاص، وإيقاع بطيء.",
      "A honeymoon program with luxury stays in both cities, a private dinner, and a slow pace.",
      "Her iki şehirde lüks konaklama, özel akşam yemeği ve yavaş tempo."
    ),
    itinerary: [
      arrival(IST, loc("جناح فاخر.", "Luxury suite.", "Lüks süit."), 41.043, 29.007),
      day(loc("إسطنبول الهادئة", "Quiet Istanbul", "Sakin İstanbul"), loc("جولات صباحية قصيرة.", "Short morning tours.", "Kısa sabah turları."), 41.0086, 28.9802),
      day(loc("غروب البوسفور", "Bosphorus sunset", "Boğaz gün batımı"), loc("عشاء بإطلالة المضيق.", "Dinner with strait views.", "Boğaz manzaralı akşam yemeği."), 41.0553, 29.0267),
      day(loc("يوم سبا", "Spa day", "Spa günü"), loc("راحة في الفندق.", "Hotel rest.", "Otelde dinlenme."), 41.043, 29.007),
      day(loc("إلى الكهوف", "To the caves", "Mağaralara"), loc("طيران وإقامة كهف فاخرة.", "Flight and luxury cave stay.", "Uçuş ve lüks mağara oteli."), 38.6431, 34.8289),
      day(loc("منطاد ووادي", "Balloon & valley", "Balon ve vadi"), loc("صباح منطاد وعشاء في الكهف.", "Balloon morning and cave dinner.", "Balon sabahı ve mağara yemeği."), 38.6431, 34.8289),
      day(loc("يوم حر كابادوكيا", "Cappadocia free day", "Kapadokya serbest günü"), loc("مشي قصير في الوادي أو سبا.", "Short valley walk or spa.", "Kısa vadi yürüyüşü veya spa."), 38.6583, 34.8083),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 38.6431,
    lng: 34.8289,
    groupMin: 2,
    groupMax: 2,
  }),
  defineProgram({
    id: "tp-12",
    slug: "istanbul-cappadocia-family-6-days",
    title: loc("إسطنبول وكابادوكيا للعائلات — 6 أيام", "Family Istanbul & Cappadocia — 6 Days", "Ailece İstanbul ve Kapadokya — 6 Gün"),
    destination: IST,
    destinations: [IST, CAP],
    days: 6,
    price: 999,
    theme: "family",
    images: photos(PHOTO.cappadociaValley, PHOTO.istanbulSkyline, PHOTO.hotelRoom, PHOTO.balloonsSunrise, PHOTO.breakfast),
    overview: loc(
      "ستة أيام عائلية: معالم قصيرة في إسطنبول ثم وديان كابادوكيا دون يوم طويل مرهق.",
      "Six family days: short Istanbul sights then Cappadocia valleys without an exhausting long day.",
      "Kısa İstanbul gezileri ve yorucu olmayan Kapadokya vadileri."
    ),
    itinerary: [
      arrival(IST, loc("غرف عائلية.", "Family rooms.", "Aile odaları."), 41.037, 28.985),
      day(loc("إسطنبول الخفيفة", "Easy Istanbul", "Rahat İstanbul"), loc("ساحة السلطان أحمد والحدائق.", "Sultanahmet Square and parks.", "Sultanahmet Meydanı ve parklar."), 41.0054, 28.9768),
      day(loc("البوسفور", "Bosphorus", "Boğaz"), loc("مشاهدة المضيق دون مشي طويل.", "Strait views without long walks.", "Uzun yürüyüş olmadan Boğaz."), 41.043, 29.007),
      day(loc("كابادوكيا", "Cappadocia", "Kapadokya"), loc("طيران وإقامة واسعة.", "Flight and a spacious stay.", "Uçuş ve ferah konaklama."), 38.6431, 34.8289),
      day(loc("أودية العائلة", "Family valleys", "Aile vadileri"), loc("نقاط تصوير قصيرة ووقت لعب.", "Short photo stops and play time.", "Kısa fotoğraf molaları ve oyun zamanı."), 38.6583, 34.8083),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 38.6431,
    lng: 34.8289,
    groupMax: 7,
  }),
  defineProgram({
    id: "tp-13",
    slug: "antalya-beach-5-days",
    title: loc("أنطاليا الشاطئية — 5 أيام", "Antalya Beach — 5 Days", "Antalya Plaj — 5 Gün"),
    destination: ANT,
    days: 5,
    price: 649,
    theme: "beach",
    featured: true,
    images: photos(PHOTO.antalyaCoast, PHOTO.mediterraneanBeach, PHOTO.hotelPool, PHOTO.aegeanCoast, PHOTO.luxuryHotel),
    overview: loc(
      "خمسة أيام على المتوسط: إقامة منتجع، كاليتشي القديمة، وشلالات دودان. برنامج شاطئ وثقافة وليس بطاقة فندق.",
      "Five Mediterranean days: resort stay, Kaleiçi old town, and Düden Falls. Beach-and-culture — not a hotel card.",
      "Akdeniz’de beş gün: tatil köyü, Kaleiçi ve Düden Şelalesi."
    ),
    itinerary: [
      arrival(ANT, loc("منتجع لارا أو قونياألتي.", "Lara or Konyaaltı resort.", "Lara veya Konyaaltı tesisi."), 36.8969, 30.7133),
      day(loc("يوم شاطئ", "Beach day", "Plaj günü"), loc("صباح بحر ووقت حر في المنتجع.", "Morning sea time and a free resort afternoon.", "Sabah deniz, öğleden sonra tesiste serbest."), 36.853, 30.837),
      day(loc("كاليتشي ودودان", "Kaleiçi & Düden", "Kaleiçi ve Düden"), loc("البلدة القديمة والشلال ثم الميناء.", "Old town, waterfall, then the harbour.", "Eski kent, şelale ve liman."), 36.885, 30.705),
      day(loc("يوم حر أو يخت قصير", "Free day or short yacht", "Serbest gün veya kısa yat"), loc("خيار قارب على الساحل.", "Optional coastal boat.", "İsteğe kıyı teknesi."), 36.862, 30.64),
      departure(ANT, 36.8987, 30.8005),
    ],
    lat: 36.8969,
    lng: 30.7133,
  }),
  defineProgram({
    id: "tp-14",
    slug: "antalya-beach-culture-7-days",
    title: loc("أنطاليا شاطئ وثقافة — 7 أيام", "Antalya Beach & Culture — 7 Days", "Antalya Plaj ve Kültür — 7 Gün"),
    destination: ANT,
    days: 7,
    price: 849,
    theme: "beach",
    images: photos(PHOTO.antalyaCoast, PHOTO.ancientRuins, PHOTO.mediterraneanBeach, PHOTO.hotelPool, PHOTO.whiteTerraces),
    overview: loc(
      "أسبوع يجمع الشاطئ مع بيرج وكيمير دون تحويل الصفحة إلى مقال سياحي.",
      "A week mixing beach time with Perge and Kemer — a real itinerary, not a travel article.",
      "Plaj, Perge ve Kemer — makale değil, gerçek program."
    ),
    itinerary: [
      arrival(ANT, loc("منتجع على الشاطئ.", "Beach resort.", "Sahil tesisi."), 36.8969, 30.7133),
      day(loc("كاليتشي", "Kaleiçi", "Kaleiçi"), loc("الأزقة والميناء الروماني.", "Lanes and the Roman harbour.", "Sokaklar ve Roma limanı."), 36.885, 30.705),
      day(loc("بيرج وأسبندوس", "Perge & Aspendos", "Perge ve Aspendos"), loc("آثار رومانية نصف يوم ثم بحر.", "Half-day ruins then the sea.", "Yarım gün ören yeri, sonra deniz."), 36.961, 30.854),
      day(loc("كيمير", "Kemer", "Kemer"), loc("ساحل كيمير وخيار قارب.", "Kemer coast and optional boat.", "Kemer sahili ve isteğe tekne."), 36.597, 30.56),
      day(loc("يوم منتجع", "Resort day", "Tesis günü"), loc("مسبح وبحر.", "Pool and sea.", "Havuz ve deniz."), 36.853, 30.837),
      day(loc("شلالات كورشونلو", "Kurşunlu Falls", "Kurşunlu Şelalesi"), loc("نزهة قصيرة في المحمية.", "Short reserve walk.", "Kısa korunan alan yürüyüşü."), 36.995, 30.724),
      departure(ANT, 36.8987, 30.8005),
    ],
    lat: 36.8969,
    lng: 30.7133,
  }),
  defineProgram({
    id: "tp-15",
    slug: "antalya-family-all-inclusive-8-days",
    title: loc("أنطاليا عائلية شاملة — 8 أيام", "Antalya Family All Inclusive — 8 Days", "Antalya Aile Her Şey Dahil — 8 Gün"),
    destination: ANT,
    days: 8,
    price: 999,
    theme: "family",
    images: photos(PHOTO.hotelPool, PHOTO.mediterraneanBeach, PHOTO.antalyaCoast, PHOTO.breakfast, PHOTO.hotelRoom),
    overview: loc(
      "ثمانية أيام في منتجع عائلي شامل تقريباً للوجبات، مع يومين خفيفين للمدينة والشلال.",
      "Eight days at a family resort with meals largely included, plus two easy city and waterfall days.",
      "Aile tesisinde sekiz gün; yemekler büyük ölçüde dahil, iki kolay gezi günü."
    ),
    itinerary: [
      arrival(ANT, loc("منتجع عائلي في بيليك أو لارا.", "Family resort in Belek or Lara.", "Belek veya Lara aile tesisi."), 36.862, 31.055),
      day(loc("يوم نادي أطفال", "Kids-club day", "Çocuk kulübü günü"), loc("المنتجع فقط.", "Resort only.", "Sadece tesis."), 36.862, 31.055),
      day(loc("كاليتشي الخفيفة", "Easy Kaleiçi", "Rahat Kaleiçi"), loc("جولة قصيرة وعودة للقيلولة.", "Short tour then nap time.", "Kısa tur, sonra öğle uykusu."), 36.885, 30.705),
      day(loc("يوم بحر", "Sea day", "Deniz günü"), loc("شاطئ ومسابح.", "Beach and pools.", "Plaj ve havuzlar."), 36.862, 31.055),
      day(loc("دودان", "Düden", "Düden"), loc("شلال ونزهة قصيرة.", "Falls and a short outing.", "Şelale ve kısa gezi."), 36.851, 30.736),
      day(loc("يوم حر", "Free day", "Serbest gün"), loc("المنتجع.", "Resort.", "Tesis."), 36.862, 31.055),
      day(loc("يوم حر إضافي", "Extra free day", "Ek serbest gün"), loc("سبا أو ألعاب مائية حسب الفندق.", "Spa or hotel water park.", "Spa veya otel aquaparkı."), 36.862, 31.055),
      departure(ANT, 36.8987, 30.8005),
    ],
    lat: 36.862,
    lng: 31.055,
    includes: [
      ...STD_IN,
      loc("وجبات المنتجع حسب نظام الإقامة", "Resort meals per the board basis", "Pansiyon tipine göre tesis yemekleri"),
    ],
    groupMax: 7,
  }),
  defineProgram({
    id: "tp-16",
    slug: "antalya-pamukkale-6-days",
    title: loc("أنطاليا وباموكالي — 6 أيام", "Antalya & Pamukkale — 6 Days", "Antalya ve Pamukkale — 6 Gün"),
    destination: ANT,
    destinations: [ANT, PAM],
    days: 6,
    price: 799,
    images: photos(PHOTO.whiteTerraces, PHOTO.antalyaCoast, PHOTO.ancientRuins, PHOTO.hotelPool, PHOTO.mediterraneanBeach),
    overview: loc(
      "أربع ليالٍ أنطاليا وليلة باموكالي: المدرجات البيضاء وهيرابوليس ضمن برنامج متعدد الأيام.",
      "Four Antalya nights and one in Pamukkale: the white terraces and Hierapolis inside a multi-day program.",
      "Dört Antalya, bir Pamukkale gecesi: beyaz travertenler ve Hierapolis."
    ),
    itinerary: [
      arrival(ANT, loc("منتجع أنطاليا.", "Antalya resort.", "Antalya tesisi."), 36.8969, 30.7133),
      day(loc("شاطئ وكاليتشي", "Beach & Kaleiçi", "Plaj ve Kaleiçi"), loc("بحر وصباح بلدة قديمة.", "Sea and an old-town morning.", "Deniz ve eski kent sabahı."), 36.885, 30.705),
      day(loc("يوم منتجع", "Resort day", "Tesis günü"), loc("راحة قبل الطريق.", "Rest before the road day.", "Yol gününden önce dinlenme."), 36.8969, 30.7133),
      day(loc("باموكالي", "Pamukkale", "Pamukkale"), loc("الانتقال إلى المدرجات والمبيت هناك.", "Transfer to the terraces and overnight there.", "Travertenlere transfer ve orada geceleme."), 37.9137, 29.1187),
      day(loc("هيرابوليس والعودة", "Hierapolis & return", "Hierapolis ve dönüş"), loc("المسرح الروماني ثم العودة إلى أنطاليا أو المطار.", "Roman theatre then return to Antalya or the airport.", "Roma tiyatrosu, ardından Antalya veya havalimanı."), 37.925, 29.126),
      departure(ANT, 36.8987, 30.8005),
    ],
    lat: 37.9137,
    lng: 29.1187,
  }),
  defineProgram({
    id: "tp-17",
    slug: "antalya-luxury-resort-6-days",
    title: loc("أنطاليا الفاخرة — 6 أيام", "Antalya Luxury Resort — 6 Days", "Antalya Lüks Tesis — 6 Gün"),
    destination: ANT,
    days: 6,
    price: 1199,
    theme: "luxury",
    images: photos(PHOTO.luxuryHotel, PHOTO.hotelPool, PHOTO.antalyaCoast, PHOTO.yachtHarbor, PHOTO.hotelLobby),
    overview: loc(
      "ستة أيام في منتجع فاخر: سبا، شاطئ خاص، ويوم يخت اختياري.",
      "Six days at a luxury resort: spa, private beach, and an optional yacht day.",
      "Lüks tesiste altı gün: spa, özel plaj ve isteğe yat günü."
    ),
    itinerary: [
      arrival(ANT, loc("منتجع 5 نجوم.", "Five-star resort.", "5 yıldızlı tesis."), 36.862, 31.055),
      day(loc("سبا وشاطئ", "Spa & beach", "Spa ve plaj"), loc("يوم المنشأة بالكامل.", "Full property day.", "Tam tesis günü."), 36.862, 31.055),
      day(loc("كاليتشي الهادئة", "Quiet Kaleiçi", "Sakin Kaleiçi"), loc("جولة مسائية قصيرة.", "Short evening outing.", "Kısa akşam gezisi."), 36.885, 30.705),
      day(loc("يوم يخت", "Yacht day", "Yat günü"), loc("قارب خاص نصف يوم إن رغبتم.", "Optional half-day private boat.", "İsteğe yarım gün özel tekne."), 36.862, 30.64),
      day(loc("يوم حر فاخر", "Luxury free day", "Lüks serbest gün"), loc("سبا أو غولف حسب الفندق.", "Spa or hotel golf.", "Spa veya otel golfü."), 36.862, 31.055),
      departure(ANT, 36.8987, 30.8005),
    ],
    lat: 36.862,
    lng: 31.055,
  }),
  defineProgram({
    id: "tp-18",
    slug: "cappadocia-classic-4-days",
    title: loc("كابادوكيا الكلاسيكية — 4 أيام", "Classic Cappadocia — 4 Days", "Klasik Kapadokya — 4 Gün"),
    destination: CAP,
    days: 4,
    price: 699,
    featured: true,
    images: photos(PHOTO.cappadociaValley, PHOTO.cappadociaBalloons, PHOTO.caveHotel, PHOTO.landscape, PHOTO.breakfast),
    overview: loc(
      "أربع أيام بين غوريم وأوشحيصار وأفانوس مع إقامة كهفية. برنامج أرضي كامل.",
      "Four days across Göreme, Uçhisar, and Avanos with a cave-style stay. A full ground program.",
      "Göreme, Uçhisar ve Avanos’ta dört gün; mağara konaklaması."
    ),
    itinerary: [
      arrival(CAP, loc("فندق كهف في غوريم.", "Cave hotel in Göreme.", "Göreme’de mağara oteli."), 38.6431, 34.8289),
      day(loc("المتحف المفتوح", "Open-Air Museum", "Açık Hava Müzesi"), loc("غوريم ووادي الحب.", "Göreme and Love Valley.", "Göreme ve Aşk Vadisi."), 38.6431, 34.8289),
      day(loc("أوشحيصار وأفانوس", "Uçhisar & Avanos", "Uçhisar ve Avanos"), loc("القلعة والفخار.", "Castle and pottery.", "Kale ve çömlek."), 38.7156, 34.8467),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 38.6431,
    lng: 34.8289,
  }),
  defineProgram({
    id: "tp-19",
    slug: "cappadocia-balloon-5-days",
    title: loc("كابادوكيا والمنطاد — 5 أيام", "Cappadocia Balloon Stay — 5 Days", "Kapadokya Balon Konaklaması — 5 Gün"),
    destination: CAP,
    days: 5,
    price: 849,
    images: photos(PHOTO.balloonsSunrise, PHOTO.cappadociaBalloons, PHOTO.cappadociaValley, PHOTO.caveHotel, PHOTO.landscape),
    overview: loc(
      "خمس أيام مع صباح منطاد اختياري ووديان إضافية. سعر الشخص للبرنامج الأرضي.",
      "Five days with an optional balloon morning and extra valleys. Per-person price is the ground program.",
      "İsteğe balon sabahı ve ekstra vadiler. Kişi başı fiyat yer programıdır."
    ),
    itinerary: [
      arrival(CAP, loc("إقامة في أورغوب أو غوريم.", "Stay in Ürgüp or Göreme.", "Ürgüp veya Göreme."), 38.6431, 34.8289),
      day(loc("المنطاد والوديان", "Balloon & valleys", "Balon ve vadiler"), loc("صباح مبكر ثم وادي الحمام.", "Early morning then Pigeon Valley.", "Erken kalkış, ardından Güvercinlik Vadisi."), 38.6431, 34.8289),
      day(loc("المتحف والقلعة", "Museum & castle", "Müze ve kale"), loc("غوريم وأوشحيصار.", "Göreme and Uçhisar.", "Göreme ve Uçhisar."), 38.6289, 34.8056),
      day(loc("مدينة تحت الأرض", "Underground city", "Yeraltı şehri"), loc("درينكويو أو كايماكلي حسب الازدحام.", "Derinkuyu or Kaymaklı depending on crowds.", "Kalabalığa göre Derinkuyu veya Kaymaklı."), 38.375, 34.734),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 38.6431,
    lng: 34.8289,
  }),
  defineProgram({
    id: "tp-20",
    slug: "cappadocia-konya-6-days",
    title: loc("كابادوكيا وقونية — 6 أيام", "Cappadocia & Konya — 6 Days", "Kapadokya ve Konya — 6 Gün"),
    destination: CAP,
    destinations: [CAP, KON],
    days: 6,
    price: 899,
    images: photos(PHOTO.cappadociaValley, PHOTO.mosqueInterior, PHOTO.cappadociaBalloons, PHOTO.caveHotel, PHOTO.food),
    overview: loc(
      "أربعة أيام كابادوكيا وليلة قونية عند ضريح مولانا — برنامج روحي وطبيعي معاً.",
      "Four Cappadocia days and a Konya night at the Mevlana complex — spiritual and landscape together.",
      "Dört Kapadokya günü ve Mevlana’da bir Konya gecesi."
    ),
    itinerary: [
      arrival(CAP, loc("إقامة غوريم.", "Göreme stay.", "Göreme konaklaması."), 38.6431, 34.8289),
      day(loc("وديان غوريم", "Göreme valleys", "Göreme vadileri"), loc("المتحف المفتوح.", "Open-Air Museum.", "Açık Hava Müzesi."), 38.6431, 34.8289),
      day(loc("أوشحيصار", "Uçhisar", "Uçhisar"), loc("القلعة ونقاط التصوير.", "Castle and viewpoints.", "Kale ve manzara noktaları."), 38.6289, 34.8056),
      day(loc("الطريق إلى قونية", "Road to Konya", "Konya yolu"), loc("الانتقال وزيارة متحف مولانا.", "Transfer and the Mevlana Museum.", "Transfer ve Mevlana Müzesi."), 37.8706, 32.5047),
      day(loc("قونية والعودة", "Konya & return", "Konya ve dönüş"), loc("صباح هادئ ثم العودة إلى كابادوكيا أو المطار.", "Quiet morning then return to Cappadocia or the airport.", "Sakin sabah, Kapadokya veya havalimanı."), 37.8746, 32.4932),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 37.8746,
    lng: 32.4932,
  }),
  defineProgram({
    id: "tp-21",
    slug: "cappadocia-luxury-cave-5-days",
    title: loc("كابادوكيا الكهفية الفاخرة — 5 أيام", "Luxury Cave Cappadocia — 5 Days", "Lüks Mağara Kapadokya — 5 Gün"),
    destination: CAP,
    days: 5,
    price: 1099,
    theme: "luxury",
    images: photos(PHOTO.caveHotel, PHOTO.cappadociaBalloons, PHOTO.luxuryHotel, PHOTO.cappadociaValley, PHOTO.hotelPool),
    overview: loc(
      "خمسة أيام في فندق كهف فاخر مع جولات خاصة صباحية.",
      "Five days in a luxury cave hotel with private morning tours.",
      "Lüks mağara otelinde özel sabah turlarıyla beş gün."
    ),
    itinerary: [
      arrival(CAP, loc("جناح كهف.", "Cave suite.", "Mağara süiti."), 38.6431, 34.8289),
      day(loc("جولات هادئة", "Quiet tours", "Sakin turlar"), loc("وديان قبل الحافلات.", "Valleys before the coaches.", "Otobüslerden önce vadiler."), 38.6583, 34.8083),
      day(loc("منطاد اختياري", "Optional balloon", "İsteğe balon"), loc("صباح مبكر ثم سبا.", "Early morning then spa.", "Erken sabah, sonra spa."), 38.6431, 34.8289),
      day(loc("أفانوس الخاص", "Private Avanos", "Özel Avanos"), loc("ورشة فخار خاصة.", "Private pottery visit.", "Özel çömlek ziyareti."), 38.7156, 34.8467),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 38.6431,
    lng: 34.8289,
  }),
  defineProgram({
    id: "tp-22",
    slug: "trabzon-uzungol-4-days",
    title: loc("طرابزون وأوزنجول — 4 أيام", "Trabzon & Uzungöl — 4 Days", "Trabzon ve Uzungöl — 4 Gün"),
    destination: TRB,
    days: 4,
    price: 549,
    featured: true,
    theme: "nature",
    images: photos(PHOTO.alpineLake, PHOTO.mountains, PHOTO.landscape, PHOTO.teaGarden, PHOTO.hotelRoom),
    overview: loc(
      "أربع أيام على البحر الأسود: طرابزون، أوزنجول، وإقامة جبلية. برنامج ليالٍ وليس مقال «السياحة في طرابزون».",
      "Four Black Sea days: Trabzon, Uzungöl, and a mountain stay. A nights-and-days program — not a “tourism in Trabzon” article.",
      "Karadeniz’de dört gün: Trabzon, Uzungöl ve dağ konaklaması — blog yazısı değil."
    ),
    itinerary: [
      arrival(TRB, loc("فندق في طرابزون أو أوزنجول.", "Hotel in Trabzon or Uzungöl.", "Trabzon veya Uzungöl oteli."), 41.0027, 39.7168),
      day(loc("أو زنجول", "Uzungöl", "Uzungöl"), loc("البحيرة والمسجد الخشبي ومشي قصير.", "Lake, wooden mosque, short walk.", "Göl, ahşap cami, kısa yürüyüş."), 40.6195, 40.2996),
      day(loc("وسط طرابزون", "Trabzon city", "Trabzon kent"), loc("آيا صوفيا طرابزون والقلعة.", "Trabzon Hagia Sophia and the castle.", "Trabzon Ayasofyası ve kale."), 41.003, 39.716),
      departure(TRB, 40.995, 39.79),
    ],
    lat: 40.6195,
    lng: 40.2996,
  }),
  defineProgram({
    id: "tp-23",
    slug: "trabzon-ayder-5-days",
    title: loc("طرابزون وآيدر — 5 أيام", "Trabzon & Ayder — 5 Days", "Trabzon ve Ayder — 5 Gün"),
    destination: TRB,
    destinations: [TRB, AYD],
    days: 5,
    price: 649,
    theme: "nature",
    featured: true,
    images: photos(PHOTO.mountains, PHOTO.waterfall, PHOTO.alpineLake, PHOTO.forest, PHOTO.teaGarden),
    overview: loc(
      "خمسة أيام طرابزون + آيدر/ريزا: هضاب، شلالات، وينابيع. برنامج البحر الأسود المتعدد الأيام.",
      "Five days Trabzon plus Ayder/Rize: plateaus, waterfalls, and hot springs. A multi-day Black Sea program.",
      "Trabzon ve Ayder/Rize: yaylalar, şelaleler ve kaplıcalar."
    ),
    itinerary: [
      arrival(TRB, loc("ليلة في طرابزون.", "Night in Trabzon.", "Trabzon’da gece."), 41.0027, 39.7168),
      day(loc("سوميلا", "Sümela", "Sümela"), loc("دير سوميلا في وادي ألتنين.", "Sümela Monastery in Altındere valley.", "Altındere’de Sümela Manastırı."), 40.6903, 39.6583),
      day(loc("آيدر", "Ayder", "Ayder"), loc("الهضبة والشلالات والمبيت.", "Plateau, falls, overnight.", "Yayla, şelaleler, geceleme."), 40.953, 41.1),
      day(loc("هضاب ريزا", "Rize highlands", "Rize yaylaları"), loc("مزارع الشاي ونقاط مرتفعة.", "Tea gardens and highland viewpoints.", "Çay bahçeleri ve yayla manzaraları."), 41.0201, 40.5234),
      departure(TRB, 40.995, 39.79),
    ],
    lat: 40.953,
    lng: 41.1,
  }),
  defineProgram({
    id: "tp-24",
    slug: "trabzon-rize-highlands-6-days",
    title: loc("طرابزون وريزا الهضاب — 6 أيام", "Trabzon & Rize Highlands — 6 Days", "Trabzon ve Rize Yaylaları — 6 Gün"),
    destination: TRB,
    days: 6,
    price: 749,
    theme: "nature",
    images: photos(PHOTO.landscape, PHOTO.mountains, PHOTO.alpineLake, PHOTO.waterfall, PHOTO.forest),
    overview: loc(
      "ستة أيام أعمق في البحر الأسود: أوزنجول، بالوفيت، وآيدر مع ليلتين في الجبل.",
      "Six deeper Black Sea days: Uzungöl, Palovit, and Ayder with two mountain nights.",
      "Daha derin Karadeniz: Uzungöl, Palovit ve iki dağ gecesiyle Ayder."
    ),
    itinerary: [
      arrival(TRB, loc("طرابزون.", "Trabzon.", "Trabzon."), 41.0027, 39.7168),
      day(loc("أو زنجول", "Uzungöl", "Uzungöl"), loc("البحيرة والمبيت الجبلي.", "Lake and mountain overnight.", "Göl ve dağ gecesi."), 40.6195, 40.2996),
      day(loc("بالوفيت", "Palovit", "Palovit"), loc("شلال بالوفيت والطرق الجبلية.", "Palovit Falls and mountain roads.", "Palovit Şelalesi ve dağ yolları."), 40.72, 40.45),
      day(loc("آيدر", "Ayder", "Ayder"), loc("الهضبة والينابيع.", "Plateau and springs.", "Yayla ve kaplıcalar."), 40.953, 41.1),
      day(loc("طرابزون المدينة", "Trabzon city", "Trabzon kent"), loc("عودة للمدينة وسوق محلي.", "Back to the city and a local market.", "Kente dönüş ve yerel pazar."), 41.0027, 39.7168),
      departure(TRB, 40.995, 39.79),
    ],
    lat: 41.0027,
    lng: 39.7168,
  }),
  defineProgram({
    id: "tp-25",
    slug: "black-sea-family-7-days",
    title: loc("البحر الأسود العائلي — 7 أيام", "Black Sea Family — 7 Days", "Karadeniz Aile — 7 Gün"),
    destination: TRB,
    days: 7,
    price: 849,
    theme: "family",
    images: photos(PHOTO.alpineLake, PHOTO.hotelRoom, PHOTO.mountains, PHOTO.teaGarden, PHOTO.breakfast),
    overview: loc(
      "أسبوع عائلي بإيقاع خفيف بين طرابزون وأوزنجول مع يوم راحة.",
      "A gentle family week between Trabzon and Uzungöl with a rest day.",
      "Trabzon ve Uzungöl arasında dinlenme günü olan sakin aile haftası."
    ),
    itinerary: [
      arrival(TRB, loc("غرف عائلية.", "Family rooms.", "Aile odaları."), 41.0027, 39.7168),
      day(loc("مدينة خفيفة", "Easy city", "Rahat kent"), loc("كورنيش ومسجد.", "Promenade and mosque.", "Sahil ve cami."), 41.0027, 39.7168),
      day(loc("أو زنجول", "Uzungöl", "Uzungöl"), loc("بحيرة ومشي قصير.", "Lake and a short walk.", "Göl ve kısa yürüyüş."), 40.6195, 40.2996),
      day(loc("يوم راحة جبلي", "Mountain rest day", "Dağ dinlenme günü"), loc("الفندق والطبيعة المحيطة.", "Hotel and nearby nature.", "Otel ve çevre doğa."), 40.6195, 40.2996),
      day(loc("سوميلا إن ناسب الأطفال", "Sümela if suitable", "Uygunsa Sümela"), loc("زيارة اختيارية للدير.", "Optional monastery visit.", "İsteğe manastır."), 40.6903, 39.6583),
      day(loc("عودة طرابزون", "Back to Trabzon", "Trabzon’a dönüş"), loc("تسوق خفيف.", "Light shopping.", "Hafif alışveriş."), 41.0027, 39.7168),
      departure(TRB, 40.995, 39.79),
    ],
    lat: 40.6195,
    lng: 40.2996,
    groupMax: 7,
  }),
  defineProgram({
    id: "tp-26",
    slug: "trabzon-nature-luxury-5-days",
    title: loc("طرابزون الطبيعة الفاخرة — 5 أيام", "Trabzon Nature Luxury — 5 Days", "Trabzon Doğa Lüks — 5 Gün"),
    destination: TRB,
    days: 5,
    price: 799,
    theme: "luxury",
    images: photos(PHOTO.luxuryHotel, PHOTO.alpineLake, PHOTO.mountains, PHOTO.hotelLobby, PHOTO.landscape),
    overview: loc(
      "خمسة أيام بإقامة أرقى في المنطقة مع سيارة خاصة يومياً.",
      "Five days in a higher-end regional stay with a private car each day.",
      "Bölgenin daha üst konaklamasında her gün özel araçla beş gün."
    ),
    itinerary: [
      arrival(TRB, loc("فندق إطلالة جبل أو بحر.", "Mountain- or sea-view hotel.", "Dağ veya deniz manzaralı otel."), 41.0027, 39.7168),
      day(loc("أو زنجول الخاص", "Private Uzungöl", "Özel Uzungöl"), loc("جدول مرن دون مجموعات.", "Flexible timing, no groups.", "Esnek saat, grup yok."), 40.6195, 40.2996),
      day(loc("سوميلا الخاص", "Private Sümela", "Özel Sümela"), loc("وصول مبكر للدير.", "Early monastery access.", "Manastıra erken varış."), 40.6903, 39.6583),
      day(loc("آيدر", "Ayder", "Ayder"), loc("هضبة وينابيع.", "Plateau and springs.", "Yayla ve kaplıcalar."), 40.953, 41.1),
      departure(TRB, 40.995, 39.79),
    ],
    lat: 41.0027,
    lng: 39.7168,
  }),
  defineProgram({
    id: "tp-27",
    slug: "trabzon-istanbul-combo-8-days",
    title: loc("طرابزون وإسطنبول — 8 أيام", "Trabzon & Istanbul Combo — 8 Days", "Trabzon ve İstanbul — 8 Gün"),
    destination: TRB,
    destinations: [TRB, IST],
    days: 8,
    price: 1099,
    images: photos(PHOTO.alpineLake, PHOTO.hagiaSophia, PHOTO.mountains, PHOTO.istanbulSkyline, PHOTO.bosphorus),
    overview: loc(
      "أربعة أيام بحر أسود ثم أربعة أيام إسطنبول بطيران داخلي — مدينتان في برنامج واحد.",
      "Four Black Sea days then four in Istanbul on a domestic flight — two cities, one program.",
      "Dört Karadeniz, dört İstanbul günü; iç hat uçuşuyla tek program."
    ),
    itinerary: [
      arrival(TRB, loc("طرابزون.", "Trabzon.", "Trabzon."), 41.0027, 39.7168),
      day(loc("أو زنجول", "Uzungöl", "Uzungöl"), loc("بحيرة الجبل.", "Mountain lake.", "Dağ gölü."), 40.6195, 40.2996),
      day(loc("سوميلا وآيدر", "Sümela & Ayder", "Sümela ve Ayder"), loc("دير وهضبة.", "Monastery and plateau.", "Manastır ve yayla."), 40.6903, 39.6583),
      day(loc("طيران إلى إسطنبول", "Fly to Istanbul", "İstanbul uçuşu"), loc("ترانسفير وفندق مركزي.", "Transfer and central hotel.", "Transfer ve merkezi otel."), 41.0082, 28.9784),
      day(loc("إسطنبول التاريخية", "Historic Istanbul", "Tarihi İstanbul"), loc("آيا صوفيا والمسجد الأزرق.", "Hagia Sophia and Blue Mosque.", "Ayasofya ve Sultanahmet Camii."), 41.0086, 28.9802),
      day(loc("البوسفور", "Bosphorus", "Boğaz"), loc("مضيق وبازار.", "Strait and bazaar.", "Boğaz ve çarşı."), 41.0256, 28.9744),
      day(loc("يوم حر", "Free day", "Serbest gün"), loc("تسوق أو سبا.", "Shopping or spa.", "Alışveriş veya spa."), 41.037, 28.985),
      departure(IST, 41.2753, 28.7519),
    ],
    lat: 41.0082,
    lng: 28.9784,
  }),
  defineProgram({
    id: "tp-28",
    slug: "bursa-uludag-4-days",
    title: loc("بورصة وأولوداغ — 4 أيام", "Bursa & Uludağ — 4 Days", "Bursa ve Uludağ — 4 Gün"),
    destination: BUR,
    days: 4,
    price: 449,
    images: photos(PHOTO.mountains, PHOTO.mosqueInterior, PHOTO.forest, PHOTO.hotelRoom, PHOTO.food),
    overview: loc(
      "أربع أيام في أول عاصمة عثمانية مع يوم أولوداغ. إقامة في بورصة وليس رحلة يوم من إسطنبول فقط.",
      "Four days in the first Ottoman capital with an Uludağ day. A Bursa stay — not only an Istanbul day trip.",
      "İlk Osmanlı başkentinde Uludağ günüyle dört gün — yalnızca İstanbul günü değil."
    ),
    itinerary: [
      arrival(BUR, loc("فندق وسط بورصة.", "Central Bursa hotel.", "Merkezi Bursa oteli."), 40.1885, 29.061),
      day(loc("المسجد الأخضر والبازار", "Green Mosque & bazaar", "Yeşil Camii ve çarşı"), loc("التاريخ العثماني والكباب.", "Ottoman history and İskender.", "Osmanlı tarihi ve İskender."), 40.1826, 29.0669),
      day(loc("أولوداغ", "Uludağ", "Uludağ"), loc("تلفريك وقمة الجبل.", "Cable car and the summit area.", "Teleferik ve zirve."), 40.1089, 29.0089),
      departure(BUR, 40.232, 29.009),
    ],
    lat: 40.1885,
    lng: 29.061,
  }),
  defineProgram({
    id: "tp-29",
    slug: "bursa-thermal-5-days",
    title: loc("بورصة الحرارية — 5 أيام", "Bursa Thermal Heritage — 5 Days", "Bursa Termal Miras — 5 Gün"),
    destination: BUR,
    days: 5,
    price: 549,
    images: photos(PHOTO.hotelPool, PHOTO.mosqueInterior, PHOTO.mountains, PHOTO.luxuryHotel, PHOTO.forest),
    overview: loc(
      "خمسة أيام تاريخ وحمّامات حرارية في تشيكيرجي مع يوم قرية جمعلقيزيق.",
      "Five days of history and Çekirge thermal baths plus a Cumalıkızık village day.",
      "Tarih, Çekirge kaplıcaları ve Cumalıkızık köy günü."
    ),
    itinerary: [
      arrival(BUR, loc("فندق حراري.", "Thermal hotel.", "Termal otel."), 40.1885, 29.061),
      day(loc("المعالم العثمانية", "Ottoman sights", "Osmanlı yerleri"), loc("المسجد الأخضر والجامع الكبير.", "Green Mosque and Grand Mosque.", "Yeşil Camii ve Ulu Cami."), 40.183, 29.062),
      day(loc("حمّامات تشيكيرجي", "Çekirge baths", "Çekirge kaplıcaları"), loc("يوم سبا حراري.", "Thermal spa day.", "Termal spa günü."), 40.198, 29.04),
      day(loc("جمعلقيزيق", "Cumalıkızık", "Cumalıkızık"), loc("قرية عثمانية حية.", "A living Ottoman village.", "Yaşayan Osmanlı köyü."), 40.1747, 29.1714),
      departure(BUR, 40.232, 29.009),
    ],
    lat: 40.1885,
    lng: 29.061,
  }),
  defineProgram({
    id: "tp-30",
    slug: "sapanca-lake-3-days",
    title: loc("بحيرة سبانجا — 3 أيام", "Sapanca Lake Escape — 3 Days", "Sapanca Gölü — 3 Gün"),
    destination: SAP,
    days: 3,
    price: 349,
    theme: "nature",
    images: photos(PHOTO.alpineLake, PHOTO.forest, PHOTO.waterfall, PHOTO.hotelRoom),
    overview: loc(
      "ثلاث أيام / ليلتان بجانب البحيرة مع المعشوقية. إقامة طبيعة وليس مقال فنادق سبانجا.",
      "Three days / two nights by the lake with Maşukiye. A nature stay — not a Sapanca hotels article.",
      "Göl kenarında Maşukiye ile üç gün — otel yazısı değil."
    ),
    itinerary: [
      arrival(SAP, loc("كابينة أو فندق بحيرة.", "Cabin or lake hotel.", "Kabın veya göl oteli."), 40.6914, 30.2678),
      day(loc("المعشوقية وكرتبه", "Maşukiye & Kartepe", "Maşukiye ve Kartepe"), loc("شلال ونقطة مرتفعة.", "Waterfall and a viewpoint.", "Şelale ve manzara."), 40.7, 30.2),
      departure(SAP, 40.6914, 30.2678),
    ],
    lat: 40.6914,
    lng: 30.2678,
  }),
  defineProgram({
    id: "tp-31",
    slug: "sapanca-family-nature-4-days",
    title: loc("سبانجا العائلية — 4 أيام", "Sapanca Family Nature — 4 Days", "Sapanca Aile Doğa — 4 Gün"),
    destination: SAP,
    days: 4,
    price: 429,
    theme: "family",
    images: photos(PHOTO.alpineLake, PHOTO.breakfast, PHOTO.forest, PHOTO.waterfall, PHOTO.hotelRoom),
    overview: loc(
      "أربع أيام عائلية حول البحيرة بإيقاع هادئ ومشي قصير.",
      "Four calm family days around the lake with short walks.",
      "Göl çevresinde kısa yürüyüşlü sakin dört aile günü."
    ),
    itinerary: [
      arrival(SAP, loc("وحدات عائلية.", "Family units.", "Aile üniteleri."), 40.6914, 30.2678),
      day(loc("البحيرة", "The lake", "Göl"), loc("نزهة ومطاعم سمك.", "Outing and trout restaurants.", "Gezinti ve alabalık restoranları."), 40.6914, 30.2678),
      day(loc("المعشوقية", "Maşukiye", "Maşukiye"), loc("شلال ووقت لعب.", "Falls and play time.", "Şelale ve oyun."), 40.7, 30.18),
      departure(SAP, 40.6914, 30.2678),
    ],
    lat: 40.6914,
    lng: 30.2678,
    groupMax: 7,
  }),
  defineProgram({
    id: "tp-32",
    slug: "bodrum-beach-5-days",
    title: loc("بودروم الشاطئية — 5 أيام", "Bodrum Beach — 5 Days", "Bodrum Plaj — 5 Gün"),
    destination: BOD,
    days: 5,
    price: 799,
    theme: "beach",
    featured: true,
    images: photos(PHOTO.yachtHarbor, PHOTO.aegeanCoast, PHOTO.mediterraneanBeach, PHOTO.hotelPool, PHOTO.luxuryHotel),
    overview: loc(
      "خمسة أيام على إيجه: الميناء، القلعة، وشاطئ بيتيه أو توربا. برنامج إقامة وليس بطاقة فندق.",
      "Five Aegean days: the harbour, castle, and Bitez or Türkbükü beach. A stay program — not a hotel card.",
      "Ege’de beş gün: liman, kale ve Bitez veya Türkbükü."
    ),
    itinerary: [
      arrival(BOD, loc("فندق قرب الميناء أو بيتيه.", "Hotel near the harbour or Bitez.", "Liman veya Bitez oteli."), 37.0344, 27.4305),
      day(loc("القلعة والميناء", "Castle & harbour", "Kale ve liman"), loc("قلعة بودروم والأزقة.", "Bodrum Castle and the lanes.", "Bodrum Kalesi ve sokaklar."), 37.031, 27.429),
      day(loc("يوم شاطئ", "Beach day", "Plaj günü"), loc("بيتيه أو جومبيت.", "Bitez or Gümbet.", "Bitez veya Gümbet."), 37.023, 27.4),
      day(loc("يوم حر", "Free day", "Serbest gün"), loc("يخت قصير اختياري.", "Optional short boat.", "İsteğe kısa tekne."), 37.0344, 27.4305),
      departure(BOD, 37.25, 27.664),
    ],
    lat: 37.0344,
    lng: 27.4305,
  }),
  defineProgram({
    id: "tp-33",
    slug: "bodrum-luxury-6-days",
    title: loc("بودروم الفاخرة — 6 أيام", "Bodrum Luxury — 6 Days", "Bodrum Lüks — 6 Gün"),
    destination: BOD,
    days: 6,
    price: 1199,
    theme: "luxury",
    images: photos(PHOTO.luxuryHotel, PHOTO.yachtHarbor, PHOTO.hotelPool, PHOTO.aegeanCoast, PHOTO.hotelLobby),
    overview: loc(
      "ستة أيام في منتجع فاخر مع يوم يخت ويوم قلعة هادئ.",
      "Six days at a luxury resort with a yacht day and a quiet castle outing.",
      "Lüks tesiste yat günü ve sakin kale gezisiyle altı gün."
    ),
    itinerary: [
      arrival(BOD, loc("منتجع 5 نجوم.", "Five-star resort.", "5 yıldızlı tesis."), 37.077, 27.323),
      day(loc("سبا وشاطئ", "Spa & beach", "Spa ve plaj"), loc("يوم المنشأة.", "Property day.", "Tesis günü."), 37.077, 27.323),
      day(loc("الميناء مساءً", "Harbour evening", "Liman akşamı"), loc("جولة قصيرة وعشاء.", "Short outing and dinner.", "Kısa gezi ve akşam yemeği."), 37.0344, 27.4305),
      day(loc("يوم يخت", "Yacht day", "Yat günü"), loc("خلجان المنطقة.", "Local bays.", "Yöre koyları."), 37.0344, 27.4305),
      day(loc("يوم حر", "Free day", "Serbest gün"), loc("توربا أو ياليكافاك.", "Türkbükü or Yalıkavak.", "Türkbükü veya Yalıkavak."), 37.123, 27.292),
      departure(BOD, 37.25, 27.664),
    ],
    lat: 37.0344,
    lng: 27.4305,
  }),
  defineProgram({
    id: "tp-34",
    slug: "bodrum-ephesus-7-days",
    title: loc("بودروم وأفسس — 7 أيام", "Bodrum & Ephesus — 7 Days", "Bodrum ve Efes — 7 Gün"),
    destination: BOD,
    destinations: [BOD, IZM],
    days: 7,
    price: 999,
    images: photos(PHOTO.ancientRuins, PHOTO.yachtHarbor, PHOTO.aegeanCoast, PHOTO.hotelPool, PHOTO.mediterraneanBeach),
    overview: loc(
      "أسبوع إيجه: إقامة بودروم ويوم أفسس/سلجوق ضمن البرنامج.",
      "An Aegean week: Bodrum stay plus an Ephesus/Selçuk day inside the program.",
      "Ege haftası: Bodrum konaklaması ve program içinde Efes/Selçuk günü."
    ),
    itinerary: [
      arrival(BOD, loc("إقامة بودروم.", "Bodrum stay.", "Bodrum konaklaması."), 37.0344, 27.4305),
      day(loc("القلعة", "The castle", "Kale"), loc("الميناء والمتحف.", "Harbour and museum.", "Liman ve müze."), 37.031, 27.429),
      day(loc("شاطئ", "Beach", "Plaj"), loc("يوم بحر.", "Sea day.", "Deniz günü."), 37.023, 27.4),
      day(loc("يوم حر", "Free day", "Serbest gün"), loc("المنتجع.", "Resort.", "Tesis."), 37.0344, 27.4305),
      day(loc("أفسس", "Ephesus", "Efes"), loc("الانتقال إلى أفسس وبيت مريم ثم المبيت في سلجوق أو العودة.", "Transfer to Ephesus and the House of Mary, overnight in Selçuk or return.", "Efes ve Meryem Ana; Selçuk’ta gece veya dönüş."), 37.9394, 27.3419),
      day(loc("عودة بودروم", "Back to Bodrum", "Bodrum’a dönüş"), loc("وقت حر.", "Free time.", "Serbest zaman."), 37.0344, 27.4305),
      departure(BOD, 37.25, 27.664),
    ],
    lat: 37.9394,
    lng: 27.3419,
  }),
  defineProgram({
    id: "tp-35",
    slug: "aegean-coast-8-days",
    title: loc("ساحل إيجه — 8 أيام", "Aegean Coast — 8 Days", "Ege Kıyısı — 8 Gün"),
    destination: IZM,
    destinations: [IZM, BOD],
    days: 8,
    price: 1149,
    theme: "beach",
    images: photos(PHOTO.aegeanCoast, PHOTO.yachtHarbor, PHOTO.ancientRuins, PHOTO.mediterraneanBeach, PHOTO.luxuryHotel),
    overview: loc(
      "ثمانية أيام بين إزمير وتشيشمه وبودروم — ساحل متعدد المدن.",
      "Eight days across Izmir, Çeşme, and Bodrum — a multi-city coast program.",
      "İzmir, Çeşme ve Bodrum’da sekiz gün — çok şehirli kıyı programı."
    ),
    itinerary: [
      arrival(IZM, loc("إزمير.", "Izmir.", "İzmir."), 38.4237, 27.1428),
      day(loc("كمرألتي وأغورا", "Kemeraltı & Agora", "Kemeraltı ve Agora"), loc("البازار والآثار.", "Bazaar and ruins.", "Çarşı ve ören yeri."), 38.419, 27.134),
      day(loc("تشيشمه", "Çeşme", "Çeşme"), loc("القلعة والشاطئ.", "Castle and beach.", "Kale ve plaj."), 38.322, 26.306),
      day(loc("أفسس", "Ephesus", "Efes"), loc("يوم الآثار.", "Ruins day.", "Ören yeri günü."), 37.9394, 27.3419),
      day(loc("الانتقال إلى بودروم", "Transfer to Bodrum", "Bodrum’a geçiş"), loc("الطريق الساحلي.", "Coastal road.", "Kıyı yolu."), 37.0344, 27.4305),
      day(loc("بودروم", "Bodrum", "Bodrum"), loc("الميناء والقلعة.", "Harbour and castle.", "Liman ve kale."), 37.031, 27.429),
      day(loc("شاطئ بودروم", "Bodrum beach", "Bodrum plajı"), loc("يوم بحر.", "Sea day.", "Deniz günü."), 37.023, 27.4),
      departure(BOD, 37.25, 27.664),
    ],
    lat: 38.4237,
    lng: 27.1428,
  }),
  defineProgram({
    id: "tp-36",
    slug: "izmir-ephesus-4-days",
    title: loc("إزمير وأفسس — 4 أيام", "Izmir & Ephesus — 4 Days", "İzmir ve Efes — 4 Gün"),
    destination: IZM,
    days: 4,
    price: 549,
    images: photos(PHOTO.ancientRuins, PHOTO.istanbulSkyline, PHOTO.aegeanCoast, PHOTO.food, PHOTO.hotelRoom),
    overview: loc(
      "أربع أيام إزمير مع يوم أفسس كامل. برنامج ثقافي متعدد الليالي.",
      "Four Izmir days with a full Ephesus day. A multi-night culture program.",
      "Tam bir Efes günüyle dört İzmir günü."
    ),
    itinerary: [
      arrival(IZM, loc("فندق السكة أو الألسانجاك.", "Alsancak or Konak hotel.", "Alsancak veya Konak oteli."), 38.4237, 27.1428),
      day(loc("أفسس", "Ephesus", "Efes"), loc("المكتبة والمسرح وبيت مريم.", "Library, theatre, House of Mary.", "Kütüphane, tiyatro, Meryem Ana."), 37.9394, 27.3419),
      day(loc("إزمير المدينة", "Izmir city", "İzmir kent"), loc("كمرألتي والكورنيش.", "Kemeraltı and the promenade.", "Kemeraltı ve kordon."), 38.419, 27.134),
      departure(IZM, 38.2924, 27.157),
    ],
    lat: 38.4237,
    lng: 27.1428,
  }),
  defineProgram({
    id: "tp-37",
    slug: "izmir-cesme-5-days",
    title: loc("إزمير وتشيشمه — 5 أيام", "Izmir & Çeşme — 5 Days", "İzmir ve Çeşme — 5 Gün"),
    destination: IZM,
    days: 5,
    price: 649,
    theme: "beach",
    images: photos(PHOTO.aegeanCoast, PHOTO.mediterraneanBeach, PHOTO.yachtHarbor, PHOTO.hotelPool, PHOTO.food),
    overview: loc(
      "ليلتان إزمير وثلاث ليالٍ تشيشمه: مدينة وشاطئ في برنامج واحد.",
      "Two Izmir nights and three in Çeşme: city and beach in one program.",
      "İki İzmir, üç Çeşme gecesi — kent ve plaj."
    ),
    itinerary: [
      arrival(IZM, loc("إزمير.", "Izmir.", "İzmir."), 38.4237, 27.1428),
      day(loc("المدينة", "The city", "Kent"), loc("كمرألتي والكورنيش.", "Kemeraltı and promenade.", "Kemeraltı ve kordon."), 38.419, 27.134),
      day(loc("تشيشمه", "Çeşme", "Çeşme"), loc("الانتقال والشاطئ.", "Transfer and beach.", "Transfer ve plaj."), 38.322, 26.306),
      day(loc("ألاكاتي", "Alaçatı", "Alaçatı"), loc("الأزقة وطواحين الهواء.", "Lanes and windmills.", "Sokaklar ve yel değirmenleri."), 38.282, 26.374),
      departure(IZM, 38.2924, 27.157),
    ],
    lat: 38.322,
    lng: 26.306,
  }),
  defineProgram({
    id: "tp-38",
    slug: "izmir-culture-5-days",
    title: loc("إزمير الثقافية — 5 أيام", "Izmir Culture — 5 Days", "İzmir Kültür — 5 Gün"),
    destination: IZM,
    days: 5,
    price: 599,
    images: photos(PHOTO.ancientRuins, PHOTO.mosqueInterior, PHOTO.food, PHOTO.aegeanCoast, PHOTO.hotelRoom),
    overview: loc(
      "خمسة أيام أفسس، برغامون أو سرديس حسب الموسم، وأسواق إزمير.",
      "Five days of Ephesus, Pergamon or Sardis in season, and Izmir markets.",
      "Efes, mevsimine göre Bergama veya Sardes ve İzmir çarşıları."
    ),
    itinerary: [
      arrival(IZM, loc("إقامة مركزية.", "Central stay.", "Merkezi konaklama."), 38.4237, 27.1428),
      day(loc("أفسس", "Ephesus", "Efes"), loc("يوم الآثار الكامل.", "Full ruins day.", "Tam ören yeri günü."), 37.9394, 27.3419),
      day(loc("برغامون أو سرديس", "Pergamon or Sardis", "Bergama veya Sardes"), loc("حسب الموسم والطريق.", "By season and road time.", "Mevsim ve yol süresine göre."), 39.132, 27.184),
      day(loc("أسواق إزمير", "Izmir markets", "İzmir pazarları"), loc("كمرألتي والمتحف.", "Kemeraltı and a museum.", "Kemeraltı ve müze."), 38.419, 27.134),
      departure(IZM, 38.2924, 27.157),
    ],
    lat: 38.4237,
    lng: 27.1428,
  }),
  defineProgram({
    id: "tp-39",
    slug: "pamukkale-hierapolis-4-days",
    title: loc("باموكالي وهيرابوليس — 4 أيام", "Pamukkale & Hierapolis — 4 Days", "Pamukkale ve Hierapolis — 4 Gün"),
    destination: PAM,
    days: 4,
    price: 499,
    images: photos(PHOTO.whiteTerraces, PHOTO.ancientRuins, PHOTO.hotelPool, PHOTO.landscape, PHOTO.hotelRoom),
    overview: loc(
      "أربع أيام عند المدرجات البيضاء مع هيرابوليس وحمام كليوباترا. إقامة محلية.",
      "Four days at the white terraces with Hierapolis and Cleopatra’s Pool. A local stay.",
      "Beyaz travertenler, Hierapolis ve Kleopatra Havuzu — yerel konaklama."
    ),
    itinerary: [
      arrival(PAM, loc("فندق في باموكالي.", "Hotel in Pamukkale.", "Pamukkale oteli."), 37.9137, 29.1187),
      day(loc("المدرجات وهيرابوليس", "Terraces & Hierapolis", "Travertenler ve Hierapolis"), loc("المشي على الكلس والمسرح.", "Walk the travertines and the theatre.", "Traverten yürüyüşü ve tiyatro."), 37.925, 29.126),
      day(loc("حمام كليوباترا", "Cleopatra’s Pool", "Kleopatra Havuzu"), loc("صباح حراري ووقت حر.", "Thermal morning and free time.", "Termal sabah ve serbest zaman."), 37.925, 29.126),
      departure(PAM, 37.785, 29.701),
    ],
    lat: 37.9137,
    lng: 29.1187,
  }),
  defineProgram({
    id: "tp-40",
    slug: "pamukkale-antalya-6-days",
    title: loc("باموكالي وأنطاليا — 6 أيام", "Pamukkale & Antalya — 6 Days", "Pamukkale ve Antalya — 6 Gün"),
    destination: PAM,
    destinations: [PAM, ANT],
    days: 6,
    price: 749,
    images: photos(PHOTO.whiteTerraces, PHOTO.antalyaCoast, PHOTO.hotelPool, PHOTO.ancientRuins, PHOTO.mediterraneanBeach),
    overview: loc(
      "ليلتان باموكالي ثم أربع ليالٍ أنطاليا — طبيعة بيضاء ثم متوسط.",
      "Two Pamukkale nights then four in Antalya — white landscape then the Mediterranean.",
      "İki Pamukkale, dört Antalya gecesi — beyaz doğa, sonra Akdeniz."
    ),
    itinerary: [
      arrival(PAM, loc("باموكالي.", "Pamukkale.", "Pamukkale."), 37.9137, 29.1187),
      day(loc("هيرابوليس", "Hierapolis", "Hierapolis"), loc("مدرجات ومسرح.", "Terraces and theatre.", "Travertenler ve tiyatro."), 37.925, 29.126),
      day(loc("إلى أنطاليا", "To Antalya", "Antalya’ya"), loc("الطريق إلى المنتجع.", "Road to the resort.", "Tesise yol."), 36.8969, 30.7133),
      day(loc("شاطئ", "Beach", "Plaj"), loc("يوم بحر.", "Sea day.", "Deniz günü."), 36.853, 30.837),
      day(loc("كاليتشي", "Kaleiçi", "Kaleiçi"), loc("البلدة القديمة.", "Old town.", "Eski kent."), 36.885, 30.705),
      departure(ANT, 36.8987, 30.8005),
    ],
    lat: 36.8969,
    lng: 30.7133,
  }),
  defineProgram({
    id: "tp-41",
    slug: "ankara-capital-4-days",
    title: loc("أنقرة العاصمة — 4 أيام", "Ankara Capital — 4 Days", "Ankara Başkent — 4 Gün"),
    destination: ANK,
    days: 4,
    price: 429,
    images: photos(PHOTO.mosqueInterior, PHOTO.ancientRuins, PHOTO.hotelLobby, PHOTO.food, PHOTO.hotelRoom),
    overview: loc(
      "أربع أيام في العاصمة: أنيت كابير، المتحف الأناضولي، والقلعة. برنامج مدني حقيقي.",
      "Four capital days: Anıtkabir, the Museum of Anatolian Civilizations, and the citadel. A real city program.",
      "Anıtkabir, Anadolu Medeniyetleri ve kale — gerçek başkent programı."
    ),
    itinerary: [
      arrival(ANK, loc("فندق في تشانكايا أو أولوس.", "Hotel in Çankaya or Ulus.", "Çankaya veya Ulus oteli."), 39.9334, 32.8597),
      day(loc("أنيت كابير والمتحف", "Anıtkabir & museum", "Anıtkabir ve müze"), loc("ضريح أتاتورك والمتحف الأناضولي.", "Atatürk’s mausoleum and the Anatolian museum.", "Atatürk’ün mozolesi ve Anadolu müzesi."), 39.925, 32.837),
      day(loc("القلعة وأولوس", "Citadel & Ulus", "Kale ve Ulus"), loc("القلعة والأسواق القديمة.", "Citadel and old markets.", "Kale ve eski çarşılar."), 39.94, 32.86),
      departure(ANK, 40.128, 32.995),
    ],
    lat: 39.9334,
    lng: 32.8597,
  }),
  defineProgram({
    id: "tp-42",
    slug: "ankara-cappadocia-6-days",
    title: loc("أنقرة وكابادوكيا — 6 أيام", "Ankara & Cappadocia — 6 Days", "Ankara ve Kapadokya — 6 Gün"),
    destination: ANK,
    destinations: [ANK, CAP],
    days: 6,
    price: 799,
    images: photos(PHOTO.cappadociaValley, PHOTO.mosqueInterior, PHOTO.cappadociaBalloons, PHOTO.caveHotel, PHOTO.hotelLobby),
    overview: loc(
      "ليلتان أنقرة ثم أربع ليالٍ كابادوكيا براً — عاصمة ثم مداخن جنية.",
      "Two Ankara nights then four in Cappadocia by road — capital then fairy chimneys.",
      "İki Ankara, dört Kapadokya gecesi karayoluyla."
    ),
    itinerary: [
      arrival(ANK, loc("أنقرة.", "Ankara.", "Ankara."), 39.9334, 32.8597),
      day(loc("العاصمة", "The capital", "Başkent"), loc("أنيت كابير والقلعة.", "Anıtkabir and citadel.", "Anıtkabir ve kale."), 39.925, 32.837),
      day(loc("إلى كابادوكيا", "To Cappadocia", "Kapadokya’ya"), loc("الطريق وإقامة كهف.", "Road and cave stay.", "Yol ve mağara konaklaması."), 38.6431, 34.8289),
      day(loc("غوريم", "Göreme", "Göreme"), loc("المتحف المفتوح.", "Open-Air Museum.", "Açık Hava Müzesi."), 38.6431, 34.8289),
      day(loc("أوشحيصار", "Uçhisar", "Uçhisar"), loc("قلعة ووديان.", "Castle and valleys.", "Kale ve vadiler."), 38.6289, 34.8056),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 38.6431,
    lng: 34.8289,
  }),
  defineProgram({
    id: "tp-43",
    slug: "gaziantep-culinary-4-days",
    title: loc("غازي عنتاب للمأكولات — 4 أيام", "Gaziantep Culinary — 4 Days", "Gaziantep Mutfak — 4 Gün"),
    destination: GAZ,
    days: 4,
    price: 479,
    images: photos(PHOTO.food, PHOTO.mosqueInterior, PHOTO.grandBazaar, PHOTO.breakfast, PHOTO.hotelRoom),
    overview: loc(
      "أربع أيام في عاصمة المطبخ: البازار، البقلاوة، ومتحف الفسيفساء. برنامج تذوق وإقامة.",
      "Four days in the cuisine capital: bazaar, baklava, and the mosaic museum. A tasting-and-stay program.",
      "Mutfak başkentinde dört gün: çarşı, baklava ve mozaik müzesi."
    ),
    itinerary: [
      arrival(GAZ, loc("فندق وسط عنتاب.", "Central Gaziantep hotel.", "Merkezi Gaziantep oteli."), 37.0662, 37.3833),
      day(loc("البازار والنحاس", "Bazaar & copper", "Çarşı ve bakır"), loc("الأسواق التاريخية وورش النحاس.", "Historic markets and copper workshops.", "Tarihi çarşılar ve bakır atölyeleri."), 37.066, 37.382),
      day(loc("فسيفساء وزيتون", "Mosaics & olive", "Mozaik ve zeytin"), loc("متحف زيوغما وجولة طعام.", "Zeugma Museum and a food walk.", "Zeugma Müzesi ve yemek yürüyüşü."), 37.066, 37.378),
      departure(GAZ, 36.947, 37.479),
    ],
    lat: 37.0662,
    lng: 37.3833,
  }),
  defineProgram({
    id: "tp-44",
    slug: "gaziantep-southeast-6-days",
    title: loc("الجنوب الشرقي: عنتاب وماردين — 6 أيام", "Southeast: Gaziantep & Mardin — 6 Days", "Güneydoğu: Gaziantep ve Mardin — 6 Gün"),
    destination: GAZ,
    days: 6,
    price: 699,
    images: photos(PHOTO.ancientRuins, PHOTO.food, PHOTO.landscape, PHOTO.mosqueInterior, PHOTO.hotelRoom),
    overview: loc(
      "ستة أيام جنوب شرق: عنتاب ثم ماردين الحجرية. برنامج ثقافي أصلي وليس نسخ وكالات.",
      "Six southeast days: Gaziantep then stone-built Mardin. Original cultural program — not agency copy.",
      "Gaziantep ve taş Mardin — ajans kopyası değil, özgün kültür programı."
    ),
    itinerary: [
      arrival(GAZ, loc("عتاب.", "Gaziantep.", "Gaziantep."), 37.0662, 37.3833),
      day(loc("مطبخ عنتاب", "Gaziantep cuisine", "Antep mutfağı"), loc("بازار ومتحف.", "Bazaar and museum.", "Çarşı ve müze."), 37.066, 37.382),
      day(loc("إلى ماردين", "To Mardin", "Mardin’e"), loc("الطريق والمبيت في البلدة القديمة.", "Road and old-town overnight.", "Yol ve eski kentte gece."), 37.313, 40.735),
      day(loc("ماردين ودير الزعفران", "Mardin & Deyrulzafaran", "Mardin ve Deyrulzafaran"), loc("الأزقة والدير.", "Lanes and the monastery.", "Sokaklar ve manastır."), 37.313, 40.735),
      day(loc("عودة عنتاب", "Return Gaziantep", "Gaziantep dönüşü"), loc("وقت حر للتسوق الغذائي.", "Free time for food shopping.", "Yiyecek alışverişi için serbest zaman."), 37.0662, 37.3833),
      departure(GAZ, 36.947, 37.479),
    ],
    lat: 37.313,
    lng: 40.735,
  }),
  defineProgram({
    id: "tp-45",
    slug: "fethiye-oludeniz-5-days",
    title: loc("فتحية وأولو دنيز — 5 أيام", "Fethiye & Ölüdeniz — 5 Days", "Fethiye ve Ölüdeniz — 5 Gün"),
    destination: FET,
    days: 5,
    price: 699,
    theme: "beach",
    featured: true,
    images: photos(PHOTO.mediterraneanBeach, PHOTO.aegeanCoast, PHOTO.yachtHarbor, PHOTO.landscape, PHOTO.hotelPool),
    overview: loc(
      "خمسة أيام على البحيرة الزرقاء: أولو دنيز، وادي الفراشات، وميناء فتحية.",
      "Five days on the blue lagoon: Ölüdeniz, Butterfly Valley viewpoint, and Fethiye harbour.",
      "Mavi lagünde beş gün: Ölüdeniz, Kelebekler Vadisi manzarası ve Fethiye limanı."
    ),
    itinerary: [
      arrival(FET, loc("فندق أولو دنيز أو فتحية.", "Hotel in Ölüdeniz or Fethiye.", "Ölüdeniz veya Fethiye oteli."), 36.6213, 29.1164),
      day(loc("أولو دنيز", "Ölüdeniz", "Ölüdeniz"), loc("الشاطئ والبحيرة الراكدة.", "Beach and the still lagoon.", "Plaj ve durgun lagün."), 36.5497, 29.1147),
      day(loc("وادي الفراشات وكayakoy", "Butterfly Valley & Kayaköy", "Kelebekler Vadisi ve Kayaköy"), loc("نقاط مشاهدة والقرية المهجورة.", "Viewpoints and the abandoned village.", "Manzara ve terk edilmiş köy."), 36.541, 29.123),
      day(loc("الميناء", "The harbour", "Liman"), loc("فتحية والأسواق.", "Fethiye and markets.", "Fethiye ve çarşılar."), 36.6213, 29.1164),
      departure(FET, 36.713, 28.792),
    ],
    lat: 36.5497,
    lng: 29.1147,
  }),
  defineProgram({
    id: "tp-46",
    slug: "fethiye-blue-voyage-7-days",
    title: loc("فتحية والرحلة الزرقاء — 7 أيام", "Fethiye Blue Voyage Week — 7 Days", "Fethiye Mavi Yolculuk — 7 Gün"),
    destination: FET,
    days: 7,
    price: 999,
    theme: "beach",
    images: photos(PHOTO.yachtHarbor, PHOTO.mediterraneanBeach, PHOTO.aegeanCoast, PHOTO.landscape, PHOTO.luxuryHotel),
    overview: loc(
      "أسبوع يمزج ليالي فندق مع يومين قارب على الخلجان — رحلة زرقاء بأسلوب منظم.",
      "A week mixing hotel nights with two bay-boat days — a structured blue-voyage style.",
      "Otel geceleri ve iki koy tekne günü — düzenli mavi yolculuk tarzı."
    ),
    itinerary: [
      arrival(FET, loc("فتحية.", "Fethiye.", "Fethiye."), 36.6213, 29.1164),
      day(loc("أولو دنيز", "Ölüdeniz", "Ölüdeniz"), loc("بحيرة زرقاء.", "Blue lagoon.", "Mavi lagün."), 36.5497, 29.1147),
      day(loc("يوم قارب 1", "Boat day 1", "Tekne günü 1"), loc("خلجان المنطقة.", "Local bays.", "Yöre koyları."), 36.55, 29.1),
      day(loc("يوم قارب 2", "Boat day 2", "Tekne günü 2"), loc("سباحة وتوقف غداء على المركب.", "Swimming and onboard lunch stop.", "Yüzme ve teknede öğle molası."), 36.56, 29.08),
      day(loc("كاياكوي", "Kayaköy", "Kayaköy"), loc("القرية المهجورة.", "Abandoned village.", "Terk edilmiş köy."), 36.575, 29.09),
      day(loc("يوم حر", "Free day", "Serbest gün"), loc("شاطئ أو سوق.", "Beach or market.", "Plaj veya pazar."), 36.6213, 29.1164),
      departure(FET, 36.713, 28.792),
    ],
    lat: 36.6213,
    lng: 29.1164,
  }),
  defineProgram({
    id: "tp-47",
    slug: "fethiye-pamukkale-6-days",
    title: loc("فتحية وباموكالي — 6 أيام", "Fethiye & Pamukkale — 6 Days", "Fethiye ve Pamukkale — 6 Gün"),
    destination: FET,
    destinations: [FET, PAM],
    days: 6,
    price: 849,
    images: photos(PHOTO.mediterraneanBeach, PHOTO.whiteTerraces, PHOTO.yachtHarbor, PHOTO.ancientRuins, PHOTO.landscape),
    overview: loc(
      "أربع ليالٍ فتحية وليلة باموكالي — ساحل ثم مدرجات بيضاء.",
      "Four Fethiye nights and one in Pamukkale — coast then white terraces.",
      "Dört Fethiye, bir Pamukkale gecesi — kıyı sonra beyaz travertenler."
    ),
    itinerary: [
      arrival(FET, loc("فتحية.", "Fethiye.", "Fethiye."), 36.6213, 29.1164),
      day(loc("أولو دنيز", "Ölüdeniz", "Ölüdeniz"), loc("الشاطئ.", "The beach.", "Plaj."), 36.5497, 29.1147),
      day(loc("يوم حر ساحلي", "Coastal free day", "Kıyı serbest günü"), loc("قارب أو استرخاء.", "Boat or rest.", "Tekne veya dinlenme."), 36.6213, 29.1164),
      day(loc("باموكالي", "Pamukkale", "Pamukkale"), loc("الطريق والمدرجات.", "Road and terraces.", "Yol ve travertenler."), 37.9137, 29.1187),
      day(loc("هيرابوليس", "Hierapolis", "Hierapolis"), loc("صباح آثار ثم العودة أو المطار.", "Morning ruins then return or airport.", "Sabah ören yeri, sonra dönüş veya havalimanı."), 37.925, 29.126),
      departure(FET, 36.713, 28.792),
    ],
    lat: 36.6213,
    lng: 29.1164,
  }),
  defineProgram({
    id: "tp-48",
    slug: "konya-spiritual-4-days",
    title: loc("قونية الروحية — 4 أيام", "Konya Spiritual — 4 Days", "Konya Manevi — 4 Gün"),
    destination: KON,
    days: 4,
    price: 449,
    images: photos(PHOTO.mosqueInterior, PHOTO.food, PHOTO.hotelLobby, PHOTO.landscape, PHOTO.hotelRoom),
    overview: loc(
      "أربع أيام عند مولانا: المتحف، التكية، وسوق تقليدي. برنامج هادئ متعدد الليالي.",
      "Four days around Mevlana: museum, lodge, and a traditional market. A quiet multi-night program.",
      "Mevlana çevresinde dört gün: müze, dergâh ve geleneksel pazar."
    ),
    itinerary: [
      arrival(KON, loc("فندق قرب المتحف.", "Hotel near the museum.", "Müze yakını otel."), 37.8746, 32.4932),
      day(loc("مولانا", "Mevlana", "Mevlana"), loc("المتحف والمسجد.", "Museum and mosque.", "Müze ve cami."), 37.8706, 32.5047),
      day(loc("سوق وألادين", "Market & Alaeddin", "Pazar ve Alaeddin"), loc("تلة ألادين والأسواق.", "Alaeddin Hill and markets.", "Alaeddin Tepesi ve çarşılar."), 37.873, 32.492),
      departure(KON, 37.979, 32.562),
    ],
    lat: 37.8746,
    lng: 32.4932,
  }),
  defineProgram({
    id: "tp-49",
    slug: "konya-cappadocia-5-days",
    title: loc("قونية وكابادوكيا — 5 أيام", "Konya & Cappadocia — 5 Days", "Konya ve Kapadokya — 5 Gün"),
    destination: KON,
    destinations: [KON, CAP],
    days: 5,
    price: 699,
    images: photos(PHOTO.cappadociaValley, PHOTO.mosqueInterior, PHOTO.cappadociaBalloons, PHOTO.caveHotel, PHOTO.food),
    overview: loc(
      "ليلة قونية ثم ثلاث ليالٍ كابادوكيا — روحانية ثم وديان.",
      "One Konya night then three in Cappadocia — spiritual then valleys.",
      "Bir Konya, üç Kapadokya gecesi — maneviyat sonra vadiler."
    ),
    itinerary: [
      arrival(KON, loc("قونية.", "Konya.", "Konya."), 37.8746, 32.4932),
      day(loc("مولانا ثم الطريق", "Mevlana then the road", "Mevlana sonra yol"), loc("زيارة صباحية والانتقال إلى غوريم.", "Morning visit and transfer to Göreme.", "Sabah ziyaret ve Göreme’ye geçiş."), 38.6431, 34.8289),
      day(loc("غوريم", "Göreme", "Göreme"), loc("المتحف المفتوح.", "Open-Air Museum.", "Açık Hava Müzesi."), 38.6431, 34.8289),
      day(loc("أوشحيصار", "Uçhisar", "Uçhisar"), loc("قلعة ووديان.", "Castle and valleys.", "Kale ve vadiler."), 38.6289, 34.8056),
      departure(CAP, 38.7704, 35.4954),
    ],
    lat: 38.6431,
    lng: 32.4932,
  }),
  defineProgram({
    id: "tp-50",
    slug: "grand-turkey-10-days",
    title: loc("تركيا الكبرى: إسطنبول كابادوكيا أنطاليا — 10 أيام", "Grand Turkey: Istanbul, Cappadocia, Antalya — 10 Days", "Büyük Türkiye: İstanbul, Kapadokya, Antalya — 10 Gün"),
    destination: IST,
    destinations: [IST, CAP, ANT],
    days: 10,
    price: 1699,
    featured: true,
    theme: "classic",
    tripMode: "group",
    images: photos(PHOTO.hagiaSophia, PHOTO.cappadociaBalloons, PHOTO.antalyaCoast, PHOTO.bosphorus, PHOTO.hotelPool, PHOTO.caveHotel),
    overview: loc(
      "عشرة أيام تغطي المدن الثلاث الأشهر بطيران داخلي: تاريخ، وديان، ثم شاطئ. برنامج مجموعات صغيرة أو خاص.",
      "Ten days covering the three classic cities on domestic flights: history, valleys, then beach. Small-group or private.",
      "İç hatlarla üç klasik şehir: tarih, vadiler, sonra plaj."
    ),
    itinerary: [
      arrival(IST, loc("إسطنبول.", "Istanbul.", "İstanbul."), 41.0082, 28.9784),
      day(loc("التاريخية", "Historic day", "Tarihi gün"), loc("آيا صوفيا وتوبكابي.", "Hagia Sophia and Topkapi.", "Ayasofya ve Topkapı."), 41.0086, 28.9802),
      day(loc("البوسفور", "Bosphorus", "Boğaz"), loc("مضيق وبازار.", "Strait and bazaar.", "Boğaz ve çarşı."), 41.0256, 28.9744),
      day(loc("كابادوكيا", "Cappadocia", "Kapadokya"), loc("طيران داخلي.", "Domestic flight.", "İç hat uçuşu."), 38.6431, 34.8289),
      day(loc("الوديان", "Valleys", "Vadiler"), loc("غوريم وأوشحيصار.", "Göreme and Uçhisar.", "Göreme ve Uçhisar."), 38.6431, 34.8289),
      day(loc("أفانوس", "Avanos", "Avanos"), loc("فخار ومدينة تحت الأرض.", "Pottery and underground city.", "Çömlek ve yeraltı şehri."), 38.7156, 34.8467),
      day(loc("أنطاليا", "Antalya", "Antalya"), loc("طيران إلى المتوسط.", "Flight to the Mediterranean.", "Akdeniz uçuşu."), 36.8969, 30.7133),
      day(loc("كاليتشي", "Kaleiçi", "Kaleiçi"), loc("بلدة قديمة.", "Old town.", "Eski kent."), 36.885, 30.705),
      day(loc("شاطئ", "Beach", "Plaj"), loc("يوم منتجع.", "Resort day.", "Tesis günü."), 36.853, 30.837),
      departure(ANT, 36.8987, 30.8005),
    ],
    lat: 41.0082,
    lng: 28.9784,
    groupMin: 4,
    groupMax: 16,
  }),
  defineProgram({
    id: "tp-51",
    slug: "west-turkey-8-days",
    title: loc("غرب تركيا: إسطنبول بورصة إزمير باموكالي — 8 أيام", "West Turkey: Istanbul, Bursa, Izmir, Pamukkale — 8 Days", "Batı Türkiye: İstanbul, Bursa, İzmir, Pamukkale — 8 Gün"),
    destination: IST,
    destinations: [IST, BUR, IZM, PAM],
    days: 8,
    price: 1299,
    theme: "classic",
    images: photos(PHOTO.hagiaSophia, PHOTO.ancientRuins, PHOTO.whiteTerraces, PHOTO.mountains, PHOTO.aegeanCoast),
    overview: loc(
      "ثمانية أيام براً وجواً عبر غرب الأناضول: عثمانيون، أفسس، ومدرجات بيضاء.",
      "Eight days by road and air across western Anatolia: Ottomans, Ephesus, and white terraces.",
      "Batı Anadolu’da kara ve hava ile sekiz gün: Osmanlı, Efes, travertenler."
    ),
    itinerary: [
      arrival(IST, loc("إسطنبول.", "Istanbul.", "İstanbul."), 41.0082, 28.9784),
      day(loc("إسطنبول", "Istanbul", "İstanbul"), loc("شبه الجزيرة.", "The peninsula.", "Yarımada."), 41.0086, 28.9802),
      day(loc("بورصة", "Bursa", "Bursa"), loc("الطريق إلى أول عاصمة.", "Road to the first capital.", "İlk başkente yol."), 40.1885, 29.061),
      day(loc("إلى إزمير", "To Izmir", "İzmir’e"), loc("انتقال وإقامة.", "Transfer and stay.", "Transfer ve konaklama."), 38.4237, 27.1428),
      day(loc("أفسس", "Ephesus", "Efes"), loc("يوم الآثار.", "Ruins day.", "Ören yeri günü."), 37.9394, 27.3419),
      day(loc("باموكالي", "Pamukkale", "Pamukkale"), loc("المدرجات.", "The terraces.", "Travertenler."), 37.9137, 29.1187),
      day(loc("عودة إزمير", "Back toward Izmir", "İzmir yönü"), loc("وقت حر أو متحف.", "Free time or a museum.", "Serbest zaman veya müze."), 38.4237, 27.1428),
      departure(IZM, 38.2924, 27.157),
    ],
    lat: 38.4237,
    lng: 27.1428,
  }),
  defineProgram({
    id: "tp-52",
    slug: "turkey-highlights-group-9-days",
    title: loc("معالم تركيا للمجموعات — 9 أيام", "Turkey Highlights Group — 9 Days", "Türkiye Öne Çıkanlar Grup — 9 Gün"),
    destination: IST,
    destinations: [IST, CAP, ANT],
    days: 9,
    price: 1399,
    theme: "group",
    tripMode: "group",
    images: photos(PHOTO.istanbulSkyline, PHOTO.cappadociaValley, PHOTO.antalyaCoast, PHOTO.hagiaSophia, PHOTO.balloonsSunrise),
    overview: loc(
      "تسعة أيام لمجموعات 8–16 شخصاً: إسطنبول، كابادوكيا، أنطاليا بأسعار للشخص مع تنقلات مشتركة داخل المجموعة.",
      "Nine days for groups of 8–16: Istanbul, Cappadocia, Antalya at a per-person rate with in-group shared transfers.",
      "8–16 kişilik gruplar için dokuz gün: İstanbul, Kapadokya, Antalya; kişi başı fiyat, grup içi transfer."
    ),
    itinerary: [
      arrival(IST, loc("إسطنبول.", "Istanbul.", "İstanbul."), 41.0082, 28.9784),
      day(loc("مجموعة السلطان أحمد", "Sultanahmet group day", "Sultanahmet grup günü"), loc("معالم أساسية معاً.", "Core sights together.", "Ana yerler birlikte."), 41.0086, 28.9802),
      day(loc("البوسفور مجموعة", "Group Bosphorus", "Grup Boğaz"), loc("مسار المضيق.", "Strait circuit.", "Boğaz güzergâhı."), 41.0256, 28.9744),
      day(loc("كابادوكيا", "Cappadocia", "Kapadokya"), loc("طيران المجموعة.", "Group flight.", "Grup uçuşu."), 38.6431, 34.8289),
      day(loc("وديان المجموعة", "Group valleys", "Grup vadileri"), loc("غوريم مشترك.", "Shared Göreme.", "Paylaşımlı Göreme."), 38.6431, 34.8289),
      day(loc("أوشحيصار", "Uçhisar", "Uçhisar"), loc("قلعة معاً.", "Castle together.", "Kale birlikte."), 38.6289, 34.8056),
      day(loc("أنطاليا", "Antalya", "Antalya"), loc("طيران إلى الساحل.", "Flight to the coast.", "Kıyıya uçuş."), 36.8969, 30.7133),
      day(loc("شاطئ المجموعة", "Group beach", "Grup plajı"), loc("منتجع مشترك.", "Shared resort day.", "Paylaşımlı tesis günü."), 36.853, 30.837),
      departure(ANT, 36.8987, 30.8005),
    ],
    lat: 41.0082,
    lng: 28.9784,
    groupMin: 8,
    groupMax: 16,
  }),
];
