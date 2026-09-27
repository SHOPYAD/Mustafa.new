"use client";

import React from "react";
import { AlertCircle, Clock, CheckCircle2, ChevronRight, Activity } from "lucide-react";

interface PipelineAlert {
  id: string;
  time: string;
  title: string;
  category: "flight" | "hotel" | "wallet" | "fleet" | "system";
  isUrgent?: boolean;
}

const REAL_ALERTS: PipelineAlert[] = [
  { id: "alt-1", time: "18:10", title: "رادار الطيران: رحلة IST-TK1820 متأخرة 35 دقيقة — تم ترحيل مرسيدس فيتو", category: "fleet" },
  { id: "alt-2", time: "18:14", title: "مزامنة الفنادق: 140 فندقاً في Travelport تم تدقيق وتثبيت هوامشها +15%", category: "hotel" },
  { id: "alt-3", time: "18:18", title: "محفظة B2B: إيداع بنكي 48,000 ريال لوكالة المسافر الذكي بانتظار الاعتماد", category: "wallet", isUrgent: true },
  { id: "alt-4", time: "18:20", title: "هوتل بيدس: تم تجديد توقيع SHA-256 HMAC اللحظي بنجاح", category: "hotel" },
  { id: "alt-5", time: "18:22", title: "أسطول طرابزون: 18 مركبة فيتو تعمل بنظام التتبع الحي GPS", category: "fleet" },
  { id: "alt-6", time: "18:25", title: "بوابة Iyzico: تم تفعيل التحقق الثلاثي 3DS 2.0 وتحديث كاش الصرف FX", category: "system" },
];

export default function AvisosPipelineWidget() {
  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-2xl border border-cyan-500/25 bg-[#030914]/90 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.08)] w-full text-slate-200 font-mono select-none">
      {/* Card Header (Sovereign Alert Stream) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-black text-cyan-300 tracking-wider">
            9 تنبيهات تشغيلية · 4 في الانتظار
          </span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
          تنبيهات العمليات
        </span>
      </div>

      {/* Alert Stream List */}
      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto scrollbar-cyber pr-1 text-xs">
        {REAL_ALERTS.map((alert) => (
          <div
            key={alert.id}
            className={`p-2 rounded-xl border flex items-start gap-2 text-right transition-colors ${
              alert.isUrgent
                ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                : "border-slate-800/80 bg-[#041224]/60 text-slate-300 hover:border-cyan-500/40 hover:bg-[#061833]"
            }`}
          >
            <span className="text-[10px] text-cyan-400 font-bold shrink-0 pt-0.5">
              {alert.time}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] leading-tight line-clamp-1 block">
                {alert.title}
              </span>
            </div>
            {alert.isUrgent && (
              <span className="px-1.5 py-0.2 rounded text-[8px] bg-amber-500 text-black font-black uppercase shrink-0">
                عاجل
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
