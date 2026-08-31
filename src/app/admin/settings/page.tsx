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
        <span className="size-11 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-amber-400 flex-shrink-0">
          <Settings size={20} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-white tracking-tight">{t.admin.settings}</h1>
          <p className="text-sm text-white/40 leading-relaxed">{t.admin.settingsSubtitle}</p>
        </div>
      </div>

      <NavVisibilityPanel compact />

      {groups.map((group) => (
        <section key={group.id} className="flex flex-col gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/30 px-0.5">
            {group.label}
          </h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {group.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3 transition-colors hover:bg-white/[0.055] hover:border-white/15"
              >
                <span className="size-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-amber-400/80 group-hover:text-amber-400 flex-shrink-0">
                  <item.icon size={16} />
                </span>
                <span className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-semibold text-white/85">{item.label}</span>
                  {item.description ? (
                    <span className="text-xs text-white/35 leading-relaxed">{item.description}</span>
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
