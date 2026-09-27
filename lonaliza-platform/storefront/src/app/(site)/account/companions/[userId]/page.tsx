"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, MessageCircle, Users } from "lucide-react";
import NativeAppBar from "@/components/chrome/NativeAppBar";
import EmptyStateCard from "@/components/chrome/EmptyStateCard";
import { companionCardCopy } from "@/lib/travel-companions";
import { registerLocalNostrPubkey } from "@/lib/messaging/register-pubkey";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Profile = {
  userId: string;
  name: string;
  city?: string;
  destination?: string;
  bio?: string;
  avatarUrl?: string;
  nostrPubkey?: string;
};

export default function CompanionProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { user, loading, openAuth } = useCustomerAuth();
  const { locale, t } = useLocale();
  const isAr = locale === "ar";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) openAuth("login");
  }, [loading, user, openAuth]);

  useEffect(() => {
    void registerLocalNostrPubkey();
    if (!userId) return;
    void fetch(`/api/community/buddies/${userId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setProfile(d.profile);
        else setError(true);
      })
      .catch(() => setError(true));
  }, [userId]);

  async function startChat() {
    if (!profile) return;
    setBusy(true);
    try {
      const res = await fetch("/api/account/inbox", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          peerUserId: profile.userId,
          peerName: profile.name,
          peerAvatar: profile.avatarUrl,
          peerNostrPubkey: profile.nostrPubkey,
          type: "buddy",
        }),
      });
      const data = await res.json();
      if (data.ok && data.thread?.id) router.push(`/account/messages/${data.thread.id}`);
    } finally {
      setBusy(false);
    }
  }

  const copy = companionCardCopy(profile || {});

  return (
    <div className="lonaliza-web-header-offset mx-auto max-w-lg px-4 pb-24 pt-24">
      <NativeAppBar title={t.appChrome.companionProfile} fallbackHref="/account?tab=buddies" />
      {error || !profile ? (
        <div className="mt-4">
          <EmptyStateCard
            icon={Users}
            title={t.appChrome.companionUnavailable}
            description={t.appChrome.companionUnavailableHint}
          />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-md">
          <div className="flex items-center gap-3">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2E1065] text-xl font-black text-amber-300">
                {copy.title.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black text-[#2E1065]">{copy.title}</h1>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                <MapPin size={12} />
                {copy.subtitle || (isAr ? "عضو مسجّل" : "Registered member")}
              </p>
            </div>
          </div>
          {profile.bio ? <p className="mt-4 text-sm leading-7 text-slate-600">{profile.bio}</p> : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void startChat()}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#7C3AED] text-sm font-black text-white disabled:opacity-40"
          >
            <MessageCircle size={16} />
            {isAr ? "بدء محادثة خاصة" : "Start private chat"}
          </button>
        </div>
      )}
    </div>
  );
}
