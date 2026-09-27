"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/**
 * Full-width admin page body. Never center-constrain the main column.
 * Mobile: 16px gutters come from admin-main. Desktop: fills the main area.
 */
export function AdminPage({
  children,
  className,
  dir,
  ...props
}: {
  children: ReactNode;
  className?: string;
  dir?: "rtl" | "ltr";
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("admin-page w-full max-w-none min-w-0", className)} dir={dir} {...props}>
      {children}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  icon,
  actions,
  breadcrumb,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 border-b border-border pb-5",
        className
      )}
    >
      {breadcrumb ? (
        <nav
          aria-label="breadcrumb"
          className="text-xs font-medium text-muted-foreground"
        >
          {breadcrumb}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary text-primary-foreground">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              {title}
            </h1>
            {description ? (
              <div className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
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

/** Surface card used for tables, lists, and form modules. */
export function AdminModule({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("px-4", className)}>
      {children}
    </Card>
  );
}

/** Filter / search / tab strip under the page header. */
export function AdminToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-wrap items-center gap-3 px-4 py-3", className)}>
      {children}
    </Card>
  );
}

export function AdminKpiStrip({
  children,
  cols = 4,
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 5;
  className?: string;
}) {
  return (
    <div
      className={cn("admin-kpi-strip", className)}
      style={{ ["--admin-kpi-cols" as string]: String(cols) }}
    >
      {children}
    </div>
  );
}

export function AdminKpi({
  label,
  value,
  hint,
  icon,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="admin-kpi">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[color:var(--admin-text-muted)]">
          {label}
        </p>
        {icon ? <span className="admin-kpi-icon">{icon}</span> : null}
      </div>
      <p className="admin-kpi-value">{value}</p>
      {hint ? (
        <p className="text-[11px] text-[color:var(--admin-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function AdminEmpty({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      {icon ? <div className="admin-empty__icon">{icon}</div> : null}
      <p className="text-base font-bold text-[color:var(--admin-text-primary)]">{title}</p>
      {hint ? (
        <p className="mt-1 text-sm text-[color:var(--admin-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
