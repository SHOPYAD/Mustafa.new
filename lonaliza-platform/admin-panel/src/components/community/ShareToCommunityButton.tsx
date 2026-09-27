"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, Sparkles, Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export interface ShareableCommunityService {
  id: string;
  type: "package" | "hotel" | "flight" | "car" | "tour" | string;
  typeLabel?: string;
  title: string;
  destination?: string;
  price?: number | string;
  currency?: string;
  imageUrl?: string;
  url?: string;
}

interface ShareToCommunityButtonProps {
  service: ShareableCommunityService;
  variant?: "icon" | "button" | "pill";
  label?: string;
  className?: string;
}

export function ShareToCommunityButton({
  service,
  variant = "button",
  label,
  className = "",
}: ShareToCommunityButtonProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [shared, setShared] = useState(false);

  const defaultLabel =
    locale === "ar"
      ? "مشاركة"
      : locale === "tr"
      ? "Paylaş"
      : locale === "fr"
      ? "Partager"
      : "Share";

  const effectiveLabel = label || defaultLabel;

  const loadingText =
    locale === "ar"
      ? "جاري النقل..."
      : locale === "tr"
      ? "Aktarılıyor..."
      : locale === "fr"
      ? "Transfert..."
      : "Sharing...";

  const tooltipText =
    locale === "ar"
      ? "مشاركة هذه الخدمة في مجتمع لوناليزا"
      : locale === "tr"
      ? "Lonaliza Topluluğunda Paylaş"
      : locale === "fr"
      ? "Partager dans la communauté Lonaliza"
      : "Share to Lonaliza Community";

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingCommunityShare", JSON.stringify(service));
      }
    } catch {}

    setShared(true);
    setTimeout(() => {
      const q = new URLSearchParams({
        shareService: "1",
        id: service.id,
        type: service.type,
        title: service.title,
        dest: service.destination || "",
        price: String(service.price || ""),
        currency: service.currency || "USD",
        img: service.imageUrl || "",
        url: service.url || "",
      });
      router.push(`/community?${q.toString()}`);
    }, 250);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleShare}
        title={tooltipText}
        className={`p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-xs backdrop-blur-xs transition-all active:scale-95 cursor-pointer ${className}`}
      >
        {shared ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Share2 className="h-4 w-4 text-amber-600" />
        )}
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 text-xs font-bold transition-all active:scale-95 cursor-pointer ${className}`}
      >
        {shared ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{effectiveLabel}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-xs border border-amber-300/40 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer ${className}`}
    >
      {shared ? (
        <>
          <Check className="h-3.5 w-3.5 text-slate-950" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5 text-slate-950" />
          <span>{effectiveLabel}</span>
        </>
      )}
    </button>
  );
}
