"use client";

import React, { useState, useEffect, useCallback } from "react";
import StudioChromeHeaderAndDock from "./StudioChromeHeaderAndDock";
import StudioFloatingWindows from "./StudioFloatingWindows";
import HumanoidPresenceMasterView from "./HumanoidPresenceMasterView";
import CumulativeExpansionStage from "./CumulativeExpansionStage";
import StudioShell from "./shell/StudioShell";
import { useAgentStore } from "@/lib/studio/agent/agent-store";
import { getMap } from "@/lib/studio/graph/maps";
import McpActionDispatcherModal from "../mcp/McpActionDispatcherModal";
import { CyberSidebar } from "./shell/CyberSidebar";
import { CyberScrollStyle } from "./shell/CyberScrollStyle";
import ReferenceImageModal from "../screens/ReferenceImageModal";
import { STUDIO_SCREENS } from "../screens/screensData";
import { resolveStudioVoiceIntent } from "@/lib/neural-studio/studio-voice-intents";
import { domainScreen, resolveDomainFocus } from "@/lib/neural-studio/domain-systems";
import { useSovereignVoice } from "../voice/useSovereignVoice";
import { useAvatarStore } from "../avatar/store/useAvatarStore";
import { setHudArticleSnapshot } from "@/lib/swarm/article-hud-snapshot";
import { isArticleDirective, peekDestination, type ArticlePipelineClient } from "@/lib/swarm/article-pipeline-types";
import { routeUtterance, type NavTarget } from "@/lib/studio/commands/catalog";
import { plansFromIntent, resolveIntent } from "@/lib/studio/index/intent-router";

interface UnifiedCyberneticStudioProps {
  initialScreenId?: string;
  onExit?: () => void;
}

export default function UnifiedCyberneticStudio({
  initialScreenId = "20",
  onExit,
}: UnifiedCyberneticStudioProps) {
  const [currentScreenId, setCurrentScreenId] = useState<string>(initialScreenId || "20");
  const [lastNav, setLastNav] = useState<NavTarget | null>(null);
  const [depthLevel, setDepthLevel] = useState<number>(
    initialScreenId === "01" ? 0 : initialScreenId === "02" ? 3 : 2
  );
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);

  // Modals
  const [isScreenSelectorOpen, setIsScreenSelectorOpen] = useState<boolean>(false);
  const [isMcpDispatcherOpen, setIsMcpDispatcherOpen] = useState<boolean>(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState<boolean>(false);

  // Active Screen Metadata
  const currentScreen =
    STUDIO_SCREENS.find((s) => s.id === currentScreenId) || STUDIO_SCREENS[19];

  const [atlasZoom, setAtlasZoom] = useState(1);
  const [atlasPan, setAtlasPan] = useState(false);
  const [focusDomainId, setFocusDomainId] = useState<string | null>(null);
  const [dockNote, setDockNote] = useState<string>("");
  const [resetWindowsKey, setResetWindowsKey] = useState<number>(0);

  // Persistent studio session identifier for multi-turn conversational memory
  const [studioSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("lonaliza_studio_session_id");
      if (stored) return stored;
      const created = `studio_sess_${Date.now()}`;
      sessionStorage.setItem("lonaliza_studio_session_id", created);
      return created;
    }
    return `studio_sess_${Date.now()}`;
  });

  // Persistent auto-execution mode (Autonomous Agent vs Sovereign Manual Approval)
  const [isAutoExecution, setIsAutoExecution] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lonaliza_auto_execution_mode") === "true";
    }
    return false;
  });

  const handleToggleAutoExecution = useCallback(() => {
    setIsAutoExecution((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("lonaliza_auto_execution_mode", String(next));
      }
      return next;
    });
  }, []);

  // Direct dispatch handler for typed or spoken directives
  const [articlePipeline, setArticlePipeline] = useState<ArticlePipelineClient | null>(null);

  const dispatchDirectiveToSwarm = useCallback(
    async (directiveText: string): Promise<string> => {
      const peek = peekDestination(directiveText);
      setArticlePipeline(null);
      setHudArticleSnapshot({
        slug: "PIPELINE_RUNNING",
        destination: peek?.labelEn || "UNRESOLVED",
        status: "IN_PROGRESS",
        detail: "WAITING_FOR_TOOLS",
      });
      try {
        const res = await fetch("/api/admin/studio/agents/delegate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            directive: directiveText,
            source: "director_voice",
            mode: "sync",
            sessionId: studioSessionId,
            autoExecute: isAutoExecution,
          }),
        });
        const json = await res.json().catch(() => null);
        const pipeline = (json?.data?.articlePipeline || null) as ArticlePipelineClient | null;
        const askedArticle = isArticleDirective(directiveText);
        if (pipeline && askedArticle) {
          setArticlePipeline(pipeline);
          const failed = pipeline.stages?.find((stage) => stage.status === "failed");
          setHudArticleSnapshot({
            slug: pipeline.published ? pipeline.slug : pipeline.articleId || "UNPUBLISHED",
            destination: pipeline.destinationLabel || "UNRESOLVED",
            status: pipeline.published ? "PUBLISHED" : "FAILED",
            detail: (pipeline.blockedReason || failed?.error || failed?.outcome || "OK").slice(0, 120),
          });
          if (!pipeline.published) return `لم يُنشر المقال. ${pipeline.blockedReason || failed?.error || ""}`;
          return `نُشر المقال ${pipeline.directUrl}`;
        }
        if (pipeline && !askedArticle) setArticlePipeline(null);
        if (!res.ok) return `تعذر تنفيذ الطلب: ${json?.error || res.status}`;
        return json?.data?.tacticalIntentAr || json?.data?.finalDecision?.executiveSummaryAr || "تم استلام التوجيه.";
      } catch (err) {
        console.warn("[Studio] Swarm deliberation error:", err);
        return "تعذر الاتصال بمسار المقال. لم يُنشر شيء.";
      }
    },
    [studioSessionId, isAutoExecution]
  );

  const [submittedUserDirective, setSubmittedUserDirective] = useState<{ id: string; text: string; time: string } | null>(null);
  const [isMcpWindowOpen, setIsMcpWindowOpen] = useState<boolean>(false);

  // Sovereign Voice Engine (Hardware Mic + Continuous VAD + Edge Neural TTS + Echo Suppression)
  const {
    isActive: isListening,
    isUserSpeaking,
    isAgentSpeaking,
    isProcessing,
    lastSpokenText,
    agentResponseText,
    audioFrequencies,
    startListening,
    toggleVoice,
    stopListening,
    speakAgentResponse,
  } = useSovereignVoice({
    selectedVoice: useAgentStore((s) => s.talkTarget)?.voice || "ar-SA-HamedNeural",
    silenceThresholdMs: 3200,
    locale: "ar",
    soundFxEnabled: true,
    onDirectiveSubmit: async (directiveText) => {
      setSubmittedUserDirective({
        id: String(Date.now()),
        text: directiveText,
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      });
      const aimed = await replyAsSelectedAgent(directiveText);
      if (aimed === false) return;
      const fact = await factualReply(directiveText);
      if (fact) return fact;
      if (aimed) return aimed;
      const focus = resolveDomainFocus(directiveText);
      if (focus && /(افتح|اعرض|ورني|انتقل|روح)/.test(directiveText)) {
        openScreen(focus.screenId, focus.hubId);
        return `فتحت ${focus.label}. أي إجراء كتابي يمر عبر خلية الوكلاء والاعتماد.`;
      }
      const intent = focus ? null : resolveStudioVoiceIntent(directiveText);
      if (focus) openScreen(focus.screenId, focus.hubId);
      if (intent) {
        openScreen(intent.screenId);
        setFocusDomainId(intent.domainId ?? null);
        const hub = getMap("atlas")?.hubs.find((h) => directiveText.includes(h.label));
        if (hub) setFocusNodeId(hub.id);
        setSubmittedUserDirective({
          id: String(Date.now()),
          text: directiveText,
          time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        });
        return intent.reply;
      }
      setSubmittedUserDirective({
        id: String(Date.now()),
        text: directiveText,
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      });
      const reply = await dispatchDirectiveToSwarm(directiveText);
      return reply;
    },
  });

  useEffect(() => {
    if (currentScreenId !== "20") useAgentStore.getState().setTalkTarget(null);
  }, [currentScreenId]);

  // Synchronize incoming audio and status with 3D Humanoid Avatar Store
  useEffect(() => {
    if (isAgentSpeaking) {
      const avg = audioFrequencies.reduce((a, b) => a + b, 0) / (audioFrequencies.length || 1);
      useAvatarStore.getState().setState("speaking", { voiceLevel: Math.max(0.25, avg * 1.6) });
    } else if (isUserSpeaking) {
      const avg = audioFrequencies.reduce((a, b) => a + b, 0) / (audioFrequencies.length || 1);
      useAvatarStore.getState().setState("listening", { userAudioLevel: Math.max(0.2, avg * 1.5) });
    } else if (isProcessing) {
      useAvatarStore.getState().setState("thinking", { intensity: 0.9 });
    } else {
      useAvatarStore.getState().setState("idle");
    }
  }, [isAgentSpeaking, isUserSpeaking, isProcessing, audioFrequencies]);

  function openScreen(id: string, focus: string | null = null) {
    if (id === "01" && currentScreenId !== "01") setDepthLevel(0);
    if (id === "01") void focusDomainId;
    if (id === "02" && currentScreenId !== "02") setDepthLevel(3);
    if ((id === "03" || domainScreen(id)) && currentScreenId !== id) setDepthLevel(2);
    setFocusNodeId(focus);
    setCurrentScreenId(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("screen", id);
      window.history.replaceState(null, "", url.toString());
    }
  }

  /** يعرض الوكيل شبكة القسم الذي تخصه المهمة قبل أن تبدأ الخلية بالعمل عليها. */
  function showTaskNetwork(text: string) {
    const focus = resolveDomainFocus(text);
    if (focus) openScreen(focus.screenId, focus.hubId);
  }

  async function replyAsSelectedAgent(directiveText: string): Promise<string | false | null> {
    const routed = await runLocalCommand(directiveText);
    if (routed !== null) return routed;
    const store = useAgentStore.getState();
    const target = currentScreenId === "20" ? store.talkTarget : null;
    if (!target && !store.coordinate && routeUtterance(directiveText, { screenId: currentScreenId, last: lastNav }).kind !== "discuss") {
      store.setLastSpeaker("الوكيل المشرف");
      return null;
    }
    const res = await fetch("/api/admin/studio/agents/speak", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agentId: target?.id, text: directiveText, mode: store.coordinate || routeUtterance(directiveText, { screenId: currentScreenId, last: lastNav }).kind === "discuss" ? "coordinate" : "reply" }),
    });
    const data = (await res.json()) as { ok?: boolean; lines?: { agentId?: string; nameAr: string; voice: string; text: string }[]; error?: string };
    const lines = data.lines || [];
    if (!lines.length) return null;
    for (const line of lines) {
      window.dispatchEvent(new CustomEvent("studio:chat-line", { detail: { speaker: line.nameAr, text: line.text } }));
    }
    if (!isArticleDirective(directiveText)) setArticlePipeline(null);
    for (const line of lines) {
      useAgentStore.getState().setSpeakingId(line.agentId || "supervisor");
      useAgentStore.getState().setLastSpeaker(line.nameAr);
      await speakAgentResponse(line.text, line.voice);
    }
    if (/(شغل|افتح|فعل)/.test(directiveText) && /لوح/.test(directiveText)) openScreen("01");
    const focus = resolveDomainFocus(directiveText);
    if (focus && /(افتح|اعرض|شغل|انتقل|روح|ورني)/.test(directiveText)) openScreen(focus.screenId, focus.hubId);
    const factual = await factualReply(directiveText);
    if (factual) {
      await saySupervisor(factual);
    }
    useAgentStore.getState().setSpeakingId(null);
    return false;
  }

  async function saySupervisor(text: string) {
    window.dispatchEvent(new CustomEvent("studio:chat-line", { detail: { speaker: "الوكيل المشرف", text } }));
    useAgentStore.getState().setSpeakingId("supervisor");
    useAgentStore.getState().setLastSpeaker("الوكيل المشرف");
    await speakAgentResponse(text, "ar-SA-HamedNeural");
    useAgentStore.getState().setSpeakingId(null);
  }

  async function openBriefing(kind: "radar" | "readiness" | "travel") {
    const res = await fetch(`/api/admin/studio/briefing?kind=${kind}`).catch(() => null);
    const json = await res?.json().catch(() => null);
    window.dispatchEvent(new CustomEvent("studio:open-briefing", { detail: json?.ok ? json : { ok: false, error: "تعذر قراءة السجلات." } }));
    if (!json?.ok) return "تعذر فتح التقرير لأن قراءة السجلات فشلت.";
    if (kind === "readiness") return `فتحت تقرير جاهزية المنصة. غير الموصول ${json.gapCount} من ${json.systemCount}.`;
    if (kind === "travel") {
      const visits = json.counts?.find((row: { name: string; total: number | null }) => row.name === "site_traffic_logs");
      const articles = json.counts?.find((row: { name: string; total: number | null }) => row.name === "articles");
      const bookings = json.counts?.find((row: { name: string; total: number | null }) => row.name === "hotel_bookings");
      return `فتحت تقرير الموقع. الزيارات ${visits?.total ?? "غير مقروءة"}. المقالات ${articles?.total ?? "غير مقروءة"}. حجوزات الفنادق ${bookings?.total ?? "غير مقروءة"}.`;
    }
    return `فتحت تقرير رادار الشركات. العدد ${json.leads?.total ?? 0}.`;
  }

  async function runLocalCommand(text: string): Promise<string | false | null> {
    const ctx = { screenId: currentScreenId, last: lastNav };
    const resolved = resolveIntent(text, ctx);
    if (resolved.nodeId) {
      window.dispatchEvent(new CustomEvent("studio:index-node", { detail: { nodeId: resolved.nodeId } }));
    }
    const plans = plansFromIntent(text, ctx);
    for (const plan of plans) {
      if (plan.capabilityId === "studio.open_table" && plan.input.collection) {
        window.dispatchEvent(
          new CustomEvent("studio:capability-ui", {
            detail: { capabilityId: "studio.open_table", input: plan.input },
          })
        );
        await saySupervisor(`فتحت جدول ${plan.input.collection}.`);
        return false;
      }
    }
    const route = routeUtterance(text, ctx);
    if (route.kind === "clarify" && route.question) {
      await saySupervisor(route.question);
      return false;
    }
    if (route.kind === "navigate" && route.target) {
      openScreen(route.target.screenId, route.target.hubId);
      setLastNav(route.target);
      await saySupervisor(`فتحت ${route.target.label}.`);
      return false;
    }
    if (route.kind === "readiness" || route.kind === "radar" || route.kind === "travel") {
      await saySupervisor(await openBriefing(route.kind));
      return false;
    }
    if (route.kind === "discuss") return null;
    return null;
  }

  async function factualReply(text: string): Promise<string | null> {
    return null;
    void text;
  }

  const askAgentFromStage = async (directive: string) => {
    const agent = useAgentStore.getState();
    agent.push({ kind: "directive", text: directive });
    agent.setPhase("thinking");
    showTaskNetwork(directive);
    const reply = await dispatchDirectiveToSwarm(directive);
    useAgentStore.getState().push({ kind: "reply", text: reply });
    if (useAgentStore.getState().phase === "thinking" || useAgentStore.getState().phase === "planning") useAgentStore.getState().setPhase("idle");
    void speakAgentResponse(reply);
    return reply;
  };

  /** الواجهات التي تعمل على الغلاف السيبراني الموحد (خرائط حية + نوافذ + وكيل). */
  const isShellScreen = ["01", "02", "03", "17", "18", "19"].includes(currentScreenId) || !!domainScreen(currentScreenId);

  // اللوحة السيبرانية تملك التمرير كله: لا تمرير لصفحة الإدارة خلفها.
  useEffect(() => {
    const html = document.documentElement;
    const prev = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev[0];
      document.body.style.overflow = prev[1];
    };
  }, []);

  const handleResetWindows = () => {
    setResetWindowsKey((k) => k + 1);
    setAtlasZoom(1);
    setAtlasPan(false);
  };

  return (
    <div
      dir="ltr"
      className="cyber-console fixed inset-0 z-[999999] w-screen h-screen overflow-hidden text-slate-100 font-sans select-none"
      style={{
        direction: "ltr",
        backgroundColor: "#000407",
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(6, 32, 68, 0.7) 0%, rgba(1, 8, 20, 0.95) 60%, #000407 100%),
          linear-gradient(rgba(0, 229, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 229, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 32px 32px, 32px 32px",
      }}
    >
      <CyberScrollStyle />
      {/* 1. TOP CHROME HEADER & BOTTOM DOCK BAR (z-50); screen 02 draws its own */}
      {currentScreenId !== "02" && !isShellScreen && (
      <StudioChromeHeaderAndDock
        currentScreenTitle={currentScreen.title}
        currentScreenSubtitle={
          currentScreenId === "01" ? "منصة عمليات المعرفة المؤسسية" : currentScreen.scope
        }
        depthLevel={depthLevel}
        onSelectDepthLevel={setDepthLevel}
        isListening={isListening}
        onToggleListening={toggleVoice}
        onStopListening={stopListening}
        onResetWindows={handleResetWindows}
        onToggleMcpWindow={() => setIsMcpWindowOpen((v) => !v)}
        isAutoExecution={isAutoExecution}
        onToggleAutoExecution={handleToggleAutoExecution}
        onOpenScreenSwitcher={() => setIsScreenSelectorOpen(true)}
        onExitHome={onExit || (() => { window.location.href = "/admin"; })}
        audioFrequencies={audioFrequencies}
        panActive={atlasPan}
        onTogglePan={() => setAtlasPan((value) => !value)}
        onZoomIn={() => setAtlasZoom((value) => Math.min(1.8, Number((value + 0.1).toFixed(2))))}
        onZoomOut={() => setAtlasZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(2))))}
        dockNote={currentScreenId === "01" ? dockNote : undefined}
        onOpenHelp={() => setIsReferenceModalOpen(true)}
        showAgentControls={currentScreenId === "20"}
      />
      )}

      {/* 2. FULLSCREEN 3D CANVAS VIEW (Fixed absolute inset-0, z-0) */}
      <main className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {/* PRIMARY VIEW: Screen 20 (Humanoid Agent Presence) */}
        {currentScreenId === "20" && !isShellScreen ? (
          <HumanoidPresenceMasterView
            isSpeaking={isAgentSpeaking}
            isListening={isUserSpeaking || isListening}
            frequencies={audioFrequencies}
          />
        ) : isShellScreen ? (
          <StudioShell
            screenId={currentScreenId}
            sessionId={studioSessionId}
            resetKey={resetWindowsKey}
            focusNodeId={focusNodeId}
            onScreenChange={(id) => openScreen(id)}
            onAskAgent={askAgentFromStage}
            isAutoExecution={isAutoExecution}
            isListening={isListening}
            isUserSpeaking={isUserSpeaking}
            isAgentSpeaking={isAgentSpeaking}
            isProcessing={isProcessing}
            audioFrequencies={audioFrequencies}
            onToggleListening={toggleVoice}
            onStopListening={stopListening}
            onOpenScreenSwitcher={() => setIsScreenSelectorOpen(true)}
            onExitHome={() => openScreen("20")}
            onOpenHelp={() => setIsReferenceModalOpen(true)}
            onOpenSettings={() => setIsMcpWindowOpen((v) => !v)}
          />
        ) : currentScreenId === "02" ? (
          <CumulativeExpansionStage
            key={resetWindowsKey}
            depthLevel={depthLevel}
            onSelectDepthLevel={setDepthLevel}
            zoom={atlasZoom}
            onZoomIn={() => setAtlasZoom((value) => Math.min(1.8, Number((value + 0.1).toFixed(2))))}
            onZoomOut={() => setAtlasZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(2))))}
            panEnabled={atlasPan}
            onTogglePan={() => setAtlasPan((value) => !value)}
            onResetWindows={handleResetWindows}
            isListening={isListening}
            isAgentSpeaking={isAgentSpeaking}
            audioFrequencies={audioFrequencies}
            onToggleListening={toggleVoice}
            onStopListening={stopListening}
            onOpenScreen={openScreen}
            onOpenScreenSwitcher={() => setIsScreenSelectorOpen(true)}
            onExitHome={onExit || (() => { window.location.href = "/admin"; })}
            onOpenHelp={() => setIsReferenceModalOpen(true)}
            onOpenSettings={() => setIsMcpWindowOpen((v) => !v)}
            onFreshness={setDockNote}
          />
        ) : (
          /* Other Screens (02..19) sharing the exact pure cybernetic frame */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-3xl p-8 rounded-3xl bg-[#021327]/80 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-400 bg-cyan-950/60 flex items-center justify-center shadow-[0_0_20px_#00e5ff]">
                <span className="text-xl font-bold font-mono text-cyan-300">{currentScreen.id}</span>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white font-sans">{currentScreen.title}</h2>
                <p className="text-sm text-cyan-200/80 font-sans max-w-xl leading-relaxed">
                  {currentScreen.scope}
                </p>
              </div>

              {/* Operational Nodes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                {currentScreen.nodes.map((node) => (
                  <div
                    key={node}
                    className="p-3 rounded-xl bg-[#010a16] border border-cyan-500/30 text-right text-xs font-mono text-cyan-300 flex items-center justify-between"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
                    <span className="text-white font-bold">{node}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsReferenceModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 font-mono text-xs transition-all cursor-pointer"
                >
                  عرض الصورة المرجعية الأصلية (100% المطابقة)
                </button>
                <button
                  onClick={() => openScreen("20")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold font-mono text-xs shadow-[0_0_15px_#ffb54c] cursor-pointer"
                >
                  العودة للمجسم البشري الرئيسي
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. FLOATING GLASSMORPHIC HUD WINDOWS (Layers on top with z-40) */}
      {!isShellScreen && (
      <StudioFloatingWindows
        sessionId={studioSessionId}
        isListening={isListening}
        isUserSpeaking={isUserSpeaking}
        isAgentSpeaking={isAgentSpeaking}
        isProcessing={isProcessing}
        audioFrequencies={audioFrequencies}
        lastSpokenText={lastSpokenText}
        agentResponseText={agentResponseText}
        submittedUserDirective={submittedUserDirective}
        isMcpWindowOpen={isMcpWindowOpen}
        onToggleMcpWindow={() => setIsMcpWindowOpen((v) => !v)}
        isAutoExecution={isAutoExecution}
        resetKey={resetWindowsKey}
        onSelectScreen={(id) => openScreen(id)}
        articlePipeline={articlePipeline}
        showWindowRestore={currentScreenId !== "01" && currentScreenId !== "02" && currentScreenId !== "03" && !domainScreen(currentScreenId)}
        onSendDirective={async (text) => {
          const aimed = await replyAsSelectedAgent(text);
          if (aimed === false) return "";
          const fact = await factualReply(text);
          if (fact) return fact;
          if (aimed) return aimed;
          showTaskNetwork(text);
          const reply = await dispatchDirectiveToSwarm(text);
          await speakAgentResponse(reply);
          return reply;
        }}
      />
      )}

      {/* 4. MODALS & TOOLS */}
      {/* Screen Selector Modal */}
      <CyberSidebar
        open={isScreenSelectorOpen}
        onClose={() => setIsScreenSelectorOpen(false)}
        currentScreenId={currentScreenId}
        onOpenScreen={(id, hub) => openScreen(id, hub ?? null)}
      />

      {/* MCP 21 Servers & 88 Tools Dispatcher Modal */}
      <McpActionDispatcherModal
        isOpen={isMcpDispatcherOpen}
        onClose={() => setIsMcpDispatcherOpen(false)}
        onExecuteSuccess={(res) => {
          console.log("MCP execution result:", res);
        }}
      />

      {/* 100% Original Reference Image Comparator Modal */}
      <ReferenceImageModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        currentScreenId={currentScreenId}
      />
    </div>
  );
}
