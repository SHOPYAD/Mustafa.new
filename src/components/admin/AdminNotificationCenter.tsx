"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CalendarCheck, Eye, UserPlus } from "lucide-react";
import {
  enableAdminBrowserAlerts,
  getNotifyPermission,
  ingestAdminNotifications,
} from "@/lib/admin-notifications/client";
import {
  isAdminNotificationType,
  type AdminNotificationRecord,
  type AdminNotificationType,
} from "@/lib/admin-notifications/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const POLL_MS = 13000;

function typeIcon(type: AdminNotificationType) {
  switch (type) {
    case "visit":
      return Eye;
    case "register":
      return UserPlus;
    case "booking":
      return CalendarCheck;
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

function formatWhen(iso: string, locale: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return locale === "ar" ? "الآن" : locale === "tr" ? "şimdi" : "now";
  if (diff < 3_600_000) {
    const m = Math.max(1, Math.round(diff / 60_000));
    if (locale === "ar") return `قبل ${m} د`;
    if (locale === "tr") return `${m} dk`;
    return `${m}m`;
  }
  if (diff < 86_400_000) {
    const h = Math.max(1, Math.round(diff / 3_600_000));
    if (locale === "ar") return `قبل ${h} س`;
    if (locale === "tr") return `${h} sa`;
    return `${h}h`;
  }
  try {
    return new Date(ts).toLocaleDateString(
      locale === "ar" ? "ar" : locale === "tr" ? "tr" : "en",
      { month: "short", day: "numeric" }
    );
  } catch {
    return "";
  }
}

export default function AdminNotificationCenter({
  isLight: _isLight,
}: {
  isLight: boolean;
}) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotificationRecord[]>([]);
  const [unread, setUnread] = useState(0);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const panelRef = useRef<HTMLDivElement | null>(null);

  const applyPayload = useCallback(
    (data: { items?: AdminNotificationRecord[]; unread?: number }) => {
      const next = (data.items || []).filter((row) =>
        isAdminNotificationType(String(row.type || ""))
      );
      setItems(next);
      setUnread(Number(data.unread || 0));
      ingestAdminNotifications(next);
    },
    []
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        items?: AdminNotificationRecord[];
        unread?: number;
      };
      if (!res.ok || !data.ok) return;
      applyPayload(data);
    } catch {
      /* ignore */
    }
  }, [applyPayload]);

  useEffect(() => {
    setPerm(getNotifyPermission());
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const markRead = async (opts: { all?: boolean; ids?: string[] }) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        items?: AdminNotificationRecord[];
        unread?: number;
      };
      if (!res.ok || !data.ok) return;
      setItems(data.items || []);
      setUnread(Number(data.unread || 0));
    } catch {
      /* ignore */
    }
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      void markRead({ all: true });
    }
  };

  const enableBrowserAlerts = async () => {
    const next = await enableAdminBrowserAlerts();
    setPerm(next);
  };

  const btnClass =
    "bg-secondary hover:bg-muted border-border text-foreground";
  const panelClass = "bg-popover border-border text-popover-foreground";
  const muted = "text-muted-foreground";
  const rowIdle = "hover:bg-muted/70";
  const rowUnread = "bg-emerald-500/10";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className={`relative w-9 h-9 rounded-xl border flex items-center justify-center ${btnClass}`}
        aria-label={t.admin.notificationsTitle}
        aria-expanded={open}
      >
        <Bell size={16} />
        {perm === "default" ? (
          <span className="absolute -bottom-0.5 -end-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white/80" />
        ) : null}
        {unread > 0 && (
          <span className="absolute -top-1 -end-1 min-w-4 h-4 px-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open ? (
        <div
          className={`absolute top-full mt-2 end-0 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border shadow-2xl overflow-hidden z-50 ${panelClass}`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-heading">{t.admin.notificationsTitle}</p>
            {items.some((item) => !item.read) ? (
              <button
                type="button"
                onClick={() => void markRead({ all: true })}
                className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
              >
                {t.admin.notificationsMarkAllRead}
              </button>
            ) : null}
          </div>
          {perm !== "granted" && perm !== "unsupported" ? (
            <div
              className="px-4 py-3 border-b border-border bg-emerald-500/10"
            >
              {perm === "denied" ? (
                <p className={`text-[11px] leading-5 ${muted}`}>
                  {t.admin.notificationsBrowserDenied}
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => void enableBrowserAlerts()}
                    className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-bold py-2 px-3"
                  >
                    {t.admin.notificationsEnableBrowser}
                  </button>
                  <p className={`mt-1.5 text-[11px] leading-5 ${muted}`}>
                    {t.admin.notificationsBrowserHint}
                  </p>
                </>
              )}
            </div>
          ) : perm === "granted" ? (
            <p
              className="px-4 py-2 text-[11px] border-b border-border text-emerald-700 dark:text-emerald-400"
            >
              {t.admin.notificationsBrowserOn}
            </p>
          ) : null}
          <div className="max-h-[22rem] overflow-y-auto">
            {items.length === 0 ? (
              <p className={`px-4 py-8 text-center text-sm ${muted}`}>
                {t.admin.notificationsEmpty}
              </p>
            ) : (
              items.map((item) => {
                const Icon = typeIcon(item.type);
                const inner = (
                  <>
                    <span
                      className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-secondary text-foreground"
                    >
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-semibold leading-5">
                          {item.title_ar}
                        </span>
                        <span className={`text-[10px] shrink-0 ${muted}`}>
                          {formatWhen(item.created, locale)}
                        </span>
                      </span>
                      {item.body_ar ? (
                        <span className={`mt-0.5 block text-xs leading-5 ${muted}`}>
                          {item.body_ar}
                        </span>
                      ) : null}
                    </span>
                    {!item.read ? (
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    ) : null}
                  </>
                );
                const rowClass = `w-full flex items-start gap-3 px-4 py-3 text-start transition-colors ${
                  item.read ? rowIdle : rowUnread
                }`;
                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={rowClass}
                      onClick={() => {
                        if (!item.read) void markRead({ ids: [item.id] });
                        setOpen(false);
                      }}
                    >
                      {inner}
                    </Link>
                  );
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={rowClass}
                    onClick={() => {
                      if (!item.read) void markRead({ ids: [item.id] });
                    }}
                  >
                    {inner}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
