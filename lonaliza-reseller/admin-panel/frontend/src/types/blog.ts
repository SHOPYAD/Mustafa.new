export type BlogStatus = "draft" | "published";

export interface BlogSeo {
  metaTitleAr: string;
  metaTitleEn: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  focusKeyword: string;
  ogImage: string;
}

/** @deprecated alias */
export type BlogSeoAlias = BlogSeo;

export interface BlogPost {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  tags: string[];
  author: string;
  status: BlogStatus;
  seo: BlogSeo;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type BlogPostInput = Omit<BlogPost, "id" | "createdAt" | "updatedAt">;
