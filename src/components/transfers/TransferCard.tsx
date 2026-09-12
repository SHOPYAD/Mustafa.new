"use client";

import Link from "next/link";
import {
  Users,
  Briefcase,
  Clock,
  ArrowRight,
  Car,
  MessageCircle,
} from "lucide-react";
import type { TransferService } from "@/types/transfer";
import LoyaltyPointsRow from "@/components/loyalty/LoyaltyPointsRow";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent, buildWhatsAppLink, cn } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";

interface TransferCardProps {
  transfer: TransferService;
  compact?: boolean;
}

export default function TransferCard({
  transfer,
  compact = false,
}: TransferCardProps) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const title = tContent(transfer, "title", locale);
  const waMessage =
    locale === "ar" || locale === "tr"
      ? transfer.whatsappMessageAr
      : transfer.whatsappMessageEn;
  const waLink = buildWhatsAppLink(transfer.whatsappNumber, waMessage);

  return (
    <div
      className={cn(
        "group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-950/50 transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-800 flex flex-col",
        compact && "rounded-xl"
      )}
    >
      <Link
        href={
          transfer.type === "vip_tour"
            ? `/vip-tours/${transfer.slug}`
            : `/transfers/${transfer.slug}`
        }
        className={cn(
          "block relative overflow-hidden",
          compact ? "h-36" : "h-48"
        )}
      >
        <SafeImage
          src={
            transfer.images[0] ||
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"
          }
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "text-white font-bold rounded-full shadow-lg",
              compact ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
              transfer.type === "transfer"
                ? "bg-sky-500"
                : "bg-[var(--brand-primary)]"
            )}
          >
            {transfer.type === "transfer"
              ? t.transfers.airportTransfer
              : t.transfers.vipTours}
          </span>
        </div>
        {transfer.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-0.5 bg-[var(--brand-accent)] text-white text-[10px] font-bold rounded-full shadow-sm">
              {t.catalog.featured}
            </span>
          </div>
        )}
        <div
          className={cn(
            "absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 dark:border-slate-800",
            compact ? "px-2.5 py-1" : "px-3 py-1.5"
          )}
        >
          <span
            className={cn(
              "font-bold text-[var(--brand-primary)] dark:text-amber-400",
              compact ? "text-base" : "text-lg"
            )}
          >
            {formatPrice(transfer.price, transfer.currency || "USD")}
          </span>
          {transfer.type === "vip_tour" && (
            <span className="block text-[10px] text-slate-400 dark:text-slate-400">
              {t.catalog.perVehicle}
            </span>
          )}
        </div>
      </Link>

      <div className={cn("flex flex-col flex-1", compact ? "p-3.5" : "p-5")}>
        <LoyaltyPointsRow
          amount={transfer.price}
          currency={transfer.currency || "USD"}
          service="transfers"
          className="mb-2"
        />
        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Car size={14} className="text-[var(--brand-primary)]" />
          <span className="truncate">
            {transfer.vehicleName} ·{" "}
            {transfer.vehicleClass || transfer.vehicleType}
          </span>
        </div>
        <Link
          href={
            transfer.type === "vip_tour"
              ? `/vip-tours/${transfer.slug}`
              : `/transfers/${transfer.slug}`
          }
        >
          <h3
            className={cn(
              "font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[var(--brand-primary)] dark:group-hover:text-amber-400 transition-colors line-clamp-2",
              compact ? "text-base" : "text-lg mb-3"
            )}
          >
            {title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {transfer.seats} {t.transfers.passengers}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={12} />
            {transfer.luggage} {t.transfers.luggagePieces}
          </span>
          {transfer.durationHours != null && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {transfer.durationHours} {t.transfers.hoursUnit}
            </span>
          )}
        </div>

        <div
          className={cn(
            "mt-auto border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2",
            compact ? "pt-2.5" : "pt-3"
          )}
        >
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-purple-950/20 border border-purple-800/30"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={16} className="text-amber-300" />
            WhatsApp
          </a>
          {!compact && (
            <Link
              href={
                transfer.type === "vip_tour"
                  ? `/vip-tours/${transfer.slug}`
                  : `/transfers/${transfer.slug}`
              }
              className="flex items-center justify-between text-sm text-slate-500 hover:text-[var(--brand-primary)] transition-colors"
            >
              <span>{t.transfers.bookNow}</span>
              <div className="w-8 h-8 rounded-full bg-[var(--brand-secondary)] flex items-center justify-center group-hover:bg-[var(--brand-primary)] transition-colors">
                <ArrowRight
                  size={16}
                  className="text-[var(--brand-primary)] group-hover:text-white transition-colors"
                />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
