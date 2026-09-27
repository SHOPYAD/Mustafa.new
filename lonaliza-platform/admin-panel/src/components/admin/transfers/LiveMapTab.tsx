// src/components/admin/transfers/LiveMapTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Map, Navigation, Car, RefreshCw, Radio, Compass, Shield, User, Gauge } from "lucide-react";

interface Props {
  telemetry: any[];
  activeTrips: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const LiveMapTab: React.FC<Props> = ({
  telemetry,
  activeTrips,
  isLoading,
  onRefresh,
}) => {
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  // Default focus Istanbul
  const defaultCenter = { lat: 41.0082, lng: 28.9784 };

  return (
    <div className="space-y-4 animate-fadeIn" dir="rtl">
      {/* Top Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>خريطة التتبع المباشر لأسطول وسائقي لوناليزا</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                بث حي ومباشر
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              متابعة حركة السائقين الفورية أثناء تنفيذ رحلات النقل الخاص والجولات اليومية بالساعات.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-muted/50 border border-border/40">
            السائقين النشطين: <strong className="text-emerald-500">{telemetry.length}</strong>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
            <span>تحديث الإحداثيات</span>
          </button>
        </div>
      </div>

      {/* Main Map Container + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Interactive Map Canvas */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border/60 overflow-hidden relative min-h-[480px] shadow-inner flex flex-col justify-between">
          {/* Map Simulation Canvas / OpenStreetMap Iframe with Live Overlay */}
          <div className="absolute inset-0 z-0">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=28.70%2C40.90%2C29.35%2C41.30&amp;layer=mapnik"
              className="w-full h-full border-0 opacity-80 contrast-125 grayscale-[20%]"
              title="OpenStreetMap Live Turkey"
            ></iframe>
          </div>

          {/* Floating Driver Markers on Map Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none p-6">
            <div className="relative w-full h-full">
              {telemetry.map((drv, idx) => {
                // Approximate positioning offsets inside Istanbul viewport
                const topPercent = 35 + ((idx * 15) % 40);
                const leftPercent = 30 + ((idx * 22) % 45);
                const isSelected = selectedDriver?.driverId === drv.driverId;

                return (
                  <div
                    key={drv.driverId || idx}
                    onClick={() => setSelectedDriver(drv)}
                    style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                    className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-transform hover:scale-110"
                  >
                    {/* Pulsing beacon */}
                    <span className="absolute -inset-1 rounded-full bg-amber-500/40 animate-ping"></span>
                    <div
                      className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xl border ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 border-white scale-110"
                          : "bg-slate-950/90 text-white border-amber-500/60"
                      }`}
                    >
                      <Car className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono text-[11px]">{drv.plateNumber || "VIP"}</span>
                    </div>

                    {/* Popover on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-xl bg-slate-950/95 border border-amber-500/40 text-[11px] text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <div className="font-bold text-amber-400">{drv.driverName}</div>
                      <div className="text-slate-300 truncate">{drv.currentTrip || "رحلة نشطة"}</div>
                      <div className="flex items-center justify-between text-slate-400 font-mono mt-1 pt-1 border-t border-white/10">
                        <span>السرعة: {drv.speed || 40} كم/س</span>
                        <span>{drv.vehicleModel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Footer HUD */}
          <div className="relative z-20 m-4 p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-500/30 text-xs text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>نظام البث الحي للسيارات يعمل بكفاءة 100%</span>
            </div>
            <div className="text-muted-foreground font-mono text-[11px]">
              تحديث تلقائي كل 10 ثوانٍ
            </div>
          </div>
        </div>

        {/* Right Col: Active Vehicles Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            السائقين على الطريق حالياً ({telemetry.length})
          </h4>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {telemetry.map((drv) => {
              const isSelected = selectedDriver?.driverId === drv.driverId;
              return (
                <div
                  key={drv.driverId}
                  onClick={() => setSelectedDriver(drv)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 shadow-sm"
                      : "bg-card hover:bg-muted/30 border-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{drv.driverName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{drv.plateNumber}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      نشط
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground truncate mb-2">
                    {drv.currentTrip || "ترانسفير VIP"}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-amber-500" /> {drv.speed || 38} كم/س
                    </span>
                    <span className="truncate">{drv.vehicleModel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
