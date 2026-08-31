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
  const accent = sectionAccent(instance);

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
              className="mt-4 text-slate-600"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {homepage.features.map((f, index) => {
              const Icon = ICON_MAP[f.icon] || Sparkles;
              return (
                <SelectableField
                  key={f.id}
                  instance={instance}
                  field={`feature-${f.id}`}
                  editorMode={editorMode}
                  className="relative rounded-[var(--radius-card)] border border-slate-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(5,23,65,0.35)]"
                >
                  <span className="absolute top-4 end-4 text-xs font-bold text-[var(--brand-accent)]/20">
                    0{index + 1}
                  </span>
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: accent || "var(--brand-button)" }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-[var(--brand-accent)]">{tContent(f, "title", locale)}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    {tContent(f, "description", locale)}
                  </p>
                </SelectableField>
              );
            })}
          </div>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!seen) return;
    let start = 0;
    const duration = 1400;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      start = Math.floor(eased * value);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [seen, value]);

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
      <ServiceSurface kind="neutral" background={instance.styles.background || undefined}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
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
          </div>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = STAT_ICONS[index] || Users;
              return (
                <SelectableField
                  key={stat.field}
                  instance={instance}
                  field={stat.field}
                  editorMode={editorMode}
                  className="rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--brand-accent)_8%,transparent)] bg-white p-6 text-center shadow-[0_14px_32px_-24px_rgba(5,23,65,0.3)]"
                >
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-secondary)] text-[var(--brand-primary)]">
                    <Icon size={20} />
                  </div>
                  <p className="text-3xl font-bold text-[var(--brand-accent)] md:text-4xl">
                    <AnimatedNumber value={stat.value} />
                    <span className="text-[var(--brand-primary)]">+</span>
                  </p>
                  <EditableText
                    instance={instance}
                    field={stat.field}
                    editorMode={editorMode}
                    as="p"
                    className="mt-2 text-sm text-slate-600"
                    fallback={locale}
                  />
                </SelectableField>
              );
            })}
          </div>
        </div>
      </ServiceSurface>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
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
              className="text-emerald-600 text-[11px] font-semibold tracking-[0.28em] uppercase mb-3"
            />
            <EditableText
              instance={instance}
              field="title"
              editorMode={editorMode}
              as="h2"
              className="text-3xl md:text-4xl font-bold text-[#051741]"
            />
            <EditableText
              instance={instance}
              field="subtitle"
              editorMode={editorMode}
              as="p"
              className="mt-4 text-slate-600"
            />
            <SelectableField
              instance={instance}
              field={`quote-${quote.id}`}
              editorMode={editorMode}
              className="mt-8 rounded-2xl bg-white border border-slate-100 p-6 shadow-sm"
            >
              <Quote size={28} className="text-emerald-500/30 mb-3" />
              <div className="flex gap-1 mb-3">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg text-[#051741] leading-relaxed">
                “{pickCopy(quote.text, locale)}”
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full">
                  <SafeImage src={quote.image} alt={quote.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#051741]">{quote.name}</p>
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
      </section>
    </SectionFrame>
  );
}

export function BlogSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale, t } = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    void fetchPublishedPosts().then((posts) => setPosts(posts.slice(0, 3)));
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
                className="text-emerald-600 text-[11px] font-semibold tracking-[0.28em] uppercase mb-3"
              />
              <EditableText
                instance={instance}
                field="title"
                editorMode={editorMode}
                as="h2"
                className="text-3xl md:text-4xl font-bold text-[#051741]"
              />
              <EditableText
                instance={instance}
                field="subtitle"
                editorMode={editorMode}
                as="p"
                className="mt-3 text-slate-600 max-w-xl"
              />
            </div>
            <BuilderLink
              href="/blog"
              editorMode={editorMode}
              instance={instance}
              field="viewAll"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {t.home.viewAllArticles}
            </BuilderLink>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {featured ? (
              <BuilderLink
                href={`/blog/${featured.slug}`}
                editorMode={editorMode}
                instance={instance}
                field={`post-${featured.id}`}
                className="group lg:col-span-7 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50"
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    {featured.category}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[#051741] line-clamp-2">
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
                  className="group flex gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
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
                    <p className="text-[11px] font-semibold uppercase text-emerald-600">{post.category}</p>
                    <h3 className="mt-1 font-bold text-[#051741] line-clamp-2">
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
                "linear-gradient(105deg, rgba(5,23,65,0.92) 0%, rgba(5,23,65,0.78) 46%, rgba(8,47,73,0.55) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div className="max-w-xl text-white">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">
              <Mail size={13} />
              <EditableText instance={instance} field="eyebrow" editorMode={editorMode} as="span" />
            </p>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              <InteractiveHeading>
                <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
              </InteractiveHeading>
            </h2>
            <EditableText
              instance={instance}
              field="subtitle"
              editorMode={editorMode}
              as="p"
              className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg"
            />
          </div>

          <form
            className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 shadow-[0_24px_60px_-28px_rgba(5,23,65,0.7)] backdrop-blur-md sm:p-5"
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
                className="flex-1 rounded-[var(--radius-input)] border border-white/20 bg-white px-5 py-3.5 text-[var(--brand-accent)] placeholder:text-slate-400 focus:border-[var(--brand-primary)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                data-builder-field="newsletter.button"
                onClick={(e) => preventBuilderNav(editorMode, e)}
                className={`${brandButtonClass} px-6 py-3.5 disabled:opacity-60`}
                style={brandButtonStyle()}
              >
                <EditableText instance={instance} field="button" editorMode={editorMode} as="span" />
              </button>
            </div>
            {statusCopy ? (
              <p
                className={`mt-3 text-sm ${status === "ok" ? "text-emerald-200" : "text-rose-200"}`}
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
