"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { SocialPublishSubnav } from "./SocialPublishSubnav";

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

      <SocialPublishSubnav activeHref={pathname} />

      <div dir="rtl">{children}</div>
    </AdminPage>
  );
}
