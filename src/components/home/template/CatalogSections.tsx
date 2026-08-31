"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Car, MapPin, Star } from "lucide-react";
import PackageCard from "@/components/packages/PackageCard";
import HotelCard from "@/components/hotels/HotelCard";
import SafeImage from "@/components/ui/SafeImage";
import CardSlider from "@/components/ui/CardSlider";
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
}: {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  kind: ServiceSurfaceKind;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:mb-12 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
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
  const homepage = useHomepageContent();
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const destinations = homepage.destinations;
  const featured = destinations[0];
  const rest = destinations.slice(1, 7);

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {featured ? (
              <BuilderLink
                href={featured.href || "/holidays"}
                editorMode={editorMode}
                instance={instance}
                field={`dest-${featured.id}`}
                className="sc-card group relative lg:col-span-6 min-h-[420px] overflow-hidden rounded-[1.75rem] shadow-2xl"
              >
                <SafeImage
                  src={resolveBoundImage(instance, `dest-${featured.id}`, featured.image)}
                  alt={tContent(featured, "name", locale)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  builderId={`${instance.instanceId}.dest-${featured.id}`}
                  builderField={`dest-${featured.id}`}
                  builderInstanceId={instance.instanceId}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-header)] via-[color-mix(in_srgb,var(--brand-header)_35%,transparent)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs text-[var(--brand-primary)] flex items-center gap-1">
                    <MapPin size={12} />
                    {tContent(featured, "country", locale)}
                  </p>
                  <h3 className="sc-card-title text-3xl font-bold mt-1">{tContent(featured, "name", locale)}</h3>
                  <p className="sc-card-desc text-white/70 mt-2 max-w-md">{tContent(featured, "tagline", locale)}</p>
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-3">
                    <span className="text-sm font-semibold">
                      {t.common.from} {formatPrice(featured.startingPrice)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-[var(--brand-primary)]">
                      <Star size={13} className="fill-[var(--brand-primary)] text-[var(--brand-primary)]" />
                      {featured.rating} · {featured.packages} {t.home.packagesCount}
                    </span>
                  </div>
                </div>
              </BuilderLink>
            ) : null}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {rest.map((dest) => {
                const name = tContent(dest, "name", locale);
                return (
                  <BuilderLink
                    key={dest.id}
                    href={dest.href || "/holidays"}
                    editorMode={editorMode}
                    instance={instance}
                    field={`dest-${dest.id}`}
                    className="sc-card group relative block h-[200px] overflow-hidden rounded-2xl border border-white/10"
                  >
                    <SafeImage
                      src={resolveBoundImage(instance, `dest-${dest.id}`, dest.image)}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      builderId={`${instance.instanceId}.dest-${dest.id}`}
                      builderField={`dest-${dest.id}`}
                      builderInstanceId={instance.instanceId}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-header)]/95 via-[color-mix(in_srgb,var(--brand-header)_30%,transparent)] to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="text-[11px] text-white/60">{tContent(dest, "country", locale)}</p>
                      <h3 className="sc-card-title text-lg font-bold">{name}</h3>
                      <p className="sc-card-price mt-1 text-xs text-[var(--brand-primary)]">
                        {t.common.from} {formatPrice(dest.startingPrice)}
                      </p>
                    </div>
                  </BuilderLink>
                );
              })}
            </div>
          </div>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

export function PackagesSection({ instance, editorMode, selectedId }: SectionProps) {
  const { t } = useLocale();
  const [homePackages, setHomePackages] = useState<HolidayPackage[]>(featuredPackages);

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedPackages().then((list) => {
      if (!cancelled && list.length) setHomePackages(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="tours" background={instance.styles.background || undefined}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          <CardSlider title="">
            {homePackages.slice(0, 8).map((pkg) => (
              <SelectableField
                key={pkg.id}
                instance={instance}
                field={`package-${pkg.id}`}
                editorMode={editorMode}
                className="snap-start shrink-0 w-[240px] sm:w-[270px]"
              >
                <div
                  onClickCapture={(e) => preventBuilderNav(editorMode, e)}
                  className="sc-card rounded-2xl ring-1 ring-[#051741]/8 shadow-[0_16px_40px_-28px_rgba(5,23,65,0.45)]"
                >
                  <PackageCard package_={pkg} compact />
                </div>
              </SelectableField>
            ))}
          </CardSlider>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

export function HotelsSection({ instance, editorMode, selectedId }: SectionProps) {
  const { t } = useLocale();
  const hotels = useMemo(() => getFeaturedHotels().slice(0, 10), []);
  if (!hotels.length) {
    return (
      <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
        <ServiceSurface kind="hotels" className="py-16">
          <div />
        </ServiceSurface>
      </SectionFrame>
    );
  }

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="hotels" background={instance.styles.background || undefined}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            instance={instance}
            editorMode={editorMode}
            kind="hotels"
            action={
              <BuilderLink
                href="/hotels"
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
          <CardSlider title="">
            {hotels.map((hotel) => (
              <SelectableField
                key={hotel.id}
                instance={instance}
                field={`hotel-${hotel.id}`}
                editorMode={editorMode}
                className="snap-start shrink-0 w-[240px] sm:w-[270px]"
              >
                <div
                  onClickCapture={(e) => preventBuilderNav(editorMode, e)}
                  className="sc-card rounded-2xl ring-1 ring-slate-100 shadow-[0_14px_36px_-24px_rgba(5,23,65,0.4)]"
                >
                  <HotelCard hotel={hotel} compact />
                </div>
              </SelectableField>
            ))}
          </CardSlider>
        </div>
      </ServiceSurface>
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
          <SectionIntro
            instance={instance}
            editorMode={editorMode}
            kind="cars"
            action={
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
          />
          <div className="sc-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  className="sc-card group overflow-hidden rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--brand-accent)_10%,transparent)] bg-white shadow-[0_16px_40px_-28px_rgba(5,23,65,0.35)] transition hover:-translate-y-1"
                >
                  <div className="sc-card-image relative h-44">
                    <SafeImage
                      src={offer.image}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-header)]/70 to-transparent" />
                    <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--brand-accent)]">
                      <Car size={12} />
                      {offer.iata}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-[var(--brand-primary)]">{city}</p>
                    <h3 className="sc-card-title mt-1 font-bold text-[var(--brand-accent)]">{title}</h3>
                    <p className="sc-card-desc mt-1 line-clamp-2 text-sm text-slate-500">{tagline}</p>
                    <p className="sc-card-price mt-3 text-sm font-semibold text-[var(--brand-accent)]">
                      {t.common.from} {formatPrice(offer.priceFromUsd)}
                    </p>
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
