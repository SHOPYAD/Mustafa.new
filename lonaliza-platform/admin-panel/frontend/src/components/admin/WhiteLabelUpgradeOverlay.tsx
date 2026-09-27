"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight, ShieldAlert, Zap } from "lucide-react";

type WhiteLabelUpgradeOverlayProps = {
  moduleName?: string;
  children: React.ReactNode;
};

export default function WhiteLabelUpgradeOverlay({
  moduleName = "هذه الوحدة",
  children,
}: WhiteLabelUpgradeOverlayProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/tenant-plan")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && !data.isOrigin && data.planType === "whitelabel_free") {
          setIsLocked(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Locked Overlay Banner */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-amber-300/80 shadow-lg backdrop-blur-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Lock className="size-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">
                وحدة المخزون اليدوي مقفلة — باقة الوايت ليبل المجانية
              </span>
              <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                White Label Free
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              تتضمن نسختك الحالية تغذية إعادة التوزيع المركزية (طيران وفنادق ومواصلات لوناليزا). لإنشاء وإدارة برامجك
              السياحية وجولاتك وأسطولك الخاص، يرجى الترقية إلى باقة الوايت ليبل الاحترافية ($199/شهر) أو باقة التملك الدائم.
            </p>
          </div>
        </div>

        <Link
          href="/partners/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#1e0a45] hover:to-[#3b1378] text-white text-xs font-black shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Sparkles className="size-4 text-amber-300" />
          <span>ترقية الباقة في بوابة الشركاء</span>
        </Link>
      </div>

      {/* Blurred / Disabled Children Content */}
      <div className="pointer-events-none select-none opacity-40 blur-[1.5px] grayscale-[30%] transition-all">
        {children}
      </div>
    </div>
  );
}
