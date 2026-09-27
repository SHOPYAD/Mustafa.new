"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminSegmentOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  disabled?: boolean;
};

/**
 * Unified admin segmented control — purple active + white text, amber hover.
 * All provider mode toggles and similar controls must use this (not ad-hoc Tailwind).
 */
export function AdminSegment<T extends string>({
  value,
  options,
  onChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  value: T;
  options: AdminSegmentOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      className={cn("admin-segment", disabled && "pointer-events-none opacity-50", className)}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled || option.disabled}
            data-active={active ? "true" : "false"}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className="admin-segment__item"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
