"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Globe,
  Headphones,
  Mail,
  Plane,
  Quote,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import HomeSwipeCarousel from "@/components/ui/HomeSwipeCarousel";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import { fetchPublishedPosts } from "@/data/blog";
import type { BlogPost } from "@/types/blog";
import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import { pickCopy } from "@/lib/visual-editor/schema";
import { resolveBoundImage } from "@/lib/visual-editor/live-bind";
import {
  BuilderLink,
  EditableText,
  SectionFrame,
  SelectableField,
  brandButtonClass,
  brandButtonStyle,
  preventBuilderNav,
  sectionAccent,
} from "./primitives";
import {
  InteractiveHeading,
  ServiceSurface,
  serviceEyebrowClass,
  serviceTitleClass,
  serviceTitleStyle,
} from "./surfaces";

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield,
  headphones: Headphones,
  zap: Zap,
  award: Award,
  sparkles: Sparkles,
  star: Star,
};

type SectionProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  selectedId?: string | null;
};

export function WhyUsSection({ instance, editorMode, selectedId }: SectionProps) {
  const homepage = useHomepageContent();
  const { locale } = useLocale();

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="neutral">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <EditableText
              instance={instance}
              field="eyebrow"
              editorMode={editorMode}
              as="p"
              className={serviceEyebrowClass()}
            />
            <h2 className={serviceTitleClass("neutral")} style={serviceTitleStyle("neutral")}>
              <InteractiveHeading>
                <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
              </InteractiveHeading>
            </h2>
            <EditableText
              instance={instance}
              field="subtitle"
              editorMode={editorMode}
              as="p"
              className="mt-4 text-slate-600 font-medium leading-relaxed"
            />
          </div>
          <HomeSwipeCarousel>
            {homepage.features.map((f, index) => {
              const Icon = ICON_MAP[f.icon] || Sparkles;
              return (
                <SelectableField
                  key={f.id}
                  instance={instance}
                  field={`feature-${f.id}`}
                  editorMode={editorMode}
                  className="relative flex h-full min-h-[11.5rem] flex-col rounded-2xl border border-purple-100/80 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(46,16,101,0.25)] hover:border-purple-300 group"
                >
                  <span className="absolute top-4 end-4 text-xs font-mono font-black text-purple-900/30">
                    0{index + 1}
                  </span>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2e1065] to-[#4c1d95] text-amber-300 shadow-md shadow-purple-950/20 ring-1 ring-amber-400/30 group-hover:scale-105 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">{tContent(f, "title", locale)}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
                    {tContent(f, "description", locale)}
                  </p>
                </SelectableField>
              );
            })}
          </HomeSwipeCarousel>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1200;
          const started = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - started) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setDisplay(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, value]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

const STAT_ICONS = [Users, Globe, Plane, Award];

export function StatsSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale } = useLocale();
  const stats = useMemo(
    () => [
      { field: "travelersLabel", value: Number(instance.settings.travelers) || 1500 },
      { field: "destinationsLabel", value: Number(instance.settings.destinations) || 80 },
      { field: "packagesLabel", value: Number(instance.settings.packages) || 350 },
      { field: "yearsLabel", value: Number(instance.settings.years) || 12 },
    ],
    [instance.settings]
  );

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-[#120324] via-[#240a4a] to-[#3b1275] text-white">
        {/* Radiant Golden Wave & Ambient Glow Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-400/15 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-600/25 blur-[120px]" />
          <svg
            className="absolute inset-0 h-full w-full opacity-20"
            viewBox="0 0 1440 400"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,218.7C672,235,768,213,864,181.3C960,149,1056,107,1152,106.7C1248,107,1344,149,1392,170.7L1440,192L1440,400L1392,400C1344,400,1248,400,1152,400C1056,400,960,400,864,400C768,400,672,400,576,400C480,400,384,400,288,400C192,400,96,400,48,400L0,400Z"
              fill="url(#gold-wave-gradient)"
            />
            <defs>
              <linearGradient id="gold-wave-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-14 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300 shadow-sm backdrop-blur-sm">
              <EditableText
                instance={instance}
                field="eyebrow"
                editorMode={editorMode}
                as="span"
              />
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              <InteractiveHeading>
                <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
              </InteractiveHeading>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = STAT_ICONS[index] || Users;
              return (
                <SelectableField
                  key={stat.field}
                  instance={instance}
                  field={stat.field}
                  editorMode={editorMode}
                  className="group relative overflow-hidden rounded-2xl border border-amber-400/20 bg-white/10 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:bg-white/[0.14] hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.25)]"
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <Icon size={26} strokeWidth={2.5} />
                  </div>
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)]">
                    <AnimatedNumber value={stat.value} />
                    <span className="text-amber-400 font-bold ml-1">+</span>
                  </p>
                  <EditableText
                    instance={instance}
                    field={stat.field}
                    editorMode={editorMode}
                    as="p"
                    className="mt-3 text-sm sm:text-base font-bold text-slate-200 tracking-wide"
                    fallback={locale}
                  />
                </SelectableField>
              );
            })}
          </div>
        </div>
      </section>
    </SectionFrame>
  );
}

const GUEST_STORIES = [
  {
    id: "s1",
    name: "سارة",
    role: { ar: "مدونة سفر", en: "Travel blogger", tr: "Seyahat yazarı" },
    text: {
      ar: "رتّبوا إسطنبول وكابادوكيا بدقة — سيارة خاصة ومنطاد عند الفجر.",
      en: "They arranged Istanbul and Cappadocia precisely — private car and a dawn balloon.",
      tr: "İstanbul ve Kapadokya’yı titizlikle ayarladılar — özel araç ve şafak balonu.",
    },
    city: { ar: "الرياض", en: "Riyadh", tr: "Riyad" },
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    trip: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
  },
  {
    id: "s2",
    name: "James",
    role: { ar: "رحلة عمل", en: "Business traveler", tr: "İş seyahati" },
    text: {
      ar: "الترانسفير والجولة اليومية كانا في الموعد تماماً.",
      en: "The transfer and day tour were exactly on time.",
      tr: "Transfer ve günlük tur tam zamanındaydı.",
    },
    city: { ar: "دبي", en: "Dubai", tr: "Dubai" },
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    trip: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1200",
  },
  {
    id: "s3",
    name: "Emma",
    role: { ar: "سفر عائلي", en: "Family traveler", tr: "Aile seyahati" },
    text: {
      ar: "سبانجا وآيدر كانت سهلة للأطفال — كبائن هادئة وترانسفير مريح.",
      en: "Sapanca and Ayder were easy with kids — quiet cabins and a comfortable transfer.",
      tr: "Sapanca ve Ayder çocuklarla kolaydı — sakin kabinler ve rahat transfer.",
    },
    city: { ar: "الكويت", en: "Kuwait", tr: "Kuveyt" },
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    trip: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
  },
];

export function TestimonialsSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale } = useLocale();
  const [index, setIndex] = useState(0);
  const quote = GUEST_STORIES[index] || GUEST_STORIES[0];

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <section className="py-16 md:py-24 bg-[#f4f7fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-3xl text-center lg:hidden">
            <EditableText
              instance={instance}
              field="eyebrow"
              editorMode={editorMode}
              as="p"
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-purple-700"
            />
            <EditableText
              instance={instance}
              field="title"
              editorMode={editorMode}
              as="h2"
              className="text-3xl font-black text-slate-900"
            />
            <EditableText
              instance={instance}
              field="subtitle"
              editorMode={editorMode}
              as="p"
              className="mt-3 font-medium text-slate-600"
            />
          </div>

          <div className="lg:hidden">
            <HomeSwipeCarousel desktopClassName="" itemClassName="w-[min(86vw,22rem)]">
              {GUEST_STORIES.map((story) => (
                <SelectableField
                  key={story.id}
                  instance={instance}
                  field={`quote-${story.id}`}
                  editorMode={editorMode}
                  className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-purple-100 bg-white shadow-md"
                >
                  <div className="relative h-44 overflow-hidden">
                    <SafeImage src={story.trip} alt="" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051741]/75 to-transparent" />
                    <p className="absolute bottom-3 start-3 text-sm font-semibold text-white">
                      {pickCopy(story.city, locale)}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <Quote size={22} className="mb-2 text-amber-400/40" />
                    <div className="mb-2 flex gap-1">
                      {[0, 1, 2, 3, 4].map((star) => (
                        <Star key={star} size={12} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="line-clamp-4 text-sm font-medium leading-relaxed text-slate-900">
                      “{pickCopy(story.text, locale)}”
                    </p>
                    <footer className="mt-4 flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-amber-400/40">
                        <SafeImage src={story.image} alt={story.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{story.name}</p>
                        <p className="text-xs text-slate-500">
                          {pickCopy(story.role, locale)} · {pickCopy(story.city, locale)}
                        </p>
                      </div>
                    </footer>
                  </div>
                </SelectableField>
              ))}
            </HomeSwipeCarousel>
          </div>

          <div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-10">
          <SelectableField
            instance={instance}
            field={`quote-image-${quote.id}`}
            editorMode={editorMode}
            className="relative h-[420px] rounded-[1.75rem] overflow-hidden shadow-xl"
          >
            <SafeImage src={quote.trip} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051741]/75 to-transparent" />
            <p className="absolute bottom-5 start-5 text-white font-semibold">
              {pickCopy(quote.city, locale)}
            </p>
          </SelectableField>
          <div>
            <EditableText
              instance={instance}
              field="eyebrow"
              editorMode={editorMode}
              as="p"
              className="text-purple-700 text-[11px] font-bold tracking-[0.28em] uppercase mb-3"
            />
            <EditableText
              instance={instance}
              field="title"
              editorMode={editorMode}
              as="h2"
              className="text-3xl md:text-4xl font-black text-slate-900"
            />
            <EditableText
              instance={instance}
              field="subtitle"
              editorMode={editorMode}
              as="p"
              className="mt-4 text-slate-600 font-medium"
            />
            <SelectableField
              instance={instance}
              field={`quote-${quote.id}`}
              editorMode={editorMode}
              className="mt-8 rounded-2xl bg-white border border-purple-100 p-6 shadow-md shadow-purple-950/5"
            >
              <Quote size={28} className="text-amber-400/40 mb-3" />
              <div className="flex gap-1 mb-3">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg text-slate-900 font-medium leading-relaxed">
                “{pickCopy(quote.text, locale)}”
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-amber-400/40">
                  <SafeImage src={quote.image} alt={quote.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{quote.name}</p>
                  <p className="text-xs text-slate-500">
                    {pickCopy(quote.role, locale)} · {pickCopy(quote.city, locale)}
                  </p>
                </div>
              </footer>
            </SelectableField>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                data-builder-field="testimonials.prev"
                onClick={() => setIndex((prev) => (prev - 1 + GUEST_STORIES.length) % GUEST_STORIES.length)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#051741]"
              >
                <ChevronLeft size={16} className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                data-builder-field="testimonials.next"
                onClick={() => setIndex((prev) => (prev + 1) % GUEST_STORIES.length)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#051741]"
              >
                <ChevronRight size={16} className="rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
        </div>
      </section>
    </SectionFrame>
  );
}

export function BlogSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale, t } = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    void fetchPublishedPosts().then((posts) => setPosts(posts.slice(0, 8)));
  }, []);

  const featured = posts[0];
  const side = posts.slice(1, 3);

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <EditableText
                instance={instance}
                field="eyebrow"
                editorMode={editorMode}
                as="p"
                className="text-purple-700 text-xs font-bold tracking-[0.25em] uppercase mb-3"
              />
              <EditableText
                instance={instance}
                field="title"
                editorMode={editorMode}
                as="h2"
                className="text-3xl md:text-4xl font-black text-slate-900"
              />
              <EditableText
                instance={instance}
                field="subtitle"
                editorMode={editorMode}
                as="p"
                className="mt-3 text-slate-600 font-medium max-w-xl"
              />
            </div>
            <BuilderLink
              href="/blog"
              editorMode={editorMode}
              instance={instance}
              field="viewAll"
              className="text-sm font-bold text-purple-700 hover:text-purple-900"
            >
              {t.home.viewAllArticles}
            </BuilderLink>
          </div>
          <div className="lg:hidden">
            <HomeSwipeCarousel desktopClassName="" itemClassName="w-[min(84vw,20rem)]">
              {posts.map((post) => (
                <BuilderLink
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  editorMode={editorMode}
                  instance={instance}
                  field={`post-${post.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50"
                >
                  <div className="relative h-40">
                    <SafeImage
                      src={post.coverImage || ""}
                      alt={tContent(post, "title", locale)}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-purple-700">
                      {post.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-base font-black text-slate-900">
                      {tContent(post, "title", locale)}
                    </h3>
                  </div>
                </BuilderLink>
              ))}
            </HomeSwipeCarousel>
          </div>

          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
            {featured ? (
              <BuilderLink
                href={`/blog/${featured.slug}`}
                editorMode={editorMode}
                instance={instance}
                field={`post-${featured.id}`}
                className="group lg:col-span-7 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50 hover:shadow-xl transition-shadow"
              >
                <div className="relative h-72">
                  <SafeImage
                    src={featured.coverImage || ""}
                    alt={tContent(featured, "title", locale)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-purple-700">
                    {featured.category}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                    {tContent(featured, "title", locale)}
                  </h3>
                </div>
              </BuilderLink>
            ) : null}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {side.map((post) => (
                <BuilderLink
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  editorMode={editorMode}
                  instance={instance}
                  field={`post-${post.id}`}
                  className="group flex gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50 hover:shadow-md transition-shadow"
                >
                  <div className="relative h-32 w-36 shrink-0">
                    <SafeImage
                      src={post.coverImage || ""}
                      alt={tContent(post, "title", locale)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="py-4 pe-4">
                    <p className="text-[11px] font-bold uppercase text-purple-700">{post.category}</p>
                    <h3 className="mt-1 font-bold text-slate-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                      {tContent(post, "title", locale)}
                    </h3>
                  </div>
                </BuilderLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SectionFrame>
  );
}

const NEWSLETTER_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920";

export function NewsletterSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale, t } = useLocale();
  const placeholder = pickCopy(instance.texts.placeholder, locale) || t.home.emailPlaceholder;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const settingImage =
    typeof instance.settings.image === "string" ? instance.settings.image.trim() : "";
  const bg = resolveBoundImage(instance, "image", settingImage || NEWSLETTER_FALLBACK_IMAGE);
  const statusCopy =
    status === "ok"
      ? locale === "ar"
        ? "تم الاشتراك — سنرسل العروض إلى بريدك."
        : locale === "tr"
          ? "Kayıt tamam — fırsatlar e-postanıza gelecek."
          : "You’re in — offers will land in your inbox."
      : status === "err"
        ? locale === "ar"
          ? "تعذّر الاشتراك. تحقّق من البريد وحاول مرة أخرى."
          : locale === "tr"
            ? "Kayıt başarısız. E-postayı kontrol edip tekrar deneyin."
            : "Could not subscribe. Check the email and try again."
        : "";

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <section
        className="relative overflow-hidden"
        style={{ background: instance.styles.background || "var(--brand-header)" }}
      >
        <div className="absolute inset-0">
          <SafeImage
            src={bg}
            alt=""
            fill
            className="object-cover"
            builderId={`${instance.instanceId}.image`}
            builderField="image"
            builderInstanceId={instance.instanceId}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                instance.styles.overlay ||
                "linear-gradient(105deg, rgba(24,5,46,0.95) 0%, rgba(46,16,101,0.85) 46%, rgba(76,29,149,0.7) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div className="max-w-xl text-white">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300 backdrop-blur-sm">
              <Mail size={13} />
              <EditableText instance={instance} field="eyebrow" editorMode={editorMode} as="span" />
            </p>
            <h2 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl text-white">
              <InteractiveHeading>
                <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
              </InteractiveHeading>
            </h2>
            <EditableText
              instance={instance}
              field="subtitle"
              editorMode={editorMode}
              as="p"
              className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg"
            />
          </div>

          <form
            className="rounded-3xl border border-amber-400/20 bg-white/10 p-5 shadow-[0_24px_60px_-28px_rgba(24,5,46,0.8)] backdrop-blur-md sm:p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (editorMode) return;
              const next = email.trim();
              if (!next) return;
              setStatus("loading");
              void fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: next }),
              })
                .then((res) => setStatus(res.ok ? "ok" : "err"))
                .catch(() => setStatus("err"));
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder={placeholder}
                required={!editorMode}
                autoComplete="email"
                data-builder-field="newsletter.email"
                className="flex-1 rounded-[var(--radius-input)] border border-white/20 bg-white px-5 py-3.5 text-slate-900 font-semibold placeholder:text-slate-400 focus:border-amber-400 focus:outline-none shadow-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                data-builder-field="newsletter.button"
                onClick={(e) => preventBuilderNav(editorMode, e)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-7 py-3.5 rounded-[var(--radius-button)] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-60"
              >
                <EditableText instance={instance} field="button" editorMode={editorMode} as="span" />
              </button>
            </div>
            {statusCopy ? (
              <p
                className={`mt-3 text-sm font-bold ${status === "ok" ? "text-amber-300" : "text-rose-300"}`}
                role="status"
              >
                {statusCopy}
              </p>
            ) : (
              <p className="mt-3 text-xs text-white/55">
                {locale === "ar"
                  ? "بدون إزعاج — عروض موسمية وصفقات قصيرة فقط."
                  : locale === "tr"
                    ? "Rahatsız etmeden — yalnızca mevsim notları ve kısa fırsatlar."
                    : "No noise — seasonal notes and short-lived deals only."}
              </p>
            )}
          </form>
        </div>
      </section>
    </SectionFrame>
  );
}

export { ContactSection as CtaSection } from "./ExtraSections";
