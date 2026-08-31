"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, ChevronDown, UserRound, Ellipsis } from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { cn } from "@/lib/utils";
import LocaleCurrencySwitcher from "@/components/ui/LocaleCurrencySwitcher";
import ProfileMenu from "@/components/layout/ProfileMenu";
import UiIcon from "@/components/ui/UiIcon";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import BrandImage from "@/components/branding/BrandImage";
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
  const logoSrc = branding.logoUrl || "/logo.png";
  const { user, openAuth, logout } = useCustomerAuth();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const headerHex = branding.colors.header || "#0f172a";
  const onLight = hexLuminance(headerHex) > 0.45;
  const switcherVariant = onLight ? "header-light" : "header";

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

  const allNavLinks: NavLink[] = useMemo(
    () => [
      { key: "home", label: t.nav.home, href: "/" },
      {
        key: "holidays",
        label: t.nav.holidays,
        href: "/holidays",
        children: holidayChildren,
      },
      { key: "flights", label: t.nav.flights, href: "/flights" },
      { key: "hotels", label: t.nav.hotels, href: "/hotels" },
      {
        key: "vipDailyTours",
        label: t.nav.vipDailyTours,
        href: "/vip-tours",
      },
      { key: "transfers", label: t.nav.transfers, href: "/transfers" },
      { key: "cars", label: t.nav.cars, href: "/cars" },
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
      { key: "uaeTours", label: t.nav.uaeTours, href: "/vip-tours" },
      { key: "blog", label: t.nav.blog, href: "/blog" },
      { key: "aiChat", label: t.nav.aiChat, href: "/ai-chat" },
      { key: "contact", label: t.nav.contact, href: "/contact" },
    ],
    [t, holidayChildren]
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

  const ink = onLight ? "text-slate-900" : "text-white";
  const inkMuted = onLight ? "text-slate-600" : "text-white/80";
  const navHover = onLight
    ? "hover:bg-slate-900/5 hover:text-slate-950"
    : "hover:bg-white/10 hover:text-white";
  const navActive = onLight
    ? "bg-slate-900/5 text-slate-950"
    : "bg-white/10 text-white";
  const iconTone = onLight ? "text-[#0a1628] alrayyan-chrome-icon" : "alrayyan-chrome-icon";
  const hairline = onLight ? "border-slate-200" : "border-white/12";
  const dropBg = onLight
    ? "bg-white border-slate-200 shadow-xl"
    : "bg-[#0a1628] border-white/10 shadow-2xl shadow-black/40";
  const dropItem = onLight
    ? "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
    : "text-white/80 hover:bg-white/10 hover:text-white";
  const ghostBtn = onLight
    ? "text-slate-800 hover:bg-slate-900/5"
    : "text-white hover:bg-white/10";
  const ctaClass = onLight
    ? "bg-[#0a1628] text-white hover:bg-[#13233f]"
    : "bg-emerald-500 text-white hover:bg-emerald-400";

  const renderNavIcon = (key: NavLink["key"], size = 15) => (
    <UiIcon icon={getIcon(navIconKey(key))} size={size} className={iconTone} />
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
      className="alrayyan-site-header fixed top-0 inset-x-0 z-50 overflow-visible border-b shadow-[0_10px_28px_rgba(10,22,40,0.18)]"
      style={{
        backgroundColor: "var(--theme-header-glass, var(--brand-header))",
        borderColor: "var(--theme-border-color)",
        boxShadow: "var(--theme-shadow-md)",
      }}
    >
      <PwaInstallBanner />
      <div className="mx-auto max-w-[1600px] overflow-visible px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 overflow-visible py-2.5 lg:gap-4">
          <Link href="/" className="z-50 flex shrink-0 items-center gap-2">
            <BrandImage
              src={logoSrc}
              alt={brandName}
              width={140}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
            {branding.showWordmark ? (
              <span
                className={cn("text-sm font-bold leading-tight sm:text-base", ink)}
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
                  icon={<Ellipsis size={15} className={iconTone} />}
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

          <div className="hidden shrink-0 items-center justify-end gap-2 lg:flex xl:gap-2.5">
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

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className={cn(
              /* Agent D: mobile + search tabs */
              "z-50 col-start-3 flex min-h-11 min-w-11 items-center justify-center justify-self-end rounded-lg p-2 xl:hidden",
              ink
            )}
            aria-label={t.common.menu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
          >
            <Menu size={24} />
          </button>
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
              style={{ backgroundColor: "var(--theme-overlay)" }}
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
                ink,
                isMobileMenuOpen
                  ? "translate-x-0"
                  : "pointer-events-none -translate-x-full rtl:translate-x-full"
              )}
              style={{ backgroundColor: "var(--theme-header-glass, var(--brand-header))" }}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-3 border-b px-4 py-3",
                  hairline
                )}
              >
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex min-w-0 items-center gap-2"
                >
                  <BrandImage
                    src={logoSrc}
                    alt={brandName}
                    width={140}
                    height={48}
                    className="h-9 w-auto object-contain"
                  />
                  {branding.showWordmark ? (
                    <span
                      className="truncate text-sm font-bold leading-tight"
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
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                    ghostBtn
                  )}
                  aria-label={t.common.cancel}
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-2">
                {navLinks.map((link) => {
                  const active = linkIsActive(pathname, link.href);
                  return (
                    <div
                      key={link.href + link.label}
                      className={cn(
                        "border-b last:border-b-0",
                        onLight ? "border-slate-100" : "border-white/10"
                      )}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-base font-semibold",
                          ink,
                          onLight ? "hover:bg-slate-900/5" : "hover:bg-white/10",
                          active && navActive
                        )}
                      >
                        {renderNavIcon(link.key, 18)}
                        {link.label}
                      </Link>
                      {link.children ? (
                        <div
                          className={cn(
                            "mb-1 ms-3 border-s ps-2",
                            onLight ? "border-slate-200" : "border-white/10"
                          )}
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeMobileMenu}
                              className={cn(
                                "flex min-h-11 items-center rounded-xl px-3 text-sm font-medium",
                                onLight
                                  ? "text-slate-600 hover:bg-slate-900/5 hover:text-slate-950"
                                  : "text-white/75 hover:bg-white/10 hover:text-white"
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

              <div className={cn("border-t px-4 py-4", hairline)}>
                <LocaleCurrencySwitcher variant={switcherVariant} />
                {user ? (
                  <div className="mt-4 space-y-2">
                    <Link
                      href="/account"
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-center rounded-full text-sm font-bold",
                        ctaClass
                      )}
                    >
                      {t.auth.account}
                    </Link>
                    <Link
                      href="/account?tab=bookings"
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-center rounded-full border text-sm font-bold",
                        hairline,
                        ink
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
                        "flex min-h-11 w-full items-center justify-center rounded-full border text-sm font-bold",
                        hairline,
                        ink
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
                    className={cn(
                      "mt-4 flex min-h-11 w-full items-center justify-center rounded-full border text-sm font-bold",
                      hairline,
                      ink
                    )}
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
