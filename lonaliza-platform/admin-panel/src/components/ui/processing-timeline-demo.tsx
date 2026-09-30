"use client";

import * as React from "react";
import ProcessingTimeline, {
  type ProcessingStage,
} from "@/components/ui/processing-timeline";

const STAGES: ProcessingStage[] = [
  {
    id: "directive_parse",
    label: "تحليل وتفكيك التوجيه السيادي",
    description: "استيعاب نية المشرف وتحديد الوكلاء المعنيين من سرب المنظومة.",
    status: "completed",
    duration: 850,
  },
  {
    id: "mcp_audit",
    label: "فحص واستدعاء خوادم MCP",
    description: "مطابقة الأدوات الـ 52 المكشوفة والتحقق من صحة الاتصال بالخوادم الـ 17.",
    status: "completed",
    duration: 1420,
  },
  {
    id: "swarm_react",
    label: "استدلال وتخطيط السرب التكتيكي (ReAct)",
    description: "توليد مقترحات الوكلاء وفحص المخزون الفعلي لطرابزون وإسطنبول وبوابات الدفع.",
    status: "active",
    progress: 68,
  },
  {
    id: "adversarial_audit",
    label: "التدقيق المالي والسيبراني المعاكس",
    description: "فحص هامش الربح (ألا يقل عن 15%) وتدقيق قيود الإنفاق والسلامة التشغيلية.",
    status: "pending",
  },
  {
    id: "consensus_synthesis",
    label: "التوافق الجماعي وإصدار القرار التنفيذي",
    description: "اعتماد التقرير التنفيذي النهائي وبثه على قنوات المنظومة الحية.",
    status: "pending",
    skippable: true,
  },
];

export default function ProcessingTimelineDemo() {
  return (
    <div className="w-full max-w-xl">
      <ProcessingTimeline
        title="مهمة إدارة المحتوى والتسويق السياحي"
        subtitle="حزمة طرابزون صيف 2026 · Swarm Deliberation"
        stages={STAGES}
        currentStageId="swarm_react"
      />
    </div>
  );
}
