"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { plannerCopy } from "@/lib/planner/copy";
import { uid } from "@/lib/planner/geo";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";
import { cn } from "@/lib/utils";
import { P } from "./planner-ui";

export default function AddPlaceSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const { addStop, addLater, activeDay, trip } = usePlanner();
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState("");
  const [places, setPlaces] = useState<Array<{ label: string; lat: number; lng: number }>>([]);

  if (!open) return null;

  const search = async () => {
    if (!q.trim()) return;
    const cityLike = q.trim().split(/\s+/).length <= 3 && !/\d/.test(q);
    const dest = cityLike ? q : trip?.destination || q;
    const [ideas, geo] = await Promise.all([
      fetch(`/internal/planner/ideas?q=${encodeURIComponent(cityLike ? q : `${dest} ${q}`)}`).then((r) => r.json()).catch(() => ({})),
      fetch("/internal/planner/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: cityLike || !trip?.destination ? q : `${q} ${trip.destination}` }),
      }).then((r) => r.json()).catch(() => ({})),
    ]);
    const fromIdeas = (ideas.ideas || []).map((i: { titleAr?: string; titleEn?: string; lat: number; lng: number }) => ({
      label: locale === "ar" ? i.titleAr || i.titleEn : i.titleEn || i.titleAr,
      lat: i.lat,
      lng: i.lng,
    }));
    setPlaces([...(fromIdeas || []), ...(geo.places || [])].slice(0, 16));
  };

  const center = trip?.center || { lat: 41.0082, lng: 28.9784 };

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/35 lg:items-center lg:justify-center">
      <div className="max-h-[82%] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl lg:max-w-md lg:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[17px] font-black text-[#2E1065]">{c.places}</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl hover:bg-[#F7F5FC]"
            aria-label="close"
          >
            <X size={18} />
          </button>
        </div>
        <label className="flex h-12 items-center gap-2 rounded-xl border border-[#E4DFF3] px-3">
          <Search size={16} className="text-[#7C3AED]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void search()}
            placeholder={c.searchPlace}
            className="w-full bg-transparent text-[15px] text-[#1A1438] outline-none placeholder:text-[#8B86A3]"
          />
          <button type="button" onClick={() => void search()} className="text-[13px] font-black text-[#7C3AED]">
            {c.add}
          </button>
        </label>
        <div className="mt-3 space-y-2">
          {places.map((place) => (
            <div
              key={`${place.label}-${place.lat}`}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-[#E4DFF3] px-3 py-2"
            >
              <button
                type="button"
                onClick={() => {
                  addStop(
                    {
                      id: uid("geo"),
                      day: activeDay || 1,
                      order: 99,
                      kind: "attraction",
                      titleAr: place.label,
                      titleEn: place.label,
                      lat: place.lat,
                      lng: place.lng,
                    },
                    activeDay || 1
                  );
                  onClose();
                }}
                className="flex min-w-0 flex-1 items-center justify-between text-start text-[14px] font-semibold text-[#1A1438]"
              >
                <span className="line-clamp-2">{place.label}</span>
                <Plus size={16} className="text-[#7C3AED]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  addLater({
                    id: uid("later"),
                    day: 0,
                    order: 0,
                    kind: "attraction",
                    titleAr: place.label,
                    titleEn: place.label,
                    lat: place.lat,
                    lng: place.lng,
                  });
                  onClose();
                }}
                className="shrink-0 text-[12px] font-bold text-[#B45309]"
              >
                {c.later}
              </button>
            </div>
          ))}
        </div>
        <label className="mt-5 block">
          <span className="mb-1.5 block text-[13px] font-bold text-[#4B4568]">{c.custom}</span>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className={P.field}
          />
        </label>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={!custom.trim()}
            onClick={() => {
              addStop(
                {
                  id: uid("custom"),
                  day: activeDay || 1,
                  order: 99,
                  kind: "custom",
                  titleAr: custom,
                  titleEn: custom,
                  lat: center.lat,
                  lng: center.lng,
                },
                activeDay || 1
              );
              onClose();
            }}
            className={cn(P.btn, P.btnPrimary, "flex-1")}
          >
            {c.add} {activeDay || 1}
          </button>
          <button
            type="button"
            disabled={!custom.trim()}
            onClick={() => {
              addLater({
                id: uid("later"),
                day: 0,
                order: 0,
                kind: "custom",
                titleAr: custom,
                titleEn: custom,
                lat: center.lat,
                lng: center.lng,
              });
              onClose();
            }}
            className={cn(P.btn, P.btnGhost)}
          >
            {c.later}
          </button>
        </div>
      </div>
    </div>
  );
}
