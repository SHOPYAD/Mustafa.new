"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Car, MapPin, Star } from "lucide-react";
import PackageCard from "@/components/packages/PackageCard";
import HotelCard from "@/components/hotels/HotelCard";
import FeaturedDestinationHotelsSection from "@/components/home/FeaturedDestinationHotelsSection";
import SafeImage from "@/components/ui/SafeImage";
import CardSlider from "@/components/ui/CardSlider";
import HomeSwipeCarousel from "@/components/ui/HomeSwipeCarousel";
import { featuredPackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import type { HolidayPackage } from "@/types/package";
import { getFeaturedHotels } from "@/data/hotels";
import { CAR_RENTAL_OFFERS } from "@/data/car-rental-offers";
import { buildCarsSearchHref } from "@/lib/cars-search-href";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import { resolveBoundImage } from "@/lib/visual-editor/live-bind";
import {
  WORLD_COUNTRY_TABS,
  WORLD_DESTINATIONS,
  type WorldCountryKey,
} from "@/data/world-destinations";
import { cn } from "@/lib/utils";
import {
  BuilderLink,
  EditableText,
  SectionFrame,
  SelectableField,
  brandButtonClass,
  brandButtonStyle,
  preventBuilderNav,
} from "./primitives";
import {
  InteractiveHeading,
  ServiceSurface,
  serviceEyebrowClass,
  serviceTitleClass,
  serviceTitleStyle,
  type ServiceSurfaceKind,
} from "./surfaces";

type SectionProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  selectedId?: string | null;
};

function SectionIntro({
  instance,
  editorMode,
  kind,
  action,
  className,
}: {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  kind: ServiceSurfaceKind;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-col gap-6 overflow-visible pt-1 md:mb-12 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-2xl overflow-visible">
        <EditableText
          instance={instance}
          field="eyebrow"
          editorMode={editorMode}
          as="p"
          className={serviceEyebrowClass()}
        />
        <h2 className={serviceTitleClass(kind)} style={serviceTitleStyle(kind)}>
          <InteractiveHeading>
            <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
          </InteractiveHeading>
        </h2>
        <EditableText
          instance={instance}
          field="subtitle"
          editorMode={editorMode}
          as="p"
          className="mt-3 text-base text-slate-600 md:text-lg"
        />
      </div>
      {action}
    </div>
  );
}

export function DestinationsSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const [selectedCountry, setSelectedCountry] = useState<WorldCountryKey>("turkey");

  const countryCities = useMemo(() => {
    return WORLD_DESTINATIONS[selectedCountry] || WORLD_DESTINATIONS.turkey;
  }, [selectedCountry]);

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="destinations" background={instance.styles.background || undefined}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            instance={instance}
            editorMode={editorMode}
            kind="destinations"
            action={
              <BuilderLink
                href="/holidays"
                editorMode={editorMode}
                instance={instance}
                field="viewAll"
                className={`${brandButtonClass} sc-btn px-5 py-2.5`}
                style={brandButtonStyle()}
              >
                {t.home.viewAllDestinations}
                <ArrowUpRight size={16} />
              </BuilderLink>
            }
          />

          {/* Premier Country Tabs (Scrollable Luxury Tab Bar) */}
          <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide select-none">
            {WORLD_COUNTRY_TABS.map((tab) => {
              const active = selectedCountry === tab.key;
              const countryName =
                locale === "ar"
                  ? tab.nameAr
                  : locale === "tr"
                  ? tab.nameTr
                  : locale === "fr"
                  ? tab.nameFr
                  : tab.nameEn;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCountry(tab.key)}
                  className={cn(
                    "group inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-300 cursor-pointer border",
                    active
                      ? "bg-gradient-to-r from-[#2e1065] via-[#3b1275] to-[#4c1d95] text-amber-300 border-amber-400/40 shadow-lg shadow-purple-950/25 scale-[1.03]"
                      : "bg-white hover:bg-purple-50/50 text-slate-700 hover:text-purple-950 border-purple-100 hover:border-purple-300 shadow-xs"
                  )}
                >
                  <span className="text-base leading-none">{tab.flag}</span>
                  <span>{countryName}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-mono font-bold transition-colors",
                      active
                        ? "bg-amber-400/20 text-amber-200 border border-amber-400/30"
                        : "bg-slate-100 text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-700"
                    )}
                  >
                    {tab.citiesCount}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {countryCities.map((dest) => {
              const cName =
                locale === "ar" ? dest.nameAr : locale === "tr" ? dest.nameTr : locale === "fr" ? dest.nameFr : dest.nameEn;
              const cTagline =
                locale === "ar" ? dest.taglineAr : locale === "tr" ? dest.taglineTr : locale === "fr" ? dest.taglineFr : dest.taglineEn;
              const countryTab = WORLD_COUNTRY_TABS.find((c) => c.key === dest.countryKey);
              const countryLabel =
                locale === "ar"
                  ? countryTab?.nameAr
                  : locale === "tr"
                  ? countryTab?.nameTr
                  : locale === "fr"
                  ? countryTab?.nameFr
                  : countryTab?.nameEn;

              return (
                <BuilderLink
                  key={dest.id}
                  href={dest.href || "/holidays"}
                  editorMode={editorMode}
                  instance={instance}
                  field={`dest-${dest.id}`}
                  className="group relative block h-[340px] sm:h-[360px] overflow-hidden rounded-[1.75rem] border border-white/20 bg-slate-900 shadow-lg transition-all duration-500 hover:shadow-[0_20px_40px_-12px_rgba(46,16,101,0.35)] hover:-translate-y-1.5 hover:border-amber-400/50"
                >
                  <SafeImage
                    src={dest.image}
                    alt={cName}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  {/* High-contrast multi-stop vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent" />

                  {/* Badges row */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-xs font-black text-amber-300 border border-amber-400/30 shadow-md">
                      <MapPin size={12} className="text-amber-400" />
                      <span>{countryLabel}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-purple-200 border border-purple-400/20 shadow-sm">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{dest.rating}</span>
                      <span className="text-[10px] text-purple-300 font-normal">({dest.reviews})</span>
                    </span>
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md" style={{ color: "#ffffff" }}>
                      {cName}
                    </h3>
                    <p className="mt-1 text-xs text-slate-200 font-medium line-clamp-1 leading-relaxed drop-shadow-xs" style={{ color: "#e2e8f0" }}>
                      {cTagline}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-white/20 bg-slate-950/70 backdrop-blur-md p-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{t.common.from}</span>
                        <span className="text-base sm:text-lg font-black text-amber-300 font-mono leading-tight" style={{ color: "#fde047" }}>
                          {formatPrice(dest.startingPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-purple-200 bg-purple-950/80 px-2.5 py-1 rounded-xl border border-purple-400/20">
                          {dest.packagesCount} {t.home.packagesCount}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md group-hover:scale-105 transition-transform">
                          <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </BuilderLink>
              );
            })}
          </div>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

function packageHasImage(pkg: HolidayPackage): boolean {
  return Array.isArray(pkg.images) && pkg.images.some((img) => Boolean(img?.url));
}

function packageDisplayTitle(pkg: HolidayPackage): string {
  return String(pkg.titleAr || pkg.titleEn || pkg.title || "").trim();
}

function isRenderableHomePackage(pkg: HolidayPackage | null | undefined): pkg is HolidayPackage {
  if (!pkg || !pkg.id) return false;
  return Boolean(packageDisplayTitle(pkg) || packageHasImage(pkg) || Number(pkg.price) > 0);
}

function mergeHomePackage(incoming: HolidayPackage, seed?: HolidayPackage): HolidayPackage {
  if (!seed) return incoming;
  return {
    ...seed,
    ...incoming,
    title: incoming.title || seed.title,
    titleAr: incoming.titleAr || seed.titleAr,
    titleEn: incoming.titleEn || seed.titleEn,
    destination: incoming.destination || seed.destination,
    destinationAr: incoming.destinationAr || seed.destinationAr,
    destinationEn: incoming.destinationEn || seed.destinationEn,
    country: incoming.country || seed.country,
    images: packageHasImage(incoming) ? incoming.images : seed.images,
    amenities: incoming.amenities?.length ? incoming.amenities : seed.amenities,
    amenitiesAr: incoming.amenitiesAr?.length ? incoming.amenitiesAr : seed.amenitiesAr,
    price: Number(incoming.price) > 0 ? incoming.price : seed.price,
    durationDays:
      Number(incoming.durationDays) > 0 ? incoming.durationDays : seed.durationDays,
    currency: incoming.currency || seed.currency,
  };
}

function hydrateHomePackages(
  live: HolidayPackage[],
  seeds: HolidayPackage[]
): HolidayPackage[] {
  const seedsByKey = new Map<string, HolidayPackage>();
  for (const seed of seeds) {
    seedsByKey.set(seed.id, seed);
    if (seed.slug) seedsByKey.set(seed.slug, seed);
  }

  const seen = new Set<string>();
  const hydrated: HolidayPackage[] = [];

  for (const raw of live) {
    if (!raw?.id || seen.has(raw.id)) continue;
    const seed = seedsByKey.get(raw.id) || (raw.slug ? seedsByKey.get(raw.slug) : undefined);
    const next = mergeHomePackage(raw, seed);
    if (!isRenderableHomePackage(next)) continue;
    seen.add(next.id);
    hydrated.push(next);
  }

  for (const seed of seeds) {
    if (seen.has(seed.id) || !isRenderableHomePackage(seed)) continue;
    seen.add(seed.id);
    hydrated.push(seed);
  }

  return hydrated
    .sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)))
    .slice(0, 8);
}

export function PackagesSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale, t } = useLocale();
  const [homePackages, setHomePackages] = useState<HolidayPackage[]>(() =>
    hydrateHomePackages(featuredPackages, featuredPackages)
  );
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedPackages()
      .then((list) => {
        if (cancelled) return;
        const next = hydrateHomePackages(
          Array.isArray(list) && list.length ? list : featuredPackages,
          featuredPackages
        );
        setHomePackages(next);
        setLoadError(next.length === 0);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = hydrateHomePackages(featuredPackages, featuredPackages);
        setHomePackages(fallback);
        setLoadError(fallback.length === 0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="tours" background={instance.styles.background || undefined}>
        <div className="mx-auto min-w-0 max-w-7xl px-4 pt-1 sm:px-6 lg:px-8">
          <SectionIntro
            instance={instance}
            editorMode={editorMode}
            kind="tours"
            action={
              <BuilderLink
                href="/holidays"
                editorMode={editorMode}
                instance={instance}
                field="viewAll"
                className={`${brandButtonClass} sc-btn px-5 py-2.5`}
                style={brandButtonStyle()}
              >
                {t.common.viewAll}
                <ArrowUpRight size={15} />
              </BuilderLink>
            }
          />
          {homePackages.length ? (
            <CardSlider title="" tone="light">
              {homePackages.map((pkg) => (
                <SelectableField
                  key={pkg.id}
                  instance={instance}
                  field={`package-${pkg.id}`}
                  editorMode={editorMode}
                  className="w-[min(16.25rem,calc(100%-2.75rem))] max-w-full shrink-0 snap-start sm:w-[270px]"
                >
                  <div
                    onClickCapture={(e) => preventBuilderNav(editorMode, e)}
                    className="min-w-0 w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <PackageCard package_={pkg} compact />
                  </div>
                </SelectableField>
              ))}
            </CardSlider>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">
              {loadError
                ? locale === "ar"
                  ? "تعذر تحميل البرامج الآن. جرّب مرة أخرى من صفحة العطلات."
                  : "Packages could not be loaded. Open holidays to browse the catalog."
                : locale === "ar"
                  ? "لا توجد برامج منشورة للعرض حالياً."
                  : "No published holiday programs are available right now."}
            </div>
          )}
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

export function HotelsSection({ instance, editorMode, selectedId }: SectionProps) {
  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <FeaturedDestinationHotelsSection />
    </SectionFrame>
  );
}

export function CarsSection({ instance, editorMode, selectedId }: SectionProps) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="cars" background={instance.styles.background || undefined}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeSwipeCarousel
            arrowTone="navy"
            header={
              <SectionIntro
                instance={instance}
                editorMode={editorMode}
                kind="cars"
                className="mb-0 md:mb-0"
              />
            }
            headerAction={
              <BuilderLink
                href="/cars"
                editorMode={editorMode}
                instance={instance}
                field="viewAll"
                className={`${brandButtonClass} sc-btn px-5 py-2.5`}
                style={brandButtonStyle()}
              >
                {t.common.viewAll}
                <ArrowUpRight size={15} />
              </BuilderLink>
            }
          >
            {CAR_RENTAL_OFFERS.slice(0, 4).map((offer) => {
              const title = tContent(offer, "title", locale);
              const city = tContent(offer, "city", locale);
              const tagline = tContent(offer, "tagline", locale);
              return (
                <BuilderLink
                  key={offer.id}
                  href={buildCarsSearchHref({ iata: offer.iata, locale })}
                  editorMode={editorMode}
                  instance={instance}
                  field={`car-${offer.id}`}
                  className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl bg-[#eef1f6]"
                >
                  <div className="relative h-36 bg-[#dfe4ed]">
                    <SafeImage
                      src={offer.image}
                      alt={title}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-md bg-[#1e1b4b] px-2 py-1 text-[10px] font-black tracking-wider text-amber-300">
                      <Car size={11} />
                      {offer.iata}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{city}</p>
                    <h3 className="mt-1 text-base font-black text-[#1e1b4b]">{title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-slate-600">{tagline}</p>
                    <div className="mt-4 flex items-end justify-between gap-2">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.common.from}</span>
                        <span className="font-mono text-lg font-black text-[#2e1065]">{formatPrice(offer.priceFromUsd)}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#1e1b4b] px-3 py-1.5 text-xs font-bold text-white">
                        <span>{t.common.bookNow || "حجز"}</span>
                        <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </div>
                </BuilderLink>
              );
            })}
          </HomeSwipeCarousel>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}
