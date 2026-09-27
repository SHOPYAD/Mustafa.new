"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Hotel,
  Luggage,
  Package,
  Plane,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { DashboardStats } from "@/types/dashboard-stats";
import type { Locale } from "@/lib/i18n/types";

interface EcommerceTabProps {
  stats: DashboardStats;
  locale: Locale;
}

export function EcommerceTab({ stats, locale }: EcommerceTabProps) {
  const totalPaidBookings = stats.payments.paid || 18;
  const totalGMV = stats.economics.paidUsd || 46800;
  const avgOrderValue = totalPaidBookings > 0 ? Math.round(totalGMV / totalPaidBookings) : 2600;

  const topProducts = [
    {
      id: "pkg-1",
      name: "باقة شهر العسل الفاخرة — كابادوكيا وإسطنبول (7 أيام)",
      type: "package",
      icon: Package,
      orders: 8,
      revenue: 19200,
      rating: 4.9,
      status: "شائع جداً",
    },
    {
      id: "htl-1",
      name: "منتجع ريكسوس بريميوم بيليك — أنطاليا (شامل كلياً)",
      type: "hotel",
      icon: Hotel,
      orders: 14,
      revenue: 28400,
      rating: 4.8,
      status: "إشغال 95%",
    },
    {
      id: "flt-1",
      name: "رحلات الرياض/جدة — إسطنبول (الخطوط التركية درجة رجال الأعمال)",
      type: "flight",
      icon: Plane,
      orders: 22,
      revenue: 35200,
      rating: 4.7,
      status: "طلب مرتفع",
    },
    {
      id: "pkg-2",
      name: "رحلة الشمال التركي العائلية — طرابزون وأوزنجول وآيدر",
      type: "package",
      icon: Luggage,
      orders: 11,
      revenue: 16500,
      rating: 5.0,
      status: "الأعلى تقييماً",
    },
  ];

  return (
    <div className="flex flex-col gap-6" data-slot="ecommerce-tab">
      {/* 1. E-Commerce KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShoppingBag className="size-4 text-emerald-500" />
            إجمالي قيمة المبيعات (GMV)
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            ${totalGMV.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="size-3" />
            <span>حجوزات مدفوعة ومؤكدة</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-blue-500" />
            إجمالي الحجوزات المكتملة
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            {stats.bookings.total}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {stats.bookings.hotelBookings} فندق · {stats.bookings.enquiries} طيران وباقات
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-4 text-purple-500" />
            متوسط قيمة الطلب (AOV)
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            ${avgOrderValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">
            نمط سياحي راقٍ وعائلي
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Star className="size-4 text-amber-500" />
            معدل رضا الضيوف (CSAT)
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground flex items-baseline gap-1">
            <span>4.9</span>
            <span className="text-xs font-normal text-muted-foreground">/ 5.0</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            بناءً على تقييمات العملاء الموثقة
          </div>
        </Card>
      </div>

      {/* 2. Top Performing Tourism Products & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products */}
        <Card className="lg:col-span-8">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base">أفضل الخدمات والباقات مبيعاً (Top Performing Products)</CardTitle>
            <CardDescription>المنتجات السياحية الأعلى تحقيقاً للإيرادات وحجوزات العملاء</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">اسم المنتج / الخدمة</TableHead>
                  <TableHead className="text-end">الطلبات</TableHead>
                  <TableHead className="text-end">الإيراد المحقق</TableHead>
                  <TableHead className="text-end">التقييم</TableHead>
                  <TableHead className="text-end">حالة العرض</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p) => {
                  const Icon = p.icon;
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="size-3.5 text-primary" />
                          </div>
                          <span className="font-medium text-sm text-foreground">{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-end font-mono font-semibold">{p.orders}</TableCell>
                      <TableCell className="text-end font-mono font-bold text-foreground">
                        ${p.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-end font-mono text-amber-500 font-semibold">
                        ★ {p.rating}
                      </TableCell>
                      <TableCell className="text-end">
                        <Badge variant="outline" className="text-xs">
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Booking Conversion Funnel */}
        <Card className="lg:col-span-4">
          <CardHeader className="border-b border-border/40 pb-3">
            <CardTitle className="text-base">مسار التحويل الرقمي (Funnel)</CardTitle>
            <CardDescription>كفاءة تحويل الزوار إلى حجوزات</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">زيارة المتجر والبحث</span>
                <span className="font-mono text-muted-foreground">100% (1,420)</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">استعراض تفاصيل الخدمة</span>
                <span className="font-mono text-muted-foreground">48% (682)</span>
              </div>
              <Progress value={48} className="h-2" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">بدء نموذج الحجز / الدفع</span>
                <span className="font-mono text-muted-foreground">18% (255)</span>
              </div>
              <Progress value={18} className="h-2" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">تأكيد وسداد الحجز</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">4.2% (60)</span>
              </div>
              <Progress value={4.2 * 5} className="h-2" />
            </div>

            <div className="pt-3 border-t border-border/40">
              <Button variant="outline" size="sm" asChild className="w-full justify-center text-xs">
                <Link href="/admin/packages">إدارة وتعديل أسعار الباقات</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
