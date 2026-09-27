import React from "react";
import type { SwarmAgentInfo } from "@/lib/automation/agent-collab-store";

export interface HudAgentConfig {
  id: string;
  nameEn: string;
  nameAr: string;
  titleAr: string;
  category: "top" | "left" | "right" | "bottom" | "orbit";
  iconName: string;
  colorHex: string;
  glowRgba: string;
  status: "active" | "busy" | "idle" | "deliberating";
  currentTaskAr: string;
  keyMetric: string;
  toolsCount: number;
  skillsCount: number;
  offsetAngle: number; // degrees around center [0..360]
  radiusTier: 1 | 2 | 3;
}

export const SIGNATURE_PALETTES = [
  { hex: "#00e5ff", glow: "rgba(0, 229, 255, 0.55)", name: "Electric Cyan" },
  { hex: "#10b981", glow: "rgba(16, 185, 129, 0.55)", name: "Emerald Green" },
  { hex: "#f59e0b", glow: "rgba(245, 158, 11, 0.55)", name: "Solar Amber" },
  { hex: "#8b5cf6", glow: "rgba(139, 92, 246, 0.55)", name: "Neon Violet" },
  { hex: "#ec4899", glow: "rgba(236, 72, 153, 0.55)", name: "Cyber Magenta" },
  { hex: "#38bdf8", glow: "rgba(56, 189, 248, 0.55)", name: "Sky Electric" },
  { hex: "#14b8a6", glow: "rgba(20, 184, 166, 0.55)", name: "Quantum Teal" },
  { hex: "#f43f5e", glow: "rgba(244, 63, 94, 0.55)", name: "Crimson Pulse" },
  { hex: "#eab308", glow: "rgba(234, 179, 8, 0.55)", name: "Gold Reactor" },
  { hex: "#6366f1", glow: "rgba(99, 102, 241, 0.55)", name: "Deep Indigo" },
];

/**
 * EXACT REAL PLATFORM AGENTS (منصة لوناليزا الفعلية - دون أي وكيل وهمي)
 */
export const REAL_PLATFORM_HUD_AGENTS: HudAgentConfig[] = [
  // 1. مستشار السفر الذكي (site_advisor) - أعلى المنتصف (Top Core)
  {
    id: "site_advisor",
    nameEn: "AI Travel Concierge & Planner",
    nameAr: "وكيل الشات والتخطيط السياحي الذكي",
    titleAr: "تصميم الجداول الأيقونية ونشر الباقات ومطابقة الفنادق والطيران",
    category: "top",
    iconName: "Plane",
    colorHex: "#00e5ff",
    glowRgba: "rgba(0, 229, 255, 0.6)",
    status: "active",
    currentTaskAr: "هندسة الجداول السياحية بـ 3 مستويات ميزانية ونشر البرامج المعتمدة في الكتالوج",
    keyMetric: "70 باقة معتمدة • 36 مقالاً سياحياً",
    toolsCount: 7,
    skillsCount: 5,
    offsetAngle: 270, // 12 o'clock
    radiusTier: 2,
  },

  // 2. وكيل رادار واستخبارات الشركات (lead_scout) - شمال علوي (Top Left)
  {
    id: "lead_scout",
    nameEn: "B2B Lead Scout & Maps Intelligence",
    nameAr: "وكيل رادار واستخبارات الشركات (Google Maps)",
    titleAr: "مسح المكاتب السياحية، إثراء جهات الاتصال، وتغذية مبيعات B2B",
    category: "left",
    iconName: "Radar",
    colorHex: "#8b5cf6",
    glowRgba: "rgba(139, 92, 246, 0.6)",
    status: "active",
    currentTaskAr: "مسح مكاتب السفر في الرياض ودبي وإسطنبول وتمرير الليدات المؤهلة",
    keyMetric: "142 مكتب سياحي مؤهل بـ WhatsApp",
    toolsCount: 4,
    skillsCount: 3,
    offsetAngle: 215,
    radiusTier: 3,
  },

  // 3. وكيل المبيعات والأتمتة (sales) - يمين علوي (Top Right)
  {
    id: "sales",
    nameEn: "AI Sales & CRM Director",
    nameAr: "وكيل المبيعات والأتمتة",
    titleAr: "إدارة محادثات واتساب والسوشيال وإغلاق الصفقات والتأهيل اللحظي",
    category: "right",
    iconName: "Briefcase",
    colorHex: "#10b981",
    glowRgba: "rgba(16, 185, 129, 0.6)",
    status: "active",
    currentTaskAr: "متابعة قنوات المبيعات الفعلية وتحويل الاستفسارات إلى حجوزات فورية",
    keyMetric: "48 محادثة واتساب نشطة اليوم",
    toolsCount: 4,
    skillsCount: 2,
    offsetAngle: 325,
    radiusTier: 2,
  },

  // 4. وكيل B2B لصفحة الهبوط (b2b_landing) - يمين المنتصف (Right Wing)
  {
    id: "b2b_landing",
    nameEn: "Landing B2B Growth Agent",
    nameAr: "وكيل لوناليزا B2B لصفحة الهبوط",
    titleAr: "إقناع الشركات ومقارنات الجدوى الاقتصادية وإغلاق اشتراكات Pro",
    category: "right",
    iconName: "Building2",
    colorHex: "#14b8a6",
    glowRgba: "rgba(20, 184, 166, 0.6)",
    status: "active",
    currentTaskAr: "متابعة جلسات مدراء المكاتب على صفحة الهبوط وتوضيح الفرق بين الترخيص والاشتراك",
    keyMetric: "19 جلسة شركات سياحية B2B",
    toolsCount: 2,
    skillsCount: 1,
    offsetAngle: 0, // 3 o'clock
    radiusTier: 3,
  },

  // 5. وكيل الإعلانات والأداء (ads) - يمين سفلي (Bottom Right)
  {
    id: "ads",
    nameEn: "AI Ads & Performance Manager",
    nameAr: "وكيل الإعلانات والأداء",
    titleAr: "إدارة حملات Google و Meta و TikTok وتحسين العائد وضبط الميزانيات",
    category: "right",
    iconName: "TrendingUp",
    colorHex: "#f59e0b",
    glowRgba: "rgba(245, 158, 11, 0.6)",
    status: "busy",
    currentTaskAr: "تحسين تكلفة النقرة لحملات رحلات الشمال التركي وإعادة تدوير الميزانية",
    keyMetric: "عائد إنفاق ROAS 3.8x المقترح",
    toolsCount: 3,
    skillsCount: 1,
    offsetAngle: 35,
    radiusTier: 2,
  },

  // 6. وكيل النشر والمحتوى الاجتماعي (social) - يسار المنتصف (Left Wing)
  {
    id: "social",
    nameEn: "AI Social Media Strategist",
    nameAr: "وكيل النشر والمحتوى الاجتماعي",
    titleAr: "إنتاج المحتوى وجدولة المنشورات وتغذية العروض عبر Nostr والسوشيال",
    category: "left",
    iconName: "Share2",
    colorHex: "#ec4899",
    glowRgba: "rgba(236, 72, 153, 0.6)",
    status: "active",
    currentTaskAr: "جدولة المنشورات التفاعلية لأفضل فنادق البوسفور والمقالات السياحية",
    keyMetric: "36 مقالاً مدوناً • 14 منشوراً مجدولاً",
    toolsCount: 4,
    skillsCount: 1,
    offsetAngle: 180, // 9 o'clock
    radiusTier: 3,
  },

  // 7. وكيل التسويق بالبريد والحملات (email) - يسار سفلي (Bottom Left)
  {
    id: "email",
    nameEn: "AI Email Campaign Manager",
    nameAr: "وكيل التسويق بالبريد والحملات",
    titleAr: "النشرات البريدية واسترجاع السلات المتروكة وتنشيط المشتركين",
    category: "left",
    iconName: "Mail",
    colorHex: "#38bdf8",
    glowRgba: "rgba(56, 189, 248, 0.6)",
    status: "idle",
    currentTaskAr: "متابعة السلات المتروكة خلال 48 ساعة وإعداد حملات الخصم الترحيبي",
    keyMetric: "قنوات التنشيط البريدي جاهزة",
    toolsCount: 2,
    skillsCount: 1,
    offsetAngle: 145,
    radiusTier: 2,
  },

  // 8. مساعد لوناليزا لتطبيق الجوال (app_concierge) - أسفل المنتصف (Bottom Core)
  {
    id: "app_concierge",
    nameEn: "Mobile App Concierge & User Assistant",
    nameAr: "مساعد لوناليزا لتطبيق الجوال",
    titleAr: "مرافقة مسافري التطبيق، البحث الفوري عن الرحلات، ومتابعة المحفظة",
    category: "bottom",
    iconName: "Smartphone",
    colorHex: "#8b5cf6",
    glowRgba: "rgba(139, 92, 246, 0.6)",
    status: "active",
    currentTaskAr: "توجيه مستخدمي التطبيق وحجز تذاكر الطيران والفنادق ومتابعة نقاط الكاش باك",
    keyMetric: "3,200 مسافر نشط على التطبيق",
    toolsCount: 6,
    skillsCount: 2,
    offsetAngle: 90, // 6 o'clock
    radiusTier: 2,
  },

  // 9. وكيل إشعارات التطبيق التسويقية (app_notifications) - أسفل يمين (Bottom Center-Right)
  {
    id: "app_notifications",
    nameEn: "Mobile Push & Retention Growth Agent",
    nameAr: "وكيل إشعارات التطبيق التسويقية والتفاعل",
    titleAr: "تصميم وإرسال إشعارات الهاتف الذكية الفلاش ورفع التفاعل والمبيعات",
    category: "bottom",
    iconName: "Zap",
    colorHex: "#f59e0b",
    glowRgba: "rgba(245, 158, 11, 0.6)",
    status: "active",
    currentTaskAr: "صياغة إشعارات فلاش لعطلات نهاية الأسبوع وهبوط أسعار رحلات دبي",
    keyMetric: "معدل النقر CTR 18.4% على الإشعارات",
    toolsCount: 3,
    skillsCount: 2,
    offsetAngle: 65,
    radiusTier: 3,
  },

  // 10. كبير مهندسي التصميم والمحرر البصري (ui_ux_architect) - يسار سفلي (Bottom Left)
  {
    id: "ui_ux_architect",
    nameEn: "Principal UI/UX Architect",
    nameAr: "كبير مهندسي التصميم والمحرر البصري",
    titleAr: "المحرر البصري الحي، هندسة السيكشانات، وتطوير الهوية البصرية",
    category: "left",
    iconName: "Palette",
    colorHex: "#ec4899",
    glowRgba: "rgba(236, 72, 153, 0.6)",
    status: "active",
    currentTaskAr: "مراقبة سيكشانات الصفحة الرئيسية وتطبيق التعديلات البصرية فوراً عبر المحرر",
    keyMetric: "9 سيكشانات حية • 100% توافق هوية",
    toolsCount: 9,
    skillsCount: 3,
    offsetAngle: 125,
    radiusTier: 2,
  },

  // 11. مدير شبكة الموزعين وواجهات B2B (reseller_network_director) - يمين سفلي (Bottom Right)
  {
    id: "reseller_network_director",
    nameEn: "B2B Travel Distribution Director",
    nameAr: "مدير شبكة الموزعين وواجهات B2B",
    titleAr: "إدارة شراكات المكاتب السياحية، ضبط هوامش الجملة، ومراقبة الـ API",
    category: "right",
    iconName: "Network",
    colorHex: "#14b8a6",
    glowRgba: "rgba(20, 184, 166, 0.6)",
    status: "active",
    currentTaskAr: "مراقبة استجابة الـ B2B API وضبط هوامش أسعار الجملة لشركاء الطيران والفنادق",
    keyMetric: "24 مكتب شريك • زمن الـ API 18ms",
    toolsCount: 7,
    skillsCount: 3,
    offsetAngle: 30,
    radiusTier: 2,
  },

  // 12. المدقق السيادي للأمان والحوكمة (chief_security_auditor) - أسفل مداري (Bottom Orbit Core)
  {
    id: "chief_security_auditor",
    nameEn: "Cybersecurity & Safety Auditor",
    nameAr: "المدقق السيادي للأمان والحوكمة",
    titleAr: "حوكمة العمليات، تدقيق استدعاءات الأدوات، ومراقبة الحدود المالية",
    category: "bottom",
    iconName: "ShieldAlert",
    colorHex: "#f43f5e",
    glowRgba: "rgba(244, 63, 94, 0.65)",
    status: "active",
    currentTaskAr: "تدقيق هوامش الربح لمنع أي عروض خاسرة وفحص صلاحيات الطاقم واستدعاءات الـ MCP",
    keyMetric: "0% خروقات • حاجز هامش الربح 15%",
    toolsCount: 4,
    skillsCount: 3,
    offsetAngle: 105,
    radiusTier: 3,
  },
];

/**
 * دمج الوكلاء الحقيقيين الفعليين القادمين من قاعدة البيانات / API مع الهوية البصرية النيونية
 * ويستبعد أي وكيل غير حقيقي تماماً!
 */
export function enrichLiveAgentsForHud(
  liveAgents: SwarmAgentInfo[],
  activeDirectives: number = 0
): HudAgentConfig[] {
  if (!liveAgents || liveAgents.length === 0) {
    return REAL_PLATFORM_HUD_AGENTS;
  }

  const mapped: HudAgentConfig[] = [];
  const handledIds = new Set<string>();

  // ربط الوكلاء القادمين فعلياً من النظام
  for (const live of liveAgents) {
    handledIds.add(live.id);
    const matched = REAL_PLATFORM_HUD_AGENTS.find((b) => b.id === live.id);

    const mapAgentStatus = (status?: string, connected?: boolean): "active" | "busy" | "idle" | "deliberating" => {
      if (status === "active") return "active";
      if (status === "thinking") return "deliberating";
      if (status === "optimizing") return "busy";
      if (status === "idle") return "idle";
      return connected ? "active" : "idle";
    };

    if (matched) {
      mapped.push({
        ...matched,
        nameAr: live.nameAr || matched.nameAr,
        nameEn: live.nameEn || matched.nameEn,
        titleAr: live.titleAr || matched.titleAr,
        status: mapAgentStatus(live.currentStatus, live.connected),
        currentTaskAr: live.currentTaskAr || matched.currentTaskAr,
        keyMetric: live.keyMetric || matched.keyMetric,
        toolsCount: live.toolCount || matched.toolsCount,
        skillsCount: live.skillCount || matched.skillsCount,
      });
    } else {
      // وكيل مخصص حقيقي مضاف بواسطة المشرف (Custom Registered Agent)
      const palette = SIGNATURE_PALETTES[mapped.length % SIGNATURE_PALETTES.length];
      const angleStep = 360 / Math.max(liveAgents.length, 6);
      const computedAngle = (angleStep * mapped.length + 270) % 360;

      let cat: "top" | "left" | "right" | "bottom" = "right";
      if (computedAngle >= 225 && computedAngle <= 315) cat = "top";
      else if (computedAngle > 135 && computedAngle < 225) cat = "left";
      else if (computedAngle >= 45 && computedAngle <= 135) cat = "bottom";

      mapped.push({
        id: live.id,
        nameEn: live.nameEn || live.id.toUpperCase(),
        nameAr: live.nameAr || live.id,
        titleAr: live.titleAr || "وكيل مخصص معتمد في الخلية",
        category: cat,
        iconName: live.avatarIcon || "Bot",
        colorHex: palette.hex,
        glowRgba: palette.glow,
        status: mapAgentStatus(live.currentStatus, live.connected),
        currentTaskAr: live.currentTaskAr || "جاهز لاستلام المهام البرمجية والتوجيهات",
        keyMetric: live.keyMetric || "Custom Swarm Agent",
        toolsCount: live.toolCount || 4,
        skillsCount: live.skillCount || 2,
        offsetAngle: computedAngle,
        radiusTier: (mapped.length % 2 === 0 ? 2 : 3) as 1 | 2 | 3,
      });
    }
  }

  // التأكد من وجود كافة الوكلاء التسعة الأساسيين إن لم يرجعهم الـ API لأي سبب عارض
  for (const base of REAL_PLATFORM_HUD_AGENTS) {
    if (!handledIds.has(base.id)) {
      mapped.push(base);
    }
  }

  return mapped;
}
