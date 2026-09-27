/**
 * PocketBase access for the publish ENGINE.
 * Never throws to the admin: missing collections / PB down → null + status.
 */

import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import {
  isMissingCollectionError,
  PUBLISH_CHANNEL_COLLECTION,
  PUBLISH_COLLECTIONS,
  PUBLISH_ERROR_COLLECTION,
  PUBLISH_POST_COLLECTION,
} from "./pb-collections";
import { sanitizeChannel, sanitizeError, sanitizePost } from "./file-store";
import type {
  PublishErrorRecord,
  PublishPost,
  PublishStoreStatus,
  StoredPublishChannel,
} from "./types";

type PbClient = Awaited<ReturnType<typeof tryCreateAdminPocketBase>>;

let missingCache: Set<string> | null = null;
let missingCachedAt = 0;
const MISSING_TTL_MS = 30_000;

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

async function client(): Promise<PbClient> {
  return tryCreateAdminPocketBase();
}

async function markMissing(name: string): Promise<void> {
  if (!missingCache) missingCache = new Set();
  missingCache.add(name);
  missingCachedAt = Date.now();
}

function knownMissing(name: string): boolean {
  if (!missingCache) return false;
  if (Date.now() - missingCachedAt > MISSING_TTL_MS) {
    missingCache = null;
    return false;
  }
  return missingCache.has(name);
}

export async function probePublishCollections(): Promise<PublishStoreStatus> {
  const pb = await client();
  if (!pb) {
    return {
      backend: "file",
      available: true,
      missingCollections: [...Object.values({
        c: PUBLISH_CHANNEL_COLLECTION,
        p: PUBLISH_POST_COLLECTION,
        e: PUBLISH_ERROR_COLLECTION,
      })],
      error: "PocketBase غير متاح — التخزين المحلي",
    };
  }
  const missing: string[] = [];
  for (const name of [
    PUBLISH_CHANNEL_COLLECTION,
    PUBLISH_POST_COLLECTION,
    PUBLISH_ERROR_COLLECTION,
  ]) {
    try {
      await pb.collections.getOne(name);
    } catch (err) {
      if (isMissingCollectionError(err)) {
        missing.push(name);
        await markMissing(name);
      } else {
        return {
          backend: "file",
          available: true,
          missingCollections: missing,
          error: err instanceof Error ? err.message : "تعذّر فحص المجموعات",
        };
      }
    }
  }
  if (missing.length === 3) {
    return {
      backend: "file",
      available: true,
      missingCollections: missing,
      error: "مجموعات النشر غير موجودة في PocketBase",
    };
  }
  if (missing.length > 0) {
    return {
      backend: "pocketbase",
      available: true,
      missingCollections: missing,
      error: `مجموعات ناقصة: ${missing.join(", ")}`,
    };
  }
  return {
    backend: "pocketbase",
    available: true,
    missingCollections: [],
  };
}

async function pbCall<T>(
  collection: string,
  fn: (pb: NonNullable<PbClient>) => Promise<T>
): Promise<T | null> {
  if (knownMissing(collection)) return null;
  const pb = await client();
  if (!pb) return null;
  try {
    return await fn(pb);
  } catch (err) {
    if (isMissingCollectionError(err)) {
      await markMissing(collection);
      return null;
    }
    throw err;
  }
}

export async function pbListChannels(): Promise<StoredPublishChannel[] | null> {
  try {
    const rows = await pbCall(PUBLISH_CHANNEL_COLLECTION, (pb) =>
      pb.collection(PUBLISH_CHANNEL_COLLECTION).getFullList({ sort: "-created" })
    );
    if (!rows) return null;
    return rows
      .map((row) => sanitizeChannel({ ...asRecord(row), id: (row as { id?: string }).id }))
      .filter((row): row is StoredPublishChannel => Boolean(row));
  } catch {
    return null;
  }
}

export async function pbGetChannel(id: string): Promise<StoredPublishChannel | null | undefined> {
  try {
    const row = await pbCall(PUBLISH_CHANNEL_COLLECTION, (pb) =>
      pb.collection(PUBLISH_CHANNEL_COLLECTION).getOne(id)
    );
    if (!row) return undefined;
    return sanitizeChannel({ ...asRecord(row), id: (row as { id?: string }).id });
  } catch (err) {
    if (isMissingCollectionError(err)) return undefined;
    const status =
      err && typeof err === "object" && "status" in err
        ? Number((err as { status?: number }).status)
        : 0;
    if (status === 404) return null;
    return undefined;
  }
}

function compactRecord(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === "") continue;
    out[key] = value;
  }
  return out;
}

export async function pbSaveChannel(
  channel: StoredPublishChannel,
  isNew: boolean
): Promise<StoredPublishChannel | null> {
  const extra = channel.extra || {};
  const body = compactRecord({
    provider: channel.provider,
    name: channel.name,
    picture: channel.picture || "",
    disabled: channel.disabled,
    refreshNeeded: channel.refreshNeeded,
    group: channel.groupId || undefined,
    postingTimes: channel.postingTimes || [],
    token: channel.accessTokenEnc || "",
    refreshToken: channel.refreshTokenEnc || "",
    tokenExpiration: channel.tokenExpiresAt || undefined,
    additionalSettings: {
      ...extra,
      pageAccessTokenEnc: channel.pageAccessTokenEnc || undefined,
    },
    externalId: extra.externalId || undefined,
    internalId: extra.externalId || undefined,
    profile: extra.username || undefined,
    type: "social",
  });
  try {
    const row = await pbCall(PUBLISH_CHANNEL_COLLECTION, async (pb) => {
      const col = pb.collection(PUBLISH_CHANNEL_COLLECTION);
      if (isNew) {
        try {
          return await col.create({ id: channel.id, ...body });
        } catch {
          return col.create(body);
        }
      }
      return col.update(channel.id, body);
    });
    if (!row) return null;
    return sanitizeChannel({ ...asRecord(row), id: (row as { id?: string }).id });
  } catch {
    return null;
  }
}

export async function pbDeleteChannel(id: string): Promise<boolean | null> {
  try {
    const ok = await pbCall(PUBLISH_CHANNEL_COLLECTION, async (pb) => {
      await pb.collection(PUBLISH_CHANNEL_COLLECTION).delete(id);
      return true;
    });
    return ok;
  } catch {
    return false;
  }
}

export async function pbListPosts(filter?: string): Promise<PublishPost[] | null> {
  try {
    const rows = await pbCall(PUBLISH_POST_COLLECTION, (pb) =>
      pb.collection(PUBLISH_POST_COLLECTION).getFullList({
        sort: "publishDate",
        filter: filter || "",
      })
    );
    if (!rows) return null;
    return rows
      .map((row) => sanitizePost({ ...asRecord(row), id: (row as { id?: string }).id }))
      .filter((row): row is PublishPost => Boolean(row));
  } catch {
    return null;
  }
}

export async function pbGetPost(id: string): Promise<PublishPost | null | undefined> {
  try {
    const row = await pbCall(PUBLISH_POST_COLLECTION, (pb) =>
      pb.collection(PUBLISH_POST_COLLECTION).getOne(id)
    );
    if (!row) return undefined;
    return sanitizePost({ ...asRecord(row), id: (row as { id?: string }).id });
  } catch (err) {
    const status =
      err && typeof err === "object" && "status" in err
        ? Number((err as { status?: number }).status)
        : 0;
    if (status === 404) return null;
    return undefined;
  }
}

export async function pbSavePost(post: PublishPost, isNew: boolean): Promise<PublishPost | null> {
  const media = Array.isArray(post.settings?.mediaUrls)
    ? post.settings.mediaUrls.find((item): item is string => typeof item === "string" && Boolean(item))
    : "";
  const body = compactRecord({
    state: post.state,
    publishDate: post.publishDate,
    channel: post.channelId,
    content: post.content,
    delay: post.delay,
    group: post.group || undefined,
    title: post.title || undefined,
    settings: post.settings || {},
    releaseId: post.releaseId || undefined,
    releaseURL: post.releaseURL || undefined,
    intervalInDays: post.intervalInDays ?? 0,
    error: post.error || undefined,
    parentPostId: post.parentPostId || undefined,
    creationMethod: post.creationMethod === "agent" ? "agent" : post.creationMethod,
    image: media || undefined,
  });
  try {
    const row = await pbCall(PUBLISH_POST_COLLECTION, async (pb) => {
      const col = pb.collection(PUBLISH_POST_COLLECTION);
      if (isNew) {
        try {
          return await col.create({ id: post.id, ...body });
        } catch {
          return col.create(body);
        }
      }
      return col.update(post.id, body);
    });
    if (!row) return null;
    return sanitizePost({ ...asRecord(row), id: (row as { id?: string }).id });
  } catch {
    return null;
  }
}

export async function pbDeletePost(id: string): Promise<boolean | null> {
  try {
    const ok = await pbCall(PUBLISH_POST_COLLECTION, async (pb) => {
      await pb.collection(PUBLISH_POST_COLLECTION).delete(id);
      return true;
    });
    return ok;
  } catch {
    return false;
  }
}

export async function pbSaveError(record: PublishErrorRecord): Promise<PublishErrorRecord | null> {
  const body = compactRecord({
    message: record.message,
    platform: record.provider,
    post: record.postId || undefined,
    body: {
      code: record.code,
      channelId: record.channelId,
      retryable: record.retryable,
      provider: record.provider,
    },
  });
  try {
    const row = await pbCall(PUBLISH_ERROR_COLLECTION, async (pb) => {
      try {
        return await pb.collection(PUBLISH_ERROR_COLLECTION).create({ id: record.id, ...body });
      } catch {
        return pb.collection(PUBLISH_ERROR_COLLECTION).create(body);
      }
    });
    if (!row) return null;
    return sanitizeError({
      ...asRecord(row),
      id: (row as { id?: string }).id,
      createdAt: (row as { created?: string }).created,
    });
  } catch {
    return null;
  }
}

export async function pbListErrors(postId?: string): Promise<PublishErrorRecord[] | null> {
  try {
    const safeId = (postId || "").replace(/"/g, "");
    const filter = safeId ? `post = "${safeId}"` : "";
    const rows = await pbCall(PUBLISH_ERROR_COLLECTION, (pb) =>
      pb.collection(PUBLISH_ERROR_COLLECTION).getFullList({
        sort: "-created",
        filter,
      })
    );
    if (!rows) return null;
    return rows
      .map((row) =>
        sanitizeError({
          ...asRecord(row),
          id: (row as { id?: string }).id,
          createdAt: (row as { created?: string }).created,
        })
      )
      .filter((row): row is PublishErrorRecord => Boolean(row));
  } catch {
    return null;
  }
}

export type PublishMediaRow = {
  id: string;
  name: string;
  url?: string;
  path?: string;
  type?: string;
  createdAt?: string;
};

export async function pbListMedia(): Promise<PublishMediaRow[] | null> {
  try {
    const rows = await pbCall(PUBLISH_COLLECTIONS.media, (pb) =>
      pb.collection(PUBLISH_COLLECTIONS.media).getFullList({ sort: "-created" })
    );
    if (!rows) return null;
    return rows
      .map((row) => {
        const rec = asRecord(row);
        const id = String((row as { id?: string }).id || rec.id || "");
        const path = typeof rec.path === "string" ? rec.path : undefined;
        return {
          id,
          name: String(rec.name || rec.originalName || "وسيط"),
          path,
          url: path,
          type: typeof rec.type === "string" ? rec.type : undefined,
          createdAt: typeof rec.created === "string" ? rec.created : undefined,
        };
      })
      .filter((row) => row.id);
  } catch {
    return null;
  }
}
