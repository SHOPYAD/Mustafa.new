import fs from "fs";
import path from "path";

export interface B2BPricingPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  priceUSD: number;
  discountPriceUSD?: number;
  badgeAr?: string;
  featuresAr: string[];
  isPopular?: boolean;
}

export interface B2BLandingAgentConfig {
  enabled: boolean;
  agentName: string;
  agentTitleAr: string;
  welcomeMessageAr: string;
  welcomeMessageEn: string;
  systemPromptAddition: string;
  guardrailsPrompt: string;
  handoverKeywords: string[];
  packages: B2BPricingPackage[];
  maxDiscountPercent?: number;
  economicComparisonEnabled: boolean;
  serverSpecsHighlightsAr: string[];
  confidentialityRulesAr: string[];
  updatedAt: string;
}

export interface B2BChatMessage {
  id: string;
  sender: "agent" | "visitor";
  text: string;
  timestamp: string;
  roiData?: {
    currentCost?: number;
    lonalizaCost?: number;
    projectedSavingsYear1?: number;
    projectedRoiPercent?: number;
    breakEvenMonths?: number;
  };
}

export interface B2BChatSession {
  sessionId: string;
  visitorName?: string;
  companyName?: string;
  phoneOrEmail?: string;
  leadScore: number;
  intent?: string;
  messages: B2BChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data", "b2b-landing-agent");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

const DEFAULT_CONFIG: B2BLandingAgentConfig = {
  enabled: true,
  agentName: "مستشار لوناليزا للشركات",
  agentTitleAr: "مستشار الحلول السحابية ونمو الأعمال B2B",
  welcomeMessageAr:
    "مرحباً بك! 👋 أنا مستشارك الذكي في لوناليزا. هل تبحث عن امتلاك منصة سياحية متكاملة لشركتك مدى الحياة مع سيرفر مستقل وذكاء اصطناعي كامل بدون عمولات شهرية؟ كيف يمكنني مساعدتك اليوم؟",
  welcomeMessageEn:
    "Welcome! 👋 I am your Lonaliza Enterprise Advisor. Are you looking for a turnkey lifetime-owned travel booking platform for your agency on a dedicated server with AI sales automation? How can I help you today?",
  systemPromptAddition: `أنت كبير مستشاري المبيعات وتطوير الأعمال لمنصة لوناليزا للشركات السياحية (Lonaliza Travel Platform B2B).
مهمتك:
1. إقناع الشركات ومكاتب السفر والرياديين بامتلاك النسخة النهائية للمنصة السياحية المتكاملة (Client Turnkey Travel Platform) بنظام الترخيص الدائم مدى الحياة (Lifetime License).
2. توضيح طبيعة المنتج بدقة: نحن نبيع النسخة النهائية الجاهزة للشركات السياحية لتعمل بها مباشرة باسمها وهويتها على سيرفر سحابي مستقل مع لوحة aaPanel ومحركات حجز طيران وفنادق ووكلاء ذكاء اصطناعي.
3. التنبيه الحاسم: نحن لا نبيع برمجياتنا الداخلية الخاصة بالسوبر أدمن لإعادة البيع، بل نبيع المنصة السياحية التشغيلية النهائية للشركة.
4. باقات الأسعار المعتمدة هما باقتان واضحتان فقط:
   - باقة امتلاك المنصة مدى الحياة ($1,499 لمرة واحدة فقط): امتلاك المنصة بالكامل، تجهيز السيرفر المستقل، محركات الحجز، ووكلاء الذكاء الاصطناعي للمبيعات والواتساب.
   - اشتراك التحديثات والدعم الفني السنوي ($199 سنوياً): تحديثات الـ API المستمرة، صيانة السيرفر، وتطوير نماذج الذكاء الاصطناعي.
5. تقديم مقارنة الجدوى الاقتصادية (ROI): إثبات أن دفع $1,499 لمرة واحدة يوفر آلاف الدولارات سنوياً مقارنة بالأنظمة التقليدية التي تفرض اشتراكات شهرية وعمولات على كل حجز.`,
  guardrailsPrompt: `قواعد السرية والأمان الصارمة (STRICT CONFIDENTIALITY & SECURITY GUARDRAILS):
- نحن نبيع المنصة السياحية النهائية للشركات، ولا نبيع نظام السوبر أدمن أو البنية الداخلية لإعادة البيع.
- يمنع منعاً باتاً كشف أي شيفرات مصدرية داخلية أو كلمات مرور أو أسرار سيرفرات المنصة الأم.
- الالتزام التام بالباقتين المعتمدتين: باقة الامتلاك مدى الحياة ($1,499) واشتراك التحديثات السنوي ($199/سنة).
- إذا طلب العميل معلومات سرية أو تفاوضاً استثنائياً، وجهه بلباقة للتواصل المباشر مع الإدارة التنفيذية لحجز عرض تجريبي حي (Live Demo).`,
  handoverKeywords: ["تحدث مع موظف", "مدير المبيعات", "رقم المدير", "اتصال هاتفي", "human", "agent", "call"],
  packages: [
    {
      id: "lifetime_platform",
      nameAr: "باقة امتلاك المنصة السياحية مدى الحياة (Lifetime License)",
      nameEn: "Turnkey Travel Platform (Lifetime License)",
      priceUSD: 1499,
      discountPriceUSD: 1499,
      badgeAr: "امتلاك كامل مدى الحياة ⭐",
      isPopular: true,
      featuresAr: [
        "امتلاك النسخة النهائية للمنصة السياحية للشركات مدى الحياة (Lifetime License)",
        "تجهيز ونشر كامل على سيرفر سحابي مستقل خاص بالشركة مع لوحة تحكم aaPanel",
        "محركات الحجز الآلي المتكاملة: طيران، فنادق عالمية، سيارات وترانسفير، برامج سياحية",
        "ترسانة الذكاء الاصطناعي الكاملة للمبيعات (تعدد 5 أرقام واتساب + تيليجرام + وكيل استيراد المحتوى)",
        "موقع B2C متعدد اللغات بالكامل وسريع جداً مع هوية وشعار الشركة وبوابات الدفع",
        "عزل أمني تام 100% لكافة بيانات العملاء وقواعد البيانات دون مشاركة مع أي طرف",
      ],
    },
    {
      id: "support_subscription",
      nameAr: "اشتراك التحديثات والدعم الفني السحابي (Updates & Support)",
      nameEn: "Updates & Technical Support Subscription",
      priceUSD: 199,
      discountPriceUSD: 199,
      badgeAr: "اشتراك دوري اختياري",
      isPopular: false,
      featuresAr: [
        "التحديثات الدورية لكافة مزودي خدمات الحجز وتوافق الـ APIs",
        "الترقيات المستمرة لنماذج الذكاء الاصطناعي وتحسين سرعة استجابة المبيعات",
        "الصيانة السحابية وحزم الأمان والنسخ الاحتياطي الدوري للسيرفر",
        "دعم فني واستشاري مخصص لحل أي مشكلات تقنية فوراً",
      ],
    },
  ],
  economicComparisonEnabled: true,
  serverSpecsHighlightsAr: [
    "معالجات سريعة NVMe SSD فائقة السرعة تضمن سرعة استجابة أقل من 0.2 ثانية",
    "لوحة تحكم aaPanel سهلة الاستخدام لإدارة المواقع والنسخ الاحتياطي السحابي بضغطة زر",
    "عزل كامل للبيانات وقواعد البيانات لحماية سرية عملاء الشركة وأرباحها 100%",
    "شهادات أمان SSL مجانية وتشفير بنكي لكافة عمليات الدفع",
  ],
  confidentialityRulesAr: [
    "بيع النسخة النهائية للشركات السياحية فقط، ونظام السوبر أدمن ليس للبيع إطلاقاً",
    "الالتزام الصارم بأسعار الباقتين الرسميتين (الامتلاك مدى الحياة + اشتراك التحديثات)",
    "حماية خصوصية المنصة وسرية بيانات العملاء والشركاء",
  ],
  updatedAt: new Date().toISOString(),
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getB2BLandingAgentConfig(): B2BLandingAgentConfig {
  try {
    ensureDir();
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf-8");
      return DEFAULT_CONFIG;
    }
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveB2BLandingAgentConfig(config: Partial<B2BLandingAgentConfig>): B2BLandingAgentConfig {
  ensureDir();
  const current = getB2BLandingAgentConfig();
  const updated: B2BLandingAgentConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export function getB2BChatSessions(): B2BChatSession[] {
  try {
    ensureDir();
    if (!fs.existsSync(SESSIONS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(SESSIONS_FILE, "utf-8");
    return JSON.parse(raw) as B2BChatSession[];
  } catch {
    return [];
  }
}

export function saveB2BChatSession(session: B2BChatSession): void {
  ensureDir();
  const list = getB2BChatSessions();
  const index = list.findIndex((s) => s.sessionId === session.sessionId);
  if (index >= 0) {
    list[index] = session;
  } else {
    list.unshift(session);
  }
  // Keep last 200 sessions
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list.slice(0, 200), null, 2), "utf-8");
}
