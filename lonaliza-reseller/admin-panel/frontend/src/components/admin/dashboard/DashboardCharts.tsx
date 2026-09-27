"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardCopy } from "@/components/admin/dashboard/copy";
import {
  formatDay,
  formatInt,
  statusLabel,
  typeLabel,
} from "@/components/admin/dashboard/labels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Locale } from "@/lib/i18n/types";
import type {
  DashboardDayPoint,
  DashboardNamedCount,
} from "@/types/dashboard-stats";

const trendConfig = {
  count: { label: "count", color: "var(--admin-amber)" },
} satisfies ChartConfig;

const typeConfig = {
  count: { label: "count", color: "var(--admin-purple-royal)" },
} satisfies ChartConfig;

const payColors = [
  "var(--admin-amber)",
  "var(--admin-purple-royal)",
  "var(--chart-5)",
  "var(--chart-2)",
];

type Props = {
  locale: Locale;
  copy: DashboardCopy;
  bookingsDays: DashboardDayPoint[];
  bookingsByType: DashboardNamedCount[];
  payments: DashboardNamedCount[];
};

export function DashboardCharts({
  locale,
  copy,
  bookingsDays,
  bookingsByType,
  payments,
}: Props) {
  const trendData = bookingsDays.map((row) => ({
    ...row,
    label: formatDay(row.date, locale),
  }));
  const typeData = bookingsByType.map((row) => ({
    ...row,
    label: typeLabel(row.key, copy),
  }));
  const payData = payments.filter((row) => row.count > 0);
  const payConfig = {
    ...Object.fromEntries(
      payData.map((row, i) => [
        row.key,
        { label: statusLabel(row.key, copy), color: payColors[i % payColors.length] },
      ])
    ),
  } satisfies ChartConfig;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2" data-slot="dashboard-charts">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{copy.bookingsTrend}</CardTitle>
          <CardDescription>{copy.bookingsTrendDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendConfig} className="aspect-auto h-72 w-full">
            <AreaChart data={trendData} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--admin-amber)"
                fill="var(--admin-amber)"
                fillOpacity={0.18}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{copy.paymentMix}</CardTitle>
          <CardDescription>{copy.paymentMixDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {payData.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">{copy.noBookings}</p>
          ) : (
            <>
              <ChartContainer config={payConfig} className="aspect-auto mx-auto h-56 w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={payData}
                    dataKey="count"
                    nameKey="key"
                    innerRadius={48}
                    outerRadius={80}
                    strokeWidth={2}
                  >
                    {payData.map((row, i) => (
                      <Cell key={row.key} fill={payColors[i % payColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                {payData.map((row, i) => (
                  <span key={row.key} className="inline-flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: payColors[i % payColors.length] }}
                    />
                    {statusLabel(row.key, copy)} · {formatInt(row.count, locale)}
                  </span>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 xl:col-span-2">
        <CardHeader>
          <CardTitle>{copy.bookingsByType}</CardTitle>
          <CardDescription>{copy.bookingsByTypeDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={typeConfig} className="aspect-auto h-56 w-full">
            <BarChart data={typeData} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--admin-purple-royal)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
