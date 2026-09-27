export const CAR_CATEGORIES = [
  "economy",
  "compact",
  "sedan",
  "suv",
  "minivan",
  "luxury",
] as const;

export type CarCategory = (typeof CAR_CATEGORIES)[number];

export const CAR_TRANSMISSIONS = ["automatic", "manual"] as const;

export type CarTransmission = (typeof CAR_TRANSMISSIONS)[number];

export const CAR_EXTRA_KEYS = [
  "additionalDriver",
  "childSeat",
  "gps",
  "fullInsurance",
  "excessReduction",
] as const;

export type CarExtraKey = (typeof CAR_EXTRA_KEYS)[number];

export interface CarExtra {
  key: CarExtraKey;
  pricePerDay: number;
  included: boolean;
}

export interface RentalCar {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  nameTr: string;
  category: CarCategory;
  passengers: number;
  transmission: CarTransmission;
  airConditioning: boolean;
  doors: number;
  luggage: number;
  image: string;
  pricePerDay: number;
  currency: "USD";
  /** Location ids from turkey-locations. `*` = nationwide. */
  pickupLocationIds: string[];
  extras: CarExtra[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RentalCarInput = Partial<Omit<RentalCar, "id" | "createdAt">> & {
  name: string;
};

export const DEFAULT_CAR_EXTRA_PRICES: Record<CarExtraKey, number> = {
  additionalDriver: 8,
  childSeat: 5,
  gps: 4,
  fullInsurance: 15,
  excessReduction: 12,
};

export function defaultCarExtras(): CarExtra[] {
  return CAR_EXTRA_KEYS.map((key) => ({
    key,
    pricePerDay: DEFAULT_CAR_EXTRA_PRICES[key],
    included: false,
  }));
}

export function isCarCategory(value: string): value is CarCategory {
  return (CAR_CATEGORIES as readonly string[]).includes(value);
}

export function isCarTransmission(value: string): value is CarTransmission {
  return (CAR_TRANSMISSIONS as readonly string[]).includes(value);
}

export function isCarExtraKey(value: string): value is CarExtraKey {
  return (CAR_EXTRA_KEYS as readonly string[]).includes(value);
}
