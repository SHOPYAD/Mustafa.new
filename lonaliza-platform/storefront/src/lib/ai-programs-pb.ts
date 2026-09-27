import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { SavedAiProgram } from "@/types/ai-program";

export type AiProgramRecord = {
  id: string;
  user?: string;
  title?: string;
  title_ar?: string;
  title_en?: string;
  destination?: string;
  nights?: number;
  people?: number;
  arrival_date?: string;
  departure_date?: string;
  price_from_usd?: number;
  thumbnail?: string;
  includes_ar?: string[];
  includes_en?: string[];
  itinerary?: SavedAiProgram["itinerary"];
  cards?: unknown;
  flight_href?: string;
  transfer_href?: string;
  cars_href?: string;
  file_id?: string;
  created: string;
  updated: string;
};

export function programFromRecord(row: AiProgramRecord): SavedAiProgram & { pbId: string } {
  const itinerary = row.itinerary || {
    titleAr: row.title_ar || row.title || "",
    titleEn: row.title_en || row.title || "",
    days: [],
    totalBasePrice: 0,
    totalClientPrice: Number(row.price_from_usd) || 0,
    currency: "USD",
  };
  return {
    pbId: row.id,
    id: row.file_id || row.id,
    titleAr: row.title_ar || row.title || "",
    titleEn: row.title_en || row.title || "",
    destination: row.destination || "",
    nights: Number(row.nights) || 0,
    people: row.people ? Number(row.people) : undefined,
    arrivalDate: row.arrival_date || undefined,
    departureDate: row.departure_date || undefined,
    priceFromUsd: Number(row.price_from_usd) || 0,
    thumbnail: row.thumbnail || undefined,
    includesAr: Array.isArray(row.includes_ar) ? row.includes_ar : [],
    includesEn: Array.isArray(row.includes_en) ? row.includes_en : [],
    itinerary,
    cards: Array.isArray(row.cards) ? (row.cards as SavedAiProgram["cards"]) : undefined,
    flightHref: row.flight_href || undefined,
    transferHref: row.transfer_href || undefined,
    carsHref: row.cars_href || undefined,
    hidden: false,
    createdAt: row.created || new Date().toISOString(),
  };
}

export async function saveUserAiProgram(
  userId: string,
  program: SavedAiProgram,
  cards?: unknown
): Promise<string | null> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  try {
    const existing = await pb.collection("ai_programs").getFullList<AiProgramRecord>({
      filter: `user = "${userId}" && file_id = "${program.id}"`,
    });
    const payload = {
      user: userId,
      title: program.titleAr || program.titleEn,
      title_ar: program.titleAr,
      title_en: program.titleEn,
      destination: program.destination,
      nights: program.nights,
      people: program.people || 0,
      arrival_date: program.arrivalDate || "",
      departure_date: program.departureDate || "",
      price_from_usd: program.priceFromUsd,
      thumbnail: program.thumbnail || "",
      includes_ar: program.includesAr,
      includes_en: program.includesEn,
      itinerary: program.itinerary,
      cards: cards || program.cards || [],
      flight_href: program.flightHref || "",
      transfer_href: program.transferHref || "",
      cars_href: program.carsHref || "",
      file_id: program.id,
    };
    if (existing[0]) {
      await pb.collection("ai_programs").update(existing[0].id, payload);
      return existing[0].id;
    }
    const created = await pb.collection("ai_programs").create<AiProgramRecord>(payload);
    return created.id;
  } catch {
    return null;
  }
}

export async function listUserAiPrograms(userId: string) {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return [];
  const rows = await pb.collection("ai_programs").getFullList<AiProgramRecord>({
    filter: `user = "${userId}"`,
    sort: "-id",
  });
  return rows.map(programFromRecord);
}

export async function getUserAiProgram(userId: string, id: string) {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  try {
    const row = await pb.collection("ai_programs").getOne<AiProgramRecord>(id);
    if (row.user && row.user !== userId) return null;
    return programFromRecord(row);
  } catch {
    try {
      const row = await pb
        .collection("ai_programs")
        .getFirstListItem<AiProgramRecord>(
          `user = "${userId}" && file_id = "${id}"`
        );
      return programFromRecord(row);
    } catch {
      return null;
    }
  }
}
