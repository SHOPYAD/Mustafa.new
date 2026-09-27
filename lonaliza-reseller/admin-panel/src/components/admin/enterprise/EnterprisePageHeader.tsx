"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface QuickMetric {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

export interface EnterprisePageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  badge?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  metrics?: QuickMetric[];
  className?: string;
  children?: React.ReactNode;
}

export function EnterprisePageHeader({
  title,
  subtitle,
  description,
  icon,
  badge,
  breadcrumbs,
  actions,
  metrics,
  className,
  children,
}: EnterprisePageHeaderProps) {
  const { dir, locale } = useLocale();
  const isRtl = locale === "ar" || dir === "rtl";
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;
  const subText = subtitle || description;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="size-6" />;
    }
    return null;
  };

  return (
    <div className={cn("relative mb-6 sm:mb-8 space-y-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium overflow-x-auto pb-1 scrollbar-none"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronIcon size={12} className="shrink-0 text-muted-foreground/50" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors shrink-0 truncate max-w-[150px]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn("shrink-0 truncate max-w-[200px]", isLast ? "text-foreground font-semibold" : "")}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left / Title Block */}
        <div className="flex items-start gap-3.5 min-w-0">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-amber-500/10 border border-primary/20 text-primary shadow-sm shadow-primary/5">
              {renderIcon()}
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {subText && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {subText}
              </p>
            )}
          </div>
        </div>

        {/* Right / Actions Block */}
        {(actions || metrics) && (
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 lg:justify-end shrink-0">
            {metrics && metrics.length > 0 && (
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/50 bg-card/60 backdrop-blur-md">
                {metrics.map((metric, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 first:ps-0 last:pe-0 border-r last:border-r-0 border-border/40">
                    <span className="text-xs text-muted-foreground">{metric.label}:</span>
                    <span className="text-xs font-bold tabular-nums text-foreground">{metric.value}</span>
                    {metric.change && (
                      <span
                        className={cn(
                          "text-[10px] font-semibold tabular-nums",
                          metric.isPositive ? "text-emerald-500" : "text-rose-500"
                        )}
                      >
                        {metric.change}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {actions}
          </div>
        )}
      </div>

      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
