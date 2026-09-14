"use client";

import { useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Coins,
  FileBadge,
  FileText,
  Headphones,
  Languages,
  Plane,
  Route,
  Scale,
  Shield,
  Sparkles,
} from "lucide-react";
import NativeAppBar from "@/components/chrome/NativeAppBar";
import CurrencyPickerSheet from "@/components/mobile/CurrencyPickerSheet";
import LanguagePickerSheet from "@/components/mobile/LanguagePickerSheet";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { withAppParam } from "@/lib/mobile/app-mode";
import { cn } from "@/lib/utils";

const SERVICE_KEYS = [
  { href: "/flights", icon: Plane, key: "flights" as const },
  { href: "/hotels", icon: Building2, key: "hotels" as const },
  { href: "/cars", icon: Car, key: "cars" as const },
  { href: "/transfers", icon: Route, key: "transfers" as const },
  { href: "/holidays", icon: Sparkles, key: "holidays" as const },
  { href: "/visa", icon: FileBadge, key: "visa" as const },
];

export default function AppMenuScreen() {
  const { locale, dir, t } = useLocale();
  const { currency } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const isRtl = dir === "rtl" || locale === "ar";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const services = useMemo(
    () =>
      SERVICE_KEYS.map((item) => ({
        ...item,
        label: t.nav[item.key],
      })),
    [t]
  );

  const helpLinks = [
    {
      href: "/account?tab=chats",
      icon: Headphones,
      label: t.appMenu.supportChat,
    },
    {
      href: "/terms",
      icon: FileText,
      label: t.common.terms,
    },
    {
      href: "/privacy",
      icon: Shield,
      label: t.common.privacy,
    },
    {
      href: "/gdpr",
      icon: Scale,
      label: t.legal.gdprCompliance,
    },
  ];

  return (
    <div dir={dir} className="mx-auto min-h-[70vh] max-w-lg px-4 pb-8 pt-3">
      <NativeAppBar
        title={t.common.menu}
        subtitle={t.nav.more}
        showBack={false}
        embedded
        className="mb-4"
      />

      <section className="mb-5">
        <h2 className="mb-3 px-1 text-[11px] font-black tracking-wider text-slate-400">
          {t.appMenu.services}
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={withAppParam(item.href)}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-purple-100 bg-white px-3 py-3 shadow-sm shadow-purple-950/5 active:scale-[0.99]"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-[#2E1065]">
                  <Icon size={20} strokeWidth={2.2} />
                </span>
                <span className="text-[13px] font-black leading-tight text-slate-900">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setCurrencyOpen(true)}
          className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-start active:bg-slate-50"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
            <Coins size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-black text-slate-900">{t.common.currency}</span>
            <span className="block text-xs font-semibold text-slate-500">{currency.code}</span>
          </span>
          <Chevron size={16} className="text-slate-400" />
        </button>
        <div className="h-px bg-slate-100" />
        <button
          type="button"
          onClick={() => setLanguageOpen(true)}
          className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-start active:bg-slate-50"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-[#2E1065]">
            <Languages size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-black text-slate-900">{t.common.language}</span>
            <span className="block text-xs font-semibold uppercase text-slate-500">{locale}</span>
          </span>
          <Chevron size={16} className="text-slate-400" />
        </button>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <h2 className="px-4 pb-1 pt-3 text-[11px] font-black tracking-wider text-slate-400">
          {t.appMenu.settingsHelp}
        </h2>
        {helpLinks.map((item, index) => {
          const Icon = item.icon as ComponentType<{ size?: number }>;
          return (
            <div key={item.href}>
              {index > 0 ? <div className="h-px bg-slate-100" /> : null}
              <Link
                href={withAppParam(item.href)}
                className={cn(
                  "flex min-h-11 items-center gap-3 px-4 py-3 text-start active:bg-slate-50"
                )}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1 text-[13px] font-bold text-slate-800">{item.label}</span>
                <Chevron size={16} className="text-slate-400" />
              </Link>
            </div>
          );
        })}
      </section>

      <CurrencyPickerSheet open={currencyOpen} onClose={() => setCurrencyOpen(false)} />
      <LanguagePickerSheet open={languageOpen} onClose={() => setLanguageOpen(false)} />
    </div>
  );
}
