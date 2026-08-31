"use client";

import { use, useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  ChevronRight,
  Clock,
  Lightbulb,
  MapPin,
  Shield,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import EnquiryModal from "@/components/ui/EnquiryModal";
import {
  enrichPackage,
  getLocalizedItinerary,
  getLocalizedList,
  type EnrichedHolidayPackage,
} from "@/data/package-enrichment";
import { featuredPackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { tContent } from "@/lib/utils";
import { buildBusinessWhatsAppLink } from "@/lib/site-whatsapp";
import type { HolidayPackage } from "@/types/package";

const OsmRouteMap = dynamic(() => import("@/components/maps/OsmRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
  ),
});

interface Props {
  params: Promise<{ slug: string }>;
}

function SectionHeading({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-3 text-xl font-bold leading-snug text-[#0a1628] sm:mb-6 sm:text-2xl">
      {icon && (
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/25">
          {icon}
        </span>
      )}
      {children}
    </h2>
  );
}

export default function PackageDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { locale, dir, t } = useLocale();
  const { formatPrice } = useCurrency();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [rawPkg, setRawPkg] = useState<HolidayPackage | null>(() =>
    featuredPackages.find((p) => p.slug === slug) ?? null
  );
  const [catalog, setCatalog] = useState<HolidayPackage[]>(featuredPackages);
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedPackages().then((packages) => {
      if (cancelled) return;
      setCatalog(packages);
      const found = packages.find((p) => p.slug === slug || p.id === slug);
      setRawPkg(found ?? null);
      setCatalogReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const pkg = useMemo<EnrichedHolidayPackage | null>(() => {
    if (!rawPkg) return null;
    return enrichPackage(rawPkg);
  }, [rawPkg]);

  const related = useMemo(() => {
    if (!pkg) return [];
    return catalog
      .filter(
        (p) =>
          p.slug !== pkg.slug &&
          (p.destination === pkg.destination ||
            p.country === pkg.country ||
            p.countryEn === pkg.countryEn)
      )
      .slice(0, 3);
  }, [pkg, catalog]);

  if (!pkg && !catalogReady) {
    return (
      <section className="pt-28 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 h-80 bg-slate-200 rounded-2xl animate-pulse" />
      </section>
    );
  }

  if (!pkg) {
    notFound();
  }

  const pd = t.packageDetail;
  const title = tContent(pkg, "title", locale);
  const destination = tContent(pkg, "destination", locale);
  const country = tContent(pkg, "country", locale);
  const descriptionHtml = tContent(pkg, "description", locale);
  const nights = Math.max(0, pkg.durationDays - 1);
  const durationLabel = `${pkg.durationDays} ${pd.days} / ${nights} ${pd.nights}`;

  const itinerary = getLocalizedItinerary(pkg, locale);
  const inclusions = getLocalizedList(pkg, "inclusions", locale);
  const exclusions = getLocalizedList(pkg, "exclusions", locale);
  const features = getLocalizedList(pkg, "features", locale);
  const rules = getLocalizedList(pkg, "rules", locale);
  const tips = getLocalizedList(pkg, "tips", locale);
  const reviews = pkg.reviews ?? [];

  const mapPoints = (() => {
    const fromItinerary = itinerary
      .filter((d) => d.lat != null && d.lng != null)
      .map((d) => ({
        lat: d.lat as number,
        lng: d.lng as number,
        label: `${pd.days} ${d.day}: ${d.title}`,
      }));

    if (fromItinerary.length > 0) return fromItinerary;

    return (pkg.mapPoints ?? []).map((p) => ({
      lat: p.lat,
      lng: p.lng,
      label:
        locale === "ar"
          ? p.labelAr
          : locale === "tr"
            ? p.labelTr || p.labelEn
            : p.labelEn,
      description:
        locale === "ar"
          ? p.descriptionAr
          : locale === "tr"
            ? p.descriptionTr || p.descriptionEn
            : p.descriptionEn,
      photo: p.photo,
      day: p.day,
    }));
  })();

  const images =
    pkg.images.length > 0
      ? pkg.images
      : [
          {
            url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
            alt: title,
            width: 1200,
            height: 800,
          },
        ];

  const groupLabel =
    pkg.groupSizeMin && pkg.groupSizeMax
      ? `${pkg.groupSizeMin}–${pkg.groupSizeMax}`
      : "2–12";

  const whatsappMessage =
    locale === "ar"
      ? `مرحباً، أود الاستفسار عن باقة "${title}" إلى ${destination}.`
      : `Hello, I'd like to enquire about the "${title}" package to ${destination}.`;

  return (
    <>
      {/* Agent D: mobile + search tabs — package hero gutters + thumbnail rail */}
      <section className="relative overflow-x-hidden bg-[#0a1628]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-transparent to-[#0a1628]" />

        <div className="relative mx-auto max-w-7xl pt-[4.5rem] lg:px-8 lg:pt-28">
          <div className="px-4 pb-3 pt-3 lg:absolute lg:start-6 lg:top-24 lg:z-20 lg:px-0 lg:pb-0 lg:pt-0">
            <Link
              href="/holidays"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ArrowLeft size={18} className={dir === "rtl" ? "rotate-180" : ""} />
              <span>
                {t.common.back} — {t.nav.holidays}
              </span>
            </Link>
          </div>

          <div className="lg:grid lg:grid-cols-5 lg:gap-0">
            <div className="relative min-w-0 lg:col-span-3">
              <div className="relative aspect-[16/10] w-full overflow-hidden sm:mx-4 sm:rounded-2xl sm:border sm:border-amber-500/20 sm:shadow-2xl lg:mx-0">
                <Image
                  src={images[activeImage]?.url ?? images[0].url}
                  alt={images[activeImage]?.alt ?? title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-transparent" />
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-hide snap-x snap-mandatory touch-pan-x lg:px-0">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`relative h-16 w-24 min-h-11 shrink-0 snap-start overflow-hidden rounded-lg border-2 transition ${
                        activeImage === idx
                          ? "border-amber-500 ring-2 ring-amber-500/30"
                          : "border-white/20 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative z-10 flex min-w-0 flex-col justify-end px-5 py-6 sm:px-6 lg:col-span-2 lg:px-8 lg:py-12">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                  {t.catalog.inTurkey}
                </span>
                {pkg.isFeatured && (
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white">
                    {t.catalog.featured}
                  </span>
                )}
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
                  {country}
                </span>
                {pkg.tripMode === "private_vip" && (
                  <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                    <Car size={12} />
                    {pd.privateVip}
                  </span>
                )}
              </div>

              <h1
                className="mb-4 text-[1.65rem] font-bold leading-snug text-white sm:text-3xl md:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-sora)" }}
              >
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80 sm:gap-5 sm:text-base">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="shrink-0 text-amber-400" />
                  <span>{destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="shrink-0 text-amber-400" />
                  <span>{durationLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={18} className="shrink-0 fill-amber-400 text-amber-400" />
                  <span>
                    {pkg.rating ?? 4.8} ({reviews.length}+)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent D: mobile + search tabs */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-8 pb-28 sm:py-12 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="min-w-0 space-y-8 sm:space-y-12 lg:col-span-2">
              {/* Overview */}
              <div>
                <SectionHeading icon={<MapPin size={18} />}>
                  {pd.overview}
                </SectionHeading>
                {descriptionHtml ? (
                  <div
                    className="prose prose-slate max-w-none text-slate-600 prose-headings:text-[#0a1628] prose-strong:text-[#0a1628] [&_p]:mb-4 [&_p]:leading-7"
                    dir={dir}
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                ) : (
                  <p className="leading-relaxed text-slate-600" dir={dir}>
                    {locale === "ar"
                      ? `استكشف ${destination} مع برنامج ${durationLabel} من الريان للسياحة — إقامة مريحة، جولات منظمة، ودعم عربي طوال الرحلة.`
                      : `Discover ${destination} with Alrayyan Tourism's ${durationLabel} program — comfortable stays, guided tours, and Arabic support throughout.`}
                  </p>
                )}
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div>
                  <SectionHeading icon={<Star size={18} />}>
                    {pd.features}
                  </SectionHeading>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {features.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-amber-500/15 bg-gradient-to-br from-amber-50/80 to-white p-4"
                      >
                        <CheckCircle
                          size={18}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary */}
              <div>
                <SectionHeading icon={<Calendar size={18} />}>
                  {pd.itinerary}
                </SectionHeading>
                <div className="space-y-4">
                  {itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="relative border-s-2 border-amber-300/60 pb-6 ps-8 last:border-s-0 last:pb-0"
                    >
                      <div className="absolute -start-4 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0a1628] to-[#1a3050] text-sm font-bold text-amber-300 ring-2 ring-amber-400/40">
                        {day.day}
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-2 text-lg font-bold text-[#0a1628]">
                          {pd.days} {day.day}: {day.title}
                        </h3>
                        <p className="text-slate-600">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions / Exclusions */}
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <SectionHeading icon={<CheckCircle size={18} />}>
                    {pd.inclusions}
                  </SectionHeading>
                  <ul className="space-y-2">
                    {inclusions.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 rounded-xl bg-emerald-50/80 p-3"
                      >
                        <CheckCircle
                          size={16}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <SectionHeading icon={<XCircle size={18} />}>
                    {pd.exclusions}
                  </SectionHeading>
                  <ul className="space-y-2">
                    {exclusions.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 rounded-xl bg-red-50/60 p-3"
                      >
                        <XCircle
                          size={16}
                          className="mt-0.5 shrink-0 text-red-400"
                        />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Rules */}
              {rules.length > 0 && (
                <div>
                  <SectionHeading icon={<Shield size={18} />}>
                    {pd.rules}
                  </SectionHeading>
                  <ul className="space-y-2 rounded-xl border border-[#0a1628]/10 bg-[#0a1628]/5 p-5">
                    {rules.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-slate-700"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              {tips.length > 0 && (
                <div>
                  <SectionHeading icon={<Lightbulb size={18} />}>
                    {pd.tips}
                  </SectionHeading>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tips.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-amber-200/50 bg-amber-50/50 p-4"
                      >
                        <Lightbulb
                          size={16}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              {mapPoints.length > 0 && (
                <div>
                  <SectionHeading icon={<MapPin size={18} />}>
                    {pd.map}
                  </SectionHeading>
                  <OsmRouteMap points={mapPoints} className="h-[420px]" />
                </div>
              )}

              {/* Reviews */}
              {reviews.length > 0 && (
                <div>
                  <SectionHeading icon={<Star size={18} />}>
                    {pd.reviews}
                  </SectionHeading>
                  <p className="mb-4 text-xs text-slate-400">
                    {t.catalog.sampleReviewsNote}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-semibold text-[#0a1628]">
                            {review.name}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {locale === "ar"
                            ? review.textAr
                            : locale === "tr"
                              ? review.textTr || review.textEn
                              : review.textEn}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          {review.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related */}
              {related.length > 0 && (
                <div>
                  <SectionHeading>{pd.related}</SectionHeading>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/package/${rel.slug}`}
                        className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:border-amber-500/30 hover:shadow-md"
                      >
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={
                              rel.images[0]?.url ??
                              "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400"
                            }
                            alt={tContent(rel, "title", locale)}
                            fill
                            className="object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3">
                          <p className="line-clamp-2 text-sm font-semibold text-[#0a1628]">
                            {tContent(rel, "title", locale)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {tContent(rel, "destination", locale)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky booking card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 overflow-hidden rounded-2xl border border-amber-500/20 bg-white shadow-xl shadow-[#0a1628]/10">
                <div className="bg-gradient-to-r from-[#0a1628] to-[#1a3050] px-6 py-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-300/80">
                    {pd.from}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(pkg.price, pkg.currency || "USD")}
                    </span>
                    <span className="text-white/60">/ {pd.perPerson}</span>
                  </div>
                </div>

                <div className="space-y-3 p-6">
                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-600" />
                      <span>{durationLabel}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-amber-600" />
                      <span>{pd.groupSize}</span>
                    </div>
                    <span className="font-semibold text-[#0a1628]">
                      {groupLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-amber-600" />
                      <span>{t.admin.availability}</span>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      {t.admin.available}
                    </span>
                  </div>

                  {pkg.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
                      {pkg.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                        >
                          {(locale === "ar" || locale === "tr") && pkg.amenitiesAr?.[idx]
                            ? pkg.amenitiesAr[idx]
                            : amenity}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEnquiryOpen(true)}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      {pd.enquire}
                      <ChevronRight
                        size={18}
                        className={dir === "rtl" ? "rotate-180" : ""}
                      />
                    </button>
                    <a
                      href={buildBusinessWhatsAppLink(whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-semibold text-white transition hover:bg-emerald-600"
                    >
                      {pd.whatsapp}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {pd.from}
            </p>
            <p className="truncate text-lg font-bold text-[#0a1628]">
              {formatPrice(pkg.price, pkg.currency || "USD")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEnquiryOpen(true)}
            className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 font-bold text-white"
          >
            {pd.enquire}
          </button>
        </div>
      </div>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        packageName={title}
        destination={destination}
      />
    </>
  );
}
