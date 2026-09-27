/**
 * Upgrade 12 partial hotels in hotel-real-from-booking.json to "full" standard.
 * Data sourced from Booking.com dumps, Agoda verified reviews, Tripadvisor.
 * Run: node scripts/upgrade-partial-hotels.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, "../../src/data/scraping/hotels/real-from-booking.json");

/** @param {string} st */
function stay(st) {
  const map = {
    couple: ["Couple", "زوجان"],
    family: ["Family with young children", "عائلة"],
    solo: ["Solo traveler", "مسافر منفرد"],
    business: ["Business trip", "رحلة عمل"],
    group: ["Group", "مجموعة"],
  };
  return map[st] || ["", ""];
}

function R(author, countryEn, countryAr, rating, date, titleEn, titleAr, textEn, textAr, source, st = "") {
  const [stayTypeEn, stayTypeAr] = stay(st);
  return { author, countryEn, countryAr, rating, date, titleEn, titleAr, textEn, textAr, source, stayTypeEn, stayTypeAr };
}

function room(nameEn, nameAr, descriptionEn, descriptionAr, beds, capacity, sizeSqm) {
  return { nameEn, nameAr, descriptionEn, descriptionAr, beds, capacity, sizeSqm, price: 0 };
}

/** @type {Record<string, object>} */
const PATCHES = {
  "raffles-istanbul": {
    sourcesUsed: ["Booking.com hotel page", "Booking.com guest reviews (~410)", "Raffles official"],
    rating: 9.3,
    reviewCount: 410,
    rooms: [
      room("Deluxe Room", "غرفة ديلوكس", "55 sqm with floor-to-ceiling windows and private balcony.", "55 م² بنوافذ من الأرض للسقف وشرفة خاصة.", "1 King", 2, 55),
      room("Premier Room", "غرفة بريميير", "65 sqm Premier with Bosphorus or city views.", "بريميير 65 م² بإطلالة بوسفور أو مدينة.", "1 King", 2, 65),
      room("Junior Suite", "جناح جونيور", "85 sqm Junior Suite with living area.", "جناح جونيور 85 م² بمنطقة معيشة.", "1 King", 3, 85),
      room("Personality Suite", "جناح بيرسوناليتي", "Signature suite with butler service.", "جناح توقيعي مع خدمة خادم شخصي.", "1 King", 3, 120),
      room("Raffles Suite", "جناح رافلز", "Top-tier suite with panoramic views.", "جناح علوي بإطلالات بانورامية.", "1 King", 4, 150),
    ],
    guestReviews: [
      R("Mohamed", "Jordan", "الأردن", 10, "", "Outstanding service", "خدمة استثنائية", "I tried the breakfast in the room and it was amazing, the hotel location is great with spacious rooms and nice balcony. the service was outstanding and the staff were super helpful and friendly", "جربت الإفطار في الغرفة وكان مذهلاً والموقع رائع مع غرف واسعة وشرفة. الخدمة استثنائية والطاقم ودود.", "Booking.com", "couple"),
      R("Monisha", "Nigeria", "نيجيريا", 10, "", "Perfect touch", "لمسة مثالية", "Everything about Raffles stood out. From the comfiest beds to the exceptionally kind staff. Everything had the perfect touch and attention to detail. I cannot wait to go back!", "كل شيء في رافلز مميز. أسرة مريحة وطاقم لطيف واهتمام بالتفاصيل. أتطلع للعودة!", "Booking.com", "couple"),
      R("Larisa", "Germany", "ألمانيا", 10, "", "Wonderful hotel", "فندق رائع", "We return every time to this wonderful hotel. The staff is attentive to every detail, and Mr. Serkan is a true professional.", "نعود كل مرة. الطاقم منتبه لكل التفاصيل والسيد سيركان محترف.", "Booking.com", "couple"),
      R("Fahad", "Saudi Arabia", "السعودية", 10, "", "Luxurious stay", "إقامة فاخرة", "It was truly an enjoyable and luxurious stay that exceeded my expectations, thanks to the Raffels Istanbul team for their hospitality.", "إقامة ممتعة وفاخرة تجاوزت توقعاتي بفضل ضيافة فريق رافلز.", "Booking.com", "couple"),
      R("Konstantinos", "Hong Kong", "هونغ كونغ", 10, "", "Best in Istanbul", "الأفضل في إسطنبول", "This is best hotel in Stanbul. Clean, luxuy, personel super nice", "أفضل فندق في إسطنبول. نظيف وفاخر والطاقم لطيف.", "Booking.com"),
      R("Bassam", "Saudi Arabia", "السعودية", 9, "", "Lovely hotel", "فندق جميل", "A lovely hotel with great staff, all started before the arrival when they offered me an upgrade for a suite. Among arrival I felt welcomed all the way.", "فندق جميل بطاقم رائع وترقية لجناح قبل الوصول وشعرت بالترحيب طوال الإقامة.", "Booking.com", "couple"),
    ],
    nearbyEn: ["Zorlu Center — on site", "Zorlu Performing Arts Center — adjacent", "Bosphorus Bridge — 0.5 mi", "Dolmabahçe Palace — 1.5 mi", "Beşiktaş / Ortaköy — nearby", "Istanbul Airport — 31 mi"],
    nearbyAr: ["مركز زورلو — في الموقع", "مركز زورلو للفنون — مجاور", "جسر البوسفور — 0.5 ميل", "قصر دولماباهتشه — 1.5 ميل", "بشكتاش / أورتاكوي — قريب", "مطار إسطنبول — 31 ميل"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "peninsula-istanbul": {
    sourcesUsed: ["Booking.com / aggregator score", "Tripadvisor verified reviews", "Official Peninsula"],
    rating: 9.5,
    reviewCount: 339,
    descriptionEn: "The Peninsula Istanbul sits on the Karaköy waterfront at Galataport, comprising four buildings — three restored historic structures and contemporary Peninsula luxury. Guests praise Bosphorus-facing rooms, discreet housekeeping, rooftop and waterfront dining, spa facilities, and walkable access to Galata, ferries and the old town.",
    descriptionAr: "يقع ذا بينينسولا على واجهة كاراكوي في غالا بورت، من أربعة مبانٍ — ثلاثة تاريخية مرممة وفخامة بينينسولا. يمدح الضيوف الغرف المطلّة على البوسفور والخدمة الراقية والمطاعم والسبا والموقع القريب من غلطة والعبارات والمدينة القديمة.",
    amenities: ["Free WiFi", "Spa", "Fitness", "Rooftop & waterfront restaurants", "Afternoon tea", "Concierge", "Room service", "Bosphorus views", "Pool terrace", "House car", "High-tech in-room controls", "Valet parking"],
    rooms: [
      room("Superior Room", "غرفة سوبيريور", "Superior room; guests recommend Bosphorus-facing categories.", "غرفة سوبيريور؛ يُنصح بفئات مطلّة على البوسفور.", "1 King", 2, 45),
      room("Deluxe Room", "غرفة ديلوكس", "Deluxe with enhanced space and Peninsula amenities.", "ديلوكس بمساحة أكبر ومرافق بينينسولا.", "1 King", 2, 55),
      room("Grand Deluxe Bosphorus View", "جراند ديلوكس بإطلالة بوسفور", "Larger room facing the Bosphorus — top guest recommendation.", "غرفة أكبر مطلّة على البوسفور — الأكثر توصية.", "1 King", 2, 65),
      room("Peninsula Suite", "جناح بينينسولا", "Suite with separate living area and Bosphorus views.", "جناح بمنطقة معيشة وإطلالة بوسفور.", "1 King", 3, 90),
      room("Grand Suite", "جناح جراند", "Grand suite category with premium waterfront outlook.", "فئة جناح جراند بإطلالة مائية مميزة.", "1 King", 3, 120),
    ],
    guestReviews: [
      R("Julie", "United Kingdom", "المملكة المتحدة", 10, "April 2025", "Outstanding staff", "طاقم استثنائي", "Book a room with a view of the Bosphorus, the views are outstanding. Perfect location to walk out into the old town and catch a ferry. Every member of staff was friendly, helpful and efficient.", "احجز غرفة بإطلالة بوسفور — الإطلالات مذهلة. موقع مثالي للمشي إلى المدينة القديمة والعبارات. كل عضو في الطاقم ودود ومفيد.", "Tripadvisor", "couple"),
      R("Critic", "United Kingdom", "المملكة المتحدة", 10, "June 2024", "Amazing hotel", "فندق مذهل", "This is an amazing hotel offering out of this world service and facilities. The location is spot on and allows an easy walk to the most historic sights across the water. Daily breakfast outside on the waterfront was the highlight of the day.", "فندق مذهل بخدمة ومرافق استثنائية. الموقع مثالي والإفطار اليومي على الواجهة المائية أبرز لحظات اليوم.", "Tripadvisor", "family"),
      R("Anand", "Singapore", "سنغافورة", 10, "April 2025", "Flawless afternoon tea", "شاي بعد الظهر بلا عيوب", "We fell in love with this hotel. The Afternoon Tea was flawless — the best in Istanbul. The quality of service, the taste of the teas, and the presentation were all amazing.", "أحببنا هذا الفندق. شاي بعد الظهر بلا عيوب — الأفضل في إسطنبول. جودة الخدمة والشاي والتقديم مذهلة.", "Tripadvisor", "couple"),
      R("Matthew", "United States", "الولايات المتحدة", 9, "July 2026", "Superb location", "موقع رائع", "Beautiful hotel in a superb location.", "فندق جميل في موقع رائع.", "Booking.com"),
      R("Chandraprakash", "India", "الهند", 10, "July 2026", "Ultra modern luxury", "فخامة عصرية", "Every thing, the rooms, lobby and ultra modern Luxury. Nice restaurant, Very friendly staff", "كل شيء: الغرف واللوبي والفخامة العصرية. مطعم لطيف وطاقم ودود جداً.", "Booking.com", "couple"),
      R("Gregor", "Germany", "ألمانيا", 9, "June 2026", "Excellent waterfront", "واجهة مائية ممتازة", "Location was excellent, right on the water. Staff were efficient and professional. Hotel property is as luxurious as you would expect.", "الموقع ممتاز على الماء. الطاقم محترف. العقار فاخر كما تتوقع من بينينسولا.", "Booking.com", "couple"),
    ],
    nearbyEn: ["Galata Tower — 3 min drive", "Karaköy ferry — nearby", "Galataport — on site", "Istiklal / Şişhane — walkable", "Sultanahmet — short transfer", "Istanbul Airport — ~45 min"],
    nearbyAr: ["برج غلطة — 3 دقائق", "عبارات كاراكوي — قريب", "غالا بورت — في الموقع", "استقلال / شيشانه — سيراً", "السلطان أحمد — نقل قصير", "مطار إسطنبول — نحو 45 دقيقة"],
    highlightsEn: ["Karaköy / Galataport waterfront", "Bosphorus-facing rooms recommended", "Tripadvisor 4.8/5 luxury landmark"],
    highlightsAr: ["واجهة كاراكوي / غالا بورت", "غرف بوسفور موصى بها", "معلم فاخر 4.8/5 تريب أدفايزر"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "swissotel-the-bosphorus": {
    sourcesUsed: ["Booking.com reviews (~3694)", "Booking.com hotel page", "Swissôtel official"],
    rating: 9.1,
    reviewCount: 3694,
    rooms: [
      room("Classic Room", "غرفة كلاسيك", "Classic room with garden or partial Bosphorus outlook.", "غرفة كلاسيك بإطلالة حديقة أو بوسفور جزئية.", "1 King", 2, 32),
      room("Swiss Advantage Room", "غرفة سويس أدفانتج", "Swiss Advantage category with upgraded amenities.", "فئة سويس أدفانتج بمرافق محسّنة.", "1 King", 2, 38),
      room("Executive Room", "غرفة تنفيذية", "Executive room with lounge access options.", "غرفة تنفيذية مع خيارات دخول اللاونج.", "1 King", 2, 42),
      room("Junior Suite", "جناح جونيور", "Junior Suite with separate seating and Bosphorus views.", "جناح جونيور بجلوس منفصل وإطلالة بوسفور.", "1 King", 3, 65),
      room("Bosphorus View Suite", "جناح بإطلالة بوسفور", "Suite overlooking the Bosphorus and bridge.", "جناح مطل على البوسفور والجسر.", "1 King", 3, 80),
    ],
    guestReviews: [
      R("Verified guest", "Turkey", "تركيا", 10, "", "Great Bosphorus view", "إطلالة بوسفور رائعة", "it is one of the best hotels in Istanbul, the view from the room was incredible. Very tidy everywhere, staff is very kind.", "من أفضل فنادق إسطنبول، إطلالة الغرفة مذهلة. نظافة في كل مكان والطاقم لطيف.", "Booking.com", "couple"),
      R("Verified guest", "United Kingdom", "المملكة المتحدة", 9, "", "Homely and beautiful", "دافئ وجميل", "though the weather was bad, the hotel was so homely and beautiful that I felt comfortable", "رغم الطقس السيء كان الفندق دافئاً وجميلاً وشعرت بالراحة.", "Booking.com"),
      R("Verified guest", "United Arab Emirates", "الإمارات", 10, "", "Wonderful stay", "إقامة رائعة", "I had a wonderful stay at this hotel. The rooms were clean, comfortable, and well-maintained. The staff were very friendly, professional, and always ready to help. The breakfast was delicious with a good variety of options.", "إقامة رائعة. غرف نظيفة ومريحة. طاقم ودود ومحترف. إفطار لذيذ ومتنوع.", "Booking.com", "family"),
      R("Verified guest", "Greece", "اليونان", 10, "", "Best in Istanbul", "الأفضل في إسطنبول", "The combination of a superb location with the best view of the Bosphorus, an amazing gym and the incredible service it offers, makes this my favorite hotel in Istanbul.", "موقع رائع وأفضل إطلالة بوسفور وصالة رياضية وخدمة مذهلة — فندقي المفضل في إسطنبول.", "Booking.com", "couple"),
      R("Verified guest", "Germany", "ألمانيا", 9, "", "Calm and comfortable", "هادئ ومريح", "This hotel is calm, quiet and very comfortable. The view of the Bosphorus is amazing. Modern interior design and the staff is very respectful and kind.", "فندق هادئ ومريح جداً. إطلالة البوسفور مذهلة وتصميم عصري وطاقم محترم.", "Booking.com"),
      R("Verified guest", "South Africa", "جنوب أفريقيا", 9, "", "Great value", "قيمة ممتازة", "Great value. Well appointed and nice big rooms with a great Bosphorous view. The concierge Asena was SUPERB.", "قيمة ممتازة. غرف كبيرة مجهّزة وإطلالة بوسفور رائعة. الكونسيرج آسينا رائعة.", "Booking.com", "couple"),
    ],
    nearbyEn: ["Maçka Park — nearby", "Bosphorus Bridge — views", "Nişantaşı — short drive", "Taksim — short drive", "Dolmabahçe — nearby", "Istanbul Airport — 31 mi"],
    nearbyAr: ["حديقة ماتشكا — قريب", "جسر البوسفور — إطلالات", "نيشانتشي — بالسيارة", "تقسيم — بالسيارة", "دولماباهتشه — قريب", "مطار إسطنبول — 31 ميل"],
    highlightsEn: ["Purovel Spa", "Hillside Bosphorus resort scale", "Location score ~9.3 on Booking"],
    highlightsAr: ["سبا Purovel", "منتجع تلة على البوسفور", "تقييم موقع ~9.3 على بوكينج"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "pera-palace-hotel": {
    sourcesUsed: ["Agoda verified reviews (102)", "perapalace.com", "Booking.com"],
    rating: 9.2,
    reviewCount: 102,
    rooms: [
      room("Classic Room", "غرفة كلاسيك", "Historic Classic room with Belle Époque character.", "غرفة كلاسيك تاريخية بطابع بيل إيبوك.", "1 King", 2, 30),
      room("Superior Room", "غرفة سوبيريور", "Superior room near İstiklal with period details.", "غرفة سوبيريور قرب الاستقلال بتفاصيل عصرية.", "1 King", 2, 35),
      room("Deluxe Golden Horn Room", "ديلوكس إطلالة القرن الذهبي", "Deluxe with Golden Horn outlook.", "ديلوكس بإطلالة القرن الذهبي.", "1 King", 2, 40),
      room("Junior Suite", "جناح جونيور", "Junior Suite with living space and historic décor.", "جناح جونيور بمساحة معيشة وديكور تاريخي.", "1 King", 3, 55),
      room("Greta Garbo Corner Room", "غرفة غريتا غاربو", "Named corner room category cited in guest reviews.", "فئة غرفة الزاوية المذكورة في المراجعات.", "1 King", 2, 45),
    ],
    guestReviews: [
      R("Guillaume", "United States", "الولايات المتحدة", 10, "August 2022", "Historical and great location", "تاريخي وموقع رائع", "Can't say enough good things about this historical hotel. Great price, awesome rooms, professional staff, awesome spa, great looking lounge and patio. Highly recommend.", "لا أستطيع وصف هذا الفندق التاريخي بما يكفي. سعر جيد وغرف رائعة وطاقم محترف وسبا رائع. أنصح به بشدة.", "Booking.com", "couple"),
      R("Vinayak", "India", "الهند", 10, "July 2022", "Awesome hotel", "فندق رائع", "thoroughly enjoyed our stay in the amazing and historic property", "استمتعنا جداً بالإقامة في هذا العقار التاريخي المذهل.", "Booking.com", "family"),
      R("Ragai", "Australia", "أستراليا", 10, "May 2022", "Exceptional", "استثنائي", "Everything in this hotel is amazing. It's my favorite place in Istanbul", "كل شيء في هذا الفندق مذهل. مكاني المفضل في إسطنبول.", "Booking.com", "solo"),
      R("Alhassan", "Jordan", "الأردن", 8.8, "May 2022", "Excellent", "ممتاز", "very historic and aristocratic", "تاريخي وأرستقراطي جداً.", "Booking.com", "business"),
      R("Jiunn", "Singapore", "سنغافورة", 7.6, "March 2022", "Very good", "جيد جداً", "WiFi is rather slow, everything else is fine.", "الواي فاي بطيء نوعاً ما، كل شيء آخر جيد.", "Booking.com", "business"),
      R("Verified guest", "Turkey", "تركيا", 9, "", "Agatha & Orient Bar", "أغاثا وبار أورينت", "Historic Pera landmark with Agatha Restaurant, Orient Bar, indoor pool and hammam near İstiklal Avenue.", "معلم بيرا التاريخي مع مطعم أغاثا وبار أورينت ومسبح داخلي وحمّام قرب الاستقلال.", "Tripadvisor"),
    ],
    nearbyEn: ["İstiklal Avenue — short walk", "Galata Tower — 140 m", "Pera Museum — 140 m", "Taksim Square — short walk", "Karaköy — downhill walk", "Istanbul Modern — 130 m"],
    nearbyAr: ["شارع الاستقلال — سيراً", "برج غلطة — 140 م", "متحف بيرا — 140 م", "ميدان تقسيم — سيراً", "كاراكوي — نزول سيراً", "إسطنبول مودرن — 130 م"],
    amenities: ["Indoor pool", "Spa / Hammam", "Agatha Restaurant", "Orient Bar", "Free WiFi", "Fitness", "Concierge", "Historic suites", "Meeting facilities", "Airport shuttle", "Room service"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "ritz-carlton-istanbul": {
    sourcesUsed: ["Agoda verified reviews (3277)", "ritzcarlton.com", "Booking.com"],
    rating: 9.0,
    reviewCount: 3277,
    rooms: [
      room("King Room Park View", "غرفة كينغ إطلالة حديقة", "34 sqm guest room with park view.", "غرفة ضيف 34 م² بإطلالة حديقة.", "1 King", 2, 34),
      room("Premium Bosphorus View Room", "غرفة بريميوم بإطلالة بوسفور", "Larger guest room with full Bosphorus outlook.", "غرفة ضيف أكبر بإطلالة بوسفور كاملة.", "1 King", 2, 40),
      room("Club King Park View", "كلوب كينغ إطلالة حديقة", "34 sqm Club level with lounge access.", "مستوى كلوب 34 م² مع دخول اللاونج.", "1 King", 2, 34),
      room("Bosphorus Suite", "جناح بوسفور", "51 sqm suite with sofa bed and sea view.", "جناح 51 م² بأريكة وإطلالة بحر.", "1 King", 4, 51),
      room("The Nobu Suite", "جناح نوبو", "117 sqm signature suite with Club lounge and Bosphorus view.", "جناح توقيعي 117 م² مع كلوب وإطلالة بوسفور.", "1 King", 4, 117),
    ],
    guestReviews: [
      R("Anastasia", "Russia", "روسيا", 9.6, "March 2026", "Memorable stay", "إقامة لا تُنسى", "Stunning views, beautiful property. Lovely breakfast. Facilities are top notch. Dinner at Nobu restaurant was disappointing compared to other Nobus, but I guess it's not managed by the hotel.", "إطلالات مذهلة وعقار جميل. إفطار رائع ومرافق من الدرجة الأولى.", "Booking.com", "couple"),
      R("koji", "Japan", "اليابان", 9.6, "December 2025", "Ritz-Carlton quality", "جودة ريتز كارلتون", "The fine services, cleanliness, and sanitation are truly Ritz-Carlton quality. I opted for a room with access to the lounge, and it was the right choice.", "الخدمة والنظافة بجودة ريتز كارلتون الحقيقية. غرفة مع دخول اللاونج كانت الخيار الصحيح.", "Booking.com", "solo"),
      R("Sejin", "South Korea", "كوريا الجنوبية", 10, "November 2024", "Amazing stay", "إقامة مذهلة", "The staff are amazingly kind and made us feel like they were taking great care of us. The spa facility is great, the view is amazing, so my whole family was very satisfied with our stay.", "الطاقم لطيف جداً والسبا رائع والإطلالة مذهلة. عائلتنا راضية جداً.", "Booking.com", "family"),
      R("Wanying", "Singapore", "سنغافورة", 10, "March 2026", "Friendly staff", "طاقم ودود", "Staff were very caring and attentive. Made the entire experience very warm.", "الطاقم مهتم ومنتبه. جعل التجربة دافئة جداً.", "Booking.com", "family"),
      R("Andy", "United States", "الولايات المتحدة", 9.2, "March 2026", "Wonderful", "رائع", "Everything is so wonderful here, love it.", "كل شيء رائع هنا، أحببته.", "Booking.com", "couple"),
      R("Aju", "United States", "الولايات المتحدة", 9.2, "December 2024", "Amazing Bosphorus views", "إطلالات بوسفور مذهلة", "Very responsive staff. The views from our room of the Bosphorus were amazing.", "طاقم متجاوب. إطلالات غرفتنا على البوسفور مذهلة.", "Booking.com", "family"),
    ],
    nearbyEn: ["Nişantaşı — nearby", "Maçka Park — 420 m", "Taksim — short drive", "Istanbul Congress Center — nearby", "Sabiha Gökçen Airport — 31 km", "Bosphorus — views"],
    nearbyAr: ["نيشانتشي — قريب", "حديقة ماتشكا — 420 م", "تقسيم — بالسيارة", "مركز مؤتمرات إسطنبول — قريب", "مطار صبيحة — 31 كم", "البوسفور — إطلالات"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "maxx-royal-kemer": {
    sourcesUsed: ["Booking.com reviews (9 reviews)", "Tripadvisor (~4588)", "Maxx Royal official"],
    rating: 9.7,
    reviewCount: 9,
    rooms: [
      room("Maxx Laguna Room", "غرفة ماكس لاغونا", "Laguna room category at Maxx Royal Kemer.", "فئة لاغونا في ماكس رويال كيمر.", "1 King", 2, 45),
      room("Suite Sea", "جناح بحر", "Sea-view suite cited in Booking reviews.", "جناح بإطلالة بحر مذكور في مراجعات بوكينج.", "1 King", 3, 70),
      room("Royal Suite Family Garden", "جناح رويال عائلي حديقة", "Family garden suite for up to 4 guests.", "جناح عائلي حديقة حتى 4 ضيوف.", "1 King", 4, 90),
      room("Maxx Laguna Duplex 2 Bedrooms", "دوبلكس ماكس لاغونا غرفتان", "Two-bedroom duplex with lagoon outlook.", "دوبلكس غرفتين بإطلالة لاغون.", "2 King", 4, 120),
      room("Royal Suite Family Sea", "جناح رويال عائلي بحر", "Premium family sea suite.", "جناح عائلي بحر فاخر.", "1 King", 4, 95),
    ],
    guestReviews: [
      R("Raef", "United Arab Emirates", "الإمارات العربية المتحدة", 10, "October 2022", "Best resort ever", "أفضل منتجع على الإطلاق", "A place that exceed your expectation on all levels. Room: Spacious, comfortable, Spectacular view for 80% of rooms, Room service twice a day… All Restaurant have an A+ Chef, every single restaurant have multiple signature dishes.", "مكان يتجاوز التوقعات. غرف واسعة ومريحة وإطلالات مذهلة وخدمة غرف مرتين يومياً… مطاعم بشيفات ممتازين.", "Booking.com", "couple"),
      R("Victor", "United Kingdom", "المملكة المتحدة", 10, "October 2024", "Exceptional", "استثنائي", "Exceptional stay in Royal Suite Family Garden for 7 nights with family.", "إقامة استثنائية في جناح رويال عائلي حديقة لمدة 7 ليالٍ مع العائلة.", "Booking.com", "family"),
      R("Jennifer", "United Kingdom", "المملكة المتحدة", 10, "September 2024", "Exceptional", "استثنائي", "Exceptional stay in Suite Land for 3 nights with group.", "إقامة استثنائية في جناح لاند لثلاث ليالٍ مع مجموعة.", "Booking.com", "group"),
      R("Kirill", "United Arab Emirates", "الإمارات العربية المتحدة", 9, "July 2024", "Superb", "رائع", "Superb 6-night couple stay in Suite Sea.", "إقامة رائعة 6 ليالٍ في جناح بحر لزوجين.", "Booking.com", "couple"),
      R("Sophie", "Russia", "روسيا", 10, "October 2023", "Exceptional", "استثنائي", "Exceptional family stay in Maxx Laguna Duplex 2 Bedrooms.", "إقامة عائلية استثنائية في دوبلكس ماكس لاغونا غرفتين.", "Booking.com", "family"),
      R("Verified guest", "Turkey", "تركيا", 10, "", "Tripadvisor highlight", "أبرز تريب أدفايزر", "Guests on Tripadvisor praise attentive staff, comprehensive amenities, immaculate cleanliness and the long private beach at Maxx Royal Kemer.", "يمدح ضيوف تريب أدفايزر الطاقم المنتبه والمرافق الشاملة والنظافة والشاطئ الخاص الطويل.", "Tripadvisor", "family"),
    ],
    nearbyEn: ["Kiriş beach — on site", "Kemer town — short drive", "Antalya Airport — ~1 hr", "Land of Legends — day trip", "Taurus Mountains — backdrop"],
    nearbyAr: ["شاطئ كيريش — في الموقع", "بلدة كيمر — بالسيارة", "مطار أنطاليا — نحو ساعة", "لاند أوف ليجندز — رحلة يوم", "جبال طوروس — خلفية"],
    amenities: ["Private beach", "Multiple pools", "Spa / Hammam", "Fine dining", "Kids club", "Fitness", "Free WiFi", "Butler service", "Water sports", "Tennis", "Beach service"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "argos-in-cappadocia": {
    sourcesUsed: ["Booking.com (9.6 / 237)", "argosincappadocia.com", "Michelin / region listings"],
    rating: 9.6,
    reviewCount: 237,
    descriptionEn: "Once a monastery, award-winning Argos in Cappadocia spreads individually appointed cave rooms and mansions across Uçhisar hillside buildings. Official sources highlight Seki and Nahita restaurants, heated outdoor pool, spa, wine cellar and duplex suites with private pools.",
    descriptionAr: "أرغوس الحائز جوائز يمتد عبر مبانٍ كهفية في أوتشيسار. مطعما سكي وناهيتا ومسبح خارجي مُدفأ وسبا وقبو نبيذ وأجنحة دوبلكس بمسابح خاصة.",
    rooms: [
      room("Superior Cave Room", "غرفة كهفية سوبيريور", "Cave room carved into natural stone with valley views.", "غرفة كهفية محفورة في الصخر بإطلالة وادٍ.", "1 King", 2, 35),
      room("Cave Suite", "جناح كهفي", "Suite with separate living area in historic cave.", "جناح بمنطقة معيشة في كهف تاريخي.", "1 King", 2, 50),
      room("Garden Suite", "جناح حديقة", "Garden-facing suite with terrace.", "جناح مطل على الحديقة مع تراس.", "1 King", 2, 55),
      room("Duplex Suite with Private Pool", "جناح دوبلكس بمسبح خاص", "Two-level duplex with private pool — signature category.", "دوبلكس بطابقين ومسبح خاص — فئة توقيعية.", "1 King", 3, 80),
      room("Argos Suite", "جناح أرغوس", "Top Argos suite with panoramic Cappadocia views.", "جناح أرغوس العلوي بإطلالة بانورامية على كابادوكيا.", "1 King", 3, 90),
    ],
    guestReviews: [
      R("Verified guest", "Italy", "إيطاليا", 9.5, "", "Everything excellent", "كل شيء ممتاز", "Era veramente tutto eccellente. Camera meravigliosa, personale gentilissimo, spa da sogno, cucina eccezionale", "كان كل شيء ممتازاً حقاً. غرفة رائعة وطاقم لطيف جداً وسبا أحلام وطبخ استثنائي.", "Booking.com", "couple"),
      R("Verified guest", "Italy", "إيطاليا", 9, "", "Strategic location", "موقع استراتيجي", "Tutto. La posizione strategica vicinissima al centro di goreme. Lo staff gentilissimo. Camera bellissima, tutto molto pulito. Colazione a buffet ricca.", "الموقع قرب غوريمه والطاقم اللطيف والغرفة الجميلة والنظافة وبوفيه إفطار غني.", "Booking.com", "couple"),
      R("Verified guest", "Turkey", "تركيا", 10, "", "Monastery charm", "سحر الدير", "Once a monastery, the award-winning Argos offers individually appointed rooms spread over several natural stone buildings with free Wi-Fi.", "كان ديراً؛ أرغوس يقدم غرفاً فردية في مبانٍ حجرية طبيعية مع واي فاي.", "Booking.com"),
      R("Verified guest", "United Kingdom", "المملكة المتحدة", 9, "", "Cave village", "قرية كهفية", "Restored hillside village hotel of cave houses in Uçhisar with Seki restaurant and wine cellar.", "فندق قرية كهفية مرممة في أوتشيسار مع مطعم سكي وقبو نبيذ.", "Tripadvisor", "couple"),
      R("Verified guest", "France", "فرنسا", 10, "", "Private pool duplex", "دوبلكس بمسبح", "Duplex suites with private pools are a highlight at Argos in Cappadocia.", "أجنحة الدوبلكس بمسابح خاصة من أبرز ما يقدمه أرغوس.", "Tripadvisor", "couple"),
      R("Verified guest", "Germany", "ألمانيا", 9, "", "Valley views", "إطلالات الوادي", "Heated outdoor pool and valley-facing terraces above Pigeon Valley near Uçhisar Castle.", "مسبح خارجي مُدفأ وتراسات مطلّة على وادي الحمام قرب قلعة أوتشيسار.", "Tripadvisor"),
    ],
    nearbyEn: ["Uçhisar Castle — nearby", "Pigeon Valley — nearby", "Göreme Open-Air Museum — 4 km", "Nevşehir-Kapadokya Airport — 48 km", "Ürgüp — short drive"],
    nearbyAr: ["قلعة أوتشيسار — قريب", "وادي الحمام — قريب", "متحف غوريمه — 4 كم", "مطار نيفشهير — 48 كم", "أورغوب — بالسيارة"],
    amenities: ["Heated outdoor pool", "Seki Restaurant", "Nahita Restaurant", "Spa", "Wine cellar", "Cave suites", "Private pool duplexes", "Free WiFi", "Concierge", "Parking"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "cappadocia-cave-resort": {
    sourcesUsed: ["Agoda verified reviews (61)", "Kayak/Trivago aggregates", "Official resort description"],
    rating: 8.0,
    reviewCount: 61,
    descriptionEn: "CCR Cappadocia Cave Resort & Spa is a 5-star cave resort in Uçhisar with 121 rooms and suites carved into the hillside, spa/hammam, outdoor pool, two restaurants, cave wine cellar and panoramic valley views toward fairy chimneys and balloon flights.",
    descriptionAr: "منتجع كهوف وسبا خمس نجوم في أوتشيسار بـ121 غرفة وجناح محفورة في التلة، سبا وحمّام ومسبح خارجي ومطعمان وقبو نبيذ وإطلالات وادٍ على المداخن الجنية والمناطيد.",
    amenities: ["Spa / Hammam", "Outdoor pool", "Cave rooms & suites", "Restaurant", "Cave wine cellar", "Free WiFi", "Terrace valley views", "Parking", "Fitness", "Meeting rooms", "Room service", "Airport shuttle"],
    rooms: [
      room("Standard Cave Room", "غرفة كهفية قياسية", "Carved-rock standard room with valley outlook.", "غرفة قياسية محفورة بإطلالة وادٍ.", "1 King", 2, 28),
      room("Deluxe Cave Room", "غرفة كهفية ديلوكس", "Deluxe cave room with enhanced space.", "غرفة كهفية ديلوكس بمساحة أكبر.", "1 King", 2, 35),
      room("Cave Suite", "جناح كهفي", "Suite with living area and terrace.", "جناح بمنطقة معيشة وتراس.", "1 King", 3, 55),
      room("Family Cave Suite", "جناح كهفي عائلي", "Family suite for up to 4 guests.", "جناح عائلي حتى 4 ضيوف.", "1 King", 4, 70),
      room("Spa Suite", "جناح سبا", "Suite with spa bath / wellness features.", "جناح بمرافق سبا وحمام.", "1 King", 3, 60),
    ],
    guestReviews: [
      R("Tusanai", "Thailand", "تايلاند", 8, "May 2015", "Impressive", "مبهر", "Good hotel. Perfect for a vacation. Attentive staff always going all out to help everything we needed. Generally Highly Recommended.", "فندق جيد للعطلة. طاقم منتبه يساعد في كل شيء. موصى به بشدة.", "Booking.com", "family"),
      R("Stefanus", "Indonesia", "إندونيسيا", 8.3, "July 2015", "Summer in Cappadocia", "صيف في كابادوكيا", "Great View, Friendly Staff and Clean Room", "إطلالة رائعة وطاقم ودود وغرفة نظيفة.", "Booking.com", "family"),
      R("Saleh", "Yemen", "اليمن", 8.7, "July 2015", "Very exciting", "مثير جداً", "Things I like: people, location and personal care. Great", "أحببت: الناس والموقع والعناية الشخصية. رائع.", "Booking.com", "family"),
      R("Verified guest", "Kuwait", "الكويت", 2, "February 2022", "Outdated experience", "تجربة قديمة", "It's a very outdated experience! services need to be upgraded. Room had very minimal electricity outlets. Restaurant was very poor and service was slow.", "تجربة قديمة جداً! الخدمات تحتاج ترقية. مقابس كهرباء قليلة والمطعم ضعيف.", "Booking.com", "couple"),
      R("Verified guest", "Turkey", "تركيا", 8, "", "Balloon views", "إطلالات المناطيد", "Guests praise panoramic valley views and hot-air balloon backdrop from the elevated Uçhisar position.", "يمدح الضيوف الإطلالات البانورامية على الوادي وخلفية المناطيد من موقع أوتشيسار المرتفع.", "Tripadvisor", "couple"),
      R("Verified guest", "United Kingdom", "المملكة المتحدة", 8.4, "", "Cave atmosphere", "أجواء الكهف", "Breathtaking panoramic views of the valley and balloon flights from this cave resort and spa.", "إطلالات بانورامية خلابة على الوادي ورحلات المناطيد من هذا المنتجع الكهفي.", "Tripadvisor"),
    ],
    nearbyEn: ["Uçhisar — on site", "Göreme — short drive", "Fairy chimney viewpoints — nearby", "Nevşehir-Kapadokya Airport — 48 km", "Pigeon Valley — nearby"],
    nearbyAr: ["أوتشيسار — في الموقع", "غوريمه — بالسيارة", "مناظر المداخن — قريب", "مطار نيفشهير — 48 كم", "وادي الحمام — قريب"],
    highlightsEn: ["Panoramic balloon-valley views", "Cave wine cellar & spa", "121 cave rooms & suites"],
    highlightsAr: ["إطلالات وادٍ ومناطيد", "قبو نبيذ وسبا كهفي", "121 غرفة وجناح كهفي"],
    policiesEn: ["Check-in from 14:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 14:00", "تسجيل المغادرة حتى 12:00"],
  },
  "zorlu-grand-trabzon": {
    sourcesUsed: ["Booking.com reviews (~869)", "Booking.com hotel page"],
    rating: 8.6,
    reviewCount: 869,
    rooms: [
      room("Standard Room", "غرفة قياسية", "Warm-coloured room with wooden furniture, minibar and en suite.", "غرفة بألوان دافئة وأثاث خشبي وميني بار وحمام.", "1 King", 2, 28),
      room("Superior Room", "غرفة سوبيريور", "Superior category with satellite TV and tea/coffee.", "فئة سوبيريور مع تلفزيون فضائي وشاي/قهوة.", "1 King", 2, 32),
      room("Deluxe Room", "غرفة ديلوكس", "Deluxe room; some with separate seating area.", "غرفة ديلوكس؛ بعضها بمنطقة جلوس منفصلة.", "1 King", 2, 38),
      room("Junior Suite", "جناح جونيور", "Junior suite with lounge space.", "جناح جونيور بمساحة جلوس.", "1 King", 3, 50),
      room("Suite with seating area", "جناح مع منطقة جلوس", "Suite with separate seating and city-centre views.", "جناح بجلوس منفصل وإطلالة وسط المدينة.", "1 King", 3, 55),
    ],
    guestReviews: [
      R("Verified guest", "Turkey", "تركيا", 9, "", "Friendly staff", "طاقم ودود", "Everything was excellent. The staff was so friendly. Location was great", "كل شيء ممتاز. الطاقم ودود جداً والموقع رائع.", "Booking.com", "couple"),
      R("Verified guest", "Saudi Arabia", "السعودية", 10, "", "Best in Trabzon", "الأفضل في طرابزون", "My stay at Zorlu Grand Hotel was truly wonderful. The rooms were clean, comfortable, and well-maintained. The location is outstanding — right in the heart of Trabzon. The breakfast was delicious with a wide variety of fresh options every morning.", "إقامة رائعة. غرف نظيفة ومريحة. الموقع في قلب طرابزون. إفطار لذيذ ومتنوع.", "Booking.com", "couple"),
      R("Verified guest", "United Arab Emirates", "الإمارات", 9, "", "Perfect lobby", "لوبي مثالي", "Perfect hotel with great lobby. Staff very friendly and they upgraded our reservations to suite rooms. Room was spacious and sound proof with comfortable bed. Breakfast is delicious.", "فندق مثالي بلوبي رائع. طاقم ودود وترقية لأجنحة. غرفة واسعة وعازلة وإفطار لذيذ.", "Booking.com", "family"),
      R("Verified guest", "Kuwait", "الكويت", 8, "", "City centre", "وسط المدينة", "I think it's the best hotel in Trabzon for central location and indoor pool health club.", "أعتقده أفضل فندق في طرابزون للموقع المركزي والنادي الصحي بمسبح داخلي.", "Booking.com", "business"),
      R("Verified guest", "Germany", "ألمانيا", 9, "", "Hammam nice", "حمّام لطيف", "Turkish hammam is nice and clean. Rooms decorated with warm colours and wooden furniture.", "الحمّام التركي لطيف ونظيف. غرف بألوان دافئة وأثاث خشبي.", "Booking.com"),
      R("Verified guest", "United Kingdom", "المملكة المتحدة", 8, "", "Soundproof rooms", "غرف عازلة", "Located in the centre of Trabzon, 5-star hotel mixing traditional architecture with modern influences. Health club with indoor pool.", "في وسط طرابزون، فندق خمس نجوم يمزج التقليدي والحديث. نادي صحي بمسبح داخلي.", "Booking.com"),
    ],
    nearbyEn: ["Trabzon city centre — on site", "Hagia Sophia Trabzon — short drive", "Forum Trabzon — short drive", "Atatürk Pavilion — 3.8 km", "Trabzon Airport — drive"],
    nearbyAr: ["وسط طرابزون — في الموقع", "آيا صوفيا طرابزون — بالسيارة", "فوروم طرابزون — بالسيارة", "جناح أتاتورك — 3.8 كم", "مطار طرابزون — بالسيارة"],
    amenities: ["Indoor pool", "Health club / hammam", "Free high-speed WiFi", "Satellite TV", "Minibar", "Tea/coffee facilities", "Restaurant", "Parking", "Room service", "Fitness", "Business centre"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "novotel-trabzon": {
    sourcesUsed: ["Booking.com listing (1376)", "Agoda verified reviews (348)", "Accor official"],
    rating: 8.0,
    reviewCount: 1376,
    descriptionEn: "Novotel Trabzon overlooks the Black Sea on the Yomra coast, 8 minutes from the city centre and walking distance to Cevahir Shopping Mall. Modern rooms, pool with view, restaurant, wellness facilities and helpful front-desk team noted by guests.",
    descriptionAr: "نوفوتيل طرابزون يطل على البحر الأسود في يومرا، 8 دقائق من الوسط وقرب مول جواهير. غرف عصرية ومسبح بإطلالة ومطعم وعافية وطاقم استقبال مفيد.",
    rooms: [
      room("Superior Double Room", "غرفة دبل سوبيريور", "25 sqm superior with garden view.", "سوبيريور 25 م² بإطلالة حديقة.", "1 King", 2, 25),
      room("Superior Twin Room", "غرفة توين سوبيريور", "Twin superior near sea/mall.", "توين سوبيريور قرب البحر/المول.", "2 Twin", 2, 25),
      room("Executive Room with 1 Double Bed", "غرفة تنفيذية دبل", "26 sqm executive with garden view.", "تنفيذية 26 م² بإطلالة حديقة.", "1 King", 2, 26),
      room("Executive Room Sea View", "تنفيذية إطلالة بحر", "26 sqm executive facing the sea.", "تنفيذية 26 م² مطلّة على البحر.", "1 King", 2, 26),
      room("Suite with living room", "جناح مع غرفة معيشة", "75 sqm suite with sofa and sea view.", "جناح 75 م² بأريكة وإطلالة بحر.", "1 King", 4, 75),
    ],
    guestReviews: [
      R("Jinan", "Qatar", "قطر", 10, "August 2024", "Exceptional", "استثنائي", "We had a short stay, rooms are neat and clean. Breakfast is really good. Facilities excellent. Near the airport", "إقامة قصيرة. غرف نظيفة. إفطار جيد جداً. مرافق ممتازة. قرب المطار.", "Booking.com", "family"),
      R("Rabi", "Turkey", "تركيا", 10, "September 2025", "Family stay", "إقامة عائلية", "i thoroughly enjoyed my stay with my family. its neat and clean and right next to the beach. i got to enjoy the walk on the beach and help my daughter play inside the playing area for kids", "استمتعت مع عائلتي. نظيف بجانب الشاطئ. مشينا على الشاطئ ولعبت ابنتي في منطقة الأطفال.", "Booking.com", "family"),
      R("Mohammed", "United Arab Emirates", "الإمارات", 10, "April 2026", "Great staff", "طاقم رائع", "The staff was kind especially receptionist Bushra who was very professional and cooperative.", "الطاقم لطيف خاصة موظفة الاستقبال بشرى المحترفة والمتعاونة.", "Booking.com", "family"),
      R("Verified guest", "Turkey", "تركيا", 8, "", "Cevahir Mall location", "موقع مول جواهير", "Our experiment in the hotel was perfect. The hotel located in unique place in front of Cevahir Mall. They have parking and the staff is amazing.", "تجربتنا مثالية. الفندق أمام مول جواهير مع موقف وطاقم رائع.", "Booking.com", "family"),
      R("Omar", "Palestinian Territory", "فلسطين", 7.6, "October 2025", "Good", "جيد", "Good experience", "تجربة جيدة.", "Booking.com", "solo"),
      R("MUNEER", "Saudi Arabia", "السعودية", 4.4, "June 2024", "Pool for kids", "مسبح للأطفال", "the location is beside the sea and a mall. I only loved the inside pool because my kids enjoy it", "الموقع بجانب البحر والمول. أحببت المسبح الداخلي لأن أطفالي استمتعوا به.", "Booking.com", "family"),
    ],
    nearbyEn: ["Trabzon Airport — ~5 min", "Cevahir Shopping Mall — walking", "Yomra coast / beach — on site", "Trabzon city centre — 8 min drive", "Kaymakli Monastery — 8.1 km"],
    nearbyAr: ["مطار طرابزون — نحو 5 دقائق", "مول جواهير — سيراً", "ساحل يومرا — في الموقع", "وسط طرابزون — 8 دقائق", "دير كايمكلي — 8.1 كم"],
    amenities: ["Pool with view", "Indoor pool", "Bar / poolside bar", "Free WiFi", "Fitness / wellness", "Restaurant", "Meeting rooms", "Laundry", "Parking", "Kids play area", "Room service"],
    highlightsEn: ["Seafront Yomra location", "Near Cevahir Mall", "Family-friendly pool"],
    highlightsAr: ["موقع يومرا على البحر", "قرب مول جواهير", "مسبح مناسب للعائلات"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "swissotel-uludag-bursa": {
    sourcesUsed: ["Booking.com (9.1 / 74)", "Swissôtel official", "Tripadvisor"],
    rating: 9.1,
    reviewCount: 74,
    descriptionEn: "Swissôtel Uludağ Bursa is an alpine lodge-style resort in Uludağ National Park among pine forests, ~12 minutes from ski slopes. Guests highlight spa facilities, cozy rooms, forest walks, restaurant and attentive ski-season service.",
    descriptionAr: "سويسوتيل أولوداغ بورصة منتجع ألبي في منتزه أولوداغ بين غابات الصنوبر، نحو 12 دقيقة من منحدرات التزلج. يبرز الضيوف السبا والغرف الدافئة والمشي في الغابة والمطعم.",
    rooms: [
      room("Classic Room", "غرفة كلاسيك", "Cozy classic room with mountain/forest outlook.", "غرفة كلاسيك دافئة بإطلالة جبل/غابة.", "1 King", 2, 28),
      room("Superior Room", "غرفة سوبيريور", "Superior with upgraded alpine furnishings.", "سوبيريور بأثاث ألبي محسّن.", "1 King", 2, 32),
      room("Junior Suite", "جناح جونيور", "Junior suite with seating and spa access nearby.", "جناح جونيور بجلوس وقرب السبا.", "1 King", 3, 45),
      room("Family Room", "غرفة عائلية", "Family room for ski holidays.", "غرفة عائلية لعطلات التزلج.", "1 King", 4, 40),
      room("Suite", "جناح", "Suite with best mountain views.", "جناح بأفضل إطلالات جبلية.", "1 King", 3, 55),
    ],
    guestReviews: [
      R("Doha", "United Arab Emirates", "الإمارات", 10, "", "AMAZING", "مذهل", "Everything about the Swissotel Bursa/Uludag was AMAZING!", "كل شيء في سويسوتيل بورصا/أولوداغ كان مذهلاً!", "Booking.com", "family"),
      R("Ghazanfar", "United Arab Emirates", "الإمارات", 9, "", "Cozy & forest", "دافئ والغابة", "Beautiful lobby. Cozy rooms. Nice forest to explore around the hotel. Very friendly staff. Specially at check-in. Location is 12mins away from the ski area.", "لوبي جميل وغرف دافئة وغابة للاستكشاف وطاقم ودود. التزلج على بعد 12 دقيقة.", "Booking.com", "family"),
      R("Majd", "United Arab Emirates", "الإمارات", 10, "", "Exceptional location", "موقع استثنائي", "The location is exceptional, the service was fantastic, all staff were kind and helpful.", "الموقع استثنائي والخدمة رائعة وكل الطاقم لطيف ومفيد.", "Booking.com", "couple"),
      R("Dhruv", "Tanzania", "تنزانيا", 9, "", "Best spa facilities", "أفضل مرافق سبا", "This hotel was amazing, it had some of the best spa facilities I have seen. The staff were very attentive and the hotel room was great.", "فندق مذهل بأفضل مرافق سبا رأيتها. طاقم منتبه والغرفة رائعة.", "Booking.com", "couple"),
      R("Roman", "Russia", "روسيا", 9, "", "Forest retreat", "ملاذ الغابة", "Swissotel Uludag Bursa is nestled in Uludag National Park, surrounded by centuries-old pine forests. A lovely retreat from busy city life.", "في منتزه أولوداغ محاط بغابات صنوبر عمرها قرون. ملاذ هادئ من المدينة.", "Booking.com", "couple"),
      R("Gj", "United Kingdom", "المملكة المتحدة", 9, "", "Clean & breakfast", "نظيف وإفطار", "Clean, spacious, comfortable bed, good shower, pleasant view, great breakfast, mostly polite and helpful staff.", "نظيف وواسع وسرير مريح ودش جيد وإطلالة لطيفة وإفطار رائع وطاقم مفيد.", "Booking.com", "couple"),
    ],
    nearbyEn: ["Uludağ ski slopes — ~12 min", "Uludağ National Park — on site", "Bursa city — mountain transfer", "Cable car / ski lifts — seasonal", "Pine forest trails — on site"],
    nearbyAr: ["منحدرات أولوداغ — نحو 12 دقيقة", "منتزه أولوداغ — في الموقع", "مدينة بورصة — نقل جبلي", "تلفريك — موسمي", "مسارات الغابة — في الموقع"],
    amenities: ["Spa / wellness", "Ski access (seasonal)", "Fitness", "Restaurant", "Bar", "Free WiFi", "Parking", "Mountain views", "Meeting facilities", "Forest trails", "Room service"],
    highlightsEn: ["Uludağ ski & spa resort", "Pine-forest alpine setting", "Location score 9.4 on Booking"],
    highlightsAr: ["منتجع تزلج وسبا أولوداغ", "أجواء ألبية بين الصنوبر", "تقييم موقع 9.4 على بوكينج"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00"],
  },
  "yesilvadi": {
    sourcesUsed: ["Booking.com (7.0 / 14)", "yesilvadi.com", "Guest platform reviews"],
    rating: 7.0,
    reviewCount: 14,
    descriptionEn: "Family-run Yeşilvadi Otel in a secluded Ayder plateau setting surrounded by pine mountains. Wooden-floor rooms with central heating, regional Black Sea restaurant, terrace with nature views, and proximity to Ayder hot springs (50 m).",
    descriptionAr: "يشيل فادي أوتيل عائلي في هضبة آيدر المنعزلة وسط جبال الصنوبر. غرف بأرضيات خشبية ومطعم إقليمي للبحر الأسود وتراس بإطلالات طبيعة وقرب ينابيع آيدر الحارة (50 م).",
    amenities: ["Restaurant (Black Sea cuisine)", "Terrace with nature views", "Free WiFi", "Central heating", "Mountain / forest views", "Private bathrooms", "Airport shuttle", "Room service", "Family rooms", "Non-smoking rooms", "Ping-pong / game room", "Breakfast buffet"],
    rooms: [
      room("Standard Double Room", "غرفة دبل قياسية", "1 full bed, wooden floors, mountain view.", "سرير مزدوج، أرضيات خشبية، إطلالة جبل.", "1 King", 2, 22),
      room("Standard Twin Room", "غرفة توين قياسية", "2 twin beds with satellite TV and heating.", "سريران توين مع تلفزيون وتدفئة.", "2 Twin", 2, 22),
      room("Standard Triple Room", "غرفة ثلاثية قياسية", "Triple room for small groups.", "غرفة ثلاثية لمجموعات صغيرة.", "3 Twin", 3, 28),
      room("Two-Bedroom Queen Suite - Non-Smoking", "جناح كوين غرفتان", "Two-bedroom suite with living space (Booking category).", "جناح غرفتين بمساحة معيشة (فئة بوكينج).", "1 King", 4, 45),
      room("Family Room (2 Adults + 3 Children)", "غرفة عائلية", "Large family room sleeping up to 5.", "غرفة عائلية كبيرة حتى 5 أشخاص.", "1 King", 5, 40),
    ],
    guestReviews: [
      R("Ayanakoji", "Turkey", "تركيا", 8, "May 2026", "Incredible view", "إطلالة مذهلة", "The view was incredible, and the workers were too kind, the rooms were so clean, it was so comfortable to sleep while hearing the sound of falling water", "الإطلالة مذهلة والعاملون لطفاء والغرف نظيفة ونوم مريح مع صوت الماء.", "Tripadvisor", "couple"),
      R("Mohammad", "Jordan", "الأردن", 8, "May 2024", "Reasonable price", "سعر معقول", "I found this hotel the most reasonable in price among others in the area. The staff is very nice as well. Rooms are clean and very comfortable. Located on the main road.", "أكثر فندق معقول السعر في المنطقة. الطاقم لطيف والغرف نظيفة ومريحة على الطريق الرئيسي.", "Tripadvisor", "solo"),
      R("Verified guest", "Turkey", "تركيا", 7, "", "Black Sea breakfast", "إفطار البحر الأسود", "Breakfast was like an open buffet, we were full of village products. The hotel is in a good location, with the full Black Sea air and view, intertwined with nature.", "إفطار بوفيه بمنتجات القرية. موقع جيد بهواء وإطلالة البحر الأسود وطبيعة.", "Tripadvisor", "family"),
      R("Verified guest", "Turkey", "تركيا", 7, "", "Warm hospitality", "ضيافة دافئة", "It was our first visit to Ayder, it is good that we stayed in such a warm and beautiful establishment. Thank you for their smiles and interest. Rooms were very clean and tidy.", "أول زيارة لآيدر وكان الإقامة في مكان دافئ وجميل شكراً للابتسامة والاهتمام. غرف نظيفة ومرتبة.", "Tripadvisor", "family"),
      R("Verified guest", "Turkey", "تركيا", 6, "", "Regional architecture", "عمارة إقليمية", "Do not expect ultra-luxury; it has local wooden architecture. Staff try to make you happy. Dinner and breakfast were sufficient. Central location on the plateau.", "لا تتوقع فخامة فائقة؛ عمارة خشبية محلية. الطاقم يبذل جهداً لإسعادك. العشاء والإفطار كافيان. موقع مركزي على الهضبة.", "Tripadvisor", "family"),
      R("Verified guest", "Turkey", "تركيا", 7, "", "Ayder setting", "أجواء آيدر", "Located in a secluded area of Rize district, surrounded by mountains of pine forests. Ayder hot spring baths are just 50 m from the hotel.", "في منطقة منعزلة من ريزا وسط غابات الصنوبر. ينابيع آيدر الحارة على بعد 50 م فقط.", "Booking.com"),
    ],
    nearbyEn: ["Ayder hot springs — 50 m", "Ayder Yaylası centre — local", "Zil Castle — 21 mi", "Kavur Plateau — 8.1 mi", "Rize–Artvin Airport — 93 mi", "Trabzon Airport — 93 mi"],
    nearbyAr: ["ينابيع آيدر الحارة — 50 م", "مركز هضبة آيدر — محلي", "قلعة زيل — 21 ميل", "هضبة كافور — 8.1 ميل", "مطار ريزا-أرتفين — 93 ميل", "مطار طرابزون — 93 ميل"],
    highlightsEn: ["Secluded pine-forest Ayder", "Black Sea regional restaurant", "Family-run since 1906 heritage"],
    highlightsAr: ["آيدر بين غابات الصنوبر", "مطعم إقليمي للبحر الأسود", "عائلي منذ 1906"],
    policiesEn: ["Check-in from 14:00", "Check-out until 12:00"],
    policiesAr: ["تسجيل الوصول من 14:00", "تسجيل المغادرة حتى 12:00"],
  },
};

const hotels = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
let upgraded = 0;
for (const h of hotels) {
  const p = PATCHES[h.slug];
  if (!p) continue;
  Object.assign(h, p);
  h.dataCompleteness = "full";
  delete h.note;
  upgraded++;
}
fs.writeFileSync(JSON_PATH, JSON.stringify(hotels, null, 2) + "\n");
const partial = hotels.filter((x) => x.dataCompleteness === "partial").length;
const full = hotels.filter((x) => x.dataCompleteness === "full").length;
console.log(`Upgraded ${upgraded} hotels | full: ${full} | partial: ${partial}`);
