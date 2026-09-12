"use client";

import Link from "next/link";
import {
  Bookmark,
  Briefcase,
  MessageCircle,
  Plane,
  UserRound,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import BrandImage from "@/components/branding/BrandImage";
import { useBrandName, useBranding } from "@/components/branding/BrandingProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export const ACCOUNT_TABS = [
  "profile",
  "chats",
  "programs",
  "bookings",
  "affiliate",
  "wallet",
] as const;

export type AccountTab = (typeof ACCOUNT_TABS)[number];

type Props = {
  tab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
};

const TAB_ICON: Record<AccountTab, typeof UserRound> = {
  profile: UserRound,
  chats: MessageCircle,
  programs: Bookmark,
  bookings: Plane,
  affiliate: Briefcase,
  wallet: Wallet,
};

export function isAccountTab(value: string | null): value is AccountTab {
  return ACCOUNT_TABS.includes(value as AccountTab);
}

export default function AccountShell({
  tab,
  onTabChange,
  userName,
  userEmail,
  children,
}: Props) {
  const { t, locale } = useLocale();
  const branding = useBranding();
  const brandName = useBrandName(locale);

  const tabLabel: Record<AccountTab, string> = {
    profile: t.account.navProfile,
    chats: t.account.navChats,
    programs: t.account.navPrograms,
    bookings: t.account.navBookings,
    affiliate: t.account.navAffiliate,
    wallet: t.account.navWallet,
  };

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="relative min-h-screen bg-slate-50 pb-16 pt-24">
      <div
        className="absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--brand-header) 92%, #0a1628), #0a1628 55%, #064e3b)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/8 p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <BrandImage
                src={branding.logoUrl || "/logo.png"}
                alt={brandName}
                width={72}
                height={72}
                className="h-14 w-14 rounded-2xl bg-white/10 object-contain p-1"
              />
              <div>
                <p className="text-sm text-white/60">{t.account.hello}</p>
                <h1 className="text-2xl font-bold sm:text-3xl">{userName || t.account.title}</h1>
                <p className="mt-1 text-sm text-white/55">{userEmail}</p>
              </div>
            </div>
            <Link
              href="/ai-chat"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30"
            >
              {t.account.chatWithAssistant}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <aside className="lg:sticky lg:top-28 lg:w-72 lg:shrink-0 lg:self-start">
            <nav
              aria-label={t.account.title}
              className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#051741] text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
                  <p className="truncate text-xs text-slate-500">{tabLabel[tab]}</p>
                </div>
              </div>
              <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                {ACCOUNT_TABS.map((key) => {
                  const Icon = TAB_ICON[key];
                  const active = tab === key;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => onTabChange(key)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-start text-sm font-semibold transition",
                          active
                            ? "bg-[#051741] text-white shadow-md"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <Icon size={16} className={active ? "text-emerald-300" : "text-slate-400"} />
                        <span className="truncate">{tabLabel[key]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
