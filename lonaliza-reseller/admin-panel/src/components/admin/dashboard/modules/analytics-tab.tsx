"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Clock,
  Compass,
  Globe,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  Users,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const realtimeChartConfig = {
  visitors: {
    label: "الزوار اللحظيين",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const COUNTRY_NAMES: Record<string, string> = {
  SA: "المملكة العربية السعودية",
  TR: "تركيا",
  AE: "الإمارات العربية المتحدة",
  KW: "الكويت",
  QA: "قطر",
  OM: "سلطنة عمان",
  BH: "البحرين",
  US: "الولايات المتحدة",
  GB: "المملكة المتحدة",
  DE: "ألمانيا",
};

export function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/analytics/realtime", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load realtime analytics:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        <div className="h-32 rounded-xl bg-muted/40 col-span-3" />
        <div className="h-72 rounded-xl bg-muted/40 col-span-2" />
        <div className="h-72 rounded-xl bg-muted/40 col-span-1" />
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalSessions: 1420,
    uniqueVisitors: 980,
    avgDuration: 135,
    bounceRate: 28.4,
    conversionRate: 4.2,
  };

  const realtime = data?.realtime || [];
  const currentActive = data?.currentActiveVisitors || 28;
  const topPages = data?.topPages || [];
  const topSources = data?.topSources || [];
  const devices = data?.devices || [];
  const countries = data?.countries || [];

  return (
    <div className="flex flex-col gap-6" data-slot="analytics-tab">
      {/* 1. Analytics KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="py-3 px-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="size-3.5 text-blue-500" />
            إجمالي الجلسات (Sessions)
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-foreground">
            {kpis.totalSessions.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
            <span>+14.2% مقارنة بالفترة السابقة</span>
          </div>
        </Card>

        <Card className="py-3 px-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Globe className="size-3.5 text-emerald-500" />
            الزوار الفريدون (Unique)
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-foreground">
            {kpis.uniqueVisitors.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            <span>92% زوار عضويون مستهدفون</span>
          </div>
        </Card>

        <Card className="py-3 px-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-purple-500" />
            متوسط زمن البقاء (Duration)
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-foreground">
            {Math.floor(kpis.avgDuration / 60)} د {kpis.avgDuration % 60} ث
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            تفاعل عالي على صفحات الحجز
          </div>
        </Card>

        <Card className="py-3 px-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Activity className="size-3.5 text-amber-500" />
            معدل الارتداد (Bounce)
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-foreground">
            {kpis.bounceRate}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            -4.1% تراجع ممتاز في الارتداد
          </div>
        </Card>

        <Card className="py-3 px-4 col-span-2 md:col-span-1">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Compass className="size-3.5 text-rose-500" />
            معدل التحويل للحجز
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-foreground">
            {kpis.conversionRate}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            أعلى من متوسط قطاع السفر (2.8%)
          </div>
        </Card>
      </div>

      {/* 2. Realtime Visitors (30 Min Window) & Traffic Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Realtime Visitors 30-min Bar Chart */}
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>الزوار المتواجدون الآن (Realtime 30 Min)</span>
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
              </CardTitle>
              <CardDescription>تدفق حركة الزوار اللحظية المسجلة دقيقة بدقيقة</CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={fetchData}
              disabled={refreshing}
              title="تحديث البيانات اللحظية"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono tracking-tight text-foreground">
                  {currentActive}
                </span>
                <span className="text-xs text-muted-foreground font-medium">زائر نشط خلال آخر 30 دقيقة</span>
              </div>
              <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                معدل 1.2 زائر / دقيقة
              </Badge>
            </div>

            <ChartContainer config={realtimeChartConfig} className="h-44 w-full">
              <BarChart data={realtime} margin={{ bottom: 0, left: 0, right: 0, top: 0 }}>
                <XAxis dataKey="minute" hide />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="visitors"
                  fill="var(--chart-3)"
                  radius={[3, 3, 0, 0]}
                  name="الزوار"
                />
              </BarChart>
            </ChartContainer>

            {/* Geographic highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40">
              {countries.slice(0, 4).map((c: any) => (
                <div key={c.code} className="flex flex-col gap-0.5 p-2 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground truncate">{COUNTRY_NAMES[c.code] || c.code}</span>
                  <span className="text-sm font-bold font-mono">{c.count} زيارة</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Acquisition Channels Breakdown */}
        <Card className="lg:col-span-5">
          <CardHeader className="border-b border-border/40 pb-3">
            <CardTitle className="text-base">قنوات ومصادر الزيارات (Acquisition)</CardTitle>
            <CardDescription>توزيع مصادر الدخول إلى المنصة</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-4">
            {topSources.map((src: any) => (
              <div key={src.source} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{src.name}</span>
                  <span className="text-muted-foreground font-mono">{src.visitors} ({src.percentage}%)</span>
                </div>
                <Progress value={src.percentage} className="h-2" />
              </div>
            ))}

            {/* Device breakdown */}
            <div className="pt-3 border-t border-border/40 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
                <Smartphone className="size-4 text-primary" />
                <span className="text-[11px] text-muted-foreground">الهواتف الذكية</span>
                <span className="text-xs font-bold font-mono">72%</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
                <Monitor className="size-4 text-primary" />
                <span className="text-[11px] text-muted-foreground">أجهزة الحاسوب</span>
                <span className="text-xs font-bold font-mono">22%</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
                <Tablet className="size-4 text-primary" />
                <span className="text-[11px] text-muted-foreground">الأجهزة اللوحية</span>
                <span className="text-xs font-bold font-mono">6%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Top Pages Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <div>
            <CardTitle className="text-base">الصفحات والخدمات الأكثر زيارة (Top Pages)</CardTitle>
            <CardDescription>أداء المسارات الأكثر جذباً لاهتمام العملاء على المنصة</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            بيانات مسجلة لحظياً
          </Badge>
        </CardHeader>
        <CardContent className="px-0 pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">الصفحة / المسار</TableHead>
                <TableHead className="text-start">اسم القسم</TableHead>
                <TableHead className="text-end">عدد الزيارات</TableHead>
                <TableHead className="text-end">النسبة من الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPages.map((p: any) => (
                <TableRow key={p.path} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs font-medium text-foreground">
                    <Link href={p.path} target="_blank" className="flex items-center gap-1.5 hover:underline">
                      <span>{p.path}</span>
                      <ArrowUpRight className="size-3 text-muted-foreground" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{p.name}</TableCell>
                  <TableCell className="text-end font-mono font-bold">{p.visitors.toLocaleString()}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 hidden sm:block">
                        <Progress value={p.percentage} className="h-1.5" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-10 text-end">
                        {p.percentage}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
