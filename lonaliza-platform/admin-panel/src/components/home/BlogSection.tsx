"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { fetchPublishedPosts } from "@/data/blog";
import type { BlogPost } from "@/types/blog";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";

export default function BlogSection() {
  const { locale, t } = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    void fetchPublishedPosts().then((posts) => setPosts(posts.slice(0, 3)));
  }, []);

  return (
    <section className="py-20 md:py-28 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
              {t.blog.title}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              {t.home.latestBlog}
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors group"
          >
            {t.home.viewAllArticles}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-slate-400 py-12">{t.blog.noPosts}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const title = tContent(post, "title", locale);
              const excerpt = tContent(post, "excerpt", locale);
              const date = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString(
                    locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-GB",
                    { year: "numeric", month: "short", day: "numeric" }
                  )
                : "";

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
                >
                  <div className="relative h-52 overflow-hidden">
                    {post.coverImage ? (
                      <SafeImage
                        src={post.coverImage}
                        alt={post.coverAlt || title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-bold rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {post.author}
                      </span>
                      {date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {date}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      {t.admin.readMoreShort}
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
