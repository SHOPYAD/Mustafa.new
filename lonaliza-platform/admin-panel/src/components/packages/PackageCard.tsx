"use client";

import Link from "next/link";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { HolidayPackage } from "@/types/package";
import { cn, tContent } from "@/lib/utils";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import SafeImage from "@/components/ui/SafeImage";
import { ShareToCommunityButton } from "@/components/community/ShareToCommunityButton";

interface PackageCardProps {
  package_: HolidayPackage;
  className?: string;
  compact?: boolean;
}

export default function PackageCard({
  package_,
  className,
  compact = false,
}: PackageCardProps) {
  const { formatPrice } = useCurrency();
  const { locale, t } = useLocale();
  const title =
    tContent(package_, "title", locale) ||
    package_.title ||
    package_.titleAr ||
    package_.titleEn ||
    (t.home as any)?.holidayPackages ||
    t.nav?.holidays ||
    "Holiday package";
  const destination =
    tContent(package_, "destination", locale) ||
    package_.destination ||
    package_.destinationAr ||
    package_.destinationEn ||
    "";
  const country =
    tContent(package_, "country", locale) ||
    package_.country ||
    package_.countryAr ||
    package_.countryEn ||
    "";
  const images = Array.isArray(package_.images) ? package_.images : [];
  const cover = images.find((img) => img?.url)?.url;
  const amenities = Array.isArray(
    (locale === "ar" || locale === "tr") && package_.amenitiesAr?.length
      ? package_.amenitiesAr
      : package_.amenities
  )
    ? (locale === "ar" || locale === "tr") && package_.amenitiesAr?.length
      ? package_.amenitiesAr
      : package_.amenities
    : [];
  const price = Number(package_.price) > 0 ? Number(package_.price) : 0;
  const durationDays = Number(package_.durationDays) > 0 ? Number(package_.durationDays) : null;

  return (
    <Link
      href={`/package/${package_.slug}`}
      data-keep-color="true"
      className={cn(
        "lonaliza-package-card group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl",
        compact && "rounded-xl shadow-md hover:-translate-y-1",
        className
      )}
    >
      <div className={cn("sc-card-image relative overflow-hidden bg-slate-200", compact ? "h-40" : "h-56")}>
        <SafeImage
          src={
            cover ||
            "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800"
          }
          alt={images[0]?.alt || title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/25" />

        <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
          <div className="rounded-full bg-[var(--brand-primary)] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
            {t.catalog.inTurkey}
          </div>
          {package_.isFeatured && (
            <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
              {t.catalog.featured}
            </div>
          )}
        </div>

        {durationDays ? (
        <div className="absolute top-3 end-3 flex items-center gap-1 rounded-full border border-white/80 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm">
          <Clock size={11} />
          {durationDays} {t.common.days}
        </div>
        ) : null}

        <div className="absolute bottom-3 end-3">
          <div
            className={cn(
              "rounded-xl border border-white/90 bg-white shadow-lg",
              compact ? "px-3 py-1.5" : "px-4 py-2"
            )}
          >
            <span className="lonaliza-package-meta block text-[10px] text-slate-500">{t.common.from}</span>
            <span
              className={cn(
                "lonaliza-package-price sc-card-price font-bold text-[#2e1065]",
                compact ? "text-base" : "text-xl"
              )}
            >
              {price > 0
                ? formatPrice(price, package_.currency || "USD")
                : t.common.viewDetails}
            </span>
          </div>
        </div>
      </div>

      <div className={cn("bg-white", compact ? "p-3.5" : "p-5")}>
        {(destination || country) ? (
        <div className="lonaliza-package-meta mb-2 flex items-center gap-1 text-sm text-slate-600">
          <MapPin size={14} className="text-[var(--brand-primary)]" />
          <span className="truncate">
            {[destination, country].filter(Boolean).join(", ")}
          </span>
        </div>
        ) : null}

        <h3
          className={cn(
            "lonaliza-package-title sc-card-title mb-2 line-clamp-2 font-bold text-[#1e1b4b] transition-colors group-hover:text-[var(--brand-primary)]",
            compact ? "text-base" : "mb-3 text-lg"
          )}
        >
          {title}
        </h3>

        {package_.rating && (
          <div className="mb-2 flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="lonaliza-package-meta text-sm font-semibold text-slate-700">
              {package_.rating}
            </span>
          </div>
        )}

        {!compact && (
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md border border-transparent dark:border-slate-700/50"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <div
          className={cn(
            "flex items-center justify-between border-t border-slate-100",
            compact ? "pt-2.5" : "pt-4"
          )}
        >
          <span className="lonaliza-package-meta text-sm text-slate-600">{t.common.viewDetails}</span>
          <div className="flex items-center gap-2">
            <ShareToCommunityButton
              service={{
                id: package_.id,
                type: "package",
                typeLabel: "برنامج سياحي متكامل",
                title,
                destination: `${destination}، ${country}`,
                price: package_.price,
                currency: package_.currency || "USD",
                imageUrl: package_.images[0]?.url,
                url: `/package/${package_.slug}`,
              }}
              variant="icon"
            />
            <div className="w-8 h-8 rounded-full bg-[var(--brand-secondary)] flex items-center justify-center group-hover:bg-[var(--brand-primary)] transition-colors">
              <ArrowRight
                size={16}
                className="text-[var(--brand-primary)] group-hover:text-white transition-colors rtl:rotate-180"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
