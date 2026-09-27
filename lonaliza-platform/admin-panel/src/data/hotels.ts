import type { Hotel, HotelInput, HotelGuestReview } from "@/types/hotel";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";
import { normalizeWhatsAppNumber } from "@/lib/utils";
import { cleanHotelDisplayName } from "@/lib/import-normalize";

/**
 * Nightly room rates are approximate 2024–2026 Turkey 4–5★ market prices in USD
 * (Istanbul luxury, Antalya resorts, Cappadocia cave hotels, Black Sea / Sapanca).
 * Not live booking quotes — admin can override per hotel.
 * Property copy / ratings / guestReviews merged from Booking.com & Tripadvisor real sources
 * via src/data/scraping/hotels/real-from-booking.json (see scripts/hotel-scraper/apply-real-hotel-data.mjs).
 */
const STORAGE_KEY = "alrayyan_hotels_v10";
const OLD_STORAGE_KEYS = [
  "alrayyan_hotels_v9",
  "alrayyan_hotels_v8",
  "alrayyan_hotels_v7",
  "alrayyan_hotels_v6",
  "alrayyan_hotels_v5",
  "alrayyan_hotels_v4",
  "alrayyan_hotels_v3",
  "oktravel_hotels_v2",
  "oktravel_hotels",
  "alrayyan_hotels_v2",
];
const DEFAULT_WA = DEFAULT_SITE_WHATSAPP;
const LEGACY_DEMO_WA = new Set(["971585255484", "9715852554840", "971525376367"]);

function resolveHotelWhatsApp(raw: unknown): string {
  const n = normalizeWhatsAppNumber(String(raw || ""));
  if (n && !LEGACY_DEMO_WA.has(n)) return n;
  return DEFAULT_WA;
}

export const defaultHotels: Hotel[] = [
  {
    "id": "1",
    "slug": "ciragan-palace-kempinski-istanbul",
    "nameAr": "قصر تشراغان كمبينسكي إسطنبول",
    "nameEn": "Çırağan Palace Kempinski Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "بشكتاش / البوسفور",
    "neighborhoodEn": "Beşiktaş / Bosphorus",
    "stars": 5,
    "rating": 9.4,
    "reviewCount": 570,
    "addressAr": "تشراغان جادسي 32، بشكتاش، 34349 إسطنبول، تركيا",
    "addressEn": "Çırağan Caddesi 32, Beşiktaş, 34349 Istanbul, Turkey",
    "descriptionAr": "بوصفه القصر العثماني الإمبراطوري الوحيد وفندق الخمس نجوم الفاخر على البوسفور، توفر غرفه الـ317 أجواء منتجع داخل المدينة. مع مساحات للفعاليات ومطاعم وبارات راقية، إضافة إلى مرافق السبا ومسبح لانهائي خارجي.",
    "descriptionEn": "As the only Ottoman imperial palace and luxury 5-star hotel on the Bosphorus, the 317 rooms offer a resort atmosphere in the city. With event space for every occasion and a delicious selection of restaurants and bars, the luxurious offering also includes spa facilities and an outdoor infinity pool.",
    "highlightsAr": [
      "القصر العثماني الوحيد كفندق على البوسفور",
      "مسبح لانهائي مطل على المضيق",
      "سبا سانيتاس مع حمّام تركي"
    ],
    "highlightsEn": [
      "Only Ottoman palace hotel on the Bosphorus",
      "Infinity pool overlooking the strait",
      "Sanitas Spa with hammam"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Outdoor infinity pool",
      "Indoor pool",
      "Sanitas Spa / Hammam",
      "Fitness center",
      "Free Wi-Fi",
      "Restaurants & bars",
      "Room service",
      "Valet parking",
      "Concierge",
      "Butler service"
    ],
    "nearbyAr": [
      "جسر البوسفور — 0.8 ميل",
      "حديقة يلدز — مسافة قصيرة سيراً",
      "أورتاكوي — مسافة قصيرة سيراً",
      "ميدان تقسيم — 1.7 ميل",
      "قصر دولماباهتشه — قريب"
    ],
    "nearbyEn": [
      "Bosphorus Bridge — 0.8 mi",
      "Yıldız Park — short walk",
      "Ortaköy — short walk",
      "Taksim Square — 1.7 mi",
      "Dolmabahçe Palace — nearby"
    ],
    "rooms": [
      {
        "id": "1-r1",
        "nameAr": "غرفة كينغ بإطلالة بوسفور تشراغان",
        "nameEn": "Ciragan Bosphorus View King Room",
        "descriptionAr": "King room with Bosphorus views (room type named on Booking.com guest reviews).",
        "descriptionEn": "King room with Bosphorus views (room type named on Booking.com guest reviews).",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 40,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "1-r2",
        "nameAr": "غرفة يلدز كينغ",
        "nameEn": "Yildiz King Room",
        "descriptionAr": "Yildiz King Room category listed on Booking.com reviews.",
        "descriptionEn": "Yildiz King Room category listed on Booking.com reviews.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 520,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "1-r1",
        "nameAr": "غرفة يلدز توين",
        "nameEn": "Yildiz Twin Room",
        "descriptionAr": "Twin configuration of the Yildiz room category.",
        "descriptionEn": "Twin configuration of the Yildiz room category.",
        "beds": "2 Twin",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 680,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "1-r1",
        "nameAr": "جناح القصر",
        "nameEn": "Palace Suite",
        "descriptionAr": "Historic palace suite category at Çırağan Palace Kempinski.",
        "descriptionEn": "Historic palace suite category at Çırağan Palace Kempinski.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 80,
        "price": 920,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "1-r1",
        "nameAr": "جناح الفندق",
        "nameEn": "Hotel Suite",
        "descriptionAr": "Hotel suite category within the palace hotel wing.",
        "descriptionEn": "Hotel suite category within the palace hotel wing.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 1200,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 41.00373871546168,
    "lng": 28.982924851401417,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00",
      "رقم الترخيص: 2530"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00",
      "License number: 2530"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في قصر تشراغان كمبينسكي إسطنبول",
    "whatsappMessageEn": "Hello, I would like to book at Çırağan Palace Kempinski Istanbul",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "1-gr1",
        "author": "Magdalena",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 9,
        "date": "27 April 2025",
        "titleAr": "رائع",
        "titleEn": "Wonderful",
        "textAr": "فندق جميل مطل على البوسفور. بوفيه الإفطار مذهل مع تشكيلة واسعة من الأطعمة اللذيذة.",
        "textEn": "Beautiful hotel, situated by the Bosphorus. The breakfast buffet was amazing with a wide variety of delicious food.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "1-gr2",
        "author": "Tuba",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 10,
        "date": "27 April 2025",
        "titleAr": "أفضل فندق على الإطلاق",
        "titleEn": "Best hotel ever",
        "textAr": "كل شيء كان مذهلاً! الخدمة الأفضل التي جربناها والموقع رائع.",
        "textEn": "Everything was spectacular! The service was the best we have experienced and the location is great.",
        "source": "Booking.com",
        "stayTypeAr": "مجموعة أصدقاء",
        "stayTypeEn": "People with friends"
      },
      {
        "id": "1-gr3",
        "author": "Shuaib",
        "countryAr": "جنوب أفريقيا",
        "countryEn": "South Africa",
        "rating": 10,
        "date": "26 April 2025",
        "titleAr": "أناقة سامية",
        "titleEn": "Sublime elegance",
        "textAr": "تشراغان لا يخذل. من البداية تحظى باهتمام كبير. الغرف مزينة بجمال… السبا رائع مع ساونا وغرفة بخار ومساج ومسبح داخلي. الإفطار أكثر من كافٍ… الكونسيرج مطلع وودود.",
        "textEn": "The Ciragan doesn’t fail in delivery. From the start you are doused with attention. The rooms are beautifully decorated… The Spa is also great with a sauna Steam room and massage facilities as well as an indoor pool. Breakfast was more than adequate… The concierge was knowledgeable and friendly.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "1-gr4",
        "author": "Kamilla",
        "countryAr": "أذربيجان",
        "countryEn": "Azerbaijan",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "إسطنبول مدينتي المفضلة وهذا فندقي المفضل. كانت تجربة ممتازة كالعادة! موقع الفندق والغرفة مريحة ونظيفة جداً. طاقم ودود جداً!",
        "textEn": "Istanbul is my lovely city and this hotel is my lovely hotel. And as everytime it was an excellent experience! The location of the hotel, the room is very comfortable and clean. Very friendly staff!",
        "source": "Booking.com",
        "stayTypeAr": "مسافر بمفرده",
        "stayTypeEn": "Solo traveller"
      },
      {
        "id": "1-gr5",
        "author": "Efe",
        "countryAr": "الإمارات العربية المتحدة",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "9 April 2025",
        "titleAr": "رائع جداً",
        "titleEn": "Superb",
        "textAr": "خدمة لا تشوبها شائبة. طاقم مفيد وذو خبرة ومنتبه. أفضل إفطار على الإطلاق",
        "textEn": "Impeccable, top-notch service. Very helpful, experienced and attentive staff. Best of the best breakfast",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "1-gr6",
        "author": "Shuaib",
        "countryAr": "South Africa",
        "countryEn": "South Africa",
        "rating": 10,
        "date": "26 April 2025",
        "titleAr": "Sublime elegance",
        "titleEn": "Sublime elegance",
        "textAr": "The Ciragan doesn’t fail in delivery. From the start you are doused with attention. The check in was seamless although when the Clark gave us options of other rooms we thought we were being upgraded a good marketing strategy it was not appreciated for such and establishment . The rooms are beautifully decorated with all the latest additions like usb ports. The bathroom is also great with all the amenities a nice addition would be a reed defuser with the signature Ciragen perfume this will add ambiance and make the bathroom smell sublime . The Spa is also great with a sauna Steam room and massage facilities as well as an indoor pool. The pool temperature was supposed to be 28 deg C but it was no where near that a bit of a disappointment so was the outdoor pool temperature not what was noted on the board. Breakfast was more than adequate and lots of options to suit anyone’s taste. The staf",
        "textEn": "The Ciragan doesn’t fail in delivery. From the start you are doused with attention. The check in was seamless although when the Clark gave us options of other rooms we thought we were being upgraded a good marketing strategy it was not appreciated for such and establishment . The rooms are beautifully decorated with all the latest additions like usb ports. The bathroom is also great with all the amenities a nice addition would be a reed defuser with the signature Ciragen perfume this will add ambiance and make the bathroom smell sublime . The Spa is also great with a sauna Steam room and massage facilities as well as an indoor pool. The pool temperature was supposed to be 28 deg C but it was no where near that a bit of a disappointment so was the outdoor pool temperature not what was noted on the board. Breakfast was more than adequate and lots of options to suit anyone’s taste. The staf",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr7",
        "author": "Leyla",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 10,
        "date": "20 April 2025",
        "titleAr": "If you want to stay in comfort and receive high-quality service, this hotel is the only one in Istanbul where you shoul",
        "titleEn": "If you want to stay in comfort and receive high-quality service, this hotel is the only one in Istanbul where you shoul",
        "textAr": "The view, personnel, breakfast, facilities, just everything.",
        "textEn": "The view, personnel, breakfast, facilities, just everything.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr8",
        "author": "Jean-pierre",
        "countryAr": "Japan",
        "countryEn": "Japan",
        "rating": 9,
        "date": "16 April 2025",
        "titleAr": "A wonderful experience",
        "titleEn": "A wonderful experience",
        "textAr": "Nothing really except a bit too expensive Location was superb and interior decoration was really nice",
        "textEn": "Nothing really except a bit too expensive Location was superb and interior decoration was really nice",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr9",
        "author": "Elizabeth",
        "countryAr": "Australia",
        "countryEn": "Australia",
        "rating": 10,
        "date": "14 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The staff were exceptional",
        "textEn": "The staff were exceptional",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr10",
        "author": "Kamilla",
        "countryAr": "Azerbaijan",
        "countryEn": "Azerbaijan",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Hello, everyone! So, first of all I can say that it is not my first time staying in this hotel. Istanbul is my lovely city and this hotel is my lovely hotel. And as everytime it was an excellent experience! The location of the hotel, the room is very comfortable and clean. Very friendly staff! As always! Beside it I would like to thank Ms. Esra, who was very friendly and helpful during my stay!",
        "textEn": "Hello, everyone! So, first of all I can say that it is not my first time staying in this hotel. Istanbul is my lovely city and this hotel is my lovely hotel. And as everytime it was an excellent experience! The location of the hotel, the room is very comfortable and clean. Very friendly staff! As always! Beside it I would like to thank Ms. Esra, who was very friendly and helpful during my stay!",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr11",
        "author": "Efe",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "9 April 2025",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "SPA is not up to hotel’s standards. Water in the indoor pool was cold despite they claim that it is heated. Outdoor pool was more bearable in 6 degree celsius! They sold us a kid swimsuit 10 times of its original price. Of course, Cıragan should add a mark up but the swimsuit is low quality with H&M brand on. Impeccable, top-notch service. Very helpful, experienced and attentive staff. Best of the best breakfast",
        "textEn": "SPA is not up to hotel’s standards. Water in the indoor pool was cold despite they claim that it is heated. Outdoor pool was more bearable in 6 degree celsius! They sold us a kid swimsuit 10 times of its original price. Of course, Cıragan should add a mark up but the swimsuit is low quality with H&M brand on. Impeccable, top-notch service. Very helpful, experienced and attentive staff. Best of the best breakfast",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr12",
        "author": "Ameera",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "7 April 2025",
        "titleAr": "أنصحكم تحجزونوتستمعونفالقصر",
        "titleEn": "أنصحكم تحجزونوتستمعونفالقصر",
        "textAr": "I was wonderful stay and experience I really love it so much 🩷💗💗💗Stayed in April 2025",
        "textEn": "I was wonderful stay and experience I really love it so much 🩷💗💗💗Stayed in April 2025",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr13",
        "author": "Ahmad",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 10,
        "date": "6 April 2025",
        "titleAr": "Magical stay",
        "titleEn": "Magical stay",
        "textAr": "My stay at Çırağan Palace Kempinski was truly exceptional. From the moment I stepped into the palace, I felt transported —the blend of historical grandeur and modern luxury is unmatched. The staff were welcoming, attentive, and always ready to help, making me feel like a valued guest every step of the way. A special highlight of my visit was dining at Tuğra Restaurant. It’s hard to put into words how beautiful the setting is —dining in an actual Ottoman palace, with breathtaking views of the Bosphorus, was a once-in-a-lifetime experience. The food was absolutely divine —every dish was a perfect balance of tradition and creativity. The presentation, the flavors, the service —all flawless. It was easily one of the best meals I’ve had, not just in Istanbul, but anywhere in the world. If you’re visiting Istanbul and want to experience true elegance, Çırağan Palace is the place. And don’t mis",
        "textEn": "My stay at Çırağan Palace Kempinski was truly exceptional. From the moment I stepped into the palace, I felt transported —the blend of historical grandeur and modern luxury is unmatched. The staff were welcoming, attentive, and always ready to help, making me feel like a valued guest every step of the way. A special highlight of my visit was dining at Tuğra Restaurant. It’s hard to put into words how beautiful the setting is —dining in an actual Ottoman palace, with breathtaking views of the Bosphorus, was a once-in-a-lifetime experience. The food was absolutely divine —every dish was a perfect balance of tradition and creativity. The presentation, the flavors, the service —all flawless. It was easily one of the best meals I’ve had, not just in Istanbul, but anywhere in the world. If you’re visiting Istanbul and want to experience true elegance, Çırağan Palace is the place. And don’t mis",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr14",
        "author": "Dominika",
        "countryAr": "Luxembourg",
        "countryEn": "Luxembourg",
        "rating": 10,
        "date": "25 March 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "No complaints, everything was great Overall a fantastic hotel. Great breakfast, restaurant (we tried Tugra), and bar. The sauna facilities were very pleasant, and staff is very helpful.",
        "textEn": "No complaints, everything was great Overall a fantastic hotel. Great breakfast, restaurant (we tried Tugra), and bar. The sauna facilities were very pleasant, and staff is very helpful.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr15",
        "author": "Stephan",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 10,
        "date": "24 March 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "All my expectations were met.",
        "textEn": "All my expectations were met.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr16",
        "author": "German",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 8,
        "date": "21 March 2025",
        "titleAr": "Great hotel!",
        "titleEn": "Great hotel!",
        "textAr": "The access to the palace is locked up and you need to request access, the sea gates are under restoration so that steals away from the property beauty. The crew was fantastic and the location at the Bosphorous was great.",
        "textEn": "The access to the palace is locked up and you need to request access, the sea gates are under restoration so that steals away from the property beauty. The crew was fantastic and the location at the Bosphorous was great.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr17",
        "author": "Daniel",
        "countryAr": "Romania",
        "countryEn": "Romania",
        "rating": 10,
        "date": "13 March 2025",
        "titleAr": "Fabulous place",
        "titleEn": "Fabulous place",
        "textAr": "Kempinski Hotel, you could easily change the name to ‘Heaven on Earth’ Hotel. State of art hotel, impressive reception, restaurants, rooms, facilities, garden, Bosphorus view and last but not least, the Palace. Love the surprise for my wife, great breakfast and dining options.",
        "textEn": "Kempinski Hotel, you could easily change the name to ‘Heaven on Earth’ Hotel. State of art hotel, impressive reception, restaurants, rooms, facilities, garden, Bosphorus view and last but not least, the Palace. Love the surprise for my wife, great breakfast and dining options.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr18",
        "author": "Borislav",
        "countryAr": "Bulgaria",
        "countryEn": "Bulgaria",
        "rating": 10,
        "date": "11 March 2025",
        "titleAr": "The best in Istanbul",
        "titleEn": "The best in Istanbul",
        "textAr": "Location, architecture, view, palace, exceptional service",
        "textEn": "Location, architecture, view, palace, exceptional service",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr19",
        "author": "Plamen",
        "countryAr": "Bulgaria",
        "countryEn": "Bulgaria",
        "rating": 10,
        "date": "9 March 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The hotel is wonderful. The breakfast was plentiful, satisfying all requirements. The staff was very helpful. Our room was very large with a breathtaking view of the Bosphorus.",
        "textEn": "The hotel is wonderful. The breakfast was plentiful, satisfying all requirements. The staff was very helpful. Our room was very large with a breathtaking view of the Bosphorus.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr20",
        "author": "Issam",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "3 March 2025",
        "titleAr": "It was a very enjoyable stay, the staff were very friendly and helpful specially the manger Mr Mesut Erbas and his team.",
        "titleEn": "It was a very enjoyable stay, the staff were very friendly and helpful specially the manger Mr Mesut Erbas and his team.",
        "textAr": "Location, ambiance, staff etc …Stayed in February 2025",
        "textEn": "Location, ambiance, staff etc …Stayed in February 2025",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr21",
        "author": "Holito0o",
        "countryAr": "Kuwait",
        "countryEn": "Kuwait",
        "rating": 10,
        "date": "1 March 2025",
        "titleAr": "Pice of heaven",
        "titleEn": "Pice of heaven",
        "textAr": "Nothing Everything was amazing The room amazing clean and comfortable , wonderful view , royal service , great location, the staff was friendly and very professional , really enjoyed and definitely i will back again in my future visit .",
        "textEn": "Nothing Everything was amazing The room amazing clean and comfortable , wonderful view , royal service , great location, the staff was friendly and very professional , really enjoyed and definitely i will back again in my future visit .",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr22",
        "author": "Manuel",
        "countryAr": "Angola",
        "countryEn": "Angola",
        "rating": 10,
        "date": "23 February 2025",
        "titleAr": "No words , awesome that’s why I will come back",
        "titleEn": "No words , awesome that’s why I will come back",
        "textAr": "Other guests look at me with despise, but it is understandable, some looked with admiration. All the crew/ team were extraordinarily kind",
        "textEn": "Other guests look at me with despise, but it is understandable, some looked with admiration. All the crew/ team were extraordinarily kind",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr23",
        "author": "Abdullah",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "22 February 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Very good location and nice view. [Next page](https://www.booking.com/reviews/tr/hotel/ciragan-palace-kempinski-istanbul.en-gb.html?label=gen173nr-1FCA0o5AFCIWNpcmFnYW4tcGFsYWNlLWtlbXBpbnNraS1pc3RhbmJ1bEgJWARoTYgBAZgBCbgBB8gBDdgBAegBAfgBAogCAagCA7gCr67HwAbAAgHSAiRmNTUyNTdhYS02ZTk1LTQ3YmQtYWNmMy0yNjVlNzc2ZjUzZWXYAgXgAgE&sid=500c71916607dd110e8eafc251f4d4b0&customer_type=total&hp_nav=0&old_page=0&order=featuredreviews&page=2&r_lang=en&rows=75&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! ### Guests also reviewed these properties: [Boomerang Blackpool](https://www.booking.com/reviews/gb/hotel/lindan.en-gb.html?label=gen173nr-1FCA0o5AFCIWNpcmFnYW4tcGFsYWNlLWtlbXBpbnNraS1pc3RhbmJ1bEgJWARoTYgBAZgBCbgBB8gBDdgBAegBAfgBAogCAagCA7gCr67HwAbAAgHSAiRmNTUyNTdhYS02ZTk1LTQ3YmQtYWNmMy0yNjVlNzc2ZjUzZWXYAgXgAgE&sid=500c71916607dd110e8eafc251f4d4b0) [Novella Italy](https://www",
        "textEn": "Very good location and nice view. [Next page](https://www.booking.com/reviews/tr/hotel/ciragan-palace-kempinski-istanbul.en-gb.html?label=gen173nr-1FCA0o5AFCIWNpcmFnYW4tcGFsYWNlLWtlbXBpbnNraS1pc3RhbmJ1bEgJWARoTYgBAZgBCbgBB8gBDdgBAegBAfgBAogCAagCA7gCr67HwAbAAgHSAiRmNTUyNTdhYS02ZTk1LTQ3YmQtYWNmMy0yNjVlNzc2ZjUzZWXYAgXgAgE&sid=500c71916607dd110e8eafc251f4d4b0&customer_type=total&hp_nav=0&old_page=0&order=featuredreviews&page=2&r_lang=en&rows=75&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! ### Guests also reviewed these properties: [Boomerang Blackpool](https://www.booking.com/reviews/gb/hotel/lindan.en-gb.html?label=gen173nr-1FCA0o5AFCIWNpcmFnYW4tcGFsYWNlLWtlbXBpbnNraS1pc3RhbmJ1bEgJWARoTYgBAZgBCbgBB8gBDdgBAegBAfgBAogCAagCA7gCr67HwAbAAgHSAiRmNTUyNTdhYS02ZTk1LTQ3YmQtYWNmMy0yNjVlNzc2ZjUzZWXYAgXgAgE&sid=500c71916607dd110e8eafc251f4d4b0) [Novella Italy](https://www",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr24",
        "author": "Khubaib",
        "countryAr": "Italy",
        "countryEn": "Italy",
        "rating": 10,
        "date": "27 April 2025",
        "titleAr": "Amazing Experience",
        "titleEn": "Amazing Experience",
        "textAr": "The swimming pool could have been warmer. Amazing location right next to Taksim Square. The hotel itself is very well equipped, and there was a very nice vibe all around. The view of the Bosphorus from all the rooftop restaurants was breathtaking, especially at night. The breakfast was exceptional with ample choice for every taste. In short, my family and I thoroughly enjoyed our stay, and it would be our place of choice for any future trips to the wonderful city of Istanbul. Special thanks to Suzan Evgiloğlu and Seyit Taha for their welcome and assistance",
        "textEn": "The swimming pool could have been warmer. Amazing location right next to Taksim Square. The hotel itself is very well equipped, and there was a very nice vibe all around. The view of the Bosphorus from all the rooftop restaurants was breathtaking, especially at night. The breakfast was exceptional with ample choice for every taste. In short, my family and I thoroughly enjoyed our stay, and it would be our place of choice for any future trips to the wonderful city of Istanbul. Special thanks to Suzan Evgiloğlu and Seyit Taha for their welcome and assistance",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr25",
        "author": "Dr",
        "countryAr": "Cyprus",
        "countryEn": "Cyprus",
        "rating": 10,
        "date": "27 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "It was amazing 👏🤩Stayed in April 2025",
        "textEn": "It was amazing 👏🤩Stayed in April 2025",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr26",
        "author": "Nas",
        "countryAr": "Bulgaria",
        "countryEn": "Bulgaria",
        "rating": 8,
        "date": "26 April 2025",
        "titleAr": "Very g",
        "titleEn": "Very g",
        "textAr": "We were upgraded because we found ants in our bathroom. We were asked to wear caps in the swimming pool, which i did not see on the booking.com info. They charge us 7 euros for caps, which is not a lot, but it felt cheap and the actual caps were very cheap and fabric. The room service prices were a bit crazy, 30 euro for a Margarita pizza. On the last day we had go early and went to breakfast at 06:30, and there was just 1 person serving 10 tables and just 1 chef, also on the buffet some of the food (vegetables) was old from the previous day and some was missing. A 5-star establishment must keep its level all the time. The staff (reception, cleaning, parking, breakfast) is very nice and polite. We were upgraded from the 1st to the 8th executive floor. The breakfast was nice and we were lucky to get a table looking at the Bosphorus. The location is just next to Taksim square. You can get ",
        "textEn": "We were upgraded because we found ants in our bathroom. We were asked to wear caps in the swimming pool, which i did not see on the booking.com info. They charge us 7 euros for caps, which is not a lot, but it felt cheap and the actual caps were very cheap and fabric. The room service prices were a bit crazy, 30 euro for a Margarita pizza. On the last day we had go early and went to breakfast at 06:30, and there was just 1 person serving 10 tables and just 1 chef, also on the buffet some of the food (vegetables) was old from the previous day and some was missing. A 5-star establishment must keep its level all the time. The staff (reception, cleaning, parking, breakfast) is very nice and polite. We were upgraded from the 1st to the 8th executive floor. The breakfast was nice and we were lucky to get a table looking at the Bosphorus. The location is just next to Taksim square. You can get ",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr27",
        "author": "Mohamad",
        "countryAr": "Lebanon",
        "countryEn": "Lebanon",
        "rating": 10,
        "date": "26 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "we need to inform abt breakfast its perfect but u hv noise pollution they need to work on decreasing the noise as much possible into the breakfast area",
        "textEn": "we need to inform abt breakfast its perfect but u hv noise pollution they need to work on decreasing the noise as much possible into the breakfast area",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr28",
        "author": "Emma",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "24 April 2025",
        "titleAr": "Faultless service, beautiful hotel, extortionate mini bar prices",
        "titleEn": "Faultless service, beautiful hotel, extortionate mini bar prices",
        "textAr": "Mini bar hugely overpriced, small Pringles type crisps £10, small bottle of red £30! Beautiful hotel with fabulous views in a great area of the city",
        "textEn": "Mini bar hugely overpriced, small Pringles type crisps £10, small bottle of red £30! Beautiful hotel with fabulous views in a great area of the city",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr29",
        "author": "Ana",
        "countryAr": "Croatia",
        "countryEn": "Croatia",
        "rating": 10,
        "date": "24 April 2025",
        "titleAr": "Great hotel!",
        "titleEn": "Great hotel!",
        "textAr": "The location is great, next to Taksim. The room was spacious and quiet for sleeping. Very tidy and clean. The staff was very helpful. Lovely spa and hammam.",
        "textEn": "The location is great, next to Taksim. The room was spacious and quiet for sleeping. Very tidy and clean. The staff was very helpful. Lovely spa and hammam.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr30",
        "author": "Mariam",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 8,
        "date": "22 April 2025",
        "titleAr": "Very g",
        "titleEn": "Very g",
        "textAr": "No sound isolation’s in the room, Location, cleanliness",
        "textEn": "No sound isolation’s in the room, Location, cleanliness",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr31",
        "author": "Lana",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 9,
        "date": "22 April 2025",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "Location, comfortable room.",
        "textEn": "Location, comfortable room.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr32",
        "author": "Mansoor",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 8,
        "date": "22 April 2025",
        "titleAr": "Enjoyable",
        "titleEn": "Enjoyable",
        "textAr": "Beds were uncomfortable and so was the lounge furniture.",
        "textEn": "Beds were uncomfortable and so was the lounge furniture.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr33",
        "author": "Judith",
        "countryAr": "Germany",
        "countryEn": "Germany",
        "rating": 8,
        "date": "21 April 2025",
        "titleAr": "A good location to visit Istanbul - nice and quiet too!",
        "titleEn": "A good location to visit Istanbul - nice and quiet too!",
        "textAr": "The location was ideal - a quick walk down the hill and we were able to get on public transport!",
        "textEn": "The location was ideal - a quick walk down the hill and we were able to get on public transport!",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr34",
        "author": "Rawan",
        "countryAr": "Kuwait",
        "countryEn": "Kuwait",
        "rating": 10,
        "date": "20 April 2025",
        "titleAr": "Amazing",
        "titleEn": "Amazing",
        "textAr": "My stay was absolutely amazing—truly beyond words. It’s one of the most comfortable hotels I’ve ever stayed in, especially during a time when I needed comfort the most. I genuinely didn’t feel the need to go out; I was enjoying every moment within the hotel itself. I was lucky to have a room with access to the executive lounge, which offered a wide variety of food throughout the day. Breakfast was a highlight on its own, with a different selection of dishes every morning. The staff were exceptionally professional and knowledgeable. I initially booked for five days, but ended up extending my stay by another three days simply because the experience was that good.",
        "textEn": "My stay was absolutely amazing—truly beyond words. It’s one of the most comfortable hotels I’ve ever stayed in, especially during a time when I needed comfort the most. I genuinely didn’t feel the need to go out; I was enjoying every moment within the hotel itself. I was lucky to have a room with access to the executive lounge, which offered a wide variety of food throughout the day. Breakfast was a highlight on its own, with a different selection of dishes every morning. The staff were exceptionally professional and knowledgeable. I initially booked for five days, but ended up extending my stay by another three days simply because the experience was that good.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr35",
        "author": "John",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 10,
        "date": "20 April 2025",
        "titleAr": "Highly recommend the 3 bedroom apartment with executive lounge access for multigenerational trip or a friend trip.",
        "titleEn": "Highly recommend the 3 bedroom apartment with executive lounge access for multigenerational trip or a friend trip.",
        "textAr": "Location, location, location. Amazing staff. Executive lounges worth every penny. No complaints.",
        "textEn": "Location, location, location. Amazing staff. Executive lounges worth every penny. No complaints.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr36",
        "author": "Mohammed",
        "countryAr": "Philippines",
        "countryEn": "Philippines",
        "rating": 10,
        "date": "17 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "We like the overall service and facilities..sassan is so helpful with everything.",
        "textEn": "We like the overall service and facilities..sassan is so helpful with everything.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr37",
        "author": "Andy",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "16 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The terrace staff were rude and when we turned up to see the terrace the hostess judged us on our clothes and then changed their attitude when we gave them our room number. Staff were incredible especially the restaurant staff and concierge",
        "textEn": "The terrace staff were rude and when we turned up to see the terrace the hostess judged us on our clothes and then changed their attitude when we gave them our room number. Staff were incredible especially the restaurant staff and concierge",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr38",
        "author": "Ali",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "16 April 2025",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "It was great experience. Many thanks to Berkan at reception.",
        "textEn": "It was great experience. Many thanks to Berkan at reception.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr39",
        "author": "Ayesha",
        "countryAr": "Canada",
        "countryEn": "Canada",
        "rating": 9,
        "date": "13 April 2025",
        "titleAr": "Highly recommende",
        "titleEn": "Highly recommende",
        "textAr": "Great location and very courtyard friendly staff.",
        "textEn": "Great location and very courtyard friendly staff.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr40",
        "author": "Mohammed",
        "countryAr": "Oman",
        "countryEn": "Oman",
        "rating": 10,
        "date": "12 April 2025",
        "titleAr": "My stay was so beautiful and pleasant.starting from check in with great hospitality from stuff member Ms Sukeran who he",
        "titleEn": "My stay was so beautiful and pleasant.starting from check in with great hospitality from stuff member Ms Sukeran who he",
        "textAr": "The great hospitality of the reception stuff specially Ms. Sukeran who was so really supportive and facilitated very easy check in and extension. Everything in the hotel were impressive",
        "textEn": "The great hospitality of the reception stuff specially Ms. Sukeran who was so really supportive and facilitated very easy check in and extension. Everything in the hotel were impressive",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr41",
        "author": "Christophe",
        "countryAr": "France",
        "countryEn": "France",
        "rating": 10,
        "date": "12 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "We like the hotel , high level of service thanks to Berkan and Esra and Doa and Ozgur",
        "textEn": "We like the hotel , high level of service thanks to Berkan and Esra and Doa and Ozgur",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr42",
        "author": "Abdulaziz",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The stay was amazing and we love it and beskan sasmaz was amazing he asset us very well",
        "textEn": "The stay was amazing and we love it and beskan sasmaz was amazing he asset us very well",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr43",
        "author": "ياسرSaudi Arabia",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "I am so happy thank you all Mr Berkan thanks it was indeed unforgettable days at hotel",
        "textEn": "I am so happy thank you all Mr Berkan thanks it was indeed unforgettable days at hotel",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr44",
        "author": "Abeer",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "10 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "[Next page](https://www.booking.com/reviews/tr/hotel/cvk-hotels-resorts-park-bosphorus.en-gb.html?page=2&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! ### Guests also reviewed these properties: [Arabia Hotel](https://www.booking.com/reviews/eg/hotel/arabia.en-gb.html) [Boutique Hotel Diana](https://www.booking.com/reviews/it/hotel/diana-madonna-di-campiglio.en-gb.html) Madonna di Campiglio, Italy [Le Moulin Page](https://www.booking.com/reviews/fr/hotel/le-moulin-page.en-gb.html) [Milorava&#39;s Guest House & Wine Cellar](https://www.booking.com/reviews/ge/hotel/milorava.en-gb.html) [Cam Tu Cau Hotel](https://www.booking.com/reviews/vn/hotel/cam-tu-cau.en-gb.html) [Apartments Mertelj](https://www.booking.com/reviews/si/hotel/apartmaji-mertelj-kranjska-gora.en-gb.html) Kranjska Gora, Slovenia [OYO Premium Infopark](https://www.booking.com/reviews/in/hotel/oy",
        "textEn": "[Next page](https://www.booking.com/reviews/tr/hotel/cvk-hotels-resorts-park-bosphorus.en-gb.html?page=2&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! ### Guests also reviewed these properties: [Arabia Hotel](https://www.booking.com/reviews/eg/hotel/arabia.en-gb.html) [Boutique Hotel Diana](https://www.booking.com/reviews/it/hotel/diana-madonna-di-campiglio.en-gb.html) Madonna di Campiglio, Italy [Le Moulin Page](https://www.booking.com/reviews/fr/hotel/le-moulin-page.en-gb.html) [Milorava&#39;s Guest House & Wine Cellar](https://www.booking.com/reviews/ge/hotel/milorava.en-gb.html) [Cam Tu Cau Hotel](https://www.booking.com/reviews/vn/hotel/cam-tu-cau.en-gb.html) [Apartments Mertelj](https://www.booking.com/reviews/si/hotel/apartmaji-mertelj-kranjska-gora.en-gb.html) Kranjska Gora, Slovenia [OYO Premium Infopark](https://www.booking.com/reviews/in/hotel/oy",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr45",
        "author": "Guy",
        "countryAr": "Belgium",
        "countryEn": "Belgium",
        "rating": 10,
        "date": "22 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Luxury class. Friendly staff, perfect location",
        "textEn": "Luxury class. Friendly staff, perfect location",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr46",
        "author": "Vuk",
        "countryAr": "Serbia",
        "countryEn": "Serbia",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "Love this Hotel",
        "titleEn": "Love this Hotel",
        "textAr": "This hotel is one of my favorite i have ever stayed in. Location and view are amazing. Do not let me start about food.. woow. Truly 5 diamonds not stars.",
        "textEn": "This hotel is one of my favorite i have ever stayed in. Location and view are amazing. Do not let me start about food.. woow. Truly 5 diamonds not stars.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr47",
        "author": "Walid",
        "countryAr": "Algeria",
        "countryEn": "Algeria",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "Excellent location, we had a great stay.",
        "titleEn": "Excellent location, we had a great stay.",
        "textAr": "Wonderful location, Friendly staff, Very comfortable bed. Honestly I cannot think of any negative remark about this hotel.",
        "textEn": "Wonderful location, Friendly staff, Very comfortable bed. Honestly I cannot think of any negative remark about this hotel.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr48",
        "author": "Rodney",
        "countryAr": "South Africa",
        "countryEn": "South Africa",
        "rating": 10,
        "date": "23 March 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The room was super private and comfy. The staff were super awesome.",
        "textEn": "The room was super private and comfy. The staff were super awesome.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr49",
        "author": "Navneet",
        "countryAr": "India",
        "countryEn": "India",
        "rating": 10,
        "date": "17 February 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The location was fabulous. The service fantastic. Everything was perfect",
        "textEn": "The location was fabulous. The service fantastic. Everything was perfect",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr50",
        "author": "Paola",
        "countryAr": "Brazil",
        "countryEn": "Brazil",
        "rating": 10,
        "date": "4 January 2025",
        "titleAr": "Perfect!!",
        "titleEn": "Perfect!!",
        "textAr": "It is our preferred location when we are visiting Istanbul.",
        "textEn": "It is our preferred location when we are visiting Istanbul.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr51",
        "author": "Ji",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "12 November 2024",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "Location, friendly, sensible and kind staff, great food",
        "textEn": "Location, friendly, sensible and kind staff, great food",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr52",
        "author": "Violet",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "3 November 2024",
        "titleAr": "It was a blissful stay.",
        "titleEn": "It was a blissful stay.",
        "textAr": "Absolutely everything; the staff, facilities, food, location; so welcoming, warm, friendly, courteous and professional.",
        "textEn": "Absolutely everything; the staff, facilities, food, location; so welcoming, warm, friendly, courteous and professional.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr53",
        "author": "Lana",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "30 September 2024",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "Staff were friendly and the property was beautiful - the setting especially",
        "textEn": "Staff were friendly and the property was beautiful - the setting especially",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr54",
        "author": "Haifa",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "6 September 2024",
        "titleAr": "It was pleasant and memorable",
        "titleEn": "It was pleasant and memorable",
        "textAr": "The rooms are old and I can hear everything in the corridor The outdoor dining area, the smell of the hotel and the floral arrangement. The spa was great but also old and needs to be renewed.",
        "textEn": "The rooms are old and I can hear everything in the corridor The outdoor dining area, the smell of the hotel and the floral arrangement. The spa was great but also old and needs to be renewed.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr55",
        "author": "Mauricio",
        "countryAr": "Mexico",
        "countryEn": "Mexico",
        "rating": 10,
        "date": "20 August 2024",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "or room was not ready when we got there, it was already past 15:00 bell boy were not helpful at parking, and they barely speak english we had to use google translate to comunicate amazing property and very friendly pool staff",
        "textEn": "or room was not ready when we got there, it was already past 15:00 bell boy were not helpful at parking, and they barely speak english we had to use google translate to comunicate amazing property and very friendly pool staff",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr56",
        "author": "Teiu",
        "countryAr": "Romania",
        "countryEn": "Romania",
        "rating": 10,
        "date": "12 August 2024",
        "titleAr": "Probably among the best hotels in Istanbul",
        "titleEn": "Probably among the best hotels in Istanbul",
        "textAr": "In my humble opinion the rooms although clean and nice are still not at the same level of luxury as the lobby and other spaces inside and outside the hotel. Also the quality of the food could be improved. I'm not saying that is bad but is not so tasty as it should be for such a hotel. The property is stunning with nice green areas, awesome swimming pool and very polite personnel.",
        "textEn": "In my humble opinion the rooms although clean and nice are still not at the same level of luxury as the lobby and other spaces inside and outside the hotel. Also the quality of the food could be improved. I'm not saying that is bad but is not so tasty as it should be for such a hotel. The property is stunning with nice green areas, awesome swimming pool and very polite personnel.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr57",
        "author": "Juliana",
        "countryAr": "Uganda",
        "countryEn": "Uganda",
        "rating": 10,
        "date": "30 July 2024",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Everything and the personalised service.",
        "textEn": "Everything and the personalised service.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr58",
        "author": "Juliana",
        "countryAr": "Uganda",
        "countryEn": "Uganda",
        "rating": 10,
        "date": "30 July 2024",
        "titleAr": "Personalised and highly professional service - going over, above and beyond!",
        "titleEn": "Personalised and highly professional service - going over, above and beyond!",
        "textAr": "ABSOLUTELY NO DISLIKES - just a note.... if your not up for in-room dining, you need to always reserve a table at the restaurants for dinner before 6pm on the terrace daily. Luckily, we always managed to get one - but sometimes if you felt up to terrace dining and hadn't reserved, this could be challenging. We had a fantastic time here! The hotel is fantastic and surpassed our expectations. They really went over, above and beyond...you know that feeling where a hotel does so much that you feel you \"owe them money\" because you used up and finished what you initially paid! Everyone seemed to full understand their job descriptions and boy did they deliver on these! From the bell boys who were so quick, helpful and polite, to the concierge service - they seemed to make anything and everything possible...they found what couldn't be found! They really went the extra mile to ensure they met eve",
        "textEn": "ABSOLUTELY NO DISLIKES - just a note.... if your not up for in-room dining, you need to always reserve a table at the restaurants for dinner before 6pm on the terrace daily. Luckily, we always managed to get one - but sometimes if you felt up to terrace dining and hadn't reserved, this could be challenging. We had a fantastic time here! The hotel is fantastic and surpassed our expectations. They really went over, above and beyond...you know that feeling where a hotel does so much that you feel you \"owe them money\" because you used up and finished what you initially paid! Everyone seemed to full understand their job descriptions and boy did they deliver on these! From the bell boys who were so quick, helpful and polite, to the concierge service - they seemed to make anything and everything possible...they found what couldn't be found! They really went the extra mile to ensure they met eve",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr59",
        "author": "Fahimeh",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 9,
        "date": "22 July 2024",
        "titleAr": "Still the best hotel in Istanbul.",
        "titleEn": "Still the best hotel in Istanbul.",
        "textAr": "Restaurants are all outdoors without any cooling systems and they are not allowed to serve anything in the lobby which caused problems for us. Especially since we had alast minutes official meet up in the lobby. Staff politeness and helpfulness.",
        "textEn": "Restaurants are all outdoors without any cooling systems and they are not allowed to serve anything in the lobby which caused problems for us. Especially since we had alast minutes official meet up in the lobby. Staff politeness and helpfulness.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr60",
        "author": "Mai",
        "countryAr": "Qatar",
        "countryEn": "Qatar",
        "rating": 10,
        "date": "13 May 2024",
        "titleAr": "I will definitely stay there again",
        "titleEn": "I will definitely stay there again",
        "textAr": "location was perfect, luxurious, and very friendly employees",
        "textEn": "location was perfect, luxurious, and very friendly employees",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr61",
        "author": "Amna",
        "countryAr": "Qatar",
        "countryEn": "Qatar",
        "rating": 10,
        "date": "12 April 2024",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The hotel & rooms are quite old Best location & best food",
        "textEn": "The hotel & rooms are quite old Best location & best food",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr62",
        "author": "Nabeel",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "24 February 2024",
        "titleAr": "Fantastic stay option at Istanbul!",
        "titleEn": "Fantastic stay option at Istanbul!",
        "textAr": "Nothing comes to mind The attention to details and high quality is quite apparent from entry and welcoming to departure. Great facilities and view. Quiet and relaxing. Excellent location both facing the Bosphorus and walking distance from Ortakoy and Beskitas.",
        "textEn": "Nothing comes to mind The attention to details and high quality is quite apparent from entry and welcoming to departure. Great facilities and view. Quiet and relaxing. Excellent location both facing the Bosphorus and walking distance from Ortakoy and Beskitas.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "1-gr63",
        "author": "Shafia",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "1 January 2024",
        "titleAr": "best staff in Istanbul & most helpful. I forgot my wallet in the cab and they made sure to bring it to me. exception",
        "titleEn": "best staff in Istanbul & most helpful. I forgot my wallet in the cab and they made sure to bring it to me. exception",
        "textAr": "you can’t really walk along the Bosphorus it’s a small area [Next page](https://www.booking.com/reviews/tr/hotel/four-seasons-istanbul-at-the-bosphorus.en-gb.html?label=gen173nr-1FCA0o5AFCJmZvdXItc2Vhc29ucy1pc3RhbmJ1bC1hdC10aGUtYm9zcGhvcnVzSAlYBGjJAYgBAZgBCbgBF8gBDNgBAegBAfgBAogCAagCA7gChvfBwAbAAgHSAiQ4ODE4YmE4NS03ZDZjLTQzMjctOGJhMS0wYjliOTMxOGRmZjnYAgXgAgE&sid=27592ec45e57d1bd10e6eaedd3025cbe&customer_type=total&hp_nav=0&old_page=0&order=featuredreviews&page=2&r_lang=en&rows=75&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! ### Guests also reviewed these properties: [Best Western Celina](https://www.booking.com/reviews/us/hotel/best-western-celina.en-gb.html?label=gen173nr-1FCA0o5AFCJmZvdXItc2Vhc29ucy1pc3RhbmJ1bC1hdC10aGUtYm9zcGhvcnVzSAlYBGjJAYgBAZgBCbgBF8gBDNgBAegBAfgBAogCAagCA7gChvfBwAbAAgHSAiQ4ODE4YmE4NS03ZDZjLTQzMjctOGJhMS0wYjliOTMxOGRmZjnYAgXgAgE&sid=2",
        "textEn": "you can’t really walk along the Bosphorus it’s a small area [Next page](https://www.booking.com/reviews/tr/hotel/four-seasons-istanbul-at-the-bosphorus.en-gb.html?label=gen173nr-1FCA0o5AFCJmZvdXItc2Vhc29ucy1pc3RhbmJ1bC1hdC10aGUtYm9zcGhvcnVzSAlYBGjJAYgBAZgBCbgBF8gBDNgBAegBAfgBAogCAagCA7gChvfBwAbAAgHSAiQ4ODE4YmE4NS03ZDZjLTQzMjctOGJhMS0wYjliOTMxOGRmZjnYAgXgAgE&sid=27592ec45e57d1bd10e6eaedd3025cbe&customer_type=total&hp_nav=0&old_page=0&order=featuredreviews&page=2&r_lang=en&rows=75&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! ### Guests also reviewed these properties: [Best Western Celina](https://www.booking.com/reviews/us/hotel/best-western-celina.en-gb.html?label=gen173nr-1FCA0o5AFCJmZvdXItc2Vhc29ucy1pc3RhbmJ1bC1hdC10aGUtYm9zcGhvcnVzSAlYBGjJAYgBAZgBCbgBF8gBDNgBAegBAfgBAogCAagCA7gChvfBwAbAAgHSAiQ4ODE4YmE4NS03ZDZjLTQzMjctOGJhMS0wYjliOTMxOGRmZjnYAgXgAgE&sid=2",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Bosphorus Bridge",
        "nameAr": "جسر البوسفور",
        "lat": 41.021576067711386,
        "lng": 28.98,
        "category": "nature"
      },
      {
        "nameEn": "Yıldız Park",
        "nameAr": "حديقة يلدز",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Ortaköy",
        "nameAr": "أورتاكوي",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Taksim Square",
        "nameAr": "ميدان تقسيم",
        "lat": 40.98703472075879,
        "lng": 28.968317516021305,
        "category": "attraction"
      },
      {
        "nameEn": "Dolmabahçe Palace",
        "nameAr": "قصر دولماباهتشه",
        "lat": 41.00987445651432,
        "lng": 28.975235729437475,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "2",
    "slug": "raffles-istanbul",
    "nameAr": "رافلز إسطنبول",
    "nameEn": "Raffles Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "زولرو سنتر / ليفنت",
    "neighborhoodEn": "Zorlu Center / Levent",
    "stars": 5,
    "rating": 9.3,
    "reviewCount": 410,
    "addressAr": "مركز زورلو، لافازيم محلة، كورود سوكاك رقم 2، بشكتاش، إسطنبول، تركيا",
    "addressEn": "Zorlu Center, Levazım Mahallesi, Koru Sokak No:2, Beşiktaş, Istanbul, Turkey",
    "descriptionAr": "بجانب الفندق يقع مركز زورلو بنبض المدينة من مطاعم وتسوق ومركز فنون. يوفر رافلز إسطنبول غرفاً وأجنحة واسعة بنوافذ من الأرض للسقف وشرفات خاصة وخدمة خادم شخصي وسبا حاصل على تصنيف فوربس خمس نجوم مع مسابح وحمّام ومرافق عافية. المطاعم تشمل إيسوكيو وروكا جريل ولونغ بار وشامبانيا بار ورايترز بار.",
    "descriptionEn": "Adjacent to the hotel is the Zorlu Center, where the heart of the city beats to the rhythm of an array of dining outlets, high fashion retailers and a performing arts centre. Raffles Istanbul offers spacious rooms and suites with floor-to-ceiling windows and private balconies, butler service, and a Forbes Five-Star spa with pools, hammam and wellness facilities. Dining includes İsokyo, Rocca Grill & Terrace, Long Bar, Champagne Bar and Writers Bar.",
    "highlightsAr": [
      "خدمة خادم شخصي",
      "سبا فوربس خمس نجوم",
      "موقع مركز زورلو"
    ],
    "highlightsEn": [
      "Butler service",
      "Forbes Five-Star spa",
      "Zorlu Center location"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Indoor swimming pool",
      "Free WiFi",
      "Airport shuttle",
      "Spa and wellness centre",
      "On-site parking",
      "Family rooms",
      "Fitness centre",
      "Tea/coffee maker in rooms",
      "Bar",
      "Very good breakfast"
    ],
    "nearbyAr": [
      "مركز زورلو — في الموقع",
      "مركز زورلو للفنون — مجاور",
      "جسر البوسفور — 0.5 ميل",
      "قصر دولماباهتشه — 1.5 ميل",
      "بشكتاش / أورتاكوي — قريب",
      "مطار إسطنبول — 31 ميل"
    ],
    "nearbyEn": [
      "Zorlu Center — on site",
      "Zorlu Performing Arts Center — adjacent",
      "Bosphorus Bridge — 0.5 mi",
      "Dolmabahçe Palace — 1.5 mi",
      "Beşiktaş / Ortaköy — nearby",
      "Istanbul Airport — 31 mi"
    ],
    "rooms": [
      {
        "id": "2-r1",
        "nameAr": "غرفة ديلوكس",
        "nameEn": "Deluxe Room",
        "descriptionAr": "55 م² بنوافذ من الأرض للسقف وشرفة خاصة.",
        "descriptionEn": "55 sqm with floor-to-ceiling windows and private balcony.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 55,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "2-r2",
        "nameAr": "غرفة بريميير",
        "nameEn": "Premier Room",
        "descriptionAr": "بريميير 65 م² بإطلالة بوسفور أو مدينة.",
        "descriptionEn": "65 sqm Premier with Bosphorus or city views.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 65,
        "price": 520,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "2-r1",
        "nameAr": "جناح جونيور",
        "nameEn": "Junior Suite",
        "descriptionAr": "جناح جونيور 85 م² بمنطقة معيشة.",
        "descriptionEn": "85 sqm Junior Suite with living area.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 85,
        "price": 680,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "2-r1",
        "nameAr": "جناح بيرسوناليتي",
        "nameEn": "Personality Suite",
        "descriptionAr": "جناح توقيعي مع خدمة خادم شخصي.",
        "descriptionEn": "Signature suite with butler service.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 120,
        "price": 920,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "2-r1",
        "nameAr": "جناح رافلز",
        "nameEn": "Raffles Suite",
        "descriptionAr": "جناح علوي بإطلالات بانورامية.",
        "descriptionEn": "Top-tier suite with panoramic views.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 150,
        "price": 1200,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.99532215814883,
    "lng": 28.973898432262214,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في رافلز إسطنبول",
    "whatsappMessageEn": "Hello, I would like to book at Raffles Istanbul",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "2-gr1",
        "author": "Mohamed",
        "countryAr": "الأردن",
        "countryEn": "Jordan",
        "rating": 10,
        "date": "",
        "titleAr": "خدمة استثنائية",
        "titleEn": "Outstanding service",
        "textAr": "جربت الإفطار في الغرفة وكان مذهلاً والموقع رائع مع غرف واسعة وشرفة. الخدمة استثنائية والطاقم ودود.",
        "textEn": "I tried the breakfast in the room and it was amazing, the hotel location is great with spacious rooms and nice balcony. the service was outstanding and the staff were super helpful and friendly",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "2-gr2",
        "author": "Monisha",
        "countryAr": "نيجيريا",
        "countryEn": "Nigeria",
        "rating": 10,
        "date": "",
        "titleAr": "لمسة مثالية",
        "titleEn": "Perfect touch",
        "textAr": "كل شيء في رافلز مميز. أسرة مريحة وطاقم لطيف واهتمام بالتفاصيل. أتطلع للعودة!",
        "textEn": "Everything about Raffles stood out. From the comfiest beds to the exceptionally kind staff. Everything had the perfect touch and attention to detail. I cannot wait to go back!",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "2-gr3",
        "author": "Larisa",
        "countryAr": "ألمانيا",
        "countryEn": "Germany",
        "rating": 10,
        "date": "",
        "titleAr": "فندق رائع",
        "titleEn": "Wonderful hotel",
        "textAr": "نعود كل مرة. الطاقم منتبه لكل التفاصيل والسيد سيركان محترف.",
        "textEn": "We return every time to this wonderful hotel. The staff is attentive to every detail, and Mr. Serkan is a true professional.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "2-gr4",
        "author": "Fahad",
        "countryAr": "السعودية",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "",
        "titleAr": "إقامة فاخرة",
        "titleEn": "Luxurious stay",
        "textAr": "إقامة ممتعة وفاخرة تجاوزت توقعاتي بفضل ضيافة فريق رافلز.",
        "textEn": "It was truly an enjoyable and luxurious stay that exceeded my expectations, thanks to the Raffels Istanbul team for their hospitality.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "2-gr5",
        "author": "Konstantinos",
        "countryAr": "هونغ كونغ",
        "countryEn": "Hong Kong",
        "rating": 10,
        "date": "",
        "titleAr": "الأفضل في إسطنبول",
        "titleEn": "Best in Istanbul",
        "textAr": "أفضل فندق في إسطنبول. نظيف وفاخر والطاقم لطيف.",
        "textEn": "This is best hotel in Stanbul. Clean, luxuy, personel super nice",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "2-gr6",
        "author": "Bassam",
        "countryAr": "السعودية",
        "countryEn": "Saudi Arabia",
        "rating": 9,
        "date": "",
        "titleAr": "فندق جميل",
        "titleEn": "Lovely hotel",
        "textAr": "فندق جميل بطاقم رائع وترقية لجناح قبل الوصول وشعرت بالترحيب طوال الإقامة.",
        "textEn": "A lovely hotel with great staff, all started before the arrival when they offered me an upgrade for a suite. Among arrival I felt welcomed all the way.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Zorlu Center",
        "nameAr": "مركز زورلو",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Zorlu Performing Arts Center",
        "nameAr": "مركز زورلو للفنون",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Bosphorus Bridge",
        "nameAr": "جسر البوسفور",
        "lat": 41.00497411729205,
        "lng": 28.98689701555208,
        "category": "nature"
      },
      {
        "nameEn": "Dolmabahçe Palace",
        "nameAr": "قصر دولماباهتشه",
        "lat": 40.98973651831658,
        "lng": 28.969691925901152,
        "category": "attraction"
      },
      {
        "nameEn": "Beşiktaş / Ortaköy",
        "nameAr": "بشكتاش / أورتاكوي",
        "lat": 41.00987445651432,
        "lng": 28.975235729437475,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul Airport",
        "nameAr": "مطار إسطنبول",
        "lat": 41.41654486201608,
        "lng": 28.728772565077506,
        "category": "transport"
      }
    ]
  },
  {
    "id": "3",
    "slug": "four-seasons-bosphorus",
    "nameAr": "فور سيزونز إسطنبول على البوسفور",
    "nameEn": "Four Seasons Hotel Istanbul at the Bosphorus",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "البوسفور",
    "neighborhoodEn": "Bosphorus",
    "stars": 5,
    "rating": 9,
    "reviewCount": 252,
    "addressAr": "تشيراغان جادسي رقم 28، بشكتاش، 34349 إسطنبول، تركيا",
    "addressEn": "Çırağan Cad. No:28, Beşiktaş, 34349 Istanbul, Turkey",
    "descriptionAr": "يقع على البوسفور، ويضم هذا القصر العثماني المرمم من القرن التاسع عشر عمارة تاريخية بتفاصيل فاخرة. مسبح داخلي وخارجي مُدفأ، حديقة وتراس بانورامي. واي فاي وموقف خاص. مطعم أكوا بمطبخ متوسطي، إفطار بوفيه ومشواة المسبح. لياقة وساحة وحمّام تركي وعلاجات سبا.",
    "descriptionEn": "Located along the Bosphorus, this renovated 19th century Ottoman palace features historic architecture in harmony with luxurious details. An indoor pool and a heated outdoor pool with free parasols and sun loungers are available. The seafront property also has a garden and a spacious terrace with panoramic Bosphorus views. Free WiFi and private parking on site. Aqua Restaurant terrace serves Mediterranean cuisine with Italian and Turkish specialties; buffet breakfast and Pool Grill available. Fitness, sauna, Turkish bath and spa therapies on site.",
    "highlightsAr": [
      "قصر عثماني على البوسفور",
      "مسبح داخلي وخارجي مُدفأ",
      "تراس مطعم أكوا"
    ],
    "highlightsEn": [
      "19th-century Ottoman palace on the Bosphorus",
      "Indoor + heated outdoor pools",
      "Aqua Restaurant terrace"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Outdoor swimming pool",
      "Indoor pool",
      "Free Wifi",
      "Spa",
      "Private Parking",
      "Family rooms",
      "Fitness center",
      "Restaurant",
      "Bar",
      "Turkish bath",
      "Wonderful Breakfast"
    ],
    "nearbyAr": [
      "ميدان بشكتاش — 4 دقائق سيراً",
      "قصر دولماباهتشه — قريب",
      "أورتاكوي — بالسيارة",
      "مطار إسطنبول — 31 ميل"
    ],
    "nearbyEn": [
      "Beşiktaş Square — 4-min walk",
      "Dolmabahçe Palace — nearby",
      "Ortaköy — short drive",
      "Istanbul Airport — 31 mi"
    ],
    "rooms": [
      {
        "id": "3-r1",
        "nameAr": "غرفة فناء القصر",
        "nameEn": "Palace Courtyard Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "3-r2",
        "nameAr": "غرفة سوبيريور",
        "nameEn": "Superior Room",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 520,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "3-r1",
        "nameAr": "غرفة ديلوكس",
        "nameEn": "Deluxe Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 680,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "3-r1",
        "nameAr": "جناح جونيور فور سيزونز",
        "nameEn": "Four Seasons Junior Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 920,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "3-r1",
        "nameAr": "غرفة القصر بإطلالة بوسفور",
        "nameEn": "Palace Bosphorus Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 1200,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.99074918752157,
    "lng": 28.973172401711313,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في فور سيزونز إسطنبول على البوسفور",
    "whatsappMessageEn": "Hello, I would like to book at Four Seasons Hotel Istanbul at the Bosphorus",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "3-gr1",
        "author": "Guy",
        "countryAr": "بلجيكا",
        "countryEn": "Belgium",
        "rating": 10,
        "date": "22 April 2025",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "فئة فاخرة. طاقم ودود وموقع مثالي",
        "textEn": "Luxury class. Friendly staff, perfect location",
        "source": "Booking.com",
        "stayTypeAr": "رحلة عمل",
        "stayTypeEn": "Business trip"
      },
      {
        "id": "3-gr2",
        "author": "Vuk",
        "countryAr": "صربيا",
        "countryEn": "Serbia",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "أحب هذا الفندق",
        "titleEn": "Love this Hotel",
        "textAr": "من أفضل ما أقمت فيه. الموقع والإطلالة مذهلان والطعام رائع. حقاً خمس ماسات لا نجوم.",
        "textEn": "This hotel is one of my favorite i have ever stayed in. Location and view are amazing. Do not let me start about food.. woow. Truly 5 diamonds not stars.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "3-gr3",
        "author": "Walid",
        "countryAr": "الجزائر",
        "countryEn": "Algeria",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "موقع ممتاز وإقامة رائعة",
        "titleEn": "Excellent location, we had a great stay.",
        "textAr": "موقع رائع وطاقم ودود وسرير مريح جداً. لا أجد أي ملاحظة سلبية.",
        "textEn": "Wonderful location, Friendly staff, Very comfortable bed. Honestly I cannot think of any negative remark about this hotel.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "3-gr4",
        "author": "Rodney",
        "countryAr": "جنوب أفريقيا",
        "countryEn": "South Africa",
        "rating": 10,
        "date": "23 March 2025",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "الغرفة خاصة ومريحة جداً. الطاقم رائع.",
        "textEn": "The room was super private and comfy. The staff were super awesome.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "3-gr5",
        "author": "Navneet",
        "countryAr": "الهند",
        "countryEn": "India",
        "rating": 10,
        "date": "17 February 2025",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "الموقع رائع والخدمة ممتازة. كل شيء كان مثالياً",
        "textEn": "The location was fabulous. The service fantastic. Everything was perfect",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "3-gr6",
        "author": "Violet",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "3 November 2024",
        "titleAr": "إقامة هانئة",
        "titleEn": "It was a blissful stay.",
        "textAr": "كل شيء؛ الطاقم والمرافق والطعام والموقع؛ ترحيب ودفء ولطف واحتراف.",
        "textEn": "Absolutely everything; the staff, facilities, food, location; so welcoming, warm, friendly, courteous and professional.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Beşiktaş Square",
        "nameAr": "ميدان بشكتاش",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Dolmabahçe Palace",
        "nameAr": "قصر دولماباهتشه",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Ortaköy",
        "nameAr": "أورتاكوي",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul Airport",
        "nameAr": "مطار إسطنبول",
        "lat": 40.5912213785427,
        "lng": 28.766966468623785,
        "category": "transport"
      }
    ]
  },
  {
    "id": "4",
    "slug": "shangri-la-bosphorus",
    "nameAr": "شانغري-لا بوسفور إسطنبول",
    "nameEn": "Shangri-La Bosphorus, Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "بشكتاش",
    "neighborhoodEn": "Beşiktaş",
    "stars": 5,
    "rating": 9.1,
    "reviewCount": 1268,
    "addressAr": "سينان باشا محلة، شارع رصيف خير الدين رقم 1، بشكتاش، 34353 إسطنبول، تركيا",
    "addressEn": "Sinanpaşa Mah., Hayrettin İskelesi Sok. No.1, Beşiktaş, 34353 Istanbul, Turkey",
    "descriptionAr": "بين قصر دولماباهتشه والمتحف البحري على البوسفور الأوروبي. مسبح داخلي وسبا CHI وغرف بتفاصيل آسيوية. الأجنحة بغرفة معيشة وشرفات بوسفور. مطاعم IST TOO وقصر شانغ. سبا CHI بحمّام تركي. موقف خاص مجاني.",
    "descriptionEn": "Located between Dolmabahçe Palace and the Naval Museum on the European Bosphorus coast. Offers an indoor pool, CHI The Spa, and rooms with contemporary décor and Asian highlights. Suites have a separate living room and terraces with Bosphorus views; marble bathrooms with heated floors, bathtubs and Bvlgari toiletries. Dining: IST TOO and Shang Palace. CHI Spa: heated indoor pool, sauna, Turkish bath, hot tub and steam rooms. Free private parking; Beşiktaş Ferry Port steps away.",
    "highlightsAr": [
      "سبا CHI",
      "شرفات بوسفور",
      "مطعم شانغ بالاس"
    ],
    "highlightsEn": [
      "CHI The Spa",
      "Bosphorus suite terraces",
      "Shang Palace Chinese dining"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Indoor swimming pool",
      "Free WiFi",
      "Spa CHI",
      "Free parking",
      "Airport shuttle",
      "Family rooms",
      "Fitness centre",
      "Bar",
      "Shang Palace",
      "Turkish bath",
      "Very good breakfast"
    ],
    "nearbyAr": [
      "رصيف عبارات بشكتاش — خطوات",
      "قصر دولماباهتشه — قريب",
      "المتحف البحري — مجاور",
      "ميدان تقسيم — ضمن 2 كم"
    ],
    "nearbyEn": [
      "Beşiktaş Ferry Port — steps",
      "Dolmabahçe Palace — nearby",
      "Naval Museum — adjacent",
      "Taksim Square — within 2 km"
    ],
    "rooms": [
      {
        "id": "4-r1",
        "nameAr": "غرفة ديلوكس",
        "nameEn": "Deluxe Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "4-r2",
        "nameAr": "غرفة بريميير",
        "nameEn": "Premier Room",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "4-r1",
        "nameAr": "جناح جونيور",
        "nameEn": "Junior Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "4-r1",
        "nameAr": "جناح تنفيذي",
        "nameEn": "Executive Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "4-r1",
        "nameAr": "جناح ديلوكس بوسفور",
        "nameEn": "Deluxe Bosphorus Suite",
        "descriptionAr": "Living room and Bosphorus terraces (Booking).",
        "descriptionEn": "Living room and Bosphorus terraces (Booking).",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.99520445834661,
    "lng": 28.987277376514687,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في شانغري-لا بوسفور إسطنبول",
    "whatsappMessageEn": "Hello, I would like to book at Shangri-La Bosphorus, Istanbul",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "4-gr1",
        "author": "Wassim",
        "countryAr": "لبنان",
        "countryEn": "Lebanon",
        "rating": 10,
        "date": "",
        "titleAr": "ترحيب مثالي",
        "titleEn": "Immaculate welcome",
        "textAr": "تجربة مثالية بدءاً من ترحيب إسماعيل عند تسجيل الوصول.",
        "textEn": "My experience was absolutely immaculate, starting with the warm welcome during check-in with Ismail, who patiently guided me through the process and ensured I had all the information I needed.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "4-gr2",
        "author": "Shalini",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "",
        "titleAr": "موقع ممتاز",
        "titleEn": "Excellent location",
        "textAr": "موقع ممتاز وخدمة شخصية من كل الطاقم.",
        "textEn": "Excellent location. Personalised service from all the staff. Loved it all.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "4-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "مذهل",
        "titleEn": "Stunning",
        "textAr": "الإقامة مذهلة وتجاوزت التوقعات. إطلالات البوسفور خلّابة.",
        "textEn": "Staying at the Shangri-La Istanbul was nothing short of stunning. The hotel exceeded all expectations — from the elegant design to the impeccable service. The views of the Bosphorus were breathtaking.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "4-gr4",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "طاقم من الدرجة الأولى",
        "titleEn": "First-class staff",
        "textAr": "فندق أنيق بموقع مذهل على البوسفور. طاقم الاستقبال والسبا من الدرجة الأولى.",
        "textEn": "The hotel is beautiful and very stylish. The location is amazing; just by the Bosphorus. The staff at reception/SPA/concierge/lounge was FIRST CLASS!!",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "4-gr5",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 9,
        "date": "",
        "titleAr": "نظيف وهادئ",
        "titleEn": "Clean and quiet",
        "textAr": "غرفة نظيفة وهادئة. دش لطيف ومستلزمات حمام. طاقم مذهل.",
        "textEn": "Very clean and quiet room. Lovely shower and goodies in the bathroom. The staff were amazing and very helpful.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Beşiktaş Ferry Port",
        "nameAr": "رصيف عبارات بشكتاش",
        "lat": 41.017194572847345,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Dolmabahçe Palace",
        "nameAr": "قصر دولماباهتشه",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Naval Museum",
        "nameAr": "المتحف البحري",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Taksim Square",
        "nameAr": "ميدان تقسيم",
        "lat": 40.993208219031764,
        "lng": 28.97145798707367,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "5",
    "slug": "peninsula-istanbul",
    "nameAr": "ذا بينينسولا إسطنبول",
    "nameEn": "The Peninsula Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "كاراكوي",
    "neighborhoodEn": "Karaköy",
    "stars": 5,
    "rating": 9.5,
    "reviewCount": 339,
    "addressAr": "كاراكوي، كمانكش جادسي رقم 34، 34425 إسطنبول، تركيا",
    "addressEn": "Karaköy, Kemankeş Caddesi No:34, 34425 Istanbul, Turkey",
    "descriptionAr": "يقع ذا بينينسولا على واجهة كاراكوي في غالا بورت، من أربعة مبانٍ — ثلاثة تاريخية مرممة وفخامة بينينسولا. يمدح الضيوف الغرف المطلّة على البوسفور والخدمة الراقية والمطاعم والسبا والموقع القريب من غلطة والعبارات والمدينة القديمة.",
    "descriptionEn": "The Peninsula Istanbul sits on the Karaköy waterfront at Galataport, comprising four buildings — three restored historic structures and contemporary Peninsula luxury. Guests praise Bosphorus-facing rooms, discreet housekeeping, rooftop and waterfront dining, spa facilities, and walkable access to Galata, ferries and the old town.",
    "highlightsAr": [
      "واجهة كاراكوي / غالا بورت",
      "غرف بوسفور موصى بها",
      "معلم فاخر 4.8/5 تريب أدفايزر"
    ],
    "highlightsEn": [
      "Karaköy / Galataport waterfront",
      "Bosphorus-facing rooms recommended",
      "Tripadvisor 4.8/5 luxury landmark"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Free WiFi",
      "Spa",
      "Fitness",
      "Rooftop & waterfront restaurants",
      "Afternoon tea",
      "Concierge",
      "Room service",
      "Bosphorus views",
      "Pool terrace",
      "House car",
      "High-tech in-room controls",
      "Valet parking"
    ],
    "nearbyAr": [
      "برج غلطة — 3 دقائق",
      "عبارات كاراكوي — قريب",
      "غالا بورت — في الموقع",
      "استقلال / شيشانه — سيراً",
      "السلطان أحمد — نقل قصير",
      "مطار إسطنبول — نحو 45 دقيقة"
    ],
    "nearbyEn": [
      "Galata Tower — 3 min drive",
      "Karaköy ferry — nearby",
      "Galataport — on site",
      "Istiklal / Şişhane — walkable",
      "Sultanahmet — short transfer",
      "Istanbul Airport — ~45 min"
    ],
    "rooms": [
      {
        "id": "5-r1",
        "nameAr": "غرفة سوبيريور",
        "nameEn": "Superior Room",
        "descriptionAr": "غرفة سوبيريور؛ يُنصح بفئات مطلّة على البوسفور.",
        "descriptionEn": "Superior room; guests recommend Bosphorus-facing categories.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 45,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "5-r2",
        "nameAr": "غرفة ديلوكس",
        "nameEn": "Deluxe Room",
        "descriptionAr": "ديلوكس بمساحة أكبر ومرافق بينينسولا.",
        "descriptionEn": "Deluxe with enhanced space and Peninsula amenities.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 55,
        "price": 520,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "5-r1",
        "nameAr": "جراند ديلوكس بإطلالة بوسفور",
        "nameEn": "Grand Deluxe Bosphorus View",
        "descriptionAr": "غرفة أكبر مطلّة على البوسفور — الأكثر توصية.",
        "descriptionEn": "Larger room facing the Bosphorus — top guest recommendation.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 65,
        "price": 680,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "5-r1",
        "nameAr": "جناح بينينسولا",
        "nameEn": "Peninsula Suite",
        "descriptionAr": "جناح بمنطقة معيشة وإطلالة بوسفور.",
        "descriptionEn": "Suite with separate living area and Bosphorus views.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 90,
        "price": 920,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "5-r1",
        "nameAr": "جناح جراند",
        "nameEn": "Grand Suite",
        "descriptionAr": "فئة جناح جراند بإطلالة مائية مميزة.",
        "descriptionEn": "Grand suite category with premium waterfront outlook.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 120,
        "price": 1200,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.99327770874506,
    "lng": 28.979479459754344,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في ذا بينينسولا إسطنبول",
    "whatsappMessageEn": "Hello, I would like to book at The Peninsula Istanbul",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "5-gr1",
        "author": "Julie",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "April 2025",
        "titleAr": "طاقم استثنائي",
        "titleEn": "Outstanding staff",
        "textAr": "احجز غرفة بإطلالة بوسفور — الإطلالات مذهلة. موقع مثالي للمشي إلى المدينة القديمة والعبارات. كل عضو في الطاقم ودود ومفيد.",
        "textEn": "Book a room with a view of the Bosphorus, the views are outstanding. Perfect location to walk out into the old town and catch a ferry. Every member of staff was friendly, helpful and efficient.",
        "source": "Tripadvisor",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "5-gr2",
        "author": "Critic",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "June 2024",
        "titleAr": "فندق مذهل",
        "titleEn": "Amazing hotel",
        "textAr": "فندق مذهل بخدمة ومرافق استثنائية. الموقع مثالي والإفطار اليومي على الواجهة المائية أبرز لحظات اليوم.",
        "textEn": "This is an amazing hotel offering out of this world service and facilities. The location is spot on and allows an easy walk to the most historic sights across the water. Daily breakfast outside on the waterfront was the highlight of the day.",
        "source": "Tripadvisor",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "5-gr3",
        "author": "Anand",
        "countryAr": "سنغافورة",
        "countryEn": "Singapore",
        "rating": 10,
        "date": "April 2025",
        "titleAr": "شاي بعد الظهر بلا عيوب",
        "titleEn": "Flawless afternoon tea",
        "textAr": "أحببنا هذا الفندق. شاي بعد الظهر بلا عيوب — الأفضل في إسطنبول. جودة الخدمة والشاي والتقديم مذهلة.",
        "textEn": "We fell in love with this hotel. The Afternoon Tea was flawless — the best in Istanbul. The quality of service, the taste of the teas, and the presentation were all amazing.",
        "source": "Tripadvisor",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "5-gr4",
        "author": "Matthew",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 9,
        "date": "July 2026",
        "titleAr": "موقع رائع",
        "titleEn": "Superb location",
        "textAr": "فندق جميل في موقع رائع.",
        "textEn": "Beautiful hotel in a superb location.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "5-gr5",
        "author": "Chandraprakash",
        "countryAr": "الهند",
        "countryEn": "India",
        "rating": 10,
        "date": "July 2026",
        "titleAr": "فخامة عصرية",
        "titleEn": "Ultra modern luxury",
        "textAr": "كل شيء: الغرف واللوبي والفخامة العصرية. مطعم لطيف وطاقم ودود جداً.",
        "textEn": "Every thing, the rooms, lobby and ultra modern Luxury. Nice restaurant, Very friendly staff",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "5-gr6",
        "author": "Gregor",
        "countryAr": "ألمانيا",
        "countryEn": "Germany",
        "rating": 9,
        "date": "June 2026",
        "titleAr": "واجهة مائية ممتازة",
        "titleEn": "Excellent waterfront",
        "textAr": "الموقع ممتاز على الماء. الطاقم محترف. العقار فاخر كما تتوقع من بينينسولا.",
        "textEn": "Location was excellent, right on the water. Staff were efficient and professional. Hotel property is as luxurious as you would expect.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Galata Tower",
        "nameAr": "برج غلطة",
        "lat": 41.0534102539177,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Karaköy ferry",
        "nameAr": "عبارات كاراكوي",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Galataport",
        "nameAr": "غالا بورت",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Istiklal / Şişhane",
        "nameAr": "استقلال / شيشانه",
        "lat": 41.006641643806354,
        "lng": 28.978291597414735,
        "category": "attraction"
      },
      {
        "nameEn": "Sultanahmet",
        "nameAr": "السلطان أحمد",
        "lat": 41.00987445651432,
        "lng": 28.975235729437475,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul Airport",
        "nameAr": "مطار إسطنبول",
        "lat": 41.600145767442704,
        "lng": 28.615315013822187,
        "category": "transport"
      }
    ]
  },
  {
    "id": "6",
    "slug": "swissotel-the-bosphorus",
    "nameAr": "سويسوتيل ذا بوسفورس إسطنبول",
    "nameEn": "Swissôtel The Bosphorus Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "معمار سنان",
    "neighborhoodEn": "Maçka / Bosphorus",
    "stars": 5,
    "rating": 9.1,
    "reviewCount": 3694,
    "addressAr": "بايلديم جادسي رقم 2، ماتشكا، بشكتاش، إسطنبول، تركيا",
    "addressEn": "Bayıldım Cad. No:2, Maçka, Beşiktaş, Istanbul, Turkey",
    "descriptionAr": "سويسوتيل ذا بوسفورس منتجع حضري كبير على تلة مطلّة على البوسفور في ماتشكا/بشكتاش. يشمل سبا Purovel ومسابح داخلية وخارجية ولياقة وتنس وحدائق. مطاعم متعددة ومساحات اجتماعات واسعة.",
    "descriptionEn": "Swissôtel The Bosphorus is a large hillside resort-style hotel overlooking the Bosphorus and city skyline in Maçka/Beşiktaş. Guests use Purovel Spa & Sport, indoor and outdoor pools, fitness facilities, tennis courts and landscaped gardens. Multiple restaurants and extensive meeting space serve leisure and business travellers.",
    "highlightsAr": [
      "سبا Purovel",
      "منتجع تلة على البوسفور",
      "تقييم موقع ~9.3 على بوكينج"
    ],
    "highlightsEn": [
      "Purovel Spa",
      "Hillside Bosphorus resort scale",
      "Location score ~9.3 on Booking"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Purovel Spa & Sport",
      "Indoor pool",
      "Outdoor pool",
      "Fitness centre",
      "Tennis courts",
      "Gardens",
      "Free WiFi",
      "Restaurants & bars",
      "Meeting rooms",
      "Parking"
    ],
    "nearbyAr": [
      "حديقة ماتشكا — قريب",
      "جسر البوسفور — إطلالات",
      "نيشانتشي — بالسيارة",
      "تقسيم — بالسيارة",
      "دولماباهتشه — قريب",
      "مطار إسطنبول — 31 ميل"
    ],
    "nearbyEn": [
      "Maçka Park — nearby",
      "Bosphorus Bridge — views",
      "Nişantaşı — short drive",
      "Taksim — short drive",
      "Dolmabahçe — nearby",
      "Istanbul Airport — 31 mi"
    ],
    "rooms": [
      {
        "id": "6-r1",
        "nameAr": "غرفة كلاسيك",
        "nameEn": "Classic Room",
        "descriptionAr": "غرفة كلاسيك بإطلالة حديقة أو بوسفور جزئية.",
        "descriptionEn": "Classic room with garden or partial Bosphorus outlook.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 32,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "6-r2",
        "nameAr": "غرفة سويس أدفانتج",
        "nameEn": "Swiss Advantage Room",
        "descriptionAr": "فئة سويس أدفانتج بمرافق محسّنة.",
        "descriptionEn": "Swiss Advantage category with upgraded amenities.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "6-r1",
        "nameAr": "غرفة تنفيذية",
        "nameEn": "Executive Room",
        "descriptionAr": "غرفة تنفيذية مع خيارات دخول اللاونج.",
        "descriptionEn": "Executive room with lounge access options.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 42,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "6-r1",
        "nameAr": "جناح جونيور",
        "nameEn": "Junior Suite",
        "descriptionAr": "جناح جونيور بجلوس منفصل وإطلالة بوسفور.",
        "descriptionEn": "Junior Suite with separate seating and Bosphorus views.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 65,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "6-r1",
        "nameAr": "جناح بإطلالة بوسفور",
        "nameEn": "Bosphorus View Suite",
        "descriptionAr": "جناح مطل على البوسفور والجسر.",
        "descriptionEn": "Suite overlooking the Bosphorus and bridge.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 80,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 41.00303399377027,
    "lng": 28.971655694151075,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في سويسوتيل ذا بوسفورس إسطنبول",
    "whatsappMessageEn": "Hello, I would like to book at Swissôtel The Bosphorus Istanbul",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "6-gr1",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 10,
        "date": "",
        "titleAr": "إطلالة بوسفور رائعة",
        "titleEn": "Great Bosphorus view",
        "textAr": "من أفضل فنادق إسطنبول، إطلالة الغرفة مذهلة. نظافة في كل مكان والطاقم لطيف.",
        "textEn": "it is one of the best hotels in Istanbul, the view from the room was incredible. Very tidy everywhere, staff is very kind.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "6-gr2",
        "author": "Verified guest",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "",
        "titleAr": "دافئ وجميل",
        "titleEn": "Homely and beautiful",
        "textAr": "رغم الطقس السيء كان الفندق دافئاً وجميلاً وشعرت بالراحة.",
        "textEn": "though the weather was bad, the hotel was so homely and beautiful that I felt comfortable",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "6-gr3",
        "author": "Verified guest",
        "countryAr": "الإمارات",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "",
        "titleAr": "إقامة رائعة",
        "titleEn": "Wonderful stay",
        "textAr": "إقامة رائعة. غرف نظيفة ومريحة. طاقم ودود ومحترف. إفطار لذيذ ومتنوع.",
        "textEn": "I had a wonderful stay at this hotel. The rooms were clean, comfortable, and well-maintained. The staff were very friendly, professional, and always ready to help. The breakfast was delicious with a good variety of options.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "6-gr4",
        "author": "Verified guest",
        "countryAr": "اليونان",
        "countryEn": "Greece",
        "rating": 10,
        "date": "",
        "titleAr": "الأفضل في إسطنبول",
        "titleEn": "Best in Istanbul",
        "textAr": "موقع رائع وأفضل إطلالة بوسفور وصالة رياضية وخدمة مذهلة — فندقي المفضل في إسطنبول.",
        "textEn": "The combination of a superb location with the best view of the Bosphorus, an amazing gym and the incredible service it offers, makes this my favorite hotel in Istanbul.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "6-gr5",
        "author": "Verified guest",
        "countryAr": "ألمانيا",
        "countryEn": "Germany",
        "rating": 9,
        "date": "",
        "titleAr": "هادئ ومريح",
        "titleEn": "Calm and comfortable",
        "textAr": "فندق هادئ ومريح جداً. إطلالة البوسفور مذهلة وتصميم عصري وطاقم محترم.",
        "textEn": "This hotel is calm, quiet and very comfortable. The view of the Bosphorus is amazing. Modern interior design and the staff is very respectful and kind.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "6-gr6",
        "author": "Verified guest",
        "countryAr": "جنوب أفريقيا",
        "countryEn": "South Africa",
        "rating": 9,
        "date": "",
        "titleAr": "قيمة ممتازة",
        "titleEn": "Great value",
        "textAr": "قيمة ممتازة. غرف كبيرة مجهّزة وإطلالة بوسفور رائعة. الكونسيرج آسينا رائعة.",
        "textEn": "Great value. Well appointed and nice big rooms with a great Bosphorous view. The concierge Asena was SUPERB.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Maçka Park",
        "nameAr": "حديقة ماتشكا",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Bosphorus Bridge",
        "nameAr": "جسر البوسفور",
        "lat": 41.01281114356764,
        "lng": 28.988776414706635,
        "category": "nature"
      },
      {
        "nameEn": "Nişantaşı",
        "nameAr": "نيشانتشي",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Taksim",
        "nameAr": "تقسيم",
        "lat": 41.006641643806354,
        "lng": 28.978291597414735,
        "category": "attraction"
      },
      {
        "nameEn": "Dolmabahçe",
        "nameAr": "دولماباهتشه",
        "lat": 41.00987445651432,
        "lng": 28.975235729437475,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul Airport",
        "nameAr": "مطار إسطنبول",
        "lat": 41.41654486201608,
        "lng": 28.728772565077506,
        "category": "transport"
      }
    ]
  },
  {
    "id": "7",
    "slug": "cvk-park-bosphorus",
    "nameAr": "سي في كي بارك بوسفور إسطنبول",
    "nameEn": "CVK Park Bosphorus Hotel Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "غوموشوي",
    "neighborhoodEn": "Gümüşsuyu",
    "stars": 5,
    "rating": 9.1,
    "reviewCount": 3974,
    "addressAr": "غوموشسويو محلة، جادة إينونو رقم 8، تقسيم، 34437 إسطنبول، تركيا",
    "addressEn": "Gümüşsuyu Mah. İnönü Cad. No:8, Taksim, 34437 Istanbul, Turkey",
    "descriptionAr": "يقع سي في كي بارك بوسفور على جادة إينونو في غوموشسويو/تقسيم مع مطاعم سطحية مطلّة على البوسفور. يبرز الضيوف الموقع بجانب تقسيم والسبا/الحمّام وتنوع الإفطار وأجنحة بريستيج الواسعة.",
    "descriptionEn": "CVK Park Bosphorus Hotel Istanbul stands on İnönü Caddesi in Gümüşsuyu / Taksim with rooftop dining overlooking the Bosphorus. Guest reviews highlight location next to Taksim, spa/hammam, breakfast variety, and spacious Prestige suites. Room types on Booking reviews include Superior Double Room, Suite with Bosphorus View with Lounge Access, and Prestige Suites.",
    "highlightsAr": [
      "موقع تقسيم / غوموشسويو",
      "إطلالات بوسفور من السطح",
      "أجنحة بريستيج ودخول اللاونج"
    ],
    "highlightsEn": [
      "Taksim / Gümüşsuyu location",
      "Rooftop Bosphorus views",
      "Prestige suites & lounge access"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Free WiFi",
      "Spa / Hammam",
      "Indoor pool",
      "Fitness",
      "Rooftop restaurants",
      "Bar",
      "Family rooms",
      "Parking",
      "Lounge access (select suites)",
      "Breakfast"
    ],
    "nearbyAr": [
      "ميدان تقسيم — مجاور",
      "شارع الاستقلال — سيراً",
      "دولماباهتشه — بالسيارة",
      "واجهة البوسفور — قريب"
    ],
    "nearbyEn": [
      "Taksim Square — adjacent",
      "İstiklal Avenue — short walk",
      "Dolmabahçe — short drive",
      "Bosphorus waterfront — nearby"
    ],
    "rooms": [
      {
        "id": "7-r1",
        "nameAr": "غرفة دبل سوبيريور",
        "nameEn": "Superior Double Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "7-r2",
        "nameAr": "غرفة سوبيريور بإطلالة مدينة",
        "nameEn": "Superior Double or Twin Room with City View",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "7-r1",
        "nameAr": "غرفة دبل/توين ديلوكس",
        "nameEn": "Deluxe Double or Twin Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "7-r1",
        "nameAr": "جناح بإطلالة بوسفور - دخول اللاونج",
        "nameEn": "Suite with Bosphorus View - Lounge Access",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "7-r1",
        "nameAr": "أجنحة بارك بريستيج",
        "nameEn": "Park Prestige Suites",
        "descriptionAr": "Two/three-bedroom Prestige apartment categories on Booking reviews.",
        "descriptionEn": "Two/three-bedroom Prestige apartment categories on Booking reviews.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 41.00866178595765,
    "lng": 28.963208906482375,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في سي في كي بارك بوسفور إسطنبول",
    "whatsappMessageEn": "Hello, I would like to book at CVK Park Bosphorus Hotel Istanbul",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "7-gr1",
        "author": "Khubaib",
        "countryAr": "إيطاليا",
        "countryEn": "Italy",
        "rating": 10,
        "date": "27 April 2025",
        "titleAr": "تجربة مذهلة",
        "titleEn": "Amazing Experience",
        "textAr": "موقع مذهل بجانب تقسيم. الفندق مجهّز جيداً وإطلالة البوسفور من مطاعم السطح خلّابة ليلاً. الإفطار استثنائي ومتنوع.",
        "textEn": "Amazing location right next to Taksim Square. The hotel itself is very well equipped, and there was a very nice vibe all around. The view of the Bosphorus from all the rooftop restaurants was breathtaking, especially at night. The breakfast was exceptional with ample choice for every taste.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "7-gr2",
        "author": "Emma",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "24 April 2025",
        "titleAr": "خدمة بلا عيوب وفندق جميل",
        "titleEn": "Faultless service, beautiful hotel, extortionate mini bar prices",
        "textAr": "ميني بار مبالغ في أسعاره. فندق جميل بإطلالات رائعة في منطقة ممتازة.",
        "textEn": "Mini bar hugely overpriced, small Pringles type crisps £10, small bottle of red £30! Beautiful hotel with fabulous views in a great area of the city",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr3",
        "author": "Ana",
        "countryAr": "كرواتيا",
        "countryEn": "Croatia",
        "rating": 10,
        "date": "24 April 2025",
        "titleAr": "فندق رائع!",
        "titleEn": "Great hotel!",
        "textAr": "الموقع رائع بجانب تقسيم. الغرفة واسعة وهادئة ونظيفة. طاقم مفيد. سبا وحمّام رائعان.",
        "textEn": "The location is great, next to Taksim. The room was spacious and quiet for sleeping. Very tidy and clean. The staff was very helpful. Lovely spa and hammam.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "7-gr4",
        "author": "Nas",
        "countryAr": "بلغاريا",
        "countryEn": "Bulgaria",
        "rating": 8,
        "date": "26 April 2025",
        "titleAr": "جيد جداً",
        "titleEn": "Very good",
        "textAr": "تمت ترقيتنا بعد العثور على نمل في الحمّام. طُلب ارتداء قبعات في المسبح… أسعار خدمة الغرف مرتفعة.",
        "textEn": "We were upgraded because we found ants in our bathroom. We were asked to wear caps in the swimming pool… The room service prices were a bit crazy, 30 euro for a Margarita pizza.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "7-gr5",
        "author": "Mohamad",
        "countryAr": "لبنان",
        "countryEn": "Lebanon",
        "rating": 10,
        "date": "26 April 2025",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "الإفطار مثالي لكن هناك ضوضاء في منطقة الإفطار تحتاج معالجة.",
        "textEn": "we need to inform abt breakfast its perfect but u hv noise pollution they need to work on decreasing the noise as much possible into the breakfast area",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "7-gr6",
        "author": "Khubaib",
        "countryAr": "Italy",
        "countryEn": "Italy",
        "rating": 10,
        "date": "27 April 2025",
        "titleAr": "Amazing Experience",
        "titleEn": "Amazing Experience",
        "textAr": "The swimming pool could have been warmer. Amazing location right next to Taksim Square. The hotel itself is very well equipped, and there was a very nice vibe all around. The view of the Bosphorus from all the rooftop restaurants was breathtaking, especially at night. The breakfast was exceptional with ample choice for every taste. In short, my family and I thoroughly enjoyed our stay, and it would be our place of choice for any future trips to the wonderful city of Istanbul. Special thanks to Suzan Evgiloğlu and Seyit Taha for their welcome and assistance",
        "textEn": "The swimming pool could have been warmer. Amazing location right next to Taksim Square. The hotel itself is very well equipped, and there was a very nice vibe all around. The view of the Bosphorus from all the rooftop restaurants was breathtaking, especially at night. The breakfast was exceptional with ample choice for every taste. In short, my family and I thoroughly enjoyed our stay, and it would be our place of choice for any future trips to the wonderful city of Istanbul. Special thanks to Suzan Evgiloğlu and Seyit Taha for their welcome and assistance",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr7",
        "author": "Dr",
        "countryAr": "Cyprus",
        "countryEn": "Cyprus",
        "rating": 10,
        "date": "27 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "It was amazing 👏🤩Stayed in April 2025",
        "textEn": "It was amazing 👏🤩Stayed in April 2025",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr8",
        "author": "Nas",
        "countryAr": "Bulgaria",
        "countryEn": "Bulgaria",
        "rating": 8,
        "date": "26 April 2025",
        "titleAr": "Very g",
        "titleEn": "Very g",
        "textAr": "We were upgraded because we found ants in our bathroom. We were asked to wear caps in the swimming pool, which i did not see on the booking.com info. They charge us 7 euros for caps, which is not a lot, but it felt cheap and the actual caps were very cheap and fabric. The room service prices were a bit crazy, 30 euro for a Margarita pizza. On the last day we had go early and went to breakfast at 06:30, and there was just 1 person serving 10 tables and just 1 chef, also on the buffet some of the food (vegetables) was old from the previous day and some was missing. A 5-star establishment must keep its level all the time. The staff (reception, cleaning, parking, breakfast) is very nice and polite. We were upgraded from the 1st to the 8th executive floor. The breakfast was nice and we were lucky to get a table looking at the Bosphorus. The location is just next to Taksim square. You can get ",
        "textEn": "We were upgraded because we found ants in our bathroom. We were asked to wear caps in the swimming pool, which i did not see on the booking.com info. They charge us 7 euros for caps, which is not a lot, but it felt cheap and the actual caps were very cheap and fabric. The room service prices were a bit crazy, 30 euro for a Margarita pizza. On the last day we had go early and went to breakfast at 06:30, and there was just 1 person serving 10 tables and just 1 chef, also on the buffet some of the food (vegetables) was old from the previous day and some was missing. A 5-star establishment must keep its level all the time. The staff (reception, cleaning, parking, breakfast) is very nice and polite. We were upgraded from the 1st to the 8th executive floor. The breakfast was nice and we were lucky to get a table looking at the Bosphorus. The location is just next to Taksim square. You can get ",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr9",
        "author": "Mariam",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 8,
        "date": "22 April 2025",
        "titleAr": "Very g",
        "titleEn": "Very g",
        "textAr": "No sound isolation’s in the room, Location, cleanliness",
        "textEn": "No sound isolation’s in the room, Location, cleanliness",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr10",
        "author": "Lana",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 9,
        "date": "22 April 2025",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "Location, comfortable room.",
        "textEn": "Location, comfortable room.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr11",
        "author": "Mansoor",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 8,
        "date": "22 April 2025",
        "titleAr": "Enjoyable",
        "titleEn": "Enjoyable",
        "textAr": "Beds were uncomfortable and so was the lounge furniture.",
        "textEn": "Beds were uncomfortable and so was the lounge furniture.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr12",
        "author": "Judith",
        "countryAr": "Germany",
        "countryEn": "Germany",
        "rating": 8,
        "date": "21 April 2025",
        "titleAr": "A good location to visit Istanbul - nice and quiet too!",
        "titleEn": "A good location to visit Istanbul - nice and quiet too!",
        "textAr": "The location was ideal - a quick walk down the hill and we were able to get on public transport!",
        "textEn": "The location was ideal - a quick walk down the hill and we were able to get on public transport!",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr13",
        "author": "Rawan",
        "countryAr": "Kuwait",
        "countryEn": "Kuwait",
        "rating": 10,
        "date": "20 April 2025",
        "titleAr": "Amazing",
        "titleEn": "Amazing",
        "textAr": "My stay was absolutely amazing—truly beyond words. It’s one of the most comfortable hotels I’ve ever stayed in, especially during a time when I needed comfort the most. I genuinely didn’t feel the need to go out; I was enjoying every moment within the hotel itself. I was lucky to have a room with access to the executive lounge, which offered a wide variety of food throughout the day. Breakfast was a highlight on its own, with a different selection of dishes every morning. The staff were exceptionally professional and knowledgeable. I initially booked for five days, but ended up extending my stay by another three days simply because the experience was that good.",
        "textEn": "My stay was absolutely amazing—truly beyond words. It’s one of the most comfortable hotels I’ve ever stayed in, especially during a time when I needed comfort the most. I genuinely didn’t feel the need to go out; I was enjoying every moment within the hotel itself. I was lucky to have a room with access to the executive lounge, which offered a wide variety of food throughout the day. Breakfast was a highlight on its own, with a different selection of dishes every morning. The staff were exceptionally professional and knowledgeable. I initially booked for five days, but ended up extending my stay by another three days simply because the experience was that good.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr14",
        "author": "John",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 10,
        "date": "20 April 2025",
        "titleAr": "Highly recommend the 3 bedroom apartment with executive lounge access for multigenerational trip or a friend trip.",
        "titleEn": "Highly recommend the 3 bedroom apartment with executive lounge access for multigenerational trip or a friend trip.",
        "textAr": "Location, location, location. Amazing staff. Executive lounges worth every penny. No complaints.",
        "textEn": "Location, location, location. Amazing staff. Executive lounges worth every penny. No complaints.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr15",
        "author": "Mohammed",
        "countryAr": "Philippines",
        "countryEn": "Philippines",
        "rating": 10,
        "date": "17 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "We like the overall service and facilities..sassan is so helpful with everything.",
        "textEn": "We like the overall service and facilities..sassan is so helpful with everything.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr16",
        "author": "Andy",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "16 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The terrace staff were rude and when we turned up to see the terrace the hostess judged us on our clothes and then changed their attitude when we gave them our room number. Staff were incredible especially the restaurant staff and concierge",
        "textEn": "The terrace staff were rude and when we turned up to see the terrace the hostess judged us on our clothes and then changed their attitude when we gave them our room number. Staff were incredible especially the restaurant staff and concierge",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr17",
        "author": "Ali",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "16 April 2025",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "It was great experience. Many thanks to Berkan at reception.",
        "textEn": "It was great experience. Many thanks to Berkan at reception.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr18",
        "author": "Ayesha",
        "countryAr": "Canada",
        "countryEn": "Canada",
        "rating": 9,
        "date": "13 April 2025",
        "titleAr": "Highly recommende",
        "titleEn": "Highly recommende",
        "textAr": "Great location and very courtyard friendly staff.",
        "textEn": "Great location and very courtyard friendly staff.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr19",
        "author": "Mohammed",
        "countryAr": "Oman",
        "countryEn": "Oman",
        "rating": 10,
        "date": "12 April 2025",
        "titleAr": "My stay was so beautiful and pleasant.starting from check in with great hospitality from stuff member Ms Sukeran who he",
        "titleEn": "My stay was so beautiful and pleasant.starting from check in with great hospitality from stuff member Ms Sukeran who he",
        "textAr": "The great hospitality of the reception stuff specially Ms. Sukeran who was so really supportive and facilitated very easy check in and extension. Everything in the hotel were impressive",
        "textEn": "The great hospitality of the reception stuff specially Ms. Sukeran who was so really supportive and facilitated very easy check in and extension. Everything in the hotel were impressive",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr20",
        "author": "Christophe",
        "countryAr": "France",
        "countryEn": "France",
        "rating": 10,
        "date": "12 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "We like the hotel , high level of service thanks to Berkan and Esra and Doa and Ozgur",
        "textEn": "We like the hotel , high level of service thanks to Berkan and Esra and Doa and Ozgur",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr21",
        "author": "Abdulaziz",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The stay was amazing and we love it and beskan sasmaz was amazing he asset us very well",
        "textEn": "The stay was amazing and we love it and beskan sasmaz was amazing he asset us very well",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr22",
        "author": "ياسرSaudi Arabia",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "11 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "I am so happy thank you all Mr Berkan thanks it was indeed unforgettable days at hotel",
        "textEn": "I am so happy thank you all Mr Berkan thanks it was indeed unforgettable days at hotel",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "7-gr23",
        "author": "Abeer",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "10 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "[Next page](https://www.booking.com/reviews/tr/hotel/cvk-hotels-resorts-park-bosphorus.en-gb.html?page=2&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! ### Guests also reviewed these properties: [Arabia Hotel](https://www.booking.com/reviews/eg/hotel/arabia.en-gb.html) [Boutique Hotel Diana](https://www.booking.com/reviews/it/hotel/diana-madonna-di-campiglio.en-gb.html) Madonna di Campiglio, Italy [Le Moulin Page](https://www.booking.com/reviews/fr/hotel/le-moulin-page.en-gb.html) [Milorava&#39;s Guest House & Wine Cellar](https://www.booking.com/reviews/ge/hotel/milorava.en-gb.html) [Cam Tu Cau Hotel](https://www.booking.com/reviews/vn/hotel/cam-tu-cau.en-gb.html) [Apartments Mertelj](https://www.booking.com/reviews/si/hotel/apartmaji-mertelj-kranjska-gora.en-gb.html) Kranjska Gora, Slovenia [OYO Premium Infopark](https://www.booking.com/reviews/in/hotel/oy",
        "textEn": "[Next page](https://www.booking.com/reviews/tr/hotel/cvk-hotels-resorts-park-bosphorus.en-gb.html?page=2&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! ### Guests also reviewed these properties: [Arabia Hotel](https://www.booking.com/reviews/eg/hotel/arabia.en-gb.html) [Boutique Hotel Diana](https://www.booking.com/reviews/it/hotel/diana-madonna-di-campiglio.en-gb.html) Madonna di Campiglio, Italy [Le Moulin Page](https://www.booking.com/reviews/fr/hotel/le-moulin-page.en-gb.html) [Milorava&#39;s Guest House & Wine Cellar](https://www.booking.com/reviews/ge/hotel/milorava.en-gb.html) [Cam Tu Cau Hotel](https://www.booking.com/reviews/vn/hotel/cam-tu-cau.en-gb.html) [Apartments Mertelj](https://www.booking.com/reviews/si/hotel/apartmaji-mertelj-kranjska-gora.en-gb.html) Kranjska Gora, Slovenia [OYO Premium Infopark](https://www.booking.com/reviews/in/hotel/oy",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Taksim Square",
        "nameAr": "ميدان تقسيم",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "İstiklal Avenue",
        "nameAr": "شارع الاستقلال",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Dolmabahçe",
        "nameAr": "دولماباهتشه",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Bosphorus waterfront",
        "nameAr": "واجهة البوسفور",
        "lat": 41.006641643806354,
        "lng": 28.978291597414735,
        "category": "nature"
      }
    ]
  },
  {
    "id": "8",
    "slug": "pera-palace-hotel",
    "nameAr": "فندق بيرا بالاس",
    "nameEn": "Pera Palace Hotel",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "بيرا / تكسم",
    "neighborhoodEn": "Pera / Tepebaşı",
    "stars": 5,
    "rating": 9.2,
    "reviewCount": 102,
    "addressAr": "مسروتية جادسي رقم 52، تبه باشي، بي أوغلو، إسطنبول، تركيا",
    "addressEn": "Mesrutiyet Cad. No:52, Tepebaşı, Beyoğlu, Istanbul, Turkey",
    "descriptionAr": "بيرا بالاس الفندق التاريخي الكبير في تبه باشي/بي أوغلو، معلم فاخر قرب شارع الاستقلال. يشمل مسبحًا داخليًا وسبا وحمّامًا ومطعم أغاثا وبار أورينت. غرف وأجنحة بطابع بيل إيبوك وراحة عصرية.",
    "descriptionEn": "Pera Palace Hotel is the historic grand hotel of Tepebaşı / Beyoğlu, restored as a luxury landmark near İstiklal Avenue. Official amenities include an indoor pool, spa and hammam, Agatha Restaurant, and the Orient Bar. Rooms and suites blend Belle Époque character with modern comfort.",
    "highlightsAr": [
      "معلم بيرا التاريخي",
      "مطعم أغاثا وبار أورينت",
      "مسبح داخلي وحمّام"
    ],
    "highlightsEn": [
      "Historic Pera landmark",
      "Agatha Restaurant & Orient Bar",
      "Indoor pool and hammam"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Indoor pool",
      "Spa / Hammam",
      "Agatha Restaurant",
      "Orient Bar",
      "Free WiFi",
      "Fitness",
      "Concierge",
      "Historic suites",
      "Meeting facilities",
      "Airport shuttle",
      "Room service"
    ],
    "nearbyAr": [
      "شارع الاستقلال — سيراً",
      "برج غلطة — 140 م",
      "متحف بيرا — 140 م",
      "ميدان تقسيم — سيراً",
      "كاراكوي — نزول سيراً",
      "إسطنبول مودرن — 130 م"
    ],
    "nearbyEn": [
      "İstiklal Avenue — short walk",
      "Galata Tower — 140 m",
      "Pera Museum — 140 m",
      "Taksim Square — short walk",
      "Karaköy — downhill walk",
      "Istanbul Modern — 130 m"
    ],
    "rooms": [
      {
        "id": "8-r1",
        "nameAr": "غرفة كلاسيك",
        "nameEn": "Classic Room",
        "descriptionAr": "غرفة كلاسيك تاريخية بطابع بيل إيبوك.",
        "descriptionEn": "Historic Classic room with Belle Époque character.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 30,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "8-r2",
        "nameAr": "غرفة سوبيريور",
        "nameEn": "Superior Room",
        "descriptionAr": "غرفة سوبيريور قرب الاستقلال بتفاصيل عصرية.",
        "descriptionEn": "Superior room near İstiklal with period details.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 35,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "8-r1",
        "nameAr": "ديلوكس إطلالة القرن الذهبي",
        "nameEn": "Deluxe Golden Horn Room",
        "descriptionAr": "ديلوكس بإطلالة القرن الذهبي.",
        "descriptionEn": "Deluxe with Golden Horn outlook.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 40,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "8-r1",
        "nameAr": "جناح جونيور",
        "nameEn": "Junior Suite",
        "descriptionAr": "جناح جونيور بمساحة معيشة وديكور تاريخي.",
        "descriptionEn": "Junior Suite with living space and historic décor.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 55,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "8-r1",
        "nameAr": "غرفة غريتا غاربو",
        "nameEn": "Greta Garbo Corner Room",
        "descriptionAr": "فئة غرفة الزاوية المذكورة في المراجعات.",
        "descriptionEn": "Named corner room category cited in guest reviews.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 45,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 41.017210043844486,
    "lng": 28.95922454506616,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في فندق بيرا بالاس",
    "whatsappMessageEn": "Hello, I would like to book at Pera Palace Hotel",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "8-gr1",
        "author": "Guillaume",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 10,
        "date": "August 2022",
        "titleAr": "تاريخي وموقع رائع",
        "titleEn": "Historical and great location",
        "textAr": "لا أستطيع وصف هذا الفندق التاريخي بما يكفي. سعر جيد وغرف رائعة وطاقم محترف وسبا رائع. أنصح به بشدة.",
        "textEn": "Can't say enough good things about this historical hotel. Great price, awesome rooms, professional staff, awesome spa, great looking lounge and patio. Highly recommend.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "8-gr2",
        "author": "Vinayak",
        "countryAr": "الهند",
        "countryEn": "India",
        "rating": 10,
        "date": "July 2022",
        "titleAr": "فندق رائع",
        "titleEn": "Awesome hotel",
        "textAr": "استمتعنا جداً بالإقامة في هذا العقار التاريخي المذهل.",
        "textEn": "thoroughly enjoyed our stay in the amazing and historic property",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "8-gr3",
        "author": "Ragai",
        "countryAr": "أستراليا",
        "countryEn": "Australia",
        "rating": 10,
        "date": "May 2022",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "كل شيء في هذا الفندق مذهل. مكاني المفضل في إسطنبول.",
        "textEn": "Everything in this hotel is amazing. It's my favorite place in Istanbul",
        "source": "Booking.com",
        "stayTypeAr": "مسافر منفرد",
        "stayTypeEn": "Solo traveler"
      },
      {
        "id": "8-gr4",
        "author": "Alhassan",
        "countryAr": "الأردن",
        "countryEn": "Jordan",
        "rating": 8.8,
        "date": "May 2022",
        "titleAr": "ممتاز",
        "titleEn": "Excellent",
        "textAr": "تاريخي وأرستقراطي جداً.",
        "textEn": "very historic and aristocratic",
        "source": "Booking.com",
        "stayTypeAr": "رحلة عمل",
        "stayTypeEn": "Business trip"
      },
      {
        "id": "8-gr5",
        "author": "Jiunn",
        "countryAr": "سنغافورة",
        "countryEn": "Singapore",
        "rating": 7.6,
        "date": "March 2022",
        "titleAr": "جيد جداً",
        "titleEn": "Very good",
        "textAr": "الواي فاي بطيء نوعاً ما، كل شيء آخر جيد.",
        "textEn": "WiFi is rather slow, everything else is fine.",
        "source": "Booking.com",
        "stayTypeAr": "رحلة عمل",
        "stayTypeEn": "Business trip"
      },
      {
        "id": "8-gr6",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 9,
        "date": "",
        "titleAr": "أغاثا وبار أورينت",
        "titleEn": "Agatha & Orient Bar",
        "textAr": "معلم بيرا التاريخي مع مطعم أغاثا وبار أورينت ومسبح داخلي وحمّام قرب الاستقلال.",
        "textEn": "Historic Pera landmark with Agatha Restaurant, Orient Bar, indoor pool and hammam near İstiklal Avenue.",
        "source": "Tripadvisor",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "İstiklal Avenue",
        "nameAr": "شارع الاستقلال",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Galata Tower",
        "nameAr": "برج غلطة",
        "lat": 41.01281114356764,
        "lng": 28.988776414706635,
        "category": "attraction"
      },
      {
        "nameEn": "Pera Museum",
        "nameAr": "متحف بيرا",
        "lat": 41.00500222974971,
        "lng": 28.986858436844827,
        "category": "attraction"
      },
      {
        "nameEn": "Taksim Square",
        "nameAr": "ميدان تقسيم",
        "lat": 41.006641643806354,
        "lng": 28.978291597414735,
        "category": "attraction"
      },
      {
        "nameEn": "Karaköy",
        "nameAr": "كاراكوي",
        "lat": 41.00987445651432,
        "lng": 28.975235729437475,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul Modern",
        "nameAr": "إسطنبول مودرن",
        "lat": 41.01652049739595,
        "lng": 28.97597060991724,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "9",
    "slug": "ritz-carlton-istanbul",
    "nameAr": "ريتز كارلتون إسطنبول",
    "nameEn": "The Ritz-Carlton, Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "بشكتاش",
    "neighborhoodEn": "Beşiktaş",
    "stars": 5,
    "rating": 9,
    "reviewCount": 3277,
    "addressAr": "سوزر بلازا، جادة عسكر أوجاغي رقم 6، 34367 شيشلي، إسطنبول، تركيا",
    "addressEn": "Suzer Plaza, Askerocağı Caddesi No:6, 34367 Şişli, Istanbul, Turkey",
    "descriptionAr": "ريتز كارلتون إسطنبول في سوزر بلازا بشيشلي. يشمل سبا Laveda مع حمّام ومسبحًا داخليًا ومسبحًا لانهائيًا في Roof، ومطاعم نوبو وأتولييه. أجنحة كلوب وفئات بإطلالة بوسفور.",
    "descriptionEn": "The Ritz-Carlton, Istanbul occupies Suzer Plaza on Askerocağı Caddesi in Şişli. Official facilities include Laveda Spa with hammam, an indoor pool, and an infinity pool at Roof, plus dining at Nobu and Atölye. Club-level suites and Bosphorus-view categories are offered.",
    "highlightsAr": [
      "مسبح لانهائي على السطح",
      "نوبو إسطنبول",
      "سبا Laveda وحمّام"
    ],
    "highlightsEn": [
      "Roof infinity pool",
      "Nobu Istanbul",
      "Laveda Spa & hammam"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Laveda Spa",
      "Hammam",
      "Indoor pool",
      "Infinity pool at Roof",
      "Nobu",
      "Atölye",
      "Fitness",
      "Club Lounge",
      "Free WiFi",
      "Concierge"
    ],
    "nearbyAr": [
      "نيشانتشي — قريب",
      "حديقة ماتشكا — 420 م",
      "تقسيم — بالسيارة",
      "مركز مؤتمرات إسطنبول — قريب",
      "مطار صبيحة — 31 كم",
      "البوسفور — إطلالات"
    ],
    "nearbyEn": [
      "Nişantaşı — nearby",
      "Maçka Park — 420 m",
      "Taksim — short drive",
      "Istanbul Congress Center — nearby",
      "Sabiha Gökçen Airport — 31 km",
      "Bosphorus — views"
    ],
    "rooms": [
      {
        "id": "9-r1",
        "nameAr": "غرفة كينغ إطلالة حديقة",
        "nameEn": "King Room Park View",
        "descriptionAr": "غرفة ضيف 34 م² بإطلالة حديقة.",
        "descriptionEn": "34 sqm guest room with park view.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 34,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "9-r2",
        "nameAr": "غرفة بريميوم بإطلالة بوسفور",
        "nameEn": "Premium Bosphorus View Room",
        "descriptionAr": "غرفة ضيف أكبر بإطلالة بوسفور كاملة.",
        "descriptionEn": "Larger guest room with full Bosphorus outlook.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 40,
        "price": 520,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "9-r1",
        "nameAr": "كلوب كينغ إطلالة حديقة",
        "nameEn": "Club King Park View",
        "descriptionAr": "مستوى كلوب 34 م² مع دخول اللاونج.",
        "descriptionEn": "34 sqm Club level with lounge access.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 34,
        "price": 680,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "9-r1",
        "nameAr": "جناح بوسفور",
        "nameEn": "Bosphorus Suite",
        "descriptionAr": "جناح 51 م² بأريكة وإطلالة بحر.",
        "descriptionEn": "51 sqm suite with sofa bed and sea view.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 51,
        "price": 920,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "9-r1",
        "nameAr": "جناح نوبو",
        "nameEn": "The Nobu Suite",
        "descriptionAr": "جناح توقيعي 117 م² مع كلوب وإطلالة بوسفور.",
        "descriptionEn": "117 sqm signature suite with Club lounge and Bosphorus view.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 117,
        "price": 1200,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.99076918275015,
    "lng": 28.959606994402325,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في ريتز كارلتون إسطنبول",
    "whatsappMessageEn": "Hello, I would like to book at The Ritz-Carlton, Istanbul",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "9-gr1",
        "author": "Anastasia",
        "countryAr": "روسيا",
        "countryEn": "Russia",
        "rating": 9.6,
        "date": "March 2026",
        "titleAr": "إقامة لا تُنسى",
        "titleEn": "Memorable stay",
        "textAr": "إطلالات مذهلة وعقار جميل. إفطار رائع ومرافق من الدرجة الأولى.",
        "textEn": "Stunning views, beautiful property. Lovely breakfast. Facilities are top notch. Dinner at Nobu restaurant was disappointing compared to other Nobus, but I guess it's not managed by the hotel.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "9-gr2",
        "author": "koji",
        "countryAr": "اليابان",
        "countryEn": "Japan",
        "rating": 9.6,
        "date": "December 2025",
        "titleAr": "جودة ريتز كارلتون",
        "titleEn": "Ritz-Carlton quality",
        "textAr": "الخدمة والنظافة بجودة ريتز كارلتون الحقيقية. غرفة مع دخول اللاونج كانت الخيار الصحيح.",
        "textEn": "The fine services, cleanliness, and sanitation are truly Ritz-Carlton quality. I opted for a room with access to the lounge, and it was the right choice.",
        "source": "Booking.com",
        "stayTypeAr": "مسافر منفرد",
        "stayTypeEn": "Solo traveler"
      },
      {
        "id": "9-gr3",
        "author": "Sejin",
        "countryAr": "كوريا الجنوبية",
        "countryEn": "South Korea",
        "rating": 10,
        "date": "November 2024",
        "titleAr": "إقامة مذهلة",
        "titleEn": "Amazing stay",
        "textAr": "الطاقم لطيف جداً والسبا رائع والإطلالة مذهلة. عائلتنا راضية جداً.",
        "textEn": "The staff are amazingly kind and made us feel like they were taking great care of us. The spa facility is great, the view is amazing, so my whole family was very satisfied with our stay.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "9-gr4",
        "author": "Wanying",
        "countryAr": "سنغافورة",
        "countryEn": "Singapore",
        "rating": 10,
        "date": "March 2026",
        "titleAr": "طاقم ودود",
        "titleEn": "Friendly staff",
        "textAr": "الطاقم مهتم ومنتبه. جعل التجربة دافئة جداً.",
        "textEn": "Staff were very caring and attentive. Made the entire experience very warm.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "9-gr5",
        "author": "Andy",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 9.2,
        "date": "March 2026",
        "titleAr": "رائع",
        "titleEn": "Wonderful",
        "textAr": "كل شيء رائع هنا، أحببته.",
        "textEn": "Everything is so wonderful here, love it.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "9-gr6",
        "author": "Aju",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 9.2,
        "date": "December 2024",
        "titleAr": "إطلالات بوسفور مذهلة",
        "titleEn": "Amazing Bosphorus views",
        "textAr": "طاقم متجاوب. إطلالات غرفتنا على البوسفور مذهلة.",
        "textEn": "Very responsive staff. The views from our room of the Bosphorus were amazing.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Nişantaşı",
        "nameAr": "نيشانتشي",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Maçka Park",
        "nameAr": "حديقة ماتشكا",
        "lat": 41.01281114356764,
        "lng": 28.988776414706635,
        "category": "attraction"
      },
      {
        "nameEn": "Taksim",
        "nameAr": "تقسيم",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul Congress Center",
        "nameAr": "مركز مؤتمرات إسطنبول",
        "lat": 41.006641643806354,
        "lng": 28.978291597414735,
        "category": "attraction"
      },
      {
        "nameEn": "Sabiha Gökçen Airport",
        "nameAr": "مطار صبيحة",
        "lat": 41.00027037985972,
        "lng": 28.61076903140442,
        "category": "transport"
      },
      {
        "nameEn": "Bosphorus",
        "nameAr": "البوسفور",
        "lat": 41.01652049739595,
        "lng": 28.97597060991724,
        "category": "nature"
      }
    ]
  },
  {
    "id": "10",
    "slug": "ajia-hotel-istanbul",
    "nameAr": "أجيا هوتيل إسطنبول",
    "nameEn": "A'jia Hotel Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "neighborhoodAr": "كانديلي / الجانب الآسيوي",
    "neighborhoodEn": "Kandilli / Asian side",
    "stars": 5,
    "rating": 8.9,
    "reviewCount": 78,
    "addressAr": "جادة تشوبوكلو رقم 27، كانلجا، بيكوز، إسطنبول، تركيا",
    "addressEn": "Çubuklu Cad. No:27, Kanlıca, Beykoz, Istanbul, Turkey",
    "descriptionAr": "يالي عثماني بوتيكي على الضفة الآسيوية للبوسفور بأجواء فريدة وإطلالات بحرية وحديقة هادئة. غرف مكيفة بحمامات خاصة. مطعم بمأكولات إيطالية ومتوسطية وتركية؛ برنش وغداء وعشاء وبار. واي فاي مجاني.",
    "descriptionEn": "Boutique Ottoman yalı on the Asian Bosphorus shore offering a unique atmosphere with sea views and a tranquil garden. Rooms feature air-conditioning, private bathrooms and modern amenities. The restaurant serves Italian, Mediterranean, Turkish and international cuisine; brunch, lunch and dinner with a bar. Free WiFi throughout. Couples rate the location highly (~9.4 on Booking for two-person trips).",
    "highlightsAr": [
      "يالي عثماني بوتيكي",
      "إفطار بإطلالة بوسفور",
      "هدوء الضفة الآسيوية"
    ],
    "highlightsEn": [
      "Ottoman yalı boutique",
      "Bosphorus breakfast views",
      "Quiet Asian-shore setting"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Free WiFi",
      "Restaurant",
      "Bar",
      "Garden",
      "Bosphorus / sea views",
      "Room service",
      "Airport transfer (on request)",
      "Family rooms"
    ],
    "nearbyAr": [
      "جسر شهداء 15 تموز — 6.8 ميل",
      "قصر دولماباهتشه — 9.9 ميل",
      "مطار إسطنبول — 26 ميل",
      "واجهة كانلجا — في الموقع"
    ],
    "nearbyEn": [
      "15 July Martyrs Bridge — 6.8 mi",
      "Dolmabahçe Palace — 9.9 mi",
      "Istanbul Airport — 26 mi",
      "Kanlıca waterfront — on site"
    ],
    "rooms": [
      {
        "id": "10-r1",
        "nameAr": "ديلوكس بإطلالة حديقة",
        "nameEn": "Park View Deluxe",
        "descriptionAr": "From ajiahotel.com room list.",
        "descriptionEn": "From ajiahotel.com room list.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "10-r2",
        "nameAr": "ديلوكس طابق الرصيف",
        "nameEn": "Quay Floor Deluxe",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "10-r1",
        "nameAr": "ديلوكس بإطلالة بوسفور",
        "nameEn": "Bosphorus View Deluxe",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "10-r1",
        "nameAr": "تراس البوسفور",
        "nameEn": "Bosphorus Terrace",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "10-r1",
        "nameAr": "جناح لوفت ديلوكس",
        "nameEn": "Loft Deluxe Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "10-r1",
        "nameAr": "جناح أحمد راسم باشا",
        "nameEn": "Ahmet Rasim Pasha Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 41.01047180289591,
    "lng": 28.98102483645226,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في أجيا هوتيل إسطنبول",
    "whatsappMessageEn": "Hello, I would like to book at A'jia Hotel Istanbul",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "10-gr1",
        "author": "Ilgun",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 10,
        "date": "",
        "titleAr": "العقار استثنائي",
        "titleEn": "Property exceptional",
        "textAr": "العقار استثنائي والموقع لا يُصدّق والطعام طازج ولذيذ. أنصح به للجميع.",
        "textEn": "Property itself exceptional, location is unbelievable, didn’t want to leave hotel, food was very fresh and delicious, I would definitely recommend this hotel for everyone, thank you",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "10-gr2",
        "author": "Fatih",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 10,
        "date": "",
        "titleAr": "أفضل إطلالة / يالي",
        "titleEn": "Best view / Yali",
        "textAr": "أفضل إطلالة في إسطنبول وتجربة يالي مثالية. الطاقم منتبه جداً.",
        "textEn": "Best view in Istanbul, perfect Yali experience Personnel are very attentive.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "10-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 9,
        "date": "",
        "titleAr": "طاقم مرحّب",
        "titleEn": "Welcoming staff",
        "textAr": "موقع جيد ومرافق جميلة وطاقم مرحّب وإفطار رائع.",
        "textEn": "Good location, beautiful facilities, very welcoming staff, the breakfast was wonderful.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "10-gr4",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "إفطار لا يُنسى",
        "titleEn": "Breakfast of a lifetime",
        "textAr": "الإفطار من أفضل وجبات حياتي؛ مكونات طازجة وإطلالة ماء على بُعد أمتار من الطاولة.",
        "textEn": "The breakfast was one of the best meals of my life, every ingredient was so fresh and incredibly delicious, paired with an amazing view of the water just feet away from the table.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "15 July Martyrs Bridge",
        "nameAr": "جسر شهداء 15 تموز",
        "lat": 41.10839657554678,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Dolmabahçe Palace",
        "nameAr": "قصر دولماباهتشه",
        "lat": 41.065973733754184,
        "lng": 29.15475048437934,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul Airport",
        "nameAr": "مطار إسطنبول",
        "lat": 40.74865409918678,
        "lng": 29.33864480870813,
        "category": "transport"
      },
      {
        "nameEn": "Kanlıca waterfront",
        "nameAr": "واجهة كانلجا",
        "lat": 41.006641643806354,
        "lng": 28.978291597414735,
        "category": "nature"
      }
    ]
  },
  {
    "id": "11",
    "slug": "rixos-premium-belek",
    "nameAr": "ريكوسس بريميوم بيليك",
    "nameEn": "Rixos Premium Belek - The Land of Legends Access",
    "city": "Antalya",
    "country": "Turkey",
    "neighborhoodAr": "بيليك",
    "neighborhoodEn": "Belek",
    "stars": 5,
    "rating": 9.3,
    "reviewCount": 766,
    "addressAr": "موقع المرسى، محلة قادرية رقم 18/أ، بيليك-سريك، 07500 بيليك، أنطاليا، تركيا",
    "addressEn": "İskele Mevkii, Kadriye Mah. No:18/A, Belek-Serik, 07500 Belek, Antalya, Turkey",
    "descriptionAr": "منتجع خمس نجوم في بيليك بشاطئ خاص طويل وسبا وصالة رياضية. دخول وباص إلى لاند أوف ليجندز. غرف بإطلالة بحر أو غابة فستق. مطاعم ذواقة و8 بارات وسبا أنجانا مع حمّام عثماني ونادي أطفال وأكاديمية رياضية.",
    "descriptionEn": "Set on a vast Belek estate with a long private beach, this 5-star resort includes spa, gym and shopping. Guests receive special entrance and shuttle access to The Land of Legends Theme Park. Rooms overlook the Mediterranean or pistachio forest with balconies/terraces. Gourmet à la carte restaurants (Italian, steakhouse, Turkish, seafood), 8 bars, Anjana Spa with Ottoman hammam and indoor pools, Rixy Club for children, and Sports Academy programs.",
    "highlightsAr": [
      "دخول لاند أوف ليجندز",
      "شاطئ خاص طويل",
      "سبا أنجانا"
    ],
    "highlightsEn": [
      "Land of Legends access",
      "Long private beach",
      "Anjana Spa"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "2+ pools (incl. indoor)",
      "Private beachfront",
      "Spa / Hammam",
      "Land of Legends access",
      "Fitness / Sports Academy",
      "Kids club (Rixy)",
      "À la carte restaurants",
      "Bars",
      "Free WiFi",
      "Family rooms"
    ],
    "nearbyAr": [
      "شاطئ بيليك — في الموقع",
      "لاند أوف ليجندز — باص",
      "مطار أنطاليا — 22 ميل",
      "قادرية — قريب"
    ],
    "nearbyEn": [
      "Belek beach — on site",
      "Land of Legends — shuttle access",
      "Antalya Airport — 22 mi",
      "Kadriye — nearby"
    ],
    "rooms": [
      {
        "id": "11-r1",
        "nameAr": "غرفة ديلوكس إطلالة حديقة",
        "nameEn": "Deluxe Room Garden View",
        "descriptionAr": "~37 sqm garden-view deluxe (brief).",
        "descriptionEn": "~37 sqm garden-view deluxe (brief).",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 37,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "11-r2",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 63,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "11-r1",
        "nameAr": "جناح ديلوكس",
        "nameEn": "Deluxe Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 340,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "11-r1",
        "nameAr": "جناح ليجندري",
        "nameEn": "Legendary Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "11-r1",
        "nameAr": "غرفة دبل ديلوكس",
        "nameEn": "Deluxe Double Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 550,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 36.88760211101737,
    "lng": 30.721956680059336,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في ريكوسس بريميوم بيليك",
    "whatsappMessageEn": "Hello, I would like to book at Rixos Premium Belek - The Land of Legends Access",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "11-gr1",
        "author": "Sahil",
        "countryAr": "البرتغال",
        "countryEn": "Portugal",
        "rating": 9,
        "date": "",
        "titleAr": "المطاعم ممتلئة",
        "titleEn": "A la carte busy",
        "textAr": "كل شيء رائع؛ ربما المزيد من المطاعم لأن الألا كارت يمتلئ.",
        "textEn": "Everything maybe have more restaurants as the A La Carte gets full",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "11-gr2",
        "author": "Musaab",
        "countryAr": "عمان",
        "countryEn": "Oman",
        "rating": 10,
        "date": "",
        "titleAr": "منتجع ممتاز",
        "titleEn": "Excellent property",
        "textAr": "المنتجع ممتاز بمرافق جميلة وخدمة رائعة وأجواء مريحة. الطاقم ودود ومتعاون.",
        "textEn": "The property was excellent with beautiful facilities, great service, and a relaxing atmosphere. The staff were very friendly and accommodating, making my stay truly enjoyable.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "11-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "أفضل فندق في بيليك",
        "titleEn": "Best hotel in Belek",
        "textAr": "أفضل فندق في بيليك! الطعام والخدمة في القمة. شكر خاص للمساعدة إيلينا.",
        "textEn": "This the best hotel in Belek! The food and the service are on a top level. Special thanks to our assistant Elena for professional service.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "11-gr4",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "إجازة عائلية",
        "titleEn": "Family vacation",
        "textAr": "مكان رائع لإجازة عائلية في أكتوبر! طاقم ودود ومفيد دائماً.",
        "textEn": "It is great place for family vacation in October! Friendly and very helpful staff: Always ready to provide any kind of support and services.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Belek beach",
        "nameAr": "شاطئ بيليك",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "nature"
      },
      {
        "nameEn": "Land of Legends",
        "nameAr": "لاند أوف ليجندز",
        "lat": 41.01281114356764,
        "lng": 28.988776414706635,
        "category": "attraction"
      },
      {
        "nameEn": "Antalya Airport",
        "nameAr": "مطار أنطاليا",
        "lat": 40.78886116085035,
        "lng": 29.283468684291492,
        "category": "transport"
      },
      {
        "nameEn": "Kadriye",
        "nameAr": "قادرية",
        "lat": 41.006641643806354,
        "lng": 28.978291597414735,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "12",
    "slug": "maxx-royal-kemer",
    "nameAr": "ماكس رويال كيمر ريزورت",
    "nameEn": "Maxx Royal Kemer Resort",
    "city": "Antalya",
    "country": "Turkey",
    "neighborhoodAr": "كيمر",
    "neighborhoodEn": "Kemer",
    "stars": 5,
    "rating": 9.7,
    "reviewCount": 9,
    "addressAr": "محلة كيريش، جادة ياشار سوبوتاي رقم 88، 07980 كيمر، أنطاليا، تركيا",
    "addressEn": "Kiriş Mah., Yaşar Sobutay Cad. No:88, 07980 Kemer, Antalya, Turkey",
    "descriptionAr": "منتجع فاخر جداً على شاطئ كيمر/كيريش بأجنحة وفيلات ومسابح وسبا ومطاعم واسعة. تقييم بوكينج مرتفع على عينة صغيرة؛ يصف الضيوف خدمة دقيقة وغرفاً واسعة بإطلالات بحر قوية.",
    "descriptionEn": "Ultra-luxury beachfront resort in Kemer/Kiriş known for high-end suites and villas, private beach, multiple pools, spa, and extensive dining. Booking.com lists a very high score on a small review sample; guests describe meticulous service and spacious rooms with strong sea views.",
    "highlightsAr": [
      "منتجع كيمر فائق الفخامة",
      "تقييم بوكينج مرتفع بعينة صغيرة",
      "أجنحة وفيلات بإطلالة بحر"
    ],
    "highlightsEn": [
      "Ultra-luxury Kemer resort",
      "High Booking score on small sample",
      "Sea-view suites & villas"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Private beach",
      "Multiple pools",
      "Spa / Hammam",
      "Fine dining",
      "Kids club",
      "Fitness",
      "Free WiFi",
      "Butler service",
      "Water sports",
      "Tennis",
      "Beach service"
    ],
    "nearbyAr": [
      "شاطئ كيريش — في الموقع",
      "بلدة كيمر — بالسيارة",
      "مطار أنطاليا — نحو ساعة",
      "لاند أوف ليجندز — رحلة يوم",
      "جبال طوروس — خلفية"
    ],
    "nearbyEn": [
      "Kiriş beach — on site",
      "Kemer town — short drive",
      "Antalya Airport — ~1 hr",
      "Land of Legends — day trip",
      "Taurus Mountains — backdrop"
    ],
    "rooms": [
      {
        "id": "12-r1",
        "nameAr": "غرفة ماكس لاغونا",
        "nameEn": "Maxx Laguna Room",
        "descriptionAr": "فئة لاغونا في ماكس رويال كيمر.",
        "descriptionEn": "Laguna room category at Maxx Royal Kemer.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 45,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "12-r2",
        "nameAr": "جناح بحر",
        "nameEn": "Suite Sea",
        "descriptionAr": "جناح بإطلالة بحر مذكور في مراجعات بوكينج.",
        "descriptionEn": "Sea-view suite cited in Booking reviews.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 70,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "12-r1",
        "nameAr": "جناح رويال عائلي حديقة",
        "nameEn": "Royal Suite Family Garden",
        "descriptionAr": "جناح عائلي حديقة حتى 4 ضيوف.",
        "descriptionEn": "Family garden suite for up to 4 guests.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 90,
        "price": 340,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "12-r1",
        "nameAr": "دوبلكس ماكس لاغونا غرفتان",
        "nameEn": "Maxx Laguna Duplex 2 Bedrooms",
        "descriptionAr": "دوبلكس غرفتين بإطلالة لاغون.",
        "descriptionEn": "Two-bedroom duplex with lagoon outlook.",
        "beds": "2 King",
        "capacity": 4,
        "sizeSqm": 120,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "12-r1",
        "nameAr": "جناح رويال عائلي بحر",
        "nameEn": "Royal Suite Family Sea",
        "descriptionAr": "جناح عائلي بحر فاخر.",
        "descriptionEn": "Premium family sea suite.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 95,
        "price": 550,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 36.90566495977876,
    "lng": 30.71024131558901,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في ماكس رويال كيمر ريزورت",
    "whatsappMessageEn": "Hello, I would like to book at Maxx Royal Kemer Resort",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "12-gr1",
        "author": "Raef",
        "countryAr": "الإمارات العربية المتحدة",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "October 2022",
        "titleAr": "أفضل منتجع على الإطلاق",
        "titleEn": "Best resort ever",
        "textAr": "مكان يتجاوز التوقعات. غرف واسعة ومريحة وإطلالات مذهلة وخدمة غرف مرتين يومياً… مطاعم بشيفات ممتازين.",
        "textEn": "A place that exceed your expectation on all levels. Room: Spacious, comfortable, Spectacular view for 80% of rooms, Room service twice a day… All Restaurant have an A+ Chef, every single restaurant have multiple signature dishes.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "12-gr2",
        "author": "Victor",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "October 2024",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "إقامة استثنائية في جناح رويال عائلي حديقة لمدة 7 ليالٍ مع العائلة.",
        "textEn": "Exceptional stay in Royal Suite Family Garden for 7 nights with family.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "12-gr3",
        "author": "Jennifer",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "September 2024",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "إقامة استثنائية في جناح لاند لثلاث ليالٍ مع مجموعة.",
        "textEn": "Exceptional stay in Suite Land for 3 nights with group.",
        "source": "Booking.com",
        "stayTypeAr": "مجموعة",
        "stayTypeEn": "Group"
      },
      {
        "id": "12-gr4",
        "author": "Kirill",
        "countryAr": "الإمارات العربية المتحدة",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "July 2024",
        "titleAr": "رائع",
        "titleEn": "Superb",
        "textAr": "إقامة رائعة 6 ليالٍ في جناح بحر لزوجين.",
        "textEn": "Superb 6-night couple stay in Suite Sea.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "12-gr5",
        "author": "Sophie",
        "countryAr": "روسيا",
        "countryEn": "Russia",
        "rating": 10,
        "date": "October 2023",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "إقامة عائلية استثنائية في دوبلكس ماكس لاغونا غرفتين.",
        "textEn": "Exceptional family stay in Maxx Laguna Duplex 2 Bedrooms.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "12-gr6",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 10,
        "date": "",
        "titleAr": "أبرز تريب أدفايزر",
        "titleEn": "Tripadvisor highlight",
        "textAr": "يمدح ضيوف تريب أدفايزر الطاقم المنتبه والمرافق الشاملة والنظافة والشاطئ الخاص الطويل.",
        "textEn": "Guests on Tripadvisor praise attentive staff, comprehensive amenities, immaculate cleanliness and the long private beach at Maxx Royal Kemer.",
        "source": "Tripadvisor",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "12-gr7",
        "author": "Raef",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "8 October 2022",
        "titleAr": "Attention to details and leave nothing to chance, the best Resort I have visited in my life.",
        "titleEn": "Attention to details and leave nothing to chance, the best Resort I have visited in my life.",
        "textAr": "the atmosphere of the place is kind of designed for couples and adults, while the place offer a variety of wonderful children activities, if they change the lighting a bit, or make the atmosphere more energetic in the lobby it will create a different vibe for the children. A place that exceed your expectation on all levels, this is a resort that has made so much efforts to deliver a service that is not offered by 99% of all properties and hotels in the world. The list of amazing services offered is just too many, but I will mention few: Room: Spacious, comfortable, Showers easy to use, Spectacular view for 80% of rooms, Room service twice a day, a choice of 5 different aroma that will make your room always smell aromatic like SPA. All Restaurant have an A+ Chef, every single restaurant have multiple signature dishes, the food taste and quality are extremely outstanding in all restaurants",
        "textEn": "the atmosphere of the place is kind of designed for couples and adults, while the place offer a variety of wonderful children activities, if they change the lighting a bit, or make the atmosphere more energetic in the lobby it will create a different vibe for the children. A place that exceed your expectation on all levels, this is a resort that has made so much efforts to deliver a service that is not offered by 99% of all properties and hotels in the world. The list of amazing services offered is just too many, but I will mention few: Room: Spacious, comfortable, Showers easy to use, Spectacular view for 80% of rooms, Room service twice a day, a choice of 5 different aroma that will make your room always smell aromatic like SPA. All Restaurant have an A+ Chef, every single restaurant have multiple signature dishes, the food taste and quality are extremely outstanding in all restaurants",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "12-gr8",
        "author": "Ilya",
        "countryAr": "Switzerland",
        "countryEn": "Switzerland",
        "rating": 10,
        "date": "20 September 2022",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Low rates •No booking fees• Find cheaper? We'll refund the difference! ### Guests also reviewed these properties: [Mamaling Resort Bunaken](https://www.booking.com/reviews/id/hotel/mamaling-resort-bunaken.en-gb.html?label=gen173nr-1FCA0o5AFCF21heHgtcm95YWwta2VtZXItcmVzb3J0SAlYBGggiAEBmAEJuAEYyAEM2AEB6AEB-AECiAIBqAIEuAKQwLnABsACAdICJGFmMjNkMzExLTIxNzItNDdhOC05MTNjLTM3NGVmMjM5MWNiMtgCBeACAQ&sid=9bf6b209b0e3b312495f317408ddf12e) [Prince of Wales Hotel](https://www.booking.com/reviews/au/hotel/prince-of-wales-motor-inn.en-gb.html?label=gen173nr-1FCA0o5AFCF21heHgtcm95YWwta2VtZXItcmVzb3J0SAlYBGggiAEBmAEJuAEYyAEM2AEB6AEB-AECiAIBqAIEuAKQwLnABsACAdICJGFmMjNkMzExLTIxNzItNDdhOC05MTNjLTM3NGVmMjM5MWNiMtgCBeACAQ&sid=9bf6b209b0e3b312495f317408ddf12e) Wagga Wagga, Australia [Dar Sondos](https://www.booking.com/reviews/ma/hotel/dar-sondos-fez.en-gb.html?label=gen173nr-1FCA0o5AFCF21heHgtcm95YWwta2VtZXItcm",
        "textEn": "Low rates •No booking fees• Find cheaper? We'll refund the difference! ### Guests also reviewed these properties: [Mamaling Resort Bunaken](https://www.booking.com/reviews/id/hotel/mamaling-resort-bunaken.en-gb.html?label=gen173nr-1FCA0o5AFCF21heHgtcm95YWwta2VtZXItcmVzb3J0SAlYBGggiAEBmAEJuAEYyAEM2AEB6AEB-AECiAIBqAIEuAKQwLnABsACAdICJGFmMjNkMzExLTIxNzItNDdhOC05MTNjLTM3NGVmMjM5MWNiMtgCBeACAQ&sid=9bf6b209b0e3b312495f317408ddf12e) [Prince of Wales Hotel](https://www.booking.com/reviews/au/hotel/prince-of-wales-motor-inn.en-gb.html?label=gen173nr-1FCA0o5AFCF21heHgtcm95YWwta2VtZXItcmVzb3J0SAlYBGggiAEBmAEJuAEYyAEM2AEB6AEB-AECiAIBqAIEuAKQwLnABsACAdICJGFmMjNkMzExLTIxNzItNDdhOC05MTNjLTM3NGVmMjM5MWNiMtgCBeACAQ&sid=9bf6b209b0e3b312495f317408ddf12e) Wagga Wagga, Australia [Dar Sondos](https://www.booking.com/reviews/ma/hotel/dar-sondos-fez.en-gb.html?label=gen173nr-1FCA0o5AFCF21heHgtcm95YWwta2VtZXItcm",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Kiriş beach",
        "nameAr": "شاطئ كيريش",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "nature"
      },
      {
        "nameEn": "Kemer town",
        "nameAr": "بلدة كيمر",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Antalya Airport",
        "nameAr": "مطار أنطاليا",
        "lat": 41.00500222974971,
        "lng": 28.986858436844827,
        "category": "transport"
      },
      {
        "nameEn": "Land of Legends",
        "nameAr": "لاند أوف ليجندز",
        "lat": 41.0032832876127,
        "lng": 28.97658319482947,
        "category": "attraction"
      },
      {
        "nameEn": "Taurus Mountains",
        "nameAr": "جبال طوروس",
        "lat": 41.00974891302864,
        "lng": 28.970471458874954,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "13",
    "slug": "akra-antalya",
    "nameAr": "أكرا أنطاليا",
    "nameEn": "Akra Antalya",
    "city": "Antalya",
    "country": "Turkey",
    "neighborhoodAr": "لارا / وسط أنطاليا",
    "neighborhoodEn": "Lara / City",
    "stars": 5,
    "rating": 8.9,
    "reviewCount": 3905,
    "addressAr": "طريق لارا، مراد باشا، 07100 أنطاليا، تركيا",
    "addressEn": "Lara Yolu, Muratpaşa, 07100 Antalya, Turkey",
    "descriptionAr": "فندق خمس نجوم على الواجهة البحرية في أنطاليا بإطلالات متوسط أو جبال طوروس. غرف عصرية وواي فاي. مطاعم متعددة منها بابليتو وأسمني بالطابق العاشر. عافية بساونا وحمّام؛ مسابح وشاطئ. قرب تيراكسيتي والمدينة القديمة.",
    "descriptionEn": "Seafront 5-star hotel in Antalya city with balconies overlooking the Mediterranean or Taurus Mountains. Contemporary rooms with satellite TV and free WiFi. Multiple restaurants and bars including Pablito Bistro and Asmani on the 10th floor. Wellness with sauna, Turkish bath and massages; guests and brand materials cite multiple pools and beachfront access. Near Terracity Mall and old town.",
    "highlightsAr": [
      "موقع مدينة-شاطئ أنطاليا",
      "مطعم أسمني على السطح",
      "مسابح متعددة وسبا"
    ],
    "highlightsEn": [
      "City-beach Antalya location",
      "Asmani rooftop dining",
      "Multiple pools & spa"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "5 pools (resort facilities)",
      "Beachfront",
      "Spa / Turkish bath",
      "4+ restaurants",
      "Fitness",
      "Free WiFi",
      "Bar",
      "Family rooms",
      "Parking"
    ],
    "nearbyAr": [
      "تيراكسيتي مول — 1.9 ميل",
      "المدينة القديمة — قريب",
      "مطار أنطاليا — 9.3 ميل",
      "شريط لارا — في/قرب الموقع"
    ],
    "nearbyEn": [
      "Terracity Mall — 1.9 mi",
      "Antalya Old Town — nearby",
      "Antalya Airport — 9.3 mi",
      "Lara beach strip — on/near"
    ],
    "rooms": [
      {
        "id": "13-r1",
        "nameAr": "غرفة دبل/توين ديلوكس",
        "nameEn": "Deluxe Double or Twin Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "13-r2",
        "nameAr": "غرفة جراند ديلوكس",
        "nameEn": "Grand Deluxe Room",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "13-r1",
        "nameAr": "جناح مع غرفة معيشة",
        "nameEn": "Suite with Living Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "13-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "13-r1",
        "nameAr": "غرفة بإطلالة بحر",
        "nameEn": "Sea View Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 36.89734283074573,
    "lng": 30.73038927638642,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في أكرا أنطاليا",
    "whatsappMessageEn": "Hello, I would like to book at Akra Antalya",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "13-gr1",
        "author": "Annette",
        "countryAr": "كندا",
        "countryEn": "Canada",
        "rating": 10,
        "date": "",
        "titleAr": "جميل وحديث",
        "titleEn": "Beautiful and modern",
        "textAr": "جميل وحديث وخدمة عملاء رائعة وإفطار ممتاز وإطلالات مذهلة.",
        "textEn": "Beautiful and modern, fantastic customer service, great breakfast. Stunning views",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "13-gr2",
        "author": "Samer",
        "countryAr": "لبنان",
        "countryEn": "Lebanon",
        "rating": 9,
        "date": "",
        "titleAr": "شبه مثالي",
        "titleEn": "Almost perfect",
        "textAr": "كل شيء مثالي إلا سريرين مفردين. وصلت الساعة 11 مساءً وكانوا مستعدين لتغيير الأسرة لكنني كنت متعباً.",
        "textEn": "Everything was perfect except I had 2 single beds. Beside I arrived at 11pm. They wanted to exchange the beds but I was too tired",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "13-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "استثنائي من البداية للنهاية",
        "titleEn": "Exceptional from start to finish",
        "textAr": "استثنائي من البداية للنهاية! أفضل فندق أقمت فيه. الجيم والمسبح والساونا رائعة.",
        "textEn": "Exceptional from start to finish! The best hotel I have ever stayed in. The facilities like the gym, swimming pool, sauna etc were fantastic.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "13-gr4",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "طاقم رائع",
        "titleEn": "Fantastic staff",
        "textAr": "طاقم مذهل وغرفة جميلة وتم تنظيفها يومياً وإطلالة الغرفة 915 رائعة!!",
        "textEn": "Fantastic Hotel Staff were amazing room was beautiful bedding toiletries were high stand room was cleaned everyday view from room 915 was so good!!",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Terracity Mall",
        "nameAr": "تيراكسيتي مول",
        "lat": 41.03749316081454,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Antalya Old Town",
        "nameAr": "المدينة القديمة",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Antalya Airport",
        "nameAr": "مطار أنطاليا",
        "lat": 40.9165185816322,
        "lng": 29.108284489268677,
        "category": "transport"
      },
      {
        "nameEn": "Lara beach strip",
        "nameAr": "شريط لارا",
        "lat": 41.0032832876127,
        "lng": 28.97658319482947,
        "category": "nature"
      }
    ]
  },
  {
    "id": "14",
    "slug": "calista-luxury-resort",
    "nameAr": "كاليستا لاكشري ريزورت",
    "nameEn": "Calista Luxury Resort",
    "city": "Antalya",
    "country": "Turkey",
    "neighborhoodAr": "بيليك",
    "neighborhoodEn": "Belek",
    "stars": 5,
    "rating": 9.1,
    "reviewCount": 203,
    "addressAr": "محلة قادرية، بيليك، سريك، 07500 أنطاليا، تركيا",
    "addressEn": "Kadriye Mah., Belek, Serik, 07500 Antalya, Turkey",
    "descriptionAr": "منتجع عائلي فاخر في بيليك بمسابح ونادي أطفال (مسرح وسينما وسيرك) وسبا وشاطئ رملي. يمدح الضيوف الحدائق الهادئة وغرف سوبيريور الواسعة والمسابح الدافئة والطاقم المنتبه.",
    "descriptionEn": "Belek luxury family resort with extensive pools, kids’ club (theatre, cinema, circus shows), spa, and sandy beach. Guests praise calm green grounds, spacious Superior rooms with balconies, warm indoor/outdoor pools, and attentive staff. Booking score 9.1 based on 203 reviews; Traveller Awards figure cited ~9.2.",
    "highlightsAr": [
      "منتجع بيليك عائلي",
      "نادي أطفال قوي",
      "تقييم 9.1 بوكينج"
    ],
    "highlightsEn": [
      "Family-focused Belek resort",
      "Strong kids’ club",
      "9.1 Booking / ~9.2 awards note"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Multiple pools",
      "Kids club",
      "Spa / sauna / steam",
      "Sandy beach",
      "Restaurants (incl. 24h options)",
      "Fitness / sports",
      "Free WiFi",
      "Family rooms",
      "Animation"
    ],
    "nearbyAr": [
      "شاطئ بيليك — في/قرب الموقع",
      "قادرية — محلي",
      "مطار أنطاليا — 30–40 دقيقة"
    ],
    "nearbyEn": [
      "Belek beach — on/near site",
      "Kadriye — local",
      "Antalya Airport — ~30–40 min"
    ],
    "rooms": [
      {
        "id": "14-r1",
        "nameAr": "غرفة سوبيريور إطلالة حديقة",
        "nameEn": "Superior Room Garden View",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "14-r2",
        "nameAr": "غرفة سوبيريور إطلالة بحر جانبية",
        "nameEn": "Superior Room Side Sea View",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 63,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "14-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 340,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "14-r1",
        "nameAr": "جناح",
        "nameEn": "Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "14-r1",
        "nameAr": "غرفة سوبيريور (2+2)",
        "nameEn": "Superior Room (2+2)",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 550,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 36.89971911845323,
    "lng": 30.720857863277267,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في كاليستا لاكشري ريزورت",
    "whatsappMessageEn": "Hello, I would like to book at Calista Luxury Resort",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "14-gr1",
        "author": "Sengupto",
        "countryAr": "ألمانيا",
        "countryEn": "Germany",
        "rating": 10,
        "date": "April 10, 2026",
        "titleAr": "منتجع شاطئي رائع لكل العائلة",
        "titleEn": "Wonderful beach resort for the whole family",
        "textAr": "استمتعنا بكل لحظة. المرافق ممتازة والطاقم مهذب. نادي كالي للأطفال كان مميزاً جداً لابننا.",
        "textEn": "We really enjoyed every minute of our stay! Facilities are top-notch, and the staff is incredibly courteous. Special highlight is the Cally Kids Club. Our 5-year-old had a lot of fun…",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr2",
        "author": "Anna",
        "countryAr": "بلغاريا",
        "countryEn": "Bulgaria",
        "rating": 10,
        "date": "March 25, 2026",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "مكان ممتاز للعائلات: مسابح دافئة داخلية وخارجية وسبا. نادي أطفال رائع وطعام لذيذ ومتنوع.",
        "textEn": "Very good place for families: warm swimming pools inside and outside, warm spa. The kids club was wonderful with workshops, wood toys, cooking, cinema and Lego. Food was delicious and varied.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "14-gr3",
        "author": "Yana",
        "countryAr": "أوكرانيا",
        "countryEn": "Ukraine",
        "rating": 10,
        "date": "January 26, 2026",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "ممتاز! طعام لذيذ وسبا رائع مع عصائر طازجة. اهتمام خاص بنادي الأطفال.",
        "textEn": "Excellent! Delicious food and good alcohol. Wonderful spa with fresh juices. Special attention to the kids' club.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "14-gr4",
        "author": "Ya",
        "countryAr": "النمسا",
        "countryEn": "Austria",
        "rating": 10,
        "date": "January 21, 2026",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "هادئ وأخضر جداً. غرف واسعة وشرفات كبيرة. نظافة وطعام ممتازان وشاطئ رملي ومطعم 24 ساعة.",
        "textEn": "An exceptionally calm, peaceful, and beautifully green hotel. Spacious bright rooms with large balconies. Cleanliness impeccable, food delicious, beautiful sandy beach, 24-hour restaurant free of charge.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "14-gr5",
        "author": "Yunus",
        "countryAr": "Turkey",
        "countryEn": "Turkey",
        "rating": 9,
        "date": "April 16, 2026",
        "titleAr": "Wonderful",
        "titleEn": "Wonderful",
        "textAr": "- • Family with young children - • Superior Room Garden View - • Submitted from a mobile device Silance,private atmosphere",
        "textEn": "- • Family with young children - • Superior Room Garden View - • Submitted from a mobile device Silance,private atmosphere",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr6",
        "author": "Sengupto",
        "countryAr": "Germany",
        "countryEn": "Germany",
        "rating": 10,
        "date": "April 10, 2026",
        "titleAr": "Wonderful beach resort for the whole family",
        "titleEn": "Wonderful beach resort for the whole family",
        "textAr": "- • Superior Room Side Sea View (2+2) - • Submitted from a mobile device We really enjoyed every minute of our stay here at the resort! Everything was been wonderful-the facilities are top-notch, and the staff is incredibly courteous and helpful. Special highlight for us is the Cally Kids CIub. Our 5-year-old had a lot of fun with all the activities, and her favorite teacher, Martina, was truly exceptional. She and all other teachers at the club pay much attention to curate interesting activities for the kids. They all provided so much care and attention, which we really appreciate. We also wanted to mention the excellent service from the concierge. We needed diaper rash cream for our toddler; the team arranged for it to be delivered from a pharmacy within an hour. This prompt help was a huge relief, as it saved us from having to leave the resort to find a pharmacy ourselves. The food ha",
        "textEn": "- • Superior Room Side Sea View (2+2) - • Submitted from a mobile device We really enjoyed every minute of our stay here at the resort! Everything was been wonderful-the facilities are top-notch, and the staff is incredibly courteous and helpful. Special highlight for us is the Cally Kids CIub. Our 5-year-old had a lot of fun with all the activities, and her favorite teacher, Martina, was truly exceptional. She and all other teachers at the club pay much attention to curate interesting activities for the kids. They all provided so much care and attention, which we really appreciate. We also wanted to mention the excellent service from the concierge. We needed diaper rash cream for our toddler; the team arranged for it to be delivered from a pharmacy within an hour. This prompt help was a huge relief, as it saved us from having to leave the resort to find a pharmacy ourselves. The food ha",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr7",
        "author": "Anna",
        "countryAr": "Bulgaria",
        "countryEn": "Bulgaria",
        "rating": 10,
        "date": "March 25, 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Very good place for families: warm swimming pools inside and outside, warm spa. We have been there in the rain weather and it was important for us. The staff help us very quickly. The kids club was wonderful with a lot of fun for children: workshops, wood toys making, cooking, cinema and Lego. Good design and new furniture. The food was delicious and varied.",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Very good place for families: warm swimming pools inside and outside, warm spa. We have been there in the rain weather and it was important for us. The staff help us very quickly. The kids club was wonderful with a lot of fun for children: workshops, wood toys making, cooking, cinema and Lego. Good design and new furniture. The food was delicious and varied.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr8",
        "author": "Md",
        "countryAr": "Bangladesh",
        "countryEn": "Bangladesh",
        "rating": 10,
        "date": "February 28, 2026",
        "titleAr": "I will come again anad again",
        "titleEn": "I will come again anad again",
        "textAr": "- • Family with young children - • Superior Room Side Sea View - • Submitted from a mobile device",
        "textEn": "- • Family with young children - • Superior Room Side Sea View - • Submitted from a mobile device",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr9",
        "author": "Yana",
        "countryAr": "Ukraine",
        "countryEn": "Ukraine",
        "rating": 10,
        "date": "January 26, 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Family with young children - • Superior Room Garden View - • Submitted from a mobile device It's quite cool in the restaurant, and the doors operate strangely. Every time someone passes by, they keep opening, even though the restaurant is small and has only three doors. I would like a little more entertainment for adults. As always, excellent! Delicious food and good alcohol. I was very pleased with the presence of the Harmony restaurant. You can skip the buffet and just visit the restaurant for free from the menu 24/7. The staff is excellent, very attentive and caring. Wonderful spa with fresh juices. Special attention to the kids' club until 24:00 👌👌👌 good live music in the Lounge bar in the evening💕💕💕",
        "textEn": "- • Family with young children - • Superior Room Garden View - • Submitted from a mobile device It's quite cool in the restaurant, and the doors operate strangely. Every time someone passes by, they keep opening, even though the restaurant is small and has only three doors. I would like a little more entertainment for adults. As always, excellent! Delicious food and good alcohol. I was very pleased with the presence of the Harmony restaurant. You can skip the buffet and just visit the restaurant for free from the menu 24/7. The staff is excellent, very attentive and caring. Wonderful spa with fresh juices. Special attention to the kids' club until 24:00 👌👌👌 good live music in the Lounge bar in the evening💕💕💕",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr10",
        "author": "Ya",
        "countryAr": "Austria",
        "countryEn": "Austria",
        "rating": 10,
        "date": "January 21, 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Calista Luxury Resort An exceptionally calm, peaceful, and beautifully green hotel. Its spacious layout ensures it never feels crowded. Ideal for long, pleasant walks surrounded by nature. The rooms are very spacious and bright, with large and comfortable balconies. Cleanliness is impeccable, the food is delicious and high quality, and the service is excellent. The hotel also has a beautiful, very clean sandy beach, and a 24-hour restaurant available free of charge. Perfect for guests seeking relaxation, walking, and a truly high-quality holiday.",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Calista Luxury Resort An exceptionally calm, peaceful, and beautifully green hotel. Its spacious layout ensures it never feels crowded. Ideal for long, pleasant walks surrounded by nature. The rooms are very spacious and bright, with large and comfortable balconies. Cleanliness is impeccable, the food is delicious and high quality, and the service is excellent. The hotel also has a beautiful, very clean sandy beach, and a 24-hour restaurant available free of charge. Perfect for guests seeking relaxation, walking, and a truly high-quality holiday.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr11",
        "author": "Denis",
        "countryAr": "Russia",
        "countryEn": "Russia",
        "rating": 8,
        "date": "January 17, 2026",
        "titleAr": "Great place for a family rest and recreation",
        "titleEn": "Great place for a family rest and recreation",
        "textAr": "- • Family with young children - • Family Room (2nd Block) - • Submitted from a mobile device Hotel is pretty old, facilities, furniture, appliances are old fashioned and sometimes shabby. Yet, all at place and functional. Personnel is the best - very active, attentive, creative. They smile and greet you all day. It makes your day much better! Spacious territory is green and \"groomed\" - football and tennis areas, other sports are available and maintained. Kids club is always things to do, great animators and team. Meals are variable and tasty, great menu in the 24/7 restaurant, great team either.",
        "textEn": "- • Family with young children - • Family Room (2nd Block) - • Submitted from a mobile device Hotel is pretty old, facilities, furniture, appliances are old fashioned and sometimes shabby. Yet, all at place and functional. Personnel is the best - very active, attentive, creative. They smile and greet you all day. It makes your day much better! Spacious territory is green and \"groomed\" - football and tennis areas, other sports are available and maintained. Kids club is always things to do, great animators and team. Meals are variable and tasty, great menu in the 24/7 restaurant, great team either.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr12",
        "author": "Oezkan",
        "countryAr": "Switzerland",
        "countryEn": "Switzerland",
        "rating": 10,
        "date": "January 11, 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Superior Room Side Sea View - • Submitted from a mobile device The Location and whole around the Hotel",
        "textEn": "- • Superior Room Side Sea View - • Submitted from a mobile device The Location and whole around the Hotel",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr13",
        "author": "El",
        "countryAr": "Romania",
        "countryEn": "Romania",
        "rating": 10,
        "date": "January 1, 2026",
        "titleAr": "One of the best holidays",
        "titleEn": "One of the best holidays",
        "textAr": "- • Superior Room Garden View (2+2) - • Submitted from a mobile device The staff was amazing. They were so kind, helpful, and friendly from the first moment of interaction. The hotel is clean and beautiful, and the food is tasty. I can definitely say that the most important thing about a resort is the quality of its employees. We had an amazing holiday in this hotel.",
        "textEn": "- • Superior Room Garden View (2+2) - • Submitted from a mobile device The staff was amazing. They were so kind, helpful, and friendly from the first moment of interaction. The hotel is clean and beautiful, and the food is tasty. I can definitely say that the most important thing about a resort is the quality of its employees. We had an amazing holiday in this hotel.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr14",
        "author": "Raf2711",
        "countryAr": "Bangladesh",
        "countryEn": "Bangladesh",
        "rating": 10,
        "date": "November 23, 2025",
        "titleAr": "Amazing resort",
        "titleEn": "Amazing resort",
        "textAr": "- • Superior Room Side Sea View - • Submitted from a mobile device To be honest, the food and the hygiene was a major disappointment for us and it's only for this reason, we will not be coming back. There were so many house flies, fruit flies and cats running around the main restaurant. There were only a few fly diverting machines in operation. Whenever we ate, we were constantly playing cat and mouse with the flies trying to eat our food. For a five star resort, this really needs to be a priority to sort out. I even got a vitamin drink from the vitamin bar and as I was about to drink it, a fruit fly came out of my freshly prepared drink. Obviously, I never went back there. The food was pretty much the same every day with insignificant variation. Perhaps having different themes throughout the week would make matters a little more exciting. The room was HUGE and the double bed was more li",
        "textEn": "- • Superior Room Side Sea View - • Submitted from a mobile device To be honest, the food and the hygiene was a major disappointment for us and it's only for this reason, we will not be coming back. There were so many house flies, fruit flies and cats running around the main restaurant. There were only a few fly diverting machines in operation. Whenever we ate, we were constantly playing cat and mouse with the flies trying to eat our food. For a five star resort, this really needs to be a priority to sort out. I even got a vitamin drink from the vitamin bar and as I was about to drink it, a fruit fly came out of my freshly prepared drink. Obviously, I never went back there. The food was pretty much the same every day with insignificant variation. Perhaps having different themes throughout the week would make matters a little more exciting. The room was HUGE and the double bed was more li",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr15",
        "author": "William",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "October 31, 2025",
        "titleAr": "Fantastic, beautiful, class",
        "titleEn": "Fantastic, beautiful, class",
        "textAr": "- • Superior Room Garden View - • Submitted from a mobile device Had everything.. excellent quality",
        "textEn": "- • Superior Room Garden View - • Submitted from a mobile device Had everything.. excellent quality",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr16",
        "author": "Kimberley",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 8,
        "date": "October 19, 2025",
        "titleAr": "Brilliant stay",
        "titleEn": "Brilliant stay",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device No toddler splash park, the Grill restaurant was closed and the Jazz bar closed which limited our options for food and drinks. Beautiful setting and facilities, very clean, wonderful staff. Great 9.45pm entertainment.",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device No toddler splash park, the Grill restaurant was closed and the Jazz bar closed which limited our options for food and drinks. Beautiful setting and facilities, very clean, wonderful staff. Great 9.45pm entertainment.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr17",
        "author": "Ivan",
        "countryAr": "Finland",
        "countryEn": "Finland",
        "rating": 8,
        "date": "October 12, 2025",
        "titleAr": "nice place for families with kids",
        "titleEn": "nice place for families with kids",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) overall experience was clouded a lot of rich and ill-mannered Russians (mostly from Moscow). Their behavior made the atmosphere unpleasant and far from relaxing. The hotel has some nice features: delicious dinners, nice kids’ activities, comfortable beds, a lovely green area, and a relaxing spa.",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) overall experience was clouded a lot of rich and ill-mannered Russians (mostly from Moscow). Their behavior made the atmosphere unpleasant and far from relaxing. The hotel has some nice features: delicious dinners, nice kids’ activities, comfortable beds, a lovely green area, and a relaxing spa.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr18",
        "author": "Mehdi",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 8,
        "date": "September 19, 2025",
        "titleAr": "Nice",
        "titleEn": "Nice",
        "textAr": "- • Family with young children - • Superior Room Side Sea View (2+2) They should mention that the premium drinks are not included in their full inclusive package , as we stayed in other hotels before in the area for instance ELA hotel and that was included staff , facilities , restaurants",
        "textEn": "- • Family with young children - • Superior Room Side Sea View (2+2) They should mention that the premium drinks are not included in their full inclusive package , as we stayed in other hotels before in the area for instance ELA hotel and that was included staff , facilities , restaurants",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr19",
        "author": "Aws",
        "countryAr": "Iraq",
        "countryEn": "Iraq",
        "rating": 10,
        "date": "September 9, 2025",
        "titleAr": "Thanks for everything",
        "titleEn": "Thanks for everything",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Nothing everything was perfect",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Nothing everything was perfect",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr20",
        "author": "Gulce",
        "countryAr": "Turkey",
        "countryEn": "Turkey",
        "rating": 9,
        "date": "September 6, 2025",
        "titleAr": "Wonderful",
        "titleEn": "Wonderful",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Friendly staff, clean facilities and rooms, good food, nice beach and pier, clean towels all the time next to beach",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Friendly staff, clean facilities and rooms, good food, nice beach and pier, clean towels all the time next to beach",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr21",
        "author": "Francois",
        "countryAr": "Poland",
        "countryEn": "Poland",
        "rating": 10,
        "date": "August 27, 2025",
        "titleAr": "Simply Excellent",
        "titleEn": "Simply Excellent",
        "textAr": "- • Family with young children - • Superior Room Side Sea View (2+2) - • Submitted from a mobile device Not much, the price I guess. Despite the very hot weather (45°c), we really enjoyed our time Staff was simply brilliant. You really feel treated well and they answer promotly, with a smile to any of your queries/issues. The hotel is amazing with its greenery. The food is delicious and for every taste.",
        "textEn": "- • Family with young children - • Superior Room Side Sea View (2+2) - • Submitted from a mobile device Not much, the price I guess. Despite the very hot weather (45°c), we really enjoyed our time Staff was simply brilliant. You really feel treated well and they answer promotly, with a smile to any of your queries/issues. The hotel is amazing with its greenery. The food is delicious and for every taste.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr22",
        "author": "Khaleel",
        "countryAr": "Qatar",
        "countryEn": "Qatar",
        "rating": 10,
        "date": "August 15, 2025",
        "titleAr": "Amazing",
        "titleEn": "Amazing",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Only receptionist staff to keep the smile more and try learn more English language . Every thing was fabulous",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device Only receptionist staff to keep the smile more and try learn more English language . Every thing was fabulous",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr23",
        "author": "Nav",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "August 9, 2025",
        "titleAr": "There’s lots to do, no dull moment.",
        "titleEn": "There’s lots to do, no dull moment.",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device The kids club, swimming pools, bars, breakfast, beach, bowling alley.",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device The kids club, swimming pools, bars, breakfast, beach, bowling alley.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr24",
        "author": "Ayaulim",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "August 8, 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Superior Room Garden View - • Submitted from a mobile device I had to wait a couple of hours to get to my room. I arrived completely exhausted after my trip from other cities… And then, on the TV, the welcome message was for someone else, not me. I was honestly shocked. Everything, but especially food Omg i would live there forever for delicious food 🤭😋😋",
        "textEn": "- • Superior Room Garden View - • Submitted from a mobile device I had to wait a couple of hours to get to my room. I arrived completely exhausted after my trip from other cities… And then, on the TV, the welcome message was for someone else, not me. I was honestly shocked. Everything, but especially food Omg i would live there forever for delicious food 🤭😋😋",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr25",
        "author": "Jermaine",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "August 7, 2025",
        "titleAr": "Absolutely amazing resort! I recommend everyone book this resort",
        "titleEn": "Absolutely amazing resort! I recommend everyone book this resort",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr26",
        "author": "Amir",
        "countryAr": "Finland",
        "countryEn": "Finland",
        "rating": 9,
        "date": "August 2, 2025",
        "titleAr": "It was great, thank you!",
        "titleEn": "It was great, thank you!",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device All was great, very cosy facilities organisation. Great evening programs for kids",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device All was great, very cosy facilities organisation. Great evening programs for kids",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr27",
        "author": "Ivan",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "August 1, 2025",
        "titleAr": "Strongly recommending for visiting",
        "titleEn": "Strongly recommending for visiting",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device What could be improved: Air conditioning: We stayed during a period of extremely hot weather (temperatures around 45–46°C), and the AC system struggled to cool the room sufficiently. We contacted the staff who did try to help and adjusted the unit to its maximum setting, but unfortunately, it was still not powerful enough to make the room fully comfortable during such heat. Carpets in common areas: The carpet in the hallways and other common areas looked very old and extremely dirty. It really needs either a deep cleaning or a complete replacement – ideally with marble or tile – as it negatively affects the overall atmosphere. Replacement is also practically a better option because it is impossible to remove all stains and marks. Before I visited this place, I had found that people compl",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) - • Submitted from a mobile device What could be improved: Air conditioning: We stayed during a period of extremely hot weather (temperatures around 45–46°C), and the AC system struggled to cool the room sufficiently. We contacted the staff who did try to help and adjusted the unit to its maximum setting, but unfortunately, it was still not powerful enough to make the room fully comfortable during such heat. Carpets in common areas: The carpet in the hallways and other common areas looked very old and extremely dirty. It really needs either a deep cleaning or a complete replacement – ideally with marble or tile – as it negatively affects the overall atmosphere. Replacement is also practically a better option because it is impossible to remove all stains and marks. Before I visited this place, I had found that people compl",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "14-gr28",
        "author": "Oluwasogo",
        "countryAr": "Nigeria",
        "countryEn": "Nigeria",
        "rating": 3,
        "date": "July 31, 2025",
        "titleAr": "Superb experience",
        "titleEn": "Superb experience",
        "textAr": "- • Family with young children - • Superior Room Garden View (2+2) One challenge we faced was the language barrier, very few staff spoke English fluently, and those who did sometimes struggled to express themselves clearly. That said, we managed just fine and got the help we needed. The resort was slightly larger than I expected, and even after five nights, I'm sure we didn’t get to experience everything. The staff were excellent, very polite and helpful throughout our stay. The kids especially loved the water slides and the variety of pools. Overall, it was a fantastic experience. Low rates • No booking fees • Find something cheaper? We'll refund the difference! - Mediterranean Region Turkey Hotel Reviews - Turkish Riviera Hotel Reviews - Antalya Coast Hotel Reviews - Antalya Province Hotel Reviews - Belek Coast Hotel Reviews ### Guests also reviewed these properties: Rottach-Egern, Ger",
        "textEn": "- • Family with young children - • Superior Room Garden View (2+2) One challenge we faced was the language barrier, very few staff spoke English fluently, and those who did sometimes struggled to express themselves clearly. That said, we managed just fine and got the help we needed. The resort was slightly larger than I expected, and even after five nights, I'm sure we didn’t get to experience everything. The staff were excellent, very polite and helpful throughout our stay. The kids especially loved the water slides and the variety of pools. Overall, it was a fantastic experience. Low rates • No booking fees • Find something cheaper? We'll refund the difference! - Mediterranean Region Turkey Hotel Reviews - Turkish Riviera Hotel Reviews - Antalya Coast Hotel Reviews - Antalya Province Hotel Reviews - Belek Coast Hotel Reviews ### Guests also reviewed these properties: Rottach-Egern, Ger",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Belek beach",
        "nameAr": "شاطئ بيليك",
        "lat": 41.017194572847345,
        "lng": 28.98,
        "category": "nature"
      },
      {
        "nameEn": "Kadriye",
        "nameAr": "قادرية",
        "lat": 41.01281114356764,
        "lng": 28.988776414706635,
        "category": "attraction"
      },
      {
        "nameEn": "Antalya Airport",
        "nameAr": "مطار أنطاليا",
        "lat": 40.60792938336428,
        "lng": 29.53176124416635,
        "category": "transport"
      }
    ]
  },
  {
    "id": "15",
    "slug": "regnum-carya",
    "nameAr": "ريجنوم كاريا جولف آند سبا",
    "nameEn": "Regnum Carya Golf & Spa Resort",
    "city": "Antalya",
    "country": "Turkey",
    "neighborhoodAr": "بيليك",
    "neighborhoodEn": "Belek",
    "stars": 5,
    "rating": 8.9,
    "reviewCount": 410,
    "addressAr": "منطقة قادرية، موقع أوتش كوم تبه سي، 07500 بيليك، أنطاليا، تركيا",
    "addressEn": "Kadriye Bölgesi, Üçkumtepesi Mevkii, 07500 Belek, Antalya, Turkey",
    "descriptionAr": "منتجع غولف وسبا كبير في بيليك بمسابح متعددة وشاطئ وأنشطة أطفال وصالة رياضية ومطاعم ذواقة. يمدح الضيوف الغرف النظيفة والطعام المتنوع والترفيه؛ مع ملاحظات على حجز الألا كارت ورسوم الرياضات المائية.",
    "descriptionEn": "Large Belek golf and spa resort with extensive grounds, multiple pools, beach access, kids farm/activities, premium gym and à la carte dining. Guests praise clean comfortable rooms, varied food, friendly staff, entertainment and adult pool parties, while noting some à la carte booking difficulty and watersports fees.",
    "highlightsAr": [
      "منتجع غولف وسبا",
      "مسابح متعددة وشاطئ",
      "ترفيه قوي"
    ],
    "highlightsEn": [
      "Golf & spa resort",
      "Multiple pools + beach",
      "Strong entertainment"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "6 pools",
      "Beachfront",
      "Golf",
      "Spa",
      "Fitness / modern gym",
      "Kids farm & activities",
      "À la carte restaurants",
      "Entertainment",
      "Free WiFi",
      "Family rooms"
    ],
    "nearbyAr": [
      "ملاعب غولف بيليك — في/قرب الموقع",
      "قادرية — محلي",
      "مطار أنطاليا — بالسيارة"
    ],
    "nearbyEn": [
      "Belek golf courses — on/near site",
      "Kadriye — local",
      "Antalya Airport — drive"
    ],
    "rooms": [
      {
        "id": "15-r1",
        "nameAr": "غرفة جونيور",
        "nameEn": "Junior Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "15-r2",
        "nameAr": "غرفة ديلوكس",
        "nameEn": "Deluxe Room",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "15-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 340,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "15-r1",
        "nameAr": "جناح",
        "nameEn": "Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "15-r1",
        "nameAr": "فيلا مع مسبح",
        "nameEn": "Villa with pool",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 6,
        "sizeSqm": 38,
        "price": 550,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 36.89864897986272,
    "lng": 30.702594915200706,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في ريجنوم كاريا جولف آند سبا",
    "whatsappMessageEn": "Hello, I would like to book at Regnum Carya Golf & Spa Resort",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "15-gr1",
        "author": "Mohamed",
        "countryAr": "مصر",
        "countryEn": "Egypt",
        "rating": 10,
        "date": "13 October 2024",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "تجربة مذهلة تستحق التكرار. غرف نظيفة وطعام متنوع وطاقم ودود. شكر خاص لغولهان في المطعم الرئيسي.",
        "textEn": "It was an amazing experience worth to try and repeat, The rooms are very clean and comfy Food; great taste with great options & different cuisine every time . Staff are very friendly , special thanks to Gulhan in main restaurant",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "15-gr2",
        "author": "Olga",
        "countryAr": "إسرائيل",
        "countryEn": "Israel",
        "rating": 8,
        "date": "12 October 2024",
        "titleAr": "جيد جداً",
        "titleEn": "Very good",
        "textAr": "أراضٍ خضراء واسعة ومزرعة حيوانات للأطفال وغرفة كبيرة وصالة رياضية حديثة ضخمة!",
        "textEn": "Big green territory! A lot of locations! Nice farm with animals for kids! Big room with large bathroom! Very big and modern gym, love it!",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr3",
        "author": "Scott",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "11 October 2024",
        "titleAr": "مكان رائع أحببناه",
        "titleEn": "Great place, we loved it",
        "textAr": "الفندق والموقع والطاقم والطعام رائعة. مشروبات فاخرة ومتسقة. سنحجز مجدداً.",
        "textEn": "Hotel, location, staff, and food were great. We could not find fault, our drinks were all premium and consistent. we had a great time looking to book again",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr4",
        "author": "Robert",
        "countryAr": "أيرلندا",
        "countryEn": "Ireland",
        "rating": 10,
        "date": "18 September 2024",
        "titleAr": "ريجنوم الأفضل بلا منازع",
        "titleEn": "Regnum is by far the best",
        "textAr": "الترفيه استثنائي. حفلات مسبح البالغين رائعة وليلة تولوم من أفضل العروض.",
        "textEn": "I loved the entertainment. It was exceptional. The pool parties in the adult pool were brilliant fun. The Tulum night was one of the best shows I have seen.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr5",
        "author": "Kirandeep",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "12 September 2024",
        "titleAr": "كان مثالياً",
        "titleEn": "It was just perfect",
        "textAr": "كل شيء كان مثالياً",
        "textEn": "Everything was perfect",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "15-gr6",
        "author": "Olga",
        "countryAr": "Israel",
        "countryEn": "Israel",
        "rating": 8,
        "date": "12 October 2024",
        "titleAr": "Very g",
        "titleEn": "Very g",
        "textAr": "Food in restaurants a la carte was nice but not so good as I expected Big green territory! A lot of locations! Nice farm with animals for kids! Big room with large bathroom! Very big and modern gym, love it!",
        "textEn": "Food in restaurants a la carte was nice but not so good as I expected Big green territory! A lot of locations! Nice farm with animals for kids! Big room with large bathroom! Very big and modern gym, love it!",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr7",
        "author": "Scott",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "11 October 2024",
        "titleAr": "Great place, we loved it",
        "titleEn": "Great place, we loved it",
        "textAr": "Hotel, location,staff, and food were great. We could not find fault, our drinks were all premium and consistent. we had a great time looking to book again",
        "textEn": "Hotel, location,staff, and food were great. We could not find fault, our drinks were all premium and consistent. we had a great time looking to book again",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr8",
        "author": "Russell",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 8,
        "date": "25 September 2024",
        "titleAr": "Amazing. Avoid the watersports unless you are content with massive hidden fees that will ruin ......",
        "titleEn": "Amazing. Avoid the watersports unless you are content with massive hidden fees that will ruin ......",
        "textAr": "Watersports and the concierge team for not helping with the issue. Poor English The watersport team will give you fake prices and then sting you with nonsense fees after. Everything except the over priced onsite scam artist watersports center",
        "textEn": "Watersports and the concierge team for not helping with the issue. Poor English The watersport team will give you fake prices and then sting you with nonsense fees after. Everything except the over priced onsite scam artist watersports center",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr9",
        "author": "Robert",
        "countryAr": "Ireland",
        "countryEn": "Ireland",
        "rating": 10,
        "date": "18 September 2024",
        "titleAr": "I have been to some exceptional hotels but Regnum is by far the best. We have been to Lujo in Bodrum on two occasions b",
        "titleEn": "I have been to some exceptional hotels but Regnum is by far the best. We have been to Lujo in Bodrum on two occasions b",
        "textAr": "I felt the public pier is a bit out of date and over crowded. I loved the entertainment. It was exceptional. The pool parties in the adult pool were brilliant fun. The Tulum night was one of the best shows I have seen. Also the show Flirt was mind blowing.",
        "textEn": "I felt the public pier is a bit out of date and over crowded. I loved the entertainment. It was exceptional. The pool parties in the adult pool were brilliant fun. The Tulum night was one of the best shows I have seen. Also the show Flirt was mind blowing.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr10",
        "author": "Niamh",
        "countryAr": "Ireland",
        "countryEn": "Ireland",
        "rating": 9,
        "date": "8 September 2024",
        "titleAr": "Beautiful property with so much to",
        "titleEn": "Beautiful property with so much to",
        "textAr": "The guy at the front door was a little rude to us when we were leaving and it was €60 for a taxi that they call for you when you are leaving to the airport. Uber was only €30 but I’m not sure if they let them in to the property. It’s extremely hard to get the a La carte restaurants you like. The Ubon restaurant at the waterfall looked so nice but we didn’t get a chance to try it. You could only pay the €1000 deposit with cash or credit card, not debit card. We had to take €1000 cash out of their bank machine and it charges you a 10% commission, so it cost us €100 to take out the cash for the deposit. We stayed as a couple for 6 nights. Beautiful property with so much to do. The van transfer to the hotel was very luxurious and is included in the price. Entertainment was incredible. Pool party for adults was excellent. Rooms were very spacious and beautifully decorated. Turn down service w",
        "textEn": "The guy at the front door was a little rude to us when we were leaving and it was €60 for a taxi that they call for you when you are leaving to the airport. Uber was only €30 but I’m not sure if they let them in to the property. It’s extremely hard to get the a La carte restaurants you like. The Ubon restaurant at the waterfall looked so nice but we didn’t get a chance to try it. You could only pay the €1000 deposit with cash or credit card, not debit card. We had to take €1000 cash out of their bank machine and it charges you a 10% commission, so it cost us €100 to take out the cash for the deposit. We stayed as a couple for 6 nights. Beautiful property with so much to do. The van transfer to the hotel was very luxurious and is included in the price. Entertainment was incredible. Pool party for adults was excellent. Rooms were very spacious and beautifully decorated. Turn down service w",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr11",
        "author": "Amfbv",
        "countryAr": "Romania",
        "countryEn": "Romania",
        "rating": 10,
        "date": "22 August 2024",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Variety of food maybe . Everything in Regnum is very nice.",
        "textEn": "Variety of food maybe . Everything in Regnum is very nice.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr12",
        "author": "Ammar",
        "countryAr": "Jordan",
        "countryEn": "Jordan",
        "rating": 10,
        "date": "23 July 2024",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Very thoughtful hotel, family friendly and would definitely go back there again",
        "textEn": "Very thoughtful hotel, family friendly and would definitely go back there again",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr13",
        "author": "Yasmeen",
        "countryAr": "Kuwait",
        "countryEn": "Kuwait",
        "rating": 8,
        "date": "16 July 2024",
        "titleAr": "The resort is perfect for Family with small Kids",
        "titleEn": "The resort is perfect for Family with small Kids",
        "textAr": "Unfortunately, we met a person called Saadat. He was very rude. He questioned the validity of our reservation in an impolite manner and with a mocking laugh. We paid an additional amount, even though I showed him the email that approved our reservation. After what I said was confirmed, the amount was recovered with Omar’s help. ( it takes two weeks to refund ) Sadaat never apologize! It's Very important to select reception staff and It is necessary for the receptionist to have high morals, respect the gusts and to be polite. We came only for 3 nights and he ruined our vacation. on the other hand.. I sent two emails to reserve restaurants before we arrive but we informed to make it while we arrive. with the problem we faced, we forgot to reserve a restaurant for dinner and when we tried to reserve a restaurant the lady from the gusts service told us no restaurant available. So, we manage ",
        "textEn": "Unfortunately, we met a person called Saadat. He was very rude. He questioned the validity of our reservation in an impolite manner and with a mocking laugh. We paid an additional amount, even though I showed him the email that approved our reservation. After what I said was confirmed, the amount was recovered with Omar’s help. ( it takes two weeks to refund ) Sadaat never apologize! It's Very important to select reception staff and It is necessary for the receptionist to have high morals, respect the gusts and to be polite. We came only for 3 nights and he ruined our vacation. on the other hand.. I sent two emails to reserve restaurants before we arrive but we informed to make it while we arrive. with the problem we faced, we forgot to reserve a restaurant for dinner and when we tried to reserve a restaurant the lady from the gusts service told us no restaurant available. So, we manage ",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr14",
        "author": "Aneta",
        "countryAr": "Bulgaria",
        "countryEn": "Bulgaria",
        "rating": 10,
        "date": "5 July 2024",
        "titleAr": "Overall we had a wonderful time and everything was perfect. We would definitely visit it again some time!",
        "titleEn": "Overall we had a wonderful time and everything was perfect. We would definitely visit it again some time!",
        "textAr": "Restaurant reservations were a little bit complicated. The beach didn’t have “natural beauty” but they did their best to make it happen. Also they didn’t have yoga. One of the best hotels I have ever been to! The property is huge in fact one of the staff members informed us that it is the largest hotel in Turkey. The nature is unspoiled, well taken care of. In you’re a fan of golf you should definitely pay it a visit. It has a 4km walking path around the golf yard so if you jog or like going on walks it’s great. Regnum Carya gives you the chance to try out various cuisines from Asian to Turkish and Mediterranean. They make you feel very special from the moment you are picked up from the airport in a luxury vehicle to the end of your holiday as a fast track is included. They welcome you with flowers and strawberries. The gym is fantastic and has the newest equipment. The hotels offers var",
        "textEn": "Restaurant reservations were a little bit complicated. The beach didn’t have “natural beauty” but they did their best to make it happen. Also they didn’t have yoga. One of the best hotels I have ever been to! The property is huge in fact one of the staff members informed us that it is the largest hotel in Turkey. The nature is unspoiled, well taken care of. In you’re a fan of golf you should definitely pay it a visit. It has a 4km walking path around the golf yard so if you jog or like going on walks it’s great. Regnum Carya gives you the chance to try out various cuisines from Asian to Turkish and Mediterranean. They make you feel very special from the moment you are picked up from the airport in a luxury vehicle to the end of your holiday as a fast track is included. They welcome you with flowers and strawberries. The gym is fantastic and has the newest equipment. The hotels offers var",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr15",
        "author": "Adriana",
        "countryAr": "Romania",
        "countryEn": "Romania",
        "rating": 10,
        "date": "4 July 2024",
        "titleAr": "Most beautiful hotel in Antalya",
        "titleEn": "Most beautiful hotel in Antalya",
        "textAr": "It was a perfect vacation. Thank you Booking for your effort to change our arrival day after our flight was cancelled! And for taxi service from the airport. Once again, you met our expectations. The hotel looks better in reality than in photos. We liked the outside a lot, there is a lot of vegetation, it was one of the reasons we chose this hotel. We loved the green \"tunnels\" leading to the beach that protect guests from the sun. And of course, the peacocks...The room was very spacious, we had a big balcony and didn't lack anything. Great bathroom, too. Best food we've had so far in Turkish all inclusive hotels. Loved the adult area in the restaurant and the adult pool. Amazing outside bar and music every evening. I think we found our perfect holiday destination!",
        "textEn": "It was a perfect vacation. Thank you Booking for your effort to change our arrival day after our flight was cancelled! And for taxi service from the airport. Once again, you met our expectations. The hotel looks better in reality than in photos. We liked the outside a lot, there is a lot of vegetation, it was one of the reasons we chose this hotel. We loved the green \"tunnels\" leading to the beach that protect guests from the sun. And of course, the peacocks...The room was very spacious, we had a big balcony and didn't lack anything. Great bathroom, too. Best food we've had so far in Turkish all inclusive hotels. Loved the adult area in the restaurant and the adult pool. Amazing outside bar and music every evening. I think we found our perfect holiday destination!",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr16",
        "author": "Moosa",
        "countryAr": "South Africa",
        "countryEn": "South Africa",
        "rating": 9,
        "date": "4 July 2024",
        "titleAr": "Excellent facilities and resort, however the quality of food could be improved upon.",
        "titleEn": "Excellent facilities and resort, however the quality of food could be improved upon.",
        "textAr": "Although the quantity of food available is fantastic I feel the quality was sorely lacking. We never really enjoyed the taste of the food and would recommend a strong focus on flavour in the future. Facilities including the pools, beach and restaurants were excellent and the resort is huge. The heated pools at the villas were amazing and the rooms were excellent.",
        "textEn": "Although the quantity of food available is fantastic I feel the quality was sorely lacking. We never really enjoyed the taste of the food and would recommend a strong focus on flavour in the future. Facilities including the pools, beach and restaurants were excellent and the resort is huge. The heated pools at the villas were amazing and the rooms were excellent.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr17",
        "author": "Ian",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "25 June 2024",
        "titleAr": "Amazing - loved the new farm",
        "titleEn": "Amazing - loved the new farm",
        "textAr": "Our 3rd visit here- struggled to get into a la cart restaurants for a party of 8 but we ate well at the buffet restaurant Size and space/ staff very attentive- especially Hussain at the indoor terrace. a wonderful week",
        "textEn": "Our 3rd visit here- struggled to get into a la cart restaurants for a party of 8 but we ate well at the buffet restaurant Size and space/ staff very attentive- especially Hussain at the indoor terrace. a wonderful week",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr18",
        "author": "Jennie",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 10,
        "date": "24 June 2024",
        "titleAr": "We loved it.",
        "titleEn": "We loved it.",
        "textAr": "This is our 4th visit to this hotel and we love it. We play a lot of tennis and squash at home so last year we played lots of padel. We were really disappointed to find we had to pay $50 per hour this year to play. Last year it was free. When we have paid for an all inclusive hotel we were very surprised to have to pay for this. The court wasn't actually used a lot, such a shame. We also felt there was less staff than previous years as those who were there seemed to be covering lots of areas. Our room as great, very spacious and clean. The pool area was also clean and the staff were great.",
        "textEn": "This is our 4th visit to this hotel and we love it. We play a lot of tennis and squash at home so last year we played lots of padel. We were really disappointed to find we had to pay $50 per hour this year to play. Last year it was free. When we have paid for an all inclusive hotel we were very surprised to have to pay for this. The court wasn't actually used a lot, such a shame. We also felt there was less staff than previous years as those who were there seemed to be covering lots of areas. Our room as great, very spacious and clean. The pool area was also clean and the staff were great.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr19",
        "author": "Lynn",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 8,
        "date": "22 June 2024",
        "titleAr": "excellent facilities and friendly , helpful and attentive staff",
        "titleEn": "excellent facilities and friendly , helpful and attentive staff",
        "textAr": "the booking system for the speciality restaurants - we were unable to book in for most of the restaurants",
        "textEn": "the booking system for the speciality restaurants - we were unable to book in for most of the restaurants",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr20",
        "author": "Maja",
        "countryAr": "Bosnia and Herzegovina",
        "countryEn": "Bosnia and Herzegovina",
        "rating": 10,
        "date": "16 June 2024",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "It is always my pleasure to stay in Regnum",
        "textEn": "It is always my pleasure to stay in Regnum",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr21",
        "author": "Dora",
        "countryAr": "Bulgaria",
        "countryEn": "Bulgaria",
        "rating": 10,
        "date": "2 June 2024",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Wheat 5 friends for 1 week Everything was amazing 👏special thanks to Mohamed Ali,he waiterto beach/Palm Beach bar.Thank you for perfect service and professional job!🤩🥰",
        "textEn": "Wheat 5 friends for 1 week Everything was amazing 👏special thanks to Mohamed Ali,he waiterto beach/Palm Beach bar.Thank you for perfect service and professional job!🤩🥰",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr22",
        "author": "Mihai",
        "countryAr": "Romania",
        "countryEn": "Romania",
        "rating": 8,
        "date": "2 June 2024",
        "titleAr": "One of the best resort I’ve ever visited.",
        "titleEn": "One of the best resort I’ve ever visited.",
        "textAr": "The room need to be renovated Facilities, overall great place for family vacation",
        "textEn": "The room need to be renovated Facilities, overall great place for family vacation",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr23",
        "author": "Hussain",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "2 June 2024",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "Ala cart restaurants were very hard to book. They only way to get a table was to wake up early in the morning and que up at the booking desk before it opens. Even with that, we didn't manage to book all the ones we wanted to go to. Not something you would expect given this is supposed to be at the top of the 5 star category. Food, facility, everything was very high quality.",
        "textEn": "Ala cart restaurants were very hard to book. They only way to get a table was to wake up early in the morning and que up at the booking desk before it opens. Even with that, we didn't manage to book all the ones we wanted to go to. Not something you would expect given this is supposed to be at the top of the 5 star category. Food, facility, everything was very high quality.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "15-gr24",
        "author": "Mona",
        "countryAr": "Kuwait",
        "countryEn": "Kuwait",
        "rating": 8,
        "date": "1 June 2024",
        "titleAr": "The people who work in all restaurant was friendly and helpful",
        "titleEn": "The people who work in all restaurant was friendly and helpful",
        "textAr": "The attitude of the reception people it was very rude and the person who guide us wearing blue dress he was not telling the truth about the facilities of the hotel he said about legend park false things 1- When we reach the hotel our 3 rooms was not ready they gave us two rooms at 2 and the third room at 6 oclock and we have children with us. 2- the person who explain the hotel for us who wear blue dress was not telling the truth he told us you will go for legand land for free and you will have fast truck and you will use every thing there next day we go with my children there it was a bad experience for us we pay 4000 lyra for fast truck they refuse to give us towels i gave them money also they refuse one person there give my child a towel he was shivering if we know before we will take our toweles i hate my self when i went to legend park and we pay for every thing we drink and eat . A",
        "textEn": "The attitude of the reception people it was very rude and the person who guide us wearing blue dress he was not telling the truth about the facilities of the hotel he said about legend park false things 1- When we reach the hotel our 3 rooms was not ready they gave us two rooms at 2 and the third room at 6 oclock and we have children with us. 2- the person who explain the hotel for us who wear blue dress was not telling the truth he told us you will go for legand land for free and you will have fast truck and you will use every thing there next day we go with my children there it was a bad experience for us we pay 4000 lyra for fast truck they refuse to give us towels i gave them money also they refuse one person there give my child a towel he was shivering if we know before we will take our toweles i hate my self when i went to legend park and we pay for every thing we drink and eat . A",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Belek golf courses",
        "nameAr": "ملاعب غولف بيليك",
        "lat": 41.017194572847345,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Kadriye",
        "nameAr": "قادرية",
        "lat": 41.01281114356764,
        "lng": 28.988776414706635,
        "category": "attraction"
      },
      {
        "nameEn": "Antalya Airport",
        "nameAr": "مطار أنطاليا",
        "lat": 41.00500222974971,
        "lng": 28.986858436844827,
        "category": "transport"
      }
    ]
  },
  {
    "id": "16",
    "slug": "museum-hotel-cappadocia",
    "nameAr": "ميوزيوم هوتيل - ريليه آند شاتو",
    "nameEn": "MUSEUM HOTEL - Relais & Châteaux",
    "city": "Cappadocia",
    "country": "Turkey",
    "neighborhoodAr": "أوتشيسار",
    "neighborhoodEn": "Uçhisar",
    "stars": 5,
    "rating": 9.2,
    "reviewCount": 157,
    "addressAr": "محلة تكيلي رقم 1، 50240 أوتشيسار، نيفشهير، تركيا",
    "addressEn": "Tekelli Mah. No:1, 50240 Uçhisar, Nevşehir, Turkey",
    "descriptionAr": "فندق كهوف وحجر صديق للبيئة ضمن ريليه آند شاتو في أوتشيسار بإطلالات وادٍ. وحدات مكيفة وواي فاي وتلفزيون وميني بار وأحواض سبا. مطعم ليلا بمأكولات كابادوكية على التراس. مبنى تاريخي بسلالم — غير مناسب للكراسي المتحركة.",
    "descriptionEn": "Eco-friendly Relais & Châteaux cave/stone hotel in Uçhisar with valley views. Units have air conditioning, free WiFi, flat-screen TV, mini-bar and spa baths. Lil’a Restaurant serves Cappadocian and Turkish dishes on the terrace; breakfast uses garden produce. Historic cave-and-stone layout with stairs and uneven ground — not wheelchair accessible. Pet-friendly; airport shuttles arranged at surcharge.",
    "highlightsAr": [
      "فندق كهوف ريليه آند شاتو",
      "مطعم ليلا",
      "إطلالات وادي أوتشيسار"
    ],
    "highlightsEn": [
      "Relais & Châteaux cave hotel",
      "Lil’a Restaurant",
      "Uçhisar valley views"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Free WiFi",
      "Lil’a Restaurant",
      "Spa bath in rooms",
      "Outdoor pool / terrace views",
      "Garden produce breakfast",
      "Pet-friendly",
      "Concierge / shuttle",
      "Cave & stone suites"
    ],
    "nearbyAr": [
      "قلعة أوتشيسار — سيراً",
      "غوريمه — بالسيارة",
      "نيفشهير — 19 ميل",
      "مطار قيصري — 31 ميل"
    ],
    "nearbyEn": [
      "Uçhisar Castle — walkable",
      "Göreme — short drive",
      "Nevşehir — 19 mi",
      "Kayseri Airport — 31 mi"
    ],
    "rooms": [
      {
        "id": "16-r1",
        "nameAr": "غرفة دبل/توين ديلوكس",
        "nameEn": "Deluxe Double or Twin Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "16-r2",
        "nameAr": "جناح سوبيريور",
        "nameEn": "Superior Suite",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 63,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "16-r1",
        "nameAr": "جناح تنفيذي",
        "nameEn": "Executive Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "16-r1",
        "nameAr": "جناح مسبح",
        "nameEn": "Pool Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "16-r1",
        "nameAr": "جناح رئاسي",
        "nameEn": "Presidential Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 38.635296664777734,
    "lng": 34.8422060008354,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في ميوزيوم هوتيل - ريليه آند شاتو",
    "whatsappMessageEn": "Hello, I would like to book at MUSEUM HOTEL - Relais & Châteaux",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "16-gr1",
        "author": "Dewijayati",
        "countryAr": "إندونيسيا",
        "countryEn": "Indonesia",
        "rating": 10,
        "date": "",
        "titleAr": "طاقم ودود",
        "titleEn": "Friendly staff",
        "textAr": "كل الطاقم ودود ومفيد جداً. حجزنا نقل المطار وتاكسي إلى غوريمه…",
        "textEn": "All staff especially the receptionist and restaurant staff are very friendly, extremely helpful and accomodating. We booked airport transfers both ways and taxis to Goreme…",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "16-gr2",
        "author": "Patricia",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 10,
        "date": "",
        "titleAr": "طاقم مذهل",
        "titleEn": "Incredible staff",
        "textAr": "الطاقم مذهل ولطيف. الحدائق والغرف جميلة. موقع ممتاز للمشي إلى قلعة أوتشيسار.",
        "textEn": "The staff was incredible - so kind and generous. The grounds are beautiful, as are the rooms. The location was great to walk to Uchisar Castle. Guest services was top notch through and through.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "16-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "تعيش في متحف",
        "titleEn": "Live in a museum",
        "textAr": "ضيافة ممتازة وإطلالة مذهلة. تشعر أنك تقيم في متحف. طعام ليلا بمستوى ميشلان.",
        "textEn": "excellent hospitality , amazing view. You feel like you are staying at a museum. The staff are very professional. The location is best. The food at Lil'a restaurant is Michelin Star",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "16-gr4",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 9,
        "date": "",
        "titleAr": "سحر الكهف",
        "titleEn": "Cave charm",
        "textAr": "غرف ساحرة مليئة بالتاريخ؛ إطلالات منطاد وطعام محلي مبتكر.",
        "textEn": "charming, cozy rooms full of history; views of the terrain and hot air balloons from property; food inventive and local - culinary master pieces.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Uçhisar Castle",
        "nameAr": "قلعة أوتشيسار",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Göreme",
        "nameAr": "غوريمه",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Nevşehir",
        "nameAr": "نيفشهير",
        "lat": 40.81901645709803,
        "lng": 29.242086590979017,
        "category": "attraction"
      },
      {
        "nameEn": "Kayseri Airport",
        "nameAr": "مطار قيصري",
        "lat": 40.5912213785427,
        "lng": 28.766966468623785,
        "category": "transport"
      }
    ]
  },
  {
    "id": "17",
    "slug": "argos-in-cappadocia",
    "nameAr": "أرغوس في كابادوكيا",
    "nameEn": "Argos in Cappadocia",
    "city": "Cappadocia",
    "country": "Turkey",
    "neighborhoodAr": "أوتشيسار",
    "neighborhoodEn": "Uçhisar",
    "stars": 5,
    "rating": 9.6,
    "reviewCount": 237,
    "addressAr": "شارع كايا باشي رقم 7، 50240 أوتشيسار، نيفشهير، تركيا",
    "addressEn": "Kayabaşı Sk. No:7, 50240 Uçhisar, Nevşehir, Turkey",
    "descriptionAr": "أرغوس الحائز جوائز يمتد عبر مبانٍ كهفية في أوتشيسار. مطعما سكي وناهيتا ومسبح خارجي مُدفأ وسبا وقبو نبيذ وأجنحة دوبلكس بمسابح خاصة.",
    "descriptionEn": "Once a monastery, award-winning Argos in Cappadocia spreads individually appointed cave rooms and mansions across Uçhisar hillside buildings. Official sources highlight Seki and Nahita restaurants, heated outdoor pool, spa, wine cellar and duplex suites with private pools.",
    "highlightsAr": [
      "قرية كهفية مرممة",
      "دوبلكس بمسبح خاص",
      "مطاعم سكي/ناهيتا وقبو نبيذ"
    ],
    "highlightsEn": [
      "Restored cave village",
      "Private-pool duplex suites",
      "Seki / Nahita dining & wine cellar"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Heated outdoor pool",
      "Seki Restaurant",
      "Nahita Restaurant",
      "Spa",
      "Wine cellar",
      "Cave suites",
      "Private pool duplexes",
      "Free WiFi",
      "Concierge",
      "Parking"
    ],
    "nearbyAr": [
      "قلعة أوتشيسار — قريب",
      "وادي الحمام — قريب",
      "متحف غوريمه — 4 كم",
      "مطار نيفشهير — 48 كم",
      "أورغوب — بالسيارة"
    ],
    "nearbyEn": [
      "Uçhisar Castle — nearby",
      "Pigeon Valley — nearby",
      "Göreme Open-Air Museum — 4 km",
      "Nevşehir-Kapadokya Airport — 48 km",
      "Ürgüp — short drive"
    ],
    "rooms": [
      {
        "id": "17-r1",
        "nameAr": "غرفة كهفية سوبيريور",
        "nameEn": "Superior Cave Room",
        "descriptionAr": "غرفة كهفية محفورة في الصخر بإطلالة وادٍ.",
        "descriptionEn": "Cave room carved into natural stone with valley views.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 35,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "17-r2",
        "nameAr": "جناح كهفي",
        "nameEn": "Cave Suite",
        "descriptionAr": "جناح بمنطقة معيشة في كهف تاريخي.",
        "descriptionEn": "Suite with separate living area in historic cave.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 50,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "17-r1",
        "nameAr": "جناح حديقة",
        "nameEn": "Garden Suite",
        "descriptionAr": "جناح مطل على الحديقة مع تراس.",
        "descriptionEn": "Garden-facing suite with terrace.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 55,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "17-r1",
        "nameAr": "جناح دوبلكس بمسبح خاص",
        "nameEn": "Duplex Suite with Private Pool",
        "descriptionAr": "دوبلكس بطابقين ومسبح خاص — فئة توقيعية.",
        "descriptionEn": "Two-level duplex with private pool — signature category.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 80,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "17-r1",
        "nameAr": "جناح أرغوس",
        "nameEn": "Argos Suite",
        "descriptionAr": "جناح أرغوس العلوي بإطلالة بانورامية على كابادوكيا.",
        "descriptionEn": "Top Argos suite with panoramic Cappadocia views.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 90,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 38.657069107908285,
    "lng": 34.81894737041919,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في أرغوس في كابادوكيا",
    "whatsappMessageEn": "Hello, I would like to book at Argos in Cappadocia",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "17-gr1",
        "author": "Verified guest",
        "countryAr": "إيطاليا",
        "countryEn": "Italy",
        "rating": 9.5,
        "date": "",
        "titleAr": "كل شيء ممتاز",
        "titleEn": "Everything excellent",
        "textAr": "كان كل شيء ممتازاً حقاً. غرفة رائعة وطاقم لطيف جداً وسبا أحلام وطبخ استثنائي.",
        "textEn": "Era veramente tutto eccellente. Camera meravigliosa, personale gentilissimo, spa da sogno, cucina eccezionale",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "17-gr2",
        "author": "Verified guest",
        "countryAr": "إيطاليا",
        "countryEn": "Italy",
        "rating": 9,
        "date": "",
        "titleAr": "موقع استراتيجي",
        "titleEn": "Strategic location",
        "textAr": "الموقع قرب غوريمه والطاقم اللطيف والغرفة الجميلة والنظافة وبوفيه إفطار غني.",
        "textEn": "Tutto. La posizione strategica vicinissima al centro di goreme. Lo staff gentilissimo. Camera bellissima, tutto molto pulito. Colazione a buffet ricca.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "17-gr3",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 10,
        "date": "",
        "titleAr": "سحر الدير",
        "titleEn": "Monastery charm",
        "textAr": "كان ديراً؛ أرغوس يقدم غرفاً فردية في مبانٍ حجرية طبيعية مع واي فاي.",
        "textEn": "Once a monastery, the award-winning Argos offers individually appointed rooms spread over several natural stone buildings with free Wi-Fi.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "17-gr4",
        "author": "Verified guest",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "",
        "titleAr": "قرية كهفية",
        "titleEn": "Cave village",
        "textAr": "فندق قرية كهفية مرممة في أوتشيسار مع مطعم سكي وقبو نبيذ.",
        "textEn": "Restored hillside village hotel of cave houses in Uçhisar with Seki restaurant and wine cellar.",
        "source": "Tripadvisor",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "17-gr5",
        "author": "Verified guest",
        "countryAr": "فرنسا",
        "countryEn": "France",
        "rating": 10,
        "date": "",
        "titleAr": "دوبلكس بمسبح",
        "titleEn": "Private pool duplex",
        "textAr": "أجنحة الدوبلكس بمسابح خاصة من أبرز ما يقدمه أرغوس.",
        "textEn": "Duplex suites with private pools are a highlight at Argos in Cappadocia.",
        "source": "Tripadvisor",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "17-gr6",
        "author": "Verified guest",
        "countryAr": "ألمانيا",
        "countryEn": "Germany",
        "rating": 9,
        "date": "",
        "titleAr": "إطلالات الوادي",
        "titleEn": "Valley views",
        "textAr": "مسبح خارجي مُدفأ وتراسات مطلّة على وادي الحمام قرب قلعة أوتشيسار.",
        "textEn": "Heated outdoor pool and valley-facing terraces above Pigeon Valley near Uçhisar Castle.",
        "source": "Tripadvisor",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Uçhisar Castle",
        "nameAr": "قلعة أوتشيسار",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Pigeon Valley",
        "nameAr": "وادي الحمام",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Göreme Open",
        "nameAr": "متحف غوريمه",
        "lat": 40.985011148748555,
        "lng": 29.014292184224136,
        "category": "attraction"
      },
      {
        "nameEn": "Nevşehir",
        "nameAr": "مطار نيفشهير",
        "lat": 40.606997256762355,
        "lng": 28.774991689768072,
        "category": "transport"
      },
      {
        "nameEn": "Ürgüp",
        "nameAr": "أورغوب",
        "lat": 41.00987445651432,
        "lng": 28.975235729437475,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "18",
    "slug": "kayakapi-premium-caves",
    "nameAr": "كاياكابي بريميوم كيفز كابادوكيا",
    "nameEn": "Kayakapi Premium Caves Cappadocia",
    "city": "Cappadocia",
    "country": "Turkey",
    "neighborhoodAr": "أورغوب",
    "neighborhoodEn": "Ürgüp",
    "stars": 5,
    "rating": 9.2,
    "reviewCount": 207,
    "addressAr": "محلة كاياكابي، شارع كوشجولار رقم 43، 50400 أورغوب، نيفشهير، تركيا",
    "addressEn": "Kayakapi Mah. Kuşçular Sok. No:43, 50400 Ürgüp, Nevşehir, Turkey",
    "descriptionAr": "في كهوف تاريخية مرممة في أورغوب مع واي فاي وأجنحة أنيقة بإطلالة كابادوكيا. تدفئة أرضية وتكييف وتلفزيون وقهوة نسبريسو؛ بعضها بمدفأة وتراس. مطعم مايده وبيسترو منظرة. سبا كاياكابي بجانب المسبح. موقف خاص مجاني.",
    "descriptionEn": "Set in restored historical caves in Ürgüp with free WiFi and elegantly decorated suites overlooking Cappadocia. Rooms feature floor heating, A/C, HD LED TV, Nespresso, docking station; some have fireplace and private terrace/patio. Maide Restaurant breakfast buffet and à la carte; Bistro Manzara for snacks. Kayakapi Spa at historic Davut Agha Mansion beside the pool. Free private parking; shuttle to Ürgüp centre on request.",
    "highlightsAr": [
      "أجنحة كهفية مرممة",
      "سبا ومسبح",
      "إفطار مطعم مايده"
    ],
    "highlightsEn": [
      "Restored cave suites",
      "Spa + pool",
      "Maide Restaurant breakfast"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Free WiFi",
      "Outdoor pool",
      "Kayakapi Spa",
      "Maide Restaurant",
      "Bistro Manzara",
      "Free private parking",
      "Cave suites",
      "Fireplace rooms (select)",
      "24h front desk"
    ],
    "nearbyAr": [
      "مركز أورغوب — باص",
      "منتزه غوريمه — 8.5 كم",
      "أفانوس — 13 كم",
      "مطار نيفشهير كابادوكيا — 48 كم"
    ],
    "nearbyEn": [
      "Ürgüp centre — shuttle",
      "Göreme National Park — 8.5 km",
      "Avanos — 13 km",
      "Nevşehir-Kapadokya Airport — 48 km"
    ],
    "rooms": [
      {
        "id": "18-r1",
        "nameAr": "جناح كهفي",
        "nameEn": "Cave Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "18-r2",
        "nameAr": "جناح كهفي ماجستيك",
        "nameEn": "Majestic Cave Suite",
        "descriptionAr": "e.g. Room 102 cited in guest quote",
        "descriptionEn": "e.g. Room 102 cited in guest quote",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 63,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "18-r1",
        "nameAr": "جناح مع تراس",
        "nameEn": "Suite with Terrace",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "18-r1",
        "nameAr": "غرفة كهفية ديلوكس",
        "nameEn": "Deluxe Cave Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "18-r1",
        "nameAr": "جناح كهفي عائلي",
        "nameEn": "Family Cave Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 38.63647794685192,
    "lng": 34.835582976467315,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 14:30",
      "تسجيل المغادرة حتى 11:30"
    ],
    "policiesEn": [
      "Check-in from 14:30",
      "Check-out until 11:30"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في كاياكابي بريميوم كيفز كابادوكيا",
    "whatsappMessageEn": "Hello, I would like to book at Kayakapi Premium Caves Cappadocia",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "18-gr1",
        "author": "Sagarshah",
        "countryAr": "الهند",
        "countryEn": "India",
        "rating": 10,
        "date": "",
        "titleAr": "نظيف ومجهّز جيداً",
        "titleEn": "Clean and well equipped",
        "textAr": "الغرفة نظيفة ومجهّزة. الإفطار مذهل بتنوعه خاصة الشوكولاتة الساخنة والفواكه والمخبوزات.",
        "textEn": "Room was clean and well equipped. Breakfast was amazing with wide variety of food items, especially the hot chocolate, fruits, bakery items. Room service was great.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "18-gr2",
        "author": "Sophie",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "",
        "titleAr": "طاقم ودود",
        "titleEn": "Friendly staff",
        "textAr": "طاقم ودود ومفيد وطعام لذيذ وغرفة مريحة جداً.",
        "textEn": "Staff were very friendly and helpful, food was delicious and the room v comfortable",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "18-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "عمارة وحمّام",
        "titleEn": "Architecture & hammam",
        "textAr": "العمارة والتصميم والضيافة رائعة. غرف واسعة مع حمّام.",
        "textEn": "The Architecture and the design. Hospitality was great. Fabulous Ambience. large size rooms with hammam",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "18-gr4",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "جناح كهفي ماجستيك",
        "titleEn": "Majestic Cave Suite",
        "textAr": "جناح كهفي ماجستيك (غرفة 102) كان رائعاً. قريب من الاستقبال وهادئ جداً.",
        "textEn": "The Majestic Cave Suite we were allocated (Room 102) was wonderful. It was very close to reception but still extremely quiet.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Ürgüp centre",
        "nameAr": "مركز أورغوب",
        "lat": 41.017194572847345,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Göreme National Park",
        "nameAr": "منتزه غوريمه",
        "lat": 41.039868400406206,
        "lng": 29.073249406258004,
        "category": "attraction"
      },
      {
        "nameEn": "Avanos",
        "nameAr": "أفانوس",
        "lat": 40.92878623343281,
        "lng": 29.091449598728442,
        "category": "attraction"
      },
      {
        "nameEn": "Nevşehir",
        "nameAr": "مطار نيفشهير كابادوكيا",
        "lat": 40.606997256762355,
        "lng": 28.774991689768072,
        "category": "transport"
      }
    ]
  },
  {
    "id": "19",
    "slug": "cappadocia-cave-resort",
    "nameAr": "كابادوكيا كيف ريزورت آند سبا",
    "nameEn": "Cappadocia Cave Resort & Spa",
    "city": "Cappadocia",
    "country": "Turkey",
    "neighborhoodAr": "أورغوب",
    "neighborhoodEn": "Ürgüp",
    "stars": 5,
    "rating": 8,
    "reviewCount": 61,
    "addressAr": "محلة تكيلي، منطقة أوتشيسار/أورغوب، نيفشهير، تركيا",
    "addressEn": "Tekelli Mah., Uçhisar / Ürgüp area, Nevşehir, Turkey",
    "descriptionAr": "منتجع كهوف وسبا خمس نجوم في أوتشيسار بـ121 غرفة وجناح محفورة في التلة، سبا وحمّام ومسبح خارجي ومطعمان وقبو نبيذ وإطلالات وادٍ على المداخن الجنية والمناطيد.",
    "descriptionEn": "CCR Cappadocia Cave Resort & Spa is a 5-star cave resort in Uçhisar with 121 rooms and suites carved into the hillside, spa/hammam, outdoor pool, two restaurants, cave wine cellar and panoramic valley views toward fairy chimneys and balloon flights.",
    "highlightsAr": [
      "إطلالات وادٍ ومناطيد",
      "قبو نبيذ وسبا كهفي",
      "121 غرفة وجناح كهفي"
    ],
    "highlightsEn": [
      "Panoramic balloon-valley views",
      "Cave wine cellar & spa",
      "121 cave rooms & suites"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Spa / Hammam",
      "Outdoor pool",
      "Cave rooms & suites",
      "Restaurant",
      "Cave wine cellar",
      "Free WiFi",
      "Terrace valley views",
      "Parking",
      "Fitness",
      "Meeting rooms",
      "Room service",
      "Airport shuttle"
    ],
    "nearbyAr": [
      "أوتشيسار — في الموقع",
      "غوريمه — بالسيارة",
      "مناظر المداخن — قريب",
      "مطار نيفشهير — 48 كم",
      "وادي الحمام — قريب"
    ],
    "nearbyEn": [
      "Uçhisar — on site",
      "Göreme — short drive",
      "Fairy chimney viewpoints — nearby",
      "Nevşehir-Kapadokya Airport — 48 km",
      "Pigeon Valley — nearby"
    ],
    "rooms": [
      {
        "id": "19-r1",
        "nameAr": "غرفة كهفية قياسية",
        "nameEn": "Standard Cave Room",
        "descriptionAr": "غرفة قياسية محفورة بإطلالة وادٍ.",
        "descriptionEn": "Carved-rock standard room with valley outlook.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 28,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "19-r2",
        "nameAr": "غرفة كهفية ديلوكس",
        "nameEn": "Deluxe Cave Room",
        "descriptionAr": "غرفة كهفية ديلوكس بمساحة أكبر.",
        "descriptionEn": "Deluxe cave room with enhanced space.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 35,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "19-r1",
        "nameAr": "جناح كهفي",
        "nameEn": "Cave Suite",
        "descriptionAr": "جناح بمنطقة معيشة وتراس.",
        "descriptionEn": "Suite with living area and terrace.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 55,
        "price": 340,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "19-r1",
        "nameAr": "جناح كهفي عائلي",
        "nameEn": "Family Cave Suite",
        "descriptionAr": "جناح عائلي حتى 4 ضيوف.",
        "descriptionEn": "Family suite for up to 4 guests.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 70,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "19-r1",
        "nameAr": "جناح سبا",
        "nameEn": "Spa Suite",
        "descriptionAr": "جناح بمرافق سبا وحمام.",
        "descriptionEn": "Suite with spa bath / wellness features.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 60,
        "price": 550,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 38.65068658557829,
    "lng": 34.81485628373954,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 14:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 14:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في كابادوكيا كيف ريزورت آند سبا",
    "whatsappMessageEn": "Hello, I would like to book at Cappadocia Cave Resort & Spa",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "19-gr1",
        "author": "Tusanai",
        "countryAr": "تايلاند",
        "countryEn": "Thailand",
        "rating": 8,
        "date": "May 2015",
        "titleAr": "مبهر",
        "titleEn": "Impressive",
        "textAr": "فندق جيد للعطلة. طاقم منتبه يساعد في كل شيء. موصى به بشدة.",
        "textEn": "Good hotel. Perfect for a vacation. Attentive staff always going all out to help everything we needed. Generally Highly Recommended.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "19-gr2",
        "author": "Stefanus",
        "countryAr": "إندونيسيا",
        "countryEn": "Indonesia",
        "rating": 8.3,
        "date": "July 2015",
        "titleAr": "صيف في كابادوكيا",
        "titleEn": "Summer in Cappadocia",
        "textAr": "إطلالة رائعة وطاقم ودود وغرفة نظيفة.",
        "textEn": "Great View, Friendly Staff and Clean Room",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "19-gr3",
        "author": "Saleh",
        "countryAr": "اليمن",
        "countryEn": "Yemen",
        "rating": 8.7,
        "date": "July 2015",
        "titleAr": "مثير جداً",
        "titleEn": "Very exciting",
        "textAr": "أحببت: الناس والموقع والعناية الشخصية. رائع.",
        "textEn": "Things I like: people, location and personal care. Great",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "19-gr4",
        "author": "Verified guest",
        "countryAr": "الكويت",
        "countryEn": "Kuwait",
        "rating": 2,
        "date": "February 2022",
        "titleAr": "تجربة قديمة",
        "titleEn": "Outdated experience",
        "textAr": "تجربة قديمة جداً! الخدمات تحتاج ترقية. مقابس كهرباء قليلة والمطعم ضعيف.",
        "textEn": "It's a very outdated experience! services need to be upgraded. Room had very minimal electricity outlets. Restaurant was very poor and service was slow.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "19-gr5",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 8,
        "date": "",
        "titleAr": "إطلالات المناطيد",
        "titleEn": "Balloon views",
        "textAr": "يمدح الضيوف الإطلالات البانورامية على الوادي وخلفية المناطيد من موقع أوتشيسار المرتفع.",
        "textEn": "Guests praise panoramic valley views and hot-air balloon backdrop from the elevated Uçhisar position.",
        "source": "Tripadvisor",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "19-gr6",
        "author": "Verified guest",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 8.4,
        "date": "",
        "titleAr": "أجواء الكهف",
        "titleEn": "Cave atmosphere",
        "textAr": "إطلالات بانورامية خلابة على الوادي ورحلات المناطيد من هذا المنتجع الكهفي.",
        "textEn": "Breathtaking panoramic views of the valley and balloon flights from this cave resort and spa.",
        "source": "Tripadvisor",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Uçhisar",
        "nameAr": "أوتشيسار",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Göreme",
        "nameAr": "غوريمه",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Fairy chimney viewpoints",
        "nameAr": "مناظر المداخن",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Nevşehir",
        "nameAr": "مطار نيفشهير",
        "lat": 40.606997256762355,
        "lng": 28.774991689768072,
        "category": "transport"
      },
      {
        "nameEn": "Pigeon Valley",
        "nameAr": "وادي الحمام",
        "lat": 41.00987445651432,
        "lng": 28.975235729437475,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "20",
    "slug": "zorlu-grand-trabzon",
    "nameAr": "زورلو جراند هوتيل طرابزون",
    "nameEn": "Zorlu Grand Hotel Trabzon",
    "city": "Trabzon",
    "country": "Turkey",
    "neighborhoodAr": "وسط طرابزون",
    "neighborhoodEn": "Trabzon Center",
    "stars": 5,
    "rating": 8.6,
    "reviewCount": 869,
    "addressAr": "مراش جادسي رقم 9، وسط مدينة طرابزون، تركيا",
    "addressEn": "Maraş Caddesi No:9, Trabzon City Center, Trabzon, Turkey",
    "descriptionAr": "في وسط طرابزون، فندق خمس نجوم يمزج العمارة التقليدية بالتأثيرات الحديثة. واي فاي سريع وتلفزيون فضائي؛ نادي صحي بمسبح داخلي. غرف بألوان دافئة وأثاث خشبي وميني بار؛ بعضها بمنطقة جلوس منفصلة.",
    "descriptionEn": "Located in the centre of Trabzon, this 5-star hotel mixes traditional architecture with modern influences. Rooms offer free high-speed WiFi and satellite TV; facilities include a health club with an indoor pool. Rooms feature warm colours and wooden furniture, minibar, tea/coffee facilities and en suite bathrooms; some have separate seating areas.",
    "highlightsAr": [
      "خمس نجوم وسط المدينة",
      "مسبح داخلي ونادي صحي",
      "تصميم تقليدي-حديث"
    ],
    "highlightsEn": [
      "City-centre 5-star",
      "Indoor pool & health club",
      "Traditional-modern design"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Indoor pool",
      "Health club / hammam",
      "Free high-speed WiFi",
      "Satellite TV",
      "Minibar",
      "Tea/coffee facilities",
      "Restaurant",
      "Parking",
      "Room service",
      "Fitness",
      "Business centre"
    ],
    "nearbyAr": [
      "وسط طرابزون — في الموقع",
      "آيا صوفيا طرابزون — بالسيارة",
      "فوروم طرابزون — بالسيارة",
      "جناح أتاتورك — 3.8 كم",
      "مطار طرابزون — بالسيارة"
    ],
    "nearbyEn": [
      "Trabzon city centre — on site",
      "Hagia Sophia Trabzon — short drive",
      "Forum Trabzon — short drive",
      "Atatürk Pavilion — 3.8 km",
      "Trabzon Airport — drive"
    ],
    "rooms": [
      {
        "id": "20-r1",
        "nameAr": "غرفة قياسية",
        "nameEn": "Standard Room",
        "descriptionAr": "غرفة بألوان دافئة وأثاث خشبي وميني بار وحمام.",
        "descriptionEn": "Warm-coloured room with wooden furniture, minibar and en suite.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 28,
        "price": 95,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "20-r2",
        "nameAr": "غرفة سوبيريور",
        "nameEn": "Superior Room",
        "descriptionAr": "فئة سوبيريور مع تلفزيون فضائي وشاي/قهوة.",
        "descriptionEn": "Superior category with satellite TV and tea/coffee.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 32,
        "price": 120,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "20-r1",
        "nameAr": "غرفة ديلوكس",
        "nameEn": "Deluxe Room",
        "descriptionAr": "غرفة ديلوكس؛ بعضها بمنطقة جلوس منفصلة.",
        "descriptionEn": "Deluxe room; some with separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 150,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "20-r1",
        "nameAr": "جناح جونيور",
        "nameEn": "Junior Suite",
        "descriptionAr": "جناح جونيور بمساحة جلوس.",
        "descriptionEn": "Junior suite with lounge space.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 50,
        "price": 185,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "20-r1",
        "nameAr": "جناح مع منطقة جلوس",
        "nameEn": "Suite with seating area",
        "descriptionAr": "جناح بجلوس منفصل وإطلالة وسط المدينة.",
        "descriptionEn": "Suite with separate seating and city-centre views.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 55,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 41.00020868273182,
    "lng": 39.73060929735387,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في زورلو جراند هوتيل طرابزون",
    "whatsappMessageEn": "Hello, I would like to book at Zorlu Grand Hotel Trabzon",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "20-gr1",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 9,
        "date": "",
        "titleAr": "طاقم ودود",
        "titleEn": "Friendly staff",
        "textAr": "كل شيء ممتاز. الطاقم ودود جداً والموقع رائع.",
        "textEn": "Everything was excellent. The staff was so friendly. Location was great",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "20-gr2",
        "author": "Verified guest",
        "countryAr": "السعودية",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "",
        "titleAr": "الأفضل في طرابزون",
        "titleEn": "Best in Trabzon",
        "textAr": "إقامة رائعة. غرف نظيفة ومريحة. الموقع في قلب طرابزون. إفطار لذيذ ومتنوع.",
        "textEn": "My stay at Zorlu Grand Hotel was truly wonderful. The rooms were clean, comfortable, and well-maintained. The location is outstanding — right in the heart of Trabzon. The breakfast was delicious with a wide variety of fresh options every morning.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "20-gr3",
        "author": "Verified guest",
        "countryAr": "الإمارات",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "",
        "titleAr": "لوبي مثالي",
        "titleEn": "Perfect lobby",
        "textAr": "فندق مثالي بلوبي رائع. طاقم ودود وترقية لأجنحة. غرفة واسعة وعازلة وإفطار لذيذ.",
        "textEn": "Perfect hotel with great lobby. Staff very friendly and they upgraded our reservations to suite rooms. Room was spacious and sound proof with comfortable bed. Breakfast is delicious.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "20-gr4",
        "author": "Verified guest",
        "countryAr": "الكويت",
        "countryEn": "Kuwait",
        "rating": 8,
        "date": "",
        "titleAr": "وسط المدينة",
        "titleEn": "City centre",
        "textAr": "أعتقده أفضل فندق في طرابزون للموقع المركزي والنادي الصحي بمسبح داخلي.",
        "textEn": "I think it's the best hotel in Trabzon for central location and indoor pool health club.",
        "source": "Booking.com",
        "stayTypeAr": "رحلة عمل",
        "stayTypeEn": "Business trip"
      },
      {
        "id": "20-gr5",
        "author": "Verified guest",
        "countryAr": "ألمانيا",
        "countryEn": "Germany",
        "rating": 9,
        "date": "",
        "titleAr": "حمّام لطيف",
        "titleEn": "Hammam nice",
        "textAr": "الحمّام التركي لطيف ونظيف. غرف بألوان دافئة وأثاث خشبي.",
        "textEn": "Turkish hammam is nice and clean. Rooms decorated with warm colours and wooden furniture.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "20-gr6",
        "author": "Verified guest",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 8,
        "date": "",
        "titleAr": "غرف عازلة",
        "titleEn": "Soundproof rooms",
        "textAr": "في وسط طرابزون، فندق خمس نجوم يمزج التقليدي والحديث. نادي صحي بمسبح داخلي.",
        "textEn": "Located in the centre of Trabzon, 5-star hotel mixing traditional architecture with modern influences. Health club with indoor pool.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Trabzon city centre",
        "nameAr": "وسط طرابزون",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Hagia Sophia Trabzon",
        "nameAr": "آيا صوفيا طرابزون",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Forum Trabzon",
        "nameAr": "فوروم طرابزون",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Atatürk Pavilion",
        "nameAr": "جناح أتاتورك",
        "lat": 40.97809561616035,
        "lng": 28.963770175439972,
        "category": "attraction"
      },
      {
        "nameEn": "Trabzon Airport",
        "nameAr": "مطار طرابزون",
        "lat": 41.00974891302864,
        "lng": 28.970471458874954,
        "category": "transport"
      }
    ]
  },
  {
    "id": "21",
    "slug": "novotel-trabzon",
    "nameAr": "نوفوتيل طرابزون",
    "nameEn": "Novotel Trabzon",
    "city": "Trabzon",
    "country": "Turkey",
    "neighborhoodAr": "يومرا / المطار",
    "neighborhoodEn": "Yomra / Airport area",
    "stars": 4,
    "rating": 8,
    "reviewCount": 1376,
    "addressAr": "طريق الولاية يومرا، طرابزون، تركيا",
    "addressEn": "State Road Yomra, Trabzon, Turkey",
    "descriptionAr": "نوفوتيل طرابزون يطل على البحر الأسود في يومرا، 8 دقائق من الوسط وقرب مول جواهير. غرف عصرية ومسبح بإطلالة ومطعم وعافية وطاقم استقبال مفيد.",
    "descriptionEn": "Novotel Trabzon overlooks the Black Sea on the Yomra coast, 8 minutes from the city centre and walking distance to Cevahir Shopping Mall. Modern rooms, pool with view, restaurant, wellness facilities and helpful front-desk team noted by guests.",
    "highlightsAr": [
      "موقع يومرا على البحر",
      "قرب مول جواهير",
      "مسبح مناسب للعائلات"
    ],
    "highlightsEn": [
      "Seafront Yomra location",
      "Near Cevahir Mall",
      "Family-friendly pool"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Pool with view",
      "Indoor pool",
      "Bar / poolside bar",
      "Free WiFi",
      "Fitness / wellness",
      "Restaurant",
      "Meeting rooms",
      "Laundry",
      "Parking",
      "Kids play area",
      "Room service"
    ],
    "nearbyAr": [
      "مطار طرابزون — نحو 5 دقائق",
      "مول جواهير — سيراً",
      "ساحل يومرا — في الموقع",
      "وسط طرابزون — 8 دقائق",
      "دير كايمكلي — 8.1 كم"
    ],
    "nearbyEn": [
      "Trabzon Airport — ~5 min",
      "Cevahir Shopping Mall — walking",
      "Yomra coast / beach — on site",
      "Trabzon city centre — 8 min drive",
      "Kaymakli Monastery — 8.1 km"
    ],
    "rooms": [
      {
        "id": "21-r1",
        "nameAr": "غرفة دبل سوبيريور",
        "nameEn": "Superior Double Room",
        "descriptionAr": "سوبيريور 25 م² بإطلالة حديقة.",
        "descriptionEn": "25 sqm superior with garden view.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 25,
        "price": 95,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "21-r2",
        "nameAr": "غرفة توين سوبيريور",
        "nameEn": "Superior Twin Room",
        "descriptionAr": "توين سوبيريور قرب البحر/المول.",
        "descriptionEn": "Twin superior near sea/mall.",
        "beds": "2 Twin",
        "capacity": 2,
        "sizeSqm": 25,
        "price": 120,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "21-r1",
        "nameAr": "غرفة تنفيذية دبل",
        "nameEn": "Executive Room with 1 Double Bed",
        "descriptionAr": "تنفيذية 26 م² بإطلالة حديقة.",
        "descriptionEn": "26 sqm executive with garden view.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 26,
        "price": 150,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "21-r1",
        "nameAr": "تنفيذية إطلالة بحر",
        "nameEn": "Executive Room Sea View",
        "descriptionAr": "تنفيذية 26 م² مطلّة على البحر.",
        "descriptionEn": "26 sqm executive facing the sea.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 26,
        "price": 185,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "21-r1",
        "nameAr": "جناح مع غرفة معيشة",
        "nameEn": "Suite with living room",
        "descriptionAr": "جناح 75 م² بأريكة وإطلالة بحر.",
        "descriptionEn": "75 sqm suite with sofa and sea view.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 75,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.99622875230796,
    "lng": 39.72780969926473,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في نوفوتيل طرابزون",
    "whatsappMessageEn": "Hello, I would like to book at Novotel Trabzon",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "21-gr1",
        "author": "Jinan",
        "countryAr": "قطر",
        "countryEn": "Qatar",
        "rating": 10,
        "date": "August 2024",
        "titleAr": "استثنائي",
        "titleEn": "Exceptional",
        "textAr": "إقامة قصيرة. غرف نظيفة. إفطار جيد جداً. مرافق ممتازة. قرب المطار.",
        "textEn": "We had a short stay, rooms are neat and clean. Breakfast is really good. Facilities excellent. Near the airport",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "21-gr2",
        "author": "Rabi",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 10,
        "date": "September 2025",
        "titleAr": "إقامة عائلية",
        "titleEn": "Family stay",
        "textAr": "استمتعت مع عائلتي. نظيف بجانب الشاطئ. مشينا على الشاطئ ولعبت ابنتي في منطقة الأطفال.",
        "textEn": "i thoroughly enjoyed my stay with my family. its neat and clean and right next to the beach. i got to enjoy the walk on the beach and help my daughter play inside the playing area for kids",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "21-gr3",
        "author": "Mohammed",
        "countryAr": "الإمارات",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "April 2026",
        "titleAr": "طاقم رائع",
        "titleEn": "Great staff",
        "textAr": "الطاقم لطيف خاصة موظفة الاستقبال بشرى المحترفة والمتعاونة.",
        "textEn": "The staff was kind especially receptionist Bushra who was very professional and cooperative.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "21-gr4",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 8,
        "date": "",
        "titleAr": "موقع مول جواهير",
        "titleEn": "Cevahir Mall location",
        "textAr": "تجربتنا مثالية. الفندق أمام مول جواهير مع موقف وطاقم رائع.",
        "textEn": "Our experiment in the hotel was perfect. The hotel located in unique place in front of Cevahir Mall. They have parking and the staff is amazing.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "21-gr5",
        "author": "Omar",
        "countryAr": "فلسطين",
        "countryEn": "Palestinian Territory",
        "rating": 7.6,
        "date": "October 2025",
        "titleAr": "جيد",
        "titleEn": "Good",
        "textAr": "تجربة جيدة.",
        "textEn": "Good experience",
        "source": "Booking.com",
        "stayTypeAr": "مسافر منفرد",
        "stayTypeEn": "Solo traveler"
      },
      {
        "id": "21-gr6",
        "author": "MUNEER",
        "countryAr": "السعودية",
        "countryEn": "Saudi Arabia",
        "rating": 4.4,
        "date": "June 2024",
        "titleAr": "مسبح للأطفال",
        "titleEn": "Pool for kids",
        "textAr": "الموقع بجانب البحر والمول. أحببت المسبح الداخلي لأن أطفالي استمتعوا به.",
        "textEn": "the location is beside the sea and a mall. I only loved the inside pool because my kids enjoy it",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Trabzon Airport",
        "nameAr": "مطار طرابزون",
        "lat": 41.08235042319616,
        "lng": 28.98,
        "category": "transport"
      },
      {
        "nameEn": "Cevahir Shopping Mall",
        "nameAr": "مول جواهير",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Yomra coast / beach",
        "nameAr": "ساحل يومرا",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "nature"
      },
      {
        "nameEn": "Trabzon city centre",
        "nameAr": "وسط طرابزون",
        "lat": 40.90192809768843,
        "lng": 28.92502360480614,
        "category": "attraction"
      },
      {
        "nameEn": "Kaymakli Monastery",
        "nameAr": "دير كايمكلي",
        "lat": 41.00745774441496,
        "lng": 28.8835235211089,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "22",
    "slug": "radisson-blu-trabzon",
    "nameAr": "رادسون بلو هوتيل طرابزون",
    "nameEn": "Radisson Blu Hotel Trabzon",
    "city": "Trabzon",
    "country": "Turkey",
    "neighborhoodAr": "وسط المدينة",
    "neighborhoodEn": "City center",
    "stars": 5,
    "rating": 8.4,
    "reviewCount": 1399,
    "addressAr": "محلة بوزتبه، أورتا حصار، 61030 طرابزون، تركيا",
    "addressEn": "Boztepe Mah., Ortahisar, 61030 Trabzon, Turkey",
    "descriptionAr": "على تلة بوزتبه في طرابزون، على بعد نحو 1.8 ميل من متحف آيا صوفيا و2.5 من فوروم طرابزون. مطعم ومسبح داخلي. بعض الغرف بشرفة وإطلالة بحر. مطار طرابزون نحو 3.7 ميل.",
    "descriptionEn": "Set in Trabzon on the Boztepe hillside, Radisson Blu is about 1.8 mi from Hagia Sophia Museum and 2.5 mi from Forum Trabzon. On-site restaurant and indoor swimming pool. Some rooms have balcony and sea view. Couples rate location ~9.0 for two-person trips. Nearest airport Trabzon Airport ~3.7 mi.",
    "highlightsAr": [
      "إطلالات تلة بوزتبه",
      "مسبح داخلي",
      "شرفات بإطلالة بحر"
    ],
    "highlightsEn": [
      "Boztepe hill views",
      "Indoor pool",
      "Sea-view balconies"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Indoor swimming pool",
      "Restaurant",
      "Bar",
      "Free WiFi",
      "Fitness",
      "Sauna / steam (guest notes)",
      "Sea-view rooms",
      "Parking",
      "Family rooms"
    ],
    "nearbyAr": [
      "متحف آيا صوفيا — 1.8 ميل",
      "فوروم طرابزون — 2.5 ميل",
      "متحف طرابزون — ~0.6 ميل",
      "مطار طرابزون — 3.7 ميل"
    ],
    "nearbyEn": [
      "Hagia Sophia Museum — 1.8 mi",
      "Forum Trabzon — 2.5 mi",
      "Trabzon Museum — ~0.6 mi",
      "Trabzon Airport — 3.7 mi"
    ],
    "rooms": [
      {
        "id": "22-r1",
        "nameAr": "غرفة دبل/توين إطلالة بحر وشرفة",
        "nameEn": "Double or Twin Room with Sea View and Balcony",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 95,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "22-r2",
        "nameAr": "غرفة دبل/توين إطلالة جبل وشرفة",
        "nameEn": "Double or Twin Room with Mountain View and Balcony",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 120,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "22-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 150,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "22-r1",
        "nameAr": "جناح فاخر",
        "nameEn": "Luxury Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 185,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "22-r1",
        "nameAr": "غرفة دبل/توين قياسية",
        "nameEn": "Standard Double or Twin Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.98818256255607,
    "lng": 39.70471906281942,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في رادسون بلو هوتيل طرابزون",
    "whatsappMessageEn": "Hello, I would like to book at Radisson Blu Hotel Trabzon",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "22-gr1",
        "author": "Alice",
        "countryAr": "الولايات المتحدة",
        "countryEn": "United States",
        "rating": 10,
        "date": "2 May 2025",
        "titleAr": "أحببت البخار والساونا",
        "titleEn": "Loved steam and sauna",
        "textAr": "طاقم ممتاز وغرف مريحة وخدمة رائعة. أحببت الوصول للبخار والساونا.",
        "textEn": "Excellent staff. Comfortable rooms. Great customer service. It was great to stretch out and be comfortable for a few days. Loved having access to the steam and sauna",
        "source": "Booking.com",
        "stayTypeAr": "مجموعة أصدقاء",
        "stayTypeEn": "People with friends"
      },
      {
        "id": "22-gr2",
        "author": "Heba",
        "countryAr": "الإمارات العربية المتحدة",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "22 April 2025",
        "titleAr": "فندق موصى به بشدة",
        "titleEn": "Highly recommended hotel",
        "textAr": "فندق مذهل وطاقم ودود.",
        "textEn": "Amazing hotel and friendly staff",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr3",
        "author": "Russell",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 8,
        "date": "22 April 2025",
        "titleAr": "فندق لطيف جداً — سأعود",
        "titleEn": "A really nice hotel - I would stay here again.",
        "textAr": "فندق رائع — غرفة عصرية واسعة بإطلالة مدينة وساحل على تلة. طاقم ودود وقيمة جيدة.",
        "textEn": "Great hotel - A very modern, spacious room with a great view of the city and the coast (the hotel is on a hill, 200m above sea level). Staff were friendly and helpful. Good value; breakfast and evening food options were also good.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr4",
        "author": "Hadi",
        "countryAr": "الكويت",
        "countryEn": "Kuwait",
        "rating": 8,
        "date": "15 April 2025",
        "titleAr": "كان يمكن أن يكون أفضل",
        "titleEn": "I could have been better",
        "textAr": "الموقع والطاقم رائعان لكن نظافة الغرفة ضعيفة بسبب السجاد القديم ورائحته.",
        "textEn": "The location and staff are great but the cleanliness of the room was not good because the carpet are very old and not cleaned so it give a very bad smell in the room",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr5",
        "author": "Mamoun",
        "countryAr": "الأردن",
        "countryEn": "Jordan",
        "rating": 8,
        "date": "1 April 2025",
        "titleAr": "إقامة جيدة",
        "titleEn": "Great stay",
        "textAr": "طاقم مفيد وإفطار متنوع وسرير مريح وإطلالة ممتازة.",
        "textEn": "Staff very helpful, breakfast is good and various, bed in comfortable, all utilities included , room view excellent",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "22-gr6",
        "author": "Alice",
        "countryAr": "United States",
        "countryEn": "United States",
        "rating": 10,
        "date": "2 May 2025",
        "titleAr": "It was great to stretch out and be comfortable for a few days. Loved having access to the steam and sauna",
        "titleEn": "It was great to stretch out and be comfortable for a few days. Loved having access to the steam and sauna",
        "textAr": "Excellent staff. Comfortable rooms. Great customer service",
        "textEn": "Excellent staff. Comfortable rooms. Great customer service",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr7",
        "author": "Russell",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 8,
        "date": "22 April 2025",
        "titleAr": "A really nice hotel - I would stay here again.",
        "titleEn": "A really nice hotel - I would stay here again.",
        "textAr": "The hotel is a little distance away from the city centre - so you need to walk, or drive into the town. Great hotel - A very modern, spacious room with a great view of the city and the coast (the hotel is on a hill, 200m above sea level). Staff were friendly and helpful. The hotel was good value for money. The breakfast and evening food options were also good.",
        "textEn": "The hotel is a little distance away from the city centre - so you need to walk, or drive into the town. Great hotel - A very modern, spacious room with a great view of the city and the coast (the hotel is on a hill, 200m above sea level). Staff were friendly and helpful. The hotel was good value for money. The breakfast and evening food options were also good.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr8",
        "author": "Shneneh",
        "countryAr": "Palestinian Territory",
        "countryEn": "Palestinian Territory",
        "rating": 10,
        "date": "14 April 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Everything was amazing!! Highly recommend",
        "textEn": "Everything was amazing!! Highly recommend",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr9",
        "author": "Hesham",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "12 April 2025",
        "titleAr": "Great staying",
        "titleEn": "Great staying",
        "textAr": "Cleaning and location and stuff",
        "textEn": "Cleaning and location and stuff",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr10",
        "author": "Mamoun",
        "countryAr": "Jordan",
        "countryEn": "Jordan",
        "rating": 8,
        "date": "1 April 2025",
        "titleAr": "Great stay",
        "titleEn": "Great stay",
        "textAr": "Direction to location, AC was not working and room was very hot Staff very helpful, breakfast is good and various, bed in comfortable, all utilities included , room view excellent",
        "textEn": "Direction to location, AC was not working and room was very hot Staff very helpful, breakfast is good and various, bed in comfortable, all utilities included , room view excellent",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr11",
        "author": "Fadwa",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 8,
        "date": "21 February 2025",
        "titleAr": "Finaly we get our appatment we paid for n Trabzon after ten years waitting .",
        "titleEn": "Finaly we get our appatment we paid for n Trabzon after ten years waitting .",
        "textAr": "Everything was fine with more little work it will be rxellent .",
        "textEn": "Everything was fine with more little work it will be rxellent .",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr12",
        "author": "Basel",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "31 January 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "Breakfast at the room was bad yet pricy Kind staff and great view",
        "textEn": "Breakfast at the room was bad yet pricy Kind staff and great view",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr13",
        "author": "Habibulrahman",
        "countryAr": "Saint Kitts and Nevis",
        "countryEn": "Saint Kitts and Nevis",
        "rating": 9,
        "date": "3 January 2025",
        "titleAr": "Rooms cleaning staff was making noise and started cleaning early around 8:00 am",
        "titleEn": "Rooms cleaning staff was making noise and started cleaning early around 8:00 am",
        "textAr": "Cleaning staff was annoying started at 8:00 am",
        "textEn": "Cleaning staff was annoying started at 8:00 am",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr14",
        "author": "Difaii",
        "countryAr": "Australia",
        "countryEn": "Australia",
        "rating": 10,
        "date": "25 December 2024",
        "titleAr": "Everyone was helpful and kin",
        "titleEn": "Everyone was helpful and kin",
        "textAr": "Nothing i can think of The view is phenomenal",
        "textEn": "Nothing i can think of The view is phenomenal",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr15",
        "author": "Osamah",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 7,
        "date": "13 December 2024",
        "titleAr": "Good location, but I don’t think I will come back again",
        "titleEn": "Good location, but I don’t think I will come back again",
        "textAr": "Their team good do better service. Breakfast is below average. Their good location will have no benefit as the service quality below expectations and the road to reach there is not easy. The view as it is at good elevation",
        "textEn": "Their team good do better service. Breakfast is below average. Their good location will have no benefit as the service quality below expectations and the road to reach there is not easy. The view as it is at good elevation",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr16",
        "author": "Dumbadze",
        "countryAr": "Georgia",
        "countryEn": "Georgia",
        "rating": 10,
        "date": "11 December 2024",
        "titleAr": "Good rest with good view",
        "titleEn": "Good rest with good view",
        "textAr": "road to hotel , 2 days road was closed First of all Thanks for give us a good room with view. I booked standard room with mountain view ,but we come second time and reception change the room. Also spa guys are so friendly .",
        "textEn": "road to hotel , 2 days road was closed First of all Thanks for give us a good room with view. I booked standard room with mountain view ,but we come second time and reception change the room. Also spa guys are so friendly .",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr17",
        "author": "Mousa",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 8,
        "date": "23 November 2024",
        "titleAr": "Very g",
        "titleEn": "Very g",
        "textAr": "Good hotail, clean room, pleasant stay, and wonderful view",
        "textEn": "Good hotail, clean room, pleasant stay, and wonderful view",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr18",
        "author": "Khalid",
        "countryAr": "Qatar",
        "countryEn": "Qatar",
        "rating": 10,
        "date": "23 October 2024",
        "titleAr": "Good place to stay",
        "titleEn": "Good place to stay",
        "textAr": "Little difficult to get to the hotel without a car It has a nice panoramic view of the city",
        "textEn": "Little difficult to get to the hotel without a car It has a nice panoramic view of the city",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr19",
        "author": "Issam",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "18 October 2024",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "The roads through the old city The location and the staff service",
        "textEn": "The roads through the old city The location and the staff service",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr20",
        "author": "Rim",
        "countryAr": "Kuwait",
        "countryEn": "Kuwait",
        "rating": 10,
        "date": "27 September 2024",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "the staff barely speak english. but they can communicate amazing view. very nice staff . good food",
        "textEn": "the staff barely speak english. but they can communicate amazing view. very nice staff . good food",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr21",
        "author": "Mohammad",
        "countryAr": "Kuwait",
        "countryEn": "Kuwait",
        "rating": 10,
        "date": "18 September 2024",
        "titleAr": "Best hotel in Trabzon in my opinion, I will book it every time I come to Trabzon 👍🏻",
        "titleEn": "Best hotel in Trabzon in my opinion, I will book it every time I come to Trabzon 👍🏻",
        "textAr": "It is close to everything, best location in Trabzon 👍🏻I recommend it very much for who wants to spend a honeymoon and enjoy a view for all Trabzon Take the sea view if you want to book.",
        "textEn": "It is close to everything, best location in Trabzon 👍🏻I recommend it very much for who wants to spend a honeymoon and enjoy a view for all Trabzon Take the sea view if you want to book.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr22",
        "author": "Matthew",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "11 September 2024",
        "titleAr": "Beautiful hotel on the Boztepe with stunning views",
        "titleEn": "Beautiful hotel on the Boztepe with stunning views",
        "textAr": "Food in the restaurant was not to my liking. I was given an awful pizza that was raw, I sent it back and it came back half raw and half burnt. Not the quality you would expect from the Radisson. The chef came out to stare me down but did not approach me. The other staff were very apologetic and gave me a refund so all was good in the end. Drinks are also very expensive! Great hotel with the most amazing views over Trabzon. Rooms are large, comfortable and spacious. The beds are extremely comfortable too. Great pool and spa area. Staff try to make you wear a swimming cap but I explained I had no intention of putting my head underwater and so they made an exception. It’s is a distance from the centre of Trabzon. It is walkable down but you pass through some dodgy areas. Walking up would be an extreme challenge with how high and steep it is. Taxi’s cost less than 150 lira and so not worth w",
        "textEn": "Food in the restaurant was not to my liking. I was given an awful pizza that was raw, I sent it back and it came back half raw and half burnt. Not the quality you would expect from the Radisson. The chef came out to stare me down but did not approach me. The other staff were very apologetic and gave me a refund so all was good in the end. Drinks are also very expensive! Great hotel with the most amazing views over Trabzon. Rooms are large, comfortable and spacious. The beds are extremely comfortable too. Great pool and spa area. Staff try to make you wear a swimming cap but I explained I had no intention of putting my head underwater and so they made an exception. It’s is a distance from the centre of Trabzon. It is walkable down but you pass through some dodgy areas. Walking up would be an extreme challenge with how high and steep it is. Taxi’s cost less than 150 lira and so not worth w",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "22-gr23",
        "author": "Ameneh",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "11 September 2024",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "The hotel was very clean, with a good location and spectacular view 👌😍Stayed in September 2024 [Next page](https://www.booking.com/reviews/tr/hotel/radisson-blu-trabzon.en-gb.html?label=gen173nr-1FCA0o5AFCFHJhZGlzc29uLWJsdS10cmFiem9uSAlYBGggiAEBmAEJuAEXyAEM2AEB6AEB-AECiAIBqAIDuALZo43BBsACAdICJDA1ZDcyOTQ3LWZkZGItNGU1Mi1hNWYwLTM0ODIxMzM1ZWRmM9gCBeACAQ&sid=bf36567cc98152b60a5f804f9fe54f68&customer_type=total&hp_nav=0&old_page=0&order=featuredreviews&page=2&r_lang=en&rows=75&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! [List your property](https://join.booking.com/?lang=en-gb&amp;aid=304142&utm_source=footer_menu&utm_medium=frontend&label=gen173nr-1FCA0o5AFCFHJhZGlzc29uLWJsdS10cmFiem9uSAlYBGggiAEBmAEJuAEXyAEM2AEB6AEB-AECiAIBqAIDuALZo43BBsACAdICJDA1ZDcyOTQ3LWZkZGItNGU1Mi1hNWYwLTM0ODIxMzM1ZWRmM9gCBeACAQ) https://www.booking.com/affiliate-program/v2/index.en-gb",
        "textEn": "The hotel was very clean, with a good location and spectacular view 👌😍Stayed in September 2024 [Next page](https://www.booking.com/reviews/tr/hotel/radisson-blu-trabzon.en-gb.html?label=gen173nr-1FCA0o5AFCFHJhZGlzc29uLWJsdS10cmFiem9uSAlYBGggiAEBmAEJuAEXyAEM2AEB6AEB-AECiAIBqAIDuALZo43BBsACAdICJDA1ZDcyOTQ3LWZkZGItNGU1Mi1hNWYwLTM0ODIxMzM1ZWRmM9gCBeACAQ&sid=bf36567cc98152b60a5f804f9fe54f68&customer_type=total&hp_nav=0&old_page=0&order=featuredreviews&page=2&r_lang=en&rows=75&) Low rates •No booking fees• Find cheaper? We&#39;ll refund the difference! [List your property](https://join.booking.com/?lang=en-gb&amp;aid=304142&utm_source=footer_menu&utm_medium=frontend&label=gen173nr-1FCA0o5AFCFHJhZGlzc29uLWJsdS10cmFiem9uSAlYBGggiAEBmAEJuAEXyAEM2AEB6AEB-AECiAIBqAIDuALZo43BBsACAdICJDA1ZDcyOTQ3LWZkZGItNGU1Mi1hNWYwLTM0ODIxMzM1ZWRmM9gCBeACAQ) https://www.booking.com/affiliate-program/v2/index.en-gb",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Hagia Sophia Museum",
        "nameAr": "متحف آيا صوفيا",
        "lat": 41.036046152350615,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Forum Trabzon",
        "nameAr": "فوروم طرابزون",
        "lat": 41.02413478125106,
        "lng": 29.024128910196804,
        "category": "attraction"
      },
      {
        "nameEn": "Trabzon Museum",
        "nameAr": "متحف طرابزون",
        "lat": 41.00396894075046,
        "lng": 28.988276418662494,
        "category": "attraction"
      },
      {
        "nameEn": "Trabzon Airport",
        "nameAr": "مطار طرابزون",
        "lat": 40.9600167451809,
        "lng": 28.95457341722284,
        "category": "transport"
      }
    ]
  },
  {
    "id": "23",
    "slug": "swissotel-uludag-bursa",
    "nameAr": "سويسوتيل ريزورت أولوداغ بورصة",
    "nameEn": "Swissôtel Resort Uludağ Bursa",
    "city": "Bursa",
    "country": "Turkey",
    "neighborhoodAr": "أولوداغ",
    "neighborhoodEn": "Uludağ",
    "stars": 5,
    "rating": 9.1,
    "reviewCount": 74,
    "addressAr": "منطقة الفنادق، أولوداغ، بورصة، تركيا",
    "addressEn": "Oteller Bölgesi, Uludağ, Bursa, Turkey",
    "descriptionAr": "سويسوتيل أولوداغ بورصة منتجع ألبي في منتزه أولوداغ بين غابات الصنوبر، نحو 12 دقيقة من منحدرات التزلج. يبرز الضيوف السبا والغرف الدافئة والمشي في الغابة والمطعم.",
    "descriptionEn": "Swissôtel Uludağ Bursa is an alpine lodge-style resort in Uludağ National Park among pine forests, ~12 minutes from ski slopes. Guests highlight spa facilities, cozy rooms, forest walks, restaurant and attentive ski-season service.",
    "highlightsAr": [
      "منتجع تزلج وسبا أولوداغ",
      "أجواء ألبية بين الصنوبر",
      "تقييم موقع 9.4 على بوكينج"
    ],
    "highlightsEn": [
      "Uludağ ski & spa resort",
      "Pine-forest alpine setting",
      "Location score 9.4 on Booking"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Spa / wellness",
      "Ski access (seasonal)",
      "Fitness",
      "Restaurant",
      "Bar",
      "Free WiFi",
      "Parking",
      "Mountain views",
      "Meeting facilities",
      "Forest trails",
      "Room service"
    ],
    "nearbyAr": [
      "منحدرات أولوداغ — نحو 12 دقيقة",
      "منتزه أولوداغ — في الموقع",
      "مدينة بورصة — نقل جبلي",
      "تلفريك — موسمي",
      "مسارات الغابة — في الموقع"
    ],
    "nearbyEn": [
      "Uludağ ski slopes — ~12 min",
      "Uludağ National Park — on site",
      "Bursa city — mountain transfer",
      "Cable car / ski lifts — seasonal",
      "Pine forest trails — on site"
    ],
    "rooms": [
      {
        "id": "23-r1",
        "nameAr": "غرفة كلاسيك",
        "nameEn": "Classic Room",
        "descriptionAr": "غرفة كلاسيك دافئة بإطلالة جبل/غابة.",
        "descriptionEn": "Cozy classic room with mountain/forest outlook.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 28,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "23-r2",
        "nameAr": "غرفة سوبيريور",
        "nameEn": "Superior Room",
        "descriptionAr": "سوبيريور بأثاث ألبي محسّن.",
        "descriptionEn": "Superior with upgraded alpine furnishings.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 32,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "23-r1",
        "nameAr": "جناح جونيور",
        "nameEn": "Junior Suite",
        "descriptionAr": "جناح جونيور بجلوس وقرب السبا.",
        "descriptionEn": "Junior suite with seating and spa access nearby.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 45,
        "price": 340,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "23-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة عائلية لعطلات التزلج.",
        "descriptionEn": "Family room for ski holidays.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 40,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "23-r1",
        "nameAr": "جناح",
        "nameEn": "Suite",
        "descriptionAr": "جناح بأفضل إطلالات جبلية.",
        "descriptionEn": "Suite with best mountain views.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 55,
        "price": 550,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.17508250442887,
    "lng": 29.053987419582263,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في سويسوتيل ريزورت أولوداغ بورصة",
    "whatsappMessageEn": "Hello, I would like to book at Swissôtel Resort Uludağ Bursa",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "23-gr1",
        "author": "Doha",
        "countryAr": "الإمارات",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "",
        "titleAr": "مذهل",
        "titleEn": "AMAZING",
        "textAr": "كل شيء في سويسوتيل بورصا/أولوداغ كان مذهلاً!",
        "textEn": "Everything about the Swissotel Bursa/Uludag was AMAZING!",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "23-gr2",
        "author": "Ghazanfar",
        "countryAr": "الإمارات",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "",
        "titleAr": "دافئ والغابة",
        "titleEn": "Cozy & forest",
        "textAr": "لوبي جميل وغرف دافئة وغابة للاستكشاف وطاقم ودود. التزلج على بعد 12 دقيقة.",
        "textEn": "Beautiful lobby. Cozy rooms. Nice forest to explore around the hotel. Very friendly staff. Specially at check-in. Location is 12mins away from the ski area.",
        "source": "Booking.com",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "23-gr3",
        "author": "Majd",
        "countryAr": "الإمارات",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "",
        "titleAr": "موقع استثنائي",
        "titleEn": "Exceptional location",
        "textAr": "الموقع استثنائي والخدمة رائعة وكل الطاقم لطيف ومفيد.",
        "textEn": "The location is exceptional, the service was fantastic, all staff were kind and helpful.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "23-gr4",
        "author": "Dhruv",
        "countryAr": "تنزانيا",
        "countryEn": "Tanzania",
        "rating": 9,
        "date": "",
        "titleAr": "أفضل مرافق سبا",
        "titleEn": "Best spa facilities",
        "textAr": "فندق مذهل بأفضل مرافق سبا رأيتها. طاقم منتبه والغرفة رائعة.",
        "textEn": "This hotel was amazing, it had some of the best spa facilities I have seen. The staff were very attentive and the hotel room was great.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "23-gr5",
        "author": "Roman",
        "countryAr": "روسيا",
        "countryEn": "Russia",
        "rating": 9,
        "date": "",
        "titleAr": "ملاذ الغابة",
        "titleEn": "Forest retreat",
        "textAr": "في منتزه أولوداغ محاط بغابات صنوبر عمرها قرون. ملاذ هادئ من المدينة.",
        "textEn": "Swissotel Uludag Bursa is nestled in Uludag National Park, surrounded by centuries-old pine forests. A lovely retreat from busy city life.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "23-gr6",
        "author": "Gj",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "",
        "titleAr": "نظيف وإفطار",
        "titleEn": "Clean & breakfast",
        "textAr": "نظيف وواسع وسرير مريح ودش جيد وإطلالة لطيفة وإفطار رائع وطاقم مفيد.",
        "textEn": "Clean, spacious, comfortable bed, good shower, pleasant view, great breakfast, mostly polite and helpful staff.",
        "source": "Booking.com",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "23-gr7",
        "author": "Ahmad",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "7 April 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Family with young children - • Superior Quadruple Room - • Submitted via mobile Perfect stay and Perfect staff",
        "textEn": "- • Family with young children - • Superior Quadruple Room - • Submitted via mobile Perfect stay and Perfect staff",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr8",
        "author": "Orhan",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 8,
        "date": "28 February 2026",
        "titleAr": "The hotel staff was very kind and food was very good also location off the hotel was excellent",
        "titleEn": "The hotel staff was very kind and food was very good also location off the hotel was excellent",
        "textAr": "- • Superior Double or Twin Room - • Submitted via mobile Duvets cover for bed was not good quality I was feeling very hot so couldn’t sleep well",
        "textEn": "- • Superior Double or Twin Room - • Submitted via mobile Duvets cover for bed was not good quality I was feeling very hot so couldn’t sleep well",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr9",
        "author": "Wael",
        "countryAr": "Turkey",
        "countryEn": "Turkey",
        "rating": 10,
        "date": "28 February 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile The bed cover were dirty from inside and put the cover wrong way the pillows not very comfortable but it's not big deal. The service was excellent the stuff were warm and welcoming all the time especially in the restaurant and the fireplace bar the bar tender Cennet was amazing keep bring us tea and coffee ☕️ the guys in restaurant also were great 👍 it's very good value of Money definitely recommend and will come back in the future",
        "textEn": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile The bed cover were dirty from inside and put the cover wrong way the pillows not very comfortable but it's not big deal. The service was excellent the stuff were warm and welcoming all the time especially in the restaurant and the fireplace bar the bar tender Cennet was amazing keep bring us tea and coffee ☕️ the guys in restaurant also were great 👍 it's very good value of Money definitely recommend and will come back in the future",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr10",
        "author": "Fatma",
        "countryAr": "Kuwait",
        "countryEn": "Kuwait",
        "rating": 9,
        "date": "27 February 2026",
        "titleAr": "Happy holiday",
        "titleEn": "Happy holiday",
        "textAr": "- • Superior Double or Twin Room - • Submitted via mobile The bathroom need more care please The hotel location the ski slopes is amazing the facilities is interesting and all the staff are helpful and perfect and the most helpful and best staff is muslim and furat and umot the receptionist they were so helpful and collaborators thanks from all my heart for my joyful experience in bof hotel 🌹",
        "textEn": "- • Superior Double or Twin Room - • Submitted via mobile The bathroom need more care please The hotel location the ski slopes is amazing the facilities is interesting and all the staff are helpful and perfect and the most helpful and best staff is muslim and furat and umot the receptionist they were so helpful and collaborators thanks from all my heart for my joyful experience in bof hotel 🌹",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr11",
        "author": "Khaled",
        "countryAr": "Jordan",
        "countryEn": "Jordan",
        "rating": 9,
        "date": "26 February 2026",
        "titleAr": "The hote is great and nice location, I think it’s over price",
        "titleEn": "The hote is great and nice location, I think it’s over price",
        "textAr": "- • Family with young children - • Superior Quadruple Room - • Submitted via mobile The spa area , the swimming pool is a little bit small and temperature of the water should be more warm The jacuzzi is only have two outlets with very weak jet of water Location and restaurants are excellent except for the desert menu which I thing if they provide less variety but improve the quality. The staff are nice and welcoming and helpful. Also being ski to door is a big advantage ski cable is just steps out of the door.",
        "textEn": "- • Family with young children - • Superior Quadruple Room - • Submitted via mobile The spa area , the swimming pool is a little bit small and temperature of the water should be more warm The jacuzzi is only have two outlets with very weak jet of water Location and restaurants are excellent except for the desert menu which I thing if they provide less variety but improve the quality. The staff are nice and welcoming and helpful. Also being ski to door is a big advantage ski cable is just steps out of the door.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr12",
        "author": "Adi",
        "countryAr": "United Arab Emirates",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "18 February 2026",
        "titleAr": "A heartfelt thank you to Muslum, Firat, Özlem, Ahmet, Bedir, İsmail, and Filiz — each of you played a part in making",
        "titleEn": "A heartfelt thank you to Muslum, Firat, Özlem, Ahmet, Bedir, İsmail, and Filiz — each of you played a part in making",
        "textAr": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile Our stay at BOF Hotel was truly memorable, and much of that credit goes to the exceptional team that made us feel genuinely welcomed from the moment we arrived. Muslum, the manager, set the tone beautifully — when we encountered a minor room issue upon arrival, he stepped in swiftly and ensured our check-in was seamless, allocating rooms to the full satisfaction of our family. His attentiveness carried through to our checkout, where he once again made sure we left with the same care and warmth we arrived with. Firat and Özlem at the front desk were a pleasure to deal with — efficient, warm, and thorough in making both our arrival and departure smooth and well-attended. Ahmet, our valet and arrival clerk, was the first face to greet us — welcoming, helpful, and immediately putting the whole family at ",
        "textEn": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile Our stay at BOF Hotel was truly memorable, and much of that credit goes to the exceptional team that made us feel genuinely welcomed from the moment we arrived. Muslum, the manager, set the tone beautifully — when we encountered a minor room issue upon arrival, he stepped in swiftly and ensured our check-in was seamless, allocating rooms to the full satisfaction of our family. His attentiveness carried through to our checkout, where he once again made sure we left with the same care and warmth we arrived with. Firat and Özlem at the front desk were a pleasure to deal with — efficient, warm, and thorough in making both our arrival and departure smooth and well-attended. Ahmet, our valet and arrival clerk, was the first face to greet us — welcoming, helpful, and immediately putting the whole family at ",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr13",
        "author": "Eisa",
        "countryAr": "Qatar",
        "countryEn": "Qatar",
        "rating": 10,
        "date": "16 February 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Superior Double or Twin Room - • Submitted via mobile Luxury excellent service",
        "textEn": "- • Superior Double or Twin Room - • Submitted via mobile Luxury excellent service",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr14",
        "author": "Pavel",
        "countryAr": "Russia",
        "countryEn": "Russia",
        "rating": 10,
        "date": "16 February 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Family with young children - • Superior Triple Room - • Submitted via mobile Comfortable rooms and outstanding staff",
        "textEn": "- • Family with young children - • Superior Triple Room - • Submitted via mobile Comfortable rooms and outstanding staff",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr15",
        "author": "Umar",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 8,
        "date": "5 February 2026",
        "titleAr": "Very g",
        "titleEn": "Very g",
        "textAr": "- • Superior Double or Twin Room - • Submitted via mobile even though there are plenty of places to sit, the good ones is not within the package, specially with the views. Full bucket service, special buffet is very good",
        "textEn": "- • Superior Double or Twin Room - • Submitted via mobile even though there are plenty of places to sit, the good ones is not within the package, specially with the views. Full bucket service, special buffet is very good",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr16",
        "author": "Faiza",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "23 January 2026",
        "titleAr": "Great hotel",
        "titleEn": "Great hotel",
        "textAr": "- • Superior Double or Twin Room - • Submitted via mobile Every things is nice . Luxury I stay in Bof hotel It was amazing Very nice resort . Clean , luxury Staff very helpful especially Mr Yaslam I enjoy my stay very much I recommend this hotel strongly Iam planning to come next year with big group including my close friends to Bof hotel",
        "textEn": "- • Superior Double or Twin Room - • Submitted via mobile Every things is nice . Luxury I stay in Bof hotel It was amazing Very nice resort . Clean , luxury Staff very helpful especially Mr Yaslam I enjoy my stay very much I recommend this hotel strongly Iam planning to come next year with big group including my close friends to Bof hotel",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr17",
        "author": "Rasheed",
        "countryAr": "South Africa",
        "countryEn": "South Africa",
        "rating": 9,
        "date": "22 January 2026",
        "titleAr": "Good stay and services. Kids where disappointed not to be able to snowboard and ski",
        "titleEn": "Good stay and services. Kids where disappointed not to be able to snowboard and ski",
        "textAr": "- • Family with young children - • Superior Quadruple Room All good. Perhaps the rooms need some rejuvenation whislt keep the overall style and ambience Excellent spread and variety on the all inclusive option",
        "textEn": "- • Family with young children - • Superior Quadruple Room All good. Perhaps the rooms need some rejuvenation whislt keep the overall style and ambience Excellent spread and variety on the all inclusive option",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr18",
        "author": "Ahmed",
        "countryAr": "South Africa",
        "countryEn": "South Africa",
        "rating": 9,
        "date": "16 January 2026",
        "titleAr": "Superb",
        "titleEn": "Superb",
        "textAr": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile Location. It was clean and staff were friendly.",
        "textEn": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile Location. It was clean and staff were friendly.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr19",
        "author": "Mohammed",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "16 January 2026",
        "titleAr": "Wonderful staff and specious room",
        "titleEn": "Wonderful staff and specious room",
        "textAr": "- • Superior Double or Twin Room - • Submitted via mobile Excellent location, specious room and friendly staff.",
        "textEn": "- • Superior Double or Twin Room - • Submitted via mobile Excellent location, specious room and friendly staff.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr20",
        "author": "Abdulrahman",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "14 January 2026",
        "titleAr": "Excellent",
        "titleEn": "Excellent",
        "textAr": "- • Superior Quadruple Room - • Submitted via mobile",
        "textEn": "- • Superior Quadruple Room - • Submitted via mobile",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr21",
        "author": "Ibrahim",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 9,
        "date": "14 January 2026",
        "titleAr": "Enjoyable",
        "titleEn": "Enjoyable",
        "textAr": "- • Superior Triple Room - • Submitted via mobile The room temperature is high a little bit.",
        "textEn": "- • Superior Triple Room - • Submitted via mobile The room temperature is high a little bit.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr22",
        "author": "Mohamed",
        "countryAr": "Egypt",
        "countryEn": "Egypt",
        "rating": 10,
        "date": "6 January 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Superior Double or Twin Room - • Submitted via mobile",
        "textEn": "- • Superior Double or Twin Room - • Submitted via mobile",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr23",
        "author": "Muhannad",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "3 January 2026",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile A nice, family-friendly hotel with a welcoming atmosphere. The food was delicious with multiple options available.",
        "textEn": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile A nice, family-friendly hotel with a welcoming atmosphere. The food was delicious with multiple options available.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr24",
        "author": "Ikram",
        "countryAr": "United Kingdom",
        "countryEn": "United Kingdom",
        "rating": 8,
        "date": "1 January 2026",
        "titleAr": "Very g",
        "titleEn": "Very g",
        "textAr": "- • Superior Quadruple Room - • Submitted via mobile Dark room , need renovation now.",
        "textEn": "- • Superior Quadruple Room - • Submitted via mobile Dark room , need renovation now.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr25",
        "author": "Indah",
        "countryAr": "Australia",
        "countryEn": "Australia",
        "rating": 10,
        "date": "31 December 2025",
        "titleAr": "A must stay family-friendly resort",
        "titleEn": "A must stay family-friendly resort",
        "textAr": "- • Superior Triple Room - • Submitted via mobile The staffs are very accomodating and go above & beyond. The place was beautiful with amazing food. 10/10 will be back.",
        "textEn": "- • Superior Triple Room - • Submitted via mobile The staffs are very accomodating and go above & beyond. The place was beautiful with amazing food. 10/10 will be back.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr26",
        "author": "Wassem",
        "countryAr": "Qatar",
        "countryEn": "Qatar",
        "rating": 9,
        "date": "31 December 2025",
        "titleAr": "Welcoming staff, specially Muslum at the front office and both Buse & Ipek at the guest relation",
        "titleEn": "Welcoming staff, specially Muslum at the front office and both Buse & Ipek at the guest relation",
        "textAr": "- • Family with young children - • Superior Quadruple Room No fresh juices available at the restaurant. The prices at the (paid) skyfall cafe are unreasonable and crazy high Rich selection of food",
        "textEn": "- • Family with young children - • Superior Quadruple Room No fresh juices available at the restaurant. The prices at the (paid) skyfall cafe are unreasonable and crazy high Rich selection of food",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr27",
        "author": "Mohd",
        "countryAr": "Malaysia",
        "countryEn": "Malaysia",
        "rating": 10,
        "date": "31 December 2025",
        "titleAr": "The Best Resort at Uludag!",
        "titleEn": "The Best Resort at Uludag!",
        "textAr": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile",
        "textEn": "- • Family with young children - • Superior Double or Twin Room - • Submitted via mobile",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr28",
        "author": "Michael",
        "countryAr": "South Africa",
        "countryEn": "South Africa",
        "rating": 8,
        "date": "30 December 2025",
        "titleAr": "Very g",
        "titleEn": "Very g",
        "textAr": "- • Family with young children - • Superior Quadruple Room - • Submitted via mobile The issue i mentioned below is only because tbe hotel is lablled '5-star' and 'all inclusive', which is in my opinion inaccurate and/or misleading as detailed below. Limited pool time for couples to enjoy together (after 16h00), which was frustrating. Too few English speaking staff (even at basic level). Outrageous prices at Skyroom restaurant when the hotel stay is meant to be 'all inclusive'. Outrageous prices to enjoy games room, which again, defeats the point of 'all inclusive'. If we need to pay for something within the hotel, then prices should be reasonable as we technically did pay for an 'all inclusive' experience. 'Cappuccino' option at buffets is clearly not espresso based, but rather a watery powder based machine coffee - this is absolutely terrible and the hotel should actually be embarrassed",
        "textEn": "- • Family with young children - • Superior Quadruple Room - • Submitted via mobile The issue i mentioned below is only because tbe hotel is lablled '5-star' and 'all inclusive', which is in my opinion inaccurate and/or misleading as detailed below. Limited pool time for couples to enjoy together (after 16h00), which was frustrating. Too few English speaking staff (even at basic level). Outrageous prices at Skyroom restaurant when the hotel stay is meant to be 'all inclusive'. Outrageous prices to enjoy games room, which again, defeats the point of 'all inclusive'. If we need to pay for something within the hotel, then prices should be reasonable as we technically did pay for an 'all inclusive' experience. 'Cappuccino' option at buffets is clearly not espresso based, but rather a watery powder based machine coffee - this is absolutely terrible and the hotel should actually be embarrassed",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr29",
        "author": "Saleh",
        "countryAr": "Saudi Arabia",
        "countryEn": "Saudi Arabia",
        "rating": 9,
        "date": "29 December 2025",
        "titleAr": "Great experience",
        "titleEn": "Great experience",
        "textAr": "- • Superior Double or Twin Room - • Submitted via mobile The skiing instrument doesn’t have a half day or 4h option and it’s quite expensive The stuff is really welcoming and nice,and all inclusive is great idea which makes our stay really comfortable",
        "textEn": "- • Superior Double or Twin Room - • Submitted via mobile The skiing instrument doesn’t have a half day or 4h option and it’s quite expensive The stuff is really welcoming and nice,and all inclusive is great idea which makes our stay really comfortable",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr30",
        "author": "Karlina",
        "countryAr": "Indonesia",
        "countryEn": "Indonesia",
        "rating": 10,
        "date": "29 December 2025",
        "titleAr": "Exceptional",
        "titleEn": "Exceptional",
        "textAr": "- • Family with young children - • Superior Triple Room Nothing, everything is superb. I love everything about Bof Hotel, this was in fact our second stay after so many years. - The staffs are all amazing, many of them are kind, helpful and professional. A shoutout for one of the Customer Relations there, Ms. Buse who welcomed and answered all of our questions there - The size of the room are enough for our family - The meals (all breakfast, lunch and dinner, also coffee break) are all tasty and with huge variations of food. My children love it there. All the workers there were also fast and helpful - The locations of the hotel is great. Only 200m if you want to experience Cable Car to Bursa",
        "textEn": "- • Family with young children - • Superior Triple Room Nothing, everything is superb. I love everything about Bof Hotel, this was in fact our second stay after so many years. - The staffs are all amazing, many of them are kind, helpful and professional. A shoutout for one of the Customer Relations there, Ms. Buse who welcomed and answered all of our questions there - The size of the room are enough for our family - The meals (all breakfast, lunch and dinner, also coffee break) are all tasty and with huge variations of food. My children love it there. All the workers there were also fast and helpful - The locations of the hotel is great. Only 200m if you want to experience Cable Car to Bursa",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "23-gr31",
        "author": "Khaled",
        "countryAr": "Qatar",
        "countryEn": "Qatar",
        "rating": 3,
        "date": "28 December 2025",
        "titleAr": "It was great we had great time thanks for all staff especially Ipek she was so helpful and friendly",
        "titleEn": "It was great we had great time thanks for all staff especially Ipek she was so helpful and friendly",
        "textAr": "- • Superior Double or Twin Room - • Submitted via mobile The room space big and comfortable Low rates • No booking fees • Find cheaper? We'll refund the difference! - Marmara Region hotel reviews - Bursa hotel reviews - Uludag Ski hotel reviews ### Guests also reviewed these properties: Fairfield Inn & Suites by Marriott Reno Sparks Americas Best Value Inn Virginia Beach Royal Phala Cliff Beach Resort Start of dialog content ## Verified reviews from real guests. We have more than 70 million property reviews, and they're all from real, verified guests. ### It starts with a booking It starts with a booking The only way to leave a review is to first make a booking. That's how we know our reviews come from real guests who have stayed at the property. ### Followed by a trip When guests stay at the property they check out how quiet the room is, how friendly the staff are and more. ### And fin",
        "textEn": "- • Superior Double or Twin Room - • Submitted via mobile The room space big and comfortable Low rates • No booking fees • Find cheaper? We'll refund the difference! - Marmara Region hotel reviews - Bursa hotel reviews - Uludag Ski hotel reviews ### Guests also reviewed these properties: Fairfield Inn & Suites by Marriott Reno Sparks Americas Best Value Inn Virginia Beach Royal Phala Cliff Beach Resort Start of dialog content ## Verified reviews from real guests. We have more than 70 million property reviews, and they're all from real, verified guests. ### It starts with a booking It starts with a booking The only way to leave a review is to first make a booking. That's how we know our reviews come from real guests who have stayed at the property. ### Followed by a trip When guests stay at the property they check out how quiet the room is, how friendly the staff are and more. ### And fin",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Uludağ ski slopes",
        "nameAr": "منحدرات أولوداغ",
        "lat": 41.18364101567079,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Uludağ National Park",
        "nameAr": "منتزه أولوداغ",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Bursa city",
        "nameAr": "مدينة بورصة",
        "lat": 41.00500222974971,
        "lng": 28.986858436844827,
        "category": "attraction"
      },
      {
        "nameEn": "Cable car / ski lifts",
        "nameAr": "تلفريك",
        "lat": 41.0032832876127,
        "lng": 28.97658319482947,
        "category": "nature"
      },
      {
        "nameEn": "Pine forest trails",
        "nameAr": "مسارات الغابة",
        "lat": 41.00987445651432,
        "lng": 28.975235729437475,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "24",
    "slug": "kervansaray-bursa",
    "nameAr": "كرفانسراي بورصة سيتي",
    "nameEn": "Kervansaray Bursa City Hotel",
    "city": "Bursa",
    "country": "Turkey",
    "neighborhoodAr": "وسط بورصة",
    "neighborhoodEn": "Bursa Center",
    "stars": 4,
    "rating": 8.5,
    "reviewCount": 205,
    "addressAr": "جادة فوزي تشاقماق رقم 29، عثمان غازي، 16010 بورصة، تركيا",
    "addressEn": "Fevzi Çakmak Caddesi No:29, Osmangazi, 16010 Bursa, Turkey",
    "descriptionAr": "فندق مدينة في موقع بورصة عالي التقييم (موقع بوكينج ~9.5) مع إفطار وموقف خاص مجاني. يبرز الضيوف الوسط والقرب من التسوق والمترو. غرف دبل/توين وكينغ.",
    "descriptionEn": "City hotel in a highly rated Bursa location (Booking location score cited ~9.5) with continental/buffet breakfast and free private parking. Guests highlight central access to shopping, restaurants, metro/bus and mountain-facing upgrades. Room types include Standard Double/Twin and King rooms.",
    "highlightsAr": [
      "وسط بورصة",
      "تقييم موقع قوي",
      "ترقيات بإطلالة جبل"
    ],
    "highlightsEn": [
      "Central Bursa",
      "Strong location score",
      "Mountain-view upgrades noted by guests"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Free WiFi",
      "Breakfast buffet",
      "Free private parking",
      "Restaurant",
      "Bar",
      "Central location",
      "Room service",
      "Family rooms"
    ],
    "nearbyAr": [
      "وسط بورصة — في الموقع",
      "شوارع التسوق — سيراً",
      "نقل أولوداغ — يمكن ترتيبه",
      "مترو/باص — قريب"
    ],
    "nearbyEn": [
      "Bursa city centre — on site",
      "Shopping streets — walking",
      "Uludağ transfers — arrangeable",
      "Metro / bus — nearby"
    ],
    "rooms": [
      {
        "id": "24-r1",
        "nameAr": "غرفة دبل/توين قياسية",
        "nameEn": "Standard Double or Twin Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 95,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "24-r2",
        "nameAr": "غرفة كينغ",
        "nameEn": "King Room",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 120,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "24-r1",
        "nameAr": "غرفة سوبيريور",
        "nameEn": "Superior Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 150,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "24-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 185,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "24-r1",
        "nameAr": "جناح",
        "nameEn": "Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.2059112490996,
    "lng": 29.050798629335585,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في كرفانسراي بورصة سيتي",
    "whatsappMessageEn": "Hello, I would like to book at Kervansaray Bursa City Hotel",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "24-gr1",
        "author": "Khedher",
        "countryAr": "الكويت",
        "countryEn": "Kuwait",
        "rating": 9,
        "date": "",
        "titleAr": "موقع ممتاز",
        "titleEn": "Excellent location",
        "textAr": "الموقع ممتاز والإفطار جيد.",
        "textEn": "The location was excellent and the breakfast was good",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "24-gr2",
        "author": "Mostafa_sepideh",
        "countryAr": "إيران",
        "countryEn": "Iran",
        "rating": 9,
        "date": "",
        "titleAr": "قلب وسط المدينة",
        "titleEn": "Heart of city center",
        "textAr": "موقع ممتاز في قلب الوسط مع تسوق ومطاعم. طاقم ودود ساعدنا لإيجاد محطة العبّارة والمترو.",
        "textEn": "Excellent location. In the heart of city center and many shopping center and restaurants are around the hotel. The staff are very friendly and help us to find the ferryboat station. Bus and metro...",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "24-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 9,
        "date": "",
        "titleAr": "تكييف مريح",
        "titleEn": "Comfortable AC",
        "textAr": "مريح جداً. التكييف عمل غالباً. موقع وإطلالة رائعان.",
        "textEn": "Very comfortable. The air conditioning mostly worked (which is better than most other places we stayed). Great location and view.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "24-gr4",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "ترقية غرفة",
        "titleEn": "Room upgrade",
        "textAr": "الطاقم لطيف جداً. السيد عبدالله رقّى غرفتنا وكانت مذهلة بإطلالة جبل.",
        "textEn": "Staff was really nice.. infact Mr. Abdulla upgraded our room and the room was amazing and it was mountain facing …everything was amazing",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Bursa city centre",
        "nameAr": "وسط بورصة",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Shopping streets",
        "nameAr": "شوارع التسوق",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Uludağ transfers",
        "nameAr": "نقل أولوداغ",
        "lat": 41.00500222974971,
        "lng": 28.986858436844827,
        "category": "attraction"
      },
      {
        "nameEn": "Metro / bus",
        "nameAr": "مترو/باص",
        "lat": 41.006641643806354,
        "lng": 28.978291597414735,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "25",
    "slug": "holiday-inn-bursa",
    "nameAr": "هوليداي إن بورصة - وسط المدينة",
    "nameEn": "Holiday Inn Bursa - City Centre by IHG",
    "city": "Bursa",
    "country": "Turkey",
    "neighborhoodAr": "نيلوفر",
    "neighborhoodEn": "Nilüfer / Center",
    "stars": 4,
    "rating": 9.2,
    "reviewCount": 2618,
    "addressAr": "محلة أولو، بولفار أولوباتلي حسن رقم 44، عثمان غازي، 16220 بورصة، تركيا",
    "addressEn": "Ulu Mahalle Ulubatlı Hasan Bulvarı No 44, Osmangazi, 16220 Bursa, Turkey",
    "descriptionAr": "هوليداي إن IHG في وسط بورصة على بولفار أولوباتلي حسن. يمدح الضيوف الموقع قرب التسوق والترام والنظافة والإفطار والطاقم المحترف. تقييم 9.2 على بوكينج بقاعدة مراجعات كبيرة.",
    "descriptionEn": "IHG Holiday Inn in Bursa city centre on Ulubatlı Hasan Boulevard. Guests praise location near shopping and tram, cleanliness, breakfast, and consistently professional staff (including named guest-relations mentions). Scored 9.2 on Booking with a large review base.",
    "highlightsAr": [
      "تقييم 9.2 بوكينج",
      "IHG وسط المدينة",
      "إشادة قوية من الضيوف"
    ],
    "highlightsEn": [
      "9.2 Booking score",
      "City-centre IHG",
      "Strong repeat-guest praise"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Free WiFi",
      "Restaurant",
      "Breakfast",
      "Fitness",
      "Meeting rooms",
      "Parking",
      "Family rooms",
      "Business centre",
      "Bar"
    ],
    "nearbyAr": [
      "مركز تسوق — قريب",
      "خط الترام — قريب",
      "وسط بورصة — في الموقع",
      "أولوداغ — رحلة يومية"
    ],
    "nearbyEn": [
      "Shopping centre — nearby",
      "Tram line — close",
      "Bursa centre — on site",
      "Uludağ — day trip"
    ],
    "rooms": [
      {
        "id": "25-r1",
        "nameAr": "غرفة قياسية",
        "nameEn": "Standard Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 95,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "25-r2",
        "nameAr": "غرفة قياسية توين",
        "nameEn": "Standard Room Twin",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "2 Twin",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 120,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "25-r1",
        "nameAr": "جناح جونيور",
        "nameEn": "Junior Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 150,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "25-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 185,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "25-r1",
        "nameAr": "غرفة تنفيذية",
        "nameEn": "Executive Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.174666333978614,
    "lng": 29.05168489725955,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في هوليداي إن بورصة - وسط المدينة",
    "whatsappMessageEn": "Hello, I would like to book at Holiday Inn Bursa - City Centre by IHG",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "25-gr1",
        "author": "Dalal",
        "countryAr": "البحرين",
        "countryEn": "Bahrain",
        "rating": 10,
        "date": "",
        "titleAr": "ليس 4 بل 5 نجوم",
        "titleEn": "Not 4 but 5 star",
        "textAr": "الفندق ليس 4 بل 5 نجوم خاصة من حيث الموقع. الطاقم لطيف جداً والسيد خالد كان غاية في الكرم.",
        "textEn": "The Hotel is not a 4 star but a 5 star, especially location wise. The staff were very kind and helpful. Mr Khalid was extremely kind to us. I will definitely book again and recommend it to friends.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "25-gr2",
        "author": "Alhosain",
        "countryAr": "المملكة العربية السعودية",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "",
        "titleAr": "إقامة مذهلة",
        "titleEn": "Amazing stay",
        "textAr": "إقامتي مذهلة وأحببت الفندق والنظافة. استمروا بهذا المستوى.",
        "textEn": "My stay was amazing and I loved the hotel and the cleanliness keep the good work please",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "25-gr3",
        "author": "F",
        "countryAr": "أستراليا",
        "countryEn": "Australia",
        "rating": 10,
        "date": "",
        "titleAr": "خدمة شخصية",
        "titleEn": "Personal service",
        "textAr": "خدمة شخصية وطاقم محترف ومهذب. أقيم هنا دائماً عند زيارة بورصة والمستوى لم ينخفض.",
        "textEn": "Personal service and highly professional, courteous staff. I always stay here every time I visit Bursa, and the standard has never declined. I will continue to come back.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "25-gr4",
        "author": "Aurangzeb",
        "countryAr": "المملكة المتحدة",
        "countryEn": "United Kingdom",
        "rating": 9,
        "date": "",
        "titleAr": "موقع ممتاز",
        "titleEn": "Excellent Location",
        "textAr": "موقع ممتاز وغرفة ممتازة وتنوع جيد في الإفطار.",
        "textEn": "Excellent Location Excellent Room Good choice of breakfast",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "25-gr5",
        "author": "Syed",
        "countryAr": "المملكة العربية السعودية",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "",
        "titleAr": "إقامة استثنائية",
        "titleEn": "Exceptional stay",
        "textAr": "إقامة استثنائية من البداية للنهاية. مزيج مثالي من الفخامة والراحة والسهولة.",
        "textEn": "An exceptional stay from start to finish. The hotel offers a perfect blend of luxury, comfort, and convenience. Every detail is meticulously curated, making it a truly unforgettable experience.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "25-gr6",
        "author": "Riaz",
        "countryAr": "جنوب أفريقيا",
        "countryEn": "South Africa",
        "rating": 9,
        "date": "",
        "titleAr": "إفطار فوق المتوسط",
        "titleEn": "Above average breakfast",
        "textAr": "إفطار فوق المتوسط وغرف نظيفة وموقع ممتاز قرب مول كبير والترام.",
        "textEn": "Breakfast was above average. Rooms were clean and comfortable. Location excellent. Close to a large shopping centre. Staff friendly and helpful. Close to the tram line",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Shopping centre",
        "nameAr": "مركز تسوق",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Tram line",
        "nameAr": "خط الترام",
        "lat": 41.01281114356764,
        "lng": 28.988776414706635,
        "category": "attraction"
      },
      {
        "nameEn": "Bursa centre",
        "nameAr": "وسط بورصة",
        "lat": 41.007501114874856,
        "lng": 28.983429218422415,
        "category": "attraction"
      },
      {
        "nameEn": "Uludağ",
        "nameAr": "أولوداغ",
        "lat": 41.0032832876127,
        "lng": 28.97658319482947,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "26",
    "slug": "richmond-nua-wellness-spa",
    "nameAr": "ريتشموند نوا ويلنس سبا - للكبار فقط",
    "nameEn": "Richmond Nua Wellness Spa - Adult Only",
    "city": "Sapanca",
    "country": "Turkey",
    "neighborhoodAr": "ضفاف البحيرة",
    "neighborhoodEn": "Lake shore",
    "stars": 4,
    "rating": 9.7,
    "reviewCount": 618,
    "addressAr": "منطقة بحيرة سبانجا، سبانجا، سكاريا، تركيا",
    "addressEn": "Sapanca Lake area, Sapanca, Sakarya, Turkey",
    "descriptionAr": "فندق عافية للكبار فقط بجانب بحيرة سبانجا حيث تلتقي إطلالات الغابة والبحيرة. سبا واسع بساونا وبخار. غرف بشرفات خاصة؛ بعضها بجاكوزي. مطعم أكوا بمأكولات تركية ودولية. أجواء هادئة للاسترخاء.",
    "descriptionEn": "Adults-only wellness hotel by Sapanca Lake where forest and lake views meet. Extensive spa with sauna and steam rooms. Comfortable rooms with private balconies and satellite flat-screen TVs; some include a hot tub. Aqua Restaurant serves Turkish and international tastes. Calm atmosphere geared to relaxation.",
    "highlightsAr": [
      "عافية للكبار فقط",
      "تقييم 9.7 بوكينج",
      "موقع بحيرة سبانجا"
    ],
    "highlightsEn": [
      "Adults-only wellness",
      "9.7 Booking score",
      "Sapanca Lake setting"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Adults only",
      "Spa / sauna / steam",
      "Lake & forest views",
      "Restaurant",
      "Free WiFi",
      "Balconies",
      "Hot tub (select rooms)",
      "Parking",
      "Fitness"
    ],
    "nearbyAr": [
      "بحيرة سبانجا — في/قرب الموقع",
      "غابات سبانجا — محيطة",
      "إسطنبول — 1.5–2 ساعة"
    ],
    "nearbyEn": [
      "Sapanca Lake — on/near site",
      "Sapanca forests — surrounding",
      "Istanbul — ~1.5–2 hr drive"
    ],
    "rooms": [
      {
        "id": "26-r1",
        "nameAr": "غرفة ديلوكس مع شرفة",
        "nameEn": "Deluxe Room with Balcony",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "26-r2",
        "nameAr": "غرفة مع جاكوزي",
        "nameEn": "Room with Hot Tub",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 350,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "26-r1",
        "nameAr": "غرفة بإطلالة بحيرة",
        "nameEn": "Lake View Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 450,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "26-r1",
        "nameAr": "جناح",
        "nameEn": "Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 620,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "26-r1",
        "nameAr": "غرفة سبا",
        "nameEn": "Spa Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 850,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.68381920077121,
    "lng": 30.281458811911627,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00",
      "للكبار فقط"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00",
      "Adults only"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في ريتشموند نوا ويلنس سبا - للكبار فقط",
    "whatsappMessageEn": "Hello, I would like to book at Richmond Nua Wellness Spa - Adult Only",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "26-gr1",
        "author": "Ruqaiya",
        "countryAr": "عمان",
        "countryEn": "Oman",
        "rating": 10,
        "date": "",
        "titleAr": "هادئ ومثالي",
        "titleEn": "Calm and perfect",
        "textAr": "الفندق هادئ ومثالي لرحلة استرخاء.",
        "textEn": "Hotel was calm , perfect for relaxation kind of trip",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "26-gr2",
        "author": "Verified guest",
        "countryAr": "الإمارات العربية المتحدة",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "",
        "titleAr": "الآنسة سامية مفيدة",
        "titleEn": "Ms Samia helpful",
        "textAr": "أحب الفندق كثيراً. الآنسة سامية محمد في علاقات الضيوف كانت مفيدة ومتعاونة ودائمة الابتسام.",
        "textEn": "I like the hotel so much. Ms. Samia Mohamed (Guest Relations Supervisor) was very helpful and cooperative. She was friendly and always smiling. I recommend this hotel.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "26-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "يومان ممتازان",
        "titleEn": "Excellent two days",
        "textAr": "كل شيء في اليومين كان ممتازاً بدءاً من الآنسة سامية المحترفة، والإفطار…",
        "textEn": "Everything about those two days we spent were excellent, starting with the very professional and very helpful Ms Samia, whom I would like to give many thanks and appreciations to, the breakfast...",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Sapanca Lake",
        "nameAr": "بحيرة سبانجا",
        "lat": 41.017194572847345,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Sapanca forests",
        "nameAr": "غابات سبانجا",
        "lat": 41.01281114356764,
        "lng": 28.988776414706635,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul",
        "nameAr": "إسطنبول",
        "lat": 41.00500222974971,
        "lng": 28.986858436844827,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "27",
    "slug": "ng-sapanca-wellness",
    "nameAr": "إن جي سبانجا ويلنس آند كونفنشن",
    "nameEn": "NG Sapanca Wellness & Convention",
    "city": "Sapanca",
    "country": "Turkey",
    "neighborhoodAr": "سبانجا",
    "neighborhoodEn": "Sapanca",
    "stars": 5,
    "rating": 8.9,
    "reviewCount": 320,
    "addressAr": "سبانجا، سكاريا، تركيا",
    "addressEn": "Sapanca, Sakarya, Turkey",
    "descriptionAr": "فندق خمس نجوم للعافية والمؤتمرات وسط غابات سبانجا، موجّه للعائلات بديكور أنيق. يمدح الضيوف المسابح وأنشطة الأطفال والهدوء والغابة والطعام والطاقم.",
    "descriptionEn": "Forest-set 5-star wellness and convention hotel in Sapanca, family-oriented with classy décor. Guests repeatedly praise swimming pools, kids’ activities, calm woodland setting, food and friendly staff. Suitable for families and meetings.",
    "highlightsAr": [
      "منتجع عائلي غابي",
      "مسابح وأنشطة أطفال",
      "عافية ومؤتمرات"
    ],
    "highlightsEn": [
      "Forest family resort",
      "Pools & kids activities",
      "Wellness + convention"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Multiple pools",
      "Kids activities",
      "Spa / wellness",
      "Convention / meeting rooms",
      "Restaurant buffet",
      "Free WiFi",
      "Family rooms",
      "Parking",
      "Forest setting"
    ],
    "nearbyAr": [
      "غابات سبانجا — في الموقع",
      "بحيرة سبانجا — بالسيارة",
      "إسطنبول — بالسيارة"
    ],
    "nearbyEn": [
      "Sapanca forests — on site",
      "Sapanca Lake — short drive",
      "Istanbul — drive"
    ],
    "rooms": [
      {
        "id": "27-r1",
        "nameAr": "غرفة قياسية",
        "nameEn": "Standard Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "27-r2",
        "nameAr": "غرفة ديلوكس",
        "nameEn": "Deluxe Room",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "27-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 340,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "27-r1",
        "nameAr": "جناح",
        "nameEn": "Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "27-r1",
        "nameAr": "غرف عائلية متصلة",
        "nameEn": "Connecting Family Rooms",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 5,
        "sizeSqm": 38,
        "price": 550,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.68815963848933,
    "lng": 30.28760065283464,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في إن جي سبانجا ويلنس آند كونفنشن",
    "whatsappMessageEn": "Hello, I would like to book at NG Sapanca Wellness & Convention",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "27-gr1",
        "author": "Abdulrahman",
        "countryAr": "الكويت",
        "countryEn": "Kuwait",
        "rating": 9,
        "date": "",
        "titleAr": "المسبح",
        "titleEn": "The swimming pool",
        "textAr": "المسبح رائع والطاقم جيد خاصة السيد محمد فياض.",
        "textEn": "The swimming pool Staff was good specially Mr. Mohamed Fayaz",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "27-gr2",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 9,
        "date": "",
        "titleAr": "إقامة غابة هادئة",
        "titleEn": "Calm forest stay",
        "textAr": "استمتعنا بإقامة هادئة في الغابة ومسابح لطيفة وأنشطة كثيرة للأطفال وطعام جيد وطاقم ودود.",
        "textEn": "We enjoyed our stay, a calm place in the forest, nice swimming pools, very convenient for children with so many activities, the food was good, staff is friendly and helpful",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "27-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "إقامة رائعة",
        "titleEn": "Wonderful stay",
        "textAr": "إقامة رائعة: طاقم وموقع وأنشطة ووجبات مثالية. سلطان وفرقان مفيدان جداً.",
        "textEn": "it was a wonderful stay staff location activities all meals were perfect staff are very prof sultan and forqan were very helpful advise everyone to visit it",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "27-gr4",
        "author": "Muna",
        "countryAr": "الإمارات العربية المتحدة",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "",
        "titleAr": "موجّه للعائلات",
        "titleEn": "Family oriented",
        "textAr": "في الطبيعة فندق خمس نجوم بكل المقاييس موجّه للعائلات وديكور أنيق.",
        "textEn": "Located in nature A 5 star hotel by All means Family oriented Classy decorated",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Sapanca forests",
        "nameAr": "غابات سبانجا",
        "lat": 41.013597286423675,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Sapanca Lake",
        "nameAr": "بحيرة سبانجا",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul",
        "nameAr": "إسطنبول",
        "lat": 41.00500222974971,
        "lng": 28.986858436844827,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "28",
    "slug": "ng-sapanca-enjoy",
    "nameAr": "إن جي إنجوي",
    "nameEn": "NG Enjoy",
    "city": "Sapanca",
    "country": "Turkey",
    "neighborhoodAr": "غابات سبانجا",
    "neighborhoodEn": "Sapanca forest",
    "stars": 4,
    "rating": 9.3,
    "reviewCount": 223,
    "addressAr": "سبانجا، سكاريا، تركيا",
    "addressEn": "Sapanca, Sakarya, Turkey",
    "descriptionAr": "منتجع حديث في سبانجا يُشاد بغرفه الواسعة الجديدة والمسبح الكبير والمساحات الخضراء وخدمة الاستقبال والبوفيه. يذكر الضيوف طاقماً منتبهًا وتلبية طلبات خاصة لكبار السن.",
    "descriptionEn": "Modern Sapanca resort hotel praised for large new rooms, huge pool, green grounds, strong front-desk service and full-board buffet. Guests mention attentive staff (e.g. Mohammed and Irem) and accommodation of special room requests for elderly family members.",
    "highlightsAr": [
      "تقييم 9.3 بوكينج",
      "مسبح كبير وغرف جديدة",
      "بوفيه وطاقم قويان"
    ],
    "highlightsEn": [
      "9.3 Booking score",
      "Huge pool & new rooms",
      "Strong buffet & staff"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Huge pool",
      "Full-board buffet",
      "Free WiFi",
      "Large modern rooms",
      "Green gardens",
      "Front desk 24h",
      "Family rooms",
      "Parking",
      "Restaurant"
    ],
    "nearbyAr": [
      "طبيعة سبانجا — محيطة",
      "بحيرة سبانجا — بالسيارة",
      "إسطنبول — بالسيارة"
    ],
    "nearbyEn": [
      "Sapanca nature — surrounding",
      "Sapanca Lake — short drive",
      "Istanbul — drive"
    ],
    "rooms": [
      {
        "id": "28-r1",
        "nameAr": "غرفة قياسية",
        "nameEn": "Standard Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "28-r2",
        "nameAr": "غرفة ديلوكس",
        "nameEn": "Deluxe Room",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 63,
        "price": 280,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "28-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 340,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "28-r1",
        "nameAr": "جناح",
        "nameEn": "Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 420,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "28-r1",
        "nameAr": "غرف متصلة",
        "nameEn": "Connecting Rooms",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 5,
        "sizeSqm": 38,
        "price": 550,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.70528027802241,
    "lng": 30.265034534656465,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في إن جي إنجوي",
    "whatsappMessageEn": "Hello, I would like to book at NG Enjoy",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "28-gr1",
        "author": "Ecaterina",
        "countryAr": "الإمارات العربية المتحدة",
        "countryEn": "United Arab Emirates",
        "rating": 10,
        "date": "",
        "titleAr": "مكان وخدمة رائعان",
        "titleEn": "Great place and service",
        "textAr": "مكان وخدمة رائعان. الاستقبال ممتاز. غرف كبيرة وكل شيء جديد. مسبح ضخم وخضرة وطعام جيد.",
        "textEn": "Great place and service. Front desk doing great job. Very big rooms, everything is new. Huge pool, very green outside. Nice food selection.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "28-gr2",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 9,
        "date": "",
        "titleAr": "إقامة مريحة",
        "titleEn": "Relaxing stay",
        "textAr": "إقامة مريحة جداً. الفندق نظيف والطاقم مفيد خاصة محمد وإيريم.",
        "textEn": "We had a very relaxing stay at NG Enjoy. The hotel was clean and well maintained. The staff was very helpful and accomodating, especially Mohammed and Irem.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "28-gr3",
        "author": "Verified guest",
        "countryAr": "",
        "countryEn": "",
        "rating": 10,
        "date": "",
        "titleAr": "بوفيه مذهل",
        "titleEn": "Buffet amazing",
        "textAr": "الطاقم رائع وبوفيه الإقامة الكاملة مذهل. تسجيل الوصول والتفاصيل مريحة. لبّوا طلب الغرف لمساعدة كبار السن...",
        "textEn": "Staff were great. Food buffet at full board was amazing. Check in experience and their attention to detail was very comforting. They accommodated my request regarding the rooms to help my old aged...",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "28-gr4",
        "author": "Yahia",
        "countryAr": "الإمارات العربية المتحدة",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "",
        "titleAr": "نظافة لا تشوبها شائبة",
        "titleEn": "Impeccably clean",
        "textAr": "فندق نظيف بمرافق محيطة ممتازة — خيار رائع للاسترخاء والطبيعة.",
        "textEn": "located and impeccably clean hotel. The surrounding facilities are excellent, making it a great choice for those looking for relaxation and stunning natural...",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Sapanca nature",
        "nameAr": "طبيعة سبانجا",
        "lat": 41.017194572847345,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Sapanca Lake",
        "nameAr": "بحيرة سبانجا",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Istanbul",
        "nameAr": "إسطنبول",
        "lat": 41.00500222974971,
        "lng": 28.986858436844827,
        "category": "attraction"
      }
    ]
  },
  {
    "id": "29",
    "slug": "ayder-paradise-otel",
    "nameAr": "آيدر بارادايس أوتيل",
    "nameEn": "Ayder Paradise Otel",
    "city": "Ayder",
    "country": "Turkey",
    "neighborhoodAr": "آيدر",
    "neighborhoodEn": "Ayder Plateau",
    "stars": 4,
    "rating": 8.7,
    "reviewCount": 131,
    "addressAr": "هضبة آيدر، تشاملي هيمشين، ريزا، تركيا",
    "addressEn": "Ayder Yaylası, Çamlıhemşin, Rize, Turkey",
    "descriptionAr": "فندق هضبة في آيدر قرب مسارات المشي، على بعد نحو 30 ميلاً من مطار ريزا-أرتفين. يقدّر الضيوف الإطلالات والموقف والضيافة العائلية المنتبهة.",
    "descriptionEn": "Plateau hotel in Ayder Yaylası near walking and hiking trails, about 30 mi from Rize–Artvin Airport. Guests appreciate scenic views, parking, and attentive family-run hospitality (owners/staff named in reviews such as Jan and Zafran).",
    "highlightsAr": [
      "موقع هضبة آيدر",
      "ضيافة عائلية",
      "وصول للتخييم سيراً"
    ],
    "highlightsEn": [
      "Ayder plateau setting",
      "Family hospitality",
      "Hiking access"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Free WiFi",
      "Parking",
      "Mountain / plateau views",
      "Breakfast",
      "Family-run hospitality",
      "Hiking access",
      "Restaurant"
    ],
    "nearbyAr": [
      "مسارات هضبة آيدر — في/قرب الموقع",
      "تشاملي هيمشين — بالسيارة",
      "مطار ريزا-أرتفين — 30 ميل"
    ],
    "nearbyEn": [
      "Ayder plateau trails — on/near",
      "Çamlıhemşin — short drive",
      "Rize–Artvin Airport — 30 mi"
    ],
    "rooms": [
      {
        "id": "29-r1",
        "nameAr": "غرفة دبل قياسية",
        "nameEn": "Standard Double Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 95,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "29-r2",
        "nameAr": "غرفة ثلاثية",
        "nameEn": "Triple Room",
        "descriptionAr": "جناح فسيح مع منطقة جلوس منفصلة.",
        "descriptionEn": "Spacious suite with a separate seating area.",
        "beds": "3 Twin",
        "capacity": 3,
        "sizeSqm": 63,
        "price": 120,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "29-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 38,
        "price": 150,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "29-r1",
        "nameAr": "غرفة بإطلالة جبل",
        "nameEn": "Room with Mountain View",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 38,
        "price": 185,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "29-r1",
        "nameAr": "جناح",
        "nameEn": "Suite",
        "descriptionAr": "غرفة واسعة مع إطلالة مميزة وخدمة يومية.",
        "descriptionEn": "Spacious room with a notable view and daily housekeeping.",
        "beds": "1 King",
        "capacity": 3,
        "sizeSqm": 38,
        "price": 220,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 40.94644582908829,
    "lng": 41.10774021614746,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 15:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 15:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في آيدر بارادايس أوتيل",
    "whatsappMessageEn": "Hello, I would like to book at Ayder Paradise Otel",
    "isFeatured": true,
    "isActive": true,
    "guestReviews": [
      {
        "id": "29-gr1",
        "author": "Mohamed",
        "countryAr": "قطر",
        "countryEn": "Qatar",
        "rating": 9,
        "date": "",
        "titleAr": "عائلة ودودة",
        "titleEn": "Friendly family",
        "textAr": "عائلة ودودة ولطيفة في مكان هادئ مع موقف سيارات.",
        "textEn": "Friendly and lovely family will serve you quiet place with ability to parking.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "29-gr2",
        "author": "Ahmed",
        "countryAr": "عمان",
        "countryEn": "Oman",
        "rating": 10,
        "date": "",
        "titleAr": "جان وزعفران",
        "titleEn": "Jan and Zafran",
        "textAr": "جان كان مفيداً جداً وزعفران نشيط وودود.",
        "textEn": "Jan was so helpful and provide any means for help also Zafran was so active and friendly.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "29-gr3",
        "author": "Nader",
        "countryAr": "المملكة العربية السعودية",
        "countryEn": "Saudi Arabia",
        "rating": 10,
        "date": "",
        "titleAr": "إطلالة مذهلة",
        "titleEn": "Amazing view",
        "textAr": "الإطلالة مذهلة والضيافة استثنائية! أحببتها!",
        "textEn": "The view was amazing. The hospitality was exceptional! I loved it !",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "29-gr4",
        "author": "Yousef",
        "countryAr": "الإمارات العربية المتحدة",
        "countryEn": "United Arab Emirates",
        "rating": 9,
        "date": "",
        "titleAr": "مالك مفيد",
        "titleEn": "Helpful owner",
        "textAr": "مالك لطيف ومفيد جداً ونصحنا بأماكن الزيارة في آيدر.",
        "textEn": "nice owner. very helpful and supportive. he even advised us with the nice locations to visit in ayder. trying his best to make the stay nice and comfortable",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      },
      {
        "id": "29-gr5",
        "author": "Ahmed",
        "countryAr": "المملكة العربية السعودية",
        "countryEn": "Saudi Arabia",
        "rating": 9,
        "date": "",
        "titleAr": "نظيف وجميل",
        "titleEn": "Clean and beautiful",
        "textAr": "إقامة جميلة والفندق نظيف وموقعه ممتاز والطاقم في قمة اللطف...",
        "textEn": "The stay was very nice, the hotel is clean and beautiful, and its location is excellent. The most beautiful thing is that the staff in charge of this hotel were at the top of kindness...",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Ayder plateau trails",
        "nameAr": "مسارات هضبة آيدر",
        "lat": 41.017194572847345,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Çamlıhemşin",
        "nameAr": "تشاملي هيمشين",
        "lat": 41.01140557178382,
        "lng": 28.98438820735332,
        "category": "attraction"
      },
      {
        "nameEn": "Rize–Artvin Airport",
        "nameAr": "مطار ريزا",
        "lat": 40.70844703752321,
        "lng": 29.39382093312476,
        "category": "transport"
      }
    ]
  },
  {
    "id": "30",
    "slug": "yesilvadi",
    "nameAr": "يشيل فادي أوتيل",
    "nameEn": "Yeşilvadi Otel",
    "city": "Rize",
    "country": "Turkey",
    "neighborhoodAr": "ريزا",
    "neighborhoodEn": "Rize",
    "stars": 4,
    "rating": 7,
    "reviewCount": 14,
    "addressAr": "منطقة هضبة آيدر، قضاء ريزا، تركيا",
    "addressEn": "Ayder Yaylası area, Rize district, Turkey",
    "descriptionAr": "يشيل فادي أوتيل عائلي في هضبة آيدر المنعزلة وسط جبال الصنوبر. غرف بأرضيات خشبية ومطعم إقليمي للبحر الأسود وتراس بإطلالات طبيعة وقرب ينابيع آيدر الحارة (50 م).",
    "descriptionEn": "Family-run Yeşilvadi Otel in a secluded Ayder plateau setting surrounded by pine mountains. Wooden-floor rooms with central heating, regional Black Sea restaurant, terrace with nature views, and proximity to Ayder hot springs (50 m).",
    "highlightsAr": [
      "آيدر بين غابات الصنوبر",
      "مطعم إقليمي للبحر الأسود",
      "عائلي منذ 1906"
    ],
    "highlightsEn": [
      "Secluded pine-forest Ayder",
      "Black Sea regional restaurant",
      "Family-run since 1906 heritage"
    ],
    "images": [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    ],
    "amenities": [
      "Restaurant (Black Sea cuisine)",
      "Terrace with nature views",
      "Free WiFi",
      "Central heating",
      "Mountain / forest views",
      "Private bathrooms",
      "Airport shuttle",
      "Room service",
      "Family rooms",
      "Non-smoking rooms",
      "Ping-pong / game room",
      "Breakfast buffet"
    ],
    "nearbyAr": [
      "ينابيع آيدر الحارة — 50 م",
      "مركز هضبة آيدر — محلي",
      "قلعة زيل — 21 ميل",
      "هضبة كافور — 8.1 ميل",
      "مطار ريزا-أرتفين — 93 ميل",
      "مطار طرابزون — 93 ميل"
    ],
    "nearbyEn": [
      "Ayder hot springs — 50 m",
      "Ayder Yaylası centre — local",
      "Zil Castle — 21 mi",
      "Kavur Plateau — 8.1 mi",
      "Rize–Artvin Airport — 93 mi",
      "Trabzon Airport — 93 mi"
    ],
    "rooms": [
      {
        "id": "30-r1",
        "nameAr": "غرفة دبل قياسية",
        "nameEn": "Standard Double Room",
        "descriptionAr": "سرير مزدوج، أرضيات خشبية، إطلالة جبل.",
        "descriptionEn": "1 full bed, wooden floors, mountain view.",
        "beds": "1 King",
        "capacity": 2,
        "sizeSqm": 22,
        "price": 65,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "30-r2",
        "nameAr": "غرفة توين قياسية",
        "nameEn": "Standard Twin Room",
        "descriptionAr": "سريران توين مع تلفزيون وتدفئة.",
        "descriptionEn": "2 twin beds with satellite TV and heating.",
        "beds": "2 Twin",
        "capacity": 2,
        "sizeSqm": 22,
        "price": 85,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Lounge",
          "Bathrobe",
          "Espresso"
        ],
        "images": [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": false
      },
      {
        "id": "30-r1",
        "nameAr": "غرفة ثلاثية قياسية",
        "nameEn": "Standard Triple Room",
        "descriptionAr": "غرفة ثلاثية لمجموعات صغيرة.",
        "descriptionEn": "Triple room for small groups.",
        "beds": "3 Twin",
        "capacity": 3,
        "sizeSqm": 28,
        "price": 105,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "30-r1",
        "nameAr": "جناح كوين غرفتان",
        "nameEn": "Two-Bedroom Queen Suite - Non-Smoking",
        "descriptionAr": "جناح غرفتين بمساحة معيشة (فئة بوكينج).",
        "descriptionEn": "Two-bedroom suite with living space (Booking category).",
        "beds": "1 King",
        "capacity": 4,
        "sizeSqm": 45,
        "price": 130,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      },
      {
        "id": "30-r1",
        "nameAr": "غرفة عائلية",
        "nameEn": "Family Room (2 Adults + 3 Children)",
        "descriptionAr": "غرفة عائلية كبيرة حتى 5 أشخاص.",
        "descriptionEn": "Large family room sleeping up to 5.",
        "beds": "1 King",
        "capacity": 5,
        "sizeSqm": 40,
        "price": 155,
        "currency": "USD",
        "amenities": [
          "WiFi",
          "Mini Bar",
          "Safe",
          "Smart TV"
        ],
        "images": [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"
        ],
        "breakfastIncluded": true,
        "freeCancellation": true
      }
    ],
    "lat": 41.02786608127135,
    "lng": 40.526032019628616,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policiesAr": [
      "تسجيل الوصول من 14:00",
      "تسجيل المغادرة حتى 12:00"
    ],
    "policiesEn": [
      "Check-in from 14:00",
      "Check-out until 12:00"
    ],
    "whatsappNumber": "905321796763",
    "whatsappMessageAr": "مرحباً، أرغب بالحجز في يشيل فادي أوتيل",
    "whatsappMessageEn": "Hello, I would like to book at Yeşilvadi Otel",
    "isFeatured": false,
    "isActive": true,
    "guestReviews": [
      {
        "id": "30-gr1",
        "author": "Ayanakoji",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 8,
        "date": "May 2026",
        "titleAr": "إطلالة مذهلة",
        "titleEn": "Incredible view",
        "textAr": "الإطلالة مذهلة والعاملون لطفاء والغرف نظيفة ونوم مريح مع صوت الماء.",
        "textEn": "The view was incredible, and the workers were too kind, the rooms were so clean, it was so comfortable to sleep while hearing the sound of falling water",
        "source": "Tripadvisor",
        "stayTypeAr": "زوجان",
        "stayTypeEn": "Couple"
      },
      {
        "id": "30-gr2",
        "author": "Mohammad",
        "countryAr": "الأردن",
        "countryEn": "Jordan",
        "rating": 8,
        "date": "May 2024",
        "titleAr": "سعر معقول",
        "titleEn": "Reasonable price",
        "textAr": "أكثر فندق معقول السعر في المنطقة. الطاقم لطيف والغرف نظيفة ومريحة على الطريق الرئيسي.",
        "textEn": "I found this hotel the most reasonable in price among others in the area. The staff is very nice as well. Rooms are clean and very comfortable. Located on the main road.",
        "source": "Tripadvisor",
        "stayTypeAr": "مسافر منفرد",
        "stayTypeEn": "Solo traveler"
      },
      {
        "id": "30-gr3",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 7,
        "date": "",
        "titleAr": "إفطار البحر الأسود",
        "titleEn": "Black Sea breakfast",
        "textAr": "إفطار بوفيه بمنتجات القرية. موقع جيد بهواء وإطلالة البحر الأسود وطبيعة.",
        "textEn": "Breakfast was like an open buffet, we were full of village products. The hotel is in a good location, with the full Black Sea air and view, intertwined with nature.",
        "source": "Tripadvisor",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "30-gr4",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 7,
        "date": "",
        "titleAr": "ضيافة دافئة",
        "titleEn": "Warm hospitality",
        "textAr": "أول زيارة لآيدر وكان الإقامة في مكان دافئ وجميل شكراً للابتسامة والاهتمام. غرف نظيفة ومرتبة.",
        "textEn": "It was our first visit to Ayder, it is good that we stayed in such a warm and beautiful establishment. Thank you for their smiles and interest. Rooms were very clean and tidy.",
        "source": "Tripadvisor",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "30-gr5",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 6,
        "date": "",
        "titleAr": "عمارة إقليمية",
        "titleEn": "Regional architecture",
        "textAr": "لا تتوقع فخامة فائقة؛ عمارة خشبية محلية. الطاقم يبذل جهداً لإسعادك. العشاء والإفطار كافيان. موقع مركزي على الهضبة.",
        "textEn": "Do not expect ultra-luxury; it has local wooden architecture. Staff try to make you happy. Dinner and breakfast were sufficient. Central location on the plateau.",
        "source": "Tripadvisor",
        "stayTypeAr": "عائلة",
        "stayTypeEn": "Family with young children"
      },
      {
        "id": "30-gr6",
        "author": "Verified guest",
        "countryAr": "تركيا",
        "countryEn": "Turkey",
        "rating": 7,
        "date": "",
        "titleAr": "أجواء آيدر",
        "titleEn": "Ayder setting",
        "textAr": "في منطقة منعزلة من ريزا وسط غابات الصنوبر. ينابيع آيدر الحارة على بعد 50 م فقط.",
        "textEn": "Located in a secluded area of Rize district, surrounded by mountains of pine forests. Ayder hot spring baths are just 50 m from the hotel.",
        "source": "Booking.com",
        "stayTypeAr": "",
        "stayTypeEn": ""
      }
    ],
    "nearbyPlaces": [
      {
        "nameEn": "Ayder hot springs",
        "nameAr": "ينابيع آيدر الحارة",
        "lat": 41.017194572847345,
        "lng": 28.98,
        "category": "attraction"
      },
      {
        "nameEn": "Ayder Yaylası centre",
        "nameAr": "مركز هضبة آيدر",
        "lat": 41.01281114356764,
        "lng": 28.988776414706635,
        "category": "attraction"
      },
      {
        "nameEn": "Zil Castle",
        "nameAr": "قلعة زيل",
        "lat": 40.79891292626625,
        "lng": 29.269674653187334,
        "category": "attraction"
      },
      {
        "nameEn": "Kavur Plateau",
        "nameAr": "هضبة كافور",
        "lat": 40.900577198909545,
        "lng": 28.924336399866213,
        "category": "attraction"
      },
      {
        "nameEn": "Rize–Artvin Airport",
        "nameAr": "مطار ريزا",
        "lat": 40.963035123582884,
        "lng": 27.197722114589133,
        "category": "transport"
      },
      {
        "nameEn": "Trabzon Airport",
        "nameAr": "مطار طرابزون",
        "lat": 42.22963458604826,
        "lng": 28.22631769523252,
        "category": "transport"
      }
    ]
  },
  {
    id: "rixos-tersane-istanbul",
    slug: "rixos-tersane-istanbul",
    nameAr: "ريكسوس ترسانه إسطنبول",
    nameEn: "Rixos Tersane Istanbul",
    city: "Istanbul",
    country: "Turkey",
    neighborhoodAr: "القرن الذهبي / كاسیم باشا",
    neighborhoodEn: "Golden Horn / Kasımpaşa",
    stars: 5,
    rating: 9.1,
    reviewCount: 420,
    addressAr: "منطقة ترسانه، كاسیم باشا، القرن الذهبي، إسطنبول، تركيا",
    addressEn: "Tersane Istanbul, Kasımpaşa, Golden Horn, Istanbul, Turkey",
    descriptionAr:
      "فندق خمس نجوم على القرن الذهبي في موقع ترسانه التاريخي: غرف حديثة، إطلالات على الخليج، مطاعم، سبا، ومسبح. تسجيل الوصول 15:00 والمغادرة 12:00. هذا إدراج فندقي فقط — ليس برنامج عطلة.",
    descriptionEn:
      "A five-star hotel on the Golden Horn at the historic Tersane site: contemporary rooms, gulf views, restaurants, spa, and a pool. Check-in 15:00, check-out 12:00. Hotel listing only — not a holiday program.",
    highlightsAr: [
      "موقع على القرن الذهبي",
      "سبا ومسبح",
      "مطاعم داخل الفندق",
    ],
    highlightsEn: [
      "Golden Horn waterfront",
      "Spa and pool",
      "On-site restaurants",
    ],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
    ],
    amenities: [
      "Indoor pool",
      "Spa / Hammam",
      "Fitness center",
      "Free Wi-Fi",
      "Restaurants & bars",
      "Room service",
      "Concierge",
      "Valet parking",
    ],
    nearbyAr: [
      "جسر غلطة — مسافة قصيرة",
      "القرن الذهبي — على الواجهة",
      "تقسيم — حوالي 10 دقائق بالسيارة",
    ],
    nearbyEn: [
      "Galata Bridge — short ride",
      "Golden Horn — on the waterfront",
      "Taksim — about 10 minutes by car",
    ],
    rooms: [
      {
        id: "rixos-tersane-r1",
        nameAr: "غرفة ديلوكس كينغ",
        nameEn: "Deluxe King Room",
        descriptionAr: "غرفة كينغ مع إطلالة مدينة أو خليج حسب التوفر.",
        descriptionEn: "King room with city or gulf view depending on availability.",
        beds: "1 King",
        capacity: 2,
        sizeSqm: 38,
        price: 280,
        currency: "USD",
        amenities: ["WiFi", "Mini Bar", "Safe", "Smart TV"],
        images: [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
        ],
        breakfastIncluded: true,
        freeCancellation: true,
      },
      {
        id: "rixos-tersane-r2",
        nameAr: "غرفة تنفيذية بإطلالة الخليج",
        nameEn: "Executive Gulf View Room",
        descriptionAr: "غرفة أوسع بإطلالة على القرن الذهبي.",
        descriptionEn: "Larger room overlooking the Golden Horn.",
        beds: "1 King",
        capacity: 2,
        sizeSqm: 46,
        price: 360,
        currency: "USD",
        amenities: ["WiFi", "Lounge access", "Bathrobe", "Espresso"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
        ],
        breakfastIncluded: true,
        freeCancellation: false,
      },
    ],
    lat: 41.0298,
    lng: 28.9614,
    checkIn: "15:00",
    checkOut: "12:00",
    policiesAr: [
      "تسجيل الوصول من الساعة 15:00",
      "المغادرة حتى الساعة 12:00",
      "الأسعار تقريبية بالدولار لليلة وليست حجزاً حياً",
    ],
    policiesEn: [
      "Check-in from 15:00",
      "Check-out until 12:00",
      "Nightly USD rates are approximate — not a live booking quote",
    ],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr: "مرحباً، أرغب بالحجز في ريكسوس ترسانه إسطنبول",
    whatsappMessageEn: "Hello, I would like to book at Rixos Tersane Istanbul",
    isFeatured: true,
    isActive: true,
  }
];

function save(hotels: Hotel[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
}

function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeRoom(room: Record<string, unknown>, index: number) {
  return {
    id: String(room.id || `r${Date.now()}-${index}`),
    nameAr: String(room.nameAr || ""),
    nameEn: String(room.nameEn || ""),
    descriptionAr: String(room.descriptionAr || ""),
    descriptionEn: String(room.descriptionEn || ""),
    beds: String(room.beds || "1 King"),
    capacity: Number(room.capacity) || 2,
    sizeSqm: Number(room.sizeSqm) || 0,
    price: Number(room.price) || 0,
    currency: String(room.currency || "USD"),
    amenities: parseListField(room.amenities),
    images: parseListField(room.images),
    breakfastIncluded: Boolean(room.breakfastIncluded),
    freeCancellation: Boolean(room.freeCancellation),
  };
}

function normalizeGuestReview(
  review: Record<string, unknown>,
  index: number
): HotelGuestReview {
  const sourceRaw = String(review.source || "Booking.com");
  const source =
    sourceRaw === "Tripadvisor" ||
    sourceRaw === "Booking.com" ||
    sourceRaw === "Google" ||
    sourceRaw === "Expedia"
      ? sourceRaw
      : "Booking.com";

  return {
    id: String(review.id || `gr-${Date.now()}-${index}`),
    author: String(review.author || "Guest"),
    countryAr: String(review.countryAr || ""),
    countryEn: String(review.countryEn || ""),
    rating: Number(review.rating) || 0,
    date: String(review.date || ""),
    titleAr: String(review.titleAr || ""),
    titleEn: String(review.titleEn || ""),
    textAr: String(review.textAr || ""),
    textEn: String(review.textEn || ""),
    source,
    stayTypeAr: String(review.stayTypeAr || ""),
    stayTypeEn: String(review.stayTypeEn || ""),
  };
}

function migrateIfNeeded(hotels: Hotel[]): Hotel[] {
  return hotels.map((raw) => {
    const h = raw as Hotel & Record<string, unknown>;
    const rooms = Array.isArray(h.rooms)
      ? h.rooms.map((r, i) =>
          normalizeRoom(r as unknown as Record<string, unknown>, i)
        )
      : [];

    const guestReviews = Array.isArray(h.guestReviews)
      ? h.guestReviews.map((r, i) =>
          normalizeGuestReview(r as unknown as Record<string, unknown>, i)
        )
      : undefined;

    const cleanNameEn = cleanHotelDisplayName(String(h.nameEn || ""), String(h.slug || ""), "Luxury Hotel");
    const cleanNameAr = cleanHotelDisplayName(String(h.nameAr || ""), String(h.slug || ""), cleanNameEn);

    return {
      id: String(h.id),
      slug: String(h.slug || ""),
      nameAr: cleanNameAr,
      nameEn: cleanNameEn,
      city: String(h.city || ""),
      country: String(h.country || "Turkey"),
      neighborhoodAr: String(h.neighborhoodAr || h.city || ""),
      neighborhoodEn: String(h.neighborhoodEn || h.city || ""),
      stars: Number(h.stars) || 5,
      rating: Number(h.rating) || 0,
      reviewCount: Number(h.reviewCount) || 0,
      addressAr: String(h.addressAr || ""),
      addressEn: String(h.addressEn || ""),
      descriptionAr: String(h.descriptionAr || ""),
      descriptionEn: String(h.descriptionEn || ""),
      highlightsAr: parseListField(h.highlightsAr),
      highlightsEn: parseListField(h.highlightsEn),
      images: parseListField(h.images),
      amenities: parseListField(h.amenities),
      nearbyAr: parseListField(h.nearbyAr),
      nearbyEn: parseListField(h.nearbyEn),
      nearbyPlaces: Array.isArray(h.nearbyPlaces)
        ? h.nearbyPlaces.map((p) => {
            const raw = p as { nameEn?: string; nameAr?: string; lat?: number; lng?: number; category?: string };
            const cat = String(raw.category || "");
            const category =
              cat === "transport" || cat === "dining" || cat === "nature" || cat === "attraction"
                ? cat
                : undefined;
            return {
              nameEn: String(raw.nameEn || ""),
              nameAr: String(raw.nameAr || ""),
              lat: Number(raw.lat) || 0,
              lng: Number(raw.lng) || 0,
              category,
            };
          })
        : undefined,
      guestReviews,
      rooms,
      lat: Number(h.lat) || 41.0082,
      lng: Number(h.lng) || 28.9784,
      checkIn: String(h.checkIn || "15:00"),
      checkOut: String(h.checkOut || "12:00"),
      policiesAr: parseListField(h.policiesAr),
      policiesEn: parseListField(h.policiesEn),
      whatsappNumber: resolveHotelWhatsApp(h.whatsappNumber),
      whatsappMessageAr:
        String(h.whatsappMessageAr || "") ||
        `مرحباً، أرغب بالحجز في ${h.nameAr || "هذا الفندق"}`,
      whatsappMessageEn:
        String(h.whatsappMessageEn || "") ||
        `Hello, I would like to book at ${h.nameEn || "this hotel"}`,
      phone: h.phone ? String(h.phone) : undefined,
      website: h.website ? String(h.website) : undefined,
      isFeatured: Boolean(h.isFeatured),
      isActive: h.isActive !== false,
    } satisfies Hotel;
  });
}

function clearLegacyKeys() {
  for (const key of OLD_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export function getHotels(): Hotel[] {
  if (typeof window === "undefined") return defaultHotels;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = migrateIfNeeded(JSON.parse(stored) as Hotel[]);
      return parsed;
    } catch {
      return defaultHotels;
    }
  }

  clearLegacyKeys();
  save(defaultHotels);
  return defaultHotels;
}

export function getActiveHotels(): Hotel[] {
  return getHotels().filter((h) => h.isActive);
}

export function getFeaturedHotels(): Hotel[] {
  return getActiveHotels().filter((h) => h.isFeatured);
}

export function getHotelBySlug(slug: string): Hotel | undefined {
  return getHotels().find((h) => h.slug === slug);
}

export function getHotelById(id: string): Hotel | undefined {
  return getHotels().find((h) => h.id === id);
}

export function addHotel(input: HotelInput): Hotel {
  const hotels = getHotels();
  const hotel: Hotel = { ...input, id: Date.now().toString() };
  hotels.unshift(hotel);
  save(hotels);
  return hotel;
}

export function updateHotel(id: string, data: Partial<Hotel>): Hotel | null {
  const hotels = getHotels();
  const idx = hotels.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  hotels[idx] = { ...hotels[idx], ...data, id };
  save(hotels);
  return hotels[idx];
}

export function deleteHotel(id: string): boolean {
  const remaining = getHotels().filter((h) => h.id !== id && h.slug !== id);
  save(remaining);
  return true;
}

export function resetHotels() {
  clearLegacyKeys();
  save(defaultHotels);
}
