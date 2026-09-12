"use client";

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
} from "lucide-react";
import BrandImage from "@/components/branding/BrandImage";
import { useBrandName, useBranding } from "@/components/branding/BrandingProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export const ACCOUNT_TABS = [
  "overview",
  "profile",
  "whatsapp",
  "bookings",
  "upcoming",
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

  const tabLabel: Record<AccountTab, string> = {
    overview: t.account.tabOverview,
    profile: t.account.tabProfile,
    whatsapp: t.account.tabWhatsapp,
    bookings: t.account.tabBookings,
    upcoming: t.account.tabUpcoming,
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

  return (
    <div className="relative min-h-screen bg-slate-100/90 pb-20 pt-28">
      <div className="relative mx-auto max-w-[1720px] w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Luxury Hero Customer Card */}
        <div className="overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-[#1b0833] via-[#240c46] to-[#140626] p-6 text-white shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Customer Avatar & Primary Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl object-cover ring-4 ring-amber-400/40 shadow-xl"
                  />
                ) : (
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#1d0a33] via-[#35145c] to-[#d97706] text-2xl sm:text-3xl font-black text-amber-300 ring-4 ring-amber-400/40 shadow-xl">
                    {initials}
                  </div>
                )}
                <span
                  className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#18082e] text-sm shadow-md ring-2 ring-amber-400/50 select-none"
                  title="شارة رتبة العميل"
                >
                  {tierBadge}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-amber-300">{t.account.hello}</p>
                  <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                    {badgeText}
                  </span>
                </div>
                <h1 className="mt-0.5 text-2xl font-black sm:text-3xl">{userName || t.account.title}</h1>
                <p className="mt-1 text-xs text-purple-200/80 font-mono">{userEmail}</p>
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

        {/* Dashboard Content Layout */}
        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          {/* Responsive Sidebar Navigation */}
          <aside className="lg:sticky lg:top-28 lg:w-72 lg:shrink-0 lg:self-start">
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

              <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
                {ACCOUNT_TABS.map((key) => {
                  const Icon = TAB_ICON[key];
                  const active = tab === key;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => onTabChange(key)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-start text-xs font-bold transition-all",
                          active
                            ? "bg-[#220d3d] text-white shadow-md shadow-purple-950/20 border-s-4 border-amber-400"
                            : "text-slate-600 hover:bg-purple-50/50 hover:text-purple-950"
                        )}
                      >
                        <Icon size={16} className={active ? "text-amber-400" : "text-slate-400"} />
                        <span className="truncate">{tabLabel[key]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Tab Content Body */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
