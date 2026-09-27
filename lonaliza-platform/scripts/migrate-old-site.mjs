/**
 * Crawl https://alrayyantourism.com and import blog + tour packages
 * into the Next.js data layer. CSS on the old site is irrelevant.
 *
 * Usage: node scripts/migrate-old-site.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE = "https://alrayyantourism.com";
const OUT_IMG = path.join(ROOT, "public", "migrated");
const OUT_DATA = path.join(ROOT, "src", "data", "migrated");
const REPORT_PATH = path.join(OUT_DATA, "migration-report.json");

const DELAY_MS = 350;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const failed = [];
const imageCache = new Map(); // remote URL -> local /migrated/... path
let imageCount = 0;

function decodeEntities(s = "") {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    );
}

function stripTags(html = "") {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function metaContent(html, prop) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`,
    "i"
  );
  const m = html.match(re) || html.match(re2);
  return m ? decodeEntities(m[1]) : "";
}

function titleTag(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : "";
}

function extractArticleHtml(html) {
  const m = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (!m) return "";
  let body = m[1];
  // Drop share buttons / social widgets
  body = body.replace(/<ul class="rrssb-buttons"[\s\S]*?<\/ul>/gi, "");
  // Prefer the main text block after media/title
  const item = body.match(
    /<div class="list-single-main-item[^"]*"[\s\S]*?<\/div>\s*<\/article>/i
  );
  // Take content after title heading if present
  const afterTitle = body.split(
    /<div class="list-single-main-item-title[^"]*"[\s\S]*?<\/div>/i
  );
  let content = afterTitle.length > 1 ? afterTitle.slice(1).join("") : body;
  // Remove nested media slider (cover already stored separately)
  content = content.replace(
    /<div class="list-single-main-media[\s\S]*?<\/div>\s*(?=<div class="list-single-main-item)/i,
    ""
  );
  content = content.replace(/<div class="list-single-main-media[\s\S]*?<\/div>/i, "");
  // Clean scripts/iframes/ads
  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  // Normalize relative image/src links
  content = content.replace(
    /(?:src|href)=["'](\.\.\/)+photos\//gi,
    'src="https://alrayyantourism.com/photos/'
  );
  content = content.replace(
    /(?:src|href)=["']\.\.\/photos\//gi,
    'src="https://alrayyantourism.com/photos/'
  );
  content = content.replace(
    /src=["'](?!https?:|\/|data:)([^"']+)["']/gi,
    (_, p) => {
      const abs = p.startsWith("/")
        ? `${BASE}${p}`
        : `${BASE}/ar/${p.replace(/^\.\//, "")}`;
      return `src="${abs}"`;
    }
  );
  return content.trim();
}

function slugify(text, fallback) {
  const arabic = (text || "")
    .trim()
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  if (arabic && /[a-zA-Z0-9\u0600-\u06FF]/.test(arabic)) {
    // Prefer ASCII-friendly slug when possible
    const ascii = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    if (ascii.length >= 4) return ascii;
    return `item-${fallback}`;
  }
  return `item-${fallback}`;
}

function guessDurationDays(title, bodyText) {
  const sources = `${title} ${bodyText}`;
  const m =
    sources.match(/(\d+)\s*(?:ايام|أيام|يوم|days?|day)/i) ||
    sources.match(/اليوم\s+(?:العاشر|التاسع|الثامن|السابع|السادس|الخامس|الرابع|الثالث)/);
  if (m && m[1]) return Math.min(30, Math.max(1, Number(m[1])));
  if (/اليوم\s+العاشر/.test(sources)) return 10;
  if (/اليوم\s+التاسع/.test(sources)) return 9;
  if (/اليوم\s+الثامن/.test(sources)) return 8;
  if (/اليوم\s+السابع/.test(sources)) return 7;
  if (/اليوم\s+السادس/.test(sources)) return 6;
  if (/اليوم\s+الخامس/.test(sources)) return 5;
  if (/اليوم\s+الرابع/.test(sources)) return 4;
  if (/اليوم\s+الثالث/.test(sources)) return 3;
  return 1;
}

function guessDestination(title, bodyText) {
  const t = `${title} ${bodyText}`;
  const cities = [
    ["اسطنبول", "Istanbul"],
    ["إسطنبول", "Istanbul"],
    ["طرابزون", "Trabzon"],
    ["ترابزون", "Trabzon"],
    ["بورصا", "Bursa"],
    ["بورصة", "Bursa"],
    ["انطاليا", "Antalya"],
    ["أنطاليا", "Antalya"],
    ["بودروم", "Bodrum"],
    ["مرمريس", "Marmaris"],
    ["سبانجا", "Sapanca"],
    ["اوزنجول", "Uzungol"],
    ["أوزنجول", "Uzungol"],
    ["كابادوكيا", "Cappadocia"],
    ["كبادوكيا", "Cappadocia"],
  ];
  for (const [ar, en] of cities) {
    if (t.includes(ar)) return { ar, en };
  }
  return { ar: "تركيا", en: "Turkey" };
}

function guessPrice(text) {
  const m =
    text.match(/(?:السعر|price|USD|\$)\s*[:：]?\s*(\d[\d.,]*)/i) ||
    text.match(/(\d[\d.,]*)\s*(?:دولار|USD|\$)/i) ||
    text.match(/(\d[\d.,]*)\s*(?:ليرة|TRY)/i);
  if (!m) return { price: 0, currency: "USD" };
  const price = Number(String(m[1]).replace(/,/g, ""));
  const currency = /ليرة|TRY/i.test(m[0]) ? "TRY" : "USD";
  return { price: Number.isFinite(price) ? price : 0, currency };
}

function idFromUrl(url) {
  const m = String(url).match(/[?&]id=(\d+)/);
  return m ? m[1] : createHash("md5").update(url).digest("hex").slice(0, 10);
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "AlrayyanMigrationBot/1.0 (+content import for redesign; contact site owner)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text, finalUrl: res.url };
}

function extFromUrl(url, contentType = "") {
  const u = url.split("?")[0].toLowerCase();
  if (u.endsWith(".png")) return ".png";
  if (u.endsWith(".webp")) return ".webp";
  if (u.endsWith(".gif")) return ".gif";
  if (u.endsWith(".jpeg") || u.endsWith(".jpg")) return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  return ".jpg";
}

async function downloadImage(remoteUrl, prefix) {
  if (!remoteUrl) return "";
  let abs = remoteUrl.trim();
  if (abs.startsWith("//")) abs = "https:" + abs;
  if (abs.startsWith("../")) abs = `${BASE}/` + abs.replace(/^(\.\.\/)+/, "");
  if (abs.startsWith("/")) abs = BASE + abs;
  if (!/^https?:\/\//i.test(abs)) abs = `${BASE}/photos/` + abs.replace(/^.*photos\//, "");
  // Prefer non-www host consistency
  abs = abs.replace("https://www.alrayyantourism.com", BASE);

  if (imageCache.has(abs)) return imageCache.get(abs);

  try {
    await sleep(80);
    const res = await fetch(abs, {
      headers: { "User-Agent": "AlrayyanMigrationBot/1.0" },
      redirect: "follow",
    });
    if (!res.ok) {
      failed.push({ type: "image", url: abs, status: res.status });
      imageCache.set(abs, abs); // keep remote fallback
      return abs;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 200) {
      failed.push({ type: "image-tiny", url: abs, status: res.status });
      imageCache.set(abs, abs);
      return abs;
    }
    const hash = createHash("md5").update(abs).digest("hex").slice(0, 12);
    const ext = extFromUrl(abs, res.headers.get("content-type") || "");
    const filename = `${prefix}-${hash}${ext}`;
    await fs.writeFile(path.join(OUT_IMG, filename), buf);
    const local = `/migrated/${filename}`;
    imageCache.set(abs, local);
    imageCount += 1;
    return local;
  } catch (e) {
    failed.push({ type: "image-error", url: abs, error: String(e.message || e) });
    imageCache.set(abs, abs);
    return abs;
  }
}

async function rewriteContentImages(html, prefix) {
  if (!html) return html;
  const urls = new Set();
  const re = /src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const u = m[1];
    if (/alrayyantourism\.com|\/photos\//i.test(u) || u.startsWith("../")) {
      urls.add(u);
    }
  }
  let out = html;
  for (const u of urls) {
    const local = await downloadImage(u, prefix);
    // Escape for replace
    out = out.split(u).join(local);
  }
  return out;
}

async function collectUrls() {
  const blogIds = new Set();
  const tourIds = new Set();

  const sm = await fetchText(`${BASE}/sitemap.xml`);
  if (sm.ok) {
    for (const m of sm.text.matchAll(
      /https:\/\/alrayyantourism\.com\/ar\/blog_detail\.php\?id=(\d+)/g
    )) {
      blogIds.add(m[1]);
    }
    for (const m of sm.text.matchAll(
      /https:\/\/alrayyantourism\.com\/ar\/tourist_detail\.php\?id=(\d+)/g
    )) {
      tourIds.add(m[1]);
    }
  } else {
    failed.push({ type: "sitemap", status: sm.status });
  }

  // Blog listing often has newer posts not in sitemap
  const list = await fetchText(`${BASE}/ar/blog.php`);
  if (list.ok && list.text.length > 500) {
    for (const m of list.text.matchAll(/blog_detail\.php\?id=(\d+)/g)) {
      blogIds.add(m[1]);
    }
  } else {
    failed.push({
      type: "blog-list",
      status: list.status,
      note: "empty or failed",
    });
  }

  // Crawl category listing pages for extra tour detail links
  const listingUrls = [];
  for (const id of [4, 5, 6]) {
    for (const city of [1, 2, 4, 8, 9, 10, 11]) {
      listingUrls.push(`${BASE}/ar/tourist.php?id=${id}&city=${city}`);
    }
  }
  for (const url of listingUrls) {
    await sleep(DELAY_MS);
    const page = await fetchText(url);
    if (!page.ok || page.text.length < 500) {
      failed.push({ type: "listing", url, status: page.status });
      continue;
    }
    for (const m of page.text.matchAll(/tourist_detail\.php\?id=(\d+)/g)) {
      tourIds.add(m[1]);
    }
  }

  return {
    blogs: [...blogIds].map((id) => `${BASE}/ar/blog_detail.php?id=${id}`),
    tours: [...tourIds].map((id) => `${BASE}/ar/tourist_detail.php?id=${id}`),
  };
}

function isRedirectStub(html) {
  return (
    html.length < 400 ||
    /window\.location\.href\s*=\s*["']index\.php["']/i.test(html) ||
    /meta http-equiv=["']refresh["']/i.test(html)
  );
}

function publishedFromId(id) {
  // Many IDs are unix timestamps
  const n = Number(id);
  if (n > 1_400_000_000 && n < 2_000_000_000) {
    return new Date(n * 1000).toISOString();
  }
  return new Date().toISOString();
}

async function parseBlog(url) {
  await sleep(DELAY_MS);
  const { ok, status, text } = await fetchText(url);
  const id = idFromUrl(url);
  if (!ok || isRedirectStub(text)) {
    failed.push({ type: "blog", url, status, note: "empty/redirect" });
    return null;
  }
  const title = metaContent(text, "og:title") || titleTag(text);
  const excerpt =
    metaContent(text, "og:description") || metaContent(text, "description");
  let cover = metaContent(text, "og:image");
  let content = extractArticleHtml(text);
  if (!title || (!content && !excerpt)) {
    failed.push({ type: "blog", url, status, note: "no content" });
    return null;
  }
  cover = await downloadImage(cover, `blog-${id}`);
  content = await rewriteContentImages(content, `blog-${id}-body`);
  const slug = `${slugify(title, id)}-${id}`;
  const publishedAt = publishedFromId(id);
  // Site is Arabic-primary; mirror into EN so both locales show content until translated
  return {
    id: `old-blog-${id}`,
    slug,
    titleAr: title,
    titleEn: title,
    excerptAr: excerpt.slice(0, 280),
    excerptEn: excerpt.slice(0, 280),
    contentAr: content || `<p>${excerpt}</p>`,
    contentEn: content || `<p>${excerpt}</p>`,
    coverImage: cover || "",
    coverAlt: title,
    category: "Travel Tips",
    tags: ["turkey", "alrayyan", "migrated"],
    author: "Alrayyan Tourism",
    status: "published",
    seo: {
      metaTitleAr: title,
      metaTitleEn: title,
      metaDescriptionAr: excerpt.slice(0, 160),
      metaDescriptionEn: excerpt.slice(0, 160),
      focusKeyword: "",
      ogImage: cover || "",
    },
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    _sourceUrl: url,
  };
}

async function parseTour(url) {
  await sleep(DELAY_MS);
  const { ok, status, text } = await fetchText(url);
  const id = idFromUrl(url);
  if (!ok || isRedirectStub(text)) {
    failed.push({ type: "tour", url, status, note: "empty/redirect" });
    return null;
  }
  const title = metaContent(text, "og:title") || titleTag(text);
  const excerpt =
    metaContent(text, "og:description") || metaContent(text, "description");
  let cover = metaContent(text, "og:image");
  let content = extractArticleHtml(text);
  if (!title) {
    failed.push({ type: "tour", url, status, note: "no title" });
    return null;
  }
  const plain = stripTags(content || excerpt);
  const dest = guessDestination(title, plain);
  const durationDays = guessDurationDays(title, plain);
  const { price, currency } = guessPrice(`${title} ${plain} ${excerpt}`);
  cover = await downloadImage(cover, `pkg-${id}`);
  content = await rewriteContentImages(content, `pkg-${id}-body`);
  const slug = `${slugify(title, id)}-${id}`;

  // Collect a few body images as gallery extras
  const gallery = [];
  if (cover) gallery.push({ url: cover, alt: title, width: 800, height: 600 });
  const imgRe = /src=["'](\/migrated\/[^"']+|https?:\/\/[^"']+)["']/gi;
  let im;
  while ((im = imgRe.exec(content || "")) && gallery.length < 5) {
    const u = im[1];
    if (!gallery.some((g) => g.url === u)) {
      gallery.push({ url: u, alt: title, width: 800, height: 600 });
    }
  }

  return {
    id: `old-pkg-${id}`,
    slug,
    title,
    titleAr: title,
    titleEn: title,
    destination: dest.en,
    destinationAr: dest.ar,
    destinationEn: dest.en,
    country: "Turkey",
    countryAr: "تركيا",
    countryEn: "Turkey",
    durationDays,
    price,
    currency,
    rating: 4.7,
    images: gallery.length
      ? gallery
      : [{ url: cover || "", alt: title, width: 800, height: 600 }],
    amenities: ["Hotel", "Transfer", "Private car"],
    amenitiesAr: ["فندق", "ترانسفير", "سيارة خاصة"],
    isFeatured: true,
    description: plain.slice(0, 500),
    descriptionAr: content || `<p>${excerpt}</p>`,
    descriptionEn: content || `<p>${excerpt}</p>`,
    inclusions: [],
    exclusions: [],
    itinerary: [],
    _sourceUrl: url,
  };
}

function toTsBlogFile(posts) {
  // Keep CRUD helpers; replace defaultPosts seed
  return `import type { BlogPost } from "@/types/blog";
import migratedPosts from "./migrated/blog-posts.json";

const STORAGE_KEY = "liotrip_blog";

const emptySeo = {
  metaTitleAr: "",
  metaTitleEn: "",
  metaDescriptionAr: "",
  metaDescriptionEn: "",
  focusKeyword: "",
  ogImage: "",
};

/** Seed posts imported from alrayyantourism.com (Arabic primary). */
export const defaultPosts: BlogPost[] = migratedPosts as BlogPost[];

function save(posts: BlogPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function getPosts(): BlogPost[] {
  if (typeof window === "undefined") return defaultPosts;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as BlogPost[];
    } catch {
      return defaultPosts;
    }
  }
  save(defaultPosts);
  return defaultPosts;
}

export function getPublishedPosts(): BlogPost[] {
  return getPosts()
    .filter((p) => p.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.updatedAt).getTime() -
        new Date(a.publishedAt || a.updatedAt).getTime()
    );
}

export function getPostById(id: string): BlogPost | undefined {
  return getPosts().find((p) => p.id === id);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function addPost(input: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): BlogPost {
  const posts = getPosts();
  const now = new Date().toISOString();
  const post: BlogPost = {
    ...input,
    id: Date.now().toString(),
    createdAt: now,
    updatedAt: now,
  };
  posts.unshift(post);
  save(posts);
  return post;
}

export function updatePost(id: string, data: Partial<BlogPost>): BlogPost | null {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  posts[idx] = {
    ...posts[idx],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };
  save(posts);
  return posts[idx];
}

export function deletePost(id: string): boolean {
  const posts = getPosts().filter((p) => p.id !== id);
  save(posts);
  return true;
}

export function createEmptyPost(): BlogPost {
  return addPost({
    slug: \`draft-\${Date.now()}\`,
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

export function resetPosts() {
  save(defaultPosts);
}
`;
}

function stripInternal(obj) {
  const { _sourceUrl, ...rest } = obj;
  return rest;
}

async function main() {
  console.log("Collecting URLs…");
  await fs.mkdir(OUT_IMG, { recursive: true });
  await fs.mkdir(OUT_DATA, { recursive: true });

  const { blogs, tours } = await collectUrls();
  console.log(`Found ${blogs.length} blog URLs, ${tours.length} tour URLs`);

  const posts = [];
  for (let i = 0; i < blogs.length; i++) {
    process.stdout.write(`\rBlog ${i + 1}/${blogs.length}   `);
    const p = await parseBlog(blogs[i]);
    if (p) posts.push(p);
  }
  console.log(`\nImported blogs: ${posts.length}`);

  const packages = [];
  for (let i = 0; i < tours.length; i++) {
    process.stdout.write(`\rTour ${i + 1}/${tours.length}   `);
    const p = await parseTour(tours[i]);
    if (p) packages.push(p);
  }
  console.log(`\nImported packages: ${packages.length}`);

  // Sort newest first where ids are timestamps
  posts.sort((a, b) => String(b.id).localeCompare(String(a.id)));
  packages.sort((a, b) => String(b.id).localeCompare(String(a.id)));

  const blogJson = posts.map(stripInternal);
  const pkgJson = packages.map(stripInternal);

  await fs.writeFile(
    path.join(OUT_DATA, "blog-posts.json"),
    JSON.stringify(blogJson, null, 2),
    "utf8"
  );
  await fs.writeFile(
    path.join(OUT_DATA, "packages.json"),
    JSON.stringify(pkgJson, null, 2),
    "utf8"
  );

  // Update blog.ts to load migrated JSON
  await fs.writeFile(
    path.join(ROOT, "src", "data", "blog.ts"),
    toTsBlogFile(blogJson),
    "utf8"
  );

  // Patch packages.ts: keep testimonials + CRUD, swap defaultPackages
  const packagesTsPath = path.join(ROOT, "src", "data", "packages.ts");
  let packagesTs = await fs.readFile(packagesTsPath, "utf8");
  if (!packagesTs.includes('from "./migrated/packages.json"')) {
    packagesTs = packagesTs.replace(
      'import { HolidayPackage, Testimonial } from "@/types/package";',
      `import { HolidayPackage, Testimonial } from "@/types/package";
import migratedPackages from "./migrated/packages.json";`
    );
  }
  packagesTs = packagesTs.replace(
    /export const defaultPackages: HolidayPackage\[\] = \[[\s\S]*?\];\n\nexport const testimonials/,
    `export const defaultPackages: HolidayPackage[] = migratedPackages as HolidayPackage[];

export const testimonials`
  );
  await fs.writeFile(packagesTsPath, packagesTs, "utf8");

  // Ensure tsconfig resolves JSON modules
  const tsconfigPath = path.join(ROOT, "tsconfig.json");
  const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, "utf8"));
  tsconfig.compilerOptions = tsconfig.compilerOptions || {};
  tsconfig.compilerOptions.resolveJsonModule = true;
  await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n", "utf8");

  const report = {
    finishedAt: new Date().toISOString(),
    counts: {
      blogUrlsFound: blogs.length,
      blogsImported: posts.length,
      tourUrlsFound: tours.length,
      packagesImported: packages.length,
      imagesDownloaded: imageCount,
      failures: failed.length,
    },
    sampleBlogTitles: posts.slice(0, 8).map((p) => p.titleAr),
    samplePackageTitles: packages.slice(0, 8).map((p) => p.titleAr),
    failed: failed.slice(0, 200),
    paths: {
      images: "public/migrated/",
      blogJson: "src/data/migrated/blog-posts.json",
      packagesJson: "src/data/migrated/packages.json",
      blogTs: "src/data/blog.ts",
      packagesTs: "src/data/packages.ts",
    },
    notes: [
      "Old site is Arabic-only (/en/ is 404). EN fields mirror AR until translated.",
      "Prices often missing on old pages → many packages have price: 0.",
      "Pretty URLs (/ar/ar/*.html) 404; PHP routes work.",
      "CSS broken on live site; HTML/content still fetchable.",
    ],
  };
  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log("\nDone.");
  console.log(JSON.stringify(report.counts, null, 2));
  console.log("Sample blogs:", report.sampleBlogTitles);
  console.log("Sample packages:", report.samplePackageTitles);
  console.log("Failures:", failed.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
