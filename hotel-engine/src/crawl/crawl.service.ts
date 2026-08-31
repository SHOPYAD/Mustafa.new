import { Injectable, Logger } from "@nestjs/common";
import { PlaywrightCrawler, ProxyConfiguration, RequestQueue } from "crawlee";
import type { CatalogHotel } from "../catalog/catalog.types";
import type { HotelRoom, LastCrawlStatus, StayQuery } from "../hotels/hotel.types";
import { WireguardService } from "../wireguard/wireguard.service";
import { nightsBetween } from "../hotels/normalize";

@Injectable()
export class CrawlService {
  private readonly log = new Logger(CrawlService.name);
  private chain: Promise<unknown> = Promise.resolve();
  private last: LastCrawlStatus = {
    at: null,
    hotelId: "",
    ok: false,
    roomCount: 0,
    error: null,
    durationMs: 0,
    source: "catalog",
  };

  constructor(private readonly wg: WireguardService) {}

  lastStatus(): LastCrawlStatus {
    return this.last;
  }

  async fetchRooms(hotel: CatalogHotel, stay: StayQuery): Promise<{
    rooms: HotelRoom[];
    source: "live" | "catalog";
  }> {
    const run = async () => {
      const started = Date.now();
      const proxyUrl = this.wg.proxyUrl();
      try {
        const live = await this.crawlBooking(hotel, stay, proxyUrl);
        if (live.length) {
          this.last = {
            at: new Date().toISOString(),
            hotelId: hotel.id,
            ok: true,
            roomCount: live.length,
            error: null,
            durationMs: Date.now() - started,
            source: "live",
          };
          return { rooms: live, source: "live" as const };
        }
        throw new Error("no rooms parsed from live page");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "crawl failed";
        this.log.warn(`Live fetch failed for ${hotel.id}: ${msg}`);
        const fallback = this.catalogRooms(hotel, stay);
        this.last = {
          at: new Date().toISOString(),
          hotelId: hotel.id,
          ok: false,
          roomCount: fallback.length,
          error: msg,
          durationMs: Date.now() - started,
          source: "catalog",
        };
        return { rooms: fallback, source: "catalog" as const };
      }
    };
    const next = this.chain.then(run, run);
    this.chain = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  }

  catalogRooms(hotel: CatalogHotel, stay: StayQuery): HotelRoom[] {
    const nights = nightsBetween(stay.checkIn, stay.checkOut);
    return hotel.rooms.map((room) => {
      const nightly = room.price;
      const totalStay = nightly != null ? nightly * nights : null;
      return {
        id: room.id,
        name: stay.lang.startsWith("ar") ? room.nameAr || room.nameEn : room.nameEn,
        description: stay.lang.startsWith("ar")
          ? room.descriptionAr || room.descriptionEn
          : room.descriptionEn,
        beds: room.beds,
        capacity: room.capacity,
        sizeSqm: room.sizeSqm,
        price: nightly,
        currency: room.currency || "USD",
        amenities: room.amenities,
        images: room.images.length ? room.images : hotel.images.slice(0, 2),
        breakfastIncluded: room.breakfastIncluded,
        freeCancellation: room.freeCancellation,
        view: "",
        partnerName: "Lonaliza",
        nightly,
        totalStay,
        available: true,
        rates: [
          {
            id: `${room.id}-std`,
            board: room.breakfastIncluded ? "breakfast" : "room_only",
            breakfastIncluded: room.breakfastIncluded,
            freeCancellation: room.freeCancellation,
            price: nightly,
            nightly,
            totalStay,
            currency: room.currency || "USD",
            partnerName: "Lonaliza",
          },
        ],
      };
    });
  }

  private bookingUrl(hotel: CatalogHotel, stay: StayQuery): string {
    const u = new URL(hotel.sourceUrl);
    u.searchParams.set("checkin", stay.checkIn);
    u.searchParams.set("checkout", stay.checkOut);
    u.searchParams.set("group_adults", String(stay.adults || 2));
    u.searchParams.set("no_rooms", String(stay.rooms || 1));
    u.searchParams.set("group_children", "0");
    return u.toString();
  }

  private async crawlBooking(
    hotel: CatalogHotel,
    stay: StayQuery,
    proxyUrl: string
  ): Promise<HotelRoom[]> {
    const nights = nightsBetween(stay.checkIn, stay.checkOut);
    const queueName = `owned-${hotel.id}-${Date.now()}`;
    const requestQueue = await RequestQueue.open(queueName);
    await requestQueue.addRequest({ url: this.bookingUrl(hotel, stay) });

    const parsed: HotelRoom[] = [];
    const crawler = new PlaywrightCrawler({
      requestQueue,
      maxConcurrency: 1,
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 45,
      requestHandlerTimeoutSecs: 60,
      proxyConfiguration: proxyUrl
        ? new ProxyConfiguration({ proxyUrls: [proxyUrl] })
        : undefined,
      launchContext: {
        launchOptions: {
          headless: true,
          executablePath: process.env.CHROMIUM_PATH || undefined,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        },
      },
      async requestHandler({ page }) {
        await page.waitForTimeout(2800);
        const rows = await page.evaluate(() => {
          const out: Array<{ name: string; price: number | null; beds: string }> = [];
          const seen = new Set<string>();
          const nameNodes = Array.from(
            document.querySelectorAll(
              ".hprt-roomtype-icon-link, [data-testid='room-name'], .hprt-roomtype-link"
            )
          );
          for (const node of nameNodes) {
            const row = node.closest("tr") || node.parentElement;
            const name = (node.textContent || "").replace(/\s+/g, " ").trim();
            if (!name || seen.has(name)) continue;
            seen.add(name);
            const blob = (row?.textContent || "").replace(/\s+/g, " ");
            const priceMatch = blob.match(/(\d[\d.,]+)/);
            const price = priceMatch
              ? Number(priceMatch[1].replace(/,/g, ""))
              : null;
            out.push({
              name,
              price: Number.isFinite(price) ? price : null,
              beds: "",
            });
          }
          return out.slice(0, 12);
        });
        for (const row of rows) {
          if (!row.name) continue;
          const nightly = row.price;
          const totalStay = nightly != null ? nightly * nights : null;
          parsed.push({
            id: `${hotel.id}-${row.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48),
            name: row.name,
            description: "",
            beds: row.beds,
            capacity: stay.adults || 2,
            sizeSqm: 0,
            price: nightly,
            currency: "USD",
            amenities: [],
            images: hotel.images.slice(0, 2),
            breakfastIncluded: /breakfast|إفطار/i.test(row.name),
            freeCancellation: false,
            view: "",
            partnerName: "Lonaliza",
            nightly,
            totalStay,
            available: true,
            rates: [
              {
                id: "std",
                board: /breakfast|إفطار/i.test(row.name) ? "breakfast" : "room_only",
                breakfastIncluded: /breakfast|إفطار/i.test(row.name),
                freeCancellation: false,
                price: nightly,
                nightly,
                totalStay,
                currency: "USD",
                partnerName: "Lonaliza",
              },
            ],
          });
        }
      },
    });

    try {
      await crawler.run();
    } finally {
      await crawler.teardown().catch(() => undefined);
      await requestQueue.drop().catch(() => undefined);
    }
    return parsed;
  }
}
