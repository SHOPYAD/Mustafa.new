export type AgentHotelRaw = Record<string, unknown>;
export type AgentTransferRaw = Record<string, unknown>;
export type AgentCarRaw = Record<string, unknown>;
export type AgentTourRaw = Record<string, unknown>;

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function fetchAgentHotels(params: {
  city: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  sort?: string;
  hotelName?: string;
}): Promise<AgentHotelRaw[]> {
  const qs = new URLSearchParams({
    q: params.city,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adults: String(Math.max(1, params.adults)),
    rooms: "1",
  });
  if (params.sort) qs.set("sort", params.sort);
  if (params.hotelName) qs.set("hotelName", params.hotelName);
  const res = await fetch(`/api/hotels/search?${qs}`, { cache: "no-store" });
  const data = await readJson(res);
  return Array.isArray(data.hotels) ? (data.hotels as AgentHotelRaw[]) : [];
}

export async function resolveRidePlace(
  q: string,
  locale: string
): Promise<{ place_id: string; label: string } | null> {
  const query = q.trim();
  if (query.length < 2) return null;
  const res = await fetch(
    `/api/transfers/locations?q=${encodeURIComponent(query)}&lang=${locale || "ar"}`
  );
  const data = await readJson(res);
  const loc = Array.isArray(data.locations) ? (data.locations[0] as Record<string, unknown>) : null;
  if (!loc) return null;
  const placeId = String(loc.place_id || loc.id || loc.placeId || "");
  if (!placeId) return null;
  return { place_id: placeId, label: String(loc.label || loc.name || query) };
}

export async function fetchAgentTransfers(params: {
  fromQuery: string;
  toQuery: string;
  date: string;
  time?: string;
  pax: number;
  locale: string;
  currency?: string;
}): Promise<AgentTransferRaw[]> {
  const from = await resolveRidePlace(params.fromQuery, params.locale);
  const to = params.toQuery ? await resolveRidePlace(params.toQuery, params.locale) : null;
  if (!from) return [];
  const res = await fetch("/api/transfers/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromPlaceId: from.place_id,
      toPlaceId: to?.place_id,
      date: params.date,
      time: params.time || "14:30",
      mode: "transfer",
      pax: params.pax,
      luggage: Math.max(2, params.pax),
      currency: params.currency || "USD",
    }),
  });
  const data = await readJson(res);
  return Array.isArray(data.offers) ? (data.offers as AgentTransferRaw[]) : [];
}

export async function fetchAgentCars(params: {
  pickup: string;
  guests: number;
  date?: string;
  returnDate?: string;
}): Promise<AgentCarRaw[]> {
  const qs = new URLSearchParams({
    pickup: params.pickup,
    guests: String(Math.max(1, params.guests)),
  });
  if (params.date) qs.set("date", params.date);
  if (params.returnDate) qs.set("returnDate", params.returnDate);
  const res = await fetch(`/api/cars?${qs}`, { cache: "no-store" });
  const data = await readJson(res);
  return Array.isArray(data.cars) ? (data.cars as AgentCarRaw[]) : [];
}

export async function fetchAgentTours(destination?: string): Promise<AgentTourRaw[]> {
  const res = await fetch("/api/tours", { cache: "no-store" });
  const data = await readJson(res);
  const tours = Array.isArray(data.tours) ? (data.tours as AgentTourRaw[]) : [];
  const needle = (destination || "").trim().toLowerCase();
  if (!needle) return tours.slice(0, 6);
  const matched = tours.filter((tour) => {
    const hay = [tour.title, tour.titleAr, tour.titleEn, tour.category, tour.city, ...(Array.isArray(tour.highlights) ? tour.highlights : [])]
      .map((x) => String(x || "").toLowerCase())
      .join(" ");
    return hay.includes(needle);
  });
  return (matched.length ? matched : tours).slice(0, 6);
}
