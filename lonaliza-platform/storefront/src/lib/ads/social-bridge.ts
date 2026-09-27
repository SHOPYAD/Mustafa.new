/**
 * SOCIAL owns organic Instagram/Facebook publish + OAuth.
 * ADS only reads an already-published post id for boosting.
 *
 * If Agent SOCIAL exports `getPublishedPost(platform, id)` from
 * `@/lib/social/published` (or `@/lib/social`), we call it.
 * Otherwise the launch API accepts `postId` / `permalink` in the body.
 */

export type SocialPlatform = "facebook" | "instagram";

export type PublishedSocialPost = {
  id: string;
  platform: SocialPlatform;
  permalink?: string;
  pageId?: string;
  imageUrl?: string;
  message?: string;
};

export type GetPublishedPost = (
  platform: SocialPlatform,
  id: string
) => Promise<PublishedSocialPost | null> | PublishedSocialPost | null;

let registered: GetPublishedPost | null = null;

export function registerPublishedPostResolver(fn: GetPublishedPost): void {
  registered = fn;
}

async function trySocialModule(): Promise<GetPublishedPost | null> {
  if (registered) return registered;
  const candidates = ["@/lib/social/published", "@/lib/social"];
  for (const spec of candidates) {
    try {
      const importer = new Function("p", "return import(p)") as (
        p: string
      ) => Promise<{ getPublishedPost?: GetPublishedPost }>;
      const mod = await importer(spec);
      if (typeof mod.getPublishedPost === "function") return mod.getPublishedPost;
    } catch {
      /* SOCIAL module not present — expected until Agent SOCIAL ships */
    }
  }
  return null;
}

export async function resolvePublishedPost(
  platform: SocialPlatform,
  id: string
): Promise<PublishedSocialPost | null> {
  const trimmed = String(id || "").trim();
  if (!trimmed) return null;
  const fn = await trySocialModule();
  if (!fn) return null;
  try {
    return (await fn(platform, trimmed)) ?? null;
  } catch {
    return null;
  }
}

export function objectStoryId(pageId: string, postId: string): string {
  const page = String(pageId || "").trim();
  const post = String(postId || "").trim();
  if (post.includes("_")) return post;
  if (page && post) return `${page}_${post}`;
  return post;
}
