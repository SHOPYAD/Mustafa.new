"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Briefcase,
  MessageCircle,
  Plane,
  UserRound,
  Wallet,
  Award,
  Globe,
  Sparkles,
  Phone,
  ReceiptText,
  LayoutDashboard,
  Gift,
  CreditCard,
  Inbox,
  Users,
  Clapperboard,
  Clock3,
  Info,
  Star,
} from "lucide-react";
import BrandImage from "@/components/branding/BrandImage";
import { useBrandName, useBranding } from "@/components/branding/BrandingProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import InAppMessageToast from "@/components/messaging/InAppMessageToast";

export const ACCOUNT_TABS = [
  "overview",
  "profile",
  "whatsapp",
  "bookings",
  "upcoming",
  "reviews",
  "payments",
  "cards",
  "wallet",
  "gifts",
  "affiliate",
  "tiers",
  "moments",
  "buddies",
  "creator",
  "social",
  "messages",
  "chats",
  "programs",
  "about",
] as const;

export type AccountTab = (typeof ACCOUNT_TABS)[number];

type Props = {
  tab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  tierBadge?: string;
  walletBalance?: number;
  loyaltyPoints?: number;
  activeBookingsCount?: number;
  children: React.ReactNode;
  onChatClick?: () => void;
};

const TAB_ICON: Record<AccountTab, typeof UserRound> = {
  overview: LayoutDashboard,
  profile: UserRound,
  whatsapp: Phone,
  bookings: Plane,
  upcoming: Clock3,
  reviews: Star,
  payments: ReceiptText,
  cards: CreditCard,
  wallet: Wallet,
  gifts: Gift,
  affiliate: Briefcase,
  tiers: Award,
  moments: Clapperboard,
  buddies: Users,
  creator: Sparkles,
  social: Globe,
  messages: Inbox,
  chats: MessageCircle,
  programs: Bookmark,
  about: Info,
};

export function isAccountTab(value: string | null): value is AccountTab {
  return ACCOUNT_TABS.includes(value as AccountTab);
}

export default function AccountShell({
  tab,
  onTabChange,
  userName,
  userEmail,
  avatarUrl,
  tierBadge = "🥉",
  walletBalance = 0,
  loyaltyPoints = 0,
  activeBookingsCount = 0,
  children,
  onChatClick,
}: Props) {
  const { t, locale } = useLocale();
  const branding = useBranding();
  const brandName = useBrandName(locale);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let live = true;
    async function loadUnread() {
      try {
        const res = await fetch("/api/account/unread", { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (live && data.ok) setUnreadMessages(Number(data.messages || 0));
      } catch {
        /* ignore */
      }
    }
    void loadUnread();
    const id = window.setInterval(() => void loadUnread(), 12000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, []);

  const tabLabel: Record<AccountTab, string> = {
    overview: t.account.tabOverview,
    profile: t.account.tabProfile,
    whatsapp: t.account.tabWhatsapp,
    bookings: t.account.tabBookings,
    upcoming: t.account.tabUpcoming,
    reviews: t.account.tabReviews,
    payments: t.account.tabPayments,
    cards: t.account.tabCards,
    wallet: t.account.tabWallet,
    gifts: t.account.tabGifts,
    affiliate: t.account.tabAffiliate,
    tiers: t.account.tabTiers,
    moments: t.account.tabMoments,
    buddies: t.account.tabBuddies,
    creator: t.account.tabCreator,
    social: t.account.tabSocial,
    messages: t.account.tabMessages,
    chats: t.account.tabChats,
    programs: t.account.tabPrograms,
    about: t.account.tabAbout,
  };

  const badgeText = t.account.badgePremiumMember;
  const walletLabel = t.account.kpiWalletSub ? t.account.walletBalance : "Wallet";
  const loyaltyLabel = t.account.kpiLoyaltyPoints;
  const bookingsLabel = t.account.kpiBookingsSub || "Active Bookings";

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

  const tabLabelShort: Record<AccountTab, string> = {
    overview: t.account.shortOverview,
    profile: t.account.shortProfile,
    whatsapp: t.account.shortWhatsapp,
    bookings: t.account.shortBookings,
    upcoming: t.account.shortUpcoming,
    reviews: t.account.shortReviews,
    payments: t.account.shortPayments,
    cards: t.account.shortCards,
    wallet: t.account.shortWallet,
    gifts: t.account.shortGifts,
    affiliate: t.account.shortAffiliate,
    tiers: t.account.shortTiers,
    moments: t.account.shortMoments,
    buddies: t.account.shortBuddies,
    creator: t.account.shortCreator,
    social: t.account.shortSocial,
    messages: t.account.shortMessages,
    chats: t.account.shortChats,
    programs: t.account.shortPrograms,
    about: t.account.shortAbout,
  };

  return (
    <div className="relative min-h-screen bg-slate-100/90 pb-20 pt-0 lg:pt-28">
      <InAppMessageToast />
      {/* Account root chrome — no back control on the main tab */}
      <div className="lonaliza-app-bar sticky top-0 z-30 block border-b border-slate-200/80 bg-white/95 shadow-xs backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1b0833] to-[#3b0764] text-amber-400 font-black shadow-xs ring-1 ring-amber-400/30">
              <span className="text-base font-serif">L</span>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black tracking-tight text-[#2e1065]">LONALIZA</span>
              <p className="truncate text-[10px] font-bold text-purple-700">{tabLabelShort[tab]}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-xl border border-amber-300/60 bg-amber-50 px-2 py-1 text-[11px] font-black text-amber-900 shadow-2xs">
              <span>{tierBadge}</span>
              <span>${walletBalance}</span>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-bold text-purple-900 shadow-2xs">
              <Sparkles size={11} className="text-amber-500" />
              <span>{loyaltyPoints} pt</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1720px] w-full px-3 sm:px-6 lg:px-8 xl:px-10 mt-3 lg:mt-0">
        {/* Luxury Hero Customer Card */}
        <div className="overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-[#1b0833] via-[#240c46] to-[#140626] p-5 text-white shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Customer Avatar & Primary Info */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl object-cover ring-4 ring-amber-400/40 shadow-xl"
                  />
                ) : (
                  <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#1d0a33] via-[#35145c] to-[#d97706] text-xl sm:text-3xl font-black text-amber-300 ring-4 ring-amber-400/40 shadow-xl">
                    {initials}
                  </div>
                )}
                <span
                  className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#18082e] text-xs sm:text-sm shadow-md ring-2 ring-amber-400/50 select-none"
                  title="شارة رتبة العميل"
                >
                  {tierBadge}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-amber-300">{t.account.hello}</p>
                  <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-300">
                    {badgeText}
                  </span>
                </div>
                <h1 className="mt-0.5 text-xl font-black sm:text-3xl truncate">{userName || t.account.title}</h1>
                <p className="mt-0.5 text-xs text-purple-200/80 font-mono truncate">{userEmail}</p>
              </div>
            </div>

            {/* Quick KPI Counters & Chat CTA */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-purple-500/30 bg-[#120422]/90 px-3.5 py-2 shadow-inner">
                  <p className="text-[10px] font-bold text-amber-200/80 uppercase">{walletLabel}</p>
                  <p className="text-sm font-black text-amber-400 font-mono">${walletBalance}</p>
                </div>
                <div className="rounded-2xl border border-purple-500/30 bg-[#120422]/90 px-3.5 py-2 shadow-inner">
                  <p className="text-[10px] font-bold text-amber-200/80 uppercase">{loyaltyLabel}</p>
                  <p className="text-sm font-black text-yellow-300 font-mono">{loyaltyPoints}</p>
                </div>
                <div className="hidden sm:block rounded-2xl border border-purple-500/30 bg-[#120422]/90 px-3.5 py-2 shadow-inner">
                  <p className="text-[10px] font-bold text-purple-200/80 uppercase">{bookingsLabel}</p>
                  <p className="text-sm font-black text-purple-300 font-mono">{activeBookingsCount}</p>
                </div>
              </div>

              {onChatClick ? (
                <button
                  type="button"
                  onClick={onChatClick}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 transition-all px-4 py-2.5 text-xs font-black text-[#18082e] shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>{t.account.chatWithAssistant}</span>
                </button>
              ) : (
                <Link
                  href="/ai-chat"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 transition-all px-4 py-2.5 text-xs font-black text-[#18082e] shadow-lg shadow-amber-500/25"
                >
                  <Sparkles size={15} />
                  <span>{t.account.chatWithAssistant}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Native horizontal tabs — short labels, no wrap */}
        <div className="my-3 block w-full lg:hidden">
          <div className="lonaliza-h-scroll py-1" role="tablist" aria-label={t.account.title}>
            {ACCOUNT_TABS.map((key) => {
              const Icon = TAB_ICON[key];
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onTabChange(key)}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-all",
                    active
                      ? "bg-[#2e1065] text-white shadow-md shadow-purple-950/15 ring-2 ring-amber-400"
                      : "border border-slate-200 bg-white text-slate-700"
                  )}
                >
                  <Icon size={14} className={active ? "text-amber-400" : "text-purple-700"} />
                  <span>{tabLabelShort[key]}</span>
                  {key === "messages" && unreadMessages > 0 ? (
                    <span className="ms-0.5 min-w-5 rounded-full bg-amber-400 px-1 text-center text-[10px] font-black text-[#2E1065]">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Content Layout */}
        <div className="mt-4 lg:mt-8 flex flex-col gap-6 lg:flex-row min-w-0 max-w-full">
          {/* Responsive Sidebar Navigation (Desktop only - mobile uses sleek header & slide carousel) */}
          <aside className="hidden lg:block lg:sticky lg:top-28 lg:w-72 lg:shrink-0 lg:self-start">
            <nav
              aria-label={t.account.title}
              className="rounded-3xl border border-slate-200 bg-white p-3.5 shadow-md shadow-purple-950/5 space-y-1"
            >
              <div className="mb-3 flex items-center justify-between rounded-2xl bg-purple-50/70 border border-purple-200/80 px-3.5 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="h-9 w-9 shrink-0 rounded-xl object-cover border border-amber-400/40 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#220d3d] text-xs font-bold text-amber-300">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 truncate">
                    <p className="truncate text-xs font-bold text-slate-900">{userName}</p>
                    <p className="truncate text-[10px] text-purple-700 font-semibold">{tabLabel[tab]}</p>
                  </div>
                </div>
                <span className="text-base select-none">{tierBadge}</span>
              </div>

              {/* Desktop Full Tabs List */}
              <ul className="hidden lg:grid grid-cols-1 gap-1.5">
                {ACCOUNT_TABS.map((key) => {
                  const Icon = TAB_ICON[key];
                  const active = tab === key;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => onTabChange(key)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-start text-xs font-bold transition-all cursor-pointer",
                          active
                            ? "bg-[#220d3d] text-white shadow-md shadow-purple-950/20 border-s-4 border-amber-400"
                            : "text-slate-600 hover:bg-purple-50/50 hover:text-purple-950"
                        )}
                      >
                        <Icon size={16} className={active ? "text-amber-400" : "text-slate-400"} />
                        <span className="truncate">{tabLabel[key]}</span>
                        {key === "messages" && unreadMessages > 0 ? (
                          <span className="ms-auto min-w-5 rounded-full bg-amber-400 px-1 text-center text-[10px] font-black text-[#2E1065]">
                            {unreadMessages > 9 ? "9+" : unreadMessages}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Native App Legal & Settings Section */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-purple-900/60">
                  سياسات ومعلومات التطبيق
                </p>
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href="/privacy?app=1"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-purple-50 hover:text-purple-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">🛡️ سياسة الخصوصية</span>
                    <span className="text-[10px] text-slate-400">←</span>
                  </Link>
                  <Link
                    href="/terms?app=1"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-purple-50 hover:text-purple-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">📜 الشروط والأحكام</span>
                    <span className="text-[10px] text-slate-400">←</span>
                  </Link>
                  <Link
                    href="/gdpr?app=1"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-purple-50 hover:text-purple-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">🇪🇺 الامتثال و GDPR</span>
                    <span className="text-[10px] text-slate-400">←</span>
                  </Link>
                  <Link
                    href="/about?app=1"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-purple-50 hover:text-purple-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">ℹ️ من نحن</span>
                    <span className="text-[10px] text-slate-400">←</span>
                  </Link>
                  <Link
                    href="/contact?app=1"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-purple-50 hover:text-purple-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">📞 الدعم والتواصل</span>
                    <span className="text-[10px] text-slate-400">←</span>
                  </Link>
                </div>
                <div className="pt-2 px-3 flex items-center justify-between text-[10px] font-semibold text-slate-400 border-t border-slate-50">
                  <span>إصدار التطبيق</span>
                  <span className="font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">v1.0.0 Enterprise</span>
                </div>
              </div>
            </nav>
          </aside>

          {/* Tab Content Body */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
