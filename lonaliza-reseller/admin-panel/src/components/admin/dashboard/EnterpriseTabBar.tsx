"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Banknote,
  Gauge,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardTabItem {
  id: string;
  labelAr: string;
  labelEn: string;
  badge?: string;
  icon: LucideIcon;
  accentColor?: string;
}

export const ENTERPRISE_TABS: DashboardTabItem[] = [
  {
    id: "overview",
    labelAr: "النظرة التنفيذية الشاملة",
    labelEn: "Executive Overview",
    badge: "مباشر",
    icon: LayoutDashboard,
    accentColor: "text-amber-500",
  },
  {
    id: "crm",
    labelAr: "المبيعات وقمع العملاء",
    labelEn: "CRM & Pipeline",
    badge: "42.8%",
    icon: Users,
    accentColor: "text-blue-500",
  },
  {
    id: "finance",
    labelAr: "المالية والسيولة والتدفقات",
    labelEn: "Finance & Treasury",
    badge: "$128.4K",
    icon: Banknote,
    accentColor: "text-emerald-500",
  },
  {
    id: "analytics",
    labelAr: "التحليلات وحركة الزوار",
    labelEn: "Analytics & Traffic",
    badge: "+18.4%",
    icon: Gauge,
    accentColor: "text-indigo-500",
  },
  {
    id: "operations",
    labelAr: "العمليات السياحية والمخزون",
    labelEn: "Operations & Inventory",
    badge: "192 خدمة",
    icon: ShoppingBag,
    accentColor: "text-rose-500",
  },
  {
    id: "ai-copilot",
    labelAr: "غرفة عمليات الوكلاء الذكية",
    labelEn: "AI Swarm & War Room",
    badge: "18 خادم",
    icon: Sparkles,
    accentColor: "text-amber-500",
  },
];

interface EnterpriseTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  dir?: "rtl" | "ltr";
}

export function EnterpriseTabBar({
  activeTab,
  onTabChange,
  dir = "rtl",
}: EnterpriseTabBarProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // In RTL, scrollLeft may be negative or count backwards
    const maxScroll = scrollWidth - clientWidth;
    const absScroll = Math.abs(scrollLeft);
    setCanScrollLeft(absScroll > 5);
    setCanScrollRight(absScroll < maxScroll - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scrollBy = (amount: number) => {
    const el = trackRef.current;
    if (!el) return;
    const dirSign = dir === "rtl" ? -1 : 1;
    el.scrollBy({ left: amount * dirSign, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center gap-1.5 w-full border-b border-border/50 pb-2.5 pt-1 group">
      {/* Scroll Left Button */}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-240)}
        disabled={!canScrollLeft}
        className={cn(
          "shrink-0 z-10 flex size-8 items-center justify-center rounded-xl border border-border/80 bg-card/90 shadow-xs text-foreground hover:bg-secondary transition-all disabled:opacity-0 disabled:pointer-events-none",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar py-0.5 px-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {ENTERPRISE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onTabChange(tab.id);
                // Center active button in track
                const target = document.getElementById(`tab-btn-${tab.id}`);
                target?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
              }}
              id={`tab-btn-${tab.id}`}
              className={cn(
                "relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none active:scale-[0.98] border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
                  : "bg-card/70 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/50 hover:border-border"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform duration-200",
                  isActive ? "text-primary-foreground scale-110" : tab.accentColor
                )}
              />
              <span className="font-bold text-xs leading-none whitespace-nowrap">
                {dir === "rtl" ? tab.labelAr : tab.labelEn}
              </span>
              {tab.badge ? (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums shrink-0",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border/40"
                  )}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(240)}
        disabled={!canScrollRight}
        className={cn(
          "shrink-0 z-10 flex size-8 items-center justify-center rounded-xl border border-border/80 bg-card/90 shadow-xs text-foreground hover:bg-secondary transition-all disabled:opacity-0 disabled:pointer-events-none",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      >
        <ChevronLeft className="size-4" />
      </button>
    </div>
  );
}
