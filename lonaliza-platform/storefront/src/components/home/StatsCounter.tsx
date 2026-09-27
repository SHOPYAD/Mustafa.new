// src/components/home/StatsCounter.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Users, MapPin, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    color: string;
}

const stats: Stat[] = [
    {
        icon: Users,
        value: 50000,
        suffix: "+",
        label: "Happy Travelers",
        color: "from-orange-500 to-orange-600",
    },
    {
        icon: MapPin,
        value: 500,
        suffix: "+",
        label: "Destinations",
        color: "from-purple-500 to-pink-500",
    },
    {
        icon: Award,
        value: 10,
        suffix: "+",
        label: "Years Experience",
        color: "from-amber-500 to-orange-500",
    },
    {
        icon: Star,
        value: 4.9,
        suffix: "★",
        label: "Customer Rating",
        color: "from-green-500 to-emerald-500",
    },
];

function CountUp({ end, suffix, duration = 2000 }: { end: number; suffix: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const isDecimal = end % 1 !== 0;
        const startTime = Date.now();
        const step = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = easeOut * end;
            setCount(isDecimal ? parseFloat(currentValue.toFixed(1)) : Math.floor(currentValue));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }, [isVisible, end, duration]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

export default function StatsCounter() {
    return (
        <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={cn(
                                "text-center group animate-fade-in-up",
                                `delay-${index * 100}`
                            )}
                        >
                            {/* Icon */}
                            <div
                                className={cn(
                                    "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300",
                                    stat.color
                                )}
                            >
                                <stat.icon size={28} className="text-white" />
                            </div>

                            {/* Value */}
                            <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                                <CountUp end={stat.value} suffix={stat.suffix} />
                            </div>

                            {/* Label */}
                            <p className="text-slate-400 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
