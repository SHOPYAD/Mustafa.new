import type { PackageReview } from "@/types/package";
import type { TransferReview } from "@/types/transfer";

const NAMES = [
  "فاطمة العلي",
  "محمد الراشد",
  "نورة السالم",
  "خالد المنصوري",
  "عائشة القحطاني",
  "عبدالله الشمري",
  "هند الزهراني",
  "يوسف الكندري",
  "مريم الهاشمي",
  "سارة المطيري",
  "Omar Al-Farsi",
  "Layla Hassan",
  "James Reed",
  "Elena Petrova",
  "Ahmed Qureshi",
  "Nora Ibrahim",
  "Hassan Al-Mutairi",
  "Maya Khalil",
  "Daniel Costa",
  "Rania Farouk",
  "Tariq Aziz",
  "Sophia Bennett",
  "Karim Nasser",
  "Amelia Wright",
];

const DATES = [
  "2025-06-12",
  "2025-07-03",
  "2025-07-21",
  "2025-08-08",
  "2025-08-19",
  "2025-09-02",
  "2025-09-18",
  "2025-10-04",
  "2025-10-22",
  "2025-11-09",
  "2025-11-27",
  "2025-12-14",
  "2026-01-08",
  "2026-01-26",
  "2026-02-11",
  "2026-03-02",
  "2026-03-19",
  "2026-04-07",
  "2026-04-25",
  "2026-05-13",
  "2026-06-01",
  "2026-06-18",
];

type ReviewCopy = { ar: string; en: string; tr: string };

const PACKAGE_COMMENTS: ReviewCopy[] = [
  {
    ar: "برنامج منظم وإقامة مريحة. السائق كان دقيقاً في المواعيد والدليل واضح.",
    en: "Well-paced program and a comfortable stay. The driver was punctual and the guide was clear.",
    tr: "Program düzenli, konaklama rahattı. Şoför dakikti, rehber net anlattı.",
  },
  {
    ar: "الأسعار منطقية مقابل الليالي والفنادق. واتساب الرد كان سريعاً قبل السفر.",
    en: "Fair price for the nights and hotels. WhatsApp replies before travel were quick.",
    tr: "Gece ve otel karşılığı fiyat makuldü. Seyahat öncesi WhatsApp yanıtları hızlıydı.",
  },
  {
    ar: "مناسب لعائلة معنا أطفال — التنقلات قصيرة والجدول غير مرهق.",
    en: "Worked well with children — short transfers and a relaxed daily pace.",
    tr: "Çocuklarla uygundu — transferler kısa, tempo yorucu değildi.",
  },
  {
    ar: "الفندق في موقع جيد والإفطار متنوع. الجولات اليومية كانت كما وُعد.",
    en: "Hotel location was good and breakfast varied. Day programs matched what we booked.",
    tr: "Otel konumu iyi, kahvaltı çeşitliydi. Günlük program söz verildiği gibiydi.",
  },
  {
    ar: "تجربة شهر عسل هادئة دون ضغط مجموعات كبيرة.",
    en: "A calm honeymoon pace without large-group pressure.",
    tr: "Kalabalık grup baskısı olmadan sakin bir balayı temposu.",
  },
  {
    ar: "البرنامج يغطي المعالم الأساسية دون تضييع وقت في التسوق الإجباري.",
    en: "Covered the main sights without forced shopping stops.",
    tr: "Zorunlu alışveriş durakları olmadan ana yerleri kapsadı.",
  },
  {
    ar: "الليالي كانت كافية دون استعجال. الفندق نظيف والقرب من المعالم وفّر وقتاً.",
    en: "Enough nights without rushing. The hotel was clean and close enough to save time.",
    tr: "Gece sayısı acele ettirmeden yeterliydi. Otel temizdi ve yerlere yakındı.",
  },
  {
    ar: "استقبال المطار كان واضحاً باللوحة. السيارة مكيفة والطريق مباشر إلى الفندق.",
    en: "Airport pickup was easy to spot. The car was air-conditioned and went straight to the hotel.",
    tr: "Havalimanı karşılama tabelayla netti. Araç klimalıydı, otele doğrudan gittik.",
  },
  {
    ar: "يوم كابادوكيا أو طرابزون في البرنامج كان أبرز ما في الرحلة لعائلتنا.",
    en: "The Cappadocia or Trabzon day in the program was the highlight for our family.",
    tr: "Programdaki Kapadokya veya Trabzon günü ailemiz için en güzel bölümdü.",
  },
  {
    ar: "التواصل بالعربي سهل جداً. عدّلنا يوماً بسبب الطقس دون رسوم مفاجئة.",
    en: "Arabic communication was easy. We shifted a day for weather with no surprise fees.",
    tr: "Arapça iletişim kolaydı. Hava için bir günü kaydırdık, sürpriz ücret olmadı.",
  },
  {
    ar: "الإفطار متنوع والغرفة واسعة لعائلة. أنصح بهذا المستوى لمن يزور تركيا أول مرة.",
    en: "Breakfast was varied and the room suited a family. Good level for a first Turkey trip.",
    tr: "Kahvaltı çeşitli, oda aileye uygundu. İlk Türkiye seyahati için iyi seviye.",
  },
];

const VIP_COMMENTS: ReviewCopy[] = [
  {
    ar: "سيارة نظيفة وسائق هادئ يعرف الطرق. اليوم كان خاصاً فعلاً وليس باصاً عاماً.",
    en: "Clean car and a calm driver who knew the roads. A private day — not a public bus tour.",
    tr: "Araç temiz, sürücü sakin ve yolları biliyordu. Gerçekten özel bir gündü.",
  },
  {
    ar: "التوقيت مرن وتوقفنا للتصوير حيث أردنا. السعر لكامل السيارة واضح.",
    en: "Flexible timing and photo stops when we asked. The per-vehicle price was clear.",
    tr: "Saatler esnekti, istediğimiz yerde durduk. Araç başı fiyat netti.",
  },
  {
    ar: "الاستلام من الفندق في الوقت المحدد. مقاعد مريحة لسبعة أشخاص كحد أقصى.",
    en: "Hotel pickup on time. Comfortable seats — max seven of us, as promised.",
    tr: "Otelden zamanında alındık. En fazla yedi kişi, koltuklar rahattı.",
  },
  {
    ar: "سبرينتر مناسب لمجموعتنا. لم نشعر بالازدحام والتكييف قوي.",
    en: "The Sprinter suited our group. No crowding and strong air-conditioning.",
    tr: "Sprinter grubumuza uygun. Kalabalık olmadı, klima güçlüydü.",
  },
  {
    ar: "الخريطة على الصفحة طابقت المواقف الحقيقية. برنامج اليوم منطقي.",
    en: "The map stops matched the real places. The daily timeline made sense.",
    tr: "Haritadaki duraklar gerçek yerlerle uyumluydu. Gün programı mantıklıydı.",
  },
  {
    ar: "أفضل من الجولات المشتركة — سيارة خاصة وجدول حسب رغبتنا.",
    en: "Better than shared tours — private vehicle and a schedule we could adjust.",
    tr: "Paylaşımlı turlardan daha iyi — özel araç ve esnek program.",
  },
  {
    ar: "السائق يعرف مواقف السيارات الضيقة في السلطان أحمد وأورتاكوي. وفّر علينا مشياً كثيراً.",
    en: "The driver knew the tight Sultanahmet and Ortaköy drop-offs. Saved us a lot of walking.",
    tr: "Şoför Sultanahmet ve Ortaköy’deki dar bırakışları biliyordu. Çok yürümekten kurtulduk.",
  },
  {
    ar: "المياه والمناشف كانت جاهزة. الأطفال ارتاحوا في الميني فان أكثر من سيدان ضيقة.",
    en: "Water and towels were ready. The children were more comfortable in the minivan than a tight sedan.",
    tr: "Su ve havlu hazırdı. Çocuklar dar sedan yerine minivanda daha rahat etti.",
  },
  {
    ar: "يوم بورصة طويل لكن الاستراحات على الطريق جعلته ممكناً مع كبار السن.",
    en: "Bursa is a long day, but the highway breaks made it possible with older parents.",
    tr: "Bursa uzun bir gün; yol molaları yaşlı ebeveynlerle mümkün kıldı.",
  },
  {
    ar: "أو زنجول كما في الصور تقريباً. الضباب تأخّر قليلاً والسائق عدّل الجدول بهدوء.",
    en: "Uzungöl looked close to the photos. Fog delayed us a little and the driver adjusted calmly.",
    tr: "Uzungöl fotoğraflara yakındı. Sis biraz geciktirdi, şoför programı sakin kaydırdı.",
  },
  {
    ar: "سعر المركبة أوضح من عروض «للشخص» المبهمة. حجزنا سبرينتر لخمسة عشر شخصاً دون نقص مقاعد.",
    en: "Per-vehicle pricing was clearer than vague per-person quotes. We booked a Sprinter for fifteen with seats to spare.",
    tr: "Kişi başı belirsiz tekliflerden araç fiyatı daha netti. On beş kişi için Sprinter’da yer arttı.",
  },
  {
    ar: "جزر الأميرات تحتاج عبّارة — السائق انتظر عند الرصيف كما وُعد ولم يختفِ.",
    en: "The islands need a ferry — the driver waited at the pier as promised and did not disappear.",
    tr: "Adalar feribot ister — şoför iskelede söz verdiği gibi bekledi, kaybolmadı.",
  },
  {
    ar: " Pamukkale من أنطاليا يوم شاق. اخرجوا مبكرين كما نصح الفريق.",
    en: "Pamukkale from Antalya is a hard day. Start as early as the team advised.",
    tr: "Antalya’dan Pamukkale zor bir gün. Ekibin dediği gibi erken çıkın.",
  },
  {
    ar: "إفسوس من إزمير يستحق الميني فان. المرشد عند الموقع اختياري والتذاكر منفصلة كما كُتب.",
    en: "Ephesus from Izmir is worth the minivan. The on-site guide is optional and tickets are extra, as written.",
    tr: "İzmir’den Efes minivanı hak ediyor. Yerindeki rehber isteğe bağlı, biletler yazıldığı gibi extra.",
  },
];

function pick<T>(list: T[], index: number): T {
  return list[index % list.length];
}

export function samplePackageReviews(
  prefix: string,
  count = 5
): PackageReview[] {
  return Array.from({ length: count }, (_, i) => {
    const copy = pick(PACKAGE_COMMENTS, i);
    return {
      id: `${prefix}-pr-${i + 1}`,
      name: pick(NAMES, i + prefix.length),
      rating: i % 7 === 0 ? 4 : 5,
      textAr: copy.ar,
      textEn: copy.en,
      textTr: copy.tr,
      date: pick(DATES, i + 3),
      isSample: true,
    };
  });
}

export function sampleVipReviews(
  prefix: string,
  count = 20
): TransferReview[] {
  return Array.from({ length: count }, (_, i) => {
    const copy = pick(VIP_COMMENTS, i);
    return {
      id: `${prefix}-vr-${i + 1}`,
      name: pick(NAMES, i + prefix.charCodeAt(0)),
      rating: i % 8 === 0 ? 4 : 5,
      textAr: copy.ar,
      textEn: copy.en,
      textTr: copy.tr,
      date: pick(DATES, i),
      isSample: true,
    };
  });
}
