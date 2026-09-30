# Cyber Console — البنية المعتمدة

الاستوديو السيبراني لوحة إدارة بديلة: خرائط عصبية حية بكامل الشاشة، نوافذ موحدة، والقرص الأوسط هو الوكيل المشرف العام.
المرجع البصري: `lonaliza-neural-studio-complete-handoff/images/NN-*.png` (1672×941 وحدات تصميم، لا إطار ثابت).

## الطبقات

```mermaid
flowchart TB
  subgraph ui [DOM]
    Shell[StudioShell]
    WinMgr[window-store]
    Explorer[ShellExplorer]
  end
  subgraph scene [Scene]
    Camera[camera.ts]
    Graph[graph/*]
    Layout[layout/radial.ts]
    Renderer[render/neural-renderer.ts]
    Core[render/agent-core.ts]
  end
  subgraph agent [Agent]
    Voice[useSovereignVoice]
    AgentStore[agent/agent-store.ts]
    Stream["/api/admin/automation/agent-stream (auth)"]
  end
  subgraph server [Server]
    Reg[capabilities/registry.ts]
    Exec["/api/admin/studio/capabilities/execute"]
    Swarm[langgraph-engine]
    PB[(PocketBase)]
  end
  Voice --> AgentStore
  Stream --> AgentStore
  AgentStore --> Core
  AgentStore --> Graph
  Graph --> Layout --> Renderer
  Camera --> Renderer
  WinMgr --> Exec
  Swarm --> Reg --> Exec --> PB
  Exec --> Stream
```

## خريطة الملفات (admin-panel/src)

| المسؤولية | الملف |
|---|---|
| رموز الهوية (ألوان، خطوط، حواف، توهج) | `lib/studio/tokens.ts` |
| كاميرا world→screen، fit، flyTo | `lib/studio/camera.ts` |
| أنواع العقد والعلاقات والخرائط | `lib/studio/graph/types.ts` |
| خريطة L0 (الأطلس) من admin-nav | `lib/studio/graph/atlas-map.ts` |
| خرائط L1/L2 من domain-systems | `lib/studio/graph/domain-map.ts` |
| تخطيط شعاعي بلا تصادم | `lib/studio/layout/radial.ts` |
| رسم الأعصاب الثابت + الطبقة الحية | `lib/studio/render/neural-renderer.ts` |
| القرص الأوسط حسب حالة الوكيل | `lib/studio/render/agent-core.ts` |
| حالة الوكيل (آلة حالات) | `lib/studio/agent/agent-store.ts` |
| حالة النوافذ | `lib/studio/windows/window-store.ts` |
| سجل القدرات (مشترك) | `lib/studio/capabilities/registry.ts` |
| منفذ القدرات (خادم فقط) | `lib/studio/capabilities/executor.server.ts` |
| الغلاف | `components/admin/automation/hud/studio/shell/StudioShell.tsx` |
| النوافذ | `components/admin/automation/hud/studio/shell/windows/*.tsx` |

## العقود

```ts
type NodeKind = "agent" | "domain" | "system" | "entity" | "setting" | "action";
interface GraphNode { id: string; kind: NodeKind; label: string; parentId?: string; domainId: string;
  tone: Tone; icon?: IconKey; href?: string; collection?: string; route?: string;
  capabilityRefs: string[]; childMapId?: string; }
interface GraphEdge { id: string; source: string; target: string;
  relationType: "contains" | "depends_on" | "calls" | "produces" | "observed_flow"; evidenceRef: string; }
interface GraphMap { id: string; level: 0 | 1 | 2; title: string; parentMapId?: string; rootId: string;
  nodes: GraphNode[]; edges: GraphEdge[]; screenId: string; }
```

- العقدة لا تُنسخ بين خريطتين؛ الخريطة الفرعية تُعرّف بـ `childMapId`.
- الحالة الحية (عدد سجلات، freshness) تأتي من الخادم وتُخزن خارج الخريطة: `liveCounts[collection]`.

## آلة حالات الوكيل

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> listening: mic active / user speaking
  listening --> thinking: directive submitted
  thinking --> planning: stage event
  planning --> executing: tool/capability event
  executing --> awaiting_approval: preview requires approval
  awaiting_approval --> executing: approved
  executing --> speaking: decision / reply
  speaking --> idle: TTS ended
  thinking --> error
  executing --> error
  error --> idle
```

المصادر: `useSovereignVoice` (isUserSpeaking, isAgentSpeaking, isProcessing, audioFrequencies) + SSE `agent-stream` (type: stage/tool/decision/log) + منفذ القدرات (preview/result).

## تدفق تنفيذ القدرة

```mermaid
sequenceDiagram
  participant U as المدير
  participant S as Studio
  participant E as execute route
  participant B as PocketBase
  U->>S: طلب/صوت
  S->>E: {capabilityId, input, dryRun:true}
  E-->>S: preview (الأثر، المدخلات، risk)
  S->>U: ActionPreviewWindow (إن كان risk=high أو التنفيذ الذاتي مغلق)
  U->>S: اعتماد
  S->>E: {dryRun:false, idempotencyKey, approvalRef}
  E->>B: كتابة
  E-->>S: result + حدث SSE
```

## التنقل بين الخرائط
L0 الأطلس → L1 مجال → L2 نظام → L3 نافذة. `flyTo` 700ms ثم تبديل الخريطة وتلاشي. الرجوع يعيد الكاميرا والتحديد المحفوظين في `mapHistory`.

## كامل الشاشة
- `StudioShell` = `position: fixed; inset: 0`. لا letterbox.
- الكاميرا تحوّل وحدات التصميم إلى الشاشة: `k = min((W - reservedX) / worldW, (H - reservedY) / worldH)`، والخلفية تُرسم على كامل W×H.
- النوافذ مرتكزة على الحواف بوحدات CSS، وتنكمش مع `clamp()` على الشاشات الصغيرة.
