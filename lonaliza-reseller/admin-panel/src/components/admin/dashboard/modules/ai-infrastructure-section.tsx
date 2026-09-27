"use client";

import React, { useState } from "react";
import {
  Bot,
  Cpu,
  Sparkles,
  Zap,
  Globe2,
  Share2,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Server,
  RefreshCw,
  MessageSquare,
  Instagram,
  Youtube,
  Twitter,
  Radio,
  BarChart2,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AiInfrastructureSectionProps {
  locale?: string;
}

export function AiInfrastructureSection({ locale = "ar" }: AiInfrastructureSectionProps) {
  const isAr = locale === "ar";
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const aiAgents = [
    {
      name: isAr ? "مستشار السفر الذكي (Travel Advisor)" : "AI Travel Advisor Copilot",
      role: isAr ? "اقتراح الباقات، الفنادق والجولات السياحية للعملاء" : "Curating holiday packages, hotels and itinerary",
      model: "Gemini 2.5 Flash",
      conversations: 1420,
      conversionRate: "18.4%",
      status: "active",
    },
    {
      name: isAr ? "روبوت مبيعات واتساب (WhatsApp Agent)" : "WhatsApp Sales & Booking Agent",
      role: isAr ? "الرد الفوري، إصدار عروض الأسعار وحجز الخدمات" : "Instant quotes, bookings and customer inquiry",
      model: "Gemini 2.5 Flash",
      conversations: 2890,
      conversionRate: "24.6%",
      status: "active",
    },
    {
      name: isAr ? "استوديو توليد المحتوى والتسويق (Studio AI)" : "Marketing & Content Studio AI",
      role: isAr ? "صياغة منشورات السوشيال ميديا، تحسين محركات البحث والمدونة" : "Social media posts, SEO and travel blog articles",
      model: "Gemini 2.5 Pro",
      conversations: 640,
      conversionRate: "94.2%",
      status: "active",
    },
    {
      name: isAr ? "وكيل إدارة الإلغاءات والتعديلات (Ops Copilot)" : "Ops & Booking Re-check Agent",
      role: isAr ? "التدقيق في تأكيدات المزودين وفروقات الأسعار اللحظية" : "Supplier price re-check and auto ticket issue",
      model: "Gemini 2.5 Flash",
      conversations: 890,
      conversionRate: "99.1%",
      status: "active",
    },
  ];

  const providers = [
    {
      name: "Hotelbeds BedsOnline",
      type: isAr ? "مزود فنادق عالمي" : "Global Hotels & Stays",
      latency: "185ms",
      uptime: "99.95%",
      status: "healthy",
      totalSynced: "48,200",
    },
    {
      name: "RateHawk (ETG)",
      type: isAr ? "عقود فنادق B2B مباشرة" : "B2B Direct Wholesale Hotels",
      latency: "210ms",
      uptime: "99.88%",
      status: "healthy",
      totalSynced: "34,900",
    },
    {
      name: "Travelport GDS",
      type: isAr ? "تذاكر طيران عالمية + NDC" : "Worldwide Flights & NDC",
      latency: "320ms",
      uptime: "99.76%",
      status: "healthy",
      totalSynced: "780+ Airlines",
    },
    {
      name: "PKFare Flights",
      type: isAr ? "طيران مخفض واقتصادي" : "Low-cost & Regional Flights",
      latency: "275ms",
      uptime: "99.82%",
      status: "healthy",
      totalSynced: "320+ Routes",
    },
    {
      name: "Seeru Ride & VIP",
      type: isAr ? "مواصلات وسيارات خاصة" : "VIP Transfers & Fleet",
      latency: "120ms",
      uptime: "100%",
      status: "healthy",
      totalSynced: "45 Cities",
    },
    {
      name: "Iyzico & Stripe Gateways",
      type: isAr ? "بوابات الدفع الإلكتروني" : "Card Payment Gateways",
      latency: "95ms",
      uptime: "99.99%",
      status: "healthy",
      totalSynced: "Instant Webhooks",
    },
  ];

  const socialChannels = [
    {
      name: "Instagram",
      icon: Instagram,
      handle: "@lonalizatravel",
      followers: "48.5K",
      postsThisMonth: 36,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      status: isAr ? "ربط نشط ومجدول" : "Active & Auto-publishing",
    },
    {
      name: "TikTok",
      icon: Share2,
      handle: "@lonaliza.tourism",
      followers: "82.1K",
      postsThisMonth: 24,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      status: isAr ? "نشر يومي عبر Studio AI" : "Daily Studio AI sync",
    },
    {
      name: "YouTube",
      icon: Youtube,
      handle: "Lonaliza Luxury Travel",
      followers: "16.4K",
      postsThisMonth: 12,
      color: "text-red-500",
      bg: "bg-red-500/10",
      status: isAr ? "فيديوهات وشورتس سياحية" : "Travel shorts & guides",
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      handle: "@LonalizaTR",
      followers: "12.8K",
      postsThisMonth: 54,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      status: isAr ? "تنبيهات عروض الطيران الفورية" : "Instant flight flash deals",
    },
  ];

  return (
    <div className="flex flex-col gap-6" id="ai-infrastructure-section">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
            <Bot className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {isAr ? "منظومة الذكاء الاصطناعي والبنية التحتية والسوشيال ميديا" : "AI Ecosystem, Infrastructure & Social Hub"}
              </h3>
              <Badge variant="outline" className="gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400">
                <Sparkles className="size-3" />
                Gemini 2.5
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "مراقبة استهلاك التوكنز، كفاءة روبوتات المبيعات، مزامنة المزودين العالميين والنشر التلقائي عبر المنصات"
                : "Real-time token usage, autonomous sales agents, upstream provider sync & social distribution"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 gap-1.5 py-1">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {isAr ? "جميع الوكلاء والمزودين متصلين (100% Online)" : "All Nodes Connected (100%)"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isAr ? "تحديث المؤشرات" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Token Consumption */}
        <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {isAr ? "استهلاك التوكنز هذا الشهر" : "Monthly Token Consumption"}
              </CardTitle>
              <Cpu className="size-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                2,845,120
              </span>
              <span className="text-xs text-emerald-500 font-medium">28.4% {isAr ? "من الحصة" : "of quota"}</span>
            </div>
            <Progress value={28.4} className="h-1.5 bg-purple-500/15 [&>div]:bg-purple-500" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{isAr ? "الحد الأقصى: 10M توكن" : "Quota: 10M Tokens"}</span>
              <span className="text-purple-400 font-medium">{isAr ? "متبقي 7.15M" : "7.15M left"}</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Sales Conversations */}
        <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {isAr ? "محادثات المبيعات الذكية" : "AI Sales Conversations"}
              </CardTitle>
              <MessageSquare className="size-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                5,840
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 text-[11px]">
                <ArrowUpRight className="size-3 mr-0.5" />
                +31.4%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{isAr ? "معدل التحويل لحجز مؤكد" : "Conversion to Booking"}</span>
              <span className="font-semibold text-foreground">22.8%</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "وفر 184 ساعة عمل لفريق خدمة العملاء" : "Saved 184 hours of manual support"}
            </div>
          </CardContent>
        </Card>

        {/* Upstream Sync Health */}
        <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {isAr ? "صحة مزامنة المزودين العالمية" : "Global Provider Sync Health"}
              </CardTitle>
              <Activity className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                99.92%
              </span>
              <span className="text-xs text-muted-foreground">185ms {isAr ? "متوسط استجابة" : "avg ping"}</span>
            </div>
            <div className="grid grid-cols-6 gap-1 pt-1">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="h-2 rounded-full bg-emerald-500" title="Node Online" />
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{isAr ? "6 مزودين رئيسيين" : "6 Global Upstream Connectors"}</span>
              <span className="text-emerald-500 font-medium">{isAr ? "مستقر تماماً" : "Fully Stable"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Social Reach & Auto-publish */}
        <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {isAr ? "النشر والتفاعل بالسوشيال ميديا" : "Social Publishing & Reach"}
              </CardTitle>
              <Share2 className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                159.8K
              </span>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-0 text-[11px]">
                <ArrowUpRight className="size-3 mr-0.5" />
                126 {isAr ? "منشور آلي" : "auto-posts"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{isAr ? "النقرات إلى بوابة الحجز" : "Clicks to Booking Engine"}</span>
              <span className="font-semibold text-foreground">8,420</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "4 منصات مربوطة ومتزامنة" : "4 Platforms actively synchronized"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Grid: AI Agents Matrix & Social Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Agents Table / Cards (7 Cols) */}
        <Card className="lg:col-span-7 border border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  {isAr ? "وكلاء الذكاء الاصطناعي المستقلين (Autonomous AI Agents)" : "Autonomous AI Agents Operations"}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {isAr
                    ? "أداء وكلاء المبيعات، الدعم وتوليد البرامج السياحية اللحظية"
                    : "Live performance and conversion stats for active Gemini agents"}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Radio className="size-3 text-emerald-500 animate-pulse" />
                {isAr ? "4 وكلاء في الخدمة" : "4 Active Agents"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {aiAgents.map((agent, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{agent.name}</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-purple-500/20 text-purple-500">
                        {agent.model}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                  </div>

                  <div className="flex items-center gap-4 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-semibold text-foreground tabular-nums">
                        {agent.conversations.toLocaleString()} {isAr ? "محادثة" : "chats"}
                      </div>
                      <div className="text-[11px] text-emerald-500 font-medium">
                        {agent.conversionRate} {isAr ? "نسبة إتمام" : "completion"}
                      </div>
                    </div>

                    <div className="grid size-7 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Distribution (5 Cols) */}
        <Card className="lg:col-span-5 border border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  {isAr ? "قنوات السوشيال ميديا والتسويق الآلي" : "Social Media & Automated Feeds"}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {isAr ? "مزامنة النشر التلقائي للعروض والباقات" : "Auto-publishing packages & flash deals"}
                </CardDescription>
              </div>
              <Share2 className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {socialChannels.map((channel, i) => {
              const Icon = channel.icon;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/40 bg-card/40 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid size-9 place-items-center rounded-lg ${channel.bg} ${channel.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        {channel.name}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {channel.handle}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{channel.status}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-xs text-foreground tabular-nums">
                      {channel.followers}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {channel.postsThisMonth} {isAr ? "منشور هذا الشهر" : "posts/mo"}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Full Width: Upstream Provider Health Matrix */}
      <Card className="border border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Server className="size-4 text-emerald-500" />
                {isAr ? "مصفوفة مزامنة المزودين وبوابات الحجز العالمية (GDS & Wholesale Connectivity)" : "Global Wholesale & GDS Connectivity Matrix"}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {isAr
                  ? "مراقبة مباشرة لزمن الاستجابة، نسبة التوافر، وحالة مزامنة الأسعار الحية مع محركات الحجز"
                  : "Live monitoring of supplier latency, inventory sync, and booking API connectivity"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-500">
                <ShieldCheck className="size-3 mr-1" />
                TLS 1.3 / Encrypted
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
            {providers.map((provider, i) => (
              <div key={i} className="p-4 flex flex-col gap-2 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{provider.name}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] py-0">
                    <CheckCircle2 className="size-2.5 mr-1" />
                    {provider.uptime}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{provider.type}</span>
                  <span className="font-mono text-[11px] text-foreground font-medium">{provider.latency}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/30">
                  <span className="text-muted-foreground">{isAr ? "المخزون النشط:" : "Active Catalog:"}</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{provider.totalSynced}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
