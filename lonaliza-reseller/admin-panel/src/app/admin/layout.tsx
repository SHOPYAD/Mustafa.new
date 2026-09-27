"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, GraduationCap, Menu, Moon, Sun } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { checkAuthenticated, logout } from "@/data/auth";
import { fetchNewBookingsCount, getNewBookingsCount } from "@/data/bookings";
import {
  applyAdminTheme,
  clearAdminTheme,
  persistAdminTheme,
  readStoredAdminTheme,
} from "@/lib/admin-theme";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import AdminNotificationCenter from "@/components/admin/AdminNotificationCenter";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { buildAdminNav, findCurrentNavLabel } from "@/components/admin/admin-nav";
import AdminPwaInstallHint from "@/components/pwa/AdminPwaInstallHint";
import AdminProductTour from "@/components/admin/tour/AdminProductTour";
import DemoSeedBanner from "@/components/admin/DemoSeedBanner";
import PlatformReadinessHeaderBanner from "@/components/admin/PlatformReadinessHeaderBanner";
import { PreferencesStoreProvider, usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { LayoutControls } from "@/components/admin/modern-sidebar/layout-controls";
import { cn } from "@/lib/utils";

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, dir, locale } = useLocale();
  const isRtl = locale === "ar" || dir === "rtl";
  const adminDir = isRtl ? "rtl" : "ltr";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [newBookings, setNewBookings] = useState(0);

  const { values, setPreference } = usePreferencesStore(
    useShallow((state) => ({
      values: state.values,
      setPreference: state.setPreference,
    })),
  );

  // Compute effective theme (light / dark) resolving "system" if selected
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const effectiveTheme: "dark" | "light" = useMemo(() => {
    if (values.theme_mode === "dark") return "dark";
    if (values.theme_mode === "light") return "light";
    return systemDark ? "dark" : "light";
  }, [values.theme_mode, systemDark]);

  const isLight = effectiveTheme === "light";

  // Sync preference attributes to documentElement and admin-root synchronously
  useEffect(() => {
    const doc = document.documentElement;
    doc.setAttribute("data-admin-route", "true");
    doc.setAttribute("data-theme-preset", values.theme_preset);
    doc.setAttribute("data-font", values.font);
    doc.setAttribute("data-content-layout", values.content_layout);
    doc.setAttribute("data-navbar-style", values.navbar_style);
    doc.setAttribute("data-sidebar-variant", values.sidebar_variant);
    doc.setAttribute("data-sidebar-collapsible", values.sidebar_collapsible);
    doc.dataset.adminColorScheme = effectiveTheme;
    doc.dataset.adminTheme = effectiveTheme;
    doc.classList.toggle("dark", effectiveTheme === "dark");
    doc.style.colorScheme = effectiveTheme;

    applyAdminTheme(effectiveTheme);
    persistAdminTheme(effectiveTheme);
  }, [values, effectiveTheme]);

  useEffect(() => {
    const stored = readStoredAdminTheme();
    if (stored && stored !== values.theme_mode && values.theme_mode !== "system") {
      setPreference("theme_mode", stored);
    }
  }, []);

  const toggleTheme = () => {
    const next = effectiveTheme === "dark" ? "light" : "dark";
    setPreference("theme_mode", next);
    persistAdminTheme(next);
    applyAdminTheme(next);
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

  const sidebarTheme = {
    isLight,
    asideBg: isLight ? "bg-white border-border text-foreground" : "bg-sidebar border-sidebar-border/40 text-sidebar-foreground",
    textMuted: isLight ? "text-slate-500" : "text-sidebar-muted",
    textMain: isLight ? "text-slate-900" : "text-sidebar-foreground",
    navIdle: isLight ? "text-slate-600 hover:text-violet-700 hover:bg-violet-50" : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
    navActive: isLight ? "bg-violet-600/10 text-violet-700 font-bold shadow-xs border border-violet-500/25" : "bg-primary/10 text-primary font-bold shadow-xs border border-primary/25",
    hairline: isLight ? "border-border" : "border-border/30",
  };

  if (!authChecked && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">{t.admin.loading}</p>
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
    pathname === "/admin/mobile-app-editor";

  if (isFullscreenEditor) {
    return (
      <div
        id="admin-root"
        className={cn(
          "h-screen w-screen overflow-hidden admin-shell admin-app-scope",
          isLight ? "bg-white text-slate-900" : "bg-background text-foreground"
        )}
        dir={adminDir}
        data-admin-theme={effectiveTheme}
        data-admin-color-scheme={effectiveTheme}
        data-theme-preset={values.theme_preset}
        data-font={values.font}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      id="admin-root"
      className={cn(
        "min-h-screen flex admin-shell admin-app-scope transition-colors duration-200",
        isLight ? "bg-white text-slate-900" : "bg-background text-foreground dark"
      )}
      dir={adminDir}
      data-admin-theme={effectiveTheme}
      data-admin-color-scheme={effectiveTheme}
      data-theme-preset={values.theme_preset}
      data-font={values.font}
      data-content-layout={values.content_layout}
      data-navbar-style={values.navbar_style}
      data-sidebar-variant={values.sidebar_variant}
      data-sidebar-collapsible={values.sidebar_collapsible}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        pathname={pathname}
        dir={adminDir}
        t={t}
        theme={sidebarTheme}
        newBookings={newBookings}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        variant={values.sidebar_variant}
      />

      <div className="flex min-w-0 w-full flex-1 flex-col">
        {!isFullscreenEditor && <AdminPwaInstallHint />}
        {!isFullscreenEditor && (
          <header
            className={cn(
              "h-16 admin-topbar-header border-b backdrop-blur-xl flex items-center px-4 lg:px-6 z-30 gap-3 sm:gap-4 transition-all",
              isLight ? "bg-white/95 border-slate-200" : "bg-card/95 border-border",
              values.navbar_style === "sticky" ? "sticky top-0" : "relative"
            )}
          >
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:opacity-80 p-1.5 rounded-lg hover:bg-secondary"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
              <Link href="/admin" className="text-muted-foreground hover:opacity-80 font-medium shrink-0">
                {t.admin.panel}
              </Link>
              {pathname !== "/admin" && (
                <>
                  {isRtl ? (
                    <ChevronLeft size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={14} className="text-muted-foreground" />
                  )}
                  <span className="text-foreground font-semibold truncate">
                    {currentLabel || t.admin.page}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("liotrip:start-tour"))}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-bold transition-colors"
                title="بدء الجولة التعريفية بالنظام"
              >
                <GraduationCap size={15} />
                <span className="hidden sm:inline">الجولة التعليمية</span>
              </button>

              {/* Theme & Fonts Preferences Popover */}
              <LayoutControls />

              <button
                type="button"
                onClick={toggleTheme}
                className="h-9 px-3 rounded-xl border border-border bg-card text-foreground hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:border-violet-700 flex items-center gap-2 transition-all text-xs font-bold shadow-xs cursor-pointer"
                aria-label={isLight ? "التبديل إلى الوضع الليلي (Dark Mode)" : "التبديل إلى الوضع النهاري (Light Mode)"}
                aria-pressed={!isLight}
                title={isLight ? "التبديل إلى الوضع الليلي (Dark Mode)" : "التبديل إلى الوضع النهاري (Light Mode)"}
              >
                {isLight ? (
                  <>
                    <Moon size={15} className="text-violet-600" />
                    <span className="hidden sm:inline">الوضع الليلي</span>
                  </>
                ) : (
                  <>
                    <Sun size={15} className="text-amber-400" />
                    <span className="hidden sm:inline">الوضع النهاري</span>
                  </>
                )}
              </button>

              <LanguageSwitcher variant="admin" />
              <AdminNotificationCenter isLight={isLight} />
            </div>
          </header>
        )}

        {!isFullscreenEditor && <PlatformReadinessHeaderBanner />}

        <main
          className={cn(
            "admin-main min-w-0 w-full flex-1",
            isFullscreenEditor
              ? "h-screen overflow-hidden p-0"
              : `overflow-auto overflow-x-clip p-4 sm:p-5 lg:p-7 ${isLight ? "admin-main--light bg-white" : "bg-background"}`
          )}
        >
          {!isFullscreenEditor && <DemoSeedBanner />}
          <div
            className={cn(
              "w-full transition-all duration-200",
              values.content_layout === "centered"
                ? "admin-content-container max-w-7xl mx-auto"
                : "w-full max-w-none"
            )}
          >
            {children}
          </div>
        </main>
      </div>

      <AdminProductTour />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PreferencesStoreProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </PreferencesStoreProvider>
  );
}
