"use client";

import { useEffect } from "react";
import { checkAuthenticated } from "@/data/auth";
import {
  getNotifyPermission,
  ingestAdminNotifications,
  markPushItemAnnounced,
  playAdminChime,
  registerAdminServiceWorker,
  requestAdminNotifyPermission,
  subscribeAdminPush,
  unlockAdminAudio,
  wantsBrowserAlerts,
  wasAnnounced,
} from "@/lib/admin-notifications/client";
import {
  isAdminNotificationType,
  type AdminNotificationRecord,
} from "@/lib/admin-notifications/types";

const POLL_MS = 20000;

function asItems(data: { items?: AdminNotificationRecord[] }): AdminNotificationRecord[] {
  return (data.items || []).filter((row) =>
    isAdminNotificationType(String(row.type || ""))
  );
}

/**
 * Site-wide admin alert watcher: SW + light polling whenever an admin
 * session exists, including public pages in another tab.
 */
export default function AdminNotifyBridge() {
  useEffect(() => {
    let cancelled = false;
    let timer = 0;

    const onGesture = () => {
      unlockAdminAudio();
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });

    const onSwMessage = (event: MessageEvent) => {
      const msg = event.data as { type?: string; item?: { id?: string } } | null;
      if (!msg || msg.type !== "admin-push" || !msg.item?.id) return;
      const id = String(msg.item.id);
      if (!id || wasAnnounced(`notif:${id}`)) return;
      markPushItemAnnounced(id);
      playAdminChime();
    };
    navigator.serviceWorker?.addEventListener("message", onSwMessage);

    const poll = async () => {
      try {
        const res = await fetch("/api/admin/notifications?limit=8", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (res.status === 401) return;
        const data = (await res.json()) as {
          ok?: boolean;
          items?: AdminNotificationRecord[];
        };
        if (!res.ok || !data.ok || cancelled) return;
        ingestAdminNotifications(asItems(data));
      } catch {
        /* ignore */
      }
    };

    void (async () => {
      const signedIn = await checkAuthenticated();
      if (!signedIn || cancelled) return;
      await registerAdminServiceWorker();
      const permission = getNotifyPermission();
      if (permission === "granted" || wantsBrowserAlerts()) {
        if (permission === "granted") {
          await subscribeAdminPush();
        }
      } else if (
        permission === "default" &&
        window.location.pathname.startsWith("/admin") &&
        window.location.pathname !== "/admin/login"
      ) {
        try {
          if (!sessionStorage.getItem("alrayyan_admin_notify_asked")) {
            sessionStorage.setItem("alrayyan_admin_notify_asked", "1");
            requestAdminNotifyPermission();
          }
        } catch {
          requestAdminNotifyPermission();
        }
      }
      if (cancelled) return;
      await poll();
      timer = window.setInterval(() => {
        void poll();
      }, POLL_MS);
    })();

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      navigator.serviceWorker?.removeEventListener("message", onSwMessage);
    };
  }, []);

  return null;
}
