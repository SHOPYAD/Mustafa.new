"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { checkAuthenticated, logout } from "@/data/auth";
import { fetchNewBookingsCount, getNewBookingsCount } from "@/data/bookings";
import {
  applyAdminTheme,
  clearAdminTheme,
  persistAdminTheme,
  readStoredAdminTheme,
} from "@/lib/admin-theme";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminCommandPalette, {
  useAdminCommandShortcut,
} from "@/components/admin/AdminCommandPalette";
import AdminPwaInstallHint from "@/components/pwa/AdminPwaInstallHint";
import AdminProductTour from "@/components/admin/tour/AdminProductTour";
import DemoSeedBanner from "@/components/admin/DemoSeedBanner";
import PlatformReadinessHeaderBanner from "@/components/admin/PlatformReadinessHeaderBanner";
import { buildAdminNav, findCurrentNavLabel } from "@/components/admin/admin-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const FULLSCREEN_EDITORS = new Set([
  "/admin/homepage-editor",
  "/admin/homepage",
  "/admin/editor",
  "/admin/visual-editor",
  "/admin/mobile-app-editor",
]);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, dir, locale } = useLocale();
  const adminDir = locale === "ar" ? "rtl" : dir;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [newBookings, setNewBookings] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const stored = readStoredAdminTheme();
    setTheme(stored);
    applyAdminTheme(stored);
    setThemeReady(true);

    const handleError = (e: ErrorEvent) => {
      const msg = String(e?.message || "");
      if (
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("Failed to load chunk")
      ) {
        window.location.reload();
      }
    };
    window.addEventListener("error", handleError);

    return () => {
      clearAdminTheme();
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
  const isFullscreenEditor = FULLSCREEN_EDITORS.has(pathname);
  const isLogin = pathname === "/admin/login";

  const sidebarTheme = {
    isLight,
    asideBg: "bg-sidebar border-sidebar-border",
    textMuted: "text-sidebar-muted",
    textMain: "text-sidebar-foreground",
    navIdle: "text-sidebar-muted hover:text-sidebar-foreground hover:bg-secondary",
    navActive:
      "bg-[color:var(--admin-purple-royal)] text-white border border-[color:var(--admin-purple-royal)] font-bold shadow-xs [&_svg]:text-white",
    hairline: "border-sidebar-border",
  };

  const nav = useMemo(() => buildAdminNav(t.admin), [t.admin]);
  const currentLabel = findCurrentNavLabel(pathname, nav);

  useEffect(() => {
    if (isLogin) {
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
  }, [isLogin, router]);

  const handleLogout = () => {
    void logout().then(() => router.push("/admin/login"));
  };

  const openCommand = useCallback(() => setCommandOpen(true), []);
  useAdminCommandShortcut(openCommand, !isLogin && !isFullscreenEditor);

  const scopeClass = cn(
    "admin-app-scope",
    theme === "dark" && "dark",
    isFullscreenEditor ? "h-screen w-screen overflow-hidden" : "min-h-dvh"
  );

  const wrap = (node: React.ReactNode) => (
    <div
      id="admin-root"
      className={scopeClass}
      dir={adminDir}
      data-admin-theme={theme}
      data-admin-ds="royal"
    >
      <TooltipProvider delayDuration={200}>{node}</TooltipProvider>
    </div>
  );

  if (!authChecked && !isLogin) {
    return wrap(
      <div className="flex min-h-dvh items-center justify-center bg-admin-bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-2 border-admin-accent/20 border-t-admin-accent" />
          <p className="text-sm text-admin-text-muted">{t.admin.loading}</p>
        </div>
      </div>
    );
  }

  if (isLogin) return wrap(children);

  if (isFullscreenEditor) {
    return wrap(children);
  }

  return wrap(
    <div className="admin-shell flex min-h-dvh w-full max-w-full overflow-x-clip bg-admin-bg-canvas text-admin-text-primary">
      <div className="hidden lg:flex">
        <AdminSidebar
          pathname={pathname}
          dir={adminDir}
          t={t}
          theme={sidebarTheme}
          newBookings={newBookings}
          open
          onClose={() => undefined}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side={dir === "rtl" ? "right" : "left"}
          showCloseButton={false}
          className="w-72 max-w-[85vw] p-0 bg-sidebar text-sidebar-foreground sm:max-w-72"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t.admin.panel}</SheetTitle>
            <SheetDescription>{t.common.menu}</SheetDescription>
          </SheetHeader>
          <AdminSidebar
            pathname={pathname}
            dir={adminDir}
            t={t}
            theme={sidebarTheme}
            newBookings={newBookings}
            open
            embedded
            onClose={() => setSidebarOpen(false)}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 w-full flex-1 flex-col">
        <AdminPwaInstallHint />
        <AdminTopbar
          dir={adminDir}
          t={t}
          isLight={isLight}
          pathname={pathname}
          currentLabel={currentLabel}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleTheme={toggleTheme}
          onStartTour={() => window.dispatchEvent(new Event("liotrip:start-tour"))}
          onOpenCommand={openCommand}
        />
        <PlatformReadinessHeaderBanner />
        <main className="admin-main admin-page min-w-0 w-full flex-1 overflow-auto overflow-x-clip p-4 sm:p-5 lg:p-7">
          <DemoSeedBanner />
          {children}
        </main>
      </div>
      <AdminCommandPalette t={t} open={commandOpen} onOpenChange={setCommandOpen} />
      <AdminProductTour />
    </div>
  );
}
