import { slugify } from "@/lib/utils";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";

const DEFAULT_WA = DEFAULT_SITE_WHATSAPP;

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v != null ? String(v) : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === "string" && v.trim()) {
    return v.split(/[,|\n]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function asImages(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => {
      if (typeof x === "string") return x;
      if (x && typeof x === "object" && "url" in x) {
        return String((x as { url: unknown }).url || "");
      }
      return "";
    })
    .filter((u) => u.startsWith("http"));
}

/** Normalize Gemini hotel JSON into HotelInput-compatible object */
export function normalizeImportedHotel(raw: Record<string, unknown>) {
  const nameEn = asString(raw.nameEn || raw.name || raw.titleEn || raw.title);
  const nameAr = asString(raw.nameAr || nameEn);
  const roomsRaw = Array.isArray(raw.rooms) ? raw.rooms : [];
  const rooms = roomsRaw.map((r, i) => {
    const room = (r || {}) as Record<string, unknown>;
    return {
      id: asString(room.id, `r-${Date.now()}-${i}`),
      nameAr: asString(room.nameAr || room.nameEn || `غرفة ${i + 1}`),
      nameEn: asString(room.nameEn || room.nameAr || `Room ${i + 1}`),
      descriptionAr: asString(room.descriptionAr || room.descriptionEn),
      descriptionEn: asString(room.descriptionEn || room.descriptionAr),
      beds: asString(room.beds, "1 King"),
      capacity: asNumber(room.capacity, 2),
      sizeSqm: asNumber(room.sizeSqm ?? room.size ?? room.sqm, 30),
      price: asNumber(room.price, 0),
      currency: asString(room.currency, "USD"),
      amenities: asStringArray(room.amenities),
      images: asImages(room.images),
      breakfastIncluded: Boolean(
        room.breakfastIncluded ?? room.breakfast ?? false
      ),
      freeCancellation: Boolean(
        room.freeCancellation ?? room.cancellationFree ?? true
      ),
    };
  });

  return {
    slug: asString(raw.slug) || slugify(nameEn || nameAr || `hotel-${Date.now()}`),
    nameAr,
    nameEn,
    city: asString(raw.city, "Dubai"),
    country: asString(raw.country, "UAE"),
    neighborhoodAr: asString(raw.neighborhoodAr || raw.city, "دبي"),
    neighborhoodEn: asString(raw.neighborhoodEn || raw.city, "Dubai"),
    stars: asNumber(raw.stars ?? raw.starRating, 5),
    rating: asNumber(raw.rating, 4.5),
    reviewCount: asNumber(raw.reviewCount ?? raw.reviews, 0),
    addressAr: asString(raw.addressAr || raw.addressEn),
    addressEn: asString(raw.addressEn || raw.addressAr),
    descriptionAr: asString(raw.descriptionAr || raw.descriptionEn),
    descriptionEn: asString(raw.descriptionEn || raw.descriptionAr),
    highlightsAr: asStringArray(raw.highlightsAr),
    highlightsEn: asStringArray(raw.highlightsEn),
    images: asImages(raw.images),
    amenities: asStringArray(raw.amenities),
    rooms:
      rooms.length > 0
        ? rooms
        : [
            {
              id: `r-${Date.now()}`,
              nameAr: "غرفة قياسية",
              nameEn: "Standard Room",
              descriptionAr: "",
              descriptionEn: "",
              beds: "1 King",
              capacity: 2,
              sizeSqm: 30,
              price: asNumber(raw.price, 200),
              currency: "USD",
              amenities: [],
              images: asImages(raw.images).slice(0, 2),
              breakfastIncluded: false,
              freeCancellation: true,
            },
          ],
    lat: asNumber(raw.lat, 25.2048),
    lng: asNumber(raw.lng, 55.2708),
    checkIn: asString(raw.checkIn, "15:00"),
    checkOut: asString(raw.checkOut, "12:00"),
    policiesAr: asStringArray(raw.policiesAr),
    policiesEn: asStringArray(raw.policiesEn),
    whatsappNumber: asString(
      raw.whatsappNumber || raw.whatsapp || raw.wa,
      DEFAULT_WA
    ).replace(/\D/g, ""),
    whatsappMessageAr: asString(
      raw.whatsappMessageAr,
      `مرحباً، أرغب بالحجز في ${nameAr}`
    ),
    whatsappMessageEn: asString(
      raw.whatsappMessageEn,
      `Hello, I would like to book at ${nameEn}`
    ),
    phone: asString(raw.phone) || undefined,
    website: asString(raw.website) || undefined,
    isFeatured: Boolean(raw.isFeatured ?? raw.featured ?? false),
    isActive: raw.isActive !== false,
  };
}

export function normalizeImportedTransfer(raw: Record<string, unknown>) {
  const titleEn = asString(raw.titleEn || raw.title || raw.nameEn);
  const titleAr = asString(raw.titleAr || titleEn);
  return {
    slug: asString(raw.slug) || slugify(titleEn || titleAr || `transfer-${Date.now()}`),
    type: raw.type === "vip_tour" ? "vip_tour" : "transfer",
    titleAr,
    titleEn,
    descriptionAr: asString(raw.descriptionAr || raw.descriptionEn),
    descriptionEn: asString(raw.descriptionEn || raw.descriptionAr),
    vehicleName: asString(raw.vehicleName || raw.vehicle, "Luxury Sedan"),
    vehicleType: asString(raw.vehicleType, "Sedan"),
    vehicleClass: asString(raw.vehicleClass, "Luxury"),
    seats: asNumber(raw.seats, 3),
    luggage: asNumber(raw.luggage, 2),
    price: asNumber(raw.price, 0),
    currency: asString(raw.currency, "USD"),
    durationHours: asNumber(raw.durationHours, 1),
    routeFrom: asString(raw.routeFrom),
    routeTo: asString(raw.routeTo),
    routeFromAr: asString(raw.routeFromAr || raw.routeFrom),
    routeToAr: asString(raw.routeToAr || raw.routeTo),
    highlightsAr: asStringArray(raw.highlightsAr),
    highlightsEn: asStringArray(raw.highlightsEn),
    includesAr: asStringArray(raw.includesAr),
    includesEn: asStringArray(raw.includesEn),
    images: asImages(raw.images),
    whatsappNumber: asString(raw.whatsappNumber, DEFAULT_WA).replace(/\D/g, ""),
    whatsappMessageAr: asString(
      raw.whatsappMessageAr,
      `مرحباً، أرغب بحجز: ${titleAr}`
    ),
    whatsappMessageEn: asString(
      raw.whatsappMessageEn,
      `Hello, I would like to book: ${titleEn}`
    ),
    isFeatured: Boolean(raw.isFeatured),
    isActive: raw.isActive !== false,
  };
}

export function normalizeImportedFlight(raw: Record<string, unknown>) {
  const dep = (raw.departure || {}) as Record<string, unknown>;
  const arr = (raw.arrival || {}) as Record<string, unknown>;
  return {
    airline: asString(raw.airline, "Airline"),
    airlineLogo: asString(raw.airlineLogo, "🛫"),
    flightNumber: asString(raw.flightNumber, "XX000"),
    departure: {
      time: asString(dep.time, "08:00"),
      city: asString(dep.city, "Dubai"),
      airport: asString(dep.airport, "DXB"),
    },
    arrival: {
      time: asString(arr.time, "12:00"),
      city: asString(arr.city, "London"),
      airport: asString(arr.airport, "LHR"),
    },
    duration: asString(raw.duration, "7h"),
    stops: asNumber(raw.stops, 0),
    price: asNumber(raw.price, 0),
    amenities: asStringArray(raw.amenities),
    isActive: raw.isActive !== false,
  };
}

export function normalizeImportedPackage(raw: Record<string, unknown>) {
  const title = asString(raw.title || raw.titleAr || raw.titleEn || raw.nameEn || raw.nameAr);
  const titleAr = asString(raw.titleAr || raw.nameAr || title);
  const titleEn = asString(raw.titleEn || raw.nameEn || title);
  const destination = asString(
    raw.destination || raw.destinationAr || raw.destinationEn,
    "Turkey"
  );
  const destinationAr = asString(raw.destinationAr || destination);
  const destinationEn = asString(raw.destinationEn || destination);
  const images = Array.isArray(raw.images)
    ? raw.images.map((img) => {
        if (typeof img === "string") {
          return { url: img, alt: title, width: 800, height: 600 };
        }
        const o = (img || {}) as Record<string, unknown>;
        return {
          url: asString(o.url),
          alt: asString(o.alt, title),
          width: asNumber(o.width, 800),
          height: asNumber(o.height, 600),
        };
      }).filter((x) => x.url)
    : [];
  const durationDays = asNumber(raw.durationDays ?? raw.days, 5);
  const rawSlug = asString(raw.slug) || slugify(titleEn) || slugify(title);
  const destSlug = slugify(destinationEn || "turkey");
  const latinSlug = /[a-z0-9]/i.test(rawSlug)
    ? rawSlug
    : `${/[a-z0-9]/i.test(destSlug) ? destSlug : "turkey"}-${durationDays}-days`;

  return {
    slug: latinSlug,
    title,
    titleAr,
    titleEn,
    destination,
    destinationAr,
    destinationEn,
    country: asString(raw.country || raw.countryEn, "Turkey"),
    countryAr: asString(raw.countryAr, "تركيا"),
    countryEn: asString(raw.countryEn || raw.country, "Turkey"),
    countryTr: asString(raw.countryTr, "Türkiye"),
    durationDays,
    durationNights: asNumber(raw.durationNights, Math.max(1, durationDays - 1)),
    price: asNumber(raw.price, 0),
    currency: asString(raw.currency, "USD"),
    rating: asNumber(raw.rating, 4.8),
    images,
    amenities: asStringArray(raw.amenities),
    amenitiesAr: asStringArray(raw.amenitiesAr),
    isFeatured: raw.isFeatured !== false,
    isPublished: raw.isPublished !== false,
    createdAt: asString(raw.createdAt) || new Date().toISOString(),
    description: asString(raw.description || raw.descriptionAr || raw.descriptionEn),
    descriptionAr: asString(raw.descriptionAr || raw.description),
    descriptionEn: asString(raw.descriptionEn || raw.description),
    descriptionTr: asString(raw.descriptionTr || raw.descriptionEn),
    titleTr: asString(raw.titleTr || raw.titleEn),
    destinationTr: asString(raw.destinationTr || destinationEn),
    inclusions: asStringArray(raw.inclusions || raw.inclusionsEn),
    inclusionsAr: asStringArray(raw.inclusionsAr || raw.inclusions),
    inclusionsEn: asStringArray(raw.inclusionsEn || raw.inclusions),
    inclusionsTr: asStringArray(raw.inclusionsTr || raw.inclusionsEn),
    exclusions: asStringArray(raw.exclusions || raw.exclusionsEn),
    exclusionsAr: asStringArray(raw.exclusionsAr || raw.exclusions),
    exclusionsEn: asStringArray(raw.exclusionsEn || raw.exclusions),
    exclusionsTr: asStringArray(raw.exclusionsTr || raw.exclusionsEn),
    itinerary: Array.isArray(raw.itinerary)
      ? raw.itinerary.map((d, i) => {
          const day = (d || {}) as Record<string, unknown>;
          return {
            day: asNumber(day.day, i + 1),
            title: asString(day.title || day.titleAr || day.titleEn),
            description: asString(day.description || day.descriptionAr || day.descriptionEn),
          };
        })
      : [],
    itineraryAr: Array.isArray(raw.itineraryAr)
      ? raw.itineraryAr.map((d, i) => {
          const day = (d || {}) as Record<string, unknown>;
          return {
            day: asNumber(day.day, i + 1),
            title: asString(day.title || day.titleAr),
            description: asString(day.description || day.descriptionAr),
          };
        })
      : undefined,
    itineraryEn: Array.isArray(raw.itineraryEn)
      ? raw.itineraryEn.map((d, i) => {
          const day = (d || {}) as Record<string, unknown>;
          return {
            day: asNumber(day.day, i + 1),
            title: asString(day.title || day.titleEn),
            description: asString(day.description || day.descriptionEn),
          };
        })
      : undefined,
  };
}

export function normalizeImportedTour(raw: Record<string, unknown>) {
  const title = asString(raw.title || raw.titleEn || raw.nameEn);
  const images = asImages(raw.images);
  const timingRaw = asString(raw.timing, "morning").toLowerCase();
  const timing =
    timingRaw === "afternoon" || timingRaw === "evening"
      ? timingRaw
      : "morning";

  return {
    title,
    image: images[0] || asString(raw.image, ""),
    duration: asString(raw.duration, "6 Hours"),
    timing: timing as "morning" | "afternoon" | "evening",
    rating: asNumber(raw.rating, 4.8),
    reviewCount: asNumber(raw.reviewCount, 0),
    price: asNumber(raw.price, 0),
    originalPrice: raw.originalPrice != null ? asNumber(raw.originalPrice) : undefined,
    highlights: asStringArray(raw.highlights || raw.highlightsEn),
    category: asString(raw.category, "City Tours"),
    popular: Boolean(raw.popular || raw.isFeatured),
    isActive: raw.isActive !== false,
  };
}

export function normalizeImportedVisa(raw: Record<string, unknown>) {
  const country = asString(raw.country || raw.nameEn || "Country");
  const types = Array.isArray(raw.types) ? raw.types : [];
  return {
    id: asString(raw.id) || slugify(country),
    country,
    flag: asString(raw.flag, "🛂"),
    isActive: raw.isActive !== false,
    types: types.map((t) => {
      const type = (t || {}) as Record<string, unknown>;
      return {
        name: asString(type.name, "Tourist Visa"),
        duration: asString(type.duration, "30 Days"),
        price: asString(type.price, "AED 0"),
        processingTime: asString(type.processingTime, "3-5 Working Days"),
        features: asStringArray(type.features),
      };
    }),
  };
}
