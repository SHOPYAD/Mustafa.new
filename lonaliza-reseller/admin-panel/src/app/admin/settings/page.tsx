"use client";

import Link from "next/link";
import { Settings, Sliders, ShieldCheck, Compass, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { buildSettingsHub } from "@/components/admin/admin-nav";
import NavVisibilityPanel from "@/components/admin/NavVisibilityPanel";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
} from "@/components/admin/enterprise";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function AdminSettingsHubPage() {
  const { t } = useLocale();
  const groups = buildSettingsHub(t.admin);
  const totalUnits = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "إعدادات المنصة الشاملة" },
        ]}
        icon={<Settings className="h-6 w-6 text-primary" />}
        title={t.admin.settings || "مركز إعدادات وتكوين المنصة"}
        subtitle={t.admin.settingsSubtitle || "التحكم بكافة جوانب النظام: الهوية التجارية، بوابات الدفع، خوادم الذكاء الاصطناعي، المزودين، والتخصيص البصري."}
      />

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={3}>
        <EnterpriseKpiCard
          title="مجموعات الضبط الرئيسية"
          value={groups.length}
          subValue="أقسام إدارية متخصصة"
          icon={<Settings className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="الوحدات والإعدادات النشطة"
          value={totalUnits}
          subValue="شاشة تحكم متخصصة"
          icon={<Sliders className="size-5" />}
          color="amber"
        />
        <EnterpriseKpiCard
          title="حالة الجاهزية والتشغيل"
          value="100% جاهز"
          subValue="كافة الموصلات والأنظمة نشطة"
          icon={<ShieldCheck className="size-5" />}
          color="emerald"
        />
      </EnterpriseKpiGrid>

      {/* Navigation Visibility Card */}
      <div className="rounded-2xl border border-border/50 bg-card/70 p-6 backdrop-blur-xl shadow-xs">
        <NavVisibilityPanel compact />
      </div>

      {/* Settings Groups Accordion */}
      <Accordion
        type="multiple"
        defaultValue={groups.map((g) => g.id)}
        className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl px-5 py-2 shadow-xs space-y-2"
      >
        {groups.map((group) => (
          <AccordionItem key={group.id} value={group.id} className="border-border/40">
            <AccordionTrigger className="text-sm font-bold text-foreground hover:text-primary py-4">
              {group.label}
            </AccordionTrigger>
            <AccordionContent className="[&_a]:no-underline pt-1 pb-4">
              <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group flex items-start gap-3.5 rounded-2xl border border-border/50 bg-card/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <item.icon size={18} />
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
