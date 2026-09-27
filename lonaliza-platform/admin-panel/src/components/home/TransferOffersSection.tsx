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
import HomeSwipeCarousel from "@/components/ui/HomeSwipeCarousel";

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
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] bg-[#0f172a] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.7)]">
      <button
        type="button"
        onClick={goToResults}
        className="relative block h-36 w-full overflow-hidden text-start"
      >
        <SafeImage
          src={offer.image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent" />
        <span className="absolute top-3 start-3 rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black tracking-wider text-slate-950">
          {offer.fromIata || "IST"}
        </span>
        <span className="absolute top-3 end-3 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
          {currency.code}
        </span>
      </button>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">{route}</p>
        <h3 className="mt-1 text-base font-black leading-snug text-white">{title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-white/65">{tagline}</p>
        <div className="mt-4 flex items-end justify-between gap-2 border-t border-white/10 pt-3">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/45">{t.common.startingFrom}</span>
            <span className="text-lg font-black text-amber-300">{formatPrice(offer.priceFromUsd, "USD")}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={goToResults}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 py-2.5 text-xs font-black text-slate-950"
        >
          <Search size={14} />
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

        <HomeSwipeCarousel arrowTone="navy">
          {TRANSFER_OFFERS.map((offer) => (
            <TransferOfferCard key={offer.id} offer={offer} />
          ))}
        </HomeSwipeCarousel>

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
