"use client";

import { CircleAlert, Lightbulb } from "lucide-react";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";

export default function TipsPanel() {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const { trip } = usePlanner();
  if (!trip) return null;
  const tips = locale === "ar" ? trip.tipsAr : trip.tipsEn;
  if (!tips.length) return null;
  return (
    <div className="max-h-56 overflow-y-auto border-b border-[#E4DFF3] bg-white px-3.5 py-3.5">
      <p className="mb-2.5 flex items-center gap-2 text-[13px] font-black text-[#2E1065]">
        <Lightbulb size={16} className="text-[#F59E0B]" />
        {c.tips}
      </p>
      <ul className="space-y-2.5">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-[13px] font-medium leading-6 text-[#4B4568]">
            <CircleAlert size={15} className="mt-1 shrink-0 text-[#7C3AED]" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
