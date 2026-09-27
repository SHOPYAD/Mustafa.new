"use client";

import { useEffect, useState } from "react";
import { Check, Luggage, Plus, X } from "lucide-react";
import { fetchPaidBaggage, type PaidBagOption } from "@/components/flights/api";
import type { FlightCopy } from "@/components/flights/copy";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  copy: FlightCopy;
  sessionId: string;
  itineraryId: string;
  fareId?: string;
  adults: number;
  children: number;
  infants: number;
  currency: string;
  selectedId?: string;
  flightPrice: number;
  onSelect: (bag: PaidBagOption) => void;
  onEmpty?: () => void;
};

export default function PaidBaggageModal({
  open,
  onClose,
  copy,
  sessionId,
  itineraryId,
  fareId,
  adults,
  children,
  infants,
  currency,
  selectedId,
  flightPrice,
  onSelect,
  onEmpty,
}: Props) {
  const { formatFlightPrice } = useFlightPrice();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<PaidBagOption[]>([]);

  useEffect(() => {
    if (!open || !sessionId || !itineraryId) return;
    let cancelled = false;
    setLoading(true);
    setOptions([]);
    void fetchPaidBaggage({
      sessionId,
      itineraryId,
      fareId,
      adults,
      children,
      infants,
      currency,
    })
      .then((rows) => {
        if (cancelled) return;
        setOptions(rows);
        if (!rows.length) onEmpty?.();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, sessionId, itineraryId, fareId, adults, children, infants, currency, onEmpty]);

  if (!open) return null;

  const selected = options.find((bag) => bag.id === selectedId) || null;
  const liveTotal = flightPrice + (selected?.price || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1b053a]/55 p-3 backdrop-blur-xs sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#1b053a] via-[#2e1065] to-[#3b0764] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Luggage size={18} className="text-amber-300" />
            <h3 className="text-sm font-black">{copy.addBagTitle}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-white/10 cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <p className="px-5 pt-4 text-xs text-slate-600">{copy.addBagHint}</p>
        <div className="max-h-[60vh] overflow-auto p-4">
          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-purple-900">{copy.addBagLoading}</p>
          ) : !options.length ? (
            <p className="py-8 text-center text-sm text-slate-500">{copy.addBagEmpty}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {options.map((bag) => {
                const active = selectedId === bag.id;
                return (
                  <button
                    key={bag.id}
                    type="button"
                    onClick={() => onSelect(bag)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition cursor-pointer",
                      active
                        ? "border-purple-600 bg-purple-50 ring-2 ring-purple-200 shadow-md shadow-purple-900/10"
                        : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-black",
                        active ? "bg-emerald-600" : "bg-amber-500"
                      )}
                    >
                      {active ? <Check size={16} className="stroke-[3]" /> : <Plus size={16} className="stroke-[3]" />}
                    </span>
                    <Luggage size={bag.weightKg >= 25 ? 36 : bag.weightKg >= 15 ? 30 : 26} className={active ? "text-purple-800" : "text-slate-500"} />
                    <span className="text-lg font-black tabular-nums text-[#1e1b4b]">{bag.weightKg} kg</span>
                    <span className="text-[11px] text-slate-500">{bag.label}</span>
                    <span className="text-sm font-black text-[#2e1065]">
                      {bag.price > 0 ? `+${formatFlightPrice(bag.price, bag.currency || currency)}` : copy.addBagSelected}
                    </span>
                    {active ? (
                      <span className="text-[10px] font-black text-emerald-700">{copy.addBagSelected}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {selected && flightPrice > 0 ? (
          <div className="mx-4 mb-3 rounded-2xl border border-purple-100 bg-purple-50/70 px-4 py-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>{copy.addBagPlusFlight}</span>
              <span className="tabular-nums">{formatFlightPrice(flightPrice, currency)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between font-black text-purple-950">
              <span>{copy.addBagTotal}</span>
              <span className="text-base tabular-nums">{formatFlightPrice(liveTotal, selected.currency || currency)}</span>
            </div>
          </div>
        ) : null}
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {copy.addBagClose}
          </button>
        </div>
      </div>
    </div>
  );
}
