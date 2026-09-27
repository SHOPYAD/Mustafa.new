"use client";

import React, { useState } from "react";
import {
  Play,
  TrendingUp,
  Percent,
  Palette,
  Sparkles,
  CheckCircle2,
  Loader2,
  Terminal,
  Plus,
} from "lucide-react";

export interface MacroSkill {
  id: string;
  name: string;
  command: string;
  description: string;
  model: string;
  icon: "zap" | "ledger" | "margin" | "palette";
  color: string;
}

const SKILLS_DECK: MacroSkill[] = [
  {
    id: "pkfare-margin-18",
    name: "/قفل_هامش_الطيران_18",
    command: "/قفل_هامش_الطيران_18",
    description: "تدقيق مقاعد GDS وقفل هامش الربح الإجباري +18% لكافة التذاكر",
    model: "GEMINI 2.0 FLASH",
    icon: "margin",
    color: "#00e5ff",
  },
  {
    id: "hotel-sync-140",
    name: "/مزامنة_الفنادق_الحية",
    command: "/مزامنة_الفنادق_الحية",
    description: "جلب 140 فندقاً حياً من Travelport و Hotelbeds وتطبيق هامش +15%",
    model: "CLAUDE 3.5 SONNET",
    icon: "zap",
    color: "#10b981",
  },
  {
    id: "flightradar-vito-dispatch",
    name: "/جدولة_مرسيدس_فيتو",
    command: "/جدولة_مرسيدس_فيتو",
    description: "ربط تأخيرات مطارات IST و TZX وإعادة جدولة أسطول فيتو VIP آلياً",
    model: "AUTONOMOUS AGENT",
    icon: "palette",
    color: "#f59e0b",
  },
  {
    id: "b2b-deposit-audit",
    name: "/مطابقة_حوالات_b2b",
    command: "/مطابقة_حوالات_b2b",
    description: "التدقيق الآلي لإشعارات البنوك وشحن محافظ وكالات السفر الشريكة",
    model: "SUPERVISOR SWARM",
    icon: "ledger",
    color: "#ec4899",
  },
];

interface SkillsDeckWidgetProps {
  onExecuteSkill?: (skill: MacroSkill) => void;
  isExecuting?: boolean;
}

export default function SkillsDeckWidget({
  onExecuteSkill,
  isExecuting = false,
}: SkillsDeckWidgetProps) {
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [lastExecution, setLastExecution] = useState<string>(
    "آخر العمليات المنفذة: 04:02 /قفل_هامش_الطيران_18 - ناجح"
  );

  const handleClick = (skill: MacroSkill) => {
    setActiveSkillId(skill.id);
    const now = new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
    setLastExecution(`آخر العمليات المنفذة: ${now} ${skill.command} - ناجح`);
    if (onExecuteSkill) {
      onExecuteSkill(skill);
    }
    setTimeout(() => {
      setActiveSkillId(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl border border-cyan-500/25 bg-[#030914]/90 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.08)] w-full text-slate-200 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-black flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>حزمة المهارات (SKILLS DECK)</span>
          </span>
          <span className="text-[10px] text-slate-400">· 18 مهارة</span>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/40 transition-colors"
        >
          <Plus size={10} />
          <span>إضافة مهارة</span>
        </button>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2">
        {SKILLS_DECK.map((skill) => {
          const isCurrent = activeSkillId === skill.id;
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => handleClick(skill)}
              disabled={isExecuting}
              className={`relative p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between text-left group select-none min-h-[76px] ${
                isCurrent
                  ? "border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  : "border-slate-800/90 bg-[#041224]/80 hover:border-cyan-500/60 hover:bg-[#061833]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {skill.name}
                </span>
                <div className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                  {isCurrent ? (
                    <Loader2 size={11} className="animate-spin text-cyan-400" />
                  ) : (
                    <Play size={10} className="fill-cyan-400 text-cyan-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between w-full text-[9px] text-slate-400 mt-2">
                <span>{skill.model}</span>
                <span className="text-cyan-400 font-bold uppercase">[تشغيل]</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Execution Trace Footer */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="truncate">{lastExecution}</span>
        <span className="text-cyan-500 font-bold shrink-0">· OK</span>
      </div>
    </div>
  );
}
