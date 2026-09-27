"use client";

import { useRouter } from "next/navigation";
import { Mic, PenLine, Sparkles, Tag, Zap } from "lucide-react";
import type { FlightCopy } from "@/components/flights/copy";
import { SEARCH_AGENT_MODE_KEY } from "@/lib/search-agent";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Props = { copy: FlightCopy };

export default function FlightSmartBookingSection({ copy }: Props) {
  const { dir } = useLocale();
  const router = useRouter();

  const openAgent = (voice: boolean) => {
    try {
      localStorage.setItem(SEARCH_AGENT_MODE_KEY, "1");
    } catch {
      /* ignore */
    }
    router.push(voice ? "/flights?ai=1&voice=1" : "/flights?ai=1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cards = [
    {
      icon: <PenLine size={22} />,
      title: copy.whySupport,
      body: copy.whySupportBody,
      tone: "from-[#2e1065] to-[#4c1d95] text-white",
    },
    {
      icon: <Mic size={22} />,
      title: copy.smartVoiceTitle,
      body: copy.smartVoiceBody,
      tone: "from-amber-400 to-amber-500 text-slate-950",
    },
    {
      icon: <Tag size={22} />,
      title: copy.whyPrice,
      body: copy.whyPriceBody,
      tone: "from-[#1e1b4b] to-[#2e1065] text-white",
    },
    {
      icon: <Zap size={22} />,
      title: copy.whyEasy,
      body: copy.whyEasyBody,
      tone: "from-white to-purple-50 text-[#1e1b4b] border border-purple-100",
    },
  ];

  return (
    <section className="pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-900">
            <Sparkles size={13} />
            Lonaliza Smart Booking
          </span>
          <h2 className="text-2xl font-black text-purple-950 md:text-3xl">{copy.whyTitle}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
            {copy.smartSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <article
              key={card.title}
              className={`rounded-3xl bg-gradient-to-br p-5 shadow-sm ${card.tone}`}
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                {card.icon}
              </div>
              <h3 className="text-lg font-black">{card.title}</h3>
              <p className="mt-1.5 text-sm font-medium leading-relaxed opacity-90">{card.body}</p>
            </article>
          ))}
        </div>
        <div className={`mt-6 flex flex-wrap items-center justify-center gap-3 ${dir === "rtl" ? "" : ""}`}>
          <button
            type="button"
            onClick={() => openAgent(false)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-5 py-3 text-sm font-black text-white shadow-md active:scale-95"
          >
            <PenLine size={16} />
            {copy.smartCtaType}
          </button>
          <button
            type="button"
            onClick={() => openAgent(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-sm font-black text-slate-950 shadow-md active:scale-95"
          >
            <Mic size={16} />
            {copy.smartCtaVoice}
          </button>
        </div>
      </div>
    </section>
  );
}
