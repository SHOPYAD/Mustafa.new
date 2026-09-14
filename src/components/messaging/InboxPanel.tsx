"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import EmptyStateCard from "@/components/chrome/EmptyStateCard";
import InAppMessageToast from "@/components/messaging/InAppMessageToast";
import { registerLocalNostrPubkey } from "@/lib/messaging/register-pubkey";
import { notifyIncomingMessage } from "@/lib/messaging/native-notify";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Thread = {
  id: string;
  title: string;
  type: string;
  peerUserId?: string;
  peerName?: string;
  peerAvatar?: string;
  lastPreview?: string;
  updatedAt: string;
  unread: number;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "م";
}

function formatTime(iso: string, locale: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short" });
}

export default function InboxPanel() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [threads, setThreads] = useState<Thread[]>([]);
  const [error, setError] = useState(false);
  const seen = useRef<Record<string, string>>({});

  async function load() {
    try {
      const res = await fetch("/api/account/inbox", { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!data.ok) {
        setError(true);
        return;
      }
      const next = (data.threads || []) as Thread[];
      for (const t of next) {
        const stamp = `${t.updatedAt}:${t.unread}`;
        const prev = seen.current[t.id];
        if (prev && prev !== stamp && t.unread > 0) {
          notifyIncomingMessage(t.peerName || t.title, `/account/messages/${t.id}`);
        }
        seen.current[t.id] = stamp;
      }
      setThreads(next);
      setError(false);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    void registerLocalNostrPubkey();
    void load();
    const id = window.setInterval(() => void load(), 8000);
    return () => window.clearInterval(id);
  }, []);

  if (error) {
    return (
      <EmptyStateCard
        icon={Inbox}
        title={isAr ? "تعذر تحميل الرسائل" : "Could not load messages"}
        description={isAr ? "حاول مرة أخرى بعد قليل." : "Please try again shortly."}
      />
    );
  }

  if (!threads.length) {
    return (
      <div className="space-y-3">
        <InAppMessageToast />
        <EmptyStateCard
          icon={Inbox}
          title={isAr ? "لا توجد محادثات بعد" : "No conversations yet"}
          description={isAr ? "ابدأ محادثة خاصة من رفقاء السفر لتنسيق الرحلة." : "Start a private chat from Travel Companions."}
        />
        <Link
          href="/account?tab=buddies"
          className="flex min-h-11 items-center justify-center rounded-2xl bg-[#2E1065] text-sm font-black text-amber-300"
        >
          {isAr ? "العثور على رفقاء سفر" : "Find travel companions"}
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
      <InAppMessageToast />
      <ul className="divide-y divide-slate-100">
        {threads.map((t) => {
          const name = t.peerName || t.title || (isAr ? "محادثة" : "Chat");
          return (
            <li key={t.id}>
              <Link
                href={`/account/messages/${t.id}`}
                className="flex min-h-[72px] items-center gap-3 px-4 py-3 active:bg-purple-50"
              >
                <div className="relative shrink-0">
                  {t.peerAvatar ? (
                    <img src={t.peerAvatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2E1065] text-sm font-black text-amber-300">
                      {initials(name)}
                    </div>
                  )}
                  {t.unread > 0 ? (
                    <span className="absolute -start-1 -top-1 min-w-5 rounded-full bg-amber-400 px-1 text-center text-[10px] font-black text-[#2E1065]">
                      {t.unread > 9 ? "9+" : t.unread}
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-black text-[#2E1065]">{name}</p>
                    <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                      {formatTime(t.updatedAt, locale)}
                    </span>
                  </div>
                  <p className={`mt-0.5 truncate text-xs ${t.unread ? "font-bold text-slate-800" : "text-slate-500"}`}>
                    {t.lastPreview || (isAr ? "ابدأ المحادثة" : "Start chatting")}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
