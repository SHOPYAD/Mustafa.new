"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CarFront, Search } from "lucide-react";
import {
  DEFAULT_TRANSFER_OFFER,
  TRANSFER_OFFERS,
  type TransferOffer,
} from "@/data/transfer-offers";
import { buildTransfersSearchHref } from "@/lib/transfers-search-href";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";

function TransferOfferCard({ offer }: { offer: TransferOffer }) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { formatPrice, currency } = useCurrency();
  const title = tContent(offer, "title", locale);
  const route = tContent(offer, "route", locale);
  const tagline = tContent(offer, "tagline", locale);

  const goToResults = () => {
    router.push(buildTransfersSearchHref({ from: offer.from, to: offer.to }));
  };

  return (
    <article className="sc-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1">
      <button
        type="button"
        onClick={goToResults}
        className="sc-card-image relative block h-40 w-full overflow-hidden text-start"
      >
        <SafeImage
          src={offer.image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
        <span
          className="absolute top-3 start-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-300 bg-slate-950/80 backdrop-blur-md border border-amber-400/25"
        >
          {currency.code}
        </span>
        <span className="absolute top-3 end-3 rounded-full bg-slate-950/80 text-white text-[11px] font-bold px-2.5 py-1 backdrop-blur-md border border-white/15">
          {offer.fromIata || offer.toIata || "TR"}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5 min-w-0">
        <h3 className="sc-card-title truncate text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors">
          {title}
        </h3>
        <p className="mt-1 truncate text-xs font-bold text-purple-700">{route}</p>
        <p className="sc-card-desc mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 font-medium">
          {tagline}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <span className="block text-[11px] font-medium text-slate-500">{t.common.startingFrom}</span>
            <span className="text-base font-black text-purple-950">{formatPrice(offer.priceFromUsd, "USD")}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={goToResults}
          className="sc-btn mt-3 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#18052e] hover:to-[#3b1275] text-amber-300 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Search size={14} className="text-amber-400" />
          {t.home.transferOffersCta}
        </button>
      </div>
    </article>
  );
}

export default function TransferOffersSection({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const { t } = useLocale();

  const viewAllResults = () => {
    router.push(
      buildTransfersSearchHref({
        from: DEFAULT_TRANSFER_OFFER.from,
        to: DEFAULT_TRANSFER_OFFER.to,
      })
    );
  };

  const chrome = !embedded;

  return (
    <section className={embedded ? "relative pb-2" : "relative overflow-hidden bg-slate-50/60 py-12 md:py-16 border-t border-slate-100"}>
      <div className={embedded ? "relative z-10" : "home-container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"}>
        {chrome ? (
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-purple-700 md:text-sm">
              <CarFront size={14} />
              {t.nav.transfers}
            </p>
            <h2 className="text-2xl font-black leading-tight text-slate-900 md:text-3xl lg:text-4xl">
              {t.home.transferOffersTitle}
            </h2>
            <p className="mt-3 text-base text-slate-600 font-medium md:text-lg">
              {t.home.transferOffersSubtitle}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {t.home.transferOffersSupport}
            </p>
          </div>
          <button
            type="button"
            onClick={viewAllResults}
            className="sc-btn hidden shrink-0 items-center gap-2 whitespace-nowrap px-6 py-3 text-sm font-black rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md sm:inline-flex transition-all active:scale-95 cursor-pointer"
          >
            {t.common.viewAll}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
        ) : null}

        <div className="sc-grid grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {TRANSFER_OFFERS.map((offer) => (
            <TransferOfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        {chrome ? (
        <div className="mt-8 sm:hidden">
          <button
            type="button"
            onClick={viewAllResults}
            className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap py-3 text-sm font-black rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md transition-all active:scale-95"
          >
            {t.common.viewAll}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
        ) : null}
      </div>
    </section>
  );
}
