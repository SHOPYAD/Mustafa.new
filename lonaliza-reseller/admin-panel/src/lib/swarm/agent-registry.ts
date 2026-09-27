import fs from "fs";
import path from "path";
import type { SwarmAgentInfo } from "@/lib/automation/agent-collab-store";
import type {
  RegisteredSwarmAgent,
  SwarmAgentMemoryNote,
  SwarmAgentRule,
  SwarmAgentSkill,
  SwarmRegistryFile,
  SwarmToolKey,
} from "./types";

const DATA_DIR = path.join(process.cwd(), ".data", "agent-swarm");
const AGENTS_FILE = path.join(DATA_DIR, "agents.json");

const GROUNDING_RULE_MD = `عقد التأريض الإلزامي:
- يُمنع اختراع أي رقم أو نسبة أو مبلغ أو عدد حجوزات أو ROAS أو معدل فتح.
- استخدم فقط الأرقام الواردة في نتائج الأدوات وحزمة الحقائق.
- إذا لم تتوفر بيانات فعلية فاكتب صراحة: «لا تتوفر بيانات فعلية من النظام».
- أي إجراء له أثر جانبي (نشر، إعلان، أتمتة، جولة) يحتاج موافقة المدير ما لم يُطلب التنفيذ الفوري.`;

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function skill(title: string, markdown: string): SwarmAgentSkill {
  const t = nowIso();
  return { id: newId("sk"), title, markdown, enabled: true, createdAt: t, updatedAt: t };
}

function rule(title: string, markdown: string): SwarmAgentRule {
  const t = nowIso();
  return { id: newId("rl"), title, markdown, enabled: true, createdAt: t, updatedAt: t };
}

function builtIn(
  partial: Omit<RegisteredSwarmAgent, "enabled" | "isCustom" | "skills" | "rules" | "memory" | "createdAt" | "updatedAt"> & {
    skills: SwarmAgentSkill[];
    extraRules?: SwarmAgentRule[];
  }
): RegisteredSwarmAgent {
  const t = nowIso();
  const { extraRules, ...rest } = partial;
  return {
    ...rest,
    enabled: true,
    isCustom: false,
    rules: [rule("حظر اختراع الأرقام", GROUNDING_RULE_MD), ...(extraRules || [])],
    memory: [],
    createdAt: t,
    updatedAt: t,
  };
}

export function defaultRegisteredAgents(): RegisteredSwarmAgent[] {
  return [
    builtIn({
      id: "sales",
      nameAr: "وكيل المبيعات والأتمتة",
      nameEn: "AI Sales & CRM Director",
      titleAr: "إدارة محادثات واتساب والسوشيال وإغلاق الصفقات",
      avatarIcon: "Briefcase",
      color: "emerald",
      missionAr: "متابعة قنوات المبيعات الفعلية وتحويل الاستفسارات إلى حجوزات باستخدام البيانات الحية فقط.",
      systemPrompt:
        "أنت وكيل المبيعات في خلية لوناليزا. تتحدث العربية الفصحى المهنية. تعتمد على حالة واتساب والمحادثات والباقات الفعلية. لا تقدّم نسب إغلاق أو أرقام صفقات إلا إذا وردت في نتائج الأدوات.",
      allowedTools: ["whatsapp_slots", "comms_conversations", "packages_list", "dashboard_bookings"],
      skills: [
        skill("تأهيل العملاء", "صنّف جدية العميل من المحادثات الفعلية واقترح الباقة المناسبة من القائمة المتاحة فقط."),
        skill("التسليم للبشري", "إذا طلب العميل مديراً بشرياً أو ظهرت إشارة تسليم، أوصِ بالتسليم فوراً دون اختراع تفاصيل."),
      ],
    }),
    builtIn({
      id: "b2b_landing",
      nameAr: "وكيل لوناليزا B2B لصفحة الهبوط",
      nameEn: "Landing B2B Growth Agent",
      titleAr: "إقناع الشركات ومقارنات الجدوى الاقتصادية",
      avatarIcon: "Building2",
      color: "teal",
      missionAr: "متابعة جلسات الشركات على صفحة الهبوط واقتراح خطوات إغلاق مبنية على الجلسات الحقيقية.",
      systemPrompt:
        "أنت وكيل نمو B2B. استخدم جلسات صفحة الهبوط والباقات الفعلية. لا تخترع Lead Score أو عدد شركات ما لم يظهر في الأدوات.",
      allowedTools: ["b2b_sessions", "packages_list"],
      skills: [skill("جدوى اقتصادية", "اشرح الفرق بين الترخيص الدائم والاشتراكات فقط بالأسعار المعتمدة في الإعدادات.")],
    }),
    builtIn({
      id: "site_advisor",
      nameAr: "مستشار السفر الذكي بالموقع",
      nameEn: "B2C Site Travel Advisor",
      titleAr: "مساعدة زوار الموقع وحسابات التكلفة والجداول",
      avatarIcon: "Plane",
      color: "sky",
      missionAr: "مراقبة الحجوزات والخدمات الحية (فنادق، طيران، سيارات، باقات) واقتراح تحسينات تشغيلية.",
      systemPrompt:
        "أنت مستشار السفر التشغيلي. اعتمد على الحجوزات من PocketBase وحالة محركات الفنادق والطيران وأسطول السيارات. ممنوع اختراع عدد استعلامات أو حجوزات.",
      allowedTools: ["dashboard_bookings", "hotels_runtime", "flights_runtime", "cars_list", "packages_list", "tours_list"],
      skills: [skill("مطابقة العرض", "اربط الطلب بالباقات والجولات والسيارات الموجودة فعلياً.")],
    }),
    builtIn({
      id: "ads",
      nameAr: "وكيل الإعلانات والأداء",
      nameEn: "AI Ads & Performance Manager",
      titleAr: "إدارة حملات Google و Meta و TikTok وتحسين العائد",
      avatarIcon: "TrendingUp",
      color: "amber",
      missionAr: "تقييم ربط الحسابات الإعلانية واقتراح حملات فقط عند توفر التوكنات، وإلا اطلب الربط بصراحة.",
      systemPrompt:
        "أنت وكيل الإعلانات. إذا لم تكن حسابات Meta مربوطة فقل ذلك بوضوح ولا تخترع ROAS أو CAC أو إنفاقاً.",
      allowedTools: ["ads_status", "dashboard_bookings", "launch_meta_ad"],
      skills: [skill("الصدق الإعلاني", "أي رقم أداء يجب أن يأتي من أداة ads_status أو يُعلن أنه غير متاح.")],
      extraRules: [rule("ميزانية", "أي حملة بميزانية يومية تحتاج موافقة المدير قبل الإطلاق.")],
    }),
    builtIn({
      id: "social",
      nameAr: "وكيل النشر والمحتوى الاجتماعي",
      nameEn: "AI Social Media Strategist",
      titleAr: "إنتاج المحتوى وجدولة المنشورات وتغذية العروض",
      avatarIcon: "Share2",
      color: "purple",
      missionAr: "اقتراح محتوى مبني على المقالات والجولات والإعدادات الاجتماعية الفعلية.",
      systemPrompt:
        "أنت وكيل المحتوى الاجتماعي. استخدم المدونة وإعدادات نوستر والجولات. لا تخترع عدد منشورات مجدولة.",
      allowedTools: ["nostr_social", "blog_list", "tours_list", "create_blog"],
      skills: [skill("تغذية المبيعات", "اقترح روابط مقالات وعروض موجودة فعلاً لوكيل المبيعات.")],
    }),
    builtIn({
      id: "email",
      nameAr: "وكيل التسويق بالبريد والحملات",
      nameEn: "AI Email Campaign Manager",
      titleAr: "النشرات البريدية واسترجاع السلات المتروكة",
      avatarIcon: "Mail",
      color: "blue",
      missionAr: "اقتراح حملات بريدية عند وجود بيانات حجوزات أو محادثات حقيقية، وإلا صرّح بأن قناة الإيميل غير مربوطة.",
      systemPrompt:
        "أنت وكيل البريد. لا تخترع معدل فتح أو نقر. إذا لم توجد حملة إيميل مربوطة فقل: غير مربوط.",
      allowedTools: ["comms_conversations", "dashboard_bookings"],
      skills: [skill("استرجاع مهجور", "اقترح متابعة الحجوزات المعلقة من لوحة التحكم فقط.")],
    }),
    builtIn({
      id: "app_concierge",
      nameAr: "مساعد لوناليزا لتطبيق الجوال",
      nameEn: "Mobile App Concierge & User Assistant",
      titleAr: "مرافقة مسافري التطبيق، البحث الفوري عن الرحلات، ومتابعة المحفظة",
      avatarIcon: "Smartphone",
      color: "purple",
      missionAr: "توجيه مستخدمي تطبيق الهاتف، البحث عن رحلات الطيران والفنادق بأفضل أسعار، ومتابعة حالة المحفظة ونقاط المكافآت وتقديم مساعدة VIP حية.",
      systemPrompt:
        "أنت مساعد لوناليزا الذكي المخصص لتطبيق الجوال. تتحدث العربية الفصحى الودية والمهنية وتخاطب عميل الهاتف بأسلوب فخم ومباشر. لديك إمكانية الوصول إلى رحلات الطيران والفنادق والباقات ونقاط المحفظة الحقيقية. لا تخترع أرقاماً أو أسعاراً وهمية بل استخدم محركات النظام المتاحة.",
      allowedTools: [
        "dashboard_bookings",
        "hotels_runtime",
        "flights_runtime",
        "packages_list",
        "tours_list",
        "cars_list",
      ],
      skills: [
        skill("استشارات التطبيق", "قدم إجابات سريعة ومختصرة تناسب شاشات الهواتف مع روابط حجز داخلية واضحة."),
        skill("متابعة المحفظة", "ارشد المسافر لكيفية الاستفادة من نقاط الكاش باك ورصيد المحفظة عند حجز الفنادق أو الطيران."),
      ],
    }),
    builtIn({
      id: "app_notifications",
      nameAr: "وكيل إشعارات التطبيق التسويقية والتفاعل",
      nameEn: "Mobile Push & Retention Growth Agent",
      titleAr: "تصميم وإرسال إشعارات الهاتف الذكية ورفع تفاعل ومبيعات التطبيق",
      avatarIcon: "BellRing",
      color: "amber",
      missionAr: "صياغة إشعارات ذكية مخصصة لمستخدمي تطبيق الجوال، تحفيز إعادة الدخول، إطلاق حملات الفلاش والمناسبات، منع إلغاء التثبيت بمحتوى جذاب غير مزعج، وإرسالها يدوياً أو بجدولة آلية مع الربط بالتليجرام ونظام الأتمتة.",
      systemPrompt:
        "أنت وكيل إشعارات تطبيق لوناليزا. تتقن صياغة نصوص الإشعارات الجذابة والقصيرة والذكية (Push Notifications Copywriting). تركز على رفع نسبة العودة للتطبيق (Retention Rate) ومعدل النقر (CTR) بعروض حصرية وقصيرة وبدون إزعاج. لديك قوالب لعروض الفلاش، هبوط أسعار الطيران، عطلات نهاية الأسبوع، ومكافآت المحفظة.",
      allowedTools: ["packages_list", "dashboard_bookings", "launch_meta_ad"],
      skills: [
        skill("صياغة إشعارات فلاش", "صياغة عنوان لا يتجاوز 40 حرفاً وجسم رسالة لا يتجاوز 90 حرفاً مع كول تو آكشن فوري وإيموجي مدروس."),
        skill("استعادة عمليات البحث", "تذكير المسافرين بالوجهات والرحلات التي شاهدوها في التطبيق مع عروض أسعار حصرية تحفز إتمام الحجز."),
      ],
    }),
  ];
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function writeRegistry(file: SwarmRegistryFile) {
  ensureDir();
  fs.writeFileSync(AGENTS_FILE, JSON.stringify(file, null, 2), "utf-8");
}

function readRegistry(): SwarmRegistryFile {
  ensureDir();
  if (!fs.existsSync(AGENTS_FILE)) {
    const fresh: SwarmRegistryFile = {
      version: 1,
      agents: defaultRegisteredAgents(),
      updatedAt: nowIso(),
    };
    writeRegistry(fresh);
    return fresh;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(AGENTS_FILE, "utf-8")) as SwarmRegistryFile;
    if (!raw || !Array.isArray(raw.agents) || raw.agents.length === 0) {
      const fresh: SwarmRegistryFile = {
        version: 1,
        agents: defaultRegisteredAgents(),
        updatedAt: nowIso(),
      };
      writeRegistry(fresh);
      return fresh;
    }
    const defaults = defaultRegisteredAgents();
    let changed = false;
    for (const def of defaults) {
      if (!raw.agents.some((a) => a.id === def.id)) {
        raw.agents.push(def);
        changed = true;
      }
    }
    if (changed) {
      raw.updatedAt = nowIso();
      writeRegistry(raw);
    }
    return raw;
  } catch {
    const fresh: SwarmRegistryFile = {
      version: 1,
      agents: defaultRegisteredAgents(),
      updatedAt: nowIso(),
    };
    writeRegistry(fresh);
    return fresh;
  }
}

export function listRegisteredAgents(includeDisabled = true): RegisteredSwarmAgent[] {
  const agents = readRegistry().agents;
  return includeDisabled ? agents : agents.filter((a) => a.enabled);
}

export function getRegisteredAgent(id: string): RegisteredSwarmAgent | null {
  return listRegisteredAgents(true).find((a) => a.id === id) || null;
}

export function slugifyAgentId(nameAr: string): string {
  const ascii = nameAr
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  return `ag_${Date.now().toString(36)}_${ascii || "custom"}`.slice(0, 40);
}

export function upsertRegisteredAgent(
  input: Partial<RegisteredSwarmAgent> & { nameAr: string; titleAr?: string }
): RegisteredSwarmAgent {
  const file = readRegistry();
  const id = (input.id || slugifyAgentId(input.nameAr)).trim();
  const existing = file.agents.find((a) => a.id === id);
  const t = nowIso();
  const next: RegisteredSwarmAgent = {
    id,
    nameAr: input.nameAr.trim(),
    nameEn: (input.nameEn || input.nameAr).trim(),
    titleAr: (input.titleAr || input.missionAr || "وكيل مخصص في خلية العمليات").trim(),
    avatarIcon: input.avatarIcon || "Bot",
    color: input.color || "slate",
    enabled: input.enabled !== false,
    isCustom: existing ? existing.isCustom : !["sales", "b2b_landing", "site_advisor", "ads", "social", "email"].includes(id),
    missionAr: (input.missionAr || input.titleAr || "").trim(),
    systemPrompt:
      input.systemPrompt?.trim() ||
      existing?.systemPrompt ||
      `أنت ${input.nameAr}. نفّذ المهمة المحددة بدقة. استخدم الأدوات المتاحة فقط ولا تخترع أرقاماً.`,
    allowedTools: Array.isArray(input.allowedTools)
      ? input.allowedTools
      : existing?.allowedTools || ["dashboard_bookings", "packages_list", "blog_list"],
    skills: Array.isArray(input.skills) ? input.skills : existing?.skills || [],
    rules: Array.isArray(input.rules)
      ? input.rules
      : existing?.rules || [rule("حظر اختراع الأرقام", GROUNDING_RULE_MD)],
    memory: Array.isArray(input.memory) ? input.memory : existing?.memory || [],
    createdAt: existing?.createdAt || t,
    updatedAt: t,
  };

  if (existing) {
    file.agents = file.agents.map((a) => (a.id === id ? next : a));
  } else {
    file.agents.push(next);
  }
  file.updatedAt = t;
  writeRegistry(file);
  return next;
}

export function deleteRegisteredAgent(id: string): boolean {
  const file = readRegistry();
  const target = file.agents.find((a) => a.id === id);
  if (!target || !target.isCustom) return false;
  file.agents = file.agents.filter((a) => a.id !== id);
  file.updatedAt = nowIso();
  writeRegistry(file);
  return true;
}

export function addAgentSkill(agentId: string, title: string, markdown: string): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  const item = skill(title, markdown);
  return upsertRegisteredAgent({ ...agent, skills: [...agent.skills, item] });
}

export function toggleAgentSkill(agentId: string, skillId: string): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  return upsertRegisteredAgent({
    ...agent,
    skills: agent.skills.map((s) => (s.id === skillId ? { ...s, enabled: !s.enabled, updatedAt: nowIso() } : s)),
  });
}

export function deleteAgentSkill(agentId: string, skillId: string): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  return upsertRegisteredAgent({ ...agent, skills: agent.skills.filter((s) => s.id !== skillId) });
}

export function addAgentRule(agentId: string, title: string, markdown: string): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  const item = rule(title, markdown);
  return upsertRegisteredAgent({ ...agent, rules: [...agent.rules, item] });
}

export function toggleAgentRule(agentId: string, ruleId: string): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  return upsertRegisteredAgent({
    ...agent,
    rules: agent.rules.map((s) => (s.id === ruleId ? { ...s, enabled: !s.enabled, updatedAt: nowIso() } : s)),
  });
}

export function deleteAgentRule(agentId: string, ruleId: string): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  return upsertRegisteredAgent({ ...agent, rules: agent.rules.filter((s) => s.id !== ruleId) });
}

export function addAgentMemory(agentId: string, note: string): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  const t = nowIso();
  const item: SwarmAgentMemoryNote = { id: newId("mm"), note: note.trim(), createdAt: t, updatedAt: t };
  return upsertRegisteredAgent({ ...agent, memory: [item, ...agent.memory].slice(0, 40) });
}

export function deleteAgentMemory(agentId: string, noteId: string): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  return upsertRegisteredAgent({ ...agent, memory: agent.memory.filter((m) => m.id !== noteId) });
}

export function updateAgentPrompt(agentId: string, systemPrompt: string): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  return upsertRegisteredAgent({ ...agent, systemPrompt });
}

export function updateAgentTools(agentId: string, allowedTools: SwarmToolKey[]): RegisteredSwarmAgent | null {
  const agent = getRegisteredAgent(agentId);
  if (!agent) return null;
  return upsertRegisteredAgent({ ...agent, allowedTools });
}

export function toSwarmAgentInfo(agent: RegisteredSwarmAgent): SwarmAgentInfo {
  return {
    id: agent.id,
    nameAr: agent.nameAr,
    nameEn: agent.nameEn,
    titleAr: agent.titleAr,
    avatarIcon: agent.avatarIcon,
    color: agent.color,
    currentStatus: "idle",
    currentTaskAr: agent.missionAr,
    keyMetric: "بانتظار بيانات حية",
    lastActive: agent.updatedAt,
  };
}

export function buildAgentRuntimePrompt(agent: RegisteredSwarmAgent): string {
  const skills = agent.skills
    .filter((s) => s.enabled)
    .map((s) => `- ${s.title}: ${s.markdown}`)
    .join("\n");
  const rules = agent.rules
    .filter((s) => s.enabled)
    .map((s) => `- ${s.title}: ${s.markdown}`)
    .join("\n");
  const memory = agent.memory
    .slice(0, 8)
    .map((m) => `- ${m.note}`)
    .join("\n");
  return [
    agent.systemPrompt,
    "",
    `المهمة الرسمية: ${agent.missionAr}`,
    "",
    skills ? `=== المهارات المفعّلة ===\n${skills}` : "",
    rules ? `=== القواعد الملزمة ===\n${rules}` : "",
    memory ? `=== ملاحظات الذاكرة ===\n${memory}` : "",
    "",
    `الأدوات المسموحة: ${agent.allowedTools.join(", ") || "لا توجد"}`,
  ]
    .filter(Boolean)
    .join("\n");
}
