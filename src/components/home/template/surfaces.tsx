"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ServiceSurfaceKind =
  | "flights"
  | "hotels"
  | "tours"
  | "transfers"
  | "cars"
  | "visa"
  | "offers"
  | "rewards"
  | "destinations"
  | "neutral";

export const SURFACE: Record<
  ServiceSurfaceKind,
  { wash: string; ink: string; accent: string; pattern: string }
> = {
  flights: {
    wash: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    ink: "#1e1b4b",
    accent: "#4338ca",
    pattern: "none",
  },
  hotels: {
    wash: "linear-gradient(180deg, #ffffff 0%, #fdfbf7 100%)",
    ink: "#1e1b4b",
    accent: "#b45309",
    pattern: "none",
  },
  tours: {
    wash: "linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)",
    ink: "#1e1b4b",
    accent: "#2e1065",
    pattern: "none",
  },
  transfers: {
    wash: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    ink: "#1e1b4b",
    accent: "#3b0764",
    pattern: "none",
  },
  cars: {
    wash: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    ink: "#1e1b4b",
    accent: "#2e1065",
    pattern: "none",
  },
  visa: {
    wash: "linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)",
    ink: "#1e1b4b",
    accent: "#4c1d95",
    pattern: "none",
  },
  offers: {
    wash: "linear-gradient(180deg, #ffffff 0%, #fffbfb 100%)",
    ink: "#1e1b4b",
    accent: "#991b1b",
    pattern: "none",
  },
  rewards: {
    wash: "linear-gradient(180deg, #ffffff 0%, #fffdf5 100%)",
    ink: "#1e1b4b",
    accent: "#b45309",
    pattern: "none",
  },
  destinations: {
    wash: "linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)",
    ink: "#1e1b4b",
    accent: "#2e1065",
    pattern: "none",
  },
  neutral: {
    wash: "linear-gradient(180deg, #ffffff 0%, #ffffff 100%)",
    ink: "#1e1b4b",
    accent: "#2e1065",
    pattern: "none",
  },
};

function Motif({ kind }: { kind: ServiceSurfaceKind }) {
  const color = SURFACE[kind].accent;
  switch (kind) {
    case "flights":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <path
            d="M8 34h22l18-12 6 2-10 12 10 4-4 3-12-2-10 8H22l6-8H8z"
            fill={color}
            opacity="0.18"
          />
        </svg>
      );
    case "hotels":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <rect x="12" y="16" width="40" height="36" rx="3" fill={color} opacity="0.14" />
          <rect x="20" y="24" width="8" height="8" fill={color} opacity="0.28" />
          <rect x="36" y="24" width="8" height="8" fill={color} opacity="0.28" />
          <rect x="28" y="40" width="8" height="12" fill={color} opacity="0.22" />
        </svg>
      );
    case "tours":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <path d="M12 44 32 12l20 32H12z" fill={color} opacity="0.14" />
          <circle cx="32" cy="38" r="6" fill={color} opacity="0.22" />
        </svg>
      );
    case "transfers":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <rect x="8" y="26" width="48" height="16" rx="8" fill={color} opacity="0.16" />
          <circle cx="20" cy="44" r="5" fill={color} opacity="0.28" />
          <circle cx="44" cy="44" r="5" fill={color} opacity="0.28" />
        </svg>
      );
    case "cars":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <path d="M10 36h8l6-10h20l8 10h2v10H10V36z" fill={color} opacity="0.16" />
          <circle cx="22" cy="46" r="5" fill={color} opacity="0.3" />
          <circle cx="44" cy="46" r="5" fill={color} opacity="0.3" />
        </svg>
      );
    case "visa":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <rect x="16" y="12" width="32" height="40" rx="4" fill={color} opacity="0.14" />
          <circle cx="32" cy="28" r="7" fill={color} opacity="0.24" />
          <rect x="22" y="40" width="20" height="4" rx="2" fill={color} opacity="0.22" />
        </svg>
      );
    case "offers":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <path d="M18 14h16l12 20-20 16-12-20 4-16z" fill={color} opacity="0.16" />
          <circle cx="26" cy="24" r="4" fill={color} opacity="0.28" />
        </svg>
      );
    case "rewards":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <circle cx="32" cy="32" r="16" fill={color} opacity="0.14" />
          <path d="M32 18v28M22 26h20M22 38h20" stroke={color} strokeWidth="3" opacity="0.28" />
        </svg>
      );
    case "destinations":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <path d="M32 10c8 0 16 8 16 18 0 14-16 26-16 26S16 42 16 28c0-10 8-18 16-18z" fill={color} opacity="0.16" />
          <circle cx="32" cy="28" r="6" fill={color} opacity="0.28" />
        </svg>
      );
    case "neutral":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
          <circle cx="32" cy="32" r="18" fill={color} opacity="0.1" />
        </svg>
      );
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

type ServiceSurfaceProps = {
  kind: ServiceSurfaceKind;
  className?: string;
  children: ReactNode;
  background?: string;
};

export function ServiceSurface({ kind, className, children, background }: ServiceSurfaceProps) {
  const tone = SURFACE[kind];
  const style: CSSProperties = {
    background: background || tone.wash,
    color: "#0f172a",
  };
  return (
    <section
      className={cn("relative overflow-visible py-12 md:py-20", className)}
      style={style}
      data-surface-kind={kind}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{ backgroundImage: tone.pattern }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -end-8 -top-6 h-32 w-32 opacity-15 sm:h-40 sm:w-40"
      >
        <Motif kind={kind} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -start-8 bottom-0 h-24 w-24 rotate-12 opacity-10"
      >
        <Motif kind={kind} />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function serviceTitleClass(kind: ServiceSurfaceKind, extra?: string) {
  return cn(
    "overflow-visible pt-1.5 pb-1 text-3xl font-black leading-[1.4] tracking-normal transition-colors duration-200 hover:brightness-110 md:text-4xl",
    extra
  );
}

export function serviceTitleStyle(kind: ServiceSurfaceKind): CSSProperties {
  return { color: SURFACE[kind]?.ink || "#0f172a" };
}

export function serviceEyebrowClass() {
  return "mb-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.22em] text-purple-700";
}

export function InteractiveHeading({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn(
        "inline-block decoration-[color:var(--brand-primary)] decoration-2 underline-offset-8 transition duration-200 hover:-translate-y-0.5 hover:underline",
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
