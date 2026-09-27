"use client";

import React, { useId } from "react";
import { Globe, MapPin } from "lucide-react";

export default function WorldMapWidget() {
  const filterId = useId();

  const LOCATIONS = [
    { name: "Istanbul HQ", x: 195, y: 55, pulseColor: "#00e5ff", status: "Primary Hub" },
    { name: "Dubai Relay", x: 215, y: 72, pulseColor: "#10b981", status: "Active" },
    { name: "Riyadh Node", x: 208, y: 76, pulseColor: "#f59e0b", status: "Active" },
    { name: "Frankfurt DC", x: 180, y: 48, pulseColor: "#38bdf8", status: "Synced" },
    { name: "New York Gateway", x: 95, y: 58, pulseColor: "#8b5cf6", status: "Online" },
    { name: "Tokyo APAC", x: 290, y: 68, pulseColor: "#ec4899", status: "Active" },
  ];

  return (
    <div className="size-full flex flex-col justify-between p-3.5 text-slate-200 select-none font-mono text-[10px]">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Globe size={13} />
          <span className="tracking-wide">Global Presence</span>
        </div>
        <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
          6 Relays Online
        </span>
      </div>

      {/* Cyber Vector World Map SVG */}
      <div className="relative my-1 flex-1 flex items-center justify-center">
        <svg viewBox="0 0 350 140" className="w-full h-auto max-h-[125px] overflow-visible">
          <defs>
            <filter id={`${filterId}-pin-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* World Continents Paths Simplified Cyber Geometry */}
          <g fill="#0b2447" stroke="#164e63" strokeWidth="0.75" opacity="0.85">
            {/* North America */}
            <path d="M 40,25 Q 75,18 115,35 Q 110,65 95,85 Q 75,80 50,60 Z" />
            <path d="M 85,38 L 105,42 L 95,65 Z" />
            {/* South America */}
            <path d="M 98,90 Q 120,95 118,125 Q 105,135 95,115 Z" />
            {/* Europe */}
            <path d="M 165,30 Q 190,28 200,45 Q 185,55 168,48 Z" />
            <path d="M 155,32 Q 165,22 175,28 Q 165,40 155,32 Z" />
            {/* Africa */}
            <path d="M 168,55 Q 205,52 205,85 Q 185,120 170,85 Z" />
            {/* Asia */}
            <path d="M 200,32 Q 260,25 305,48 Q 285,90 220,75 Q 195,50 200,32 Z" />
            {/* Australia */}
            <path d="M 275,98 Q 305,95 305,120 Q 280,125 275,98 Z" />
          </g>

          {/* High-tech Geodesic Lat/Long Curves */}
          <g stroke="#083344" strokeWidth="0.5" strokeDasharray="3 4" fill="none">
            <line x1="10" y1="45" x2="340" y2="45" />
            <line x1="10" y1="75" x2="340" y2="75" />
            <line x1="10" y1="105" x2="340" y2="105" />
            <line x1="95" y1="15" x2="95" y2="135" />
            <line x1="195" y1="15" x2="195" y2="135" />
            <line x1="290" y1="15" x2="290" y2="135" />
          </g>

          {/* Active Network Pins & Radar Pulses */}
          {LOCATIONS.map((loc, idx) => (
            <g key={loc.name} filter={`url(#${filterId}-pin-glow)`}>
              {/* Radar pulse ring */}
              <circle cx={loc.x} cy={loc.y} r="6" fill="none" stroke={loc.pulseColor} strokeWidth="0.8">
                <animate
                  attributeName="r"
                  values="2;8;12"
                  dur={`${1.8 + idx * 0.3}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="1;0.4;0"
                  dur={`${1.8 + idx * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Pin core */}
              <circle cx={loc.x} cy={loc.y} r="2.5" fill={loc.pulseColor} />
            </g>
          ))}
        </svg>
      </div>

      {/* Footer Info */}
      <div className="pt-1.5 border-t border-cyan-500/15 flex items-center justify-between text-[9px] text-slate-400">
        <span className="flex items-center gap-1 text-cyan-300">
          <MapPin size={9} />
          <span>HQ: Istanbul, TR</span>
        </span>
        <span className="text-slate-400">BGP Mesh: 100% Ok</span>
      </div>
    </div>
  );
}
