"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type InfiniteSliderProps = {
  children: ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

type TrackStyle = CSSProperties & {
  "--partner-marquee-duration": string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const trackStyle: TrackStyle = {
    "--partner-marquee-duration": `${duration}s`,
    animationDirection: reverse ? "reverse" : "normal",
  };

  return (
    <div className={cn("partner-marquee overflow-hidden", className)} dir="ltr">
      <div className="partner-marquee-track flex w-max min-w-full flex-row" style={trackStyle}>
        <div
          className="flex shrink-0 flex-row items-center"
          style={{ gap: `${gap}px`, paddingInlineEnd: `${gap}px` }}
        >
          {children}
        </div>
        <div
          className="flex shrink-0 flex-row items-center"
          style={{ gap: `${gap}px`, paddingInlineEnd: `${gap}px` }}
          aria-hidden
        >
          {children}
        </div>
      </div>
    </div>
  );
}
