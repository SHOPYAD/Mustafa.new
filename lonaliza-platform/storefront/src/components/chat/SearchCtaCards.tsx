"use client";

import Link from "next/link";
import { Car, Plane, CarFront, Hotel } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export type SearchCtas = {
  flightHref?: string;
  transferHref?: string;
  carsHref?: string;
  hotelsHref?: string;
};

export default function SearchCtaCards({
  flightHref,
  transferHref,
  carsHref,
  hotelsHref,
  className,
}: SearchCtas & { className?: string }) {
  const { t } = useLocale();
  if (!flightHref && !transferHref && !carsHref && !hotelsHref) return null;

  const items = [
    hotelsHref
      ? { href: hotelsHref, label: t.nav.hotels, icon: Hotel }
      : null,
    flightHref
      ? { href: flightHref, label: t.chat.bestFlightDeals, icon: Plane }
      : null,
    transferHref
      ? { href: transferHref, label: t.chat.bestTransferDeals, icon: Car }
      : null,
    carsHref
      ? { href: carsHref, label: t.chat.bestCarDeals, icon: CarFront }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    icon: typeof Plane;
  }[];

  return (
    <div className={cn("mt-3 grid w-full gap-2 sm:grid-cols-2", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-white px-3 py-2.5 text-sm font-semibold text-[#2E1065] shadow-sm transition hover:border-[#7C3AED]/40 hover:shadow-md"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4F2FA] text-[#7C3AED]">
              <Icon size={16} />
            </span>
            <span className="leading-snug">{item.label}</span>
          </Link>
        );
      })}
      <p className="text-[11px] font-semibold text-[#4B4568] sm:col-span-2">{t.chat.livePricesHint}</p>
    </div>
  );
}
