"use client";

import { CreditCard, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type HotelPaymentChannelFlags = {
  cardEnabled: boolean;
  whatsappEnabled: boolean;
};

export type HotelPaymentChannelCopy = {
  paymentMethods: string;
  payWhatsAppBank: string;
  bankLinkPayment: string;
  cardPaymentAvailable: string;
};

function VisaMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-5 w-8" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text x="8" y="21" fill="#fff" fontFamily="Arial" fontWeight="800" fontSize="13">
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-5 w-8" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="20" cy="16" r="8" fill="#EB001B" />
      <circle cx="28" cy="16" r="8" fill="#F79E1B" />
    </svg>
  );
}

function TroyMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-5 w-8" aria-label="Troy">
      <rect width="48" height="32" rx="4" fill="#00A3E0" />
      <text x="7" y="21" fill="#fff" fontFamily="Arial" fontWeight="800" fontSize="12">
        TROY
      </text>
    </svg>
  );
}

function IyzicoMark() {
  return (
    <svg viewBox="0 0 72 16" className="h-3.5 w-auto" role="img" aria-label="iyzico">
      <text
        x="0"
        y="13"
        fill="#1E64FF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="14"
        letterSpacing="-0.4"
      >
        iyzico
      </text>
    </svg>
  );
}

function CardBadges() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      <VisaMark />
      <MastercardMark />
      <TroyMark />
    </span>
  );
}

function flagsFromConfig(config: HotelPaymentChannelFlags | null | undefined) {
  if (!config) return null;
  const whatsappEnabled = Boolean(config.whatsappEnabled);
  const cardEnabled = Boolean(config.cardEnabled);
  if (!whatsappEnabled && !cardEnabled) return null;
  return { whatsappEnabled, cardEnabled };
}

type Props = {
  channels: HotelPaymentChannelFlags | null | undefined;
  t: HotelPaymentChannelCopy;
  variant?: "section" | "compact";
  className?: string;
};

export default function HotelPaymentChannels({
  channels,
  t,
  variant = "section",
  className,
}: Props) {
  const flags = flagsFromConfig(channels);
  if (!flags) return null;

  switch (variant) {
    case "compact":
      return (
        <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
          {flags.whatsappEnabled ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
              <MessageCircle size={12} className="shrink-0" />
              {t.payWhatsAppBank}
            </span>
          ) : null}
          {flags.cardEnabled ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#eef2ff] px-1.5 py-0.5 text-[10px] font-semibold text-[#1E64FF]">
              <CardBadges />
              <span>{t.cardPaymentAvailable}</span>
              <IyzicoMark />
            </span>
          ) : null}
        </div>
      );
    case "section":
      return (
        <div className={className}>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/70 mb-2">
            {t.paymentMethods}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            {flags.whatsappEnabled ? (
              <div className="flex min-w-0 flex-1 items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-sm text-emerald-950">
                <MessageCircle size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                <div className="min-w-0">
                  <p className="font-semibold">{t.payWhatsAppBank}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-emerald-900/80">{t.bankLinkPayment}</p>
                </div>
              </div>
            ) : null}
            {flags.cardEnabled ? (
              <div className="flex min-w-0 flex-1 items-start gap-2 rounded-xl border border-[#dbe4ff] bg-[#f4f7ff] px-3 py-2.5 text-sm text-[#102033]">
                <CreditCard size={18} className="mt-0.5 shrink-0 text-[#1E64FF]" />
                <div className="min-w-0">
                  <p className="font-semibold">{t.cardPaymentAvailable}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <CardBadges />
                    <IyzicoMark />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      );
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}
