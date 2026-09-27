"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarCheck, Eye, UserPlus, CheckCheck } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
  const { t, locale, dir } = useLocale();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotificationRecord[]>([]);
  const [unread, setUnread] = useState(0);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");

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
      // ignore
    }
  }, [applyPayload]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    setPerm(getNotifyPermission());
  }, []);

  const markRead = async (body: { all?: boolean; ids?: string[] }) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        items?: AdminNotificationRecord[];
        unread?: number;
      };
      if (!res.ok || !data.ok) return;
      applyPayload(data);
    } catch {
      // ignore
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && unread > 0) {
      void markRead({ all: true });
    }
  };

  const enableBrowserAlerts = async () => {
    const next = await enableAdminBrowserAlerts();
    setPerm(next);
  };

  const muted = "text-muted-foreground";
  const rowIdle = "hover:bg-muted/70";
  const rowUnread = "bg-primary/5";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative size-9 rounded-xl border border-border bg-secondary hover:bg-muted text-foreground flex items-center justify-center transition-colors outline-none"
          aria-label={t.admin.notificationsTitle}
          aria-expanded={open}
        >
          <Bell size={16} />
          {perm === "default" ? (
            <span className="absolute -bottom-0.5 -end-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-background" />
          ) : null}
          {unread > 0 && (
            <span className="absolute -top-1.5 -end-1.5 min-w-4 h-4 px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={dir === "rtl" ? "start" : "end"}
        sideOffset={8}
        className="w-[min(23rem,calc(100vw-2rem))] p-0 rounded-2xl border border-border bg-card dark:bg-zinc-950 text-card-foreground shadow-2xl overflow-hidden z-50 backdrop-blur-none"
        dir={dir}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-primary" />
            <p className="text-sm font-bold text-foreground">{t.admin.notificationsTitle}</p>
          </div>
          {items.some((item) => !item.read) ? (
            <button
              type="button"
              onClick={() => void markRead({ all: true })}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              <CheckCheck size={13} />
              <span>{t.admin.notificationsMarkAllRead}</span>
            </button>
          ) : null}
        </div>

        {perm !== "granted" && perm !== "unsupported" ? (
          <div className="px-4 py-2.5 border-b border-border bg-amber-500/10 dark:bg-amber-950/20">
            {perm === "denied" ? (
              <p className={`text-[11px] leading-relaxed text-amber-700 dark:text-amber-300 font-medium`}>
                {t.admin.notificationsBrowserDenied}
              </p>
            ) : (
              <div className="space-y-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void enableBrowserAlerts()}
                  className="w-full h-7 text-xs font-semibold"
                >
                  {t.admin.notificationsEnableBrowser}
                </Button>
                <p className={`text-[10px] leading-normal ${muted}`}>
                  {t.admin.notificationsBrowserHint}
                </p>
              </div>
            )}
          </div>
        ) : perm === "granted" ? (
          <div className="px-4 py-1.5 text-[11px] border-b border-border/40 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/5">
            {t.admin.notificationsBrowserOn}
          </div>
        ) : null}

        <div className="max-h-[22rem] overflow-y-auto divide-y divide-border/30">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center flex flex-col items-center gap-2 text-muted-foreground">
              <Bell size={24} className="opacity-30" />
              <p className="text-xs font-medium">{t.admin.notificationsEmpty}</p>
            </div>
          ) : (
            items.map((item) => {
              const Icon = typeIcon(item.type);
              const inner = (
                <>
                  <span className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-secondary text-foreground border border-border/40">
                    <Icon size={14} className="text-primary" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[12px] font-bold leading-5 text-foreground">
                        {item.title_ar}
                      </span>
                      <span className={`text-[10px] shrink-0 font-medium ${muted}`}>
                        {formatWhen(item.created, locale)}
                      </span>
                    </span>
                    {item.body_ar ? (
                      <span className={`mt-0.5 block text-xs leading-relaxed ${muted}`}>
                        {item.body_ar}
                      </span>
                    ) : null}
                  </span>
                  {!item.read ? (
                    <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
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
      </PopoverContent>
    </Popover>
  );
}
