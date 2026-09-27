"use client";

import { Plug } from "lucide-react";
import ProvidersHub from "@/components/admin/providers/ProvidersHub";

export default function AdminProvidersPage() {
  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <div className="flex items-start gap-3">
        <span className="size-11 rounded-2xl border border-admin-border-subtle bg-white/[0.04] flex items-center justify-center text-amber-400 shrink-0">
          <Plug size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">مزودو البحث والحجز</h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            طيران، فنادق، سيارات، وترانسفير — كل مزود بطاقة مستقلة. الجديد «قريباً» ومتوقف حتى يكتمل التكامل.
          </p>
        </div>
      </div>
      <ProvidersHub />
    </div>
  );
}
