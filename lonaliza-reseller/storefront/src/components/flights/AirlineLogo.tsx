"use client";

import { useEffect, useState } from "react";
import { airlineInitials, kiwiAirlineLogoUrl } from "@/lib/airline-logos";
import { cn } from "@/lib/utils";

type Props = {
  code?: string;
  name?: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-11 w-11 text-xs",
  lg: "h-14 w-14 text-sm",
};

export default function AirlineLogo({ code, name, logoUrl, size = "md", className }: Props) {
  const [src, setSrc] = useState(logoUrl || kiwiAirlineLogoUrl(code));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setSrc(logoUrl || kiwiAirlineLogoUrl(code));
  }, [code, logoUrl, name]);

  const box = cn(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm",
    SIZES[size],
    className
  );

  if (!failed && src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={cn(box, "object-contain p-1")}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={cn(box, "bg-[#051741] font-bold text-white")} aria-hidden>
      {airlineInitials(name, code)}
    </div>
  );
}
