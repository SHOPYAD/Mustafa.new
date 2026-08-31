"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Hotel as HotelIcon,
  MapPin,
  Car,
  ListTree,
} from "lucide-react";
import { getActiveHotels } from "@/data/hotels";
import { getPackages } from "@/data/packages";
import { getFeaturedTransfers } from "@/data/transfers";
import type { BlogPost } from "@/types/blog";
import type { Hotel } from "@/types/hotel";
import type { HolidayPackage } from "@/types/package";
import type { TransferService } from "@/types/transfer";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useSiteContact } from "@/hooks/useSiteContact";
import { tContent, buildWhatsAppLink } from "@/lib/utils";
import HotelCard from "@/components/hotels/HotelCard";
import PackageCard from "@/components/packages/PackageCard";
import TransferCard from "@/components/transfers/TransferCard";
import CardSlider from "@/components/ui/CardSlider";
import SafeImage from "@/components/ui/SafeImage";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";

function splitContentAtMidpoint(html: string): [string, string] {
  const parts = html.split(/(?=<\/p>)/i);
  if (parts.length <= 2) return [html, ""];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(""), parts.slice(mid).join("")];
}

type TocItem = { id: string; text: string; level: 2 | 3 };

function slugifyHeading(text: string, index: number): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);
  return base || `section-${index + 1}`;
}

function enhanceHeadings(html: string): { html: string; toc: TocItem[] } {
  if (!html) return { html: "", toc: [] };
  const toc: TocItem[] = [];
  let i = 0;
  const next = html.replace(
    /<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (_full, tag: string, attrs = "", inner: string) => {
      const level = tag.toLowerCase() === "h2" ? 2 : 3;
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return _full;
      const id = slugifyHeading(text, i++);
      toc.push({ id, text, level: level as 2 | 3 });
      const cleanedAttrs = String(attrs || "").replace(/\s+id=(["'])[^"']*\1/i, "");
      return `<${tag}${cleanedAttrs} id="${id}">${inner}</${tag}>`;
    }
  );
  return { html: next, toc };
}

const proseClass = `prose prose-invert prose-lg max-w-none prose-blog-framed
  prose-headings:font-bold prose-headings:text-white prose-headings:scroll-mt-28
  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
  prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-5
  prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
  prose-strong:text-white prose-li:text-white/80
  prose-img:rounded-2xl prose-blockquote:border-emerald-500/50 prose-blockquote:text-white/70`;

export function BlogPostView({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}) {
  const { t, locale, dir } = useLocale();
  const contact = useSiteContact();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [packages, setPackages] = useState<HolidayPackage[]>([]);
  const [transfers, setTransfers] = useState<TransferService[]>([]);

  useEffect(() => {
    setHotels(getActiveHotels().slice(0, 8));
    setPackages(getPackages().slice(0, 8));
    setTransfers(getFeaturedTransfers().slice(0, 8));
  }, []);

  const title = tContent(post as unknown as Record<string, unknown>, "title", locale);
  const excerpt = tContent(post as unknown as Record<string, unknown>, "excerpt", locale);
  const content =
    locale === "ar"
      ? post.contentAr || post.contentEn
      : locale === "tr"
        ? post.contentEn || post.contentAr
        : post.contentEn || post.contentAr;

  const [contentFirstRaw, contentSecondRaw] = useMemo(
    () => (content ? splitContentAtMidpoint(content) : ["", ""]),
    [content]
  );

  const firstEnhanced = useMemo(
    () => enhanceHeadings(contentFirstRaw),
    [contentFirstRaw]
  );
  const secondEnhanced = useMemo(
    () => enhanceHeadings(contentSecondRaw),
    [contentSecondRaw]
  );
  const toc = useMemo(
    () => [...firstEnhanced.toc, ...secondEnhanced.toc],
    [firstEnhanced.toc, secondEnhanced.toc]
  );

  const tocTitle =
    locale === "ar" ? "فهرسة المقال" : locale === "tr" ? "İçindekiler" : "Table of contents";

  const waNumber = contact.whatsappNumber || DEFAULT_SITE_WHATSAPP;
  const waMessage =
    locale === "ar"
      ? `مرحباً، قرأت مقال "${title}" وأرغب في التخطيط لرحلة إلى تركيا.`
      : `Hi, I read "${title}" and would like help planning a Turkey trip.`;
  const whatsappUrl = buildWhatsAppLink(waNumber, waMessage);

  return (
    <article className="min-h-screen bg-slate-950 text-white pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12 lg:items-start">
          <div className="min-w-0">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/50 hover:text-emerald-400 text-sm mb-8 transition-colors"
            >
              <ArrowRight
                size={16}
                className={dir === "rtl" ? "" : "rotate-180"}
              />
              {t.blog.title}
            </Link>

            <header className="max-w-3xl mb-10">
              <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4 text-balance">
                {title}
              </h1>
              {excerpt && (
                <p className="text-lg text-white/60 leading-relaxed mb-4">
                  {excerpt}
                </p>
              )}
              <p className="text-white/40 text-sm">
                {post.author}
                {post.publishedAt
                  ? ` · ${new Date(post.publishedAt).toLocaleDateString(
                      locale === "ar"
                        ? "ar-AE"
                        : locale === "tr"
                          ? "tr-TR"
                          : "en-GB",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}`
                  : ""}
              </p>
            </header>

            {post.coverImage && (
              <div className="relative w-full max-w-3xl aspect-[16/9] rounded-2xl overflow-hidden mb-10 shadow-2xl ring-1 ring-white/10 ring-offset-4 ring-offset-slate-950 border border-emerald-500/15">
                <SafeImage
                  src={post.coverImage}
                  alt={post.coverAlt || title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {toc.length > 0 && (
              <nav
                aria-label={tocTitle}
                className="lg:hidden mb-8 p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <p className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-3">
                  <ListTree size={16} />
                  {tocTitle}
                </p>
                <ul className="space-y-2">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "ps-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-white/70 hover:text-emerald-400 transition-colors"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="max-w-3xl">
              {firstEnhanced.html && (
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: firstEnhanced.html }}
                />
              )}

              {hotels.length > 0 && (
                <CardSlider
                  tone="dark"
                  className="my-12"
                  title={
                    locale === "ar"
                      ? "فنادق تركيا المقترحة"
                      : "Suggested Turkey Hotels"
                  }
                >
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="snap-start shrink-0 w-[240px] sm:w-[260px]"
                    >
                      <HotelCard hotel={hotel} compact />
                    </div>
                  ))}
                </CardSlider>
              )}

              {packages.length > 0 && (
                <CardSlider
                  tone="dark"
                  className="my-12"
                  title={
                    locale === "ar"
                      ? "باقات تركيا المميزة"
                      : "Featured Turkey Packages"
                  }
                >
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="snap-start shrink-0 w-[240px] sm:w-[260px]"
                    >
                      <PackageCard package_={pkg} compact />
                    </div>
                  ))}
                </CardSlider>
              )}

              {transfers.length > 0 && (
                <CardSlider
                  tone="dark"
                  className="my-12"
                  title={
                    locale === "ar"
                      ? "ترانسفير وسيارات خاصة"
                      : "Transfers & Private Cars"
                  }
                >
                  {transfers.map((item) => (
                    <div
                      key={item.id}
                      className="snap-start shrink-0 w-[240px] sm:w-[260px]"
                    >
                      <TransferCard transfer={item} compact />
                    </div>
                  ))}
                </CardSlider>
              )}

              {secondEnhanced.html && (
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: secondEnhanced.html }}
                />
              )}

              <div className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#0a1628] to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <MessageCircle size={22} className="text-emerald-400" />
                    {t.packageDetail.whatsapp}
                  </h2>
                  <p className="text-white/60 text-sm">
                    {locale === "ar"
                      ? "تحدث مع خبرائنا للحصول على عرض مخصص لرحلتك إلى تركيا"
                      : "Chat with our experts for a tailored Turkey travel quote"}
                  </p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shrink-0"
                >
                  <MessageCircle size={18} />
                  {t.packageDetail.whatsapp}
                </a>
              </div>
            </div>
          </div>

          <aside className="hidden lg:block sticky top-28 space-y-4">
            {toc.length > 0 && (
              <nav
                aria-label={tocTitle}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">
                  <ListTree size={16} />
                  {tocTitle}
                </h2>
                <ul className="space-y-2.5 max-h-[40vh] overflow-y-auto scrollbar-hide">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "ps-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-white/70 hover:text-emerald-400 transition-colors leading-snug block"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">
                {t.packageDetail.related}
              </h2>
              <ul className="space-y-4">
                {relatedPosts.map((related) => {
                  const relatedTitle = tContent(
                    related as unknown as Record<string, unknown>,
                    "title",
                    locale
                  );
                  return (
                    <li key={related.id}>
                      <Link
                        href={`/blog/${related.slug}`}
                        className="group block"
                      >
                        {related.coverImage && (
                          <div className="relative w-full h-28 rounded-xl overflow-hidden mb-2 ring-1 ring-white/10">
                            <SafeImage
                              src={related.coverImage}
                              alt={relatedTitle}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <p className="text-sm font-medium text-white/90 group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {relatedTitle}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          {related.publishedAt
                            ? new Date(related.publishedAt).toLocaleDateString(
                                locale === "ar"
                                  ? "ar-AE"
                                  : locale === "tr"
                                    ? "tr-TR"
                                    : "en-GB",
                                { month: "short", day: "numeric" }
                              )
                            : ""}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {relatedPosts.length === 0 && (
                <p className="text-white/30 text-sm">{t.blog.noPosts}</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-100/80">
              <p className="flex items-center gap-2 font-medium text-emerald-300 mb-1">
                <HotelIcon size={16} />
                {t.nav.hotels}
              </p>
              <Link href="/hotels" className="text-emerald-400 hover:underline">
                {t.home.viewAllDestinations}
              </Link>
              <p className="flex items-center gap-2 font-medium text-emerald-300 mt-3 mb-1">
                <MapPin size={16} />
                {t.nav.holidays}
              </p>
              <Link
                href="/holidays"
                className="text-emerald-400 hover:underline"
              >
                {t.home.featuredPackages}
              </Link>
              <p className="flex items-center gap-2 font-medium text-emerald-300 mt-3 mb-1">
                <Car size={16} />
                {t.nav.transfers}
              </p>
              <Link
                href="/transfers"
                className="text-emerald-400 hover:underline"
              >
                {t.nav.transfers}
              </Link>
            </div>
          </aside>
        </div>

        {relatedPosts.length > 0 && (
          <section className="lg:hidden mt-12 pt-8 border-t border-white/10">
            <h2 className="text-lg font-bold mb-4">{t.packageDetail.related}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.slice(0, 4).map((related) => {
                const relatedTitle = tContent(
                  related as unknown as Record<string, unknown>,
                  "title",
                  locale
                );
                return (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {related.coverImage && (
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
                        <SafeImage
                          src={related.coverImage}
                          alt={relatedTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="text-sm font-medium line-clamp-2">
                      {relatedTitle}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
