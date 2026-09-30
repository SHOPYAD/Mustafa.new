import { norm } from "@/lib/studio/capabilities/agent-plan";

export interface WorkflowStep {
  capabilityId: string;
  input?: Record<string, unknown>;
  /** مفتاح في مخرجات الخطوة السابقة يُدمج في input */
  inputFromPrevious?: string;
  dryRun?: boolean;
}

export interface WorkflowDef {
  id: string;
  labelAr: string;
  match: RegExp;
  steps: WorkflowStep[];
}

export const WORKFLOWS: WorkflowDef[] = [
  {
    id: "executive_pulse",
    labelAr: "نبض تنفيذي للمنصة",
    match: /(نبض المنصه|نبض المنصة|المقاييس التنفيذيه|المقاييس التنفيذية|executive pulse)/,
    steps: [
      { capabilityId: "studio.open_screen", input: { screenId: "19" } },
      { capabilityId: "briefing.readiness", input: {}, dryRun: true },
      { capabilityId: "finance.overview.read", input: {}, dryRun: true },
    ],
  },
  {
    id: "cancellation_review",
    labelAr: "مراجعة طلبات الإلغاء",
    match: /(مراجعه الالغاء|مراجعة الإلغاء|طلبات الالغاء المعلقه|cancellation review)/,
    steps: [
      { capabilityId: "bookings.cancellation.list", input: {}, dryRun: true },
      { capabilityId: "studio.open_table", input: { collection: "hotel_bookings", q: "cancel" } },
    ],
  },
  {
    id: "automation_launch",
    labelAr: "إطلاق استوديو الأتمتة",
    match: /(اطلاق الاتمت|إطلاق الأتمتة|شغّل التدflow|شغل التدflow|automation launch)/,
    steps: [
      { capabilityId: "studio.open_screen", input: { screenId: "22" } },
      { capabilityId: "loops.run", input: {}, dryRun: true },
    ],
  },
];

export function matchWorkflow(directive: string): WorkflowDef | null {
  const d = norm(directive);
  for (const wf of WORKFLOWS) {
    if (wf.match.test(d)) return wf;
  }
  return null;
}
