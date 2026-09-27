// src/components/home/DestinationsShowcase.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Star, MapPin } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { EditorSelectableItem } from "@/components/editor/EditorSection";

export default function DestinationsShowcase() {
  const { formatPrice } = useCurrency();
  const { locale, t } = useLocale();
  const homepage = useHomepageContent();
  const destinations = homepage.destinations;
  const sectionTitle = tContent(homepage.sections, "destinationsTitle", locale);

  const eyebrow = t.home.curatedDestinations;
  const blurb = t.home.destinationsBlurb;
  const packagesLabel = t.home.packagesCount;
  const fromLabel = t.common.from;
  const viewAll = t.home.viewAllDestinations;

  if (!destinations.length) return null;

  return (
    <section className="relative py-20 md:py-28 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] bg-sky-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-emerald-400 text-sm tracking-[0.3em] uppercase mb-4"
            >
              {eyebrow}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight"
              style={{ fontFamily: "var(--font-sora)" }}
            >
              {sectionTitle ||
                (t.admin.turkeyCitiesWith)}
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/55 text-base md:text-lg max-w-md"
          >
            {blurb}
          </motion.p>
        </div>

        {/* Clean equal grid — no overlapping / clipped capsules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {destinations.map((dest, index) => {
            const name = tContent(dest, "name", locale);
            const country = tContent(dest, "country", locale);
            const tagline = tContent(dest, "tagline", locale);
            const href = dest.href || "/holidays";

            return (
              <EditorSelectableItem
                key={dest.id}
                sectionType="destinations"
                itemId={dest.id}
                labelAr={dest.nameAr}
                labelEn={dest.nameEn}
              >
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: Math.min(index * 0.06, 0.35), duration: 0.45 }}
                  className="group h-full"
                >
                  <Link
                    href={href}
                    className="flex flex-col h-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 hover:border-emerald-400/40 transition-colors"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SafeImage
                        src={dest.image}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute top-3 inset-inline-start-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/45 backdrop-blur-sm rounded-full">
                        <Star size={12} className="text-emerald-400 fill-emerald-400" />
                        <span className="text-white text-xs font-medium">{dest.rating}</span>
                      </div>
                      <div className="absolute top-3 inset-inline-end-3 w-9 h-9 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={16} className="text-slate-900" />
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-4 md:p-5 gap-2">
                      <p className="text-emerald-400/90 text-xs font-medium tracking-wide line-clamp-1">
                        {tagline}
                      </p>
                      <h3 className="text-xl font-bold text-white leading-snug">{name}</h3>
                      <p className="flex items-center gap-1.5 text-white/45 text-sm">
                        <MapPin size={14} />
                        {country}
                      </p>
                      <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-white/10 text-sm">
                        <span className="text-white/60">
                          {dest.packages} {packagesLabel}
                        </span>
                        <span className="text-white font-semibold whitespace-nowrap">
                          {fromLabel} {formatPrice(dest.startingPrice)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </EditorSelectableItem>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12 md:mt-14"
        >
          <Link
            href="/holidays"
            className="group inline-flex items-center gap-3 px-7 py-3.5 border border-white/20 rounded-full text-white hover:bg-white hover:text-slate-900 transition-all duration-300"
          >
            <span className="font-medium">{viewAll}</span>
            <ArrowUpRight
              size={18}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
