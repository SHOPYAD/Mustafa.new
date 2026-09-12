"use client";

import { cn } from "@/lib/utils";

type LonalizaLogoProps = {
  className?: string;
  variant?: "full" | "icon" | "header" | "large";
  href?: string;
  showSubtitle?: boolean;
  isRtl?: boolean;
};

export default function LonalizaLogo({
  className,
  variant = "header",
}: LonalizaLogoProps) {
  const isLarge = variant === "large" || variant === "full";

  return (
    <div className={cn("inline-flex items-center select-none", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.svg?v=6"
        alt="LONALIZA — Luxury Travel"
        className={cn(
          "w-auto object-contain transition-transform duration-200 hover:scale-[1.03]",
          isLarge
            ? "h-11 sm:h-12 md:h-13 max-w-[240px]"
            : "h-9 sm:h-10 md:h-11 max-w-[190px]"
        )}
      />
    </div>
  );
}
