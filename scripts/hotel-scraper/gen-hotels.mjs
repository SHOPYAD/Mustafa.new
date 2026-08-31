import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "../../src/data/hotels.ts");

const DEFAULT_WA = "971585255484";
const R1 = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80";
const R2 = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80";
const L = [
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&q=80",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80",
];
const H = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1600&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80",
];
const R = [
  "https://images.unsplash.com/photo-1571005127559-1fa0260d2b12?w=1600&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1600&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
];
const N = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80",
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1600&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80",
];
const C = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4fcc5f?w=1600&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
];
const B = [
  "https://images.unsplash.com/photo-1449158743715-0acbb0542ba3?w=1600&q=80",
  "https://images.unsplash.com/photo-1510797861213-6737b2780a1f?w=1600&q=80",
  "https://images.unsplash.com/photo-1504280390367-361c66d9e26d?w=1600&q=80",
  "https://images.unsplash.com/photo-1478131143278-32eabc3907fc?w=1600&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80",
];

function rm(id, nAr, nEn, dAr, dEn, beds, cap, sqm, price, am, bf = false, fc = true) {
  return { id, nameAr: nAr, nameEn: nEn, descriptionAr: dAr, descriptionEn: dEn, beds, capacity: cap, sizeSqm: sqm, price, currency: "USD", amenities: am, images: [R1, R2], breakfastIncluded: bf, freeCancellation: fc };
}

function mk(o) {
  return {
    country: "Turkey", checkIn: "15:00", checkOut: "12:00", whatsappNumber: DEFAULT_WA, isActive: true,
    policiesAr: ["تسجيل الوصول من 15:00", "تسجيل المغادرة حتى 12:00", "ممنوع التدخين داخل الغرف"],
    policiesEn: ["Check-in from 15:00", "Check-out until 12:00", "Non-smoking rooms"],
    ...o,
  };
}

const defaultHotels = [
  mk({ id: "1", slug: "ciragan-palace-kempinski-istanbul", nameAr: "قصر تشيراغان كемпinski إسطنبول", nameEn: "Ciragan Palace Kempinski Istanbul", city: "Istanbul", neighborhoodAr: "بيشكتاش", neighborhoodEn: "Besiktas", stars: 5, rating: 4.8, reviewCount: 6240, addressAr: "Ciragan Cd., Besiktas, Istanbul", addressEn: "Ciragan Cd., Besiktas, Istanbul", descriptionAr: "قصر عثماني تاريخي على البوسفور مع غرف فاخرة ومسبح لا متناهٍ وسبا عالمي.", descriptionEn: "Historic Ottoman palace on the Bosphorus with lavish rooms, infinity pool, and world-class spa.", highlightsAr: ["قصر عثماني", "إطلالة البوسفور", "سبا فاخر"], highlightsEn: ["Ottoman palace", "Bosphorus views", "Luxury spa"], images: L, amenities: ["Spa", "Infinity Pool", "Fine Dining", "Bosphorus View", "WiFi", "Valet"], rooms: [rm("cpk-1", "غرفة ديلوكس بإطلالة البوسفور", "Deluxe Bosphorus View Room", "غرفة أنيقة بإطلالة على المضيق.", "Elegant room with Bosphorus views.", "1 King", 2, 45, 420, ["Bosphorus View", "Mini Bar"], true), rm("cpk-2", "جناح قصر", "Palace Suite", "جناح فاخر بصالة.", "Luxury suite with lounge.", "1 King + Sofa", 3, 95, 980, ["Butler", "Lounge"], true, false)], lat: 41.0448, lng: 29.0134, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز قصر تشيراغان كيمبinski إسطنبول.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Ciragan Palace Kempinski Istanbul.", phone: "+90 212 326 4646", website: "https://www.kempinski.com/en/istanbul/ciragan-palace", isFeatured: true }),
  mk({ id: "2", slug: "raffles-istanbul", nameAr: "رaffles إسطنبول", nameEn: "Raffles Istanbul", city: "Istanbul", neighborhoodAr: "زورluلو", neighborhoodEn: "Zorlu Center", stars: 5, rating: 4.9, reviewCount: 4120, addressAr: "Zorlu Center, Besiktas, Istanbul", addressEn: "Zorlu Center, Besiktas, Istanbul", descriptionAr: "فندق فاخر في برج زورlu مع إطلالات بانورامية على البوسفور وسبا واسع ومطاعم راقية.", descriptionEn: "Luxury tower hotel at Zorlu Center with panoramic Bosphorus views, expansive spa, and fine dining.", highlightsAr: ["برج زورlu", "إطلالة بانورامية", "سبا واسع"], highlightsEn: ["Zorlu tower", "Panoramic views", "Expansive spa"], images: L, amenities: ["Spa", "Indoor Pool", "Fine Dining", "City View", "WiFi", "Concierge"], rooms: [rm("raf-1", "غرفة ديلوكس", "Deluxe Room", "غرفة عصرية بإطلالة على المدينة.", "Contemporary room with city views.", "1 King", 2, 50, 380, ["City View", "Nespresso"], true), rm("raf-2", "جناح بوسفور", "Bosphorus Suite", "جناح واسع بإطلالة على المضيق.", "Spacious suite with strait views.", "1 King + Sofa", 3, 90, 720, ["Bosphorus View", "Lounge"], true)], lat: 41.0673, lng: 29.0162, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز raffles إسطنبول.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Raffles Istanbul.", phone: "+90 212 924 0200", website: "https://www.raffles.com/istanbul", isFeatured: true }),
  mk({ id: "3", slug: "four-seasons-bosphorus-istanbul", nameAr: "فور سيزونز البوسفور إسطنبول", nameEn: "Four Seasons Hotel Istanbul at the Bosphorus", city: "Istanbul", neighborhoodAr: "بشiktاش", neighborhoodEn: "Besiktas", stars: 5, rating: 4.8, reviewCount: 5890, addressAr: "Ciragan Cd. No:28, Besiktas, Istanbul", addressEn: "Ciragan Cd. No:28, Besiktas, Istanbul", descriptionAr: "قصر عثماني محول إلى فندق فاخر على البوسفور مع حدائق وتراسات ومسبح خارجي.", descriptionEn: "Ottoman palace converted into a Bosphorus luxury hotel with gardens, terraces, and outdoor pool.", highlightsAr: ["قصر تاريخي", "حدائق على البوسفور", "خدمة Four Seasons"], highlightsEn: ["Historic palace", "Bosphorus gardens", "Four Seasons service"], images: L, amenities: ["Spa", "Outdoor Pool", "Fine Dining", "Bosphorus View", "WiFi", "Garden"], rooms: [rm("fsb-1", "غرفة ممتازة", "Superior Room", "غرفة أنيقة في القصر التاريخي.", "Elegant room in the historic palace.", "1 King", 2, 43, 450, ["Garden View", "Marble Bath"], true), rm("fsb-2", "جناح بوسفور", "Bosphorus Suite", "جناح بإطلالة مباشرة على المضيق.", "Suite with direct Bosphorus views.", "1 King", 2, 75, 890, ["Bosphorus View", "Terrace"], true, false)], lat: 41.0419, lng: 29.0096, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز فور سيزونز البوسفور.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Four Seasons Bosphorus Istanbul.", phone: "+90 212 381 4000", website: "https://www.fourseasons.com/istanbul", isFeatured: true }),
  mk({ id: "4", slug: "shangri-la-bosphorus-istanbul", nameAr: "شangri-La البوسفور إسطنبول", nameEn: "Shangri-La Bosphorus Istanbul", city: "Istanbul", neighborhoodAr: "بشiktاش", neighborhoodEn: "Besiktas", stars: 5, rating: 4.7, reviewCount: 5340, addressAr: "Sinan Pasa Mh., Besiktas, Istanbul", addressEn: "Sinan Pasa Mh., Besiktas, Istanbul", descriptionAr: "فندق فاخر بإطلالة مباشرة على البوسfور مع سبا CHI ومطاعم آسيوية وتركية.", descriptionEn: "Luxury hotel with direct Bosphorus views, CHI Spa, and Asian-Turkish dining.", highlightsAr: ["إطلالة البوسfور", "سبا CHI", "مطاعم راقية"], highlightsEn: ["Bosphorus views", "CHI Spa", "Fine dining"], images: L, amenities: ["Spa", "Indoor Pool", "Fine Dining", "Bosphorus View", "WiFi", "Fitness"], rooms: [rm("slb-1", "غرفة ديلوكس بإطلالة", "Deluxe View Room", "غرفة بإطلالة على المضيق أو المدينة.", "Room with strait or city views.", "1 King", 2, 42, 360, ["View", "Mini Bar"], true), rm("slb-2", "جناح شangri-La", "Shangri-La Suite", "جناح فاخر بصالة منفصلة.", "Luxury suite with separate lounge.", "1 King + Sofa", 3, 80, 680, ["Bosphorus View", "Lounge"], true)], lat: 41.0398, lng: 29.0041, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز شangri-La البوسfور.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Shangri-La Bosphorus Istanbul.", phone: "+90 212 275 8888", website: "https://www.shangri-la.com/istanbul", isFeatured: true }),
  mk({ id: "5", slug: "the-peninsula-istanbul", nameAr: "ذا بينinsuLa إسطنبول", nameEn: "The Peninsula Istanbul", city: "Istanbul", neighborhoodAr: "كaraköy", neighborhoodEn: "Karakoy", stars: 5, rating: 4.9, reviewCount: 2180, addressAr: "Karakoy, Istanbul", addressEn: "Karakoy, Istanbul", descriptionAr: "فندق Peninsula جديد على الواجهة البحرية في كaraköy بثلاثة مبانٍ تراثية وسبا فاخر.", descriptionEn: "New Peninsula waterfront hotel in Karakoy spanning three heritage buildings with a luxury spa.", highlightsAr: ["واجهة بحرية", "مبانٍ تراثية", "سبا Peninsula"], highlightsEn: ["Waterfront", "Heritage buildings", "Peninsula spa"], images: L, amenities: ["Spa", "Rooftop Pool", "Fine Dining", "Harbor View", "WiFi", "Concierge"], rooms: [rm("pen-1", "غرفة ممتازة", "Superior Room", "غرفة أنيقة بإطلالة على الميناء.", "Elegant room with harbor views.", "1 King", 2, 45, 520, ["Harbor View", "Smart TV"], true), rm("pen-2", "جناح بينinsuLa", "Peninsula Suite", "جناح فاخر بخدمة Peninsula.", "Luxury suite with Peninsula service.", "1 King + Sofa", 3, 95, 1100, ["Suite", "Butler"], true, false)], lat: 41.0235, lng: 28.9742, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز The Peninsula Istanbul.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book The Peninsula Istanbul.", phone: "+90 212 777 8888", website: "https://www.peninsula.com/en/istanbul", isFeatured: true }),
  mk({ id: "6", slug: "swissotel-the-bosphorus-istanbul", nameAr: "سويسotel ذا البوسfور", nameEn: "Swissotel The Bosphorus Istanbul", city: "Istanbul", neighborhoodAr: "بشiktاش", neighborhoodEn: "Besiktas", stars: 5, rating: 4.6, reviewCount: 8920, addressAr: "Visnezade Mh., Besiktas, Istanbul", addressEn: "Visnezade Mh., Besiktas, Istanbul", descriptionAr: "منتجع حضري واسع في حديقة أتاتürk بإطلالات على البوسfور ومسابح متعددة.", descriptionEn: "Expansive urban resort in Ataturk Park with Bosphorus views and multiple pools.", highlightsAr: ["حديقة أتاتürk", "مسابح متعددة", "إطلالة البوسfور"], highlightsEn: ["Ataturk Park", "Multiple pools", "Bosphorus views"], images: H, amenities: ["Spa", "Outdoor Pool", "Fitness", "Bosphorus View", "WiFi", "Restaurants"], rooms: [rm("swb-1", "غرفة ديلوكس", "Deluxe Room", "غرفة واسعة بإطلالة على الحديقة.", "Spacious room with park views.", "1 King", 2, 38, 220, ["Park View", "WiFi"], false, true), rm("swb-2", "غرفة بإطلالة بوسfور", "Bosphorus View Room", "إطلالة على المضيق.", "Strait-facing room.", "1 King", 2, 38, 290, ["Bosphorus View"], true)], lat: 41.0405, lng: 28.9878, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Swissotel The Bosphorus.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Swissotel The Bosphorus Istanbul.", phone: "+90 212 326 1100", website: "https://www.swissotel.com/hotels/istanbul", isFeatured: false }),
  mk({ id: "7", slug: "cvk-park-bosphorus-istanbul", nameAr: "CVK Park Bosphorus Hotel", nameEn: "CVK Park Bosphorus Hotel Istanbul", city: "Istanbul", neighborhoodAr: "Taksim", neighborhoodEn: "Taksim", stars: 5, rating: 4.5, reviewCount: 7650, addressAr: "Gumussuyu Mh., Taksim, Istanbul", addressEn: "Gumussuyu Mh., Taksim, Istanbul", descriptionAr: "فندق فاخر في Taksim بإطلالة على البوسfور وقرب من Gezi Park.", descriptionEn: "Luxury Taksim hotel with Bosphorus views near Gezi Park.", highlightsAr: ["موقع Taksim", "إطلالة البوسfور", "سبا"], highlightsEn: ["Taksim location", "Bosphorus views", "Spa"], images: H, amenities: ["Spa", "Indoor Pool", "Restaurant", "City View", "WiFi", "Parking"], rooms: [rm("cvk-1", "غرفة ممتازة", "Superior Room", "غرفة مريحة في قلب إسطنبول.", "Comfortable room in central Istanbul.", "1 King", 2, 35, 180, ["City View"], false), rm("cvk-2", "غرفة بإطلالة بوسfور", "Bosphorus View Room", "إطلالة على المضيق.", "Bosphorus-facing room.", "1 King", 2, 35, 240, ["Bosphorus View"], true)], lat: 41.0348, lng: 28.9852, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز CVK Park Bosphorus.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book CVK Park Bosphorus Hotel.", phone: "+90 212 377 8888", website: "https://www.cvkhotelsandresorts.com", isFeatured: false }),
  mk({ id: "8", slug: "pera-palace-hotel-istanbul", nameAr: "فندق Pera Palace", nameEn: "Pera Palace Hotel Istanbul", city: "Istanbul", neighborhoodAr: "Beyoglu", neighborhoodEn: "Beyoglu", stars: 5, rating: 4.7, reviewCount: 4560, addressAr: "Mesrutiyet Cd., Beyoglu, Istanbul", addressEn: "Mesrutiyet Cd., Beyoglu, Istanbul", descriptionAr: "فندق تاريخي Legendary من 1892 في Beyoglu، موطن Agatha Christie ومقطف سينمائي.", descriptionEn: "Legendary 1892 historic hotel in Beyoglu, linked to Agatha Christie and classic cinema.", highlightsAr: ["فندق تاريخي 1892", "غرفة Agatha Christie", "Beyoglu"], highlightsEn: ["Historic since 1892", "Agatha Christie room", "Beyoglu district"], images: H, amenities: ["Spa", "Historic Bar", "Fine Dining", "WiFi", "Concierge", "Heritage Tours"], rooms: [rm("pp-1", "غرفة كلاسيك", "Classic Room", "غرفة بأسلوب Belle Epoque.", "Belle Epoque styled room.", "1 King", 2, 30, 260, ["Heritage", "Mini Bar"], true), rm("pp-2", "جناح Agatha Christie", "Agatha Christie Suite", "جناح تاريخي بإطلالة على القرن الذهبي.", "Historic suite overlooking the Golden Horn.", "1 King", 2, 55, 480, ["Golden Horn View", "Heritage"], true)], lat: 41.0343, lng: 28.977, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Pera Palace Hotel.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Pera Palace Hotel Istanbul.", phone: "+90 212 377 4000", website: "https://www.perapalace.com", isFeatured: true }),
  mk({ id: "9", slug: "rixos-premium-belek", nameAr: "ريكسos Premium Belek", nameEn: "Rixos Premium Belek", city: "Antalya", neighborhoodAr: "Belek", neighborhoodEn: "Belek", stars: 5, rating: 4.7, reviewCount: 12450, addressAr: "Belek, Serik, Antalya", addressEn: "Belek, Serik, Antalya", descriptionAr: "منتجع Ultra All Inclusive على شاطئ البحر المتوسط مع أكوا پارك وسبا وملاعب غولف.", descriptionEn: "Ultra all-inclusive Mediterranean beach resort with aquapark, spa, and golf courses.", highlightsAr: ["Ultra All Inclusive", "شاطئ خاص", "أكوا پارك"], highlightsEn: ["Ultra all inclusive", "Private beach", "Aquapark"], images: R, amenities: ["All Inclusive", "Private Beach", "Aquapark", "Spa", "Golf", "Kids Club", "WiFi"], rooms: [rm("rix-1", "غرفة ديلوكس", "Deluxe Room", "غرفة مريحة في منتجع Belek.", "Comfortable Belek resort room.", "1 King or Twin", 2, 40, 320, ["Garden View", "Balcony"], true), rm("rix-2", "جناح عائلي", "Family Suite", "جناح واسع للعائلات.", "Spacious family suite.", "1 King + 2 Twin", 4, 75, 520, ["Sea View", "Living Area"], true)], lat: 36.8625, lng: 31.0556, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Rixos Premium Belek.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Rixos Premium Belek.", phone: "+90 242 710 0900", website: "https://www.rixos.com/en/hotel-resort/rixos-premium-belek", isFeatured: true }),
  mk({ id: "10", slug: "maxx-royal-kemer", nameAr: "Maxx Royal Kemer Resort", nameEn: "Maxx Royal Kemer Resort", city: "Antalya", neighborhoodAr: "Kemer", neighborhoodEn: "Kemer", stars: 5, rating: 4.8, reviewCount: 6780, addressAr: "Goynuk Mh., Kemer, Antalya", addressEn: "Goynuk Mh., Kemer, Antalya", descriptionAr: "منتجع فاخر على شاطئ Kemer مع خدمة Butler وUltra All Inclusive ومطاعم عالمية.", descriptionEn: "Luxury Kemer beach resort with butler service, ultra all inclusive, and world dining.", highlightsAr: ["Ultra All Inclusive", "خدمة Butler", "شاطئ Kemer"], highlightsEn: ["Ultra all inclusive", "Butler service", "Kemer beach"], images: R, amenities: ["All Inclusive", "Private Beach", "Butler", "Spa", "Fine Dining", "WiFi"], rooms: [rm("max-1", "غرفة لagoon", "Lagoon Room", "غرفة بإطلالة على البحيرة.", "Room with lagoon views.", "1 King", 2, 45, 480, ["Lagoon View"], true), rm("max-2", "فيلا على الشاطئ", "Beach Villa", "فيلا خاصة على الشاطئ.", "Private beach villa.", "1 King + Sofa", 3, 120, 980, ["Private Pool", "Beach Access"], true, false)], lat: 36.5971, lng: 30.5605, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Maxx Royal Kemer.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Maxx Royal Kemer Resort.", phone: "+90 242 813 6060", website: "https://www.maxxroyal.com/kemer", isFeatured: true }),
  mk({ id: "11", slug: "akra-antalya", nameAr: "Akra Antalya", nameEn: "Akra Antalya", city: "Antalya", neighborhoodAr: "Lara", neighborhoodEn: "Lara", stars: 5, rating: 4.6, reviewCount: 9340, addressAr: "Lara Cd., Muratpasa, Antalya", addressEn: "Lara Cd., Muratpasa, Antalya", descriptionAr: "فندق حضري فاخر على شاطئ Lara قرب وسط أنتalya مع سطح ومسابح.", descriptionEn: "Luxury city beach hotel on Lara coast near Antalya center with rooftop and pools.", highlightsAr: ["شاطئ Lara", "قرب وسط المدينة", "سطح ومسابح"], highlightsEn: ["Lara beach", "Near city center", "Rooftop pools"], images: R, amenities: ["Beach Access", "Spa", "Rooftop Pool", "Restaurants", "WiFi", "Fitness"], rooms: [rm("akr-1", "غرفة ديلوكس بحرية", "Deluxe Sea Room", "غرفة بإطلالة على البحر.", "Sea-view deluxe room.", "1 King", 2, 38, 210, ["Sea View"], true), rm("akr-2", "جناح Akra", "Akra Suite", "جناح واسع بإطلالة بانورامية.", "Spacious suite with panoramic views.", "1 King + Sofa", 3, 70, 380, ["Panoramic View", "Lounge"], true)], lat: 36.8569, lng: 30.7387, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Akra Antalya.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Akra Antalya.", phone: "+90 242 310 0000", website: "https://www.akrahotels.com", isFeatured: false }),
  mk({ id: "12", slug: "calista-luxury-resort-belek", nameAr: "Calista Luxury Resort Belek", nameEn: "Calista Luxury Resort Belek", city: "Antalya", neighborhoodAr: "Belek", neighborhoodEn: "Belek", stars: 5, rating: 4.6, reviewCount: 8120, addressAr: "Belek, Serik, Antalya", addressEn: "Belek, Serik, Antalya", descriptionAr: "منتجع عائلي فاخر في Belek مع شاطئ رملي وحدائق مائية وبرامج أطفال.", descriptionEn: "Luxury family resort in Belek with sandy beach, water features, and kids programmes.", highlightsAr: ["منتجع عائلي", "شاطئ رملي", "برامج أطفال"], highlightsEn: ["Family resort", "Sandy beach", "Kids programmes"], images: R, amenities: ["All Inclusive", "Private Beach", "Kids Club", "Spa", "Pools", "WiFi"], rooms: [rm("cal-1", "غرفة قياسية", "Standard Room", "غرفة مريحة في الحدائق.", "Comfortable garden room.", "1 King or Twin", 2, 35, 240, ["Garden View"], true), rm("cal-2", "غرفة عائلية", "Family Room", "غرفة واسعة للعائلات.", "Spacious family room.", "1 King + 2 Twin", 4, 55, 360, ["Family Layout"], true)], lat: 36.8542, lng: 31.0421, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Calista Luxury Resort.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Calista Luxury Resort Belek.", phone: "+90 242 752 0500", website: "https://www.calista.com.tr", isFeatured: false }),
  mk({ id: "13", slug: "regnum-carya-golf-spa", nameAr: "Regnum Carya Golf & Spa", nameEn: "Regnum Carya Golf & Spa Resort", city: "Antalya", neighborhoodAr: "Belek", neighborhoodEn: "Belek", stars: 5, rating: 4.7, reviewCount: 5670, addressAr: "Belek, Serik, Antalya", addressEn: "Belek, Serik, Antalya", descriptionAr: "منتجع فاخر بملعب غولف Carya وسبا وشاطئ خاص في Belek.", descriptionEn: "Luxury Belek resort with Carya golf course, spa, and private beach.", highlightsAr: ["ملعب غولف Carya", "شاطئ خاص", "سبا فاخر"], highlightsEn: ["Carya golf course", "Private beach", "Luxury spa"], images: R, amenities: ["All Inclusive", "Golf", "Spa", "Private Beach", "Fine Dining", "WiFi"], rooms: [rm("reg-1", "غرفة ديلوكس", "Deluxe Room", "غرفة أنيقة بإطلالة على الحديقة.", "Elegant garden-view room.", "1 King", 2, 42, 350, ["Garden View"], true), rm("reg-2", "جناح Regnum", "Regnum Suite", "جناح فاخر بخدمة VIP.", "Luxury suite with VIP service.", "1 King + Sofa", 3, 85, 620, ["Sea View", "VIP"], true)], lat: 36.8712, lng: 31.0289, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Regnum Carya.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Regnum Carya Golf & Spa.", phone: "+90 242 711 0700", website: "https://www.regnumcarya.com", isFeatured: true }),
  mk({ id: "14", slug: "museum-hotel-cappadocia", nameAr: "Museum Hotel Cappadocia", nameEn: "Museum Hotel Cappadocia", city: "Cappadocia", neighborhoodAr: "Uchisar", neighborhoodEn: "Uchisar", stars: 5, rating: 4.9, reviewCount: 3240, addressAr: "Uchisar, Nevsehir", addressEn: "Uchisar, Nevsehir", descriptionAr: "فندق Relais & Chateaux في قلعة Uchisar مع مجموعة فنية أثرية وإطلالة على وادي Göreme.", descriptionEn: "Relais & Chateaux hotel in Uchisar castle with antique art collection and Goreme Valley views.", highlightsAr: ["Relais & Chateaux", "قلعة Uchisar", "مجموعة فنية"], highlightsEn: ["Relais & Chateaux", "Uchisar castle", "Art collection"], images: C, amenities: ["Fine Dining", "Wine Cellar", "Valley View", "Spa", "WiFi", "Concierge"], rooms: [rm("mus-1", "غرفة Superior Cave", "Superior Cave Room", "غرفة في كهف أصلي مع إطلالة.", "Authentic cave room with views.", "1 King", 2, 40, 380, ["Cave", "Valley View"], true), rm("mus-2", "جناح Imperial", "Imperial Suite", "جناح فاخر بتراس خاص.", "Luxury suite with private terrace.", "1 King", 2, 80, 720, ["Terrace", "Valley View"], true, false)], lat: 38.6312, lng: 34.8056, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Museum Hotel Cappadocia.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Museum Hotel Cappadocia.", phone: "+90 384 219 2220", website: "https://www.museumhotel.com.tr", isFeatured: true }),
  mk({ id: "15", slug: "argos-in-cappadocia", nameAr: "Argos in Cappadocia", nameEn: "Argos in Cappadocia", city: "Cappadocia", neighborhoodAr: "Uchisar", neighborhoodEn: "Uchisar", stars: 5, rating: 4.8, reviewCount: 2890, addressAr: "Uchisar, Nevsehir", addressEn: "Uchisar, Nevsehir", descriptionAr: "فندق بوتik في ممرات وكهوف Uchisar مع تراسات وإطلالات على وادي Güvercinlik.", descriptionEn: "Boutique hotel in Uchisar tunnels and caves with terraces overlooking Pigeon Valley.", highlightsAr: ["فندق بوتik", "كهوف أصلية", "وادي Güvercinlik"], highlightsEn: ["Boutique hotel", "Original caves", "Pigeon Valley"], images: C, amenities: ["Fine Dining", "Wine Cave", "Terrace", "Valley View", "WiFi", "Spa"], rooms: [rm("arg-1", "غرفة Splendid", "Splendid Room", "غرفة في كهف مع إطلالة.", "Cave room with valley view.", "1 King", 2, 35, 320, ["Cave", "Valley View"], true), rm("arg-2", "جناح Deluxe", "Deluxe Suite", "جناح واسع بتراس.", "Spacious suite with terrace.", "1 King + Sofa", 3, 65, 520, ["Terrace", "Fireplace"], true)], lat: 38.6289, lng: 34.8034, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Argos in Cappadocia.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Argos in Cappadocia.", phone: "+90 384 219 3130", website: "https://www.argosincappadocia.com", isFeatured: true }),
  mk({ id: "16", slug: "kayakapi-premium-caves", nameAr: "Kayakapi Premium Caves", nameEn: "Kayakapi Premium Caves Cappadocia", city: "Cappadocia", neighborhoodAr: "Urgup", neighborhoodEn: "Urgup", stars: 5, rating: 4.7, reviewCount: 1980, addressAr: "Kayakapi Mh., Urgup, Nevsehir", addressEn: "Kayakapi Mh., Urgup, Nevsehir", descriptionAr: "منتجع كهوف فاخر في حي Kayakapi التاريخي في Urgup مع سبا وحمامات تركية.", descriptionEn: "Luxury cave resort in historic Kayakapi district of Urgup with spa and Turkish baths.", highlightsAr: ["حي Kayakapi التاريخي", "كهوف فاخرة", "حمام تركي"], highlightsEn: ["Historic Kayakapi", "Luxury caves", "Turkish bath"], images: C, amenities: ["Spa", "Turkish Bath", "Fine Dining", "Cave Rooms", "WiFi", "Concierge"], rooms: [rm("kay-1", "غرفة كهف ديلوكس", "Deluxe Cave Room", "غرفة كهف أصلية م restored.", "Restored authentic cave room.", "1 King", 2, 38, 290, ["Cave", "Historic"], true), rm("kay-2", "جناح Kayakapi", "Kayakapi Suite", "جناح كهفي بصالة.", "Cave suite with lounge.", "1 King + Sofa", 3, 70, 450, ["Cave", "Lounge"], true)], lat: 38.6431, lng: 34.8289, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Kayakapi Premium Caves.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Kayakapi Premium Caves.", phone: "+90 384 341 1111", website: "https://www.kayakapipremiumcaves.com", isFeatured: false }),
  mk({ id: "17", slug: "zorlu-grand-hotel-trabzon", nameAr: "Zorlu Grand Hotel Trabzon", nameEn: "Zorlu Grand Hotel Trabzon", city: "Trabzon", neighborhoodAr: "Ortahisar", neighborhoodEn: "Ortahisar", stars: 5, rating: 4.5, reviewCount: 3420, addressAr: "Maras Cd., Ortahisar, Trabzon", addressEn: "Maras Cd., Ortahisar, Trabzon", descriptionAr: "فندق فاخر في قلب Trabzon قرب البحر الأسود مع مطاعم وسبa وقاعات مؤتمرات.", descriptionEn: "Luxury hotel in central Trabzon near the Black Sea with restaurants, spa, and conference halls.", highlightsAr: ["وسط Trabzon", "قرب البحر الأسود", "سبa"], highlightsEn: ["Central Trabzon", "Near Black Sea", "Spa"], images: H, amenities: ["Spa", "Restaurant", "Fitness", "WiFi", "Parking", "Conference"], rooms: [rm("zgt-1", "غرفة ديلوكس", "Deluxe Room", "غرفة مريحة في وسط المدينة.", "Comfortable city-center room.", "1 King", 2, 32, 120, ["City View"], false), rm("zgt-2", "جناح تنفيذي", "Executive Suite", "جناح واسع بصالة.", "Spacious suite with lounge.", "1 King + Sofa", 3, 55, 210, ["Suite", "Lounge"], true)], lat: 41.0027, lng: 39.7168, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Zorlu Grand Trabzon.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Zorlu Grand Hotel Trabzon.", phone: "+90 462 326 8400", website: "https://www.zorlugrand.com", isFeatured: false }),
  mk({ id: "18", slug: "novotel-trabzon", nameAr: "Novotel Trabzon", nameEn: "Novotel Trabzon", city: "Trabzon", neighborhoodAr: "Yomra", neighborhoodEn: "Yomra", stars: 4, rating: 4.4, reviewCount: 2890, addressAr: "Yomra, Trabzon", addressEn: "Yomra, Trabzon", descriptionAr: "فندق عصري على ساحل Yomra بإطلالة على البحر الأسود ومسابح داخلية وخارجية.", descriptionEn: "Modern Yomra coast hotel with Black Sea views and indoor/outdoor pools.", highlightsAr: ["إطلالة البحر الأسود", "مسابح", "موقع Yomra"], highlightsEn: ["Black Sea views", "Pools", "Yomra location"], images: H, amenities: ["Pool", "Restaurant", "Fitness", "Sea View", "WiFi", "Parking"], rooms: [rm("nov-1", "غرفة ممتازة", "Superior Room", "غرفة بإطلالة على البحر.", "Sea-view superior room.", "1 King or Twin", 2, 28, 95, ["Sea View"], true), rm("nov-2", "غرفة عائلية", "Family Room", "غرفة للعائلات.", "Family-friendly room.", "1 King + 1 Twin", 3, 35, 130, ["Family Layout"], true)], lat: 40.9656, lng: 39.7891, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Novotel Trabzon.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Novotel Trabzon.", phone: "+90 462 455 0000", website: "https://www.novotel.com/trabzon", isFeatured: false }),
  mk({ id: "19", slug: "radisson-blu-trabzon", nameAr: "Radisson Blu Hotel Trabzon", nameEn: "Radisson Blu Hotel Trabzon", city: "Trabzon", neighborhoodAr: "Ortahisar", neighborhoodEn: "Ortahisar", stars: 5, rating: 4.5, reviewCount: 3120, addressAr: "Devlet Karayolu Uzeri, Trabzon", addressEn: "Devlet Karayolu Uzeri, Trabzon", descriptionAr: "فندق Radisson Blu على طريق الساحل بإطلالة على البحر الأسود وسبa.", descriptionEn: "Radisson Blu on the coastal road with Black Sea views and spa.", highlightsAr: ["Radisson Blu", "إطلالة بحرية", "سبa"], highlightsEn: ["Radisson Blu", "Sea views", "Spa"], images: H, amenities: ["Spa", "Restaurant", "Fitness", "Sea View", "WiFi", "Parking"], rooms: [rm("rbt-1", "غرفة ديلوكس", "Deluxe Room", "غرفة بإطلالة على البحر.", "Sea-view deluxe room.", "1 King", 2, 30, 110, ["Sea View"], true), rm("rbt-2", "جناح", "Suite", "جناح بصالة.", "Suite with lounge.", "1 King + Sofa", 3, 50, 180, ["Sea View", "Lounge"], true)], lat: 41.0189, lng: 39.7456, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Radisson Blu Trabzon.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Radisson Blu Hotel Trabzon.", phone: "+90 462 455 5555", website: "https://www.radissonhotels.com/trabzon", isFeatured: false }),
  mk({ id: "20", slug: "swissotel-uludag-bursa", nameAr: "Swissotel Uludag Bursa", nameEn: "Swissotel Uludag Bursa", city: "Bursa", neighborhoodAr: "Uludag", neighborhoodEn: "Uludag", stars: 5, rating: 4.6, reviewCount: 4560, addressAr: "Uludag National Park, Bursa", addressEn: "Uludag National Park, Bursa", descriptionAr: "منتجع جبلي فاخر على Uludag مع إطلالات على Bursa ومرافق تزلج شتوية.", descriptionEn: "Luxury mountain resort on Uludag with Bursa views and winter ski facilities.", highlightsAr: ["Uludag", "منتجع جبلي", "تزلج شتوي"], highlightsEn: ["Uludag", "Mountain resort", "Winter skiing"], images: N, amenities: ["Spa", "Ski Access", "Restaurant", "Mountain View", "WiFi", "Fitness"], rooms: [rm("swu-1", "غرفة جبلية", "Mountain Room", "غرفة بإطلالة جبلية.", "Mountain-view room.", "1 King", 2, 35, 180, ["Mountain View"], true), rm("swu-2", "جناح Uludag", "Uludag Suite", "جناح فاخر بإطلالة بانورامية.", "Luxury suite with panoramic views.", "1 King + Sofa", 3, 65, 320, ["Panoramic View"], true)], lat: 40.109, lng: 29.221, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Swissotel Uludag Bursa.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Swissotel Uludag Bursa.", phone: "+90 224 285 2300", website: "https://www.swissotel.com/uludag", isFeatured: true }),
  mk({ id: "21", slug: "kervansaray-thermal-bursa", nameAr: "Kervansaray Termal Hotel Bursa", nameEn: "Kervansaray Thermal Hotel Bursa", city: "Bursa", neighborhoodAr: "Cekirge", neighborhoodEn: "Cekirge", stars: 5, rating: 4.4, reviewCount: 5230, addressAr: "Cekirge, Osmangazi, Bursa", addressEn: "Cekirge, Osmangazi, Bursa", descriptionAr: "فندق termal تاريخي في Cekirge مع ينابيع حارة علاجية وحمامات تركية.", descriptionEn: "Historic thermal hotel in Cekirge with healing hot springs and Turkish baths.", highlightsAr: ["ينابيع حارة", "Cekirge", "حمام تركي"], highlightsEn: ["Hot springs", "Cekirge", "Turkish bath"], images: H, amenities: ["Thermal Spa", "Turkish Bath", "Indoor Pool", "Restaurant", "WiFi", "Parking"], rooms: [rm("ker-1", "غرفة termal", "Thermal Room", "غرفة مع وصول للسبa termal.", "Room with thermal spa access.", "1 King", 2, 30, 95, ["Thermal Access"], true), rm("ker-2", "جناح عائلي", "Family Suite", "جناح للعائلات.", "Family suite.", "1 King + 2 Twin", 4, 55, 160, ["Family Layout"], true)], lat: 40.1885, lng: 29.061, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Kervansaray Termal Bursa.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Kervansaray Thermal Hotel Bursa.", phone: "+90 224 261 1111", website: "https://www.kervansarayhotels.com", isFeatured: false }),
  mk({ id: "22", slug: "hilton-bursa-convention-center", nameAr: "Hilton Bursa Convention Center", nameEn: "Hilton Bursa Convention Center & Spa", city: "Bursa", neighborhoodAr: "Osmangazi", neighborhoodEn: "Osmangazi", stars: 5, rating: 4.5, reviewCount: 3890, addressAr: "Osmangazi, Bursa", addressEn: "Osmangazi, Bursa", descriptionAr: "فندق Hilton في Bursa مع مركز مؤتمرات وسبa وقرب من المعالم التاريخية.", descriptionEn: "Hilton Bursa with convention center, spa, and proximity to historic landmarks.", highlightsAr: ["Hilton", "مركز مؤتمرات", "قرب المعالم"], highlightsEn: ["Hilton", "Convention center", "Near landmarks"], images: H, amenities: ["Spa", "Convention Center", "Restaurant", "Fitness", "WiFi", "Parking"], rooms: [rm("hil-1", "غرفة ديلوكس", "Deluxe Room", "غرفة Hilton مريحة.", "Comfortable Hilton room.", "1 King", 2, 32, 110, ["City View"], false), rm("hil-2", "جناح تنفيذي", "Executive Suite", "جناح مع وصول للنادي.", "Suite with club access.", "1 King + Sofa", 3, 55, 200, ["Club Access"], true)], lat: 40.1956, lng: 29.0789, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Hilton Bursa.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Hilton Bursa Convention Center.", phone: "+90 224 316 6666", website: "https://www.hilton.com/bursa", isFeatured: false }),
  mk({ id: "23", slug: "ng-sapanca-wellness-convention", nameAr: "NG Sapanca Wellness & Convention", nameEn: "NG Sapanca Wellness & Convention", city: "Sapanca", neighborhoodAr: "Sapanca", neighborhoodEn: "Sapanca", stars: 5, rating: 4.6, reviewCount: 4120, addressAr: "Sapanca, Sakarya", addressEn: "Sapanca, Sakarya", descriptionAr: "منتجع wellness على بحيرة Sapanca مع سبa وحدائق وإطلالات على البحيرة.", descriptionEn: "Wellness resort on Sapanca Lake with spa, gardens, and lake views.", highlightsAr: ["بحيرة Sapanca", "Wellness", "طبيعة"], highlightsEn: ["Sapanca Lake", "Wellness", "Nature"], images: B, amenities: ["Spa", "Lake View", "Restaurant", "Fitness", "WiFi", "Parking"], rooms: [rm("ngs-1", "غرفة بحيرة", "Lake View Room", "غرفة بإطلالة على البحيرة.", "Lake-view room.", "1 King", 2, 35, 160, ["Lake View"], true), rm("ngs-2", "جناح Wellness", "Wellness Suite", "جناح مع تراس.", "Suite with terrace.", "1 King + Sofa", 3, 60, 280, ["Terrace", "Lake View"], true)], lat: 40.6914, lng: 30.2678, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز NG Sapanca.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book NG Sapanca Wellness & Convention.", phone: "+90 264 582 9292", website: "https://www.ngsapanca.com", isFeatured: true }),
  mk({ id: "24", slug: "limak-thermal-sapanca", nameAr: "Limak Thermal Luxury Hotel Sapanca", nameEn: "Limak Thermal Luxury Hotel Sapanca", city: "Sapanca", neighborhoodAr: "Sapanca", neighborhoodEn: "Sapanca", stars: 5, rating: 4.5, reviewCount: 3560, addressAr: "Sapanca, Sakarya", addressEn: "Sapanca, Sakarya", descriptionAr: "فندق termal فاخر في Sapanca مع ينابيع حارة وإطلالة على البحيرة.", descriptionEn: "Luxury thermal hotel in Sapanca with hot springs and lake views.", highlightsAr: ["Termal", "بحيرة Sapanca", "سبa"], highlightsEn: ["Thermal", "Sapanca Lake", "Spa"], images: B, amenities: ["Thermal Spa", "Indoor Pool", "Lake View", "Restaurant", "WiFi", "Parking"], rooms: [rm("lim-1", "غرفة termal", "Thermal Room", "غرفة مع سبa termal.", "Room with thermal spa.", "1 King", 2, 32, 140, ["Thermal Access"], true), rm("lim-2", "جناح بحيرة", "Lake Suite", "جناح بإطلالة على البحيرة.", "Lake-view suite.", "1 King + Sofa", 3, 55, 240, ["Lake View"], true)], lat: 40.6856, lng: 30.2543, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Limak Thermal Sapanca.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Limak Thermal Luxury Hotel Sapanca.", phone: "+90 264 582 8282", website: "https://www.limakhotels.com/sapanca", isFeatured: false }),
  mk({ id: "25", slug: "sapanca-bungalov-evleri", nameAr: "Sapanca Bungalov Evleri", nameEn: "Sapanca Bungalov Evleri", city: "Sapanca", neighborhoodAr: "Kirkpinar", neighborhoodEn: "Kirkpinar", stars: 4, rating: 4.7, reviewCount: 2340, addressAr: "Kirkpinar, Sapanca, Sakarya", addressEn: "Kirkpinar, Sapanca, Sakarya", descriptionAr: "منتجع bungalov و glamping على ضفاف بحيرة Sapanca مع شرفات خاصة وطبيعة هادئة.", descriptionEn: "Bungalow and glamping resort on Sapanca Lake shores with private decks and peaceful nature.", highlightsAr: ["Bungalov", "Glamping", "بحيرة Sapanca"], highlightsEn: ["Bungalows", "Glamping", "Sapanca Lake"], images: B, amenities: ["Lake View", "Private Deck", "BBQ Area", "Nature Trails", "WiFi", "Parking"], rooms: [rm("sbe-1", "Bungalov قياسي", "Standard Bungalow", "Bungalov خشبي بإطلالة على البحيرة.", "Wooden lake-view bungalow.", "1 Queen", 2, 35, 120, ["Lake View", "Deck"], false, true), rm("sbe-2", "Glamping Tent", "Glamping Tent", "خيمة glamping فاخرة في الطبيعة.", "Luxury glamping tent in nature.", "1 King", 2, 30, 150, ["Nature View", "Private Bath"], true)], lat: 40.6789, lng: 30.2412, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Sapanca Bungalov Evleri.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Sapanca Bungalov Evleri.", phone: "+90 264 582 3333", website: "https://www.sapancabungalov.com", isFeatured: true }),
  mk({ id: "26", slug: "babillon-hotel-rize", nameAr: "Babilon Hotel Rize", nameEn: "Babilon Hotel Rize", city: "Rize", neighborhoodAr: "Merkez", neighborhoodEn: "City Center", stars: 4, rating: 4.3, reviewCount: 1890, addressAr: "Merkez, Rize", addressEn: "Merkez, Rize", descriptionAr: "فندق في وسط Rize قرب البحر الأسود ونقطة انطلاق لAyder وplateau.", descriptionEn: "Central Rize hotel near the Black Sea and gateway to Ayder plateau.", highlightsAr: ["وسط Rize", "قرب Ayder", "إطلالة بحرية"], highlightsEn: ["Central Rize", "Near Ayder", "Sea views"], images: N, amenities: ["Restaurant", "Sea View", "WiFi", "Parking", "Fitness"], rooms: [rm("bhr-1", "غرفة قياسية", "Standard Room", "غرفة مريحة في Rize.", "Comfortable Rize room.", "1 King or Twin", 2, 25, 75, ["City View"], false), rm("bhr-2", "غرفة بحرية", "Sea View Room", "إطلالة على البحر الأسود.", "Black Sea view room.", "1 King", 2, 28, 95, ["Sea View"], true)], lat: 41.0201, lng: 40.5234, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Babilon Hotel Rize.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Babilon Hotel Rize.", phone: "+90 464 213 3333", website: "https://www.babilonhotel.com", isFeatured: false }),
  mk({ id: "27", slug: "rize-resort-hotel", nameAr: "Rize Resort Hotel", nameEn: "Rize Resort Hotel", city: "Rize", neighborhoodAr: "Pazar", neighborhoodEn: "Pazar", stars: 4, rating: 4.4, reviewCount: 1560, addressAr: "Pazar, Rize", addressEn: "Pazar, Rize", descriptionAr: "منتجع على ساحل Rize بإطلالة على البحر الأسود والجبال الخضراء.", descriptionEn: "Rize coast resort with Black Sea and green mountain views.", highlightsAr: ["ساحل Rize", "جبال خضراء", "طبيعة"], highlightsEn: ["Rize coast", "Green mountains", "Nature"], images: N, amenities: ["Sea View", "Restaurant", "Garden", "WiFi", "Parking"], rooms: [rm("rrh-1", "غرفة بحرية", "Sea View Room", "غرفة بإطلالة على البحر.", "Sea-view room.", "1 King", 2, 28, 85, ["Sea View"], true), rm("rrh-2", "جناح جبلي", "Mountain Suite", "جناح بإطلالة جبلية.", "Mountain-view suite.", "1 King + Sofa", 3, 45, 130, ["Mountain View"], true)], lat: 41.1789, lng: 40.8834, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Rize Resort Hotel.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Rize Resort Hotel.", phone: "+90 464 532 2222", website: "https://www.rizeresort.com", isFeatured: false }),
  mk({ id: "28", slug: "ridos-thermal-hotel-ayder", nameAr: "Ridos Thermal Hotel Ayder", nameEn: "Ridos Thermal Hotel & Spa Ayder", city: "Ayder", neighborhoodAr: "Ayder Yaylasi", neighborhoodEn: "Ayder Plateau", stars: 4, rating: 4.5, reviewCount: 2780, addressAr: "Ayder Yaylasi, Camlihemsin, Rize", addressEn: "Ayder Yaylasi, Camlihemsin, Rize", descriptionAr: "فندق termal على هضبة Ayder مع ينابيع حارة وإطلالات على الغابات والجبال.", descriptionEn: "Thermal hotel on Ayder plateau with hot springs and forest-mountain views.", highlightsAr: ["Ayder Yaylasi", "Termal", "طبيعة جبلية"], highlightsEn: ["Ayder Plateau", "Thermal", "Mountain nature"], images: N, amenities: ["Thermal Spa", "Mountain View", "Restaurant", "WiFi", "Parking"], rooms: [rm("rid-1", "غرفة termal", "Thermal Room", "غرفة مع سبa termal.", "Room with thermal spa.", "1 King", 2, 28, 110, ["Thermal Access"], true), rm("rid-2", "غرفة جبلية", "Mountain Room", "إطلالة على الغابات.", "Forest and mountain views.", "1 King or Twin", 2, 30, 95, ["Mountain View"], true)], lat: 40.9533, lng: 41.0983, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Ridos Thermal Ayder.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Ridos Thermal Hotel Ayder.", phone: "+90 464 657 3333", website: "https://www.ridostermal.com", isFeatured: true }),
  mk({ id: "29", slug: "babillon-hotel-ayder", nameAr: "Babilon Hotel Ayder", nameEn: "Babilon Hotel Ayder", city: "Ayder", neighborhoodAr: "Ayder Yaylasi", neighborhoodEn: "Ayder Plateau", stars: 4, rating: 4.4, reviewCount: 2120, addressAr: "Ayder Yaylasi, Camlihemsin, Rize", addressEn: "Ayder Yaylasi, Camlihemsin, Rize", descriptionAr: "فندق على هضبة Ayder الشهيرة مع إطلالات على الشلالات والغابات.", descriptionEn: "Hotel on famous Ayder plateau with waterfall and forest views.", highlightsAr: ["Ayder", "شلالات", "هضبة"], highlightsEn: ["Ayder", "Waterfalls", "Plateau"], images: N, amenities: ["Mountain View", "Restaurant", "WiFi", "Parking", "Fireplace Lounge"], rooms: [rm("bha-1", "غرفة plateau", "Plateau Room", "غرفة بإطلالة على الهضبة.", "Plateau-view room.", "1 King or Twin", 2, 26, 90, ["Plateau View"], true), rm("bha-2", "غرفة عائلية", "Family Room", "غرفة للعائلات.", "Family room.", "1 King + 2 Twin", 4, 38, 130, ["Family Layout"], true)], lat: 40.9512, lng: 41.0956, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Babilon Hotel Ayder.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Babilon Hotel Ayder.", phone: "+90 464 657 4444", website: "https://www.babilonhotel.com/ayder", isFeatured: false }),
  mk({ id: "30", slug: "ayder-resort-hotel", nameAr: "Ayder Resort Hotel", nameEn: "Ayder Resort Hotel", city: "Ayder", neighborhoodAr: "Ayder Yaylasi", neighborhoodEn: "Ayder Plateau", stars: 4, rating: 4.3, reviewCount: 1670, addressAr: "Ayder Yaylasi, Camlihemsin, Rize", addressEn: "Ayder Yaylasi, Camlihemsin, Rize", descriptionAr: "منتجع على هضبة Ayder مع مطعم محلي وإطلالات على وادي الشاي.", descriptionEn: "Ayder plateau resort with local dining and tea valley views.", highlightsAr: ["Ayder Yaylasi", "مطبخ محلي", "وادي الشاي"], highlightsEn: ["Ayder Plateau", "Local cuisine", "Tea valley"], images: N, amenities: ["Mountain View", "Restaurant", "Garden", "WiFi", "Parking"], rooms: [rm("ayr-1", "غرفة valley", "Valley View Room", "إطلالة على وادي الشاي.", "Tea valley views.", "1 King", 2, 25, 80, ["Valley View"], true), rm("ayr-2", "Bungalov جبلي", "Mountain Bungalow", "Bungalov في الطبيعة.", "Nature bungalow.", "1 Queen", 2, 30, 100, ["Nature View"], true)], lat: 40.9498, lng: 41.1012, whatsappMessageAr: "مرحباً الريان للسياحة، أرغب بحجز Ayder Resort Hotel.", whatsappMessageEn: "Hello Alrayyan Tourism, I would like to book Ayder Resort Hotel.", phone: "+90 464 657 5555", website: "https://www.ayderresort.com", isFeatured: false }),
];

const helpers = `
function save(hotels: Hotel[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
}

function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeRoom(room: Record<string, unknown>, index: number) {
  return {
    id: String(room.id || \`r\${Date.now()}-\${index}\`),
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

function migrateIfNeeded(hotels: Hotel[]): Hotel[] {
  return hotels.map((raw) => {
    const h = raw as Hotel & Record<string, unknown>;
    const rooms = Array.isArray(h.rooms)
      ? h.rooms.map((r, i) =>
          normalizeRoom(r as unknown as Record<string, unknown>, i)
        )
      : [];

    return {
      id: String(h.id),
      slug: String(h.slug || ""),
      nameAr: String(h.nameAr || ""),
      nameEn: String(h.nameEn || ""),
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
      rooms,
      lat: Number(h.lat) || 41.0082,
      lng: Number(h.lng) || 28.9784,
      checkIn: String(h.checkIn || "15:00"),
      checkOut: String(h.checkOut || "12:00"),
      policiesAr: parseListField(h.policiesAr),
      policiesEn: parseListField(h.policiesEn),
      whatsappNumber: String(h.whatsappNumber || DEFAULT_WA),
      whatsappMessageAr:
        String(h.whatsappMessageAr || "") ||
        \`مرحباً، أرغب بالحجز في \${h.nameAr || "هذا الفندق"}\`,
      whatsappMessageEn:
        String(h.whatsappMessageEn || "") ||
        \`Hello, I would like to book at \${h.nameEn || "this hotel"}\`,
      phone: h.phone ? String(h.phone) : undefined,
      website: h.website ? String(h.website) : undefined,
      isFeatured: Boolean(h.isFeatured),
      isActive: h.isActive !== false,
    } satisfies Hotel;
  });
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

  // First load: clear legacy keys and seed v3
  localStorage.removeItem(OLD_STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
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
  save(getHotels().filter((h) => h.id !== id));
  return true;
}

export function resetHotels() {
  localStorage.removeItem(OLD_STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  save(defaultHotels);
}
`;

const header = `import type { Hotel, HotelInput } from "@/types/hotel";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";

const STORAGE_KEY = "alrayyan_hotels_v3";
const OLD_STORAGE_KEY = "oktravel_hotels";
const LEGACY_STORAGE_KEY = "oktravel_hotels_v2";
const DEFAULT_WA = DEFAULT_SITE_WHATSAPP;

export const defaultHotels: Hotel[] = `;

const hotelsJson =
  "[\n" +
  defaultHotels.map((h) => "  " + JSON.stringify(h)).join(",\n") +
  "\n]";
fs.writeFileSync(outPath, header + hotelsJson + ";" + helpers);
console.log("Wrote", defaultHotels.length, "hotels to", outPath);
