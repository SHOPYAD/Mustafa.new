"use client";

import Link from "next/link";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { HolidayPackage } from "@/types/package";
import { cn, tContent } from "@/lib/utils";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import SafeImage from "@/components/ui/SafeImage";

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
  const title = tContent(package_, "title", locale) || package_.title;
  const destination =
    tContent(package_, "destination", locale) || package_.destination;
  const country = tContent(package_, "country", locale) || package_.country;
  const amenities =
    (locale === "ar" || locale === "tr") && package_.amenitiesAr?.length
      ? package_.amenitiesAr
      : package_.amenities;

  return (
    <Link
      href={`/package/${package_.slug}`}
      className={cn(
        "group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2",
        compact && "rounded-xl shadow-md hover:-translate-y-1",
        className
      )}
    >
      <div className={cn("relative overflow-hidden", compact ? "h-40" : "h-56")}>
        <SafeImage
          src={
            package_.images[0]?.url ||
            "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800"
          }
          alt={package_.images[0]?.alt || title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
          <div className="px-2.5 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-full shadow-lg">
            {t.catalog.inTurkey}
          </div>
          {package_.isFeatured && (
            <div className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg">
              {t.catalog.featured}
            </div>
          )}
        </div>

        <div className="absolute top-3 end-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-semibold rounded-full flex items-center gap-1">
          <Clock size={11} />
          {package_.durationDays} {t.common.days}
        </div>

        <div className="absolute bottom-3 end-3">
          <div
            className={cn(
              "bg-white rounded-xl shadow-lg",
              compact ? "px-3 py-1.5" : "px-4 py-2"
            )}
          >
            <span className="text-[10px] text-slate-400 block">{t.common.from}</span>
            <span
              className={cn(
                "font-bold text-emerald-600",
                compact ? "text-base" : "text-xl"
              )}
            >
              {formatPrice(package_.price, package_.currency || "USD")}
            </span>
          </div>
        </div>
      </div>

      <div className={cn(compact ? "p-3.5" : "p-5")}>
        <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
          <MapPin size={14} className="text-emerald-500" />
          <span className="truncate">
            {destination}, {country}
          </span>
        </div>

        <h3
          className={cn(
            "font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2",
            compact ? "text-base" : "text-lg mb-3"
          )}
        >
          {title}
        </h3>

        {package_.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={14} className="fill-emerald-400 text-emerald-400" />
            <span className="font-semibold text-slate-700 text-sm">
              {package_.rating}
            </span>
          </div>
        )}

        {!compact && (
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
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
          <span className="text-sm text-slate-500">{t.common.viewDetails}</span>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
            <ArrowRight
              size={16}
              className="text-emerald-600 group-hover:text-white transition-colors rtl:rotate-180"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
