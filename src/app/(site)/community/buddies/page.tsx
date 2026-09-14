"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import EmptyStateCard from "@/components/chrome/EmptyStateCard";
import { companionCardCopy } from "@/lib/travel-companions";

type Buddy = {
  id: string;
  userId: string;
  name: string;
  city?: string;
  destination: string;
  bio?: string;
  unread?: number;
};

export default function TravelBuddiesPage() {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [city, setCity] = useState("");
  const [destination, setDestination] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function load(q = searchCity) {
    try {
      const qs = q ? `?city=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/community/buddies${qs}`, { credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        setBuddies(data.matches || data.buddies || []);
        if (data.me) {
          setCity(data.me.city || "");
          setDestination(data.me.destination || "");
        }
        setError(false);
      } else setError(true);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveProfile() {
    const res = await fetch("/api/community/buddies", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ city, destination: destination || city }),
    });
    const data = await res.json();
    setMessage(data.ok ? "تم حفظ ملف الرفقة" : "سجّل الدخول أولاً");
    await load();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-28">
      <h1 className="text-3xl font-black text-[#2E1065]">رفقاء السفر</h1>
      <p className="mt-2 text-sm text-slate-600">اعثر على أعضاء مسجّلين من نفس مدينتك أو وجهتك، ثم افتح ملفهم وابدأ محادثة خاصة.</p>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-md">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="مدينتك" className="min-h-11 w-full rounded-2xl border px-3 py-2" />
        <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="وجهة الرحلة" className="mt-3 min-h-11 w-full rounded-2xl border px-3 py-2" />
        <button type="button" onClick={() => void saveProfile()} className="mt-3 min-h-11 rounded-2xl bg-[#7C3AED] px-4 text-sm font-bold text-white">نشر ملفي</button>
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load(searchCity);
        }}
      >
        <input value={searchCity} onChange={(e) => setSearchCity(e.target.value)} placeholder="ابحث عن مدينة" className="min-h-11 min-w-0 flex-1 rounded-2xl border px-3" />
        <button type="submit" className="min-h-11 rounded-2xl bg-amber-400 px-4 text-xs font-black text-[#2E1065]">بحث</button>
      </form>
      {error ? (
        <div className="mt-6">
          <EmptyStateCard icon={Users} title="تعذر تحميل رفقاء السفر" description="حاول مرة أخرى بعد قليل." />
        </div>
      ) : buddies.length === 0 ? (
        <div className="mt-6">
          <EmptyStateCard icon={Users} title="لا يوجد رفقاء مطابقون بعد" description="احفظ مدينتك أو ابحث باسم مدينة للعثور على مسافرين مسجّلين." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {buddies.map((b) => {
            const copy = companionCardCopy(b);
            return (
              <li key={b.id}>
                <Link href={`/account/companions/${b.userId}`} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-bold text-[#2E1065]">{copy.title}</p>
                    <p className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={12} /> {copy.subtitle}
                    </p>
                    {b.bio ? <p className="text-sm text-slate-600">{b.bio}</p> : null}
                  </div>
                  {b.unread ? (
                    <span className="min-w-6 rounded-full bg-amber-400 px-1.5 text-center text-xs font-black text-[#2E1065]">{b.unread}</span>
                  ) : (
                    <span className="text-xs font-bold text-[#7C3AED]">الملف</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {message && <p className="mt-4 text-sm font-semibold text-[#7C3AED]">{message}</p>}
      <Link href="/account?tab=buddies" className="mt-6 inline-block text-sm font-bold text-[#7C3AED]">ملفي في الحساب</Link>
    </main>
  );
}
