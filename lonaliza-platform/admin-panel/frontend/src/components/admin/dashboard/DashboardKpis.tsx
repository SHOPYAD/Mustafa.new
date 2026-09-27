"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Area, AreaChart } from "recharts";
import type { LucideIcon } from "lucide-react";

import type { DashboardCopy } from "@/components/admin/dashboard/copy";
import { formatInt } from "@/components/admin/dashboard/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { Locale } from "@/lib/i18n/types";
import type { DashboardDayPoint } from "@/types/dashboard-stats";

const sparkConfig = {
  count: { label: "count", color: "var(--admin-purple-royal)" },
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
  const hasTrend = Boolean(series && series.length > 1);

  return (
    <Link href={href} className="block h-full min-w-0">
      <Card
        data-slot="kpi-card"
        className="h-full gap-3 py-4 transition-colors hover:border-primary/40"
      >
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {title}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {formatInt(shown, locale)}
              </p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon className="size-4" />
            </span>
          </div>
          {series && series.length > 0 ? (
            <ChartContainer config={sparkConfig} className="h-12 w-full">
              <AreaChart data={series} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--admin-amber)"
                  fill="var(--admin-amber)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                />
              </AreaChart>
            </ChartContainer>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">{hint}</p>
            {hasTrend ? (
              <Badge variant={delta >= 0 ? "secondary" : "destructive"} className="tabular-nums">
                {delta >= 0 ? "+" : ""}
                {formatInt(delta, locale)}
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
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
