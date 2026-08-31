import type {
  TravelAdvisorAppliedFilter,
  TravelAdvisorFilterGroup,
  TravelAdvisorHotelCard,
} from "@/types/travel-advisor";

function haystack(hotel: TravelAdvisorHotelCard): string {
  return [
    hotel.name,
    hotel.city,
    hotel.neighborhood,
    hotel.address,
    hotel.locationText,
    hotel.roomType,
    hotel.bedType,
    hotel.cancellation,
    hotel.snippet,
    ...(hotel.badges || []),
    ...(hotel.amenities || []),
  ]
    .join(" ")
    .toLowerCase();
}

function classStars(raw: string): number {
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 10 && n <= 50) return Math.round(n / 10);
  if (Number.isFinite(n) && n >= 1 && n <= 5) return Math.round(n);
  const m = raw.match(/(\d)/);
  return m ? Number(m[1]) : 0;
}

function hotelStars(hotel: TravelAdvisorHotelCard): number {
  if (hotel.stars > 0) return hotel.stars;
  const blob = `${hotel.name} ${hotel.badges.join(" ")} ${hotel.snippet}`;
  const m = blob.match(/(\d(?:\.\d)?)\s*[- ]?\s*(?:star|نجوم|نجمة|yıldız)/i);
  return m ? Math.min(5, Math.round(Number(m[1]))) : 0;
}

function matchesClass(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const stars = hotelStars(hotel);
  if (!stars) return false;
  return values.some((value) => classStars(value) === stars);
}

function matchesRating(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const minRaw = Number(values[0]);
  if (!Number.isFinite(minRaw) || minRaw <= 0) return true;
  if (hotel.rating > 5) {
    const min = minRaw > 5 ? minRaw : minRaw * 2;
    return hotel.rating >= min;
  }
  const min = minRaw > 10 ? minRaw / 10 : minRaw;
  return hotel.rating >= min;
}

function matchesPrice(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const nightly = hotel.nightly ?? hotel.priceFrom;
  if (nightly == null) return true;
  const min = Number(values[0]);
  const max = Number(values[1] ?? values[0]);
  if (Number.isFinite(min) && nightly < min) return false;
  if (Number.isFinite(max) && max > 0 && nightly > max) return false;
  return true;
}

function matchesText(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const text = haystack(hotel);
  return values.some((value) => {
    const needle = value.replace(/\s+/g, " ").trim().toLowerCase();
    return needle.length > 1 && text.includes(needle);
  });
}

function matchesAmenity(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const text = haystack(hotel);
  return values.some((value) => {
    const needle = value.replace(/\s+/g, " ").trim().toLowerCase();
    if (needle.length > 1 && text.includes(needle)) return true;
    if (/wifi|wi-fi|internet/i.test(needle)) return /wifi|wi-fi|internet|واي/i.test(text);
    if (/breakfast|إفطار|kahvalt/i.test(needle)) return /breakfast|إفطار|kahvalt/i.test(text);
    if (/pool|swim|مسبح|havuz/i.test(needle)) return /pool|swim|مسبح|havuz/i.test(text);
    if (/parking|موقف|otopark/i.test(needle)) return /parking|موقف|otopark/i.test(text);
    if (/spa/i.test(needle)) return /spa/i.test(text);
    if (/air.?cond|klima|تكييف/i.test(needle)) return /air.?cond|klima|تكييف|a\/c/i.test(text);
    if (/restaurant|مطعم/i.test(needle)) return /restaurant|مطعم/i.test(text);
    if (/gym|fitness|نادي/i.test(needle)) return /gym|fitness|نادي/i.test(text);
    if (/beach|شاطئ|plaj/i.test(needle)) return /beach|شاطئ|plaj/i.test(text);
    if (/elevator|lift|مصعد/i.test(needle)) return /elevator|lift|مصعد/i.test(text);
    return false;
  });
}

function matchesDeals(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const text = haystack(hotel);
  return values.some((value) => {
    if (value === "2" || /cancel|إلغاء/i.test(value)) return hotelHasFreeCancel(hotel);
    if (value === "3" || /pay at/i.test(value)) return Boolean(hotel.noPrepayment) || /pay at|الدفع/i.test(text);
    if (value === "1" || /special|offer/i.test(value)) return /offer|خصم|indirim/i.test(text);
    return matchesAmenity(hotel, [value]);
  });
}

export function hotelPropertyType(hotel: TravelAdvisorHotelCard): string {
  const text = haystack(hotel);
  if (/apart|شقة|daire/i.test(text)) return "apartment";
  if (/resort|منتجع|tatil/i.test(text)) return "resort";
  if (/villa|فيلا/i.test(text)) return "villa";
  if (/hostel|pansion|pension|guesthouse|نزل/i.test(text)) return "guesthouse";
  return "hotel";
}

export function parseDistanceKm(text: string): number | null {
  const raw = String(text || "");
  const km = raw.match(/([\d]+(?:[.,]\d+)?)\s*k\s*m/i);
  if (km) return Number(km[1].replace(",", "."));
  const meters = raw.match(/([\d]+(?:[.,]\d+)?)\s*m\b/i);
  if (meters) return Number(meters[1].replace(",", ".")) / 1000;
  return null;
}

function hotelHasBreakfast(hotel: TravelAdvisorHotelCard): boolean {
  if (hotel.breakfastIncluded) return true;
  return /breakfast|إفطار|kahvalt/i.test(haystack(hotel));
}

function hotelHasFreeCancel(hotel: TravelAdvisorHotelCard): boolean {
  if (hotel.nonRefundable) return false;
  return /cancel|إلغاء|ücretsiz iptal/i.test(`${hotel.cancellation} ${haystack(hotel)}`);
}

function normalizeLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function matchesMeals(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const breakfast = hotelHasBreakfast(hotel);
  return values.some((value) => (value === "breakfast" ? breakfast : !breakfast));
}

function matchesBed(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const bed = normalizeLabel(hotel.bedType || hotel.roomType).toLowerCase();
  if (!bed) return false;
  return values.some((value) => bed.includes(value.toLowerCase()) || value.toLowerCase().includes(bed));
}

function matchesCancel(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const free = hotelHasFreeCancel(hotel);
  return values.some((value) => (value === "free" ? free : !free));
}

function matchesDistance(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const maxKm = Number(values[0] ?? values[1]);
  if (!Number.isFinite(maxKm) || maxKm <= 0) return true;
  const km = parseDistanceKm(hotel.distanceText || hotel.locationText);
  if (km == null) return false;
  return km <= maxKm;
}

function matchesNeighborhood(hotel: TravelAdvisorHotelCard, values: string[]): boolean {
  const area = normalizeLabel(hotel.neighborhood || "").toLowerCase();
  if (!area) return false;
  return values.some((value) => area === value.toLowerCase() || area.includes(value.toLowerCase()));
}

function matchesFilter(hotel: TravelAdvisorHotelCard, filter: TravelAdvisorAppliedFilter): boolean {
  if (!filter.value.length) return true;
  switch (filter.id) {
    case "class":
      return matchesClass(hotel, filter.value);
    case "rating":
      return matchesRating(hotel, filter.value);
    case "price":
      return matchesPrice(hotel, filter.value);
    case "amenity":
      return matchesAmenity(hotel, filter.value);
    case "deals":
      return matchesDeals(hotel, filter.value);
    case "type":
      return filter.value.includes(hotelPropertyType(hotel));
    case "neighborhood":
      return matchesNeighborhood(hotel, filter.value);
    case "meals":
      return matchesMeals(hotel, filter.value);
    case "bed":
      return matchesBed(hotel, filter.value);
    case "cancel":
      return matchesCancel(hotel, filter.value);
    case "style":
    case "brand":
    case "popular":
    case "travelersChoice":
      return matchesText(hotel, filter.value) || matchesAmenity(hotel, filter.value);
    case "distFrom":
      return matchesDistance(hotel, filter.value);
    default:
      return matchesText(hotel, filter.value) || matchesAmenity(hotel, filter.value);
  }
}

function countedOptions(
  items: Array<{ value: string; label: string }>,
  total: number
): Array<{ value: string; label: string; count: number }> {
  const map = new Map<string, { label: string; count: number }>();
  for (const item of items) {
    const value = normalizeLabel(item.value);
    if (!value) continue;
    const prev = map.get(value);
    if (prev) prev.count += 1;
    else map.set(value, { label: item.label, count: 1 });
  }
  return [...map.entries()]
    .map(([value, row]) => ({ value, label: row.label, count: row.count }))
    .filter((row) => row.count > 0 && row.count < total)
    .sort((a, b) => b.count - a.count);
}

const PROPERTY_LABELS: Record<string, string> = {
  hotel: "Hotel",
  apartment: "Apartment",
  resort: "Resort",
  villa: "Villa",
  guesthouse: "Guesthouse",
};

const EXTRA_AMENITIES = [
  { value: "air conditioning", label: "Air conditioning" },
  { value: "restaurant", label: "Restaurant" },
  { value: "gym", label: "Fitness" },
  { value: "beach", label: "Beach" },
  { value: "elevator", label: "Elevator" },
];

export function buildLocalHotelFilterGroups(
  hotels: TravelAdvisorHotelCard[]
): TravelAdvisorFilterGroup[] {
  const nightlies = hotels
    .map((h) => h.nightly ?? h.priceFrom)
    .filter((n): n is number => n != null && n > 0);
  const maxPrice = nightlies.length ? Math.ceil(Math.max(...nightlies) / 10) * 10 : 400;
  const minPrice = nightlies.length ? Math.floor(Math.min(...nightlies) / 10) * 10 : 0;
  const starSet = new Set(hotels.map((h) => h.stars).filter((s) => s >= 1 && s <= 5));
  const bookingScale = hotels.some((h) => h.rating > 5);
  const groups: TravelAdvisorFilterGroup[] = [
    {
      id: "price",
      title: "Price",
      kind: "range",
      min: minPrice,
      max: Math.max(maxPrice, minPrice + 50),
      unit: "USD",
      options: [],
    },
    {
      id: "class",
      title: "Class",
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: [5, 4, 3, 2, 1]
        .filter((s) => starSet.has(s) || starSet.size === 0)
        .map((s) => ({ value: String(s), label: `${s} star`, count: null })),
    },
    {
      id: "rating",
      title: "Rating",
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: (bookingScale ? [9, 8.5, 8, 7.5, 7] : [4.5, 4, 3.5, 3])
        .filter((n) => hotels.some((h) => matchesRating(h, [String(n)])))
        .map((n) => ({
          value: String(n),
          label: `${n}+`,
          count: hotels.filter((h) => matchesRating(h, [String(n)])).length,
        })),
    },
  ];

  const neighborhoods = countedOptions(
    hotels
      .map((h) => normalizeLabel(h.neighborhood))
      .filter((name) => name.length > 1)
      .map((name) => ({ value: name, label: name })),
    hotels.length
  );
  if (neighborhoods.length >= 2) {
    groups.push({
      id: "neighborhood",
      title: "Neighborhood",
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: neighborhoods.slice(0, 12).map((row) => ({ ...row, count: row.count })),
    });
  }

  const types = countedOptions(
    hotels.map((h) => {
      const value = hotelPropertyType(h);
      return { value, label: PROPERTY_LABELS[value] || value };
    }),
    hotels.length
  );
  if (types.length >= 2) {
    groups.push({
      id: "type",
      title: "Property type",
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: types,
    });
  }

  const breakfastCount = hotels.filter(hotelHasBreakfast).length;
  if (breakfastCount > 0 && breakfastCount < hotels.length) {
    groups.push({
      id: "meals",
      title: "Meals",
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: [
        { value: "breakfast", label: "Breakfast included", count: breakfastCount },
        { value: "room_only", label: "Room only", count: hotels.length - breakfastCount },
      ],
    });
  }

  const beds = countedOptions(
    hotels
      .map((h) => normalizeLabel(h.bedType))
      .filter((name) => name.length > 2)
      .map((name) => ({ value: name, label: name })),
    hotels.length
  );
  if (beds.length >= 2) {
    groups.push({
      id: "bed",
      title: "Bed type",
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: beds.slice(0, 8),
    });
  }

  const freeCancelCount = hotels.filter(hotelHasFreeCancel).length;
  if (freeCancelCount > 0 && freeCancelCount < hotels.length) {
    groups.push({
      id: "cancel",
      title: "Cancellation",
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: [
        { value: "free", label: "Free cancellation", count: freeCancelCount },
        { value: "paid", label: "Non-refundable", count: hotels.length - freeCancelCount },
      ],
    });
  }

  const distances = hotels
    .map((h) => parseDistanceKm(h.distanceText || h.locationText))
    .filter((n): n is number => n != null);
  if (distances.length >= 3) {
    const buckets = [1, 2, 5, 10]
      .map((km) => ({
        value: String(km),
        label: `Under ${km} km`,
        count: hotels.filter((h) => matchesDistance(h, [String(km)])).length,
      }))
      .filter((row) => row.count > 0 && row.count < hotels.length);
    if (buckets.length) {
      groups.push({
        id: "distFrom",
        title: "Distance",
        kind: "multi",
        min: null,
        max: null,
        unit: "km",
        options: buckets,
      });
    }
  }

  groups.push({
    id: "deals",
    title: "Deals",
    kind: "multi",
    min: null,
    max: null,
    unit: "",
    options: [
      { value: "2", label: "Free cancellation", count: freeCancelCount || null },
      { value: "breakfast", label: "Breakfast", count: breakfastCount || null },
      ...(hotels.some((h) => h.noPrepayment)
        ? [{ value: "3", label: "No prepayment", count: hotels.filter((h) => h.noPrepayment).length }]
        : []),
    ],
  });

  const amenityOptions = [
    { value: "wifi", label: "Wi-Fi" },
    { value: "pool", label: "Pool" },
    { value: "parking", label: "Parking" },
    { value: "spa", label: "Spa" },
    { value: "breakfast", label: "Breakfast" },
    ...EXTRA_AMENITIES,
  ]
    .map((opt) => ({
      ...opt,
      count: hotels.filter((h) => matchesAmenity(h, [opt.value])).length,
    }))
    .filter((opt) => opt.count > 0);

  groups.push({
    id: "amenity",
    title: "Amenities",
    kind: "multi",
    min: null,
    max: null,
    unit: "",
    options: amenityOptions,
  });

  return groups;
}

/** Instant in-memory filter. Never hits RapidAPI. */
export function filterHotelsClientSide(
  hotels: TravelAdvisorHotelCard[],
  filters: TravelAdvisorAppliedFilter[]
): TravelAdvisorHotelCard[] {
  const active = filters.filter((f) => f && f.id && Array.isArray(f.value) && f.value.length);
  if (!active.length) return hotels;
  return hotels.filter((hotel) => active.every((filter) => matchesFilter(hotel, filter)));
}
