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
    <div className="min-h-screen bg-slate-950 text-white pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl md:text-5xl">{t.blog.title}</h1>
          <p className="text-white/50 text-lg">{t.blog.subtitle}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`min-h-11 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? "bg-orange-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {cat === "all" ? t.blog.all : cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-white/40 py-20">{t.blog.noPosts}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => {
              const title = tContent(post as unknown as Record<string, unknown>, "title", locale);
              const excerpt = tContent(post as unknown as Record<string, unknown>, "excerpt", locale);
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-orange-500/30 transition-all"
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
                      <div className="w-full h-full bg-slate-800" />
                    )}
                    <span className="absolute top-3 start-3 bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-white/40 text-xs mb-2">
                      {post.author} ·{" "}
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString(
                            locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-GB"
                          )
                        : ""}
                    </p>
                    <h2 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                      {title}
                    </h2>
                    <p className="text-white/50 text-sm line-clamp-3">{excerpt}</p>
                    <span className="inline-block mt-4 text-orange-400 text-sm font-semibold">
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
