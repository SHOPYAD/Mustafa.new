import { promises as fs } from "fs";
import path from "path";
import type { PublishToConnectedAccountsResult } from "./types";
import type { GetPublishedPost, PublishedSocialPost, SocialPlatform } from "@/lib/ads/social-bridge";

type StoreFile = {
  version: 1;
  posts: PublishedSocialPost[];
  updatedAt: string;
};

function storePath(): string {
  return path.join(process.cwd(), ".data", "social", "published.json");
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = JSON.parse(await fs.readFile(storePath(), "utf8")) as StoreFile;
    return {
      version: 1,
      posts: Array.isArray(raw.posts) ? raw.posts : [],
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };
  } catch {
    return { version: 1, posts: [], updatedAt: new Date().toISOString() };
  }
}

async function writeStore(file: StoreFile): Promise<void> {
  await fs.mkdir(path.dirname(storePath()), { recursive: true, mode: 0o700 });
  await fs.writeFile(storePath(), JSON.stringify({ ...file, updatedAt: new Date().toISOString() }, null, 2), {
    mode: 0o600,
  });
}

export async function recordPublishedPosts(result: PublishToConnectedAccountsResult): Promise<void> {
  const file = await readStore();
  for (const row of result.results) {
    if (!row.ok) continue;
    if (row.platform !== "facebook" && row.platform !== "instagram") continue;
    const existing = file.posts.findIndex((item) => item.platform === row.platform && item.id === row.postId);
    const next: PublishedSocialPost = {
      id: row.postId,
      platform: row.platform,
      permalink: row.permalink,
    };
    if (existing >= 0) file.posts[existing] = next;
    else file.posts.unshift(next);
  }
  file.posts = file.posts.slice(0, 80);
  await writeStore(file);
}

export async function getPublishedPost(
  platform: SocialPlatform,
  id: string
): Promise<PublishedSocialPost | null> {
  const trimmed = String(id || "").trim();
  if (!trimmed) return null;
  const file = await readStore();
  return (
    file.posts.find((item) => item.platform === platform && (item.id === trimmed || item.permalink === trimmed)) ||
    null
  );
}

export const publishedPostResolver: GetPublishedPost = getPublishedPost;
