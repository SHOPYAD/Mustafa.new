// src/components/home/FlashDeals.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Flame, Users, ChevronRight, Zap, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { EditorSelectableItem } from "@/components/editor/EditorSection";

function CountdownTimer({ endsAt }: { endsAt: Date }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const tick = () => {
            const diff = endsAt.getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [endsAt]);

    return (
        <div className="flex gap-1.5">
            {[
                { value: timeLeft.days, label: "D" },
                { value: timeLeft.hours, label: "H" },
                { value: timeLeft.minutes, label: "M" },
                { value: timeLeft.seconds, label: "S" },
            ].map((item, index) => (
                <div
                    key={index}
                    className="flex flex-col items-center bg-slate-900 text-white rounded-lg px-2 py-1 min-w-[36px]"
                >
                    <span className="text-sm font-bold">
                        {String(item.value).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function FlashDeals() {
    const { locale, t } = useLocale();
    const homepage = useHomepageContent();
    const offers = homepage.offers;
    const sectionTitle = tContent(homepage.sections, "offersTitle", locale);

    const copy = useMemo(
        () => ({
            badge: t.home.flashDealsBadge,
            subtitle: t.home.flashDealsSubtitle,
            viewAll: t.home.viewAllDeals,
            endsIn: t.home.offerEndsIn,
            booked: t.home.booked,
            left: t.home.seatsLeft,
            book: t.home.book,
            person: t.common.perPerson,
        }),
        [t]
    );

    if (!offers.length) return null;

    return (
        <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920"
                    alt=""
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/95" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="text-center md:text-start">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white text-sm font-bold mb-4">
                            <Flame size={18} className="animate-pulse" />
                            {copy.badge}
                            <Zap size={18} />
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                            {sectionTitle || copy.badge}
                        </h2>
                        <p className="text-slate-400 max-w-xl">{copy.subtitle}</p>
                    </div>
                    <Link
                        href="/holidays?filter=deals"
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all group"
                    >
                        {copy.viewAll}
                        <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {offers.map((deal, index) => {
                        const title = tContent(deal, "title", locale);
                        const destination = tContent(deal, "destination", locale);
                        const badge = tContent(deal, "badge", locale);
                        const endsAt = new Date(deal.endsAt);
                        const discount = Math.round(
                            (1 - deal.salePrice / Math.max(deal.originalPrice, 1)) * 100
                        );
                        const bookedPct = Math.round(
                            ((deal.totalSeats - deal.seatsLeft) /
                                Math.max(deal.totalSeats, 1)) *
                                100
                        );

                        return (
                            <EditorSelectableItem
                                key={deal.id}
                                sectionType="flashDeals"
                                itemId={deal.id}
                                labelAr={deal.titleAr}
                                labelEn={deal.titleEn}
                            >
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={deal.image}
                                        alt={title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 start-3">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white text-xs font-bold">
                                            <Flame size={12} />
                                            {badge || `${discount}% OFF`}
                                        </div>
                                    </div>
                                    <div className="absolute top-3 end-3">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                            <Users size={12} />
                                            {deal.seatsLeft} {copy.left}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 start-0 end-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>

                                <div className="p-5">
                                    <span className="text-xs font-semibold text-orange-500 uppercase">
                                        {destination}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 mt-1 mb-3 group-hover:text-orange-500 transition-colors line-clamp-1">
                                        {title}
                                    </h3>

                                    <div className="mb-4">
                                        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                            <Clock size={12} />
                                            {copy.endsIn}
                                        </p>
                                        <CountdownTimer endsAt={endsAt} />
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>{copy.booked}</span>
                                            <span>{bookedPct}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${bookedPct}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <span className="text-sm text-slate-400 line-through">
                                                ${deal.originalPrice}
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-slate-900">
                                                    ${deal.salePrice}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {copy.person}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={deal.href || "/holidays"}
                                            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                                        >
                                            {copy.book}
                                            <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                            </EditorSelectableItem>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
