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
    wash: "color-mix(in srgb, var(--brand-secondary) 72%, #dbeafe)",
    ink: "#0369a1",
    accent: "#0284c7",
    pattern:
      "radial-gradient(circle at 12% 18%, color-mix(in srgb, #38bdf8 22%, transparent) 0 18%, transparent 19%), radial-gradient(circle at 88% 78%, color-mix(in srgb, var(--brand-primary) 16%, transparent) 0 16%, transparent 17%)",
  },
  hotels: {
    wash: "color-mix(in srgb, var(--brand-secondary) 70%, #fde68a)",
    ink: "#b45309",
    accent: "#d97706",
    pattern:
      "radial-gradient(circle at 80% 12%, color-mix(in srgb, #f59e0b 20%, transparent) 0 16%, transparent 17%), radial-gradient(circle at 8% 86%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0 14%, transparent 15%)",
  },
  tours: {
    wash: "color-mix(in srgb, var(--brand-secondary) 68%, #d1fae5)",
    ink: "#047857",
    accent: "var(--brand-primary)",
    pattern:
      "radial-gradient(circle at 70% 20%, color-mix(in srgb, var(--brand-primary) 20%, transparent) 0 18%, transparent 19%), radial-gradient(circle at 10% 80%, color-mix(in srgb, #34d399 16%, transparent) 0 14%, transparent 15%)",
  },
  transfers: {
    wash: "color-mix(in srgb, var(--brand-secondary) 70%, #ccfbf1)",
    ink: "#0f766e",
    accent: "#0d9488",
    pattern:
      "radial-gradient(circle at 18% 22%, color-mix(in srgb, #2dd4bf 20%, transparent) 0 16%, transparent 17%), radial-gradient(circle at 92% 70%, color-mix(in srgb, var(--brand-primary) 14%, transparent) 0 14%, transparent 15%)",
  },
  cars: {
    wash: "color-mix(in srgb, var(--brand-secondary) 68%, #e0e7ff)",
    ink: "#4338ca",
    accent: "#4f46e5",
    pattern:
      "radial-gradient(circle at 86% 16%, color-mix(in srgb, #818cf8 22%, transparent) 0 18%, transparent 19%), radial-gradient(circle at 12% 88%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0 14%, transparent 15%)",
  },
  visa: {
    wash: "color-mix(in srgb, var(--brand-secondary) 70%, #ede9fe)",
    ink: "#6d28d9",
    accent: "#7c3aed",
    pattern:
      "radial-gradient(circle at 20% 16%, color-mix(in srgb, #a78bfa 20%, transparent) 0 16%, transparent 17%), radial-gradient(circle at 90% 84%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0 14%, transparent 15%)",
  },
  offers: {
    wash: "color-mix(in srgb, var(--brand-secondary) 66%, #ffe4e6)",
    ink: "#be123c",
    accent: "#e11d48",
    pattern:
      "radial-gradient(circle at 14% 20%, color-mix(in srgb, #fb7185 20%, transparent) 0 16%, transparent 17%), radial-gradient(circle at 88% 76%, color-mix(in srgb, var(--brand-primary) 14%, transparent) 0 14%, transparent 15%)",
  },
  rewards: {
    wash: "color-mix(in srgb, var(--brand-secondary) 68%, #fef3c7)",
    ink: "#b45309",
    accent: "var(--brand-primary)",
    pattern:
      "radial-gradient(circle at 78% 18%, color-mix(in srgb, #fbbf24 22%, transparent) 0 16%, transparent 17%), radial-gradient(circle at 10% 82%, color-mix(in srgb, var(--brand-primary) 14%, transparent) 0 14%, transparent 15%)",
  },
  destinations: {
    wash: "color-mix(in srgb, var(--brand-secondary) 74%, #e0f2fe)",
    ink: "var(--brand-accent)",
    accent: "var(--brand-primary)",
    pattern:
      "radial-gradient(circle at 16% 24%, color-mix(in srgb, var(--brand-primary) 16%, transparent) 0 18%, transparent 19%), radial-gradient(circle at 90% 80%, color-mix(in srgb, #38bdf8 14%, transparent) 0 14%, transparent 15%)",
  },
  neutral: {
    wash: "var(--brand-secondary)",
    ink: "var(--brand-accent)",
    accent: "var(--brand-primary)",
    pattern:
      "radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0 16%, transparent 17%)",
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
    background: background || "transparent",
    color: "var(--brand-accent)",
  };
  return (
    <section
      className={cn("relative overflow-hidden py-16 md:py-20", className)}
      style={style}
      data-surface-kind={kind}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-transparent via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{ backgroundImage: tone.pattern }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -end-8 -top-6 h-36 w-36 opacity-70 sm:h-48 sm:w-48"
      >
        <Motif kind={kind} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -start-10 bottom-0 h-28 w-28 rotate-12 opacity-40"
      >
        <Motif kind={kind} />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function serviceTitleClass(kind: ServiceSurfaceKind, extra?: string) {
  return cn(
    "text-3xl font-bold leading-tight md:text-4xl transition-colors duration-200 hover:brightness-110",
    extra
  );
}

export function serviceTitleStyle(kind: ServiceSurfaceKind): CSSProperties {
  return { color: SURFACE[kind].ink };
}

export function serviceEyebrowClass() {
  return "mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-primary)]";
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
