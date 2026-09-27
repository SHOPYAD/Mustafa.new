import { NOT_APPROVED_AR } from "./constants";
import type { PublishPost, PublishState } from "./types";

export const LEGAL_TRANSITIONS: Record<PublishState, readonly PublishState[]> = {
  draft: ["queue"],
  queue: ["draft", "published", "error"],
  error: ["draft", "queue"],
  published: [],
};

export class PublishStateError extends Error {
  readonly from: PublishState;
  readonly to: PublishState;

  constructor(from: PublishState, to: PublishState) {
    super(`لا يمكن تغيير حالة المنشور من ${from} إلى ${to}`);
    this.name = "PublishStateError";
    this.from = from;
    this.to = to;
  }
}

export function isPublishState(value: unknown): value is PublishState {
  return (
    value === "draft" ||
    value === "queue" ||
    value === "published" ||
    value === "error"
  );
}

export function canTransition(from: PublishState, to: PublishState): boolean {
  if (from === to) return true;
  return LEGAL_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: PublishState, to: PublishState): void {
  if (!canTransition(from, to)) {
    throw new PublishStateError(from, to);
  }
}

export function nowIso(date = new Date()): string {
  return date.toISOString();
}

export function isDue(post: PublishPost, now = new Date()): boolean {
  if (post.state !== "queue") return false;
  const at = Date.parse(post.publishDate);
  if (!Number.isFinite(at)) return true;
  return at <= now.getTime();
}

export function postApproved(post: PublishPost): boolean {
  return post.settings?.approved === true;
}

export function mediaUrlsOf(post: PublishPost): string[] {
  const raw = post.settings?.mediaUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

export function withApproved(post: PublishPost, approved: boolean): PublishPost {
  return {
    ...post,
    settings: { ...post.settings, approved },
  };
}

export function applyTransition(
  post: PublishPost,
  to: PublishState,
  patch: Partial<PublishPost> = {}
): PublishPost {
  assertTransition(post.state, to);
  const next: PublishPost = {
    ...post,
    ...patch,
    id: post.id,
    state: to,
  };
  if (to === "queue" && !patch.publishDate) {
    next.publishDate = post.publishDate || nowIso();
  }
  if (to !== "error") {
    next.error = patch.error;
  }
  return next;
}

/** draft|error → queue, publishDate = now. Worker picks it immediately. */
export function toPublishNow(post: PublishPost, at = new Date()): PublishPost {
  const from: PublishState = post.state === "error" ? "error" : post.state;
  if (from !== "draft" && from !== "error" && from !== "queue") {
    throw new PublishStateError(from, "queue");
  }
  return {
    ...post,
    state: "queue",
    publishDate: nowIso(at),
    error: undefined,
  };
}

export function toQueued(post: PublishPost, publishDate?: string): PublishPost {
  return applyTransition(post, "queue", {
    publishDate: publishDate || post.publishDate || nowIso(),
    error: undefined,
  });
}

export function toDraft(post: PublishPost): PublishPost {
  return applyTransition(post, "draft", { error: undefined });
}

export function toPublished(
  post: PublishPost,
  result: { releaseId?: string; releaseURL?: string }
): PublishPost {
  return applyTransition(post, "published", {
    releaseId: result.releaseId,
    releaseURL: result.releaseURL,
    error: undefined,
  });
}

export function toError(post: PublishPost, message: string): PublishPost {
  return applyTransition(post, "error", { error: message });
}

export function unapprovedSkipMessage(): string {
  return NOT_APPROVED_AR;
}
