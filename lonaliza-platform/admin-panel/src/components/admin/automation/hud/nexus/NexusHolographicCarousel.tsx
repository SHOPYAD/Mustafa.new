"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NEXUS_HUB_CARDS, type NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import { NexusSystemCard, type HubMetrics } from "./NexusSystemCard";

const WINDOW = 3;

type Props = {
  activeIndex: number;
  metricsByHub: Record<string, HubMetrics>;
  onRotate: (delta: number) => void;
  onOpen: (card: NexusHubCard) => void;
  onQuick: (card: NexusHubCard) => void;
};

export function NexusHolographicCarousel({ activeIndex, metricsByHub, onRotate, onOpen, onQuick }: Props) {
  const total = NEXUS_HUB_CARDS.length;
  const visible = useMemo(() => {
    const out: { card: NexusHubCard; offset: number; index: number }[] = [];
    for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
      const index = (activeIndex + offset + total) % total;
      out.push({ card: NEXUS_HUB_CARDS[index], offset, index });
    }
    return out;
  }, [activeIndex, total]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
      <div className="pointer-events-auto relative h-[340px] w-full max-w-[1100px]" style={{ perspective: 1400 }}>
        {visible.map(({ card, offset, index }) => {
          const abs = Math.abs(offset);
          const focused = offset === 0;
          return (
            <motion.div
              key={card.id}
              className="absolute left-1/2 top-1/2 h-[300px] w-[220px]"
              style={{ zIndex: 20 - abs, pointerEvents: focused ? "auto" : "none" }}
              animate={{
                x: offset * 168 - 110,
                y: abs * 10 - 150,
                rotateY: offset * -18,
                scale: focused ? 1 : 0.82 - abs * 0.04,
                opacity: abs > 2 ? 0.35 : 1,
                filter: focused ? "blur(0px)" : `blur(${abs * 0.6}px)`,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <NexusSystemCard
                card={card}
                index={index}
                total={total}
                focused={focused}
                metrics={metricsByHub[card.hubId]}
                onOpen={() => onOpen(card)}
                onQuick={() => onQuick(card)}
              />
            </motion.div>
          );
        })}
      </div>
      <div className="pointer-events-auto mt-2 flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-[#020b18]/90 px-3 py-1.5 font-mono text-xs text-cyan-100">
        <button type="button" onClick={() => onRotate(-1)} className="rounded-lg p-1 hover:bg-cyan-500/15" aria-label="السابق">
          <ChevronRight size={16} />
        </button>
        <span>
          {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => onRotate(1)} className="rounded-lg p-1 hover:bg-cyan-500/15" aria-label="التالي">
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
}
