"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useBuilderMode } from "@/hooks/useBuilderMode";
import type { CustomPage, CustomPageSection } from "@/types/custom-page";

type CustomPageViewProps = {
  slug: string;
};

function pick(
  locale: string,
  ar?: string,
  en?: string,
  tr?: string
): string {
  if (locale === "ar") return ar || en || tr || "";
  if (locale === "tr") return tr || en || ar || "";
  return en || ar || tr || "";
}

function sectionWidth(hint?: CustomPage["layoutHints"]): string {
  switch (hint?.maxWidth) {
    case "narrow":
      return "max-w-2xl";
    case "wide":
      return "max-w-6xl";
    case "default":
    default:
      return "max-w-3xl";
  }
}

function RenderSection({
  section,
  locale,
  builder,
}: {
  section: CustomPageSection;
  locale: string;
  builder: boolean;
}) {
  if (section.hidden && !builder) return null;

  const title = pick(locale, section.titleAr, section.titleEn, section.titleTr);
  const body = pick(locale, section.bodyAr, section.bodyEn, section.bodyTr);
  const cta = pick(locale, section.ctaLabelAr, section.ctaLabelEn, section.ctaLabelTr);
  const style: CSSProperties = {
    background: section.background || undefined,
    color: section.textColor || undefined,
  };

  const inner = (() => {
    switch (section.type) {
      case "heading":
        return (
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-sora)" }}>
            {title}
          </h2>
        );
      case "text":
        return (
          <div className="space-y-3">
            {title ? <h3 className="text-xl font-semibold">{title}</h3> : null}
            {body ? (
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : null}
          </div>
        );
      case "image":
        return (
          <figure className="space-y-2">
            {section.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={section.image} alt={title} className="w-full rounded-2xl object-cover" />
            ) : null}
            {title ? <figcaption className="text-sm text-slate-500">{title}</figcaption> : null}
          </figure>
        );
      case "cta":
        return (
          <div className="rounded-2xl border border-slate-200 px-6 py-8 text-center">
            {title ? <h3 className="text-xl font-bold mb-2">{title}</h3> : null}
            {body ? <p className="text-slate-600 mb-4">{body}</p> : null}
            {cta ? (
              <a
                href={section.ctaHref || "#"}
                className="inline-flex rounded-xl px-5 py-2.5 text-white font-semibold"
                style={{ background: section.accent || "var(--alrayyan-emerald, #10b981)" }}
              >
                {cta}
              </a>
            ) : null}
          </div>
        );
      case "html":
        return (
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        );
      default: {
        const _never: never = section.type;
        return _never;
      }
    }
  })();

  return (
    <section
      data-builder-section={section.id}
      className={section.hidden && builder ? "opacity-40" : undefined}
      style={style}
    >
      {inner}
    </section>
  );
}

export function CustomPageView({ slug }: CustomPageViewProps) {
  const { locale, t } = useLocale();
  const builder = useBuilderMode();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const qs = builder ? "?builder=1" : "";
        const res = await fetch(`/api/pages/${encodeURIComponent(slug)}${qs}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        if (data?.ok && data.page) {
          setPage(data.page as CustomPage);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const type = event.data?.type;
      if (type === "customPageUpdate" && event.data.page) {
        setPage(event.data.page as CustomPage);
        return;
      }
      if (type === "builderRefresh" || type === "themeUpdate") {
        void load();
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
    };
  }, [slug, builder]);

  useEffect(() => {
    if (!page) return;
    const title =
      locale === "ar"
        ? page.seoTitle || page.titleAr || page.titleEn
        : page.seoTitle || page.titleEn || page.titleAr;
    if (title) document.title = title;
    const desc = page.seoDescription;
    if (desc) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", desc);
    }
  }, [page, locale]);

  const widthClass = useMemo(() => sectionWidth(page?.layoutHints), [page?.layoutHints]);
  const align =
    page?.layoutHints?.heroAlign === "center" ? "text-center mx-auto" : "";
  const navy = page?.theme?.navy || "var(--alrayyan-navy, #051741)";
  const bg = page?.theme?.background || undefined;
  const text = page?.theme?.text || undefined;

  if (loading) {
    return (
      <section className="pt-28 pb-20 min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </section>
    );
  }

  if (notFound || !page) {
    return (
      <section className="pt-28 pb-20 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{t.pages.notFound}</h1>
          <p className="text-slate-500">{t.pages.notFoundHint}</p>
        </div>
      </section>
    );
  }

  const title = pick(locale, page.titleAr, page.titleEn, page.titleTr);
  const body = locale === "ar" ? page.bodyAr || page.bodyEn : page.bodyEn || page.bodyAr;
  const sections = page.sections || [];
  const showHero = page.layoutHints?.showHero !== false;

  return (
    <article
      className="pt-28 pb-20 min-h-screen"
      style={{
        background: bg || "#f8fafc",
        color: text,
        ["--alrayyan-navy" as string]: navy,
      }}
    >
      <div className={`${widthClass} mx-auto px-4 sm:px-6 lg:px-8 space-y-10 ${align}`}>
        {showHero ? (
          <h1
            className="text-3xl md:text-4xl font-bold text-slate-900"
            style={{ fontFamily: "var(--font-sora)", color: text || undefined }}
          >
            {title}
          </h1>
        ) : null}
        {sections.length > 0 ? (
          sections
            .filter((section) => builder || !section.hidden)
            .map((section) => (
            <RenderSection
              key={section.id}
              section={section}
              locale={locale}
              builder={builder}
            />
          ))
        ) : (
          <div
            className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-emerald-600"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}
      </div>
    </article>
  );
}
