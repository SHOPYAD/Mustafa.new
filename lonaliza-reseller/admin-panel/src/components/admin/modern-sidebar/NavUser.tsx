"use client";

import Link from "next/link";
import { CircleUser, Database, LogOut, Settings, Sparkles, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function ModernNavUser({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-12 w-full rounded-xl data-[state=open]:bg-sidebar-accent border border-sidebar-border/40 hover:bg-sidebar-accent/80 transition-all p-2"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border shadow-xs">
                <AvatarImage src="/logo.svg?v=5" alt="Admin" className="object-contain p-0.5" />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                  LA
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-xs leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                  Lonaliza Admin
                </span>
                <span className="truncate text-sidebar-foreground/60 text-[11px] flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  مدير المنصة التنفيذي
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-xl p-1.5 shadow-lg border-border"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-2 font-normal">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 rounded-lg border border-border">
                  <AvatarImage src="/logo.svg?v=5" alt="Admin" className="p-0.5 object-contain" />
                  <AvatarFallback className="rounded-lg font-bold text-xs">LA</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-xs leading-tight">
                  <span className="truncate font-bold text-foreground">Lonaliza Admin</span>
                  <span className="truncate text-muted-foreground text-[11px]">admin@lonaliza.com</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="flex items-center gap-2 cursor-pointer text-xs">
                  <Settings className="size-3.5 text-muted-foreground" />
                  <span>إعدادات المنصة</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/pocketbase" className="flex items-center gap-2 cursor-pointer text-xs">
                  <Database className="size-3.5 text-muted-foreground" />
                  <span>قاعدة البيانات PocketBase</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/ai-settings" className="flex items-center gap-2 cursor-pointer text-xs">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>محرك الذكاء الاصطناعي</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="flex items-center gap-2 text-destructive cursor-pointer text-xs focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="size-3.5" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
