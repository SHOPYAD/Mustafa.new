"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, MessageCircle, Users } from "lucide-react";
import EmptyStateCard from "@/components/chrome/EmptyStateCard";
import { companionCardCopy } from "@/lib/travel-companions";
import { registerLocalNostrPubkey } from "@/lib/messaging/register-pubkey";
import { getOrCreateLocalNostrKey } from "@/lib/nostr/blossom-uploader";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Companion = {
  id: string;
  userId: string;
  name: string;
  city?: string;
  destination: string;
  bio?: string;
  avatarUrl?: string;
  unread?: number;
  threadId?: string;
};

type Me = Companion | null;

export default function TravelCompanionsPanel() {
  const { locale, t } = useLocale();
  const isAr = locale === "ar";
  const [me, setMe] = useState<Me>(null);
  const [matches, setMatches] = useState<Companion[]>([]);
  const [city, setCity] = useState("");
  const [destination, setDestination] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function load(cityQuery = searchCity) {
    try {
      const qs = cityQuery ? `?city=${encodeURIComponent(cityQuery)}` : "";
      const res = await fetch(`/api/community/buddies${qs}`, { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!data.ok) {
        setError(true);
        return;
      }
      setMe(data.me || null);
      setMatches(Array.isArray(data.matches) ? data.matches : Array.isArray(data.buddies) ? data.buddies : []);
      if (data.me) {
        setCity(data.me.city || "");
        setDestination(data.me.destination || "");
      }
      setError(false);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    void registerLocalNostrPubkey();
    void load();
  }, []);

  async function saveProfile() {
    setBusy(true);
    try {
      const { pubkey } = getOrCreateLocalNostrKey();
      const res = await fetch("/api/community/buddies", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          city: city.trim(),
          destination: destination.trim() || city.trim(),
          cityQuery: searchCity.trim(),
          nostrPubkey: pubkey,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(true);
        return;
      }
      setMe(data.profile || data.me || null);
      setMatches(Array.isArray(data.matches) ? data.matches : []);
      setError(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-md">
        <p className="text-sm font-black text-[#2E1065]">{isAr ? "مدينتك ووجهتك" : "Your city & destination"}</p>
        <p className="mt-1 text-xs leading-6 text-slate-500">
          {isAr
            ? "نظهر الأعضاء المسجلين من نفس مدينتك أو نفس الوجهة. ابحث باسم مدينة للعثور على مسافرين منها."
            : "We show registered members from your city or destination. Search a city name to find travelers from there."}
        </p>
        <div className="mt-3 grid gap-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={isAr ? "مدينتك الحالية" : "Your city"}
            className="min-h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-purple-300"
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={isAr ? "وجهة الرحلة (اختياري)" : "Trip destination (optional)"}
            className="min-h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:border-purple-300"
          />
          <button
            type="button"
            disabled={busy || (!city.trim() && !destination.trim())}
            onClick={() => void saveProfile()}
            className="min-h-11 rounded-2xl bg-[#2E1065] text-sm font-black text-amber-300 disabled:opacity-40"
          >
            {isAr ? "حفظ وإظهار الرفقاء" : "Save & show companions"}
          </button>
        </div>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load(searchCity);
        }}
      >
        <input
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          placeholder={isAr ? "ابحث عن مدينة" : "Search a city"}
          className="min-h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none"
        />
        <button type="submit" className="inline-flex h-11 shrink-0 items-center rounded-2xl bg-amber-400 px-4 text-xs font-black text-[#2E1065]">
          {isAr ? "بحث" : "Search"}
        </button>
      </form>

      {error ? (
        <EmptyStateCard
          icon={Users}
          title={t.appChrome.buddiesLoadFailed}
          description={t.errors.network}
        />
      ) : matches.length === 0 ? (
        <EmptyStateCard
          icon={Users}
          title={
            me?.city || me?.destination
              ? isAr
                ? "لا يوجد رفقاء من مدينتك بعد"
                : "No companions from your city yet"
              : isAr
                ? "حدّد مدينتك للعثور على رفقاء"
                : "Set your city to find companions"
          }
          description={
            isAr
              ? "بعد حفظ المدينة نطابق الأعضاء المسجلين من نفس المدينة أو الوجهة."
              : "After you save a city we match registered members from that city or destination."
          }
        />
      ) : (
        <ul className="space-y-2">
          {matches.map((row) => {
            const copy = companionCardCopy(row);
            return (
              <li key={row.id || row.userId}>
                <Link
                  href={`/account/companions/${row.userId}`}
                  className="flex min-h-[72px] items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm active:bg-purple-50"
                >
                  <div className="relative shrink-0">
                    {row.avatarUrl ? (
                      <img src={row.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2E1065] text-sm font-black text-amber-300">
                        {copy.title.slice(0, 1)}
                      </div>
                    )}
                    {row.unread ? (
                      <span className="absolute -start-1 -top-1 min-w-5 rounded-full bg-amber-400 px-1 text-center text-[10px] font-black text-[#2E1065]">
                        {row.unread}
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-[#2E1065]">{copy.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                      <MapPin size={12} />
                      {copy.subtitle || (isAr ? "مسافر مسجّل" : "Registered traveler")}
                    </p>
                    {row.bio ? <p className="mt-1 line-clamp-2 text-xs text-slate-600">{row.bio}</p> : null}
                  </div>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-[#7C3AED]">
                    <MessageCircle size={18} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
