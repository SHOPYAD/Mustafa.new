import type { PlannerIdea, PlannerIntake, PlannerStop, PlannerStopKind, PlannerTrip } from "@/types/planner";
import { buildLegs, destKey, uid } from "./geo";

type Seed = Omit<PlannerStop, "id" | "day" | "order" | "addedToDay"> & {
  styles?: PlannerIntake["prefs"]["style"][];
  family?: boolean;
};

const PHOTO = {
  hagia: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
  blue: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800",
  cistern: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
  topkapi: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800",
  bazaar: "https://images.unsplash.com/photo-1605555571960-04d116bb6456?w=800",
  bosphorus: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  park: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
  food: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  museum: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800",
  cappadociaValley: "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=800",
  cappadociaBalloons: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800",
  sumela: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800",
  uzungol: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
  sera: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
  ataturk: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800",
  boztepe: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
  zilkale: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
  ayder: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  palovit: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800",
  altindere: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
  calcave: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
  hidirnebi: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
  trabzonCastle: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800",
};

const ISTANBUL: Seed[] = [
  { kind: "attraction", titleAr: "ميدان السلطان أحمد", titleEn: "Sultanahmet Square", lat: 41.0058, lng: 28.9768, image: PHOTO.blue, visitMinutes: 40, hours: "24/7", free: true, rating: 4.8, reviews: 21000, styles: ["cultural", "historical", "classic"] },
  { kind: "attraction", titleAr: "المسجد الأزرق", titleEn: "Blue Mosque", lat: 41.0053, lng: 28.9768, image: PHOTO.blue, visitMinutes: 75, hours: "08:30–19:00", free: true, rating: 4.8, reviews: 98000, styles: ["cultural", "historical"] },
  { kind: "attraction", titleAr: "آيا صوفيا", titleEn: "Hagia Sophia", lat: 41.0086, lng: 28.9802, image: PHOTO.hagia, visitMinutes: 120, hours: "09:00–19:00", priceUsd: 32, rating: 4.8, reviews: 142000, styles: ["cultural", "historical", "classic"] },
  { kind: "attraction", titleAr: "صهريج البازيليك", titleEn: "Basilica Cistern", lat: 41.0084, lng: 28.9779, image: PHOTO.cistern, visitMinutes: 60, hours: "09:00–19:00", priceUsd: 25, rating: 4.7, reviews: 54000, styles: ["cultural", "historical", "cityscape"] },
  { kind: "attraction", titleAr: "قصر توبكابي", titleEn: "Topkapi Palace", lat: 41.0115, lng: 28.9834, image: PHOTO.topkapi, visitMinutes: 150, hours: "09:00–18:00", priceUsd: 40, rating: 4.7, reviews: 67000, styles: ["historical", "classic"] },
  { kind: "attraction", titleAr: "حديقة جولهانة", titleEn: "Gulhane Park", lat: 41.0133, lng: 28.9816, image: PHOTO.park, visitMinutes: 60, hours: "08:00–21:00", free: true, rating: 4.6, reviews: 18000, styles: ["nature"], family: true },
  { kind: "attraction", titleAr: "المتحف الأثري", titleEn: "Istanbul Archaeological Museums", lat: 41.0116, lng: 28.9813, image: PHOTO.museum, visitMinutes: 90, hours: "09:00–18:00", priceUsd: 18, rating: 4.6, reviews: 12000, styles: ["cultural", "historical"] },
  { kind: "shopping", titleAr: "البازار الكبير", titleEn: "Grand Bazaar", lat: 41.0106, lng: 28.9681, image: PHOTO.bazaar, visitMinutes: 90, hours: "08:30–19:00", free: true, rating: 4.4, reviews: 88000, styles: ["classic", "cityscape"] },
  { kind: "attraction", titleAr: "جامع السليمانية", titleEn: "Suleymaniye Mosque", lat: 41.0161, lng: 28.9642, image: PHOTO.hagia, visitMinutes: 50, hours: "08:30–19:00", free: true, rating: 4.8, reviews: 22000, styles: ["cultural", "historical"] },
  { kind: "attraction", titleAr: "قصر دولما بهتشه", titleEn: "Dolmabahce Palace", lat: 41.0391, lng: 28.9983, image: PHOTO.topkapi, visitMinutes: 120, hours: "09:00–16:00", priceUsd: 35, rating: 4.7, reviews: 31000, styles: ["classic", "historical"] },
  { kind: "attraction", titleAr: "تلة بيير لوتي", titleEn: "Pierre Loti Hill", lat: 41.0538, lng: 28.9334, image: PHOTO.bosphorus, visitMinutes: 75, hours: "24/7", free: true, rating: 4.5, reviews: 9000, styles: ["cityscape", "nature"] },
  { kind: "attraction", titleAr: "جامع أيوب سلطان", titleEn: "Eyup Sultan Mosque", lat: 41.0479, lng: 28.9339, image: PHOTO.blue, visitMinutes: 60, hours: "24/7", free: true, rating: 4.8, reviews: 15000, styles: ["cultural", "historical"] },
  { kind: "attraction", titleAr: "متحف رحمي كوتش", titleEn: "Rahmi Koc Museum", lat: 41.042, lng: 28.9492, image: PHOTO.museum, visitMinutes: 120, hours: "10:00–19:00", priceUsd: 16, rating: 4.6, reviews: 8000, styles: ["classic"], family: true },
  { kind: "attraction", titleAr: "فيالاند", titleEn: "VIALAND Theme Park", lat: 41.0765, lng: 28.923, image: PHOTO.park, visitMinutes: 240, hours: "12:00–20:00", priceUsd: 28, rating: 4.3, reviews: 11000, styles: ["cityscape"], family: true },
  { kind: "food", titleAr: "مطعم على البوسفور", titleEn: "Bosphorus terrace dinner", lat: 41.0412, lng: 29.006, image: PHOTO.food, visitMinutes: 90, hours: "12:00–23:00", priceUsd: 45, rating: 4.5, reviews: 4200, styles: ["classic", "cityscape"] },
  { kind: "hotel", titleAr: "إقامة السلطان أحمد", titleEn: "Sultanahmet stay", lat: 41.0068, lng: 28.9755, image: PHOTO.hotel, visitMinutes: 0, hours: "14:00 check-in", rating: 8.5, reviews: 1840, href: "/hotels" },
];

const ANTALYA: Seed[] = [
  { kind: "attraction", titleAr: "كاليتشي المدينة القديمة", titleEn: "Kaleici Old Town", lat: 36.8841, lng: 30.7056, image: PHOTO.bazaar, visitMinutes: 120, free: true, rating: 4.7, hours: "24/7", styles: ["cultural", "classic"] },
  { kind: "attraction", titleAr: "شلالات دودان", titleEn: "Duden Falls", lat: 36.931, lng: 30.726, image: PHOTO.palovit, visitMinutes: 90, free: true, rating: 4.6, hours: "08:00–19:00", styles: ["nature"] },
  { kind: "attraction", titleAr: "ميناء أنطاليا", titleEn: "Antalya Harbor", lat: 36.8854, lng: 30.7018, image: PHOTO.bosphorus, visitMinutes: 60, free: true, rating: 4.7, hours: "24/7", styles: ["cityscape", "classic"] },
  { kind: "hotel", titleAr: "إقامة على البحر", titleEn: "Seaside hotel", lat: 36.855, lng: 30.76, image: PHOTO.hotel, rating: 8.4, reviews: 920, href: "/hotels" },
];

const TRABZON: Seed[] = [
  { kind: "attraction", titleAr: "دير سوميلا", titleEn: "Sumela Monastery", detailAr: "دير تاريخي منحوت في جرف صخري شاهق بارتفاع 1200 متر في جبال ألتنديري، تأسس في القرن الرابع الميلادي ويعد تحفة معمارية أسطورية تحيط بها الغابات والشلالات.", detailEn: "Historic Orthodox monastery nestled into a steep cliff face at 1,200m in Altındere National Park, founded in the 4th century.", lat: 40.6903, lng: 39.6578, image: PHOTO.sumela, visitMinutes: 150, priceUsd: 12, rating: 4.8, hours: "09:00–18:00", styles: ["nature", "historical"] },
  { kind: "attraction", titleAr: "بحيرة أوزنجول", titleEn: "Uzungol", detailAr: "بحيرة جبلية ساحرة تحيط بها غابات الصنوبر الخضراء ومنازل القرى الريفية الخشبية ومئذنة المسجد الشهير على ضفاف البحيرة، وتعد أيقونة السياحة الطبيعية في الشمال التركي.", detailEn: "Picturesque alpine lake surrounded by lush green pine mountains and traditional wooden villages.", lat: 40.6186, lng: 40.295, image: PHOTO.uzungol, visitMinutes: 180, free: true, rating: 4.6, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "بحيرة سيرا", titleEn: "Sera Lake", detailAr: "بحيرة طبيعية هادئة تشكلت إثر انهيار أرضي طبيعي عام 1950، توفر قوارب تجديف ومطاعم مطلة على المياه النقية وسط التلال الخضراء.", detailEn: "Scenic natural lake formed by a landslide in 1950, offering pedal boating and lakeside restaurants.", lat: 40.999, lng: 39.62, image: PHOTO.sera, visitMinutes: 75, free: true, rating: 4.5, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "مغارة تشال", titleEn: "Çal Cave", detailAr: "ثاني أطول مغارة في العالم تحتوي على شلال داخلي وممرات خشبية تمتد بين الصواعد والهوابط الكلسية المضيئة في أجواء طبيعية مذهلة.", detailEn: "One of the longest caves in the world, featuring an underground stream, waterfalls, and illuminated walkways.", lat: 40.87, lng: 39.42, image: PHOTO.calcave, visitMinutes: 90, priceUsd: 8, rating: 4.7, hours: "09:00–18:00", styles: ["nature"] },
  { kind: "attraction", titleAr: "قصر أتاتورك", titleEn: "Ataturk Mansion Trabzon", detailAr: "قصر تاريخي بني عام 1890 بطراز أوروبي كلاسيكي فريد تحيط به حدائق صنوبر غناء على تلة سوغوك سو، ويضم مقتنيات وتذكارات تاريخية نادرة.", detailEn: "Historic 1890 mansion featuring classical European architecture and pine gardens on Soğuksu hill.", lat: 40.9935, lng: 39.696, image: PHOTO.ataturk, visitMinutes: 60, rating: 4.5, hours: "09:00–17:00", styles: ["historical", "cultural"] },
  { kind: "attraction", titleAr: "آيا صوفيا طرابزون", titleEn: "Hagia Sophia Trabzon", detailAr: "كنيسة بيزنطية تاريخية تحولت إلى مسجد، تشتهر بلوحات جدارية فريدة تعود للقرن الثالث عشر وهندسة معمارية تمزج الفن البيزنطي والسلجوقي.", detailEn: "Historic 13th-century Byzantine monument famous for extraordinary frescoes and garden views over the Black Sea.", lat: 41.0032, lng: 39.699, image: PHOTO.hagia, visitMinutes: 70, rating: 4.6, hours: "09:00–17:00", styles: ["historical", "cultural"] },
  { kind: "attraction", titleAr: "قلعة طرابزون", titleEn: "Trabzon Castle", detailAr: "حصن دفاعي تاريخي عريق يمتد من تلال المدينة نزولاً إلى ساحل البحر الأسود، بني في العصر الروماني والبيزنطي ويطل على جسر زاغنوس التاريخي.", detailEn: "Ancient fortifications stretching from the city hills to the Black Sea, dating from Roman and Byzantine eras.", lat: 41.005, lng: 39.72, image: PHOTO.trabzonCastle, visitMinutes: 60, free: true, rating: 4.4, hours: "24/7", styles: ["historical"] },
  { kind: "attraction", titleAr: "تلة بوزتيبه", titleEn: "Boztepe Hill", detailAr: "أعلى إطلالة بانورامية ساحرة تكشف كامل مدينة طرابزون وساحل البحر الأسود، مع مقاهي تقليدية لتناول الشاي التركي وإطلالة غروب خلابة.", detailEn: "Scenic hilltop viewpoint overlooking Trabzon city and the Black Sea, famous for sunset views and traditional samovar tea.", lat: 41.003, lng: 39.73, image: PHOTO.boztepe, visitMinutes: 80, free: true, rating: 4.5, hours: "24/7", styles: ["nature", "cityscape"] },
  { kind: "attraction", titleAr: "قلعة زيل", titleEn: "Zilkale", lat: 40.838, lng: 40.64, image: PHOTO.zilkale, visitMinutes: 90, rating: 4.6, hours: "08:00–18:00", styles: ["historical", "nature"] },
  { kind: "attraction", titleAr: "هضبة آيدر", titleEn: "Ayder Plateau", lat: 40.95, lng: 41.1, image: PHOTO.ayder, visitMinutes: 180, free: true, rating: 4.6, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "شلال بالوفيت", titleEn: "Palovit Waterfall", lat: 40.92, lng: 41.05, image: PHOTO.palovit, visitMinutes: 70, free: true, rating: 4.5, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "وادي كاتشكار", titleEn: "Kackar Mountains", lat: 40.833, lng: 41.16, image: PHOTO.ayder, visitMinutes: 180, free: true, rating: 4.7, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "دير فازيلون", titleEn: "Vazelon Monastery", lat: 40.75, lng: 39.62, image: PHOTO.sumela, visitMinutes: 80, rating: 4.4, hours: "09:00–17:00", styles: ["historical"] },
  { kind: "attraction", titleAr: "منتزه التين ديري", titleEn: "Altindere National Park", lat: 40.71, lng: 39.65, image: PHOTO.altindere, visitMinutes: 120, rating: 4.7, hours: "08:00–18:00", styles: ["nature"] },
  { kind: "attraction", titleAr: "وادي فيرتينا", titleEn: "Firtina Valley", lat: 40.91, lng: 40.94, image: PHOTO.altindere, visitMinutes: 120, free: true, rating: 4.7, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "هضبة السلطان مراد", titleEn: "Sultan Murat Plateau", lat: 40.79, lng: 40.22, image: PHOTO.ayder, visitMinutes: 120, free: true, rating: 4.5, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "هضبة هيدرنبي", titleEn: "Hidirnebi Plateau", lat: 40.96, lng: 39.43, image: PHOTO.hidirnebi, visitMinutes: 90, free: true, rating: 4.5, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "كهف كاراجا", titleEn: "Karaca Cave", lat: 40.57, lng: 39.4, image: PHOTO.calcave, visitMinutes: 70, rating: 4.6, hours: "08:00–18:00", styles: ["nature"] },
  { kind: "attraction", titleAr: "متحف طرابزون", titleEn: "Trabzon Museum", lat: 41.0058, lng: 39.726, image: PHOTO.museum, visitMinutes: 60, rating: 4.4, hours: "09:00–17:00", styles: ["historical", "cultural"] },
  { kind: "attraction", titleAr: "مسجد غلbahar خاتون", titleEn: "Gulbahar Hatun Mosque", lat: 41.0069, lng: 39.722, image: PHOTO.hagia, visitMinutes: 40, free: true, rating: 4.5, hours: "24/7", styles: ["historical"] },
  { kind: "attraction", titleAr: "وادي زاغنوس", titleEn: "Zagnos Valley Park", lat: 41.005, lng: 39.712, image: PHOTO.altindere, visitMinutes: 50, free: true, rating: 4.3, hours: "24/7", styles: ["cityscape"] },
  { kind: "attraction", titleAr: "دير كوستول", titleEn: "Kustul Monastery", lat: 40.78, lng: 39.7, image: PHOTO.sumela, visitMinutes: 80, rating: 4.3, hours: "09:00–17:00", styles: ["historical"] },
  { kind: "attraction", titleAr: "هضبة بوكوت", titleEn: "Pokut Plateau", lat: 40.9, lng: 41.05, image: PHOTO.ayder, visitMinutes: 120, free: true, rating: 4.6, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "قرية هامسيكوي", titleEn: "Hamsikoy", lat: 40.69, lng: 39.48, image: PHOTO.uzungol, visitMinutes: 70, free: true, rating: 4.5, hours: "24/7", styles: ["nature", "cultural"] },
  { kind: "attraction", titleAr: "هضبة تشايkara", titleEn: "Caykara highlands", lat: 40.75, lng: 40.23, visitMinutes: 90, free: true, rating: 4.4, hours: "24/7", styles: ["nature"] },
  { kind: "hotel", titleAr: "إقامة طرابزون", titleEn: "Trabzon stay", lat: 41.0027, lng: 39.7168, image: PHOTO.hotel, rating: 8.2, reviews: 640, href: "/hotels" },
];

const CAPPADOCIA: Seed[] = [
  { kind: "attraction", titleAr: "متحف جوريم المفتوح", titleEn: "Goreme Open Air Museum", lat: 38.6405, lng: 34.845, image: PHOTO.museum, visitMinutes: 120, priceUsd: 20, rating: 4.8, hours: "08:00–19:00", styles: ["historical", "cultural"] },
  { kind: "attraction", titleAr: "وادي الحب", titleEn: "Love Valley", lat: 38.653, lng: 34.84, image: PHOTO.cappadociaValley, visitMinutes: 90, free: true, rating: 4.7, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "قلعة أوتشيسار", titleEn: "Uchisar Castle", lat: 38.629, lng: 34.807, image: PHOTO.cappadociaValley, visitMinutes: 75, rating: 4.6, hours: "08:00–19:00", styles: ["historical", "nature"] },
  { kind: "attraction", titleAr: "مدينة درينكويو تحت الأرض", titleEn: "Derinkuyu Underground City", lat: 38.375, lng: 34.736, image: PHOTO.museum, visitMinutes: 90, rating: 4.7, hours: "08:00–17:00", styles: ["historical"] },
  { kind: "attraction", titleAr: "باشاباغ مداخن الجن", titleEn: "Pasabag Fairy Chimneys", lat: 38.673, lng: 34.842, image: PHOTO.cappadociaValley, visitMinutes: 70, free: true, rating: 4.7, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "منطاد الفجر فوق كابادوكيا", titleEn: "Cappadocia sunrise balloons", lat: 38.6431, lng: 34.8289, image: PHOTO.cappadociaBalloons, visitMinutes: 120, rating: 4.9, hours: "05:00–08:00", styles: ["nature"] },
  { kind: "attraction", titleAr: "متحف زيلفيه المفتوح", titleEn: "Zelve Open Air Museum", lat: 38.6689, lng: 34.8636, image: PHOTO.cappadociaValley, visitMinutes: 90, rating: 4.6, hours: "08:00–17:00", styles: ["historical", "cultural"] },
  { kind: "attraction", titleAr: "وادي ديفرنت", titleEn: "Devrent Valley", lat: 38.677, lng: 34.87, image: PHOTO.cappadociaValley, visitMinutes: 60, free: true, rating: 4.5, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "مدينة كايماكلي تحت الأرض", titleEn: "Kaymakli Underground City", lat: 38.459, lng: 34.753, image: PHOTO.museum, visitMinutes: 75, rating: 4.6, hours: "08:00–17:00", styles: ["historical"] },
  { kind: "attraction", titleAr: "وادي الحمام", titleEn: "Pigeon Valley", lat: 38.635, lng: 34.82, image: PHOTO.park, visitMinutes: 80, free: true, rating: 4.6, hours: "24/7", styles: ["nature"] },
  { kind: "attraction", titleAr: "قلعة أورتهيسار", titleEn: "Ortahisar Castle", lat: 38.6208, lng: 34.8647, image: PHOTO.cappadociaValley, visitMinutes: 60, rating: 4.5, hours: "08:00–19:00", styles: ["historical"] },
  { kind: "attraction", titleAr: "الوادي الأحمر", titleEn: "Red Valley", lat: 38.66, lng: 34.855, image: PHOTO.cappadociaValley, visitMinutes: 90, free: true, rating: 4.7, hours: "24/7", styles: ["nature"] },
  { kind: "hotel", titleAr: "كهف في جوريم", titleEn: "Goreme cave stay", lat: 38.6431, lng: 34.8289, image: PHOTO.hotel, rating: 8.7, reviews: 1100, href: "/hotels" },
];

const RIYADH: Seed[] = [
  { kind: "attraction", titleAr: "البوليفارد", titleEn: "Boulevard City", lat: 24.753, lng: 46.63, image: PHOTO.bazaar, visitMinutes: 120, free: true, rating: 4.5, hours: "16:00–00:00", styles: ["cityscape"] },
  { kind: "hotel", titleAr: "إقامة الرياض", titleEn: "Riyadh stay", lat: 24.7136, lng: 46.6753, image: PHOTO.hotel, rating: 8.3, reviews: 700, href: "/hotels" },
];

const BARCELONA: Seed[] = [
  {
    kind: "attraction",
    titleAr: "كنيسة ساغرادا فاميليا",
    titleEn: "Basílica de la Sagrada Família",
    detailAr: "أعظم تحف أنطوني غاودي المعمارية وأيقونة برشلونة الخالدة المصنفة ضمن التراث العالمي لليونسكو بأبراجها وتصاميمها الساحرة.",
    detailEn: "Antoni Gaudí's monumental masterpiece and UNESCO World Heritage basilica, iconic worldwide.",
    lat: 41.40369,
    lng: 2.17433,
    image: "https://images.unsplash.com/photo-1583779457305-645091e60f70?w=800",
    visitMinutes: 120,
    priceUsd: 32,
    rating: 4.9,
    reviews: 185000,
    hours: "09:00–18:00",
    styles: ["cultural", "historical", "classic"],
    family: true,
  },
  {
    kind: "attraction",
    titleAr: "منتزه غويل الملوّن",
    titleEn: "Park Güell",
    detailAr: "منتزه خيالي خلاب من إبداع غاودي يطل على كامل مدينة برشلونة والبحر الأبيض المتوسط مع مقاعد الفسيفساء الأفعوانية الشهيرة.",
    detailEn: "Vibrant hillside public park designed by Antoni Gaudí with famous mosaic benches and sweeping panoramic views.",
    lat: 41.41449,
    lng: 2.15269,
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800",
    visitMinutes: 110,
    priceUsd: 14,
    rating: 4.8,
    reviews: 115000,
    hours: "09:30–19:30",
    styles: ["nature", "cultural", "cityscape"],
    family: true,
  },
  {
    kind: "attraction",
    titleAr: "كاسا باتيو العجيبة",
    titleEn: "Casa Batlló",
    detailAr: "تحفة معمارية سريالية لغاودي في جادة باسيج دي غراسيا تشبه الأمواج والزواحف الأسطورية بواجهتها المتلألئة المدهشة.",
    detailEn: "Gaudí's surreal architectural masterpiece on Passeig de Gràcia with dragon-scale roof and flowing organic curves.",
    lat: 41.39165,
    lng: 2.16499,
    image: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800",
    visitMinutes: 90,
    priceUsd: 35,
    rating: 4.8,
    reviews: 82000,
    hours: "09:00–20:00",
    styles: ["cultural", "historical"],
    family: true,
  },
  {
    kind: "attraction",
    titleAr: "كاسا ميلا (لا بيدريرا)",
    titleEn: "Casa Milà (La Pedrera)",
    detailAr: "مبنى حجري متموج شهير بسطحه المنحوت بمداخن تشبه فرسان القرون الوسطى مع إطلالة رائعة على قلب برشلونة.",
    detailEn: "Gaudí's iconic stone quarry building with famous warrior-chimney sculpted rooftop overlooking Eixample.",
    lat: 41.39528,
    lng: 2.16167,
    image: "https://images.unsplash.com/photo-1561632669-7f55f7975606?w=800",
    visitMinutes: 90,
    priceUsd: 30,
    rating: 4.7,
    reviews: 64000,
    hours: "09:00–18:30",
    styles: ["cultural", "classic"],
  },
  {
    kind: "attraction",
    titleAr: "الحي القوطي التاريخي وكاتدرائية برشلونة",
    titleEn: "Gothic Quarter & Barcelona Cathedral",
    detailAr: "أقدم أحياء برشلونة بأزقته الحجرية الرومانية والوسيطة وكاتدرائيته القوطية الشامخة وساحاته المليئة بالموسيقى والفن.",
    detailEn: "Historic medieval labyrinth of narrow stone alleys, ancient Roman walls, and the grand Gothic Cathedral.",
    lat: 41.38389,
    lng: 2.17639,
    image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800",
    visitMinutes: 100,
    free: true,
    rating: 4.8,
    reviews: 78000,
    hours: "24/7",
    styles: ["historical", "cultural", "classic"],
  },
  {
    kind: "shopping",
    titleAr: "شارع لا رامبلا وسوق لا بوكيريا",
    titleEn: "La Rambla & Mercat de la Boqueria",
    detailAr: "أشهر ممر مشاة وسياحة في إسبانيا يمتد حتى الميناء، يضم سوق بوكيريا الشهير بألوان الفواكه الاستوائية والمأكولات البحرية الطازجة.",
    detailEn: "Barcelona's legendary boulevard and the world-famous Boqueria market bursting with tapas, fresh fruits, and seafood.",
    lat: 41.38194,
    lng: 2.17194,
    image: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=800",
    visitMinutes: 90,
    free: true,
    rating: 4.6,
    reviews: 130000,
    hours: "08:00–20:30",
    styles: ["cityscape", "classic"],
    family: true,
  },
  {
    kind: "attraction",
    titleAr: "قلعة وتلفريك مونتجويك",
    titleEn: "Montjuïc Castle & Cable Car",
    detailAr: "قلعة عسكرية تاريخية على قمة جبل مونتجويك توفر إطلالة بانورامية 360 درجة على الميناء ومدينة برشلونة مع ركوب التلفريك الجوي.",
    detailEn: "Historic mountaintop fortress with aerial cable car offering 360-degree panoramic views over the harbor and city.",
    lat: 41.36333,
    lng: 2.16611,
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800",
    visitMinutes: 90,
    priceUsd: 12,
    rating: 4.7,
    reviews: 46000,
    hours: "10:00–18:00",
    styles: ["nature", "historical", "cityscape"],
    family: true,
  },
  {
    kind: "attraction",
    titleAr: "شاطئ بارسيلونيتا والممشى البحري",
    titleEn: "Barceloneta Beach & Boardwalk",
    detailAr: "شاطئ رملي متوسطي شهير وممشى بحري راقٍ بمطاعم البايلا الإسبانية والمقاهي الشاطئية وأجواء الاسترخاء المشمسة.",
    detailEn: "Vibrant golden sand Mediterranean beach and promenade famous for seafood paella chiringuitos and sea breeze.",
    lat: 41.37833,
    lng: 2.1925,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    visitMinutes: 90,
    free: true,
    rating: 4.6,
    reviews: 62000,
    hours: "24/7",
    styles: ["nature", "cityscape"],
    family: true,
  },
  {
    kind: "attraction",
    titleAr: "جادة باسيج دي غراسيا وساحة كتالونيا",
    titleEn: "Passeig de Gràcia & Plaça de Catalunya",
    detailAr: "أفخم جادة تسوق ومعمار في برشلونة تجمع أرقى بيوت الأزياء العالمية مع إبداعات العمارة الحداثية.",
    detailEn: "Grand luxury boulevard connecting Plaça de Catalunya with high-end designer boutiques and modernist palaces.",
    lat: 41.38917,
    lng: 2.16722,
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    visitMinutes: 75,
    free: true,
    rating: 4.7,
    reviews: 41000,
    hours: "24/7",
    styles: ["classic", "cityscape"],
  },
  {
    kind: "attraction",
    titleAr: "متحف بيكاسو في حي إل بورن",
    titleEn: "Picasso Museum & El Born",
    detailAr: "متحف عالمي يضم أكبر مجموعة من أعمال الفنان بابلو بيكاسو في قصور حجرية فخمة في حي إل بورن الفني.",
    detailEn: "World-class museum housing over 4,000 works of Pablo Picasso within magnificent Gothic palaces in El Born.",
    lat: 41.38522,
    lng: 2.18089,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800",
    visitMinutes: 90,
    priceUsd: 15,
    rating: 4.6,
    reviews: 35000,
    hours: "10:00–19:00",
    styles: ["cultural", "historical"],
  },
  {
    kind: "attraction",
    titleAr: "قصر الموسيقى الكتالونية",
    titleEn: "Palau de la Música Catalana",
    detailAr: "تحفة الزجاج الملون والأعمدة المزخرفة على طراز الحداثة الكتالونية المصنف لدى اليونسكو كأجمل قاعات الحفلات في العالم.",
    detailEn: "UNESCO jewel of Catalan modernisme with its breathtaking stained-glass skylight and ornate ceramic columns.",
    lat: 41.3875,
    lng: 2.17556,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    visitMinutes: 75,
    priceUsd: 20,
    rating: 4.8,
    reviews: 29000,
    hours: "09:00–17:30",
    styles: ["cultural", "classic"],
  },
  {
    kind: "attraction",
    titleAr: "حديقة القلعة وقوس النصر",
    titleEn: "Parc de la Ciutadella & Arc de Triomf",
    detailAr: "واحة خضراء ملكية في قلب برشلونة تضم نافورة كاسكادا الضخمة وبحيرة قوارب تجديف وتتصل ببوابة قوس النصر القرميدية الفخمة.",
    detailEn: "Lush city park featuring the monumental Cascada fountain, boating lake, and connected to the iconic brick Arc de Triomf.",
    lat: 41.38806,
    lng: 2.18722,
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    visitMinutes: 80,
    free: true,
    rating: 4.7,
    reviews: 51000,
    hours: "10:00–22:00",
    styles: ["nature", "classic"],
    family: true,
  },
  {
    kind: "attraction",
    titleAr: "تلة وكنيسة تيبيدابو البانورامية",
    titleEn: "Tibidabo Mountain & Sacred Heart Church",
    detailAr: "أعلى قمم برشلونة المطلة على البحر والمدينة مع كنيسة قلب يسوع الأقدس المهيبة ومدن الملاهي التاريخية العريقة.",
    detailEn: "The highest mountain ridge above Barcelona with the breathtaking Sagrat Cor church and panoramic horizon.",
    lat: 41.42194,
    lng: 2.11861,
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800",
    visitMinutes: 100,
    free: true,
    rating: 4.7,
    reviews: 28000,
    hours: "11:00–20:00",
    styles: ["nature", "cityscape"],
    family: true,
  },
  {
    kind: "attraction",
    titleAr: "ملعب كامب نو ومتحف نادي برشلونة",
    titleEn: "Spotify Camp Nou & Barca Museum",
    detailAr: "معقل كرة القدم العالمي الأسطوري ومتحف نادي برشلونة التفاعلي الذي يعرض كؤوس دوري الأبطال والكرات الذهبية وتاريخ النادي.",
    detailEn: "The legendary home of FC Barcelona and interactive museum showcasing Champions League trophies and club history.",
    lat: 41.3808,
    lng: 2.1228,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
    visitMinutes: 100,
    priceUsd: 28,
    rating: 4.7,
    reviews: 95000,
    hours: "10:00–18:00",
    styles: ["classic", "cityscape"],
    family: true,
  },
  {
    kind: "food",
    titleAr: "عشاء تاباس وبايلا بحرية فاخرة في بورت فيل",
    titleEn: "Port Vell Sunset Seafood & Tapas",
    detailAr: "تجربة طهي كتالونية أصيلة مع أطباق البايلا بالزعفران وثمار البحر والتاباس التقليدي بإطلالة اليخوت البحرية الفاخرة.",
    detailEn: "Authentic Catalan seafood paella with saffron and fresh prawns overlooking luxury yachts in Port Vell harbor.",
    lat: 41.37667,
    lng: 2.18417,
    image: PHOTO.food,
    visitMinutes: 90,
    priceUsd: 55,
    rating: 4.7,
    reviews: 9800,
    hours: "13:00–23:30",
    styles: ["classic", "cityscape"],
  },
];

const CENTERS = {
  istanbul: { lat: 41.0082, lng: 28.9784 },
  antalya: { lat: 36.8969, lng: 30.7133 },
  trabzon: { lat: 41.0027, lng: 39.7168 },
  cappadocia: { lat: 38.6431, lng: 34.8289 },
  riyadh: { lat: 24.7136, lng: 46.6753 },
  barcelona: { lat: 41.3879, lng: 2.1699 },
  athens: { lat: 37.9838, lng: 23.7275 },
  fez: { lat: 34.0331, lng: -5.0003 },
  cairo: { lat: 30.0444, lng: 31.2357 },
  dubai: { lat: 25.2048, lng: 55.2708 },
};

const TIPS = {
  istanbul: {
    ar: [
      "المساجد النشطة تتطلب لباساً محتشماً وتغطية الرأس للنساء، وتجنّب أوقات الصلاة.",
      "اشترِ تذاكر آيا صوفيا وتوبكابي مسبقاً لتجنّب الطوابير مع الأطفال.",
      "إسطنبول مناسبة للعائلات: بطاقة إسطنبول تسهّل الترام والعبّارات.",
      "شوارع السلطان أحمد مرصوفة. أحذية مريحة أو عربة خفيفة للأطفال.",
    ],
    en: [
      "Active mosques require modest dress and a head covering for women; avoid prayer times.",
      "Buy Hagia Sophia and Topkapi tickets online to skip lines with children.",
      "Get an Istanbulkart for trams and ferries across Fatih.",
      "Sultanahmet streets are cobbled — comfortable shoes or a light stroller.",
    ],
  },
  antalya: {
    ar: ["واقي شمس وقبعة على الشواطئ.", "احجز الرحلات البحرية صيفاً مسبقاً."],
    en: ["Use sun protection on the coast.", "Book boat trips early in summer."],
  },
  trabzon: {
    ar: ["الطرق الجبلية ضبابية صباحاً. ابدأ مبكراً لدير سوميلا."],
    en: ["Mountain roads can be foggy — start early for Sumela."],
  },
  cappadocia: {
    ar: ["منطاد الفجر يُحجز قبل يومين على الأقل."],
    en: ["Book sunrise balloons at least two days ahead."],
  },
  riyadh: {
    ar: ["الأنشطة الخارجية أفضل مساءً بسبب الحرارة."],
    en: ["Outdoor plans work better in the evening."],
  },
  barcelona: {
    ar: [
      "يُوصى بحجز تذاكر ساغرادا فاميليا ومنتزه غويل مسبقاً بعدة أيام لتفادي نفاد المواعيد.",
      "المشي في الحي القوطي وباسيغ دي غراسيا ممتع جداً وآمن ومناسب لجميع أفراد العائلة.",
      "استمتع بتجربة التاباس والبايلا البحرية الأصلية في منطقة بورت فيل وبارسيلونيتا.",
    ],
    en: [
      "Book tickets for Sagrada Família and Park Güell well in advance to secure prime entry slots.",
      "Strolling the Gothic Quarter and Passeig de Gràcia is best on foot with comfortable shoes.",
      "Sample authentic seafood paella and regional tapas near Port Vell and Barceloneta Beach.",
    ],
  },
};

function poolOf(key: ReturnType<typeof destKey>): Seed[] {
  if (key === "barcelona") return BARCELONA;
  if (key === "antalya") return ANTALYA;
  if (key === "trabzon") return TRABZON;
  if (key === "cappadocia") return CAPPADOCIA;
  if (key === "riyadh") return RIYADH;
  if (key === "istanbul") return ISTANBUL;
  return [];
}

function asStop(seed: Seed, day: number, order: number): PlannerStop {
  return {
    ...seed,
    id: uid("stop"),
    day,
    order,
    addedToDay: day,
  };
}

function pickSeeds(intake: PlannerIntake, key: ReturnType<typeof destKey>): Seed[] {
  const all = poolOf(key);
  const family = intake.prefs.companion === "family";
  const styled = all.filter((s) => {
    if (s.kind === "hotel") return true;
    if (family && s.family) return true;
    if (!s.styles?.length) return true;
    return s.styles.includes(intake.prefs.style);
  });
  const rest = all.filter((s) => !styled.includes(s));
  return [...styled, ...rest];
}

export function buildTripFromIntake(intake: PlannerIntake): PlannerTrip {
  const key = destKey(intake.destination || "");
  if (!key) return createEmptyTrip(intake);
  const daysCount = Math.min(10, Math.max(1, intake.durationDays || 5));
  const seeds = pickSeeds(intake, key);
  const hotel = seeds.find((s) => s.kind === "hotel");
  const attractions = seeds.filter((s) => s.kind !== "hotel");
  const perDay =
    intake.prefs.pace === "ambitious" ? 5 : intake.prefs.pace === "relaxed" ? 4 : 5;

  const days = Array.from({ length: daysCount }, (_, i) => {
    const day = i + 1;
    const slice = attractions.slice(i * perDay, i * perDay + perDay);
    const used = slice.length ? slice : [attractions[i % attractions.length]];
    const stops = used.map((s, idx) => asStop(s, day, idx + 1));
    const titles = used[0];
    return {
      day,
      titleAr: titles ? `${titles.titleAr} والمنطقة` : `اليوم ${day}`,
      titleEn: titles ? `${titles.titleEn} & nearby` : `Day ${day}`,
      notes: "",
      stops,
      legs: buildLegs(stops, "walk"),
    };
  });

  const destLabel = intake.destination || key;
  const styleAr =
    intake.prefs.style === "historical"
      ? "تاريخي"
      : intake.prefs.style === "nature"
        ? "طبيعي"
        : intake.prefs.style === "cultural"
          ? "ثقافي"
          : "كلاسيكي";
  const tips = TIPS[key];

  return {
    id: uid("trip"),
    titleAr: `${destLabel} — ${daysCount} أيام ${styleAr}${intake.prefs.companion === "family" ? " عائلي" : ""}`,
    titleEn: `${destLabel} ${daysCount}-day ${intake.prefs.style} ${intake.prefs.companion} stroll`,
    origin: intake.origin,
    destination: destLabel,
    durationDays: daysCount,
    arrivalDate: intake.arrivalDate,
    departureDate: intake.departureDate,
    prefs: intake.prefs,
    days,
    later: [],
    notes: intake.prefs.notes,
    tipsAr: tips.ar,
    tipsEn: tips.en,
    defaultMode: "walk",
    center:
      intake.destLat && intake.destLng
        ? { lat: intake.destLat, lng: intake.destLng }
        : CENTERS[key],
  };
}

export function catalogPoisForCity(destination: string) {
  const key = destKey(destination);
  if (!key) return [];
  return poolOf(key).filter((s) => s.kind !== "hotel" && s.kind !== "airport");
}

export function listIdeas(destination: string, kind?: PlannerStopKind): PlannerIdea[] {
  const key = destKey(destination);
  if (!key) return [];
  return poolOf(key)
    .filter((s) => (kind ? s.kind === kind : true))
    .map((s, i) => ({
      ...asStop(s, 0, i + 1),
      category: s.kind,
      addedToDay: undefined,
    }));
}

export function cityCenter(destination: string) {
  const key = destKey(destination);
  return key ? CENTERS[key] : { lat: 0, lng: 0 };
}

export function createEmptyTrip(intake: PlannerIntake): PlannerTrip {
  const destLabel = intake.destination || "";
  const daysCount = Math.min(10, Math.max(1, intake.durationDays || 5));
  const knownIstanbul = /istanbul|إسطنبول|اسطنبول/i.test(destLabel);
  const center =
    intake.destLat && intake.destLng
      ? { lat: intake.destLat, lng: intake.destLng }
      : knownIstanbul
        ? CENTERS.istanbul
        : { lat: 0, lng: 0 };
  const stay: Seed | null = center.lat
    ? {
        kind: "hotel",
        titleAr: destLabel ? `إقامة في ${destLabel}` : "إقامة",
        titleEn: destLabel ? `Stay in ${destLabel}` : "Stay",
        lat: center.lat,
        lng: center.lng,
        image: PHOTO.hotel,
        rating: 0,
        href: destLabel ? `/hotels?q=${encodeURIComponent(destLabel)}` : "/hotels",
      }
    : null;
  return {
    id: uid("trip"),
    titleAr: destLabel ? `${destLabel} — مسودة ${daysCount} أيام` : `مسودة ${daysCount} أيام`,
    titleEn: destLabel ? `${destLabel} — ${daysCount}-day draft` : `${daysCount}-day draft`,
    origin: intake.origin,
    destination: destLabel,
    durationDays: daysCount,
    arrivalDate: intake.arrivalDate,
    departureDate: intake.departureDate,
    prefs: intake.prefs,
    days: Array.from({ length: daysCount }, (_, i) => {
      const day = i + 1;
      const stops = stay ? [asStop(stay, day, 1)] : [];
      return {
        day,
        titleAr: `اليوم ${day}`,
        titleEn: `Day ${day}`,
        notes: "",
        stops,
        legs: [],
      };
    }),
    later: [],
    notes: intake.prefs.notes,
    tipsAr: destLabel ? [`مسودة فارغة لـ ${destLabel} — أضف المعالم من الأفكار أو اسأل الوكيل.`] : [],
    tipsEn: destLabel ? [`Empty draft for ${destLabel} — add places from ideas or ask the agent.`] : [],
    defaultMode: "walk",
    center,
  };
}
