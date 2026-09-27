"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAdminCopilot } from "./AdminCopilotContext";

export function AutomationModeBanner() {
  const { mode } = useAdminCopilot();
  if (mode !== "automation") return null;
  return (
    <div className='border-b border-border/20 bg-secondary/10 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground'>
      <p className="flex items-start gap-1.5">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        <span>
          وضع الأتمتة: ابنِ مسودة عبر proposeAutomation ثم submitForApproval. الكرون لا يُفعَّل قبل الاعتماد.
          الأوامر من تيليغرام: انشر / أطلق / ارفض / عدّل.
        </span>
      </p>
      <Link href="/admin/automation-studio" className='mt-1 inline-block text-muted-foreground underline'>
        فتح استوديو الأتمتة
      </Link>
    </div>
  );
}
