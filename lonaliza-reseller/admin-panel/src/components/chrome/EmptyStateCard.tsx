import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmptyStateCard({
  icon: Icon = Inbox,
  title,
  description,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-purple-200/80 bg-gradient-to-b from-purple-50/70 via-white to-white px-5 py-10 text-center shadow-sm",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2E1065] text-amber-300 shadow-md ring-2 ring-amber-400/30">
        <Icon size={26} strokeWidth={2.1} />
      </div>
      <p className="text-sm font-black text-[#2E1065]">{title}</p>
      {description ? <p className="max-w-[16rem] text-xs leading-6 text-slate-500">{description}</p> : null}
    </div>
  );
}
