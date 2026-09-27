"use client";

import React from "react";
import { Activity, ShieldCheck, CheckCircle2 } from "lucide-react";

interface AgentDot {
  id: string;
  name: string;
  color: string;
  status: "idle" | "active" | "deliberating";
  pulseHz: number;
}

const REAL_12_AGENTS: AgentDot[] = [
  { id: "ui_ux_architect", name: "المصمم المعماري", color: "#ec4899", status: "idle", pulseHz: 2 },
  { id: "reseller_network_director", name: "مدير الموزعين B2B", color: "#8b5cf6", status: "active", pulseHz: 4 },
  { id: "chief_security_auditor", name: "مدقق الحوكمة والأمان", color: "#ef4444", status: "active", pulseHz: 3 },
  { id: "sales", name: "مسؤول المبيعات والحجوزات", color: "#10b981", status: "active", pulseHz: 5 },
  { id: "b2b_landing", name: "منسق بوابات B2B", color: "#38bdf8", status: "idle", pulseHz: 1 },
  { id: "site_advisor", name: "مستشار الوجهات السياحية", color: "#06b6d4", status: "active", pulseHz: 4 },
  { id: "ads", name: "مدير الحملات الإعلانية", color: "#f59e0b", status: "idle", pulseHz: 2 },
  { id: "social", name: "أخصائي شبكات التواصل", color: "#6366f1", status: "idle", pulseHz: 1 },
  { id: "email", name: "محرر المراسلات الرسمية", color: "#14b8a6", status: "idle", pulseHz: 2 },
  { id: "app_concierge", name: "المساعد الشخصي الذكي", color: "#84cc16", status: "active", pulseHz: 4 },
  { id: "app_notifications", name: "بث الإشعارات الفورية", color: "#eab308", status: "idle", pulseHz: 1 },
  { id: "lead_scout", name: "مستكشف الفرص والعملاء", color: "#f97316", status: "active", pulseHz: 5 },
];

export default function AgentDotMatrixWidget() {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-cyan-500/20 bg-[#030914]/85 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.05)] w-full text-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>مصفوفة نشاط الوكلاء النقطية (Dot-Matrix)</span>
        </span>
        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>12 وكيل متصل</span>
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
        {REAL_12_AGENTS.map((agent) => {
          const isActive = agent.status === "active";

          return (
            <div
              key={agent.id}
              className="p-2 rounded-lg border border-slate-800/80 bg-[#050e1c] flex flex-col items-center justify-center text-center gap-1 hover:border-cyan-500/40 transition-all group"
              title={`${agent.name} - تردد المعالجة: ${agent.pulseHz}Hz`}
            >
              {/* Dot LED indicator */}
              <div className="relative flex items-center justify-center">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: agent.color,
                    boxShadow: isActive ? `0 0 8px ${agent.color}` : "none",
                  }}
                />
                {isActive && (
                  <span
                    className="absolute -inset-1 rounded-full animate-ping opacity-60"
                    style={{ backgroundColor: agent.color }}
                  />
                )}
              </div>

              <span className="text-[10px] font-medium text-slate-300 group-hover:text-white truncate w-full">
                {agent.name.split(" ")[0]}
              </span>

              <span className="text-[9px] font-mono text-slate-400">
                {agent.pulseHz} Hz
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
