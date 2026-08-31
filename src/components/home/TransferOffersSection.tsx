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
    <article className="sc-card group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--brand-accent)_10%,transparent)] bg-white shadow-[0_14px_32px_-24px_rgba(5,23,65,0.35)] transition hover:-translate-y-0.5">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-header)]/70 via-[color-mix(in_srgb,var(--brand-header)_25%,transparent)] to-transparent" />
        <span
          className="absolute top-3 start-3 rounded-full px-2 py-1 text-[10px] font-bold tracking-wider text-white"
          style={{ backgroundColor: "var(--brand-button)" }}
        >
          {currency.code}
        </span>
        <span className="absolute top-3 end-3 rounded-full bg-black/45 text-white text-[11px] font-bold px-2 py-1 backdrop-blur-sm">
          {offer.fromIata || offer.toIata || "TR"}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4 min-w-0">
        <h3 className="sc-card-title truncate text-sm font-bold text-[var(--brand-accent)] md:text-base">
          {title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-slate-500">{route}</p>
        <p className="sc-card-desc mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {tagline}
        </p>
        <p className="sc-card-price mt-3 text-sm font-bold text-[var(--brand-primary)]">
          {t.common.startingFrom} {formatPrice(offer.priceFromUsd, "USD")}
        </p>
        <button
          type="button"
          onClick={goToResults}
          className="sc-btn mt-auto inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap py-2.5 pt-3 text-sm font-bold text-white transition hover:brightness-110"
          style={{ backgroundColor: "var(--brand-button)", borderRadius: "var(--radius-button)" }}
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
    <section className={embedded ? "relative pb-2" : "relative overflow-hidden bg-[color-mix(in_srgb,var(--brand-secondary)_70%,#ccfbf1)] py-12 md:py-16"}>
      <div className={embedded ? "relative z-10" : "home-container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"}>
        {chrome ? (
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)] md:text-sm">
              <CarFront size={14} />
              {t.nav.transfers}
            </p>
            <h2 className="text-2xl font-bold leading-tight text-[var(--brand-accent)] md:text-3xl lg:text-4xl">
              {t.home.transferOffersTitle}
            </h2>
            <p className="mt-3 text-base text-slate-600 md:text-lg">
              {t.home.transferOffersSubtitle}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {t.home.transferOffersSupport}
            </p>
          </div>
          <button
            type="button"
            onClick={viewAllResults}
            className="sc-btn hidden shrink-0 items-center gap-1.5 whitespace-nowrap px-5 py-2.5 text-sm font-bold text-white sm:inline-flex"
            style={{ backgroundColor: "var(--brand-button)", borderRadius: "var(--radius-button)" }}
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
            className="inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap py-3 text-sm font-bold text-white"
            style={{ backgroundColor: "var(--brand-button)", borderRadius: "var(--radius-button)" }}
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
