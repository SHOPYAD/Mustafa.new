import React from "react";
import { createRoot } from "react-dom/client";
import StudioShell from "@/components/admin/automation/hud/studio/shell/StudioShell";
import { useAgentStore, type AgentPhase } from "@/lib/studio/agent/agent-store";
import { CyberSidebar } from "@/components/admin/automation/hud/studio/shell/CyberSidebar";
import { CyberScrollStyle } from "@/components/admin/automation/hud/studio/shell/CyberScrollStyle";

const sp = new URLSearchParams(location.search);
const phase = (sp.get("state") || undefined) as AgentPhase | undefined;
const levels = Array.from({ length: 24 }, (_, i) => 0.35 + 0.5 * Math.abs(Math.sin(i * 0.9)));
const noop = () => {};

// أداة اختبار فقط: مهام جارية لرؤية أقمار الوكلاء ونافذة الخلية.
if (sp.get("swarm") === "1") {
  const now = new Date().toISOString();
  useAgentStore.getState().setBoard(
    [
      { id: "panel_operator", nameAr: "وكيل تشغيل اللوحة", titleAr: "ينفذ إجراءات الأقسام", color: "#4fe6ff" },
      { id: "sales", nameAr: "وكيل المبيعات والأتمتة", titleAr: "واتساب والصفقات", color: "#34d399" },
      { id: "social", nameAr: "وكيل النشر والمحتوى الاجتماعي", titleAr: "المحتوى والجدولة", color: "#c084fc" },
    ],
    [
      { id: "t1", agentId: "panel_operator", agentNameAr: "وكيل تشغيل اللوحة", directive: "اعرض طلبات الإلغاء المعلقة", status: "running", startedAt: now, steps: [{ at: now, text: "قدرة: bookings.cancellation.list" }], nodeId: "domain.bookings" },
      { id: "t2", agentId: "sales", agentNameAr: "وكيل المبيعات والأتمتة", directive: "راجع العملاء الجدد", status: "running", startedAt: now, steps: [{ at: now, text: "مداولة خلية الوكلاء" }], nodeId: "domain.customers" },
      { id: "t3", agentId: "social", agentNameAr: "وكيل النشر والمحتوى الاجتماعي", directive: "جهز منشورات الأسبوع", status: "running", startedAt: now, steps: [{ at: now, text: "بدأ العمل" }], nodeId: "domain.marketing" },
    ]
  );
}

function Harness() {
  const [screen, setScreen] = React.useState(sp.get("screen") || "01");
  const [side, setSide] = React.useState(sp.get("sidebar") === "1");
  return (
    <div className="cyber-console">
    <CyberScrollStyle />
    <CyberSidebar open={side} onClose={() => setSide(false)} currentScreenId={screen} onOpenScreen={(id) => setScreen(id)} />
    <StudioShell
      screenId={screen}
      onScreenChange={setScreen}
      isListening={phase === "listening"}
      isUserSpeaking={phase === "listening"}
      isAgentSpeaking={phase === "speaking"}
      audioFrequencies={phase === "listening" || phase === "speaking" ? levels : []}
      onToggleListening={noop}
      onStopListening={noop}
      onOpenScreenSwitcher={() => setSide(true)}
      onExitHome={noop}
      onOpenHelp={noop}
      onOpenSettings={noop}
      focusNodeId={sp.get("focus")}
      forcePhase={phase}
      onAskAgent={async () => "ok"}
    />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Harness />);
