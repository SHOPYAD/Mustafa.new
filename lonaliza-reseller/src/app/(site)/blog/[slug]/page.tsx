import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/BlogPostView";
import {
  getBlogPostBySlug,
  listPublishedBlogPosts,
} from "@/lib/server/blog-store";

export const dynamic = "force-dynamic";
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
  return {
    title,
    description,
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
  const relatedPosts = (await listPublishedBlogPosts())
    .filter((p) => p.slug !== slug)
    .slice(0, 5);
  return <BlogPostView post={post} relatedPosts={relatedPosts} />;
}
