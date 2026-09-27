/**
 * Tourism Weather MCP Server
 * Fetches real-time weather and generates promotional tourism advice
 * Using Open-Meteo (100% free, no API key required)
 */

export interface TourismWeatherResult {
  cityAr: string;
  cityEn: string;
  temperatureC: number;
  conditionAr: string;
  humidityPercent: number;
  windSpeedKmh: number;
  isRainy: boolean;
  isSnowy: boolean;
  marketingHookAr: string;
  suggestedPackageType: string;
}

const TURKISH_DESTINATIONS: Record<string, { en: string; lat: number; lon: number }> = {
  istanbul: { en: "Istanbul", lat: 41.0082, lon: 28.9784 },
  إسطنبول: { en: "Istanbul", lat: 41.0082, lon: 28.9784 },
  trabzon: { en: "Trabzon", lat: 41.0027, lon: 39.7168 },
  طرابزون: { en: "Trabzon", lat: 41.0027, lon: 39.7168 },
  uzungol: { en: "Uzungol", lat: 40.6192, lon: 40.2925 },
  أوزنجول: { en: "Uzungol", lat: 40.6192, lon: 40.2925 },
  rize: { en: "Rize", lat: 41.0208, lon: 40.5219 },
  ريزا: { en: "Rize", lat: 41.0208, lon: 40.5219 },
  cappadocia: { en: "Cappadocia", lat: 38.6431, lon: 34.8303 },
  كابادوكيا: { en: "Cappadocia", lat: 38.6431, lon: 34.8303 },
  antalya: { en: "Antalya", lat: 36.8969, lon: 30.7133 },
  أنطاليا: { en: "Antalya", lat: 36.8969, lon: 30.7133 },
  bursa: { en: "Bursa", lat: 40.1885, lon: 29.0610 },
  بورصة: { en: "Bursa", lat: 40.1885, lon: 29.0610 },
  bodrum: { en: "Bodrum", lat: 37.0344, lon: 27.4305 },
  بودروم: { en: "Bodrum", lat: 37.0344, lon: 27.4305 },
  fethiye: { en: "Fethiye", lat: 36.6217, lon: 29.1164 },
  فتحية: { en: "Fethiye", lat: 36.6217, lon: 29.1164 },
};

function interpretWeatherCode(code: number): { ar: string; isRain: boolean; isSnow: boolean } {
  if (code === 0) return { ar: "صافٍ ومشمس تماماً", isRain: false, isSnow: false };
  if ([1, 2, 3].includes(code)) return { ar: "غائم جزئياً وأجواء لطيفة", isRain: false, isSnow: false };
  if ([45, 48].includes(code)) return { ar: "ضبابي ساحر في المرتفعات", isRain: false, isSnow: false };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { ar: "ماطر ورذاذ منعش", isRain: true, isSnow: false };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { ar: "تساقط ثلوج وأجواء شتوية ساحرة", isRain: false, isSnow: true };
  if ([95, 96, 99].includes(code)) return { ar: "عواصف رعدية وأمطار غزيرة", isRain: true, isSnow: false };
  return { ar: "أجواء معتدلة", isRain: false, isSnow: false };
}

export async function getTourismWeather(destination = "طرابزون"): Promise<TourismWeatherResult> {
  const norm = destination.trim().toLowerCase();
  const target = TURKISH_DESTINATIONS[norm] || TURKISH_DESTINATIONS["طرابزون"];
  const cityAr = norm in TURKISH_DESTINATIONS ? destination : "طرابزون";

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FIstanbul`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
    const data = await res.json();
    const current = data.current || {};
    const code = Number(current.weather_code || 0);
    const { ar: conditionAr, isRain: isRainy, isSnow: isSnowy } = interpretWeatherCode(code);
    const temp = Math.round(Number(current.temperature_2m || 20));

    let marketingHookAr = `أجواء رائعة ومثالية لزيارة ${cityAr} مع جولات لوناليزا السياحية بسيارات VIP الفاخرة.`;
    let suggestedPackageType = "جولات VIP اليومية";

    if (isSnowy || temp < 5) {
      marketingHookAr = `الثلوج تزين قمم ${cityAr} اليوم! استمتع بأدفأ عطلة في الأكواخ الجبلية مع إطلالات خيالية وتدفئة خاصة.`;
      suggestedPackageType = "باقات الأكواخ الشتوية والتزلج";
    } else if (isRainy || code === 45) {
      marketingHookAr = `رذاذ المطر والضباب يعانق جبال ${cityAr} والبحيرة! عطلة الأحلام بانتظارك مع بكج عائلي فاخر.`;
      suggestedPackageType = "عطلات الشمال التركي والأكواخ النهرية";
    } else if (temp > 26) {
      marketingHookAr = `شمس مشرقة وأجواء صيفية منعشة في ${cityAr}! احجز الآن منتجعات شاطئية وجولات يخوت خاصة بأسعار تفضيلية.`;
      suggestedPackageType = "منتجعات الشواطئ واليخوت الخاصة";
    }

    return {
      cityAr,
      cityEn: target.en,
      temperatureC: temp,
      conditionAr,
      humidityPercent: Number(current.relative_humidity_2m || 60),
      windSpeedKmh: Math.round(Number(current.wind_speed_10m || 10)),
      isRainy,
      isSnowy,
      marketingHookAr,
      suggestedPackageType,
    };
  } catch (error) {
    return {
      cityAr,
      cityEn: target.en,
      temperatureC: 18,
      conditionAr: "أجواء معتدلة ولطيفة",
      humidityPercent: 65,
      windSpeedKmh: 12,
      isRainy: false,
      isSnowy: false,
      marketingHookAr: `اكتشف سحر الطبيعة في ${cityAr} بأفضل الأسعار وبخدمات سياحية متكاملة من لوناليزا.`,
      suggestedPackageType: "باقات سياحية متكاملة",
    };
  }
}
