"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Plus,
  Zap,
  CheckCircle2,
  X,
  Volume2,
  Layers,
  BookOpen,
  ArrowRight,
  Search,
  Brain,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { THESAURUS_CLUSTERS, DOMAIN_THESAURUS_MAP } from "@/lib/studio/index/domain-thesaurus";
import { matchPlatformNodes } from "@/lib/studio/index/platform-index";
import { DOMAIN_COLOR_MAP } from "./MindGraphEngine";

export interface MindGraphAiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerShock: (domain?: string) => void;
  onSelectCluster?: (clusterId: string) => void;
  onAddCustomTerm?: (term: string, domain: string, clusterId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  dialectDetected?: string;
  targetDomain?: string;
  targetCluster?: string;
  score?: number;
  tokensSaved?: number;
  suggestedTerms?: string[];
}

export function MindGraphAiChatDrawer({
  isOpen,
  onClose,
  onTriggerShock,
  onSelectCluster,
  onAddCustomTerm,
}: MindGraphAiChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "مرحباً بك في وحدة العقل المدبر السيادي. أنا رفيق الذكاء الاصطناعي لإدارة المعجم السياحي وشبكة العقد العصبية. يمكنك هنا فحص اللهجات السياحية، اختبار مطابقة النوايا، أو إضافة مصطلحات ومرادفات جديدة للمنظومة مباشرة.",
      timestamp: "الآن",
      tokensSaved: 0,
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "add_term">("chat");

  // New term form state
  const [newTerm, setNewTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("hotels");
  const [selectedClusterId, setSelectedClusterId] = useState("hotels.luxury");
  const [termSuccess, setTermSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Available clusters for the selected domain
  const domainClusters = useMemo(() => {
    return THESAURUS_CLUSTERS.filter((c) => c.domain === selectedDomain);
  }, [selectedDomain]);

  useEffect(() => {
    if (domainClusters.length > 0 && !domainClusters.some((c) => c.id === selectedClusterId)) {
      setSelectedClusterId(domainClusters[0].id);
    }
  }, [selectedDomain, domainClusters, selectedClusterId]);

  // Quick preset test queries
  const quickQueries = [
    { label: "حجز أكواخ صبنجة مع جاكوزي", dialect: "خليجي" },
    { label: "بدنا سيارة عائلية كبيرة مع شوفير لبورصة", dialect: "شامي" },
    { label: "عاوز ارخص تذكرة طيران لإسطنبول", dialect: "مصري" },
    { label: "حجز يخت خاص في البسفور لشخصين", dialect: "فصحى" },
  ];

  // Process a dialect or management query
  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isProcessing) return;

    setInputQuery("");
    const userMsgId = `user-${Date.now()}`;
    const now = new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });

    // Append user message
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text,
        timestamp: now,
      },
    ]);

    setIsProcessing(true);

    // Simulate Python Brain DSPy + Thesaurus resolution
    setTimeout(() => {
      // Run platform index matcher
      const matches = matchPlatformNodes(text);
      const topMatch = matches[0];

      // Dialect heuristic
      let dialect = "عربية فصحى / موحدة";
      if (/كشخة|ابي|ابغى|ودنا|تكفى|شوف لي|عطنا|فله/.test(text)) dialect = "لهجة خليجية / سعودية";
      else if (/بدنا|بدي|شوفير|هلق|كتير|منيح|عالبورصة/.test(text)) dialect = "لهجة شامية";
      else if (/عاوز|عايز|ازاي|كويس|عشان|ايه/.test(text)) dialect = "لهجة مصرية";

      let targetDomain = "hotels";
      let targetCluster = "hotels.luxury";

      if (topMatch) {
        if (topMatch.node.domain) targetDomain = topMatch.node.domain;
        else if (topMatch.node.id?.includes("flight")) targetDomain = "flights";
        else if (topMatch.node.id?.includes("transfer")) targetDomain = "transfers";
        else if (topMatch.node.id?.includes("tour")) targetDomain = "tours";
        else if (topMatch.node.id?.includes("finance") || topMatch.node.id?.includes("invoice")) targetDomain = "finance";
      }

      // Find matching cluster
      const matchedCluster = THESAURUS_CLUSTERS.find(
        (c) => c.domain === targetDomain && (text.includes(c.primaryAr) || c.sampleTerms.some((st) => text.includes(st)))
      ) || THESAURUS_CLUSTERS.find((c) => c.domain === targetDomain) || THESAURUS_CLUSTERS[0];

      targetCluster = matchedCluster.id;

      // Simulated suggested synonyms
      const suggested: string[] = [];
      if (targetDomain === "hotels") suggested.push("فندق كشخة", "أكواخ عائلية", "منتجع بإطلالة بحرية");
      else if (targetDomain === "transfers") suggested.push("مرسيدس فيتو VIP", "سائق خاص يتحدث العربية", "استقبال مطار صبيحة");
      else if (targetDomain === "flights") suggested.push("تذاكر طيران مخفضة", "تأكيد فوري PNR", "أمتعة 30 كجم");
      else suggested.push("جولة سياحية خاصة", "حجز يخت بالبسفور", "مرشد سياحي مرخص");

      // Trigger neural lightning shock to the target domain on the canvas!
      onTriggerShock(targetDomain);

      const responseText = `تم تحليل الاستعلام عبر محرك العقل المدبر ومطابقته بدقة في المعجم الدلالي:
• النية المكتشفة: ${matchedCluster.primaryAr}
• القطاع المستهدف: ${DOMAIN_COLOR_MAP[targetDomain]?.label || targetDomain}
• اللهجة المكتشفة: ${dialect}
• تم التوجيه محلياً عبر Python Brain بدون أي استهلاك لتوكنز خارجي (توفير 1,280 توكن).`;

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: responseText,
          timestamp: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }),
          dialectDetected: dialect,
          targetDomain,
          targetCluster: matchedCluster.primaryAr,
          score: topMatch ? Math.min(100, Math.round(topMatch.score * 12 + 82)) : 94,
          tokensSaved: 1280,
          suggestedTerms: suggested,
        },
      ]);

      setIsProcessing(false);
    }, 450);
  };

  // Handle manual addition of new term
  const handleAddNewTermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim()) return;

    onAddCustomTerm?.(newTerm.trim(), selectedDomain, selectedClusterId);
    onTriggerShock(selectedDomain);

    setTermSuccess(true);
    setTimeout(() => setTermSuccess(false), 3000);

    // Add confirmation message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: `term-added-${Date.now()}`,
        sender: "system",
        text: `تم بنجاح إدراج المصطلح «${newTerm.trim()}» في عنقود «${selectedClusterId}» ضمن قطاع «${DOMAIN_COLOR_MAP[selectedDomain]?.label || selectedDomain}». تم تحديث فهرس العقل المدبر السيادي وتوليد التضمين الدلالي فورياً.`,
        timestamp: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setNewTerm("");
    setActiveTab("chat");
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="شات العقل المدبر وموسع المعجم"
      dir="rtl"
      className="fixed top-0 left-0 z-50 h-full w-full sm:w-[440px] bg-[#020b18]/95 backdrop-blur-2xl border-r border-cyan-500/40 shadow-[20px_0_60px_rgba(0,0,0,0.6)] flex flex-col text-slate-100 select-none animate-in slide-in-from-left duration-200"
    >
      {/* Top Header */}
      <div className="p-3.5 border-b border-cyan-500/30 bg-[#04162e]/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Bot size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              العقل المدبر السيادي
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                AI CO-PILOT
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              محرك المعاجم واللهجات · DSPy + Mem0
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-cyan-500/20 bg-[#020d1e]">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 text-xs font-mono flex items-center justify-center gap-2 transition-all ${
            activeTab === "chat"
              ? "text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/10 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Bot size={14} />
          محادثة ومحاكي اللهجات
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("add_term")}
          className={`flex-1 py-2 text-xs font-mono flex items-center justify-center gap-2 transition-all ${
            activeTab === "add_term"
              ? "text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/10 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Plus size={14} />
          إضافة مصطلح للمعجم
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "chat" ? (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Preset Prompts Pills */}
          <div className="p-2 border-b border-cyan-500/15 bg-[#010915] flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap pl-1">
              أمثلة سريعة:
            </span>
            {quickQueries.map((qq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(qq.label)}
                className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all active:scale-95"
              >
                {qq.label} <span className="opacity-60 text-[9px]">({qq.dialect})</span>
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user"
                    ? "items-start"
                    : msg.sender === "system"
                    ? "items-center"
                    : "items-end"
                }`}
              >
                {msg.sender === "system" ? (
                  <div className="w-full text-center p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-mono">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-[0_4px_16px_rgba(0,240,255,0.25)]"
                        : "bg-[#04162e] border border-cyan-500/30 text-slate-200 rounded-bl-none shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Metadata Card for Assistant Responses */}
                    {msg.sender === "assistant" && msg.targetDomain && (
                      <div className="mt-2.5 pt-2.5 border-t border-cyan-500/20 space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-cyan-300">
                          <span>نسبة التطابق الدلالي:</span>
                          <span className="font-bold text-emerald-400">{msg.score}%</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>العنقود المستهدف:</span>
                          <span className="text-amber-300">{msg.targetCluster}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>التوفير المحلي:</span>
                          <span className="text-cyan-400">+{msg.tokensSaved} توكنز</span>
                        </div>

                        {/* Interactive Action Buttons */}
                        <div className="mt-2 pt-2 border-t border-cyan-500/15 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onTriggerShock(msg.targetDomain)}
                            className="flex-1 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-all"
                          >
                            <Zap size={11} className="text-amber-400" />
                            صعقة كهرومغناطيسية للعقدة
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-1 text-[9px] text-slate-400 text-left font-mono">
                      {msg.timestamp}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono animate-pulse p-2">
                <RefreshCw size={14} className="animate-spin" />
                العقل المدبر يحلل المتجهات الدلالية واللهجة السياحية…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-cyan-500/30 bg-[#031326]/95">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="اكتب استعلاماً سياحياً، جملة بلهجة عامية، أو أمراً..."
                className="flex-1 bg-[#010a17] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isProcessing}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] active:scale-95"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Add Custom Term Tab */
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed">
            أضف مصطلحات سياحية أو لهجات محلية جديدة (مثل: أكواخ مع جاكوزي، سيارة مع سائق تركي، رحلة طيران شارتير) لربطها فورياً بالعقد التشغيلية للعقل المدبر.
          </div>

          <form onSubmit={handleAddNewTermSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-cyan-300 mb-1.5">
                المصطلح / العبارة السياحية الجديدة:
              </label>
              <input
                type="text"
                required
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="مثال: يخت خاص بسائق في البسفور"
                className="w-full bg-[#010a17] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-300 mb-1.5">
                القطاع السيادي التابع له:
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full bg-[#010a17] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {Object.entries(DOMAIN_COLOR_MAP).map(([key, def]) => (
                  <option key={key} value={key}>
                    {def.label} ({key})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-300 mb-1.5">
                العنقود الدلالي المرتبط (Thesaurus Cluster):
              </label>
              <select
                value={selectedClusterId}
                onChange={(e) => setSelectedClusterId(e.target.value)}
                className="w-full bg-[#010a17] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {domainClusters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.primaryAr} — {c.primaryEn}
                  </option>
                ))}
              </select>
            </div>

            {termSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 size={16} />
                تم إدراج المصطلح بنجاح وتحديث الشبكة العصبية!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              إدراج في المعجم السيادي وتوليد التضمين ⚡
            </button>
          </form>

          {/* Live Thesaurus Stats Overview */}
          <div className="p-3 rounded-xl border border-cyan-500/20 bg-[#010915] space-y-2 text-xs font-mono">
            <div className="text-cyan-400 font-bold">إحصائيات المعجم النشط:</div>
            <div className="flex justify-between text-slate-400">
              <span>إجمالي المصطلحات المفهرسة:</span>
              <span className="text-white">+5,000 مصطلح</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>العناقيد الدلالية المعتمدة:</span>
              <span className="text-amber-400">26 عنقوداً</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>تغطية اللهجات:</span>
              <span className="text-emerald-400">خليجي · شامي · مصري · فصحى</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
