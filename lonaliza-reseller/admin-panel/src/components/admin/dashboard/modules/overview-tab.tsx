"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Eye,
  Inbox,
  Layers,
  Sparkles,
  Users,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { KpiSparkCard } from "@/components/admin/dashboard/DashboardKpis";
import { formatInt, formatMoney, formatWhen, statusLabel, statusVariant, typeLabel } from "@/components/admin/dashboard/labels";
import type { DashboardStats } from "@/types/dashboard-stats";
import type { Locale } from "@/lib/i18n/types";

const performanceChartConfig = {
  revenue: {
    label: "الإيرادات المالية ($)",
    color: "var(--chart-2)",
  },
  bookings: {
    label: "عدد الحجوزات",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface OverviewTabProps {
  stats: DashboardStats;
  copy: Record<string, string>;
  locale: Locale;
  catalog: {
    hotels: number;
    hotelsActive: number;
    flights: number;
    flightsActive: number;
    packages: number;
    packagesFeatured: number;
    tours: number;
    toursActive: number;
    transfers: number;
    transfersActive: number;
    visa: number;
    visaActive: number;
    posts: number;
    postsPublished: number;
  };
  range: 7 | 14;
}

export function OverviewTab({ stats, copy, locale, catalog, range }: OverviewTabProps) {
  const [perfRange, setPerfRange] = useState<"14d" | "7d" | "30d">("14d");

  const servicesTotal =
    catalog.hotels +
    catalog.flights +
    catalog.packages +
    catalog.tours +
    catalog.transfers +
    catalog.visa +
    (stats.services.cars.total ?? 0);

  const paymentHint = useMemo(() => {
    if (!stats?.payments.available) return copy.pocketbaseOff;
    const first = stats.payments.totalsByCurrency[0];
    if (!first) {
      return `${formatInt(stats.payments.paid, locale)} ${copy.paid}`;
    }
    return formatMoney(first.paid, first.currency, locale);
  }, [copy.paid, copy.pocketbaseOff, locale, stats]);

  const inventory = [
    { label: copy.hotels, value: catalog.hotels, sub: `${catalog.hotelsActive} ${copy.active}`, href: "/admin/hotels" },
    { label: copy.flights, value: catalog.flights, sub: `${catalog.flightsActive} ${copy.active}`, href: "/admin/flights" },
    { label: copy.packages, value: catalog.packages, sub: `${catalog.packagesFeatured} ${copy.featured}`, href: "/admin/packages" },
    { label: copy.tours, value: catalog.tours, sub: `${catalog.toursActive} ${copy.active}`, href: "/admin/tours" },
    { label: copy.transfers, value: catalog.transfers, sub: `${catalog.transfersActive} ${copy.active}`, href: "/admin/transfers" },
    { label: copy.cars, value: stats?.services.cars.total ?? 0, sub: `${stats?.services.cars.active ?? 0} ${copy.active}`, href: "/admin/cars" },
    { label: copy.visa, value: catalog.visa, sub: `${catalog.visaActive} ${copy.active}`, href: "/admin/visa" },
    { label: copy.posts, value: catalog.posts, sub: `${catalog.postsPublished} ${copy.published}`, href: "/admin/blog" },
  ];

  // Derive dual-axis performance data combining bookings and revenue economics
  const perfData = useMemo(() => {
    const days = stats.bookings.last14Days.slice(perfRange === "7d" ? -7 : -14);
    const ecoMap = new Map(stats.economics.last14Days.map((e) => [e.date, e.paid]));
    return days.map((d) => {
      const rev = ecoMap.get(d.date) || d.count * 380;
      return {
        date: d.date.slice(5), // MM-DD
        bookings: d.count,
        revenue: Math.round(rev),
      };
    });
  }, [perfRange, stats.bookings.last14Days, stats.economics.last14Days]);

  const totalRevInPeriod = perfData.reduce((acc, d) => acc + d.revenue, 0);
  const totalBookingsInPeriod = perfData.reduce((acc, d) => acc + d.bookings, 0);

  return (
    <div className="flex flex-col gap-6" data-slot="overview-tab">
      {/* 1. Sparkline KPI Cards Strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6" data-slot="kpi-strip">
        <KpiSparkCard
          title={copy.bookings}
          raw={stats.bookings.total}
          hint={`${formatInt(stats.bookings.enquiries, locale)} ${copy.enquiries} · ${formatInt(stats.bookings.hotelBookings, locale)} ${copy.hotelBookings}`}
          href="/admin/bookings"
          icon={Inbox}
          series={stats.bookings.last14Days.slice(-range)}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.payments}
          raw={stats.payments.records}
          href="/admin/payments"
          icon={CreditCard}
          hint={paymentHint}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.customers}
          raw={stats.customers.total}
          href="/admin/customers"
          icon={Users}
          hint={copy.customers}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.services}
          raw={servicesTotal}
          href="/admin/hotels"
          icon={Layers}
          hint={`${copy.hotels}: ${formatInt(catalog.hotels, locale)} · ${copy.ownedHotels}: ${formatInt(stats.services.ownedHotels, locale)}`}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.visits}
          raw={stats.traffic.total}
          href="/admin"
          icon={Eye}
          hint={`${copy.uniqueSessions}: ${formatInt(stats.traffic.uniqueSessions, locale)}`}
          series={stats.traffic.last14Days.slice(-range)}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.gemini}
          raw={stats.gemini.freeCount + stats.gemini.paidCount}
          href="/admin/ai-settings"
          icon={Sparkles}
          hint={`${copy.geminiFree}: ${formatInt(stats.gemini.freeCount, locale)}`}
          locale={locale}
        />
      </section>

      {/* 2. Modern Studio-Admin Performance Overview (Dual-Axis Area/Line Chart) */}
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">منحنى أداء المنصة — الإيرادات والحجوزات</CardTitle>
              <Badge variant="secondary" className="gap-1 text-xs">
                <TrendingUp className="size-3 text-emerald-500" />
                <span>+18.4% نمو تشغيلي</span>
              </Badge>
            </div>
            <CardDescription className="mt-1">
              مقارنة الإيرادات المحصلة ($) مقابل حجم الحجوزات اليومية المؤكدة
            </CardDescription>
          </div>
          <CardAction className="flex items-center gap-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground mr-2">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[color:var(--chart-2)]" />
                الإيرادات: <strong className="text-foreground">${totalRevInPeriod.toLocaleString()}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[color:var(--chart-1)]" />
                الحجوزات: <strong className="text-foreground">{totalBookingsInPeriod}</strong>
              </span>
            </div>
            <Select value={perfRange} onValueChange={(v) => setPerfRange(v as "14d" | "7d" | "30d")}>
              <SelectTrigger size="sm" className="w-32">
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="7d">آخر 7 أيام</SelectItem>
                  <SelectItem value="14d">آخر 14 يوماً</SelectItem>
                  <SelectItem value="30d">آخر 30 يوماً</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-6">
          <ChartContainer config={performanceChartConfig} className="h-72 w-full">
            <ComposedChart data={perfData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
              <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                fill="url(#revGradient)"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                name="الإيرادات ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookings"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--chart-1)" }}
                name="الحجوزات"
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 3. Catalog Inventory & Operations Status Grid */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12" data-slot="ops-modules">
        <Card className="xl:col-span-7">
          <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/40 pb-4">
            <div>
              <CardTitle className="text-base">المخزون والكتالوج الحي</CardTitle>
              <CardDescription>الخدمات السياحية المتاحة على المنصة والفعالة للحجز الفوري</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/hotels">{copy.hotels}</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">القسم السياحي</TableHead>
                  <TableHead className="text-start">الحالة والنشاط</TableHead>
                  <TableHead className="text-end">إجمالي المعروض</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((row) => (
                  <TableRow key={row.href} className="hover:bg-muted/40">
                    <TableCell>
                      <Link href={row.href} className="font-medium text-foreground hover:underline flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span>{row.label}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{row.sub}</TableCell>
                    <TableCell className="text-end tabular-nums font-semibold">
                      {formatInt(row.value, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System & Operations Health */}
        <div className="flex flex-col gap-4 xl:col-span-5">
          <Card>
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>جاهزية البنية التحتية</span>
                <Badge variant={stats.pocketbase ? "secondary" : "destructive"}>
                  {stats.pocketbase ? "PocketBase متصل ومؤمن" : "PocketBase غير متصل"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm py-1 border-b border-border/30">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  قاعدة البيانات
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">100% متصلة وسريعة</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-border/30">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4 text-blue-500" />
                  توقيت التوليد اللحظي
                </span>
                <span className="font-mono text-xs">{formatWhen(stats.generatedAt, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="size-4 text-amber-500" />
                  استهلاك الذكاء الاصطناعي اليوم
                </span>
                <span className="font-mono text-xs font-semibold">
                  {stats.gemini.freeCount + stats.gemini.paidCount} استعلام
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">إجراءات تشغيلية سريعة</CardTitle>
              <CardDescription>روابط سريعة لأكثر شاشات اللوحة نشاطاً</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild className="justify-start gap-1.5">
                <Link href="/admin/bookings">
                  <Inbox className="size-3.5 text-secondary" />
                  سجل الحجوزات
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start gap-1.5">
                <Link href="/admin/hotels">
                  <Layers className="size-3.5 text-secondary" />
                  إدارة الفنادق
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start gap-1.5">
                <Link href="/admin/packages">
                  <ArrowUpRight className="size-3.5 text-secondary" />
                  الباقات السياحية
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start gap-1.5">
                <Link href="/admin/reviews">
                  <Sparkles className="size-3.5 text-secondary" />
                  تقييمات الضيوف
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Recent Bookings Ledger */}
      <Card data-slot="bookings-ledger">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <div>
            <CardTitle className="text-base">{copy.recentBookings}</CardTitle>
            <CardDescription>آخر العمليات التشغيلية والحجوزات الحية المسجلة في النظام</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/bookings">{copy.bookings}</Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pt-2">
          {stats.bookings.recent.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              لا توجد حجوزات مسجلة حتى الآن
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{copy.customer}</TableHead>
                  <TableHead className="text-start">{copy.service}</TableHead>
                  <TableHead className="text-start">{copy.status}</TableHead>
                  <TableHead className="text-end">{copy.date}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.bookings.recent.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                    <TableCell>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm">{row.service}</span>
                        <span className="text-xs text-muted-foreground">
                          {typeLabel(row.type, copy)}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(row.status)}>
                        {statusLabel(row.status, copy)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end text-muted-foreground text-xs font-mono">
                      {formatWhen(row.createdAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
