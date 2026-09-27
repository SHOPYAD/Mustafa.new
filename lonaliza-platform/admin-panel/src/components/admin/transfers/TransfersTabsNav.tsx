// src/components/admin/transfers/TransfersTabsNav.tsx
"use client";

import React, { useRef, useState } from "react";
import {
  Send,
  Compass,
  Car,
  MapPin,
  Route,
  Clock,
  Star,
  Building2,
  ShieldCheck,
  DollarSign,
  Map,
  FileQuestion,
  Settings,
  Radar,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
} from "lucide-react";

export type TransferAdminTab =
  | "transfer_dispatch"
  | "tour_dispatch"
  | "vehicle_classes"
  | "zones"
  | "routes"
  | "daily_tours"
  | "reviews"
  | "suppliers"
  | "moderation"
  | "commission"
  | "live_map"
  | "flight_radar"
  | "quote_requests"
  | "api_providers";

interface Props {
  activeTab: TransferAdminTab;
  onTabChange: (tab: TransferAdminTab) => void;
  stats?: {
    pendingTransfersCount?: number;
    pendingToursCount?: number;
    pendingModerationCount?: number;
    activeDriversOnline?: number;
  };
  onOpenSettings?: () => void;
}

export const TransfersTabsNav: React.FC<Props> = ({
  activeTab,
  onTabChange,
  stats,
  onOpenSettings,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scrollTabs = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 280;
    const sign = direction === "left" ? -amount : amount;
    scrollRef.current.scrollBy({ left: sign, behavior: "smooth" });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const tabs: Array<{
    id: TransferAdminTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeVariant?: "warning" | "danger" | "success" | "neutral";
  }> = [
    {
      id: "transfer_dispatch",
      label: "ترحيل النقل",
      icon: Send,
      badge: stats?.pendingTransfersCount,
      badgeVariant: "warning",
    },
    {
      id: "tour_dispatch",
      label: "ترحيل الجولات",
      icon: Compass,
      badge: stats?.pendingToursCount,
      badgeVariant: "warning",
    },
    {
      id: "vehicle_classes",
      label: "فئات السيارات",
      icon: Car,
    },
    {
      id: "zones",
      label: "المناطق والمطارات",
      icon: MapPin,
    },
    {
      id: "routes",
      label: "المسارات والتسعير",
      icon: Route,
    },
    {
      id: "daily_tours",
      label: "الجولات اليومية",
      icon: Clock,
    },
    {
      id: "reviews",
      label: "التقييمات والنظافة",
      icon: Star,
    },
    {
      id: "suppliers",
      label: "الشركات والأسطول",
      icon: Building2,
    },
    {
      id: "moderation",
      label: "تدقيق واعتماد السيارات",
      icon: ShieldCheck,
      badge: stats?.pendingModerationCount,
      badgeVariant: "danger",
    },
    {
      id: "commission",
      label: "العمولات والمستحقات",
      icon: DollarSign,
    },
    {
      id: "live_map",
      label: "الخريطة المباشرة والتتبع",
      icon: Map,
      badge: stats?.activeDriversOnline,
      badgeVariant: "success",
    },
    {
      id: "flight_radar",
      label: "رادار تتبع الطيران ✈️",
      icon: Radar,
      badgeVariant: "success",
    },
    {
      id: "quote_requests",
      label: "طلبات عروض الأسعار",
      icon: FileQuestion,
    },
    {
      id: "api_providers",
      label: "محركات ومزودو الـ API والموزعون (Transfer APIs)",
      icon: SlidersHorizontal,
      badgeVariant: "neutral",
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 w-full">
      {/* Scroll Navigation Arrows */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => scrollTabs("right")}
          className="size-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          title="التمرير لليمين"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => scrollTabs("left")}
          className="size-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          title="التمرير لليسار"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Smooth Scrollable Tabs Strip */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth select-none cursor-grab active:cursor-grabbing p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-black"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-white text-purple-700"
                      : tab.badgeVariant === "danger"
                      ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                      : tab.badgeVariant === "success"
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 shadow-xs cursor-pointer"
          title="إعدادات نظام النقل والخصومات"
        >
          <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="hidden xl:inline">إعدادات النظام</span>
        </button>
      )}
    </div>
  );
};
