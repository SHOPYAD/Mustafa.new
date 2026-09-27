"use client";

import Link from "next/link";
import { ChevronLeft, GraduationCap, Menu, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import AdminNotificationCenter from "@/components/admin/AdminNotificationCenter";
import { AdminCommandTrigger } from "@/components/admin/AdminCommandPalette";
import type { Dictionary } from "@/lib/i18n/types";

type AdminTopbarProps = {
  dir: "rtl" | "ltr";
  t: Dictionary;
  isLight: boolean;
  pathname: string;
  currentLabel?: string;
  onOpenSidebar: () => void;
  onToggleTheme: () => void;
  onStartTour: () => void;
  onOpenCommand: () => void;
};

export default function AdminTopbar({
  t,
  isLight,
  pathname,
  currentLabel,
  onOpenSidebar,
  onToggleTheme,
  onStartTour,
  onOpenCommand,
}: AdminTopbarProps) {
  return (
    <header className="admin-topbar admin-chrome sticky top-0 z-30 flex h-14 min-h-14 items-center gap-2 border-b px-3 backdrop-blur-xl sm:h-16 sm:px-4 lg:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon-touch"
        className='lg:hidden text-muted-foreground'
        onClick={onOpenSidebar}
        aria-label={t.common.menu}
      >
        <Menu />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        <Link
          href="/admin"
          className='admin-tap inline-flex items-center font-medium text-muted-foreground hover:text-foreground'
        >
          {t.admin.panel}
        </Link>
        {pathname !== "/admin" ? (
          <>
            <ChevronLeft className="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />
            <span className='truncate font-semibold text-foreground'>
              {currentLabel || t.admin.page}
            </span>
          </>
        ) : null}
      </div>

      <AdminCommandTrigger label={t.common.search} onOpen={onOpenCommand} />

      <Button
        type="button"
        variant="ghost"
        size="icon-touch"
        className='sm:hidden text-muted-foreground'
        onClick={onOpenCommand}
        aria-label={t.common.search}
      >
        <Search />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="touch"
        className="hidden h-11 gap-1.5 border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-gold-soft)] px-3 text-[color:var(--admin-gold)] hover:bg-[color:var(--admin-gold)] hover:text-[color:var(--admin-gold-foreground)] sm:inline-flex lg:h-9 lg:min-h-9"
        onClick={onStartTour}
        title="بدء الجولة التعريفية بالنظام"
      >
        <GraduationCap data-icon="inline-start" />
        <span className="hidden md:inline">الجولة التعليمية</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon-touch"
        className='lg:size-9 border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs'
        onClick={onToggleTheme}
        aria-label={isLight ? t.admin.darkMode : t.admin.lightMode}
        aria-pressed={!isLight}
        title={isLight ? t.admin.darkMode : t.admin.lightMode}
      >
        {isLight ? <Moon /> : <Sun />}
      </Button>

      <LanguageSwitcher variant="admin" />
      <AdminNotificationCenter isLight={isLight} />
    </header>
  );
}
