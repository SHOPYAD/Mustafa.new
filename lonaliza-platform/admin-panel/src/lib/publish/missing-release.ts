/**
 * Missing remote `releaseId` recovery (Postiz missing-content flow).
 * Live network listing of remote posts is not wired — bind ids manually.
 */

import { PROVIDER_LABEL_AR } from "./constants";
import { listChannels } from "./channels";
import { listPosts, updatePost } from "./posts";
import type { PublishPost, PublishState } from "./types";

export type MissingReleaseRow = {
  id: string;
  content: string;
  title?: string;
  channelId: string;
  channelName?: string;
  provider?: string;
  publishDate: string;
  state: PublishState;
  releaseId?: string;
  releaseURL?: string;
};

export const MISSING_RELEASE_CANDIDATES_AR =
  "لا جلب حي لمعرفات الشبكة بعد — أدخلوا معرف المنشور البعيد يدوياً لربط التحليلات.";

export function isMissingReleaseId(post: PublishPost): boolean {
  if (post.state !== "published" && post.state !== "error") return false;
  return !String(post.releaseId || "").trim();
}

export async function listMissingReleasePosts(postId?: string): Promise<{
  posts: MissingReleaseRow[];
  candidates: Array<{ releaseId: string; title?: string }>;
  messageAr: string;
}> {
  const [{ posts }, { channels }] = await Promise.all([listPosts(), listChannels()]);
  const channelMap = new Map(channels.map((row) => [row.id, row]));
  const filtered = posts.filter((post) => {
    if (postId && post.id !== postId) return false;
    return isMissingReleaseId(post);
  });
  return {
    posts: filtered.map((post) => {
      const channel = channelMap.get(post.channelId);
      return {
        id: post.id,
        content: post.content,
        title: post.title,
        channelId: post.channelId,
        channelName: channel?.name,
        provider: channel?.provider,
        publishDate: post.publishDate,
        state: post.state,
        releaseId: post.releaseId,
        releaseURL: post.releaseURL,
      };
    }),
    candidates: [],
    messageAr: MISSING_RELEASE_CANDIDATES_AR,
  };
}

export async function patchReleaseId(
  id: string,
  releaseId: string,
  releaseURL?: string
): Promise<PublishPost | null> {
  const trimmed = String(releaseId || "").trim();
  if (!id || !trimmed) {
    throw new Error("معرّف المنشور و releaseId مطلوبان");
  }
  return updatePost(id, {
    releaseId: trimmed,
    releaseURL: releaseURL?.trim() || undefined,
  });
}

export function missingReleaseLabel(provider?: string): string {
  if (!provider) return "بلا معرف نشر";
  return `بلا معرف نشر (${PROVIDER_LABEL_AR[provider] || provider})`;
}
