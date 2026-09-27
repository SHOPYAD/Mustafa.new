"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAdminCopilot } from "./AdminCopilotContext";

export function AutomationModeBanner() {
  const { mode } = useAdminCopilot();
  if (mode !== "automation") return null;
  return (
    <div className="border-b border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100">
      <p className="flex items-start gap-1.5">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        <span>
          وضع الأتمتة: ابنِ مسودة عبر proposeAutomation ثم submitForApproval. الكرون لا يُفعَّل قبل الاعتماد.
          الأوامر من تيليغرام: انشر / أطلق / ارفض / عدّل.
        </span>
      </p>
      <Link href="/admin/automation-studio" className="mt-1 inline-block text-amber-200 underline">
        فتح استوديو الأتمتة
      </Link>
    </div>
  );
}
