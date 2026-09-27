import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const TTL_MS = 60_000;

export type HandoffRecord = {
  token: string;
  userId: string;
  email: string;
  name: string;
  path: string;
  expiresAt: number;
};

type StoreFile = Record<string, HandoffRecord>;

function getStoreFile(): string {
  if (process.env.MOBILE_HANDOFF_STORE_FILE) return process.env.MOBILE_HANDOFF_STORE_FILE;
  return path.join(process.cwd(), ".data", "mobile-handoff.json");
}

async function readAll(): Promise<StoreFile> {
  try {
    const raw = JSON.parse(await fs.readFile(getStoreFile(), "utf8")) as StoreFile;
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

async function writeAll(data: StoreFile) {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
  await fs.writeFile(getStoreFile(), JSON.stringify(data), "utf8");
}

export async function mintHandoff(record: Omit<HandoffRecord, "expiresAt">): Promise<string> {
  const code = randomBytes(24).toString("base64url");
  const all = await readAll();
  const now = Date.now();
  for (const [key, value] of Object.entries(all)) {
    if (value.expiresAt <= now) delete all[key];
  }
  all[code] = { ...record, expiresAt: now + TTL_MS };
  await writeAll(all);
  return code;
}

export async function consumeHandoff(code: string): Promise<HandoffRecord | null> {
  const all = await readAll();
  const rec = all[code];
  if (!rec) return null;
  delete all[code];
  await writeAll(all);
  if (rec.expiresAt <= Date.now()) return null;
  return rec;
}
