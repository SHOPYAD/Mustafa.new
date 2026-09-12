// src/components/visa/VisaCards.tsx
"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/types";

type VisaHome = Dictionary["visaHome"];

interface VisaCard {
  title: string;
  duration: string;
  priceAmount: string;
  priceCurrency: string;
  processingTime: string;
  features: string[];
  popular?: boolean;
  href: string;
  image: string;
}

function buildVisaCards(v: VisaHome): VisaCard[] {
  return [
    {
      title: v.touristVisa,
      duration: v.days30,
      priceAmount: "350",
      priceCurrency: "AED",
      processingTime: v.processing23,
      features: [v.singleEntry, v.valid60, v.fastProcessing],
      href: "/visa?type=uae-30",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400",
    },
    {
      title: v.touristVisa,
      duration: v.days60,
      priceAmount: "650",
      priceCurrency: "AED",
      processingTime: v.processing23,
      features: [v.singleEntry, v.valid90, v.airportPickup],
      popular: true,
      href: "/visa?type=uae-60",
      image:
        "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400",
    },
    {
      title: v.touristVisa,
      duration: v.days90,
      priceAmount: "1200",
      priceCurrency: "AED",
      processingTime: v.processing35,
      features: [v.multipleEntry, v.valid180, v.premiumSupport],
      href: "/visa?type=uae-90",
      image:
        "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=400",
    },
    {
      title: v.visaChange,
      duration: v.insideUae,
      priceAmount: "900",
      priceCurrency: "AED",
      processingTime: v.sameDay,
      features: [v.noExitRequired, v.allNationalities, v.expressService],
      href: "/visa?type=change",
      image:
        "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=400",
    },
  ];
}

export default function VisaCards({ embedded = false }: { embedded?: boolean }) {
  const { t } = useLocale();
  const { formatPrice } = useCurrency();
  const v = t.visaHome;
  const visaCards = useMemo(() => buildVisaCards(v), [v]);

  const grid = (
    <>
      <div className="sc-grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {visaCards.map((card) => (
          <div
            key={card.href}
            className={cn(
              "sc-card relative bg-white rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden",
              card.popular
                ? "ring-2 ring-orange-500 shadow-xl shadow-orange-500/20"
                : "shadow-lg hover:shadow-orange-500/10"
            )}
          >
            <div className="sc-card-image relative h-32 overflow-hidden">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {card.popular && (
                <div className="absolute top-3 right-3">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles size={12} />
                    {v.bestValue}
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 left-3">
                <span className="text-2xl font-bold text-white drop-shadow-lg">
                  {card.duration}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="sc-card-title text-lg font-bold text-slate-900 mb-2">
                {card.title}
              </h3>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="sc-card-price text-3xl font-bold text-orange-600">
                  {formatPrice(Number(card.priceAmount) || 0, card.priceCurrency || "AED")}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 bg-slate-50 px-3 py-2 rounded-lg">
                <Clock size={16} className="text-orange-500" />
                <span>{card.processingTime}</span>
              </div>

              <ul className="space-y-2 mb-6">
                {card.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle
                      size={16}
                      className="text-green-500 flex-shrink-0"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={card.href}
                className={cn(
                  "sc-btn flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-all",
                  card.popular
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30"
                    : "bg-slate-900 text-white hover:bg-orange-600"
                )}
              >
                {v.applyNow}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg">
          <Globe size={24} className="text-orange-600 shrink-0" />
          <p className="text-slate-700">
            {v.worldwideBefore}{" "}
            <span className="font-bold">{v.worldwideHighlight}</span>
          </p>
          <Link
            href="/visa"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            {v.explore}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return <div className="relative">{grid}</div>;
  }

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920"
          alt={v.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white" />
      </div>

      <div className="absolute top-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-600 text-white text-sm font-semibold rounded-full mb-4 shadow-lg">
            <Shield size={16} />
            {v.trustBadge}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {v.title}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">{v.subtitle}</p>
        </div>
        {grid}
      </div>
    </section>
  );
}
