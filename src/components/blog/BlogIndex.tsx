"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";

export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [posts]);

  const filtered =
    category === "all" ? posts : posts.filter((p) => p.category === category);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 pt-28 pb-20 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="mb-3 text-3xl font-black sm:text-4xl md:text-5xl text-slate-900 dark:text-white tracking-tight">{t.blog.title}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">{t.blog.subtitle}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`min-h-11 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                category === cat
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 shadow-2xs"
              }`}
            >
              {cat === "all" ? t.blog.all : cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-20">{t.blog.noPosts}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => {
              const title = tContent(post as unknown as Record<string, unknown>, "title", locale);
              const excerpt = tContent(post as unknown as Record<string, unknown>, "excerpt", locale);
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 shadow-sm hover:shadow-xl dark:shadow-slate-950/50 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative h-48">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.coverAlt || title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800" />
                    )}
                    <span className="absolute top-3 start-3 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-md">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-2 font-medium">
                      {post.author} ·{" "}
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString(
                            locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-GB"
                          )
                        : ""}
                    </p>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed flex-1">{excerpt}</p>
                    <span className="inline-block mt-4 text-emerald-600 dark:text-emerald-400 text-sm font-bold group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                      {t.common.readMore} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
