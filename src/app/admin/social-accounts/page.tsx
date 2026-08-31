"use client";

import { Suspense } from "react";
import { SocialAccountsPanel } from "@/components/admin/social/SocialAccountsPanel";

export default function AdminSocialAccountsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-white/50">جاري التحميل…</div>}>
      <SocialAccountsPanel />
    </Suspense>
  );
}
