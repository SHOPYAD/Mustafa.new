/**
 * Signatures, channel sets, and developer API key.
 * PocketBase collections when present; file fallback under `.data/publish/`.
 */

import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { newPublishId } from "./file-store";
import { publishDataDir } from "./paths";
import {
  isMissingCollectionError,
  PUBLISH_COLLECTIONS,
} from "./pb-collections";

export type PublishSignatureRecord = {
  id: string;
  name: string;
  content: string;
  autoAdd: boolean;
};

export type PublishSetRecord = {
  id: string;
  name: string;
  channelIds: string[];
};

export type PublishDevKeyPublic = {
  hasApiKey: boolean;
  apiKeyMasked: string;
};

export type PublishDevKeyGenerated = PublishDevKeyPublic & {
  apiKey: string;
};

type SettingsFile = {
  version: 1;
  signatures: PublishSignatureRecord[];
  sets: PublishSetRecord[];
  updatedAt: string;
};

type DevKeyFile = {
  hash: string;
  plain: string;
  masked: string;
  createdAt: string;
  revealed: boolean;
};

type PbClient = Awaited<ReturnType<typeof tryCreateAdminPocketBase>>;

let settingsMemory: SettingsFile | null = null;
let settingsWrite = Promise.resolve();
let keyMemory: DevKeyFile | null | undefined;
let keyWrite = Promise.resolve();

function forceFileStore(): boolean {
  return (process.env.PUBLISH_FORCE_FILE || "").trim() === "1";
}

function settingsFilePath(): string {
  return path.join(publishDataDir(), "settings.json");
}

function devKeyFilePath(): string {
  return path.join(publishDataDir(), "dev-key.json");
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asJson(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}

function compactRecord(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === "") continue;
    out[key] = value;
  }
  return out;
}

function channelIdsFrom(value: unknown): string[] {
  const parsed = asJson(value);
  if (Array.isArray(parsed)) {
    return parsed.map((row) => asString(row)).filter(Boolean);
  }
  const rec = asRecord(parsed);
  const ids = rec.channelIds ?? rec.channel_ids ?? rec.channels;
  if (Array.isArray(ids)) {
    return ids
      .map((row) => {
        if (typeof row === "string") return row.trim();
        return asString(asRecord(row).id);
      })
      .filter(Boolean);
  }
  return [];
}

export function sanitizeSignature(raw: unknown): PublishSignatureRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = asString(row.id);
  const content = asString(row.content || row.text);
  if (!id || !content) return null;
  const name =
    asString(row.name).trim() ||
    content.split("\n")[0].trim().slice(0, 40) ||
    "توقيع";
  return {
    id,
    name,
    content,
    autoAdd: asBool(row.autoAdd ?? row.auto_add),
  };
}

export function sanitizeSet(raw: unknown): PublishSetRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = asString(row.id);
  const name = asString(row.name).trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    channelIds: channelIdsFrom(
      row.channelIds ?? row.channel_ids ?? row.channels ?? row.content
    ),
  };
}

function emptySettings(): SettingsFile {
  return {
    version: 1,
    signatures: [],
    sets: [],
    updatedAt: new Date().toISOString(),
  };
}

async function atomicWrite(file: string, payload: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(payload, null, 2), { mode: 0o600 });
  await fs.rename(tmp, file);
}

async function readSettingsFile(): Promise<SettingsFile> {
  if (settingsMemory) return settingsMemory;
  try {
    const raw = await fs.readFile(settingsFilePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<SettingsFile>;
    settingsMemory = {
      version: 1,
      signatures: Array.isArray(parsed.signatures)
        ? parsed.signatures
            .map(sanitizeSignature)
            .filter((row): row is PublishSignatureRecord => Boolean(row))
        : [],
      sets: Array.isArray(parsed.sets)
        ? parsed.sets.map(sanitizeSet).filter((row): row is PublishSetRecord => Boolean(row))
        : [],
      updatedAt: asString(parsed.updatedAt) || new Date().toISOString(),
    };
    return settingsMemory;
  } catch {
    settingsMemory = emptySettings();
    return settingsMemory;
  }
}

async function writeSettingsFile(next: SettingsFile): Promise<void> {
  settingsMemory = { ...next, updatedAt: new Date().toISOString() };
  settingsWrite = settingsWrite.then(async () => {
    await atomicWrite(settingsFilePath(), settingsMemory);
  });
  await settingsWrite;
}

async function readDevKeyFile(): Promise<DevKeyFile | null> {
  if (keyMemory !== undefined) return keyMemory;
  try {
    const raw = await fs.readFile(devKeyFilePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<DevKeyFile>;
    const hash = asString(parsed.hash);
    const plain = asString(parsed.plain);
    if (!hash || !plain) {
      keyMemory = null;
      return null;
    }
    keyMemory = {
      hash,
      plain,
      masked: asString(parsed.masked) || maskApiKey(plain),
      createdAt: asString(parsed.createdAt) || new Date().toISOString(),
      revealed: parsed.revealed !== false,
    };
    return keyMemory;
  } catch {
    keyMemory = null;
    return null;
  }
}

async function writeDevKeyFile(next: DevKeyFile): Promise<void> {
  keyMemory = next;
  keyWrite = keyWrite.then(async () => {
    await atomicWrite(devKeyFilePath(), next);
  });
  await keyWrite;
}

export function maskApiKey(plain: string): string {
  const value = String(plain || "");
  if (!value) return "";
  const lastFour = value.slice(-4);
  const prefix = value.startsWith("lzpub_") ? "lzpub_" : value.slice(0, Math.min(6, value.length));
  return `${prefix}••••${lastFour}`;
}

function hashApiKey(plain: string): string {
  return createHash("sha256").update(plain, "utf8").digest("hex");
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

async function pbListSignatures(): Promise<PublishSignatureRecord[] | null> {
  try {
    const rows = await pbCall(PUBLISH_COLLECTIONS.signatures, (pb) =>
      pb.collection(PUBLISH_COLLECTIONS.signatures).getFullList({ sort: "-created" })
    );
    if (!rows) return null;
    return rows
      .map((row) => sanitizeSignature({ ...asRecord(row), id: (row as { id?: string }).id }))
      .filter((row): row is PublishSignatureRecord => Boolean(row));
  } catch {
    return null;
  }
}

async function pbSaveSignature(
  row: PublishSignatureRecord,
  isNew: boolean
): Promise<PublishSignatureRecord | null> {
  const body = compactRecord({
    content: row.content,
    autoAdd: row.autoAdd,
  });
  try {
    const saved = await pbCall(PUBLISH_COLLECTIONS.signatures, async (pb) => {
      const col = pb.collection(PUBLISH_COLLECTIONS.signatures);
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
    return sanitizeSignature({
      ...asRecord(saved),
      id: (saved as { id?: string }).id,
      name: row.name,
    });
  } catch {
    return null;
  }
}

async function pbDeleteSignature(id: string): Promise<boolean | null> {
  try {
    return await pbCall(PUBLISH_COLLECTIONS.signatures, async (pb) => {
      await pb.collection(PUBLISH_COLLECTIONS.signatures).delete(id);
      return true;
    });
  } catch {
    return false;
  }
}

async function pbListSets(): Promise<PublishSetRecord[] | null> {
  try {
    const rows = await pbCall(PUBLISH_COLLECTIONS.sets, (pb) =>
      pb.collection(PUBLISH_COLLECTIONS.sets).getFullList({ sort: "-created" })
    );
    if (!rows) return null;
    return rows
      .map((row) => sanitizeSet({ ...asRecord(row), id: (row as { id?: string }).id }))
      .filter((row): row is PublishSetRecord => Boolean(row));
  } catch {
    return null;
  }
}

async function pbSaveSet(row: PublishSetRecord, isNew: boolean): Promise<PublishSetRecord | null> {
  const body = compactRecord({
    name: row.name,
    content: { channelIds: row.channelIds },
  });
  try {
    const saved = await pbCall(PUBLISH_COLLECTIONS.sets, async (pb) => {
      const col = pb.collection(PUBLISH_COLLECTIONS.sets);
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
    return sanitizeSet({ ...asRecord(saved), id: (saved as { id?: string }).id });
  } catch {
    return null;
  }
}

async function pbDeleteSet(id: string): Promise<boolean | null> {
  try {
    return await pbCall(PUBLISH_COLLECTIONS.sets, async (pb) => {
      await pb.collection(PUBLISH_COLLECTIONS.sets).delete(id);
      return true;
    });
  } catch {
    return false;
  }
}

async function fileListSignatures(): Promise<PublishSignatureRecord[]> {
  const store = await readSettingsFile();
  return store.signatures;
}

async function fileSaveSignature(row: PublishSignatureRecord): Promise<PublishSignatureRecord> {
  const store = await readSettingsFile();
  const next = store.signatures.filter((item) => item.id !== row.id);
  next.push(row);
  await writeSettingsFile({ ...store, signatures: next });
  return row;
}

async function fileDeleteSignature(id: string): Promise<boolean> {
  const store = await readSettingsFile();
  const next = store.signatures.filter((item) => item.id !== id);
  if (next.length === store.signatures.length) return false;
  await writeSettingsFile({ ...store, signatures: next });
  return true;
}

async function fileListSets(): Promise<PublishSetRecord[]> {
  const store = await readSettingsFile();
  return store.sets;
}

async function fileSaveSet(row: PublishSetRecord): Promise<PublishSetRecord> {
  const store = await readSettingsFile();
  const next = store.sets.filter((item) => item.id !== row.id);
  next.push(row);
  await writeSettingsFile({ ...store, sets: next });
  return row;
}

async function fileDeleteSet(id: string): Promise<boolean> {
  const store = await readSettingsFile();
  const next = store.sets.filter((item) => item.id !== id);
  if (next.length === store.sets.length) return false;
  await writeSettingsFile({ ...store, sets: next });
  return true;
}

function overlayNames(
  rows: PublishSignatureRecord[],
  fileRows: PublishSignatureRecord[]
): PublishSignatureRecord[] {
  if (fileRows.length === 0) return rows;
  const names = new Map(fileRows.map((row) => [row.id, row.name]));
  return rows.map((row) => {
    const fileName = names.get(row.id);
    return fileName ? { ...row, name: fileName } : row;
  });
}

export async function listSignatures(): Promise<PublishSignatureRecord[]> {
  if (!forceFileStore()) {
    try {
      const fromPb = await pbListSignatures();
      if (fromPb) {
        const fileRows = await fileListSignatures().catch(() => []);
        return overlayNames(fromPb, fileRows);
      }
    } catch {
      /* file */
    }
  }
  try {
    return await fileListSignatures();
  } catch {
    return [];
  }
}

export async function saveSignature(raw: unknown): Promise<PublishSignatureRecord> {
  const rec = asRecord(raw);
  const existingId = asString(rec.id);
  const content = asString(rec.content || rec.text).trim();
  if (!content) throw new Error("نص التوقيع مطلوب");
  const name = asString(rec.name).trim() || content.split("\n")[0].trim().slice(0, 40) || "توقيع";
  const row: PublishSignatureRecord = {
    id: existingId || newPublishId("s"),
    name,
    content,
    autoAdd: asBool(rec.autoAdd ?? rec.auto_add),
  };
  const isNew = !existingId;
  if (!forceFileStore()) {
    try {
      const fromPb = await pbSaveSignature(row, isNew);
      if (fromPb) {
        const named = { ...fromPb, name: row.name };
        try {
          await fileSaveSignature(named);
        } catch {
          /* mirror optional */
        }
        return named;
      }
    } catch {
      /* file */
    }
  }
  return fileSaveSignature(row);
}

export async function deleteSignature(id: string): Promise<boolean> {
  let ok = false;
  if (!forceFileStore()) {
    try {
      if (await pbDeleteSignature(id)) ok = true;
    } catch {
      /* continue */
    }
  }
  try {
    if (await fileDeleteSignature(id)) ok = true;
  } catch {
    /* ignore */
  }
  return ok;
}

export async function listSets(): Promise<PublishSetRecord[]> {
  if (!forceFileStore()) {
    try {
      const fromPb = await pbListSets();
      if (fromPb) return fromPb;
    } catch {
      /* file */
    }
  }
  try {
    return await fileListSets();
  } catch {
    return [];
  }
}

export async function saveSet(raw: unknown): Promise<PublishSetRecord> {
  const rec = asRecord(raw);
  const existingId = asString(rec.id);
  const name = asString(rec.name).trim();
  if (!name) throw new Error("اسم المجموعة مطلوب");
  const row: PublishSetRecord = {
    id: existingId || newPublishId("g"),
    name,
    channelIds: channelIdsFrom(rec.channelIds ?? rec.channel_ids ?? rec.channels ?? rec.content),
  };
  const isNew = !existingId;
  if (!forceFileStore()) {
    try {
      const fromPb = await pbSaveSet(row, isNew);
      if (fromPb) {
        try {
          await fileSaveSet(fromPb);
        } catch {
          /* optional */
        }
        return fromPb;
      }
    } catch {
      /* file */
    }
  }
  return fileSaveSet(row);
}

export async function deleteSet(id: string): Promise<boolean> {
  let ok = false;
  if (!forceFileStore()) {
    try {
      if (await pbDeleteSet(id)) ok = true;
    } catch {
      /* continue */
    }
  }
  try {
    if (await fileDeleteSet(id)) ok = true;
  } catch {
    /* ignore */
  }
  return ok;
}

export async function getDevKeyPublic(): Promise<PublishDevKeyPublic> {
  try {
    const stored = await readDevKeyFile();
    if (!stored) return { hasApiKey: false, apiKeyMasked: "" };
    return { hasApiKey: true, apiKeyMasked: stored.masked || maskApiKey(stored.plain) };
  } catch {
    return { hasApiKey: false, apiKeyMasked: "" };
  }
}

/** Generate a new key. Plaintext is returned once in this response only. */
export async function generateDevKey(): Promise<PublishDevKeyGenerated> {
  const plain = `lzpub_${randomBytes(32).toString("hex")}`;
  const record: DevKeyFile = {
    hash: hashApiKey(plain),
    plain,
    masked: maskApiKey(plain),
    createdAt: new Date().toISOString(),
    revealed: true,
  };
  await writeDevKeyFile(record);
  return {
    apiKey: plain,
    apiKeyMasked: record.masked,
    hasApiKey: true,
  };
}

export async function verifyPublishDevKey(raw: string): Promise<boolean> {
  const stored = await readDevKeyFile();
  if (!stored) return false;
  const incoming = hashApiKey(String(raw || ""));
  const a = Buffer.from(incoming, "hex");
  const b = Buffer.from(stored.hash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function getPublishSettingsPayload(): Promise<{
  signatures: PublishSignatureRecord[];
  sets: PublishSetRecord[];
  hasApiKey: boolean;
  apiKeyMasked: string;
}> {
  const [signatures, sets, key] = await Promise.all([
    listSignatures(),
    listSets(),
    getDevKeyPublic(),
  ]);
  return {
    signatures,
    sets,
    hasApiKey: key.hasApiKey,
    apiKeyMasked: key.apiKeyMasked,
  };
}

export function resetPublishSettingsMemory(): void {
  settingsMemory = null;
  keyMemory = undefined;
}
