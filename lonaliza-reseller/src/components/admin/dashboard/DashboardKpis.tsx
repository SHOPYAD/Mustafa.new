"use client";

import Link from "next/link";
import { Area, AreaChart } from "recharts";
import type { LucideIcon } from "lucide-react";

import type { DashboardCopy } from "@/components/admin/dashboard/copy";
import { formatInt } from "@/components/admin/dashboard/labels";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { Locale } from "@/lib/i18n/types";
import type { DashboardDayPoint } from "@/types/dashboard-stats";

const sparkConfig = {
  count: { label: "count", color: "#10b981" },
} satisfies ChartConfig;

export function KpiSparkCard({
  title,
  value,
  hint,
  href,
  icon: Icon,
  series,
  locale,
}: {
  title: string;
  value: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  series?: DashboardDayPoint[];
  locale: Locale;
}) {
  const last = series?.[series.length - 1]?.count ?? 0;
  const prev = series?.[series.length - 2]?.count ?? 0;
  const delta = last - prev;
  return (
    <Link href={href} className="block h-full">
      <Card className="h-full overflow-hidden border-border py-0 transition-colors hover:border-emerald-500/40">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{title}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-heading">
                {value}
              </p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Icon className="size-4" />
            </div>
          </div>
          {series && series.length > 0 ? (
            <ChartContainer config={sparkConfig} className="h-12 w-full">
              <AreaChart data={series} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.16}
                  strokeWidth={1.75}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {hint}
            {series ? (
              <span
                className={
                  delta >= 0
                    ? " font-semibold text-emerald-600 dark:text-emerald-400"
                    : " font-semibold text-rose-600 dark:text-rose-400"
                }
              >
                {" · "}
                {delta >= 0 ? "+" : ""}
                {formatInt(delta, locale)}
              </span>
            ) : null}
          </p>
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
        <h2 className="text-sm font-semibold tracking-tight text-heading">
          {title}
        </h2>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
