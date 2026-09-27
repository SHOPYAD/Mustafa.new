import { promises as fs } from "fs";
import { randomBytes } from "crypto";
import path from "path";
import { publishStoreFile } from "./paths";
import { isPublishState } from "./state";
import type {
  PublishCreationMethod,
  PublishErrorRecord,
  PublishPost,
  StoredPublishChannel,
} from "./types";

type FilePayload = {
  version: 1;
  channels: StoredPublishChannel[];
  posts: PublishPost[];
  errors: PublishErrorRecord[];
  updatedAt: string;
};

let writeQueue = Promise.resolve();
let memory: FilePayload | null = null;

function empty(): FilePayload {
  return {
    version: 1,
    channels: [],
    posts: [],
    errors: [],
    updatedAt: new Date().toISOString(),
  };
}

export function newPublishId(prefix = "p"): string {
  return `${prefix}${randomBytes(8).toString("hex").slice(0, 14)}`;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asCreationMethod(value: unknown): PublishCreationMethod {
  if (
    value === "web" ||
    value === "mcp" ||
    value === "api" ||
    value === "autopost" ||
    value === "agent"
  ) {
    return value;
  }
  return "web";
}

function relationId(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "id" in value) {
    return asString((value as { id?: unknown }).id);
  }
  return "";
}

function asIso(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString();
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : trimmed;
  }
  return "";
}

function asJsonObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
    return {};
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function sanitizeChannel(raw: unknown): StoredPublishChannel | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = asString(row.id);
  const provider = asString(row.provider);
  const name = asString(row.name) || provider;
  if (!id || !provider) return null;
  const additional = asJsonObject(row.additionalSettings);
  const extraFromRow =
    row.extra && typeof row.extra === "object" && !Array.isArray(row.extra)
      ? (row.extra as StoredPublishChannel["extra"])
      : {};
  const pageAccessTokenEnc =
    asString(row.pageAccessTokenEnc) || asString(additional.pageAccessTokenEnc);
  const extra: StoredPublishChannel["extra"] = {
    ...extraFromRow,
    externalId:
      extraFromRow.externalId || asString(row.externalId) || asString(additional.externalId) || undefined,
    username: extraFromRow.username || asString(additional.username) || asString(row.profile) || undefined,
    pageId: extraFromRow.pageId || asString(additional.pageId) || undefined,
    instagramUserId: extraFromRow.instagramUserId || asString(additional.instagramUserId) || undefined,
    scopes: extraFromRow.scopes || (Array.isArray(additional.scopes) ? additional.scopes.filter((s): s is string => typeof s === "string") : undefined),
  };
  const postingRaw = row.postingTimes ?? additional.postingTimes;
  const postingTimes = Array.isArray(postingRaw)
    ? postingRaw
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const time = Number((item as { time?: unknown }).time);
          return Number.isFinite(time) ? { time } : null;
        })
        .filter((item): item is { time: number } => Boolean(item))
    : undefined;
  return {
    id,
    provider,
    name,
    picture: asString(row.picture) || undefined,
    disabled: asBool(row.disabled),
    refreshNeeded: asBool(row.refreshNeeded),
    groupId: asString(row.groupId) || relationId(row.group) || undefined,
    postingTimes,
    accessTokenEnc: asString(row.accessTokenEnc) || asString(row.token),
    refreshTokenEnc: asString(row.refreshTokenEnc) || asString(row.refreshToken),
    pageAccessTokenEnc,
    tokenExpiresAt: asIso(row.tokenExpiresAt) || asIso(row.tokenExpiration) || undefined,
    extra,
  };
}

export function sanitizePost(raw: unknown): PublishPost | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = asString(row.id);
  const channelId = asString(row.channelId) || relationId(row.channel);
  if (!id || !channelId) return null;
  const state = isPublishState(row.state) ? row.state : "draft";
  const settings = asJsonObject(row.settings);
  const image = asString(row.image);
  if (image) {
    const urls = Array.isArray(settings.mediaUrls) ? [...settings.mediaUrls] : [];
    if (!urls.includes(image)) urls.unshift(image);
    settings.mediaUrls = urls;
  }
  return {
    id,
    state,
    publishDate: asIso(row.publishDate) || new Date().toISOString(),
    channelId,
    content: asString(row.content) || asString(row.description),
    delay: asNumber(row.delay, 0),
    group: asString(row.group),
    title: asString(row.title) || undefined,
    settings,
    releaseId: asString(row.releaseId) || undefined,
    releaseURL: asString(row.releaseURL) || undefined,
    intervalInDays: Number.isFinite(Number(row.intervalInDays))
      ? Number(row.intervalInDays)
      : undefined,
    error: asString(row.error) || undefined,
    parentPostId: asString(row.parentPostId) || undefined,
    creationMethod: asCreationMethod(row.creationMethod),
  };
}

export function sanitizeError(raw: unknown): PublishErrorRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = asString(row.id);
  if (!id) return null;
  const body = asJsonObject(row.body);
  return {
    id,
    postId: asString(row.postId) || relationId(row.post) || asString(body.postId) || undefined,
    channelId: asString(row.channelId) || asString(body.channelId) || undefined,
    provider: asString(row.provider) || asString(row.platform) || asString(body.provider) || "unknown",
    code: asString(row.code) || asString(body.code) || "publish_failed",
    message: asString(row.message) || "فشل غير معروف",
    retryable: asBool(row.retryable) || asBool(body.retryable),
    createdAt: asIso(row.createdAt) || asIso(row.created) || new Date().toISOString(),
  };
}

async function readStore(): Promise<FilePayload> {
  if (memory) return memory;
  try {
    const raw = await fs.readFile(publishStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<FilePayload>;
    memory = {
      version: 1,
      channels: Array.isArray(parsed.channels)
        ? parsed.channels.map(sanitizeChannel).filter((row): row is StoredPublishChannel => Boolean(row))
        : [],
      posts: Array.isArray(parsed.posts)
        ? parsed.posts.map(sanitizePost).filter((row): row is PublishPost => Boolean(row))
        : [],
      errors: Array.isArray(parsed.errors)
        ? parsed.errors.map(sanitizeError).filter((row): row is PublishErrorRecord => Boolean(row))
        : [],
      updatedAt: asString(parsed.updatedAt) || new Date().toISOString(),
    };
    return memory;
  } catch {
    memory = empty();
    return memory;
  }
}

async function writeStore(next: FilePayload): Promise<void> {
  memory = { ...next, updatedAt: new Date().toISOString() };
  writeQueue = writeQueue.then(async () => {
    const file = publishStoreFile();
    await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
    const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(memory, null, 2), { mode: 0o600 });
    await fs.rename(tmp, file);
  });
  await writeQueue;
}

export async function fileListChannels(): Promise<StoredPublishChannel[]> {
  const store = await readStore();
  return store.channels;
}

export async function fileGetChannel(id: string): Promise<StoredPublishChannel | null> {
  const store = await readStore();
  return store.channels.find((row) => row.id === id) ?? null;
}

export async function fileSaveChannel(
  channel: StoredPublishChannel
): Promise<StoredPublishChannel> {
  const store = await readStore();
  const next = store.channels.filter((row) => row.id !== channel.id);
  next.push(channel);
  await writeStore({ ...store, channels: next });
  return channel;
}

export async function fileDeleteChannel(id: string): Promise<boolean> {
  const store = await readStore();
  const next = store.channels.filter((row) => row.id !== id);
  if (next.length === store.channels.length) return false;
  await writeStore({ ...store, channels: next });
  return true;
}

export async function fileListPosts(): Promise<PublishPost[]> {
  const store = await readStore();
  return store.posts;
}

export async function fileGetPost(id: string): Promise<PublishPost | null> {
  const store = await readStore();
  return store.posts.find((row) => row.id === id) ?? null;
}

export async function fileSavePost(post: PublishPost): Promise<PublishPost> {
  const store = await readStore();
  const next = store.posts.filter((row) => row.id !== post.id);
  next.push(post);
  await writeStore({ ...store, posts: next });
  return post;
}

export async function fileDeletePost(id: string): Promise<boolean> {
  const store = await readStore();
  const next = store.posts.filter((row) => row.id !== id);
  if (next.length === store.posts.length) return false;
  await writeStore({ ...store, posts: next });
  return true;
}

export async function fileListErrors(): Promise<PublishErrorRecord[]> {
  const store = await readStore();
  return store.errors;
}

export async function fileSaveError(
  record: PublishErrorRecord
): Promise<PublishErrorRecord> {
  const store = await readStore();
  const errors = [record, ...store.errors].slice(0, 500);
  await writeStore({ ...store, errors });
  return record;
}

export function resetPublishFileMemory(): void {
  memory = null;
}
