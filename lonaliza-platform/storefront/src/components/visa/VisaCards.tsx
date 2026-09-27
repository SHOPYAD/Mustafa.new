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
import HomeSwipeCarousel from "@/components/ui/HomeSwipeCarousel";

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

  const cards = visaCards.map((card) => (
    <div
      key={card.href}
      className={cn(
        "relative group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.15rem] bg-white shadow-[0_16px_36px_-22px_rgba(30,27,75,0.45)]",
        "border-s-[6px] border-s-amber-400"
      )}
    >
      <div className="relative h-28 overflow-hidden">
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b] via-[#1e1b4b]/25 to-transparent" />
        {card.popular ? (
          <div className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black text-slate-950">
            <Sparkles size={11} />
            {v.bestValue}
          </div>
        ) : null}
        <span className="absolute bottom-3 start-3 text-2xl font-black text-white drop-shadow-lg">
          {card.duration}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-black text-[#1e1b4b]">{card.title}</h3>
        <p className="mt-1 font-mono text-2xl font-black text-[#2e1065]">
          {formatPrice(Number(card.priceAmount) || 0, card.priceCurrency || "AED")}
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f6f1ff] px-3 py-2 text-xs font-medium text-slate-600">
          <Clock size={14} className="text-purple-700" />
          <span>{card.processingTime}</span>
        </div>
        <ul className="mt-3 space-y-1.5">
          {card.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle size={14} className="shrink-0 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>
        <Link
          href={card.href}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition-all",
            card.popular
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950"
              : "bg-[#1e1b4b] text-amber-300"
          )}
        >
          {v.applyNow}
          <ArrowRight size={16} className="rtl:rotate-180" />
        </Link>
      </div>
    </div>
  ));

  const grid = (
    <>
      <HomeSwipeCarousel
        arrowTone="gold"
        desktopClassName="lg:grid lg:grid-cols-4 lg:gap-5 lg:!overflow-visible lg:pb-0"
      >
        {cards}
      </HomeSwipeCarousel>

      <div className="mt-8 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-[#1e1b4b] px-5 py-3.5 text-white shadow-lg">
          <Globe size={22} className="shrink-0 text-amber-300" />
          <p>
            {v.worldwideBefore}{" "}
            <span className="font-bold text-amber-300">{v.worldwideHighlight}</span>
          </p>
          <Link
            href="/visa"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-3.5 py-1.5 text-sm font-black text-slate-950"
          >
            {v.explore}
            <ArrowRight size={15} className="rtl:rotate-180" />
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
