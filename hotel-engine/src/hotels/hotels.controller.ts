import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { EngineAuthGuard } from "../auth/engine-auth.guard";
import type { StayQuery } from "./hotel.types";
import { HotelsService } from "./hotels.service";

@Controller("v1/hotels")
@UseGuards(EngineAuthGuard)
export class HotelsController {
  constructor(private readonly hotels: HotelsService) {}

  private stay(query: Record<string, string | undefined>): StayQuery {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 3);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    return {
      checkIn: String(query.checkIn || iso(start)),
      checkOut: String(query.checkOut || iso(end)),
      adults: Number(query.adults || 2) || 2,
      rooms: Number(query.rooms || query.roomQty || 1) || 1,
      lang: String(query.lang || "en"),
    };
  }

  @Get("search")
  search(
    @Query("q") q?: string,
    @Query("query") query?: string,
    @Query("checkIn") checkIn?: string,
    @Query("checkOut") checkOut?: string,
    @Query("adults") adults?: string,
    @Query("rooms") rooms?: string,
    @Query("lang") lang?: string,
    @Query("page") page?: string
  ) {
    const stay = this.stay({ checkIn, checkOut, adults, rooms, lang });
    const pageNum = Number(page || 0);
    return this.hotels.search(q || query || "", stay, Number.isFinite(pageNum) ? pageNum : 0);
  }

  @Get("details")
  details(
    @Query("id") id?: string,
    @Query("slug") slug?: string,
    @Query("checkIn") checkIn?: string,
    @Query("checkOut") checkOut?: string,
    @Query("adults") adults?: string,
    @Query("rooms") rooms?: string,
    @Query("lang") lang?: string
  ) {
    return this.hotels.details(id || slug || "", this.stay({ checkIn, checkOut, adults, rooms, lang }));
  }

  @Get("rooms")
  rooms(
    @Query("id") id?: string,
    @Query("slug") slug?: string,
    @Query("checkIn") checkIn?: string,
    @Query("checkOut") checkOut?: string,
    @Query("adults") adults?: string,
    @Query("rooms") rooms?: string,
    @Query("lang") lang?: string
  ) {
    return this.hotels.rooms(id || slug || "", this.stay({ checkIn, checkOut, adults, rooms, lang }));
  }

  @Get("offers")
  offers(
    @Query("id") id?: string,
    @Query("checkIn") checkIn?: string,
    @Query("checkOut") checkOut?: string,
    @Query("adults") adults?: string,
    @Query("rooms") rooms?: string,
    @Query("lang") lang?: string
  ) {
    return this.hotels.offers(id || "", this.stay({ checkIn, checkOut, adults, rooms, lang }));
  }

  @Get("filters")
  filters(@Query("q") q?: string, @Query("query") query?: string) {
    return this.hotels.filters(q || query || "");
  }

  @Post("test")
  async test(
    @Query("id") id?: string,
    @Query("checkIn") checkIn?: string,
    @Query("checkOut") checkOut?: string
  ) {
    const hotelId = id || this.hotels.firstHotelId();
    const stay = this.stay({ checkIn, checkOut, adults: "2", rooms: "1", lang: "en" });
    const rooms = await this.hotels.rooms(hotelId, stay);
    return { ok: true, ...rooms };
  }
}
