"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type EnterpriseBadgeVariant =
  | "success"
  | "active"
  | "confirmed"
  | "pending"
  | "processing"
  | "warning"
  | "danger"
  | "failed"
  | "cancelled"
  | "royal"
  | "ai"
  | "syncing"
  | "info"
  | "neutral"
  | "inactive";

interface EnterpriseStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: EnterpriseBadgeVariant;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<
  EnterpriseBadgeVariant,
  {
    container: string;
    dot: string;
    dotPulse?: string;
  }
> = {
  success: {
    container: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-500",
    dotPulse: "bg-emerald-400",
  },
  active: {
    container: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-500",
    dotPulse: "bg-emerald-400",
  },
  confirmed: {
    container: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-500",
    dotPulse: "bg-emerald-400",
  },
  pending: {
    container: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dot: "bg-amber-500",
    dotPulse: "bg-amber-400",
  },
  processing: {
    container: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dot: "bg-amber-500",
    dotPulse: "bg-amber-400",
  },
  warning: {
    container: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dot: "bg-amber-500",
  },
  danger: {
    container: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    dot: "bg-rose-500",
  },
  failed: {
    container: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    dot: "bg-rose-500",
  },
  cancelled: {
    container: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    dot: "bg-rose-500",
  },
  royal: {
    container: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30",
    dot: "bg-purple-500",
    dotPulse: "bg-purple-400",
  },
  ai: {
    container: "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
    dotPulse: "bg-violet-300",
  },
  syncing: {
    container: "bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/25",
    dot: "bg-purple-500",
    dotPulse: "bg-purple-400",
  },
  info: {
    container: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    dot: "bg-sky-500",
  },
  neutral: {
    container: "bg-muted/60 text-muted-foreground border-border/50",
    dot: "bg-muted-foreground/60",
  },
  inactive: {
    container: "bg-muted/40 text-muted-foreground/80 border-border/30",
    dot: "bg-muted-foreground/40",
  },
};

const sizeStyles = {
  sm: "text-[11px] px-2 py-0.5 gap-1.5",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

export function EnterpriseStatusBadge({
  variant = "neutral",
  label,
  icon,
  pulse = false,
  size = "md",
  className,
  children,
  ...props
}: EnterpriseStatusBadgeProps) {
  const currentVariant = variantStyles[variant] || variantStyles.neutral;
  const content = label || children;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-all duration-150 backdrop-blur-md select-none tracking-tight",
        currentVariant.container,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon ? (
        <span className="shrink-0 flex items-center">
          {React.isValidElement(icon)
            ? icon
            : typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)
              ? React.createElement(icon as React.ComponentType<{ className?: string }>, { className: "size-3.5" })
              : null}
        </span>
      ) : (
        <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
          {(pulse || currentVariant.dotPulse) && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                currentVariant.dotPulse || currentVariant.dot
              )}
            />
          )}
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", currentVariant.dot)} />
        </span>
      )}
      {content && <span className="truncate">{content}</span>}
    </span>
  );
}
