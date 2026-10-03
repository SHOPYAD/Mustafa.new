"use client";

import React, { memo } from "react";
import { Users, Search, Calendar, BarChart2 } from "lucide-react";

export interface LiveAnalyticsData {
  usersOnline?: number;
  searchRequests?: number | string;
  bookingsToday?: number;
  usersTrend?: string;
  searchesTrend?: string;
  bookingsTrend?: string;
}

export interface LiveAnalyticsCardProps {
  data?: LiveAnalyticsData | null;
}

export const LiveAnalyticsCard = memo(function LiveAnalyticsCard({ data }: LiveAnalyticsCardProps) {
  const users = data?.usersOnline ?? 1248;
  const searches = data?.searchRequests ?? "28.4K";
  const bookings = data?.bookingsToday ?? 347;

  return (
    <div className="pointer-events-auto w-[210px] rounded-[18px] border border-cyan-500/30 bg-[#020d1c]/85 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <h4 className="text-[12px] font-black tracking-wide text-white">Live Analytics</h4>
        </div>
        <BarChart2 size={13} className="text-cyan-400" />
      </div>

      {/* 3 Metric Rows matching Reference Image 4 */}
      <div className="mt-2.5 space-y-2.5">
        {/* Row 1: Users Online */}
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-950/40 text-cyan-300">
              <Users size={12} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Users Online</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-xs font-bold text-white">
              {typeof users === "number" ? users.toLocaleString() : users}
            </span>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
              {data?.usersTrend || "+12%"}
            </span>
          </div>
        </div>

        {/* Row 2: Search Requests */}
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-950/40 text-cyan-300">
              <Search size={12} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Search Requests</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-xs font-bold text-white">{searches}</span>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
              {data?.searchesTrend || "+8%"}
            </span>
          </div>
        </div>

        {/* Row 3: Bookings Today */}
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-pink-500/25 bg-pink-950/40 text-pink-300">
              <Calendar size={12} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Bookings Today</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-xs font-bold text-white">{bookings}</span>
            <span className="rounded-full border border-pink-400/40 bg-pink-500/20 px-1.5 py-0.2 text-[9px] font-bold text-pink-300">
              {data?.bookingsTrend || "+15%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LiveAnalyticsCard;
