"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Car, Search } from "lucide-react";
import { CAR_RENTAL_OFFERS, type CarRentalOffer } from "@/data/car-rental-offers";
import {
  buildCarsSearchHref,
  DEFAULT_CARS_OFFER_IATA,
} from "@/lib/cars-search-href";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";

function CarRentalOfferCard({ offer }: { offer: CarRentalOffer }) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { formatPrice, currency } = useCurrency();
  const title = tContent(offer, "title", locale);
  const city = tContent(offer, "city", locale);
  const tagline = tContent(offer, "tagline", locale);

  const goToSearch = () => {
    router.push(buildCarsSearchHref({ iata: offer.iata, locale }));
  };

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] hover:border-emerald-400/40 hover:bg-white/[0.07] transition-colors">
      <button
        type="button"
        onClick={goToSearch}
        className="relative block h-40 w-full overflow-hidden text-start"
      >
        <SafeImage
          src={offer.image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/25 to-transparent" />
        <span className="absolute top-3 start-3 rounded-full bg-emerald-500/90 text-[#051741] text-[10px] font-bold tracking-wider px-2 py-1">
          {currency.code}
        </span>
        <span className="absolute top-3 end-3 rounded-full bg-black/45 text-white text-[11px] font-bold px-2 py-1 backdrop-blur-sm">
          {offer.iata}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4 min-w-0">
        <h3 className="text-white font-bold text-sm md:text-base truncate">
          {title}
        </h3>
        <p className="text-white/45 text-xs mt-0.5 truncate">{city}</p>
        <p className="mt-2 text-white/70 text-xs leading-relaxed line-clamp-2">
          {tagline}
        </p>
        <p className="mt-3 text-emerald-300 font-bold text-sm">
          {t.common.startingFrom} {formatPrice(offer.priceFromUsd, "USD")}
          <span className="text-white/40 font-medium text-xs">
            {" "}
            {t.home.carRentalDealsPerDay}
          </span>
        </p>
        <button
          type="button"
          onClick={goToSearch}
          className="mt-auto pt-3 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#051741] text-sm font-bold py-2.5 transition-colors"
        >
          <Search size={14} />
          {t.home.carRentalDealsCta}
        </button>
      </div>
    </article>
  );
}

export default function CarRentalDealsSection() {
  const router = useRouter();
  const { locale, t } = useLocale();

  const viewAllIstanbul = () => {
    router.push(buildCarsSearchHref({ iata: DEFAULT_CARS_OFFER_IATA, locale }));
  };

  return (
    <section className="py-12 md:py-16 bg-[#0a1628] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 start-1/4 w-80 h-80 bg-emerald-500/12 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 end-0 w-72 h-72 bg-emerald-400/8 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="min-w-0 max-w-3xl">
            <p className="text-emerald-400 text-xs md:text-sm font-semibold tracking-[0.22em] uppercase mb-3 inline-flex items-center gap-2">
              <Car size={14} />
              {t.nav.cars}
            </p>
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: "var(--font-sora), serif" }}
            >
              {t.home.carRentalDealsTitle}
            </h2>
            <p className="mt-3 text-base md:text-lg text-emerald-200/90">
              {t.home.carRentalDealsSubtitle}
            </p>
            <p className="mt-2 text-sm text-white/50">
              {t.home.carRentalDealsSupport}
            </p>
          </div>
          <button
            type="button"
            onClick={viewAllIstanbul}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 hover:text-white shrink-0"
          >
            {t.common.viewAll}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {CAR_RENTAL_OFFERS.map((offer) => (
            <CarRentalOfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <button
            type="button"
            onClick={viewAllIstanbul}
            className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-white/15 text-emerald-300 hover:text-white hover:border-emerald-400/40 text-sm font-semibold py-3 transition-colors"
          >
            {t.common.viewAll}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
}
