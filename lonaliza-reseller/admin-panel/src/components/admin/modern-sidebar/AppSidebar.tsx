"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart3,
  Bot,
  Brain,
  Building2,
  CalendarDays,
  Car,
  ChevronDown,
  ChevronRight,
  Coins,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Globe,
  Hotel,
  Inbox,
  Languages,
  LayoutDashboard,
  Layers,
  MapPin,
  Megaphone,
  MessageSquare,
  Package,
  Plane,
  Plug,
  Receipt,
  Repeat,
  Scale,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Undo2,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ModernNavUser } from "./NavUser";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  newBookings?: number;
  onLogout: () => void;
  dir?: "rtl" | "ltr";
}

export function ModernAppSidebar({
  newBookings = 0,
  onLogout,
  dir = "rtl",
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string, exact = false) => {
    if (exact || href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar
      side={dir === "rtl" ? "right" : "left"}
      variant="sidebar"
      collapsible="icon"
      className="border-sidebar-border bg-sidebar font-sans"
      {...props}
    >
      {/* Brand Header */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/50 rounded-xl transition-all">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30 p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.svg?v=5" alt="Lonaliza" className="size-6 object-contain" />
                </div>
                <div className="grid flex-1 text-start text-xs leading-tight">
                  <span className="truncate font-bold text-sm text-sidebar-foreground">
                    Lonaliza Studio
                  </span>
                  <span className="truncate text-[10px] text-amber-500 font-medium flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    منصة الإدارة الذكية v2.0
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="px-2 py-1 space-y-1">
        {/* 1. لوحات المؤشرات */}
        <SidebarGroup>
          <SidebarGroupLabel>لوحات المؤشرات والتحليلات</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin" || pathname === "/admin/dashboard"} tooltip="نظرة عامة">
                  <Link href="/admin">
                    <LayoutDashboard className="size-4 text-amber-500" />
                    <span>المؤشرات العامة (Overview)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isLinkActive("/admin/analytics")} tooltip="التحليلات والزيارات">
                  <Link href="/admin/analytics">
                    <BarChart3 className="size-4 text-indigo-500" />
                    <span>التحليلات الحية (Analytics)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isLinkActive("/admin/crm")} tooltip="إدارة العملاء CRM">
                  <Link href="/admin/crm">
                    <Users className="size-4 text-emerald-500" />
                    <span>العملاء والصفقات (CRM)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isLinkActive("/admin/ecommerce")} tooltip="المتجر والطلبات">
                  <Link href="/admin/ecommerce">
                    <Package className="size-4 text-sky-500" />
                    <span>المتجر والطلبات (Store)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isLinkActive("/admin/finance")} tooltip="المالية والتدفقات">
                  <Link href="/admin/finance">
                    <Banknote className="size-4 text-violet-500" />
                    <span>المالية والتدفقات (Finance)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 2. الحجوزات والعمليات */}
        <SidebarGroup>
          <SidebarGroupLabel>الحجوزات والعمليات</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isLinkActive("/admin/bookings")} tooltip="جميع الحجوزات">
                  <Link href="/admin/bookings">
                    <Inbox className="size-4 text-amber-500" />
                    <span>جميع الحجوزات</span>
                    {newBookings > 0 && (
                      <SidebarMenuBadge className="bg-amber-500 text-black font-bold">
                        {newBookings}
                      </SidebarMenuBadge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isLinkActive("/admin/cancellations")} tooltip="طلبات الإلغاء">
                  <Link href="/admin/cancellations">
                    <Undo2 className="size-4 text-rose-500" />
                    <span>طلبات الإلغاء والاسترداد</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isLinkActive("/admin/reviews")} tooltip="تقييمات العملاء">
                  <Link href="/admin/reviews">
                    <Star className="size-4 text-amber-400" />
                    <span>تقييمات العملاء الموثقة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 3. الكتالوج السياحي والخدمات */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
                <span>الخدمات السياحية والكتالوج</span>
                <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/hotels")} tooltip="الفنادق">
                      <Link href="/admin/hotels">
                        <Hotel className="size-4 text-blue-500" />
                        <span>مزودو ومارك أب الفنادق</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/hotels/catalog")} tooltip="كتالوج الفنادق">
                      <Link href="/admin/hotels/catalog">
                        <Building2 className="size-4 text-blue-400" />
                        <span>الكتالوج الداخلي للفنادق</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/flights")} tooltip="الطيران">
                      <Link href="/admin/flights">
                        <Plane className="size-4 text-sky-400" />
                        <span>تذاكر الطيران و GDS</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/packages")} tooltip="الباقات">
                      <Link href="/admin/packages">
                        <Package className="size-4 text-orange-400" />
                        <span>الباقات والعروض السياحية</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/transfers")} tooltip="المواصلات">
                      <Link href="/admin/transfers">
                        <Car className="size-4 text-teal-400" />
                        <span>خدمات المواصلات والاستقبال</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/cars")} tooltip="تأجير السيارات">
                      <Link href="/admin/cars">
                        <Car className="size-4 text-indigo-400" />
                        <span>تأجير السيارات</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/tours")} tooltip="الجولات والأنشطة">
                      <Link href="/admin/tours">
                        <MapPin className="size-4 text-red-400" />
                        <span>الجولات والرحلات اليومية</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/visa")} tooltip="التأشيرات">
                      <Link href="/admin/visa">
                        <FileText className="size-4 text-emerald-400" />
                        <span>خدمات التأشيرات الإلكترونية</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* 4. محتوى الموقع والمحررات */}
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
                <span>المحتوى والواجهات</span>
                <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/homepage-editor")} tooltip="محرر الرئيسية">
                      <Link href="/admin/homepage-editor">
                        <Layers className="size-4 text-fuchsia-400" />
                        <span>محرر الصفحة الرئيسية</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/visual-editor")} tooltip="المحرر المرئي">
                      <Link href="/admin/visual-editor">
                        <Sparkles className="size-4 text-pink-400" />
                        <span>المحرر البصري التفاعلي</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/pages")} tooltip="الصفحات الثابتة">
                      <Link href="/admin/pages">
                        <FileText className="size-4 text-neutral-400" />
                        <span>إدارة الصفحات الثابتة</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/media")} tooltip="مكتبة الوسائط">
                      <Link href="/admin/media">
                        <Building2 className="size-4 text-cyan-400" />
                        <span>مكتبة الوسائط والملفات</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/blog")} tooltip="المدونة">
                      <Link href="/admin/blog">
                        <FileText className="size-4 text-yellow-400" />
                        <span>المدونة والمقالات</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* 5. التسويق والنمو */}
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
                <span>التسويق والمبيعات</span>
                <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/marketing")} tooltip="الحملات">
                      <Link href="/admin/marketing">
                        <Megaphone className="size-4 text-orange-400" />
                        <span>الحملات والخصومات</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/email-marketing")} tooltip="التسويق بالبريد">
                      <Link href="/admin/email-marketing">
                        <Inbox className="size-4 text-blue-400" />
                        <span>التسويق عبر البريد الإلكتروني</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/ads")} tooltip="الإعلانات">
                      <Link href="/admin/ads">
                        <BarChart3 className="size-4 text-emerald-400" />
                        <span>إعلانات Google و Facebook</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/affiliate")} tooltip="العمولات">
                      <Link href="/admin/affiliate">
                        <Coins className="size-4 text-amber-400" />
                        <span>نظام التسويق بالعمولة</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/social-accounts")} tooltip="التواصل">
                      <Link href="/admin/social-accounts">
                        <Globe className="size-4 text-sky-400" />
                        <span>حسابات التواصل الاجتماعي</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* 6. الذكاء الاصطناعي والأتمتة */}
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
                <span>الذكاء الاصطناعي والأتمتة</span>
                <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/ai-programs")} tooltip="برامج AI">
                      <Link href="/admin/ai-programs">
                        <Bot className="size-4 text-purple-400" />
                        <span>برامج ووكلاء الذكاء الاصطناعي</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/automation-studio")} tooltip="استوديو الأتمتة">
                      <Link href="/admin/automation-studio">
                        <Workflow className="size-4 text-teal-400" />
                        <span>استوديو مسارات العمل والأتمتة</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/agent-war-room")} tooltip="غرفة القيادة">
                      <Link href="/admin/agent-war-room">
                        <Brain className="size-4 text-rose-400" />
                        <span>غرفة قيادة الوكلاء (War Room)</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/ai-settings")} tooltip="إعدادات AI">
                      <Link href="/admin/ai-settings">
                        <Sparkles className="size-4 text-amber-400" />
                        <span>إعدادات نماذج الذكاء الاصطناعي</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* 7. المالية والفواتير */}
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
                <span>المالية والمحاسبة</span>
                <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/payments")} tooltip="المدفوعات">
                      <Link href="/admin/payments">
                        <CreditCard className="size-4 text-emerald-400" />
                        <span>المدفوعات وبوابات الدفع</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/invoices")} tooltip="الفواتير">
                      <Link href="/admin/invoices">
                        <Receipt className="size-4 text-cyan-400" />
                        <span>الفواتير والقيود المحاسبية</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/b2b-wallet")} tooltip="محفظة B2B">
                      <Link href="/admin/b2b-wallet">
                        <Wallet className="size-4 text-amber-400" />
                        <span>محفظة الشركات والوكلاء B2B</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/currencies")} tooltip="العملات">
                      <Link href="/admin/currencies">
                        <Coins className="size-4 text-violet-400" />
                        <span>إدارة العملات وأسعار الصرف</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* 8. إعدادات النظام */}
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
                <span>النظام والمنصة</span>
                <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/settings")} tooltip="الإعدادات العامة">
                      <Link href="/admin/settings">
                        <Settings className="size-4 text-neutral-400" />
                        <span>الإعدادات العامة للشركة</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/branding")} tooltip="الهوية">
                      <Link href="/admin/branding">
                        <Building2 className="size-4 text-amber-400" />
                        <span>الهوية البصرية والشعار</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/pocketbase")} tooltip="PocketBase">
                      <Link href="/admin/pocketbase">
                        <Database className="size-4 text-rose-400" />
                        <span>قاعدة بيانات PocketBase</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/integrations")} tooltip="التكاملات">
                      <Link href="/admin/integrations">
                        <Plug className="size-4 text-blue-400" />
                        <span>التكاملات وبوابات الربط API</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/translations")} tooltip="اللغات">
                      <Link href="/admin/translations">
                        <Languages className="size-4 text-green-400" />
                        <span>إدارة اللغات والترجمات</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/pwa")} tooltip="تطبيقات الجوال">
                      <Link href="/admin/pwa">
                        <Smartphone className="size-4 text-purple-400" />
                        <span>تطبيقات الجوال والـ PWA</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/license")} tooltip="التراخيص">
                      <Link href="/admin/license">
                        <Scale className="size-4 text-yellow-400" />
                        <span>التراخيص والاتفاقيات</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive("/admin/resale")} tooltip="إعادة البيع">
                      <Link href="/admin/resale">
                        <Repeat className="size-4 text-emerald-400" />
                        <span>نظام إعادة البيع (Reseller Hub)</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      {/* Footer Profile & Logout */}
      <SidebarFooter className="p-3">
        <ModernNavUser onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
