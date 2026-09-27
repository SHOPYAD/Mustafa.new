// src/app/api/transfers/driver/ai-route-agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteDefinition {
  fromNameAr: string;
  fromNameEn: string;
  toNameAr: string;
  toNameEn: string;
  distanceKm: number;
  durationMinutes: number;
  category: "airport_arrival" | "airport_departure" | "intercity" | "tourism";
}

// Master Turkey Geographic Route Matrix
const TURKEY_CITY_ROUTES: Record<string, RouteDefinition[]> = {
  istanbul: [
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "تقسيم وبيوغلو", toNameEn: "Taksim & Beyoglu", distanceKm: 42, durationMinutes: 45, category: "airport_arrival" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "السلطان أحمد والفاتح", toNameEn: "Sultanahmet & Fatih", distanceKm: 46, durationMinutes: 50, category: "airport_arrival" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "بشكتاش وأورتاكوي والبسفور", toNameEn: "Besiktas & Ortakoy", distanceKm: 40, durationMinutes: 42, category: "airport_arrival" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "شيشلي ومجدية كوي", toNameEn: "Sisli & Mecidiyekoy", distanceKm: 38, durationMinutes: 40, category: "airport_arrival" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "كاديكوي (الجانب الآسيوي)", toNameEn: "Kadikoy (Asian Side)", distanceKm: 58, durationMinutes: 60, category: "airport_arrival" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "باشاك شهير ومول أوف إسطنبول", toNameEn: "Basaksehir & Mall of Istanbul", distanceKm: 28, durationMinutes: 30, category: "airport_arrival" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "بيليك دوزو ومعرض توياب", toNameEn: "Beylikduzu & Tuyap", distanceKm: 48, durationMinutes: 45, category: "airport_arrival" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "صبنجة والمعشوقية", toNameEn: "Sapanca & Masukiye", distanceKm: 142, durationMinutes: 110, category: "intercity" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "مدينة بورصة الخضراء", toNameEn: "Bursa City Center", distanceKm: 165, durationMinutes: 125, category: "intercity" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "يلوا وبورصة البحرية", toNameEn: "Yalova Marina & Thermal", distanceKm: 115, durationMinutes: 90, category: "intercity" },
    { fromNameAr: "مطار صبيحة كوكجن (SAW)", fromNameEn: "Sabiha Gokcen Airport (SAW)", toNameAr: "تقسيم وبيوغلو", toNameEn: "Taksim & Beyoglu", distanceKm: 48, durationMinutes: 55, category: "airport_arrival" },
    { fromNameAr: "مطار صبيحة كوكجن (SAW)", fromNameEn: "Sabiha Gokcen Airport (SAW)", toNameAr: "السلطان أحمد والفاتح", toNameEn: "Sultanahmet & Fatih", distanceKm: 52, durationMinutes: 60, category: "airport_arrival" },
    { fromNameAr: "مطار صبيحة كوكجن (SAW)", fromNameEn: "Sabiha Gokcen Airport (SAW)", toNameAr: "كاديكوي وأوسكودار", toNameEn: "Kadikoy & Uskudar", distanceKm: 32, durationMinutes: 35, category: "airport_arrival" },
    { fromNameAr: "مطار صبيحة كوكجن (SAW)", fromNameEn: "Sabiha Gokcen Airport (SAW)", toNameAr: "صبنجة والمعشوقية", toNameEn: "Sapanca & Masukiye", distanceKm: 95, durationMinutes: 75, category: "intercity" },
    { fromNameAr: "مطار صبيحة كوكجن (SAW)", fromNameEn: "Sabiha Gokcen Airport (SAW)", toNameAr: "مدينة بورصة عبر الجسر", toNameEn: "Bursa via Osmangazi Bridge", distanceKm: 120, durationMinutes: 90, category: "intercity" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "مطار صبيحة كوكجن (SAW)", toNameEn: "Sabiha Gokcen Airport (SAW)", distanceKm: 84, durationMinutes: 75, category: "intercity" },
    { fromNameAr: "تقسيم وبيوغلو", fromNameEn: "Taksim Center", toNameAr: "بحيرة صبنجة والريف التركي", toNameEn: "Sapanca Lake & Countryside", distanceKm: 135, durationMinutes: 105, category: "tourism" },
    { fromNameAr: "السلطان أحمد والفاتح", fromNameEn: "Sultanahmet", toNameAr: "مدينة بورصة وتلفريك أولوداغ", toNameEn: "Bursa & Uludag Cable Car", distanceKm: 155, durationMinutes: 120, category: "tourism" },
    { fromNameAr: "تقسيم وبيوغلو", fromNameEn: "Taksim", toNameAr: "شواطئ شيلا وأغوا والريف الهادئ", toNameEn: "Sile & Agva Coastal", distanceKm: 86, durationMinutes: 75, category: "tourism" },
    { fromNameAr: "مطار إسطنبول الدولي (IST)", fromNameEn: "Istanbul Airport (IST)", toNameAr: "أتاكوي وبكركوي ومرمراي", toNameEn: "Atakoy & Bakirkoy Marina", distanceKm: 42, durationMinutes: 40, category: "airport_arrival" },
  ],
  trabzon: [
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "مركز طرابزون وميدان أتاتورك", toNameEn: "Trabzon City Center (Meydan)", distanceKm: 8, durationMinutes: 15, category: "airport_arrival" },
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "يومرا وكاشوستو والفنادق الفاخرة", toNameEn: "Yomra & Kasustu Hotels", distanceKm: 11, durationMinutes: 14, category: "airport_arrival" },
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "أكشابات ومنطقة سرايا كوي", toNameEn: "Akcaabat Coastal Town", distanceKm: 22, durationMinutes: 25, category: "airport_arrival" },
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "بحيرة أوزنجول وفنادق الأكواخ", toNameEn: "Uzungol Lake & Bungalows", distanceKm: 92, durationMinutes: 80, category: "tourism" },
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "مرتفعات آيدر وريزا (Ayder)", toNameEn: "Ayder Plateau (Rize)", distanceKm: 155, durationMinutes: 125, category: "tourism" },
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "دير سوميلا التاريخي وماتشكا", toNameEn: "Sumela Monastery (Macka)", distanceKm: 52, durationMinutes: 50, category: "tourism" },
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "مرتفعات حيدر نبي ومغارة تشال", toNameEn: "Hidirnebi Plateau & Cal Cave", distanceKm: 48, durationMinutes: 55, category: "tourism" },
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "مدينة ريزا وساحل البحر الأسود", toNameEn: "Rize City Center", distanceKm: 78, durationMinutes: 65, category: "intercity" },
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "مرتفعات السلطان مراد", toNameEn: "Sultan Murat Plateau", distanceKm: 105, durationMinutes: 95, category: "tourism" },
    { fromNameAr: "مطار طرابزون الدولي (TZX)", fromNameEn: "Trabzon Airport (TZX)", toNameAr: "منفذ سارب الحدودي وباتومي جورجيا", toNameEn: "Sarp Border & Batumi Georgia", distanceKm: 195, durationMinutes: 160, category: "intercity" },
  ],
  antalya: [
    { fromNameAr: "مطار أنطاليا الدولي (AYT)", fromNameEn: "Antalya Airport (AYT)", toNameAr: "مركز أنطاليا والمدينة القديمة (كالتشي)", toNameEn: "Antalya Center & Kaleici", distanceKm: 14, durationMinutes: 20, category: "airport_arrival" },
    { fromNameAr: "مطار أنطاليا الدولي (AYT)", fromNameEn: "Antalya Airport (AYT)", toNameAr: "لارا وشاطئ كوندو والمنتجعات", toNameEn: "Lara Beach & Kundu Resorts", distanceKm: 16, durationMinutes: 22, category: "airport_arrival" },
    { fromNameAr: "مطار أنطاليا الدولي (AYT)", fromNameEn: "Antalya Airport (AYT)", toNameAr: "بيليك ومنتجعات الجولف الفاخرة", toNameEn: "Belek Luxury Golf Resorts", distanceKm: 35, durationMinutes: 35, category: "airport_arrival" },
    { fromNameAr: "مطار أنطاليا الدولي (AYT)", fromNameEn: "Antalya Airport (AYT)", toNameAr: "كيمير وغوكتورك والخلجان الساحلية", toNameEn: "Kemer Coastal Resorts", distanceKm: 58, durationMinutes: 55, category: "tourism" },
    { fromNameAr: "مطار أنطاليا الدولي (AYT)", fromNameEn: "Antalya Airport (AYT)", toNameAr: "سيدي ومانافغات والشلالات", toNameEn: "Side & Manavgat Waterfalls", distanceKm: 65, durationMinutes: 60, category: "tourism" },
    { fromNameAr: "مطار أنطاليا الدولي (AYT)", fromNameEn: "Antalya Airport (AYT)", toNameAr: "مدينة ألانيا وقلعتها التاريخية", toNameEn: "Alanya City & Castle", distanceKm: 125, durationMinutes: 110, category: "intercity" },
    { fromNameAr: "مطار أنطاليا الدولي (AYT)", fromNameEn: "Antalya Airport (AYT)", toNameAr: "كاش وكالكان والساحل الفيروزي", toNameEn: "Kas & Kalkan Turquoise Coast", distanceKm: 205, durationMinutes: 190, category: "intercity" },
  ],
  cappadocia: [
    { fromNameAr: "مطار نوشهر كابادوكيا (NAV)", fromNameEn: "Nevsehir Airport (NAV)", toNameAr: "غوريمي وفنادق الكهوف الحجرية", toNameEn: "Goreme Cave Hotels", distanceKm: 38, durationMinutes: 40, category: "airport_arrival" },
    { fromNameAr: "مطار نوشهر كابادوكيا (NAV)", fromNameEn: "Nevsehir Airport (NAV)", toNameAr: "أورغوب وأوتشيسار", toNameEn: "Urgup & Uchisar", distanceKm: 44, durationMinutes: 45, category: "airport_arrival" },
    { fromNameAr: "مطار قيصري الدولي (ASR)", fromNameEn: "Kayseri Airport (ASR)", toNameAr: "غوريمي وأوتشيسار ووادي المناطيد", toNameEn: "Goreme & Balloon Valleys", distanceKm: 75, durationMinutes: 65, category: "airport_arrival" },
    { fromNameAr: "غوريمي وأوتشيسار", fromNameEn: "Goreme", toNameAr: "جبل إرجيس الثلجي وقيصري", toNameEn: "Mount Erciyes Ski Resort", distanceKm: 85, durationMinutes: 75, category: "tourism" },
  ],
  aegean: [
    { fromNameAr: "مطار ميلاس بودروم الدولي (BJV)", fromNameEn: "Milas-Bodrum Airport (BJV)", toNameAr: "مركز بودروم وقلعة القديس بطرس", toNameEn: "Bodrum Center & Castle", distanceKm: 36, durationMinutes: 35, category: "airport_arrival" },
    { fromNameAr: "مطار ميلاس بودروم الدولي (BJV)", fromNameEn: "Milas-Bodrum Airport (BJV)", toNameAr: "ياليكافاك مارينا الفاخرة", toNameEn: "Yalikavak Luxury Marina", distanceKm: 52, durationMinutes: 50, category: "airport_arrival" },
    { fromNameAr: "مطار ميلاس بودروم الدولي (BJV)", fromNameEn: "Milas-Bodrum Airport (BJV)", toNameAr: "غول تورك بوكو والخلجان الراقية", toNameEn: "Golturkbuku Elite Bays", distanceKm: 45, durationMinutes: 45, category: "airport_arrival" },
    { fromNameAr: "مطار دالامان الدولي (DLM)", fromNameEn: "Dalaman Airport (DLM)", toNameAr: "مركز فتحية ومارينا اليخوت", toNameEn: "Fethiye Center & Marina", distanceKm: 45, durationMinutes: 45, category: "airport_arrival" },
    { fromNameAr: "مطار دالامان الدولي (DLM)", fromNameEn: "Dalaman Airport (DLM)", toNameAr: "شاطئ أولودينيز والوادي الأزرق", toNameEn: "Oludeniz Blue Lagoon", distanceKm: 58, durationMinutes: 60, category: "tourism" },
    { fromNameAr: "مطار دالامان الدولي (DLM)", fromNameEn: "Dalaman Airport (DLM)", toNameAr: "غوجيك وخليج اليخوت الفاخرة", toNameEn: "Gocek Luxury Bays", distanceKm: 22, durationMinutes: 25, category: "airport_arrival" },
    { fromNameAr: "مطار دالامان الدولي (DLM)", fromNameEn: "Dalaman Airport (DLM)", toNameAr: "مركز مرمريس وكورنيش المارينا", toNameEn: "Marmaris Center & Marina", distanceKm: 95, durationMinutes: 85, category: "airport_arrival" },
    { fromNameAr: "مطار دالامان الدولي (DLM)", fromNameEn: "Dalaman Airport (DLM)", toNameAr: "شاطئ إيشميلير والخلجان الطبيعية", toNameEn: "Icmeler Beach & Bays", distanceKm: 105, durationMinutes: 95, category: "tourism" },
  ],
  southeast: [
    { fromNameAr: "مطار غازي عنتاب الدولي (GZT)", fromNameEn: "Gaziantep Airport (GZT)", toNameAr: "مركز غازي عنتاب ومتحف زيوغما", toNameEn: "Gaziantep Center & Zeugma", distanceKm: 18, durationMinutes: 25, category: "airport_arrival" },
    { fromNameAr: "مطار غازي عنتاب الدولي (GZT)", fromNameEn: "Gaziantep Airport (GZT)", toNameAr: "قلعة حلفيتي الرومية الغارقة ونهر الفرات", toNameEn: "Halfeti Sunken Castle", distanceKm: 105, durationMinutes: 90, category: "tourism" },
    { fromNameAr: "مطار شانلي أورفا (SFQ)", fromNameEn: "Sanliurfa Airport (SFQ)", toNameAr: "شانلي أورفا وبركة إبراهيم وغوبكلي تبه", toNameEn: "Sanliurfa & Gobeklitepe", distanceKm: 35, durationMinutes: 35, category: "airport_arrival" },
    { fromNameAr: "مطار ماردين الدولي (MQM)", fromNameEn: "Mardin Airport (MQM)", toNameAr: "ماردين القديمة والبيوت الحجرية ودير الزعفران", toNameEn: "Old Mardin Stone Mansions", distanceKm: 20, durationMinutes: 25, category: "airport_arrival" },
    { fromNameAr: "مطار ماردين الدولي (MQM)", fromNameEn: "Mardin Airport (MQM)", toNameAr: "مديات وقصور السريان التاريخية", toNameEn: "Midyat Historic Mansions", distanceKm: 78, durationMinutes: 70, category: "tourism" },
    { fromNameAr: "مطار دياربكر (DIY)", fromNameEn: "Diyarbakir Airport (DIY)", toNameAr: "دياربكر وأسوار سور التاريخية", toNameEn: "Diyarbakir Sur Fortress", distanceKm: 12, durationMinutes: 20, category: "airport_arrival" },
    { fromNameAr: "مطار فان (VAN)", fromNameEn: "Van Airport (VAN)", toNameAr: "بحيرة فان وجزيرة أختامار التاريخية", toNameEn: "Lake Van & Akdamar Island", distanceKm: 10, durationMinutes: 18, category: "airport_arrival" },
  ],
};

function normalizeCityKey(city?: string): string {
  const c = (city || "").toLowerCase();
  if (c.includes("trabzon") || c.includes("طرابزون") || c.includes("rize") || c.includes("ريزا")) return "trabzon";
  if (c.includes("antalya") || c.includes("أنطاليا") || c.includes("alanya") || c.includes("ألانيا") || c.includes("kemer") || c.includes("كيمير") || c.includes("belek") || c.includes("بيليك")) return "antalya";
  if (c.includes("cappadocia") || c.includes("كابادوكيا") || c.includes("nevsehir") || c.includes("نوشهر") || c.includes("kayseri") || c.includes("قيصري")) return "cappadocia";
  if (c.includes("aegean") || c.includes("bodrum") || c.includes("بودروم") || c.includes("fethiye") || c.includes("فتحية") || c.includes("marmaris") || c.includes("مرمريس")) return "aegean";
  if (c.includes("southeast") || c.includes("mardin") || c.includes("ماردين") || c.includes("urfa") || c.includes("أورفا") || c.includes("gaziantep") || c.includes("عنتاب") || c.includes("diyarbakir") || c.includes("دياربكر") || c.includes("van") || c.includes("فان")) return "southeast";
  return "istanbul";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supplierId = body.supplierId || req.headers.get("x-supplier-id") || "sup-lonaliza-official";
    const {
      message,
      city = "Istanbul",
      pricingModel,
      requestedCount,
      vehicleClassId = "vc-vito-vip",
      currency = "USD",
      action = "batch_generate",
    } = body;

    const cityKey = normalizeCityKey(city);
    const availablePool = TURKEY_CITY_ROUTES[cityKey] || TURKEY_CITY_ROUTES["istanbul"];

    // Fallback baseline pricing if none provided
    const shortPrice = Number(body.basePriceShort) || Number(pricingModel?.shortDistancePrice) || (cityKey === "trabzon" ? 35 : cityKey === "antalya" ? 40 : 55);
    const mediumPrice = Number(pricingModel?.mediumDistancePrice) || (cityKey === "trabzon" ? 65 : cityKey === "antalya" ? 65 : 75);
    const longPrice = Number(pricingModel?.longDistancePrice) || (cityKey === "trabzon" ? 110 : cityKey === "antalya" ? 110 : 130);
    const intercityBase = Number(pricingModel?.intercityBase) || 160;

    // Number of routes to process
    const count = Math.min(availablePool.length, Math.max(1, Number(body.routeCount) || Number(requestedCount) || 15));
    const selectedPool = availablePool.slice(0, count);

    const newlyCreated: any[] = [];
    const existingLinked: any[] = [];

    for (const rDef of selectedPool) {
      let calculatedPrice = shortPrice;
      if (rDef.distanceKm <= 30) {
        calculatedPrice = shortPrice;
      } else if (rDef.distanceKm <= 65) {
        calculatedPrice = mediumPrice;
      } else if (rDef.distanceKm <= 110) {
        calculatedPrice = longPrice;
      } else {
        calculatedPrice = Math.round(intercityBase + (rDef.distanceKm - 110) * 0.9);
      }

      const fromZoneSlug = `zone-${rDef.fromNameEn.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20)}`;
      const toZoneSlug = `zone-${rDef.toNameEn.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20)}`;

      // Auto register zones if not existing
      const existingZones = transferStore.getZones();
      if (!existingZones.some((z) => z.id === fromZoneSlug)) {
        transferStore.saveZone({
          id: fromZoneSlug,
          code: fromZoneSlug.toUpperCase().slice(0, 20),
          name: { ar: rDef.fromNameAr, en: rDef.fromNameEn, tr: rDef.fromNameEn },
          city: cityKey,
          region: cityKey,
          country: "Turkey",
          kind: rDef.category === "airport_arrival" ? "airport" : "district",
          center: { lat: 41.0, lng: 29.0 },
          radiusKm: 10,
          isActive: true,
        });
      }
      if (!existingZones.some((z) => z.id === toZoneSlug)) {
        transferStore.saveZone({
          id: toZoneSlug,
          code: toZoneSlug.toUpperCase().slice(0, 20),
          name: { ar: rDef.toNameAr, en: rDef.toNameEn, tr: rDef.toNameEn },
          city: cityKey,
          region: cityKey,
          country: "Turkey",
          kind: rDef.category === "airport_departure" ? "airport" : "district",
          center: { lat: 41.0, lng: 29.0 },
          radiusKm: 10,
          isActive: true,
        });
      }

      // Check if matching route already exists in global store
      const allRoutes = transferStore.getRoutes();
      const existing = allRoutes.find((r) => {
        const matchDir =
          (r.fromZoneId === fromZoneSlug && r.toZoneId === toZoneSlug) ||
          (r.direction === "both" && r.fromZoneId === toZoneSlug && r.toZoneId === fromZoneSlug);
        return matchDir && (!vehicleClassId || r.vehicleClassId === vehicleClassId);
      });

      if (existing) {
        if (supplierId) {
          transferStore.saveSupplierRoutePricing({
            supplierId,
            routeId: existing.id,
            vehicleClassId,
            basePrice: calculatedPrice,
            currency,
            isActive: true,
          });
        }

        existingLinked.push({
          routeId: existing.id,
          titleAr: `${rDef.fromNameAr} ➔ ${rDef.toNameAr}`,
          distanceKm: rDef.distanceKm,
          durationMinutes: rDef.durationMinutes,
          companyPrice: calculatedPrice,
          currency,
          status: "existing_linked",
        });
      } else {
        const newRoute = transferStore.saveRoute({
          fromZoneId: fromZoneSlug,
          toZoneId: toZoneSlug,
          vehicleClassId,
          direction: "both",
          basePrice: calculatedPrice,
          currency,
          city: cityKey,
          returnDiscountPercent: 10,
          nightSurcharge: { startHour: 23, endHour: 6, amount: 10, percent: 0 },
          estimatedDistanceKm: rDef.distanceKm,
          estimatedDurationMinutes: rDef.durationMinutes,
          supplierNet: Math.round(calculatedPrice * 0.85),
          isActive: true,
        });

        if (supplierId) {
          transferStore.saveSupplierRoutePricing({
            supplierId,
            routeId: newRoute.id,
            vehicleClassId,
            basePrice: calculatedPrice,
            currency,
            isActive: true,
          });
        }

        newlyCreated.push({
          routeId: newRoute.id,
          titleAr: `${rDef.fromNameAr} ➔ ${rDef.toNameAr}`,
          distanceKm: rDef.distanceKm,
          durationMinutes: rDef.durationMinutes,
          companyPrice: calculatedPrice,
          currency,
          status: "newly_created",
        });
      }
    }

    const cityNameAr =
      cityKey === "trabzon"
        ? "طرابزون والشمال التركي"
        : cityKey === "antalya"
        ? "أنطاليا والساحل الجنوبي"
        : cityKey === "cappadocia"
        ? "كابادوكيا ووسط الأناضول"
        : cityKey === "aegean"
        ? "بودروم وفتحية ومرمريس"
        : cityKey === "southeast"
        ? "المدن التاريخية والجنوب"
        : "إسطنبول الكبرى";

    const aiMessage =
      `أهلاً بك! بصفتي وكيل تسعير وإدارة المسارات الذكي بالمنصة، قمت بمسح شبكة مسارات ${cityNameAr} الحقيقية:\n\n` +
      `✅ **تمت معالجة ${count} مساراً حيوياً بالمسافات الواقعية بالكيلومتر**:\n` +
      `• ${newlyCreated.length} مساراً جديداً تم إنشاؤها ونشرها في المنصة وتسجيل تسعيركم الخاص لها.\n` +
      `• ${existingLinked.length} مساراً كانت موجودة مسبقاً، **وتم ربط تسعير شركتكم الخاص بها مباشرة دون تكرار المسار**.\n\n` +
      `💡 تم احتساب الأسعار استناداً لنموذج التسعير الوسطي (قريب: $${shortPrice}، متوسط: $${mediumPrice}، بعيد/بين المدن: $${longPrice}+).\n` +
      `يمكنك تعديل سعر أي مسار بشكل فردي في أي لحظة بالزيادة أو النقصان.`;

    return NextResponse.json({
      ok: true,
      city: cityKey,
      processedCount: count,
      newlyCreatedCount: newlyCreated.length,
      existingLinkedCount: existingLinked.length,
      routes: [...newlyCreated, ...existingLinked],
      aiMessage,
      message: "تم توليد وتثبيت تسعير المسارات بالذكاء الاصطناعي بنجاح",
    });
  } catch (err: any) {
    console.error("[ai-route-agent error]:", err);
    return NextResponse.json({ ok: false, error: err.message || "فشل توليد المسارات" }, { status: 500 });
  }
}
