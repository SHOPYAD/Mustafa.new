import { encryptSecret } from "./crypto";
import {
  fileDeleteChannel,
  fileDeletePost,
  fileGetChannel,
  fileGetPost,
  fileListChannels,
  fileListErrors,
  fileListPosts,
  fileSaveChannel,
  fileSaveError,
  fileSavePost,
  newPublishId,
} from "./file-store";
import {
  pbDeleteChannel,
  pbDeletePost,
  pbGetChannel,
  pbGetPost,
  pbListChannels,
  pbListErrors,
  pbListPosts,
  pbSaveChannel,
  pbSaveError,
  pbSavePost,
  probePublishCollections,
} from "./pb";
import type {
  PublishChannel,
  PublishErrorRecord,
  PublishPost,
  PublishStoreStatus,
  StoredPublishChannel,
} from "./types";

let cachedStatus: PublishStoreStatus | null = null;
let cachedStatusAt = 0;

function forceFileStore(): boolean {
  return (process.env.PUBLISH_FORCE_FILE || "").trim() === "1";
}

export async function getPublishStoreStatus(): Promise<PublishStoreStatus> {
  if (forceFileStore()) {
    return { backend: "file", available: true, missingCollections: [] };
  }
  if (cachedStatus && Date.now() - cachedStatusAt < 15_000) return cachedStatus;
  try {
    cachedStatus = await probePublishCollections();
  } catch (err) {
    cachedStatus = {
      backend: "file",
      available: true,
      missingCollections: [],
      error: err instanceof Error ? err.message : "تعذّر الوصول للتخزين",
    };
  }
  cachedStatusAt = Date.now();
  return cachedStatus;
}

export function toPublicChannel(channel: StoredPublishChannel): PublishChannel {
  return {
    id: channel.id,
    provider: channel.provider,
    name: channel.name,
    picture: channel.picture,
    disabled: channel.disabled,
    refreshNeeded: channel.refreshNeeded,
    groupId: channel.groupId,
    postingTimes: channel.postingTimes,
  };
}

export async function listStoredChannels(): Promise<StoredPublishChannel[]> {
  if (!forceFileStore()) {
    try {
      const fromPb = await pbListChannels();
      if (fromPb) return fromPb;
    } catch {
      /* file fallback */
    }
  }
  try {
    return await fileListChannels();
  } catch {
    return [];
  }
}

export async function listPublicChannels(): Promise<PublishChannel[]> {
  const rows = await listStoredChannels();
  return rows.map(toPublicChannel);
}

export async function getStoredChannel(
  id: string
): Promise<StoredPublishChannel | null> {
  if (!forceFileStore()) {
    try {
      const fromPb = await pbGetChannel(id);
      if (fromPb) return fromPb;
    } catch {
      /* file fallback */
    }
  }
  try {
    return await fileGetChannel(id);
  } catch {
    return null;
  }
}

export async function saveStoredChannel(
  channel: StoredPublishChannel,
  isNew: boolean
): Promise<StoredPublishChannel> {
  if (!forceFileStore()) {
    try {
      const fromPb = await pbSaveChannel(channel, isNew);
      if (fromPb) {
        try {
          await fileSaveChannel(fromPb);
        } catch {
          /* mirror is optional */
        }
        return fromPb;
      }
    } catch {
      /* file fallback */
    }
  }
  return fileSaveChannel(channel);
}

export async function deleteStoredChannel(id: string): Promise<boolean> {
  let ok = false;
  if (!forceFileStore()) {
    try {
      if (await pbDeleteChannel(id)) ok = true;
    } catch {
      /* continue */
    }
  }
  try {
    if (await fileDeleteChannel(id)) ok = true;
  } catch {
    /* ignore */
  }
  return ok;
}

export async function listStoredPosts(opts?: {
  from?: string;
  to?: string;
  state?: PublishPost["state"];
  channelId?: string;
}): Promise<PublishPost[]> {
  let rows: PublishPost[] = [];
  if (!forceFileStore()) {
    try {
      const fromPb = await pbListPosts();
      if (fromPb) rows = fromPb;
    } catch {
      /* file */
    }
  }
  if (rows.length === 0) {
    try {
      rows = await fileListPosts();
    } catch {
      rows = [];
    }
  }
  return rows.filter((post) => {
    if (opts?.state && post.state !== opts.state) return false;
    if (opts?.channelId && post.channelId !== opts.channelId) return false;
    const at = Date.parse(post.publishDate);
    if (opts?.from) {
      const from = Date.parse(opts.from);
      if (Number.isFinite(from) && Number.isFinite(at) && at < from) return false;
    }
    if (opts?.to) {
      const to = Date.parse(opts.to);
      if (Number.isFinite(to) && Number.isFinite(at) && at > to) return false;
    }
    return true;
  });
}

export async function getStoredPost(id: string): Promise<PublishPost | null> {
  if (!forceFileStore()) {
    try {
      const fromPb = await pbGetPost(id);
      if (fromPb) return fromPb;
    } catch {
      /* file */
    }
  }
  try {
    return await fileGetPost(id);
  } catch {
    return null;
  }
}

export async function saveStoredPost(
  post: PublishPost,
  isNew: boolean
): Promise<PublishPost> {
  if (!forceFileStore()) {
    try {
      const fromPb = await pbSavePost(post, isNew);
      if (fromPb) {
        try {
          await fileSavePost(fromPb);
        } catch {
          /* optional mirror */
        }
        return fromPb;
      }
    } catch {
      /* file */
    }
  }
  return fileSavePost(post);
}

export async function deleteStoredPost(id: string): Promise<boolean> {
  let ok = false;
  if (!forceFileStore()) {
    try {
      if (await pbDeletePost(id)) ok = true;
    } catch {
      /* continue */
    }
  }
  try {
    if (await fileDeletePost(id)) ok = true;
  } catch {
    /* ignore */
  }
  return ok;
}

export async function listDueQueuePosts(now = new Date()): Promise<PublishPost[]> {
  const rows = await listStoredPosts({ state: "queue" });
  const ts = now.getTime();
  return rows.filter((post) => {
    const at = Date.parse(post.publishDate);
    if (!Number.isFinite(at)) return true;
    return at <= ts;
  });
}

export async function recordPublishError(input: {
  postId?: string;
  channelId?: string;
  provider: string;
  code: string;
  message: string;
  retryable?: boolean;
}): Promise<PublishErrorRecord> {
  const record: PublishErrorRecord = {
    id: newPublishId("e"),
    postId: input.postId,
    channelId: input.channelId,
    provider: input.provider,
    code: input.code,
    message: input.message,
    retryable: Boolean(input.retryable),
    createdAt: new Date().toISOString(),
  };
  if (!forceFileStore()) {
    try {
      const fromPb = await pbSaveError(record);
      if (fromPb) {
        try {
          await fileSaveError(fromPb);
        } catch {
          /* optional */
        }
        return fromPb;
      }
    } catch {
      /* file */
    }
  }
  try {
    return await fileSaveError(record);
  } catch {
    return record;
  }
}

export async function listPublishErrors(postId?: string): Promise<PublishErrorRecord[]> {
  if (!forceFileStore()) {
    try {
      const fromPb = await pbListErrors(postId);
      if (fromPb) return fromPb;
    } catch {
      /* file */
    }
  }
  try {
    const rows = await fileListErrors();
    return postId ? rows.filter((row) => row.postId === postId) : rows;
  } catch {
    return [];
  }
}

export async function encryptChannelSecrets(input: {
  accessToken?: string;
  refreshToken?: string;
  pageAccessToken?: string;
}): Promise<{
  accessTokenEnc: string;
  refreshTokenEnc: string;
  pageAccessTokenEnc: string;
}> {
  return {
    accessTokenEnc: await encryptSecret(input.accessToken || ""),
    refreshTokenEnc: await encryptSecret(input.refreshToken || ""),
    pageAccessTokenEnc: await encryptSecret(input.pageAccessToken || ""),
  };
}

export { newPublishId };
export type { PublishStoreStatus };
