import type { AutomationJobType } from "@/lib/automation/types";

export type BlueprintNodeType =
  | "trigger"
  | "rag"
  | "intelligence"
  | "model"
  | "skill"
  | "rule"
  | "action"
  | "review";

export type BlueprintNodeStatus = "idle" | "running" | "completed" | "error";

export interface BlueprintNode {
  id: string;
  type: BlueprintNodeType;
  title: string;
  subtitle: string;
  details: string;
  status?: BlueprintNodeStatus;
  model?: string;
  skills?: string[];
  rules?: string[];
  memoryContext?: string;
  parameters: Record<string, string | number | boolean>;
  position?: { x: number; y: number };
}

export interface BlueprintConnection {
  id: string;
  from: string;
  to: string;
}

export type BlueprintSector =
  | "ads"
  | "social"
  | "video"
  | "articles"
  | "tours"
  | "distribution";

export interface BlueprintLoop {
  id: string;
  name: string;
  sector: BlueprintSector;
  description?: string;
  schedule?: string;
  nodes: BlueprintNode[];
  connections: BlueprintConnection[];
}

export type CredentialProvider =
  | "meta_ads"
  | "google_ads"
  | "social_accounts"
  | "whatsapp"
  | "telegram"
  | "pexels"
  | "unsplash"
  | "gemini";

export interface CredentialRequirement {
  provider: CredentialProvider;
  labelAr: string;
  fields: string[];
  testRoute?: string;
  settingsUrl?: string;
}

export interface BlueprintGraphValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface BlueprintNodeStepResult {
  nodeId: string;
  nodeType: BlueprintNodeType;
  title: string;
  ok: boolean;
  message: string;
  dryRun: boolean;
  halted?: boolean;
  durationMs: number;
  details?: Record<string, unknown>;
}

export interface BlueprintExecuteResult {
  ok: boolean;
  loopId: string;
  dryRun: boolean;
  blockedCredentials?: boolean;
  credentialGaps?: CredentialRequirement[];
  graphErrors?: string[];
  steps: BlueprintNodeStepResult[];
  message: string;
  completedPct: number;
  haltedNodeId?: string;
  resumeToken?: string;
}

export interface BlueprintExecuteOptions {
  loop: BlueprintLoop;
  dryRun?: boolean;
  nodeId?: string;
  source?: "manual" | "voice" | "agent";
  resumeFromNodeId?: string;
}

export const SECTOR_DEFAULT_JOB_TYPE: Record<BlueprintSector, AutomationJobType> = {
  ads: "ads.lookalike",
  social: "studio.schedule_publish",
  video: "studio.generate_video",
  articles: "articles.research_and_publish",
  tours: "programs.discover_and_draft",
  distribution: "pricing.watch",
};

export function normalizeBlueprintNodeType(type: BlueprintNodeType): BlueprintNodeType {
  return type === "intelligence" ? "rag" : type;
}
