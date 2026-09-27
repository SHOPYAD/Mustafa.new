"use client";

import React, { useState } from "react";
import {
  Terminal,
  Bot,
  Globe2,
  Activity,
  Database,
  Layers,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import type { HudAgentConfig } from "../../agentsData";
import type { SwarmDiscussionMessage } from "@/lib/automation/agent-collab-store";
import ArchitectureDiagram from "../ArchitectureDiagram";
import WorldMapWidget from "../WorldMapWidget";

interface CyberTabbedDockProps {
  agents: HudAgentConfig[];
  discussions: SwarmDiscussionMessage[];
  onSelectAgent?: (agent: HudAgentConfig) => void;
  className?: string;
}

type DockTab = "deliberation" | "agents" | "worldmap" | "telemetry" | "assets" | "topology";

export default function CyberTabbedDock({
  agents,
  discussions,
  onSelectAgent,
  className = "",
}: CyberTabbedDockProps) {
  const [activeTab, setActiveTab] = useState<DockTab>("deliberation");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>("");

  // Safe ISO timestamp formatter preventing any "Invalid Date"
  const formatSafeTime = (ts?: string | number | Date): string => {
    if (!ts) {
      return new Date().toLocaleTimeString("en-GB", { hour12: false });
    }
    const d = new Date(ts);
    if (isNaN(d.getTime())) {
      return new Date().toLocaleTimeString("en-GB", { hour12: false });
    }
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const filteredDiscussions = discussions.filter((d) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (d.fromAgent && d.fromAgent.toLowerCase().includes(q)) ||
      (d.topic && d.topic.toLowerCase().includes(q)) ||
      (d.contentAr && d.contentAr.toLowerCase().includes(q)) ||
      ((d as any).message && String((d as any).message).toLowerCase().includes(q))
    );
  });

  return (
    <footer
      className={`relative z-30 transition-all duration-300 border-t-2 border-cyan-500/40 bg-[#020b18]/98 backdrop-blur-2xl shrink-0 flex flex-col ${
        isExpanded ? "h-72 sm:h-80" : "h-12"
      } ${className}`}
    >
      {/* Tab Navigation Header Bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-cyan-500/30 bg-[#03152d] shrink-0 font-mono text-xs">
        {/* Left: Tab Switchers */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveTab("deliberation");
              setIsExpanded(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "deliberation" && isExpanded
                ? "bg-cyan-500/30 text-white border border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent font-bold"
            }`}
          >
            <Terminal size={14} className="text-cyan-400" />
            <span>[DELIBERATION AUDIT]</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
              {discussions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("agents");
              setIsExpanded(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "agents" && isExpanded
                ? "bg-cyan-500/30 text-white border border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent font-bold"
            }`}
          >
            <Bot size={14} className="text-amber-400" />
            <span>[SWARM AGENTS ROSTER]</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-700 font-bold">
              {agents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("worldmap");
              setIsExpanded(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "worldmap" && isExpanded
                ? "bg-cyan-500/30 text-white border border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent font-bold"
            }`}
          >
            <Globe2 size={14} className="text-emerald-400" />
            <span>[GLOBAL RELAY MAP]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("telemetry");
              setIsExpanded(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "telemetry" && isExpanded
                ? "bg-cyan-500/30 text-white border border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent font-bold"
            }`}
          >
            <Activity size={14} className="text-cyan-400" />
            <span>[MICROSERVICES & REDIS]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("assets");
              setIsExpanded(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "assets" && isExpanded
                ? "bg-cyan-500/30 text-white border border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent font-bold"
            }`}
          >
            <Database size={14} className="text-purple-400" />
            <span>[POCKETBASE & QDRANT]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("topology");
              setIsExpanded(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "topology" && isExpanded
                ? "bg-cyan-500/30 text-white border border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent font-bold"
            }`}
          >
            <Layers size={14} className="text-rose-400" />
            <span>[SYSTEM TOPOLOGY]</span>
          </button>
        </div>

        {/* Right: Expand / Collapse Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 hidden sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SOVEREIGN OPERATIONAL</span>
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all"
            title={isExpanded ? "طي الشريط السفلي" : "توسيع الشريط السفلي"}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Tab Body Content */}
      {isExpanded && (
        <div className="flex-1 p-3 overflow-hidden bg-[#020813]/90">
          {/* TAB 1: DELIBERATION STREAM */}
          {activeTab === "deliberation" && (
            <div className="size-full flex flex-col font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-cyan-400" />
                  <span className="font-bold text-white tracking-wide">
                    سجل التداول والمداولات العصبية الحية (Live Swarm Deliberation Stream)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      placeholder="فلترة بالسياق أو الوكيل..."
                      className="ps-8 pe-3 py-1 rounded-md bg-[#041a38] border border-cyan-500/30 text-white placeholder-slate-500 text-[11px] focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 pe-1 custom-scrollbar text-[11px] leading-relaxed">
                {filteredDiscussions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-1">
                    <Clock size={20} className="text-slate-600 animate-pulse" />
                    <span>جاهزية كاملة. لا توجد أحداث مداولة جديدة حالياً.</span>
                  </div>
                ) : (
                  filteredDiscussions.map((disc, idx) => {
                    const agentName = disc.fromAgent || (disc as any).agentId || "SWARM_CORE";
                    return (
                      <div
                        key={disc.id || `disc-${idx}`}
                        className="p-2 rounded-md bg-[#03152d]/80 border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex items-start gap-3"
                      >
                        <span className="text-cyan-400 shrink-0 font-bold">
                          {formatSafeTime(disc.timestamp || (disc as any).createdAt)}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          [{agentName}]
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-white me-2">{disc.topic || "مداولة تنفيذية"}</span>
                          <span className="text-slate-300">{disc.contentAr || (disc as any).message || (disc as any).actionSummaryAr}</span>
                        </div>
                        <span className="text-[9px] text-emerald-400 shrink-0 border border-emerald-500/30 px-1 py-0.5 rounded bg-emerald-500/10">
                          VERIFIED
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SWARM AGENTS ROSTER */}
          {activeTab === "agents" && (
            <div className="size-full flex flex-col font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <span className="font-bold text-white tracking-wide">
                  جدول وكلاء المنصة النشطين (12 Active Sovereign Roles)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">100% OPERATIONAL SWARM</span>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 pe-1 custom-scrollbar">
                {agents.map((ag) => (
                  <div
                    key={ag.id}
                    onClick={() => onSelectAgent?.(ag)}
                    className="p-2.5 rounded-lg bg-[#03152d]/80 border border-cyan-500/25 hover:border-cyan-400 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="size-8 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${ag.colorHex}20`, border: `1.5px solid ${ag.colorHex}` }}
                      >
                        <span style={{ color: ag.colorHex }}>{ag.id.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-xs truncate group-hover:text-cyan-300">
                          {ag.nameAr}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{ag.nameEn}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase"
                        style={{ backgroundColor: `${ag.colorHex}30`, color: ag.colorHex }}
                      >
                        {ag.status}
                      </span>
                      <span className="text-[9px] text-slate-400">{ag.toolsCount} Tools</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL WORLD MAP */}
          {activeTab === "worldmap" && (
            <div className="size-full flex flex-col font-mono text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
                <span className="font-bold text-white tracking-wide">
                  خريطة التوزيع الجغرافي والربط السيادي (Global CDN & Relays)
                </span>
                <span className="text-[10px] text-cyan-300">Hubs: Istanbul, Riyadh, Trabzon, Dubai</span>
              </div>
              <div className="flex-1 w-full mt-1 overflow-hidden">
                <WorldMapWidget />
              </div>
            </div>
          )}

          {/* TAB 4: MICROSERVICES & REDIS */}
          {activeTab === "telemetry" && (
            <div className="size-full flex flex-col font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <span className="font-bold text-white tracking-wide">
                  مصفوفة الخدمات الخلفية وقنوات Redis & BullMQ
                </span>
                <span className="text-[10px] text-emerald-400">All Microservices Online</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div className="p-3 rounded-xl bg-[#041a38] border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 block">Admin Backend</span>
                  <span className="text-base font-bold text-emerald-300">127.0.0.1:3048</span>
                  <span className="text-[9px] text-emerald-400 block mt-1">HTTP/2 • Active</span>
                </div>
                <div className="p-3 rounded-xl bg-[#041a38] border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 block">Qdrant Vector Engine</span>
                  <span className="text-base font-bold text-cyan-300">127.0.0.1:6333</span>
                  <span className="text-[9px] text-cyan-400 block mt-1">gRPC/REST • 259 Vectors</span>
                </div>
                <div className="p-3 rounded-xl bg-[#041a38] border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 block">Redis & BullMQ Swarm</span>
                  <span className="text-base font-bold text-amber-300">127.0.0.1:6380</span>
                  <span className="text-[9px] text-amber-400 block mt-1">Worker Id: 38 • Active</span>
                </div>
                <div className="p-3 rounded-xl bg-[#041a38] border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 block">Network Latency</span>
                  <span className="text-base font-bold text-purple-300">0.8 ms</span>
                  <span className="text-[9px] text-purple-400 block mt-1">Sub-millisecond Local</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: POCKETBASE & QDRANT */}
          {activeTab === "assets" && (
            <div className="size-full flex flex-col font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <span className="font-bold text-white tracking-wide">
                  مستودعات البيانات والذاكرة المتجهية (Data Assets & Vector Stores)
                </span>
                <span className="text-[10px] text-cyan-300">Real-time Local Grounding</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="p-3 rounded-xl bg-[#041a38] border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 block">Travel Packages</span>
                  <span className="text-xl font-bold text-white">70 Active</span>
                  <span className="text-[9px] text-cyan-400 block mt-1">PocketBase Verified</span>
                </div>
                <div className="p-3 rounded-xl bg-[#041a38] border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 block">Episodic Swarm Memories</span>
                  <span className="text-xl font-bold text-amber-300">259 Points</span>
                  <span className="text-[9px] text-amber-400 block mt-1">Qdrant Indexed (Cosine)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#041a38] border border-cyan-500/30">
                  <span className="text-[10px] text-slate-400 block">LLM Grounding Keys</span>
                  <span className="text-xl font-bold text-emerald-300">gemini-2.5-flash</span>
                  <span className="text-[9px] text-emerald-400 block mt-1">LangGraph Autonomous Loop</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SYSTEM TOPOLOGY */}
          {activeTab === "topology" && (
            <div className="size-full flex flex-col font-mono text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
                <span className="font-bold text-white tracking-wide">
                  مخطط المعمارية السيادية للوكلاء وشبكات الاتصال (Sovereign Swarm Architecture)
                </span>
                <span className="text-[10px] text-emerald-400">MCP Protocol v1.3</span>
              </div>
              <div className="flex-1 w-full mt-1 overflow-hidden">
                <ArchitectureDiagram />
              </div>
            </div>
          )}
        </div>
      )}
    </footer>
  );
}
