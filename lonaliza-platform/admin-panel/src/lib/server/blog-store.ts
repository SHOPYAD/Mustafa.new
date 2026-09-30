/**
 * Production blog store. Source of truth: `.data/blog-posts.json`.
 * Seeded once from `src/data/migrated/blog-posts.json`. Atomic writes, unique slugs.
 */

import { promises as fs } from "fs";
import path from "path";
import migratedPosts from "@/data/migrated/blog-posts.json";
import { slugify } from "@/lib/utils";
import type { BlogPost, BlogSeo, BlogStatus } from "@/types/blog";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "blog-posts.json");
const SEED_LABEL = "src/data/migrated/blog-posts.json";

type StoreFile = {
  version: 1;
  seeded: boolean;
  seededFrom?: string;
  seededAt?: string;
  posts: BlogPost[];
  bySlug: Record<string, string>;
  updatedAt?: string;
};

import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "lonaliza-blog-posts.json");
  }
  return STORE_FILE;
}

function emptySeo(): BlogSeo {
  return {
    metaTitleAr: "",
    metaTitleEn: "",
    metaDescriptionAr: "",
    metaDescriptionEn: "",
    focusKeyword: "",
    ogImage: "",
  };
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v != null ? String(v) : fallback;
}

function asStatus(value: unknown, fallback: BlogStatus): BlogStatus {
  return value === "published" || value === "draft" ? value : fallback;
}

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const aTime = new Date(a.publishedAt || a.updatedAt || a.createdAt).getTime();
    const bTime = new Date(b.publishedAt || b.updatedAt || b.createdAt).getTime();
    return bTime - aTime;
  });
}

function rebuildIndex(posts: BlogPost[]): Record<string, string> {
  const bySlug: Record<string, string> = {};
  for (const post of posts) {
    if (!post?.slug || !post.id) continue;
    bySlug[post.slug] = post.id;
  }
  return bySlug;
}

function uniqueSlug(
  desired: string,
  posts: BlogPost[],
  excludeId?: string
): string {
  const base = slugify(desired) || `article-${Date.now().toString(36)}`;
  const taken = new Set(
    posts.filter((p) => p.id !== excludeId && p.slug).map((p) => p.slug)
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function newId(): string {
  return `blog_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function titleKey(post: { titleAr?: string; titleEn?: string }): string {
  return `${post.titleAr || ""} ${post.titleEn || ""}`.toLowerCase().replace(/\s+/g, " ").trim();
}

function sameUtcDay(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.slice(0, 10) === b.slice(0, 10);
}

async function holdSameDayDuplicate(post: BlogPost, siblings: BlogPost[]): Promise<BlogPost> {
  if (post.status !== "published") return post;
  const key = titleKey(post);
  if (key.length < 12) return post;
  const duplicate = siblings.find(
    (other) => other.status === "published" && titleKey(other) === key && sameUtcDay(other.createdAt, post.createdAt)
  );
  if (!duplicate) return post;
  const line = `${new Date().toISOString()}\tdraft\t${post.id}\t${post.slug}\tduplicate_of\t${duplicate.id}\t${duplicate.slug}\n`;
  await fs.appendFile(path.join(DATA_DIR, "blog-dedup.log"), line).catch(() => undefined);
  return { ...post, status: "draft" };
}

export function sanitizeBlogPost(
  raw: Partial<BlogPost> & Record<string, unknown>,
  existing: BlogPost | undefined,
  siblings: BlogPost[]
): BlogPost {
  const now = new Date().toISOString();
  const titleAr = asString(
    raw.titleAr ?? existing?.titleAr ?? raw.titleEn,
    "مقال"
  );
  const titleEn = asString(raw.titleEn ?? existing?.titleEn, titleAr);
  const requestedSlug = asString(raw.slug ?? existing?.slug);
  const slug = uniqueSlug(
    requestedSlug || slugify(titleEn || titleAr) || `article-${Date.now()}`,
    siblings,
    existing?.id || asString(raw.id) || undefined
  );
  const seoIn = (raw.seo || existing?.seo || emptySeo()) as Partial<BlogSeo>;
  const status = asStatus(raw.status, existing?.status || "draft");
  const publishedAt =
    status === "published"
      ? asString(raw.publishedAt || existing?.publishedAt, now)
      : raw.publishedAt != null
        ? asString(raw.publishedAt) || undefined
        : existing?.publishedAt;

  return {
    id: asString(raw.id || existing?.id) || newId(),
    slug,
    titleAr,
    titleEn,
    excerptAr: asString(raw.excerptAr ?? existing?.excerptAr),
    excerptEn: asString(raw.excerptEn ?? existing?.excerptEn),
    contentAr: asString(raw.contentAr ?? existing?.contentAr),
    contentEn: asString(raw.contentEn ?? existing?.contentEn),
    coverImage: asString(raw.coverImage ?? existing?.coverImage),
    coverAlt: asString(raw.coverAlt ?? existing?.coverAlt, titleAr),
    category: asString(raw.category ?? existing?.category, "Travel Tips"),
    tags: Array.isArray(raw.tags)
      ? raw.tags.map(String).filter(Boolean)
      : existing?.tags || [],
    author: asString(raw.author ?? existing?.author, "Lonaliza"),
    status,
    seo: {
      ...emptySeo(),
      ...seoIn,
    },
    publishedAt,
    createdAt: asString(raw.createdAt || existing?.createdAt, now),
    updatedAt: now,
  };
}

async function syncPostToPocketBase(post: BlogPost): Promise<void> {
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return;
    const existing = await pb.collection("articles").getFirstListItem(`slug = "${post.slug}"`).catch(() => null);
    const data = {
      titleAr: post.titleAr || "",
      titleEn: post.titleEn || "",
      slug: post.slug || "",
      excerptAr: post.excerptAr || "",
      excerptEn: post.excerptEn || "",
      contentAr: post.contentAr || "",
      contentEn: post.contentEn || "",
      coverImage: post.coverImage || "",
      category: post.category || "Travel Tips",
      author: post.author || "Lonaliza",
      status: post.status || "published",
      publishedAt: post.publishedAt || new Date().toISOString(),
      tags: post.tags || [],
      seo: post.seo || {},
    };
    if (existing) {
      await pb.collection("articles").update(existing.id, data);
    } else {
      await pb.collection("articles").create(data);
    }
  } catch {
    // Non-blocking sync
  }
}

async function deletePostFromPocketBase(slugOrId: string): Promise<void> {
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return;
    const existing = await pb
      .collection("articles")
      .getFirstListItem(`slug = "${slugOrId}" || id = "${slugOrId}"`)
      .catch(() => null);
    if (existing) {
      await pb.collection("articles").delete(existing.id);
    }
  } catch {
    // Non-blocking sync
  }
}

function seedPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  const rows = Array.isArray(migratedPosts) ? migratedPosts : [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    posts.push(
      sanitizeBlogPost(row as Partial<BlogPost> & Record<string, unknown>, undefined, posts)
    );
  }
  return posts;
}

function emptyStore(): StoreFile {
  return {
    version: 1,
    seeded: false,
    posts: [],
    bySlug: {},
  };
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

async function writeStoreAtomic(store: StoreFile): Promise<StoreFile> {
  await ensureDir();
  const file = getStoreFile();
  const next: StoreFile = {
    version: 1,
    seeded: true,
    seededFrom: store.seededFrom,
    seededAt: store.seededAt,
    posts: store.posts,
    bySlug: rebuildIndex(store.posts),
    updatedAt: new Date().toISOString(),
  };
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  const json = JSON.stringify(next, null, 2);
  await fs.writeFile(tmp, json, "utf8");
  try {
    await fs.rename(tmp, file);
  } catch (err) {
    await fs.unlink(tmp).catch(() => undefined);
    throw err;
  }
  return next;
}

async function seedStore(): Promise<StoreFile> {
  const posts = seedPosts();
  const now = new Date().toISOString();
  return writeStoreAtomic({
    version: 1,
    seeded: true,
    seededFrom: SEED_LABEL,
    seededAt: now,
    posts,
    bySlug: rebuildIndex(posts),
    updatedAt: now,
  });
}

async function readStoreFile(): Promise<StoreFile | null> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreFile>;
    if (!Array.isArray(parsed.posts)) return emptyStore();
    const posts = parsed.posts.filter((p): p is BlogPost => Boolean(p?.id && p.slug));
    return {
      version: 1,
      seeded: parsed.seeded !== false,
      seededFrom: parsed.seededFrom,
      seededAt: parsed.seededAt,
      posts,
      bySlug: parsed.bySlug && typeof parsed.bySlug === "object"
        ? parsed.bySlug
        : rebuildIndex(posts),
      updatedAt: parsed.updatedAt,
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw err;
  }
}

let writeChain: Promise<unknown> = Promise.resolve();

function withStoreLock<T>(fn: (store: StoreFile) => Promise<T> | T): Promise<T> {
  const run = writeChain.then(async () => {
    const existing = await readStoreFile();
    const store = existing ?? (await seedStore());
    return fn(store);
  });
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function loadStore(): Promise<StoreFile> {
  const existing = await readStoreFile();
  if (existing) return existing;
  return seedStore();
}

export async function listBlogPosts(): Promise<BlogPost[]> {
  const store = await loadStore();
  return sortPosts(store.posts);
}

/** @deprecated alias — store is the single catalog, not an extras merge */
export async function listMergedBlogPosts(): Promise<BlogPost[]> {
  return listBlogPosts();
}

export async function listPublishedBlogPosts(): Promise<BlogPost[]> {
  return (await listBlogPosts()).filter((p) => p.status === "published");
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  if (!id) return null;
  const store = await loadStore();
  return store.posts.find((p) => p.id === id) || null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    /* ignore decode error */
  }

  const store = await loadStore();
  const id = store.bySlug[slug] || store.bySlug[decoded];
  if (id) {
    const byId = store.posts.find((p) => p.id === id);
    if (byId) return byId;
  }
  return (
    store.posts.find((p) => p.slug === slug || p.slug === decoded) || null
  );
}

export async function upsertBlogPost(
  incoming: Partial<BlogPost> & Record<string, unknown>
): Promise<BlogPost> {
  return withStoreLock(async (store) => {
    const idx = store.posts.findIndex(
      (p) =>
        (incoming.id && p.id === incoming.id) ||
        (incoming.slug && p.slug === incoming.slug)
    );
    const existing = idx >= 0 ? store.posts[idx] : undefined;
    const siblings = idx >= 0
      ? store.posts.filter((_, i) => i !== idx)
      : store.posts;
    const post = await holdSameDayDuplicate(sanitizeBlogPost(incoming, existing, siblings), siblings);
    if (idx >= 0) store.posts[idx] = post;
    else store.posts.unshift(post);
    await writeStoreAtomic(store);
    void syncPostToPocketBase(post);
    return post;
  });
}

export async function createBlogPost(
  incoming: Partial<BlogPost> & Record<string, unknown> = {}
): Promise<BlogPost> {
  return upsertBlogPost({
    ...incoming,
    id: asString(incoming.id) || newId(),
  });
}

export async function updateBlogPost(
  id: string,
  incoming: Partial<BlogPost> & Record<string, unknown>
): Promise<BlogPost | null> {
  return withStoreLock(async (store) => {
    const idx = store.posts.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    const existing = store.posts[idx];
    const siblings = store.posts.filter((_, i) => i !== idx);
    const post = await holdSameDayDuplicate(sanitizeBlogPost({ ...incoming, id }, existing, siblings), siblings);
    store.posts[idx] = post;
    await writeStoreAtomic(store);
    void syncPostToPocketBase(post);
    return post;
  });
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  if (!id) return false;
  return withStoreLock(async (store) => {
    const next = store.posts.filter((p) => p.id !== id && p.slug !== id);
    if (next.length === store.posts.length) return false;
    store.posts = next;
    await writeStoreAtomic(store);
    void deletePostFromPocketBase(id);
    return true;
  });
}

export async function importBlogPosts(
  incoming: Array<Partial<BlogPost> & Record<string, unknown>>
): Promise<{ imported: number; posts: BlogPost[] }> {
  return withStoreLock(async (store) => {
    let imported = 0;
    for (const row of incoming) {
      if (!row || typeof row !== "object") continue;
      const idx = store.posts.findIndex(
        (p) =>
          (row.id && p.id === String(row.id)) ||
          (row.slug && p.slug === String(row.slug))
      );
      const existing = idx >= 0 ? store.posts[idx] : undefined;
      const siblings = idx >= 0
        ? store.posts.filter((_, i) => i !== idx)
        : store.posts;
      const post = sanitizeBlogPost(row, existing, siblings);
      if (idx >= 0) store.posts[idx] = post;
      else store.posts.unshift(post);
      imported += 1;
    }
    await writeStoreAtomic(store);
    return { imported, posts: sortPosts(store.posts) };
  });
}

export async function listExtraBlogPosts(): Promise<BlogPost[]> {
  return listBlogPosts();
}
