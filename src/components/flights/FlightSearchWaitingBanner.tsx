"use client";

import { useEffect, useState } from "react";
import { Plane, Sparkles } from "lucide-react";
import type { FlightCopy } from "@/components/flights/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Props = {
  copy: FlightCopy;
};

export default function FlightSearchWaitingBanner({ copy }: Props) {
  const { locale } = useLocale();
  const messages = copy.waitingMessages.length ? copy.waitingMessages : [copy.searching];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="flight-wait-banner relative mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b053a] via-[#2e1065] to-[#3b0764] border border-amber-400/25 p-5 text-white shadow-[0_20px_50px_rgba(46,16,101,0.35)] md:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="flight-wait-glow absolute -end-10 -top-16 h-48 w-48 rounded-full bg-amber-500/30 blur-3xl" />
        <div className="flight-wait-glow-delayed absolute -bottom-16 -start-8 h-44 w-44 rounded-full bg-purple-500/30 blur-3xl" />
      </div>
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/30 px-3 py-1 text-[11px] font-bold text-amber-300">
            <Sparkles size={13} className="text-amber-400 animate-pulse" />
            {copy.searching}
          </div>
          <div className="hidden text-[11px] font-bold text-amber-300/80 sm:block">
            {locale === "ar"
              ? "لوناليزا · بث مباشر للأسعار من أكثر من 500 شركة طيران"
              : "Lonaliza · Live search across 500+ global airlines"}
          </div>
        </div>

        <div className="relative h-14 overflow-hidden md:h-16">
          {messages.map((message, i) => (
            <p
              key={message}
              className={`absolute inset-x-0 text-xl font-black leading-snug md:text-2xl text-white drop-shadow-sm ${
                i === index ? "flight-wait-line-in" : "pointer-events-none opacity-0"
              }`}
            >
              {message}
            </p>
          ))}
        </div>

        <div className="relative mt-5 h-12">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-l from-transparent via-amber-400 to-transparent" />
          <div className="flight-wait-plane absolute top-1/2 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]">
            <Plane size={24} />
          </div>
          <span className="flight-wait-dot absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/90 ring-2 ring-amber-400/40" />
          <span className="flight-wait-dot-2 absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-amber-400 ring-2 ring-amber-300/50" />
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="flight-wait-bar h-full w-1/3 rounded-full bg-gradient-to-l from-amber-400 via-amber-300 to-purple-400 shadow-sm" />
        </div>
      </div>
    </div>
  );
}
