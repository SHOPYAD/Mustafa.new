// src/components/ui/TrustBadges.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Shield, Award, CheckCircle, Star } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface TrustBadgesProps {
  variant?: "header" | "footer" | "full";
}

export default function TrustBadges({ variant = "header" }: TrustBadgesProps) {
  const { t } = useLocale();

  const badges = [
    {
      icon: Shield,
      label: t.home.iataCertified,
      sublabel: t.home.licensedAgent,
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Award,
      label: t.home.dubaiTourism,
      sublabel: t.home.authorizedPartner,
      color: "from-teal-500 to-emerald-600",
    },
    {
      icon: CheckCircle,
      label: t.home.verified,
      sublabel: t.home.secureBooking,
      color: "from-green-500 to-emerald-500",
    },
  ];

  if (variant === "header") {
    return (
      <div className="hidden lg:flex items-center gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="group relative flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full cursor-default"
          >
            <badge.icon size={14} className="text-white" />
            <span className="text-xs text-white font-medium">{badge.label}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
              <div className="font-semibold">{badge.label}</div>
              <div className="text-slate-400">{badge.sublabel}</div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === "full") {
    return (
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 justify-center lg:justify-start mb-4"
              >
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-white/80 text-sm">
                  {t.home.happyTravelersCount}
                </span>
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {t.home.trustTitle}
              </h3>
              <p className="text-white/60 max-w-md">{t.home.trustSubtitle}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-default"
                >
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${badge.color} rounded-lg flex items-center justify-center`}
                  >
                    <badge.icon size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">
                      {badge.label}
                    </div>
                    <div className="text-xs text-white/60">{badge.sublabel}</div>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg"
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="text-white fill-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">4.9 / 5</div>
                  <div className="text-xs text-white/80">
                    {t.home.reviewsCount}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
