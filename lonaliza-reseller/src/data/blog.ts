import type { BlogPost } from "@/types/blog";

/** Legacy browser keys — not the source of truth. Used only for a one-time migrate banner. */
export const LEGACY_BLOG_STORAGE_KEY = "liotrip_blog_v2_migrated";
export const LEGACY_BLOG_LEGACY_STORAGE_KEY = "oktravel_blog_v2_migrated";
export const LEGACY_BLOG_MIGRATED_FLAG = "liotrip_blog_server_migrated";

const emptySeo = {
  metaTitleAr: "",
  metaTitleEn: "",
  metaDescriptionAr: "",
  metaDescriptionEn: "",
  focusKeyword: "",
  ogImage: "",
};

/** Seed lives on the server store. Client catalog is fetched from /api/blog. */
export const defaultPosts: BlogPost[] = [];

export function computeSeoScore(post: BlogPost): number {
  let score = 0;
  if (post.titleAr || post.titleEn) score += 15;
  if (post.excerptAr || post.excerptEn) score += 10;
  if (post.contentAr.length > 300 || post.contentEn.length > 300) score += 20;
  if (post.coverImage) score += 10;
  if (post.seo.focusKeyword) score += 15;
  if (post.seo.metaTitleAr || post.seo.metaTitleEn) score += 15;
  if (post.seo.metaDescriptionAr || post.seo.metaDescriptionEn) score += 15;
  return Math.min(100, score);
}

/** Sync stub for leftover catalog widgets. Live data: fetchPublishedPosts / admin API. */
export function getPosts(): BlogPost[] {
  return defaultPosts;
}

export function getPublishedPosts(): BlogPost[] {
  return [];
}

export function getPostById(_id: string): BlogPost | undefined {
  return undefined;
}

export function getPostBySlug(_slug: string): BlogPost | undefined {
  return undefined;
}

export function peekLegacyLocalPosts(): BlogPost[] {
  if (typeof window === "undefined") return [];
  if (localStorage.getItem(LEGACY_BLOG_MIGRATED_FLAG) === "1") return [];
  const stored =
    localStorage.getItem(LEGACY_BLOG_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_BLOG_LEGACY_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is BlogPost => Boolean(p && typeof p === "object" && p.id));
  } catch {
    return [];
  }
}

export function markLegacyBlogMigrated() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEGACY_BLOG_MIGRATED_FLAG, "1");
  localStorage.removeItem(LEGACY_BLOG_STORAGE_KEY);
  localStorage.removeItem(LEGACY_BLOG_LEGACY_STORAGE_KEY);
}

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch("/api/blog", { cache: "no-store" });
    const data = (await res.json()) as { ok?: boolean; posts?: BlogPost[] };
    if (!data.ok || !Array.isArray(data.posts)) return [];
    return data.posts.filter((p) => p.status === "published");
  } catch {
    return [];
  }
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { ok?: boolean; post?: BlogPost };
    if (data.ok && data.post?.status === "published") return data.post;
    return undefined;
  } catch {
    return undefined;
  }
}

export async function fetchAllPostsRemote(): Promise<BlogPost[]> {
  try {
    const res = await fetch("/api/admin/blog", { cache: "no-store" });
    const data = (await res.json()) as { ok?: boolean; posts?: BlogPost[] };
    if (!data.ok || !Array.isArray(data.posts)) return [];
    return data.posts;
  } catch {
    return [];
  }
}

export async function fetchPostByIdRemote(id: string): Promise<BlogPost | undefined> {
  try {
    const res = await fetch(`/api/admin/blog?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { ok?: boolean; post?: BlogPost };
    return data.ok && data.post ? data.post : undefined;
  } catch {
    return undefined;
  }
}

export async function upsertPostRemote(
  payload: Partial<BlogPost> & { id?: string }
): Promise<BlogPost | null> {
  try {
    const method = payload.id ? "PATCH" : "POST";
    const res = await fetch("/api/admin/blog", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { ok?: boolean; post?: BlogPost };
    return data.ok && data.post ? data.post : null;
  } catch {
    return null;
  }
}

export async function deletePostRemote(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/blog?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { ok?: boolean };
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

export async function createEmptyPostRemote(): Promise<BlogPost | null> {
  return upsertPostRemote({
    slug: `draft-${Date.now()}`,
    titleAr: "مسودة جديدة",
    titleEn: "New Draft",
    excerptAr: "",
    excerptEn: "",
    contentAr: "",
    contentEn: "",
    coverImage: "",
    coverAlt: "",
    category: "Travel Tips",
    tags: [],
    author: "Alrayyan Tourism",
    status: "draft",
    seo: { ...emptySeo },
  });
}

export async function importLegacyPostsRemote(posts: BlogPost[]): Promise<number> {
  try {
    const res = await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import", posts }),
    });
    const data = (await res.json()) as { ok?: boolean; imported?: number };
    return data.ok ? Number(data.imported || 0) : 0;
  } catch {
    return 0;
  }
}
