"use client";

import React from "react";
import { Clock, Play, RotateCw, Activity, CheckCircle2 } from "lucide-react";

interface PlatformRoutine {
  id: string;
  time: string;
  name: string;
  command: string;
  status: "ACTIVE" | "IN_QUEUE" | "COMPLETED" | "PAUSED";
}

const REAL_PLATFORM_ROUTINES: PlatformRoutine[] = [
  { id: "rt-1", time: "18:00", name: "تدقيق هوامش الطيران المركزية (+18%)", command: "check-flights-runtime-margins", status: "ACTIVE" },
  { id: "rt-2", time: "19:30", name: "تحديث كاش أسعار الصرف وبوابة Iyzico", command: "sync-iyzico-fx-cache", status: "IN_QUEUE" },
  { id: "rt-3", time: "20:30", name: "رادار رحلات الطيران ومطابقة السائقين", command: "flightradar24-driver-dispatch", status: "IN_QUEUE" },
  { id: "rt-4", time: "22:30", name: "جرد شواغر فنادق Travelport الـ 140", command: "sync-travelport-hotel-catalog", status: "COMPLETED" },
  { id: "rt-5", time: "23:30", name: "تسوية محافظ الشركاء والودائع B2B", command: "b2b-wallet-reconciliation", status: "COMPLETED" },
];

export default function QueueAndRoutinesWidget() {
  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-2xl border border-cyan-500/25 bg-[#030914]/90 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.08)] w-full text-slate-200 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-black">
            جدولة المهام
          </span>
          <span className="text-[10px] text-slate-400">· 137 روتين مؤتمت</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          ONLINE
        </span>
      </div>

      {/* Table Header: TIME | NAME | STATUS */}
      <div className="grid grid-cols-12 gap-1 text-[9px] uppercase font-bold text-slate-500 px-1 py-1 border-b border-slate-800/60 text-right">
        <span className="col-span-2">الوقت</span>
        <span className="col-span-7">اسم الروتين المؤتمت</span>
        <span className="col-span-3 text-left">الحالة</span>
      </div>

      {/* Routines Table Rows */}
      <div className="flex flex-col gap-1 max-h-44 overflow-y-auto scrollbar-cyber pr-0.5 text-xs">
        {REAL_PLATFORM_ROUTINES.map((routine) => {
          let statusBadge = "bg-slate-800/80 text-slate-400 border-slate-700";
          let label = "في الانتظار";
          if (routine.status === "ACTIVE") {
            statusBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold";
            label = "نشط الآن";
          } else if (routine.status === "COMPLETED") {
            statusBadge = "bg-blue-500/15 text-blue-300 border-blue-500/30";
            label = "مكتمل";
          } else if (routine.status === "PAUSED") {
            statusBadge = "bg-rose-500/15 text-rose-300 border-rose-500/30";
            label = "مؤقت";
          }

          return (
            <div
              key={routine.id}
              className="grid grid-cols-12 gap-1 items-center p-1.5 rounded-lg border border-slate-800/60 bg-[#041224]/60 hover:bg-[#061833] transition-colors text-right"
            >
              <span className="col-span-2 text-[10px] text-cyan-400 font-bold">
                {routine.time}
              </span>
              <div className="col-span-7 flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-slate-200 truncate">
                  {routine.name}
                </span>
                <span className="text-[9px] text-slate-500 font-mono truncate">
                  {routine.command}
                </span>
              </div>
              <div className="col-span-3 flex justify-end">
                <span className={`px-1.5 py-0.5 rounded text-[8px] border uppercase ${statusBadge}`}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
        <span>137/0 عملية منفذة اليوم</span>
        <span className="text-cyan-500 font-bold">CORE: LNLZ-NODE-01</span>
      </div>
    </div>
  );
}
