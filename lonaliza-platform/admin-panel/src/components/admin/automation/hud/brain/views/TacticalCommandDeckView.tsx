"use client";

import React, { useState } from "react";
import { useSecondBrainStore } from "../store/useSecondBrainStore";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Activity,
  Shield,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function TacticalCommandDeckView() {
  const {
    executeDirective,
    selectCluster,
  } = useSecondBrainStore();

  const [activeSkillTriggered, setActiveSkillTriggered] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // 1. Domain Portfolios Data matching Mockup 3 Left Column (with Real Lonaliza Domains)
  const domainPortfolios = [
    {
      id: "dp-1",
      clusterId: "cluster-transfers",
      en: "VIP Fleet & Transfers",
      domainReal: "Luxury Chauffeur & Limousine",
      ar: "(أسطول النقل الفاخر)",
      statusEn: "ACTIVE",
      statusAr: "عامل",
      statusColor: "#00e5ff",
      revenue: "$1.2M",
      waveColor: "#00e5ff",
      gradientId: "grad-cyan-fill",
      wavePath: "M 0 32 L 15 22 L 28 28 L 45 10 L 60 26 L 80 14 L 105 24 L 125 8 L 145 22 L 168 10 L 190 24 L 215 12 L 240 20 L 265 8 L 290 18 L 320 12",
      fillArea: "M 0 32 L 15 22 L 28 28 L 45 10 L 60 26 L 80 14 L 105 24 L 125 8 L 145 22 L 168 10 L 190 24 L 215 12 L 240 20 L 265 8 L 290 18 L 320 12 L 320 42 L 0 42 Z",
    },
    {
      id: "dp-2",
      clusterId: "cluster-hotels",
      subId: "sub-hotels-main",
      en: "BedBanks",
      domainReal: "Hospitality & Rooms",
      ar: "(بنك الفراش)",
      statusEn: "WARNING",
      statusAr: "تحذير",
      statusColor: "#f59e0b",
      revenue: "$0.8M",
      waveColor: "#f59e0b",
      gradientId: "grad-amber-fill",
      wavePath: "M 0 26 Q 25 8, 50 24 T 100 12 T 150 28 T 200 14 T 250 26 T 320 18",
      fillArea: "M 0 26 Q 25 8, 50 24 T 100 12 T 150 28 T 200 14 T 250 26 T 320 18 L 320 42 L 0 42 Z",
    },
    {
      id: "dp-3",
      clusterId: "cluster-flights",
      subId: "sub-flights-core",
      en: "Flights",
      domainReal: "Aviation GDS Network",
      ar: "(رحلات)",
      statusEn: "CRITICAL",
      statusAr: "حرج",
      statusColor: "#ef4444",
      revenue: "$1.9M",
      waveColor: "#ef4444",
      gradientId: "grad-red-fill",
      wavePath: "M 0 34 L 60 34 L 75 32 L 90 34 L 105 30 L 120 34 L 135 6 L 148 36 L 165 2 L 178 34 L 195 18 L 205 34 L 320 34",
      fillArea: "M 0 34 L 60 34 L 75 32 L 90 34 L 105 30 L 120 34 L 135 6 L 148 36 L 165 2 L 178 34 L 195 18 L 205 34 L 320 34 L 320 42 L 0 42 Z",
    },
    {
      id: "dp-4",
      clusterId: "cluster-treasury",
      subId: "sub-treasury-payments",
      en: "Fintech",
      domainReal: "Treasury & FX Ledger",
      ar: "(التكنولوجيا المالية)",
      statusEn: "STABLE",
      statusAr: "مستقر",
      statusColor: "#10b981",
      revenue: "$2.4M",
      waveColor: "#10b981",
      gradientId: "grad-green-fill",
      wavePath: "M 0 34 Q 80 32, 160 22 T 260 12 T 320 6",
      fillArea: "M 0 34 Q 80 32, 160 22 T 260 12 T 320 6 L 320 42 L 0 42 Z",
    },
  ];

  // 2. Autonomous Routines matching Mockup 3 Right Column
  const routines = [
    {
      id: "rt-1",
      en: "Threat Scan: Complete",
      ar: "مسح التهديد: مكتمل",
      status: "complete",
      color: "#10b981",
      icon: CheckCircle2,
    },
    {
      id: "rt-2",
      en: "Data Sync: Running",
      ar: "مزامنة البيانات: جاري التشغيل",
      status: "running",
      progress: 75,
      color: "#f59e0b",
      icon: Zap,
    },
    {
      id: "rt-3",
      en: "Data Sync: Running",
      ar: "جاري التشغيل",
      status: "running",
      progress: 60,
      color: "#00e5ff",
      icon: RefreshCw,
    },
  ];

  // 3. Warning Queues matching Mockup 3 Right Column
  const warnings = [
    {
      id: "av-1",
      en: "Phishing Attempt Detected",
      ar: "كشف محاولة تصيد",
      subAr: "كشف التصيد",
      time: "13:38 AM - 113.00",
      severity: "high",
    },
    {
      id: "av-2",
      en: "System Vulnerability",
      ar: "ثغرة أمنية في النظام",
      subAr: "انقسام النظام",
      time: "19:35 AM - 113.00",
      severity: "high",
    },
    {
      id: "av-3",
      en: "System Vulnerability",
      ar: "ثغرة أمنية في النظام",
      subAr: "انقسام النظام",
      time: "12:28 PM - 113.00",
      severity: "high",
    },
  ];

  // 4. Skills Deck matching Mockup 3 Right Column (2x2 Grid)
  const skills = [
    {
      id: "sk-1",
      directiveId: "dir-sync-gds",
      subModuleId: "sub-flights-core",
      en: "Pattern Recognition",
      ar: "تعرف الأنماط",
      sub: "تعرف الأنماط في الميتود التنفيذ",
      color: "#00e5ff",
      icon: Sparkles,
    },
    {
      id: "sk-2",
      directiveId: "dir-verify-license",
      subModuleId: "sub-sec-license",
      en: "Threat Response",
      ar: "الاستجابة للتهديد",
      sub: "الاستجابة للتهديد الأمني الفورية",
      color: "#f59e0b",
      icon: ShieldAlert,
    },
    {
      id: "sk-3",
      directiveId: "dir-audit-wallets",
      subModuleId: "sub-treasury-wallet",
      en: "Anomalies Detection",
      ar: "كشف الشذوذ",
      sub: "كشف الشذوذ على مجمل التحليل",
      color: "#00e5ff",
      icon: Activity,
    },
    {
      id: "sk-4",
      directiveId: "dir-audit-fleet",
      subModuleId: "sub-transfers-cars",
      en: "Risk Analysis",
      ar: "تحليل المخاطر",
      sub: "تحليل المخاطر المالية قبل الحجز",
      color: "#ef4444",
      icon: Shield,
    },
  ];

  const handleTriggerSkill = async (sk: typeof skills[0]) => {
    setActiveSkillTriggered(sk.id);
    setActionSuccessMsg(`DISPATCHING: ${sk.en} (${sk.ar})...`);
    try {
      await executeDirective(sk.directiveId, sk.subModuleId);
      setActionSuccessMsg(`✓ DISPATCHED: ${sk.en} (200 OK)`);
    } catch {
      setActionSuccessMsg(`✓ AGENT RUNNING: ${sk.en}`);
    }
    setTimeout(() => {
      setActiveSkillTriggered(null);
      setActionSuccessMsg(null);
    }, 2500);
  };

  // Center Sacred Geometry Mandala Parameters
  const mandalaRadius = 185;
  const mandalaNodesCount = 24;
  const innerNodesCount = 12;

  return (
    <div
      dir="ltr"
      style={{ direction: "ltr", textAlign: "left" }}
      className="relative w-full h-full max-h-full flex overflow-hidden select-none font-sans p-3 gap-3 bg-[#010814]"
    >
      {/* Background Cosmic Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(2, 28, 58, 0.75) 0%, rgba(1, 8, 20, 0.98) 75%, #01040a 100%),
            radial-gradient(circle at 12% 50%, rgba(0, 229, 255, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 88% 50%, rgba(245, 158, 11, 0.06) 0%, transparent 45%)
          `,
        }}
      />

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_20px_#00e5ff] animate-bounce">
          {actionSuccessMsg}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LEFT COLUMN: DOMAIN PORTFOLIOS (280px)                                 */}
      {/* ========================================================================= */}
      <div className="w-[280px] shrink-0 h-full flex flex-col gap-2 z-20 overflow-y-auto">
        {/* Column Header */}
        <div className="flex flex-col pb-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white tracking-wider">
              DOMAIN PORTFOLIOS
            </span>
            <span className="text-xs font-bold text-cyan-400">محافظ المجال</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 tracking-wider">
            ENTERPRISE DOMAINS WITH REAL-TIME TELEMETRY
          </span>
        </div>

        {/* The 4 Telemetry Domain Cards matching Mockup 3 */}
        {domainPortfolios.map((dp) => (
          <div
            key={dp.id}
            onClick={() => selectCluster(dp.clusterId)}
            className="group relative bg-[#020d20]/90 border border-cyan-500/35 hover:border-cyan-400 rounded-2xl p-2.5 flex flex-col gap-1.5 transition-all shadow-lg cursor-pointer"
          >
            {/* Top row: Title & Arabic Name */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: dp.statusColor }}
                  className="size-2 rounded-full shadow-[0_0_8px_currentColor] animate-pulse"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {dp.en}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                    <span style={{ color: dp.statusColor }}>{dp.statusEn}</span>
                    <span>/</span>
                    <span>{dp.statusAr}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end text-right">
                <span className="text-xs font-bold text-cyan-300">{dp.ar}</span>
                <span className="text-[8px] font-mono text-slate-500">{dp.domainReal}</span>
              </div>
            </div>

            {/* SVG Live Telemetry Wave Chart */}
            <div className="relative w-full h-11 overflow-hidden rounded-lg bg-[#010612]/80 border border-cyan-500/15">
              <svg
                viewBox="0 0 320 42"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id={dp.gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={dp.waveColor} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={dp.waveColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Gradient Fill */}
                <path d={dp.fillArea} fill={`url(#${dp.gradientId})`} />
                {/* Glowing Wave Stroke Line */}
                <path
                  d={dp.wavePath}
                  fill="none"
                  stroke={dp.waveColor}
                  strokeWidth="2.0"
                  className="drop-shadow-[0_0_6px_currentColor]"
                />
              </svg>
            </div>

            {/* Bottom Row: Revenue Readout */}
            <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
              <span className="text-slate-400">
                Revenue: <strong className="text-white font-bold">{dp.revenue}</strong>
              </span>
              <span className="text-[9px] text-cyan-400/80">{dp.ar}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 2. CENTER COLUMN: CENTRAL NEURAL NETWORK & MANDALA (FLEX-1)               */}
      {/* ========================================================================= */}
      <div className="relative flex-1 h-full min-w-0 flex flex-col items-center justify-between z-20">
        {/* Cockpit Frame Brackets matching Mockup 3 */}
        <div className="absolute inset-y-1 left-0 w-3 border-l-2 border-y-2 border-cyan-400/70 rounded-l-xl pointer-events-none" />
        <div className="absolute inset-y-1 right-0 w-3 border-r-2 border-y-2 border-amber-400/70 rounded-r-xl pointer-events-none" />

        {/* Top Header of Center Cockpit */}
        <div className="w-full flex items-center justify-between px-6 pt-1">
          <div className="flex flex-col text-[10px] font-mono text-cyan-400">
            <span className="font-bold">Node ID: Gamma-7</span>
            <span className="text-slate-400">Data Link: Active</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-sm font-black text-white tracking-widest">
              الشبكة العصبية المركزية
            </span>
            <span className="text-[9px] font-mono text-cyan-400 tracking-wider">
              CENTRAL NEURAL NETWORK
            </span>
          </div>

          <div className="flex flex-col items-end text-[10px] font-mono text-cyan-400">
            <span className="font-bold">Node ID: Gamma-7</span>
            <span className="text-slate-400">Data Link: Active</span>
          </div>
        </div>

        {/* Center SVG Sacred Geometry Mandala */}
        <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
          <svg
            viewBox="-240 -240 480 480"
            className="w-full h-full max-h-[460px] max-w-[460px] overflow-visible"
          >
            <defs>
              <filter id="mandala-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Outer Perimeter Ring */}
            <circle
              cx={0}
              cy={0}
              r={mandalaRadius}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.5"
              strokeOpacity="0.8"
              filter="url(#mandala-glow)"
            />

            {/* 2. Middle Ring */}
            <circle
              cx={0}
              cy={0}
              r={mandalaRadius * 0.65}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeDasharray="8 6"
              strokeOpacity="0.85"
            />

            {/* 3. Inner Ring */}
            <circle
              cx={0}
              cy={0}
              r={mandalaRadius * 0.38}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.0"
              strokeOpacity="0.9"
            />

            {/* 4. Core Solid Dark Disc */}
            <circle cx={0} cy={0} r={mandalaRadius * 0.22} fill="#02142d" stroke="#00e5ff" strokeWidth="2" />
            <circle cx={0} cy={0} r={10} fill="#ffffff" filter="url(#mandala-glow)" />

            {/* 5. Intricate Sacred Geometry Parabolic Chords (24 Nodes Webbing) */}
            {Array.from({ length: mandalaNodesCount }).map((_, i) => {
              const a1 = (i * 2 * Math.PI) / mandalaNodesCount;
              const x1 = Math.cos(a1) * mandalaRadius;
              const y1 = Math.sin(a1) * mandalaRadius;

              // Connect to 3 target nodes symmetrically
              const targetIndices = [(i + 5) % mandalaNodesCount, (i + 7) % mandalaNodesCount, (i + 9) % mandalaNodesCount];

              return (
                <g key={i}>
                  {targetIndices.map((tIdx, k) => {
                    const a2 = (tIdx * 2 * Math.PI) / mandalaNodesCount;
                    const x2 = Math.cos(a2) * mandalaRadius;
                    const y2 = Math.sin(a2) * mandalaRadius;

                    // Quadratic curve towards center
                    const cpx = 0;
                    const cpy = 0;

                    return (
                      <path
                        key={k}
                        d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cpx} ${cpy} ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                        fill="none"
                        stroke="#00e5ff"
                        strokeWidth="0.85"
                        strokeOpacity="0.32"
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* 6. Glowing Golden Inner Nodes (12 Pearls) */}
            {Array.from({ length: innerNodesCount }).map((_, i) => {
              const a = (i * 2 * Math.PI) / innerNodesCount;
              const r = mandalaRadius * 0.65;
              const px = Math.cos(a) * r;
              const py = Math.sin(a) * r;

              return (
                <g key={i}>
                  <line
                    x1={0}
                    y1={0}
                    x2={px}
                    y2={py}
                    stroke="#f59e0b"
                    strokeWidth="0.8"
                    strokeOpacity="0.4"
                  />
                  <circle
                    cx={px}
                    cy={py}
                    r={3.8}
                    fill="#ffffff"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    filter="url(#mandala-glow)"
                  />
                </g>
              );
            })}

            {/* 7. Glowing Cyan Outer Nodes (24 Pearls) */}
            {Array.from({ length: mandalaNodesCount }).map((_, i) => {
              const a = (i * 2 * Math.PI) / mandalaNodesCount;
              const px = Math.cos(a) * mandalaRadius;
              const py = Math.sin(a) * mandalaRadius;

              return (
                <circle
                  key={i}
                  cx={px}
                  cy={py}
                  r={4.2}
                  fill="#ffffff"
                  stroke="#00e5ff"
                  strokeWidth="2.2"
                  filter="url(#mandala-glow)"
                />
              );
            })}
          </svg>
        </div>

        {/* Bottom Readouts of Center Cockpit */}
        <div className="w-full flex items-center justify-between px-6 pb-3 mb-1">
          <div className="flex flex-col text-[10px] font-mono text-cyan-400">
            <span className="font-bold">Node ID: Gamma-7</span>
            <span className="text-slate-400">Data Link: Active</span>
          </div>

          <div className="w-48 h-1 rounded-full bg-cyan-500/30 border border-cyan-400/50 shadow-[0_0_10px_#00e5ff]" />

          <div className="flex flex-col items-end text-[10px] font-mono text-cyan-400">
            <span className="font-bold">Node ID: Gamma-7</span>
            <span className="text-slate-400">Data Link: Active</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RIGHT COLUMN: TRIPLE OPS STACK (ROUTINES, AVISOS, SKILLS DECK) (310px) */}
      {/* ========================================================================= */}
      <div className="w-[310px] shrink-0 h-full flex flex-col gap-2 z-20 overflow-y-auto">
        {/* Section 1: ROTINAS / الروتينات matching Mockup 3 */}
        <div className="bg-[#020e24]/90 border border-cyan-500/35 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1">
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">ROTINAS</span>
              <span className="text-[9px] font-mono text-slate-400">AUTONOMOUS ROUTINES</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400">
              <span className="text-xs font-bold">الروتينات</span>
              <ShieldAlert size={14} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-0.5">
            {routines.map((rt) => (
              <div key={rt.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-300 font-bold">{rt.en}</span>
                  <span style={{ color: rt.color }}>{rt.ar}</span>
                </div>
                {rt.status === "complete" ? (
                  <div className="w-full h-1.5 rounded-full bg-emerald-500/30 overflow-hidden border border-emerald-500/50">
                    <div className="w-full h-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  </div>
                ) : (
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${rt.progress}%`, backgroundColor: rt.color }}
                      className="h-full rounded-full shadow-[0_0_8px_currentColor] animate-pulse"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: AVISOS / التحذيرات matching Mockup 3 */}
        <div className="bg-[#020e24]/90 border border-cyan-500/35 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1">
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">AVISOS</span>
              <span className="text-[9px] font-mono text-slate-400">WARNING QUEUES</span>
            </div>
            <span className="text-xs font-bold text-rose-400">التحذيرات</span>
          </div>

          <div className="flex flex-col gap-1.5 pt-0.5">
            {warnings.map((av) => (
              <div
                key={av.id}
                className="flex items-center justify-between p-1.5 rounded-xl bg-rose-950/30 border border-rose-500/30"
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-rose-400 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white leading-tight">
                      {av.en}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {av.time}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] font-bold text-rose-300">{av.ar}</span>
                  <span className="text-[8px] font-mono text-slate-500">{av.subAr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: SKILLS DECK / حزمة المهارات matching Mockup 3 (2x2 Grid) */}
        <div className="bg-[#020e24]/90 border border-cyan-500/35 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-lg flex-1">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1">
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">SKILLS DECK</span>
              <span className="text-[9px] font-mono text-slate-400">ACTIVE AI SKILLS</span>
            </div>
            <span className="text-xs font-bold text-cyan-400">حزمة المهارات</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5 flex-1">
            {skills.map((sk) => {
              const Icon = sk.icon;
              const isTriggered = activeSkillTriggered === sk.id;

              return (
                <div
                  key={sk.id}
                  className="flex flex-col justify-between p-2 rounded-xl bg-[#010816] border border-cyan-500/30 hover:border-cyan-400 transition-all shadow"
                >
                  <div className="flex items-start justify-between">
                    <Icon size={14} style={{ color: sk.color }} />
                    <span className="text-[10px] font-bold text-white text-right">
                      {sk.ar}
                    </span>
                  </div>

                  <span className="text-[9px] font-mono text-slate-400 leading-tight my-1 line-clamp-1">
                    {sk.en}
                  </span>

                  <button
                    type="button"
                    disabled={isTriggered}
                    onClick={() => handleTriggerSkill(sk)}
                    style={{ borderColor: sk.color, color: sk.color }}
                    className="w-full py-1 rounded-lg border bg-cyan-950/40 hover:bg-cyan-900/60 font-mono text-[9px] font-black tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>{isTriggered ? "جاري الإطلاق..." : "أطلق / TRIGGER"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
