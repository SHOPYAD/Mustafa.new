"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import SearchWidget from "@/components/search/SearchWidget";
import SafeImage from "@/components/ui/SafeImage";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useBranding } from "@/components/branding/BrandingProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import { useCurrency } from "@/components/ui/CurrencySelector";
import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import {
  EditableText,
  SectionFrame,
  SelectableField,
  sectionAccent,
  sectionSurface,
} from "./primitives";
import { parseSearchAppearance } from "./search-appearance";
import { HeroPackageRail } from "./HeroPackages";
import { resolveBoundImage } from "@/lib/visual-editor/live-bind";
import { buildOverlayCss, parseOverlaySettings } from "@/lib/visual-editor/overlay-style";

type SectionProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  selectedId?: string | null;
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920";

export function HeroSection({ instance, editorMode, selectedId }: SectionProps) {
  const homepage = useHomepageContent();
  const branding = useBranding();
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo(() => {
    const fromSettings = typeof instance.settings.image === "string" ? instance.settings.image : "";
    if (fromSettings) {
      return [{ id: "custom", image: fromSettings, name: "", tagline: "", price: 0, href: "/holidays" }];
    }
    if (branding.hero.slides.length) {
      return branding.hero.slides.map((slide) => ({
        id: slide.id,
        image: slide.image,
        name: tContent(slide, "name", locale),
        tagline: tContent(slide, "tagline", locale),
        price: slide.price,
        href: slide.ctaHref || "/holidays",
      }));
    }
    return homepage.heroSlides.map((slide) => ({
      id: slide.id,
      image: slide.image,
      name: tContent(slide, "name", locale),
      tagline: tContent(slide, "tagline", locale),
      price: slide.price,
      href: slide.ctaHref || "/holidays",
    }));
  }, [branding.hero.slides, homepage.heroSlides, instance.settings.image, locale]);

  useEffect(() => {
    if (paused || editorMode || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [editorMode, paused, slides.length]);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [active, slides.length]);

  const current = slides[active] || slides[0];
  const navy = sectionSurface(instance, "var(--brand-header)");
  const accent = sectionAccent(instance);
  const showSearch = instance.settings.showSearch !== false;
  const appearance = parseSearchAppearance(instance.settings, instance.texts, locale);
  const minHeight =
    typeof instance.settings.heroMinHeight === "string" && instance.settings.heroMinHeight.trim()
      ? instance.settings.heroMinHeight.trim()
      : undefined;
  const heroImage = resolveBoundImage(instance, "image", current?.image || FALLBACK_HERO);
  const overlay = parseOverlaySettings(instance.settings, instance.styles.overlay);
  const overlayColor =
    typeof instance.settings.overlayColor === "string" && instance.settings.overlayColor.trim()
      ? overlay.color
      : navy.startsWith("#") || navy.startsWith("rgb")
        ? navy
        : overlay.color;
  const overlayCss =
    instance.styles.overlay || buildOverlayCss({ ...overlay, color: overlayColor });

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <section
        className="relative flex min-h-[480px] flex-col overflow-hidden md:min-h-[520px] lg:min-h-[550px]"
        style={minHeight ? { minHeight } : undefined}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: index === active ? 1 : 0 }}
            >
              <SafeImage
                src={
                  index === active
                    ? heroImage
                    : resolveBoundImage(instance, "image", slide.image || FALLBACK_HERO)
                }
                alt={slide.name || ""}
                fill
                priority={index === 0}
                className="object-cover"
                builderId={`${instance.instanceId}.image`}
                builderField="image"
                builderInstanceId={instance.instanceId}
              />
            </div>
          ))}
          <div
            className="absolute inset-0"
            data-builder-id={`${instance.instanceId}.overlay`}
            data-field="overlay"
            data-builder-field="overlay"
            data-instance-id={instance.instanceId}
            style={{
              background: overlayCss,
              backgroundSize: overlay.image ? "cover" : undefined,
              backgroundPosition: overlay.image ? "center" : undefined,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pb-3 pt-20 sm:px-6 sm:pt-24 lg:px-8 lg:pb-4 lg:pt-24">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl flex-1 text-start">
              <EditableText
                instance={instance}
                field="eyebrow"
                editorMode={editorMode}
                as="p"
                className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--brand-primary)] sm:text-xs"
              />
              <EditableText
                instance={instance}
                field="title"
                editorMode={editorMode}
                as="h1"
                className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
              />
              <EditableText
                instance={instance}
                field="subtitle"
                editorMode={editorMode}
                as="p"
                className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
              />

              {current?.name ? (
                <SelectableField
                  instance={instance}
                  field={`slide-${current.id}`}
                  editorMode={editorMode}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs text-white/90 backdrop-blur-md"
                >
                  <MapPin size={12} className="text-[var(--brand-primary)]" />
                  <span className="font-semibold">{current.name}</span>
                  {current.tagline ? <span className="text-white/55">· {current.tagline}</span> : null}
                  {current.price ? (
                    <span className="text-[var(--brand-primary)]">
                      {t.common.from} {formatPrice(current.price)}
                    </span>
                  ) : null}
                </SelectableField>
              ) : null}

              {slides.length > 1 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      data-builder-field={`hero.slide.${slide.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(index);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                      style={
                        index === active
                          ? { backgroundColor: accent, borderColor: accent, color: "#ffffff" }
                          : {
                              backgroundColor: "rgba(255,255,255,0.08)",
                              borderColor: "rgba(255,255,255,0.18)",
                              color: "#fff",
                            }
                      }
                    >
                      {slide.name || `${index + 1}`}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Corridor: bottom-aligned with content row directly above search widget */}
            <div
              className={
                editorMode
                  ? "ms-auto w-full shrink-0 lg:w-auto"
                  : "alrayyan-hero-cards-corridor w-full shrink-0 max-lg:hidden lg:flex lg:w-[21rem] lg:max-w-[21rem] lg:h-[18.5rem] lg:self-end"
              }
            >
              <div className="flex h-full w-full">
                <HeroPackageRail instance={instance} editorMode={editorMode} />
              </div>
            </div>
          </div>

          {showSearch ? (
            <div id="home-search" className="relative z-20 mt-4 w-full">
              <Suspense
                fallback={<div className="h-[200px] w-full animate-pulse rounded-2xl bg-white/10" />}
              >
                <SearchWidget
                  builderMode={editorMode}
                  appearance={appearance}
                  variant="hero"
                  sectionInstanceId={instance.instanceId}
                />
              </Suspense>
            </div>
          ) : null}
        </div>
      </section>
    </SectionFrame>
  );
}

export function SearchSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale } = useLocale();
  const appearance = parseSearchAppearance(instance.settings, instance.texts, locale);

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <section
        className="relative py-10"
        style={{ background: instance.styles.background || "transparent" }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 text-center text-[var(--brand-accent)]">
            <EditableText
              instance={instance}
              field="title"
              editorMode={editorMode}
              as="h2"
              className="text-2xl font-bold sm:text-3xl"
              fallback="Search"
            />
            <EditableText
              instance={instance}
              field="subtitle"
              editorMode={editorMode}
              as="p"
              className="mt-2 text-sm opacity-70 sm:text-base"
            />
          </div>
          <Suspense fallback={<div className="h-[200px] w-full animate-pulse rounded-2xl bg-white" />}>
            <SearchWidget
              builderMode={editorMode}
              appearance={appearance}
              sectionInstanceId={instance.instanceId}
            />
          </Suspense>
        </div>
      </section>
    </SectionFrame>
  );
}
