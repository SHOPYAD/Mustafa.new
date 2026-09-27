import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import type { ParsedTravelPost } from "@/lib/nostr/types";
import { isMockReelSource } from "@/lib/community/reel-media";
import {
  canonicalMediaKey,
  hasRejectSignal,
  isTravelEligibleContent,
  matchIdempotentPost,
} from "@/lib/community/travel-content-filter";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "community-posts.json");

let memoryPosts: ParsedTravelPost[] | null = null;
let writeQueue = Promise.resolve();
let purgedOnce = false;

async function persistPosts(updated: ParsedTravelPost[]): Promise<void> {
  memoryPosts = updated;
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(updated, null, 2), "utf-8");
  });
  await writeQueue;
}

export function computeMediaHash(urls: string[]): string {
  const keys = urls.map((u) => canonicalMediaKey(u)).filter(Boolean).sort();
  if (!keys.length) return "";
  return createHash("sha256").update(keys.join("|")).digest("hex");
}

export function shouldPurgeStoredPost(post: ParsedTravelPost): boolean {
  const videoUrl = post.videos?.[0] || post.videoUrl;
  const isVideo = Boolean(post.isReel || post.isVideo || post.kind === "reel" || videoUrl);
  if (isVideo && isMockReelSource({ id: post.id, pubkey: post.pubkey, videoUrl })) return true;
  const input = {
    content: post.content,
    title: post.content,
    tags: post.tags,
    category: post.category,
    destination: post.destination,
    pubkey: post.pubkey,
    source: "local" as const,
  };
  if (hasRejectSignal(input)) return true;
  return isVideo && !isTravelEligibleContent(input);
}

export function applyTravelReelPurge(posts: ParsedTravelPost[]): {
  posts: ParsedTravelPost[];
  removedIds: string[];
} {
  const removedIds: string[] = [];
  const kept: ParsedTravelPost[] = [];
  for (const post of posts) {
    if (shouldPurgeStoredPost(post)) {
      removedIds.push(post.id);
    } else {
      kept.push(post);
    }
  }
  return { posts: kept, removedIds };
}

export async function listStoredCommunityPosts(): Promise<ParsedTravelPost[]> {
  if (!memoryPosts) {
    try {
      const raw = await fs.readFile(STORE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as ParsedTravelPost[];
      memoryPosts = Array.isArray(parsed) ? parsed : [];
    } catch {
      memoryPosts = [];
    }
  }

  if (!purgedOnce && memoryPosts.length) {
    const { posts, removedIds } = applyTravelReelPurge(memoryPosts);
    purgedOnce = true;
    if (removedIds.length) {
      await persistPosts(posts);
    } else {
      memoryPosts = posts;
    }
  }

  return memoryPosts || [];
}

export async function purgeNonTravelCommunityPosts(): Promise<{
  removed: number;
  kept: number;
  removedIds: string[];
}> {
  const current = await listStoredCommunityPosts();
  const { posts, removedIds } = applyTravelReelPurge(current);
  purgedOnce = true;
  if (removedIds.length) {
    await persistPosts(posts);
  }
  return { removed: removedIds.length, kept: posts.length, removedIds };
}

export async function findIdempotentCommunityPost(opts: {
  uploadUuid?: string;
  mediaHash?: string;
}): Promise<ParsedTravelPost | undefined> {
  const current = await listStoredCommunityPosts();
  return matchIdempotentPost(current, opts);
}

export async function saveCommunityPost(post: ParsedTravelPost): Promise<ParsedTravelPost> {
  const current = await listStoredCommunityPosts();
  const filtered = current.filter((p) => p.id !== post.id);
  const updated = [post, ...filtered].slice(0, 500);
  await persistPosts(updated);
  return post;
}

async function checkAndAwardEngagementPoints(post: ParsedTravelPost): Promise<boolean> {
  if (post.pointsAwarded) return false;
  const eligible = post.eligiblePoints || 0;
  if (eligible <= 0) return false;

  try {
    const { getNostrSocialSettings } = await import("@/lib/server/nostr-social-store");
    const settings = await getNostrSocialSettings();
    const cfg = settings.pointsConfig;

    if (!cfg.requireEngagementForPoints) {
      const { creditCommunityPoints } = await import("@/lib/loyalty/server");
      await creditCommunityPoints(
        post.authorUserId || post.pubkey || "current_user",
        eligible,
        post.isVideo || post.isReel ? "reel" : post.images?.length ? "photo" : "post",
        `مكافأة نشر تجربة سياحية في ${post.destination || "المجتمع"}`,
        post.id
      );
      post.pointsAwarded = true;
      return true;
    }

    const minLikes = cfg.minLikesForPoints ?? 50;
    const minComments = cfg.minCommentsForPoints ?? 10;

    const currentLikes = post.likesCount || 0;
    const currentComments = post.commentsCount || (post.comments?.length || 0);

    if (currentLikes >= minLikes && currentComments >= minComments) {
      const { creditCommunityPoints } = await import("@/lib/loyalty/server");
      await creditCommunityPoints(
        post.authorUserId || post.pubkey || "current_user",
        eligible,
        post.isVideo || post.isReel ? "reel" : post.images?.length ? "photo" : "post",
        `مكافأة تفاعل الجمهور: وصول المنشور إلى ${currentLikes} إعجاب و ${currentComments} تعليق`,
        post.id
      );
      post.pointsAwarded = true;
      return true;
    }
  } catch (err) {
    console.error("Failed to award engagement points:", err);
  }
  return false;
}

export async function togglePostLike(postId: string): Promise<{ likesCount: number; hasLiked: boolean }> {
  const current = await listStoredCommunityPosts();
  const target = current.find((p) => p.id === postId);
  if (!target) {
    return { likesCount: 1, hasLiked: true };
  }

  target.likesCount = (target.likesCount || 0) + 1;
  target.userHasLiked = true;

  await checkAndAwardEngagementPoints(target);

  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(current, null, 2), "utf-8");
  });

  await writeQueue;
  return { likesCount: target.likesCount, hasLiked: true };
}

export async function incrementPostViewCount(postId: string, viewsCount: number): Promise<number> {
  const current = await listStoredCommunityPosts();
  const target = current.find((p) => p.id === postId);
  if (!target) return viewsCount;
  target.viewsCount = Math.max(target.viewsCount || 0, viewsCount);
  await persistPosts(current);
  return target.viewsCount;
}

export async function incrementPostView(postId: string): Promise<number> {
  const current = await listStoredCommunityPosts();
  const target = current.find((p) => p.id === postId);
  if (!target) return 0;
  target.viewsCount = (target.viewsCount || 0) + 1;
  await persistPosts(current);
  return target.viewsCount;
}

export async function listPostComments(postId: string): Promise<import("@/lib/nostr/types").CommunityComment[]> {
  const current = await listStoredCommunityPosts();
  const target = current.find((p) => p.id === postId);
  return target?.comments || [];
}

export async function addPostComment(
  postId: string,
  commentText: string,
  authorName?: string,
  authorAvatar?: string,
  authorTier?: string,
  parentId?: string,
  replyToName?: string
): Promise<{ ok: boolean; comment: import("@/lib/nostr/types").CommunityComment; commentsCount: number }> {
  const current = await listStoredCommunityPosts();
  const target = current.find((p) => p.id === postId);

  const newComment: import("@/lib/nostr/types").CommunityComment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    postId,
    authorName: authorName || "مسافر لوناليزا VIP",
    authorAvatar:
      authorAvatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${authorName || "Traveler"}_${Date.now()}`,
    authorTier: authorTier || "Silver Explorer",
    text: commentText.trim(),
    createdAt: Math.floor(Date.now() / 1000),
    likesCount: 0,
    userHasLiked: false,
    parentId,
    replyToName,
  };

  if (target) {
    if (!Array.isArray(target.comments)) {
      target.comments = [];
    }
    target.comments.push(newComment);
    target.commentsCount = target.comments.length;

    await checkAndAwardEngagementPoints(target);

    writeQueue = writeQueue.then(async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(STORE_FILE, JSON.stringify(current, null, 2), "utf-8");
    });

    await writeQueue;
    return { ok: true, comment: newComment, commentsCount: target.commentsCount };
  }

  return { ok: true, comment: newComment, commentsCount: 1 };
}

export async function toggleCommentLike(
  postId: string,
  commentId: string
): Promise<{ ok: boolean; likesCount: number; hasLiked: boolean }> {
  const current = await listStoredCommunityPosts();
  const target = current.find((p) => p.id === postId);
  if (!target || !Array.isArray(target.comments)) {
    return { ok: false, likesCount: 0, hasLiked: false };
  }

  const comment = target.comments.find((c) => c.id === commentId);
  if (!comment) {
    return { ok: false, likesCount: 0, hasLiked: false };
  }

  if (comment.userHasLiked) {
    comment.likesCount = Math.max(0, (comment.likesCount || 0) - 1);
    comment.userHasLiked = false;
  } else {
    comment.likesCount = (comment.likesCount || 0) + 1;
    comment.userHasLiked = true;
  }

  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(current, null, 2), "utf-8");
  });

  await writeQueue;
  return { ok: true, likesCount: comment.likesCount, hasLiked: comment.userHasLiked };
}
