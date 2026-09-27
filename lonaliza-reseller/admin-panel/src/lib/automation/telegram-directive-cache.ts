import fs from "fs";
import path from "path";

export interface CachedTelegramDirective {
  id: string;
  chatId: string;
  text: string;
  createdAt: string;
  status: "pending_routing" | "routed" | "completed";
  assignedAgent?: string;
}

const DATA_DIR = path.join(process.cwd(), ".data", "agent-swarm");
const CACHE_FILE = path.join(DATA_DIR, "telegram-directives-cache.json");

// In-memory quick lookup cache
const memoryCache = new Map<string, CachedTelegramDirective>();

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadCacheFromFile(): void {
  try {
    ensureDir();
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      const list = JSON.parse(raw) as CachedTelegramDirective[];
      for (const item of list) {
        memoryCache.set(item.id, item);
      }
    }
  } catch {
    // Ignore read errors
  }
}

function persistCache(): void {
  try {
    ensureDir();
    const items = Array.from(memoryCache.values()).slice(-100); // keep last 100
    fs.writeFileSync(CACHE_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch {
    // Ignore write errors
  }
}

// Initial load
loadCacheFromFile();

export function storeTelegramDirective(chatId: string, text: string): CachedTelegramDirective {
  // Generate a short ID suitable for Telegram 64-byte callback_data
  const id = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const item: CachedTelegramDirective = {
    id,
    chatId,
    text,
    createdAt: new Date().toISOString(),
    status: "pending_routing",
  };
  memoryCache.set(id, item);
  persistCache();
  return item;
}

export function getTelegramDirective(id: string): CachedTelegramDirective | null {
  if (memoryCache.has(id)) {
    return memoryCache.get(id)!;
  }
  loadCacheFromFile();
  return memoryCache.get(id) || null;
}

export function updateTelegramDirectiveStatus(
  id: string,
  status: CachedTelegramDirective["status"],
  assignedAgent?: string
): void {
  const item = getTelegramDirective(id);
  if (item) {
    item.status = status;
    if (assignedAgent) item.assignedAgent = assignedAgent;
    memoryCache.set(id, item);
    persistCache();
  }
}
