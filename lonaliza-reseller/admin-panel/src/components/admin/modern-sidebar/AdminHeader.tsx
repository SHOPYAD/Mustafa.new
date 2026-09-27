"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModernSearchDialog } from "./SearchDialog";
import { ModernThemeSwitcher } from "./ThemeSwitcher";
import { LayoutControls } from "@/app/admin/dashboard/_components/header/layout-controls";

interface AdminHeaderProps {
  currentLabel?: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  newBookings?: number;
}

export function ModernAdminHeader({
  currentLabel,
  theme,
  onToggleTheme,
  newBookings = 0,
}: AdminHeaderProps) {
  const pathname = usePathname();

  // Compute breadcrumb section
  const getSectionTitle = () => {
    if (pathname === "/admin" || pathname.startsWith("/admin/dashboard")) return "المؤشرات العامة";
    if (pathname.startsWith("/admin/analytics")) return "التحليلات وحركة الزوار";
    if (pathname.startsWith("/admin/crm")) return "إدارة العملاء CRM";
    if (pathname.startsWith("/admin/ecommerce")) return "المتجر والطلبات";
    if (pathname.startsWith("/admin/finance")) return "المالية والتدفقات";
    if (pathname.startsWith("/admin/bookings") || pathname.startsWith("/admin/cancellations") || pathname.startsWith("/admin/reviews")) return "العمليات والحجوزات";
    if (pathname.startsWith("/admin/hotels") || pathname.startsWith("/admin/flights") || pathname.startsWith("/admin/packages") || pathname.startsWith("/admin/transfers") || pathname.startsWith("/admin/cars") || pathname.startsWith("/admin/tours") || pathname.startsWith("/admin/visa")) return "الخدمات والكتالوج";
    if (pathname.startsWith("/admin/marketing") || pathname.startsWith("/admin/ads") || pathname.startsWith("/admin/email") || pathname.startsWith("/admin/affiliate")) return "التسويق والمبيعات";
    if (pathname.startsWith("/admin/ai") || pathname.startsWith("/admin/automation") || pathname.startsWith("/admin/agent")) return "الذكاء الاصطناعي والأتمتة";
    if (pathname.startsWith("/admin/payments") || pathname.startsWith("/admin/invoices") || pathname.startsWith("/admin/b2b") || pathname.startsWith("/admin/currencies")) return "المالية والمحاسبة";
    if (pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/branding") || pathname.startsWith("/admin/pocketbase") || pathname.startsWith("/admin/integrations") || pathname.startsWith("/admin/translations") || pathname.startsWith("/admin/pwa") || pathname.startsWith("/admin/resale")) return "النظام والمنصة";
    return "لوحة الإدارة";
  };

  const section = getSectionTitle();
  const pageName = currentLabel || "الرئيسية";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-background/80 px-3 sm:px-5 backdrop-blur-md transition-all">
      {/* Left side (or Right in RTL): Sidebar toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="h-8 w-8 rounded-lg border border-border/60 hover:bg-muted" />
        <Separator orientation="vertical" className="h-4 bg-border/60 hidden sm:block" />

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin" className="text-muted-foreground hover:text-foreground text-xs font-medium">
                  لوحة التحكم
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-muted-foreground text-xs font-medium">{section}</span>
            </BreadcrumbItem>
            {pageName !== section && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-bold text-foreground truncate max-w-[160px]">
                    {pageName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side (or Left in RTL): Search, Storefront link, Notifications, Theme switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <ModernSearchDialog />

        {/* Link to live storefront */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs font-medium border-border/70 hover:bg-muted hidden md:inline-flex rounded-lg text-foreground/80 hover:text-foreground"
        >
          <a href="https://lonaliza.com" target="_blank" rel="noreferrer" title="زيارة الموقع العام">
            <ExternalLink className="size-3.5 text-amber-500" />
            <span>عرض المتجر</span>
          </a>
        </Button>

        {/* Notifications / Bookings count */}
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="relative h-8 w-8 rounded-lg border border-border/50 hover:bg-muted text-foreground/80 hover:text-foreground"
        >
          <Link href="/admin/bookings" title="الحجوزات الجديدة">
            <Bell className="size-4" />
            {newBookings > 0 && (
              <span className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black ring-2 ring-background">
                {newBookings > 9 ? "9+" : newBookings}
              </span>
            )}
          </Link>
        </Button>

        {/* Theme Switcher & Settings */}
        <ModernThemeSwitcher theme={theme} onToggle={onToggleTheme} />
        <LayoutControls />
      </div>
    </header>
  );
}
