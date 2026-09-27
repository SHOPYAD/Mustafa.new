/**
 * Publish media library: PocketBase `publish_media` when present,
 * plus `.data/publish/media.json` and studio files from upload-from-url.
 */

import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { newPublishId } from "./file-store";
import { publishDataDir } from "./paths";
import { isMissingCollectionError, PUBLISH_COLLECTIONS } from "./pb-collections";
import { listStudioPublishUploads, type StudioPublishMediaItem } from "./upload";

export type PublishMediaRecord = {
  id: string;
  name: string;
  url?: string;
  path?: string;
  thumbnail?: string;
  type?: string;
  mime?: string;
  size?: number;
  alt?: string;
  createdAt?: string;
};

type MediaFile = {
  version: 1;
  media: PublishMediaRecord[];
  updatedAt: string;
};

type PbClient = Awaited<ReturnType<typeof tryCreateAdminPocketBase>>;

let memory: MediaFile | null = null;
let writeQueue = Promise.resolve();

function forceFileStore(): boolean {
  return (process.env.PUBLISH_FORCE_FILE || "").trim() === "1";
}

function mediaFilePath(): string {
  return path.join(publishDataDir(), "media.json");
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function compactRecord(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === "") continue;
    out[key] = value;
  }
  return out;
}

export function sanitizeMedia(raw: unknown): PublishMediaRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = asString(row.id);
  const pathValue = asString(row.path || row.url || row.src || row.file);
  if (!id && !pathValue) return null;
  const name =
    asString(row.name || row.originalName || row.filename || row.title).trim() || "وسيط";
  const url = asString(row.url || row.path || row.src) || pathValue || undefined;
  const size = asNumber(row.size ?? row.fileSize);
  return {
    id: id || url || pathValue,
    name,
    url,
    path: asString(row.path) || url,
    thumbnail: asString(row.thumbnail || row.thumb || row.preview || url) || undefined,
    type: asString(row.type || row.kind) || undefined,
    mime: asString(row.mime || row.mimeType) || undefined,
    size,
    alt: asString(row.alt) || undefined,
    createdAt:
      asString(row.createdAt || row.created_at || row.created || row.timestamp) || undefined,
  };
}

function empty(): MediaFile {
  return {
    version: 1,
    media: [],
    updatedAt: new Date().toISOString(),
  };
}

async function atomicWrite(file: string, payload: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(payload, null, 2), { mode: 0o600 });
  await fs.rename(tmp, file);
}

async function readFileStore(): Promise<MediaFile> {
  if (memory) return memory;
  try {
    const raw = await fs.readFile(mediaFilePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<MediaFile>;
    memory = {
      version: 1,
      media: Array.isArray(parsed.media)
        ? parsed.media.map(sanitizeMedia).filter((row): row is PublishMediaRecord => Boolean(row))
        : [],
      updatedAt: asString(parsed.updatedAt) || new Date().toISOString(),
    };
    return memory;
  } catch {
    memory = empty();
    return memory;
  }
}

async function writeFileStore(next: MediaFile): Promise<void> {
  memory = { ...next, updatedAt: new Date().toISOString() };
  writeQueue = writeQueue.then(async () => {
    await atomicWrite(mediaFilePath(), memory);
  });
  await writeQueue;
}

async function pbCall<T>(
  collection: string,
  fn: (pb: NonNullable<PbClient>) => Promise<T>
): Promise<T | null> {
  if (forceFileStore()) return null;
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  try {
    return await fn(pb);
  } catch (err) {
    if (isMissingCollectionError(err)) return null;
    throw err;
  }
}

async function pbListMediaRows(): Promise<PublishMediaRecord[] | null> {
  try {
    const rows = await pbCall(PUBLISH_COLLECTIONS.media, (pb) =>
      pb.collection(PUBLISH_COLLECTIONS.media).getFullList({ sort: "-created" })
    );
    if (!rows) return null;
    return rows
      .map((row) => sanitizeMedia({ ...asRecord(row), id: (row as { id?: string }).id }))
      .filter((row): row is PublishMediaRecord => Boolean(row));
  } catch {
    return null;
  }
}

async function pbSaveMedia(
  row: PublishMediaRecord,
  isNew: boolean
): Promise<PublishMediaRecord | null> {
  const body = compactRecord({
    name: row.name,
    originalName: row.name,
    path: row.path || row.url || "",
    type: row.type || "",
    fileSize: row.size,
    thumbnail: row.thumbnail || "",
    alt: row.alt || "",
  });
  try {
    const saved = await pbCall(PUBLISH_COLLECTIONS.media, async (pb) => {
      const col = pb.collection(PUBLISH_COLLECTIONS.media);
      if (isNew) {
        try {
          return await col.create({ id: row.id, ...body });
        } catch {
          return col.create(body);
        }
      }
      return col.update(row.id, body);
    });
    if (!saved) return null;
    return sanitizeMedia({ ...asRecord(saved), id: (saved as { id?: string }).id });
  } catch {
    return null;
  }
}

async function fileListMedia(): Promise<PublishMediaRecord[]> {
  const store = await readFileStore();
  return store.media;
}

async function fileSaveMedia(row: PublishMediaRecord): Promise<PublishMediaRecord> {
  const store = await readFileStore();
  const next = store.media.filter((item) => item.id !== row.id);
  next.unshift(row);
  await writeFileStore({ ...store, media: next });
  return row;
}

function fromStudio(row: StudioPublishMediaItem): PublishMediaRecord {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    path: row.url,
    thumbnail: row.thumbnail || (row.type === "image" ? row.url : undefined),
    type: row.type,
    mime: row.mime,
    size: row.size,
    createdAt: row.createdAt,
  };
}

function mergeMedia(
  primary: PublishMediaRecord[],
  extras: PublishMediaRecord[]
): PublishMediaRecord[] {
  const seen = new Set<string>();
  const out: PublishMediaRecord[] = [];
  for (const row of [...primary, ...extras]) {
    const keys = [row.id, row.url, row.path].filter(Boolean) as string[];
    if (keys.some((key) => seen.has(key))) continue;
    for (const key of keys) seen.add(key);
    out.push(row);
  }
  return out.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export async function listMedia(): Promise<PublishMediaRecord[]> {
  let fromPb: PublishMediaRecord[] | null = null;
  if (!forceFileStore()) {
    try {
      fromPb = await pbListMediaRows();
    } catch {
      fromPb = null;
    }
  }
  let fromFile: PublishMediaRecord[] = [];
  try {
    fromFile = await fileListMedia();
  } catch {
    fromFile = [];
  }
  let fromStudio: PublishMediaRecord[] = [];
  try {
    fromStudio = (await listStudioPublishUploads())
      .map((item) => sanitizeMedia(item))
      .filter((row): row is PublishMediaRecord => Boolean(row));
  } catch {
    fromStudio = [];
  }
  return mergeMedia(fromPb || [], [...fromFile, ...fromStudio]);
}

export async function saveMedia(raw: unknown): Promise<PublishMediaRecord> {
  const rec = asRecord(raw);
  const url = asString(rec.url || rec.path || rec.src).trim();
  const name = asString(rec.name || rec.originalName || rec.filename).trim() || "وسيط";
  if (!url && !asString(rec.id)) throw new Error("رابط الوسيط مطلوب");
  const existingId = asString(rec.id);
  const row: PublishMediaRecord = {
    id: existingId || newPublishId("m"),
    name,
    url: url || undefined,
    path: asString(rec.path) || url || undefined,
    thumbnail: asString(rec.thumbnail) || url || undefined,
    type: asString(rec.type || rec.kind) || undefined,
    mime: asString(rec.mime || rec.mimeType) || undefined,
    size: asNumber(rec.size ?? rec.fileSize),
    alt: asString(rec.alt) || undefined,
    createdAt: asString(rec.createdAt) || new Date().toISOString(),
  };
  const isNew = !existingId;
  if (!forceFileStore()) {
    try {
      const fromPb = await pbSaveMedia(row, isNew);
      if (fromPb) {
        try {
          await fileSaveMedia(fromPb);
        } catch {
          /* optional */
        }
        return fromPb;
      }
    } catch {
      /* file */
    }
  }
  return fileSaveMedia(row);
}

export function resetPublishMediaMemory(): void {
  memory = null;
}
