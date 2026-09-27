import type { CarCategory, CarExtra, RentalCar } from "@/types/car";
import {
  relatedLocationIds,
  resolveLocationQuery,
  type TurkeyLocation,
} from "@/lib/cars/turkey-locations";

export type InternalCarsSearchQuery = {
  pickup?: string;
  dropoff?: string;
  date?: string;
  returnDate?: string;
  guests?: string;
  category?: string;
};

export function parseGuests(value?: string): number {
  const n = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 16);
}

export function rentalDays(date?: string, returnDate?: string): number {
  if (!date || !returnDate) return 1;
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, diff);
}

export function carServesLocation(
  car: RentalCar,
  query: string
): boolean {
  const raw = query.trim();
  if (!raw) return true;
  if (car.pickupLocationIds.includes("*")) return true;

  const loc = resolveLocationQuery(raw);
  if (loc) {
    const related = new Set(relatedLocationIds(loc));
    return car.pickupLocationIds.some((id) => id === "*" || related.has(id));
  }

  const needle = raw.toLowerCase();
  return car.pickupLocationIds.some((id) => id.toLowerCase().includes(needle));
}

export function matchesInternalCar(
  car: RentalCar,
  query: InternalCarsSearchQuery
): boolean {
  if (!car.isActive) return false;
  if (query.pickup && !carServesLocation(car, query.pickup)) return false;
  if (query.guests && car.passengers < parseGuests(query.guests)) return false;
  if (query.category && car.category !== query.category) return false;
  return true;
}

export function extrasTotalPerDay(extras: CarExtra[], selected: string[]): number {
  const wanted = new Set(selected);
  return extras.reduce((sum, extra) => {
    if (!wanted.has(extra.key) || extra.included) return sum;
    return sum + Math.max(0, extra.pricePerDay);
  }, 0);
}

export function formatUsd(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  if (Number.isInteger(rounded)) return `$${rounded}`;
  return `$${rounded.toFixed(2)}`;
}

export function categoryRank(category: CarCategory): number {
  switch (category) {
    case "economy":
      return 0;
    case "compact":
      return 1;
    case "sedan":
      return 2;
    case "suv":
      return 3;
    case "minivan":
      return 4;
    case "luxury":
      return 5;
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

export function sortFleet(cars: RentalCar[]): RentalCar[] {
  return [...cars].sort((a, b) => {
    const cat = categoryRank(a.category) - categoryRank(b.category);
    if (cat !== 0) return cat;
    return a.pricePerDay - b.pricePerDay;
  });
}

export function resolvePickupLocation(
  query: string
): TurkeyLocation | undefined {
  return resolveLocationQuery(query);
}
