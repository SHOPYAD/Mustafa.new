"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnterpriseModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full";
  className?: string;
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  full: "max-w-[95vw]",
};

export function EnterpriseModal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = "lg",
  className,
}: EnterpriseModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog Window */}
      <div
        className={cn(
          "relative z-10 w-full rounded-2xl border border-border/70 bg-card/95 text-card-foreground shadow-2xl shadow-black/40 backdrop-blur-2xl transition-all duration-200 animate-in zoom-in-95 my-auto max-h-[90vh] flex flex-col",
          maxWidthMap[maxWidth],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors shrink-0"
            title="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border/40 px-5 py-3.5 bg-muted/20 shrink-0 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function EnterpriseSheet({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  side = "right",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "right" | "left";
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed inset-y-0 flex max-w-full pointer-events-none",
          side === "right" ? "right-0" : "left-0"
        )}
      >
        <div
          className={cn(
            "pointer-events-auto w-screen max-w-md md:max-w-lg bg-card/95 border-s border-border/70 backdrop-blur-2xl shadow-2xl flex flex-col transition-all duration-300 animate-in",
            side === "right" ? "slide-in-from-right" : "slide-in-from-left",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors shrink-0"
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border/40 px-5 py-3.5 bg-muted/20 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
