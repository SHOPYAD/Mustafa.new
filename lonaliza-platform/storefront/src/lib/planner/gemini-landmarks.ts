import { generateGeminiContent } from "@/lib/server/gemini-swarm-client";
import type { PlannerDay, PlannerIntake, PlannerStop, PlannerStopKind, PlannerTrip } from "@/types/planner";
import { buildLegs, uid, validLatLng } from "./geo";
import { wikiSummary } from "./wiki-summary";
import { discoverDestinationPlacesLive, type DiscoveredPlace } from "@/lib/server/google-places-agent";
import { fetchWikivoyageGuide } from "@/lib/server/wikivoyage";
import { isGenericStockPhoto, photoForPlace, getSafeAttractionFallback } from "./place-photos";

interface GeminiStopRaw {
  titleAr: string;
  titleEn: string;
  kind?: PlannerStopKind;
  slotAr: string;
  slotEn?: string;
  visitMinutes?: number;
  lat?: number;
  lng?: number;
  detailAr?: string;
  detailEn?: string;
  culinaryNoteAr?: string;
  rating?: number;
  reviews?: number;
  image?: string;
}

interface GeminiDayRaw {
  day: number;
  themeAr: string;
  themeEn: string;
  morningAr?: string;
  afternoonAr?: string;
  eveningAr?: string;
  narrativeAr: string;
  narrativeEn?: string;
  stops: GeminiStopRaw[];
}

interface GeminiItineraryPayload {
  titleAr: string;
  titleEn: string;
  destination: string;
  days: GeminiDayRaw[];
  tipsAr?: string[];
  tipsEn?: string[];
}

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80";

/**
 * High-performance batch executor with timeout
 */
async function runWithTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([
    p.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}

/**
 * World-Class Iconic Landmark & Lifestyle Travel Engine.
 * Follows Trip.com & luxury concierge standards:
 * - Morning: Iconic landmark or historic center + iconic cafe
 * - Afternoon: Celebrated landmark / authentic local dining
 * - Evening: Sunset viewpoint, famous bazaar, or atmospheric waterfront dinner
 */
const CAIRO_ICONIC_DAYS: GeminiDayRaw[] = [
  {
    day: 1,
    themeAr: "عظمة الجيزة والمتحف المصري الكبير",
    themeEn: "Giza Pyramids & Grand Egyptian Museum",
    morningAr: "زيارة أهرامات الجيزة الخالدة وتمثال أبو الهول مع جولة خاصة وتناول القهوة مع إطلالة بانورامية.",
    afternoonAr: "استكشاف أروقة المتحف المصري الكبير (GEM) وتناول الغداء الفاخر في مطعم بيراميدز لاونج.",
    eveningAr: "أمسية هادئة في مقهى مطل على الأهرامات مع عشاء فاخر والعودة للفندق.",
    narrativeAr: "انطلاقة ملكية تبدأ من أهرامات الجيزة ثم صرح المتحف الكبير ختاماً بغروب ساحر أمام الأهرامات.",
    stops: [
      { titleAr: "أهرامات الجيزة وأبو الهول", titleEn: "Giza Pyramids & Sphinx", slotAr: "الصباح (09:00)", kind: "attraction", lat: 29.9792, lng: 31.1342, visitMinutes: 180, rating: 4.9, detailAr: "استكشاف عجائب الدنيا السبع وأبو الهول بركوب الخيل أو الحنطور التراثي.", image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800" },
      { titleAr: "المتحف المصري الكبير", titleEn: "Grand Egyptian Museum", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 29.9944, lng: 31.1197, visitMinutes: 180, rating: 4.9, detailAr: "جولة في أكبر صرح متحفي عالمي يضم كنوز توت عنخ آمون والبهو العظيم.", image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800" },
      { titleAr: "مطعم 9 بيراميدز لاونج", titleEn: "9 Pyramids Lounge", slotAr: "المساء (17:30)", kind: "restaurant", lat: 29.9678, lng: 31.1295, visitMinutes: 120, rating: 4.8, detailAr: "تناول العشاء والمشروبات مع إطلالة بانورامية لا تُضاهى على الأهرامات التسعة عند الغروب.", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800" }
    ]
  },
  {
    day: 2,
    themeAr: "أسرار الفراعنة في سقارة ودهشور وممفيس",
    themeEn: "Saqqara Step Pyramid, Dahshur & Memphis",
    morningAr: "زيارة هرم زوسر المدرج في سقارة واستكشاف المقابر الفرعونية المزينة بنقوش مذهلة.",
    afternoonAr: "جولة في دهشور لمشاهدة الهرم المنحني والهرم الأحمر ثم استكشاف تمثال رمسيس في ممفيس.",
    eveningAr: "تناول الغداء الريفي في مطعم واحة سقارة وتجربة الفطير المشلتت ثم العودة للقاهرة.",
    narrativeAr: "رحلة تاريخية عميقة لأقدم أهرامات التاريخ في سقارة ودهشور مع وجبة ريفية مصرية أصيلة.",
    stops: [
      { titleAr: "هرم سقارة المدرج", titleEn: "Saqqara Step Pyramid", slotAr: "الصباح (09:30)", kind: "attraction", lat: 29.8713, lng: 31.2165, visitMinutes: 150, rating: 4.9, detailAr: "أول بناء حجري ضخم في التاريخ ومقبرة الملك زوسر ومتحف إمحوتب.", image: "https://images.unsplash.com/photo-1562671236-4c220046522c?w=800" },
      { titleAr: "أهرامات دهشور (الهرم الأحمر والمنحني)", titleEn: "Dahshur Pyramids", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 29.8087, lng: 31.2062, visitMinutes: 120, rating: 4.8, detailAr: "معاينة هندسة الأهرامات الفريدة وإمكانية الدخول لقلب الهرم الأحمر.", image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800" },
      { titleAr: "مطعم واحة سقارة الريفي", titleEn: "Saqqara Palm Club & Restaurant", slotAr: "المساء (15:30)", kind: "restaurant", lat: 29.8550, lng: 31.2280, visitMinutes: 120, rating: 4.7, detailAr: "تناول أشهى المشويات المصرية والفطير المشلتت في أجواء ريفية وسط النخيل.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 3,
    themeAr: "موكب المومياوات والمتحف المصري بالتحرير ورحلة النيل",
    themeEn: "NMEC, Tahrir Egyptian Museum & Nile Felucca",
    morningAr: "زيارة المتحف القومي للحضارة المصرية بالفسطاط (NMEC) وقاعة المومياوات الملكية المهيبة.",
    afternoonAr: "استكشاف المتحف المصري بميدان التحرير والقطع التاريخية الخالدة.",
    eveningAr: "رحلة شراع نيلية (فلوكة) وقت الغروب تليها سهرة عشاء فاخرة على مركب نيلي في الزمالك.",
    narrativeAr: "يوم يجمع بين مجد المومياوات الملكية وتاريخ التحرير وجمال الإبحار في النيل الخالد.",
    stops: [
      { titleAr: "المتحف القومي للحضارة المصرية", titleEn: "National Museum of Egyptian Civilization", slotAr: "الصباح (09:30)", kind: "attraction", lat: 30.0076, lng: 31.2482, visitMinutes: 150, rating: 4.9, detailAr: "مشاهدة قاعة المومياوات الملكية وعرض تطور الحضارة المصرية عبر العصور.", image: "https://images.unsplash.com/photo-1544885935-98dd03b09034?w=800" },
      { titleAr: "المتحف المصري بميدان التحرير", titleEn: "The Egyptian Museum Tahrir", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 30.0478, lng: 31.2336, visitMinutes: 120, rating: 4.8, detailAr: "المتحف الكلاسيكي العريق في قلب القاهرة وميدان التحرير.", image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800" },
      { titleAr: "جولة فلوكة نيلية خاصة وعشاء الزمالك", titleEn: "Private Nile Felucca & Dinner", slotAr: "المساء (17:30)", kind: "attraction", lat: 30.0600, lng: 31.2200, visitMinutes: 150, rating: 4.9, detailAr: "إبحار شراعي خاص في النيل وتناول العشاء الفاخر في مطاعم جزيرة الزمالك.", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800" }
    ]
  },
  {
    day: 4,
    themeAr: "قاهرة المعز: قلعة صلاح الدين وخان الخليلي وشارع المعز",
    themeEn: "Saladin Citadel, Al-Muizz Street & Khan El-Khalili",
    morningAr: "زيارة قلعة صلاح الدين الأيوبي وجامع محمد علي والاستمتاع بإطلالة بانورامية على القاهرة.",
    afternoonAr: "جولة في شارع المعز لدين الله الفاطمي وأكبر متحف مفتوح للآثار الإسلامية في العالم.",
    eveningAr: "التسوق في خان الخليلي وتناول الشاي بالنعناع في مقهى الفيشاوي العريق والعشاء في مطعم نجيب محفوظ.",
    narrativeAr: "الغوص في عبق التاريخ الإسلامي والأزقة الفاطمية مع تسوق الهدايا التذكارية في خان الخليلي.",
    stops: [
      { titleAr: "قلعة صلاح الدين الأيوبي وجامع محمد علي", titleEn: "Citadel of Saladin & Mosque of Muhammad Ali", slotAr: "الصباح (09:30)", kind: "attraction", lat: 30.0299, lng: 31.2611, visitMinutes: 150, rating: 4.8, detailAr: "حصن القاهرة التاريخي وجامع الألبستر ذو المآذن الشامخة.", image: "https://images.unsplash.com/photo-1580834341580-8c17a3a632df?w=800" },
      { titleAr: "شارع المعز لدين الله الفاطمي", titleEn: "Al-Muizz li-Din Allah Street", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 30.0520, lng: 31.2615, visitMinutes: 120, rating: 4.9, detailAr: "أجمل شوارع العمارة الإسلامية والأسبلة والمساجد الفاطمية والمملوكية.", image: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800" },
      { titleAr: "خان الخليلي ومقهى الفيشاوي ومطعم نجيب محفوظ", titleEn: "Khan el-Khalili & El Fishawy Cafe", slotAr: "المساء (16:30)", kind: "shopping", lat: 30.0478, lng: 31.2623, visitMinutes: 180, rating: 4.8, detailAr: "أشهر أسواق الشرق ومقاهي التراث وتناول العشاء المصري الشرقي.", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" }
    ]
  },
  {
    day: 5,
    themeAr: "مصر القديمة القبطية وكنيسة الكهف وحديقة الأزهر",
    themeEn: "Coptic Cairo, Cave Church & Al-Azhar Park",
    morningAr: "زيارة مجمع الأديان في مصر القديمة والكنيسة المعلقة ومغارة العائلة المقدسة بكنيسة أبي سرجة.",
    afternoonAr: "الصعود لجبل المقطم واستكشاف دير القديس سمعان الخراز (كنيسة الكهف) المنحوتة في الصخر.",
    eveningAr: "مشاهدة غروب الشمس من هضبة حديقة الأزهر وتناول العشاء في مطعم القلعة البانورامي.",
    narrativeAr: "يوم مفعم بالروحانية والتسامح الديني يتوج بغروب خلاب على أفق مآذن القاهرة من حديقة الأزهر.",
    stops: [
      { titleAr: "مجمع الأديان والكنيسة المعلقة", titleEn: "The Hanging Church & Coptic Cairo", slotAr: "الصباح (09:30)", kind: "attraction", lat: 30.0053, lng: 31.2301, visitMinutes: 120, rating: 4.8, detailAr: "أعرق كنائس مصر المشيدة فوق برجي حصن بابليون ومتحف الفن القبطي.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800" },
      { titleAr: "دير سمعان الخراز (كنيسة الكهف بالمقطم)", titleEn: "Cave Church of Saint Simon", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 30.0305, lng: 31.2758, visitMinutes: 120, rating: 4.9, detailAr: "أعجوبة معمارية منحوتة بالكامل داخل صخور جبل المقطم تتسع لآلاف الزوار.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800" },
      { titleAr: "حديقة الأزهر ومطعم القلعة", titleEn: "Al-Azhar Park & Citadel View Restaurant", slotAr: "المساء (16:30)", kind: "viewpoint", lat: 30.0408, lng: 31.2652, visitMinutes: 150, rating: 4.8, detailAr: "واحة خضراء في قلب القاهرة ومطل ساحر على مآذن القاهرة التاريخية وقلعة صلاح الدين.", image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800" }
    ]
  },
  {
    day: 6,
    themeAr: "رحلة يوم كامل إلى عروس البحر المتوسط (الإسكندرية)",
    themeEn: "Alexandria Mediterranean Day Trip",
    morningAr: "الانطلاق صباحاً بسيارة خاصة إلى الإسكندرية وزيارة قلعة قايتباي المشيدة مكان منارة الإسكندرية القديمة.",
    afternoonAr: "استكشاف مكتبة الإسكندرية الحديثة وصرحها الثقافي العالمي ثم قصر وحدائق المنتزه الملكية.",
    eveningAr: "تناول وجبة بحرية فاخرة في مطعم سمك قسطور أو زفير على كورنيش الإسكندرية والعودة للقاهرة.",
    narrativeAr: "رحلة ساحلية ممتعة لعروس المتوسط تمتزج فيها نسائم البحر بالتاريخ الهيلينستي والروماني العظيم.",
    stops: [
      { titleAr: "قلعة قايتباي بالإسكندرية", titleEn: "Citadel of Qaitbay", slotAr: "الصباح (10:30)", kind: "attraction", lat: 31.2140, lng: 29.8856, visitMinutes: 120, rating: 4.8, detailAr: "قلعة مملوكية حصينة تشرف على البحر المتوسط شُيدت بحجارة الفنار القديم.", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800" },
      { titleAr: "مكتبة الإسكندرية الحديثة", titleEn: "Bibliotheca Alexandrina", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 31.2089, lng: 29.9092, visitMinutes: 120, rating: 4.9, detailAr: "أيقونة المعرفة بتصميمها القرصي المائل ومتاحف المخطوطات والآثار النادرة.", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800" },
      { titleAr: "كورنيش الإسكندرية ومطعم الأسماك الفاخر", titleEn: "Alexandria Corniche Seafood", slotAr: "المساء (16:30)", kind: "restaurant", lat: 31.2100, lng: 29.8900, visitMinutes: 150, rating: 4.8, detailAr: "أشهى المأكولات البحرية الطازجة على شاطئ البحر المتوسط قبل العودة للقاهرة.", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800" }
    ]
  },
  {
    day: 7,
    themeAr: "مغامرة واحة الفيوم وشلالات وادي الريان وبحيرة قارون",
    themeEn: "Fayoum Oasis, Wadi El-Rayan & Tunis Village",
    morningAr: "رحلة برية بسيارة 4x4 إلى محمية وادي الريان وزيارة الشلالات الطبيعية والبحيرات الساحرة.",
    afternoonAr: "زيارة قرية تونس الشهيرة بصناعة الخزف والفخار اليدوي والإطلالة على بحيرة قارون.",
    eveningAr: "تناول الغداء الفلاحي في قرية تونس وجولة استرخائية ختامية قبل العودة للقاهرة.",
    narrativeAr: "يوم مفعم بالسحر الطبيعي في واحة الفيوم والتزلج على الرمال وفنون الفخار اليدوي.",
    stops: [
      { titleAr: "شلالات وادي الريان وبحيرة قارون", titleEn: "Wadi El-Rayan Waterfalls", slotAr: "الصباح (09:30)", kind: "attraction", lat: 29.2390, lng: 30.4140, visitMinutes: 180, rating: 4.8, detailAr: "المحمية الطبيعية الوحيدة ذات الشلالات المائية المتدفقة في الصحراء الغربية.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800" },
      { titleAr: "قرية تونس للفنون والخزف", titleEn: "Tunis Pottery Village", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 29.4072, lng: 30.5694, visitMinutes: 120, rating: 4.8, detailAr: "قرية هادئة تشتهر بمدارس وورش الفخار اليدوي والمعارض الفنية وسط الخضرة.", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800" },
      { titleAr: "مطعم ريفي وبحيرة قارون وسهرة الشاي", titleEn: "Karoun Lake Country Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 29.4500, lng: 30.6000, visitMinutes: 120, rating: 4.7, detailAr: "تناول وجبة ريفية مصرية أصيلة مع شاي الأعشاب وإطلالة على البحيرة.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" }
    ]
  },
  {
    day: 8,
    themeAr: "الأقصر عاصمة الفراعنة: معبد الكرنك وطريق الكباش",
    themeEn: "Luxor: Karnak Temple & Avenue of Sphinxes",
    morningAr: "الانطلاق صباحاً إلى مدينة الأقصر وزيارة صرح معبد الكرنك العظيم أكبر دار عبادة في العالم القديم.",
    afternoonAr: "السير في طريق الكباش الملكي التاريخي الذي يربط بين معبدي الكرنك والأقصر.",
    eveningAr: "زيارة معبد الأقصر المضاء ليلاً وتناول العشاء على ضفاف النيل في مطعم قصر الشتاء العريق.",
    narrativeAr: "انتقال ملكي إلى طيبة القديمة لاستكشاف بهو الأعمدة الأسطوري في الكرنك ومعبد الأقصر الساحر ليلاً.",
    stops: [
      { titleAr: "معبد الكرنك العظيم", titleEn: "Karnak Temple Complex", slotAr: "الصباح (09:30)", kind: "attraction", lat: 25.7188, lng: 32.6573, visitMinutes: 180, rating: 4.9, detailAr: "استكشاف بهو الأعمدة الـ 134 العملاقة وبحيرة المعبد المقدسة ومسلات حتشبسوت.", image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800" },
      { titleAr: "طريق الكباش ومعبد الأقصر", titleEn: "Avenue of Sphinxes & Luxor Temple", slotAr: "الظهيرة (14:00)", kind: "attraction", lat: 25.6995, lng: 32.6392, visitMinutes: 150, rating: 4.9, detailAr: "مشاهدة تماثيل الكباش المصطفة لمسافة 2.7 كم وزيارة معبد الأقصر الشامخ.", image: "https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=800" },
      { titleAr: "عشاء نيل الأقصر ومطعم سوفيتيل ونتر بالاس", titleEn: "Sofitel Winter Palace Nile Dining", slotAr: "المساء (18:30)", kind: "restaurant", lat: 25.6980, lng: 32.6370, visitMinutes: 120, rating: 4.8, detailAr: "عشاء فاخر في القصر التاريخي الذي استضاف ملوك العالم مع إطلالة النيل الساحرة.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 9,
    themeAr: "غرب الأقصر الملكي: وادي الملوك ومعبد حتشبسوت ومنطاد الفجر",
    themeEn: "West Bank: Valley of the Kings & Hatshepsut Temple",
    morningAr: "ركوب منطاد الهواء الساخن مع خيوط الفجر الأولى لمشاهدة آثار الأقصر من السماء ثم استكشاف وادي الملوك.",
    afternoonAr: "زيارة معبد الملكة حتشبسوت المنحوت في حضن الجبل بالدير البحري وتمثالي ممنون العملاقين.",
    eveningAr: "رحلة شراع إلى جزيرة الموز بالنيل وتناول الفواكه الطازجة مع غروب الشمس والعودة للفندق.",
    narrativeAr: "يوم أسطوري يجمع بين سحر الطيران بالمنطاد وزيارة مقابر الفراعنة الذهبية وعجائب الدير البحري.",
    stops: [
      { titleAr: "ركوب المنطاد الطائر وقت الشروق", titleEn: "Luxor Sunrise Hot Air Balloon", slotAr: "الصباح (05:30)", kind: "attraction", lat: 25.7300, lng: 32.6000, visitMinutes: 120, rating: 4.9, detailAr: "تجربة تحليق خيالية فوق المعابد والنيل وأشعة الشمس الذهبية تعانق وادي الملوك.", image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800" },
      { titleAr: "وادي الملوك ومقبرة توت عنخ آمون", titleEn: "Valley of the Kings", slotAr: "الصباح (09:00)", kind: "attraction", lat: 25.7402, lng: 32.6014, visitMinutes: 180, rating: 4.9, detailAr: "الدخول للمقابر الملكية الملونة المحفورة في قلب الجبل بألوان صامدة منذ آلاف السنين.", image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800" },
      { titleAr: "معبد حتشبسوت وتمثالا ممنون", titleEn: "Hatshepsut Temple & Colossi of Memnon", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 25.7383, lng: 32.6067, visitMinutes: 150, rating: 4.8, detailAr: "أعظم تحفة معمارية متدرجة في حضن الجبل وتمثالا أمنحتب الثالث الشامخان.", image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800" }
    ]
  },
  {
    day: 10,
    themeAr: "سحر أسوان وبلاد النوبة: معبد فيلة والقرية النوبية",
    themeEn: "Aswan: Philae Temple, High Dam & Nubian Village",
    morningAr: "زيارة معبد فيلة المخصص للإلهة إيزيس المشيد فوق جزيرة أجيليكيا وسط مياه النيل الفيروزية.",
    afternoonAr: "معاينة هندسة السد العالي وبحيرة ناصر العظيمة ثم الإبحار بزورق إلى القرية النوبية غرب سهيل.",
    eveningAr: "جولة في أزقة القرية النوبية الملونة وتذوق الشاي الكركديه وعشاء نوبي تراثي والاستماع للموسيقى النوبية.",
    narrativeAr: "انغماس في الدفء النوبي والجمال الطبيعي بين الجزر النيلية وصخور الجرانيت ومعابد جزيرة فيلة.",
    stops: [
      { titleAr: "معبد فيلة بجزيرة أجيليكيا", titleEn: "Philae Temple Complex", slotAr: "الصباح (09:30)", kind: "attraction", lat: 24.0253, lng: 32.8842, visitMinutes: 150, rating: 4.9, detailAr: "إبحار قصير بالقارب للوصول إلى لؤلؤة النيل ومعبد إيزيس الساحر المحاط بالمياه.", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800" },
      { titleAr: "السد العالي وبحيرة ناصر", titleEn: "Aswan High Dam & Lake Nasser", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 23.9697, lng: 32.8778, visitMinutes: 90, rating: 4.7, detailAr: "أضخم إنجاز هندسي مصري حديث وإطلالة بانورامية هائلة على أكبر بحيرة صناعية.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800" },
      { titleAr: "القرية النوبية الملونة بغرب سهيل", titleEn: "Nubian Village Gharb Soheil", slotAr: "المساء (15:30)", kind: "attraction", lat: 24.0580, lng: 32.8650, visitMinutes: 180, rating: 4.9, detailAr: "بيوت نوبية قبة ملونة، ضيافة أصيلة، رسم الحناء، ورؤية التماسيح الأليفة في البيوت التراثية.", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800" }
    ]
  },
  {
    day: 11,
    themeAr: "روعة البحر الأحمر: رحلة يخت خاص في الغردقة والجزر المرجانية",
    themeEn: "Red Sea Luxury: Private Yacht Cruise & Dolphin Reef",
    morningAr: "الانطلاق في رحلة يخت خاص في مياه البحر الأحمر الشفافة نحو جزيرة الجفتون ومحمية الشعاب المرجانية.",
    afternoonAr: "ممارسة السباحة والسنوركلينج مع الأسماك الملونة وإمكانية مشاهدة الدلافين في بيئتها الطبيعية.",
    eveningAr: "تناول وجبة غداء بحرية طازجة على ظهر اليخت ثم جولة مسائية في مارينا الغردقة الفاخرة.",
    narrativeAr: "يوم مخصص للاستجمام البحري والرفاهية المطلقة وسط أروع شعاب مرجانية ومياه كريستالية بالعالم.",
    stops: [
      { titleAr: "رحلة يخت بحري خاص وجزيرة الجفتون", titleEn: "Private Yacht & Giftun Island", slotAr: "الصباح (09:00)", kind: "attraction", lat: 27.2300, lng: 33.8600, visitMinutes: 240, rating: 4.9, detailAr: "إبحار خاص نحو الرمال البيضاء والمياه الفيروزية الساحرة بجزيرة الجفتون.", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800" },
      { titleAr: "السباحة والسنوركلينج في شعب الفانوس", titleEn: "Snorkeling & Dolphin Reef", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 27.2700, lng: 33.8900, visitMinutes: 120, rating: 4.8, detailAr: "استكشاف حدائق المرجان النادرة والسباحة الآمنة بجوار أسراب الدلافين اللطيفة.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" },
      { titleAr: "مارينا الغردقة ومطعم المأكولات البحرية", titleEn: "Hurghada Marina Seafood Dining", slotAr: "المساء (17:30)", kind: "restaurant", lat: 27.2250, lng: 33.8420, visitMinutes: 150, rating: 4.8, detailAr: "نزهة راقية بمحاذاة اليخوت وتناول أشهى وجبات الجمبري والأسماك الطازجة.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800" }
    ]
  },
  {
    day: 12,
    themeAr: "القاهرة الحديثة والتسوق الملكي وسهرة نيلية راقية",
    themeEn: "Modern Cairo, Luxury Shopping & Grand Nile Soiree",
    morningAr: "جولة صباحية منعشة على ممشى أهل مصر البانورامي المطل على النيل وأبراج القاهرة الحديثة.",
    afternoonAr: "جولة تسوق راقية في أرقى المراكز التجارية واقتناء الهدايا والماركات العالمية والمنتجات التراثية المصرية.",
    eveningAr: "سهرة عشاء ملكية على باخرة نيلية متحركة مع عروض الفلكلور والتنورة وأضواء النيل الباهرة.",
    narrativeAr: "ختام رحلة الأحلام بيوم يجمع بين الحداثة المصرية وأناقة الكورنيش والتسوق الفاخر وسهرة النيل الساحرة.",
    stops: [
      { titleAr: "ممشى أهل مصر وجولة الكورنيش", titleEn: "Mamsha Ahl Masr Nile Promenade", slotAr: "الصباح (10:00)", kind: "viewpoint", lat: 30.0710, lng: 31.2290, visitMinutes: 120, rating: 4.8, detailAr: "كورنيش سياحي عصري يضم مطاعم وكافيهات معلقة على النيل مباشرة ومسارات مشي خلابة.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800" },
      { titleAr: "التسوق الفاخر في مول مصر ومول العرب", titleEn: "Mall of Egypt Luxury Shopping", slotAr: "الظهيرة (13:30)", kind: "shopping", lat: 29.9720, lng: 30.9650, visitMinutes: 180, rating: 4.8, detailAr: "أكبر وجهة تسوق راقية تضم أشهر العلامات التجارية العالمية والمنتجات الحرفية الفاخرة.", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800" },
      { titleAr: "سهرة عشاء نيلية فخمة على باخرة لوتس", titleEn: "Lotus Grand Nile Dinner Cruise", slotAr: "المساء (18:30)", kind: "restaurant", lat: 30.0550, lng: 31.2230, visitMinutes: 180, rating: 4.9, detailAr: "إبحار مسائي في قلب النيل مع بوفيه عالمي فاخر وموسيقى شرقية وأضواء القاهرة المتلألئة.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 13,
    themeAr: "شرم الشيخ ومحمية رأس محمد العالمية",
    themeEn: "Sharm El Sheikh & Ras Mohammed Marine Reserve",
    morningAr: "رحلة بحرية إلى محمية رأس محمد عند التقاء خليجي السويس والعقبة ومشاهدة بحيرة الماجيك والمانجروف.",
    afternoonAr: "الغطس واستكشاف أندر الشعاب المرجانية وأسماك البحر الأحمر الاستوائية.",
    eveningAr: "التجول في ساحة سوهو سكوير والنافورة الراقصة وتناول العشاء في مطعم شرقي فاخر.",
    narrativeAr: "يوم مفعم بالإثارة البحرية في أعماق رأس محمد وختام مسائي مشرق في سوهو سكوير.",
    stops: [
      { titleAr: "محمية رأس محمد وبحيرة المسحور", titleEn: "Ras Mohammed National Park", slotAr: "الصباح (09:00)", kind: "attraction", lat: 27.7280, lng: 34.2500, visitMinutes: 240, rating: 4.9, detailAr: "واحدة من أجمل 10 محميات بحرية في العالم بشعابها المرجانية وبوابة الله الحجرية.", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800" },
      { titleAr: "خليج نعمة والسوق القديم بشرم الشيخ", titleEn: "Naama Bay & Old Market", slotAr: "الظهيرة (15:00)", kind: "shopping", lat: 27.9150, lng: 34.3290, visitMinutes: 120, rating: 4.7, detailAr: "مركز شرم الشيخ النابض وجامع الصحابة المعماري الفريد والتسوق التذكاري.", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" },
      { titleAr: "سوهو سكوير والنافورة الراقصة", titleEn: "SOHO Square & Dancing Fountain", slotAr: "المساء (18:30)", kind: "viewpoint", lat: 27.9710, lng: 34.3940, visitMinutes: 150, rating: 4.8, detailAr: "عروض مائية وموسيقية حية ومطاعم عالمية ومقاهي في أجواء احتفالية أوروبية راقية.", image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800" }
    ]
  },
  {
    day: 14,
    themeAr: "التراث السكندري الملكي: قصر المنتزه ومقابر كوم الشقافة",
    themeEn: "Royal Alexandria: Montaza Palace & Catacombs",
    morningAr: "زيارة قصر وحدائق المنتزه الملكية والتنزه بين أشجار النخيل المعمرة وإطلالات البحر الخلابة.",
    afternoonAr: "استكشاف مقابر كوم الشقافة الأثرية المنحوتة في الصخر والمسرح الروماني القديم.",
    eveningAr: "تناول وجبة سمك إسكندراني طازجة بمطعم قدورة الأيقوني على كورنيش الميناء الشرقي.",
    narrativeAr: "رحلة عبر العصور الرومانية والملكية في ثنايا الإسكندرية وأجواء المنتزه الساحرة.",
    stops: [
      { titleAr: "قصر وحدائق المنتزه الملكية", titleEn: "Montaza Palace & Royal Gardens", slotAr: "الصباح (10:00)", kind: "attraction", lat: 31.2880, lng: 30.0160, visitMinutes: 180, rating: 4.8, detailAr: "قصر السلاملك والحرملك وجسر الشاي الخشبي وسط 370 فداناً من البساتين الملكية.", image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800" },
      { titleAr: "مقابر كوم الشقافة والمسرح الروماني", titleEn: "Catacombs of Kom El Shoqafa", slotAr: "الظهيرة (14:00)", kind: "attraction", lat: 31.1789, lng: 29.8931, visitMinutes: 120, rating: 4.7, detailAr: "أحد عجائب العصور الوسطى بنقوش تمزج بين الفنون الفرعونية والرومانية واليونانية.", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800" },
      { titleAr: "مطعم قدورة للأسماك الطازجة", titleEn: "Kaddoura Seafood Restaurant", slotAr: "المساء (17:00)", kind: "restaurant", lat: 31.2060, lng: 29.8970, visitMinutes: 120, rating: 4.8, detailAr: "أعرق مطاعم الأسماك والمأكولات البحرية على البحر المتوسط وتجربة الصيد الطازج اليومي.", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800" }
    ]
  },
  {
    day: 15,
    themeAr: "قداسة سيناء وسانت كاترين وجبل موسى",
    themeEn: "Saint Catherine Monastery & Mount Sinai",
    morningAr: "زيارة دير سانت كاترين التاريخي أقدم دير مأهول في العالم والمسجل في اليونسكو.",
    afternoonAr: "مشاهدة شجرة العليقة الملتهبة ومكتبة المخطوطات النادرة وبئر النبي موسى.",
    eveningAr: "استراحة في وادي الراحة وتناول الغداء البدوي وتأمل الطبيعة الجبلية المهيبة لشبه جزيرة سيناء.",
    narrativeAr: "تجربة روحانية نادرة عند سفوح جبل موسى وزيارة صرح دير القديسة كاترين المحصن بالأسوار البيزنطية.",
    stops: [
      { titleAr: "دير سانت كاترين وشجرة العليقة", titleEn: "Saint Catherine Monastery", slotAr: "الصباح (09:30)", kind: "attraction", lat: 28.5559, lng: 33.9760, visitMinutes: 180, rating: 4.9, detailAr: "دير بيزنطي أثري يضم كنيسة التجلي والفسيفساء الأيقونية وبئر موسى وشجرة العليقة المقدسة.", image: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800" },
      { titleAr: "سفح جبل موسى ومتحف الأيقونات", titleEn: "Mount Sinai Foot & Icons Gallery", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 28.5390, lng: 33.9750, visitMinutes: 120, rating: 4.9, detailAr: "معاينة ثاني أكبر مجموعة مخطوطات وأيقونات دينية بالعالم تحت قمم سيناء الشاهقة.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" },
      { titleAr: "استراحة وادي الراحة والضيافة البدوية", titleEn: "Wadi El-Raha Bedouin Oasis", slotAr: "المساء (16:30)", kind: "restaurant", lat: 28.5650, lng: 33.9650, visitMinutes: 120, rating: 4.8, detailAr: "تناول وجبة المندى السيناوي وشاي الحَبَق البري في بيت شعر بدوي أصيل.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800" }
    ]
  }
];

export const ISTANBUL_ICONIC_DAYS: GeminiDayRaw[] = [
  {
    day: 1,
    themeAr: "قلب التاريخ العثماني والبيزنطي: السلطان أحمد وآيا صوفيا وتوبكابي",
    themeEn: "Historic Peninsula: Sultanahmet, Hagia Sophia & Topkapi",
    morningAr: "انطلاق الجولة بزيارة صرح آيا صوفيا التاريخي العظيم وتأمل الفسيفساء الذهبية والقباب المهيبة، يعقبها تناول القهوة العثمانية في باحة السلطان أحمد.",
    afternoonAr: "استكشاف جامع السلطان أحمد (المسجد الأزرق) وصهريج البازيليك المائي الساحر تحت الأرض، ثم قصر توبكابي مقر السلاطين العثمانيين.",
    eveningAr: "تناول وجبة غداء/عشاء عثمانية فاخرة في مطعم السليمانية التراثي، ثم نزهة في حديقة جولهانة والعودة إلى الفندق بسيارة VIP.",
    narrativeAr: "يوم يجمع بين أعظم رموز الإمبراطوريات القديمة في قلب إسطنبول التاريخي مع تجربة ضيافة ملكية خاصة.",
    stops: [
      { titleAr: "متحف صرح آيا صوفيا التاريخي", titleEn: "Hagia Sophia Mosque & Museum", slotAr: "الصباح (09:30)", kind: "attraction", lat: 41.0086, lng: 28.9802, visitMinutes: 120, rating: 4.9, detailAr: "أحد أعظم المعالم المعمارية في التاريخ العالمي بقبابه الشاهقة وفسيفسائه البيزنطية العثمانية.", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800" },
      { titleAr: "جامع السلطان أحمد (المسجد الأزرق)", titleEn: "Sultanahmet Blue Mosque", slotAr: "الظهيرة (12:00)", kind: "attraction", lat: 41.0054, lng: 28.9768, visitMinutes: 90, rating: 4.9, detailAr: "مسجد القباب الست الشهيرة المزدان بآلاف بلاطات السيراميك الإزنيقي الأزرق الفاخر.", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800" },
      { titleAr: "قصر توبكابي وصهريج البازيليك", titleEn: "Topkapi Palace & Basilica Cistern", slotAr: "المساء (15:00)", kind: "attraction", lat: 41.0115, lng: 28.9834, visitMinutes: 150, rating: 4.8, detailAr: "قصر سلاطين بني عثمان وجناح الأمانات المقدسة والصهريج الروماني المائي المضاء بأنوار ساحرة.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800" }
    ]
  },
  {
    day: 2,
    themeAr: "سحر البوسفور وغلاطة وتقسيم: برج غلاطة وكروز اليخت الخاص",
    themeEn: "Bosphorus, Galata & Taksim: Yacht Cruise & Istiklal",
    morningAr: "الصعود لقمة برج غلاطة والاستمتاع بإطلالة بانورامية 360 درجة على مضيق البوسفور والقرن الذهبي ومآذن إسطنبول.",
    afternoonAr: "جولة راقية في شارع الاستقلال وميدان تقسيم التاريخي، وتجربة الترام التراثي الأحمر والتسوق في المتاجر العريقة.",
    eveningAr: "إبحار خاص على متن يخت فاخر في مضيق البوسفور عند غروب الشمس مع الشاي والمقبلات التركية وتأمل القصور المضاءة.",
    narrativeAr: "يوم مفعم بالحيوية والأناقة يربط بين إطلالة غلاطة الأسطورية وأجواء تقسيم الحيوية وختام رومانسي على أمواج البوسفور.",
    stops: [
      { titleAr: "برج غلاطة التاريخي والحي الفني", titleEn: "Galata Tower & Quarter", slotAr: "الصباح (10:00)", kind: "viewpoint", lat: 41.0256, lng: 28.9741, visitMinutes: 120, rating: 4.8, detailAr: "أيقونة إسطنبول البانورامية المشيدة بالقرون الوسطى وإطلالات خلابة على مياه البوسفور.", image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800" },
      { titleAr: "شارع الاستقلال وميدان تقسيم", titleEn: "Istiklal Avenue & Taksim Square", slotAr: "الظهيرة (13:30)", kind: "shopping", lat: 41.0370, lng: 28.9850, visitMinutes: 150, rating: 4.7, detailAr: "الشارع التراثي النابض بالحياة والمطاعم العريقة ومحلات الحلوى والبوتيكات الفاخرة.", image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800" },
      { titleAr: "كروز يخت خاص في مضيق البوسفور", titleEn: "Private Bosphorus Sunset Yacht Cruise", slotAr: "المساء (17:30)", kind: "attraction", lat: 41.0392, lng: 29.0003, visitMinutes: 120, rating: 4.9, detailAr: "إبحار يخت VIP خاص بين قارتي آسيا وأوروبا ومشاهدة قصور السلاطين والجسور المعلقة المضاءة.", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800" }
    ]
  },
  {
    day: 3,
    themeAr: "الأسواق التراثية العريقة: البازار الكبير وسوق التوابل المصري والسليمانية",
    themeEn: "Historic Bazaars: Grand Bazaar, Spice Market & Suleymaniye",
    morningAr: "الانطلاق إلى البازار الكبير (جراند بازار) أقدم وأكبر سوق مسقوف في العالم، واستكشاف أروقة الذهب والفضة والجلود والسجاد.",
    afternoonAr: "التجول في سوق التوابل المصري وتذوق الحلقوم التركي الملكي والشاي العطري والزعفران والبهارات النادرة.",
    eveningAr: "زيارة جامع السليمانية المعماري المهيب وتناول الشاي في مقاهي الشرفات المطلة على إسطنبول والقرن الذهبي.",
    narrativeAr: "انغماس في روح التجارة الشرقية العريقة وعبق التوابل وأرقى روائع المهندس المعماري سنان في السليمانية.",
    stops: [
      { titleAr: "البازار الكبير (جراند بازار)", titleEn: "Grand Bazaar Istanbul", slotAr: "الصباح (09:30)", kind: "shopping", lat: 41.0107, lng: 28.9680, visitMinutes: 180, rating: 4.8, detailAr: "متاهة تراثية تضم أكثر من 4000 متجر ومصوغات ذهبية وخزفيات يدوية فريدة.", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" },
      { titleAr: "سوق التوابل المصري (مصر تشارشي)", titleEn: "Egyptian Spice Bazaar", slotAr: "الظهيرة (13:30)", kind: "shopping", lat: 41.0165, lng: 28.9705, visitMinutes: 120, rating: 4.8, detailAr: "سوق النكهات والألوان وأفخر أصناف الحلقوم والمكسرات والزيوت العطرية العثمانية.", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" },
      { titleAr: "جامع السليمانية وإطلالة القرن الذهبي", titleEn: "Süleymaniye Mosque & Terrace", slotAr: "المساء (16:30)", kind: "attraction", lat: 41.0160, lng: 28.9639, visitMinutes: 120, rating: 4.9, detailAr: "شاهقة المعمار العثماني لميمار سنان وحدائقه الغناء المطلة على مسار القرن الذهبي ومضيق البوسفور.", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800" }
    ]
  },
  {
    day: 4,
    themeAr: "إطلالة القرن الذهبي والتراث العثماني: تلة بيير لوتي وأيوب ومينياتورك",
    themeEn: "Golden Horn Heritage: Pierre Loti Hill, Eyup & Miniaturk",
    morningAr: "ركوب التلفريك الهوائي للصعود إلى قمة تلة بيير لوتي وتناول القهوة التركية في المقهى البانورامي الشهير المطل على القرن الذهبي.",
    afternoonAr: "زيارة جامع أيوب سلطان التاريخي وساحته الروحانية العريقة، ثم التوجه إلى حديقة ومتحف مينياتورك المجسمة.",
    eveningAr: "جولة تسوق وترفيه في مجمع فينيسيا أوتليت الإيطالي وقنوات الجندول المائية، ثم العودة للفندق بسيارة المرسيدس.",
    narrativeAr: "رحلة هادئة عبر ضفاف القرن الذهبي تجمع بين إطلالة الشعراء في بيير لوتي والتسوق الترفيهي الممتع.",
    stops: [
      { titleAr: "تلة ومقهى بيير لوتي بالتلفريك", titleEn: "Pierre Loti Hill & Cable Car", slotAr: "الصباح (10:00)", kind: "viewpoint", lat: 41.0543, lng: 28.9340, visitMinutes: 120, rating: 4.8, detailAr: "إطلالة ساحرة على خليج القرن الذهبي تخلد اسم الكاتب الفرنسي بيير لوتي وأجواء استرخاء فريدة.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800" },
      { titleAr: "جامع وميدان أيوب سلطان التاريخي", titleEn: "Eyup Sultan Mosque & Square", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 41.0478, lng: 28.9344, visitMinutes: 90, rating: 4.9, detailAr: "مركز إيماني وتاريخي عميق محاط بالأشجار الباسقة وأسواق الحلوى التقليدية والحمام.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800" },
      { titleAr: "حديقة مينياتورك وفينيسيا مول", titleEn: "Miniaturk & Venezia Mega Outlet", slotAr: "المساء (15:00)", kind: "shopping", lat: 41.0597, lng: 28.9489, visitMinutes: 180, rating: 4.7, detailAr: "معالم تركيا المصغرة بدقة مذهلة يعقبها تسوق فخم وركوب جندول مائي في فينيسيا مول.", image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800" }
    ]
  },
  {
    day: 5,
    themeAr: "إسطنبول الآسيوية الساحرة: كاديكوي وبرج الفتاة وتل العرائس وشارع بغداد",
    themeEn: "Asian Istanbul: Kadikoy, Maiden's Tower, Camlica & Bagdat Ave",
    morningAr: "العبور إلى القارة الآسيوية واستكشاف أزقة كاديكوي الحيوية وحي مودا الفني ومقاهيه المتراصة على بحر مرمرة.",
    afternoonAr: "الوقوف أمام برج الفتاة (كيز كوليسي) في أوسكودار ثم الصعود إلى تل العرائس (تشامليجا) وجامع تشامليجا الأكبر في تركيا.",
    eveningAr: "جولة تسوق راقية في شارع بغداد الفاخر (شامزليزيه إسطنبول) وتناول العشاء في أرقى المطاعم التركية العالمية.",
    narrativeAr: "يوم مخصص بالكامل للجانب الآسيوي من إسطنبول، يجمع بين روعة برج الفتاة، وأعلى قمة بانورامية في تشامليجا، وأرقى شوارع التسوق.",
    stops: [
      { titleAr: "كورنيش كاديكوي وحي مودا الراقي", titleEn: "Kadikoy & Moda Promenade", slotAr: "الصباح (10:00)", kind: "attraction", lat: 40.9880, lng: 29.0270, visitMinutes: 120, rating: 4.8, detailAr: "أجواء شبابية راقية ومخابز تراثية وكورنيش بحري ممتد على بحر مرمرة.", image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800" },
      { titleAr: "برج الفتاة (كيز كوليسي) في أوسكودار", titleEn: "Maiden's Tower (Kiz Kulesi)", slotAr: "الظهيرة (13:00)", kind: "viewpoint", lat: 41.0211, lng: 29.0041, visitMinutes: 90, rating: 4.9, detailAr: "البرج الأسطوري العائم وسط مياه البوسفور المشيد منذ العهد البيزنطي وقصصه الرومانسية.", image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800" },
      { titleAr: "تل العرائس (تشامليجا) وشارع بغداد", titleEn: "Camlica Hill & Bagdat Avenue", slotAr: "المساء (15:30)", kind: "shopping", lat: 41.0275, lng: 29.0678, visitMinutes: 180, rating: 4.9, detailAr: "أعلى إطلالة بانورامية كاشفة لكامل إسطنبول تليها جولة تسوق ملكية في أرقى شوارع آسيا.", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800" }
    ]
  },
  {
    day: 6,
    themeAr: "أحياء البوسفور الفارهة: أورتاكوي وبيبيك وقلعة روملي حصار وحديقة أميرجان",
    themeEn: "Bosphorus Riviera: Ortakoy, Bebek, Rumeli Fortress & Emirgan",
    morningAr: "زيارة ساحة وجامع أورتاكوي الأيقوني الملاصق للماء تحت جسر البوسفور وتذوق الوافل والكومبير المشهور.",
    afternoonAr: "التنزه بمحاذاة يخوت حي بيبيك الفاخر، ثم زيارة قلعة روملي حصار الشامخة المشيدة لفتح القسطنطينية.",
    eveningAr: "جولة في حديقة أميرجان المكسوة بالزهور والأشجار المعمرة وتناول العشاء بمطعم فاخر على ضفاف البوسفور.",
    narrativeAr: "يوم النخبة بمحاذاة الشاطئ الأوروبي للبوسفور بين معمار الباروك في أورتاكوي وحصون الفاتح في روملي حصار.",
    stops: [
      { titleAr: "ساحة وجامع أورتاكوي تحت جسر البوسفور", titleEn: "Ortakoy Mosque & Waterfront Square", slotAr: "الصباح (10:00)", kind: "attraction", lat: 41.0472, lng: 29.0268, visitMinutes: 120, rating: 4.8, detailAr: "أشهر خلفية تصوير في إسطنبول حيث يلتقي جامع أورتاكوي الرخامي مع جسر البوسفور الشاهق.", image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800" },
      { titleAr: "كورنيش بيبيك وقلعة روملي حصار", titleEn: "Bebek Waterfront & Rumeli Fortress", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 41.0850, lng: 29.0570, visitMinutes: 150, rating: 4.9, detailAr: "أرقى أحياء إسطنبول البحرية وزيارة القلعة الحربية العظيمة المشيدة بأمر السلطان محمد الفاتح.", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800" },
      { titleAr: "حديقة أميرجان ومطاعم البوسفور الراقية", titleEn: "Emirgan Park & Luxury Waterfront Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 41.1070, lng: 29.0550, visitMinutes: 150, rating: 4.8, detailAr: "واحة طبيعية غناء تضم قصور خديوية وشلالات مائية تليها وجبة بحرية راقية بإطلالة بوسفورية.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" }
    ]
  },
  {
    day: 7,
    themeAr: "رحلة يوم كامل إلى بورصة الخضراء: تلفريك أولوداغ والشجرة المعمرة",
    themeEn: "Full Day Bursa: Mount Uludag Cable Car & Historical Tree",
    morningAr: "الانطلاق صباحاً بالسيارة الخاصة نحو ميناء العبارة البحرية السريعة والعبور إلى بورصة الخضراء أول عواصم العثمانيين.",
    afternoonAr: "الصعود في تلفريك جبل أولوداغ أطول تلفريك بالعالم والاستمتاع بالقمم الجبلية، وزيارة الشجرة المعمرة ذات الـ 600 عام.",
    eveningAr: "تناول وجبة إسكندر كباب الأصلية في موطنها التاريخي وزيارة السوق المسقوف ومصانع الحلقوم ثم العودة لإسطنبول.",
    narrativeAr: "رحلة جبلية طبيعية استثنائية متكاملة تنقلك من صخب إسطنبول إلى قمم أولوداغ الخضراء وهوائها العليل.",
    stops: [
      { titleAr: "تلفريك جبل أولوداغ الشاهق", titleEn: "Mount Uludag Cable Car (Teleferik)", slotAr: "الصباح (10:30)", kind: "attraction", lat: 40.1000, lng: 29.1300, visitMinutes: 180, rating: 4.9, detailAr: "تجربة صعود هوائية خيالية بطول 9 كم فوق غابات الصنوبر وصولاً لمحطة الجبل الباردة.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" },
      { titleAr: "الشجرة المعمرة التاريخية وشلال بورصة", titleEn: "Inkaya Historical Plane Tree & Waterfall", slotAr: "الظهيرة (14:00)", kind: "attraction", lat: 40.1885, lng: 29.0610, visitMinutes: 120, rating: 4.8, detailAr: "شجرة عملاقة تاريخية عمرها أكثر من 6 قرون ومقاهي جبلية تقدم الفواكه الطازجة والشاي.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800" },
      { titleAr: "مطعم كباب إسكندر بورصة الأصلي والأسواق", titleEn: "Authentic Bursa Iskender Dining & Bazaar", slotAr: "المساء (16:30)", kind: "restaurant", lat: 40.1820, lng: 29.0660, visitMinutes: 150, rating: 4.9, detailAr: "تذوق الطبق الأيقوني مع الزبدة المذابة وزيارة خان الحرير والجامع الأخضر.", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" }
    ]
  },

  {
    day: 8,
    themeAr: "رحلة يوم كامل إلى بحيرة سبانجا وشلالات المعشوقية وقرية المحمودية",
    themeEn: "Full Day Sapanca: Lake, Masukiye Waterfalls & Mahmudiye",
    morningAr: "التوجه شرقاً بسيارة المرسيدس الخاصة إلى بحيرة سبانجا الساحرة والمشي على كورنيش البحيرة واستئجار قوارب التجديف.",
    afternoonAr: "الانتقال إلى شلالات وغابات المعشوقية واستكشاف الأنهار الجبلية وممارسة الأنشطة الترفيهية (زيپ لاين وموتورات السفاري ATV).",
    eveningAr: "تناول وجبة غداء ريفية في مطاعم المحمودية فوق شلالات المياه المتدفقة وتجربة سمك السلمون النهري الطازج قبل العودة لإسطنبول.",
    narrativeAr: "يوم كامل في أحضان الطبيعة الريفية الغناء بين زرقة بحيرة سبانجا وخضرة شلالات المعشوقية والمحمودية.",
    stops: [
      { titleAr: "بحيرة سبانجا وكورنيش الطبيعة", titleEn: "Sapanca Lake Waterfront Promenade", slotAr: "الصباح (10:00)", kind: "attraction", lat: 40.6900, lng: 30.2700, visitMinutes: 150, rating: 4.8, detailAr: "بحيرة عذبة محاطة بالجبال وغابات الكستناء ومسارات للمشي والدراجات الهوائية.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800" },
      { titleAr: "شلالات وغابات المعشوقية الجبلية", titleEn: "Masukiye Waterfalls & Nature Park", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 40.7050, lng: 30.2100, visitMinutes: 150, rating: 4.8, detailAr: "ينابيع مياه عذبة تنحدر من قمم الجبال ومسارات مشي غابية معلقة.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800" },
      { titleAr: "قرية المحمودية الريفية وجبل كارتبه", titleEn: "Mahmudiye Village & Kartepe Mountain", slotAr: "المساء (16:00)", kind: "restaurant", lat: 40.6600, lng: 30.1500, visitMinutes: 150, rating: 4.9, detailAr: "جلسات مائية معلقة فوق الجداول وتناول أشهى الوجبات الريفية التركية في أحضان الهدوء التام.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" }
    ]
  },
  {
    day: 9,
    themeAr: "إسطنبول الحديثة والترفيه الغربي: بحيرة بيوك تشكمجه ومتحف الشوكولاتة وأكوا فلوريا",
    themeEn: "West Istanbul: Buyukcekmece Lake, Chocolate Museum & Aqua Florya",
    morningAr: "جولة صباحية مريحة في منطقة بيوك تشكمجه ومشاهدة بحيرتها الواسعة وجسر السلطان سليمان القانوني التاريخي والساحل الهادئ.",
    afternoonAr: "زيارة متحف الشوكولاتة الشهير (Pelit Çikolata Müzesi) في إسنيورت ومشاهدة معالم إسطنبول وشخصياتها المنحوتة بالشوكولاتة.",
    eveningAr: "التوجه إلى مجمع أكوا فلوريا وزيارة إسطنبول أكواريوم (أضخم حديقة مائية حيوانية) والعشاء على كورنيش فلوريا البحري.",
    narrativeAr: "يوم ترفيهي متكامل في النطاق الغربي المتجانس جغرافياً يجمع بين بحيرة بيوك تشكمجه ومتحف الشوكولاتة وأكواريوم فلوريا العالمي.",
    stops: [
      { titleAr: "بحيرة بيوك تشكمجه وجسر سليمان القانوني", titleEn: "Buyukcekmece Lake & Historic Bridge", slotAr: "الصباح (10:00)", kind: "viewpoint", lat: 41.0180, lng: 28.5830, visitMinutes: 120, rating: 4.8, detailAr: "بحيرة ساحلية واسعة وكورنيش هادئ وجسر عثماني حجري فريد شيده المعماري سنان.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" },
      { titleAr: "متحف الشوكولاتة الشهير (Pelit Müzesi)", titleEn: "Pelit Chocolate Museum", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 41.0667, lng: 28.6690, visitMinutes: 120, rating: 4.8, detailAr: "عالم من الشوكولاتة الخالصة يضم مجسمات آيا صوفيا وبرج غلاطة وشلالات الشوكولاتة الدافئة.", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" },
      { titleAr: "مجمع أكوا فلوريا وأكواريوم إسطنبول المائي", titleEn: "Aqua Florya Mall & Istanbul Akvaryum", slotAr: "المساء (15:30)", kind: "shopping", lat: 40.9650, lng: 28.7980, visitMinutes: 180, rating: 4.9, detailAr: "أضخم أكواريوم يضم 17 ألف كائن بحري وتجربة غابات الأمازون ومول فاخر مفتوح على البحر.", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800" }
    ]
  },
  {
    day: 10,
    themeAr: "جزر الأميرات وسحر بحر مرمرة: بيوك أضا وقصور الخشب الفيكتورية",
    themeEn: "Princes' Islands: Buyukada, Victorian Mansions & Pine Forests",
    morningAr: "ركوب السفينة السريعة VIP نحو جزيرة بيوك أضا أكبر جزر الأميرات، والاستمتاع بنسيم البحر الصافي وإطعام طيور النورس.",
    afternoonAr: "جولة ممتعة بالسيارات الكهربائية الصديقة للبيئة بين القصور التاريخية الفخمة وغابات الصنوبر المعطرة.",
    eveningAr: "تناول وجبة غداء بحرية بمطاعم الميناء التاريخي على الجزيرة، وشراء تذكارات الجزيرة قبل العودة إلى إسطنبول.",
    narrativeAr: "ملاذ هادئ خالٍ من السيارات في جزيرة بيوك أضا ينقلك إلى أجواء القرن التاسع عشر والقصور الملكية المعزولة.",
    stops: [
      { titleAr: "الإبحار إلى جزيرة بيوك أضا", titleEn: "Ferry Cruise to Buyukada Island", slotAr: "الصباح (09:30)", kind: "attraction", lat: 40.8750, lng: 29.1270, visitMinutes: 120, rating: 4.8, detailAr: "رحلة بحرية رائعة في مياه بحر مرمرة مع إطلالات بانورامية على شواطئ إسطنبول وجزرها.", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800" },
      { titleAr: "جولة القصور الفيكتورية وغابات الصنوبر", titleEn: "Victorian Mansions Tour & Pine Forest", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 40.8650, lng: 29.1250, visitMinutes: 150, rating: 4.9, detailAr: "بيوت وقصور خشبية عريقة تعود لنبلاء القرن التاسع عشر ومسارات طبيعية هادئة.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800" },
      { titleAr: "ميناء الجزيرة وتناول المأكولات البحرية", titleEn: "Buyukada Pier Seafood Dining", slotAr: "المساء (15:30)", kind: "restaurant", lat: 40.8540, lng: 29.1180, visitMinutes: 150, rating: 4.8, detailAr: "جلسة راقية على رصيف الميناء القديم وتذوق الأسماك الطازجة والآيس كريم الجزائري التراثي.", image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800" }
    ]
  },
  {
    day: 11,
    themeAr: "الفخامة والتسوق الملكي وسهرة وداع البوسفور: وادي إسطنبول وزورلو",
    themeEn: "Luxury Shopping & Grand Bosphorus Soiree: Vadi & Zorlu",
    morningAr: "زيارة مجمع وادي إسطنبول الراقي (Vadi Istanbul) والتنقل بالتلفريك المعلق واستكشاف شوارع التسوق المفتوحة.",
    afternoonAr: "التوجه إلى مجمع زورلو سنتر (Zorlu Center) أشهر مراكز الماركات العالمية ومركز الفنون الأدائية.",
    eveningAr: "سهرة عشاء ملكية فاخرة في مطعم نصرت بوسفور أو مطعم نيفيزاده التاريخي وتأمل أضواء المدينة الساحرة.",
    narrativeAr: "يوم يجمع بين أرقى وجهات الموضة العالمية والحداثة المعمارية مع سهرة ختامية ساحرة على ضفاف البوسفور.",
    stops: [
      { titleAr: "مجمع وادي إسطنبول الراقي", titleEn: "Vadi Istanbul Luxury Mall", slotAr: "الصباح (10:30)", kind: "shopping", lat: 41.1070, lng: 28.9880, visitMinutes: 150, rating: 4.9, detailAr: "وجهة التسوق الحديثة الأرقى بإسطنبول مع مسارات مشي مفتوحة ونافورة موسيقية عملاقة.", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800" },
      { titleAr: "مجمع زورلو سنتر الفاخر (Zorlu Center)", titleEn: "Zorlu Center Luxury Shopping", slotAr: "الظهيرة (14:00)", kind: "shopping", lat: 41.0670, lng: 29.0170, visitMinutes: 150, rating: 4.8, detailAr: "أضخم تجمع لماركات الأزياء العالمية الراقية والمطاعم الذواقة الحاصلة على تقييمات دولية.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800" },
      { titleAr: "سهرة عشاء فاخرة على البوسفور", titleEn: "Grand Bosphorus Luxury Dinner", slotAr: "المساء (17:30)", kind: "restaurant", lat: 41.0420, lng: 29.0080, visitMinutes: 180, rating: 4.9, detailAr: "جلسة عشاء خاصة بأرقى مطاعم البوسفور وتذوق أطباق اللحوم والمقبلات التركية العالمية.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 12,
    themeAr: "الاستجمام في ينابيع يلوا الكبريتية وشلال سودوشان",
    themeEn: "Yalova Thermal Wellness & Sudusen Waterfall",
    morningAr: "الانطلاق بالسيارة والعبارة السريعة إلى منتجعات ترمال يلوا الصحية الشهيرة بالمياه المعدنية الدافئة.",
    afternoonAr: "جلسات سبا ومساج استشفائي في حمامات يلوا الطبيعية وزيارة شلال سودوشان الجبلي الخلاب.",
    eveningAr: "تناول وجبة غداء ريفية في الطبيعة ثم العودة إلى إسطنبول بالسيارة الفاخرة للاستراحة بالفندق.",
    narrativeAr: "يوم استجمام صحي استثنائي يجدد النشاط بين ينابيع المياه الكبريتية الطبيعية وشلالات يلوا.",
    stops: [
      { titleAr: "منتجع ترمال يلوا الصحي", titleEn: "Yalova Thermal Springs & Spa", slotAr: "الصباح (10:30)", kind: "attraction", lat: 40.6050, lng: 29.1750, visitMinutes: 180, rating: 4.8, detailAr: "حمامات مياه كبريتية استشفائية تعود للعهد الروماني والعثماني وسط حدائق غناء.", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800" },
      { titleAr: "شلال سودوشان الطبيعي", titleEn: "Sudusen Waterfall Yalova", slotAr: "الظهيرة (14:30)", kind: "attraction", lat: 40.6300, lng: 29.1100, visitMinutes: 120, rating: 4.7, detailAr: "شلال جبلي منحدر وسط الغابات الكثيفة ومسارات للمشي والاسترخاء.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800" },
      { titleAr: "مطعم ريفي على ضفاف بحيرة يلوا", titleEn: "Yalova Countryside Dining", slotAr: "المساء (17:00)", kind: "restaurant", lat: 40.6550, lng: 29.2780, visitMinutes: 120, rating: 4.8, detailAr: "تناول المشويات التركية الطازجة والسلطات الجبلية في أجواء ريفية هادئة.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" }
    ]
  },
  {
    day: 13,
    themeAr: "الطبيعة العذراء وغابات بلغراد وشواطئ كيليوس",
    themeEn: "Belgrad Forest Nature & Kilyos Black Sea Coast",
    morningAr: "استنشاق الهواء النقي في غابات بلغراد المحمية الطبيعية الكبرى في إسطنبول والمشي حول البحيرات الطبيعية.",
    afternoonAr: "زيارة حديقة أتاتورك الشجرية (Arboretum) والتقاط أروع الصور التذكارية بين الأشجار النادرة.",
    eveningAr: "التوجه إلى شاطئ كيليوس على البحر الأسود وتناول وجبة سمك طازجة بمطعم شاطئي راقٍ.",
    narrativeAr: "هروب إلى أحضان الطبيعة البكر في شمال إسطنبول بين ظلال غابات بلغراد ونسيم البحر الأسود.",
    stops: [
      { titleAr: "محمية غابات بلغراد الطبيعية", titleEn: "Belgrad Forest Nature Reserve", slotAr: "الصباح (10:00)", kind: "attraction", lat: 41.1960, lng: 28.9870, visitMinutes: 150, rating: 4.8, detailAr: "رئة إسطنبول الخضراء ومحمية طبيعية ساحرة تضم بحيرات عذبة ومسارات مشي ممتدة.", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800" },
      { titleAr: "حديقة أتاتورك الشجرية (أتاتورك أربوريتوم)", titleEn: "Ataturk Arboretum Botanical Garden", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 41.1780, lng: 28.9830, visitMinutes: 120, rating: 4.9, detailAr: "متحف حي للأشجار النادرة والبحيرات الساحرة يمثل إحدى أجمل البقع للتصوير بإسطنبول.", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800" },
      { titleAr: "ساحل وشاطئ كيليوس على البحر الأسود", titleEn: "Kilyos Black Sea Coast & Seafood", slotAr: "المساء (16:30)", kind: "restaurant", lat: 41.2500, lng: 29.0330, visitMinutes: 150, rating: 4.7, detailAr: "نسيم البحر الأسود المنعش وتناول وجبة عشاء بحرية فاخرة في مطاعم الساحل الشمالي.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" }
    ]
  },
  {
    day: 14,
    themeAr: "الأحياء التاريخية العريقة: الفاتح ومسجد كاريه وتراث بلاط ومطاعم الحلبسة",
    themeEn: "Historic Quarters: Fatih, Chora Mosque, Balat & Egyptian Spice Market",
    morningAr: "زيارة جامع السلطان محمد الفاتح العريق والتجول في أزقة حي الفاتح التراثية والاستمتاع بعبق التاريخ.",
    afternoonAr: "استكشاف ألوان حي بلاط وفنر التاريخي بمبانيه الملونة الشهيرة وزيارة جامع كاريه (كنيسة شورا السابقة) بنقوشه الفسيفسائية النادرة.",
    eveningAr: "زيارة خان فاليدي وسوق الحرفيين وتناول وجبة عشاء عثمانية أصيلة بأحد مطاعم الفاتح الشهيرة.",
    narrativeAr: "انغماس في الروح التاريخية الأصيلة لمدينة إسطنبول العتيقة بين معالم الفاتح وألوان بلاط الساحرة.",
    stops: [
      { titleAr: "جامع السلطان محمد الفاتح التاريخي", titleEn: "Fatih Mosque & Historic Quarter", slotAr: "الصباح (10:00)", kind: "attraction", lat: 41.0195, lng: 28.9498, visitMinutes: 120, rating: 4.9, detailAr: "أحد أعظم مجمعات العمارة العثمانية يضم ضريح الفاتح ومكتبة عريقة وساحات رخامية رحبة.", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800" },
      { titleAr: "حي بلاط التاريخي الملون وجامع كاريه", titleEn: "Colorful Balat & Chora Mosque", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 41.0310, lng: 28.9480, visitMinutes: 150, rating: 4.8, detailAr: "أزقة مرصوفة وبيوت ملونة ساحرة ومقاهي فنية فريدة تعكس التنوع التاريخي لإسطنبول.", image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800" },
      { titleAr: "مطعم تراثي عثماني بحي الفاتح", titleEn: "Authentic Ottoman Culinary House", slotAr: "المساء (16:30)", kind: "restaurant", lat: 41.0180, lng: 28.9450, visitMinutes: 120, rating: 4.9, detailAr: "تذوق أطباق القصور العثمانية والشوربات التراثية وحلوى البقلاوة المجهزة بالطريقة الأصلية.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 15,
    themeAr: "يوم التسوق التوديعي وتوديع المطار بمرسيدس فيتو VIP",
    themeEn: "Grand Farewell Shopping & VIP Airport Transfer",
    morningAr: "جولة تسوق أخيرة حرة في أسواق ومتاجر إسطنبول لاقتناء الهدايا التذكارية والحلويات والقهوة التركية.",
    afternoonAr: "جلسة شاي وقهوة أخيرة في مقهى مطل على مضيق البوسفور وتأمل الذكريات الجميلة للرحلة.",
    eveningAr: "توديع الفندق ومساعدة الأمتعة والانتقال بسيارة مرسيدس فيتو VIP إلى المطار الدولي مع أطيب التمنيات برحلة عودة سالمة.",
    narrativeAr: "ختام رحلة العمر بإسطنبول بتسوق الهدايا الفاخرة ووداع البوسفور ونقل رسمي ومريح إلى المطار.",
    stops: [
      { titleAr: "جولة تسوق حرة واقتناء التذكارات والحلويات", titleEn: "Istanbul Farewell Souvenir Shopping", slotAr: "الصباح (10:00)", kind: "shopping", lat: 41.0110, lng: 28.9700, visitMinutes: 150, rating: 4.8, detailAr: "اقتناء أجود أنواع البقلاوة التركية الفاخرة والحلقوم والقهوة العثمانية الأصلية.", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" },
      { titleAr: "استراحة شاي أخيرة مطلة على البوسفور", titleEn: "Farewell Bosphorus Tea Lounge", slotAr: "الظهيرة (13:30)", kind: "restaurant", lat: 41.0250, lng: 28.9750, visitMinutes: 90, rating: 4.8, detailAr: "إطلالة وداعية ساحرة على زرقة البوسفور ومآذن إسطنبول مع كوب شاي تركي تقليدي.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800" },
      { titleAr: "توديع المطار بسيارة مرسيدس فيتو VIP", titleEn: "VIP Airport Meet & Transfer Departure", slotAr: "المساء (16:30)", kind: "attraction", lat: 41.2750, lng: 28.7519, visitMinutes: 90, rating: 4.9, detailAr: "خدمة نقل مريحة وفخمة بسيارة مرسيدس فيتو VIP مع سائق خاص حتى بوابة المغادرة بالمطار.", image: "/images/cars/mercedes-vito-vip.jpg" }
    ]
  }
];

export const MARRAKECH_ICONIC_DAYS: GeminiDayRaw[] = [
  {
    day: 1,
    themeAr: "الاستقبال الملكي في مراكش وسحر ساحة جامع الفنا",
    themeEn: "Royal Arrival in Marrakech & Jemaa el-Fnaa Magic",
    morningAr: "الاستقبال الرسمي في مطار مراكش المنارة والانتقال بسيارة مرسيدس فيتو VIP إلى مقر الإقامة الفاخر مع استراحة ترحيبية بالشاي المغربي الأصيل.",
    afternoonAr: "جولة أولى استكشافية في محيط أسواق المدينة وتناول الغداء في مطعم تراثي مغربي عريق.",
    eveningAr: "أمسية ساحرة في ساحة جامع الفنا التاريخية والاستمتاع بعروض الفلكلور وإطلالة الغروب من شرفة مقهى بانورامي مع عشاء مغربي فاخر.",
    narrativeAr: "انطلاقة ملكية تبدأ من مطار المنارة ثم الغوص في نبض مراكش العريق بساحة جامع الفنا وقت الغروب.",
    stops: [
      { titleAr: "الاستقبال الرسمي بمطار مراكش المنارة", titleEn: "Marrakech Menara VIP Airport Welcome", slotAr: "الصباح (10:00)", kind: "attraction", lat: 31.6069, lng: -8.0363, visitMinutes: 60, rating: 4.9, detailAr: "استقبال خاص وسلس ونقل بحقائب السفر في سيارة مرسيدس فيتو VIP مكيفة.", image: "/images/cars/mercedes-vito-vip.jpg" },
      { titleAr: "ساحة جامع الفنا ومقاهي التراث", titleEn: "Jemaa el-Fnaa Historic Square", slotAr: "الظهيرة (14:00)", kind: "attraction", lat: 31.6258, lng: -7.9891, visitMinutes: 120, rating: 4.9, detailAr: "التراث الشفهي الإنساني وموسيقى كناوة وعروض الحكواتيين وتذوق العصائر الطازجة.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800" },
      { titleAr: "مطعم وتراس بانورامي بالمدينة العتيقة", titleEn: "Rooftop Medina Fine Dining", slotAr: "المساء (17:30)", kind: "restaurant", lat: 31.6265, lng: -7.9880, visitMinutes: 120, rating: 4.8, detailAr: "تناول طاجين اللحم بالبرقوق والكسكس المغربي الفاخر مع إطلالة على مئذنة الكتبية وأضواء الساحة.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 2,
    themeAr: "عبق الحضارة الأندلسية: قصر الباهية ومقابر السعديين",
    themeEn: "Andalusian Splendor: Bahia Palace & Saadian Tombs",
    morningAr: "زيارة قصر الباهية والتعرف على روائع الزليج الفاسي المنقوش والحدائق الأندلسية العطرة بالياسمين والبرتقال.",
    afternoonAr: "استكشاف مقابر السعديين التاريخية وقاعة الأعمدة الاثني عشر المصنوعة من رخام كارارا الإيطالي.",
    eveningAr: "جولة في أروقة قصر البديع الشامخ والتقاط صور الغروب فوق أسواره التاريخية ثم العودة للفندق.",
    narrativeAr: "يوم يفيض بالجمال المعماري الأندلسي والقصور الملكية التاريخية التي تجسد العصر الذهبي للمغرب.",
    stops: [
      { titleAr: "قصر الباهية الملكي", titleEn: "Bahia Palace & Courtyards", slotAr: "الصباح (09:30)", kind: "attraction", lat: 31.6217, lng: -7.9825, visitMinutes: 120, rating: 4.9, detailAr: "تحفة الزخارف الخشبية المنقوشة والفسيفساء الأندلسية والرياض الملكي الفسيح.", image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800" },
      { titleAr: "قبور السعديين التاريخية", titleEn: "Saadian Tombs Mausoleum", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 31.6172, lng: -7.9889, visitMinutes: 90, rating: 4.8, detailAr: "أضرحة السلاطين السعديين المحفوفة بأعمدة الرخام الصافي والمقرنصات المذهبة النادرة.", image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800" },
      { titleAr: "قصر البديع التاريخي", titleEn: "El Badi Palace & Ramparts", slotAr: "المساء (15:30)", kind: "attraction", lat: 31.6183, lng: -7.9858, visitMinutes: 100, rating: 4.8, detailAr: "بقايا القصر السعدي الأعظم وإطلالة مرتفعة على أعشاش اللقالق وأفق مدينة مراكش الحمراء.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800" }
    ]
  },
  {
    day: 3,
    themeAr: "واحة الألوان والفن: حدائق ماجوريل ومتحف إيف سان لوران",
    themeEn: "Cobalt Blue Oasis: Jardin Majorelle & YSL Museum",
    morningAr: "زيارة حدائق ماجوريل الشهيرة بلونها الأزرق الكوبالتي ونباتات الصبار النادرة من مختلف قارات العالم.",
    afternoonAr: "استكشاف متحف إيف سان لوران للأزياء العالمية وتناول القهوة في المقهى الباريسي الهادئ بالحديقة.",
    eveningAr: "زيارة صومعة جامع الكتبية الشامخة وجولة في حدائق الورود المحيطة بها مع عشاء هادئ.",
    narrativeAr: "رحلة ملهمة بين الطبيعة الساحرة وأزياء المصمم العالمي سان لوران وأعرق مآذن العالم الإسلامي.",
    stops: [
      { titleAr: "حدائق ماجوريل النباتية", titleEn: "Jardin Majorelle", slotAr: "الصباح (09:30)", kind: "attraction", lat: 31.6417, lng: -8.0028, visitMinutes: 120, rating: 4.9, detailAr: "الفيلا الزرقاء الأيقونية وأحواض زنابق الماء والنباتات النادرة التي رسمها جاك ماجوريل.", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800" },
      { titleAr: "متحف إيف سان لوران (mYSLm)", titleEn: "Yves Saint Laurent Museum", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 31.6425, lng: -8.0035, visitMinutes: 90, rating: 4.8, detailAr: "معرض دائم لأشهر تصاميم الأزياء الراقية وقطع الإكسسوارات المستوحاة من مراكش.", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800" },
      { titleAr: "صومعة جامع الكتبية وحدائقها", titleEn: "Koutoubia Minaret & Gardens", slotAr: "المساء (16:00)", kind: "attraction", lat: 31.6238, lng: -7.9936, visitMinutes: 90, rating: 4.9, detailAr: "المئذنة الموحدية التي ألهمت بناء الخيرالدا بإشبيلية وحدائق النخيل والورود المعطرة.", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800" }
    ]
  },
  {
    day: 4,
    themeAr: "طبيعة جبال الأطلس وشلالات وادي أوريكا العذبة",
    themeEn: "Atlas Mountain Escapade & Ourika Valley Waterfalls",
    morningAr: "الانطلاق بسيارة خاصة نحو سلسلة جبال الأطلس الكبير وزيارة قرى الأمازيغ الحجرية على سفوح الجبال.",
    afternoonAr: "الوصول إلى وادي أوريكا الخلاب والمشي الخفيف نحو شلالات سيتي فاطمة وتناول الغداء على مجرى النهر.",
    eveningAr: "العودة عصراً إلى مراكش مع التوقف في تعاونية لإنتاج زيت الأركان الطبيعي النقي وسهرة عشاء مريحة.",
    narrativeAr: "يوم مخصص للطبيعة الجبلية الخلابة والهواء النقي وجلسات المطاعم المائية التقليدية في وادي أوريكا.",
    stops: [
      { titleAr: "جولة جبال الأطلس وقرى ستي فاطمة", titleEn: "Atlas Mountains Scenic Route & Setti Fatma", slotAr: "الصباح (09:00)", kind: "attraction", lat: 31.2260, lng: -7.6740, visitMinutes: 180, rating: 4.9, detailAr: "مناظر بانورامية لقمم الأطلس المغطاة بالثلوج شتاءً والخضار صيفاً والجسور الخشبية المعلقة.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" },
      { titleAr: "مطاعم مجرى نهر وادي أوريكا", titleEn: "Ourika Riverside Dining", slotAr: "الظهيرة (13:30)", kind: "restaurant", lat: 31.2500, lng: -7.7000, visitMinutes: 120, rating: 4.8, detailAr: "تناول طاجين البربر التقليدي على مقاعد خشبية موضوعة مباشرة في مياه النهر العذبة والباردة.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" },
      { titleAr: "تعاونية زيت الأركان الملكية", titleEn: "Traditional Argan Oil Co-op", slotAr: "المساء (16:30)", kind: "shopping", lat: 31.3500, lng: -7.8000, visitMinutes: 60, rating: 4.8, detailAr: "الاطلاع على طريقة استخراج زيت الأركان المغربي النادر واقتناء منتجات التجميل الطبيعية الفاخرة.", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" }
    ]
  },
  {
    day: 5,
    themeAr: "مغامرة وسحر صحراء أغافاي الكلسية وسهرة النجوم",
    themeEn: "Agafay Desert Luxury Camp & Stargazing Dinner",
    morningAr: "صباح حر هادئ للاسترخاء في المسبح والحدائق ثم الانطلاق بسيارة الدفع الرباعي إلى صحراء أغافاي الحجرية.",
    afternoonAr: "الوصول إلى المخيم الصحراوي الملكي وتجربة ركوب الجمال بالزي الصحراوي وجولة دبابات الكواد المثيرة.",
    eveningAr: "مشاهدة غروب الشمس المذهل فوق التلال الكلسية وعشاء رومانسي فاخر تحت السماء المرصعة بالنجوم مع عروض النار.",
    narrativeAr: "تجربة صحراوية لا تُنسى تمزج بين إثارة المغامرة وفخامة المخيمات الملكية وسحر الضيافة البدوية.",
    stops: [
      { titleAr: "مخيم صحراء أغافاي الملكي الفاخر", titleEn: "Agafay Luxury Desert Camp", slotAr: "الظهيرة (14:30)", kind: "viewpoint", lat: 31.4667, lng: -8.1833, visitMinutes: 180, rating: 4.9, detailAr: "استقبال بالتمور والحليب وجلسات استرخاء بدوية فاخرة تطل على أفق الصحراء الحجرية الممتدة.", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800" },
      { titleAr: "جولة ركوب الجمال ودبابات الكواد عند الغروب", titleEn: "Sunset Camel Trek & Quad Safari", slotAr: "المساء (17:00)", kind: "attraction", lat: 31.4700, lng: -8.1900, visitMinutes: 120, rating: 4.9, detailAr: "رحلة على ظهور الجمال باللباس المغربي الصحراوي التقليدي والتقاط صور الغروب الذهبية.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800" },
      { titleAr: "عشاء ملكي تحت النجوم وموسيقى كناوة", titleEn: "Candlelit Stargazing Dinner & Gnawa Music", slotAr: "المساء (19:30)", kind: "restaurant", lat: 31.4650, lng: -8.1800, visitMinutes: 150, rating: 4.9, detailAr: "أشهى المشويات والأطباق المغربية حول موقد النار على ألحان الموسيقى التراثية وأضواء الشموع.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800" }
    ]
  },
  {
    day: 6,
    themeAr: "كنوز المدينة العتيقة: مدرسة بن يوسف وأسواق الحرفيين",
    themeEn: "Medina Hidden Gems: Ben Youssef Madrasa & Souks",
    morningAr: "زيارة مدرسة بن يوسف الإسلامية التاريخية، أعظم صرح تعليمي بالغرب الإسلامي ونقوشها الجصية المذهلة.",
    afternoonAr: "جولة تسوق متعمقة في أسواق مراكش العتيقة (سوق السمارين، سوق الصباغين، وسوق النحاسين).",
    eveningAr: "استراحة شاي في مقهى الباشا التاريخي الشهير واقتناء السجاد البربري والمنتجات الجلدية.",
    narrativeAr: "انغماس في قلب الروح التقليدية لمراكش واقتناء أروع التحف الحرفية النادرة من أيدي صناعها المهرة.",
    stops: [
      { titleAr: "مدرسة بن يوسف التاريخية", titleEn: "Ben Youssef Islamic Madrasa", slotAr: "الصباح (09:30)", kind: "attraction", lat: 31.6319, lng: -7.9864, visitMinutes: 120, rating: 4.9, detailAr: "أعرق معالم العمارة المرينية بمقرنصات الأرز والباحة الرخامية وبركة الوضوء المركزية البديعة.", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800" },
      { titleAr: "أسواق الصباغين وسوق السمارين", titleEn: "Souk des Teinturiers & Semmarine Souks", slotAr: "الظهيرة (12:30)", kind: "shopping", lat: 31.6290, lng: -7.9875, visitMinutes: 150, rating: 4.8, detailAr: "مشاهدة صوف الغزل الملون المعلق في أزقة السوق وتفاوض ممتع لاقتناء التحف والتذكارات.", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" },
      { titleAr: "مقهى ومتحف دار الباشا الفاخر", titleEn: "Bacha Coffee House & Dar El Bacha", slotAr: "المساء (16:00)", kind: "cafe", lat: 31.6335, lng: -7.9920, visitMinutes: 90, rating: 4.9, detailAr: "تذوق أرقى أنواع البن العالمي بأجواء قصر الباشا التهامي الكلاوي الرخامية الملكية الفخمة.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800" }
    ]
  },
  {
    day: 7,
    themeAr: "الاسترخاء في واحات المنارة والحمام المغربي الملكي",
    themeEn: "Menara Gardens & Royal Moroccan Hamam Experience",
    morningAr: "جولة صباحية هادئة في حدائق المنارة وبساتين الزيتون المعمرة مع إطلالة الجناح السعدي على مياه الصهريج والجبال.",
    afternoonAr: "جلسة تدليك وحمام مغربي ملكي بالصابون الأسود وزيت الأركان والأعشاب الطبيعية في سبا فاخر 5 نجوم.",
    eveningAr: "جولة بالعربة التراثية (الحنطور) بين أسوار مراكش التاريخية وتناول عشاء هادئ في الحي الحديث جيليز.",
    narrativeAr: "يوم مخصص لاستعادة النشاط والدلال الشخصي عبر تقاليد الحمام المغربي العريق ونزهة حدائق المنارة.",
    stops: [
      { titleAr: "حدائق المنارة وصهريجها التاريخي", titleEn: "Menara Gardens Pavilion & Olive Groves", slotAr: "الصباح (09:30)", kind: "attraction", lat: 31.6131, lng: -8.0211, visitMinutes: 120, rating: 4.8, detailAr: "الصهريج المائي العظيم المشيد منذ عصر الموحدين وانعكاس قمم الأطلس الساحر على سطحه.", image: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800" },
      { titleAr: "الحمام الملكي المغربي والسبا الفاخر", titleEn: "Royal Moroccan Hamam & Wellness Spa", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 31.6250, lng: -7.9950, visitMinutes: 150, rating: 4.9, detailAr: "طقوس استرخاء تقليدية بالبخار المعطر والصابون البلدي وأقنعة الغاسول الملكية والتدليك بالزيوت.", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800" },
      { titleAr: "جولة الحنطور الملكي حول الأسوار الحمراء", titleEn: "Caleche Horse Carriage Ride Around Ramparts", slotAr: "المساء (17:00)", kind: "attraction", lat: 31.6240, lng: -7.9900, visitMinutes: 90, rating: 4.8, detailAr: "رحلة كلاسيكية رومانسية عبر عربات الخيل لاكتشاف أبواب مراكش الـ19 والأسوار الطينية الضخمة.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800" }
    ]
  },
  {
    day: 8,
    themeAr: "رحلة إلى ساحل المحيط الأطلسي ومدينة الصويرة التاريخية",
    themeEn: "Essaouira Atlantic Coastal & Mogador Day Excursion",
    morningAr: "الانطلاق صباحاً بالسيارة الخاصة نحو مدينة الصويرة الأطلسية الساحرة واستكشاف أسوار الميناء وقوارب الصيد الزرقاء.",
    afternoonAr: "تناول وجبة الغداء البحرية الطازجة على شاطئ المحيط وزيارة محلات صناعة خشب العرعر النادر.",
    eveningAr: "العودة مساءً إلى مراكش مع الاستمتاع بنسيم البحر الأطلسي المنعش والاستراحة بالفندق.",
    narrativeAr: "رحلة يوم كامل تجمع بين زرقة المحيط الأطلسي والأسوار البرتغالية التاريخية وألذ المأكولات البحرية.",
    stops: [
      { titleAr: "أسوار وميناء مدينة الصويرة (موكادور)", titleEn: "Essaouira Port & Ramparts (Mogador)", slotAr: "الصباح (10:30)", kind: "attraction", lat: 31.5125, lng: -9.7700, visitMinutes: 150, rating: 4.9, detailAr: "الأسوار الحجرية المطلة على أمواج الأطلس الهادرة ومدافع البرونز القديمة والميناء الصاخب.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" },
      { titleAr: "غداء الأسماك الطازجة على شاطئ الصويرة", titleEn: "Essaouira Fresh Atlantic Seafood Grill", slotAr: "الظهيرة (13:30)", kind: "restaurant", lat: 31.5100, lng: -9.7650, visitMinutes: 120, rating: 4.8, detailAr: "اختيار الأسماك الطازجة المشوية على الفحم وتناولها على إطلالة الشاطئ الذهبي والطيور البحرية.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" },
      { titleAr: "أزقة الفنون ومشاغل خشب العرعر", titleEn: "Thuay Wood Workshops & Art Galleries", slotAr: "المساء (15:30)", kind: "shopping", lat: 31.5130, lng: -9.7680, visitMinutes: 90, rating: 4.8, detailAr: "اقتناء صناديق وطاولات خشب العرعر المعطر المصنوع يدوياً بدقة فائقة وبأشكال هندسية مذهلة.", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" }
    ]
  },
  {
    day: 9,
    themeAr: "مغامرة المنطاد الهوائي والتسوق الفاخر بحي جيليز",
    themeEn: "Sunrise Hot Air Balloon & Gueliz Luxury Shopping",
    morningAr: "انطلاقة فجرية خاصة لخوض مغامرة ركوب المنطاد الهوائي مع شروق الشمس ومشاهدة قمم الأطلس والواحات من علٍ.",
    afternoonAr: "إفطار مغربي فاخر في الخيمة البدوية بعد الهبوط ثم التوجه للحي العصري جيليز لاكتشاف المتاجر العالمية والماركات الراقية.",
    eveningAr: "عشاء رومانسي ختامي في أرقى مطاعم القصور بمراكش مصحوباً بموسيقى العود التراثية الهادئة.",
    narrativeAr: "يوم يجمع بين التحليق في سماء مراكش الذهبية مع الشروق والتسوق العصري وعشاء وداعي فاخر.",
    stops: [
      { titleAr: "مغامرة المنطاد الهوائي عند الشروق", titleEn: "Marrakech Sunrise Hot Air Balloon", slotAr: "الصباح (06:30)", kind: "attraction", lat: 31.7000, lng: -7.9500, visitMinutes: 180, rating: 4.9, detailAr: "التحليق الهادئ فوق قرى البربر وبساتين النخيل مع شروق شمس الصباح على قمم الأطلس الثلجية.", image: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800" },
      { titleAr: "التسوق العصري في حي جيليز وشارع محمد الخامس", titleEn: "Gueliz Modern Shopping Boulevard", slotAr: "الظهيرة (13:00)", kind: "shopping", lat: 31.6350, lng: -8.0150, visitMinutes: 150, rating: 4.8, detailAr: "أرقى بوتيكات الأزياء والمجوهرات والمقاهي الفرنسية العصرية في الحي الحديث لمراكش.", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800" },
      { titleAr: "عشاء فاخر في قصر مغربي ملكي مع العود", titleEn: "Palatial Moroccan Farewell Gala Dinner", slotAr: "المساء (19:30)", kind: "restaurant", lat: 31.6280, lng: -7.9850, visitMinutes: 150, rating: 4.9, detailAr: "تجربة طهي رفيعة من أشهى أطباق الضيافة المغربية وسط أروقة الشموع وزخارف القصور الفخمة.", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" }
    ]
  },
  {
    day: 10,
    themeAr: "يوم التوديع والانتقال بموكب VIP إلى المطار الدولي",
    themeEn: "Farewell Marrakech & VIP Airport Departure",
    morningAr: "تناول الإفطار الملكي الأخير في الرياض والتمتع بأشعة الشمس الصباحية في الفناء الأندلسي الهادئ.",
    afternoonAr: "تسليم الغرف ومساعدة الأمتعة والانتقال بسيارة مرسيدس فيتو VIP إلى مطار مراكش المنارة الدولي.",
    eveningAr: "إنهاء إجراءات السفر والعودة بسلام إلى أرض الوطن مع أروع الذكريات واللحظات التي لا تُنسى.",
    narrativeAr: "ختام رحلة العمر بمراكش الحمراء مع نقل رسمي ومريح بسيارة VIP حتى صالة المغادرة بالمطار.",
    stops: [
      { titleAr: "إفطار ملكي وداعي في الرياض التاريخي", titleEn: "Farewell Royal Riad Breakfast", slotAr: "الصباح (09:30)", kind: "restaurant", lat: 31.6250, lng: -7.9880, visitMinutes: 90, rating: 4.9, detailAr: "فطائر المسمن والبغرير والعسل الحر والشاي بالنعناع في أجواء الهدوء والسكينة الأخيرة بالرياض.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" },
      { titleAr: "توديع ونقل بموكب مرسيدس فيتو VIP للمطار", titleEn: "Mercedes Vito VIP Airport Transfer", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 31.6069, lng: -8.0363, visitMinutes: 90, rating: 4.9, detailAr: "خدمة توصيل مريحة مع مساعدة الحقائب وسائق خاص مرافق حتى بوابة السفر بالمطار الدولي.", image: "/images/cars/mercedes-vito-vip.jpg" }
    ]
  }
];

export const ANTALYA_ICONIC_DAYS: GeminiDayRaw[] = [
  {
    day: 1,
    themeAr: "سحر كاليتشي والتاريخ الروماني: بوابة هادريان والميناء العتيق",
    themeEn: "Kaleiçi Historic Old Town, Hadrian's Gate & Roman Marina",
    morningAr: "زيارة بوابة هادريان الرخامية العظيمة المشيدة عام 130 ميلادي والتجول في أزقة كاليتشي التاريخية المرصوفة بالحصى والمنازل العثمانية الخشبية.",
    afternoonAr: "استكشاف مئذنة يفلي (Yivli Minare) وبرج الساعة العتيق وبرج هيديرليك المطل على البحر، والاستراحة لتناول القهوة التركية والآيس كريم التقليدي.",
    eveningAr: "النزول إلى الميناء الروماني القديم (Kaleiçi Marina) والاستمتاع بمشاهدة اليخوت وتناول عشاء سمك طازج في مطعم مطل على الجرف البحري.",
    narrativeAr: "انطلاقة ساحرة في قلب أنطاليا التاريخي القديم كاليتشي وبوابتها الرخامية وأزقتها الحجرية ومينائها الروماني الساحر.",
    stops: [
      { titleAr: "بوابة هادريان التاريخية (أوتش كابيلار)", titleEn: "Hadrian's Gate (Üçkapılar)", slotAr: "الصباح (09:30)", kind: "attraction", lat: 36.8853, lng: 30.7085, visitMinutes: 90, rating: 4.8, detailAr: "البوابة الرخامية الثلاثية الشهيرة المشيدة تكريماً لزيارة الإمبراطور هادريان عام 130م.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800" },
      { titleAr: "أزقة كاليتشي العتيقة ومئذنة يفلي", titleEn: "Kaleiçi Old Town & Yivli Minare", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 36.8867, lng: 30.7042, visitMinutes: 120, rating: 4.9, detailAr: "أزقة مبهجة ببوتيكات الحرف والمنازل الخشبية ومئذنة السلاجقة الأثرية المضلعة.", image: "https://images.unsplash.com/photo-1605555571960-04d116bb6456?w=800" },
      { titleAr: "الميناء الروماني القديم ومطاعم الجرف", titleEn: "Old City Marina & Cliffside Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 36.8841, lng: 30.7025, visitMinutes: 150, rating: 4.8, detailAr: "جلسة عشاء بحرية راقية على رصيف الميناء القديم المحاط بأسوار القلعة التاريخية واليخوت.", image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800" }
    ]
  },
  {
    day: 2,
    themeAr: "عجائب الطبيعة والشلالات: شلالات دودان العليا والسفلى وشاطئ لارا",
    themeEn: "Düden Waterfalls Cascades & Lara Coastal Promenade",
    morningAr: "زيارة متنزه شلالات دودان العلوية الطبيعي والمشي خلف الستار المائي في الكهوف الصخرية الباردة وسط غابات الظلال الرطبة.",
    afternoonAr: "الانتقال بالسيارة الخاصة إلى شلال دودان السفلي (Karpuzkaldıran) المذهل حيث تتدفق المياه من جرف شاهق بارتفاع 40 متراً مباشرة في البحر المتوسط.",
    eveningAr: "جولة في ممشى وحديقة لارا الشاطئية وتناول وجبة مشويات تركية فاخرة أو مأكولات بحرية مع تأمل غروب الشمس فوق مياه المتوسط.",
    narrativeAr: "يوم يجمع بين خرير المياه العذبة في كهوف دودان وشلالها الأسطوري الهادر المنصب في أعماق البحر الأبيض المتوسط.",
    stops: [
      { titleAr: "شلالات دودان العلوية والكهوف المائية", titleEn: "Upper Düden Waterfalls & Cave", slotAr: "الصباح (09:30)", kind: "attraction", lat: 36.9644, lng: 30.7258, visitMinutes: 120, rating: 4.7, detailAr: "واحة استوائية ساحرة وكهوف طبيعية يمكن المشي داخلها خلف الشلال المتدفق.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800" },
      { titleAr: "شلال دودان السفلي المصب بالبحر المتوسط", titleEn: "Lower Düden Waterfall Sea Cliff", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 36.8514, lng: 30.7850, visitMinutes: 90, rating: 4.9, detailAr: "منظر طبيعي نادر لشلال يتدفق بقوة هائلة من جرف صخري شاهق ليسقط في مياه البحر المتوسط.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" },
      { titleAr: "متنزه لارا الشاطئي ومطاعم الغروب", titleEn: "Lara Beach Park Sunset Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 36.8530, lng: 30.7950, visitMinutes: 150, rating: 4.7, detailAr: "مطاعم راقية وإطلالات مفتوحة على الشاطئ الرملي الذهبي مع جلسات هادئة للعشاء.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 3,
    themeAr: "كنوز الآثار وسحر الشواطئ: متحف أنطاليا وأكواريوم وشاطئ كونيالتي",
    themeEn: "Antalya Museum Sculptures, Giant Aquarium & Konyaaltı",
    morningAr: "زيارة متحف أنطاليا الأثري (Antalya Museum) أحد أعظم متاحف التماثيل الرومانية والبيزنطية وتوابيت الملوك عالمياً الحائز على جوائز أوروبية.",
    afternoonAr: "استكشاف أكواريوم أنطاليا (Antalya Aquarium) صاحب أطول نفق مائي في العالم لمشاهدة أسماك القرش وعالم الجليد وقسم الزواحف البرية.",
    eveningAr: "الاسترخاء في ممشى شاطئ كونيالتي (Konyaaltı Beach Promenade) بين المقاهي العصرية وإطلالة جبال طوروس وتناول العشاء.",
    narrativeAr: "رحلة تثقيفية وترفيهية تجمع بين تماثيل أباطرة روما القديمة وعوالم البحار الساحرة في الأكواريوم وممشى كونيالتي الشهير.",
    stops: [
      { titleAr: "متحف أنطاليا الأثري العالمي", titleEn: "Antalya Archeological Museum", slotAr: "الصباح (09:30)", kind: "attraction", lat: 36.8853, lng: 30.6798, visitMinutes: 150, rating: 4.9, detailAr: "روائع النحت الإغريقي والروماني وقاعة الآلهة وتوابيت برجي وبيراموس التاريخية.", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800" },
      { titleAr: "أكواريوم أنطاليا والنفق المائي العملاق", titleEn: "Antalya Aquarium & Tunnel", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 36.8789, lng: 30.6601, visitMinutes: 120, rating: 4.7, detailAr: "أطول نفق مائي بأحواض أسماك القرش والمخلوقات البحرية الملونة وقاعة التزلج الثلجي.", image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800" },
      { titleAr: "ممشى وشاطئ كونيالتي الفاخر", titleEn: "Konyaaltı Beach Promenade", slotAr: "المساء (16:30)", kind: "restaurant", lat: 36.8650, lng: 30.6450, visitMinutes: 150, rating: 4.8, detailAr: "ممشى شاطئي عالمي يضم مطاعم ومقاهي النخبة مع إطلالة بانورامية على قمم جبال طوروس.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" }
    ]
  },
  {
    day: 4,
    themeAr: "عظمة الحضارات القديمة: مدينة بيرجي ومسرح أسبندوس الأسطوري",
    themeEn: "Perge Ancient Capital & Aspendos Roman Theater",
    morningAr: "الانطلاق بالسيارة الخاصة لاستكشاف مدينة بيرجي (Perge) عاصمة بامفيليا القديمة والشارع المعمد وأبراج البوابات الإغريقية والحمامات الرومانية.",
    afternoonAr: "زيارة مسرح أسبندوس الروماني (Aspendos Theater) أعظم وأكمل مسرح روماني محفوظ في العالم وقناة المياه الرومانية الحجرية التاريخية.",
    eveningAr: "زيارة منتزه وشلال كورشونلو (Kurşunlu Waterfall) والتنزه بين أشجار الصنوبر والمياه الزمردية ثم العودة للفندق.",
    narrativeAr: "يوم يجسد عظمة الإمبراطوريات القديمة بين أعمدة بيرجي الأثرية والصوتيات الأسطورية لمسرح أسبندوس وشلال كورشونلو الهادئ.",
    stops: [
      { titleAr: "مدينة بيرجي الأثرية والشوارع المعمدة", titleEn: "Perge Ancient City", slotAr: "الصباح (09:30)", kind: "attraction", lat: 36.9609, lng: 30.8524, visitMinutes: 150, rating: 4.8, detailAr: "عاصمة بامفيليا الأثرية ببواباتها الهلنستية وملعب المصارعين والحمامات القديمة.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800" },
      { titleAr: "مسرح أسبندوس الروماني الأسطوري", titleEn: "Aspendos Roman Theater", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 36.9389, lng: 31.1723, visitMinutes: 120, rating: 4.9, detailAr: "أعظم مسرح كلاسيكي محفوظ بالكامل في العالم يتميز بنظام صوتي هندسي معجز.", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800" },
      { titleAr: "شلال كورشونلو والواحة الخضراء", titleEn: "Kurşunlu Waterfall Nature Park", slotAr: "المساء (16:00)", kind: "attraction", lat: 36.9620, lng: 30.8200, visitMinutes: 90, rating: 4.7, detailAr: "شلال وسط غابة صنوبر عذراء وبحيرات صغيرة تسكنها الطيور والبط والأسماك.", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800" }
    ]
  },
  {
    day: 5,
    themeAr: "سحر الريفييرا التركية: كيمير وتلفريك جبل تهتالي وخليج فاسيليس",
    themeEn: "Kemer Riviera, Mount Tahtali Olympos Cable Car & Phaselis",
    morningAr: "رحلة ساحلية بالسيارة نحو منتجع كيمير وركوب تلفريك أوليمبوس (Olympos Teleferik) إلى قمة جبل تهتالي على ارتفاع 2365 متراً فوق الغيوم.",
    afternoonAr: "زيارة خليج ومدينة فاسيليس الأثرية (Phaselis) الواقعة بين غابات الصنوبر العطرة ومياه البحر الكريستالية والموانئ التاريخية الثلاثة.",
    eveningAr: "نزهة في مارينا كيمير وتناول وجبة غداء/عشاء تركية متوسطية في مطعم مطل على البحر ثم العودة إلى أنطاليا بسيارة VIP.",
    narrativeAr: "رحلة متباينة تحلق بك من قمم جبل تهتالي المثلجة إلى زرقة خلجان فاسيليس وشواطئ كيمير الساحرة.",
    stops: [
      { titleAr: "تلفريك جبل تهتالي أوليمبوس الشاهق", titleEn: "Olympos Teleferik Mount Tahtali", slotAr: "الصباح (10:00)", kind: "attraction", lat: 36.5400, lng: 30.4850, visitMinutes: 180, rating: 4.9, detailAr: "صعود هوائي بالتلفريك السويسري لارتفاع 2365م مع إطلالة 360 درجة على خليج أنطاليا.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" },
      { titleAr: "خليج ومدينة فاسيليس الأثرية وموانئها", titleEn: "Phaselis Ancient Bays & Aqueduct", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 36.5250, lng: 30.5530, visitMinutes: 120, rating: 4.9, detailAr: "آثار رومانية عريقة ومسرح حجري بين أشجار الصنوبر ومياه البحر الهادئة الصافية.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" },
      { titleAr: "مارينا كيمير ومطاعم الساحل", titleEn: "Kemer Marina Seafood Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 36.6020, lng: 30.5620, visitMinutes: 120, rating: 4.7, detailAr: "أجواء شاطئية أنيقة وتناول أشهى المأكولات التركية والمتوسطية قبل العودة للفندق.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 6,
    themeAr: "المغامرة والطبيعة الجبلية: وادي كوبرولو كانيون والجسر الروماني",
    themeEn: "Köprülü Canyon Rafting & Historic Roman Oluk Bridge",
    morningAr: "الانطلاق نحو متنزه وادي كوبرولو الوطني (Köprülü Canyon) وتأمل الجبال الشاهقة ونهر كوبروتشاي ذي المياه الفيروزية النقية.",
    afternoonAr: "تجربة تجديف القوارب الممتعة (Rafting) الآمنة للعائلات أو ركوب سيارات الجيب الجبلية، وزيارة الجسر الحجري الروماني القديم (Oluk Köprü).",
    eveningAr: "تناول سمك السلمون النهري المشوي الطازج في المطاعم الخشبية العائمة فوق النهر والعودة براحة إلى الفندق بسيارة VIP.",
    narrativeAr: "يوم مخصص لعشاق الطبيعة والمغامرة في أعماق كانيون كوبرولو الفيروزي والجسر الروماني التراثي المعلق.",
    stops: [
      { titleAr: "متنزه وادي كانيون كوبرولو الوطني", titleEn: "Köprülü Canyon National Park", slotAr: "الصباح (10:00)", kind: "attraction", lat: 37.1950, lng: 31.1820, visitMinutes: 150, rating: 4.8, detailAr: "أحد أروع الأخاديد الطبيعية في تركيا بمياهه الفيروزية الباردة وجدرانه الصخرية العالية.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800" },
      { titleAr: "الجسر الروماني التاريخي والرافتينغ", titleEn: "Historic Oluk Bridge & River Rafting", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 37.1920, lng: 31.1790, visitMinutes: 150, rating: 4.9, detailAr: "جسر روماني مقوس يعود للقرن الثاني الميلادي فوق النهر وجولات التجديف الشيقة.", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800" },
      { titleAr: "مطاعم النهر الخشبية العائمة", titleEn: "Köprülü River Fresh Trout Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 37.1850, lng: 31.1750, visitMinutes: 120, rating: 4.7, detailAr: "طاولات فوق سطح الماء مباشرة لتناول سمك التراوت النهري الطازج والخبز القروي الساخن.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 7,
    themeAr: "الفخامة والوداع: كروز يخت خاص، تسوق الماركات، وعشاء كاليتشي الوداعي",
    themeEn: "Private Yacht Cruise, Luxury Shopping & Farewell Dinner",
    morningAr: "الإبحار في جولة بحرية خاصة بيخت VIP من ميناء أنطاليا لاكتشاف الكهوف البحرية وشلال دودان الساقط بالبحر والسباحة في مياه المتوسط الصافية.",
    afternoonAr: "جولة تسوق فاخرة في مول تيرا سيتي (TerraCity) أو مول أوف أنطاليا لشراء أشهر الماركات والملابس والحلويات التركية الملكية.",
    eveningAr: "عشاء وداعي فاخر في مطعم سيريسر (Seraser Fine Dining) أو نادي اليخوت في كاليتشي وتوديع ساحر لعروس الريفييرا التركية.",
    narrativeAr: "ختام ملكي لرحلة أنطاليا بين أمواج المتوسط على يخت VIP وتسوق أرقى المقتنيات وسهرة عشاء وداعية فاخرة.",
    stops: [
      { titleAr: "كروز يخت VIP خاص في خليج أنطاليا", titleEn: "Private VIP Yacht Cruise", slotAr: "الصباح (10:00)", kind: "attraction", lat: 36.8845, lng: 30.7015, visitMinutes: 180, rating: 4.9, detailAr: "إبحار خاص لاستكشاف خلجان أنطاليا والشلالات البحرية مع المشروبات والضيافة.", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800" },
      { titleAr: "تسوق فاخر في مول تيرا سيتي (TerraCity)", titleEn: "TerraCity Luxury Mall Shopping", slotAr: "الظهيرة (14:00)", kind: "shopping", lat: 36.8528, lng: 30.7540, visitMinutes: 150, rating: 4.8, detailAr: "أرقى وجهات التسوق في أنطاليا وتضم كبرى العلامات التجارية العالمية والتركية.", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800" },
      { titleAr: "عشاء وداعي فاخر في كاليتشي التاريخية", titleEn: "Seraser Fine Dining Restaurant", slotAr: "المساء (17:30)", kind: "restaurant", lat: 36.8835, lng: 30.7060, visitMinutes: 150, rating: 4.9, detailAr: "أحد أرقى مطاعم تركيا في قصر عثماني عمره 300 عام مع عزف البيانو الحي وأشهى الأطباق.", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" }
    ]
  }
];

export const TRABZON_ICONIC_DAYS: GeminiDayRaw[] = [
  {
    day: 1,
    themeAr: "عروس البحر الأسود: قصر أتاتورك، آيا صوفيا طرابزون، وبانوراما بوزتبه",
    themeEn: "Trabzon Highlights: Atatürk Pavilion, Hagia Sophia & Boztepe",
    morningAr: "زيارة قصر أتاتورك الأبيض (Atatürk Köşkü) بطرازه المعماري الفيكتوري وحدائقه الصنوبرية الملكية في حي سوغوك سو المطل على المدينة.",
    afternoonAr: "استكشاف متحف وجامع آيا صوفيا طرابزون (Hagia Sophia Trabzon) ومشاهدة الجداريات واللوحات الفنية البيزنطية والحديقة المطلة على البحر.",
    eveningAr: "الصعود إلى قمة تلة بوزتبه (Boztepe) وتناول شاي الساموفار التركي التراثي مع تأمل غروب الشمس البانورامي فوق طرابزون والبحر الأسود، ثم عشاء سمك بمطعم أكشابات.",
    narrativeAr: "انطلاقة تاريخية وثقافية في طرابزون تجمع بين معالم القصور التراثية والآثار البيزنطية وإطلالة بوزتبه الساحرة فوق البحر الأسود.",
    stops: [
      { titleAr: "قصر أتاتورك التاريخي في سوغوك سو", titleEn: "Atatürk Pavilion Trabzon", slotAr: "الصباح (09:30)", kind: "attraction", lat: 40.9935, lng: 39.6960, visitMinutes: 120, rating: 4.7, detailAr: "قصر تاريخي بني عام 1890 بطراز أوروبي كلاسيكي فريد تحيط به حدائق صنوبر غناء.", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800" },
      { titleAr: "آيا صوفيا طرابزون التاريخية", titleEn: "Hagia Sophia Mosque & Museum Trabzon", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 41.0032, lng: 39.6990, visitMinutes: 90, rating: 4.7, detailAr: "معلم أثري من القرن الثالث عشر يشتهر بلوحات جدارية فريدة وحدائق مطلة على الساحل.", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800" },
      { titleAr: "مطل بوزتبه وشاي الساموفار ومطاعم الساحل", titleEn: "Boztepe Hill Panoramic Sunset Viewpoint", slotAr: "المساء (15:30)", kind: "viewpoint", lat: 41.0030, lng: 39.7300, visitMinutes: 150, rating: 4.8, detailAr: "أعلى إطلالة بانورامية تكشف كامل طرابزون والبحر الأسود مع مقاهي الشاي التقليدية.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800" }
    ]
  },
  {
    day: 2,
    themeAr: "أسطورة الجبال والتاريخ: دير سوميلا وماتشكا وقرية هامسيكوي",
    themeEn: "Sumela Cliffside Monastery, Altındere Valley & Hamsiköy",
    morningAr: "الانطلاق بالسيارة الخاصة نحو منتزه وادي ألتنديري وزيارة دير سوميلا التاريخي (Sümela Monastery) المنحوت في قلب الجرف الصخري الشاهق بارتفاع 1200م.",
    afternoonAr: "النزول إلى بلدة ماتشكا الخضراء والتنزه قرب الشلالات الجبلية العذبة والغابات الكثيفة.",
    eveningAr: "زيارة قرية هامسيكوي (Hamsiköy) الريفية الساحرة وسط المراعي الخضراء وتذوق مهلبية الأرز بالحليب الملكية الشهيرة (Hamsiköy Sütlacı) ثم العودة للفندق.",
    narrativeAr: "يوم مهيب في أحضان جبال ألتنديري بين عمارة دير سوميلا الأسطورية المنحوتة في الصخر وهدوء قرية هامسيكوي القروية.",
    stops: [
      { titleAr: "دير سوميلا المعلق في صخور ألتنديري", titleEn: "Sümela Monastery & Altındere Gorge", slotAr: "الصباح (09:30)", kind: "attraction", lat: 40.6903, lng: 39.6578, visitMinutes: 180, rating: 4.9, detailAr: "دير بيزنطي أسطوري منحوت في جرف صخري شاهق محاط بالغابات والشلالات الجبلية.", image: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800" },
      { titleAr: "شلالات ووديان ماتشكا الجبلية", titleEn: "Maçka Mountain Valley & Streams", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 40.8120, lng: 39.6050, visitMinutes: 90, rating: 4.7, detailAr: "جداول مياه جبلية عذبة وطبيعة ريفية غناء مثالية للاستراحة والتصوير.", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800" },
      { titleAr: "قرية هامسيكوي ومذاق السوتلاج الأصلي", titleEn: "Hamsiköy Village & Traditional Sütlaç", slotAr: "المساء (15:30)", kind: "restaurant", lat: 40.6900, lng: 39.4800, visitMinutes: 120, rating: 4.8, detailAr: "قرية خضراء تشتهر بالحليب الطبيعي وتقديم أشهر حلوى رز بحليب مخبوزة في تركيا.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800" }
    ]
  },
  {
    day: 3,
    themeAr: "جوهرة الشمال التركي: بحيرة أوزنجول والشلالات الجبلية والمطل الزجاجي",
    themeEn: "Uzungöl Alpine Lake, Glass Skywalk & Mountain Waterfalls",
    morningAr: "الانطلاق نحو بحيرة أوزنجول (Uzungöl) الأيقونية والتقاط الصور التذكارية بجوار مئذنة المسجد الشهير على ضفاف البحيرة المحاطة بغابات الصنوبر.",
    afternoonAr: "الصعود بالسيارة الخاصة إلى المرتفعات المطلة والمطل الزجاجي البانورامي (Uzungöl Seyir Terası) وزيارة الشلالات الجبلية المتدفقة.",
    eveningAr: "جولة في الأسواق الشعبية حول البحيرة وتناول وجبة العشاء في مطعم خشبي مطل على المياه العذبة مع تجربة الشاي التركي والراحة بالفندق.",
    narrativeAr: "رحلة لا تنسى إلى بحيرة أوزنجول الساحرة بين ضباب الجبال وغابات الصنوبر وشلالاتها الرقراقة.",
    stops: [
      { titleAr: "بحيرة أوزنجول وضفاف الصنوبر", titleEn: "Uzungöl Alpine Lake Promenade", slotAr: "الصباح (10:00)", kind: "attraction", lat: 40.6186, lng: 40.2950, visitMinutes: 180, rating: 4.8, detailAr: "أيقونة السياحة في الشمال التركي بمياهها الهادئة ومسجدها العريق وأشجار الصنوبر.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800" },
      { titleAr: "المطل الزجاجي وشلالات أوزنجول", titleEn: "Uzungöl Glass Observation Deck & Cascades", slotAr: "الظهيرة (13:30)", kind: "viewpoint", lat: 40.6250, lng: 40.3050, visitMinutes: 120, rating: 4.7, detailAr: "منصة زجاجية معلقة تمنح إطلالة شاملة على كامل البحيرة والقرية والجبال.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800" },
      { titleAr: "مطاعم الجلسات الخشبية على البحيرة", titleEn: "Uzungöl Lakeside Wooden Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 40.6170, lng: 40.2920, visitMinutes: 150, rating: 4.7, detailAr: "عشاء سمك السلمون النهري أو المشويات في أجواء خشبية دافئة مطلة على البحيرة.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 4,
    themeAr: "الضباب والشلالات العجيبة: مرتفعات حيدر نبي ومغارة تشال وبحيرة سيرا",
    themeEn: "Hıdırnebi Cloud Plateau, Çal Cave Underground River & Sera Lake",
    morningAr: "الصعود نحو هضبة حيدر نبي (Hıdırnebi Yaylası) على ارتفاع 1600 متر والمشي وسط السحاب والمروج الخضراء والزهور البرية.",
    afternoonAr: "زيارة مغارة تشال (Çal Mağarası) ثاني أطول مغارة في العالم، والمشي على الجسور الخشبية الداخلية فوق الشلال والينابيع الصخرية المضيئة.",
    eveningAr: "زيارة بحيرة سيرا جول (Sera Gölü) وركوب القوارب وتناول وجبة غداء/عشاء مشويات طازجة في المطاعم الجبلية المطلة على البحيرة.",
    narrativeAr: "يوم يجمع بين التحليق فوق الغيوم في حيدر نبي واستكشاف أعماق ثاني أطول مغارة بالعالم في تشال وهدوء بحيرة سيرا جول.",
    stops: [
      { titleAr: "هضبة حيدر نبي فوق الغيوم", titleEn: "Hıdırnebi Cloud Plateau", slotAr: "الصباح (09:30)", kind: "attraction", lat: 40.9600, lng: 39.4300, visitMinutes: 150, rating: 4.8, detailAr: "مرتفعات ساحرة فوق مستوى السحاب ومروج طبيعية ومقاهي قروية هادئة.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800" },
      { titleAr: "مغارة تشال والشلال المائي الداخلي", titleEn: "Çal Cave & Underground Waterfall", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 40.8700, lng: 39.4200, visitMinutes: 120, rating: 4.8, detailAr: "ثاني أطول مغارة بالعالم بمسارات خشبية وشلال داخلي وصواعد وهوابط كلسية مبهرة.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800" },
      { titleAr: "بحيرة سيرا جول ومطاعم القوارب", titleEn: "Sera Lake Natural Park & Dining", slotAr: "المساء (16:00)", kind: "restaurant", lat: 40.9990, lng: 39.6200, visitMinutes: 120, rating: 4.7, detailAr: "بحيرة طبيعية وسط التلال توفر قوارب بدالات ومطاعم مشويات شهيرة.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800" }
    ]
  },
  {
    day: 5,
    themeAr: "سحر ريزا ووادي الرياح: مرتفعات آيدر، قلعة زيل كاله، وشلال بالوفيت",
    themeEn: "Rize Fırtına Valley, Zilkale Castle, Palovit Falls & Ayder Plateau",
    morningAr: "الانطلاق بسيارة VIP الخاصة إلى ريزا ووادي الرياح (Fırtına Deresi)، ومشاهدة مزارع الشاي وجسور المشاة الحجرية العثمانية التاريخية (مثل جسر شان يوفا).",
    afternoonAr: "الصعود إلى قلعة زيل كاله (Zilkale) الحصن التاريخي الشاهق على حافة جرف صخري في الغابة، وزيارة شلال بالوفيت (Palovit Şelalesi) المنهمر بقوة.",
    eveningAr: "الوصول إلى هضبة آيدر (Ayder Yaylası) الشهيرة بمنازلها الخشبية ومراعيها الخضراء وشلالاتها وتناول وجبة العشاء في فندق ريفي.",
    narrativeAr: "رحلة الطبيعة الخضراء في وادي الرياح بريزا بين قلاع العصور الوسطى وشلالات بالوفيت الهادرة وهضبة آيدر الساحرة.",
    stops: [
      { titleAr: "وادي الرياح وجسور الحجر التاريخية", titleEn: "Fırtına River & Historic Ottoman Stone Bridges", slotAr: "الصباح (09:30)", kind: "attraction", lat: 40.9600, lng: 41.0100, visitMinutes: 120, rating: 4.9, detailAr: "أنهار جبلية متدفقة ومزارع الشاي الأخضر والجسور الحجرية المقوسة منذ العهد العثماني.", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800" },
      { titleAr: "قلعة زيل كاله وشلال بالوفيت الهادر", titleEn: "Zilkale Cliff Fortress & Palovit Waterfall", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 40.8380, lng: 40.6400, visitMinutes: 150, rating: 4.9, detailAr: "قلعة تاريخية حارسة تعلو جرفاً سحيقاً وشلال طبيعي متدفق بقوة وسط الغابات الكثيفة.", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800" },
      { titleAr: "مرتفعات آيدر وشلال العروس", titleEn: "Ayder Plateau & Bridal Veil Falls", slotAr: "المساء (15:30)", kind: "attraction", lat: 40.9500, lng: 41.1000, visitMinutes: 180, rating: 4.8, detailAr: "قرية جبلية خضراء تشتهر بمنازلها الخشبية ومياهها الكبريتية وعسل الجبال النقي.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" }
    ]
  },
  {
    day: 6,
    themeAr: "ملامسة السحاب: مرتفعات السلطان مراد وهضبة شكرسو",
    themeEn: "Sultan Murat Alpine Plateau & Şekersu High Pastures",
    morningAr: "رحلة ملحمية نحو مرتفعات السلطان مراد (Sultan Murat Yaylası) التي ترتفع لأكثر من 2200 متر مع إطلالة مفتوحة على مد البصر فوق بحار الغيوم.",
    afternoonAr: "استكشاف حياة القرى الجبلية والرعاة وتذوق الزبد والجبن الريفي الطازج، وزيارة هضبة شكرسو الساحرة بمناظرها الطبيعية العذراء.",
    eveningAr: "تناول وجبة خروف مشوي (لحم ضأن تركي أصيل) في الخيام والمطاعم الشعبية الجبلية ثم العودة للاسترخاء بالفندق.",
    narrativeAr: "يوم يحلق فوق قمم جبال الشمال التركي الشاهقة في مرتفعات السلطان مراد وتجربة الضيافة الريفية الأصيلة.",
    stops: [
      { titleAr: "مرتفعات السلطان مراد فوق السحاب", titleEn: "Sultan Murat High Plateau (2200m)", slotAr: "الصباح (10:00)", kind: "attraction", lat: 40.7900, lng: 40.2200, visitMinutes: 180, rating: 4.8, detailAr: "هضبة شاهقة سميت نسبة للسلطان العثماني مراد الرابع وتتميز بإطلالة بحر الغيوم.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" },
      { titleAr: "هضبة شكرسو والمروج الطبيعية", titleEn: "Şekersu Alpine Pastures & Streams", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 40.6800, lng: 40.3500, visitMinutes: 120, rating: 4.7, detailAr: "مراعٍ جبلية عذراء غنية بينابيع المياه الصافية والزهور النادرة.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800" },
      { titleAr: "مطاعم اللحوم المشوية الجبلية", titleEn: "Traditional Highland Lamb Roast Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 40.7850, lng: 40.2150, visitMinutes: 120, rating: 4.8, detailAr: "لحم الضأن المشوي على الحطب والمقبلات الريفية في أجواء جبلية منعشة.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 7,
    themeAr: "التسوق التراثي والوداع: كازازية الفضة، فوروم طرابزون، وعشاء كفتة أكشابات",
    themeEn: "Trabzon Silver Kazaziye, Forum Mall & Akçaabat Meatballs",
    morningAr: "جولة تسوق في أسواق طرابزون التاريخية وشارع كوندوراجيلار لشراء المشغولات الفضية التقليدية (فن الكازازية والتل سارما الحصري بطرابزون).",
    afternoonAr: "التوجه إلى مركز تسوق فوروم طرابزون (Forum Trabzon) أكبر مول تسوق في الشمال التركي لاقتناء الملابس والماركات والحلويات والشاي التركي الفاخر.",
    eveningAr: "عشاء ختامي شهير في مطعم نهاد أوسطا (Nihat Usta) في أكشابات لتذوق كفتة أكشابات الأصلية مع إطلالة البحر وتوديع موكب السفر VIP.",
    narrativeAr: "ختام رحلة الشمال التركي باقتناء فضة الكازازية النادرة والتسوق الحديث وتذوق أشهى وجبة كفتة في أكشابات على شاطئ البحر.",
    stops: [
      { titleAr: "سوق طرابزون للمشغولات الفضية والكازازية", titleEn: "Trabzon Historic Silver Kazaziye Bazaar", slotAr: "الصباح (10:00)", kind: "shopping", lat: 41.0050, lng: 39.7250, visitMinutes: 120, rating: 4.8, detailAr: "حرفة يدوية تركية أصيلة لصناعة الأساور والقلائد من أسلاك الفضة الخالصة.", image: "https://images.unsplash.com/photo-1605555571960-04d116bb6456?w=800" },
      { titleAr: "مركز فوروم طرابزون للتسوق (Forum Trabzon)", titleEn: "Forum Trabzon Shopping Mall", slotAr: "الظهيرة (13:00)", kind: "shopping", lat: 40.9970, lng: 39.7590, visitMinutes: 150, rating: 4.8, detailAr: "أكبر مركز تسوق عصري في الشمال التركي يضم أرقى الماركات والمطاعم ومحلات الحلويات.", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800" },
      { titleAr: "مطعم نهاد أوسطا وكفتة أكشابات الشهيرة", titleEn: "Nihat Usta Akçaabat Meatballs & Sea View", slotAr: "المساء (16:30)", kind: "restaurant", lat: 41.0200, lng: 39.5800, visitMinutes: 120, rating: 4.9, detailAr: "أشهر مطعم في طرابزون يقدم كفتة أكشابات المشوية على الفحم مع خبز البيتا والمشروبات التراثية.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  }
];

export const BURSA_ICONIC_DAYS: GeminiDayRaw[] = [
  {
    day: 1,
    themeAr: "جبل أولوداغ وأطول تلفريك وقرية جومالي كيزيك التاريخية",
    themeEn: "Mount Uludağ Cable Car & Cumalıkızık UNESCO Village",
    morningAr: "ركوب تلفريك بورصة (Teleferik) أطول تلفريك في العالم للصعود إلى قمم جبل أولوداغ الشاهقة والاستمتاع بغابات الصنوبر والهواء العليل.",
    afternoonAr: "زيارة قرية جومالي كيزيك (Cumalıkızık) التراثية المدرجة على لائحة اليونسكو بمنازلها العثمانية الملونة ذات الـ 700 عام.",
    eveningAr: "تناول وجبة إسكندر كباب الأصلية في موطنها التاريخي ببورصة وزيارة المقاهي التراثية ثم الاستراحة بالفندق.",
    narrativeAr: "انطلاقة ساحرة في أولى عواصم العثمانيين بين قمم جبل أولوداغ وأزقة جومالي كيزيك الحجرية التراثية.",
    stops: [
      { titleAr: "تلفريك جبل أولوداغ الشاهق (Teleferik)", titleEn: "Mount Uludağ Teleferik Cable Car", slotAr: "الصباح (09:30)", kind: "attraction", lat: 40.1500, lng: 29.1000, visitMinutes: 180, rating: 4.9, detailAr: "رحلة صعود هوائية بطول 9 كم بإطلالات بانورامية كاشفة لكامل مدينة بورصة والغابات.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" },
      { titleAr: "قرية جومالي كيزيك العثمانية (اليونسكو)", titleEn: "Cumalıkızık UNESCO Historic Village", slotAr: "الظهيرة (13:30)", kind: "attraction", lat: 40.1770, lng: 29.1720, visitMinutes: 120, rating: 4.8, detailAr: "قرية عثمانية حية ومحفوظة بمنازلها الحجرية والخشبية وأسواق المربى والعسل القروي.", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800" },
      { titleAr: "مطعم كباب إسكندر الأصلي التاريخي", titleEn: "Kebapçı İskender Historical Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 40.1850, lng: 29.0620, visitMinutes: 120, rating: 4.9, detailAr: "تذوق كباب إسكندر الأصلي بشرائح اللحم الرقيقة والزبدة المذابة وصلصة الطماطم الملكية.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 2,
    themeAr: "الآثار العثمانية وسوق الحرير والشجرة المعمرة في إينكايا",
    themeEn: "Green Mosque, Koza Han Silk Bazaar & Historical Plane Tree",
    morningAr: "زيارة الجامع الأخضر والضريح الأخضر (Yeşil Cami) أحد أروع معالم العمارة العثمانية المبكرة بفسيفسائه الخزفية المذهلة.",
    afternoonAr: "التجول في خان الحرير كوزا خان (Koza Han) والسوق المسقوف العريق وتناول الشاي في فنائه المظلل بأشجار الجوز.",
    eveningAr: "زيارة الشجرة التاريخية المعمرة في إينكايا (İnkaya Çınarı) التي يبلغ عمرها أكثر من 600 عام والاستمتاع بالمطل والمقاهي الجبلية.",
    narrativeAr: "يوم يفيض بعبق التاريخ العثماني بين حرير كوزا خان والجامع الأخضر وأغصان الشجرة المعمرة الشامخة.",
    stops: [
      { titleAr: "الجامع الأخضر والضريح الأخضر", titleEn: "Green Mosque & Green Tomb (Yeşil Cami)", slotAr: "الصباح (09:30)", kind: "attraction", lat: 40.1814, lng: 29.0744, visitMinutes: 90, rating: 4.8, detailAr: "أحد أروع معالم الفن السلجوقي والعثماني بالبلاط الإزنيقي الفيروزي والأخضر البديع.", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800" },
      { titleAr: "خان الحرير التاريخي كوزا خان (Koza Han)", titleEn: "Koza Han Historic Silk Caravanserai", slotAr: "الظهيرة (12:00)", kind: "shopping", lat: 40.1842, lng: 29.0633, visitMinutes: 120, rating: 4.8, detailAr: "خان تجاري عثماني عريق بني عام 1491 لبيع أرقى أقمشة الحرير الطبيعي والتذكارات.", image: "https://images.unsplash.com/photo-1605555571960-04d116bb6456?w=800" },
      { titleAr: "الشجرة المعمرة التاريخية في إينكايا", titleEn: "Historical İnkaya Plane Tree (600 Years)", slotAr: "المساء (15:30)", kind: "attraction", lat: 40.1880, lng: 29.0050, visitMinutes: 120, rating: 4.7, detailAr: "شجرة دلب عملاقة محاطة بالمقاهي الجبلية وإطلالة واسعة على بساتين بورصة الخضراء.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800" }
    ]
  }
];

export const CAPPADOCIA_ICONIC_DAYS: GeminiDayRaw[] = [
  {
    day: 1,
    themeAr: "مداخن الجن ووادي الرهبان ومتحف غوريميه المفتوح",
    themeEn: "Göreme Open Air Museum, Paşabağ Fairy Chimneys & Devrent",
    morningAr: "زيارة متحف غوريميه المفتوح (Göreme Open Air Museum) المسجل في اليونسكو ومشاهدة الكنائس الصخرية البيزنطية وجدارياتها التاريخية.",
    afternoonAr: "استكشاف وادي الرهبان وباشاباغ (Paşabağ) لمشاهدة مداخن الجن ثلاثية الرؤوس المنحوتة بفعل عوامل التعرية الطبيعية.",
    eveningAr: "زيارة وادي ديفرنت (وادي الخيال) وتأمل التكوينات الصخرية الفريدة التي تشبه الحيوانات ثم عشاء في مطعم الكهف الفاخر.",
    narrativeAr: "انطلاقة أسطورية في أرض الخيول الجميلة كابادوكيا بين الكنائس المحفورة بالصخور ومداخن الجن العجيبة.",
    stops: [
      { titleAr: "متحف غوريميه المفتوح (اليونسكو)", titleEn: "Göreme Open Air Museum", slotAr: "الصباح (09:30)", kind: "attraction", lat: 38.6405, lng: 34.8450, visitMinutes: 150, rating: 4.9, detailAr: "مجمع ديني بيزنطي متكامل منحوت في الصخور البركانية يضم كنائس ذات جداريات ملونة.", image: "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=800" },
      { titleAr: "مداخن الجن ووادي باشاباغ", titleEn: "Paşabağ Fairy Chimneys Valley", slotAr: "الظهيرة (13:00)", kind: "attraction", lat: 38.6730, lng: 34.8420, visitMinutes: 120, rating: 4.8, detailAr: "أشهر تكوينات مداخن الجن الفطرية الصخرية وصوامع الرهبان التاريخية المنحوتة في الصخر.", image: "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=800" },
      { titleAr: "وادي ديفرنت ومطعم الكهف التاريخي", titleEn: "Devrent Valley & Cave Fine Dining", slotAr: "المساء (16:30)", kind: "restaurant", lat: 38.6770, lng: 34.8700, visitMinutes: 150, rating: 4.8, detailAr: "تكوينات صخرية سريالية تليها تجربة تناول كباب الفخار الشهير (Testi Kebap) داخل كهف صخري.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  },
  {
    day: 2,
    themeAr: "منطاد الفجر الساحر ووادي الحب وقلعة أوتشيسار الشامخة",
    themeEn: "Sunrise Hot Air Balloon, Love Valley & Uçhisar Rock Castle",
    morningAr: "خوض مغامرة العمر بركوب منطاد الهواء الساخن عند الفجر والتحليق فوق وديان كابادوكيا وتأمل شروق الشمس الذهبي.",
    afternoonAr: "جولة مشي خفيفة في وادي الحب (Love Valley) بين الأعمدة الصخرية الشاهقة والتكوينات الطبيعية الساحرة.",
    eveningAr: "الصعود إلى أعلى نقطة في كابادوكيا بقلعة أوتشيسار الصخرية (Uçhisar Castle) لمشاهدة بانوراما الغروب والاستمتاع بالشاي التركي.",
    narrativeAr: "يوم يجمع بين التحليق السحابي في مناطيد كابادوكيا الأسطورية وإطلالة قلعة أوتشيسار الصخرية الكاشفة لجميع الوديان.",
    stops: [
      { titleAr: "رحلة منطاد الهواء الساخن عند الفجر", titleEn: "Cappadocia Sunrise Hot Air Balloon Flight", slotAr: "الصباح (05:30)", kind: "attraction", lat: 38.6431, lng: 34.8289, visitMinutes: 180, rating: 4.9, detailAr: "تجربة تحليق خيالية مع مئات المناطيد الملونة فوق التضاريس القمرية لكابادوكيا.", image: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800" },
      { titleAr: "وادي الحب والمناظر الطبيعية", titleEn: "Love Valley Panoramic Viewpoint", slotAr: "الظهيرة (12:00)", kind: "attraction", lat: 38.6530, lng: 34.8400, visitMinutes: 90, rating: 4.8, detailAr: "أحد أجمل وديان كابادوكيا بأعمدته الصخرية الطبيعية ومسارات المشي والتصوير.", image: "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=800" },
      { titleAr: "قلعة أوتشيسار الصخرية البانورامية", titleEn: "Uçhisar Castle Sunset Peak", slotAr: "المساء (15:30)", kind: "viewpoint", lat: 38.6290, lng: 34.8070, visitMinutes: 120, rating: 4.9, detailAr: "أعلى قمة صخرية محصنة في كابادوكيا توفر إطلالة 360 درجة على جبل إرجييس والوديان.", image: "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=800" }
    ]
  },
  {
    day: 3,
    themeAr: "أسرار ما تحت الأرض: مدينة درينكويو ووادي إهلارا الأخضر",
    themeEn: "Derinkuyu Underground City & Ihlara Canyon Nature Walk",
    morningAr: "النزول إلى أعماق الأرض لاستكشاف مدينة درينكويو (Derinkuyu) المنحوتة لثمانية طوابق تحت الأرض بأنظمتها الهوائية وكنائسها وغرفها المحصنة.",
    afternoonAr: "التوجه إلى وادي إهلارا (Ihlara Valley) الأخضر والمشي بمحاذاة النهر الجاري بين الجدران الصخرية العالية وزيارة الكنائس الصخرية القديمة.",
    eveningAr: "تناول وجبة الغداء/العشاء في شرفات عائمة فوق مياه النهر في قرية بيلسيرما (Belisırma) ثم العودة للفندق بسيارة VIP.",
    narrativeAr: "رحلة شيقة بين أعماق أكبر مدينة تحت الأرض في العالم والواحة النهرية الخضراء الساحرة في وادي إهلارا.",
    stops: [
      { titleAr: "مدينة درينكويو تحت الأرض التاريخية", titleEn: "Derinkuyu Underground City", slotAr: "الصباح (09:30)", kind: "attraction", lat: 38.3750, lng: 34.7360, visitMinutes: 120, rating: 4.8, detailAr: "مدينة أثرية متكاملة تحت الأرض كانت ملاذاً لآلاف السكان مع آبار تهوية وأنفاق هروب.", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800" },
      { titleAr: "وادي إهلارا الأخضر والمسار النهري", titleEn: "Ihlara Valley Canyon River Walk", slotAr: "الظهيرة (12:30)", kind: "attraction", lat: 38.2500, lng: 34.3000, visitMinutes: 150, rating: 4.9, detailAr: "أخدود طبيعي ساحر يمتد بطول 14 كم بمياهه الجارية وظلال أشجاره الباردة وكنائسه المنحوتة.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800" },
      { titleAr: "مطاعم الجلسات النهرية في بيلسيرما", titleEn: "Belisırma Riverside Floating Dining", slotAr: "المساء (15:30)", kind: "restaurant", lat: 38.2700, lng: 34.3500, visitMinutes: 120, rating: 4.8, detailAr: "جلسات خشبية عائمة فوق مياه النهر الرقراق لتناول أشهى أطباق الطاجين والسلطات الجبلية.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" }
    ]
  }
];

const ATHENS_ICONIC_DAYS: GeminiDayRaw[] = [
  {
    day: 1,
    themeAr: "عظمة الأكروبوليس ومتحف البارثينون وأزقة بلاكا العريقة",
    themeEn: "Acropolis, Parthenon, Acropolis Museum & Historic Plaka",
    morningAr: "الصعود إلى هضبة الأكروبوليس التاريخية واستكشاف معبد البارثينون العظيم وبوابة بروبيلايا ومعبد إريكثيون بإطلالة بانورامية كاملة على أثينا.",
    afternoonAr: "زيارة متحف الأكروبوليس الجديد ذي الأرضيات الزجاجية لمشاهدة المنحوتات الإغريقية النادرة وتناول القهوة في تراس المتحف.",
    eveningAr: "جولة ساحرة بين أزقة حي بلاكا التاريخي ومنازل أنافيوتيكا البيضاء وتناول العشاء اليوناني الفاخر في مطعم ديونيسوس زونارس المطل على البارثينون المضاء.",
    narrativeAr: "انطلاقة أسطورية في مهد الحضارة الإغريقية تبدأ من صرح الأكروبوليس الخالد ومتحفه المعماري وتختتم بأمسية ساحرة في أزقة بلاكا التراثية برفقة سائق VIP.",
    stops: [
      {
        titleAr: "الأكروبوليس ومعبد البارثينون",
        titleEn: "Acropolis of Athens & The Parthenon",
        slotAr: "الصباح (09:00)",
        kind: "attraction",
        lat: 37.9715,
        lng: 23.7257,
        visitMinutes: 180,
        rating: 4.9,
        detailAr: "أعظم معالم الحضارة الإغريقية الكلاسيكية، يضم معبد البارثينون المهيب ومسرح ديونيسوس ومسرح هيروديس أتيكوس الرخامي.",
        image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800",
      },
      {
        titleAr: "متحف الأكروبوليس الجديد",
        titleEn: "Acropolis Museum",
        slotAr: "الظهيرة (13:00)",
        kind: "attraction",
        lat: 37.9684,
        lng: 23.7285,
        visitMinutes: 150,
        rating: 4.9,
        detailAr: "تحفة معمارية حديثة تحتضن كنوز الأكروبوليس الأصلية مع قاعة البارثينون الزجاجية التي تعكس المعبد مباشرة.",
        image: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800",
      },
      {
        titleAr: "حي بلاكا التاريخي ومطعم ديونيسوس زونارس",
        titleEn: "Plaka Old Quarter & Dionysos Zonar's Dining",
        slotAr: "المساء (17:30)",
        kind: "restaurant",
        lat: 37.9730,
        lng: 23.7295,
        visitMinutes: 150,
        rating: 4.8,
        detailAr: "أقدم أحياء أثينا بطابعه الكلاسيكي مع عشاء ذواقة يوناني راقٍ أمام مشهد الأكروبوليس المضاء ليلاً.",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800",
      },
    ],
  },
  {
    day: 2,
    themeAr: "الأغورا اليونانية القديمة وموناستيراكي والمأكولات التراثية",
    themeEn: "Ancient Agora, Monastiraki & Authentic Taverna Dining",
    morningAr: "استكشاف الأغورا اليونانية القديمة ومعبد هيفايستوس المحفوظ بشكل مذهل ورواق أتالوس التاريخي.",
    afternoonAr: "جولة تسوق وتحف فنية في ساحة موناستيراكي الشهيرة وأسواق البازار المفتوحة مع تذوق السوفلاكي الأثيني الشهير.",
    eveningAr: "سهرة عشاء يوناني تقليدي مع موسيقى الريمبيتيكو الحية في مطعم كليماتاريا العريق الذي يعود لعام 1870.",
    narrativeAr: "يوم يغوص في قلب الحياة اليومية لأثينا القديمة وأسواقها النابضة بالحياة وتذوق أشهر الأطباق اليونانية الأصيلة.",
    stops: [
      {
        titleAr: "الأغورا القديمة ومعبد هيفايستوس",
        titleEn: "Ancient Agora & Temple of Hephaestus",
        slotAr: "الصباح (09:30)",
        kind: "attraction",
        lat: 37.9753,
        lng: 23.7225,
        visitMinutes: 150,
        rating: 4.8,
        detailAr: "مركز الحياة السياسية والاجتماعية في أثينا القديمة حيث تجول سقراط وأفلاطون، ويضم أكمل معبد إغريقي صامد حتى اليوم.",
        image: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800",
      },
      {
        titleAr: "ساحة موناستيراكي وسوق التحف",
        titleEn: "Monastiraki Square & Flea Market",
        slotAr: "الظهيرة (13:00)",
        kind: "shopping",
        lat: 37.9760,
        lng: 23.7258,
        visitMinutes: 120,
        rating: 4.7,
        detailAr: "ساحة نابضة بالحياة تطل على الأكروبوليس وتضم مئات المتاجر التراثية للمشغولات الفضية والجلدية والتحف النادرة.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      },
      {
        titleAr: "مطعم كليماتاريا التراثي اليوناني",
        titleEn: "Taverna Klimataria Authentic Greek Dining",
        slotAr: "المساء (18:00)",
        kind: "restaurant",
        lat: 37.9805,
        lng: 23.7262,
        visitMinutes: 120,
        rating: 4.8,
        detailAr: "أعرق تافيرنا تقليدية في أثينا تأسست عام 1870 لتقديم لحم الضأن المطهو ببطء في أواني الفخار مع أنغام الموسيقى الحية.",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      },
    ],
  },
  {
    day: 3,
    themeAr: "جبل ليكابيتوس البانورامي وميدان سينتاجما والبرلمان",
    themeEn: "Mount Lycabettus Sunset, Syntagma & Parliament Guard",
    morningAr: "حضور مراسم تبديل الحرس الرئاسي الأيفزون في ميدان سينتاجما أمام البرلمان اليوناني والتجول في الحديقة الوطنية الملكية.",
    afternoonAr: "التنزه في حي كولوناكي الأرستقراطي الراقي واستكشاف أفخم متاجر الأزياء والمقاهي الباريسية الطابع.",
    eveningAr: "ركوب القطار الجبلي المعلق (التلفريك) لصعود قمة جبل ليكابيتوس أعلى نقطة في أثينا لمشاهدة الغروب الأسطوري وتناول العشاء في مطعم أوريزونتس.",
    narrativeAr: "مشاهد بروتوكولية ملكية في سينتاجما تليها جولة نخبوية في كولوناكي وختام بانورامي خيالي فوق قمة ليكابيتوس المطلة على بحر إيجه.",
    stops: [
      {
        titleAr: "ميدان سينتاجما وتبديل الحرس الرئاسي",
        titleEn: "Syntagma Square & Changing of the Guard",
        slotAr: "الصباح (10:00)",
        kind: "attraction",
        lat: 37.9755,
        lng: 23.7348,
        visitMinutes: 90,
        rating: 4.8,
        detailAr: "مشاهدة الاستعراض البروتوكولي العريق لحرس الشرف الإغريقي بالزي التقليدي أمام نصب الجندي المجهول والبرلمان.",
        image: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800",
      },
      {
        titleAr: "حي كولوناكي الراقي والحديقة الوطنية",
        titleEn: "Kolonaki District & National Garden",
        slotAr: "الظهيرة (13:00)",
        kind: "shopping",
        lat: 37.9780,
        lng: 23.7420,
        visitMinutes: 120,
        rating: 4.7,
        detailAr: "واحة خضراء ملكية تضم آلاف النباتات النادرة تؤدي إلى أرقى أحياء التسوق الفاخر والمقاهي الأنيقة في أثينا.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      },
      {
        titleAr: "قمة جبل ليكابيتوس ومطعم أوريزونتس",
        titleEn: "Mount Lycabettus Summit & Orizontes Restaurant",
        slotAr: "المساء (17:30)",
        kind: "viewpoint",
        lat: 37.9818,
        lng: 23.7432,
        visitMinutes: 150,
        rating: 4.9,
        detailAr: "أعلى قمة في أثينا بارتفاع 277 متراً توفر إطلالة 360 درجة تمتد من الأكروبوليس حتى جزر خليج سارونيك مع عشاء ذواقة بحري.",
        image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800",
      },
    ],
  },
  {
    day: 4,
    themeAr: "إرث الأولمبياد ومعبد زيوس واستاد باناثينايك الرخامي",
    themeEn: "Panathenaic Stadium, Temple of Olympian Zeus & Philopappos",
    morningAr: "زيارة معبد زيوس الأولمبي الضخم وقوس الإمبراطور هادريان التذكاري الممتد منذ القرن الثاني الميلادي.",
    afternoonAr: "جولة داخل استاد باناثينايك الاستثنائي، الملعب الوحيد في العالم المبني بالكامل من الرخام الأبيض النقي ومهد الألعاب الأولمبية الحديثة عام 1896.",
    eveningAr: "الصعود لتلة فيلوبابوس الخضراء لمشاهدة إطلالة الغروب الرومانسية على قلعة الأكروبوليس وتناول العشاء في مطعم ستروفي التاريخي.",
    narrativeAr: "رحلة تحتفي بالمجد الرياضي والإمبراطوري القديم مع مسار مشي ساحر على تلة فيلوبابوس وعشاء كلاسيكي بمحاذاة البارثينون.",
    stops: [
      {
        titleAr: "معبد زيوس الأولمبي وقوس هادريان",
        titleEn: "Temple of Olympian Zeus & Hadrian's Arch",
        slotAr: "الصباح (09:30)",
        kind: "attraction",
        lat: 37.9693,
        lng: 23.7331,
        visitMinutes: 100,
        rating: 4.7,
        detailAr: "بقايا أضخم معبد في اليونان القديمة بأعمدته الكورنثية الشاهقة وبوابة هادريان الرخامية الفاصلة بين المدينة الإغريقية والرومانية.",
        image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800",
      },
      {
        titleAr: "استاد باناثينايك الرخامي الأولمبي",
        titleEn: "Panathenaic Stadium (Kallimarmaro)",
        slotAr: "الظهيرة (12:30)",
        kind: "attraction",
        lat: 37.9686,
        lng: 23.7411,
        visitMinutes: 120,
        rating: 4.8,
        detailAr: "الملعب الرخامي التاريخي مهد الألعاب الأولمبية الحديثة 1896، مع إمكانية الجري على مضماره وزيارة متحف الشعلة الأولمبية.",
        image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
      },
      {
        titleAr: "تلة فيلوبابوس ومطعم ستروفي التراثي",
        titleEn: "Philopappos Hill & Strofi Acropolis View Dining",
        slotAr: "المساء (17:30)",
        kind: "restaurant",
        lat: 37.9672,
        lng: 23.7214,
        visitMinutes: 150,
        rating: 4.8,
        detailAr: "أجمل نقطة مراقبة طبيعية للغروب تطل مباشرة على واجهة البارثينون مع عشاء راقٍ يقدم أشهر أطباق الميزيه اليونانية.",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
      },
    ],
  },
  {
    day: 5,
    themeAr: "كنوز المتحف الأثري الوطني وتذوق سوق فارفاكيوس المركزي",
    themeEn: "National Archaeological Museum & Central Food Market",
    morningAr: "جولة متعمقة في المتحف الأثري الوطني الأكبر في اليونان لمشاهدة قناع أجاممنون الذهبي وآلية أنتيكيثيرا الأثرية.",
    afternoonAr: "زيارة حسية ممتعة لسوق فارفاكيوس المركزي للمأكولات والبهارات وزيت الزيتون وتذوق الجبن الفيتا والزيتون الكالاماتا.",
    eveningAr: "استكشاف شوارع حي بسيري (Psyrri) الفني النابض بالجداريات وتناول العشاء وتذوق السوفلاكي العريق في مطعم أو كوستاس التاريخي.",
    narrativeAr: "انغماس ثقافي وتذوقي في قلب أثينا يجمع أندر كنوز الحضارة الهيلينية مع النكهات والروائح الطازجة في أسواق العاصمة العريقة.",
    stops: [
      {
        titleAr: "المتحف الأثري الوطني بأثينا",
        titleEn: "National Archaeological Museum",
        slotAr: "الصباح (09:30)",
        kind: "attraction",
        lat: 37.9890,
        lng: 23.7326,
        visitMinutes: 180,
        rating: 4.9,
        detailAr: "واحد من أعظم متاحف العالم يضم أكثر من 11 ألف تحفة أثرية تغطي تاريخ اليونان من عصور ما قبل التاريخ حتى العصر الروماني.",
        image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800",
      },
      {
        titleAr: "سوق فارفاكيوس المركزي للمأكولات",
        titleEn: "Varvakios Central Municipal Food Market",
        slotAr: "الظهيرة (13:30)",
        kind: "shopping",
        lat: 37.9808,
        lng: 23.7275,
        visitMinutes: 100,
        rating: 4.7,
        detailAr: "السوق التاريخي المغطى الذي شيد عام 1886، يزخر بمحلات التوابل العطرية وأجود أنواع العسل اليوناني والمأكولات البحرية الطازجة.",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
      },
      {
        titleAr: "حي بسيري للفنون ومطعم أو كوستاس",
        titleEn: "Psyrri Bohemian Quarter & O Kostas Souvlaki",
        slotAr: "المساء (17:30)",
        kind: "restaurant",
        lat: 37.9785,
        lng: 23.7240,
        visitMinutes: 120,
        rating: 4.8,
        detailAr: "حي الفنون المعاصرة والمقاهي المضيئة وتذوق السوفلاكي التاريخي المصنوع يدوياً منذ عام 1950 مع الخبز البيتا المشوي.",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
      },
    ],
  },
  {
    day: 6,
    themeAr: "ريفييرا أثينا الساحرة وبحيرة فوليجميني الحرارية الطبيعية",
    themeEn: "Athens Riviera Coastal Drive & Lake Vouliagmeni Spa",
    morningAr: "الانطلاق بسيارة VIP على طول كورنيش ريفييرا أثينا الساحلي والتوقف في مارينا فليفوس لمشاهدة اليخوت الفاخرة والاستمتاع بالنسيم البحري.",
    afternoonAr: "قضاء وقت استرخائي فاخر في بحيرة فوليجميني الحرارية الطبيعية المحاطة بمنحدرات صخرية مهيبة وتجربة السبا الطبيعي بمياهها الكبريتية الدافئة.",
    eveningAr: "تناول وجبة عشاء بحرية استثنائية من صيد اليوم الطازج في مطعم إيثاكي الفاخر المطل على خليج فوليجميني الساحر.",
    narrativeAr: "يوم مخصص للراحة والرفاهية المطلقة على مياه البحر الأبيض المتوسط الفيروزية بين مارينا اليخوت والبحيرة الحرارية ومطاعم المأكولات البحرية.",
    stops: [
      {
        titleAr: "مارينا فليفوس وكورنيش الريفييرا",
        titleEn: "Flisvos Marina & Riviera Coastal Promenade",
        slotAr: "الصباح (10:00)",
        kind: "attraction",
        lat: 37.9333,
        lng: 23.6842,
        visitMinutes: 120,
        rating: 4.7,
        detailAr: "أرقى مارينا لليخوت السوبر في أثينا مع ممشى مشجر ومقاهي شاطئية أنيقة تطل على مياه الخليج الصافية.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      },
      {
        titleAr: "بحيرة فوليجميني الحرارية الطبيعية",
        titleEn: "Lake Vouliagmeni Natural Thermal Spa",
        slotAr: "الظهيرة (13:00)",
        kind: "nature",
        lat: 37.8075,
        lng: 23.7858,
        visitMinutes: 180,
        rating: 4.9,
        detailAr: "أعجوبة بيئية مصنفة كأثر طبيعي تحافظ على درجة حرارة 24 مئوية طوال العام مع مياه معدنية علاجية وأسماك غارّا روفا الطبيعية.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      },
      {
        titleAr: "مطعم إيثاكي البحري الفاخر بفوليجميني",
        titleEn: "Ithaki Luxury Seafood Restaurant Vouliagmeni",
        slotAr: "المساء (18:00)",
        kind: "restaurant",
        lat: 37.8130,
        lng: 23.7780,
        visitMinutes: 150,
        rating: 4.9,
        detailAr: "وجهة الملوك والمشاهير العالمية لتناول الأسماك الطازجة والمحار على شرفة خشبية معلقة فوق مياه الريفييرا الأثينية.",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      },
    ],
  },
  {
    day: 7,
    themeAr: "رحلة كيب سونيون ومعبد بوسيدون وميناء ميكروليمانو",
    themeEn: "Cape Sounion, Temple of Poseidon & Piraeus Mikrolimano",
    morningAr: "جولة صباحية في ميناء ميكروليمانو التاريخي بمدينة بيرايوس البحرية والتقاط أجمل الصور بين قوارب الصيد التقليدية.",
    afternoonAr: "رحلة طريق ساحلية بانورامية مذهلة تقطع أقصى الطرف الجنوبي لشبه جزيرة أتيكا وصولاً إلى رأس كيب سونيون الشاهق.",
    eveningAr: "زيارة معبد إله البحار بوسيدون المنتصب فوق جرف صخري بارتفاع 65 متراً وتأمل أروع مشهد لغروب الشمس في اليونان مع عشاء وداع ملكي.",
    narrativeAr: "خاتمة ملكية مبهرة تجمع بين روح الملاحة الإغريقية في بيرايوس وجلال معبد بوسيدون المعلق فوق مياه بحر إيجه وقت الغروب.",
    stops: [
      {
        titleAr: "ميناء ميكروليمانو التاريخي في بيرايوس",
        titleEn: "Mikrolimano Marina Harbour Piraeus",
        slotAr: "الصباح (10:00)",
        kind: "attraction",
        lat: 37.9378,
        lng: 23.6603,
        visitMinutes: 120,
        rating: 4.7,
        detailAr: "ميناء بحري عريق مرصوف بالحجارة يمتلئ بالمقاهي المطلة على المياه واليخوت الراسية ومباني العمارة الكلاسيكية.",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
      },
      {
        titleAr: "معبد بوسيدون في كيب سونيون",
        titleEn: "Temple of Poseidon at Cape Sounion",
        slotAr: "الظهيرة (14:30)",
        kind: "attraction",
        lat: 37.6501,
        lng: 24.0245,
        visitMinutes: 150,
        rating: 4.9,
        detailAr: "أعمدة رخامية بيضاء شاهقة تعود للقرن الخامس قبل الميلاد منتصبة فوق جرف بحري دراماتيكي يطل على بحر إيجه والجزر المحيطة.",
        image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800",
      },
      {
        titleAr: "عشاء الوداع في مطعم تافيرنا سونيون البانورامي",
        titleEn: "Cape Sounion Panoramic Farewell Taverna",
        slotAr: "المساء (18:30)",
        kind: "restaurant",
        lat: 37.6520,
        lng: 24.0260,
        visitMinutes: 120,
        rating: 4.8,
        detailAr: "تناول وجبة عشاء وداع ملكية تشمل المأكولات اليونانية والحلويات التراثية في مواجهة قرص الشمس الغارب في مياه بحر إيجه.",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      },
    ],
  },
];

export function buildDynamicItineraryFromGooglePlaces(
  dest: string,
  daysCount: number,
  places: DiscoveredPlace[]
): GeminiDayRaw[] {
  const safePlaces = Array.isArray(places) && places.length > 0 ? places : [];
  if (safePlaces.length === 0) {
    const curated = getCuratedCityDays(dest, daysCount);
    if (curated.length > 0 && curated[0]?.stops?.length > 0) {
      return curated;
    }
  }
  const days: GeminiDayRaw[] = [];

  for (let i = 0; i < daysCount; i++) {
    const dayNum = i + 1;
    const startIndex = (i * 3) % Math.max(1, safePlaces.length);
    const dayPlaces = safePlaces.slice(startIndex, startIndex + 3);
    if (dayPlaces.length < 3 && safePlaces.length > 0) {
      for (const p of safePlaces) {
        if (dayPlaces.length >= 3) break;
        if (!dayPlaces.some((dp) => dp.id === p.id)) {
          dayPlaces.push(p);
        }
      }
    }

    const p1 = dayPlaces[0];
    const p2 = dayPlaces[1] || p1;
    const p3 = dayPlaces[2] || p2;

    const themeAr = p1 ? `استكشاف ${p1.titleAr} وأبرز معالم ${dest}` : `جولة سياحية استكشافية متكاملة في ${dest}`;
    const themeEn = p1 ? `Discovering ${p1.titleEn} & Highlights of ${dest}` : `Highlights of ${dest}`;

    const stops: GeminiStopRaw[] = [];
    if (p1) {
      stops.push({
        titleAr: p1.titleAr,
        titleEn: p1.titleEn,
        kind: p1.kind,
        slotAr: "الصباح (09:30)",
        visitMinutes: p1.visitMinutes || 150,
        lat: p1.lat,
        lng: p1.lng,
        rating: p1.rating,
        reviews: p1.reviewsCount,
        image: p1.image,
        detailAr: p1.detailAr,
        detailEn: p1.detailEn,
      });
    }
    if (p2 && (p2.id !== p1?.id || dayPlaces.length === 1)) {
      stops.push({
        titleAr: p2.titleAr,
        titleEn: p2.titleEn,
        kind: p2.kind,
        slotAr: "الظهيرة (13:00)",
        visitMinutes: p2.visitMinutes || 120,
        lat: p2.lat,
        lng: p2.lng,
        rating: p2.rating,
        reviews: p2.reviewsCount,
        image: p2.image,
        detailAr: p2.detailAr,
        detailEn: p2.detailEn,
      });
    }
    if (p3 && ((p3.id !== p1?.id && p3.id !== p2?.id) || dayPlaces.length === 1)) {
      stops.push({
        titleAr: p3.titleAr,
        titleEn: p3.titleEn,
        kind: p3.kind,
        slotAr: "المساء (17:30)",
        visitMinutes: p3.visitMinutes || 120,
        lat: p3.lat,
        lng: p3.lng,
        rating: p3.rating,
        reviews: p3.reviewsCount,
        image: p3.image,
        detailAr: p3.detailAr,
        detailEn: p3.detailEn,
      });
    }

    days.push({
      day: dayNum,
      themeAr,
      themeEn,
      morningAr: p1 ? `انطلاقة صباحية في ${p1.titleAr}: ${p1.detailAr}` : `جولة صباحية لاستكشاف معالم ${dest}.`,
      afternoonAr: p2 ? `فترة الظهيرة في ${p2.titleAr}: ${p2.detailAr}` : `استراحة وتناول الغداء واستكمال الجولة.`,
      eveningAr: p3 ? `أمسية ساحرة في ${p3.titleAr}: ${p3.detailAr}` : `أمسية هادئة وتناول العشاء والعودة للفندق.`,
      narrativeAr: `يوم استثنائي في ${dest} يبدأ من ${p1?.titleAr || dest} ثم التوجه إلى ${p2?.titleAr || dest} وختام اليوم في ${p3?.titleAr || dest} برفقة سائقنا الخاص بسيارة مرسيدس فيتو VIP.`,
      stops,
    });
  }

  return days;
}

export function getCuratedCityDays(dest: string, count: number): GeminiDayRaw[] {
  const norm = (dest || "").trim().toLowerCase();
  if (/cairo|القاهرة|قاهرة|giza|جيزة|مصر|egypt/i.test(norm)) {
    return CAIRO_ICONIC_DAYS.slice(0, count);
  }
  if (/marrakech|marrakesh|مراكش/i.test(norm)) {
    return MARRAKECH_ICONIC_DAYS.slice(0, count);
  }
  if (/antalya|أنطاليا|انطاليا|kaleiçi|كونيالتي/i.test(norm)) {
    return ANTALYA_ICONIC_DAYS.slice(0, count);
  }
  if (/trabzon|طرابزون|أوزنجول|uzungol|آيدر|ayder/i.test(norm)) {
    return TRABZON_ICONIC_DAYS.slice(0, count);
  }
  if (/bursa|بورصة|بورصه|uludag|أولوداغ/i.test(norm)) {
    return BURSA_ICONIC_DAYS.slice(0, count);
  }
  if (/cappadocia|كابادوكيا|كبادوكيا|goreme|غوريم/i.test(norm)) {
    return CAPPADOCIA_ICONIC_DAYS.slice(0, count);
  }
  if (/istanbul|إسطنبول|اسطنبول/i.test(norm)) {
    return ISTANBUL_ICONIC_DAYS.slice(0, count);
  }
  if (/athens|أثينا|اثينا|اليونان|greece|ath\b/i.test(norm)) {
    return ATHENS_ICONIC_DAYS.slice(0, count);
  }
  return buildDynamicItineraryFromGooglePlaces(dest, count, []);
}

export function getCairoIconicDays(count: number): GeminiDayRaw[] {
  return getCuratedCityDays("cairo", count);
}

export async function generateIconicItinerary(
  intake: PlannerIntake,
  centerLat: number,
  centerLng: number,
  agentDays?: Array<{ day?: number; titleAr?: string; titleEn?: string; items?: any[] }>
): Promise<PlannerTrip | null> {
  const dest = String(intake.destination || "").trim();
  if (!dest) return null;

  const daysCount = Math.min(30, Math.max(1, intake.durationDays || agentDays?.length || 5));
  const radiusKm = intake.radiusKm || 25;
  const styleStr = intake.prefs?.style || "cultural";
  const companionStr = intake.prefs?.companion || "family";
  const notesStr = intake.prefs?.notes || "";
  const isCairo = /cairo|قاهرة|مصر|egypt|giza|جيزة/i.test(dest);

  const systemInstruction = `You are the Master Travel Designer for Lonaliza Luxury Tours, creating world-class travel itineraries matching and exceeding the quality of Trip.com.
Target Destination: "${dest}" (approx lat: ${centerLat || 30.0}, lng: ${centerLng || 31.2}, exploration radius: ${radiusKm} km).
Primary Transport Mode: Private VIP Mercedes Vito Chauffeur (luxury vehicle, not walking).

CRITICAL CONCIERGE RULES:
1. FULL ITINERARY DURATION (MANDATORY):
   - You MUST generate an array with EXACTLY ${daysCount} separate day objects inside "days" (one complete object for each day, numbered day: 1, day: 2, ..., day: ${daysCount}).
   - Absolutely NEVER output only 1 day or stop early when ${daysCount} days are requested. The array MUST have length ${daysCount}.
2. ONLY CELEBRATED, TIER-1 ICONIC LANDMARKS (WITHIN ${radiusKm} KM RADIUS):
   - Include globally renowned monuments, UNESCO World Heritage sites, famous museums, celebrated historic quarters, panoramic viewpoints, and authentic traditional restaurants within the ${radiusKm} km radius.
   - ABSOLUTELY NEVER output obscure administrative offices, postal museums, racing clubs, medical/geological museums, or generic residential suburbs.
3. GEOGRAPHIC COHERENCE & STRICT NEIGHBORHOOD CLUSTERING:
   - All stops in a single day MUST be clustered within a maximum 15–20 km radius (or within the same historic quarter / geographic district).
   - NEVER combine distant ends of a sprawling metropolis on the same day (e.g. for Istanbul: NEVER combine Pierre Loti / Eyüp with distant Büyükçekmece / Beylikdüzü on the same day; dedicate entire separate days for the Asian Side / Kadıköy / Üsküdar, historical Sultanahmet / Fatih, Bosphorus shoreline / Bebek / Ortaköy, and full-day out-of-city excursions like Sapanca / Maşukiye or Bursa / Uludağ).
   - Arrange stops in clean chronological sequence (Morning -> Afternoon -> Evening) with minimal driving time.
4. VIP PRIVATE TRANSPORTATION & 10-HOUR CHAUFFEUR LOGISTICS:
   - Seamless door-to-door VIP pickup by a luxury Mercedes-Benz Vito with a dedicated private chauffeur (10 hours daily).
   - Daily descriptions must reflect scenic VIP rides between clustered sights and stress-free drop-off at luxury hotels.
5. TRIP.COM STRUCTURED DAILY BREAKDOWN:
   - Each day MUST have:
     * morningAr: 1-2 vivid, sensory sentences describing the morning landmark and breakfast/cafe.
     * afternoonAr: 1-2 vivid sentences describing afternoon monuments, authentic dining, and cultural discovery.
     * eveningAr: 1-2 vivid sentences describing sunset views, evening bazaars, dinner, and return to hotel.
     * narrativeAr: Combined polished narrative.
5. STOPS: Exactly 3 to 4 stops per day with realistic coordinates, realistic ratings (4.7-4.9), reviews count, and clear kind ("attraction" | "restaurant" | "cafe" | "shopping" | "viewpoint").
6. Output clean, valid JSON only.`;

  const [googlePlacesResult, wikivoyage] = await Promise.all([
    discoverDestinationPlacesLive(dest, {
      daysCount,
      centerLat,
      centerLng,
    }).catch(() => null),
    fetchWikivoyageGuide(dest).catch(() => null),
  ]);

  const discoveredPlaces = googlePlacesResult?.places || [];

  const placesText = discoveredPlaces.length
    ? `Verified Google Maps Places in ${dest} (GPS Coordinates, High-Res Photos, Real Ratings):\n${discoveredPlaces
        .map((p) => `- [${p.titleAr} | ${p.titleEn}] (Coords: ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}, Category: ${p.category}, Rating: ${p.rating}★, Slot: ${p.recommendedSlot}, Photo: ${p.image})`)
        .join("\n")}`
    : "";

  const wikivoyageText = wikivoyage
    ? `Curated Gastronomy & Travel Intelligence (Wikivoyage):\n- Signature Dining: ${wikivoyage.eat.slice(0, 6).join(" • ") || "Local authentic restaurants"}\n- Historic Cafes: ${wikivoyage.drink.slice(0, 5).join(" • ") || "Scenic cafes"}\n- Insider Notes: ${wikivoyage.tips.slice(0, 3).join(" • ") || "Private chauffeur routing"}`
    : "";

  const prompt = `Design an unforgettable, high-end ${daysCount}-day vacation itinerary for: "${dest}".
Target style: ${styleStr}, Travelers: ${companionStr}.
${notesStr ? `Special preferences: ${notesStr}` : ""}
${agentDays && agentDays.length > 0 ? `Proposed day themes to follow:\n${agentDays.map((a) => `- Day ${a.day}: ${a.titleAr || a.titleEn}`).join("\n")}` : ""}

${placesText}

${wikivoyageText}

CRITICAL REQUIREMENT: Output EXACTLY ${daysCount} distinct days in the "days" array (from day 1 to day ${daysCount}).
Strictly cluster all stops of each day within a 15-20 km geographic zone. Do NOT cross unrelated far ends of the city in one day.

Return valid JSON with this exact structure:
{
  "titleAr": "${dest} — رحلة الأحلام الفاخرة ${daysCount} أيام",
  "titleEn": "${dest} — ${daysCount} Days VIP Journey",
  "destination": "${dest}",
  "days": [
    // Array of EXACTLY ${daysCount} objects (day 1 through day ${daysCount}):
    {
      "day": 1,
      "themeAr": "عنوان اليوم الساحر والمعالم الرئيسية",
      "themeEn": "Day Theme & Main Landmarks",
      "morningAr": "الصباح: وصف شائق لزيارة المعلم الصباحي الأيقوني وتناول القهوة التراثية.",
      "afternoonAr": "الظهيرة: جولة في المعلم الثاني وتناول الغداء في مطعم محلي عريق.",
      "eveningAr": "المساء: الاستمتاع بنسيم المساء وإطلالة الغروب وجولة في السوق/العشاء ثم الراحة بالفندق.",
      "narrativeAr": "سرد كامل يجمع فقرات الصباح والظهيرة والمساء بأسلوب سياحي راقٍ وجذاب.",
      "narrativeEn": "Evocative English narrative",
      "stops": [
        {
          "titleAr": "اسم المعلم أو المطعم بالعربية",
          "titleEn": "Official Name of Spot",
          "kind": "attraction",
          "slotAr": "الصباح (09:30)",
          "slotEn": "Morning (09:30 AM)",
          "visitMinutes": 120,
          "lat": ${centerLat || 30.04},
          "lng": ${centerLng || 31.23},
          "detailAr": "نبذة جذابة عن تجربة الزائر وما يراه أو يتذوقه.",
          "culinaryNoteAr": "توصية خاصة للطبق أو القهوة",
          "rating": 4.9,
          "reviews": 18500
        }
      ]
    }
  ],
  "tipsAr": [
    "البرنامج منسق بسيارة خاصة وسائق VIP مع جدول مريح يربط المعالم والمطاعم دون إرهاق.",
    "يُنصح بالحجز المسبق للتذاكر الرئيسية وتفادي أوقات الذروة.",
    "الأمسيات مخصصة للراحة وتذوق الأطباق المحلية في أشهر الأحياء التراثية."
  ],
  "tipsEn": [
    "Curated VIP itinerary with private vehicle and chauffeur connecting landmarks, dining, and scenic views.",
    "Advance ticket booking for top attractions is highly recommended.",
    "Evenings are curated for local gastronomy and relaxed strolls before returning to your hotel."
  ]
}`;

  try {
    const aiRes = await generateGeminiContent<GeminiItineraryPayload>({
      prompt,
      systemInstruction,
      temperature: 0.6,
      maxTokens: 8192,
      responseMimeType: "application/json",
      timeoutMs: 35000,
      preferredModel: "gemini-3.6-flash",
    });

    let payload: GeminiItineraryPayload | null = aiRes.data || null;

    if (!payload || !Array.isArray(payload.days) || payload.days.length === 0) {
      const curated = getCuratedCityDays(dest, daysCount);
      const fallbackDays =
        curated.length > 0
          ? curated
          : buildDynamicItineraryFromGooglePlaces(dest, daysCount, discoveredPlaces);
      payload = {
        titleAr: `${dest} — رحلة الأحلام الفاخرة ${daysCount} أيام`,
        titleEn: `${dest} — ${daysCount} Days VIP Journey`,
        destination: dest,
        days: fallbackDays,
      };
    }

    // Ensure payload has all requested days without truncation
    if (payload.days.length < daysCount) {
      const curated = getCuratedCityDays(dest, daysCount);
      const dynamicDays =
        curated.length > 0
          ? curated
          : buildDynamicItineraryFromGooglePlaces(dest, daysCount, discoveredPlaces);
      while (payload.days.length < daysCount) {
        const nextIdx = payload.days.length;
        const template = dynamicDays[nextIdx % dynamicDays.length];
        payload.days.push({
          ...template,
          day: nextIdx + 1,
        });
      }
    }

    // Reconstruct enriched days with accurate, verified photos per stop
    const days: PlannerDay[] = await Promise.all(
      payload.days.map(async (d) => {
        const validStops = (d.stops || []).filter((s) => s.titleEn || s.titleAr);
        const stops: PlannerStop[] = await Promise.all(
          validStops.map(async (s, sIdx) => {
            const query = s.titleEn || s.titleAr || "";
            let photo = s.image;
            const matchedPlace = discoveredPlaces.find(
              (p) =>
                p.titleEn.toLowerCase() === query.toLowerCase() ||
                p.titleAr === s.titleAr ||
                (p.titleEn && query.toLowerCase().includes(p.titleEn.toLowerCase()))
            );
            if (matchedPlace?.image && (!photo || isGenericStockPhoto(photo))) {
              photo = matchedPlace.image;
            }
            if (!photo || isGenericStockPhoto(photo)) {
              photo = await photoForPlace(query, dest, s.titleAr, s.kind || "attraction");
            }
            if (!photo || isGenericStockPhoto(photo)) {
              photo = getSafeAttractionFallback(s.kind, dest);
            }

            const stopLat = validLatLng(s.lat || 0, s.lng || 0) ? Number(s.lat) : centerLat;
            const stopLng = validLatLng(s.lat || 0, s.lng || 0) ? Number(s.lng) : centerLng;

            const detail = s.detailAr
              ? s.culinaryNoteAr
                ? `${s.detailAr} • تذوق: ${s.culinaryNoteAr}`
                : s.detailAr
              : s.culinaryNoteAr || "";

            return {
              id: uid("iconic"),
              day: d.day,
              order: sIdx + 1,
              kind: (s.kind as any) || "attraction",
              titleAr: s.titleAr || s.titleEn,
              titleEn: s.titleEn || s.titleAr,
              detailAr: detail,
              detailEn: s.detailEn,
              lat: stopLat,
              lng: stopLng,
              image: photo,
              visitMinutes: s.visitMinutes || 75,
              addedToDay: d.day,
              slotAr: s.slotAr || (sIdx === 0 ? "الصباح" : sIdx === 1 ? "الظهيرة" : "المساء"),
              slotEn: s.slotEn || "Daytime",
              rating: s.rating || 4.9,
              reviews: s.reviews || 14200,
            };
          })
        );
        const structuredNotes = [
          d.morningAr ? `• ${d.morningAr.replace(/^•\s*/, "")}` : "",
          d.afternoonAr ? `• ${d.afternoonAr.replace(/^•\s*/, "")}` : "",
          d.eveningAr ? `• ${d.eveningAr.replace(/^•\s*/, "")}` : "",
        ].filter(Boolean).join("\n\n") || d.narrativeAr || "";

        return {
          day: d.day,
          titleAr: d.themeAr || `اليوم ${d.day}`,
          titleEn: d.themeEn || `Day ${d.day}`,
          notes: structuredNotes,
          stops,
          legs: buildLegs(stops, "car"),
        };
      })
    );

    return {
      id: uid("trip"),
      titleAr: payload.titleAr || `${dest} — ${daysCount} أيام فاخرة متكاملة`,
      titleEn: payload.titleEn || `${dest} — ${daysCount} Days VIP Journey`,
      origin: intake.origin,
      destination: dest,
      durationDays: daysCount,
      arrivalDate: intake.arrivalDate,
      departureDate: intake.departureDate,
      prefs: intake.prefs,
      days,
      later: [],
      discover: [],
      notes: intake.prefs?.notes,
      tipsAr: payload.tipsAr?.length
        ? payload.tipsAr
        : [
            `البرنامج منسق بسيارة خاصة مع سائق VIP لربط المعالم والمطاعم والمقاهي دون عناء التنقل.`,
            "يُنصح بالحجز المسبق لتذاكر المتاحف الكبرى وحجوزات التراتوريات الشهيرة لتفادي الانتظار.",
            "جولات المساء مخصصة لتذوق الأطباق المحلية ومناظر الغروب في الساحات والأحياء العريقة.",
          ],
      tipsEn: payload.tipsEn?.length
        ? payload.tipsEn
        : [
            `Curated VIP itinerary with private Mercedes chauffeur connecting landmarks, historic cafes, and dining.`,
            "Advance booking for major museums and top restaurants is recommended.",
            "Evening strolls are curated for local gastronomy and sunset views in celebrated quarters.",
          ],
      defaultMode: "car",
      center: { lat: centerLat, lng: centerLng },
    };
  } catch (err) {
    console.error("[generateIconicItinerary] Error:", err);
    return null;
  }
}
