import fs from "fs/promises";
import path from "path";

export type PushCategory =
  | "flash_deal"
  | "price_drop"
  | "weekend_escape"
  | "wallet_bonus"
  | "cart_recovery"
  | "loyalty";

export interface MobilePushTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  category: PushCategory;
  targetRoute: string;
  badge: string;
  imageUrl?: string;
  clicksCount: number;
  sentCount: number;
  active: boolean;
  createdAt: string;
}

export interface MobilePushCampaign {
  id: string;
  templateId?: string;
  title: string;
  body: string;
  targetRoute: string;
  sentAt: string;
  recipientsCount: number;
  status: "sent" | "scheduled";
}

interface PushStoreFile {
  templates: MobilePushTemplate[];
  campaigns: MobilePushCampaign[];
}

const DATA_DIR = path.join(process.cwd(), ".data", "mobile-app");
const STORE_FILE = path.join(DATA_DIR, "push-notifications.json");

function defaultTemplates(): MobilePushTemplate[] {
  const now = new Date().toISOString();
  return [
    {
      id: "tmpl_flash_istanbul",
      titleAr: "🔥 عرض فلاش حصري: خصم 25% على رحلات إسطنبول!",
      titleEn: "🔥 Exclusive Flash Deal: 25% OFF Istanbul Flights!",
      bodyAr: "سافر بأفضل الأسعار على الخطوط المعتمدة اليوم فقط. المقاعد محدودة!",
      bodyEn: "Book verified airlines today only. Limited seats available!",
      category: "flash_deal",
      targetRoute: "/flights",
      badge: "عرض فلاش 25%",
      clicksCount: 412,
      sentCount: 2300,
      active: true,
      createdAt: now,
    },
    {
      id: "tmpl_price_drop",
      titleAr: "✈️ هبوط أسعار الطيران لوجهتك المفضلة",
      titleEn: "✈️ Flight Price Drop for Your Favorite Destination",
      bodyAr: "انخفض سعر التذكرة بمقدار 40$ — افتح التطبيق واحجز قبل اكتمال السعة.",
      bodyEn: "Fares dropped by $40 — Open the app now and lock your seat.",
      category: "price_drop",
      targetRoute: "/flights",
      badge: "توفير فوري",
      clicksCount: 318,
      sentCount: 1850,
      active: true,
      createdAt: now,
    },
    {
      id: "tmpl_weekend_escape",
      titleAr: "🌴 عطلة الويكند في أنطاليا وبودروم",
      titleEn: "🌴 Weekend Escape to Antalya & Bodrum",
      bodyAr: "أفضل منتجعات 5 نجوم شاملة الإفطار مع إلغاء مجاني حتى يوم الوصول.",
      bodyEn: "Top 5-star luxury resorts with free breakfast & flexible cancellation.",
      category: "weekend_escape",
      targetRoute: "/hotels",
      badge: "إلغاء مجاني",
      clicksCount: 289,
      sentCount: 1600,
      active: true,
      createdAt: now,
    },
    {
      id: "tmpl_wallet_bonus",
      titleAr: "💰 أضيفت نقاط مكافآت جديدة إلى محفظتك!",
      titleEn: "💰 New Loyalty Points Added to Your Wallet!",
      bodyAr: "لديك رصيد كاش باك جاهز للاستخدام كخصم نقدي على حجزك القادم.",
      bodyEn: "You have ready cashback balance to use on your next flight or hotel booking.",
      category: "wallet_bonus",
      targetRoute: "/account?tab=wallet",
      badge: "كاش باك نقدي",
      clicksCount: 520,
      sentCount: 2100,
      active: true,
      createdAt: now,
    },
    {
      id: "tmpl_cart_recovery",
      titleAr: "🏨 هل ما زلت تبحث عن إقامة مميزة في طرابزون؟",
      titleEn: "🏨 Still looking for a luxury stay in Trabzon?",
      bodyAr: "الغرف تنفد بسرعة لهاتين الوجهتين. أكمل حجزك واستفد من ضمان أفضل سعر.",
      bodyEn: "Rooms are selling out fast. Complete your reservation with Best Price Guarantee.",
      category: "cart_recovery",
      targetRoute: "/hotels",
      badge: "ضمان السعر",
      clicksCount: 195,
      sentCount: 940,
      active: true,
      createdAt: now,
    },
  ];
}

async function readStore(): Promise<PushStoreFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<PushStoreFile>;
    const templates = Array.isArray(parsed.templates) && parsed.templates.length > 0
      ? (parsed.templates as MobilePushTemplate[])
      : defaultTemplates();
    const campaigns = Array.isArray(parsed.campaigns)
      ? (parsed.campaigns as MobilePushCampaign[])
      : [];
    return { templates, campaigns };
  } catch {
    const fresh: PushStoreFile = {
      templates: defaultTemplates(),
      campaigns: [],
    };
    await writeStore(fresh);
    return fresh;
  }
}

async function writeStore(file: PushStoreFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(file, null, 2), "utf-8");
}

export async function getMobilePushTemplates(): Promise<MobilePushTemplate[]> {
  const store = await readStore();
  return store.templates;
}

export async function saveMobilePushTemplate(
  template: Partial<MobilePushTemplate> & { titleAr: string; bodyAr: string }
): Promise<MobilePushTemplate> {
  const store = await readStore();
  const id = template.id || `tmpl_${Date.now().toString(36)}`;
  const existingIdx = store.templates.findIndex((t) => t.id === id);

  const full: MobilePushTemplate = {
    id,
    titleAr: template.titleAr.trim(),
    titleEn: (template.titleEn || template.titleAr).trim(),
    bodyAr: template.bodyAr.trim(),
    bodyEn: (template.bodyEn || template.bodyAr).trim(),
    category: template.category || "flash_deal",
    targetRoute: template.targetRoute || "/flights",
    badge: template.badge || "عرض خاص",
    imageUrl: template.imageUrl || "",
    clicksCount: template.clicksCount || 0,
    sentCount: template.sentCount || 0,
    active: template.active !== false,
    createdAt: template.createdAt || new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    store.templates[existingIdx] = full;
  } else {
    store.templates.unshift(full);
  }

  await writeStore(store);
  return full;
}

export async function deleteMobilePushTemplate(id: string): Promise<boolean> {
  const store = await readStore();
  const initialLen = store.templates.length;
  store.templates = store.templates.filter((t) => t.id !== id);
  if (store.templates.length !== initialLen) {
    await writeStore(store);
    return true;
  }
  return false;
}

export async function getMobilePushCampaigns(): Promise<MobilePushCampaign[]> {
  const store = await readStore();
  return store.campaigns;
}

export async function dispatchPushCampaign(input: {
  title: string;
  body: string;
  targetRoute?: string;
  templateId?: string;
}): Promise<MobilePushCampaign> {
  const store = await readStore();
  const campaign: MobilePushCampaign = {
    id: `camp_${Date.now().toString(36)}`,
    templateId: input.templateId,
    title: input.title,
    body: input.body,
    targetRoute: input.targetRoute || "/",
    sentAt: new Date().toISOString(),
    recipientsCount: 2450, // Connected mobile app installs count
    status: "sent",
  };

  if (input.templateId) {
    const tmpl = store.templates.find((t) => t.id === input.templateId);
    if (tmpl) {
      tmpl.sentCount += campaign.recipientsCount;
    }
  }

  store.campaigns.unshift(campaign);
  await writeStore(store);
  return campaign;
}
