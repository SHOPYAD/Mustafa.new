import { createPostSchema, updatePostSchema } from "./schemas";
import {
  applyTransition,
  mediaUrlsOf,
  nowIso,
  toDraft,
  toPublishNow,
  toQueued,
  withApproved,
} from "./state";
import {
  deleteStoredPost,
  getPublishStoreStatus,
  getStoredPost,
  listStoredPosts,
  newPublishId,
  saveStoredPost,
} from "./store";
import type {
  PublishCreationMethod,
  PublishPost,
  PublishState,
  PublishStoreStatus,
} from "./types";

export type ListPostsInput = {
  from?: string;
  to?: string;
  state?: PublishState;
  channelId?: string;
};

export async function listPosts(opts: ListPostsInput = {}): Promise<{
  posts: PublishPost[];
  store: PublishStoreStatus;
}> {
  try {
    const [posts, store] = await Promise.all([
      listStoredPosts(opts),
      getPublishStoreStatus(),
    ]);
    const sorted = [...posts].sort(
      (a, b) => Date.parse(a.publishDate) - Date.parse(b.publishDate)
    );
    return { posts: sorted, store };
  } catch (err) {
    return {
      posts: [],
      store: {
        backend: "none",
        available: false,
        missingCollections: [],
        error: err instanceof Error ? err.message : "تعذّر قراءة المنشورات",
      },
    };
  }
}

export async function getPost(id: string): Promise<PublishPost | null> {
  return getStoredPost(id);
}

function mergeSettings(
  base: Record<string, unknown> | undefined,
  mediaUrls?: string[],
  approved?: boolean
): Record<string, unknown> {
  const settings = { ...(base || {}) };
  if (mediaUrls) settings.mediaUrls = mediaUrls;
  if (typeof approved === "boolean") settings.approved = approved;
  return settings;
}

export async function createPost(raw: unknown): Promise<PublishPost> {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const input = createPostSchema.parse({
    ...rec,
    channelId: rec.channelId || rec.channel,
    content: rec.content || rec.caption || rec.text,
  });
  const post: PublishPost = {
    id: newPublishId("t"),
    state: input.state === "queue" ? "queue" : "draft",
    publishDate: input.publishDate || nowIso(),
    channelId: input.channelId,
    content: input.content || "",
    delay: input.delay ?? 0,
    group: input.group || "",
    title: input.title,
    settings: mergeSettings(input.settings, input.mediaUrls, input.approved),
    intervalInDays: input.intervalInDays,
    parentPostId: input.parentPostId,
    creationMethod: (input.creationMethod || "web") as PublishCreationMethod,
  };
  return saveStoredPost(post, true);
}

export async function updatePost(id: string, raw: unknown): Promise<PublishPost | null> {
  const current = await getStoredPost(id);
  if (!current) return null;
  const input = updatePostSchema.parse(raw);
  let next: PublishPost = {
    ...current,
    channelId: input.channelId || current.channelId,
    content: input.content !== undefined ? input.content : current.content,
    delay: input.delay ?? current.delay,
    group: input.group !== undefined ? input.group : current.group,
    title: input.title !== undefined ? input.title : current.title,
    settings: mergeSettings(
      { ...current.settings, ...(input.settings || {}) },
      input.mediaUrls,
      input.approved
    ),
    intervalInDays:
      input.intervalInDays !== undefined ? input.intervalInDays : current.intervalInDays,
    parentPostId:
      input.parentPostId !== undefined ? input.parentPostId : current.parentPostId,
    creationMethod: (input.creationMethod || current.creationMethod) as PublishCreationMethod,
    publishDate: input.publishDate || current.publishDate,
    releaseId: input.releaseId ?? current.releaseId,
    releaseURL: input.releaseURL ?? current.releaseURL,
    error: input.error !== undefined ? input.error : current.error,
  };
  if (input.state && input.state !== current.state) {
    next = applyTransition(next, input.state as PublishState, next);
  }
  return saveStoredPost(next, false);
}

export async function deletePost(id: string): Promise<boolean> {
  return deleteStoredPost(id);
}

export async function changePostStatus(
  id: string,
  input: { state: "draft" | "queue"; publishDate?: string; approved?: boolean }
): Promise<PublishPost | null> {
  const current = await getStoredPost(id);
  if (!current) return null;
  let next =
    input.state === "queue"
      ? toQueued(current, input.publishDate)
      : toDraft(current);
  if (typeof input.approved === "boolean") {
    next = withApproved(next, input.approved);
  }
  return saveStoredPost(next, false);
}

export async function schedulePublishNow(
  id: string,
  approved: boolean
): Promise<PublishPost | null> {
  const current = await getStoredPost(id);
  if (!current) return null;
  const next = withApproved(toPublishNow(current), approved);
  return saveStoredPost(next, false);
}

export { mediaUrlsOf };
