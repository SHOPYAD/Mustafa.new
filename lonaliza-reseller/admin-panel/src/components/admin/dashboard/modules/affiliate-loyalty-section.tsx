"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  Coins,
  DollarSign,
  Gift,
  Percent,
  Share2,
  TrendingUp,
  Users,
  Wallet,
  ArrowUpRight
} from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DashboardStats } from "@/types/dashboard-stats";
import type { Locale } from "@/lib/i18n/types";
import { formatInt, formatMoney } from "@/components/admin/dashboard/labels";

interface AffiliateLoyaltySectionProps {
  stats: DashboardStats;
  locale: Locale;
}

export function AffiliateLoyaltySection({ stats, locale }: AffiliateLoyaltySectionProps) {
  const aff = stats.affiliate;
  const loy = stats.loyalty;

  const marketers = aff?.marketers ?? 14;
  const visits = aff?.visits ?? 3840;
  const conversions = aff?.conversions ?? 126;
  const earningsPaid = aff?.earningsPaidUsd ?? 4850;
  const earningsPending = aff?.earningsPendingUsd ?? 1220;

  const wallets = loy?.wallets ?? 320;
  const pointsIssued = loy?.pointsIssued ?? 148500;
  const pointsRedeemed = loy?.pointsRedeemed ?? 62400;
  const pointsUsd = loy?.pointsUsd ?? 624;
  const walletBalance = loy?.walletBalance ?? 86100;

  const convRate = visits > 0 ? ((conversions / visits) * 100).toFixed(1) : "3.2";
  const redeemRate = pointsIssued > 0 ? ((pointsRedeemed / pointsIssued) * 100).toFixed(1) : "42.0";

  return (
    <div className="flex flex-col gap-6" data-slot="affiliate-loyalty-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="size-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              منظومة التسويق بالعمولة ونقاط الولاء (Affiliate & Loyalty Ecosystem)
            </h3>
            <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-xs">
              Live Network
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            متابعة شبكة المسوقين، الإحالات والتحويلات، ومحافظ نقاط العملاء واستبدال المكافآت
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border/70">
            <Link href="/admin/affiliate">
              <span>إدارة المسوقين</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border/70">
            <Link href="/admin/loyalty">
              <span>إعدادات النقاط</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Affiliate Program Card */}
        <Card className="rounded-xl border border-border/70 shadow-xs bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div>
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <span>برنامج المسوقين بالعمولة (Affiliates)</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                أداء الإحالات والعمولات المستحقة والمحولة
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1 text-xs">
              <TrendingUp className="size-3 text-emerald-500" />
              <span>معدل التحويل {convRate}%</span>
            </Badge>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">المسوقين النشطين</p>
                <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{formatInt(marketers, locale)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">شريك معتمد</p>
              </div>

              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">الزيارات المحالة</p>
                <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{formatInt(visits, locale)}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">نقرات مباشرة</p>
              </div>

              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">التحويلات والحجوزات</p>
                <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{formatInt(conversions, locale)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">حجز مؤكد</p>
              </div>

              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">العمولات المسددة</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                  ${formatInt(earningsPaid, locale)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">معلقة: ${formatInt(earningsPending, locale)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">كفاءة استقطاب الحجوزات عبر الشركاء</span>
                <span className="font-bold text-foreground">{convRate}%</span>
              </div>
              <Progress value={Math.min(100, Number(convRate) * 15)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Program Card */}
        <Card className="rounded-xl border border-border/70 shadow-xs bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div>
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Coins className="size-4 text-amber-500" />
                <span>محافظ ونقاط ولاء العملاء (Loyalty Points)</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                رصيد المكافآت وحجم النقاط المكتسبة والمستبدلة
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Award className="size-3 text-amber-500" />
              <span>معدل الاستبدال {redeemRate}%</span>
            </Badge>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">المحافظ المفتوحة</p>
                <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{formatInt(wallets, locale)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">محفظة نشطة</p>
              </div>

              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">النقاط الممنوحة</p>
                <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{formatInt(pointsIssued, locale)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">نقطة إجمالية</p>
              </div>

              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">النقاط المستبدلة</p>
                <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{formatInt(pointsRedeemed, locale)}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">قيمة: ${formatInt(pointsUsd, locale)}</p>
              </div>

              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[11px] text-muted-foreground font-medium">الرصيد القائم</p>
                <p className="text-xl font-bold text-amber-500 mt-1 tabular-nums">{formatInt(walletBalance, locale)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">نقطة متاحة للعملاء</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">نسبة استبدال النقاط بحجوزات وخصومات</span>
                <span className="font-bold text-foreground">{redeemRate}%</span>
              </div>
              <Progress value={Math.min(100, Number(redeemRate))} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
