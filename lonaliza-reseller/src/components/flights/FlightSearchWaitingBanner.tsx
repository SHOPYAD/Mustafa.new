"use client";

import { useEffect, useState } from "react";
import { Plane, Sparkles } from "lucide-react";
import type { FlightCopy } from "@/components/flights/copy";

type Props = {
  copy: FlightCopy;
};

export default function FlightSearchWaitingBanner({ copy }: Props) {
  const messages = copy.waitingMessages.length ? copy.waitingMessages : [copy.searching];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="flight-wait-banner relative mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#051741] to-[#0a2a4a] p-5 text-white shadow-[0_18px_40px_rgba(5,23,65,0.28)] md:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="flight-wait-glow absolute -end-10 -top-16 h-40 w-40 rounded-full bg-[#10b981]/40 blur-3xl" />
        <div className="flight-wait-glow-delayed absolute -bottom-16 -start-8 h-36 w-36 rounded-full bg-sky-400/25 blur-3xl" />
      </div>
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-emerald-200">
            <Sparkles size={13} className="text-[#10b981]" />
            {copy.searching}
          </div>
          <div className="hidden text-[11px] font-semibold text-white/55 sm:block">Alrayyan · Live search</div>
        </div>

        <div className="relative h-14 overflow-hidden md:h-16">
          {messages.map((message, i) => (
            <p
              key={message}
              className={`absolute inset-x-0 text-xl font-bold leading-snug md:text-2xl ${
                i === index ? "flight-wait-line-in" : "pointer-events-none opacity-0"
              }`}
            >
              {message}
            </p>
          ))}
        </div>

        <div className="relative mt-5 h-12">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-l from-transparent via-[#10b981] to-transparent" />
          <div className="flight-wait-plane absolute top-1/2 text-[#10b981]">
            <Plane size={22} />
          </div>
          <span className="flight-wait-dot absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/80" />
          <span className="flight-wait-dot-2 absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-300" />
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="flight-wait-bar h-full w-1/3 rounded-full bg-gradient-to-l from-[#10b981] to-emerald-200" />
        </div>
      </div>
    </div>
  );
}
