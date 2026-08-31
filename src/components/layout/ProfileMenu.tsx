"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import type { CustomerSession } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type MenuVariant = "header" | "header-light";

function initialsFrom(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] || ""}${parts[1]![0] || ""}`.toUpperCase();
  }
  if (parts[0] && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  if (parts[0]) return `${parts[0][0] || ""}${email[0] || ""}`.toUpperCase();
  return (email.slice(0, 2) || "?").toUpperCase();
}

export default function ProfileMenu({
  user,
  variant,
  onLogout,
}: {
  user: CustomerSession;
  variant: MenuVariant;
  onLogout: () => void;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const initials = initialsFrom(user.name, user.email);
  const onLight = variant === "header-light";

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        if (!cancelled) setIsAdmin(Boolean(data?.authenticated));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const triggerClass = onLight
    ? "bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border-slate-200"
    : "bg-white/10 hover:bg-white/20 text-white border-white/20";

  const close = () => setOpen(false);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border",
          triggerClass
        )}
        aria-label={t.auth.account}
        aria-expanded={open}
      >
        <span className="text-[11px] font-bold tracking-wide">{initials}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <div className="fixed inset-0 z-[60]" onClick={close} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute end-0 top-full z-[70] mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-bold text-slate-900">
                  {user.name || t.auth.account}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>

              <div className="p-2">
                <Link href="/account" onClick={close} className={itemClass}>
                  <UserRound size={16} />
                  {t.auth.account}
                </Link>
                <Link
                  href="/account?tab=bookings"
                  onClick={close}
                  className={itemClass}
                >
                  <CalendarDays size={16} />
                  {t.account.navBookings}
                </Link>
                <Link
                  href="/account?tab=programs"
                  onClick={close}
                  className={itemClass}
                >
                  <Bookmark size={16} />
                  {t.account.navPrograms}
                </Link>

                {isAdmin ? (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <Link href="/admin" onClick={close} className={itemClass}>
                      <LayoutDashboard size={16} />
                      {t.admin.dashboard}
                    </Link>
                    <Link
                      href="/admin/bookings"
                      onClick={close}
                      className={itemClass}
                    >
                      <CalendarDays size={16} />
                      {t.admin.bookings}
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={close}
                      className={itemClass}
                    >
                      <Settings size={16} />
                      {t.admin.settings}
                    </Link>
                  </>
                ) : null}
              </div>

              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} />
                  {t.auth.logout}
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
