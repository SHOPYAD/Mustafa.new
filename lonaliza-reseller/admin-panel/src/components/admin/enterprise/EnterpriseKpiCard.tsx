"use client";

import React from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiThemeColor = "purple" | "amber" | "emerald" | "blue" | "rose" | "indigo";

export interface EnterpriseKpiCardProps {
  title?: string;
  label?: string;
  value: string | number;
  subValue?: string;
  helperText?: string;
  change?: string | number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  color?: KpiThemeColor | "violet";
  href?: string;
  sparkline?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const colorMap: Record<
  KpiThemeColor,
  {
    iconBg: string;
    iconBorder: string;
    iconText: string;
    glow: string;
  }
> = {
  purple: {
    iconBg: "bg-purple-500/10",
    iconBorder: "border-purple-500/20",
    iconText: "text-purple-500 dark:text-purple-400",
    glow: "group-hover:border-purple-500/30",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/20",
    iconText: "text-amber-500 dark:text-amber-400",
    glow: "group-hover:border-amber-500/30",
  },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
    iconText: "text-emerald-500 dark:text-emerald-400",
    glow: "group-hover:border-emerald-500/30",
  },
  blue: {
    iconBg: "bg-sky-500/10",
    iconBorder: "border-sky-500/20",
    iconText: "text-sky-500 dark:text-sky-400",
    glow: "group-hover:border-sky-500/30",
  },
  rose: {
    iconBg: "bg-rose-500/10",
    iconBorder: "border-rose-500/20",
    iconText: "text-rose-500 dark:text-rose-400",
    glow: "group-hover:border-rose-500/30",
  },
  indigo: {
    iconBg: "bg-indigo-500/10",
    iconBorder: "border-indigo-500/20",
    iconText: "text-indigo-500 dark:text-indigo-400",
    glow: "group-hover:border-indigo-500/30",
  },
};

export function EnterpriseKpiCard({
  title,
  label,
  value,
  subValue,
  helperText,
  change,
  changeLabel,
  trend,
  icon,
  color = "purple",
  href,
  sparkline,
  className,
  onClick,
}: EnterpriseKpiCardProps) {
  const resolvedColor: KpiThemeColor = color === "violet" ? "purple" : (color as KpiThemeColor);
  const c = colorMap[resolvedColor] || colorMap.purple;
  const displayTitle = title || label || "";
  const displaySub = subValue || helperText;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="size-5" />;
    }
    return null;
  };

  const content = (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card dark:bg-card/60 p-4 sm:p-5 shadow-sm dark:shadow-none backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40",
        c.glow,
        href || onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      {/* Background soft ambient gradient */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl transition-all duration-300 group-hover:scale-125" />

      {/* Top row: Title and Icon */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
          {displayTitle}
        </span>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
              c.iconBg,
              c.iconBorder,
              c.iconText
            )}
          >
            {renderIcon()}
          </div>
        )}
      </div>

      {/* Middle row: Main Value */}
      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
        {displaySub && (
          <div className="text-xs text-muted-foreground/80 tabular-nums">
            {displaySub}
          </div>
        )}
      </div>

      {/* Sparkline slot if provided */}
      {sparkline && <div className="mt-3 h-10 w-full">{sparkline}</div>}

      {/* Bottom row: Trend and change label */}
      {(change !== undefined || changeLabel) && (
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-border/40 text-xs">
          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold tabular-nums",
                trend === "up" && "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
                trend === "down" && "bg-rose-500/10 text-rose-500 dark:text-rose-400",
                trend === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              {trend === "up" && <ArrowUpRight size={13} className="shrink-0" />}
              {trend === "down" && <ArrowDownRight size={13} className="shrink-0" />}
              {trend === "neutral" && <Minus size={13} className="shrink-0" />}
              <span>{typeof change === "number" ? `${change > 0 ? "+" : ""}${change}%` : change}</span>
            </span>
          )}
          {changeLabel && (
            <span className="text-muted-foreground/80 truncate text-[11px] sm:text-xs">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}

export function EnterpriseKpiGrid({
  children,
  className,
  columns = 4,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 5;
}) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  }[columns];

  return (
    <div className={cn("grid gap-4 sm:gap-5", colClass, className)}>
      {children}
    </div>
  );
}
