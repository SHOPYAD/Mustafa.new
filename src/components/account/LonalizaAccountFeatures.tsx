"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useBrandName } from "@/components/branding/BrandingProvider";

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

export default function LonalizaAccountFeatures({ feature }: { feature: Feature }) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const brand = useBrandName(locale);

  if (feature === "about") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <h2 className="text-xl font-black text-[#2E1065]">{isAr ? "عن" : "About"} {brand}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {isAr
            ? "منصة سفر واحدة للبحث والحجز والمجتمع والذكاء — نفس الحساب على الموقع والتطبيق."
            : "One travel account for live search, booking, community, and AI — website and app together."}
        </p>
        <Link href="/about" className="mt-4 inline-block text-sm font-bold text-[#7C3AED]">
          {isAr ? "اقرأ المزيد" : "Read more"}
        </Link>
      </div>
    );
  }

  return <LivePanel feature={feature} isAr={isAr} />;
}

function LivePanel({ feature, isAr }: { feature: Feature; isAr: boolean }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (feature === "inbox") setData(await j("/api/account/inbox"));
    if (feature === "moments") setData(await j("/api/community/feed?kind=moment"));
    if (feature === "buddies") setData(await j("/api/community/buddies"));
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
      if (feature === "inbox") {
        await j("/api/account/inbox", { method: "POST", body: JSON.stringify({ title: isAr ? "دعم" : "Support", text, type: "support" }) });
      }
      if (feature === "gifts" && Number(text) >= 10) {
        await j("/api/gift-cards", { method: "POST", body: JSON.stringify({ amount: Number(text) }) });
      }
      if (feature === "gifts" && text.toUpperCase().startsWith("LNZ")) {
        await j("/api/gift-cards/redeem", { method: "POST", body: JSON.stringify({ code: text }) });
      }
      if (feature === "buddies") {
        await j("/api/community/buddies", { method: "POST", body: JSON.stringify({ destination: text || "اسطنبول", bio: text }) });
      }
      setText("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  const rows = Array.isArray((data as { threads?: unknown[] })?.threads)
    ? (data as { threads: Array<{ id: string; title: string; type: string; updatedAt: string }> }).threads
    : Array.isArray((data as { posts?: unknown[] })?.posts)
      ? (data as { posts: Array<{ id: string; content?: string; destination?: string }> }).posts
      : Array.isArray((data as { buddies?: unknown[] })?.buddies)
        ? (data as { buddies: Array<{ id: string; name: string; destination: string; bio?: string }> }).buddies
        : Array.isArray((data as { cards?: unknown[] })?.cards)
          ? (data as { cards: Array<{ id: string; code?: string; amount?: number; last4?: string; brand?: string; status?: string }> }).cards
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

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
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
      <ul className="space-y-2">
        {rows.length === 0 && <li className="text-sm text-slate-500">{isAr ? "لا توجد بيانات بعد." : "Nothing here yet."}</li>}
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
            {"title" in row ? String(row.title) : "content" in row ? String(row.content || row.destination) : JSON.stringify(row)}
          </li>
        ))}
      </ul>
      {(feature === "inbox" || feature === "gifts" || feature === "buddies") && (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={feature === "gifts" ? (isAr ? "مبلغ أو كود LNZ" : "Amount or LNZ code") : isAr ? "اكتب هنا" : "Write here"}
          />
          <button
            type="button"
            disabled={busy || !text.trim()}
            onClick={submit}
            className="rounded-2xl bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {isAr ? "إرسال" : "Send"}
          </button>
        </div>
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
