"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { buildSettingsHub } from "@/components/admin/admin-nav";
import NavVisibilityPanel from "@/components/admin/NavVisibilityPanel";

export default function AdminSettingsHubPage() {
  const { t } = useLocale();
  const groups = buildSettingsHub(t.admin);

  return (
    <div className="admin-page flex w-full max-w-none min-w-0 flex-col gap-8">
      <div className="flex items-start gap-4">
        <span className='size-11 rounded-2xl border border-border bg-primary/10 flex items-center justify-center text-primary flex-shrink-0'>
          <Settings size={20} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className='text-2xl font-bold text-foreground tracking-tight'>{t.admin.settings}</h1>
          <p className='text-sm text-muted-foreground leading-relaxed'>{t.admin.settingsSubtitle}</p>
        </div>
      </div>

      {/* System Telemetry & Engine Status */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">منصة التشغيل والبيئة</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Next.js 15</span>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-foreground">محرك Node.js & React 19</p>
          <p className="text-[11px] text-muted-foreground">توجيه التطبيق وإجراءات الخادم السريعة</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">قاعدة البيانات المركزية</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">متصل</span>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-foreground font-mono">PocketBase v0.25</p>
          <p className="text-[11px] text-muted-foreground">محرك SQLite WAL بأقل زمن استجابة</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">اللغات والتوطين</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">3 لغات</span>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-foreground">عربي · English · Türkçe</p>
          <p className="text-[11px] text-muted-foreground">تخطيط ثنائي الاتجاه RTL و LTR بالكامل</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">الأمان والصلاحيات RBAC</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">محمي</span>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-foreground">جلسات المشرفين المشفرة</p>
          <p className="text-[11px] text-muted-foreground">كوكيز HttpOnly وجدار حماية JWT</p>
        </div>
      </div>

      <NavVisibilityPanel compact />

      {groups.map((group) => (
        <section key={group.id} className="flex flex-col gap-3">
          <h2 className='text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground px-0.5'>
            {group.label}
          </h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {group.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className='group rounded-2xl border border-border bg-card p-4 flex items-start gap-3 transition-all hover:bg-muted/40 hover:border-primary/40 shadow-xs hover:shadow-md'
              >
                <span className='size-10 rounded-xl border border-border/80 bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0'>
                  <item.icon size={18} className="stroke-current" />
                </span>
                <span className="flex flex-col gap-1 min-w-0">
                  <span className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>{item.label}</span>
                  {item.description ? (
                    <span className='text-xs text-muted-foreground leading-relaxed'>{item.description}</span>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
