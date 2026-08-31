import { Injectable } from "@nestjs/common";
import type { CatalogHotel } from "../catalog/catalog.types";
import type { HotelRoom, StayQuery } from "../hotels/hotel.types";

@Injectable()
export class SnapshotsService {
  async save(hotel: CatalogHotel, stay: StayQuery, rooms: HotelRoom[], source: string) {
    const url = (process.env.POCKETBASE_URL || "").trim();
    const email = (process.env.POCKETBASE_ADMIN_EMAIL || "").trim();
    const password = (process.env.POCKETBASE_ADMIN_PASSWORD || "").trim();
    if (!url || !email || !password) return;

    try {
      const authRes = await fetch(`${url.replace(/\/$/, "")}/api/collections/_superusers/auth-with-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: email, password }),
      });
      if (!authRes.ok) return;
      const auth = (await authRes.json()) as { token?: string };
      if (!auth.token) return;

      await fetch(`${url.replace(/\/$/, "")}/api/collections/owned_rate_snapshots/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth.token,
        },
        body: JSON.stringify({
          hotel_key: hotel.id,
          check_in: stay.checkIn,
          check_out: stay.checkOut,
          adults: stay.adults,
          rooms_count: stay.rooms,
          source,
          payload: { rooms, hotelId: hotel.id, name: hotel.nameEn },
          fetched_at: new Date().toISOString(),
        }),
      });
    } catch {
      /* snapshots are optional */
    }
  }
}
