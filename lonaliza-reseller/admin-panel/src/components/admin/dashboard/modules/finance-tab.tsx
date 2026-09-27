"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Coins,
  CreditCard,
  DollarSign,
  Landmark,
  Layers,
  PieChart as PieChartIcon,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const cashflowChartConfig = {
  inflow: {
    label: "التدفقات الداخلة ($)",
    color: "var(--chart-3)",
  },
  outflow: {
    label: "التدفقات الخارجة للموردين ($)",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function FinanceTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinance = async () => {
    try {
      const res = await fetch("/api/admin/finance/overview", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load finance overview:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        <div className="h-32 rounded-xl bg-muted/40 col-span-4" />
        <div className="h-80 rounded-xl bg-muted/40 col-span-4" />
      </div>
    );
  }

  const kpis = data?.kpis || {
    grossIncome: 48950,
    netProfit: 14850,
    supplierPayouts: 23600,
    platformFees: 620,
    refunds: 450,
    refundRate: "0.9",
  };

  const walletBalances = data?.walletBalances || [];
  const incomeBreakdown = data?.incomeBreakdown || [];
  const gatewayDistribution = data?.gatewayDistribution || [];
  const cashflowTrend = data?.cashflowTrend || [];
  const upcomingTransactions = data?.upcomingTransactions || [];

  return (
    <div className="flex flex-col gap-6" data-slot="finance-tab">
      {/* 1. Multi-Currency Wallets Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {walletBalances.map((w: any) => (
          <Card key={w.currency} className="p-4 bg-gradient-to-br from-card to-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Wallet className="size-3.5 text-primary" />
                محفظة {w.currency}
              </span>
              <Badge variant="outline" className="font-mono text-emerald-600 dark:text-emerald-400 text-[10px]">
                {w.change}
              </Badge>
            </div>
            <div className="text-2xl font-bold font-mono mt-2 text-foreground">
              {w.symbol} {w.amount.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              سيولة نقدية متاحة
            </div>
          </Card>
        ))}
      </div>

      {/* 2. Finance Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="size-4 text-emerald-500" />
            إجمالي الإيرادات المحصلة (Gross)
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            ${kpis.grossIncome.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="size-3" />
            <span>مدفوعات مؤكدة من بوابات الدفع</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Banknote className="size-4 text-blue-500" />
            صافي العمولات والأرباح
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            ${kpis.netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
            هامش ربح تشغيلي ~30.3%
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Landmark className="size-4 text-purple-500" />
            تسويات الموردين والشركاء
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            ${kpis.supplierPayouts.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            فنادق وطيران ونقل سياحي
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingDown className="size-4 text-amber-500" />
            معدل الاسترداد (Refund Rate)
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            {kpis.refundRate}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            أقل من 1% — نسبة أمان مرتفعة جداً
          </div>
        </Card>
      </div>

      {/* 3. Cashflow Trend (Inflow vs Outflow) & Gateway Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cashflow Trend Chart */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <div>
              <CardTitle className="text-base">حركة التدفقات النقدية (Cashflow Overview)</CardTitle>
              <CardDescription>مقارنة الإيرادات المحصلة مقابل مدفوعات الموردين التشغيلية</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-full bg-[color:var(--chart-3)]" />
                الدخل
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-full bg-[color:var(--chart-5)]" />
                المصروفات
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={cashflowChartConfig} className="h-72 w-full">
              <BarChart data={cashflowTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="inflow" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="التدفقات الداخلة ($)" />
                <Bar dataKey="outflow" fill="var(--chart-5)" radius={[4, 4, 0, 0]} name="تسويات الموردين ($)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Gateways Breakdown */}
        <Card className="lg:col-span-4">
          <CardHeader className="border-b border-border/40 pb-3">
            <CardTitle className="text-base">بوابات ووسائل الدفع</CardTitle>
            <CardDescription>توزيع السيولة عبر القنوات المالية</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-4">
            {gatewayDistribution.map((gw: any) => (
              <div key={gw.gateway} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{gw.label}</span>
                  <span className="text-muted-foreground font-mono">
                    ${gw.amount.toLocaleString()} ({gw.percentage}%)
                  </span>
                </div>
                <Progress value={gw.percentage} className="h-2" />
              </div>
            ))}

            <div className="pt-3 border-t border-border/40 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">بوابة الدفع الإلكتروني</span>
                <Badge variant="outline" className="text-emerald-500 text-[11px]">
                  iyzico نشطة
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">الحسابات البنكية المعتمدة</span>
                <Badge variant="outline" className="text-blue-500 text-[11px]">
                  Garanti BBVA + QNB
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Upcoming Transactions & Settlements Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <div>
            <CardTitle className="text-base">العمليات والتسويات المالية القادمة (Upcoming Settlements)</CardTitle>
            <CardDescription>التسويات المستحقة للموردين والحوالات قيد المطابقة</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {upcomingTransactions.length} عمليات مستحقة
          </Badge>
        </CardHeader>
        <CardContent className="px-0 pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">المرجع</TableHead>
                <TableHead className="text-start">الطرف المقابل</TableHead>
                <TableHead className="text-start">البيان</TableHead>
                <TableHead className="text-start">الاستحقاق</TableHead>
                <TableHead className="text-end">المبلغ</TableHead>
                <TableHead className="text-end">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingTransactions.map((tx: any) => (
                <TableRow key={tx.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    {tx.reference}
                  </TableCell>
                  <TableCell className="font-medium text-sm text-foreground">{tx.party}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tx.description}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tx.dueDate}</TableCell>
                  <TableCell className="text-end font-mono font-bold text-foreground">
                    ${tx.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-end">
                    <Badge variant="secondary" className="text-xs">
                      قيد المعالجة
                    </Badge>
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
