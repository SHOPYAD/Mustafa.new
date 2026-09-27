"use client";

import { useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type NativeAppBarProps = {
  title?: string;
  subtitle?: string;
  fallbackHref?: string;
  onBack?: () => void;
  trailing?: ReactNode;
  showBack?: boolean;
  /** Transparent bar for dark legal heroes */
  variant?: "light" | "hero";
  /** Render as an in-flow row (no sticky / extra safe-area) */
  embedded?: boolean;
  /** Allow long Arabic titles to wrap instead of truncating */
  titleWrap?: boolean;
  className?: string;
};

export function useRtlNav() {
  const { dir, locale } = useLocale();
  return dir === "rtl" || locale === "ar";
}

export function AppBackButton({
  onClick,
  label,
  variant = "light",
  className,
}: {
  onClick: () => void;
  label?: string;
  variant?: "light" | "hero";
  className?: string;
}) {
  const isRtl = useRtlNav();
  const Icon = isRtl ? ArrowRight : ArrowLeft;
  const { t } = useLocale();
  const fallbackLabel = label || t.common.back;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={fallbackLabel}
      className={cn(
        "inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-2.5 text-sm font-bold transition-colors active:scale-[0.98]",
        variant === "hero"
          ? "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/16"
          : "bg-white text-[#2E1065] ring-1 ring-slate-200 shadow-sm hover:bg-purple-50",
        className
      )}
    >
      <Icon size={18} strokeWidth={2.4} />
    </button>
  );
}

export function useInAppBack(fallbackHref = "/") {
  const router = useRouter();

  return useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [fallbackHref, router]);
}

export default function NativeAppBar({
  title,
  subtitle,
  fallbackHref = "/",
  onBack,
  trailing,
  showBack = true,
  variant = "light",
  embedded = false,
  titleWrap = false,
  className,
}: NativeAppBarProps) {
  const goBack = useInAppBack(fallbackHref);
  const handleBack = onBack || goBack;

  return (
    <header
      className={cn(
        "flex items-start gap-2.5",
        embedded
          ? "px-0 py-1"
          : cn(
              "lonaliza-app-bar sticky top-0 z-40",
              variant === "hero"
                ? "bg-[#18082e]/92 text-white backdrop-blur-md"
                : "border-b border-slate-200/80 bg-white/96 text-slate-900 shadow-xs backdrop-blur-md"
            ),
        !titleWrap && "items-center",
        className
      )}
    >
      {showBack ? <AppBackButton onClick={handleBack} variant={variant} /> : null}
      <div className="min-w-0 flex-1">
        {title ? (
          <h1
            className={cn(
              "text-[15px] font-black leading-[1.35]",
              titleWrap ? "whitespace-normal break-words" : "truncate leading-tight",
              variant === "hero" ? "text-white" : "text-[#2E1065]"
            )}
          >
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p
            className={cn(
              "truncate text-[11px] font-semibold",
              variant === "hero" ? "text-purple-200/80" : "text-slate-500"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
    </header>
  );
}
