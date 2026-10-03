"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Maximize2,
  Minimize2,
  X,
  GripHorizontal,
  Send,
  Radio,
  Cpu,
  Sparkles,
  MessageSquare,
  Bot,
  User,
  Volume2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAgentStore, type ChatMessage } from "@/lib/studio/agent/agent-store";

export interface SovereignStudioChatWindowProps {
  onSendDirective?: (text: string) => Promise<string | void> | void;
  isListening?: boolean;
  isAgentSpeaking?: boolean;
  audioFrequencies?: number[];
  currentScreenId?: string;
  defaultOpen?: boolean;
}

const DEFAULT_WIDTH = 380;
const DEFAULT_HEIGHT = 440;

export const SovereignStudioChatWindow = memo(function SovereignStudioChatWindow({
  onSendDirective,
  isListening = false,
  isAgentSpeaking = false,
  audioFrequencies = [],
  currentScreenId = "20",
  defaultOpen = true,
}: SovereignStudioChatWindowProps) {
  const isOpen = useAgentStore((s) => s.chatWindowOpen);
  const setIsOpen = useAgentStore((s) => s.setChatWindowOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Position & Size
  const [pos, setPos] = useState({ x: 24, y: 110 });
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });

  // Chat state
  const [inputText, setInputText] = useState("");
  const messages = useAgentStore((s) => s.chatLog);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, winX: 24, winY: 110 });

  // Sovereign In-Chat Pending Decision State
  const [pendingDecision, setPendingDecision] = useState<{
    id: string;
    titleAr: string;
    descriptionAr?: string;
    actionType?: string;
  } | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);

  const fetchPendingDecisions = async () => {
    try {
      const res = await fetch("/api/admin/automation/agent-war-room");
      if (!res.ok) return;
      const data = await res.json();
      const list = data?.decisions || [];
      const pending = list.find((d: { status?: string }) => d.status === "pending");
      if (pending) {
        setPendingDecision({
          id: pending.id,
          titleAr: pending.titleAr,
          descriptionAr: pending.descriptionAr,
          actionType: pending.actionType,
        });
      } else {
        setPendingDecision(null);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPendingDecisions();
    const interval = setInterval(fetchPendingDecisions, 10000);
    const handleDecisionEvent = () => fetchPendingDecisions();
    window.addEventListener("studio:decision-created", handleDecisionEvent);
    return () => {
      clearInterval(interval);
      window.removeEventListener("studio:decision-created", handleDecisionEvent);
    };
  }, []);

  const handleDecide = async (decisionStatus: "approved" | "rejected") => {
    if (!pendingDecision || isDeciding) return;
    setIsDeciding(true);
    try {
      const res = await fetch("/api/admin/automation/agent-war-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decide",
          decisionId: pendingDecision.id,
          decisionStatus,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        useAgentStore.getState().appendChatLog({
          kind: "response",
          sender: "agent",
          text:
            decisionStatus === "approved"
              ? `✅ تم اعتماد القرار السيادي وتفويضه للتنفيذ: «${pendingDecision.titleAr}»`
              : `❌ تم رفض مقترح الخلية: «${pendingDecision.titleAr}»`,
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        });
        setPendingDecision(null);
      }
    } catch (err) {
      console.warn("Error deciding on decision:", err);
    } finally {
      setIsDeciding(false);
    }
  };

  // Resizing state
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, startW: DEFAULT_WIDTH, startH: DEFAULT_HEIGHT });

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isListening, isAgentSpeaking]);

  // Global custom events to open chat
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleToggle = () => setIsOpen(!useAgentStore.getState().chatWindowOpen);
    window.addEventListener("studio:open-chat", handleOpen);
    window.addEventListener("studio:toggle-chat", handleToggle);
    return () => {
      window.removeEventListener("studio:open-chat", handleOpen);
      window.removeEventListener("studio:toggle-chat", handleToggle);
    };
  }, [setIsOpen]);

  // Robust Global Dragging Handlers
  const handleDragPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) return;
    if (isMaximized || isMinimized) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: pos.x,
      winY: pos.y,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = ev.clientX - dragStartRef.current.mouseX;
      const dy = ev.clientY - dragStartRef.current.mouseY;
      const maxTop = 64;
      const maxBottom = window.innerHeight - 80;
      const nextX = Math.max(12, Math.min(window.innerWidth - size.width - 12, dragStartRef.current.winX + dx));
      const nextY = Math.max(maxTop, Math.min(maxBottom, dragStartRef.current.winY + dy));
      setPos({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Robust Global Resizing Handlers
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (isMaximized || isMinimized) return;
    isResizingRef.current = true;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: size.width,
      startH: size.height,
    };

    const handleResizeMove = (ev: PointerEvent) => {
      if (!isResizingRef.current) return;
      const dx = ev.clientX - resizeStartRef.current.mouseX;
      const dy = ev.clientY - resizeStartRef.current.mouseY;
      const nextW = Math.max(280, Math.min(750, resizeStartRef.current.startW + dx));
      const nextH = Math.max(200, Math.min(window.innerHeight - pos.y - 80, resizeStartRef.current.startH + dy));
      setSize({ width: nextW, height: nextH });
    };

    const handleResizeUp = () => {
      isResizingRef.current = false;
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", handleResizeUp);
    };

    window.addEventListener("pointermove", handleResizeMove);
    window.addEventListener("pointerup", handleResizeUp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    if (onSendDirective) {
      onSendDirective(text);
    } else {
      useAgentStore.getState().push({ kind: "directive", text });
    }
  };

  // When closed, DO NOT leave any floating pill on the screen — it only lives in the bottom dock!
  if (!isOpen) {
    return null;
  }

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: "fixed",
        top: 68,
        left: 20,
        width: 500,
        bottom: 78,
        height: "auto",
        zIndex: 45,
      }
    : {
        position: "fixed",
        top: pos.y,
        left: pos.x,
        width: size.width,
        height: isMinimized ? 44 : size.height,
        zIndex: 45,
      };

  return (
    <div
      style={windowStyle}
      className="pointer-events-auto flex flex-col overflow-hidden rounded-[20px] border border-cyan-400/40 bg-[#020b18]/96 text-white shadow-[0_0_40px_rgba(0,240,255,0.25),inset_0_0_20px_rgba(0,240,255,0.05)] backdrop-blur-2xl select-none"
      dir="rtl"
    >
      {/* 1. Header Bar (Draggable across entire screen) */}
      <div
        onPointerDown={handleDragPointerDown}
        className={`flex items-center justify-between border-b border-cyan-500/25 bg-[#031326]/95 px-3.5 py-2.5 ${
          isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal size={14} className="text-cyan-400/60" />
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <Bot size={13} />
          </div>
          <span className="font-extrabold text-xs text-white">محادثة الوكيل المشرف</span>
          <span
            className={`h-2 w-2 rounded-full ${
              isAgentSpeaking
                ? "bg-amber-400 animate-ping shadow-[0_0_8px_#f59e0b]"
                : isListening
                ? "bg-cyan-400 animate-pulse shadow-[0_0_8px_#00e5ff]"
                : "bg-emerald-400 shadow-[0_0_8px_#10b981]"
            }`}
          />
        </div>

        {/* Window controls (Pure black background with vivid neon icons) */}
        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          {/* Minimize / Hide Button: Black BG + Neon Amber Icon */}
          <button
            type="button"
            onClick={() => setIsMinimized((v) => !v)}
            style={{ backgroundColor: "#000000" }}
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-amber-500/60 !bg-black text-[#ffaa00] hover:text-[#ffd666] hover:border-amber-400 hover:shadow-[0_0_12px_rgba(255,170,0,0.6)] transition-all cursor-pointer"
            title="تصغير / إخفاء النافذة"
          >
            <Minus size={12} className="stroke-[2.5]" />
          </button>

          {/* Maximize Button: Black BG + Neon Cyan Icon */}
          <button
            type="button"
            onClick={() => setIsMaximized((v) => !v)}
            style={{ backgroundColor: "#000000" }}
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/60 !bg-black text-[#00f0ff] hover:text-white hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(0,240,255,0.6)] transition-all cursor-pointer"
            title="تكبير / استعادة النافذة"
          >
            {isMaximized ? (
              <Minimize2 size={11} className="stroke-[2.5]" />
            ) : (
              <Maximize2 size={11} className="stroke-[2.5]" />
            )}
          </button>

          {/* Close Button: Black BG + Neon Pink/Rose Icon */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ backgroundColor: "#000000" }}
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#ff0055]/70 !bg-black text-[#ff0055] hover:text-[#ff3377] hover:border-[#ff0055] hover:shadow-[0_0_14px_rgba(255,0,85,0.7)] transition-all cursor-pointer"
            title="إغلاق النافذة"
          >
            <X size={12} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Messages List (Visible when not minimized) */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 text-xs font-sans">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
                <Sparkles size={24} className="text-cyan-400/50 mb-2 animate-pulse" />
                <p className="font-bold text-slate-300 text-xs">خلية الوكلاء جاهزة</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  تحدث بالصوت أو اكتب توجيهك للمشرف مباشرة لتنفيذ المهام ومراجعة الأقسام.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isUser = m.kind === "directive" || m.sender === "user";
                return (
                  <div
                    key={m.id || idx}
                    className={`flex flex-col max-w-[85%] rounded-2xl p-2.5 ${
                      isUser
                        ? "mr-auto bg-cyan-950/70 border border-cyan-400/40 text-cyan-100 rounded-br-sm"
                        : "ml-auto bg-[#041628]/85 border border-white/15 text-slate-100 rounded-bl-sm"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-cyan-300/80">
                      {isUser ? <User size={10} /> : <Bot size={10} />}
                      <span>{isUser ? "المدير" : "الوكيل المشرف"}</span>
                      {m.time && <span className="text-slate-400 text-[9px] mr-auto">{m.time}</span>}
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                );
              })
            )}

            {/* Speaking / Listening Status Indicator */}
            {isAgentSpeaking && (
              <div className="flex items-center gap-2 text-[11px] text-amber-300 font-mono animate-pulse">
                <Volume2 size={12} />
                <span>الوكيل المشرف يتحدث الآن...</span>
              </div>
            )}
            {isListening && !isAgentSpeaking && (
              <div className="flex items-center gap-2 text-[11px] text-cyan-300 font-mono animate-pulse">
                <Radio size={12} />
                <span>الوكيل يستمع لأمرك الصوتي...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 2.5. Sovereign In-Chat Approval Banner */}
          {pendingDecision && (
            <div className="mx-2.5 mb-2 rounded-xl border border-amber-500/40 bg-amber-950/40 backdrop-blur-md p-2.5 text-xs text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-amber-400 animate-pulse" />
                  قرار بانتظار الاعتماد السيادي
                </span>
                <span className="font-mono text-[9px] text-amber-400/70">{pendingDecision.id}</span>
              </div>
              <p className="text-[11px] text-slate-200 font-medium leading-snug">
                {pendingDecision.titleAr}
              </p>
              {pendingDecision.descriptionAr && (
                <p className="text-[10px] text-slate-300 line-clamp-2">
                  {pendingDecision.descriptionAr}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  disabled={isDeciding}
                  onClick={() => handleDecide("approved")}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                >
                  <CheckCircle2 size={12} />
                  اعتماد وتطبيق
                </button>
                <button
                  type="button"
                  disabled={isDeciding}
                  onClick={() => handleDecide("rejected")}
                  className="py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 text-[11px] flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <XCircle size={12} />
                  رفض
                </button>
              </div>
            </div>
          )}

          {/* 3. Input Form with Explicit Guaranteed Dark Background */}
          <form
            onSubmit={handleSubmit}
            style={{ backgroundColor: "#010813", borderTop: "1px solid rgba(0, 240, 255, 0.2)" }}
            className="p-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب أمراً أو استفساراً للوكيل..."
              style={{
                backgroundColor: "#020b18",
                color: "#ffffff",
                borderColor: "rgba(0, 240, 255, 0.4)",
              }}
              className="flex-1 rounded-xl border px-3.5 py-2 text-xs !bg-[#020b18] !text-white placeholder-cyan-300/40 outline-none focus:!border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                backgroundColor: "rgba(0, 240, 255, 0.15)",
                borderColor: "rgba(0, 240, 255, 0.5)",
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            >
              <Send size={13} className="text-cyan-400" />
            </button>
          </form>

          {/* 4. Resizing Grip Corner (When not maximized) */}
          {!isMaximized && (
            <div
              onPointerDown={handleResizePointerDown}
              className="absolute bottom-0 left-0 z-20 flex h-4 w-4 cursor-nesw-resize items-end justify-start p-0.5 text-cyan-400/50 hover:text-cyan-300"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <path d="M1 7L7 1M1 4L4 1M1 1L1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default SovereignStudioChatWindow;
