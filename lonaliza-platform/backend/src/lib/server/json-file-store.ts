import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const queues = new Map<string, Promise<void>>();

export async function readJsonStore<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonStore<T>(file: string, value: T): Promise<T> {
  const target = path.join(DATA_DIR, file);
  const prev = queues.get(file) || Promise.resolve();
  const next = prev.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(target, JSON.stringify(value, null, 2), "utf-8");
  });
  queues.set(file, next.catch(() => undefined));
  await next;
  return value;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
