import { promises as fs } from "fs";
import { randomBytes } from "crypto";
import path from "path";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { newPublishId } from "./file-store";
import { publishDataDir } from "./paths";
import { isMissingCollectionError, PUBLISH_COLLECTIONS } from "./pb-collections";
import type { PublishPost } from "./types";

export type PublishWebhookRecord = {
  id: string;
  name: string;
  url: string;
  channelIds: string[];
};

type FilePayload = { version: 1; webhooks: PublishWebhookRecord[]; updatedAt: string };

let memory: FilePayload | null = null;
let writeQueue = Promise.resolve();

function forceFileStore(): boolean {
  return (process.env.PUBLISH_FORCE_FILE || "").trim() === "1";
}

function filePath(): string {
  return path.join(publishDataDir(), "webhooks.json");
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function channelIdsFrom(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((row) => (typeof row === "string" ? row : asString(asRecord(row).id)))
      .map((row) => row.trim())
      .filter(Boolean);
  }
  return [];
}

export function sanitizeWebhook(raw: unknown): PublishWebhookRecord | null {
  const row = asRecord(raw);
  const id = asString(row.id);
  const name = asString(row.name).trim();
  const url = asString(row.url).trim();
  if (!id || !name || !url) return null;
  return { id, name, url, channelIds: channelIdsFrom(row.channelIds ?? row.channel_ids ?? row.channels ?? row.integrations) };
}

async function readFileStore(): Promise<FilePayload> {
  if (memory) return memory;
  try {
    const parsed = JSON.parse(await fs.readFile(filePath(), "utf8")) as Partial<FilePayload>;
    memory = {
      version: 1,
      webhooks: Array.isArray(parsed.webhooks)
        ? parsed.webhooks.map(sanitizeWebhook).filter((row): row is PublishWebhookRecord => Boolean(row))
        : [],
      updatedAt: asString(parsed.updatedAt) || new Date().toISOString(),
    };
  } catch {
    memory = { version: 1, webhooks: [], updatedAt: new Date().toISOString() };
  }
  return memory;
}

async function writeFileStore(next: FilePayload): Promise<void> {
  memory = { ...next, updatedAt: new Date().toISOString() };
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(filePath()), { recursive: true, mode: 0o700 });
    const tmp = `${filePath()}.${randomBytes(4).toString("hex")}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(memory, null, 2), { mode: 0o600 });
    await fs.rename(tmp, filePath());
  });
  await writeQueue;
}

export async function listWebhooks(): Promise<PublishWebhookRecord[]> {
  if (!forceFileStore()) {
    try {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        const rows = await pb.collection(PUBLISH_COLLECTIONS.webhooks).getFullList({ sort: "-created" });
        return rows
          .map((row) => sanitizeWebhook({ ...asRecord(row), id: (row as { id?: string }).id }))
          .filter((row): row is PublishWebhookRecord => Boolean(row));
      }
    } catch (err) {
      if (!isMissingCollectionError(err)) {
        /* file */
      }
    }
  }
  return (await readFileStore()).webhooks;
}

export async function saveWebhook(raw: unknown): Promise<PublishWebhookRecord> {
  const rec = asRecord(raw);
  const url = asString(rec.url).trim();
  const name = asString(rec.name).trim();
  if (!name) throw new Error("اسم الويب هوك مطلوب");
  assertPublicHttps(url);
  const row: PublishWebhookRecord = {
    id: asString(rec.id) || newPublishId("wh"),
    name,
    url,
    channelIds: channelIdsFrom(rec.channelIds ?? rec.channel_ids ?? rec.channels ?? rec.integrations),
  };
  if (!forceFileStore()) {
    try {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        const col = pb.collection(PUBLISH_COLLECTIONS.webhooks);
        const body = { name: row.name, url: row.url, channels: row.channelIds };
        const saved = rec.id ? await col.update(row.id, body) : await col.create({ id: row.id, ...body });
        const parsed = sanitizeWebhook({ ...asRecord(saved), id: (saved as { id?: string }).id, channelIds: row.channelIds });
        if (parsed) return parsed;
      }
    } catch {
      /* file */
    }
  }
  const store = await readFileStore();
  await writeFileStore({
    ...store,
    webhooks: [row, ...store.webhooks.filter((item) => item.id !== row.id)],
  });
  return row;
}

export async function deleteWebhook(id: string): Promise<boolean> {
  let ok = false;
  if (!forceFileStore()) {
    try {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        await pb.collection(PUBLISH_COLLECTIONS.webhooks).delete(id);
        ok = true;
      }
    } catch {
      /* file */
    }
  }
  const store = await readFileStore();
  const next = store.webhooks.filter((row) => row.id !== id);
  if (next.length !== store.webhooks.length) {
    await writeFileStore({ ...store, webhooks: next });
    ok = true;
  }
  return ok;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = String(hostname || "").trim().toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost") || host === "0.0.0.0") return true;
  if (host === "::1" || host.startsWith("127.")) return true;
  const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 10 || a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
  }
  return false;
}

function assertPublicHttps(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("رابط الويب هوك غير صالح");
  }
  if (parsed.protocol !== "https:") throw new Error("رابط الويب هوك يجب أن يبدأ بـ https://");
  if (isBlockedHostname(parsed.hostname)) throw new Error("لا يُسمح بروابط داخلية أو خاصة");
}

export async function firePublishWebhooks(
  post: PublishPost,
  event: "published" | "error",
  fetchImpl: typeof fetch = fetch
): Promise<{ attempted: number; sent: number }> {
  const hooks = await listWebhooks();
  const matching = hooks.filter((hook) => hook.channelIds.length === 0 || hook.channelIds.includes(post.channelId));
  let sent = 0;
  await Promise.all(
    matching.map(async (hook) => {
      try {
        const res = await fetchImpl(hook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            post: {
              id: post.id,
              channelId: post.channelId,
              state: post.state,
              releaseId: post.releaseId,
              releaseURL: post.releaseURL,
              error: post.error,
              title: post.title,
            },
          }),
        });
        if (res.ok) sent += 1;
      } catch {
        /* do not fail publish */
      }
    })
  );
  return { attempted: matching.length, sent };
}

export function resetPublishWebhooksMemory(): void {
  memory = null;
}
