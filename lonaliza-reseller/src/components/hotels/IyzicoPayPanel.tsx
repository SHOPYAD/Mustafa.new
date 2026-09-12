"use client";

import { useEffect, useRef } from "react";
import { Lock, ShieldCheck } from "lucide-react";

type Props = {
  amountLabel: string;
  secureNote: string;
  otpNote: string;
  acceptedLabel: string;
  checkoutHtml?: string;
};

function IyzicoWordmark() {
  return (
    <svg viewBox="0 0 132 28" className="h-7 w-auto" role="img" aria-label="iyzico">
      <text
        x="0"
        y="21"
        fill="#1E64FF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="22"
        letterSpacing="-0.6"
      >
        iyzico
      </text>
    </svg>
  );
}

function VisaMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-9" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text x="8" y="21" fill="#fff" fontFamily="Arial" fontWeight="800" fontSize="13">
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-9" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="20" cy="16" r="8" fill="#EB001B" />
      <circle cx="28" cy="16" r="8" fill="#F79E1B" />
    </svg>
  );
}

function TroyMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-9" aria-label="Troy">
      <rect width="48" height="32" rx="4" fill="#00A3E0" />
      <text x="7" y="21" fill="#fff" fontFamily="Arial" fontWeight="800" fontSize="12">
        TROY
      </text>
    </svg>
  );
}

function AmexMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-9" aria-label="American Express">
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <text x="6" y="20" fill="#fff" fontFamily="Arial" fontWeight="800" fontSize="9">
        AMEX
      </text>
    </svg>
  );
}

function DiscoverMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-9" aria-label="Discover">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#E5E7EB" />
      <text x="3" y="20" fill="#F76B1C" fontFamily="Arial" fontWeight="800" fontSize="8">
        DISCOVER
      </text>
    </svg>
  );
}

export function IyzicoSecureFrame({
  html,
  title,
  hostedNote,
  onClose,
  closeLabel,
  logoSrc,
}: {
  html: string;
  title: string;
  hostedNote: string;
  onClose: () => void;
  closeLabel: string;
  logoSrc?: string;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#051741]/70 p-3">
      <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 bg-[#051741] px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc || "/logo.png"} alt="" className="h-8 w-auto" />
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-sm font-bold">
                <Lock size={14} /> {title}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-xs font-semibold text-white/70">
            {closeLabel}
          </button>
        </div>
        <div className="alrayyan-scroll min-h-[420px] overflow-y-auto bg-white p-2">
          <IyzicoCheckoutEmbed html={html} />
        </div>
        <p className="border-t px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">{hostedNote}</p>
      </div>
    </div>
  );
}

export function IyzicoCheckoutEmbed({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || !html) return;
    host.innerHTML = html;
    const scripts = Array.from(host.querySelectorAll("script"));
    for (const old of scripts) {
      const next = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        next.setAttribute(attr.name, attr.value);
      }
      next.text = old.textContent || "";
      old.parentNode?.replaceChild(next, old);
    }
    return () => {
      host.innerHTML = "";
    };
  }, [html]);

  return <div ref={ref} className="min-h-[380px] overflow-hidden rounded-xl bg-white" />;
}

export default function IyzicoPayPanel({
  amountLabel,
  secureNote,
  otpNote,
  acceptedLabel,
  checkoutHtml,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dbe4ff] bg-gradient-to-b from-[#f4f7ff] to-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#dbe4ff] px-4 py-3">
        <IyzicoWordmark />
        <span className="inline-flex items-center gap-1 rounded-full bg-[#1E64FF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#1E64FF]">
          <Lock size={12} /> 3D Secure
        </span>
      </div>
      <div className="space-y-3 px-4 py-4">
        <p className="text-sm font-bold text-[#102033]">{amountLabel}</p>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {acceptedLabel}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <VisaMark />
            <MastercardMark />
            <TroyMark />
            <AmexMark />
            <DiscoverMark />
          </div>
        </div>
        <p className="inline-flex items-start gap-2 text-xs leading-relaxed text-slate-600">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#1E64FF]" />
          {secureNote}
        </p>
        <p className="rounded-xl bg-[#1E64FF]/8 px-3 py-2 text-xs font-medium leading-relaxed text-[#163a8a]">
          {otpNote}
        </p>
        {checkoutHtml ? <IyzicoCheckoutEmbed html={checkoutHtml} /> : null}
      </div>
    </div>
  );
}
