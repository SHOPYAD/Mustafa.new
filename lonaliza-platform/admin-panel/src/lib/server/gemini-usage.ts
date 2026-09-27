import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const USAGE_FILE = path.join(DATA_DIR, "gemini-usage.json");

export type GeminiLane = "free" | "paid";

export type GeminiDailyUsage = {
  date: string;
  freeCount: number;
  paidCount: number;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function readUsage(): Promise<GeminiDailyUsage> {
  const date = todayKey();
  try {
    const raw = await fs.readFile(USAGE_FILE, "utf8");
    const parsed = JSON.parse(raw) as GeminiDailyUsage;
    if (parsed.date === date) {
      return {
        date,
        freeCount: Number(parsed.freeCount) || 0,
        paidCount: Number(parsed.paidCount) || 0,
      };
    }
  } catch {
    /* missing or invalid */
  }
  return { date, freeCount: 0, paidCount: 0 };
}

export async function getGeminiDailyUsage(): Promise<GeminiDailyUsage> {
  return readUsage();
}

export async function incrementGeminiUsage(
  lane: GeminiLane
): Promise<GeminiDailyUsage> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const current = await readUsage();
  const next: GeminiDailyUsage = {
    date: current.date,
    freeCount: current.freeCount + (lane === "free" ? 1 : 0),
    paidCount: current.paidCount + (lane === "paid" ? 1 : 0),
  };
  await fs.writeFile(USAGE_FILE, JSON.stringify(next, null, 2));
  return next;
}

export function isGeminiQuotaError(status: number, message: string): boolean {
  if (status === 429) return true;
  return /RESOURCE_EXHAUSTED|quota|rate limit|Too Many Requests/i.test(
    message
  );
}
