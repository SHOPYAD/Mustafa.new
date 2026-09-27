"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Area, AreaChart } from "recharts";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import type { DashboardCopy } from "@/components/admin/dashboard/copy";
import { formatInt } from "@/components/admin/dashboard/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { Locale } from "@/lib/i18n/types";
import type { DashboardDayPoint } from "@/types/dashboard-stats";

const sparkConfig = {
  count: { label: "count", color: "var(--primary)" },
} satisfies ChartConfig;

function useCountUp(target: number, duration = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, target]);
  return n;
}

export function KpiSparkCard({
  title,
  raw,
  hint,
  href,
  icon: Icon,
  series,
  locale,
}: {
  title: string;
  raw: number;
  hint: string;
  href: string;
  icon: LucideIcon;
  series?: DashboardDayPoint[];
  locale: Locale;
}) {
  const shown = useCountUp(raw);
  const last = series?.[series.length - 1]?.count ?? 0;
  const prev = series?.[series.length - 2]?.count ?? 0;
  const delta = last - prev;
  const isPositive = delta >= 0;
  const hasTrend = Boolean(series && series.length > 1);

  return (
    <Link href={href} className="group block h-full min-w-0">
      <Card
        data-slot="kpi-card"
        className="h-full rounded-xl border border-border/70 bg-card/90 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md"
      >
        <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-tight text-muted-foreground">
                {title}
              </p>
              <p className="mt-1.5 text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
                {formatInt(shown, locale)}
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
              <Icon className="size-4" />
            </span>
          </div>

          {series && series.length > 0 ? (
            <ChartContainer config={sparkConfig} className="h-10 w-full mt-1">
              <AreaChart data={series} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  fill={`url(#grad-${title})`}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                />
              </AreaChart>
            </ChartContainer>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-border/40 text-xs">
            <p className="truncate text-muted-foreground text-[11px]">{hint}</p>
            {hasTrend ? (
              <Badge
                variant="outline"
                className={`gap-1 px-1.5 py-0.5 text-[10px] font-semibold ${
                  isPositive
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                <span>{isPositive ? "+" : ""}{formatInt(delta, locale)}</span>
              </Badge>
            ) : null}
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
    <div className="flex items-end justify-between gap-3 mb-2">
      <div>
        <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
