// src/components/home/HeroAwwwards.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, ChevronDown, MapPin, Star, Calendar } from "lucide-react";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useBranding } from "@/components/branding/BrandingProvider";
import BrandImage from "@/components/branding/BrandImage";
import type { BrandingHeroSlide, BrandingSideCard } from "@/types/branding";

export default function HeroAwwwards() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const { formatPrice } = useCurrency();
    const { locale, t } = useLocale();
    const homepage = useHomepageContent();
    const branding = useBranding();
    const slides: BrandingHeroSlide[] =
        branding.hero.slides.length > 0
            ? branding.hero.slides
            : homepage.heroSlides.map((slide) => ({
                  id: slide.id,
                  nameAr: slide.nameAr,
                  nameEn: slide.nameEn,
                  nameTr: slide.nameAr,
                  taglineAr: slide.taglineAr,
                  taglineEn: slide.taglineEn,
                  taglineTr: slide.taglineAr,
                  image: slide.image,
                  price: slide.price,
                  currencyLabel: "USD",
                  durationAr: slide.durationAr,
                  durationEn: slide.durationEn,
                  durationTr: slide.durationAr,
                  rating: slide.rating,
                  badgeAr: "",
                  badgeEn: "",
                  badgeTr: "",
                  inclusiveAr: "",
                  inclusiveEn: "",
                  inclusiveTr: "",
                  ctaLabelAr: slide.ctaLabelAr || "",
                  ctaLabelEn: slide.ctaLabelEn || "",
                  ctaLabelTr: "",
                  ctaHref: slide.ctaHref || "/holidays",
                  secondaryCtaLabelAr: "",
                  secondaryCtaLabelEn: "",
                  secondaryCtaLabelTr: "",
                  secondaryCtaHref: "",
              }));
    const sideCards: BrandingSideCard[] =
        branding.hero.sideCards.length > 0
            ? branding.hero.sideCards
            : slides.map((slide) => ({
                  id: slide.id,
                  titleAr: slide.nameAr,
                  titleEn: slide.nameEn,
                  titleTr: slide.nameTr,
                  daysAr: slide.durationAr,
                  daysEn: slide.durationEn,
                  daysTr: slide.durationTr,
                  price: slide.price,
                  image: slide.image,
                  href: slide.ctaHref || "/holidays",
              }));

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

    useEffect(() => {
        if (isHovered || slides.length === 0) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isHovered, slides.length]);

    useEffect(() => {
        if (activeIndex >= slides.length) setActiveIndex(0);
    }, [slides.length, activeIndex]);

    if (!slides.length) return null;

    const active = slides[activeIndex] || slides[0];
    const name = tContent(active, "name", locale);
    const tagline = tContent(active, "tagline", locale);
    const duration = tContent(active, "duration", locale);
    const ctaLabel =
        tContent(active, "ctaLabel", locale) ||
        (t.admin.explorePackages);
    const ctaHref = active.ctaHref || "/holidays";
    const featuredLabel =
        tContent(active, "badge", locale) || t.home.featuredDestination;
    const fromLabel = t.common.startingFrom;
    const personLabel = t.common.perPerson;
    const inclusiveLabel =
        tContent(active, "inclusive", locale) || t.common.allInclusive;
    const watchLabel =
        tContent(active, "secondaryCtaLabel", locale) || t.home.watchFilm;
    const watchHref = active.secondaryCtaHref || "";
    const scrollLabel = t.home.scroll;
    const currencyLabel = active.currencyLabel || "USD";

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen overflow-hidden bg-slate-950"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={active.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                    style={{ y, scale }}
                >
                    <BrandImage
                        src={active.image}
                        alt={name}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40" />
                </motion.div>
            </AnimatePresence>

            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            <motion.div
                style={{ opacity }}
                className="relative z-10 min-h-screen flex flex-col"
            >
                <div className="flex-1 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 md:py-32">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2"
                                >
                                    <span className="w-12 h-[1px] bg-white/50" />
                                    <span className="text-white/70 text-sm tracking-[0.3em] uppercase font-light">
                                        {featuredLabel}
                                    </span>
                                </motion.div>

                                <div className="space-y-2">
                                    <AnimatePresence mode="wait">
                                        <motion.h1
                                            key={name}
                                            initial={{ opacity: 0, y: 60, rotateX: -15 }}
                                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                            exit={{ opacity: 0, y: -40 }}
                                            transition={{
                                                duration: 0.8,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                            }}
                                            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.0] md:leading-[0.9] tracking-tight"
                                            style={{ fontFamily: "var(--font-sora)" }}
                                        >
                                            {name}
                                        </motion.h1>
                                    </AnimatePresence>

                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={tagline}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.6, delay: 0.2 }}
                                            className="text-lg sm:text-xl md:text-3xl text-white/60 font-light italic"
                                            style={{ fontFamily: "var(--font-sora)" }}
                                        >
                                            {tagline}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex gap-8 pt-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-orange-400" />
                                        <span className="text-white/80">{duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star
                                            size={18}
                                            className="text-emerald-400 fill-emerald-400"
                                        />
                                        <span className="text-white/80">{active.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="text-rose-400" />
                                        <span className="text-white/80">{inclusiveLabel}</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-col sm:flex-row gap-4 pt-4"
                                >
                                    <Link
                                        href={ctaHref}
                                        className="group relative flex items-center justify-center px-8 py-4 text-white font-semibold rounded-xl overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]"
                                        style={{ backgroundColor: "var(--brand-button)" }}
                                        data-cursor="Explore"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {ctaLabel}
                                            <ArrowRight
                                                size={18}
                                                className="group-hover:translate-x-1 transition-transform"
                                            />
                                        </span>
                                    </Link>

                                    {watchHref ? (
                                    <Link
                                        href={watchHref}
                                        className="group flex items-center gap-3 px-6 py-4 text-white font-medium"
                                        data-cursor="Play"
                                    >
                                        <span className="relative flex items-center justify-center w-12 h-12 rounded-full border border-white/30 group-hover:border-white/60 transition-colors">
                                            <Play size={18} fill="white" className="ms-0.5" />
                                            <span className="absolute inset-0 rounded-full border border-white/20 animate-ping" />
                                        </span>
                                        <span className="text-white/80 group-hover:text-white transition-colors">
                                            {watchLabel}
                                        </span>
                                    </Link>
                                    ) : (
                                    <button
                                        className="group flex items-center gap-3 px-6 py-4 text-white font-medium"
                                        data-cursor="Play"
                                        type="button"
                                    >
                                        <span className="relative flex items-center justify-center w-12 h-12 rounded-full border border-white/30 group-hover:border-white/60 transition-colors">
                                            <Play size={18} fill="white" className="ms-0.5" />
                                            <span className="absolute inset-0 rounded-full border border-white/20 animate-ping" />
                                        </span>
                                        <span className="text-white/80 group-hover:text-white transition-colors">
                                            {watchLabel}
                                        </span>
                                    </button>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="pt-8"
                                >
                                    <p className="text-white/50 text-sm mb-1">{fromLabel}</p>
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={active.price}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-4xl font-bold text-white"
                                        >
                                            {formatPrice(active.price)}
                                            <span className="text-lg font-normal text-white/50 ms-2">
                                                {currencyLabel} · {personLabel}
                                            </span>
                                        </motion.p>
                                    </AnimatePresence>
                                </motion.div>

                                {(branding.hero.extraTexts.length > 0 ||
                                    branding.hero.extraImages.length > 0) && (
                                    <div className="space-y-4 pt-4">
                                        {branding.hero.extraTexts.map((item) => {
                                            const title = tContent(item, "title", locale);
                                            const body = tContent(item, "body", locale);
                                            return (
                                                <div key={item.id} className="text-white/70">
                                                    {title ? (
                                                        <p className="text-white font-semibold mb-1">
                                                            {title}
                                                        </p>
                                                    ) : null}
                                                    {body ? (
                                                        <p className="text-sm leading-relaxed">{body}</p>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                        {branding.hero.extraImages.length > 0 ? (
                                            <div className="flex flex-wrap gap-3">
                                                {branding.hero.extraImages.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="relative h-20 w-28 overflow-hidden rounded-xl"
                                                    >
                                                        <BrandImage
                                                            src={item.url}
                                                            alt={tContent(item, "alt", locale)}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            <div className="hidden lg:block">
                                <motion.div
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-4"
                                >
                                    {sideCards.map((card, index) => {
                                        const isActive = index === activeIndex;
                                        const title = tContent(card, "title", locale);
                                        const days = tContent(card, "days", locale);
                                        const inner = (
                                            <>
                                            <div
                                                className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all ${
                                                    isActive ? "ring-2 ring-white" : ""
                                                }`}
                                            >
                                                <BrandImage
                                                    src={card.image}
                                                    alt={title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 text-start">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {title}
                                                </h3>
                                            </div>

                                            <div className="text-end">
                                                <p className="text-lg font-bold text-white">
                                                    {formatPrice(card.price)}
                                                </p>
                                                <p className="text-white/50 text-xs">{days}</p>
                                            </div>

                                            <div
                                                className={`w-1 h-12 rounded-full transition-all ${
                                                    isActive
                                                        ? "bg-gradient-to-b from-orange-400 to-orange-600"
                                                        : "bg-white/10"
                                                }`}
                                            />
                                            </>
                                        );
                                        const className = `group w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                            isActive
                                                ? "bg-white/10 backdrop-blur-sm"
                                                : "hover:bg-white/5"
                                        }`;
                                        if (branding.hero.sideCards.length > 0) {
                                            return (
                                                <Link
                                                    key={card.id}
                                                    href={card.href || "/holidays"}
                                                    className={className}
                                                >
                                                    {inner}
                                                </Link>
                                            );
                                        }
                                        return (
                                        <button
                                            key={card.id}
                                            type="button"
                                            onClick={() => setActiveIndex(index)}
                                            className={className}
                                        >
                                            {inner}
                                        </button>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    {slides.map((s, index) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`relative h-1 rounded-full transition-all duration-500 ${
                                index === activeIndex
                                    ? "w-12 bg-white"
                                    : "w-6 bg-white/30 hover:bg-white/50"
                            }`}
                        >
                            {index === activeIndex && (
                                <motion.div
                                    layoutId="activeDot"
                                    className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 1,
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 1.5,
                    }}
                    className="absolute bottom-8 end-8 flex flex-col items-center gap-2 text-white/50"
                >
                    <span className="text-xs tracking-widest uppercase rotate-90 origin-center translate-x-6">
                        {scrollLabel}
                    </span>
                    <ChevronDown size={20} className="animate-bounce" />
                </motion.div>
            </motion.div>
        </div>
    );
}
