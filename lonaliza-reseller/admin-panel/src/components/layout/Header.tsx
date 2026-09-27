"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, ChevronDown, UserRound, Ellipsis } from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { cn } from "@/lib/utils";
import { useBrandTheme } from "@/components/theme/ThemeProvider";
import { applyBrandTheme } from "@/lib/theme/tokens";
import LocaleCurrencySwitcher from "@/components/ui/LocaleCurrencySwitcher";
import ProfileMenu from "@/components/layout/ProfileMenu";
import UiIcon from "@/components/ui/UiIcon";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import BrandImage from "@/components/branding/BrandImage";
import LonalizaLogo from "@/components/ui/LonalizaLogo";
import { useBrandName, useBranding } from "@/components/branding/BrandingProvider";
import {
  HEADER_MAX_PRIMARY,
  showsInHeader,
  sortByNavOrder,
  type NavServiceKey,
} from "@/data/nav-visibility";
import { holidayNavChildren, type HolidayNavChild } from "@/data/holiday-nav";
import { fetchPublishedPackages } from "@/data/packages-client";
import type { HolidayPackage } from "@/types/package";
import { useNavVisibility } from "@/hooks/useNavVisibility";
import { useNavOrder } from "@/hooks/useNavOrder";
import { usePublicPages } from "@/hooks/usePublicPages";
import { useUiIcons } from "@/hooks/useUiIcons";
import { navIconKey } from "@/lib/ui-icons-store";
import PwaInstallBanner from "@/components/pwa/PwaInstallBanner";

type NavChild = { label: string; href: string };
type NavLink = {
  key: NavServiceKey | `custom:${string}`;
  label: string;
  href: string;
  children?: NavChild[];
};

function isTransfersHref(href: string): boolean {
  const path = href.split("?")[0];
  return path === "/transfers";
}

function hexLuminance(hex: string): number {
  const raw = hex.trim().replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 0.08;
  const channel = (part: string) => {
    const n = parseInt(part, 16) / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(full.slice(0, 2)) +
    0.7152 * channel(full.slice(2, 4)) +
    0.0722 * channel(full.slice(4, 6))
  );
}

function linkIsActive(pathname: string | null, href: string): boolean {
  const path = href.split("?")[0];
  if (!pathname) return false;
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavFlyout({
  label,
  href,
  icon,
  items,
  active,
  inkMuted,
  navHover,
  navActive,
  dropBg,
  dropItem,
}: {
  label: string;
  href?: string;
  icon: ReactNode;
  items: NavChild[];
  active: boolean;
  inkMuted: string;
  navHover: string;
  navActive: string;
  dropBg: string;
  dropItem: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const triggerClass = cn(
    "alrayyan-header-nav-link flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors 2xl:px-3 2xl:text-sm",
    inkMuted,
    navHover,
    active && navActive
  );

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {href ? (
        <Link href={href} className={triggerClass} onClick={() => setOpen(false)}>
          {icon}
          <span>{label}</span>
          <ChevronDown
            size={12}
            className={cn("shrink-0 opacity-55 transition-transform", open && "rotate-180")}
          />
        </Link>
      ) : (
        <button
          type="button"
          className={triggerClass}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {icon}
          <span>{label}</span>
          <ChevronDown
            size={12}
            className={cn("shrink-0 opacity-55 transition-transform", open && "rotate-180")}
          />
        </button>
      )}
      {open ? (
        <div className="absolute start-0 top-full z-[80] pt-2">
          <div className={cn("min-w-[220px] rounded-2xl border p-2", dropBg)}>
            {items.map((child) => (
              <Link
                key={child.href + child.label}
                href={child.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  dropItem
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [holidayPkgs, setHolidayPkgs] = useState<HolidayPackage[] | null>(null);
  const visibility = useNavVisibility();
  const navOrder = useNavOrder();
  const { t, locale } = useLocale();
  const { headerPages } = usePublicPages();
  const { getIcon } = useUiIcons();
  const branding = useBranding();
  const brandName = useBrandName(locale);
  const logoSrc = branding.logoUrl || "/logo.svg?v=5";
  const { user, openAuth, logout } = useCustomerAuth();

  const isOrigin = (process.env.NEXT_PUBLIC_DEPLOYMENT_ROLE || "origin") !== "client";
  if (isOrigin && pathname === "/") {
    return null;
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const brandTheme = useBrandTheme();
  const siteTheme: string = "light";

  useEffect(() => {
    try {
      document.documentElement.classList.remove("dark");
      document.documentElement.dataset.siteTheme = "light";
      localStorage.removeItem("lonaliza_site_theme");
      if (brandTheme) {
        applyBrandTheme(brandTheme, document.documentElement);
      }
    } catch {}
  }, [brandTheme]);

  const headerHex = "#ffffff";
  const onLight = true;
  const switcherVariant = "header-light";

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedPackages().then((pkgs) => {
      if (!cancelled) setHolidayPkgs(pkgs);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const holidayChildren: HolidayNavChild[] = useMemo(
    () => holidayNavChildren(holidayPkgs, locale),
    [holidayPkgs, locale]
  );

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (key: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenSubMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const homeHref = pathname?.startsWith("/demo") ? "/demo" : "/";

  const allNavLinks: NavLink[] = useMemo(
    () => [
      { key: "home", label: t.nav.home, href: homeHref },
      { key: "flights", label: t.nav.flights, href: "/flights" },
      { key: "hotels", label: t.nav.hotels, href: "/hotels" },
      { key: "cars", label: t.nav.cars, href: "/cars" },
      { key: "transfers", label: t.nav.transfers, href: "/transfers" },
      {
        key: "holidays",
        label: t.nav.holidays,
        href: "/holidays",
        children: holidayChildren,
      },
      {
        key: "vipDailyTours",
        label: t.nav.vipDailyTours,
        href: "/vip-tours",
      },
      {
        key: "visa",
        label: t.nav.visa,
        href: "/visa",
        children: [
          { label: t.nav.schengenVisa, href: "/visa?type=schengen" },
          { label: t.nav.ukVisa, href: "/visa?type=uk" },
          { label: t.nav.usaVisa, href: "/visa?type=usa" },
          { label: t.nav.uaeVisa, href: "/visa?type=uae" },
          { label: t.nav.visaChange, href: "/visa?type=change" },
        ],
      },
      {
        key: "community",
        label: t.nav.community,
        href: "/community",
        children: [
          { label: "تجارب ومنشورات المسافرين", href: "/community" },
          { label: "ريلز السفر (Reels)", href: "/community/reels" },
          { label: "لوحة المتصدرين ونقاط المكافآت", href: "/community/leaderboard" },
        ],
      },
      { key: "aiChat", label: t.nav.aiChat, href: "/ai-chat" },
      { key: "contact", label: t.nav.contact, href: "/contact" },
      { key: "uaeTours", label: t.nav.uaeTours, href: "/vip-tours" },
      { key: "blog", label: t.nav.blog, href: "/blog" },
    ],
    [t, holidayChildren, homeHref]
  );

  const navLinks = useMemo(() => {
    const orderedBase = sortByNavOrder(allNavLinks, (link) =>
      link.key.startsWith("custom:") ? null : (link.key as NavServiceKey)
    );
    const base = orderedBase.filter((link) => {
      if (link.key.startsWith("custom:")) return true;
      return showsInHeader(visibility[link.key as NavServiceKey]);
    });
    const extras: NavLink[] = headerPages
      .filter((page) => !isTransfersHref(page.href))
      .map((page) => ({
        key: `custom:${page.slug}`,
        label: locale === "ar" ? page.titleAr : page.titleEn,
        href: page.href,
      }));
    const merged = [...base, ...extras];
    let seenTransfers = false;
    let seenVipTours = false;
    return merged.filter((link) => {
      const path = link.href.split("?")[0];
      if (path === "/vip-tours") {
        if (seenVipTours) return false;
        seenVipTours = true;
        return true;
      }
      if (!isTransfersHref(link.href)) return true;
      if (seenTransfers) return false;
      seenTransfers = true;
      return true;
    });
  }, [allNavLinks, visibility, headerPages, locale, navOrder]);

  const { primaryLinks, moreLinks } = useMemo(() => {
    const primary: NavLink[] = [];
    const more: NavLink[] = [];
    for (const link of navLinks) {
      if (primary.length < HEADER_MAX_PRIMARY) primary.push(link);
      else more.push(link);
    }
    if (more.length === 1 && primary.length < HEADER_MAX_PRIMARY) {
      primary.push(more[0]!);
      return { primaryLinks: primary, moreLinks: [] as NavLink[] };
    }
    return { primaryLinks: primary, moreLinks: more };
  }, [navLinks]);

  useEffect(() => {
    setIsPortalReady(true);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/flights/redirect")) return null;

  const ink = "text-slate-900";
  const inkMuted = "text-slate-900 font-semibold";
  const navHover = "hover:bg-purple-50 hover:text-purple-950";
  const navActive = "bg-purple-100/90 text-purple-950 font-bold shadow-2xs";
  const iconTone = "text-[#1e1b4b] dark:text-[#1e1b4b] font-bold";
  const hairline = "border-slate-200";
  const dropBg = "bg-white border-slate-200 shadow-xl";
  const dropItem = "text-slate-900 hover:bg-purple-50 hover:text-purple-950 font-semibold";
  const ghostBtn = "text-slate-900 hover:bg-slate-100 font-semibold";
  const ctaClass = "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white hover:brightness-110 font-bold shadow-sm";

  const renderNavIcon = (key: NavLink["key"], size = 18) => (
    <UiIcon icon={getIcon(navIconKey(key))} size={size} strokeWidth={2.2} className={iconTone} />
  );

  const renderDesktopLink = (link: NavLink) => {
    const active = linkIsActive(pathname, link.href);
    if (link.children?.length) {
      return (
        <NavFlyout
          key={link.href + link.label}
          label={link.label}
          href={link.href}
          icon={renderNavIcon(link.key)}
          items={link.children}
          active={active}
          inkMuted={inkMuted}
          navHover={navHover}
          navActive={navActive}
          dropBg={dropBg}
          dropItem={dropItem}
        />
      );
    }
    return (
      <Link
        key={link.href + link.label}
        href={link.href}
        className={cn(
          "alrayyan-header-nav-link flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors 2xl:px-3 2xl:text-sm",
          inkMuted,
          navHover,
          active && navActive
        )}
      >
        {renderNavIcon(link.key)}
        <span>{link.label}</span>
      </Link>
    );
  };

  return (
    <header
      className="alrayyan-site-header fixed top-0 inset-x-0 z-50 overflow-visible border-b border-slate-200/90 bg-white shadow-xs"
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <PwaInstallBanner />
      <div className="mx-auto max-w-[1600px] overflow-visible px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 overflow-visible py-2 lg:gap-4">
          <Link href={homeHref} className="z-50 flex shrink-0 items-center gap-2">
            <LonalizaLogo variant="header" />
            {branding.showWordmark ? (
              <span
                className={cn("text-sm font-bold leading-tight sm:text-base text-slate-900")}
                style={{ fontFamily: "var(--font-sora)" }}
              >
                {brandName}
              </span>
            ) : null}
          </Link>

          <nav className="hidden min-w-0 items-center justify-center overflow-visible xl:flex">
            <div className="flex max-w-full items-center justify-center gap-0.5 overflow-visible">
              {primaryLinks.map(renderDesktopLink)}
              {moreLinks.length ? (
                <NavFlyout
                  label={t.nav.more}
                  icon={<Ellipsis size={18} strokeWidth={2.2} className={iconTone} />}
                  items={moreLinks.map((link) => ({
                    label: link.label,
                    href: link.href,
                  }))}
                  active={moreLinks.some((link) =>
                    linkIsActive(pathname, link.href)
                  )}
                  inkMuted={inkMuted}
                  navHover={navHover}
                  navActive={navActive}
                  dropBg={dropBg}
                  dropItem={dropItem}
                />
              ) : null}
            </div>
          </nav>

          <div className="z-50 flex shrink-0 items-center justify-end gap-2 sm:gap-2.5 justify-self-end">
            <div className="hidden lg:flex items-center gap-2 xl:gap-2.5">
              <LocaleCurrencySwitcher variant={switcherVariant} />
              {user ? (
                <ProfileMenu
                  user={user}
                  variant={switcherVariant}
                  onLogout={() => void logout()}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold",
                    ghostBtn
                  )}
                >
                  <UserRound size={15} />
                  {t.auth.login}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 xl:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className={cn(
                  "flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2",
                  ink
                )}
                aria-label={t.common.menu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-drawer"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPortalReady &&
        createPortal(
          <div className="xl:hidden">
            <div
              className={cn(
                "fixed inset-0 z-[200] transition-opacity duration-300",
                isMobileMenuOpen
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              )}
              style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              onClick={closeMobileMenu}
              aria-hidden
            />
            <div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={t.common.menu}
              className={cn(
                "fixed inset-y-0 start-0 z-[210] flex h-[100dvh] w-[min(100%,22rem)] flex-col shadow-2xl transition-transform duration-300 ease-out",
                siteTheme === "dark"
                  ? "bg-[#0a1628] text-white border-e border-white/10"
                  : "bg-white text-slate-900 border-e border-slate-200",
                isMobileMenuOpen
                  ? "translate-x-0"
                  : "pointer-events-none -translate-x-full rtl:translate-x-full"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-3 border-b px-4 py-3.5",
                  siteTheme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-slate-100 bg-slate-50/80"
                )}
              >
                <Link
                  href={homeHref}
                  onClick={closeMobileMenu}
                  className="flex min-w-0 items-center gap-2"
                >
                  <LonalizaLogo variant="header" />
                  {branding.showWordmark ? (
                    <span
                      className="truncate text-sm font-bold leading-tight text-slate-900"
                      style={{ fontFamily: "var(--font-sora)" }}
                    >
                      {brandName}
                    </span>
                  ) : null}
                </Link>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer",
                    siteTheme === "dark"
                      ? "text-white/60 hover:text-white hover:bg-white/10"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/80"
                  )}
                  aria-label={t.common.cancel}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-2.5 space-y-1">
                {navLinks.map((link) => {
                  const active = linkIsActive(pathname, link.href);
                  const hasChildren = Boolean(link.children && link.children.length > 0);
                  const isOpen = Boolean(openSubMenus[link.key]);

                  return (
                    <div
                      key={link.href + link.label}
                      className={cn(
                        "border-b last:border-b-0",
                        siteTheme === "dark" ? "border-white/10" : "border-slate-100"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={link.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            "flex flex-1 min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-bold transition-colors",
                            siteTheme === "dark"
                              ? active
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "text-white/85 hover:bg-white/10 hover:text-white"
                              : active
                              ? "bg-amber-500/15 text-amber-900 border border-amber-500/30"
                              : "text-slate-800 hover:bg-slate-100 hover:text-slate-950"
                          )}
                        >
                          {renderNavIcon(link.key, 18)}
                          <span>{link.label}</span>
                        </Link>

                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={(e) => toggleSubMenu(link.key, e)}
                            className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-xl transition-colors cursor-pointer shrink-0",
                              siteTheme === "dark"
                                ? "text-white/60 hover:bg-white/10 hover:text-white"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            )}
                            aria-label={`تبديل قائمة ${link.label}`}
                            aria-expanded={isOpen}
                          >
                            <ChevronDown
                              size={18}
                              className={cn(
                                "transition-transform duration-200",
                                isOpen && "rotate-180"
                              )}
                            />
                          </button>
                        ) : null}
                      </div>

                      {hasChildren && isOpen ? (
                        <div
                          className={cn(
                            "mb-2 ms-4 border-s-2 border-amber-400/80 ps-2.5 py-1 space-y-1 transition-all duration-200 rounded-e-xl",
                            siteTheme === "dark"
                              ? "bg-white/[0.04] text-white/80"
                              : "bg-slate-50/90 text-slate-700"
                          )}
                        >
                          {link.children!.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeMobileMenu}
                              className={cn(
                                "flex min-h-10 items-center rounded-lg px-3 text-xs font-semibold transition-colors",
                                siteTheme === "dark"
                                  ? "text-white/75 hover:bg-white/10 hover:text-white"
                                  : "text-slate-700 hover:bg-white hover:text-slate-950"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </nav>

              <div
                className={cn(
                  "border-t px-4 py-4 space-y-3",
                  siteTheme === "dark"
                    ? "border-white/10 bg-white/[0.02]"
                    : "border-slate-200 bg-slate-50/80"
                )}
              >
                <Link
                  href="/menu"
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border px-3 text-sm font-bold transition-all",
                    siteTheme === "dark"
                      ? "border-white/15 text-white hover:bg-white/10"
                      : "bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-2xs"
                  )}
                >
                  <span>
                    {t.common.language} · {t.common.currency}
                  </span>
                  <span className="text-xs font-black text-purple-800">{t.nav.more}</span>
                </Link>

                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/account"
                      onClick={closeMobileMenu}
                      className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-sm font-bold shadow-md shadow-purple-500/20 transition-all"
                    >
                      {t.auth.account}
                    </Link>
                    <Link
                      href="/account?tab=bookings"
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-center rounded-2xl border text-sm font-bold transition-all",
                        siteTheme === "dark"
                          ? "border-white/15 text-white hover:bg-white/10"
                          : "bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-2xs"
                      )}
                    >
                      {t.account.navBookings}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        void logout();
                      }}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-center rounded-2xl border text-sm font-bold transition-all cursor-pointer",
                        siteTheme === "dark"
                          ? "border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                          : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      )}
                    >
                      {t.auth.logout}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      openAuth("login");
                    }}
                    className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-sm font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                  >
                    {t.auth.login}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
