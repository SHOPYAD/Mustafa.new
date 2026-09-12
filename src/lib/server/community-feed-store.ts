import { promises as fs } from "fs";
import path from "path";
import type { ParsedTravelPost } from "@/lib/nostr/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "community-posts.json");

let memoryPosts: ParsedTravelPost[] | null = null;
let writeQueue = Promise.resolve();

export async function listStoredCommunityPosts(): Promise<ParsedTravelPost[]> {
  if (memoryPosts) return memoryPosts;
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ParsedTravelPost[];
    memoryPosts = Array.isArray(parsed) ? parsed : [];
    return memoryPosts;
  } catch {
    memoryPosts = [];
    return memoryPosts;
  }
}

export async function saveCommunityPost(post: ParsedTravelPost): Promise<ParsedTravelPost> {
  const current = await listStoredCommunityPosts();
  // Filter out any duplicate by ID
  const filtered = current.filter((p) => p.id !== post.id);
  const updated = [post, ...filtered].slice(0, 500); // keep last 500 posts
  memoryPosts = updated;

  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(updated, null, 2), "utf-8");
  });

  await writeQueue;
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
