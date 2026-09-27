"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { cn } from "@/lib/utils";
import { PUBLISH_SUBNAV } from "./constants";

export function PublishShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminPage>
      <AdminPageHeader
        title={title}
        description={description}
        icon={<CalendarDays className="size-5 text-[color:var(--admin-gold)] dark:text-[color:var(--admin-text-muted)]" />}
        actions={actions}
      />

      <nav
        className="mb-5 flex flex-wrap gap-1.5 rounded-2xl border border-admin-border-subtle bg-admin-bg-surface p-1.5"
        aria-label="أقسام محرك النشر"
      >
        {PUBLISH_SUBNAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "admin-tap rounded-xl px-3 py-2 text-xs font-bold transition-colors",
                active
                  ? "bg-admin-accent text-admin-accent-foreground shadow-xs"
                  : "text-admin-text-muted hover:bg-admin-accent-soft hover:text-admin-accent"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div dir="rtl">{children}</div>
    </AdminPage>
  );
}
