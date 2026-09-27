// src/components/home/DestinationMap.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";

interface Destination {
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  image: string;
  packages: number;
  startingPrice: number;
  rating: number;
  position: { x: number; y: number };
  slug: string;
}

const destinations: Destination[] = [
  {
    id: "1",
    nameAr: "إسطنبول",
    nameEn: "Istanbul",
    countryAr: "تركيا",
    countryEn: "Turkey",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400",
    packages: 28,
    startingPrice: 399,
    rating: 4.9,
    position: { x: 48, y: 42 },
    slug: "Istanbul",
  },
  {
    id: "2",
    nameAr: "أنطاليا",
    nameEn: "Antalya",
    countryAr: "تركيا",
    countryEn: "Turkey",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400",
    packages: 16,
    startingPrice: 449,
    rating: 4.8,
    position: { x: 52, y: 62 },
    slug: "Antalya",
  },
  {
    id: "3",
    nameAr: "كابادوكيا",
    nameEn: "Cappadocia",
    countryAr: "تركيا",
    countryEn: "Turkey",
    image: "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=400",
    packages: 14,
    startingPrice: 549,
    rating: 4.9,
    position: { x: 58, y: 52 },
    slug: "Cappadocia",
  },
  {
    id: "4",
    nameAr: "طرابزون",
    nameEn: "Trabzon",
    countryAr: "تركيا",
    countryEn: "Turkey",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
    packages: 12,
    startingPrice: 399,
    rating: 4.8,
    position: { x: 68, y: 38 },
    slug: "Trabzon",
  },
  {
    id: "5",
    nameAr: "بورصة",
    nameEn: "Bursa",
    countryAr: "تركيا",
    countryEn: "Turkey",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400",
    packages: 8,
    startingPrice: 299,
    rating: 4.7,
    position: { x: 44, y: 48 },
    slug: "Bursa",
  },
  {
    id: "6",
    nameAr: "سبانجا",
    nameEn: "Sapanca",
    countryAr: "تركيا",
    countryEn: "Turkey",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    packages: 10,
    startingPrice: 199,
    rating: 4.8,
    position: { x: 46, y: 44 },
    slug: "Sapanca",
  },
];

export default function DestinationMap() {
  const [active, setActive] = useState<string | null>(destinations[0]?.id ?? null);
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const selected = destinations.find((d) => d.id === active) || destinations[0];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-emerald-600 text-sm tracking-[0.25em] uppercase mb-3">
            {t.admin.turkeyMap}
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-slate-900"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {t.admin.exploreTurkeyCities}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-200 border border-slate-200">
            <Image
              src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200"
              alt="Turkey"
              fill
              className="object-cover opacity-40"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {destinations.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActive(d.id)}
                className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform ${
                  active === d.id ? "bg-emerald-500 scale-125" : "bg-slate-900"
                }`}
                style={{ left: `${d.position.x}%`, top: `${d.position.y}%` }}
                aria-label={(locale === "ar" || locale === "tr") ? d.nameAr : d.nameEn}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm"
              >
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5">
                  <Image
                    src={selected.image}
                    alt={(locale === "ar" || locale === "tr") ? selected.nameAr : selected.nameEn}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <MapPin size={14} />
                  {(locale === "ar" || locale === "tr") ? selected.countryAr : selected.countryEn}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {(locale === "ar" || locale === "tr") ? selected.nameAr : selected.nameEn}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="text-emerald-400 fill-emerald-400" />
                    {selected.rating}
                  </span>
                  <span>
                    {selected.packages} {t.home.packagesCount}
                  </span>
                  <span>
                    {t.common.from} {formatPrice(selected.startingPrice)}
                  </span>
                </div>
                <Link
                  href={`/holidays?q=${selected.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-emerald-600 transition-colors"
                >
                  {t.common.viewAll}
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
