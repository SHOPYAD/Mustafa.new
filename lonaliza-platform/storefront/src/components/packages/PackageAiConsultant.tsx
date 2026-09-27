"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Plane,
  Hotel,
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  Star,
  Luggage,
  Clock,
  Compass,
  FileCheck,
  X,
  MessageSquare,
  Radio,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import type { EnrichedHolidayPackage } from "@/data/package-enrichment";
import type { DestinationMetadata } from "@/lib/destination-resolver";

interface PackageAiConsultantProps {
  pkg: EnrichedHolidayPackage;
  destMeta: DestinationMetadata;
  destination: string;
  country: string;
  totalPrice: number;
  itinerary: any[];
  flightDetails?: any;
  luxuryHotels?: any[];
  images?: any[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  updatedProgram?: any;
}

export function PackageAiConsultant({
  pkg,
  destMeta,
  destination,
  country,
  totalPrice,
  itinerary,
  flightDetails,
  luxuryHotels,
  images,
}: PackageAiConsultantProps) {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";
  const { formatPrice } = useCurrency();
  const router = useRouter();

  // Accordion Expand/Collapse State (IN-PLACE, NO SIDEBAR DRAWER)
  const [isOpen, setIsOpen] = useState(false);

  // Nationality & Origin State
  const [selectedNationality, setSelectedNationality] = useState<string>("SA");
  const [originCity, setOriginCity] = useState<string>(
    isAr ? "الرياض (RUH)" : "Riyadh (RUH)"
  );

  // Voice & Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [modifiedTrip, setModifiedTrip] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial welcome message from AI consultant
  useEffect(() => {
    const welcomeMsg = isAr
      ? `مرحباً بك! أنا مستشارك الذكي المخصص لرحلة "${pkg.title || destination}". يمكنني مساعدتك في استعراض خيارات الطيران والفنادق، التحقق من شروط الدخول والفيزا، أو تعديل وتخصيص هذا البرنامج بالكامل حسب رغبتك بالصوت أو الكتابة.`
      : `Welcome! I am your dedicated VIP Travel Advisor for "${pkg.title || destination}". I can assist you with live flight/hotel options, visa intelligence, or customize this entire itinerary by voice or text.`;

    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content: welcomeMsg,
        timestamp: new Date().toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, [pkg.title, destination, isAr]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current && isOpen) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = isAr ? "ar-SA" : "en-US";

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            handleSendMessage(transcript);
          }
          setIsRecording(false);
        };

        rec.onerror = () => {
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [isAr]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(
        isAr
          ? "التعرف الصوتي غير مدعوم في هذا المتصفح. يمكنك الكتابة مباشرة."
          : "Voice recognition is not supported in this browser. Please type directly."
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  // Text to Speech playback
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && voiceEnabled) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`•-]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = isAr ? "ar-SA" : "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Send message to AI Advisor API
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    if (!isOpen) {
      setIsOpen(true);
    }

    setInputText("");
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/package-advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: textToSend,
          nationality: selectedNationality,
          originCity,
          locale,
          packageData: {
            id: pkg.id,
            slug: pkg.slug,
            title: pkg.title,
            destination,
            country,
            durationDays: pkg.durationDays,
            price: totalPrice,
            currency: pkg.currency || "USD",
          },
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      if (data && data.ok) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          updatedProgram: data.updatedProgram || null,
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (data.updatedProgram) {
          setModifiedTrip(data.updatedProgram);
        }

        if (voiceEnabled) {
          speakText(data.reply);
        }
      } else {
        throw new Error(data.error || "Failed to get reply");
      }
    } catch {
      const errorReply = isAr
        ? `أنا في خدمتك لمساعدتك في أي استفسار حول رحلة ${destination}. يمكنك سؤالي عن تفاصيل الطيران، الفنادق، أو طلب تعديل مدة الرحلة والمزارات وسأعدلها لك فوراً.`
        : `I am at your service to assist with your journey to ${destination}. Feel free to ask about flights, hotels, or customize duration and activities.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: errorReply,
        timestamp: new Date().toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action Buttons
  const quickActions = [
    {
      label: isAr ? "📌 متطلبات الفيزا والدخول" : "📌 Visa Entry Rules",
      prompt: isAr ? "ما هي شروط ومتطلبات الفيزا لجنسيتي إلى هذه الوجهة؟" : "What are the visa entry rules for my nationality?",
    },
    {
      label: isAr ? "✈️ تفاصيل الطيران المباشر" : "✈️ Flight Details",
      prompt: isAr ? "استعرض لي تفاصيل رحلات الطيران وأوزان الأمتعة ومطار الوصول." : "Review direct flight details, baggage, and arrival airport.",
    },
    {
      label: isAr ? "🏨 خيارات الفنادق 5 نجوم" : "🏨 5-Star Hotel Options",
      prompt: isAr ? "ما هي مميزات الفنادق المشمولة في هذه الباقة وهل تشمل الإفطار؟" : "What are the features of hotels included and is breakfast provided?",
    },
    {
      label: isAr ? "✏️ أضف يوم إضافي للبرنامج" : "✏️ Add One Extra Day",
      prompt: isAr ? "أريد إضافة يوم إضافي للبرنامج مع جولة سياحية خاصة وسيارة فيتو VIP." : "I would like to add an extra day with private Vito VIP tour.",
    },
    {
      label: isAr ? "👨‍👩‍👧‍👦 نصائح لرحلة عائلية" : "👨‍👩‍👧‍👦 Family Travel Tips",
      prompt: isAr ? "ما هي أهم النصائح والمزارات المناسبة للعائلة والأطفال في هذه الوجهة؟" : "What are the best tips and sights for families and kids?",
    },
  ];

  // Navigate to full planner with custom trip
  const handleOpenInPlanner = () => {
    if (typeof window !== "undefined") {
      const tripToSave = modifiedTrip || {
        destination,
        country,
        days: pkg.durationDays,
        title: pkg.title,
        price: totalPrice,
      };
      localStorage.setItem("lonaliza_active_planner_trip", JSON.stringify(tripToSave));
      router.push(`/ai-chat?custom=1&dest=${encodeURIComponent(destination)}`);
    }
  };

  const handleToggleChat = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (!nextState && isSpeaking) {
      stopSpeaking();
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* IN-PLACE SMART CONCIERGE CARD (ACCORDION IN NORMAL PAGE FLOW)              */}
      {/* ========================================================================= */}
      <div
        id="package-smart-concierge"
        ref={containerRef}
        className="smart-concierge-container relative overflow-hidden rounded-3xl border border-purple-800/60 bg-gradient-to-br from-[#180333] via-[#240a45] to-[#320857] p-5 text-white shadow-2xl shadow-purple-950/40 sm:p-6 transition-all duration-300"
      >
        {/* Ambient background glows */}
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/25">
              <Bot size={24} className="text-slate-950" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#180333] bg-emerald-500" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">
                  {isAr ? "مستشار الرحلة الذكي VIP (صوت وكتابة)" : "Smart VIP Travel Concierge (Voice & Chat)"}
                </h3>
                <span className="inline-flex min-h-6 items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  {isAr ? "اتصال حي 24/7" : "LIVE 24/7"}
                </span>
              </div>
              <p className="mt-1 text-xs text-purple-100 line-clamp-1">
                {isAr
                  ? `أنت في اتصال حي مع المستشار لتعديل الفنادق، الطيران، أو تخصيص مزارات ${destination} فورياً`
                  : `Live with your dedicated concierge to customize hotels, flights, and sights in ${destination}`}
              </p>
            </div>
          </div>

          {/* Toggle Action Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleToggleChat}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-5 text-xs font-black text-[#170E38] shadow-lg shadow-amber-500/20 transition hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Mic size={16} />
              <span>
                {isOpen
                  ? (isAr ? "إغلاق محادثة المستشار" : "Collapse Concierge")
                  : (isAr ? "تحدث مع المستشار الآن" : "Chat with Concierge")}
              </span>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="relative mt-3.5 flex gap-2 overflow-x-auto pt-2.5 border-t border-purple-700/50 [scrollbar-width:none]">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!isOpen) setIsOpen(true);
                handleSendMessage(action.prompt);
              }}
              className="shrink-0 rounded-xl bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* IN-PLACE EXPANDABLE CHAT PANEL (NO OVERLAY, PUSHES CONTENT DOWN) */}
        {isOpen && (
          <div className="relative mt-5 rounded-2xl border border-purple-700/60 bg-[#120324]/95 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-inner">
            {/* Chat Bar Controls */}
            <div className="flex items-center justify-between border-b border-purple-800/60 px-4 py-2.5 bg-purple-950/40 text-xs text-purple-200">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles size={14} className="text-amber-400" />
                <span>{destination} — {isAr ? "تخصيص البرنامج فورياً" : "Instant Customization"}</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    voiceEnabled
                      ? "bg-amber-400/20 text-amber-300"
                      : "text-white/40 hover:text-white"
                  }`}
                  title={isAr ? "تفعيل / كتم الصوت" : "Toggle Sound"}
                >
                  {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span>{voiceEnabled ? (isAr ? "الصوت مفعّل" : "Sound On") : (isAr ? "كتم الصوت" : "Muted")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                  title={isAr ? "إغلاق" : "Close"}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div
              ref={chatScrollRef}
              className="max-h-[380px] min-h-[180px] space-y-3.5 overflow-y-auto p-4 sm:p-5"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-tr-none bg-[#7C3AED] text-white shadow-sm"
                        : "rounded-tl-none border border-purple-800/80 bg-white/10 text-purple-50 shadow-sm backdrop-blur-md"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {/* Trip Modification Notification Card */}
                    {msg.updatedProgram && (
                      <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-amber-100">
                        <div className="flex items-center gap-2 font-black text-amber-300 text-xs">
                          <Sparkles size={14} className="text-amber-400" />
                          <span>
                            {isAr ? "تم تحديث خطة البرنامج:" : "Itinerary Updated:"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-purple-200">
                          {msg.updatedProgram.modificationNote}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleOpenInPlanner}
                            className="flex items-center gap-1 rounded-lg bg-[#7C3AED] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-[#6D28D9]"
                          >
                            <Calendar size={12} />
                            <span>{isAr ? "الانتقال للمخطط الكامل" : "Open in Planner"}</span>
                          </button>

                          <Link
                            href={`/package/book?slug=${encodeURIComponent(pkg.slug)}&total=${msg.updatedProgram.price}&days=${msg.updatedProgram.durationDays}&dest=${encodeURIComponent(destination)}`}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700"
                          >
                            <Zap size={12} />
                            <span>{isAr ? "احجز البرنامج المعدل" : "Book Custom Trip"}</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-purple-300/60">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-3 text-xs text-purple-200">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:0.4s]" />
                  </div>
                  <span>
                    {isAr ? "جاري التفكير وتخصيص الخطة..." : "Thinking & tailoring itinerary..."}
                  </span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-purple-800/60 bg-[#17052e] p-3 sm:p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Record Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                    isRecording
                      ? "animate-pulse bg-rose-600 text-white shadow-md shadow-rose-500/30"
                      : "bg-purple-900/60 border border-purple-600/40 text-amber-300 hover:bg-purple-800"
                  }`}
                  title={isAr ? "اضغط للتحدث بالصوت" : "Press to speak"}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isAr
                      ? "اكتب أو تحدث مع المستشار الذكي..."
                      : "Type or speak to customize your trip..."
                  }
                  className="flex-1 rounded-xl border border-purple-700/60 bg-purple-950/50 px-4 py-2.5 text-xs sm:text-sm font-medium text-white placeholder-purple-300/50 outline-none transition focus:border-amber-400 focus:bg-purple-900/50"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-40 font-bold"
                >
                  <Send size={16} className={dir === "rtl" ? "rotate-180" : ""} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Floating VIP Capsule Button: Smooth scrolls and opens the in-place card */}
      <div className="fixed bottom-6 end-6 z-40">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="group relative flex items-center gap-2.5 rounded-full border border-amber-300/40 bg-gradient-to-r from-[#170E38] via-[#2A145C] to-[#1E1145] py-2.5 ps-3.5 pe-4 text-white shadow-2xl shadow-violet-950/40 backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[#170E38] shadow-md">
            <Bot size={16} />
            <span className="absolute -top-0.5 -end-0.5 flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </span>
          <div className="text-start">
            <span className="block text-xs font-black text-amber-300 leading-tight">
              {isAr ? "مستشار VIP" : "VIP Concierge"}
            </span>
            <span className="block text-[10px] text-white/70">
              {isAr ? "صوت وكتابة" : "Voice & Chat"}
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
