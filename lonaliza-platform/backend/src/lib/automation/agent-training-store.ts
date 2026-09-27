import fs from "fs";
import path from "path";
import { isOrigin } from "@/lib/server/deployment-role";

export type B2BTrainingConfig = {
  enabled: boolean;
  agentName: string;
  greetingMessage: string;
  platformPitch: string;
  featuresList: string[];
  resellerPlansSummary: string;
  demoUrl: string;
  socialLinks: Record<string, string>;
  maxDiscountPercent: number;
  customInstructions: string;
  handoverKeywords: string[];
};

export type B2CTrainingConfig = {
  enabled: boolean;
  agentName: string;
  greetingMessage: string;
  tourismPitch: string;
  destinationsCovered: string[];
  specialOffersSummary: string;
  bookingUrl: string;
  socialLinks: Record<string, string>;
  maxDiscountPercent: number;
  customInstructions: string;
  handoverKeywords: string[];
};

export type AgentTrainingState = {
  b2b?: B2BTrainingConfig;
  b2c: B2CTrainingConfig;
  updatedAt: string;
};

const B2B_DATA_FILE = path.join(process.cwd(), ".data", "b2b-agent-training.json");
const B2C_DATA_FILE = path.join(process.cwd(), ".data", "b2c-agent-training.json");

const defaultB2B: B2BTrainingConfig = {
  enabled: true,
  agentName: "مستشار مبيعات لوناليزا (Lonaliza B2B)",
  greetingMessage: "أهلاً بك! معك مستشار حلول منصة لوناليزا (Lonaliza). كيف يمكنني مساعدة شركتك السياحية اليوم؟",
  platformPitch: "لوناليزا هي منصة سياحية متكاملة (SaaS White-Label) تمكنك من إطلاق موقع سياحي احترافي متكامل مع محركات حجز طيران وفنادق وجولات سياحية مربوطة بأكبر الموردين العالميين، مع نظام أتمتة وتسويق ذكي بالذكاء الاصطناعي.",
  featuresList: [
    "محرك حجز فنادق وطيران بأفضل الأسعار وأقل العمولات",
    "تكامل مباشر مع WhatsApp و Telegram لخدمة العملاء والحملات التسويقية",
    "نظام إدارة B2B وتراخيص إعادة البيع للشركات الفرعية",
    "بوابات دفع إلكترونية متعددة وحماية عالية للحجوزات",
    "تصميم عصري سريع متوافق مع كافة الأجهزة مع تطبيق ويب تقدمي (PWA)",
  ],
  resellerPlansSummary: "نوفر خطط ترخيص مرنة تناسب المكاتب الناشئة والشركات الكبرى، تشمل الدعم الفني الكامل والتحديثات المستمرة.",
  demoUrl: "https://lonaliza.com/demo",
  socialLinks: {
    whatsapp: "https://wa.me/905015709201",
    website: "https://lonaliza.com",
    telegram: "https://t.me/Lonalizabot",
  },
  maxDiscountPercent: 15,
  customInstructions: "تحدث بأسلوب مستشار أعمال خبير، ركز على زيادة أرباح الشركة وتوفير الوقت عبر الأتمتة والذكاء الاصطناعي، واعرض حجز مكالمة ديمو تجريبية عند اهتمام العميل.",
  handoverKeywords: ["تحدث مع موظف", "مدير", "اتصال هاتفي", "عقد رسمي", "مشكلة"],
};

const defaultB2C: B2CTrainingConfig = {
  enabled: true,
  agentName: "المستشار السياحي الذكي",
  greetingMessage: "مرحباً بك في لوناليزا للسياحة والسفر 🌟! يسعدني مساعدتك في تخطيط وحجز أفضل الرحلات والفنادق. إلى أين ترغب بالسفر؟",
  tourismPitch: "نقدم لك أفضل البرامج السياحية في تركيا وأجمل الوجهات، مع حجوزات فنادق فاخرة، وجولات خاصة مع سائقين محترفين، وتذاكر طيران بأفضل الأسعار.",
  destinationsCovered: ["إسطنبول", "طرابزون والشمال التركي", "أنطاليا", "كبادوكيا", "بورصة وسبانجا"],
  specialOffersSummary: "خصم خاص 10% للحجوزات المبكرة، وبرامج عائلية متكاملة تشمل الاستقبال من المطار والجولات اليومية.",
  bookingUrl: "https://lonaliza.com",
  socialLinks: {
    whatsapp: "https://wa.me/905015709201",
    instagram: "https://instagram.com/lonaliza_travel",
  },
  maxDiscountPercent: 10,
  customInstructions: "تحدث بأسلوب مرشد سياحي ودود ومحترف، اقترح الأماكن الأنسب بناءً على طبيعة الرحلة (عائلية، شهر عسل، شبابية)، وقدم روابط الحجز وكودات الخصم.",
  handoverKeywords: ["موظف بشري", "شكوى", "إلغاء حجز", "تعديل موعد"],
};

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadB2BTrainingConfig(): B2BTrainingConfig | null {
  if (!isOrigin()) return null; // Strictly guard for Super Admin master
  try {
    ensureDir(B2B_DATA_FILE);
    if (!fs.existsSync(B2B_DATA_FILE)) return defaultB2B;
    const raw = fs.readFileSync(B2B_DATA_FILE, "utf-8");
    return { ...defaultB2B, ...JSON.parse(raw) };
  } catch {
    return defaultB2B;
  }
}

export function saveB2BTrainingConfig(config: Partial<B2BTrainingConfig>): B2BTrainingConfig {
  if (!isOrigin()) {
    throw new Error("[403] B2B training settings can only be modified on the Super Admin master platform.");
  }
  const current = loadB2BTrainingConfig() || defaultB2B;
  const updated: B2BTrainingConfig = { ...current, ...config };
  ensureDir(B2B_DATA_FILE);
  fs.writeFileSync(B2B_DATA_FILE, JSON.stringify(updated, null, 2), { mode: 0o600 });
  return updated;
}

export function loadB2CTrainingConfig(): B2CTrainingConfig {
  try {
    ensureDir(B2C_DATA_FILE);
    if (!fs.existsSync(B2C_DATA_FILE)) return defaultB2C;
    const raw = fs.readFileSync(B2C_DATA_FILE, "utf-8");
    return { ...defaultB2C, ...JSON.parse(raw) };
  } catch {
    return defaultB2C;
  }
}

export function saveB2CTrainingConfig(config: Partial<B2CTrainingConfig>): B2CTrainingConfig {
  const current = loadB2CTrainingConfig();
  const updated: B2CTrainingConfig = { ...current, ...config };
  ensureDir(B2C_DATA_FILE);
  fs.writeFileSync(B2C_DATA_FILE, JSON.stringify(updated, null, 2), { mode: 0o600 });
  return updated;
}

export function loadAgentTrainingState(): AgentTrainingState {
  const isMaster = isOrigin();
  return {
    b2b: isMaster ? (loadB2BTrainingConfig() || undefined) : undefined,
    b2c: loadB2CTrainingConfig(),
    updatedAt: new Date().toISOString(),
  };
}
