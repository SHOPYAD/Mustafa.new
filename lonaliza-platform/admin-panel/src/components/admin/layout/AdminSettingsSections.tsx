"use client";

import type { ReactNode } from "react";
import { LayoutGrid } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Settings section nav adapted from 21st.dev Dashboard Configuration:
 * Card chrome + section list, inverted from the demo's max-w-lg mx-auto
 * to a full-width RTL-safe tab strip (mobile scroll, desktop wrap).
 */
export type AdminSectionItem = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
};

export function AdminSettingsSections({
  items,
  activeId,
  onChange,
  title,
  description,
  children,
  className,
}: {
  items: AdminSectionItem[];
  activeId: string;
  onChange: (id: string) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("w-full max-w-none gap-0 py-0 shadow-sm", className)}>
      {(title || description) && (
        <CardHeader className="border-b border-border px-4 py-4 sm:px-6">
          {title ? (
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutGrid className='size-5 shrink-0 text-secondary' />
              {title}
            </CardTitle>
          ) : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      )}

      <div className="border-b border-border px-2 sm:px-4">
        <nav
          className="-mb-px flex gap-1 overflow-x-auto pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="أقسام الإعدادات"
        >
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? 'border-border text-foreground'
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <CardContent className="px-4 py-5 sm:px-6 sm:py-6">{children}</CardContent>
    </Card>
  );
}

export function AdminSettingsPanel({
  title,
  description,
  children,
  className,
  span = 12,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  span?: 5 | 6 | 7 | 12;
}) {
  const spanClass =
    span === 5
      ? "xl:col-span-5"
      : span === 6
        ? "xl:col-span-6"
        : span === 7
          ? "xl:col-span-7"
          : "xl:col-span-12";

  return (
    <Card className={cn("min-w-0 md:col-span-1", spanClass, className)}>
      {(title || description) && (
        <CardHeader>
          {title ? <CardTitle className="text-base">{title}</CardTitle> : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      )}
      <CardContent className={cn(!(title || description) && "pt-0")}>
        {children}
      </CardContent>
    </Card>
  );
}

export function AdminSettingsDivider({ className }: { className?: string }) {
  return <Separator className={cn("my-4", className)} />;
}
