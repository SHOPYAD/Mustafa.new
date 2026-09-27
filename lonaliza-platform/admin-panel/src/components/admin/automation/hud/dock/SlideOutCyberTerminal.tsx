"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Terminal,
  X,
  Send,
  Trash2,
  Filter,
  Sparkles,
  ChevronDown,
  Activity,
  Bot,
  User,
  ShieldCheck,
} from "lucide-react";
import type { SwarmDiscussionMessage } from "@/lib/automation/agent-collab-store";

interface SlideOutCyberTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  discussions: SwarmDiscussionMessage[];
  onSendDirective: (text: string) => Promise<string | void>;
  isSending?: boolean;
}

export default function SlideOutCyberTerminal({
  isOpen,
  onClose,
  discussions,
  onSendDirective,
  isSending = false,
}: SlideOutCyberTerminalProps) {
  const [inputText, setInputText] = useState("");
  const [filterType, setFilterType] = useState<"all" | "agent" | "system">("all");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [discussions, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText;
    setInputText("");
    void onSendDirective(text);
  };

  const filteredDiscussions = discussions.filter((d) => {
    if (filterType === "agent") return d.fromAgent !== "admin";
    if (filterType === "system") return d.fromAgent === "admin";
    return true;
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cyber-terminal-title"
      className="fixed bottom-16 right-4 sm:right-6 z-50 w-[95vw] sm:w-[520px] max-h-[70vh] rounded-2xl border border-cyan-500/40 bg-[#020b18]/95 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,229,255,0.25)] flex flex-col font-mono text-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
    >
      {/* Terminal Top Bar */}
      <div className="h-10 px-4 bg-[#031429] border-b border-cyan-500/30 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyan-400" />
          <span id="cyber-terminal-title" className="text-xs font-bold text-white tracking-wider">
            طرفية التداول وسجل العمليات السيبراني
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            LIVE SSE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#010813] p-0.5 rounded-lg border border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-2 py-0.5 rounded ${
                filterType === "all" ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setFilterType("agent")}
              className={`px-2 py-0.5 rounded ${
                filterType === "agent" ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
              }`}
            >
              الوكلاء
            </button>
            <button
              type="button"
              onClick={() => setFilterType("system")}
              className={`px-2 py-0.5 rounded ${
                filterType === "system" ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
              }`}
            >
              التوجيهات
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="إغلاق الطرفية"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Terminal Message Stream */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-[220px] max-h-[380px] p-3 overflow-y-auto scrollbar-cyber space-y-2 text-xs divide-y divide-slate-800/40 select-text"
      >
        {filteredDiscussions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 text-slate-500 text-center">
            <Activity size={24} className="text-cyan-500/40 mb-2 animate-pulse" />
            <p>سجل العمليات هادئ حالياً. الخلية مستعدة لاستقبال التوجيهات.</p>
          </div>
        ) : (
          filteredDiscussions.map((msg) => {
            const isAdmin = msg.fromAgent === "admin";
            return (
              <div key={msg.id} className="pt-2 first:pt-0 flex items-start gap-2.5">
                <div
                  className={`mt-0.5 p-1 rounded-md shrink-0 ${
                    isAdmin
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {isAdmin ? <User size={12} /> : <Bot size={12} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span className="font-bold text-slate-400">
                      {isAdmin ? "المدير العام [SUPER ADMIN]" : msg.fromAgent}
                    </span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString("ar-SA")}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                    {msg.contentAr}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Command Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 bg-[#031429] border-t border-cyan-500/30 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="أدخل أمراً سيبرانياً أو توجيهاً للخلية..."
            disabled={isSending}
            className="w-full px-3 py-2 rounded-xl bg-[#010813] border border-cyan-500/40 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_#00e5ff]"
        >
          <Send size={13} />
          <span>إرسال</span>
        </button>
      </form>
    </div>
  );
}
