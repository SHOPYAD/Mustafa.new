import { Injectable, NotFoundException } from "@nestjs/common";
import { CatalogService } from "../catalog/catalog.service";
import { CrawlService } from "../crawl/crawl.service";
import {
  DETAIL_TTL_SEC,
  RedisService,
  ROOMS_TTL_SEC,
  SEARCH_TTL_SEC,
} from "../redis/redis.service";
import { SnapshotsService } from "../snapshots/snapshots.service";
import type { HotelDetails, HotelOffer, HotelRoom, StayQuery } from "./hotel.types";
import { PAGE_SIZE, roomsToOffers, toCard, toDetails } from "./normalize";

@Injectable()
export class HotelsService {
  constructor(
    private readonly catalog: CatalogService,
    private readonly crawl: CrawlService,
    private readonly redis: RedisService,
    private readonly snapshots: SnapshotsService
  ) {}

  async search(query: string, stay: StayQuery, page: number) {
    const cacheKey = this.redis.key([
      "search",
      query.toLowerCase(),
      stay.checkIn,
      stay.checkOut,
      String(stay.adults),
      stay.lang,
      String(page),
    ]);
    const cached = await this.redis.getJson<{
      hotels: ReturnType<typeof toCard>[];
      totalCount: number;
      page: number;
      pageSize: number;
      hasMore: boolean;
    }>(cacheKey);
    if (cached) return { ...cached, source: "cache" as const };

    const matched = this.catalog.search(query);
    const start = Math.max(0, page) * PAGE_SIZE;
    const slice = matched.slice(start, start + PAGE_SIZE);
    const hotels = slice.map((h) => toCard(h, stay, this.crawl.catalogRooms(h, stay)));
    const payload = {
      hotels,
      totalCount: matched.length,
      page,
      pageSize: PAGE_SIZE,
      hasMore: start + PAGE_SIZE < matched.length,
    };
    await this.redis.setJson(cacheKey, payload, SEARCH_TTL_SEC);
    return { ...payload, source: "catalog" as const };
  }

  async details(id: string, stay: StayQuery): Promise<{ hotel: HotelDetails; source: string }> {
    const hotel = this.catalog.getById(id);
    if (!hotel) throw new NotFoundException("Hotel not found");
    const cacheKey = this.redis.key([
      "details",
      hotel.id,
      stay.checkIn,
      stay.checkOut,
      String(stay.adults),
      stay.lang,
    ]);
    const cached = await this.redis.getJson<{ hotel: HotelDetails; source: string }>(cacheKey);
    if (cached) return cached;

    const fetched = await this.crawl.fetchRooms(hotel, stay);
    const details = toDetails(hotel, stay, fetched.rooms);
    const payload = { hotel: details, source: fetched.source };
    await this.redis.setJson(cacheKey, payload, DETAIL_TTL_SEC);
    await this.snapshots.save(hotel, stay, fetched.rooms, fetched.source);
    return payload;
  }

  async rooms(
    id: string,
    stay: StayQuery
  ): Promise<{ rooms: HotelRoom[]; source: string; hotelId: string; hotelName: string }> {
    const hotel = this.catalog.getById(id);
    if (!hotel) throw new NotFoundException("Hotel not found");
    const cacheKey = this.redis.key([
      "rooms",
      hotel.id,
      stay.checkIn,
      stay.checkOut,
      String(stay.adults),
      String(stay.rooms),
    ]);
    const cached = await this.redis.getJson<{
      rooms: HotelRoom[];
      source: string;
      hotelId: string;
      hotelName: string;
    }>(cacheKey);
    if (cached) return cached;

    const fetched = await this.crawl.fetchRooms(hotel, stay);
    const payload = {
      rooms: fetched.rooms,
      source: fetched.source,
      hotelId: hotel.id,
      hotelName: hotel.nameEn,
    };
    await this.redis.setJson(cacheKey, payload, ROOMS_TTL_SEC);
    await this.snapshots.save(hotel, stay, fetched.rooms, fetched.source);
    return payload;
  }

  async offers(id: string, stay: StayQuery): Promise<{ offers: HotelOffer[]; rooms: HotelRoom[]; source: string }> {
    const hotel = this.catalog.getById(id);
    if (!hotel) throw new NotFoundException("Hotel not found");
    const fetched = await this.rooms(id, stay);
    return {
      offers: roomsToOffers(hotel, fetched.rooms),
      rooms: fetched.rooms,
      source: fetched.source,
    };
  }

  filters(query: string) {
    const matched = this.catalog.search(query);
    const cities = [...new Set(matched.map((h) => h.city))];
    const stars = [...new Set(matched.map((h) => h.stars))].sort((a, b) => b - a);
    return {
      groups: [
        {
          id: "city",
          title: "City",
          kind: "multi" as const,
          min: null,
          max: null,
          unit: "",
          options: cities.map((c) => ({
            value: c,
            label: c,
            count: matched.filter((h) => h.city === c).length,
          })),
        },
        {
          id: "stars",
          title: "Stars",
          kind: "multi" as const,
          min: null,
          max: null,
          unit: "",
          options: stars.map((s) => ({
            value: String(s),
            label: `${s}★`,
            count: matched.filter((h) => h.stars === s).length,
          })),
        },
      ],
    };
  }

  firstHotelId(): string {
    return this.catalog.list()[0]?.id || "";
  }
}
