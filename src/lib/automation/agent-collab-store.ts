import fs from "fs";
import path from "path";

export type AgentRole =
  | "sales"
  | "b2b_landing"
  | "site_advisor"
  | "ads"
  | "social"
  | "email"
  | "admin";

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
    actionType: "budget_shift" | "campaign_pause" | "content_launch" | "email_broadcast" | "pricing_tweak";
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
  actionType: "budget_shift" | "campaign_pause" | "content_launch" | "email_broadcast" | "pricing_tweak";
  costUSD?: number;
  expectedBenefitAr: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  decidedAt?: string;
  adminNote?: string;
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
      // Seed default initial discussion if empty
      const initial: SwarmDiscussionMessage[] = [
        {
          id: "disc_seed_1",
          fromAgent: "sales",
          toAgent: "ads",
          type: "insight",
          topic: "تحليل جودة العملاء لحملات طرابزون الأخيرة",
          contentAr: "لاحظنا أن العملاء القادمين من حملة إنستغرام لرحلات طرابزون وأوزنجول لديهم جدية عالية بمعدل إغلاق صفقات 38%، بينما حملة التيك توك تولد استفسارات عامة بتكلفة أعلى. نوصي بإعادة توجيه 25% من ميزانية تيك توك إلى إنستغرام.",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          impactLevel: "high",
          proposalData: {
            actionType: "budget_shift",
            targetPlatform: "Meta Instagram Ads",
            suggestedChange: "زيادة ميزانية إنستغرام بـ 150$ وخفض تيك توك",
            estimatedRoiGain: "+28% مبيعات إضافية",
            estimatedCostUSD: 150,
          },
        },
        {
          id: "disc_seed_2",
          fromAgent: "ads",
          toAgent: "sales",
          type: "proposal",
          topic: "خطة تحسين ميزانية الحملات",
          contentAr: "أوافق على التوصية تماماً! قمت بإعداد مقترح تعديل توزيع الميزانية ورفع كفاءة الجمهور المستهدف لرحلات العوائل، وأدرجت القرار في قائمة الموافقات بانتظار اعتماد الإدارة.",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          impactLevel: "medium",
        },
        {
          id: "disc_seed_3",
          fromAgent: "social",
          toAgent: "all",
          type: "insight",
          topic: "تجهيز منشورات وفيديوهات ريلز لرحلات طرابزون",
          contentAr: "تم تجهيز 3 فيديوهات ريلز جديدة تستعرض الفنادق الريفية والسيارات الـ VIP في طرابزون لدعم الحملات الإعلانية ومساعدة وكيل المبيعات في إقناع العملاء بالروابط المباشرة.",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          impactLevel: "medium",
        },
        {
          id: "disc_seed_4",
          fromAgent: "b2b_landing",
          toAgent: "all",
          type: "insight",
          topic: "اهتمام متزايد من شركات السياحة بباقة Pro السحابية",
          contentAr: "تحدثت اليوم مع 4 شركات سياحية عبر الشات العائم بصفحة الهبوط؛ اثنتان منها طلبت عرضاً تفصيلياً (Demo) بعد إجراء مقارنة الجدوى الاقتصادية وإثبات توفير 4,000$ سنوياً.",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          impactLevel: "high",
        },
      ];
      fs.writeFileSync(DISCUSSIONS_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
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
      const initialDecisions: PendingApprovalDecision[] = [
        {
          id: "dec_1",
          titleAr: "إعادة توجيه 150$ من ميزانية الإعلانات لصالح إنستغرام طرابزون",
          descriptionAr: "بناءً على توصية وكيل المبيعات ووكيل الإعلانات، سيتم رفع ميزانية حملة إنستغرام لرحلات طرابزون العائلية لارتفاع معدل إغلاق الحجوزات إلى 38%.",
          proposedBy: "ads",
          affectedAgent: "sales",
          actionType: "budget_shift",
          costUSD: 150,
          expectedBenefitAr: "زيادة الحجوزات المؤكدة بنسبة 28% واستقطاب 15 عميلاً إضافياً",
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(DECISIONS_FILE, JSON.stringify(initialDecisions, null, 2), "utf-8");
      return initialDecisions;
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
