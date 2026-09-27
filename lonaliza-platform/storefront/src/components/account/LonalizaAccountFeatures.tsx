"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clapperboard, Gift, Inbox, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useBrandName } from "@/components/branding/BrandingProvider";
import EmptyStateCard from "@/components/chrome/EmptyStateCard";
import NativeComposer from "@/components/chrome/NativeComposer";
import TravelCompanionsPanel from "@/components/account/TravelCompanionsPanel";
import InboxPanel from "@/components/messaging/InboxPanel";
import WhatsAppMessenger from "@/components/messaging/WhatsAppMessenger";
import SavedCardsPanel from "@/components/payments/SavedCardsPanel";

type Feature =
  | "inbox"
  | "moments"
  | "buddies"
  | "creator"
  | "gifts"
  | "upcoming"
  | "recent"
  | "cards"
  | "about";

async function j<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init, headers: { "content-type": "application/json", ...(init?.headers || {}) } });
  return (await res.json()) as T;
}

import LonalizaAccountAbout from "@/components/account/LonalizaAccountAbout";

export default function LonalizaAccountFeatures({ feature }: { feature: Feature }) {
  const { locale, t } = useLocale();
  const isAr = locale === "ar";
  const brand = useBrandName(locale);

  if (feature === "about") {
    return <LonalizaAccountAbout />;
  }

  if (feature === "buddies") return <TravelCompanionsPanel />;
  if (feature === "inbox") return <WhatsAppMessenger />;
  if (feature === "cards") return <SavedCardsPanel locale={locale} />;

  return <LivePanel feature={feature} isAr={isAr} />;
}

function LivePanel({ feature, isAr }: { feature: Feature; isAr: boolean }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (feature === "moments") setData(await j("/api/community/feed?kind=moment"));
    if (feature === "creator") setData(await j("/api/community/creator/stats"));
    if (feature === "gifts") setData(await j("/api/gift-cards"));
    if (feature === "upcoming") setData(await j("/api/account/bookings?filter=upcoming"));
    if (feature === "recent") setData(await j("/api/account/recently-viewed"));
    if (feature === "cards") setData(await j("/api/account/cards"));
  }

  useEffect(() => {
    load().catch(() => setData({ ok: false }));
  }, [feature]);

  async function submit() {
    setBusy(true);
    try {
      if (feature === "gifts" && Number(text) >= 10) {
        await j("/api/gift-cards", { method: "POST", body: JSON.stringify({ amount: Number(text) }) });
      }
      if (feature === "gifts" && text.toUpperCase().startsWith("LNZ")) {
        await j("/api/gift-cards/redeem", { method: "POST", body: JSON.stringify({ code: text }) });
      }
      setText("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  const rows = Array.isArray((data as { posts?: unknown[] })?.posts)
    ? (data as { posts: Array<{ id: string; content?: string; destination?: string; title?: string }> }).posts
    : Array.isArray((data as { cards?: unknown[] })?.cards)
      ? (data as { cards: Array<{ id: string; code?: string; amount?: number; last4?: string; brand?: string; status?: string; title?: string }> }).cards
      : Array.isArray((data as { items?: unknown[] })?.items)
        ? (data as { items: Array<{ id: string; title: string; kind: string }> }).items
        : Array.isArray((data as { hotels?: unknown[] })?.hotels) || Array.isArray((data as { flights?: unknown[] })?.flights)
          ? [
              ...(((data as { hotels?: Array<{ id: string }> }).hotels || []).map((h) => ({ id: h.id, title: "Hotel" }))),
              ...(((data as { flights?: Array<{ id: string; destination?: string }> }).flights || []).map((f) => ({ id: f.id, title: f.destination || "Flight" }))),
              ...(((data as { enquiries?: Array<{ id: string; service_name?: string }> }).enquiries || []).map((e) => ({ id: e.id, title: e.service_name || "Enquiry" }))),
            ]
          : [];

  const stats = (data as { stats?: { posts: number; reels: number; likes: number; comments: number } })?.stats;

  const emptyCopy =
    feature === "moments"
      ? {
          icon: Clapperboard,
          title: isAr ? "لا توجد لحظات سفر بعد" : "No travel moments yet",
          desc: isAr ? "شارك لحظات رحلتك مع مجتمع المسافرين" : "Share your journey moments with travelers",
        }
      : feature === "gifts"
        ? {
            icon: Gift,
            title: isAr ? "لا توجد بطاقات هدايا" : "No gift cards",
            desc: isAr ? "أرسل بطاقات هدايا لأصدقائك وعائلتك" : "Send gift cards to friends and family",
          }
        : feature === "creator"
          ? {
              icon: Sparkles,
              title: isAr ? "برنامج منشئي المحتوى" : "Creator program",
              desc: isAr ? "اربح عوائد من مشاركة تجارب السفر" : "Earn rewards by sharing travel experiences",
            }
          : {
              icon: Inbox,
              title: isAr ? "لا توجد عناصر" : "No records",
              desc: isAr ? "لا توجد عناصر لعرضها حالياً" : "Nothing to display currently",
            };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-md sm:p-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-[#F7F4FC] p-3 text-center">
              <p className="text-[11px] font-bold text-purple-700">{k}</p>
              <p className="text-lg font-black text-[#2E1065]">{v}</p>
            </div>
          ))}
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyStateCard icon={emptyCopy.icon} title={emptyCopy.title} description={emptyCopy.desc} />
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id} className="rounded-2xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
              {"title" in row && row.title
                ? String(row.title)
                : "content" in row
                  ? String(row.content || row.destination || "")
                  : "name" in row
                    ? String((row as { name?: string }).name || "")
                    : ""}
            </li>
          ))}
        </ul>
      )}
      {feature === "gifts" && (
        <NativeComposer
          value={text}
          onChange={setText}
          onSubmit={submit}
          disabled={busy}
          placeholder={feature === "gifts" ? (isAr ? "مبلغ أو كود LNZ" : "Amount or LNZ code") : isAr ? "اكتب هنا" : "Write here"}
          submitLabel={isAr ? "إرسال" : "Send"}
        />
      )}
      {feature === "cards" && (
        <p className="text-xs text-slate-500">
          {isAr
            ? "لا نحتفظ برقم البطاقة. أضف بطاقة عبر الدفع عند تفعيل حفظ البطاقات في iyzico."
            : "Card numbers are never stored. Add a card through checkout when iyzico card storage is enabled."}
        </p>
      )}
    </div>
  );
}
