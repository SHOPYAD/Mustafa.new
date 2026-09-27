"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { buildSettingsHub } from "@/components/admin/admin-nav";
import NavVisibilityPanel from "@/components/admin/NavVisibilityPanel";
import { AdminKpi, AdminKpiStrip, AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminSettingsHubPage() {
  const { t } = useLocale();
  const groups = buildSettingsHub(t.admin);

  return (
    <AdminPage className="flex flex-col gap-6">
      <AdminPageHeader
        breadcrumb={
          <span>
            لوحة التحكم <span className="mx-1 opacity-50">/</span> الإعدادات
          </span>
        }
        icon={<Settings className="size-5" />}
        title={t.admin.settings}
        description={t.admin.settingsSubtitle}
      />

      <AdminKpiStrip cols={3}>
        <AdminKpi label="مجموعات الضبط" value={groups.length} />
        <AdminKpi label="الوحدات" value={groups.reduce((n, g) => n + g.items.length, 0)} />
        <AdminKpi label="التنقل" value="حي" />
      </AdminKpiStrip>

      <Card>
        <CardContent>
          <NavVisibilityPanel compact />
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={groups.map((g) => g.id)} className="rounded-xl border border-border bg-card px-4">
        {groups.map((group) => (
          <AccordionItem key={group.id} value={group.id}>
            <AccordionTrigger className="text-sm font-semibold">{group.label}</AccordionTrigger>
            <AccordionContent className="[&_a]:no-underline">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 pb-4">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/40"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <item.icon size={16} />
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-sm font-semibold">{item.label}</span>
                      {item.description ? (
                        <span className="text-xs text-muted-foreground leading-relaxed">{item.description}</span>
                      ) : null}
                    </span>
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </AdminPage>
  );
}
