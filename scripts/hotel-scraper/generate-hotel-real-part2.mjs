import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "hotel-real-curated-part2.json");

const CA = {
  Belgium: "بلجيكا", Serbia: "صربيا", Algeria: "الجزائر", "South Africa": "جنوب أفريقيا",
  India: "الهند", Brazil: "البرازيل", "United Arab Emirates": "الإمارات العربية المتحدة",
  "United Kingdom": "المملكة المتحدة", Lebanon: "لبنان", Italy: "إيطاليا", Cyprus: "قبرص",
  Bulgaria: "بلغاريا", Croatia: "كرواتيا", "United States": "الولايات المتحدة", Portugal: "البرتغال",
  Oman: "عمان", Turkey: "تركيا", Germany: "ألمانيا", Nigeria: "نيجيريا", Ukraine: "أوكرانيا",
  Austria: "النمسا", Russia: "روسيا", Switzerland: "سويسرا", Egypt: "مصر", Israel: "إسرائيل",
  Ireland: "أيرلندا", Indonesia: "إندونيسيا", Kuwait: "الكويت", Jordan: "الأردن",
  "Saudi Arabia": "المملكة العربية السعودية", Bahrain: "البحرين", Australia: "أستراليا",
  Singapore: "سنغافورة", Qatar: "قطر", Iran: "إيران", Canada: "كندا",
};

const ST = { couple: "زوجان", family: "عائلة", solo: "مسافر بمفرده", friends: "مجموعة أصدقاء", business: "رحلة عمل" };

function clean(s) {
  return String(s || "")
    .replace(/\*\s*•[^*•]*/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/Submitted via mobile/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 650);
}

function R(o) {
  const textEn = clean(o.t);
  return {
    author: o.a,
    countryEn: o.c || "",
    countryAr: CA[o.c] || o.c || "",
    rating: o.r,
    date: o.d || "",
    titleEn: o.te || "",
    titleAr: o.ta || o.te || "",
    textEn,
    textAr: o.ar || textEn,
    source: o.s || "Booking.com",
    stayTypeEn: o.st || "",
    stayTypeAr: o.sta || "",
  };
}

function Rm(o) {
  return {
    nameEn: o.n,
    nameAr: o.na || o.n,
    descriptionEn: o.d || "",
    descriptionAr: o.da || o.d || "",
    beds: o.b || "1 King",
    capacity: o.cap ?? 2,
    sizeSqm: o.sq ?? 0,
    price: 0,
  };
}

function H(h) {
  return {
    slug: h.slug,
    bookingUrl: `https://www.booking.com/hotel/tr/${h.id}.html`,
    bookingId: h.id,
    ...(h.idNote ? { bookingIdNote: h.idNote } : {}),
    dataCompleteness: h.comp,
    sourcesUsed: h.src,
    nameEn: h.ne,
    nameAr: h.na,
    addressEn: h.ae,
    addressAr: h.aa,
    rating: h.rating,
    reviewCount: h.rc,
    descriptionEn: h.de,
    descriptionAr: h.da,
    amenities: h.am,
    nearbyEn: h.neby || [],
    nearbyAr: h.naby || [],
    highlightsEn: h.he || [],
    highlightsAr: h.ha || [],
    rooms: h.rooms.map(Rm),
    guestReviews: h.revs.map(R),
    policiesEn: h.pe || ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: h.pa || ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
    ...(h.note ? { note: h.note } : {}),
  };
}

const hotels = [
  H({
    slug: "four-seasons-bosphorus", id: "four-seasons-istanbul-at-the-bosphorus", comp: "full",
    src: ["Booking.com hotel page", "Booking.com reviews page (Based on 252)", "Hotel page may list ~526 reviews"],
    ne: "Four Seasons Hotel Istanbul at the Bosphorus", na: "فور سيزونز إسطنبول على البوسفور",
    ae: "Çırağan Cad. No:28, Beşiktaş, 34349 Istanbul, Turkey",
    aa: "تشيراغان جادسي رقم 28، بشكتاش، 34349 إسطنبول، تركيا",
    rating: 9.0, rc: 252,
    de: "Located along the Bosphorus, this renovated 19th century Ottoman palace features historic architecture in harmony with luxurious details. An indoor pool and a heated outdoor pool with free parasols and sun loungers are available. The seafront property also has a garden and a spacious terrace with panoramic Bosphorus views. Free WiFi and private parking on site. Aqua Restaurant terrace serves Mediterranean cuisine with Italian and Turkish specialties; buffet breakfast and Pool Grill available. Fitness, sauna, Turkish bath and spa therapies on site.",
    da: "يقع على البوسفور، ويضم هذا القصر العثماني المرمم من القرن التاسع عشر عمارة تاريخية بتفاصيل فاخرة. مسبح داخلي وخارجي مُدفأ، حديقة وتراس بانورامي. واي فاي وموقف خاص. مطعم أكوا بمطبخ متوسطي، إفطار بوفيه ومشواة المسبح. لياقة وساحة وحمّام تركي وعلاجات سبا.",
    am: ["Outdoor swimming pool", "Indoor pool", "Free Wifi", "Spa", "Private Parking", "Family rooms", "Fitness center", "Restaurant", "Bar", "Turkish bath", "Wonderful Breakfast"],
    neby: ["Beşiktaş Square — 4-min walk", "Dolmabahçe Palace — nearby", "Ortaköy — short drive", "Istanbul Airport — 31 mi"],
    naby: ["ميدان بشكتاش — 4 دقائق سيراً", "قصر دولماباهتشه — قريب", "أورتاكوي — بالسيارة", "مطار إسطنبول — 31 ميل"],
    he: ["19th-century Ottoman palace on the Bosphorus", "Indoor + heated outdoor pools", "Aqua Restaurant terrace"],
    ha: ["قصر عثماني على البوسفور", "مسبح داخلي وخارجي مُدفأ", "تراس مطعم أكوا"],
    rooms: [
      { n: "Palace Courtyard Room", na: "غرفة فناء القصر", b: "1 King" },
      { n: "Superior Room", na: "غرفة سوبيريور", b: "1 King" },
      { n: "Deluxe Room", na: "غرفة ديلوكس", b: "1 King" },
      { n: "Four Seasons Junior Suite", na: "جناح جونيور فور سيزونز", b: "1 King", cap: 3 },
      { n: "Palace Bosphorus Room", na: "غرفة القصر بإطلالة بوسفور", b: "1 King" },
    ],
    revs: [
      { a: "Guy", c: "Belgium", r: 10, d: "22 April 2025", te: "Exceptional", ta: "استثنائي", t: "Luxury class. Friendly staff, perfect location", ar: "فئة فاخرة. طاقم ودود وموقع مثالي", st: "Business trip", sta: ST.business },
      { a: "Vuk", c: "Serbia", r: 10, d: "11 April 2025", te: "Love this Hotel", ta: "أحب هذا الفندق", t: "This hotel is one of my favorite i have ever stayed in. Location and view are amazing. Do not let me start about food.. woow. Truly 5 diamonds not stars.", ar: "من أفضل ما أقمت فيه. الموقع والإطلالة مذهلان والطعام رائع. حقاً خمس ماسات لا نجوم." },
      { a: "Walid", c: "Algeria", r: 10, d: "11 April 2025", te: "Excellent location, we had a great stay.", ta: "موقع ممتاز وإقامة رائعة", t: "Wonderful location, Friendly staff, Very comfortable bed. Honestly I cannot think of any negative remark about this hotel.", ar: "موقع رائع وطاقم ودود وسرير مريح جداً. لا أجد أي ملاحظة سلبية." },
      { a: "Rodney", c: "South Africa", r: 10, d: "23 March 2025", te: "Exceptional", ta: "استثنائي", t: "The room was super private and comfy. The staff were super awesome.", ar: "الغرفة خاصة ومريحة جداً. الطاقم رائع." },
      { a: "Navneet", c: "India", r: 10, d: "17 February 2025", te: "Exceptional", ta: "استثنائي", t: "The location was fabulous. The service fantastic. Everything was perfect", ar: "الموقع رائع والخدمة ممتازة. كل شيء كان مثالياً" },
      { a: "Violet", c: "United Kingdom", r: 10, d: "3 November 2024", te: "It was a blissful stay.", ta: "إقامة هانئة", t: "Absolutely everything; the staff, facilities, food, location; so welcoming, warm, friendly, courteous and professional.", ar: "كل شيء؛ الطاقم والمرافق والطعام والموقع؛ ترحيب ودفء ولطف واحتراف." },
    ],
  }),

  H({
    slug: "shangri-la-bosphorus", id: "shangri-la-bosphorus-istanbul", comp: "full",
    src: ["Booking.com hotel page", "Booking guest quotes", "Trabber (~9.1 / ~1268)"],
    note: "One Booking scrape showed ~9.0 / 1156; using 9.1 / 1268 per Trabber brief alignment.",
    ne: "Shangri-La Bosphorus, Istanbul", na: "شانغري-لا بوسفور إسطنبول",
    ae: "Sinanpaşa Mah., Hayrettin İskelesi Sok. No.1, Beşiktaş, 34353 Istanbul, Turkey",
    aa: "سينان باشا محلة، شارع رصيف خير الدين رقم 1، بشكتاش، 34353 إسطنبول، تركيا",
    rating: 9.1, rc: 1268,
    de: "Located between Dolmabahçe Palace and the Naval Museum on the European Bosphorus coast. Offers an indoor pool, CHI The Spa, and rooms with contemporary décor and Asian highlights. Suites have a separate living room and terraces with Bosphorus views; marble bathrooms with heated floors, bathtubs and Bvlgari toiletries. Dining: IST TOO and Shang Palace. CHI Spa: heated indoor pool, sauna, Turkish bath, hot tub and steam rooms. Free private parking; Beşiktaş Ferry Port steps away.",
    da: "بين قصر دولماباهتشه والمتحف البحري على البوسفور الأوروبي. مسبح داخلي وسبا CHI وغرف بتفاصيل آسيوية. الأجنحة بغرفة معيشة وشرفات بوسفور. مطاعم IST TOO وقصر شانغ. سبا CHI بحمّام تركي. موقف خاص مجاني.",
    am: ["Indoor swimming pool", "Free WiFi", "Spa CHI", "Free parking", "Airport shuttle", "Family rooms", "Fitness centre", "Bar", "Shang Palace", "Turkish bath", "Very good breakfast"],
    neby: ["Beşiktaş Ferry Port — steps", "Dolmabahçe Palace — nearby", "Naval Museum — adjacent", "Taksim Square — within 2 km"],
    naby: ["رصيف عبارات بشكتاش — خطوات", "قصر دولماباهتشه — قريب", "المتحف البحري — مجاور", "ميدان تقسيم — ضمن 2 كم"],
    he: ["CHI The Spa", "Bosphorus suite terraces", "Shang Palace Chinese dining"],
    ha: ["سبا CHI", "شرفات بوسفور", "مطعم شانغ بالاس"],
    rooms: [
      { n: "Deluxe Room", na: "غرفة ديلوكس" },
      { n: "Premier Room", na: "غرفة بريميير" },
      { n: "Junior Suite", na: "جناح جونيور", cap: 3 },
      { n: "Executive Suite", na: "جناح تنفيذي", cap: 3 },
      { n: "Deluxe Bosphorus Suite", na: "جناح ديلوكس بوسفور", cap: 3, d: "Living room and Bosphorus terraces (Booking)." },
    ],
    revs: [
      { a: "Wassim", c: "Lebanon", r: 10, te: "Immaculate welcome", ta: "ترحيب مثالي", t: "My experience was absolutely immaculate, starting with the warm welcome during check-in with Ismail, who patiently guided me through the process and ensured I had all the information I needed.", ar: "تجربة مثالية بدءاً من ترحيب إسماعيل عند تسجيل الوصول." },
      { a: "Shalini", c: "United Kingdom", r: 10, te: "Excellent location", ta: "موقع ممتاز", t: "Excellent location. Personalised service from all the staff. Loved it all.", ar: "موقع ممتاز وخدمة شخصية من كل الطاقم." },
      { a: "Verified guest", r: 10, te: "Stunning", ta: "مذهل", t: "Staying at the Shangri-La Istanbul was nothing short of stunning. The hotel exceeded all expectations — from the elegant design to the impeccable service. The views of the Bosphorus were breathtaking.", ar: "الإقامة مذهلة وتجاوزت التوقعات. إطلالات البوسفور خلّابة." },
      { a: "Verified guest", r: 10, te: "First-class staff", ta: "طاقم من الدرجة الأولى", t: "The hotel is beautiful and very stylish. The location is amazing; just by the Bosphorus. The staff at reception/SPA/concierge/lounge was FIRST CLASS!!", ar: "فندق أنيق بموقع مذهل على البوسفور. طاقم الاستقبال والسبا من الدرجة الأولى." },
      { a: "Verified guest", r: 9, te: "Clean and quiet", ta: "نظيف وهادئ", t: "Very clean and quiet room. Lovely shower and goodies in the bathroom. The staff were amazing and very helpful.", ar: "غرفة نظيفة وهادئة. دش لطيف ومستلزمات حمام. طاقم مذهل." },
    ],
  }),
];

fs.writeFileSync(path.join(__dirname, "_part2-chunk1.json"), JSON.stringify(hotels, null, 2));
console.log("chunk1", hotels.length);
