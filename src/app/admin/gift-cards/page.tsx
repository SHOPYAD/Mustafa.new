"use client";

import { useEffect, useState } from "react";

type Card = { id: string; code: string; amount: number; status: string; purchaserId: string };

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [amount, setAmount] = useState(50);

  async function load() {
    const res = await fetch("/api/admin/gift-cards", { credentials: "same-origin" });
    const data = await res.json();
    if (data.ok) setCards(data.cards || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-black">بطاقات الهدايا</h1>
      <div className="mt-4 flex gap-2">
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="rounded-xl bg-white/10 px-3 py-2" />
        <button
          type="button"
          className="rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950"
          onClick={async () => {
            await fetch("/api/admin/gift-cards", {
              method: "POST",
              credentials: "same-origin",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ amount }),
            });
            await load();
          }}
        >
          إصدار يدوي
        </button>
      </div>
      <ul className="mt-6 space-y-2">
        {cards.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span className="font-mono">{c.code} · ${c.amount} · {c.status}</span>
            {c.status === "active" && (
              <button
                type="button"
                className="text-sm text-rose-300"
                onClick={async () => {
                  await fetch("/api/admin/gift-cards", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ action: "void", id: c.id }),
                  });
                  await load();
                }}
              >
                إبطال
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
