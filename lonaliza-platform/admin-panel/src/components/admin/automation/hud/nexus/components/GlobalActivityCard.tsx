"use client";

import React, { memo, useState, useRef, useCallback } from "react";
import { Globe, type Marker, type Arc } from "@/components/ui/cobe-globe";
import { Radio, X, MapPin, Activity } from "lucide-react";

export interface GeoVisitorNode {
  id: string;
  name: string;
  country: string;
  location: [number, number]; // [lat, lng]
  visitors: number;
  action: string;
  latency: string;
  duration: string;
  device: string;
}

export interface GlobalActivityCardProps {
  points?: number[];
  liveVisitorsCount?: number;
}

// Global visitor nodes connecting to platform activities
const REAL_VISITOR_NODES: GeoVisitorNode[] = [
  {
    id: "ist",
    name: "إسطنبول (HQ)",
    country: "TR",
    location: [41.0082, 28.9784],
    visitors: 14,
    action: "مقر العمليات وحجوزات الفنادق المباشرة",
    latency: "14ms",
    duration: "18 دقيقة",
    device: "Desktop (Admin/B2B)",
  },
  {
    id: "ruh",
    name: "الرياض",
    country: "SA",
    location: [24.7136, 46.6753],
    visitors: 9,
    action: "حجز طيران الخطوط السعودية وفنادق البوسفور",
    latency: "38ms",
    duration: "12 دقيقة",
    device: "Mobile (iOS)",
  },
  {
    id: "dxb",
    name: "دبي",
    country: "AE",
    location: [25.2048, 55.2708],
    visitors: 8,
    action: "أسطول سيارات VIP مع سائق وباقات يالوفا",
    latency: "35ms",
    duration: "9 دقائق",
    device: "Mobile (Android)",
  },
  {
    id: "kwi",
    name: "الكويت",
    country: "KW",
    location: [29.3759, 47.9774],
    visitors: 5,
    action: "فلل صبنجة وجولات الهيليكوبتر العائلية",
    latency: "41ms",
    duration: "15 دقيقة",
    device: "Desktop",
  },
  {
    id: "doh",
    name: "الدوحة",
    country: "QA",
    location: [25.2854, 51.531],
    visitors: 4,
    action: "باقات شهر العسل وفنادق كابادوكيا الكهفية",
    latency: "43ms",
    duration: "7 دقائق",
    device: "Mobile (iOS)",
  },
  {
    id: "cai",
    name: "القاهرة",
    country: "EG",
    location: [30.0444, 31.2357],
    visitors: 6,
    action: "طلب تأشيرات سياحية واستقبال المطار",
    latency: "32ms",
    duration: "11 دقيقة",
    device: "Mobile",
  },
  {
    id: "lon",
    name: "لندن",
    country: "GB",
    location: [51.5074, -0.1278],
    visitors: 6,
    action: "رحلات طيران بيغاسوس والخطوط التركية",
    latency: "28ms",
    duration: "22 دقيقة",
    device: "Desktop",
  },
  {
    id: "fra",
    name: "فرانكفورت",
    country: "DE",
    location: [50.1109, 8.6821],
    visitors: 4,
    action: "منتجعات أنطاليا الشاطئية الشاملة",
    latency: "26ms",
    duration: "14 دقيقة",
    device: "Desktop",
  },
  {
    id: "par",
    name: "باريس",
    country: "FR",
    location: [48.8566, 2.3522],
    visitors: 3,
    action: "جولات طرابزون وأوزنجول الخاصة",
    latency: "30ms",
    duration: "6 دقائق",
    device: "Mobile",
  },
  {
    id: "cas",
    name: "الدار البيضاء",
    country: "MA",
    location: [33.5731, -7.5898],
    visitors: 3,
    action: "دليل التسوق وجولات بورصة التاريخية",
    latency: "48ms",
    duration: "8 دقائق",
    device: "Mobile",
  },
  {
    id: "nyc",
    name: "نيويورك",
    country: "US",
    location: [40.7128, -74.006],
    visitors: 4,
    action: "بوابة الربط B2B ومزامنة الفنادق",
    latency: "82ms",
    duration: "30 دقيقة",
    device: "Desktop",
  },
];

// Glowing Neon Arcs connecting worldwide hubs to Istanbul HQ
const REAL_TRAVEL_ARCS: Arc[] = [
  { id: "ruh-ist", from: [24.7136, 46.6753], to: [41.0082, 28.9784] },
  { id: "dxb-ist", from: [25.2048, 55.2708], to: [41.0082, 28.9784] },
  { id: "kwi-ist", from: [29.3759, 47.9774], to: [41.0082, 28.9784] },
  { id: "doh-ist", from: [25.2854, 51.531], to: [41.0082, 28.9784] },
  { id: "cai-ist", from: [30.0444, 31.2357], to: [41.0082, 28.9784] },
  { id: "lon-ist", from: [51.5074, -0.1278], to: [41.0082, 28.9784] },
  { id: "fra-ist", from: [50.1109, 8.6821], to: [41.0082, 28.9784] },
  { id: "nyc-ist", from: [40.7128, -74.006], to: [41.0082, 28.9784] },
];

/**
 * Free-Floating Interactive Holographic 3D Globe
 * - 100% Free floating directly in studio space (NO WINDOW, NO BOX, NO BORDERS, NO TITLE BAR)
 * - Vivid Glowing Neon Cyan Continents & World Map
 * - Vibrant Amber City Pulse Markers
 * - Direct Mouse Drag Rotation & Smooth Wheel Zoom
 * - Interactive Marker Click Popover
 */
export const GlobalActivityCard = memo(function GlobalActivityCard({
  points = [45, 62, 78, 52, 90, 68, 82, 74, 95],
  liveVisitorsCount = 6,
}: GlobalActivityCardProps) {
  const [zoomScale, setZoomScale] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<GeoVisitorNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Wheel Zoom when hovering directly over the globe
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoomScale((prev) => Math.max(0.75, Math.min(1.8, prev + delta)));
    },
    []
  );

  // Convert GeoVisitorNodes to Cobe Markers
  const cobeMarkers: Marker[] = REAL_VISITOR_NODES.map((n) => ({
    id: n.id,
    location: n.location,
    label: `${n.name} (${n.visitors})`,
    visitors: n.visitors,
    country: n.country,
    action: n.action,
    latency: n.latency,
  }));

  // Handle marker click to show visitor detail popover
  const handleMarkerClick = useCallback((m: Marker) => {
    const node = REAL_VISITOR_NODES.find((n) => n.id === m.id);
    if (node) {
      setSelectedVisitor(node);
    }
  }, []);

  const globeBaseSize = 220;

  return (
    <div
      ref={containerRef}
      dir="rtl"
      onWheel={handleWheel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pointer-events-auto relative flex flex-col items-center justify-center select-none"
    >
      {/* 1. Free-Floating 3D Holographic Globe Canvas (NO CARD BOX / NO BORDER) */}
      <div
        className="relative flex items-center justify-center transition-transform duration-300"
        style={{
          width: `${globeBaseSize}px`,
          height: `${globeBaseSize}px`,
          transform: `scale(${zoomScale})`,
          transformOrigin: "center center",
        }}
      >
        <Globe
          className="w-full h-full cursor-grab active:cursor-grabbing"
          markers={cobeMarkers}
          arcs={REAL_TRAVEL_ARCS}
          markerColor={[1.0, 0.45, 0.1]} // Vivid Glowing Amber Markers
          baseColor={[0.16, 0.86, 1.0]} // Radiant Cyber Neon Cyan Continents
          arcColor={[0.35, 0.92, 1.0]} // Luminous Cyan Flight Arcs
          glowColor={[0.0, 0.85, 1.0]} // Neon Cyan Atmospheric Halo
          dark={1}
          mapBrightness={13} // Brilliant glowing map dots
          markerSize={0.045}
          markerElevation={0.02}
          arcWidth={0.7}
          speed={0.0035}
          onMarkerClick={handleMarkerClick}
        />

        {/* Ambient Holographic Radial Aura */}
        <div
          className="pointer-events-none absolute inset-[-10px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.14) 0%, rgba(0, 240, 255, 0) 70%)",
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* 2. Holographic Base Emitter Floor Rings (Directly on the stage floor) */}
      <div className="pointer-events-none relative -mt-3 flex items-center justify-center w-[180px] h-[36px]">
        {/* Floor projection ellipses */}
        <div
          className="absolute inset-0 rounded-full border border-cyan-400/40"
          style={{
            transform: "rotateX(75deg)",
            boxShadow: "0 0 20px rgba(0, 240, 255, 0.5), inset 0 0 15px rgba(0, 240, 255, 0.3)",
          }}
        />
        <div
          className="absolute inset-[6px] rounded-full border border-cyan-300/60"
          style={{
            transform: "rotateX(75deg)",
          }}
        />
        <div
          className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00f0ff]"
        />
      </div>

      {/* 3. Subtle Holographic Control & Interaction Hint (Floating, minimal, clean) */}
      <div className="mt-1 flex items-center gap-2 text-[9.5px] font-mono text-cyan-300/80 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-300 font-bold">{liveVisitorsCount} متصل</span>
        </span>
        <span className="text-cyan-500/60">·</span>
        <span>تدوير بالسحب · تكبير بالعجلة</span>
      </div>

      {/* 4. Sleek Floating Visitor Detail Popover (When a city marker is clicked) */}
      {selectedVisitor && (
        <div
          style={{ backgroundColor: "rgba(2, 11, 24, 0.95)" }}
          className="absolute left-0 bottom-[55px] z-50 w-[240px] rounded-xl border border-cyan-400/70 p-3 text-white shadow-[0_0_35px_rgba(0,240,255,0.45)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <Radio size={12} className="text-cyan-400 animate-pulse" />
              <span className="font-bold text-xs text-cyan-200">{selectedVisitor.name}</span>
              <span className="font-mono text-[9px] text-slate-400">({selectedVisitor.country})</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedVisitor(null)}
              style={{ backgroundColor: "#000000" }}
              className="flex h-4 w-4 items-center justify-center rounded border border-[#ff0055]/60 text-[#ff0055] hover:text-white transition-all cursor-pointer"
              title="إغلاق"
            >
              <X size={10} />
            </button>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">الجلسات النشطة:</span>
              <span className="font-mono font-bold text-emerald-400">{selectedVisitor.visitors} زائر متصل</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">النشاط اللحظي:</span>
              <span className="text-cyan-300 font-sans truncate max-w-[140px]">{selectedVisitor.action}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">زمن الاستجابة:</span>
              <span className="font-mono text-cyan-300">{selectedVisitor.latency} · {selectedVisitor.duration}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">الجهاز والمنصة:</span>
              <span className="font-mono text-slate-300">{selectedVisitor.device}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default GlobalActivityCard;
