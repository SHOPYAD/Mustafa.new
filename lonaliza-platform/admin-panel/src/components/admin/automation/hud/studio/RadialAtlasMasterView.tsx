"use client";

import React, { useState } from "react";
import { Radio } from "lucide-react";

interface RadialAtlasMasterViewProps {
  depthLevel?: number;
  onSelectNode?: (nodeName: string) => void;
}

export default function RadialAtlasMasterView({
  depthLevel = 0,
  onSelectNode,
}: RadialAtlasMasterViewProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("overview");

  // 11 Core Domains matching 01-platform-neural-atlas.png 100%
  const branches = [
    {
      id: "overview",
      name: "نظرة عامة",
      color: "#27dff4",
      angle: 90, // Top
      subnodes: ["لوحة المعلومات"],
    },
    {
      id: "bookings",
      name: "الحجوزات",
      color: "#ffc837",
      angle: 57,
      subnodes: ["الحجوزات", "طلبات الإلغاء", "تقييمات العملاء الموثقة"],
    },
    {
      id: "services",
      name: "الخدمات",
      color: "#ff9900",
      angle: 24,
      subnodes: ["الفنادق", "الرحلات", "الباقات", "الترانسفير VIP", "تأجير السيارات", "الجولات", "التأشيرات"],
    },
    {
      id: "cms",
      name: "محتوى الموقع",
      color: "#10b981",
      angle: -10,
      subnodes: ["محرر بصري AI", "الصفحات", "المقالات", "تبويبات البحث", "تطبيق الويب", "تطبيق الجوال"],
    },
    {
      id: "customers",
      name: "العملاء",
      color: "#c084fc",
      angle: -45,
      subnodes: ["إدارة العملاء", "التقييمات", "حذف الحسابات"],
    },
    {
      id: "marketing",
      name: "التسويق والنشر",
      color: "#38bdf8",
      angle: -80,
      subnodes: ["الحسابات", "التقويم", "المحتوى", "الوسائط", "RSS", "الحملات"],
    },
    {
      id: "ai",
      name: "الذكاء الاصطناعي",
      color: "#f59e0b",
      angle: -120,
      subnodes: ["غرفة الوكلاء", "استوديو الوكلاء", "وكيل B2B", "وكيل الأمن", "الأتمتة"],
    },
    {
      id: "finance",
      name: "المالية",
      color: "#06b6d4",
      angle: -155,
      subnodes: ["الدفع", "العملات", "الفواتير", "محفظة B2B", "نقاط الولاء"],
    },
    {
      id: "legal",
      name: "الامتثال القانوني",
      color: "#e879f9",
      angle: 170,
      subnodes: ["الهوية", "الشروط", "الخصوصية", "GDPR"],
    },
    {
      id: "settings",
      name: "الإعدادات",
      color: "#67e8f9",
      angle: 135,
      subnodes: ["SMTP", "مزودو البحث", "PocketBase", "التراجم", "الوسائط"],
    },
    {
      id: "resale",
      name: "إعادة البيع",
      color: "#fbbf24",
      angle: 105,
      subnodes: ["الشركات", "الوايت ليبل", "الاشتراكات", "المحافظ", "النطاقات", "التراخيص", "التحديثات"],
    },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* Background Starfield Grid */}
      <svg
        viewBox="0 0 1000 800"
        className="w-full h-full max-w-[1300px] max-h-[820px] pointer-events-none"
      >
        <defs>
          <filter id="atlasGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit Grid Circles */}
        <circle cx="500" cy="400" r="110" fill="none" stroke="#27dff4" strokeWidth="1" strokeDasharray="3 6" opacity="0.3" />
        <circle cx="500" cy="400" r="210" fill="none" stroke="#27dff4" strokeWidth="0.8" strokeDasharray="4 8" opacity="0.25" />
        <circle cx="500" cy="400" r="330" fill="none" stroke="#27dff4" strokeWidth="0.6" strokeDasharray="2 10" opacity="0.2" />

        {/* 11 Radial Fiber Lines to Domain Hubs */}
        {branches.map((b) => {
          const rad = (b.angle * Math.PI) / 180;
          const x1 = 500 + Math.cos(rad) * 90;
          const y1 = 400 - Math.sin(rad) * 90;
          const x2 = 500 + Math.cos(rad) * 230;
          const y2 = 400 - Math.sin(rad) * 230;

          return (
            <g key={b.id}>
              {/* Main Conduit */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={b.color}
                strokeWidth="2"
                filter="url(#atlasGlow)"
                strokeOpacity="0.8"
              />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.9" />

              {/* Subnode Conduits */}
              {b.subnodes.map((_, idx) => {
                const subAngle = b.angle + (idx - (b.subnodes.length - 1) / 2) * 5;
                const subRad = (subAngle * Math.PI) / 180;
                const sx = 500 + Math.cos(subRad) * 310;
                const sy = 400 - Math.sin(subRad) * 310;
                return (
                  <line
                    key={idx}
                    x1={x2}
                    y1={y2}
                    x2={sx}
                    y2={sy}
                    stroke={b.color}
                    strokeWidth="0.8"
                    strokeOpacity="0.5"
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Center Dial: الوكيل المشرف */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
        <div className="relative w-36 h-36 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_35px_rgba(0,229,255,0.4)] bg-[#020e21]">
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-300 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-amber-400/60 animate-[spin_12s_linear_infinite_reverse]" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-[0_0_20px_#ffb54c]">
            <Radio size={28} className="text-black animate-pulse" />
          </div>
        </div>
        <span className="text-sm font-extrabold text-white font-sans tracking-wide">
          الوكيل المشرف
        </span>
      </div>

      {/* Domain Hub Labels and Sub-node Clusters */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {branches.map((b) => {
          const rad = (b.angle * Math.PI) / 180;
          // Position normalized to container width/height percentage
          const leftPercent = 50 + Math.cos(rad) * 25;
          const topPercent = 50 - Math.sin(rad) * 28;

          return (
            <div
              key={b.id}
              onClick={() => {
                setSelectedBranch(b.id);
                onSelectNode?.(b.name);
              }}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="pointer-events-auto absolute p-2 rounded-xl bg-[#010a16]/85 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.8)] text-right"
            >
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold font-sans" style={{ color: b.color }}>
                  {b.name}
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
