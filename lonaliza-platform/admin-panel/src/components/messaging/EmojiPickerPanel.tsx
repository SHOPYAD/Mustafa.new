"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { EMOJI_CATALOG, type EmojiGroup } from "@/components/builder/inspector/controls/emoji-catalog";

const GROUPS: { id: EmojiGroup; label: string; icon: string }[] = [
  { id: "Travel", label: "سفر", icon: "✈️" },
  { id: "People", label: "وجوه", icon: "😀" },
  { id: "Nature", label: "طبيعة", icon: "🌸" },
  { id: "Food", label: "طعام", icon: "🍽️" },
  { id: "Activities", label: "أنشطة", icon: "🎉" },
  { id: "Objects", label: "أشياء", icon: "🎁" },
  { id: "Symbols", label: "رموز", icon: "💜" },
  { id: "Flags", label: "أعلام", icon: "🏳️" },
];

export default function EmojiPickerPanel({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
}) {
  const [group, setGroup] = useState<EmojiGroup>("People");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    return EMOJI_CATALOG.filter((e) => {
      if (query) return e.ch.includes(query) || e.name.toLowerCase().includes(query) || e.tags.includes(query);
      return e.group === group;
    }).slice(0, 240);
  }, [group, q]);

  if (!open) return null;

  return (
    <div className="absolute inset-x-0 bottom-full z-40 mb-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث عن إيموجي"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50" aria-label="إغلاق">
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto px-2 py-2">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              setGroup(g.id);
              setQ("");
            }}
            className={`inline-flex h-11 shrink-0 items-center gap-1 rounded-2xl px-3 text-xs font-bold ${
              group === g.id && !q ? "bg-[#2E1065] text-white" : "bg-slate-50 text-slate-600"
            }`}
          >
            <span>{g.icon}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>
      <div className="grid max-h-[38vh] grid-cols-8 gap-1 overflow-y-auto overscroll-contain p-2">
        {items.map((e) => (
          <button
            key={`${e.group}-${e.ch}-${e.name}`}
            type="button"
            title={e.name}
            onClick={() => onPick(e.ch)}
            className="flex h-11 items-center justify-center rounded-xl text-xl active:bg-purple-50"
          >
            {e.ch}
          </button>
        ))}
      </div>
    </div>
  );
}
