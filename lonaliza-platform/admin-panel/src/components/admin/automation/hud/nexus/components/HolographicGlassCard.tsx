"use client";

import React, { useRef, memo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Plane,
  Building2,
  TrendingUp,
  Server,
  Users,
  Car,
  Compass,
  ShieldCheck,
  Cpu,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import type { NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import type { HubMetrics } from "../NexusSystemCard";

export type HoloVisualType =
  | "flights"
  | "hotels"
  | "markets"
  | "projects"
  | "cars"
  | "tours"
  | "social"
  | "security";

export interface CardThematicVisual {
  badgeNum: string;
  themeColor: string; // cyan, gold, amber, purple, magenta, emerald
  borderHex: string;
  glowHex: string;
  icon: LucideIcon;
  visualType: HoloVisualType;
  primaryMetricVal: string;
  primaryMetricLabel: string;
  badgePercent: string;
  badgeIsPositive: boolean;
}

export interface HolographicGlassCardProps {
  card: NexusHubCard;
  index: number;
  total: number;
  isFocused: boolean;
  slotOffset?: number;
  metrics?: HubMetrics | null;
  summaryMetrics?: Record<string, { value: string; label: string; trend?: string }>;
  onOpen?: (card: NexusHubCard) => void;
  onQuick?: (card: NexusHubCard) => void;
  customVisual?: Partial<CardThematicVisual>;
}

// Resolver that precisely maps each of the 15 Primary Domain cards to dedicated 3D visual type & live metrics
export function resolveVisualForCard(
  card: NexusHubCard,
  index: number,
  _slotOffset?: number,
  summaryMetrics?: Record<string, { value: string; label: string; trend?: string }>,
  metrics?: HubMetrics | null
): CardThematicVisual {
  const badgeNum = String(index + 1).padStart(2, "0");
  const hubId = (card.hubId || card.id).toLowerCase();

  // 1. FLIGHTS
  if (hubId.includes("flight")) {
    const flightData = summaryMetrics?.flights;
    return {
      badgeNum,
      themeColor: "cyan",
      borderHex: "#00e5ff",
      glowHex: "rgba(0, 229, 255, 0.9)",
      icon: Plane,
      visualType: "flights",
      primaryMetricVal: flightData?.value || (metrics?.recordsPct ? `${metrics.recordsPct * 14}` : "1,316"),
      primaryMetricLabel: flightData?.label || "رحلات وبحث نشط",
      badgePercent: flightData?.trend || "+8.4%",
      badgeIsPositive: true,
    };
  }

  // 2. HOTELS
  if (hubId.includes("hotel")) {
    const hotelData = summaryMetrics?.hotels;
    return {
      badgeNum,
      themeColor: "amber",
      borderHex: "#ffb703",
      glowHex: "rgba(255, 183, 3, 0.9)",
      icon: Building2,
      visualType: "hotels",
      primaryMetricVal: hotelData?.value || (metrics?.recordsPct ? `${metrics.recordsPct * 9}` : "870"),
      primaryMetricLabel: hotelData?.label || "فنادق وإقامة معتمدة",
      badgePercent: hotelData?.trend || "+6.1%",
      badgeIsPositive: true,
    };
  }

  // 3. MARKETS
  if (hubId.includes("market")) {
    const marketData = summaryMetrics?.markets;
    return {
      badgeNum,
      themeColor: "gold",
      borderHex: "#ffd700",
      glowHex: "rgba(255, 215, 0, 0.95)",
      icon: TrendingUp,
      visualType: "markets",
      primaryMetricVal: marketData?.value || "51,820",
      primaryMetricLabel: marketData?.label || "نقطة بيانات حية",
      badgePercent: marketData?.trend || "+15.6%",
      badgeIsPositive: true,
    };
  }

  // 4. BOOKINGS & OPERATIONS
  if (hubId.includes("booking")) {
    return {
      badgeNum,
      themeColor: "purple",
      borderHex: "#a855f7",
      glowHex: "rgba(168, 85, 247, 0.9)",
      icon: Sparkles,
      visualType: "tours",
      primaryMetricVal: "347",
      primaryMetricLabel: "حجوزات وعمليات",
      badgePercent: "+15.0%",
      badgeIsPositive: true,
    };
  }

  // 5. MOBILITY & TOURS
  if (hubId.includes("mobility") || hubId.includes("car") || hubId.includes("tour")) {
    const carsData = summaryMetrics?.["mobility.cars"];
    return {
      badgeNum,
      themeColor: "emerald",
      borderHex: "#10b981",
      glowHex: "rgba(16, 185, 129, 0.9)",
      icon: Car,
      visualType: "cars",
      primaryMetricVal: carsData?.value || "24",
      primaryMetricLabel: carsData?.label || "أسطول VIP نشط",
      badgePercent: carsData?.trend || "+12.4%",
      badgeIsPositive: true,
    };
  }

  // 6. CONTENT STUDIO & APPS
  if (hubId.includes("content")) {
    return {
      badgeNum,
      themeColor: "cyan",
      borderHex: "#38bdf8",
      glowHex: "rgba(56, 189, 248, 0.9)",
      icon: Compass,
      visualType: "tours",
      primaryMetricVal: "142",
      primaryMetricLabel: "مقالات وسجلات",
      badgePercent: "+8.0%",
      badgeIsPositive: true,
    };
  }

  // 7. CRM & CUSTOMERS
  if (hubId.includes("crm")) {
    return {
      badgeNum,
      themeColor: "magenta",
      borderHex: "#f43f5e",
      glowHex: "rgba(244, 63, 94, 0.9)",
      icon: Users,
      visualType: "social",
      primaryMetricVal: "1,248",
      primaryMetricLabel: "عملاء مسجلين",
      badgePercent: "+18.2%",
      badgeIsPositive: true,
    };
  }

  // 8. OMNICHANNEL & SOCIAL
  if (hubId.includes("social")) {
    const socialData = summaryMetrics?.social;
    return {
      badgeNum,
      themeColor: "magenta",
      borderHex: "#e11d48",
      glowHex: "rgba(225, 29, 72, 0.9)",
      icon: Users,
      visualType: "social",
      primaryMetricVal: socialData?.value || "3,440",
      primaryMetricLabel: socialData?.label || "تفاعلات شبكية",
      badgePercent: socialData?.trend || "+9.7%",
      badgeIsPositive: true,
    };
  }

  // 9. MARKETING & GROWTH
  if (hubId.includes("marketing")) {
    return {
      badgeNum,
      themeColor: "gold",
      borderHex: "#f59e0b",
      glowHex: "rgba(245, 158, 11, 0.9)",
      icon: TrendingUp,
      visualType: "markets",
      primaryMetricVal: "28.4K",
      primaryMetricLabel: "حملات ونمو",
      badgePercent: "+11.5%",
      badgeIsPositive: true,
    };
  }

  // 10. AI AGENT WAR ROOM
  if (hubId.includes("warroom") || hubId.includes("agent")) {
    return {
      badgeNum,
      themeColor: "cyan",
      borderHex: "#06b6d4",
      glowHex: "rgba(6, 182, 212, 0.9)",
      icon: Cpu,
      visualType: "projects",
      primaryMetricVal: "12",
      primaryMetricLabel: "سرب الوكلاء",
      badgePercent: "Optimal",
      badgeIsPositive: true,
    };
  }

  // 11. AUTOMATION & WORKFLOWS
  if (hubId.includes("automation")) {
    const projectData = summaryMetrics?.projects;
    return {
      badgeNum,
      themeColor: "purple",
      borderHex: "#818cf8",
      glowHex: "rgba(129, 140, 248, 0.9)",
      icon: Server,
      visualType: "projects",
      primaryMetricVal: projectData?.value || "76",
      primaryMetricLabel: "أدوات وخوادم MCP",
      badgePercent: projectData?.trend || "+5.3%",
      badgeIsPositive: true,
    };
  }

  // 12. FINANCE & COMMERCE
  if (hubId.includes("finance")) {
    return {
      badgeNum,
      themeColor: "gold",
      borderHex: "#eab308",
      glowHex: "rgba(234, 179, 8, 0.9)",
      icon: TrendingUp,
      visualType: "markets",
      primaryMetricVal: "$84.2K",
      primaryMetricLabel: "حجم المعاملات",
      badgePercent: "+14.8%",
      badgeIsPositive: true,
    };
  }

  // 13. B2B RESELLER NETWORK
  if (hubId.includes("resale")) {
    return {
      badgeNum,
      themeColor: "cyan",
      borderHex: "#22d3ee",
      glowHex: "rgba(34, 211, 238, 0.9)",
      icon: Building2,
      visualType: "hotels",
      primaryMetricVal: "32",
      primaryMetricLabel: "شركاء التوزيع",
      badgePercent: "+10.0%",
      badgeIsPositive: true,
    };
  }

  // 14. SECURITY & COMPLIANCE
  if (hubId.includes("compliance") || hubId.includes("legal") || hubId.includes("security")) {
    return {
      badgeNum,
      themeColor: "magenta",
      borderHex: "#ec4899",
      glowHex: "rgba(236, 72, 153, 0.9)",
      icon: ShieldCheck,
      visualType: "security",
      primaryMetricVal: "98.5%",
      primaryMetricLabel: "مؤشر الامتثال",
      badgePercent: "Secure",
      badgeIsPositive: true,
    };
  }

  // 15. SETTINGS & MCP
  return {
    badgeNum,
    themeColor: "purple",
    borderHex: "#6366f1",
    glowHex: "rgba(99, 102, 241, 0.9)",
    icon: Server,
    visualType: "projects",
    primaryMetricVal: "21 Tools",
    primaryMetricLabel: "أدوات وخوادم MCP",
    badgePercent: "Active",
    badgeIsPositive: true,
  };
}

// 3D Cybernetic / Neon Holographic Visual Generator for Cards (NO RANDOM PHOTOS)
function Card3DHoloVisual({
  type,
  color,
  glow,
}: {
  type: HoloVisualType;
  color: string;
  glow: string;
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center select-none overflow-hidden">
      {/* 1. FLIGHTS: 3D Supersonic Holographic Jet with Plasma Contrails */}
      {type === "flights" && (
        <div className="relative flex h-full w-full items-center justify-center">
          <svg className="h-20 w-32 filter drop-shadow-[0_0_12px_#00f0ff]" viewBox="0 0 140 80" fill="none">
            {/* Navigational Vector Radar Ring */}
            <ellipse cx="70" cy="40" rx="55" ry="24" stroke="#00f0ff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
            <line x1="15" y1="40" x2="125" y2="40" stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.3" />

            {/* Glowing Twin Plasma Contrails */}
            <path d="M20,52 Q45,46 64,43" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            <path d="M22,32 Q46,36 64,39" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

            {/* 3D Supersonic Jet Body */}
            <path
              d="M120,40 L70,30 L64,16 L56,18 L62,32 L36,36 L30,28 L24,29 L28,40 L24,51 L30,52 L36,44 L62,48 L56,62 L64,64 L70,50 Z"
              fill="url(#jetGradCyan)"
              stroke="#00f0ff"
              strokeWidth="1.2"
            />
            {/* Cockpit Canopy */}
            <ellipse cx="94" cy="40" rx="9" ry="2.8" fill="#ffffff" opacity="0.9" />

            <defs>
              <linearGradient id="jetGradCyan" x1="20" y1="40" x2="120" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#005577" />
                <stop offset="0.6" stopColor="#00e5ff" stopOpacity="0.85" />
                <stop offset="1" stopColor="#ffffff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* 2. HOTELS: 3D Holographic Luxury Tower Resort */}
      {type === "hotels" && (
        <div className="relative flex h-full w-full items-center justify-center">
          <svg className="h-20 w-32 filter drop-shadow-[0_0_12px_#ffb703]" viewBox="0 0 140 80" fill="none">
            {/* Ground Elevation Grid */}
            <ellipse cx="70" cy="65" rx="50" ry="12" stroke="#ffb703" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />

            {/* Central High-Rise Tower (Isometric 3D) */}
            <path d="M55,14 L85,14 L85,62 L55,62 Z" fill="#041224" stroke="#ffb703" strokeWidth="1.2" />
            <path d="M85,14 L100,24 L100,60 L85,62 Z" fill="#ffb703" fillOpacity="0.15" stroke="#ffb703" strokeWidth="1" />
            <path d="M55,14 L70,4 L100,24 L85,14 Z" fill="#ffd700" fillOpacity="0.3" stroke="#ffb703" strokeWidth="1" />

            {/* Glowing Floor Windows Slabs */}
            {[22, 30, 38, 46, 54].map((y, i) => (
              <line key={i} x1="59" y1={y} x2="81" y2={y} stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
            ))}

            {/* Rooftop Holographic Crown Spire */}
            <line x1="70" y1="4" x2="70" y2="-6" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="70" cy="-6" r="2.5" fill="#ffd700" />
          </svg>
        </div>
      )}

      {/* 3. MARKETS: 3D Radiant Volumetric Candlestick Pillars + Laser Trend Spline */}
      {type === "markets" && (
        <div className="relative flex h-full w-full items-center justify-center">
          {/* Volumetric 3D Pillars */}
          <div className="flex items-end gap-2.5 h-16 w-32 justify-center relative">
            {[42, 68, 54, 88, 100].map((h, bIdx) => (
              <div
                key={bIdx}
                className="w-3.5 rounded-t-sm transition-all duration-300 relative"
                style={{
                  height: `${h}%`,
                  background: "linear-gradient(to top, #d97706, #ffd700, #ffffff)",
                  boxShadow: "0 0 14px rgba(255, 215, 0, 0.8)",
                }}
              >
                <div className="absolute -top-1 inset-x-0 h-1 bg-white rounded-t-sm shadow-[0_0_6px_#ffffff]" />
              </div>
            ))}

            {/* Cutting Cyan Trend Wave Spline */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 120 70">
              <path
                d="M 10 52 Q 35 18, 62 38 T 112 16"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.8"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 8px #00f0ff)" }}
              />
              <circle cx="112" cy="16" r="3.5" fill="#ffffff" stroke="#00f0ff" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      )}

      {/* 4. PROJECTS / MCP: 3D Quantum Neural Server Blades Rack */}
      {type === "projects" && (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          <div className="flex flex-col gap-1.5 items-center">
            {[0, 1, 2].map((sIdx) => (
              <div
                key={sIdx}
                className="flex h-5 w-32 items-center justify-between rounded-md border px-2.5 backdrop-blur-md"
                style={{
                  borderColor: "rgba(129, 140, 248, 0.6)",
                  background: "linear-gradient(90deg, rgba(99, 102, 241, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)",
                  boxShadow: "0 0 12px rgba(129, 140, 248, 0.35)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f0ff]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                </div>
                <div className="h-1.5 w-14 rounded bg-indigo-400/40" />
              </div>
            ))}
          </div>
          {/* Laser Data Bus */}
          <svg className="absolute bottom-1 inset-x-0 h-8 w-full" viewBox="0 0 100 24">
            <path
              d="M0,18 Q25,4 50,14 T100,10"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2.2"
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 8px #818cf8)" }}
            />
          </svg>
        </div>
      )}

      {/* 5. CARS / FLEET: 3D Holographic Luxury Speedster Chassis */}
      {type === "cars" && (
        <div className="relative flex h-full w-full items-center justify-center">
          <svg className="h-20 w-32 filter drop-shadow-[0_0_12px_#10b981]" viewBox="0 0 140 80" fill="none">
            {/* Speed Grid Ground */}
            <line x1="10" y1="62" x2="130" y2="62" stroke="#10b981" strokeWidth="0.8" opacity="0.4" />
            <line x1="20" y1="66" x2="120" y2="66" stroke="#10b981" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.3" />

            {/* Aerodynamic Luxury Car Body (Isometric) */}
            <path
              d="M18,52 L26,42 L52,38 L76,26 L108,30 L126,44 L124,54 L114,56 L100,56 L94,48 L46,48 L40,56 L24,56 Z"
              fill="url(#carGradEmerald)"
              stroke="#10b981"
              strokeWidth="1.4"
            />
            {/* Windshield & Cabin */}
            <path d="M54,38 L75,28 L104,32 L94,42 L50,42 Z" fill="#041224" stroke="#10b981" strokeWidth="0.8" />

            {/* Glowing Wheels */}
            <circle cx="38" cy="54" r="7" fill="#020b18" stroke="#10b981" strokeWidth="2" />
            <circle cx="38" cy="54" r="2.5" fill="#34d399" />
            <circle cx="106" cy="54" r="7" fill="#020b18" stroke="#10b981" strokeWidth="2" />
            <circle cx="106" cy="54" r="2.5" fill="#34d399" />

            {/* Laser Headlights */}
            <line x1="126" y1="46" x2="138" y2="48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

            <defs>
              <linearGradient id="carGradEmerald" x1="20" y1="45" x2="125" y2="45" gradientUnits="userSpaceOnUse">
                <stop stopColor="#064e3b" />
                <stop offset="0.6" stopColor="#10b981" stopOpacity="0.85" />
                <stop offset="1" stopColor="#6ee7b7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* 6. TOURS / DESTINATIONS: 3D Holographic Gimbaled Compass Rose */}
      {type === "tours" && (
        <div className="relative flex h-full w-full items-center justify-center">
          <svg className="h-20 w-32 filter drop-shadow-[0_0_12px_#ffd700]" viewBox="0 0 140 80" fill="none">
            {/* Outer Gimbal Ring */}
            <ellipse cx="70" cy="40" rx="42" ry="26" stroke="#ffd700" strokeWidth="1" strokeDasharray="4 2" opacity="0.7" />
            {/* Inner Ring */}
            <ellipse cx="70" cy="40" rx="28" ry="16" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />

            {/* 3D 4-Point Compass Star */}
            <path d="M70,14 L75,37 L98,40 L75,43 L70,66 L65,43 L42,40 L65,37 Z" fill="url(#toursGradGold)" stroke="#ffd700" strokeWidth="1" />
            <circle cx="70" cy="40" r="3" fill="#ffffff" />

            <defs>
              <linearGradient id="toursGradGold" x1="42" y1="40" x2="98" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#d97706" />
                <stop offset="0.5" stopColor="#fef08a" />
                <stop offset="1" stopColor="#ffd700" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* 7. SOCIAL / COMMUNITY: 3D Orbital Synaptic Node Network */}
      {(type === "social" || type === "security") && (
        <div className="relative flex h-full w-full items-center justify-center">
          <svg className="h-20 w-32 filter drop-shadow-[0_0_14px_#f43f5e]" viewBox="0 0 140 80" fill="none">
            {/* Orbital Rings */}
            <ellipse cx="70" cy="40" rx="46" ry="18" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" transform="rotate(-15 70 40)" />
            <ellipse cx="70" cy="40" rx="46" ry="18" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" transform="rotate(25 70 40)" />

            {/* Central Core Quantum Node */}
            <circle cx="70" cy="40" r="10" fill="#031124" stroke="#f43f5e" strokeWidth="2" />
            <circle cx="70" cy="40" r="4.5" fill="#f43f5e" />

            {/* Orbiting Satellite Nodes */}
            <circle cx="34" cy="30" r="4" fill="#fda4af" stroke="#f43f5e" strokeWidth="1" />
            <circle cx="106" cy="50" r="4" fill="#fda4af" stroke="#f43f5e" strokeWidth="1" />
            <circle cx="92" cy="24" r="3" fill="#ffffff" />
          </svg>
        </div>
      )}
    </div>
  );
}

export const HolographicGlassCard = memo(function HolographicGlassCard({
  card,
  index,
  isFocused,
  slotOffset,
  metrics,
  summaryMetrics,
  onOpen,
}: HolographicGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const visual = resolveVisualForCard(card, index, slotOffset, summaryMetrics, metrics);
  const IconComp = visual.icon;

  // Interactive 3D mouse parallax tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateXSpring = useSpring(useTransform(mouseY, [0, 1], [8, -8]), {
    stiffness: 280,
    damping: 24,
  });
  const rotateYSpring = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), {
    stiffness: 280,
    damping: 24,
  });

  const glareX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handlePointerLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div
      className="relative select-none"
      style={{
        perspective: 1200,
      }}
    >
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX: isFocused ? rotateXSpring : 0,
          rotateY: isFocused ? rotateYSpring : 0,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={() => onOpen?.(card)}
        className="group relative h-[335px] w-[215px] cursor-pointer rounded-[24px] p-[2px] transition-all duration-300"
      >
        {/* 1. 3D Volumetric Depth Back Rim (Always retains card's unique neon color!) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[24px] transition-all duration-500"
          style={{
            transform: "translateZ(-8px)",
            border: `2px solid ${visual.borderHex}44`,
            background: "rgba(1, 6, 16, 0.95)",
            boxShadow: `0 24px 48px rgba(0,0,0,0.9), 0 0 25px ${visual.glowHex}33`,
          }}
        />

        {/* 2. Outer Glowing Neon Tube Border (Proudly preserves its color even when in front!) */}
        <div
          className="absolute inset-0 rounded-[24px] transition-all duration-500"
          style={{
            border: isFocused ? `2.5px solid ${visual.borderHex}` : `2px solid ${visual.borderHex}`,
            boxShadow: isFocused
              ? `0 0 35px ${visual.glowHex}, 0 0 15px ${visual.borderHex}, inset 0 0 16px ${visual.glowHex}44`
              : `0 0 22px ${visual.glowHex}88, inset 0 0 10px ${visual.borderHex}22`,
            background: `linear-gradient(145deg, ${visual.borderHex}33 0%, rgba(2,11,24,0.7) 45%, ${visual.borderHex}18 100%)`,
          }}
        />

        {/* 3. Beveled Specular Crystal Edge Highlight */}
        <div
          className="pointer-events-none absolute inset-[1.5px] rounded-[22px] z-30"
          style={{
            boxShadow:
              "inset 0 1.5px 2px rgba(255, 255, 255, 0.75), inset 0 -2px 3px rgba(0, 0, 0, 0.8)",
          }}
        />

        {/* 4. Translucent Obsidian Frosted Glass Body */}
        <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[22px] bg-[#020b18]/85 p-3.5 text-white backdrop-blur-2xl">
          {/* Deep Dark Glass Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#01060f] via-[#020b18]/70 to-[#010816]/50" />
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              background: `radial-gradient(circle at 50% 25%, ${visual.borderHex}55, transparent 75%)`,
            }}
          />

          {/* Interactive Foil Specular Glare Layer */}
          {isFocused && (
            <motion.div
              className="pointer-events-none absolute h-32 w-32 rounded-full bg-white/15 blur-xl"
              style={{ left: glareX, top: glareY, x: "-50%", y: "-50%" }}
            />
          )}

          {/* TOP BAR: Mini Icon (Left) + Number Capsule (Right) */}
          <div className="relative z-20 flex items-center justify-between">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg border backdrop-blur-md"
              style={{
                borderColor: `${visual.borderHex}88`,
                backgroundColor: `${visual.borderHex}22`,
                color: visual.borderHex,
                boxShadow: `0 0 10px ${visual.glowHex}`,
              }}
            >
              <IconComp size={13} />
            </div>

            <div className="flex items-center rounded-full border border-white/25 bg-black/70 px-2.5 py-0.5 backdrop-blur-md">
              <span className="font-mono text-[11px] font-black tracking-wider text-white">
                {visual.badgeNum}
              </span>
            </div>
          </div>

          {/* UPPER VISUAL AREA: 100% 3D CYBERNETIC NEON HOLOGRAPHIC VISUAL (ZERO RANDOM PHOTOS!) */}
          <div className="relative z-10 mx-auto my-1 flex h-[105px] w-full items-center justify-center overflow-hidden rounded-xl">
            <Card3DHoloVisual
              type={visual.visualType}
              color={visual.borderHex}
              glow={visual.glowHex}
            />
          </div>

          {/* MIDDLE TYPOGRAPHY: Bold English Title + Arabic Subtitle + Description */}
          <div className="relative z-10 flex flex-col items-center text-center px-1">
            <h3 className="font-sans text-[16px] font-black tracking-widest text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] uppercase">
              {card.titleEn}
            </h3>
            <span className="text-[10.5px] font-bold font-arabic tracking-wide" style={{ color: visual.borderHex }}>
              {card.titleAr}
            </span>
            <p className="mt-1 line-clamp-2 text-[9.5px] leading-tight text-slate-300 font-sans max-w-[175px]">
              {card.description}
            </p>
          </div>

          {/* BOTTOM ROW: Large Metric + Percentage Pill */}
          <div className="relative z-10 border-t border-white/10 pt-2 flex items-end justify-between">
            <div>
              <span className="block text-[8px] font-mono uppercase tracking-wider text-slate-400">
                {visual.primaryMetricLabel}
              </span>
              <span className="text-base font-black font-mono tracking-tight text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
                {visual.primaryMetricVal}
              </span>
            </div>

            <div
              className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-black ${
                visual.badgeIsPositive
                  ? "border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "border border-amber-400/40 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
              }`}
            >
              {visual.badgePercent}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default HolographicGlassCard;
