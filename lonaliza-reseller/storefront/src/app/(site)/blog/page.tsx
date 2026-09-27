import { listPublishedBlogPosts } from "@/lib/server/blog-store";
import { BlogIndex } from "@/components/blog/BlogIndex";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function BlogPage() {
  const posts = await listPublishedBlogPosts();
  return <BlogIndex posts={posts} />;
}
