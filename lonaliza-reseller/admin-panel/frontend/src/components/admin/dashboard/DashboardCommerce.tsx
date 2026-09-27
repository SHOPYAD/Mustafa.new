"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { BadgePercent, Gift, TicketPercent, Wallet } from "lucide-react";

import type { DashboardCopy } from "@/components/admin/dashboard/copy";
import { SectionTitle } from "@/components/admin/dashboard/DashboardKpis";
import { formatInt, formatMoney, typeLabel } from "@/components/admin/dashboard/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { Locale } from "@/lib/i18n/types";
import type { DashboardStats } from "@/types/dashboard-stats";

const ecoConfig = {
  cost: { label: "cost", theme: { light: "#051741", dark: "#38bdf8" } },
  profit: { label: "profit", color: "#10b981" },
  paid: { label: "paid", theme: { light: "#64748b", dark: "#94a3b8" } },
} satisfies ChartConfig;

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/60 px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function DashboardCommerce({
  stats,
  copy,
  locale,
}: {
  stats: DashboardStats;
  copy: DashboardCopy;
  locale: Locale;
}) {
  const { affiliate, loyalty, coupons, economics } = stats;
  const ecoDays = economics.last14Days.map((row) => ({
    ...row,
    label: row.date.slice(5),
  }));
  const ecoBars = economics.byService
    .filter((row) => row.paidUsd > 0 || row.bookings > 0)
    .map((row) => ({
      ...row,
      label: typeLabel(row.key, copy),
    }));

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title={copy.sectionEconomics} hint={copy.economicsHint} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Metric
          label={copy.cost}
          value={formatMoney(economics.costUsd, "USD", locale)}
        />
        <Metric
          label={copy.profit}
          value={formatMoney(economics.profitUsd, "USD", locale)}
          hint={`${copy.hotelMarkupProfit}: ${formatMoney(economics.hotelMarkupProfitUsd, "USD", locale)}`}
        />
        <Metric
          label={copy.clientPaid}
          value={formatMoney(economics.paidUsd, "USD", locale)}
          hint={economics.estimated ? copy.estimated : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{copy.economics}</CardTitle>
            <CardDescription>
              {copy.hotelMarkupProfit} · {formatMoney(economics.hotelMarkupProfitUsd, "USD", locale)}
              {" · "}
              {copy.flightMarkupProfit} · {formatMoney(economics.flightMarkupProfitUsd, "USD", locale)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ecoConfig} className="aspect-auto h-56 w-full">
              <AreaChart data={ecoDays} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="paid" stroke="var(--color-paid)" fill="var(--color-paid)" fillOpacity={0.08} strokeWidth={1.5} />
                <Area type="monotone" dataKey="cost" stroke="var(--color-cost)" fill="var(--color-cost)" fillOpacity={0.12} strokeWidth={1.5} />
                <Area type="monotone" dataKey="profit" stroke="var(--color-profit)" fill="var(--color-profit)" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{copy.bookingsByType}</CardTitle>
            <CardDescription>{copy.economicsHint}</CardDescription>
          </CardHeader>
          <CardContent>
            {ecoBars.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>{copy.noBookings}</EmptyTitle>
                  <EmptyDescription>{copy.comingSoon}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ChartContainer config={ecoConfig} className="aspect-auto h-56 w-full">
                <BarChart data={ecoBars} margin={{ left: 8, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="var(--color-profit)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paidUsd" fill="var(--color-paid)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <SectionTitle title={copy.sectionGrowth} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgePercent className="size-4 text-purple-700 dark:text-amber-400" />
              {copy.affiliate}
            </CardTitle>
            <CardDescription>
              <Link href="/admin/affiliate">{copy.affiliates}</Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {!affiliate.available ? (
              <Badge variant="outline" className="col-span-2 w-fit">
                {copy.comingSoon}
              </Badge>
            ) : null}
            <Metric label={copy.affiliates} value={formatInt(affiliate.marketers, locale)} />
            <Metric label={copy.affiliateVisits} value={formatInt(affiliate.visits, locale)} />
            <Metric
              label={copy.affiliateConversions}
              value={formatInt(affiliate.conversions, locale)}
            />
            <Metric
              label={copy.affiliatePaid}
              value={formatMoney(affiliate.earningsPaidUsd, "USD", locale)}
              hint={`${copy.affiliatePending}: ${formatMoney(affiliate.earningsPendingUsd, "USD", locale)}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="size-4 text-purple-700 dark:text-amber-400" />
              {copy.rewards}
            </CardTitle>
            <CardDescription>
              <Wallet className="me-1 inline size-3.5" />
              {formatInt(loyalty.wallets, locale)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {!loyalty.available ? (
              <Badge variant="outline" className="col-span-2 w-fit">
                {copy.comingSoon}
              </Badge>
            ) : null}
            <Metric label={copy.pointsIssued} value={formatInt(loyalty.pointsIssued, locale)} />
            <Metric label={copy.pointsRedeemed} value={formatInt(loyalty.pointsRedeemed, locale)} />
            <Metric
              label={copy.pointsUsd}
              value={formatMoney(loyalty.pointsUsd, "USD", locale)}
            />
            <Metric
              label={copy.walletBalance}
              value={formatInt(loyalty.walletBalance, locale)}
              hint={`${copy.pendingPoints}: ${formatInt(loyalty.pendingPoints, locale)}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="size-4 text-purple-700 dark:text-amber-400" />
              {copy.coupons}
            </CardTitle>
            <CardDescription>
              <Link href="/admin/marketing/coupons">{copy.couponsByService}</Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!coupons.available ? (
              <Badge variant="outline" className="w-fit">
                {copy.comingSoon}
              </Badge>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <Metric label={copy.couponsCreated} value={formatInt(coupons.created, locale)} />
              <Metric label={copy.couponsUsed} value={formatInt(coupons.used, locale)} />
            </div>
            <Metric
              label={copy.couponsDiscount}
              value={formatMoney(coupons.discountUsd, "USD", locale)}
            />
            {coupons.byService.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {coupons.byService.map((row) => (
                  <Badge key={row.key} variant="secondary">
                    {row.key} · {formatInt(row.count, locale)}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
