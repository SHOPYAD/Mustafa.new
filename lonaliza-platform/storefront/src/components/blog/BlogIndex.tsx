"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";

function visibleText(post: BlogPost, base: "title" | "excerpt", locale: "ar" | "en" | "tr" | "fr"): string {
  const resolved = tContent(post as unknown as Record<string, unknown>, base, locale).trim();
  if (resolved) return resolved;
  if (base === "title") return (post.titleAr || post.titleEn || post.slug || "مقال").trim();
  return (post.excerptAr || post.excerptEn || "").trim();
}

function readingMinutes(post: BlogPost): number {
  const words = `${post.contentAr || ""} ${post.contentEn || ""}`
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(value: string | undefined, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-GB");
}

export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState("all");
  const featured = posts[0];
  const categories = useMemo(() => ["all", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))], [posts]);
  const filtered = category === "all" ? posts : posts.filter((p) => p.category === category);
  const grid = filtered.filter((post) => post.id !== featured?.id || category !== "all");

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-slate-950 pt-24 pb-20">
      <section className="bg-[#051741] text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <p className="text-amber-300 text-xs font-bold tracking-[0.22em] uppercase mb-3">Lonaliza Journal</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">{t.blog.title}</h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80">{t.blog.subtitle}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-11 px-5 py-2 rounded-full text-sm font-bold ${
                category === cat ? "bg-emerald-700 text-white" : "bg-white text-slate-900 border border-slate-200"
              }`}
            >
              {cat === "all" ? t.blog.all : cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-slate-700 py-20">{t.blog.noPosts}</p>
        ) : (
          <>
            {category === "all" && featured ? (
              <Link href={`/blog/${featured.slug}`} className="mb-10 grid overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">
                <div className="relative min-h-64 bg-slate-200">
                  {featured.coverImage ? (
                    <Image src={featured.coverImage} alt={featured.coverAlt || visibleText(featured, "title", locale)} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{featured.category}</p>
                  <h2 className="mt-3 text-2xl md:text-4xl font-black leading-tight text-slate-950">
                    {visibleText(featured, "title", locale)}
                  </h2>
                  <p className="mt-4 text-slate-700 leading-relaxed">{visibleText(featured, "excerpt", locale)}</p>
                  <p className="mt-6 text-sm text-slate-600">
                    {formatDate(featured.publishedAt, locale)} · {readingMinutes(featured)} {locale === "ar" ? "دقيقة قراءة" : "min read"}
                  </p>
                  <span className="mt-5 inline-flex text-sm font-bold text-emerald-800">{t.common.readMore}</span>
                </div>
              </Link>
            ) : null}

            <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(category === "all" ? grid : filtered).map((post) => {
                const title = visibleText(post, "title", locale);
                const excerpt = visibleText(post, "excerpt", locale);
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="relative h-48 bg-slate-200">
                      {post.coverImage ? (
                        <Image src={post.coverImage} alt={post.coverAlt || title} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-bold text-emerald-800">{post.category}</p>
                      <h2 className="mt-2 line-clamp-3 text-lg font-black leading-snug text-slate-950">{title}</h2>
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-700">{excerpt}</p>
                      <p className="mt-4 text-xs text-slate-600">
                        {formatDate(post.publishedAt, locale)} · {readingMinutes(post)} {locale === "ar" ? "دقيقة" : "min"}
                      </p>
                      <span className="mt-3 text-sm font-bold text-emerald-800">{t.common.readMore}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
