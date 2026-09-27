"use client";

import { Star } from "lucide-react";

type Props = {
  /** Supplier star category; may be fractional (4.5). Anything above 5 is clamped to 5. */
  stars: number | undefined | null;
  size?: number;
  className?: string;
};

/**
 * Hotel star category, capped at 5 with half-star support.
 * Renders nothing when the supplier did not classify the property.
 */
export default function HotelStars({ stars, size = 14, className }: Props) {
  const value = Math.max(0, Math.min(5, Number(stars) || 0));
  if (value <= 0) return null;
  const full = Math.floor(value + 1e-6);
  const half = value - full >= 0.5 ? 1 : 0;
  return (
    <span
      className={`inline-flex items-center gap-px ${className || ""}`}
      aria-label={`${value} stars`}
      title={`${value} ★`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} size={size} className="text-amber-400 fill-amber-400" aria-hidden />
      ))}
      {half ? (
        <span className="relative inline-block" style={{ width: size, height: size }} aria-hidden>
          <Star size={size} className="absolute inset-0 text-amber-400" />
          <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: size / 2 }}>
            <Star size={size} className="text-amber-400 fill-amber-400" />
          </span>
        </span>
      ) : null}
    </span>
  );
}
