"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Full-width admin page body. Never center-constrain the main column.
 * Mobile: 16px gutters come from admin-main. Desktop: fills the main area.
 */
export function AdminPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("admin-page w-full max-w-none min-w-0", className)}>
      {children}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  icon,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-start lg:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className='flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-secondary'>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            {title}
          </h1>
          {description ? (
            <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

/** 12-col settings canvas: 1 col mobile, 2 col tablet, 12-col desktop. */
export function AdminSettingsGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 min-w-0 md:grid-cols-2 xl:grid-cols-12 xl:gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminFieldGrid({
  children,
  cols = 2,
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2",
        cols === 3 && "xl:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminStickySave({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7",
        className
      )}
    >
      {children}
    </div>
  );
}
