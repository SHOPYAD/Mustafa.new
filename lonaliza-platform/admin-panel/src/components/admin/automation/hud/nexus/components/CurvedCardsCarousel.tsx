"use client";

import React, { useMemo, useRef, memo, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import type { HubMetrics } from "../NexusSystemCard";
import { HolographicGlassCard } from "./HolographicGlassCard";

import { rotarySound } from "../utils/soundEngine";

export interface CurvedCardsCarouselProps {
  cards: NexusHubCard[];
  activeIndex: number;
  metricsByHub: Record<string, HubMetrics>;
  summaryMetrics?: Record<string, { value: string; label: string; trend?: string }>;
  onRotate: (delta: number) => void;
  onOpen: (card: NexusHubCard) => void;
  onQuick?: (card: NexusHubCard) => void;
}

export const CurvedCardsCarousel = memo(function CurvedCardsCarousel({
  cards,
  activeIndex,
  metricsByHub,
  summaryMetrics,
  onRotate,
  onOpen,
  onQuick,
}: CurvedCardsCarouselProps) {
  const total = cards.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTickTime = useRef<number>(0);

  const rotateWithFeedback = useCallback(
    (delta: number) => {
      const now = Date.now();
      if (now - lastTickTime.current > 30) {
        rotarySound.playRotaryTick();
        lastTickTime.current = now;
      }
      onRotate(delta);
    },
    [onRotate]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        rotateWithFeedback(-1);
      } else if (e.key === "ArrowRight") {
        rotateWithFeedback(1);
      } else if (e.key === " " || e.key === "Enter") {
        if (cards[activeIndex]) {
          onOpen(cards[activeIndex]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, cards, onOpen, rotateWithFeedback]);

  // Compute the 5 visible cards in the wide continuous 3D cylindrical arc (Matching Image 3)
  // Offsets: -2, -1, 0, 1, 2
  const visibleCards = useMemo(() => {
    if (total === 0) return [];
    const offsets = [-2, -1, 0, 1, 2];
    return offsets.map((offset) => {
      const index = (activeIndex + offset + total * 100) % total;
      return {
        card: cards[index],
        offset,
        index,
      };
    });
  }, [activeIndex, cards, total]);

  // Mouse Drag gesture tracking for smooth rotation
  const dragX = useMotionValue(0);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 35;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset < -threshold || velocity < -180) {
      rotateWithFeedback(1); // Next card
    } else if (offset > threshold || velocity > 180) {
      rotateWithFeedback(-1); // Previous card
    }
  };

  // Wheel horizontal scroll handler with momentum
  const wheelAccumRef = useRef<number>(0);
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wheelAccumRef.current += delta;
      if (Math.abs(wheelAccumRef.current) > 30) {
        if (wheelAccumRef.current > 0) {
          rotateWithFeedback(1);
        } else {
          rotateWithFeedback(-1);
        }
        wheelAccumRef.current = 0;
      }
    },
    [rotateWithFeedback]
  );

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="pointer-events-auto relative flex h-[480px] w-full max-w-[960px] flex-col items-center justify-center select-none"
      style={{ perspective: 1400 }}
    >
      {/* Curved 3D Arc Card Deck Container */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDragEnd={handleDragEnd}
        className="relative flex h-[350px] w-full items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ transformStyle: "preserve-3d" }}
      >
        <AnimatePresence initial={false}>
          {visibleCards.map(({ card, offset, index }) => {
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);

            // True 3D Cylindrical Arc Parabolic Coordinates matching Master Reference Image
            let xPos = 0;
            let yPos = 0;
            let zPos = 0;
            let rotY = 0;
            let scale = 1;
            let opacity = 1;

            if (offset === 0) {
              // Center card: MARKETS (elevated and in front)
              xPos = 0;
              yPos = 0;
              zPos = 40;
              rotY = 0;
              scale = 1.04;
              opacity = 1;
            } else if (absOffset === 1) {
              // Near Left (HOTELS) and Near Right (PROJECTS)
              xPos = offset * 155;
              yPos = 12;
              zPos = 0;
              rotY = offset * -20; // Left cards face right (+20), right cards face left (-20)
              scale = 0.94;
              opacity = 0.98;
            } else {
              // Far Left (FLIGHTS) and Far Right (SOCIAL) - exact coordinates: -295 and +295
              xPos = offset > 0 ? 295 : -295;
              yPos = 24;
              zPos = -40;
              rotY = offset > 0 ? -32 : 32; // Left cards face right (+32), right cards face left (-32)
              scale = 0.86;
              opacity = 0.92;
            }

            return (
              <motion.div
                key={card.id}
                className="absolute flex items-center justify-center"
                style={{
                  zIndex: 35 - absOffset * 4,
                  transformStyle: "preserve-3d",
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  x: xPos,
                  y: yPos,
                  z: zPos,
                  rotateY: rotY,
                  scale,
                  opacity,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 27,
                  mass: 0.55,
                }}
              >
                {/* Center Card Radiant Holographic Ambient Glow Aura */}
                {isCenter && (
                  <div
                    className="pointer-events-none absolute -inset-10 rounded-[36px] opacity-75 blur-2xl transition-all"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.45) 0%, rgba(0, 240, 255, 0.3) 50%, transparent 75%)",
                    }}
                  />
                )}

                {/* Primary 3D Holographic Glass Card */}
                <HolographicGlassCard
                  card={card}
                  index={index}
                  total={total}
                  isFocused={isCenter}
                  slotOffset={offset}
                  metrics={metricsByHub[card.hubId]}
                  summaryMetrics={summaryMetrics}
                  onOpen={onOpen}
                  onQuick={onQuick}
                />

                {/* Inverted 3D Floor Reflection - Lying Flat Looking Upwards (Matching Image 3) */}
                <div
                  className="pointer-events-none absolute top-[98%] left-0 right-0 h-[180px] overflow-hidden rounded-b-[24px]"
                  style={{
                    transform: "rotateX(70deg)",
                    transformOrigin: "top center",
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, transparent 92%)",
                    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, transparent 92%)",
                    filter: isCenter ? "blur(1.5px) brightness(0.9)" : "blur(2.5px) brightness(0.7)",
                    opacity: isCenter ? 0.75 : 0.5,
                  }}
                >
                  <div
                    style={{
                      transform: "scaleY(-1)",
                      transformOrigin: "50% 167px",
                    }}
                  >
                    <HolographicGlassCard
                      card={card}
                      index={index}
                      total={total}
                      isFocused={false}
                      slotOffset={offset}
                      metrics={metricsByHub[card.hubId]}
                      summaryMetrics={summaryMetrics}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Left Navigation Chevron Button (Positioned comfortably outside Card 01) */}
      <button
        type="button"
        onClick={() => rotateWithFeedback(-1)}
        className="group absolute -left-12 top-1/2 z-40 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-[#020b18]/80 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.25)] backdrop-blur-md transition-all hover:scale-110 hover:border-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_25px_#00f0ff] active:scale-95"
        aria-label="البطاقة السابقة"
      >
        <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* Right Navigation Chevron Button (Positioned comfortably outside Card 05) */}
      <button
        type="button"
        onClick={() => rotateWithFeedback(1)}
        className="group absolute -right-12 top-1/2 z-40 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-[#020b18]/80 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.25)] backdrop-blur-md transition-all hover:scale-110 hover:border-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_25px_#00f0ff] active:scale-95"
        aria-label="البطاقة التالية"
      >
        <ChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
});

export default CurvedCardsCarousel;
