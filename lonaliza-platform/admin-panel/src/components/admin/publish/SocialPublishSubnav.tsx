"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Share2,
  CalendarDays,
  PenTool,
  Image,
  BarChart3,
  Rss,
  Sparkles,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export type SocialPublishTabItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
};

export const SOCIAL_PUBLISH_TABS: SocialPublishTabItem[] = [
  {
    href: "/admin/social-accounts",
    label: "حسابات الربط الرسمي (OAuth)",
    icon: Share2,
    exact: true,
  },
  {
    href: "/admin/publish",
    label: "التقويم وجدولة المنشورات",
    icon: CalendarDays,
    exact: true,
  },
  {
    href: "/admin/publish/compose",
    label: "صانع المحتوى والملحن",
    icon: PenTool,
  },
  {
    href: "/admin/publish/media",
    label: "مكتبة الوسائط والتصاميم",
    icon: Image,
  },
  {
    href: "/admin/publish/analytics",
    label: "التحليلات والأداء الشامل",
    icon: BarChart3,
  },
  {
    href: "/admin/publish/automations",
    label: "الأتمتة وتكرار النشر و RSS",
    icon: Rss,
  },
  {
    href: "/admin/publish/agent",
    label: "وكيل النشر الذكي AI",
    icon: Sparkles,
  },
  {
    href: "/admin/publish/settings",
    label: "إعدادات قنوات النشر والتكامل",
    icon: Settings,
  },
];

interface Props {
  activeHref?: string;
}

export function SocialPublishSubnav({ activeHref }: Props) {
  const currentPath = usePathname();
  const activePath = activeHref || currentPath;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scrollTabs = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 260;
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

  return (
    <div className="w-full mb-6" dir="rtl">
      <div className="flex items-center gap-2 w-full">
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

        {/* Scrollable Tabs Container */}
        <nav
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth select-none cursor-grab active:cursor-grabbing p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          aria-label="أقسام منصة النشر والتواصل"
        >
          {SOCIAL_PUBLISH_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? activePath === item.href
              : activePath === item.href || activePath.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 text-white shadow-md shadow-purple-500/25 font-black ring-1 ring-white/20"
                    : "text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-white" : "text-purple-600 dark:text-purple-400"
                  }`}
                />
                <span className={isActive ? "text-white font-black" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
