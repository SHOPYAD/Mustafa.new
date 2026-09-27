"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import EmptyStateCard from "@/components/chrome/EmptyStateCard";
import { paymentCopy } from "@/lib/payments/copy";
import type { PublicSavedCard } from "@/lib/payments/card-fields";

export default function SavedCardsPanel({ locale }: { locale: string }) {
  const copy = paymentCopy(locale);
  const [cards, setCards] = useState<PublicSavedCard[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/cards", { cache: "no-store", credentials: "include" });
      const data = (await res.json()) as { cards?: PublicSavedCard[] };
      setCards(Array.isArray(data.cards) ? data.cards : []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-purple-800" />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-md sm:p-6">
      <h2 className="text-lg font-black text-[#2E1065]">{copy.savedCards}</h2>
      {cards.length === 0 ? (
        <EmptyStateCard icon={CreditCard} title={copy.emptyCards} description={copy.pci} />
      ) : (
        <ul className="space-y-2">
          {cards.map((card) => (
            <li
              key={card.id}
              className="flex min-h-[44px] items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CreditCard size={16} />
                {card.brand} •••• {card.last4}
                {card.expireMonth && card.expireYear ? (
                  <span className="text-xs text-slate-400" dir="ltr">
                    {card.expireMonth}/{String(card.expireYear).slice(-2)}
                  </span>
                ) : null}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await fetch(`/api/account/cards?id=${encodeURIComponent(card.id)}`, { method: "DELETE" });
                  await load();
                }}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-slate-400"
              >
                <Trash2 size={16} />
                <span className="sr-only">{copy.deleteCard}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="inline-flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        {copy.pci}
      </p>
    </div>
  );
}
