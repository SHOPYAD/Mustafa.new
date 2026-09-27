import type { Locale } from "@/lib/i18n/types";
import type { PlannerDay, PlannerStop, PlannerTrip, PlannerStyle } from "@/types/planner";
import type { SalesChatCard } from "@/types/sales-chat";
import { styleLabel } from "./styles";

const SLOTS: Record<Locale, string[]> = {
  ar: ["صباحاً", "قبل الظهر", "بعد الظهر", "عصراً", "مساءً", "ليلاً"],
  en: ["Morning", "Late morning", "Afternoon", "Late afternoon", "Evening", "Night"],
  tr: ["Sabah", "Öğleden önce", "Öğleden sonra", "İkindi", "Akşam", "Gece"],
  fr: ["Matin", "Fin de matin", "Après-midi", "En fin d'après-midi", "Soir", "Nuit"],
};

function arabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text || "");
}

export function placeCaption(stop: PlannerStop, locale: Locale): string {
  if (locale === "ar") {
    return arabic(stop.titleAr) ? stop.titleAr : stop.titleEn || stop.titleAr;
  }
  return stop.titleEn || stop.titleAr;
}

export function tripHeadline(trip: PlannerTrip, locale: Locale): string {
  if (locale === "ar") return trip.titleAr || trip.titleEn || `رحلة سياحية فاخرة إلى ${trip.destination || "تركيا"}`;
  if (locale === "tr") return trip.titleEn || `${trip.destination} — ${trip.durationDays} günlük tatil`;
  if (locale === "fr") return trip.titleEn || `${trip.destination} — ${trip.durationDays} jours de plaisir`;
  return trip.titleEn || trip.titleAr || `Luxury travel itinerary to ${trip.destination || "Turkey"}`;
}

export function writeDayTitle(
  day: number,
  daysCount: number,
  city: string,
  locale: Locale,
  firstPlace?: string,
  style?: PlannerStyle
): string {
  const place = firstPlace || city;
  const label = style ? styleLabel(style, locale) : "";
  if (locale === "ar") {
    if (day === 1) {
      return label ? `الوصول والاستقرار · جولة ${label} في ${place}` : `الوصول والاستقرار وجولة استكشافية في ${place}`;
    }
    if (day === daysCount) {
      return `ختام الرحلة والتسوق الأخير وتوديع ${city}`;
    }
    return label ? `مسار ${label} وزيارة معالم ${place}` : `جولة المعالم الرائعة في ${place}`;
  }
  if (locale === "tr") {
    if (day === 1) return label ? `${city} varış ve ${label} turu · ${place}` : `${city} varış ve ilk keşif`;
    if (day === daysCount) return `${city} son gün, alışveriş ve veda`;
    return label ? `${label} rotası · ${place} keşfi` : `${place} çevresi keyifli gün`;
  }
  if (locale === "fr") {
    if (day === 1) return label ? `Arrivée et journée ${label} à ${place}` : `Arrivée et découverte de ${city}`;
    if (day === daysCount) return `Clôture du voyage, shopping et départ`;
    return label ? `Parcours ${label} · ${place}` : `Belle journée autour de ${place}`;
  }
  if (day === 1) return label ? `Arrival & ${label} tour · ${place}` : `Arrival and first look at ${city}`;
  if (day === daysCount) return `Farewell ${city}, last shopping & departure`;
  return label ? `${label} day · exploring ${place}` : `Exploring highlights of ${place}`;
}

export function dayLabel(day: number, locale: Locale): string {
  if (locale === "ar") return `اليوم ${day}`;
  if (locale === "tr") return `Gün ${day}`;
  if (locale === "fr") return `Jour ${day}`;
  return `Day ${day}`;
}

function clip(text: string, max = 180): string {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > 80 ? at : max).trim()}…`;
}

function placeBit(stop: PlannerStop, locale: Locale, slot: string): string {
  const name = placeCaption(stop, locale);
  if (locale === "ar") return `${slot} نتوقف في ${name}.`;
  if (locale === "tr") return `${slot} ${name}.`;
  if (locale === "fr") return `${slot} ${name}.`;
  return `${slot} ${name}.`;
}

export function writeDayNarrative(day: PlannerDay, daysCount: number, city: string, locale: Locale): string {
  if (day.notes && day.notes.trim().length >= 25 && !/وقت ممتع في .+ للتجول والتصوير|للتجول والتصوير واستراحة خفيفة|مسار سياحي مميز يبدأ صباحاً بالانطلاق بالسيارة الخاصة/.test(day.notes)) {
    return day.notes.trim();
  }
  const stops = day.stops.filter((s) => s.kind !== "hotel");
  const names = stops.map((s) => placeCaption(s, locale));
  const first = names[0] || city;
  const second = names[1] || "";
  const third = names[2] || "";
  const cycle = (day.day - 1) % 5;

  if (locale === "ar") {
    if (day.day === 1) {
      return `استقبال خاص ومريح في المطار والانتقال إلى الفندق للاستقرار، تليه جولة استكشافية ساحرة لاستنشاق عبق المدينة الأول في ${first} مع قضاء أمسية ترحيبية راقية في أجمل الساحات.`;
    }
    if (day.day === daysCount) {
      return `اليوم الختامي في ${city} مخصص لجولات تسوق حرة واقتناء الهدايا التذكارية من ${first} وتناول قهوة الوداع، قبل التوجه بسيارة خاصة مريحة إلى المطار لرحلة العودة بسلامة الله.`;
    }
    if (cycle === 1) {
      return `انطلاقة صباحية ملهمة نحو ${first} لاستكشاف روعتها المعمارية وتفاصيلها التاريخية العريقة، تعقبها استراحة غداء لتذوق أشهى النكهات المحلية، ثم استكمال الجولة نحو ${second || "أبرز المعالم القريبة"}${third ? ` والاستمتاع بأجواء ${third}` : ""} وسط إطلالات المدينة الساحرة.`;
    }
    if (cycle === 2) {
      return `صباح مشرق مخصص للاستمتاع بالإطلالات الخلابة في ${first}، مع وقفة راقية لتناول القهوة التراثية والحلويات التقليدية، يعقبها التوجه إلى ${second || "المواقع الساحرة"}${third ? ` وقضاء وقت استثنائي قبيل الغروب في ${third}` : ""} مع التقاط أجمل الصور التذكارية.`;
    }
    if (cycle === 3) {
      return `برنامج مفعم بالحيوية والأصالة يبدأ بجولة ثرية في ${first} والتعرف على نبضها الفريد، ثم التوجه لتناول وجبة غداء مختارة في مطعم محلي عريق، يليه قضاء وقت ممتع في ${second || "أجمل الأسواق والمتاجر الفاخرة"}${third ? ` وأمسية استرخاء في ${third}` : ""}.`;
    }
    if (cycle === 4) {
      return `رحلة مميزة تجمع بين الفنون والجمال الأخاذ، تنطلق بزيارة خاصة إلى ${first} والتأمل في تفاصيلها، تليها استراحة في أحد المقاهي التاريخية، ثم الانتقال بسلاسة نحو ${second || "أجمل معالم الظهيرة"}${third ? ` والاستمتاع بنسيم المساء في ${third}` : ""}.`;
    }
    return `يوم استثنائي حافل بالتجارب الحية يبدأ بجولة ملكية في ${first}، يتلوها تجربة طهي أصيلة لتذوق الأطباق الكلاسيكية الشهيرة، ثم التوجه إلى ${second || "المعالم الأيقونية القريبة"}${third ? ` وختام اليوم في الأجواء الساحرة لـ ${third}` : ""}.`;
  }
  if (locale === "tr") {
    if (day.day === 1) {
      return `${city} şehrine varış, konforlu otele yerleşme ve ardından ${first} çevresinde keyifli bir akşam yürüyüşü.`;
    }
    if (day.day === daysCount) {
      return `${city} son gününde alışveriş ve hediyelikler için serbest zaman, ardından havalimanına transfer.`;
    }
    if (cycle === 1) return `${first} ve ${second || "tarihi merkez"} rotasında unutulmaz bir kültür ve lezzet yolculuğu.`;
    if (cycle === 2) return `Güne ${first} muhteşem manzarasıyla başlangıç, yerel kahve molası ve ${second || "şehir sokakları"} keşfi.`;
    return `${names.slice(0, 3).join(", ")} rotasında özel araç konforunda keyifli bir gezi günü.`;
  }
  if (locale === "fr") {
    if (day.day === 1) {
      return `Arrivée à ${city}, installation à l'hôtel et première immersion élégante autour de ${first}.`;
    }
    if (day.day === daysCount) {
      return `Derniers souvenirs et détente à ${city}, puis transfert serein vers l'aéroport.`;
    }
    if (cycle === 1) return `Matinée inspirante à ${first}, suivie d'un déjeuner gourmand et d'une balade vers ${second || "les ruelles historiques"}.`;
    if (cycle === 2) return `Panorama exceptionnel depuis ${first}, pause café artisanal et coucher de soleil sur ${second || "la ville"}.`;
    return `Une journée exclusive à la découverte de ${names.slice(0, 3).join(", ")} avec chauffeur privé.`;
  }
  if (day.day === 1) {
    return `Arrival in ${city}, private hotel check-in, followed by an evening scenic tour starting at ${first}.`;
  }
  if (day.day === daysCount) {
    return `Farewell ${city} with leisure shopping and memorable sights before your comfortable airport transfer.`;
  }
  if (cycle === 1) return `An inspiring morning exploring ${first}, followed by an authentic local lunch and a scenic afternoon around ${second || "the historic quarters"}.`;
  if (cycle === 2) return `Breathtaking morning vistas at ${first}, artisan coffee breaks, and golden-hour strolls through ${second || "vibrant squares"}.`;
  return `A scenic journey exploring ${names.slice(0, 3).join(", ")} with private chauffeur and delightful culinary breaks.`;
}

export function writeDayShort(day: PlannerDay, locale: Locale, hotelName?: string): string {
  const names = day.stops
    .filter((s) => s.kind !== "hotel")
    .slice(0, 4)
    .map((s) => placeCaption(s, locale));
  if (hotelName) {
    names.push(hotelName);
  }
  const sep = locale === "ar" ? " ← " : " → ";
  return names.join(sep) || (locale === "ar" ? day.titleAr : day.titleEn);
}

export function programIntro(days: number, city: string, locale: Locale): string {
  if (locale === "ar") {
    return `برنامج ${days} أيام في ${city} للمتعة وتغيير الجو: أيام خفيفة، أماكن حقيقية، وطيران وفنادق حية من محركات لوناليزا. الأسعار تقديرية حتى يؤكدها فريق الحجز.`;
  }
  if (locale === "tr") {
    return `${city} için ${days} günlük keyifli program: gerçek yerler, canlı uçuş ve otel fiyatları. Fiyatlar rezervasyon ekibi onaylayana kadar tahmindir.`;
  }
  if (locale === "fr") {
    return `Programme de ${days} jours à ${city} pour le plaisir : lieux réels, vols et hôtels live. Les prix restent indicatifs jusqu'à confirmation.`;
  }
  return `A ${days}-day ${city} trip for pleasure and a change of scene: real places, live flights and hotels. Prices stay estimates until the booking team confirms.`;
}

export function whatsappProgramText(
  trip: PlannerTrip,
  cards: SalesChatCard[],
  locale: Locale,
  totalLabel: string
): string {
  const city = trip.destination;
  const isAr = locale === "ar";
  const title = tripHeadline(trip, locale);
  
  const days = trip.days
    .map((d) => {
      const dayHead = isAr ? `📍 اليوم ${d.day}: ${d.titleAr || d.titleEn}` : `📍 Day ${d.day}: ${d.titleEn || d.titleAr}`;
      const stops = d.stops
        .filter((s) => s.kind !== "hotel")
        .map((s) => placeCaption(s, locale))
        .join(isAr ? " ← " : " → ");
      return `${dayHead}\n${stops ? `   المزارات: ${stops}` : ""}`;
    })
    .join("\n\n");

  const flight = cards.filter((c) => c.type === "flight" && c.clientPrice > 0).sort((a, b) => a.clientPrice - b.clientPrice)[0];
  const hotel = cards.filter((c) => c.type === "hotel" && c.clientPrice > 0).sort((a, b) => a.clientPrice - b.clientPrice)[0];
  const flightName = isAr ? flight?.titleAr || flight?.titleEn : flight?.titleEn || flight?.titleAr;
  const hotelName = isAr ? hotel?.titleAr || hotel?.titleEn : hotel?.titleEn || hotel?.titleAr;

  const flightLine = flight ? `✈️ ${isAr ? "الطيران المقترح" : "Flight"}: ${flightName} ($${Math.round(flight.clientPrice)})` : "";
  const hotelLine = hotel ? `🏨 ${isAr ? "الإقامة الفندقية" : "Hotel"}: ${hotelName} ($${Math.round(hotel.clientPrice)})` : "";
  const carLine = `🚐 ${isAr ? "التنقلات والجولات" : "Private Transfer"}: مرسيدس فيتو VIP مع سائق خاص يتحدث العربية (شامل الوقود والاستقبال)`;

  const confirm =
    isAr
      ? "🌟 أرغب بتأكيد هذا البرنامج السياحي الفاخر مع فريق حجز لوناليزا VIP."
      : "🌟 I would like to confirm this VIP travel itinerary with the Lonaliza booking team.";

  const header = isAr
    ? `✨ *طلب حجز برنامج سياحي VIP — شركة لوناليزا*\n*الوجهة:* ${city} (${trip.durationDays} أيام)\n*البرنامج:* ${title}`
    : `✨ *VIP Travel Itinerary Booking Request — Lonaliza*\n*Destination:* ${city} (${trip.durationDays} Days)\n*Program:* ${title}`;

  return [
    header,
    "📋 *جدول الرحلة والمزارات اليومية:*",
    days,
    "💎 *الخدمات والتنقلات المشمولة:*",
    flightLine,
    hotelLine,
    carLine,
    `💰 *${totalLabel}*`,
    confirm,
    "🌐 https://lonaliza.com"
  ]
    .filter(Boolean)
    .join("\n\n");
}
