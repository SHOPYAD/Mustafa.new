import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Injectable } from "@nestjs/common";
import type { CatalogHotel } from "./catalog.types";

@Injectable()
export class CatalogService {
  private readonly hotels: CatalogHotel[];

  constructor() {
    this.hotels = this.load();
  }

  private load(): CatalogHotel[] {
    const candidates = [
      join(__dirname, "data", "hotels.catalog.json"),
      join(process.cwd(), "src/catalog/data/hotels.catalog.json"),
      join(process.cwd(), "dist/catalog/data/hotels.catalog.json"),
    ];
    for (const file of candidates) {
      if (!existsSync(file)) continue;
      const parsed = JSON.parse(readFileSync(file, "utf8")) as CatalogHotel[];
      return parsed.filter((h) => h.isActive !== false);
    }
    throw new Error("Owned hotel catalog JSON was not found");
  }

  list(): CatalogHotel[] {
    return this.hotels;
  }

  getById(id: string): CatalogHotel | null {
    const key = String(id || "")
      .replace(/^(ta-|owned-)/i, "")
      .trim()
      .toLowerCase();
    if (!key) return null;
    return (
      this.hotels.find((h) => h.id.toLowerCase() === key || h.slug.toLowerCase() === key) ||
      null
    );
  }

  search(query: string): CatalogHotel[] {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return this.hotels;
    return this.hotels.filter((h) => {
      const blob = [
        h.nameEn,
        h.nameAr,
        h.city,
        h.country,
        h.neighborhoodEn,
        h.neighborhoodAr,
        h.slug,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }

  cities(): string[] {
    return [...new Set(this.hotels.map((h) => h.city).filter(Boolean))].sort();
  }
}
