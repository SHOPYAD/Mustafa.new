import { PHOTO } from "@/data/catalog-photos";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";
import { sampleVipReviews } from "@/data/sample-reviews";
import type { MapRoutePoint, TransferService } from "@/types/transfer";

type L3 = { ar: string; en: string; tr: string };

const WA = DEFAULT_SITE_WHATSAPP;

const SEDAN_PHOTOS = [PHOTO.mercedesSedan, PHOTO.luxurySedan, PHOTO.carInterior, PHOTO.bmw];
const VAN_PHOTOS = [PHOTO.mercedesVan, PHOTO.suv, PHOTO.carInterior, PHOTO.luxurySedan];
const SPRINTER_PHOTOS = [PHOTO.sprinter, PHOTO.minibus, PHOTO.mercedesVan, PHOTO.carInterior];

function loc(ar: string, en: string, tr: string): L3 {
  return { ar, en, tr };
}

function stop(
  lat: number,
  lng: number,
  label: L3,
  desc: L3,
  photo: string
): MapRoutePoint {
  return {
    lat,
    lng,
    labelAr: label.ar,
    labelEn: label.en,
    labelTr: label.tr,
    descriptionAr: desc.ar,
    descriptionEn: desc.en,
    descriptionTr: desc.tr,
    photo,
  };
}

function defineVip(opts: {
  id: string;
  slug: string;
  title: L3;
  overview: L3;
  vehicle: "sedan" | "minivan" | "sprinter";
  price: number;
  hours: number;
  featured?: boolean;
  from: L3;
  to: L3;
  highlights: L3[];
  includes: L3[];
  excludes: L3[];
  program: L3[];
  stops: MapRoutePoint[];
  landmarkPhotos: string[];
  tips: L3[];
}): TransferService {
  const fleetFor = (vehicle: "sedan" | "minivan" | "sprinter") => {
    switch (vehicle) {
      case "sedan":
        return { name: "Mercedes-Benz E-Class", type: "Sedan", seats: 3, luggage: 3, photos: SEDAN_PHOTOS };
      case "minivan":
        return { name: "Mercedes-Benz V-Class", type: "Minivan", seats: 7, luggage: 6, photos: VAN_PHOTOS };
      case "sprinter":
        return { name: "Mercedes-Benz Sprinter", type: "Sprinter", seats: 20, luggage: 16, photos: SPRINTER_PHOTOS };
      default: {
        const _never: never = vehicle;
        return _never;
      }
    }
  };
  const fleet = fleetFor(opts.vehicle);
  const vehicleName = fleet.name;
  const vehicleType = fleet.type;
  const seats = fleet.seats;
  const luggage = fleet.luggage;
  const carPhotos = fleet.photos;

  const vehiclePitch =
    opts.vehicle === "sprinter"
      ? loc(
          `المركبة مرسيدس سبرينتر خاصة تتسع حتى 20 راكباً مع مساحة أمتعة للمجموعة. السعر المعروض هو سعر المركبة كاملة لساعات البرنامج، وليس سعراً للشخص، وليست تذكرة حافلة عامة.`,
          `The vehicle is a private Mercedes Sprinter for up to 20 guests with group luggage space. The listed price is for the whole vehicle for the program hours — not per person, and not a public-bus ticket.`,
          `Araç, 20 kişiye kadar özel Mercedes Sprinter’dır. Listelenen fiyat program saatleri için tüm araçtır; kişi başı veya halk otobüsü bileti değildir.`
        )
      : opts.vehicle === "minivan"
        ? loc(
            `المركبة مرسيدس في-كلاس خاصة حتى 7 ركاب مع أمتعة يدوية. السعر للمركبة بالدولار الأمريكي. يمكن طلب سيدان إي-كلاس لعدد أصغر عبر واتساب.`,
            `The vehicle is a private Mercedes V-Class for up to 7 guests with cabin luggage. The price is per vehicle in US dollars. A smaller E-Class sedan can be requested on WhatsApp.`,
            `Araç, 7 kişiye kadar özel Mercedes V-Class’tır. Fiyat araç başı USD’dir. Daha küçük E-Class sedan WhatsApp’tan istenebilir.`
          )
        : loc(
            `المركبة مرسيدس إي-كلاس فاخرة لعدد صغير حتى 3 ركاب. للعائلات حتى 7 نطلب في-كلاس بنفس أسلوب الجولة الخاصة — ليس ترانسفير مطار.`,
            `The vehicle is a Mercedes E-Class sedan for a small party of up to 3. Families of up to 7 can request a V-Class with the same private-day style — not an airport transfer.`,
            `Araç, en fazla 3 kişilik Mercedes E-Class sedan’dır. 7 kişilik aileler aynı özel gün tarzında V-Class isteyebilir — havalimanı transferi değil.`
          );

  const overview = loc(
    `${opts.overview.ar}\n\n${vehiclePitch.ar} مدة البرنامج حوالي ${opts.hours} ساعات مع استلام من الفندق وعودة إليه في نهاية اليوم. الجدول أدناه ساعة بساعة: الاستلام، المحطات، نافذة الغداء، والعودة.\n\nتذاكر المعالم والوجبات غير مشمولة إلا إذا ذُكر خلاف ذلك. يمكن تقديم أو تأخير محطة ضمن الوقت المتفق عليه. احجز عبر واتساب لوناليزا للسياحة والسفر برقم المركبة والتاريخ.`,
    `${opts.overview.en}\n\n${vehiclePitch.en} The program lasts about ${opts.hours} hours with hotel pickup and drop-off at the end of the day. The timeline below is hourly: pickup, stops, a lunch window, and return.\n\nAttraction tickets and meals are extra unless stated. Stops can shift within the booked hours. Book on Alrayyan Tourism WhatsApp with the vehicle type and date.`,
    `${opts.overview.tr}\n\n${vehiclePitch.tr} Program yaklaşık ${opts.hours} saat sürer; otelden alış ve gün sonunda bırakış vardır. Aşağıdaki saatlik akış: alış, duraklar, öğle penceresi ve dönüş.\n\nMüze biletleri ve yemekler belirtilmedikçe extra’dır. Duraklar rezerve saatler içinde kayabilir. Alrayyan Turizm WhatsApp’tan araç tipi ve tarihle rezervasyon yapın.`
  );

  return {
    id: opts.id,
    slug: opts.slug,
    type: "vip_tour",
    titleAr: opts.title.ar,
    titleEn: opts.title.en,
    titleTr: opts.title.tr,
    descriptionAr: overview.ar,
    descriptionEn: overview.en,
    descriptionTr: overview.tr,
    vehicleName,
    vehicleType,
    vehicleClass: "VIP",
    seats,
    luggage,
    price: opts.price,
    currency: "USD",
    durationHours: opts.hours,
    routeFrom: opts.from.en,
    routeTo: opts.to.en,
    routeFromAr: opts.from.ar,
    routeToAr: opts.to.ar,
    highlightsAr: opts.highlights.map((h) => h.ar),
    highlightsEn: opts.highlights.map((h) => h.en),
    includesAr: opts.includes.map((h) => h.ar),
    includesEn: opts.includes.map((h) => h.en),
    images: [...opts.landmarkPhotos.slice(0, 3), carPhotos[0]],
    carPhotos,
    programAr: opts.program.map((p) => p.ar),
    programEn: opts.program.map((p) => p.en),
    programTr: opts.program.map((p) => p.tr),
    mapRoute: opts.stops,
    tipsAr: opts.tips.map((t) => t.ar),
    tipsEn: opts.tips.map((t) => t.en),
    excludedAr: opts.excludes.map((e) => e.ar),
    excludedEn: opts.excludes.map((e) => e.en),
    reviews: sampleVipReviews(opts.id, 20),
    whatsappNumber: WA,
    whatsappMessageAr: `مرحباً لوناليزا للسياحة والسفر، أرغب بحجز ${opts.title.ar} (سعر المركبة ${opts.price} دولار).`,
    whatsappMessageEn: `Hello Alrayyan Tourism, I would like to book ${opts.title.en} (vehicle price USD ${opts.price}).`,
    isFeatured: Boolean(opts.featured),
    isActive: true,
  };
}

const HOTEL_IST = loc("فندقك في إسطنبول", "Your Istanbul hotel", "İstanbul oteliniz");
const HOTEL_TRB = loc("فندقك في طرابزون", "Your Trabzon hotel", "Trabzon oteliniz");
const HOTEL_ANT = loc("فندقك في أنطاليا", "Your Antalya hotel", "Antalya oteliniz");
const HOTEL_CAP = loc("فندقك في كابادوكيا", "Your Cappadocia hotel", "Kapadokya oteliniz");
const HOTEL_IZM = loc("فندقك في إزمير", "Your Izmir hotel", "İzmir oteliniz");
const HOTEL_BOD = loc("فندقك في بودروم", "Your Bodrum hotel", "Bodrum oteliniz");

const INC_VIP: L3[] = [
  loc("مركبة خاصة مع سائق لساعات البرنامج", "Private vehicle and driver for the program hours", "Program saatleri boyunca özel araç ve şoför"),
  loc("مياه ومناشف منعشة", "Water and refreshing towels", "Su ve ferahlatıcı havlu"),
  loc("رسوم الطريق والجسور", "Toll and bridge fees", "Yol ve köprü ücretleri"),
  loc("جدول مرن ضمن الوقت المتفق عليه", "Flexible timing within the booked hours", "Rezerve saatler içinde esnek tempo"),
];

const EX_VIP: L3[] = [
  loc("تذاكر دخول المعالم", "Attraction entrance tickets", "Müze ve ören yeri girişleri"),
  loc("وجبات الغداء والعشاء", "Lunch and dinner", "Öğle ve akşam yemeği"),
  loc("البقشيش الشخصي", "Personal gratuities", "Kişisel bahşiş"),
];

export const vipDailyTours: TransferService[] = [
  defineVip({
    id: "vip-1",
    slug: "istanbul-full-day-vip-tour",
    title: loc("جولة إسطنبول القديمة VIP", "Istanbul Old City VIP Day", "İstanbul Eski Şehir VIP"),
    overview: loc(
      "يوم خاص في شبه الجزيرة التاريخية بسيارة سيدان أو ميني فان حتى 7 ركاب. ليست حافلة عامة وليست ترانسفير مطار.",
      "A private historic-peninsula day in a sedan or minivan for up to 7 guests. Not a public bus and not an airport transfer.",
      "Tarihi yarımadada en fazla 7 kişilik özel gün. Halk otobüsü veya havalimanı transferi değil."
    ),
    vehicle: "sedan",
    price: 280,
    hours: 8,
    featured: true,
    from: HOTEL_IST,
    to: loc("دائرة السلطان أحمد وغلطة", "Sultanahmet & Galata circuit", "Sultanahmet ve Galata güzergâhı"),
    highlights: [
      loc("آيا صوفيا والمسجد الأزرق", "Hagia Sophia & Blue Mosque", "Ayasofya ve Sultanahmet Camii"),
      loc("توبكابي والبازار", "Topkapi & Grand Bazaar", "Topkapı ve Kapalıçarşı"),
      loc("برج غلطة", "Galata Tower", "Galata Kulesi"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام من الفندق", "09:00 — Hotel pickup", "09:00 — Otelden alış"),
      loc("09:30 — آيا صوفيا والمسجد الأزرق", "09:30 — Hagia Sophia & Blue Mosque", "09:30 — Ayasofya ve Sultanahmet Camii"),
      loc("11:30 — قصر توبكابي", "11:30 — Topkapi Palace", "11:30 — Topkapı Sarayı"),
      loc("13:00 — غداء حر في أمينونو", "13:00 — Free lunch in Eminönü", "13:00 — Eminönü’nde serbest öğle"),
      loc("14:30 — السوق الكبير", "14:30 — Grand Bazaar", "14:30 — Kapalıçarşı"),
      loc("16:30 — غلطة وكاراتشوي", "16:30 — Galata & Karaköy", "16:30 — Galata ve Karaköy"),
      loc("18:00 — العودة إلى الفندق", "18:00 — Return to hotel", "18:00 — Otele dönüş"),
    ],
    stops: [
      stop(41.0086, 28.9802, loc("آيا صوفيا", "Hagia Sophia", "Ayasofya"), loc("معلم إسطنبول الأيقوني بين المتحف والمسجد.", "Istanbul’s iconic landmark between museum and mosque.", "Müze ve cami arasında ikonik yapı."), PHOTO.hagiaSophia),
      stop(41.0054, 28.9768, loc("المسجد الأزرق", "Blue Mosque", "Sultanahmet Camii"), loc("مسجد السلطان أحمد بقبابه الست.", "The Sultanahmet Mosque with its six minarets.", "Altı minareli Sultanahmet Camii."), PHOTO.blueMosque),
      stop(41.0115, 28.9833, loc("توبكابي", "Topkapi Palace", "Topkapı Sarayı"), loc("قصر السلاطين العثمانيين فوق القرن الذهبي.", "Ottoman sultans’ palace above the Golden Horn.", "Haliç’e bakan Osmanlı sarayı."), PHOTO.mosqueInterior),
      stop(41.0107, 28.9685, loc("السوق الكبير", "Grand Bazaar", "Kapalıçarşı"), loc("أحد أقدم الأسواق المسقوفة في العالم.", "One of the world’s oldest covered markets.", "Dünyanın en eski kapalı çarşılarından."), PHOTO.grandBazaar),
      stop(41.0256, 28.9744, loc("برج غلطة", "Galata Tower", "Galata Kulesi"), loc("برج جنوي مطل على القرن الذهبي.", "Genoese tower over the Golden Horn.", "Haliç’e bakan Ceneviz kulesi."), PHOTO.istanbulSkyline),
    ],
    landmarkPhotos: [PHOTO.hagiaSophia, PHOTO.blueMosque, PHOTO.istanbulSkyline],
    tips: [
      loc("ملابس محتشمة لدخول المساجد", "Modest clothing for mosque visits", "Cami ziyareti için örtülü giysi"),
      loc("تذاكر توبكابي تُشترى على حدة", "Topkapi tickets are purchased separately", "Topkapı biletleri ayrı alınır"),
    ],
  }),
  defineVip({
    id: "vip-2",
    slug: "bosphorus-asian-side-vip-tour",
    title: loc("البوسفور والجانب الآسيوي VIP", "Bosphorus & Asian Side VIP", "Boğaz ve Anadolu Yakası VIP"),
    overview: loc(
      "يوم خاص على المضيق: دولمابهتشه، أورتاكوي، أسكودار، ومودا. حتى 7 ركاب.",
      "A private strait day: Dolmabahçe, Ortaköy, Üsküdar, and Moda. Up to 7 guests.",
      "Boğaz’da özel gün: Dolmabahçe, Ortaköy, Üsküdar ve Moda. En fazla 7 kişi."
    ),
    vehicle: "sedan",
    price: 260,
    hours: 7,
    featured: true,
    from: HOTEL_IST,
    to: loc("دائرة البوسفور", "Bosphorus circuit", "Boğaz güzergâhı"),
    highlights: [
      loc("دولمابهتشه", "Dolmabahçe Palace", "Dolmabahçe Sarayı"),
      loc("أورتاكوي وأسكودار", "Ortaköy & Üsküdar", "Ortaköy ve Üsküdar"),
      loc("مودا وكاديكوي", "Moda & Kadıköy", "Moda ve Kadıköy"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("10:00 — استلام من الفندق", "10:00 — Hotel pickup", "10:00 — Otelden alış"),
      loc("10:30 — دولمابهتشه", "10:30 — Dolmabahçe Palace", "10:30 — Dolmabahçe"),
      loc("12:00 — أورتاكوي والجسر", "12:00 — Ortaköy & bridge", "12:00 — Ortaköy ve köprü"),
      loc("13:30 — غداء في أسكودار", "13:30 — Lunch in Üsküdar", "13:30 — Üsküdar öğle"),
      loc("15:00 — برج الفتاة من اليابسة", "15:00 — Maiden’s Tower viewpoint", "15:00 — Kız Kulesi manzarası"),
      loc("16:00 — مودا", "16:00 — Moda waterfront", "16:00 — Moda sahili"),
      loc("17:30 — العودة", "17:30 — Return", "17:30 — Dönüş"),
    ],
    stops: [
      stop(41.0391, 29.0002, loc("دولمابهتشه", "Dolmabahçe", "Dolmabahçe"), loc("قصر القرن التاسع عشر على البوسفور.", "Nineteenth-century palace on the Bosphorus.", "Boğaz’da 19. yüzyıl sarayı."), PHOTO.bosphorus),
      stop(41.0553, 29.0267, loc("أورتاكوي", "Ortaköy", "Ortaköy"), loc("المسجد المائي والجسر.", "Waterfront mosque and the bridge.", "Sahil camii ve köprü."), PHOTO.istanbulSkyline),
      stop(41.0214, 29.0152, loc("أسكودار", "Üsküdar", "Üsküdar"), loc("جانب آسيوي كلاسيكي.", "Classic Asian-side waterfront.", "Klasik Anadolu yakası."), PHOTO.bosphorus),
      stop(40.9889, 29.0256, loc("مودا", "Moda", "Moda"), loc("كورنيش كاديكوي الهادئ.", "Quiet Kadıköy promenade.", "Sakin Kadıköy sahili."), PHOTO.coastalTown),
    ],
    landmarkPhotos: [PHOTO.bosphorus, PHOTO.istanbulSkyline, PHOTO.coastalTown],
    tips: [
      loc("دولمابهتشه يحتاج حجزاً مسبقاً في الموسم", "Dolmabahçe needs advance tickets in season", "Sezonda Dolmabahçe için ön bilet"),
    ],
  }),
  defineVip({
    id: "vip-3",
    slug: "bursa-day-trip-vip",
    title: loc("بورصة يوم كامل VIP", "Bursa Full Day VIP", "Bursa Tam Gün VIP"),
    overview: loc(
      "يوم طويل من إسطنبول إلى بورصة بسيارة ميني فان حتى 7 ركاب: أولوداغ، المسجد الأخضر، وجمعلقيزيق.",
      "A long day from Istanbul to Bursa in a minivan for up to 7: Uludağ, the Green Mosque, and Cumalıkızık.",
      "İstanbul’dan Bursa’ya 7 kişiye kadar minivan: Uludağ, Yeşil Camii, Cumalıkızık."
    ),
    vehicle: "minivan",
    price: 380,
    hours: 11,
    featured: true,
    from: HOTEL_IST,
    to: loc("دائرة بورصة", "Bursa circuit", "Bursa güzergâhı"),
    highlights: [
      loc("تلفريك أولوداغ", "Uludağ cable car", "Uludağ teleferik"),
      loc("المسجد الأخضر", "Green Mosque", "Yeşil Camii"),
      loc("جمعلقيزيق", "Cumalıkızık", "Cumalıkızık"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("07:30 — مغادرة إسطنبول", "07:30 — Leave Istanbul", "07:30 — İstanbul çıkışı"),
      loc("09:45 — المسجد الأخضر", "09:45 — Green Mosque", "09:45 — Yeşil Camii"),
      loc("11:15 — تلفريك أولوداغ", "11:15 — Uludağ cable car", "11:15 — Uludağ teleferik"),
      loc("13:30 — غداء إسكندر", "13:30 — İskender lunch", "13:30 — İskender öğle"),
      loc("15:00 — جمعلقيزيق", "15:00 — Cumalıkızık", "15:00 — Cumalıkızık"),
      loc("16:30 — العودة", "16:30 — Return drive", "16:30 — Dönüş yolu"),
      loc("19:00 — وصول إسطنبول", "19:00 — Istanbul arrival", "19:00 — İstanbul varışı"),
    ],
    stops: [
      stop(40.1826, 29.0669, loc("المسجد الأخضر", "Green Mosque", "Yeşil Camii"), loc("مجمع عثماني مبكر في بورصة.", "Early Ottoman complex in Bursa.", "Bursa’da erken Osmanlı külliyesi."), PHOTO.mosqueInterior),
      stop(40.1089, 29.0089, loc("أولوداغ", "Uludağ", "Uludağ"), loc("جبل بورصة بالتلفريك.", "Bursa’s mountain by cable car.", "Teleferikle Bursa dağı."), PHOTO.mountains),
      stop(40.1747, 29.1714, loc("جمعلقيزيق", "Cumalıkızık", "Cumalıkızık"), loc("قرية عثمانية حية.", "Living Ottoman village.", "Yaşayan Osmanlı köyü."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.mountains, PHOTO.mosqueInterior, PHOTO.forest],
    tips: [
      loc("احمل سترة لأولوداغ", "Bring a jacket for Uludağ", "Uludağ için ceket"),
      loc("تذاكر التلفريك منفصلة", "Cable-car tickets are extra", "Teleferik biletleri extra"),
    ],
  }),
  defineVip({
    id: "vip-4",
    slug: "sapanca-masukiye-vip-tour",
    title: loc("سبانجا والمعشوقية VIP", "Sapanca & Maşukiye VIP", "Sapanca ve Maşukiye VIP"),
    overview: loc(
      "هروب طبيعة من إسطنبول: بحيرة سبانجا وشلال المعشوقية بسيارة خاصة حتى 7 ركاب.",
      "A nature escape from Istanbul: Lake Sapanca and Maşukiye waterfall in a private vehicle for up to 7.",
      "İstanbul’dan doğa günü: Sapanca Gölü ve Maşukiye, 7 kişiye kadar."
    ),
    vehicle: "minivan",
    price: 320,
    hours: 9,
    featured: true,
    from: HOTEL_IST,
    to: loc("سبانجا والمعشوقية", "Sapanca & Maşukiye", "Sapanca ve Maşukiye"),
    highlights: [
      loc("بحيرة سبانجا", "Lake Sapanca", "Sapanca Gölü"),
      loc("شلال المعشوقية", "Maşukiye waterfall", "Maşukiye şelalesi"),
      loc("كرتبه إن سمح الوقت", "Kartepe if time allows", "Zaman varsa Kartepe"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:30 — مغادرة إسطنبول", "08:30 — Leave Istanbul", "08:30 — İstanbul çıkışı"),
      loc("10:15 — بحيرة سبانجا", "10:15 — Lake Sapanca", "10:15 — Sapanca Gölü"),
      loc("12:30 — غداء سمك", "12:30 — Trout lunch", "12:30 — Alabalık öğle"),
      loc("14:00 — المعشوقية", "14:00 — Maşukiye", "14:00 — Maşukiye"),
      loc("16:00 — العودة", "16:00 — Return", "16:00 — Dönüş"),
      loc("18:00 — الفندق", "18:00 — Hotel", "18:00 — Otel"),
    ],
    stops: [
      stop(40.6914, 30.2678, loc("بحيرة سبانجا", "Lake Sapanca", "Sapanca Gölü"), loc("بحيرة عذبة بين الجبال شرق إسطنبول.", "Freshwater lake in the hills east of Istanbul.", "İstanbul’un doğusunda dağ gölü."), PHOTO.alpineLake),
      stop(40.7, 30.18, loc("المعشوقية", "Maşukiye", "Maşukiye"), loc("شلالات ومطاعم غابة.", "Waterfalls and forest restaurants.", "Şelaleler ve orman restoranları."), PHOTO.waterfall),
      stop(40.645, 30.01, loc("كرتبه", "Kartepe", "Kartepe"), loc("نقطة مرتفعة إن سمح الوقت.", "Highland viewpoint if time allows.", "Zaman varsa yayla manzarası."), PHOTO.mountains),
    ],
    landmarkPhotos: [PHOTO.alpineLake, PHOTO.waterfall, PHOTO.forest],
    tips: [loc("الأحذية الرياضية أفضل من الرسمية", "Trainers beat formal shoes", "Spor ayakkabı daha iyi")],
  }),
  defineVip({
    id: "vip-8",
    slug: "istanbul-princes-islands-vip",
    title: loc("جزر الأميرات VIP", "Princes’ Islands VIP Day", "Prens Adaları VIP"),
    overview: loc(
      "يوم خاص إلى بيوك أدا: ترانسفير بري إلى الرصيف ثم عبّارة عامة أو خاصة حسب التوفر. السيارة تنتظر حتى 7 ركاب.",
      "A private day to Büyükada: road transfer to the pier then a public or private ferry as available. Vehicle waits — max 7 guests.",
      "Büyükada özel günü: iskeleye karayolu, sonra feribot. Araç bekler — en fazla 7 kişi."
    ),
    vehicle: "minivan",
    price: 320,
    hours: 9,
    featured: true,
    from: HOTEL_IST,
    to: loc("بيوك أدا", "Büyükada", "Büyükada"),
    highlights: [
      loc("بيوك أدا بلا سيارات", "Car-free Büyükada", "Arabasız Büyükada"),
      loc("عربات خيل أو دراجات", "Carriages or bikes", "Fayton veya bisiklet"),
      loc("سائق ينتظر عند الرصيف", "Driver waits at the pier", "Şoför iskelede bekler"),
    ],
    includes: [
      ...INC_VIP,
      loc("انتظار السائق عند الرصيف", "Driver waiting at the pier", "İskelede şoför beklemesi"),
    ],
    excludes: [
      ...EX_VIP,
      loc("تذاكر العبّارة وعربات الخيل", "Ferry and carriage tickets", "Feribot ve fayton"),
    ],
    program: [
      loc("09:00 — استلام من الفندق", "09:00 — Hotel pickup", "09:00 — Otelden alış"),
      loc("09:45 — رصيف كاباتاش أو كاديكوي", "09:45 — Kabataş or Kadıköy pier", "09:45 — Kabataş veya Kadıköy iskele"),
      loc("11:00 — بيوك أدا", "11:00 — Büyükada", "11:00 — Büyükada"),
      loc("13:00 — غداء الجزيرة", "13:00 — Island lunch", "13:00 — Ada öğle"),
      loc("15:30 — عبّارة العودة", "15:30 — Return ferry", "15:30 — Dönüş feribotu"),
      loc("17:30 — الفندق", "17:30 — Hotel", "17:30 — Otel"),
    ],
    stops: [
      stop(41.033, 28.993, loc("كاباتاش", "Kabataş", "Kabataş"), loc("رصيف العبّارات إلى الجزر.", "Ferry pier toward the islands.", "Adalara feribot iskelesi."), PHOTO.bosphorus),
      stop(40.8744, 29.0933, loc("بيوك أدا", "Büyükada", "Büyükada"), loc("أكبر جزر الأميرات.", "Largest of the Princes’ Islands.", "Prens Adaları’nın en büyüğü."), PHOTO.princesIslands),
      stop(40.876, 29.12, loc("تلة آيا يورغي", "Aya Yorgi hill", "Aya Yorgi tepesi"), loc("نقطة مشاهدة شهيرة على الجزيرة.", "Famous island viewpoint.", "Adanın ünlü manzara noktası."), PHOTO.landscape),
    ],
    landmarkPhotos: [PHOTO.princesIslands, PHOTO.bosphorus, PHOTO.coastalTown],
    tips: [loc("العبّارة حسب الجدول البحري", "Ferry depends on the maritime timetable", "Feribot deniz saatlerine bağlı")],
  }),
  defineVip({
    id: "vip-9",
    slug: "istanbul-belgrad-forest-vip",
    title: loc("غابة بلغراد VIP", "Belgrad Forest VIP", "Belgrad Ormanı VIP"),
    overview: loc(
      "نصف يوم إلى يوم كامل في غابة بلغراد شمال إسطنبول: مشي، سدود، وهواء نظيف. سيدان حتى 3 أو ميني فان حتى 7.",
      "A half-to-full day in Belgrad Forest north of Istanbul: walks, reservoirs, and clean air. Sedan up to 3 or treat as 7 with a minivan request.",
      "İstanbul kuzeyinde Belgrad Ormanı: yürüyüş, bentler, temiz hava."
    ),
    vehicle: "sedan",
    price: 220,
    hours: 6,
    from: HOTEL_IST,
    to: loc("غابة بلغراد", "Belgrad Forest", "Belgrad Ormanı"),
    highlights: [
      loc("مسارات الغابة", "Forest trails", "Orman patikaları"),
      loc("السدود العثمانية", "Ottoman reservoirs", "Osmanlı bentleri"),
      loc("عودة قبل الزحام", "Return before rush hour", "Yoğunluktan önce dönüş"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام", "09:00 — Pickup", "09:00 — Alış"),
      loc("09:50 — مدخل الغابة", "09:50 — Forest entrance", "09:50 — Orman girişi"),
      loc("10:15 — مشي حول السد", "10:15 — Reservoir walk", "10:15 — Bent yürüyüşü"),
      loc("13:00 — غداء خفيف في المنطقة", "13:00 — Light lunch nearby", "13:00 — Civarda hafif öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
    ],
    stops: [
      stop(41.186, 28.986, loc("غابة بلغراد", "Belgrad Forest", "Belgrad Ormanı"), loc("رئة إسطنبول الخضراء.", "Istanbul’s green lung.", "İstanbul’un yeşil akciğeri."), PHOTO.belgradForest),
      stop(41.176, 28.99, loc("سد بويوك", "Büyük Bent", "Büyük Bent"), loc("خزان مياه تاريخي داخل الغابة.", "Historic reservoir inside the forest.", "Ormanın içindeki tarihi bent."), PHOTO.alpineLake),
    ],
    landmarkPhotos: [PHOTO.belgradForest, PHOTO.forest, PHOTO.alpineLake],
    tips: [loc("أحذية مشي وماء إضافي", "Walking shoes and extra water", "Yürüyüş ayakkabısı ve ekstra su")],
  }),
  defineVip({
    id: "vip-10",
    slug: "istanbul-sile-agva-vip",
    title: loc("شيله وأغفا VIP", "Şile & Ağva VIP", "Şile ve Ağva VIP"),
    overview: loc(
      "يوم ساحل البحر الأسود شرق إسطنبول: منارة شيله وبلدة أغفا. مسافة أطول من سبانجا — سعر المركبة أعلى.",
      "A Black Sea coast day east of Istanbul: Şile lighthouse and Ağva town. Longer than Sapanca — higher vehicle price.",
      "İstanbul’un doğusunda Karadeniz: Şile feneri ve Ağva. Sapanca’dan uzun — araç fiyatı daha yüksek."
    ),
    vehicle: "minivan",
    price: 360,
    hours: 10,
    from: HOTEL_IST,
    to: loc("شيله وأغفا", "Şile & Ağva", "Şile ve Ağva"),
    highlights: [
      loc("منارة شيله", "Şile lighthouse", "Şile feneri"),
      loc("نهر أغفا", "Ağva river", "Ağva nehri"),
      loc("ساحل البحر الأسود", "Black Sea shore", "Karadeniz kıyısı"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:00 — مغادرة إسطنبول", "08:00 — Leave Istanbul", "08:00 — İstanbul çıkışı"),
      loc("10:00 — منارة شيله", "10:00 — Şile lighthouse", "10:00 — Şile feneri"),
      loc("12:30 — أغفا وغداء", "12:30 — Ağva and lunch", "12:30 — Ağva ve öğle"),
      loc("15:30 — العودة", "15:30 — Return", "15:30 — Dönüş"),
      loc("18:00 — الفندق", "18:00 — Hotel", "18:00 — Otel"),
    ],
    stops: [
      stop(41.175, 29.613, loc("منارة شيله", "Şile lighthouse", "Şile feneri"), loc("منارة تاريخية على البحر الأسود.", "Historic lighthouse on the Black Sea.", "Karadeniz’de tarihi fener."), PHOTO.coastalTown),
      stop(41.136, 29.856, loc("أغفا", "Ağva", "Ağva"), loc("بلدة عند مصب النهر.", "Town at the river mouth.", "Nehir ağzındaki kasaba."), PHOTO.alpineLake),
    ],
    landmarkPhotos: [PHOTO.coastalTown, PHOTO.landscape, PHOTO.aegeanCoast],
    tips: [loc("الرياح قوية على الساحل", "Coastal wind can be strong", "Kıyıda rüzgar sert olabilir")],
  }),
  defineVip({
    id: "vip-11",
    slug: "istanbul-gallipoli-day-vip",
    title: loc("جاليبولي يوم كامل VIP", "Gallipoli Full Day VIP", "Gelibolu Tam Gün VIP"),
    overview: loc(
      "يوم طويل معقول من إسطنبول إلى شبه جزيرة جاليبولي: أنزاك كوف ونصب الشهداء. ميني فان حتى 7 — السعر للمركبة.",
      "A long but reasonable day from Istanbul to the Gallipoli peninsula: Anzac Cove and the memorials. Minivan up to 7 — per vehicle.",
      "İstanbul’dan Gelibolu yarımadasına uzun ama makul gün: Anzak Koyu ve anıtlar. 7 kişiye kadar — araç başı."
    ),
    vehicle: "minivan",
    price: 420,
    hours: 13,
    from: HOTEL_IST,
    to: loc("شبه جزيرة جاليبولي", "Gallipoli peninsula", "Gelibolu yarımadası"),
    highlights: [
      loc("أنزاك كوف", "Anzac Cove", "Anzak Koyu"),
      loc("نصب الشهداء", "Martyrs’ memorial", "Şehitler abidesi"),
      loc("سائق يعرف الطريق السريع", "Driver who knows the highway", "Otoyolu bilen şoför"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("06:00 — مغادرة إسطنبول", "06:00 — Leave Istanbul", "06:00 — İstanbul çıkışı"),
      loc("10:00 — أنزاك كوف", "10:00 — Anzac Cove", "10:00 — Anzak Koyu"),
      loc("12:00 — النصب والغداء", "12:00 — Memorials and lunch", "12:00 — Anıtlar ve öğle"),
      loc("14:30 — العودة", "14:30 — Return drive", "14:30 — Dönüş"),
      loc("19:00 — إسطنبول", "19:00 — Istanbul", "19:00 — İstanbul"),
    ],
    stops: [
      stop(40.246, 26.277, loc("أنزاك كوف", "Anzac Cove", "Anzak Koyu"), loc("شاطئ الإنزال الشهير عام 1915.", "The famous 1915 landing beach.", "1915 çıkarma sahili."), PHOTO.coastalTown),
      stop(40.2, 26.277, loc("نصب الشهداء", "Çanakkale Martyrs’ Memorial", "Çanakkale Şehitler Abidesi"), loc("نصب على طرف شبه الجزيرة.", "Memorial at the peninsula tip.", "Yarımada ucundaki anıt."), PHOTO.landscape),
    ],
    landmarkPhotos: [PHOTO.coastalTown, PHOTO.landscape, PHOTO.mountains],
    tips: [loc("يوم طويل — اخرج مبكراً", "A long day — start early", "Uzun gün — erken çıkın")],
  }),
  defineVip({
    id: "vip-12",
    slug: "istanbul-old-city-sprinter",
    title: loc("إسطنبول القديمة سبرينتر — حتى 20 راكباً", "Istanbul Old City Sprinter — max 20", "İstanbul Eski Şehir Sprinter — 20 kişi"),
    overview: loc(
      "نفس دائرة السلطان أحمد لمجموعة خاصة في مرسيدس سبرينتر حتى 20 راكباً. السعر للمركبة لا للشخص.",
      "The same Sultanahmet circuit for a private group in a Mercedes Sprinter up to 20 guests. Price is per vehicle, not per person.",
      "Aynı Sultanahmet güzergâhı, Mercedes Sprinter ile 20 kişiye kadar. Fiyat araç başı, kişi başı değil."
    ),
    vehicle: "sprinter",
    price: 650,
    hours: 8,
    featured: true,
    from: HOTEL_IST,
    to: loc("دائرة السلطان أحمد", "Sultanahmet circuit", "Sultanahmet güzergâhı"),
    highlights: [
      loc("حتى 20 راكباً", "Up to 20 passengers", "En fazla 20 yolcu"),
      loc("مجموعة خاصة وليست حافلة عامة", "Private group — not a public bus", "Özel grup — halk otobüsü değil"),
      loc("نفس المواقف الحقيقية", "The same real stops", "Aynı gerçek duraklar"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام المجموعة", "09:00 — Group pickup", "09:00 — Grup alış"),
      loc("09:40 — آيا صوفيا", "09:40 — Hagia Sophia", "09:40 — Ayasofya"),
      loc("11:30 — المسجد الأزرق", "11:30 — Blue Mosque", "11:30 — Sultanahmet Camii"),
      loc("13:00 — غداء حر", "13:00 — Free lunch", "13:00 — Serbest öğle"),
      loc("14:30 — البازار", "14:30 — Bazaar", "14:30 — Çarşı"),
      loc("16:30 — غلطة", "16:30 — Galata", "16:30 — Galata"),
      loc("18:00 — إنزال", "18:00 — Drop-off", "18:00 — Bırakış"),
    ],
    stops: [
      stop(41.0086, 28.9802, loc("آيا صوفيا", "Hagia Sophia", "Ayasofya"), loc("نقطة التجمع الأولى للمجموعة.", "First group gathering point.", "Grubun ilk buluşma noktası."), PHOTO.hagiaSophia),
      stop(41.0054, 28.9768, loc("المسجد الأزرق", "Blue Mosque", "Sultanahmet Camii"), loc("ساحة السلطان أحمد.", "Sultanahmet Square.", "Sultanahmet Meydanı."), PHOTO.blueMosque),
      stop(41.0107, 28.9685, loc("السوق الكبير", "Grand Bazaar", "Kapalıçarşı"), loc("دخول منظم للمجموعة.", "Organised group entry.", "Düzenli grup girişi."), PHOTO.grandBazaar),
      stop(41.0256, 28.9744, loc("غلطة", "Galata", "Galata"), loc("توقف تصوير جماعي.", "Group photo stop.", "Grup fotoğraf molası."), PHOTO.istanbulSkyline),
    ],
    landmarkPhotos: [PHOTO.sprinter, PHOTO.hagiaSophia, PHOTO.blueMosque],
    tips: [loc("السعر للسبرينتر كاملاً", "Price is for the whole Sprinter", "Fiyat tüm Sprinter içindir")],
  }),
  defineVip({
    id: "vip-13",
    slug: "istanbul-bosphorus-sprinter",
    title: loc("البوسفور سبرينتر — حتى 20 راكباً", "Bosphorus Sprinter — max 20", "Boğaz Sprinter — 20 kişi"),
    overview: loc(
      "دائرة البوسفور لمجموعة في سبرينتر: أورتاكوي، جسر، وأسكودار. سعر المركبة.",
      "Bosphorus circuit for a Sprinter group: Ortaköy, bridge, and Üsküdar. Per-vehicle price.",
      "Sprinter grubu için Boğaz: Ortaköy, köprü, Üsküdar. Araç başı fiyat."
    ),
    vehicle: "sprinter",
    price: 620,
    hours: 7,
    from: HOTEL_IST,
    to: loc("دائرة البوسفور", "Bosphorus circuit", "Boğaz güzergâhı"),
    highlights: [
      loc("سبرينتر حتى 20", "Sprinter up to 20", "Sprinter 20 kişi"),
      loc("توقفات تصوير على المضيق", "Photo stops on the strait", "Boğaz’da fotoğraf molaları"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("10:00 — استلام", "10:00 — Pickup", "10:00 — Alış"),
      loc("10:40 — دولمابهتشه من الخارج", "10:40 — Dolmabahçe exterior", "10:40 — Dolmabahçe dışı"),
      loc("12:00 — أورتاكوي", "12:00 — Ortaköy", "12:00 — Ortaköy"),
      loc("14:00 — أسكودار", "14:00 — Üsküdar", "14:00 — Üsküdar"),
      loc("16:30 — إنزال", "16:30 — Drop-off", "16:30 — Bırakış"),
    ],
    stops: [
      stop(41.0391, 29.0002, loc("دولمابهتشه", "Dolmabahçe", "Dolmabahçe"), loc("واجهة القصر من الطريق.", "Palace facade from the road.", "Yoldan saray cephesi."), PHOTO.bosphorus),
      stop(41.0553, 29.0267, loc("أورتاكوي", "Ortaköy", "Ortaköy"), loc("أفضل نقطة تصوير للمجموعة.", "Best group photo point.", "En iyi grup fotoğraf noktası."), PHOTO.istanbulSkyline),
      stop(41.0214, 29.0152, loc("أسكودار", "Üsküdar", "Üsküdar"), loc("جانب آسيوي.", "Asian side.", "Anadolu yakası."), PHOTO.coastalTown),
    ],
    landmarkPhotos: [PHOTO.sprinter, PHOTO.bosphorus, PHOTO.minibus],
    tips: [loc("مواقف السبرينتر محدودة في أورتاكوي", "Sprinter parking is tight in Ortaköy", "Ortaköy’de Sprinter parkı dar")],
  }),
  defineVip({
    id: "vip-14",
    slug: "trabzon-uzungol-vip",
    title: loc("أو زنجول VIP من طرابزون", "Uzungöl VIP from Trabzon", "Trabzon’dan Uzungöl VIP"),
    overview: loc(
      "يوم خاص من طرابزون إلى بحيرة أوزنجول بسيارة ميني فان حتى 7. سعر المركبة أعلى من يوم مدينة بسبب المسافة الجبلية.",
      "A private day from Trabzon to Lake Uzungöl in a minivan for up to 7. Higher vehicle price than a city day because of the mountain distance.",
      "Trabzon’dan Uzungöl’e 7 kişilik özel gün. Dağ mesafesi nedeniyle şehir gününden daha yüksek araç fiyatı."
    ),
    vehicle: "minivan",
    price: 380,
    hours: 9,
    featured: true,
    from: HOTEL_TRB,
    to: loc("أو زنجول", "Uzungöl", "Uzungöl"),
    highlights: [
      loc("بحيرة أوزنجول", "Lake Uzungöl", "Uzungöl gölü"),
      loc("طرق جبلية مع سائق محلي", "Mountain roads with a local driver", "Yerel şoförle dağ yolları"),
      loc("وقت حر للتصوير والغداء", "Free time for photos and lunch", "Fotoğraf ve öğle için serbest zaman"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:30 — استلام طرابزون", "08:30 — Trabzon pickup", "08:30 — Trabzon alış"),
      loc("10:30 — وصول أوزنجول", "10:30 — Uzungöl arrival", "10:30 — Uzungöl varışı"),
      loc("11:00 — البحيرة والمسجد الخشبي", "11:00 — Lake and wooden mosque", "11:00 — Göl ve ahşap cami"),
      loc("13:00 — غداء", "13:00 — Lunch", "13:00 — Öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
      loc("17:00 — الفندق", "17:00 — Hotel", "17:00 — Otel"),
    ],
    stops: [
      stop(41.0027, 39.7168, loc("طرابزون", "Trabzon", "Trabzon"), loc("نقطة الانطلاق من المدينة.", "City starting point.", "Kent çıkış noktası."), PHOTO.landscape),
      stop(40.6195, 40.2996, loc("أو زنجول", "Uzungöl", "Uzungöl"), loc("بحيرة جبلية شهيرة في تشايكارا.", "Famous mountain lake in Çaykara.", "Çaykara’da ünlü dağ gölü."), PHOTO.alpineLake),
    ],
    landmarkPhotos: [PHOTO.alpineLake, PHOTO.mountains, PHOTO.landscape],
    tips: [loc("الضباب شائع — اترك هامشاً للطريق", "Fog is common — allow road margin", "Sis sık görülür — yola pay bırakın")],
  }),
  defineVip({
    id: "vip-15",
    slug: "trabzon-sumela-vip",
    title: loc("دير سوميلا VIP", "Sümela Monastery VIP", "Sümela Manastırı VIP"),
    overview: loc(
      "يوم إلى دير سوميلا في وادي ألتنين. سيارة خاصة حتى 7 — تذكرة الدير منفصلة وقد يتغير المسار حسب الإغلاق الموسمي.",
      "A day to Sümela Monastery in Altındere valley. Private vehicle up to 7 — monastery tickets are extra and the path can change with seasonal closures.",
      "Altındere’de Sümela günü. 7 kişiye kadar özel araç — manastır bileti ayrı, yol mevsim kapanışına göre değişebilir."
    ),
    vehicle: "minivan",
    price: 340,
    hours: 8,
    featured: true,
    from: HOTEL_TRB,
    to: loc("سوميلا", "Sümela", "Sümela"),
    highlights: [
      loc("دير على الجرف", "Cliff monastery", "Uçurum manastırı"),
      loc("وادي ألتنين", "Altındere valley", "Altındere vadisi"),
      loc("سائق يعرف مواقف الحافلات", "Driver who knows coach parking", "Otobüs parkını bilen şoför"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام", "09:00 — Pickup", "09:00 — Alış"),
      loc("10:15 — مدخل الوادي", "10:15 — Valley entrance", "10:15 — Vadi girişi"),
      loc("10:45 — الدير", "10:45 — Monastery", "10:45 — Manastır"),
      loc("13:30 — غداء", "13:30 — Lunch", "13:30 — Öğle"),
      loc("15:30 — العودة", "15:30 — Return", "15:30 — Dönüş"),
    ],
    stops: [
      stop(40.6903, 39.6583, loc("سوميلا", "Sümela Monastery", "Sümela Manastırı"), loc("دير بيزنطي معلق على الجرف.", "Byzantine monastery on the cliff.", "Uçurumdaki Bizans manastırı."), PHOTO.mountains),
      stop(40.72, 39.64, loc("وادي ألتنين", "Altındere valley", "Altındere vadisi"), loc("وادي أخضر حول الدير.", "Green valley around the monastery.", "Manastır çevresindeki yeşil vadi."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.mountains, PHOTO.forest, PHOTO.landscape],
    tips: [loc("تحقق من فتح الدير قبل السفر", "Check monastery opening before travel", "Seyahatten önce manastır açık mı bakın")],
  }),
  defineVip({
    id: "vip-16",
    slug: "trabzon-ayder-rize-vip",
    title: loc("آيدر وريزا VIP", "Ayder & Rize VIP", "Ayder ve Rize VIP"),
    overview: loc(
      "يوم هضاب من طرابزون إلى آيدر عبر ريزا: شاي، شلالات، وينابيع. مسافة جبلية — سعر أعلى من يوم مدينة.",
      "A highland day from Trabzon to Ayder via Rize: tea, waterfalls, and springs. Mountain distance — priced above a city day.",
      "Trabzon’dan Rize üzerinden Ayder: çay, şelale, kaplıca. Dağ mesafesi — şehir gününden pahalı."
    ),
    vehicle: "minivan",
    price: 400,
    hours: 10,
    featured: true,
    from: HOTEL_TRB,
    to: loc("آيدر", "Ayder", "Ayder"),
    highlights: [
      loc("هضبة آيدر", "Ayder plateau", "Ayder yaylası"),
      loc("مزارع شاي ريزا", "Rize tea gardens", "Rize çay bahçeleri"),
      loc("ينابيع اختيارية", "Optional hot springs", "İsteğe kaplıca"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:00 — مغادرة طرابزون", "08:00 — Leave Trabzon", "08:00 — Trabzon çıkışı"),
      loc("09:30 — ريزا والشاي", "09:30 — Rize and tea", "09:30 — Rize ve çay"),
      loc("11:30 — آيدر", "11:30 — Ayder", "11:30 — Ayder"),
      loc("13:30 — غداء هضبة", "13:30 — Plateau lunch", "13:30 — Yayla öğle"),
      loc("15:30 — العودة", "15:30 — Return", "15:30 — Dönüş"),
      loc("18:00 — الفندق", "18:00 — Hotel", "18:00 — Otel"),
    ],
    stops: [
      stop(41.0201, 40.5234, loc("ريزا", "Rize", "Rize"), loc("عاصمة الشاي على البحر الأسود.", "Tea capital on the Black Sea.", "Karadeniz’in çay başkenti."), PHOTO.teaGarden),
      stop(40.953, 41.1, loc("آيدر", "Ayder", "Ayder"), loc("هضبة خضراء وينابيع.", "Green plateau and hot springs.", "Yeşil yayla ve kaplıcalar."), PHOTO.mountains),
      stop(40.96, 41.08, loc("شلالات آيدر", "Ayder waterfalls", "Ayder şelaleleri"), loc("مساقط مياه قصيرة من الطريق.", "Short falls from the road.", "Yoldan kısa şelaleler."), PHOTO.waterfall),
    ],
    landmarkPhotos: [PHOTO.mountains, PHOTO.teaGarden, PHOTO.waterfall],
    tips: [loc("الطريق ضيق في آيدر صيفاً", "Ayder road is tight in summer", "Yazın Ayder yolu dar")],
  }),
  defineVip({
    id: "vip-17",
    slug: "trabzon-palovit-vip",
    title: loc("شلال بالوفيت VIP", "Palovit Waterfall VIP", "Palovit Şelalesi VIP"),
    overview: loc(
      "يوم طبيعة نحو شلال بالوفيت في طرق ريزا الجبلية. ميني فان حتى 7.",
      "A nature day toward Palovit Falls on Rize mountain roads. Minivan up to 7.",
      "Rize dağ yollarında Palovit Şelalesi. 7 kişiye kadar minivan."
    ),
    vehicle: "minivan",
    price: 360,
    hours: 8,
    from: HOTEL_TRB,
    to: loc("بالوفيت", "Palovit", "Palovit"),
    highlights: [
      loc("شلال بالوفيت", "Palovit Falls", "Palovit Şelalesi"),
      loc("طرق غابات", "Forest roads", "Orman yolları"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:30 — استلام", "08:30 — Pickup", "08:30 — Alış"),
      loc("11:00 — بالوفيت", "11:00 — Palovit", "11:00 — Palovit"),
      loc("13:00 — غداء", "13:00 — Lunch", "13:00 — Öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
    ],
    stops: [
      stop(40.72, 40.45, loc("بالوفيت", "Palovit Falls", "Palovit Şelalesi"), loc("شلال داخل الغابة شرق طرابزون.", "Forest waterfall east of Trabzon.", "Trabzon’un doğusunda orman şelalesi."), PHOTO.waterfall),
      stop(40.75, 40.4, loc("طريق الهضبة", "Highland road", "Yayla yolu"), loc("توقف تصوير على الطريق.", "Photo stop on the road.", "Yolda fotoğraf molası."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.waterfall, PHOTO.forest, PHOTO.mountains],
    tips: [loc("بعد المطر الطريق زلق", "The road is slippery after rain", "Yağmur sonrası yol kaygan")],
  }),
  defineVip({
    id: "vip-18",
    slug: "trabzon-karaca-cave-vip",
    title: loc("كهف كاراجا VIP", "Karaca Cave VIP", "Karaca Mağarası VIP"),
    overview: loc(
      "يوم إلى كهف كاراجا قرب غوموشخانه: تشكيلات كلسية وإضاءة داخلية. سيارة خاصة حتى 7.",
      "A day to Karaca Cave near Gümüşhane: calcite formations and interior lighting. Private vehicle up to 7.",
      "Gümüşhane yakınında Karaca Mağarası: kalsit oluşumları. 7 kişiye kadar özel araç."
    ),
    vehicle: "sedan",
    price: 300,
    hours: 7,
    from: HOTEL_TRB,
    to: loc("كهف كاراجا", "Karaca Cave", "Karaca Mağarası"),
    highlights: [
      loc("كهف كاراجا", "Karaca Cave", "Karaca Mağarası"),
      loc("طريق طورول", "Torul road", "Torul yolu"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام", "09:00 — Pickup", "09:00 — Alış"),
      loc("10:45 — الكهف", "10:45 — The cave", "10:45 — Mağara"),
      loc("13:00 — غداء", "13:00 — Lunch", "13:00 — Öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
    ],
    stops: [
      stop(40.516, 39.4, loc("كهف كاراجا", "Karaca Cave", "Karaca Mağarası"), loc("كهف كلسي مزار معروف في المنطقة.", "Well-known calcite cave in the region.", "Bölgenin bilinen kalsit mağarası."), PHOTO.caveHotel),
    ],
    landmarkPhotos: [PHOTO.caveHotel, PHOTO.mountains, PHOTO.landscape],
    tips: [loc("درجة الحرارة داخل الكهف منخفضة", "The cave is cool inside", "Mağara içi serin")],
  }),
  defineVip({
    id: "vip-19",
    slug: "trabzon-uzungol-sprinter",
    title: loc("أو زنجول سبرينتر — حتى 20 راكباً", "Uzungöl Sprinter — max 20", "Uzungöl Sprinter — 20 kişi"),
    overview: loc(
      "يوم أوزنجول لمجموعة في سبرينتر حتى 20. السعر للمركبة — أعلى من الميني فان بسبب الحجم والطريق الجبلي.",
      "An Uzungöl group day in a Sprinter up to 20. Per-vehicle price — higher than a minivan because of size and the mountain road.",
      "Uzungöl grup günü, 20 kişilik Sprinter. Araç başı fiyat — hacim ve dağ yolu nedeniyle minivandan yüksek."
    ),
    vehicle: "sprinter",
    price: 780,
    hours: 9,
    featured: true,
    from: HOTEL_TRB,
    to: loc("أو زنجول", "Uzungöl", "Uzungöl"),
    highlights: [
      loc("حتى 20 راكباً", "Up to 20 passengers", "En fazla 20 yolcu"),
      loc("بحيرة أوزنجول", "Lake Uzungöl", "Uzungöl"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:00 — استلام المجموعة", "08:00 — Group pickup", "08:00 — Grup alış"),
      loc("10:15 — أوزنجول", "10:15 — Uzungöl", "10:15 — Uzungöl"),
      loc("13:00 — غداء المجموعة", "13:00 — Group lunch", "13:00 — Grup öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
    ],
    stops: [
      stop(40.6195, 40.2996, loc("أو زنجول", "Uzungöl", "Uzungöl"), loc("تجمع المجموعة عند البحيرة.", "Group gathering at the lake.", "Gölde grup buluşması."), PHOTO.alpineLake),
    ],
    landmarkPhotos: [PHOTO.sprinter, PHOTO.alpineLake, PHOTO.mountains],
    tips: [loc("مواقف السبرينتر في الموسم مزدحمة", "Sprinter parking is busy in season", "Sezonda Sprinter parkı yoğun")],
  }),
  defineVip({
    id: "vip-20",
    slug: "trabzon-sumela-uzungol-combo-vip",
    title: loc("سوميلا وأوزنجول في يوم VIP", "Sümela & Uzungöl Combo VIP", "Sümela ve Uzungöl VIP"),
    overview: loc(
      "يوم طويل يجمع الدير والبحيرة إن سمح الوقت والطقس. ميني فان حتى 7 — جدول مضغوط.",
      "A long day combining the monastery and the lake if weather and time allow. Minivan up to 7 — a tight schedule.",
      "Hava ve zaman elverirse manastır ve göl aynı günde. 7 kişilik minivan — sıkı program."
    ),
    vehicle: "minivan",
    price: 450,
    hours: 11,
    from: HOTEL_TRB,
    to: loc("سوميلا ثم أوزنجول", "Sümela then Uzungöl", "Önce Sümela sonra Uzungöl"),
    highlights: [
      loc("دير وبحيرة في يوم واحد", "Monastery and lake in one day", "Bir günde manastır ve göl"),
      loc("جدول مضغوط", "Tight schedule", "Sıkı program"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("07:30 — استلام", "07:30 — Pickup", "07:30 — Alış"),
      loc("09:00 — سوميلا", "09:00 — Sümela", "09:00 — Sümela"),
      loc("12:00 — الطريق إلى أوزنجول", "12:00 — Road to Uzungöl", "12:00 — Uzungöl yolu"),
      loc("13:30 — البحيرة والغداء", "13:30 — Lake and lunch", "13:30 — Göl ve öğle"),
      loc("16:00 — العودة", "16:00 — Return", "16:00 — Dönüş"),
      loc("18:30 — الفندق", "18:30 — Hotel", "18:30 — Otel"),
    ],
    stops: [
      stop(40.6903, 39.6583, loc("سوميلا", "Sümela", "Sümela"), loc("الزيارة الصباحية.", "Morning visit.", "Sabah ziyareti."), PHOTO.mountains),
      stop(40.6195, 40.2996, loc("أو زنجول", "Uzungöl", "Uzungöl"), loc("البحيرة بعد الظهر.", "Afternoon lake.", "Öğleden sonra göl."), PHOTO.alpineLake),
    ],
    landmarkPhotos: [PHOTO.mountains, PHOTO.alpineLake, PHOTO.landscape],
    tips: [loc("إذا تأخر سوميلا نختصر أوزنجول", "If Sümela runs late we shorten Uzungöl", "Sümela uzarsa Uzungöl kısaltılır")],
  }),
  defineVip({
    id: "vip-21",
    slug: "istanbul-eyup-pierre-loti-vip",
    title: loc("أيوب وبيير لوتي VIP", "Eyüp & Pierre Loti VIP", "Eyüp ve Pierre Loti VIP"),
    overview: loc(
      "صباح هادئ في أيوب ثم التلفريك أو السيارة إلى تلة بيير لوتي فوق القرن الذهبي. مناسبة للعائلات التي تريد إسطنبول دون زحام السلطان أحمد طوال اليوم.",
      "A quieter morning in Eyüp then the cable car or car to Pierre Loti hill above the Golden Horn. Good for families who want Istanbul without a full Sultanahmet crush.",
      "Eyüp’te sakin bir sabah, sonra teleferik veya araçla Haliç’e bakan Pierre Loti tepesi. Tüm gün Sultanahmet kalabalığı istemeyen aileler için."
    ),
    vehicle: "minivan",
    price: 240,
    hours: 6,
    from: HOTEL_IST,
    to: loc("أيوب وبيير لوتي", "Eyüp & Pierre Loti", "Eyüp ve Pierre Loti"),
    highlights: [
      loc("جامع أيوب والباحة", "Eyüp Mosque courtyard", "Eyüp Camii avlusu"),
      loc("إطلالة القرن الذهبي", "Golden Horn viewpoint", "Haliç manzarası"),
      loc("وقت شاي على التلة", "Tea time on the hill", "Tepede çay"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام من لوبي الفندق مع لوحة الاسم ومياه باردة", "09:00 — Hotel-lobby pickup with a name sign and cold water", "09:00 — Otel lobisinde isim tabelası ve soğuk su"),
      loc("09:40 — جامع أيوب والباحة الخارجية", "09:40 — Eyüp Mosque and outer courtyard", "09:40 — Eyüp Camii ve dış avlu"),
      loc("11:00 — صعود بيير لوتي (تلفريك أو سيارة حسب الازدحام)", "11:00 — Pierre Loti hill (cable car or car by traffic)", "11:00 — Pierre Loti (trafiğe göre teleferik veya araç)"),
      loc("12:30 — نافذة غداء حرّة في أيوب أو كاغithane", "12:30 — Free lunch window in Eyüp or Kağıthane", "12:30 — Eyüp veya Kağıthane’de serbest öğle"),
      loc("14:30 — عودة مرنة إلى الفندق قبل ساعة الذروة إن أمكن", "14:30 — Flexible return before rush hour when possible", "14:30 — Mümkünse yoğunluktan önce otele dönüş"),
    ],
    stops: [
      stop(41.0479, 28.9338, loc("جامع أيوب", "Eyüp Mosque", "Eyüp Camii"), loc("حي عثماني هادئ على القرن الذهبي.", "Quiet Ottoman quarter on the Golden Horn.", "Haliç’te sakin Osmanlı semti."), PHOTO.mosqueInterior),
      stop(41.0547, 28.933, loc("بيير لوتي", "Pierre Loti", "Pierre Loti"), loc("مقاهي تلة تطل على الماء.", "Hill cafes over the water.", "Suya bakan tepe kahveleri."), PHOTO.istanbulSkyline),
    ],
    landmarkPhotos: [PHOTO.mosqueInterior, PHOTO.istanbulSkyline, PHOTO.bosphorus],
    tips: [loc("ملابس محتشمة لحي أيوب", "Modest clothing in the Eyüp quarter", "Eyüp semtinde örtülü giysi")],
  }),
  defineVip({
    id: "vip-22",
    slug: "istanbul-camlica-asian-view-vip",
    title: loc("تشامليجا والإطلالات الآسيوية VIP", "Çamlıca & Asian Viewpoints VIP", "Çamlıca ve Anadolu manzaraları VIP"),
    overview: loc(
      "يوم الجانب الآسيوي: تلة تشامليجا الكبرى، كورنيش أسكودار، ونقطة برج الفتاة من اليابسة. مناسب لمن سكنوا الجانب الأوروبي ويريدون زاوية مختلفة.",
      "An Asian-side day: Büyük Çamlıca hill, the Üsküdar waterfront, and a Maiden’s Tower viewpoint from land. For guests who stayed in Europe and want another angle.",
      "Anadolu yakası günü: Büyük Çamlıca, Üsküdar sahili ve karadan Kız Kulesi. Avrupa’da kalan ve başka açı isteyenler için."
    ),
    vehicle: "minivan",
    price: 250,
    hours: 7,
    from: HOTEL_IST,
    to: loc("تشامليجا وأسكودار", "Çamlıca & Üsküdar", "Çamlıca ve Üsküdar"),
    highlights: [
      loc("تلة تشامليجا", "Çamlıca hill", "Çamlıca tepesi"),
      loc("أسكودار", "Üsküdar waterfront", "Üsküdar sahili"),
      loc("عبور الجسر ذهاباً وإياباً", "Bridge crossing both ways", "Köprü gidiş-dönüş"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:30 — استلام وعبور إلى الجانب الآسيوي", "09:30 — Pickup and crossing to the Asian side", "09:30 — Alış ve Anadolu yakasına geçiş"),
      loc("10:30 — تلة تشامليجا الكبرى والمسجد", "10:30 — Büyük Çamlıca hill and mosque", "10:30 — Büyük Çamlıca ve cami"),
      loc("12:30 — غداء حر في أسكودار أو كوزغونجوك", "12:30 — Free lunch in Üsküdar or Kuzguncuk", "12:30 — Üsküdar veya Kuzguncuk’ta serbest öğle"),
      loc("14:30 — كورنيش أسكودار وبرج الفتاة من اليابسة", "14:30 — Üsküdar promenade and Maiden’s Tower from land", "14:30 — Üsküdar sahili ve karadan Kız Kulesi"),
      loc("16:30 — العودة إلى الفندق", "16:30 — Return to the hotel", "16:30 — Otele dönüş"),
    ],
    stops: [
      stop(41.0278, 29.0711, loc("تشامليجا", "Çamlıca", "Çamlıca"), loc("أعلى نقطة مشاهدة كلاسيكية في الجانب الآسيوي.", "Classic high viewpoint on the Asian side.", "Anadolu yakasının klasik yüksek manzarası."), PHOTO.istanbulSkyline),
      stop(41.0214, 29.0152, loc("أسكودار", "Üsküdar", "Üsküdar"), loc("مراكب ومساجد على المضيق.", "Boats and mosques on the strait.", "Boğaz’da kayıklar ve camiler."), PHOTO.bosphorus),
    ],
    landmarkPhotos: [PHOTO.istanbulSkyline, PHOTO.bosphorus, PHOTO.coastalTown],
    tips: [loc("الرياح على التلة أقوى مما في المدينة", "Wind on the hill is stronger than downtown", "Tepede rüzgar merkezden sert")],
  }),
  defineVip({
    id: "vip-23",
    slug: "istanbul-kadikoy-moda-food-vip",
    title: loc("كاديكوي ومودا للطعام VIP", "Kadıköy & Moda Food VIP", "Kadıköy ve Moda Yemek VIP"),
    overview: loc(
      "يوم طعام ومشي خفيف في كاديكوي ومودا: السوق، المقاهي، والكورنيش. السيارة تنتظر بين الأحياء حتى لا تتعب العائلة في المواصلات.",
      "A food-and-stroll day in Kadıköy and Moda: the market, cafes, and the promenade. The car waits between neighborhoods so the family is not stuck on transit.",
      "Kadıköy ve Moda’da yemek ve kısa yürüyüş: çarşı, kahveler, sahil. Araç semtler arasında bekler; aile ulaşımda yorulmaz."
    ),
    vehicle: "minivan",
    price: 230,
    hours: 6,
    from: HOTEL_IST,
    to: loc("كاديكوي ومودا", "Kadıköy & Moda", "Kadıköy ve Moda"),
    highlights: [
      loc("سوق كاديكوي", "Kadıköy market", "Kadıköy çarşısı"),
      loc("كورنيش مودا", "Moda promenade", "Moda sahili"),
      loc("سائق ينتظر أثناء الغداء", "Driver waits during lunch", "Öğlede şoför bekler"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("11:00 — استلام متأخر مناسب للنوم", "11:00 — Late pickup for a slower start", "11:00 — Geç alış, sakin başlangıç"),
      loc("11:50 — سوق كاديكوي والمخابز", "11:50 — Kadıköy market and bakeries", "11:50 — Kadıköy çarşısı ve fırınlar"),
      loc("13:00 — غداء حر في كاديكوي (السائق ينتظر)", "13:00 — Free Kadıköy lunch (driver waits)", "13:00 — Kadıköy’de serbest öğle (şoför bekler)"),
      loc("15:00 — مشي كورنيش مودا", "15:00 — Moda waterfront walk", "15:00 — Moda sahil yürüyüşü"),
      loc("17:00 — العودة", "17:00 — Return", "17:00 — Dönüş"),
    ],
    stops: [
      stop(40.9903, 29.0255, loc("كاديكوي", "Kadıköy", "Kadıköy"), loc("سوق حيوي ومطاعم محلية.", "Lively market and local restaurants.", "Canlı çarşı ve yerel restoranlar."), PHOTO.food),
      stop(40.9889, 29.0256, loc("مودا", "Moda", "Moda"), loc("كورنيش هادئ بعد الغداء.", "Quiet promenade after lunch.", "Öğleden sonra sakin sahil."), PHOTO.coastalTown),
    ],
    landmarkPhotos: [PHOTO.food, PHOTO.coastalTown, PHOTO.bosphorus],
    tips: [loc("هذا يوم مشي خفيف — ليس متاحف تذاكر", "This is a light walking day — not ticketed museums", "Hafif yürüyüş günü — biletli müze değil")],
  }),
  defineVip({
    id: "vip-24",
    slug: "istanbul-balat-fener-vip",
    title: loc("بالات وفنار الملونة VIP", "Colorful Balat & Fener VIP", "Renkli Balat ve Fener VIP"),
    overview: loc(
      "يوم تصوير في أحياء فنار وبالات: بيوت ملونة، مقاهي، وكنائس من الخارج. السيارة تدخل أقرب نقطة مسموحة ثم تنتظر — الأزقة ضيقة.",
      "A photography day in Fener and Balat: colorful houses, cafes, and church exteriors. The car drops at the nearest allowed point and waits — the lanes are narrow.",
      "Fener ve Balat fotoğraf günü: renkli evler, kahveler, kilise dışları. Araç izinli en yakın noktada bırakır ve bekler — sokaklar dar."
    ),
    vehicle: "sedan",
    price: 220,
    hours: 5,
    from: HOTEL_IST,
    to: loc("فنار وبالات", "Fener & Balat", "Fener ve Balat"),
    highlights: [
      loc("البيوت الملونة", "Colorful houses", "Renkli evler"),
      loc("قرن ذهبي هادئ", "Quiet Golden Horn streets", "Sakin Haliç sokakları"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("10:00 — استلام", "10:00 — Pickup", "10:00 — Alış"),
      loc("10:40 — فنار من أقرب نقطة إنزال", "10:40 — Fener from the nearest drop-off", "10:40 — En yakın bırakıştan Fener"),
      loc("12:00 — بالات والمقاهي", "12:00 — Balat and cafes", "12:00 — Balat ve kahveler"),
      loc("13:30 — غداء حر", "13:30 — Free lunch", "13:30 — Serbest öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
    ],
    stops: [
      stop(41.029, 28.949, loc("فنار", "Fener", "Fener"), loc("حي تاريخي على القرن الذهبي.", "Historic quarter on the Golden Horn.", "Haliç’te tarihi semt."), PHOTO.istanbulSkyline),
      stop(41.031, 28.948, loc("بالات", "Balat", "Balat"), loc("بيوت ملونة شهيرة للتصوير.", "Famous colorful houses for photos.", "Fotoğraf için ünlü renkli evler."), PHOTO.coastalTown),
    ],
    landmarkPhotos: [PHOTO.istanbulSkyline, PHOTO.coastalTown, PHOTO.bosphorus],
    tips: [loc("الأزقة للمشاة — السيارة لا تدخل كل شارع", "Lanes are pedestrian — the car cannot enter every street", "Sokaklar yaya — araç her sokağa girmez")],
  }),
  defineVip({
    id: "vip-25",
    slug: "istanbul-rumeli-emirgan-vip",
    title: loc("روملي حصار وإميرغان VIP", "Rumeli Hisarı & Emirgan VIP", "Rumeli Hisarı ve Emirgan VIP"),
    overview: loc(
      "نصف يوم إلى يوم على البوسفور الشمالي: قلعة روملي من الخارج أو الداخل حسب التذاكر، ثم حدائق إميرغان. أقل ازدحاماً من أورتاكوي ظهراً.",
      "A half-to-full day on the upper Bosphorus: Rumeli Fortress from outside or inside by ticket, then Emirgan Park. Less crowded than Ortaköy at midday.",
      "Kuzey Boğaz’da yarım veya tam gün: Rumeli Hisarı dışı veya biletli iç, sonra Emirgan Korusu. Öğlen Ortaköy’den daha sakin."
    ),
    vehicle: "minivan",
    price: 250,
    hours: 6,
    from: HOTEL_IST,
    to: loc("روملي وإميرغان", "Rumeli & Emirgan", "Rumeli ve Emirgan"),
    highlights: [
      loc("قلعة روملي", "Rumeli Fortress", "Rumeli Hisarı"),
      loc("حديقة إميرغان", "Emirgan Park", "Emirgan Korusu"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:30 — استلام", "09:30 — Pickup", "09:30 — Alış"),
      loc("10:20 — روملي حصار", "10:20 — Rumeli Hisarı", "10:20 — Rumeli Hisarı"),
      loc("12:00 — إميرغان ومشي قصير", "12:00 — Emirgan and a short walk", "12:00 — Emirgan ve kısa yürüyüş"),
      loc("13:00 — غداء على الطريق الساحلي", "13:00 — Lunch on the coastal road", "13:00 — Sahil yolunda öğle"),
      loc("15:30 — العودة", "15:30 — Return", "15:30 — Dönüş"),
    ],
    stops: [
      stop(41.0848, 29.0567, loc("روملي حصار", "Rumeli Hisarı", "Rumeli Hisarı"), loc("قلعة على أضيق نقطة في البوسفور.", "Fortress at the narrowest Bosphorus point.", "Boğaz’ın en dar yerindeki hisar."), PHOTO.bosphorus),
      stop(41.108, 29.056, loc("إميرغان", "Emirgan", "Emirgan"), loc("حديقة tung وورود في الموسم.", "Park of planes and tulips in season.", "Sezonda çınar ve lale korusu."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.bosphorus, PHOTO.forest, PHOTO.istanbulSkyline],
    tips: [loc("دخول القلعة تذكرة منفصلة وقد يُغلق جزء منها", "Fortress entry is extra and parts may close", "Hisar girişi extra, bölümler kapanabilir")],
  }),
  defineVip({
    id: "vip-26",
    slug: "istanbul-miniaturk-family-vip",
    title: loc("مينياتورك إسطنبول العائلية VIP", "Miniatürk Family VIP", "Miniatürk Aile VIP"),
    overview: loc(
      "يوم عائلي في مينياتورك: نماذج تركيا مصغّرة، مناسب للأطفال دون يوم متاحف طويلة. السيارة من الفندق وإليه — ليس ترانسفير مطار.",
      "A family day at Miniatürk: miniature Turkey models, easier for children than a long museum day. Hotel-to-hotel car — not an airport transfer.",
      "Miniatürk aile günü: küçültülmüş Türkiye modelleri, uzun müze gününden çocuklara daha kolay. Otelden otele araç — havalimanı transferi değil."
    ),
    vehicle: "minivan",
    price: 230,
    hours: 5,
    from: HOTEL_IST,
    to: loc("مينياتورك", "Miniatürk", "Miniatürk"),
    highlights: [
      loc("نماذج تركيا", "Turkey in miniature", "Minyatür Türkiye"),
      loc("مناسب للأطفال", "Child-friendly pace", "Çocuk temposu"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("10:00 — استلام عائلي", "10:00 — Family pickup", "10:00 — Aile alış"),
      loc("10:40 — مينياتورك", "10:40 — Miniatürk", "10:40 — Miniatürk"),
      loc("13:00 — غداء قريب", "13:00 — Nearby lunch", "13:00 — Yakında öğle"),
      loc("15:00 — العودة قبل تعب الأطفال", "15:00 — Return before the children tire", "15:00 — Çocuklar yorulmadan dönüş"),
    ],
    stops: [
      stop(41.059, 28.948, loc("مينياتورك", "Miniatürk", "Miniatürk"), loc("حديقة نماذج مفتوحة على القرن الذهبي.", "Open-air model park on the Golden Horn.", "Haliç’te açık hava maket parkı."), PHOTO.landscape),
    ],
    landmarkPhotos: [PHOTO.landscape, PHOTO.istanbulSkyline, PHOTO.mercedesVan],
    tips: [loc("تذاكر الحديقة منفصلة", "Park tickets are extra", "Park biletleri extra")],
  }),
  defineVip({
    id: "vip-27",
    slug: "istanbul-evening-bosphorus-lights-vip",
    title: loc("أضواء البوسفور المسائية VIP", "Evening Bosphorus Lights VIP", "Akşam Boğaz Işıkları VIP"),
    overview: loc(
      "بعد الظهر إلى المساء: أورتاكوي، جسر البوسفور، ونقطة تصوير عند الغروب. ليست رحلة عبّارة سياحية مشتركة — سيارة خاصة حتى 7.",
      "Afternoon into evening: Ortaköy, the Bosphorus Bridge, and a sunset photo stop. Not a shared tourist ferry — private car up to 7.",
      "Öğleden sonra akşama: Ortaköy, Boğaz Köprüsü ve gün batımı fotoğrafı. Paylaşımlı turistik feribot değil — 7 kişiye kadar özel araç."
    ),
    vehicle: "minivan",
    price: 240,
    hours: 5,
    featured: true,
    from: HOTEL_IST,
    to: loc("البوسفور مساءً", "Evening Bosphorus", "Akşam Boğaz"),
    highlights: [
      loc("غروب على المضيق", "Sunset on the strait", "Boğaz’da gün batımı"),
      loc("أورتاكوي ليلاً", "Ortaköy after dark", "Karanlıkta Ortaköy"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("16:00 — استلام بعد الظهر", "16:00 — Afternoon pickup", "16:00 — Öğleden sonra alış"),
      loc("16:40 — أورتاكوي والجسر", "16:40 — Ortaköy and the bridge", "16:40 — Ortaköy ve köprü"),
      loc("18:00 — نقطة غروب حسب الفصل", "18:00 — Sunset point by season", "18:00 — Mevsime göre gün batımı"),
      loc("19:30 — عشاء حر أو عودة للفندق", "19:30 — Free dinner stop or hotel return", "19:30 — Serbest akşam yemeği veya otele dönüş"),
    ],
    stops: [
      stop(41.0553, 29.0267, loc("أورتاكوي", "Ortaköy", "Ortaköy"), loc("المسجد والجسر عند الغروب.", "Mosque and bridge at sunset.", "Gün batımında cami ve köprü."), PHOTO.nightCity),
      stop(41.0391, 29.0002, loc("دولمابهتشه ليلاً", "Dolmabahçe at night", "Gece Dolmabahçe"), loc("واجهة القصر مضاءة من الطريق.", "Lit palace facade from the road.", "Yoldan aydınlık saray cephesi."), PHOTO.bosphorus),
    ],
    landmarkPhotos: [PHOTO.nightCity, PHOTO.bosphorus, PHOTO.istanbulSkyline],
    tips: [loc("الغروب يتغير شتاءً — نبدأ أبكر", "Sunset is earlier in winter — we start sooner", "Kışın gün batımı erken — daha erken çıkarız")],
  }),
  defineVip({
    id: "vip-28",
    slug: "iznik-day-trip-vip",
    title: loc("إزنيق يوم كامل VIP", "İznik Full Day VIP", "İznik Tam Gün VIP"),
    overview: loc(
      "يوم من إسطنبول إلى إزنيق: سور المدينة، المسجد الأخضر، وبحيرة إزنيق. أبعد قليلاً من بورصة في اتجاه مختلف — سعر المركبة يعكس المسافة.",
      "A day from Istanbul to İznik: city walls, the Green Mosque, and Lake İznik. A different direction from Bursa — the vehicle price reflects the distance.",
      "İstanbul’dan İznik: surlar, Yeşil Camii, İznik Gölü. Bursa’dan başka yön — araç fiyatı mesafeyi yansıtır."
    ),
    vehicle: "minivan",
    price: 390,
    hours: 11,
    from: HOTEL_IST,
    to: loc("إزنيق", "İznik", "İznik"),
    highlights: [
      loc("بحيرة إزنيق", "Lake İznik", "İznik Gölü"),
      loc("سور المدينة", "City walls", "Kent surları"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("07:30 — مغادرة إسطنبول", "07:30 — Leave Istanbul", "07:30 — İstanbul çıkışı"),
      loc("10:15 — سور إزنيق والمركز", "10:15 — İznik walls and centre", "10:15 — İznik surları ve merkez"),
      loc("12:30 — غداء سمك أو محلي على البحيرة", "12:30 — Lake fish or local lunch", "12:30 — Gölde balık veya yerel öğle"),
      loc("14:30 — المسجد الأخضر ومشي قصير", "14:30 — Green Mosque and a short walk", "14:30 — Yeşil Camii ve kısa yürüyüş"),
      loc("16:00 — طريق العودة", "16:00 — Return road", "16:00 — Dönüş yolu"),
      loc("19:00 — الفندق", "19:00 — Hotel", "19:00 — Otel"),
    ],
    stops: [
      stop(40.428, 29.721, loc("إزنيق", "İznik", "İznik"), loc("بلدة تاريخية على البحيرة.", "Historic town on the lake.", "Göl kenarında tarihi kasaba."), PHOTO.alpineLake),
      stop(40.429, 29.72, loc("المسجد الأخضر", "Green Mosque", "Yeşil Camii"), loc("عمارة إزنيق المبكرة.", "Early İznik architecture.", "Erken İznik mimarisi."), PHOTO.mosqueInterior),
    ],
    landmarkPhotos: [PHOTO.alpineLake, PHOTO.mosqueInterior, PHOTO.landscape],
    tips: [loc("يوم طويل — احمل وجبة خفيفة للأطفال", "A long day — pack a snack for children", "Uzun gün — çocuklar için atıştırmalık")],
  }),
  defineVip({
    id: "vip-29",
    slug: "yalova-termal-vip",
    title: loc("يالوفا والينابيع VIP", "Yalova & Termal VIP", "Yalova ve Termal VIP"),
    overview: loc(
      "يوم عبر العبّارة أو الجسر إلى يالوفا: بلدة الينابيع في ترمال وحدائق. أقصر من بورصة إن اخترنا العبّارة حسب الجدول.",
      "A day by ferry or bridge to Yalova: the Termal spa town and gardens. Shorter than Bursa if we take the ferry by timetable.",
      "Feribot veya köprüyle Yalova: Termal kaplıca kasabası ve bahçeler. Feribot saatine göre Bursa’dan kısa olabilir."
    ),
    vehicle: "minivan",
    price: 340,
    hours: 9,
    from: HOTEL_IST,
    to: loc("يالوفا وترمال", "Yalova & Termal", "Yalova ve Termal"),
    highlights: [
      loc("ترمال", "Termal gardens", "Termal bahçeleri"),
      loc("خيار عبّارة", "Optional ferry crossing", "İsteğe feribot"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:00 — استلام وميناء أو جسر حسب الازدحام", "08:00 — Pickup then pier or bridge by traffic", "08:00 — Alış, sonra trafiğe göre iskele veya köprü"),
      loc("10:30 — يالوفا", "10:30 — Yalova", "10:30 — Yalova"),
      loc("11:15 — ترمال والحدائق", "11:15 — Termal and gardens", "11:15 — Termal ve bahçeler"),
      loc("13:00 — غداء", "13:00 — Lunch", "13:00 — Öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
      loc("17:30 — الفندق", "17:30 — Hotel", "17:30 — Otel"),
    ],
    stops: [
      stop(40.655, 29.276, loc("يالوفا", "Yalova", "Yalova"), loc("مدينة ساحلية جنوب إسطنبول.", "Coastal city south of Istanbul.", "İstanbul’un güneyinde sahil kenti."), PHOTO.coastalTown),
      stop(40.605, 29.173, loc("ترمال", "Termal", "Termal"), loc("ينابيع وحدائق تلّية.", "Hot springs and hillside gardens.", "Kaplıca ve yamaç bahçeleri."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.coastalTown, PHOTO.forest, PHOTO.landscape],
    tips: [loc("تذكرة العبّارة منفصلة إن استخدمناها", "Ferry tickets are extra if we use the boat", "Feribot kullanılırsa bilet extra")],
  }),
  defineVip({
    id: "vip-30",
    slug: "abant-golcuk-vip",
    title: loc("أبانت وجولجوك VIP", "Abant & Gölcük VIP", "Abant ve Gölcük VIP"),
    overview: loc(
      "يوم بحيرات غرب الأناضول من إسطنبول: بحيرة أبانت وغولجوك بولو. مسافة أطول من سبانجا — سعر أعلى وجدول مبكر.",
      "A western-Anatolian lakes day from Istanbul: Lake Abant and Bolu Gölcük. Longer than Sapanca — higher price and an early start.",
      "İstanbul’dan batı Anadolu gölleri: Abant ve Bolu Gölcük. Sapanca’dan uzun — daha yüksek fiyat ve erken çıkış."
    ),
    vehicle: "minivan",
    price: 400,
    hours: 11,
    from: HOTEL_IST,
    to: loc("أبانت", "Abant", "Abant"),
    highlights: [
      loc("بحيرة أبانت", "Lake Abant", "Abant Gölü"),
      loc("غولجوك إن سمح الوقت", "Gölcük if time allows", "Zaman varsa Gölcük"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("07:00 — مغادرة إسطنبول", "07:00 — Leave Istanbul", "07:00 — İstanbul çıkışı"),
      loc("10:00 — أبانت ومشي حول البحيرة", "10:00 — Abant and a lake walk", "10:00 — Abant ve göl yürüyüşü"),
      loc("12:30 — غداء في المنطقة", "12:30 — Lunch in the area", "12:30 — Bölgede öğle"),
      loc("14:30 — غولجوك إن بقي وقت", "14:30 — Gölcük if time remains", "14:30 — Zaman kalırsa Gölcük"),
      loc("16:00 — العودة", "16:00 — Return", "16:00 — Dönüş"),
      loc("19:00 — الفندق", "19:00 — Hotel", "19:00 — Otel"),
    ],
    stops: [
      stop(40.606, 31.272, loc("أبانت", "Abant", "Abant"), loc("بحيرة غابات في بولو.", "Forest lake in Bolu.", "Bolu’da orman gölü."), PHOTO.alpineLake),
      stop(40.7, 31.48, loc("غولجوك", "Gölcük", "Gölcük"), loc("بحيرة أصغر قريبة.", "Smaller nearby lake.", "Yakındaki küçük göl."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.alpineLake, PHOTO.forest, PHOTO.mountains],
    tips: [loc("الطريق جبلي بعد المطر", "The road is hilly after rain", "Yağmur sonrası yol engebeli")],
  }),
  defineVip({
    id: "vip-31",
    slug: "bursa-sprinter-group",
    title: loc("بورصة سبرينتر — حتى 20 راكباً", "Bursa Sprinter — max 20", "Bursa Sprinter — 20 kişi"),
    overview: loc(
      "نفس يوم بورصة لمجموعة: أولوداغ والمسجد الأخضر وجمعلقيزيق في سبرينتر حتى 20. السعر للمركبة أعلى بسبب الحجم والطريق.",
      "The same Bursa day for a group: Uludağ, the Green Mosque, and Cumalıkızık in a Sprinter up to 20. Per-vehicle price is higher because of size and the road.",
      "Aynı Bursa günü grup için: Uludağ, Yeşil Camii, Cumalıkızık, 20 kişilik Sprinter. Hacim ve yol nedeniyle araç fiyatı daha yüksek."
    ),
    vehicle: "sprinter",
    price: 780,
    hours: 11,
    from: HOTEL_IST,
    to: loc("دائرة بورصة", "Bursa circuit", "Bursa güzergâhı"),
    highlights: [
      loc("حتى 20 راكباً", "Up to 20 passengers", "En fazla 20 yolcu"),
      loc("أولوداغ وجمعلقيزيق", "Uludağ & Cumalıkızık", "Uludağ ve Cumalıkızık"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("07:00 — استلام المجموعة من الفندق أو نقطة تجمع", "07:00 — Group pickup at the hotel or a meeting point", "07:00 — Otel veya buluşma noktasından grup alış"),
      loc("09:30 — المسجد الأخضر", "09:30 — Green Mosque", "09:30 — Yeşil Camii"),
      loc("11:00 — تلفريك أولوداغ", "11:00 — Uludağ cable car", "11:00 — Uludağ teleferik"),
      loc("13:30 — غداء إسكندر للمجموعة", "13:30 — Group İskender lunch", "13:30 — Grup İskender öğle"),
      loc("15:00 — جمعلقيزيق", "15:00 — Cumalıkızık", "15:00 — Cumalıkızık"),
      loc("16:30 — طريق العودة", "16:30 — Return road", "16:30 — Dönüş"),
      loc("19:30 — إنزال إسطنبول", "19:30 — Istanbul drop-off", "19:30 — İstanbul bırakış"),
    ],
    stops: [
      stop(40.1826, 29.0669, loc("المسجد الأخضر", "Green Mosque", "Yeşil Camii"), loc("توقف المجموعة الأول.", "First group stop.", "Grubun ilk durağı."), PHOTO.mosqueInterior),
      stop(40.1089, 29.0089, loc("أولوداغ", "Uludağ", "Uludağ"), loc("تلفريك — تذاكر منفصلة.", "Cable car — tickets extra.", "Teleferik — bilet extra."), PHOTO.mountains),
      stop(40.1747, 29.1714, loc("جمعلقيزيق", "Cumalıkızık", "Cumalıkızık"), loc("قرية عثمانية لمشي قصير.", "Ottoman village for a short walk.", "Kısa yürüyüş için Osmanlı köyü."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.sprinter, PHOTO.mountains, PHOTO.mosqueInterior],
    tips: [loc("مواقف السبرينتر عند التلفريك محدودة صيفاً", "Sprinter parking at the cable car is tight in summer", "Yazın teleferikte Sprinter parkı dar")],
  }),
  defineVip({
    id: "vip-32",
    slug: "sapanca-sprinter-group",
    title: loc("سبانجا سبرينتر — حتى 20 راكباً", "Sapanca Sprinter — max 20", "Sapanca Sprinter — 20 kişi"),
    overview: loc(
      "بحيرة سبانجا والمعشوقية لمجموعة في سبرينتر. السعر للمركبة — مناسب للعائلات الكبيرة في يوم طبيعة.",
      "Lake Sapanca and Maşukiye for a Sprinter group. Per-vehicle price — suits large families on a nature day.",
      "Sprinter grubu için Sapanca Gölü ve Maşukiye. Araç başı fiyat — doğa gününde kalabalık ailelere uygun."
    ),
    vehicle: "sprinter",
    price: 680,
    hours: 9,
    from: HOTEL_IST,
    to: loc("سبانجا والمعشوقية", "Sapanca & Maşukiye", "Sapanca ve Maşukiye"),
    highlights: [
      loc("حتى 20 راكباً", "Up to 20 passengers", "En fazla 20 yolcu"),
      loc("بحيرة وشلال", "Lake and waterfall", "Göl ve şelale"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:00 — استلام المجموعة", "08:00 — Group pickup", "08:00 — Grup alış"),
      loc("10:00 — بحيرة سبانجا", "10:00 — Lake Sapanca", "10:00 — Sapanca Gölü"),
      loc("12:30 — غداء سمك", "12:30 — Trout lunch", "12:30 — Alabalık öğle"),
      loc("14:30 — المعشوقية", "14:30 — Maşukiye", "14:30 — Maşukiye"),
      loc("16:30 — العودة", "16:30 — Return", "16:30 — Dönüş"),
    ],
    stops: [
      stop(40.6914, 30.2678, loc("بحيرة سبانجا", "Lake Sapanca", "Sapanca Gölü"), loc("تجمع المجموعة على البحيرة.", "Group gathering at the lake.", "Gölde grup buluşması."), PHOTO.alpineLake),
      stop(40.7, 30.18, loc("المعشوقية", "Maşukiye", "Maşukiye"), loc("شلال ومطاعم غابة.", "Waterfall and forest restaurants.", "Şelale ve orman restoranları."), PHOTO.waterfall),
    ],
    landmarkPhotos: [PHOTO.sprinter, PHOTO.alpineLake, PHOTO.waterfall],
    tips: [loc("احجزوا طاولة الغداء مسبقاً للمجموعة", "Reserve the lunch table for the group", "Grup için öğle masasını önceden ayırtın")],
  }),
  defineVip({
    id: "vip-33",
    slug: "polonezkoy-anadolu-kavagi-vip",
    title: loc("بولونزكوي والأناضول كواغي VIP", "Polonezköy & Anadolu Kavağı VIP", "Polonezköy ve Anadolu Kavağı VIP"),
    overview: loc(
      "يوم شمال إسطنبول الآسيوي: قرية بولونزكوي ثم الأناضول كواغي عند فم البوسفور إن سمح الوقت. طبيعة أقرب من سبانجا.",
      "A north-Asian Istanbul day: Polonezköy village then Anadolu Kavağı at the Bosphorus mouth if time allows. Nature closer than Sapanca.",
      "İstanbul’un kuzey Anadolu yakası: Polonezköy, zaman varsa Boğaz ağzında Anadolu Kavağı. Sapanca’dan daha yakın doğa."
    ),
    vehicle: "minivan",
    price: 300,
    hours: 8,
    from: HOTEL_IST,
    to: loc("بولونزكوي", "Polonezköy", "Polonezköy"),
    highlights: [
      loc("قرية بولونزكوي", "Polonezköy village", "Polonezköy"),
      loc("كواغي اختيارية", "Optional Kavağı", "İsteğe Kavağı"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام وعبور آسيوي", "09:00 — Pickup and Asian crossing", "09:00 — Alış ve Anadolu geçişi"),
      loc("10:15 — بولونزكوي ومشي", "10:15 — Polonezköy and a walk", "10:15 — Polonezköy ve yürüyüş"),
      loc("12:30 — غداء قرية", "12:30 — Village lunch", "12:30 — Köy öğle"),
      loc("14:30 — الأناضول كواغي إن بقي وقت", "14:30 — Anadolu Kavağı if time remains", "14:30 — Zaman kalırsa Anadolu Kavağı"),
      loc("17:00 — العودة", "17:00 — Return", "17:00 — Dönüş"),
    ],
    stops: [
      stop(41.108, 29.2, loc("بولونزكوي", "Polonezköy", "Polonezköy"), loc("قرية غابات شمال المدينة.", "Forest village north of the city.", "Kent kuzeyinde orman köyü."), PHOTO.forest),
      stop(41.173, 29.088, loc("الأناضول كواغي", "Anadolu Kavağı", "Anadolu Kavağı"), loc("بلدة عند فم البوسفور.", "Town at the Bosphorus mouth.", "Boğaz ağzındaki kasaba."), PHOTO.bosphorus),
    ],
    landmarkPhotos: [PHOTO.forest, PHOTO.bosphorus, PHOTO.landscape],
    tips: [loc("عطل نهاية الأسبوع مزدحمة في بولونزكوي", "Weekends are busy in Polonezköy", "Hafta sonu Polonezköy yoğun")],
  }),
  defineVip({
    id: "vip-34",
    slug: "kilyos-black-sea-vip",
    title: loc("كيليوس البحر الأسود VIP", "Kilyos Black Sea VIP", "Kilyos Karadeniz VIP"),
    overview: loc(
      "نصف يوم إلى يوم على شاطئ كيليوس شمال إسطنبول الأوروبي. أقصر من شيله — مناسب لعائلة تريد بحراً دون يوم كامل شرقاً.",
      "A half-to-full day on Kilyos beach on Istanbul’s European Black Sea. Shorter than Şile — for a family who wants the sea without a full eastbound day.",
      "İstanbul’un Avrupa Karadeniz’inde Kilyos. Şile’den kısa — tam doğu günü olmadan deniz isteyen aile için."
    ),
    vehicle: "minivan",
    price: 240,
    hours: 6,
    from: HOTEL_IST,
    to: loc("كيليوس", "Kilyos", "Kilyos"),
    highlights: [
      loc("شاطئ البحر الأسود", "Black Sea beach", "Karadeniz plajı"),
      loc("أقرب من شيله", "Closer than Şile", "Şile’den yakın"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("10:00 — استلام", "10:00 — Pickup", "10:00 — Alış"),
      loc("11:00 — كيليوس والشاطئ", "11:00 — Kilyos and the beach", "11:00 — Kilyos ve plaj"),
      loc("13:00 — غداء ساحلي", "13:00 — Coastal lunch", "13:00 — Sahil öğle"),
      loc("15:30 — العودة", "15:30 — Return", "15:30 — Dönüş"),
    ],
    stops: [
      stop(41.242, 29.0, loc("كيليوس", "Kilyos", "Kilyos"), loc("شاطئ شمال إسطنبول على البحر الأسود.", "Beach north of Istanbul on the Black Sea.", "İstanbul kuzeyinde Karadeniz plajı."), PHOTO.coastalTown),
    ],
    landmarkPhotos: [PHOTO.coastalTown, PHOTO.aegeanCoast, PHOTO.landscape],
    tips: [loc("البحر الأسود أبرد وأمواج أعلى من مرمرة", "The Black Sea is colder and choppier than the Marmara", "Karadeniz Marmara’dan soğuk ve dalgalı")],
  }),
  defineVip({
    id: "vip-35",
    slug: "trabzon-boztepe-city-vip",
    title: loc("بوزتبه ومدينة طرابزون VIP", "Boztepe & Trabzon City VIP", "Boztepe ve Trabzon Kent VIP"),
    overview: loc(
      "يوم مدينة دون طريق جبلي طويل: تلة بوزتبه، وسط طرابزون، وكورنيش إن سمح الوقت. أرخص من أوزنجول لأن المسافة أقصر.",
      "A city day without a long mountain road: Boztepe hill, central Trabzon, and the waterfront if time allows. Priced below Uzungöl because the distance is shorter.",
      "Uzun dağ yolu olmadan kent günü: Boztepe, Trabzon merkez, zaman varsa sahil. Mesafe kısa olduğu için Uzungöl’den ucuz."
    ),
    vehicle: "sedan",
    price: 220,
    hours: 6,
    from: HOTEL_TRB,
    to: loc("بوزتبه والمركز", "Boztepe & centre", "Boztepe ve merkez"),
    highlights: [
      loc("تلة بوزتبه", "Boztepe hill", "Boztepe"),
      loc("وسط طرابزون", "Trabzon centre", "Trabzon merkez"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("10:00 — استلام", "10:00 — Pickup", "10:00 — Alış"),
      loc("10:30 — بوزتبه والشاي", "10:30 — Boztepe and tea", "10:30 — Boztepe ve çay"),
      loc("12:30 — وسط المدينة والغداء", "12:30 — City centre and lunch", "12:30 — Kent merkezi ve öğle"),
      loc("15:00 — كورنيش قصير", "15:00 — Short waterfront", "15:00 — Kısa sahil"),
      loc("16:30 — الفندق", "16:30 — Hotel", "16:30 — Otel"),
    ],
    stops: [
      stop(41.006, 39.72, loc("بوزتبه", "Boztepe", "Boztepe"), loc("تلة فوق مدينة طرابزون.", "Hill above Trabzon city.", "Trabzon kentinin üstündeki tepe."), PHOTO.landscape),
      stop(41.0027, 39.7168, loc("وسط طرابزون", "Trabzon centre", "Trabzon merkez"), loc("أسواق ومساجد المدينة.", "City markets and mosques.", "Kent çarşıları ve camileri."), PHOTO.teaGarden),
    ],
    landmarkPhotos: [PHOTO.landscape, PHOTO.teaGarden, PHOTO.coastalTown],
    tips: [loc("يوم خفيف بعد رحلة جبلية في اليوم السابق", "A light day after a mountain day", "Dağ gününden sonra hafif gün")],
  }),
  defineVip({
    id: "vip-36",
    slug: "trabzon-ataturk-mansion-vip",
    title: loc("قصر أتاتورك وطرابزون VIP", "Atatürk Mansion & Trabzon VIP", "Atatürk Köşkü ve Trabzon VIP"),
    overview: loc(
      "زيارة قصر أتاتورك في طرابزون مع وقت حر في المدينة. نصف يوم إلى يوم قصير — مناسب لمن يريد متحفاً دون أوزنجول.",
      "A visit to the Atatürk Mansion in Trabzon plus free city time. Half to short full day — for guests who want a museum without Uzungöl.",
      "Trabzon Atatürk Köşkü ve kentte serbest zaman. Yarım veya kısa tam gün — Uzungöl olmadan müze isteyenler için."
    ),
    vehicle: "sedan",
    price: 200,
    hours: 5,
    from: HOTEL_TRB,
    to: loc("قصر أتاتورك", "Atatürk Mansion", "Atatürk Köşkü"),
    highlights: [
      loc("قصر أتاتورك", "Atatürk Mansion", "Atatürk Köşkü"),
      loc("حدائق القصر", "Mansion gardens", "Köşk bahçeleri"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("10:00 — استلام", "10:00 — Pickup", "10:00 — Alış"),
      loc("10:30 — القصر والحديقة", "10:30 — Mansion and garden", "10:30 — Köşk ve bahçe"),
      loc("12:30 — غداء في المدينة", "12:30 — City lunch", "12:30 — Kentte öğle"),
      loc("14:30 — العودة", "14:30 — Return", "14:30 — Dönüş"),
    ],
    stops: [
      stop(40.993, 39.706, loc("قصر أتاتورك", "Atatürk Mansion", "Atatürk Köşkü"), loc("قصر خشبي في حديقة فوق المدينة.", "Wooden mansion in a garden above the city.", "Kent üstünde bahçeli ahşap köşk."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.forest, PHOTO.landscape, PHOTO.teaGarden],
    tips: [loc("تذكرة القصر منفصلة وأوقات الزيارة تتغير", "Mansion tickets are extra and hours change", "Köşk bileti extra, saatler değişir")],
  }),
  defineVip({
    id: "vip-37",
    slug: "trabzon-caykara-highlands-vip",
    title: loc("هضاب تشايكارا VIP", "Çaykara Highlands VIP", "Çaykara Yaylaları VIP"),
    overview: loc(
      "يوم هضاب حول تشايكارا دون الاكتفاء بوقوف أوزنجول السياحي فقط. طرق جبلية — ميني فان حتى 7 وسائق محلي.",
      "A highland day around Çaykara beyond the usual Uzungöl tourist parking lot. Mountain roads — minivan up to 7 and a local driver.",
      "Çaykara yaylalarında, yalnızca Uzungöl turistik otoparkının ötesinde bir gün. Dağ yolları — 7 kişilik minivan ve yerel şoför."
    ),
    vehicle: "minivan",
    price: 390,
    hours: 9,
    from: HOTEL_TRB,
    to: loc("تشايكارا", "Çaykara", "Çaykara"),
    highlights: [
      loc("هضاب تشايكارا", "Çaykara plateaus", "Çaykara yaylaları"),
      loc("طرق أقل ازدحاماً من البحيرة", "Quieter roads than the lake lot", "Göl otoparkından sakin yollar"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:00 — مغادرة طرابزون", "08:00 — Leave Trabzon", "08:00 — Trabzon çıkışı"),
      loc("10:00 — تشايكارا", "10:00 — Çaykara", "10:00 — Çaykara"),
      loc("11:00 — هضبة قريبة حسب الطقس", "11:00 — Nearby plateau by weather", "11:00 — Havaya göre yakın yayla"),
      loc("13:00 — غداء", "13:00 — Lunch", "13:00 — Öğle"),
      loc("15:30 — العودة", "15:30 — Return", "15:30 — Dönüş"),
      loc("17:30 — الفندق", "17:30 — Hotel", "17:30 — Otel"),
    ],
    stops: [
      stop(40.6, 40.3, loc("تشايكارا", "Çaykara", "Çaykara"), loc("مركز القضاء الجبلي.", "Mountain district centre.", "Dağ ilçe merkezi."), PHOTO.mountains),
      stop(40.58, 40.32, loc("هضبة", "Plateau", "Yayla"), loc("مراعٍ خضراء فوق الوادي.", "Green pastures above the valley.", "Vadi üstünde yeşil yayla."), PHOTO.landscape),
    ],
    landmarkPhotos: [PHOTO.mountains, PHOTO.landscape, PHOTO.forest],
    tips: [loc("الضباب يغلق بعض الهضاب صيفاً أيضاً", "Fog can close plateaus even in summer", "Yazın da sis yaylaları kapatabilir")],
  }),
  defineVip({
    id: "vip-38",
    slug: "trabzon-ikizdere-vip",
    title: loc("إيكيزديره VIP", "İkizdere VIP", "İkizdere VIP"),
    overview: loc(
      "وادي إيكيزديره شرق طرابزون: أنهار، جسور، وقرى شاي. بديل لأوزنجول إن أردتم ماءً جارياً دون البحيرة المزدحمة.",
      "The İkizdere valley east of Trabzon: rivers, bridges, and tea villages. An alternative to Uzungöl if you want running water without the crowded lake.",
      "Trabzon’un doğusunda İkizdere vadisi: nehir, köprü, çay köyleri. Kalabalık göl istemezseniz Uzungöl’e alternatif."
    ),
    vehicle: "minivan",
    price: 360,
    hours: 8,
    from: HOTEL_TRB,
    to: loc("إيكيزديره", "İkizdere", "İkizdere"),
    highlights: [
      loc("وادي النهر", "River valley", "Nehir vadisi"),
      loc("قرى شاي", "Tea villages", "Çay köyleri"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:30 — استلام", "08:30 — Pickup", "08:30 — Alış"),
      loc("10:30 — إيكيزديره", "10:30 — İkizdere", "10:30 — İkizdere"),
      loc("13:00 — غداء على الوادي", "13:00 — Valley lunch", "13:00 — Vadide öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
    ],
    stops: [
      stop(40.777, 40.557, loc("إيكيزديره", "İkizdere", "İkizdere"), loc("وادي نهري في ريزا.", "River valley in Rize.", "Rize’de nehir vadisi."), PHOTO.waterfall),
      stop(40.79, 40.54, loc("جسر الوادي", "Valley bridge", "Vadi köprüsü"), loc("توقف تصوير على الطريق.", "Photo stop on the road.", "Yolda fotoğraf molası."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.waterfall, PHOTO.forest, PHOTO.teaGarden],
    tips: [loc("بعد المطر الطريق ضيق", "The road is narrow after rain", "Yağmur sonrası yol dar")],
  }),
  defineVip({
    id: "vip-39",
    slug: "rize-tea-gardens-vip",
    title: loc("ريزا ومزارع الشاي VIP", "Rize Tea Gardens VIP", "Rize Çay Bahçeleri VIP"),
    overview: loc(
      "يوم أقصر إلى ريزا: مزارع شاي، وسط المدينة، وكورنيش البحر الأسود. دون صعود آيدر الكامل — سعر أقل من يوم الهضبة.",
      "A shorter day to Rize: tea gardens, the town centre, and the Black Sea front. Without the full Ayder climb — priced below the highland day.",
      "Rize’ye daha kısa gün: çay bahçeleri, kent merkezi, Karadeniz sahili. Tam Ayder çıkışı yok — yayla gününden ucuz."
    ),
    vehicle: "minivan",
    price: 300,
    hours: 7,
    from: HOTEL_TRB,
    to: loc("ريزا", "Rize", "Rize"),
    highlights: [
      loc("مزارع الشاي", "Tea gardens", "Çay bahçeleri"),
      loc("كورنيش ريزا", "Rize waterfront", "Rize sahili"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — مغادرة طرابزون", "09:00 — Leave Trabzon", "09:00 — Trabzon çıkışı"),
      loc("10:20 — ريزا والشاي", "10:20 — Rize and tea", "10:20 — Rize ve çay"),
      loc("12:30 — غداء", "12:30 — Lunch", "12:30 — Öğle"),
      loc("14:30 — كورنيش قصير", "14:30 — Short waterfront", "14:30 — Kısa sahil"),
      loc("16:00 — العودة", "16:00 — Return", "16:00 — Dönüş"),
    ],
    stops: [
      stop(41.0201, 40.5234, loc("ريزا", "Rize", "Rize"), loc("عاصمة الشاي على البحر الأسود.", "Tea capital on the Black Sea.", "Karadeniz’in çay başkenti."), PHOTO.teaGarden),
      stop(41.025, 40.52, loc("مزرعة شاي", "Tea garden", "Çay bahçesi"), loc("تلال خضراء فوق المدينة.", "Green hills above town.", "Kent üstünde yeşil yamaçlar."), PHOTO.mountains),
    ],
    landmarkPhotos: [PHOTO.teaGarden, PHOTO.mountains, PHOTO.coastalTown],
    tips: [loc("يمكن شراء شاي للمنزل — ليس إلزامياً", "You can buy tea to take home — not required", "Eve çay alabilirsiniz — zorunlu değil")],
  }),
  defineVip({
    id: "vip-40",
    slug: "ayder-sprinter-group",
    title: loc("آيدر سبرينتر — حتى 20 راكباً", "Ayder Sprinter — max 20", "Ayder Sprinter — 20 kişi"),
    overview: loc(
      "هضبة آيدر لمجموعة في سبرينتر حتى 20. الطريق ضيق في الموسم — السائق يعرف مواقف الحافلات. السعر للمركبة.",
      "Ayder plateau for a Sprinter group up to 20. The road is tight in season — the driver knows coach parking. Per-vehicle price.",
      "20 kişilik Sprinter ile Ayder yaylası. Sezonda yol dar — şoför otobüs parkını bilir. Araç başı fiyat."
    ),
    vehicle: "sprinter",
    price: 820,
    hours: 10,
    from: HOTEL_TRB,
    to: loc("آيدر", "Ayder", "Ayder"),
    highlights: [
      loc("حتى 20 راكباً", "Up to 20 passengers", "En fazla 20 yolcu"),
      loc("هضبة آيدر", "Ayder plateau", "Ayder yaylası"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("07:30 — استلام المجموعة", "07:30 — Group pickup", "07:30 — Grup alış"),
      loc("09:00 — ريزا توقف شاي قصير", "09:00 — Short Rize tea stop", "09:00 — Kısa Rize çay molası"),
      loc("11:00 — آيدر", "11:00 — Ayder", "11:00 — Ayder"),
      loc("13:00 — غداء هضبة", "13:00 — Plateau lunch", "13:00 — Yayla öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
      loc("18:00 — إنزال", "18:00 — Drop-off", "18:00 — Bırakış"),
    ],
    stops: [
      stop(41.0201, 40.5234, loc("ريزا", "Rize", "Rize"), loc("استراحة شاي للمجموعة.", "Group tea break.", "Grup çay molası."), PHOTO.teaGarden),
      stop(40.953, 41.1, loc("آيدر", "Ayder", "Ayder"), loc("هضبة وينابيع.", "Plateau and springs.", "Yayla ve kaplıca."), PHOTO.mountains),
    ],
    landmarkPhotos: [PHOTO.sprinter, PHOTO.mountains, PHOTO.teaGarden],
    tips: [loc("في أغسطس الازدحام شديد — اخرجوا مبكرين", "August is packed — leave early", "Ağustos çok yoğun — erken çıkın")],
  }),
  defineVip({
    id: "vip-41",
    slug: "cappadocia-goreme-pasabag-vip",
    title: loc("غوريمه وباشاباغ VIP", "Göreme & Paşabağ VIP", "Göreme ve Paşabağ VIP"),
    overview: loc(
      "يوم كابادوكيا من فندقكم في المنطقة: غوريمه المفتوحة، باشاباغ، ووادي الحب إن سمح الوقت. ليست رحلة بالون — السيارة خاصة حتى 7.",
      "A Cappadocia day from your hotel in the region: open-air Göreme, Paşabağ, and Love Valley if time allows. Not a balloon flight — private car up to 7.",
      "Bölgedeki otelinizden Kapadokya günü: Göreme açık hava, Paşabağ, zaman varsa Aşk Vadisi. Balon uçuşu değil — 7 kişiye kadar özel araç."
    ),
    vehicle: "minivan",
    price: 280,
    hours: 8,
    featured: true,
    from: HOTEL_CAP,
    to: loc("غوريمه وباشاباغ", "Göreme & Paşabağ", "Göreme ve Paşabağ"),
    highlights: [
      loc("غوريمه المفتوحة", "Göreme Open Air", "Göreme Açık Hava"),
      loc("مداخن باشاباغ", "Paşabağ chimneys", "Paşabağ bacaları"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام من فندق الكهف أو المدينة", "09:00 — Pickup from a cave hotel or town stay", "09:00 — Mağara oteli veya kasabadan alış"),
      loc("09:30 — غوريمه المفتوحة", "09:30 — Göreme Open Air", "09:30 — Göreme Açık Hava"),
      loc("12:00 — غداء في غوريمه", "12:00 — Lunch in Göreme", "12:00 — Göreme öğle"),
      loc("13:30 — باشاباغ", "13:30 — Paşabağ", "13:30 — Paşabağ"),
      loc("15:30 — وادي الحب من نقطة مشاهدة", "15:30 — Love Valley viewpoint", "15:30 — Aşk Vadisi manzara"),
      loc("17:00 — الفندق", "17:00 — Hotel", "17:00 — Otel"),
    ],
    stops: [
      stop(38.6431, 34.8289, loc("غوريمه", "Göreme", "Göreme"), loc("كنائس صخرية في الهواء الطلق.", "Rock churches in the open air.", "Açık havada kaya kiliseleri."), PHOTO.cappadociaValley),
      stop(38.653, 34.842, loc("باشاباغ", "Paşabağ", "Paşabağ"), loc("مداخن جنية شهيرة.", "Famous fairy chimneys.", "Ünlü peri bacaları."), PHOTO.cappadociaBalloons),
    ],
    landmarkPhotos: [PHOTO.cappadociaValley, PHOTO.cappadociaBalloons, PHOTO.caveHotel],
    tips: [loc("تذاكر المتاحف منفصلة والبالون ليس مشمولاً", "Museum tickets are extra and balloons are not included", "Müze biletleri extra, balon dahil değil")],
  }),
  defineVip({
    id: "vip-42",
    slug: "cappadocia-underground-uchisar-vip",
    title: loc("المدينة تحت الأرض وأوتشيسار VIP", "Underground City & Uçhisar VIP", "Yeraltı Şehri ve Uçhisar VIP"),
    overview: loc(
      "يوم مدينة تحت الأرض (كايمكلي أو ديرينكويو حسب الازدحام) ثم قلعة أوتشيسار. درجات كثيرة تحت الأرض — أخبرونا إن كان معكم كبار سن.",
      "An underground-city day (Kaymaklı or Derinkuyu by crowd) then Uçhisar Castle. Many stairs underground — tell us if you have older guests.",
      "Yeraltı şehri günü (kalabalığa göre Kaymaklı veya Derinkuyu) sonra Uçhisar Kalesi. Yer altında çok merdiven — yaşlı misafir varsa söyleyin."
    ),
    vehicle: "minivan",
    price: 300,
    hours: 8,
    from: HOTEL_CAP,
    to: loc("كايمكلي وأوتشيسار", "Kaymaklı & Uçhisar", "Kaymaklı ve Uçhisar"),
    highlights: [
      loc("مدينة تحت الأرض", "Underground city", "Yeraltı şehri"),
      loc("قلعة أوتشيسار", "Uçhisar Castle", "Uçhisar Kalesi"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام", "09:00 — Pickup", "09:00 — Alış"),
      loc("09:50 — كايمكلي أو ديرينكويو", "09:50 — Kaymaklı or Derinkuyu", "09:50 — Kaymaklı veya Derinkuyu"),
      loc("12:30 — غداء", "12:30 — Lunch", "12:30 — Öğle"),
      loc("14:00 — أوتشيسار", "14:00 — Uçhisar", "14:00 — Uçhisar"),
      loc("16:30 — العودة", "16:30 — Return", "16:30 — Dönüş"),
    ],
    stops: [
      stop(38.46, 34.75, loc("كايمكلي", "Kaymaklı", "Kaymaklı"), loc("مدينة تحت الأرض متعددة الطبقات.", "Multi-level underground city.", "Çok katlı yeraltı şehri."), PHOTO.caveHotel),
      stop(38.629, 34.795, loc("أوتشيسار", "Uçhisar", "Uçhisar"), loc("أعلى نقطة في المنطقة.", "Highest point in the region.", "Bölgenin en yüksek noktası."), PHOTO.cappadociaValley),
    ],
    landmarkPhotos: [PHOTO.caveHotel, PHOTO.cappadociaValley, PHOTO.landscape],
    tips: [loc("تحت الأرض بارد وضيّق", "It is cold and tight underground", "Yeraltı serin ve dar")],
  }),
  defineVip({
    id: "vip-43",
    slug: "cappadocia-ihlara-vip",
    title: loc("وادي إهلارا VIP", "Ihlara Valley VIP", "Ihlara Vadisi VIP"),
    overview: loc(
      "يوم وادي إهلارا: مشي نهر بين الجروف ثم كنيسة أو اثنتين. أطول مشياً من غوريمه — أحذية رياضية إلزامية عملياً.",
      "An Ihlara Valley day: a river walk between cliffs then one or two churches. More walking than Göreme — trainers are practically required.",
      "Ihlara Vadisi günü: uçurumlar arasında nehir yürüyüşü ve bir iki kilise. Göreme’den daha çok yürüyüş — spor ayakkabı neredeyse şart."
    ),
    vehicle: "minivan",
    price: 320,
    hours: 9,
    from: HOTEL_CAP,
    to: loc("إهلارا", "Ihlara", "Ihlara"),
    highlights: [
      loc("وادي النهر", "River canyon", "Nehir kanyonu"),
      loc("كنائس الجرف", "Cliff churches", "Uçurum kiliseleri"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:30 — استلام", "08:30 — Pickup", "08:30 — Alış"),
      loc("10:00 — مدخل الوادي", "10:00 — Valley entrance", "10:00 — Vadi girişi"),
      loc("10:20 — مشي 1–2 ساعة حسب القدرة", "10:20 — 1–2 hour walk by fitness", "10:20 — Kondisyona göre 1–2 saat yürüyüş"),
      loc("13:00 — غداء عند المخرج", "13:00 — Lunch at the exit", "13:00 — Çıkışta öğle"),
      loc("15:00 — العودة", "15:00 — Return", "15:00 — Dönüş"),
      loc("17:00 — الفندق", "17:00 — Hotel", "17:00 — Otel"),
    ],
    stops: [
      stop(38.255, 34.306, loc("إهلارا", "Ihlara Valley", "Ihlara Vadisi"), loc("وادي أخضر بين جروف كابادوكيا.", "Green canyon in the Cappadocia cliffs.", "Kapadokya uçurumlarında yeşil kanyon."), PHOTO.forest),
    ],
    landmarkPhotos: [PHOTO.forest, PHOTO.cappadociaValley, PHOTO.landscape],
    tips: [loc("درجات كثيرة عند المدخل", "Many steps at the entrance", "Girişte çok basamak")],
  }),
  defineVip({
    id: "vip-44",
    slug: "cappadocia-sprinter-group",
    title: loc("كابادوكيا سبرينتر — حتى 20 راكباً", "Cappadocia Sprinter — max 20", "Kapadokya Sprinter — 20 kişi"),
    overview: loc(
      "دائرة غوريمه وباشاباغ لمجموعة في سبرينتر حتى 20. السعر للمركبة — مواقف الحافلات في الموسم مزدحمة.",
      "Göreme and Paşabağ circuit for a Sprinter group up to 20. Per-vehicle price — coach lots are busy in season.",
      "20 kişilik Sprinter ile Göreme ve Paşabağ. Araç başı fiyat — sezonda otobüs parkı yoğun."
    ),
    vehicle: "sprinter",
    price: 650,
    hours: 8,
    from: HOTEL_CAP,
    to: loc("دائرة كابادوكيا", "Cappadocia circuit", "Kapadokya güzergâhı"),
    highlights: [
      loc("حتى 20 راكباً", "Up to 20 passengers", "En fazla 20 yolcu"),
      loc("غوريمه وباشاباغ", "Göreme & Paşabağ", "Göreme ve Paşabağ"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام المجموعة", "09:00 — Group pickup", "09:00 — Grup alış"),
      loc("09:40 — غوريمه", "09:40 — Göreme", "09:40 — Göreme"),
      loc("12:30 — غداء المجموعة", "12:30 — Group lunch", "12:30 — Grup öğle"),
      loc("14:00 — باشاباغ", "14:00 — Paşabağ", "14:00 — Paşabağ"),
      loc("16:30 — إنزال", "16:30 — Drop-off", "16:30 — Bırakış"),
    ],
    stops: [
      stop(38.6431, 34.8289, loc("غوريمه", "Göreme", "Göreme"), loc("تجمع المجموعة عند المدخل.", "Group meeting at the gate.", "Girişte grup buluşması."), PHOTO.cappadociaValley),
      stop(38.653, 34.842, loc("باشاباغ", "Paşabağ", "Paşabağ"), loc("توقف تصوير جماعي.", "Group photo stop.", "Grup fotoğraf molası."), PHOTO.cappadociaBalloons),
    ],
    landmarkPhotos: [PHOTO.sprinter, PHOTO.cappadociaValley, PHOTO.cappadociaBalloons],
    tips: [loc("السبرينتر لا يدخل كل وادي ضيق", "The Sprinter cannot enter every tight valley", "Sprinter her dar vadiye girmez")],
  }),
  defineVip({
    id: "vip-45",
    slug: "antalya-old-town-duden-vip",
    title: loc("أنطاليا القديمة ودودان VIP", "Antalya Old Town & Düden VIP", "Antalya Kaleiçi ve Düden VIP"),
    overview: loc(
      "يوم مدينة أنطاليا من فندقكم: كاليتشي والميناء، ثم شلال دودان العلوي أو السفلي حسب الازدحام. ليست صورة أبراج كوالالمبور — هذا ساحل تركيا المتوسطي.",
      "An Antalya city day from your hotel: Kaleiçi and the harbour, then Düden waterfall (upper or lower by crowd). Not a Kuala Lumpur skyline — this is Turkey’s Mediterranean coast.",
      "Otelinizden Antalya kent günü: Kaleiçi ve liman, sonra kalabalığa göre Düden şelalesi. Kuala Lumpur silüeti değil — Türkiye’nin Akdeniz kıyısı."
    ),
    vehicle: "minivan",
    price: 260,
    hours: 7,
    featured: true,
    from: HOTEL_ANT,
    to: loc("كاليتشي ودودان", "Kaleiçi & Düden", "Kaleiçi ve Düden"),
    highlights: [
      loc("كاليتشي والميناء", "Kaleiçi harbour", "Kaleiçi limanı"),
      loc("شلال دودان", "Düden waterfall", "Düden şelalesi"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:30 — استلام من الفندق (كونيالتي أو لارا أو كاليتشي)", "09:30 — Hotel pickup (Konyaaltı, Lara, or Kaleiçi)", "09:30 — Otelden alış (Konyaaltı, Lara veya Kaleiçi)"),
      loc("10:15 — كاليتشي والميناء القديم", "10:15 — Kaleiçi and the old harbour", "10:15 — Kaleiçi ve eski liman"),
      loc("12:30 — غداء في الميناء أو القلعة", "12:30 — Lunch at the harbour or in the kale", "12:30 — Limanda veya kale içinde öğle"),
      loc("14:30 — دودان", "14:30 — Düden", "14:30 — Düden"),
      loc("16:30 — العودة", "16:30 — Return", "16:30 — Dönüş"),
    ],
    stops: [
      stop(36.885, 30.705, loc("كاليتشي", "Kaleiçi", "Kaleiçi"), loc("البلدة القديمة وميناء أنطاليا.", "Antalya old town and harbour.", "Antalya eski kent ve liman."), PHOTO.antalyaCoast),
      stop(36.962, 30.726, loc("دودان", "Düden Falls", "Düden Şelalesi"), loc("شلال متوسطي قرب المدينة.", "Mediterranean waterfall near the city.", "Kente yakın Akdeniz şelalesi."), PHOTO.waterfall),
    ],
    landmarkPhotos: [PHOTO.antalyaCoast, PHOTO.waterfall, PHOTO.yachtHarbor],
    tips: [loc("الأزقة للمشاة — السيارة تنتظر عند الميناء", "Lanes are pedestrian — the car waits at the harbour", "Sokaklar yaya — araç limanda bekler")],
  }),
  defineVip({
    id: "vip-46",
    slug: "side-aspendos-vip",
    title: loc("سايد وأسبندوس VIP", "Side & Aspendos VIP", "Side ve Aspendos VIP"),
    overview: loc(
      "يوم من أنطاليا إلى سايد: المسرح والميناء القديم، مع أسبندوس إن سمح الوقت. مسافة شرقية — أعلى من يوم مدينة أنطاليا.",
      "A day from Antalya to Side: the theatre and old harbour, plus Aspendos if time allows. An eastbound distance — priced above an Antalya city day.",
      "Antalya’dan Side: tiyatro ve eski liman, zaman varsa Aspendos. Doğu mesafesi — Antalya kent gününden pahalı."
    ),
    vehicle: "minivan",
    price: 320,
    hours: 9,
    from: HOTEL_ANT,
    to: loc("سايد وأسبندوس", "Side & Aspendos", "Side ve Aspendos"),
    highlights: [
      loc("مسرح سايد", "Side theatre", "Side tiyatrosu"),
      loc("أسبندوس", "Aspendos", "Aspendos"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:30 — مغادرة أنطاليا", "08:30 — Leave Antalya", "08:30 — Antalya çıkışı"),
      loc("10:00 — أسبندوس إن بدأنا به", "10:00 — Aspendos if we start there", "10:00 — Orada başlarsak Aspendos"),
      loc("11:30 — سايد القديمة", "11:30 — Old Side", "11:30 — Eski Side"),
      loc("13:00 — غداء على الميناء", "13:00 — Harbour lunch", "13:00 — Liman öğle"),
      loc("15:30 — العودة", "15:30 — Return", "15:30 — Dönüş"),
      loc("17:30 — الفندق", "17:30 — Hotel", "17:30 — Otel"),
    ],
    stops: [
      stop(36.766, 31.389, loc("سايد", "Side", "Side"), loc("بلدة أثرية على المتوسط.", "Archaeological town on the Mediterranean.", "Akdeniz’de ören yeri kasabası."), PHOTO.ancientRuins),
      stop(36.939, 31.172, loc("أسبندوس", "Aspendos", "Aspendos"), loc("أحد أفضل المساريا الرومانية حفظاً.", "One of the best-preserved Roman theatres.", "En iyi korunmuş Roma tiyatrolarından."), PHOTO.ancientRuins),
    ],
    landmarkPhotos: [PHOTO.ancientRuins, PHOTO.antalyaCoast, PHOTO.aegeanCoast],
    tips: [loc("الصيف حار على الحجارة — قبعة وماء", "Summer is hot on the stones — hat and water", "Yazın taşlar sıcak — şapka ve su")],
  }),
  defineVip({
    id: "vip-47",
    slug: "pamukkale-from-antalya-vip",
    title: loc("باموكالي من أنطاليا VIP", "Pamukkale from Antalya VIP", "Antalya’dan Pamukkale VIP"),
    overview: loc(
      "يوم شاق حقيقي: أنطاليا إلى المدرجات البيضاء وهيرابوليس. اخرجوا مبكرين. السعر للمركبة يعكس المسافة — ليست جولة مدينة قصيرة.",
      "A genuinely hard day: Antalya to the white terraces and Hierapolis. Start early. The vehicle price reflects the distance — not a short city tour.",
      "Gerçekten zor bir gün: Antalya’dan beyaz teraslar ve Hierapolis. Erken çıkın. Araç fiyatı mesafeyi yansıtır — kısa kent turu değil."
    ),
    vehicle: "minivan",
    price: 480,
    hours: 13,
    from: HOTEL_ANT,
    to: loc("باموكالي", "Pamukkale", "Pamukkale"),
    highlights: [
      loc("المدرجات البيضاء", "White terraces", "Beyaz teraslar"),
      loc("هيرابوليس", "Hierapolis", "Hierapolis"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("06:00 — مغادرة أنطاليا", "06:00 — Leave Antalya", "06:00 — Antalya çıkışı"),
      loc("10:30 — باموكالي وهيرابوليس", "10:30 — Pamukkale and Hierapolis", "10:30 — Pamukkale ve Hierapolis"),
      loc("13:00 — غداء في المنطقة", "13:00 — Lunch in the area", "13:00 — Bölgede öğle"),
      loc("14:30 — طريق العودة", "14:30 — Return road", "14:30 — Dönüş yolu"),
      loc("19:00 — أنطاليا", "19:00 — Antalya", "19:00 — Antalya"),
    ],
    stops: [
      stop(37.913, 29.119, loc("باموكالي", "Pamukkale", "Pamukkale"), loc("مدرجات كلسية بيضاء.", "White travertine terraces.", "Beyaz traverten teraslar."), PHOTO.whiteTerraces),
      stop(37.925, 29.126, loc("هيرابوليس", "Hierapolis", "Hierapolis"), loc("مدينة أثرية فوق المدرجات.", "Ancient city above the terraces.", "Terasların üstünde antik kent."), PHOTO.ancientRuins),
    ],
    landmarkPhotos: [PHOTO.whiteTerraces, PHOTO.ancientRuins, PHOTO.landscape],
    tips: [loc("يوم طويل جداً — ليس للأطفال الصغار جداً", "A very long day — not ideal for very small children", "Çok uzun gün — çok küçük çocuklar için ideal değil")],
  }),
  defineVip({
    id: "vip-48",
    slug: "olympos-cirali-vip",
    title: loc("أوليمبوس وتشيرالي VIP", "Olympos & Çıralı VIP", "Olympos ve Çıralı VIP"),
    overview: loc(
      "يوم غرب أنطاليا: آثار أوليمبوس وشاطئ تشيرالي. مشي في الموقع الأثري ثم بحر إن سمح الطقس.",
      "A day west of Antalya: Olympos ruins and Çıralı beach. A walk on the archaeological site then the sea if weather allows.",
      "Antalya’nın batısı: Olympos ören yeri ve Çıralı plajı. Ören yerinde yürüyüş, hava elverirse deniz."
    ),
    vehicle: "minivan",
    price: 340,
    hours: 9,
    from: HOTEL_ANT,
    to: loc("أوليمبوس وتشيرالي", "Olympos & Çıralı", "Olympos ve Çıralı"),
    highlights: [
      loc("آثار أوليمبوس", "Olympos ruins", "Olympos ören yeri"),
      loc("شاطئ تشيرالي", "Çıralı beach", "Çıralı plajı"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:30 — مغادرة أنطاليا غرباً", "08:30 — Leave Antalya westbound", "08:30 — Antalya’dan batıya"),
      loc("10:15 — أوليمبوس مشي في الآثار", "10:15 — Olympos ruin walk", "10:15 — Olympos ören yürüyüşü"),
      loc("12:30 — غداء في تشيرالي", "12:30 — Lunch in Çıralı", "12:30 — Çıralı öğle"),
      loc("14:00 — شاطئ تشيرالي إن سمح الطقس", "14:00 — Çıralı beach if weather allows", "14:00 — Hava elverirse Çıralı plajı"),
      loc("16:00 — العودة", "16:00 — Return", "16:00 — Dönüş"),
      loc("18:00 — الفندق", "18:00 — Hotel", "18:00 — Otel"),
    ],
    stops: [
      stop(36.398, 30.472, loc("أوليمبوس", "Olympos", "Olympos"), loc("آثار بين الأشجار قرب الشاطئ.", "Ruins among trees near the beach.", "Plaja yakın ağaçlar arasında ören."), PHOTO.ancientRuins),
      stop(36.415, 30.48, loc("تشيرالي", "Çıralı", "Çıralı"), loc("شاطئ هادئ غرب أنطاليا.", "Quiet beach west of Antalya.", "Antalya’nın batısında sakin plaj."), PHOTO.aegeanCoast),
    ],
    landmarkPhotos: [PHOTO.ancientRuins, PHOTO.aegeanCoast, PHOTO.antalyaCoast],
    tips: [loc("المشي في أوليمبوس غير معبّد بالكامل", "The Olympos walk is not fully paved", "Olympos yürüyüşü tam asfalt değil")],
  }),
  defineVip({
    id: "vip-49",
    slug: "ephesus-sirince-from-izmir-vip",
    title: loc("إفسوس وشيرينجه من إزمير VIP", "Ephesus & Şirince from Izmir VIP", "İzmir’den Efes ve Şirince VIP"),
    overview: loc(
      "يوم كلاسيكي من إزمير: إفسوس ثم قرية شيرينجه. تذاكر الموقع منفصلة. ميني فان حتى 7 — السعر للمركبة حسب المسافة جنوب إزمير.",
      "A classic day from Izmir: Ephesus then Şirince village. Site tickets are extra. Minivan up to 7 — per-vehicle price for the distance south of Izmir.",
      "İzmir’den klasik gün: Efes sonra Şirince. Ören yeri biletleri extra. 7 kişilik minivan — İzmir güneyi mesafesi için araç fiyatı."
    ),
    vehicle: "minivan",
    price: 360,
    hours: 9,
    featured: true,
    from: HOTEL_IZM,
    to: loc("إفسوس وشيرينجه", "Ephesus & Şirince", "Efes ve Şirince"),
    highlights: [
      loc("مكتبة سيلسوس", "Library of Celsus", "Celsus Kütüphanesi"),
      loc("شيرينجه", "Şirince village", "Şirince köyü"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:00 — مغادرة إزمير", "08:00 — Leave Izmir", "08:00 — İzmir çıkışı"),
      loc("09:20 — إفسوس", "09:20 — Ephesus", "09:20 — Efes"),
      loc("12:30 — غداء في سيلجوق أو شيرينجه", "12:30 — Lunch in Selçuk or Şirince", "12:30 — Selçuk veya Şirince öğle"),
      loc("14:00 — شيرينجه", "14:00 — Şirince", "14:00 — Şirince"),
      loc("16:00 — العودة", "16:00 — Return", "16:00 — Dönüş"),
      loc("17:30 — الفندق", "17:30 — Hotel", "17:30 — Otel"),
    ],
    stops: [
      stop(37.939, 27.341, loc("إفسوس", "Ephesus", "Efes"), loc("مدينة رومانية شهيرة جنوب إزمير.", "Famous Roman city south of Izmir.", "İzmir’in güneyinde ünlü Roma kenti."), PHOTO.ancientRuins),
      stop(37.944, 27.43, loc("شيرينجه", "Şirince", "Şirince"), loc("قرية تلال قرب سيلجوق.", "Hill village near Selçuk.", "Selçuk yakınında tepe köyü."), PHOTO.landscape),
    ],
    landmarkPhotos: [PHOTO.ancientRuins, PHOTO.landscape, PHOTO.aegeanCoast],
    tips: [loc("إفسوس مشمس جداً — قبعة وماء", "Ephesus is very sunny — hat and water", "Efes çok güneşli — şapka ve su")],
  }),
  defineVip({
    id: "vip-50",
    slug: "cesme-alacati-vip",
    title: loc("تششمه وألاجاتي VIP", "Çeşme & Alaçatı VIP", "Çeşme ve Alaçatı VIP"),
    overview: loc(
      "يوم ساحل إيجه غرب إزمير: قلعة تششمه وبلدة ألاجاتي. مناسب لعائلات تريد بحراً وقهوة دون يوم آثار طويل.",
      "An Aegean coast day west of Izmir: Çeşme castle and Alaçatı town. For families who want sea and coffee without a long ruin day.",
      "İzmir’in batısında Ege: Çeşme kalesi ve Alaçatı. Uzun ören günü olmadan deniz ve kahve isteyen aileler için."
    ),
    vehicle: "minivan",
    price: 300,
    hours: 8,
    from: HOTEL_IZM,
    to: loc("تششمه وألاجاتي", "Çeşme & Alaçatı", "Çeşme ve Alaçatı"),
    highlights: [
      loc("قلعة تششمه", "Çeşme castle", "Çeşme kalesi"),
      loc("ألاجاتي", "Alaçatı streets", "Alaçatı sokakları"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — مغادرة إزمير", "09:00 — Leave Izmir", "09:00 — İzmir çıkışı"),
      loc("10:20 — قلعة تششمه والميناء", "10:20 — Çeşme castle and harbour", "10:20 — Çeşme kalesi ve liman"),
      loc("12:30 — غداء في ألاجاتي", "12:30 — Lunch in Alaçatı", "12:30 — Alaçatı öğle"),
      loc("14:00 — مشي ألاجاتي", "14:00 — Alaçatı stroll", "14:00 — Alaçatı yürüyüşü"),
      loc("16:00 — العودة", "16:00 — Return", "16:00 — Dönüş"),
    ],
    stops: [
      stop(38.322, 26.305, loc("تششمه", "Çeşme", "Çeşme"), loc("قلعة وميناء على إيجه.", "Castle and harbour on the Aegean.", "Ege’de kale ve liman."), PHOTO.yachtHarbor),
      stop(38.282, 26.374, loc("ألاجاتي", "Alaçatı", "Alaçatı"), loc("بيوت حجرية ومقاهي.", "Stone houses and cafes.", "Taş evler ve kahveler."), PHOTO.aegeanCoast),
    ],
    landmarkPhotos: [PHOTO.yachtHarbor, PHOTO.aegeanCoast, PHOTO.coastalTown],
    tips: [loc("صيفاً ألاجاتي مزدحمة جداً", "Alaçatı is very busy in summer", "Yazın Alaçatı çok yoğun")],
  }),
  defineVip({
    id: "vip-51",
    slug: "pamukkale-from-izmir-vip",
    title: loc("باموكالي من إزمير VIP", "Pamukkale from Izmir VIP", "İzmir’den Pamukkale VIP"),
    overview: loc(
      "يوم طويل من إزمير إلى باموكالي وهيرابوليس. أقصر قليلاً من أنطاليا لكنه ما زال يوم طريق. اخرجوا مبكرين.",
      "A long day from Izmir to Pamukkale and Hierapolis. Slightly shorter than from Antalya but still a road day. Start early.",
      "İzmir’den Pamukkale ve Hierapolis. Antalya’dan biraz kısa ama yine yol günü. Erken çıkın."
    ),
    vehicle: "minivan",
    price: 420,
    hours: 12,
    from: HOTEL_IZM,
    to: loc("باموكالي", "Pamukkale", "Pamukkale"),
    highlights: [
      loc("المدرجات البيضاء", "White terraces", "Beyaz teraslar"),
      loc("هيرابوليس", "Hierapolis", "Hierapolis"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("06:30 — مغادرة إزمير", "06:30 — Leave Izmir", "06:30 — İzmir çıkışı"),
      loc("10:00 — باموكالي", "10:00 — Pamukkale", "10:00 — Pamukkale"),
      loc("13:00 — غداء", "13:00 — Lunch", "13:00 — Öğle"),
      loc("14:30 — العودة", "14:30 — Return", "14:30 — Dönüş"),
      loc("18:30 — إزمير", "18:30 — Izmir", "18:30 — İzmir"),
    ],
    stops: [
      stop(37.913, 29.119, loc("باموكالي", "Pamukkale", "Pamukkale"), loc("مدرجات بيضاء.", "White terraces.", "Beyaz teraslar."), PHOTO.whiteTerraces),
      stop(37.925, 29.126, loc("هيرابوليس", "Hierapolis", "Hierapolis"), loc("آثار فوق الموقع.", "Ruins above the site.", "Sitenin üstünde ören."), PHOTO.ancientRuins),
    ],
    landmarkPhotos: [PHOTO.whiteTerraces, PHOTO.ancientRuins, PHOTO.landscape],
    tips: [loc("يوم طريق — استراحات على الطريق السريع", "A road day — highway breaks", "Yol günü — otoyol molaları")],
  }),
  defineVip({
    id: "vip-52",
    slug: "bodrum-castle-harbour-vip",
    title: loc("قلعة بودروم والميناء VIP", "Bodrum Castle & Harbour VIP", "Bodrum Kalesi ve Liman VIP"),
    overview: loc(
      "يوم مدينة بودروم من فندقكم: القلعة من الخارج أو الداخل حسب التذاكر، الميناء، ووقت حر في البازار. سيارة خاصة حتى 7.",
      "A Bodrum town day from your hotel: the castle from outside or inside by ticket, the harbour, and free bazaar time. Private car up to 7.",
      "Otelinizden Bodrum kent günü: kale dışı veya biletli iç, liman ve serbest çarşı. 7 kişiye kadar özel araç."
    ),
    vehicle: "minivan",
    price: 240,
    hours: 6,
    from: HOTEL_BOD,
    to: loc("قلعة بودروم", "Bodrum Castle", "Bodrum Kalesi"),
    highlights: [
      loc("القلعة والميناء", "Castle and harbour", "Kale ve liman"),
      loc("وقت بازار", "Bazaar time", "Çarşı zamanı"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("10:00 — استلام", "10:00 — Pickup", "10:00 — Alış"),
      loc("10:30 — القلعة", "10:30 — Castle", "10:30 — Kale"),
      loc("12:30 — غداء على الميناء", "12:30 — Harbour lunch", "12:30 — Liman öğle"),
      loc("14:30 — بازار حر", "14:30 — Free bazaar time", "14:30 — Serbest çarşı"),
      loc("16:00 — العودة", "16:00 — Return", "16:00 — Dönüş"),
    ],
    stops: [
      stop(37.032, 27.429, loc("قلعة بودروم", "Bodrum Castle", "Bodrum Kalesi"), loc("قلعة على الميناء.", "Castle on the harbour.", "Limandaki kale."), PHOTO.yachtHarbor),
      stop(37.034, 27.43, loc("ميناء بودروم", "Bodrum harbour", "Bodrum limanı"), loc("يخوت وكورنيش.", "Yachts and promenade.", "Yatlar ve sahil."), PHOTO.aegeanCoast),
    ],
    landmarkPhotos: [PHOTO.yachtHarbor, PHOTO.aegeanCoast, PHOTO.coastalTown],
    tips: [loc("دخول القلعة تذكرة منفصلة", "Castle entry is extra", "Kale girişi extra")],
  }),
  defineVip({
    id: "vip-53",
    slug: "istanbul-two-continents-vip",
    title: loc("قارتان في يوم VIP", "Two Continents in One Day VIP", "Bir Günde İki Kıta VIP"),
    overview: loc(
      "دائرة قصيرة تجمع السلطان أحمد صباحاً وأسكودار بعد الظهر لضيوف لديهم يوم واحد فقط في إسطنبول. جدول مضغوط حتى 7 ركاب.",
      "A tight circuit: Sultanahmet in the morning and Üsküdar in the afternoon for guests with only one Istanbul day. Compact schedule, max 7.",
      "Sıkı güzergâh: sabah Sultanahmet, öğleden sonra Üsküdar — yalnızca bir İstanbul günü olanlar için. En fazla 7 kişi."
    ),
    vehicle: "minivan",
    price: 300,
    hours: 8,
    featured: true,
    from: HOTEL_IST,
    to: loc("أوروبا وآسيا", "Europe & Asia", "Avrupa ve Asya"),
    highlights: [
      loc("السلطان أحمد", "Sultanahmet", "Sultanahmet"),
      loc("أسكودار", "Üsküdar", "Üsküdar"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("09:00 — استلام", "09:00 — Pickup", "09:00 — Alış"),
      loc("09:30 — آيا صوفيا والمسجد الأزرق من الخارج أو الداخل حسب التذاكر", "09:30 — Hagia Sophia and Blue Mosque exterior or interior by ticket", "09:30 — Ayasofya ve Sultanahmet, bilete göre iç veya dış"),
      loc("12:30 — غداء في أمينونو ثم عبور", "12:30 — Eminönü lunch then crossing", "12:30 — Eminönü öğle sonra geçiş"),
      loc("14:30 — أسكودار وبرج الفتاة من اليابسة", "14:30 — Üsküdar and Maiden’s Tower from land", "14:30 — Üsküdar ve karadan Kız Kulesi"),
      loc("17:00 — العودة", "17:00 — Return", "17:00 — Dönüş"),
    ],
    stops: [
      stop(41.0086, 28.9802, loc("آيا صوفيا", "Hagia Sophia", "Ayasofya"), loc("صباح شبه الجزيرة.", "Peninsula morning.", "Yarımada sabahı."), PHOTO.hagiaSophia),
      stop(41.0214, 29.0152, loc("أسكودار", "Üsküdar", "Üsküdar"), loc("بعد الظهر الآسيوي.", "Asian afternoon.", "Anadolu öğleden sonra."), PHOTO.bosphorus),
    ],
    landmarkPhotos: [PHOTO.hagiaSophia, PHOTO.bosphorus, PHOTO.istanbulSkyline],
    tips: [loc("يوم مضغوط — لا نضيف توبكابي كاملاً", "A tight day — we do not add a full Topkapi visit", "Sıkı gün — tam Topkapı eklemeyiz")],
  }),
  defineVip({
    id: "vip-54",
    slug: "gallipoli-sprinter-group",
    title: loc("جاليبولي سبرينتر — حتى 20 راكباً", "Gallipoli Sprinter — max 20", "Gelibolu Sprinter — 20 kişi"),
    overview: loc(
      "يوم جاليبولي لمجموعة في سبرينتر حتى 20. يوم طريق طويل من إسطنبول — السعر للمركبة. اخرجوا عند الفجر.",
      "A Gallipoli group day in a Sprinter up to 20. A long road day from Istanbul — per-vehicle price. Leave at dawn.",
      "20 kişilik Sprinter ile Gelibolu. İstanbul’dan uzun yol günü — araç başı fiyat. Şafakta çıkın."
    ),
    vehicle: "sprinter",
    price: 890,
    hours: 13,
    from: HOTEL_IST,
    to: loc("جاليبولي", "Gallipoli", "Gelibolu"),
    highlights: [
      loc("حتى 20 راكباً", "Up to 20 passengers", "En fazla 20 yolcu"),
      loc("أنزاك والنصب", "Anzac and memorials", "Anzak ve anıtlar"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("05:30 — استلام المجموعة", "05:30 — Group pickup", "05:30 — Grup alış"),
      loc("10:00 — أنزاك كوف", "10:00 — Anzac Cove", "10:00 — Anzak Koyu"),
      loc("12:00 — النصب والغداء", "12:00 — Memorials and lunch", "12:00 — Anıtlar ve öğle"),
      loc("14:00 — العودة", "14:00 — Return", "14:00 — Dönüş"),
      loc("19:30 — إنزال إسطنبول", "19:30 — Istanbul drop-off", "19:30 — İstanbul bırakış"),
    ],
    stops: [
      stop(40.246, 26.277, loc("أنزاك كوف", "Anzac Cove", "Anzak Koyu"), loc("شاطئ 1915.", "The 1915 beach.", "1915 sahili."), PHOTO.coastalTown),
      stop(40.2, 26.277, loc("نصب الشهداء", "Martyrs’ Memorial", "Şehitler Abidesi"), loc("نصب شبه الجزيرة.", "Peninsula memorial.", "Yarımada anıtı."), PHOTO.landscape),
    ],
    landmarkPhotos: [PHOTO.sprinter, PHOTO.coastalTown, PHOTO.landscape],
    tips: [loc("يوم شاق للمجموعة — استراحات قهوة على الطريق", "A hard group day — coffee breaks on the highway", "Zor grup günü — otoyolda kahve molaları")],
  }),
  defineVip({
    id: "vip-55",
    slug: "istanbul-photography-vip",
    title: loc("إسطنبول للتصوير VIP", "Istanbul Photography VIP", "İstanbul Fotoğraf VIP"),
    overview: loc(
      "يوم بوتيرة المصوّر: توقفات قصيرة في السلطان أحمد، غلطة، وأورتاكوي دون طوابير متاحف طويلة. السيارة تنتظر عند كل نقطة إنزال.",
      "A photographer’s pace: short stops in Sultanahmet, Galata, and Ortaköy without long museum queues. The car waits at each drop-off.",
      "Fotoğrafçı temposu: uzun müze kuyruğu olmadan Sultanahmet, Galata, Ortaköy kısa durakları. Araç her bırakışta bekler."
    ),
    vehicle: "minivan",
    price: 270,
    hours: 7,
    from: HOTEL_IST,
    to: loc("نقاط تصوير إسطنبول", "Istanbul photo points", "İstanbul fotoğraf noktaları"),
    highlights: [
      loc("توقفات قصيرة كثيرة", "Many short stops", "Çok kısa durak"),
      loc("السائق ينتظر", "Driver waits", "Şoför bekler"),
    ],
    includes: INC_VIP,
    excludes: EX_VIP,
    program: [
      loc("08:30 — استلام مبكر للضوء", "08:30 — Early pickup for light", "08:30 — Işık için erken alış"),
      loc("09:00 — السلطان أحمد بلا طوابير طويلة", "09:00 — Sultanahmet without long queues", "09:00 — Uzun kuyruk olmadan Sultanahmet"),
      loc("11:30 — غلطة وكاراتشوي", "11:30 — Galata and Karaköy", "11:30 — Galata ve Karaköy"),
      loc("13:00 — غداء", "13:00 — Lunch", "13:00 — Öğle"),
      loc("15:00 — أورتاكوي", "15:00 — Ortaköy", "15:00 — Ortaköy"),
      loc("16:30 — العودة", "16:30 — Return", "16:30 — Dönüş"),
    ],
    stops: [
      stop(41.0086, 28.9802, loc("السلطان أحمد", "Sultanahmet", "Sultanahmet"), loc("ضوء صباحي على المساجد.", "Morning light on the mosques.", "Camilerde sabah ışığı."), PHOTO.hagiaSophia),
      stop(41.0256, 28.9744, loc("غلطة", "Galata", "Galata"), loc("برج وأزقة.", "Tower and lanes.", "Kule ve sokaklar."), PHOTO.istanbulSkyline),
      stop(41.0553, 29.0267, loc("أورتاكوي", "Ortaköy", "Ortaköy"), loc("المسجد والجسر.", "Mosque and bridge.", "Cami ve köprü."), PHOTO.bosphorus),
    ],
    landmarkPhotos: [PHOTO.hagiaSophia, PHOTO.istanbulSkyline, PHOTO.bosphorus],
    tips: [loc("ليس يوم تذاكر متاحف — تصوير خارجي أساساً", "Not a museum-ticket day — mostly exteriors", "Müze bilet günü değil — çoğunlukla dış çekim")],
  }),
];

