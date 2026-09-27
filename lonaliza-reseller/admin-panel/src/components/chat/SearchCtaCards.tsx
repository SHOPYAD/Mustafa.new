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
      ? {
          href: hotelsHref,
          label: t.nav.hotels,
          icon: Hotel,
          tone: "from-amber-600/25 to-stone-950/80 border-amber-400/25 text-amber-50",
        }
      : null,
    flightHref
      ? {
          href: flightHref,
          label: t.chat.bestFlightDeals,
          icon: Plane,
          tone: "from-sky-600/30 to-blue-950/80 border-sky-400/30 text-sky-100",
        }
      : null,
    transferHref
      ? {
          href: transferHref,
          label: t.chat.bestTransferDeals,
          icon: Car,
          tone: "from-amber-600/25 to-stone-950/80 border-amber-400/25 text-amber-50",
        }
      : null,
    carsHref
      ? {
          href: carsHref,
          label: t.chat.bestCarDeals,
          icon: CarFront,
          tone: "from-emerald-600/25 to-slate-950/80 border-emerald-400/25 text-emerald-50",
        }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    icon: typeof Plane;
    tone: string;
  }[];

  return (
    <div className={cn("mt-3 grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-gradient-to-br px-3 py-2.5 text-sm font-semibold shadow-md transition hover:scale-[1.02]",
              item.tone
            )}
          >
            <Icon size={16} className="shrink-0" />
            <span className="leading-snug">{item.label}</span>
          </Link>
        );
      })}
      <p className="sm:col-span-3 text-[11px] text-white/35">
        {t.chat.livePricesHint}
      </p>
    </div>
  );
}
