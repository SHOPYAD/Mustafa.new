"use client";

import Link from "next/link";
import { useMemo } from "react";
import BrandImage from "@/components/branding/BrandImage";
import { useBrandName } from "@/components/branding/BrandingProvider";
import { buildCompareOffers, type HotelOfferSource } from "@/lib/hotel-offers";
import { stayFromNightly } from "@/lib/hotel-display";
import { ALRAYYAN_LOGO_SRC } from "@/lib/partner-logos";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Props = {
  offers: HotelOfferSource[];
  bookHref: string;
  className?: string;
  nights?: number;
};

function PartnerMark({ name, logo }: { name: string; logo: string }) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={name}
        className="h-10 md:h-12 w-[140px] rounded-lg object-contain bg-white border border-slate-100 px-2 py-1"
      />
    );
  }
  return (
    <span className="flex h-10 min-w-[88px] items-center justify-center rounded-lg bg-slate-100 px-3 text-xs font-bold text-slate-600">
      {name}
    </span>
  );
}

export default function HotelOfferCompare({ offers, bookHref, className, nights = 1 }: Props) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const brandName = useBrandName(locale);
  const rows = useMemo(
    () => buildCompareOffers(offers, brandName || t.hotels.bannerKicker, ALRAYYAN_LOGO_SRC),
    [offers, brandName, t.hotels.bannerKicker]
  );

  if (!rows.length) return null;

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-slate-900 mb-1">{t.hotels.compareOffers}</h2>
      <p className="text-xs text-slate-500 mb-4">{t.hotels.compareLiveNote}</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {rows.map((row) => {
          const money = stayFromNightly(row.nightly ?? row.price, nights);
          return (
          <div
            key={`${row.partnerId}-${row.price}`}
            className={`flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 ${
              row.isAlrayyan ? "bg-amber-50/80" : ""
            }`}
          >
            {row.isAlrayyan ? (
              <BrandImage
                src={ALRAYYAN_LOGO_SRC}
                alt={row.partnerName}
                width={200}
                height={50}
                className="h-12 md:h-14 w-auto max-w-[200px] rounded-lg object-contain bg-[#051741] border border-amber-200 px-2 py-1"
              />
            ) : (
              <PartnerMark name={row.partnerName} logo={row.logoUrl} />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 truncate">{row.partnerName}</p>
              {row.isAlrayyan ? (
                <p className="text-xs text-amber-700">{t.hotels.bestPriceOurs}</p>
              ) : null}
            </div>
            <div className="text-end">
              <p className="text-lg font-bold text-slate-900">
                {formatPrice(money.nightly, row.currency || "USD")}
              </p>
              <p className="text-[11px] text-slate-400">{t.hotels.perNight}</p>
              {nights > 1 && money.total > 0 ? (
                <p className="text-[11px] text-slate-500">
                  {t.hotels.totalStayNightsTaxes(nights)}: {formatPrice(money.total, row.currency || "USD")}
                </p>
              ) : null}
            </div>
            {row.isAlrayyan ? (
              <Link
                href={bookHref}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
              >
                {t.hotels.bookNow}
              </Link>
            ) : (
              <span className="w-[72px]" />
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
