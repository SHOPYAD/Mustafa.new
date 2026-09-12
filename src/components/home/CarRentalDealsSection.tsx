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
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-lg hover:border-purple-400/60 transition-all duration-300">
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <span className="absolute top-3 start-3 rounded-full bg-gradient-to-r from-purple-900 to-indigo-950 text-amber-300 text-[10px] font-bold tracking-wider px-2.5 py-1 shadow-md">
          {currency.code}
        </span>
        <span className="absolute top-3 end-3 rounded-full bg-slate-950/60 text-white text-[11px] font-bold px-2 py-1 backdrop-blur-sm">
          {offer.iata}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4 min-w-0">
        <h3 className="text-slate-900 font-bold text-sm md:text-base truncate group-hover:text-purple-900 transition-colors">
          {title}
        </h3>
        <p className="text-slate-500 text-xs mt-0.5 truncate">{city}</p>
        <p className="mt-2 text-slate-600 text-xs leading-relaxed line-clamp-2">
          {tagline}
        </p>
        <p className="mt-3 text-purple-950 font-bold text-sm">
          {t.common.startingFrom} {formatPrice(offer.priceFromUsd, "USD")}
          <span className="text-slate-500 font-medium text-xs">
            {" "}
            {t.home.carRentalDealsPerDay}
          </span>
        </p>
        <button
          type="button"
          onClick={goToSearch}
          className="mt-auto pt-3 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:brightness-110 text-white text-sm font-bold py-2.5 transition-all shadow-sm"
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
    <section className="py-12 md:py-16 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="min-w-0 max-w-3xl">
            <p className="text-[#2e1065] text-xs md:text-sm font-bold tracking-[0.22em] uppercase mb-3 inline-flex items-center gap-2">
              <Car size={15} className="text-purple-700" />
              {t.nav.cars}
            </p>
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1e1b4b] leading-tight"
              style={{ fontFamily: "var(--font-sora), serif" }}
            >
              {t.home.carRentalDealsTitle}
            </h2>
            <p className="mt-3 text-base md:text-lg text-slate-600">
              {t.home.carRentalDealsSubtitle}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {t.home.carRentalDealsSupport}
            </p>
          </div>
          <button
            type="button"
            onClick={viewAllIstanbul}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-purple-900 hover:text-purple-700 shrink-0 px-4 py-2 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition-colors"
          >
            {t.common.viewAll}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {CAR_RENTAL_OFFERS.map((offer) => (
            <CarRentalOfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <button
            type="button"
            onClick={viewAllIstanbul}
            className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-purple-300 text-purple-900 bg-purple-50 hover:bg-purple-100 text-sm font-bold py-3 transition-colors"
          >
            {t.common.viewAll}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
}
