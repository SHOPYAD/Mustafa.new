"use client";

import React, { useId } from "react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

import type { DashboardCopy } from "@/components/admin/dashboard/copy";
import { formatInt } from "@/components/admin/dashboard/labels";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/types";
import type { DashboardDayPoint } from "@/types/dashboard-stats";

export function KpiSparkCard({
  title,
  value,
  hint,
  href,
  icon: Icon,
  series,
  locale,
  accentColor,
}: {
  title: string;
  value: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  series?: DashboardDayPoint[];
  locale: Locale;
  accentColor?: string;
}) {
  const chartGradientId = useId();
  const last = series?.[series.length - 1]?.count ?? 0;
  const prev = series?.[series.length - 2]?.count ?? 0;
  const delta = last - prev;
  const isPositive = delta >= 0;

  return (
    <Link href={href} className="block h-full group">
      <Card className="relative h-full overflow-hidden border border-border/60 bg-card/90 dark:bg-card/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer admin-card-glass">
        {/* Ambient background glow */}
        <div className="absolute top-0 end-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

        <CardContent className="flex h-full flex-col justify-between p-5 relative z-10 gap-3">
          {/* Header Row: Title & Dual-Tone Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                {title}
              </span>
              <p className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums text-foreground">
                {value}
              </p>
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
              <Icon className="size-5" />
            </div>
          </div>

          {/* Sparkline AreaChart with Linear Gradient */}
          {series && series.length > 0 ? (
            <div className="h-14 w-full -mx-1 my-1 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ left: 2, right: 2, top: 4, bottom: 2 }}>
                  <defs>
                    <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary, #7c3aed)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--primary, #7c3aed)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--primary, #7c3aed)"
                    fill={`url(#${chartGradientId})`}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {/* Footer Meta Row: Hint & Delta Pill */}
          <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-border/40">
            <span className="text-muted-foreground truncate max-w-[65%]" title={hint}>
              {hint}
            </span>
            {series && series.length > 0 && (
              <span
                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] border shrink-0 ${
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                }`}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>
                  {isPositive ? "+" : ""}
                  {formatInt(delta, locale)}
                </span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SectionTitle({
  title,
  hint,
}: {
  title: string;
  hint?: string;
  copy?: DashboardCopy;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div>
        <h2 className="text-base font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
