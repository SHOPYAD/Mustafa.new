import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/BlogPostView";
import {
  getBlogPostBySlug,
  listPublishedBlogPosts,
} from "@/lib/server/blog-store";
import type { BlogPost } from "@/types/blog";

const TURKEY_PAGE = /تركيا|turkey|istanbul|trabzon|طرابزون|إسطنبول|اسطنبول|كابادوكيا|cappadocia/i;

function isTurkeyPost(post: BlogPost): boolean {
  const seo = post.seo;
  return TURKEY_PAGE.test(
    [
      post.titleAr,
      post.titleEn,
      post.slug,
      post.category,
      post.excerptAr,
      post.excerptEn,
      ...(post.tags || []),
      seo?.focusKeyword,
      seo?.metaTitleAr,
      seo?.metaTitleEn,
      seo?.metaDescriptionAr,
      seo?.metaDescriptionEn,
      ...(seo?.keywords || []),
    ].join(" ")
  );
}

export const revalidate = 300;
export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== "published") {
    return { title: "Blog" };
  }
  const title = post.seo.metaTitleAr || post.titleAr || post.titleEn;
  const description =
    post.seo.metaDescriptionAr || post.excerptAr || post.excerptEn;
  const image = post.seo.ogImage || post.coverImage;
  const turkeyPage = isTurkeyPost(post);
  return {
    title,
    description,
    keywords: turkeyPage
      ? undefined
      : ["فرنسا", "باريس", "نيس", "ليون", "سفر", "طيران", "فنادق", "Lonaliza"],
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      images: image ? [{ url: image, alt: post.coverAlt || title }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Ctx) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== "published") notFound();
  const turkeyPage = isTurkeyPost(post);
  const relatedPosts = (await listPublishedBlogPosts())
    .filter((p) => p.slug !== slug)
    .filter((p) => turkeyPage || !isTurkeyPost(p))
    .slice(0, 5)
    .map((p) => ({ ...p, contentAr: "", contentEn: "" }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titleAr || post.titleEn,
    description: post.excerptAr || post.excerptEn || post.seo?.metaDescriptionAr || "",
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author || "Lonaliza" },
    image: post.seo?.ogImage || post.coverImage || undefined,
    mainEntityOfPage: `https://lonaliza.com/blog/${post.slug}`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogPostView post={post} relatedPosts={relatedPosts} />
    </>
  );
}
