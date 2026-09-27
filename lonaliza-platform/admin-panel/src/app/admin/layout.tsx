"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, GraduationCap, Menu, Moon, Sun } from "lucide-react";
import { checkAuthenticated, logout } from "@/data/auth";
import { fetchNewBookingsCount, getNewBookingsCount } from "@/data/bookings";
import {
  applyAdminTheme,
  applyAdminThemeConfig,
  clearAdminTheme,
  persistAdminTheme,
  persistThemeConfig,
  readStoredAdminTheme,
  readStoredThemeConfig,
  type AdminThemeConfig,
} from "@/lib/admin-theme-engine";
import AdminThemeSwitcher from "@/components/admin/theme/AdminThemeSwitcher";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import AdminNotificationCenter from "@/components/admin/AdminNotificationCenter";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { buildAdminNav, findCurrentNavLabel } from "@/components/admin/admin-nav";
import AdminPwaInstallHint from "@/components/pwa/AdminPwaInstallHint";
import AdminProductTour from "@/components/admin/tour/AdminProductTour";
import DemoSeedBanner from "@/components/admin/DemoSeedBanner";
import PlatformReadinessHeaderBanner from "@/components/admin/PlatformReadinessHeaderBanner";

import { AdminThemeEngine } from "@/components/admin/theme/AdminThemeEngine";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, dir } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [newBookings, setNewBookings] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const stored = readStoredAdminTheme();
    setTheme(stored);
    applyAdminTheme(stored);
    setThemeReady(true);

    const handleThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<AdminThemeConfig>).detail;
      if (detail?.mode) {
        setTheme(detail.mode);
      }
    };
    window.addEventListener("lonaliza:admin-theme-change", handleThemeChange);

    const handleError = (e: ErrorEvent) => {
      const msg = String(e?.message || "");
      if (
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("Failed to load chunk")
      ) {
        try {
          const lastReload = Number(sessionStorage.getItem("last_chunk_reload") || 0);
          if (Date.now() - lastReload > 30000) {
            sessionStorage.setItem("last_chunk_reload", String(Date.now()));
            window.location.reload();
          }
        } catch {
          // ignore sessionStorage errors
        }
      }
    };
    window.addEventListener("error", handleError);

    return () => {
      clearAdminTheme();
      window.removeEventListener("lonaliza:admin-theme-change", handleThemeChange);
      window.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    applyAdminTheme(theme);
  }, [theme, themeReady]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      persistAdminTheme(next);
      applyAdminTheme(next);
      return next;
    });
  };

  const isLight = theme === "light";
  const shellBg = "bg-background";
  const textMuted = "text-muted-foreground";
  const headerBg = "bg-card/95 border-border";

  const sidebarTheme = {
    isLight,
    asideBg: "bg-sidebar border-sidebar-border",
    textMuted: "text-sidebar-muted",
    textMain: "text-sidebar-foreground",
    navIdle:
      "text-sidebar-muted hover:text-sidebar-foreground hover:bg-muted/70 dark:hover:bg-white/10",
    navActive:
      "bg-primary text-white border border-primary/40 dark:border-primary/40 font-bold shadow-xs",
    hairline: "border-sidebar-border",
  };

  const nav = useMemo(() => buildAdminNav(t.admin), [t.admin]);
  const currentLabel = findCurrentNavLabel(pathname, nav);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthChecked(true);
      return;
    }
    void (async () => {
      const ok = await checkAuthenticated();
      if (!ok) {
        router.replace("/admin/login");
        return;
      }
      setAuthChecked(true);
      try {
        const count = await fetchNewBookingsCount();
        setNewBookings(count);
      } catch {
        setNewBookings(getNewBookingsCount());
      }
    })();
  }, [pathname, router]);

  const handleLogout = () => {
    void logout().then(() => router.push("/admin/login"));
  };

  if (!authChecked && pathname !== "/admin/login") {
    return (
      <div className={`min-h-screen ${shellBg} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className='w-10 h-10 border-2 border-border/20 border-t-amber-500 rounded-full animate-spin' />
          <p className={`${textMuted} text-sm`}>{t.admin.loading}</p>
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login") return <>{children}</>;

  const isFullscreenEditor =
    pathname === "/admin/homepage-editor" ||
    pathname === "/admin/homepage" ||
    pathname === "/admin/editor" ||
    pathname === "/admin/visual-editor" ||
    pathname === "/admin/mobile-app-editor" ||
    pathname === "/admin/agent-studio" ||
    pathname === "/admin/neural-studio";

  if (isFullscreenEditor) {
    return (
      <div className={`h-screen w-screen overflow-hidden ${isLight ? 'bg-card' : 'bg-background'}`} dir={dir} data-admin-theme={theme}>
        <AdminThemeEngine currentMode={theme} />
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${shellBg} flex admin-shell`}
      dir={dir}
      data-admin-theme={theme}
    >
      <AdminThemeEngine currentMode={theme} />
      
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-foreground/5 backdrop-blur-sm z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        pathname={pathname}
        dir={dir}
        t={t}
        theme={sidebarTheme}
        newBookings={newBookings}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 w-full flex-1 flex-col">
        {!isFullscreenEditor && <AdminPwaInstallHint />}
        {!isFullscreenEditor && (
        <header
          className={`h-16 ${headerBg} backdrop-blur-xl border-b flex items-center px-4 lg:px-6 sticky top-0 z-30 gap-4`}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden ${textMuted} hover:opacity-80`}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm flex-1">
            <Link href="/admin" className={`${textMuted} hover:opacity-80 font-medium`}>
              {t.admin.panel}
            </Link>
            {pathname !== "/admin" && (
              <>
                <ChevronLeft size={14} className={textMuted} />
                <span className="text-foreground font-semibold">
                  {currentLabel || t.admin.page}
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("liotrip:start-tour"))}
            className='inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border/30 bg-secondary/10 text-secondary hover:bg-secondary/20 text-xs font-bold transition-colors'
            title="بدء الجولة التعريفية بالنظام"
          >
            <GraduationCap size={15} />
            <span className="hidden sm:inline">الجولة التعليمية</span>
          </button>
          <AdminThemeSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            aria-label={isLight ? t.admin.darkMode : t.admin.lightMode}
            aria-pressed={!isLight}
            title={isLight ? t.admin.darkMode : t.admin.lightMode}
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <LanguageSwitcher variant="admin" />
          <AdminNotificationCenter isLight={isLight} />
        </header>
        )}
        {!isFullscreenEditor && <PlatformReadinessHeaderBanner />}
        <main
          className={`admin-main min-w-0 w-full flex-1 ${
            isFullscreenEditor
              ? "h-screen overflow-hidden p-0"
              : `overflow-auto overflow-x-clip p-4 sm:p-5 lg:p-7 ${isLight ? "admin-main--light" : ""}`
          }`}
        >
          {!isFullscreenEditor && <DemoSeedBanner />}
          {children}
        </main>
      </div>
      <AdminProductTour />
    </div>
  );
}
