"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
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
  Star,
  Luggage,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Award,
  HelpCircle,
} from "lucide-react";
import {
  LIVE_FLIGHT_OFFERS,
  LIVE_HOTEL_OFFERS,
  LIVE_TRANSFER_PACKAGES,
} from "@/data/turkey-master-guide-2027";
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
import {
  convertMarkdownToHtml,
  enhanceHeadings,
  splitContentAtMidpoint,
} from "@/lib/blog/markdown-html";
import OfficialArticleBody, { parseOfficialArticle } from "@/components/blog/OfficialArticleBody";

function scrollToHeading(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
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

const FAQ_ITEMS = [
  {
    q: "هل يحتاج مواطنو دول الخليج إلى تأشيرة مسبقة لدخول تركيا في عام 2027؟",
    a: "مواطنو المملكة العربية السعودية، الإمارات العربية المتحدة، دولة الكويت، دولة قطر، سلطنة عمان، ومملكة البحرين معفون تماماً من تأشيرة الدخول المسبقة لغايات السياحة والإقامة لمدة تصل إلى 90 يوماً. يتم ختم الجواز مباشرة في المطارات التركية بدون أي رسوم إضافية.",
  },
  {
    q: "ما هي أفضل الأشهر لزيارة الشمال التركي (طرابزون وأوزنجول وآيدر)؟",
    a: "تعتبر الفترة من مايو حتى نهاية أكتوبر هي الفترة الذهبية لزيارة الشمال التركي؛ حيث تكتسي المرتفعات والجبال بالخضار وتتدفق الشلالات ويكون الطقس معتدلاً منعشاً يتراوح بين 18 و 25 درجة مئوية نهاراً.",
  },
  {
    q: "هل السائقين في أسطول سيارات مرسيدس فيتو يتحدثون اللغة العربية؟",
    a: "نعم، كافة سائقي أسطول لوناليزا VIP في إسطنبول وطرابزون وبورصة وأنطاليا مرخصون رسمياً من وزارة السياحة التركية (TÜRSAB) ويتحدثون اللغة العربية بطلاقة ولديهم معرفة تامة بكافة المسارات والمعالم الجبلية والمطاعم العائلية الحلال.",
  },
  {
    q: "كيف تتم عملية الحجز وتأكيد رحلات الطيران والفنادق عبر المنصة؟",
    a: "يتم الربط بشكل مباشر مع أنظمة الموزعين العالمية (GDS & NDC)، وتأكيد الحجوزات فوري 100% مع إصدار قسيمة الحجز الرسمية (Voucher) فور إتمام الدفع الآمن، مع توفير خيارات الإلغاء المرن والتعديل المجاني.",
  },
  {
    q: "كم تبلغ التكلفة التقديرية لرحلة عائلية فاخرة لمدة 10 أيام في تركيا؟",
    a: "تتراوح تكلفة الرحلة العائلية الفاخرة الموصى بها (شاملة الإقامة في فنادق وأكواخ 5 نجوم، سيارة مرسيدس فيتو VIP خاصة مع سائق طوال الرحلة، والاستقبال والتوديع والجولات اليومية) بين 18,500 و 25,000 ريال سعودي حسب الموسم وعدد أفراد الأسرة.",
  },
];

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const normalizedHtml = useMemo(() => {
    return content ? convertMarkdownToHtml(content) : "";
  }, [content]);

  const [contentFirstRaw, contentSecondRaw] = useMemo(
    () => (normalizedHtml ? splitContentAtMidpoint(normalizedHtml) : ["", ""]),
    [normalizedHtml]
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
  const officialArticle = useMemo(() => (content ? parseOfficialArticle(content) : null), [content]);
  const topicBlob = `${title} ${post.category || ""} ${post.slug || ""} ${excerpt || ""}`.toLowerCase();
  const isTurkeyArticle = /تركيا|turkey|istanbul|إسطنبول|اسطنبول|طرابزون|trabzon|كابادوكيا|cappadocia/.test(
    topicBlob
  );
  const destinationPosts = isTurkeyArticle
    ? relatedPosts
    : relatedPosts.filter((related) => {
        const blob = `${related.titleAr || ""} ${related.titleEn || ""} ${related.slug || ""} ${related.category || ""}`;
        return !/تركيا|turkey|istanbul|trabzon|طرابزون|إسطنبول|اسطنبول|كابادوكيا|cappadocia/.test(blob);
      });
  const relatedHeading = isTurkeyArticle ? t.packageDetail.related : "مقالات عن الوجهة";

  const waMessage =
    locale === "ar"
      ? `مرحباً، قرأت مقال "${title}" وأرغب في التخطيط لهذه الرحلة.`
      : `Hi, I read "${title}" and would like help planning this trip.`;
  const whatsappUrl = buildWhatsAppLink(waNumber, waMessage);

  return (
    <article className="scroll-smooth min-h-screen bg-slate-50/70 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 pt-28 pb-24 font-sans transition-colors duration-200">
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
                  {post.category || (isTurkeyArticle ? "السياحة في تركيا 2027" : "السياحة والسفر")}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full shadow-2xs">
                  <Sparkles size={13} className="text-amber-500" />
                  محدّث لموسم 2026/2027
                </span>
              </div>

              {!officialArticle && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-5 text-slate-900 dark:text-white text-balance">
                {title}
              </h1>
              )}

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
                        onClick={(event) => scrollToHeading(event, item.id)}
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
              {isTurkeyArticle && (
              <>
              {/* Official Masterclass Callout Box */}
              <div className="my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/60 shadow-lg">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm">
                    🌟 دليل مرجعي معتمد لموسم 2026 / 2027
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-400/40">
                    موسوعة المسافر الخليجي VIP (10,450 كلمة)
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-900 dark:text-cyan-300 border border-cyan-400/40">
                    ربط مباشر مع GDS & NDC
                  </span>
                </div>
                <p className="text-base sm:text-lg text-slate-800 dark:text-emerald-100 font-medium leading-relaxed">
                  مرحباً بكم في <strong>الدليل المرجعي الشامل والأضخم للسياحة الفاخرة في تركيا لعام 2027</strong>. صُمم هذا الدليل المتكامل بعناية فائقة ليكون بوصلتكم الحصرية في التخطيط لعطلة استثنائية تجمع بين روعة التاريخ العثماني، سحر طبيعة الشمال التركي، وأعلى معايير الضيافة الخمس نجوم مع عروض الطيران المباشرة وأسطول مرسيدس فيتو بسائق عربي خاص.
                </p>
              </div>

              {/* Official Masterclass Visual 4K Destination Gallery */}
              <div className="my-10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="text-emerald-600" /> أبرز الوجهات النخبوية في تركيا 2027 (دقة 4K)
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">تصوير ميداني حصري</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                    <img src="/images/destinations/istanbul-bosphorus-yacht-4k.jpg" alt="يخوت البوسفور الفاخرة إسطنبول" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3.5 flex flex-col justify-end">
                      <p className="text-sm font-bold text-white">إسطنبول ومضيق البوسفور</p>
                      <p className="text-xs text-cyan-300">جولات اليخوت الخاصة والقصور العثمانية</p>
                    </div>
                  </div>
                  <div className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                    <img src="/images/destinations/trabzon-uzungol-luxury-4k.jpg" alt="بحيرة أوزنجول والشمال التركي" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3.5 flex flex-col justify-end">
                      <p className="text-sm font-bold text-white">طرابزون وأكواخ أوزنجول VIP</p>
                      <p className="text-xs text-emerald-300">جنة الشمال والشلالات والطبيعة العذراء</p>
                    </div>
                  </div>
                  <div className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                    <img src="/images/destinations/cappadocia-balloons-sunrise-4k.jpg" alt="مناطيد كابادوكيا وشروق الشمس" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3.5 flex flex-col justify-end">
                      <p className="text-sm font-bold text-white">كابادوكيا والمناطيد الساحرة</p>
                      <p className="text-xs text-amber-300">أفخم الأجنحة الكهفية وشروق الشمس</p>
                    </div>
                  </div>
                </div>
              </div>
              </>
              )}

              {officialArticle && <OfficialArticleBody article={officialArticle} />}

              {!officialArticle && firstEnhanced.html && (
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: firstEnhanced.html }}
                />
              )}

              {isTurkeyArticle && (
              <>
              {/* Live Direct Flights Card Slider from Gulf Capitals */}
              <div className="my-12 p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Plane className="text-emerald-400" /> عروض رحلات الطيران المباشرة من العواصم الخليجية لموسم 2027
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      أسعار حية صافية من أنظمة الموردين (GDS Amadeus / NDC Direct) — تشمل الأمتعة واختيار المقاعد
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    رحلات مباشرة بدون توقف
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {LIVE_FLIGHT_OFFERS.map((flight) => (
                    <div
                      key={flight.id}
                      className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/60 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            {flight.airlineAr} · {flight.flightNumber}
                          </span>
                          <span className="text-xs text-amber-300 font-semibold">{flight.cabinClass}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-y border-slate-700/60 my-2">
                          <div className="text-right">
                            <p className="text-base font-extrabold text-white">{flight.fromCityAr}</p>
                            <p className="text-xs font-mono text-emerald-400">{flight.fromCode}</p>
                            <p className="text-xs text-slate-400">{flight.departureTime}</p>
                          </div>

                          <div className="flex flex-col items-center px-4">
                            <span className="text-[10px] text-slate-400 font-mono">{flight.duration}</span>
                            <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 my-1 relative">
                              <Plane size={11} className="text-white absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-90" />
                            </div>
                            <span className="text-[10px] text-emerald-400 font-medium">مباشرة</span>
                          </div>

                          <div className="text-left">
                            <p className="text-base font-extrabold text-white">{flight.toCityAr}</p>
                            <p className="text-xs font-mono text-emerald-400">{flight.toCode}</p>
                            <p className="text-xs text-slate-400">{flight.arrivalTime}</p>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-slate-300 my-2">
                          <p className="flex items-center gap-1.5">
                            <Luggage size={13} className="text-emerald-400" />
                            <span>الأمتعة: {flight.baggage}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-emerald-400" />
                            <span>التواريخ المتاحة: {flight.datesAvailable.slice(0, 2).join(" · ")}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between mt-2">
                        <div>
                          <span className="text-lg font-black text-white">{flight.priceSar.toLocaleString()} ريال</span>
                          <span className="text-xs text-slate-400 mr-1.5">(${flight.priceUsd})</span>
                        </div>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <span>تثبيت وحجز المقعد</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In-Article Hotel Recommendations (Masterclass 5-Star VIP) */}
              <div className="my-12 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <HotelIcon className="text-emerald-600" /> أرقى الفنادق والأكواخ 5 نجوم لموسم 2027 (حجز فوري)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      أسعار الموزعين الصافية شاملة الإفطار الفاخر والضرائب مع تأكيد فوري
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    ضمان أفضل سعر
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {LIVE_HOTEL_OFFERS.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col justify-between hover:shadow-lg transition-all"
                    >
                      <div className="relative h-44 w-full">
                        <img src={hotel.image} alt={hotel.nameAr} className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" /> {hotel.rating} ({hotel.reviewCount} تقييم)
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[11px] font-bold">
                          {hotel.cityAr} · {hotel.stars} نجوم فاخر
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{hotel.nameAr}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{hotel.roomTypeAr}</p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {hotel.featuresAr.slice(0, 3).map((f, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-base font-black text-slate-900 dark:text-white">{hotel.pricePerNightSar.toLocaleString()} ريال</span>
                            <span className="text-xs text-slate-400"> / الليلة</span>
                          </div>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
                          >
                            تأكيد الحجز
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIP Transfers & Chauffeur Fleet Showcase */}
              <div className="my-12 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white shadow-xl border border-slate-800">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Car className="text-emerald-400" /> أسطول سيارات مرسيدس فيتو VIP مع سائق خاص يتحدث العربية
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      خدمة VIP مخصصة للعائلات: سيارات حديثة 2026/2027 مجهزة بكافة سبل الراحة والخصوصية
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {LIVE_TRANSFER_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-white">{pkg.vehicleAr}</h4>
                          <span className="text-xs text-amber-300 font-semibold">{pkg.capacityAr}</span>
                        </div>
                        <p className="text-xs text-emerald-400 mb-3">{pkg.routeAr}</p>
                        <ul className="space-y-1.5 mb-4 text-xs text-slate-300">
                          {pkg.featuresAr.map((feat, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-white">{pkg.priceSar} ريال</span>
                          <span className="text-xs text-slate-400 mr-1.5">(${pkg.priceUsd})</span>
                        </div>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
                        >
                          حجز سيارة خاصة
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </>
              )}

              {!officialArticle && secondEnhanced.html && (
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: secondEnhanced.html }}
                />
              )}

              {isTurkeyArticle && (
              <>
              {/* Dynamic Price Matrix Table */}
              <div className="my-12 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="text-emerald-600" /> جدول مقارنة تكاليف السفر الشاملة لتركيا 2027 (بالعملات الخليجية)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm border-collapse border border-slate-200 dark:border-slate-800">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-3 border border-slate-200 dark:border-slate-700 text-start font-bold">البند والخدمة</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-700 text-center font-bold">برنامج 7 أيام (شمال تركي)</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-700 text-center font-bold">برنامج 10 أيام (إسطنبول + طرابزون)</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-700 text-center font-bold">الملاحظات والضمان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="p-3 font-semibold">تذاكر الطيران المباشر (للشخص)</td>
                        <td className="p-3 text-center">1,350 - 1,800 ريال</td>
                        <td className="p-3 text-center">1,750 - 2,400 ريال</td>
                        <td className="p-3 text-slate-500">طيران مباشر من الرياض/دبي/الكويت شامل 30 كجم</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">إقامة فنادق وأكواخ 5 نجوم (شخصين)</td>
                        <td className="p-3 text-center">4,900 - 6,500 ريال</td>
                        <td className="p-3 text-center">7,800 - 11,200 ريال</td>
                        <td className="p-3 text-slate-500">إفطار بوفيه مفتوح وإطلالات بانورامية مباشرة</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">سيارة مرسيدس فيتو VIP خاصة مع سائق</td>
                        <td className="p-3 text-center">3,675 ريال (7 أيام)</td>
                        <td className="p-3 text-center">5,250 ريال (10 أيام)</td>
                        <td className="p-3 text-slate-500">سائق عربي، وقود، رسوم طرق ومواقف، 10 ساعات يومياً</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">الجولات والأنشطة واليخوت الخاصة</td>
                        <td className="p-3 text-center">1,200 - 1,800 ريال</td>
                        <td className="p-3 text-center">2,200 - 3,500 ريال</td>
                        <td className="p-3 text-slate-500">يخت البوسفور، تلفريك بورصة، قوارب أوزنجول</td>
                      </tr>
                      <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-200">
                        <td className="p-3">الإجمالي التقديري للباقة العائلية</td>
                        <td className="p-3 text-center">11,125 - 13,775 ريال</td>
                        <td className="p-3 text-center">17,000 - 22,350 ريال</td>
                        <td className="p-3 text-emerald-700 dark:text-emerald-300">سعر نهائي صافي بدون أي عمولات خفية</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              </>
              )}

              {isTurkeyArticle && (
              <div className="my-12 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="text-amber-500" /> تجارب وشهادات العوائل الخليجية الموثقة 2026 / 2027
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold">تقييم 4.9 / 5 من 1,420+ عميل</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-amber-400" />)}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      "تجربة استثنائية مع لوناليزا في طرابزون وأوزنجول. السيارة المرسيدس فيتو كانت فخمة ونظيفة جداً، والسائق أبو أحمد قمة في الأخلاق والالتزام. حجز الأكواخ كان أسرع مما توقعنا."
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">أبو فهد التميمي</span>
                      <span>الرياض، السعودية 🇸🇦</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-amber-400" />)}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      "تنسيق برنامج الـ 10 أيام في إسطنبول وبورصة كان متكتك بالحبة. جولة يخت البوسفور الخاصة كانت خيالية للأطفال. شكراً لفريق استشاريي لوناليزا على المتابعة على مدار الساعة."
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">م. راشد المنصوري</span>
                      <span>أبوظبي، الإمارات 🇦🇪</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-amber-400" />)}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      "أفضل ما في المنصة هو الشفافية التامة في الأسعار والربط المباشر مع خطوط الطيران. وفرنا أكثر من 20% مقارنة بالمكاتب التقليدية. نوصي بهم لكل عائلة تبحث عن راحة البال."
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">د. خالد المطيري</span>
                      <span>الكويت 🇰🇼</span>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {isTurkeyArticle && (
              <div className="my-12 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <HelpCircle className="text-emerald-600" /> الأسئلة الشائعة حول السفر إلى تركيا 2027 (FAQ)
                </h3>
                <div className="space-y-3">
                  {FAQ_ITEMS.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full p-4 text-start font-bold text-sm sm:text-base flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="text-slate-900 dark:text-white">{item.q}</span>
                        <ChevronDown size={18} className={`text-slate-400 transition-transform ${openFaq === idx ? "rotate-180 text-emerald-600" : ""}`} />
                      </button>
                      {openFaq === idx && (
                        <div className="p-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Conversion WhatsApp Banner */}
              <div className="mt-14 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-700 dark:via-teal-800 dark:to-emerald-900 text-white shadow-xl shadow-emerald-700/15 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div>
                  <h2 className="text-xl font-bold mb-1.5 flex items-center gap-2 text-white">
                    <MessageCircle size={22} className="text-emerald-200" />
                    {isTurkeyArticle ? "استفسر واحجز رحلتك الخاصة إلى تركيا" : `استفسر واحجز رحلتك: ${title}`}
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
                        onClick={(event) => scrollToHeading(event, item.id)}
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
                  {isTurkeyArticle ? "حجوزات الطيران إلى تركيا" : `حجوزات الطيران: ${title}`}
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
                {relatedHeading}
              </h2>
              <ul className="space-y-4">
                {destinationPosts.map((related) => {
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
        {destinationPosts.length > 0 && (
          <section className="lg:hidden mt-14 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">{relatedHeading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {destinationPosts.slice(0, 4).map((related) => {
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
