"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Globe, LogOut, Moon, Sun, User, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import {
  buildAdminNav,
  groupIdForPath,
  isNavActive,
  type NavGroup,
  type NavGroupId,
  type NavLeaf,
} from "@/components/admin/admin-nav";

const STORAGE_KEY = "alrayyan_admin_nav_groups";

export type AdminSidebarTheme = {
  isLight: boolean;
  asideBg: string;
  textMuted: string;
  textMain: string;
  navIdle: string;
  navActive: string;
  hairline: string;
};

type AdminSidebarProps = {
  pathname: string;
  dir: "rtl" | "ltr";
  t: Dictionary;
  theme: AdminSidebarTheme;
  newBookings: number;
  open: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
};

function readStoredOpen(): Partial<Record<NavGroupId, boolean>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Record<NavGroupId, boolean>>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistOpen(state: Record<NavGroupId, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emptyOpen(): Record<NavGroupId, boolean> {
  return {
    overview: false,
    bookings: false,
    customers: false,
    services: false,
    marketing: false,
    system: false,
    settings: false,
  };
}

export default function AdminSidebar({
  pathname,
  dir,
  t,
  theme,
  newBookings,
  open,
  onClose,
  onToggleTheme,
  onLogout,
}: AdminSidebarProps) {
  const nav = useMemo(() => buildAdminNav(t.admin), [t.admin]);
  const [expanded, setExpanded] = useState<Record<NavGroupId, boolean>>(() => ({
    ...emptyOpen(),
    overview: true,
  }));

  useEffect(() => {
    const stored = readStoredOpen();
    const active = groupIdForPath(pathname, nav);
    setExpanded((prev) => {
      const next = { ...emptyOpen(), ...prev, ...stored };
      if (active) next[active] = true;
      return next;
    });
  }, [pathname, nav]);

  const toggleGroup = (id: NavGroupId) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      persistOpen(next);
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "fixed lg:static inset-y-0 z-50 w-72 flex flex-col border transform transition-transform duration-300 ease-in-out",
        theme.asideBg,
        dir === "rtl" ? "right-0 border-l" : "left-0 border-r",
        open
          ? "translate-x-0"
          : dir === "rtl"
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center justify-between px-5 flex-shrink-0 border-b",
          theme.hairline
        )}
      >
        <Link href="/admin" className="flex items-center gap-3 min-w-0" onClick={onClose}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Alrayyan Tourism"
            className="size-8 object-contain rounded-lg"
          />
          <div className="min-w-0">
            <span className={cn(theme.textMain, "font-bold text-sm tracking-tight block truncate")}>
              Alrayyan Tourism
            </span>
            <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-[0.18em] uppercase">
              {t.admin.panel}
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className={cn("lg:hidden", theme.textMuted, "hover:opacity-80")}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <nav
        aria-label={t.admin.panel}
        className="flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-1.5"
      >
        {nav.map((group) => (
          <NavSection
            key={group.id}
            group={group}
            expanded={expanded[group.id]}
            onToggle={() => toggleGroup(group.id)}
            pathname={pathname}
            newBookings={newBookings}
            theme={theme}
            onNavigate={onClose}
          />
        ))}
      </nav>

      <div className={cn("flex-shrink-0 p-3 border-t flex flex-col gap-1", theme.hairline)}>
        <button
          type="button"
          onClick={onToggleTheme}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all",
            theme.navIdle
          )}
          title={theme.isLight ? t.admin.darkMode : t.admin.lightMode}
        >
          {theme.isLight ? <Moon size={15} /> : <Sun size={15} />}
          <span>{theme.isLight ? t.admin.darkMode : t.admin.lightMode}</span>
        </button>
        <Link
          href="/"
          target="_blank"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all",
            theme.navIdle
          )}
        >
          <Globe size={15} />
          <span>{t.admin.viewLiveSite}</span>
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-sidebar-border bg-secondary">
          <div className="size-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-xs font-semibold truncate">
              Admin
            </p>
            <p className={cn(theme.textMuted, "text-[10px] truncate")}>{t.admin.administrator}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title={t.admin.signOut}
            className={cn(theme.textMuted, "hover:text-red-400 transition-colors flex-shrink-0")}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  group,
  expanded,
  onToggle,
  pathname,
  newBookings,
  theme,
  onNavigate,
}: {
  group: NavGroup;
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
  newBookings: number;
  theme: AdminSidebarTheme;
  onNavigate: () => void;
}) {
  const hasActive = group.branches.some((branch) =>
    branch.items.some((item) => isNavActive(pathname, item))
  );

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-semibold tracking-wide transition-colors",
          hasActive
            ? "text-sidebar-foreground"
            : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-secondary"
        )}
      >
        <span
          className={cn(
            "size-7 rounded-lg flex items-center justify-center flex-shrink-0 border",
            hasActive
              ? "bg-sidebar-accent border-emerald-500/25 text-sidebar-accent-foreground"
              : "bg-secondary border-sidebar-border text-sidebar-muted"
          )}
        >
          <group.icon size={14} />
        </span>
        <span className="flex-1 text-start">{group.label}</span>
        <ChevronDown
          size={14}
          className={cn(
            "flex-shrink-0 transition-transform duration-300",
            theme.textMuted,
            expanded && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "ms-5 mt-1 mb-2 ps-3 flex flex-col gap-3 border-s border-sidebar-border"
            )}
          >
            {group.branches.map((branch) => (
              <div key={branch.id} className="flex flex-col gap-0.5">
                {branch.label ? (
                  <p
                    className={cn(
                      "px-2.5 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-muted"
                    )}
                  >
                    {branch.label}
                  </p>
                ) : null}
                {branch.items.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    pathname={pathname}
                    newBookings={newBookings}
                    theme={theme}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  newBookings,
  theme,
  onNavigate,
}: {
  item: NavLeaf;
  pathname: string;
  newBookings: number;
  theme: AdminSidebarTheme;
  onNavigate: () => void;
}) {
  const active = isNavActive(pathname, item);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all",
        active ? theme.navActive : theme.navIdle
      )}
    >
      {active ? (
        <span className="absolute inset-s-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-full -ms-3" />
      ) : null}
      <item.icon
        size={15}
        className={
          active
            ? "text-sidebar-accent-foreground"
            : "text-sidebar-muted"
        }
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge === "bookings" && newBookings > 0 ? (
        <span className="size-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
          {newBookings > 9 ? "9+" : newBookings}
        </span>
      ) : null}
    </Link>
  );
}
