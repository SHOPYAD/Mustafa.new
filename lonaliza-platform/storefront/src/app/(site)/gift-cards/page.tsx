"use client";

import { useState } from "react";
import Link from "next/link";

export default function GiftCardsPage() {
  const [amount, setAmount] = useState(50);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function buy() {
    const res = await fetch("/api/gift-cards", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount, recipientEmail: email }),
    });
    const data = await res.json();
    setMessage(data.ok ? `تم إصدار البطاقة: ${data.card.code}` : data.error === "login_required" ? "سجّل الدخول أولاً" : "تعذر الشراء");
  }

  async function redeem() {
    const res = await fetch("/api/gift-cards/redeem", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setMessage(data.ok ? "تم الاسترداد في المحفظة/الولاء" : "كود غير صالح");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28">
      <h1 className="text-3xl font-black text-[#2E1065]">بطاقات هدايا لوناليزا</h1>
      <p className="mt-2 text-sm text-slate-600">اشترِ أو أهدِ أو استرد كوداً — نفس الرصيد على الموقع والتطبيق.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="font-black text-[#2E1065]">شراء بطاقة</h2>
          <input type="number" min={10} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-4 w-full rounded-2xl border px-3 py-2" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="إيميل المهدي إليه (اختياري)" className="mt-3 w-full rounded-2xl border px-3 py-2" />
          <button type="button" onClick={buy} className="mt-4 w-full rounded-2xl bg-[#7C3AED] py-2.5 font-bold text-white">شراء</button>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="font-black text-[#2E1065]">استرداد كود</h2>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="LNZ-XXXX" className="mt-4 w-full rounded-2xl border px-3 py-2" />
          <button type="button" onClick={redeem} className="mt-4 w-full rounded-2xl bg-[#F59E0B] py-2.5 font-bold text-[#2E1065]">استرداد</button>
        </section>
      </div>
      {message && <p className="mt-4 text-sm font-semibold text-[#7C3AED]">{message}</p>}
      <Link href="/account?tab=gifts" className="mt-6 inline-block text-sm font-bold text-[#7C3AED]">بطاقاتي في الحساب</Link>
    </main>
  );
}
