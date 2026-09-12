"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Buddy = {
  id: string;
  userId: string;
  name: string;
  destination: string;
  dateFrom?: string;
  dateTo?: string;
  language?: string;
  bio?: string;
};

export default function TravelBuddiesPage() {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [destination, setDestination] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/community/buddies");
    const data = await res.json();
    if (data.ok) setBuddies(data.buddies || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProfile() {
    const res = await fetch("/api/community/buddies", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ destination, bio }),
    });
    const data = await res.json();
    setMessage(data.ok ? "تم حفظ ملف الرفقة" : "سجّل الدخول أولاً");
    await load();
  }

  async function requestBuddy(toUserId: string) {
    const res = await fetch("/api/community/buddies/requests", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ toUserId }),
    });
    const data = await res.json();
    setMessage(data.ok ? "تم إرسال الطلب" : "تعذر الإرسال");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-28">
      <h1 className="text-3xl font-black text-[#2E1065]">رفقاء السفر</h1>
      <p className="mt-2 text-sm text-slate-600">اعثر على مسافر يشارك وجهتك. عند القبول يُفتح خيط رسائل.</p>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-md">
        <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="الوجهة" className="w-full rounded-2xl border px-3 py-2" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="نبذة" className="mt-3 w-full rounded-2xl border px-3 py-2" />
        <button type="button" onClick={saveProfile} className="mt-3 rounded-2xl bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white">نشر ملفي</button>
      </div>
      <ul className="mt-6 space-y-3">
        {buddies.map((b) => (
          <li key={b.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="font-bold text-[#2E1065]">{b.name}</p>
              <p className="text-sm text-slate-500">{b.destination} {b.dateFrom ? `· ${b.dateFrom}` : ""}</p>
              {b.bio && <p className="text-sm text-slate-600">{b.bio}</p>}
            </div>
            <button type="button" onClick={() => requestBuddy(b.userId)} className="rounded-2xl bg-amber-400 px-3 py-1.5 text-xs font-black text-[#2E1065]">طلب رفقة</button>
          </li>
        ))}
      </ul>
      {message && <p className="mt-4 text-sm font-semibold text-[#7C3AED]">{message}</p>}
      <Link href="/account?tab=buddies" className="mt-6 inline-block text-sm font-bold text-[#7C3AED]">ملفي في الحساب</Link>
    </main>
  );
}
