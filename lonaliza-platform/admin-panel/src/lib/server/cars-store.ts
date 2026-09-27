/**
 * Internal car-rental fleet — persisted in `.data/internal-cars.json`.
 * Same file-store pattern as custom pages / server-env.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  CAR_EXTRA_KEYS,
  defaultCarExtras,
  isCarCategory,
  isCarExtraKey,
  isCarTransmission,
  type CarExtra,
  type RentalCar,
  type RentalCarInput,
} from "@/types/car";
import { SEED_FLEET } from "@/lib/cars/seed-fleet";
import { getLocationById } from "@/lib/cars/turkey-locations";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "internal-cars.json");

type StoreFile = {
  cars: RentalCar[];
  updatedAt?: string;
};

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-internal-cars.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function newId(): string {
  return `car_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(raw: string): string {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sanitizePickupIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const unique = new Set<string>();
  for (const item of ids) {
    const id = String(item || "").trim();
    if (!id) continue;
    if (id === "*" || getLocationById(id)) unique.add(id);
  }
  return [...unique];
}

function sanitizeExtras(raw: unknown): CarExtra[] {
  const defaults = defaultCarExtras();
  if (!Array.isArray(raw)) return defaults;
  const byKey = new Map<string, CarExtra>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const key = String(rec.key || "");
    if (!isCarExtraKey(key)) continue;
    byKey.set(key, {
      key,
      pricePerDay: Math.max(0, Number(rec.pricePerDay) || 0),
      included: Boolean(rec.included),
    });
  }
  return defaults.map((extra) => byKey.get(extra.key) || extra);
}

function sanitizeCar(raw: Partial<RentalCar>, fallbackId?: string): RentalCar | null {
  const name = String(raw.name || "").trim();
  if (!name) return null;
  const categoryRaw = String(raw.category || "");
  const category = isCarCategory(categoryRaw) ? categoryRaw : "sedan";
  const transmissionRaw = String(raw.transmission || "");
  const transmission = isCarTransmission(transmissionRaw)
    ? transmissionRaw
    : "automatic";
  const now = new Date().toISOString();
  return {
    id: String(raw.id || fallbackId || newId()),
    slug: slugify(raw.slug || name) || slugify(name),
    name,
    nameAr: String(raw.nameAr || name).trim(),
    nameTr: String(raw.nameTr || name).trim(),
    category,
    passengers: Math.max(1, Math.min(16, Number(raw.passengers) || 5)),
    transmission,
    airConditioning: raw.airConditioning !== false,
    doors: Math.max(2, Math.min(6, Number(raw.doors) || 4)),
    luggage: Math.max(0, Math.min(12, Number(raw.luggage) || 2)),
    image: String(raw.image || "").trim(),
    pricePerDay: Math.max(0, Number(raw.pricePerDay) || 0),
    currency: "USD",
    pickupLocationIds: sanitizePickupIds(raw.pickupLocationIds),
    extras: sanitizeExtras(raw.extras),
    isActive: raw.isActive !== false,
    createdAt: String(raw.createdAt || now),
    updatedAt: String(raw.updatedAt || now),
  };
}

function cloneSeed(): RentalCar[] {
  return SEED_FLEET.map((car) => ({
    ...car,
    extras: car.extras.map((extra) => ({ ...extra })),
    pickupLocationIds: [...car.pickupLocationIds],
  }));
}

async function persistSeed(): Promise<RentalCar[]> {
  const cars = cloneSeed();
  try {
    await writeStore(cars);
  } catch {
    /* read-only fallback */
  }
  return cars;
}

async function readStore(): Promise<RentalCar[]> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!Array.isArray(parsed.cars) || parsed.cars.length === 0) {
      return persistSeed();
    }
    return parsed.cars
      .map((item) => sanitizeCar(item, item.id))
      .filter((item): item is RentalCar => Boolean(item));
  } catch {
    return persistSeed();
  }
}

async function writeStore(cars: RentalCar[]): Promise<void> {
  await ensureDir();
  const payload: StoreFile = {
    cars,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(getStoreFile(), JSON.stringify(payload, null, 2), {
    mode: 0o600,
  });
}

export async function listInternalCars(): Promise<RentalCar[]> {
  const cars = await readStore();
  return cars.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listActiveInternalCars(): Promise<RentalCar[]> {
  const cars = await listInternalCars();
  return cars.filter((car) => car.isActive);
}

export async function getInternalCarById(id: string): Promise<RentalCar | null> {
  const cars = await readStore();
  return cars.find((car) => car.id === id) || null;
}

export async function createInternalCar(
  input: RentalCarInput
): Promise<{ ok: true; car: RentalCar } | { ok: false; error: string }> {
  const car = sanitizeCar(input);
  if (!car) return { ok: false, error: "Car name is required" };
  car.id = newId();
  car.createdAt = new Date().toISOString();
  car.updatedAt = car.createdAt;

  const cars = await readStore();
  if (cars.some((item) => item.slug === car.slug)) {
    car.slug = `${car.slug}-${car.id.slice(-4)}`;
  }
  cars.push(car);
  await writeStore(cars);
  return { ok: true, car };
}

export async function updateInternalCar(
  id: string,
  input: RentalCarInput
): Promise<{ ok: true; car: RentalCar } | { ok: false; error: string }> {
  const cars = await readStore();
  const index = cars.findIndex((car) => car.id === id);
  if (index < 0) return { ok: false, error: "Car not found" };

  const merged = sanitizeCar({ ...cars[index], ...input, id }, id);
  if (!merged) return { ok: false, error: "Car name is required" };
  merged.createdAt = cars[index].createdAt;
  merged.updatedAt = new Date().toISOString();

  if (cars.some((item) => item.id !== id && item.slug === merged.slug)) {
    merged.slug = `${merged.slug}-${id.slice(-4)}`;
  }

  cars[index] = merged;
  await writeStore(cars);
  return { ok: true, car: merged };
}

export async function deleteInternalCar(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cars = await readStore();
  const next = cars.filter((car) => car.id !== id);
  if (next.length === cars.length) return { ok: false, error: "Car not found" };
  await writeStore(next);
  return { ok: true };
}

export async function resetInternalCars(): Promise<RentalCar[]> {
  const cars = SEED_FLEET.map((car) => ({
    ...car,
    extras: car.extras.map((extra) => ({ ...extra })),
    pickupLocationIds: [...car.pickupLocationIds],
    updatedAt: new Date().toISOString(),
  }));
  await writeStore(cars);
  return cars;
}

export { CAR_EXTRA_KEYS };
