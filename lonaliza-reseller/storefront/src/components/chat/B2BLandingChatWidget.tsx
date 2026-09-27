"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Loader2,
  ChevronDown,
  Building2,
  TrendingUp,
  Server,
  DollarSign,
  PhoneCall,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePathname } from "next/navigation";
import { useSiteContact } from "@/hooks/useSiteContact";

interface ChatMsg {
  id: string;
  sender: "agent" | "visitor";
  text: string;
  timestamp: string;
  roiData?: {
    currentCost?: number;
    lonalizaCost?: number;
    projectedSavingsYear1?: number;
    projectedRoiPercent?: number;
    breakEvenMonths?: number;
  };
}

export default function B2BLandingChatWidget() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const contact = useSiteContact();
  const isAr = locale === "ar";

  const isExcludedRoute =
    pathname.startsWith("/package/") ||
    pathname.startsWith("/hotels/") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/ai-chat") ||
    pathname.startsWith("/community");

  const isB2BRoute = !isExcludedRoute && contact.b2bAdvisorEnabled !== false;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorContact, setVisitorContact] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [agentTitle, setAgentTitle] = useState("مستشار الحلول السحابية B2B");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate or load sessionId
    const storedSession = localStorage.getItem("lonaliza_b2b_session_id");
    if (storedSession) {
      setSessionId(storedSession);
    } else {
      const newId = `b2b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem("lonaliza_b2b_session_id", newId);
      setSessionId(newId);
    }

    // Fetch initial agent greeting
    void fetch("/api/b2b-landing-agent/chat")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.welcomeMessageAr) {
          setAgentTitle(isAr ? data.agentTitleAr || "مستشار الحلول السحابية B2B" : "Enterprise SaaS Advisor");
          if (messages.length === 0) {
            setMessages([
              {
                id: "welcome_1",
                sender: "agent",
                text: isAr ? data.welcomeMessageAr : data.welcomeMessageEn || data.welcomeMessageAr,
                timestamp: new Date().toISOString(),
              },
            ]);
          }
        }
      })
      .catch(() => {});
  }, [isAr, messages.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || loading) return;

    setInputValue("");
    const userMsg: ChatMsg = {
      id: `usr_${Date.now()}`,
      sender: "visitor",
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/b2b-landing-agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          visitorName: visitorName || undefined,
          phoneOrEmail: visitorContact || undefined,
          message: textToSend,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          locale,
        }),
      });

      const data = (await res.json()) as {
        ok: boolean;
        replyText?: string;
        leadScore?: number;
        roiData?: ChatMsg["roiData"];
        handoverTriggered?: boolean;
      };

      if (data.ok && data.replyText) {
        setMessages((prev) => [
          ...prev,
          {
            id: `agt_${Date.now()}`,
            sender: "agent",
            text: data.replyText!,
            timestamp: new Date().toISOString(),
            roiData: data.roiData,
          },
        ]);

        if (data.handoverTriggered && !visitorContact) {
          setShowContactForm(true);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "agent",
          text: isAr
            ? "عذراً، حدث تأخير بسيط في الاتصال. يمكنك دائماً مراسلتنا عبر واتساب أو تكرار السؤال!"
            : "Sorry, a momentary connection issue occurred. You can always reach us on WhatsApp or retry!",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = isAr
    ? [
        { label: "🏢 باقات وأسعار النظام", text: "ما هي باقات الأسعار المتاحة لامتلاك النظام وماذا تشمل كل باقة؟" },
        { label: "📊 احسب وفوراتي وأرباحي", text: "أدفع حالياً حوالي 600$ شهرياً لنظام قديم، كم سأوفر عند امتلاك لوناليزا؟" },
        { label: "💻 مواصفات السيرفر و aaPanel", text: "كيف يعمل السيرفر المستقل ولوحة aaPanel وهل بياناتي معزولة 100%؟" },
        { label: "🚀 حجز عرض حي (Demo)", text: "أرغب في حجز موعد لعرض تجريبي مباشر للنظام والاطلاع على لوحة التحكم." },
      ]
    : [
        { label: "🏢 Pricing & Packages", text: "What are the available packages to own the system and what does each include?" },
        { label: "📊 Calculate My ROI & Savings", text: "I currently spend $600/mo on legacy software. How much will I save with Lonaliza?" },
        { label: "💻 Server & aaPanel Specs", text: "How does the dedicated server and aaPanel work? Is my data 100% isolated?" },
        { label: "🚀 Book a Live Demo", text: "I would like to schedule a live demo to explore the admin dashboard." },
      ];

  if (!isB2BRoute) {
    return null;
  }

  const posClass =
    contact.b2bAdvisorPosition === "left"
      ? "left-6 items-start"
      : contact.b2bAdvisorPosition === "center"
      ? "left-1/2 -translate-x-1/2 items-center"
      : "right-6 items-end";

  const bottomStyle = { bottom: `${contact.b2bAdvisorBottomPx ?? 24}px` };

  return (
    <div
      className={`fixed z-50 flex flex-col ${posClass}`}
      style={bottomStyle}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Floating Launcher Button - Daylight Luxury Purple & Gold */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] px-5 py-3.5 text-white shadow-2xl shadow-purple-950/30 hover:scale-105 hover:shadow-purple-900/50 active:scale-95 transition-all duration-300 border border-amber-400/40"
        >
          {/* Pulsing ring */}
          <span className="absolute -inset-1 rounded-full bg-purple-400/30 opacity-75 blur-sm animate-pulse group-hover:opacity-100" />
          
          <div className="relative flex items-center justify-center size-9 rounded-full bg-white/20 backdrop-blur-md">
            <Bot size={22} className="text-amber-300 animate-bounce" />
            <span className="absolute top-0 right-0 size-2.5 rounded-full bg-amber-400 ring-2 ring-[#2e1065] animate-ping" />
          </div>

          <div className="relative flex flex-col text-start">
            <span className="text-xs font-black tracking-wide flex items-center gap-1.5 text-white">
              <span>{isAr ? "مستشار لوناليزا B2B" : "Lonaliza B2B Advisor"}</span>
              <Sparkles size={13} className="text-amber-300" />
            </span>
            <span className="text-[10px] text-amber-200/90 font-medium">
              {isAr ? "احسب أرباحك وتعرّف على النظام" : "Calculate ROI & Own Platform"}
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal Panel - Daylight Royal Purple & Gold */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl border border-purple-200/90 bg-white shadow-2xl shadow-purple-950/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] p-4 border-b border-purple-800/40 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="relative size-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="size-full bg-[#2e1065] rounded-[14px] flex items-center justify-center">
                  <Bot size={22} className="text-amber-300" />
                </div>
                <span className="absolute bottom-0 right-0 size-3 rounded-full bg-amber-400 ring-2 ring-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-white">{isAr ? "مستشار لوناليزا B2B" : "Lonaliza B2B Advisor"}</h4>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold border border-amber-400/30">
                    AI Active
                  </span>
                </div>
                <p className="text-[11px] text-purple-200 truncate max-w-[200px]">{agentTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all"
                title="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-purple-50/80 border-b border-purple-100 flex gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => void handleSend(qp.text)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-white hover:bg-purple-100/70 border border-purple-200 text-[11px] font-semibold text-purple-950 hover:text-[#2e1065] transition-all shrink-0 shadow-2xs"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Stream - Daylight */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 custom-scrollbar">
            {messages.map((m) => {
              const isAgent = m.sender === "agent";
              return (
                <div key={m.id} className={`flex flex-col ${isAgent ? "items-start" : "items-end"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      isAgent
                        ? "bg-white border border-slate-200 text-slate-800 shadow-xs"
                        : "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-sm rounded-br-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Economic ROI Card if calculated */}
                    {m.roiData && (
                      <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200/80 space-y-2 text-slate-900">
                        <div className="flex items-center gap-1.5 text-purple-900 font-bold text-[11px]">
                          <TrendingUp size={14} className="text-amber-600" />
                          <span>{isAr ? "تحليل الجدوى الاقتصادية والعائد ROI" : "Economic ROI Projection"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {m.roiData.lonalizaCost && (
                            <div className="bg-white p-2 rounded-lg border border-purple-100">
                              <span className="text-slate-500 block">{isAr ? "سعر باقة لوناليزا (مرة واحدة):" : "One-Time Cost:"}</span>
                              <span className="text-slate-900 font-black text-xs">${m.roiData.lonalizaCost}</span>
                            </div>
                          )}
                          {m.roiData.projectedSavingsYear1 && (
                            <div className="bg-white p-2 rounded-lg border border-purple-100">
                              <span className="text-purple-700 block">{isAr ? "وفورات السنة الأولى:" : "Year 1 Savings:"}</span>
                              <span className="text-purple-950 font-black text-xs">+${m.roiData.projectedSavingsYear1}</span>
                            </div>
                          )}
                          {m.roiData.projectedRoiPercent && (
                            <div className="bg-white p-2 rounded-lg border border-purple-100">
                              <span className="text-amber-700 block">{isAr ? "العائد على الاستثمار:" : "Estimated ROI:"}</span>
                              <span className="text-amber-800 font-black text-xs">+{m.roiData.projectedRoiPercent}%</span>
                            </div>
                          )}
                          {m.roiData.breakEvenMonths && (
                            <div className="bg-white p-2 rounded-lg border border-purple-100">
                              <span className="text-slate-500 block">{isAr ? "استرداد رأس المال:" : "Payback Period:"}</span>
                              <span className="text-slate-900 font-black text-xs">{m.roiData.breakEvenMonths} {isAr ? "أشهر" : "Months"}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-purple-900 bg-purple-50 border border-purple-200 p-3 rounded-2xl max-w-[70%]">
                <Loader2 size={14} className="animate-spin text-purple-700" />
                <span>{isAr ? "المستشار يحلل ويكتب الرد…" : "Advisor is thinking…"}</span>
              </div>
            )}

            {/* Optional Handover Contact Capture */}
            {showContactForm && (
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between text-purple-950 font-bold">
                  <span>{isAr ? "📞 تواصل الفريق التنفيذي معك" : "📞 Request Executive Callback"}</span>
                  <button type="button" onClick={() => setShowContactForm(false)} className="text-slate-400 hover:text-slate-700">
                    <X size={13} />
                  </button>
                </div>
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-purple-600"
                  placeholder={isAr ? "اسمك / اسم شركتك" : "Your Name / Company"}
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                />
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-purple-600"
                  placeholder={isAr ? "رقم الهاتف / الواتساب مع رمز الدولة" : "WhatsApp / Phone with Country Code"}
                  value={visitorContact}
                  onChange={(e) => setVisitorContact(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowContactForm(false);
                    void handleSend(
                      isAr
                        ? `معلومات التواصل الخاصة بنا: الاسم: ${visitorName || "غير محدد"} | الهاتف: ${visitorContact}`
                        : `Our contact info: Name: ${visitorName || "N/A"} | Phone: ${visitorContact}`
                    );
                  }}
                  disabled={!visitorContact}
                  className="w-full py-2 bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} className="text-amber-300" />
                  <span>{isAr ? "تأكيد وإرسال للمبيعات" : "Confirm & Send"}</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-purple-600 transition-all"
                placeholder={isAr ? "اسأل عن ميزات النظام، الباقات، أو السيرفر…" : "Ask about features, lifetime license, or server…"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="shrink-0 p-2.5 bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] disabled:opacity-40 text-white rounded-xl transition-all shadow-md"
              >
                {loading ? <Loader2 size={16} className="animate-spin text-amber-300" /> : <Send size={16} className="text-amber-300" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
