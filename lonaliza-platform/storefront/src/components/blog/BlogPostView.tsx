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
  Plane,
  Sparkles,
  Compass,
  Clock,
  Calendar,
  Share2,
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

// Clean, high-contrast, Daylight & Night harmonious typography for luxury editorial reading
const proseClass = `prose prose-lg max-w-none prose-blog-framed
  prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:scroll-mt-28
  prose-h1:text-3xl lg:prose-h1:text-4xl prose-h1:text-slate-900 dark:prose-h1:text-white prose-h1:mb-6
  prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:font-black prose-h2:text-slate-900 dark:prose-h2:text-white prose-h2:mt-12 prose-h2:mb-5 prose-h2:border-b prose-h2:border-slate-200/90 dark:prose-h2:border-slate-800 prose-h2:pb-3
  prose-h3:text-xl prose-h3:font-bold prose-h3:text-emerald-800 dark:prose-h3:text-emerald-400 prose-h3:mt-8 prose-h3:mb-3
  prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base lg:prose-p:text-lg prose-p:mb-6
  prose-a:text-emerald-700 dark:prose-a:text-emerald-400 hover:dark:prose-a:text-emerald-300 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
  prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
  prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:leading-relaxed
  prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8 prose-img:border prose-img:border-slate-200/80 dark:prose-img:border-slate-800
  prose-blockquote:border-r-4 prose-blockquote:border-emerald-600 dark:prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50/60 dark:prose-blockquote:bg-emerald-950/30 prose-blockquote:p-4 prose-blockquote:rounded-xl prose-blockquote:text-slate-800 dark:prose-blockquote:text-emerald-100 prose-blockquote:my-6
  prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-800
  prose-th:bg-slate-100 dark:prose-th:bg-slate-800/90 prose-th:text-slate-900 dark:prose-th:text-slate-100 prose-th:border-slate-200 dark:prose-th:border-slate-700
  prose-td:text-slate-700 dark:prose-td:text-slate-300 prose-td:border-slate-200 dark:prose-td:border-slate-800`;

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
    <article className="min-h-screen bg-slate-50/70 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 pt-28 pb-24 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-[1fr_290px] lg:gap-12 lg:items-start">
          <div className="min-w-0">
            {/* Breadcrumb Navigation */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 text-sm font-semibold mb-6 transition-colors"
            >
              <ArrowRight
                size={16}
                className={dir === "rtl" ? "" : "rotate-180"}
              />
              {t.blog.title}
            </Link>

            {/* Main Editorial Header */}
            <header className="max-w-3xl mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-block bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">
                  {post.category || "السياحة في تركيا 2027"}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full shadow-2xs">
                  <Sparkles size={13} className="text-amber-500" />
                  محدّث لموسم 2026/2027
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-5 text-slate-900 dark:text-white text-balance">
                {title}
              </h1>

              {excerpt && (
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-5 font-normal">
                  {excerpt}
                </p>
              )}

              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-medium border-t border-b border-slate-200/80 dark:border-slate-800 py-3">
                <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                  <Compass size={14} className="text-emerald-600 dark:text-emerald-400" />
                  {post.author || "لوناليزا للسياحة الفاخرة"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString(
                        locale === "ar"
                          ? "ar-AE"
                          : locale === "tr"
                            ? "tr-TR"
                            : "en-GB",
                        { year: "numeric", month: "long", day: "numeric" }
                      )
                    : "سبتمبر 2026"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  قراءة 8 دقائق
                </span>
              </div>
            </header>

            {/* Cover Photo */}
            {post.coverImage && (
              <div className="relative w-full max-w-3xl aspect-[16/9] rounded-2xl overflow-hidden mb-10 shadow-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SafeImage
                  src={post.coverImage}
                  alt={post.coverAlt || title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Mobile Table of Contents */}
            {toc.length > 0 && (
              <nav
                aria-label={tocTitle}
                className="lg:hidden mb-8 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm"
              >
                <p className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-3">
                  <ListTree size={16} className="text-emerald-600 dark:text-emerald-400" />
                  {tocTitle}
                </p>
                <ul className="space-y-2">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "ps-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Article Content Part 1 */}
            <div className="max-w-3xl">
              {firstEnhanced.html && (
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: firstEnhanced.html }}
                />
              )}

              {/* In-Article Hotel Recommendations */}
              {hotels.length > 0 && (
                <CardSlider
                  className="my-12 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-colors"
                  title={
                    locale === "ar"
                      ? "فنادق ومنتجعات تركيا الموصى بها (حجز فوري)"
                      : "Suggested Turkey Luxury Hotels"
                  }
                >
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="snap-start shrink-0 w-[250px] sm:w-[270px]"
                    >
                      <HotelCard hotel={hotel} compact />
                    </div>
                  ))}
                </CardSlider>
              )}

              {/* In-Article Tour Packages */}
              {packages.length > 0 && (
                <CardSlider
                  className="my-12 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-colors"
                  title={
                    locale === "ar"
                      ? "باقات وبرامج السفر العائلية المتكاملة 2027"
                      : "Featured Turkey Packages"
                  }
                >
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="snap-start shrink-0 w-[250px] sm:w-[270px]"
                    >
                      <PackageCard package_={pkg} compact />
                    </div>
                  ))}
                </CardSlider>
              )}

              {/* In-Article Transfers and Private Drivers */}
              {transfers.length > 0 && (
                <CardSlider
                  className="my-12 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-colors"
                  title={
                    locale === "ar"
                      ? "أسطول سيارات VIP مع سائق خاص وترانسفير المطارات"
                      : "Transfers & Private Cars"
                  }
                >
                  {transfers.map((item) => (
                    <div
                      key={item.id}
                      className="snap-start shrink-0 w-[250px] sm:w-[270px]"
                    >
                      <TransferCard transfer={item} compact />
                    </div>
                  ))}
                </CardSlider>
              )}

              {/* Article Content Part 2 */}
              {secondEnhanced.html && (
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: secondEnhanced.html }}
                />
              )}

              {/* Conversion WhatsApp Banner */}
              <div className="mt-14 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-700 dark:via-teal-800 dark:to-emerald-900 text-white shadow-xl shadow-emerald-700/15 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div>
                  <h2 className="text-xl font-bold mb-1.5 flex items-center gap-2 text-white">
                    <MessageCircle size={22} className="text-emerald-200" />
                    استفسر واحجز رحلتك الخاصة إلى تركيا
                  </h2>
                  <p className="text-emerald-100/90 text-sm leading-relaxed max-w-lg">
                    فريق مستشاري السفر في لوناليزا متواجد على مدار 24 ساعة لتجهيز باقة سياحية عائلية مخصصة تشمل الطيران، الفنادق، والسيارات الخاصة.
                  </p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-emerald-800 font-extrabold rounded-xl transition-all shadow-md shrink-0 active:scale-95"
                >
                  <MessageCircle size={18} />
                  {t.packageDetail.whatsapp}
                </a>
              </div>
            </div>
          </div>

          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:block sticky top-28 space-y-5">
            {/* Table of Contents Box */}
            {toc.length > 0 && (
              <nav
                aria-label={tocTitle}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
              >
                <h2 className="flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <ListTree size={16} className="text-emerald-600 dark:text-emerald-400" />
                  {tocTitle}
                </h2>
                <ul className="space-y-2.5 max-h-[42vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "ps-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium leading-relaxed block transition-colors hover:translate-x-1"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Quick Services Direct Navigation Box */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                خدمات سياحية مباشرة
              </h3>
              <Link
                href="/flights"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold border border-transparent dark:border-slate-700/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Plane size={15} className="text-emerald-600 dark:text-emerald-400" />
                  حجوزات الطيران إلى تركيا
                </span>
                <span>←</span>
              </Link>
              <Link
                href="/hotels"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold border border-transparent dark:border-slate-700/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HotelIcon size={15} className="text-emerald-600 dark:text-emerald-400" />
                  فنادق ومنتجعات 5 نجوم
                </span>
                <span>←</span>
              </Link>
              <Link
                href="/cars"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold border border-transparent dark:border-slate-700/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Car size={15} className="text-emerald-600 dark:text-emerald-400" />
                  تأجير سيارات VIP مع سائق
                </span>
                <span>←</span>
              </Link>
              <Link
                href="/transfers"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold border border-transparent dark:border-slate-700/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={15} className="text-emerald-600 dark:text-emerald-400" />
                  استقبال وتوصيل المطارات
                </span>
                <span>←</span>
              </Link>
            </div>

            {/* Related Articles Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
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
                          <div className="relative w-full h-28 rounded-xl overflow-hidden mb-2 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                            <SafeImage
                              src={related.coverImage}
                              alt={relatedTitle}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {relatedTitle}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
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
            </div>
          </aside>
        </div>

        {/* Mobile Related Posts Grid */}
        {relatedPosts.length > 0 && (
          <section className="lg:hidden mt-14 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">{t.packageDetail.related}</h2>
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
                    className="flex gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500 shadow-sm transition-all"
                  >
                    {related.coverImage && (
                      <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                        <SafeImage
                          src={related.coverImage}
                          alt={relatedTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                        {relatedTitle}
                      </p>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 block">
                        قراءة المقال ←
                      </span>
                    </div>
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
