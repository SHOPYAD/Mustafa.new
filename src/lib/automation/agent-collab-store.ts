import fs from "fs";
import path from "path";

export type AgentRole = string;

export type SwarmDecisionActionType =
  | "budget_shift"
  | "campaign_pause"
  | "content_launch"
  | "email_broadcast"
  | "pricing_tweak"
  | "create_automation_job"
  | "create_blog_article"
  | "create_tourism_service"
  | "launch_meta_ad"
  | "publish_social_post"
  | "general_coordination";

export interface SwarmAgentInfo {
  id: AgentRole;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  avatarIcon: string;
  color: string;
  currentStatus: "idle" | "thinking" | "active" | "optimizing";
  currentTaskAr: string;
  keyMetric: string;
  lastActive: string;
  enabled?: boolean;
  isCustom?: boolean;
  connected?: boolean;
  metricSource?: string;
  skillCount?: number;
  toolCount?: number;
}

export interface SwarmDiscussionMessage {
  id: string;
  fromAgent: AgentRole;
  toAgent?: AgentRole | "all";
  type: "insight" | "recommendation" | "proposal" | "query" | "directive" | "decision";
  topic: string;
  contentAr: string;
  timestamp: string;
  impactLevel: "low" | "medium" | "high" | "critical";
  proposalData?: {
    actionType: SwarmDecisionActionType;
    targetPlatform?: string;
    suggestedChange?: string;
    estimatedRoiGain?: string;
    estimatedCostUSD?: number;
    decisionId?: string;
  };
}

export interface PendingApprovalDecision {
  id: string;
  titleAr: string;
  descriptionAr: string;
  proposedBy: AgentRole;
  affectedAgent: AgentRole;
  actionType: SwarmDecisionActionType;
  costUSD?: number;
  expectedBenefitAr: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  decidedAt?: string;
  adminNote?: string;
  executablePlan?: {
    actionType: SwarmDecisionActionType;
    actionPayload?: Record<string, unknown>;
  };
  actionPayload?: Record<string, unknown>;
  executionResult?: {
    success: boolean;
    summaryAr: string;
    directUrl?: string;
  };
}

export interface AdminDirective {
  id: string;
  text: string;
  targetAgent: AgentRole | "all";
  createdAt: string;
  status: "received" | "executing" | "completed";
}

const DATA_DIR = path.join(process.cwd(), ".data", "agent-swarm");
const DISCUSSIONS_FILE = path.join(DATA_DIR, "discussions.json");
const DECISIONS_FILE = path.join(DATA_DIR, "decisions.json");
const DIRECTIVES_FILE = path.join(DATA_DIR, "directives.json");

export const DEFAULT_AGENTS: SwarmAgentInfo[] = [
  {
    id: "sales",
    nameAr: "وكيل المبيعات والأتمتة",
    nameEn: "AI Sales & CRM Director",
    titleAr: "إدارة محادثات واتساب والسوشيال وإغلاق الصفقات",
    avatarIcon: "Briefcase",
    color: "emerald",
    currentStatus: "active",
    currentTaskAr: "متابعة 5 أرقام واتساب وتصنيف جودة العملاء",
    keyMetric: "94% دقة الردود و 32 صفقة هذا الأسبوع",
    lastActive: new Date().toISOString(),
  },
  {
    id: "b2b_landing",
    nameAr: "وكيل لوناليزا B2B لصفحة الهبوط",
    nameEn: "Landing B2B Growth Agent",
    titleAr: "إقناع الشركات ومقارنات الجدوى الاقتصادية",
    avatarIcon: "Building2",
    color: "teal",
    currentStatus: "active",
    currentTaskAr: "مساعدة الشركات الزائرة وحساب وفورات السيرفر",
    keyMetric: "متوسط تقييم Lead Score: 88/100",
    lastActive: new Date().toISOString(),
  },
  {
    id: "site_advisor",
    nameAr: "مستشار السفر الذكي بالموقع",
    nameEn: "B2C Site Travel Advisor",
    titleAr: "مساعدة زوار الموقع وحسابات التكلفة والجداول",
    avatarIcon: "Plane",
    color: "sky",
    currentStatus: "active",
    currentTaskAr: "تحليل عمليات البحث عن الفنادق والرحلات المباشرة",
    keyMetric: "أكثر من 140 استعلام سياحي نشط",
    lastActive: new Date().toISOString(),
  },
  {
    id: "ads",
    nameAr: "وكيل الإعلانات والأداء",
    nameEn: "AI Ads & Performance Manager",
    titleAr: "إدارة حملات Google و Meta و TikTok وتحسين العائد",
    avatarIcon: "TrendingUp",
    color: "amber",
    currentStatus: "optimizing",
    currentTaskAr: "مراقبة الإنفاق الإعلاني وتكلفة اكتساب العميل (CAC)",
    keyMetric: "العائد على الإنفاق ROAS: 4.8x",
    lastActive: new Date().toISOString(),
  },
  {
    id: "social",
    nameAr: "وكيل النشر والمحتوى الاجتماعي",
    nameEn: "AI Social Media Strategist",
    titleAr: "إنتاج المحتوى وجدولة المنشورات وتغذية العروض",
    avatarIcon: "Share2",
    color: "purple",
    currentStatus: "active",
    currentTaskAr: "تغذية وكيل المبيعات بآخر عروض وبوستات السوشيال",
    keyMetric: "12 منشوراً تفاعلياً مجدولاً",
    lastActive: new Date().toISOString(),
  },
  {
    id: "email",
    nameAr: "وكيل التسويق بالبريد والحملات",
    nameEn: "AI Email Campaign Manager",
    titleAr: "النشرات البريدية واسترجاع السلات المتروكة",
    avatarIcon: "Mail",
    color: "blue",
    currentStatus: "idle",
    currentTaskAr: "استرجاع سلات الحجز المهجورة وتفعيل حملات الإيميل",
    keyMetric: "معدل فتح الإيميل: 38.5%",
    lastActive: new Date().toISOString(),
  },
];

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getSwarmDiscussions(): SwarmDiscussionMessage[] {
  try {
    ensureDir();
    if (!fs.existsSync(DISCUSSIONS_FILE)) {
      fs.writeFileSync(DISCUSSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(DISCUSSIONS_FILE, "utf-8");
    return JSON.parse(raw) as SwarmDiscussionMessage[];
  } catch {
    return [];
  }
}

export function saveSwarmDiscussionMessage(msg: SwarmDiscussionMessage): void {
  ensureDir();
  const list = getSwarmDiscussions();
  list.unshift(msg);
  fs.writeFileSync(DISCUSSIONS_FILE, JSON.stringify(list.slice(0, 300), null, 2), "utf-8");
}

export function getPendingDecisions(): PendingApprovalDecision[] {
  try {
    ensureDir();
    if (!fs.existsSync(DECISIONS_FILE)) {
      fs.writeFileSync(DECISIONS_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(DECISIONS_FILE, "utf-8");
    return JSON.parse(raw) as PendingApprovalDecision[];
  } catch {
    return [];
  }
}

export function savePendingDecision(decision: PendingApprovalDecision): void {
  ensureDir();
  const list = getPendingDecisions();
  const idx = list.findIndex((d) => d.id === decision.id);
  if (idx >= 0) {
    list[idx] = decision;
  } else {
    list.unshift(decision);
  }
  fs.writeFileSync(DECISIONS_FILE, JSON.stringify(list.slice(0, 100), null, 2), "utf-8");
}

export function updateDecisionStatus(
  id: string,
  status: "approved" | "rejected",
  adminNote?: string
): PendingApprovalDecision | null {
  ensureDir();
  const list = getPendingDecisions();
  const found = list.find((d) => d.id === id);
  if (!found) return null;

  found.status = status;
  found.decidedAt = new Date().toISOString();
  if (adminNote) found.adminNote = adminNote;

  fs.writeFileSync(DECISIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
  return found;
}

export function getAdminDirectives(): AdminDirective[] {
  try {
    ensureDir();
    if (!fs.existsSync(DIRECTIVES_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DIRECTIVES_FILE, "utf-8");
    return JSON.parse(raw) as AdminDirective[];
  } catch {
    return [];
  }
}

export function saveAdminDirective(directive: AdminDirective): void {
  ensureDir();
  const list = getAdminDirectives();
  list.unshift(directive);
  fs.writeFileSync(DIRECTIVES_FILE, JSON.stringify(list.slice(0, 50), null, 2), "utf-8");

  // Also broadcast to discussions so it appears immediately in the live war room stream
  saveSwarmDiscussionMessage({
    id: `disc_dir_${directive.id}`,
    fromAgent: "admin",
    toAgent: directive.targetAgent || "all",
    type: "directive",
    topic: "أمر إداري وتوجيه تنفيذي مباشر",
    contentAr: directive.text,
    timestamp: directive.createdAt || new Date().toISOString(),
    impactLevel: "critical",
  });
}
