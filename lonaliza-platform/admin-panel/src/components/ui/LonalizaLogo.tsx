"use client";

import { cn } from "@/lib/utils";

type LonalizaLogoProps = {
  className?: string;
  variant?: "full" | "icon" | "header" | "large" | "footer";
  href?: string;
  showSubtitle?: boolean;
  isRtl?: boolean;
};

export default function LonalizaLogo({
  className,
  variant = "header",
}: LonalizaLogoProps) {
  const isLarge = variant === "large" || variant === "full";
  const isFooter = variant === "footer";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-transparent.png?v=35"
      alt="LONALIZA — Travel The Smart Way"
      className={cn(
        "w-auto object-contain bg-transparent border-0 shadow-none ring-0 outline-none no-theme-image rounded-none p-0 m-0",
        isLarge
          ? "h-12 sm:h-14 md:h-16 max-w-[320px]"
          : isFooter
          ? "h-10 sm:h-12 max-w-[260px]"
          : "h-9 sm:h-10 md:h-11 max-w-[240px]",
        className
      )}
      style={{
        background: "transparent",
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        outline: "none",
        borderRadius: "0px",
      }}
    />
  );
}
