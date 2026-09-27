"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Globe, Monitor, MapPin } from "lucide-react";

import type { DashboardCopy } from "@/components/admin/dashboard/copy";
import { formatInt } from "@/components/admin/dashboard/labels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { Locale } from "@/lib/i18n/types";
import type { DashboardStats } from "@/types/dashboard-stats";

function deviceLabel(key: string, copy: DashboardCopy): string {
  switch (key) {
    case "desktop":
      return copy.deviceDesktop;
    case "mobile":
      return copy.deviceMobile;
    case "tablet":
      return copy.deviceTablet;
    default:
      return key;
  }
}

const pagesConfig = {
  count: { label: "count", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function DashboardTraffic({
  stats,
  copy,
  locale,
}: {
  stats: DashboardStats;
  copy: DashboardCopy;
  locale: Locale;
}) {
  const { traffic } = stats;
  const pages = traffic.topPages.map((row) => ({
    ...row,
    label: row.key,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>{copy.topPages}</CardTitle>
          <CardDescription>
            {copy.topPagesDesc} · {copy.visitSource}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!traffic.available || pages.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MapPin />
                </EmptyMedia>
                <EmptyTitle>{copy.noVisits}</EmptyTitle>
                <EmptyDescription>{copy.noVisitsHint}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ChartContainer config={pagesConfig} className="aspect-auto h-64 w-full">
              <BarChart data={pages} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={120}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.countries}</CardTitle>
          <CardDescription>{copy.audience}</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Globe />
              </EmptyMedia>
              <EmptyTitle>{copy.geoUnavailable}</EmptyTitle>
              <EmptyDescription>{copy.geoUnavailableHint}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.devices}</CardTitle>
          <CardDescription>
            {traffic.available
              ? `${copy.uniqueSessions}: ${formatInt(traffic.uniqueSessions, locale)} · ${copy.uniqueVisitors}: ${formatInt(traffic.uniqueIps, locale)}`
              : copy.audience}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {traffic.devicesAvailable && traffic.devices.some((row) => row.count > 0) ? (
            <div className="flex flex-col gap-3">
              {traffic.devices
                .filter((row) => row.count > 0)
                .map((row) => (
                  <div key={row.key} className="flex items-center justify-between text-sm">
                    <span>{deviceLabel(row.key, copy)}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatInt(row.count, locale)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Monitor />
                </EmptyMedia>
                <EmptyTitle>{copy.devicesUnavailable}</EmptyTitle>
                <EmptyDescription>{copy.devicesUnavailableHint}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
