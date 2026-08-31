"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Menu, Moon, Sun } from "lucide-react";
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const stored = readStoredAdminTheme();
    setTheme(stored);
    applyAdminTheme(stored);
    setThemeReady(true);
    return () => {
      clearAdminTheme();
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
      "text-sidebar-muted hover:text-sidebar-foreground hover:bg-secondary",
    navActive:
      "bg-sidebar-accent text-sidebar-accent-foreground border border-emerald-500/25",
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
          <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
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
    pathname === "/admin/visual-editor";

  if (isFullscreenEditor) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-white" dir={dir} data-admin-theme={theme}>
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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
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
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl border border-border bg-secondary text-foreground hover:bg-muted flex items-center justify-center transition-colors"
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
        <main
          className={`admin-main min-w-0 w-full flex-1 ${
            isFullscreenEditor
              ? "h-screen overflow-hidden p-0"
              : `overflow-auto overflow-x-clip p-4 sm:p-5 lg:p-7 ${isLight ? "admin-main--light" : ""}`
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
