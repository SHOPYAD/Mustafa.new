/**
 * Shared AI travel programs — persisted in `.data/ai-programs.json`.
 * Visible to all visitors until an admin hides or deletes them.
 */

import { promises as fs } from "fs";
import path from "path";
import type { AiProgramInput, SavedAiProgram } from "@/types/ai-program";
import { publishAiProgramToCatalog, unpublishPackage } from "@/lib/server/packages-store";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "ai-programs.json");
const DEDUPE_WINDOW_MS = 2 * 60 * 60 * 1000;

type StoreFile = {
  programs: SavedAiProgram[];
  updatedAt?: string;
};

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-ai-programs.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function newId(): string {
  return `aip_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeKeyPart(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function dedupeKey(input: {
  destination: string;
  arrivalDate?: string;
  departureDate?: string;
  titleAr: string;
  titleEn: string;
}): string {
  const title = normalizeKeyPart(input.titleAr || input.titleEn);
  return [
    normalizeKeyPart(input.destination),
    String(input.arrivalDate || "").slice(0, 10),
    String(input.departureDate || "").slice(0, 10),
    title,
  ].join("|");
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!Array.isArray(parsed.programs)) return { programs: [] };
    return parsed;
  } catch {
    return { programs: [] };
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await ensureDir();
  await fs.writeFile(
    getStoreFile(),
    JSON.stringify(
      { ...store, updatedAt: new Date().toISOString() },
      null,
      2
    )
  );
}

function sanitizeStringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 16);
}

function sanitizeProgram(
  input: AiProgramInput,
  existing?: SavedAiProgram
): SavedAiProgram {
  const nights = Math.max(0, Math.round(Number(input.nights) || 0));
  const people = Number(input.people);
  const price = Math.max(0, Math.round(Number(input.priceFromUsd) || 0));
  const itinerary = input.itinerary;
  return {
    id: existing?.id || newId(),
    titleAr: String(input.titleAr || input.titleEn || "").trim(),
    titleEn: String(input.titleEn || input.titleAr || "").trim(),
    destination: String(input.destination || "").trim(),
    nights,
    people: Number.isFinite(people) && people > 0 ? Math.round(people) : undefined,
    arrivalDate: input.arrivalDate ? String(input.arrivalDate).slice(0, 10) : undefined,
    departureDate: input.departureDate
      ? String(input.departureDate).slice(0, 10)
      : undefined,
    priceFromUsd: price,
    thumbnail: input.thumbnail ? String(input.thumbnail).slice(0, 500) : undefined,
    includesAr: sanitizeStringList(input.includesAr),
    includesEn: sanitizeStringList(input.includesEn),
    itinerary: {
      titleAr: itinerary.titleAr || input.titleAr || "",
      titleEn: itinerary.titleEn || input.titleEn || "",
      days: Array.isArray(itinerary.days) ? itinerary.days.slice(0, 21) : [],
      totalBasePrice: Number(itinerary.totalBasePrice) || 0,
      totalClientPrice: Number(itinerary.totalClientPrice) || price,
      currency: "USD",
    },
    cards: Array.isArray(input.cards) ? input.cards.slice(0, 12) : existing?.cards,
    flightHref: input.flightHref,
    transferHref: input.transferHref,
    carsHref: input.carsHref,
    hidden: existing?.hidden ?? false,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
}

export async function listAiPrograms(opts?: {
  includeHidden?: boolean;
}): Promise<SavedAiProgram[]> {
  const store = await readStore();
  const items = store.programs.slice().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  if (opts?.includeHidden) return items;
  return items.filter((p) => !p.hidden);
}

export async function getAiProgram(id: string): Promise<SavedAiProgram | null> {
  const store = await readStore();
  return store.programs.find((p) => p.id === id) || null;
}

export function isProgramCompleteEnough(input: AiProgramInput): boolean {
  const title = (input.titleAr || input.titleEn || "").trim();
  const dest = (input.destination || "").trim();
  const days = input.itinerary?.days?.length || 0;
  const includes =
    (input.includesAr?.length || 0) + (input.includesEn?.length || 0);
  if (!title || !dest) return false;
  if (days >= 2) return true;
  if (days >= 1 && includes >= 2) return true;
  if ((input.nights || 0) >= 2 && days >= 1) return true;
  return false;
}

export async function saveAiProgram(
  input: AiProgramInput
): Promise<{ program: SavedAiProgram; deduped: boolean }> {
  if (!isProgramCompleteEnough(input)) {
    throw new Error("program incomplete");
  }

  const store = await readStore();
  const incoming = sanitizeProgram(input);
  const key = dedupeKey(incoming);
  const now = Date.now();

  const duplicate = store.programs.find((p) => {
    if (dedupeKey(p) !== key) return false;
    const created = Date.parse(p.createdAt);
    return Number.isFinite(created) && now - created < DEDUPE_WINDOW_MS;
  });

  if (duplicate) {
    return { program: duplicate, deduped: true };
  }

  store.programs.unshift(incoming);
  await writeStore(store);
  await publishAiProgramToCatalog(incoming).catch(() => null);
  return { program: incoming, deduped: false };
}

export async function setAiProgramHidden(
  id: string,
  hidden: boolean
): Promise<SavedAiProgram | null> {
  const store = await readStore();
  const idx = store.programs.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  store.programs[idx] = { ...store.programs[idx], hidden };
  await writeStore(store);
  if (hidden) {
    await unpublishPackage(id).catch(() => false);
  }
  return store.programs[idx];
}

export async function deleteAiProgram(id: string): Promise<boolean> {
  const store = await readStore();
  const next = store.programs.filter((p) => p.id !== id);
  if (next.length === store.programs.length) return false;
  store.programs = next;
  await writeStore(store);
  await unpublishPackage(id).catch(() => false);
  return true;
}

export function toPublicProgram(program: SavedAiProgram) {
  const { hidden: _hidden, ...rest } = program;
  return rest;
}
