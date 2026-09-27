// src/components/home/StatsSection.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import { Plane, Globe, Users, Award } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0]
  );

  const stats = [
    {
      icon: Users,
      value: 50000,
      suffix: "+",
      label: t.home.happyTravelers,
      description: t.home.happyTravelersDesc,
    },
    {
      icon: Globe,
      value: 180,
      suffix: "+",
      label: t.home.destinations,
      description: t.home.destinationsDesc,
    },
    {
      icon: Plane,
      value: 500,
      suffix: "+",
      label: t.home.packages,
      description: t.home.packagesDesc,
    },
    {
      icon: Award,
      value: 15,
      suffix: "",
      label: t.home.yearsExperience,
      description: t.home.yearsExperienceDesc,
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative py-20 md:py-32 overflow-hidden"
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/80" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-12 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-orange-400 text-sm tracking-[0.3em] uppercase mb-4"
          >
            {t.home.ourImpact}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {t.home.numbersSpeak}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative group"
            >
              <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <stat.icon size={28} className="text-white" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {stat.label}
                </h3>
                <p className="text-white/50 text-sm">{stat.description}</p>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/10 group-hover:to-orange-600/10 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
