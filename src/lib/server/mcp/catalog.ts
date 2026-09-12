import path from "path";
import type { McpAddInput, McpSource, McpToolInfo } from "./types";

export const BUILTIN_MCP_IDS = [
  "liotrip-blog",
  "liotrip-social",
  "liotrip-studio",
  "liotrip-ads",
  "liotrip-canva",
  "liotrip-higgsfield",
  "liotrip-whatsapp",
  "liotrip-weather",
  "liotrip-web-search",
  "liotrip-analytics",
  "liotrip-puppeteer",
  "liotrip-google-flow",
  "liotrip-computer-use",
  "liotrip-browser-use",
  "lonaliza-platform-admin",
  "mcp-fetch",
] as const;
export type BuiltinMcpId = (typeof BUILTIN_MCP_IDS)[number];

export function isBuiltinMcpId(id: string): id is BuiltinMcpId {
  return (BUILTIN_MCP_IDS as readonly string[]).includes(id);
}

export type McpAuthField = {
  key: string;
  labelAr: string;
  secret?: boolean;
  placeholder?: string;
};

export type McpCatalogEntry = {
  id: string;
  nameAr: string;
  purposeAr: string;
  source: McpSource;
  version?: string;
  categoryAr?: string;
  packageName?: string;
  repoUrl?: string;
  url?: string;
  command?: string;
  args?: string[];
  cwd?: string;
  envKey?: string;
  envKeys?: string[];
  authFields?: McpAuthField[];
  authHintAr?: string;
  legalNoteAr?: string;
  needsKey?: boolean;
  tools: McpToolInfo[];
};

const SANDBOX = path.join(process.cwd(), ".data", "mcp-sandbox");

export const MCP_CATALOG: McpCatalogEntry[] = [
  {
    id: "liotrip-canva",
    nameAr: "Canva",
    purposeAr: "تصميم احترافي وموارد العلامة عبر Canva Connect — ثم تسليم الأصل لاعتماد النشر الاجتماعي.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "تصميم",
    needsKey: true,
    envKeys: ["CANVA_ACCESS_TOKEN"],
    authFields: [
      {
        key: "CANVA_ACCESS_TOKEN",
        labelAr: "CANVA_ACCESS_TOKEN",
        secret: true,
        placeholder: "رمز OAuth من developers.canva.com",
      },
    ],
    authHintAr: "من Canva Developers → Connect API → أنشئوا تكاملاً والصقوا Access Token (صلاحيات design:content:write و design:content:read).",
    tools: [
      { name: "canva.health", description: "التحقق من رمز Connect" },
      { name: "canva.create_design", description: "إنشاء تصميم سياحي" },
      { name: "canva.export", description: "تصدير PNG/MP4 إلى الاستوديو" },
      { name: "canva.submit_publish", description: "إرسال للاعتماد ثم النشر" },
    ],
  },
  {
    id: "liotrip-higgsfield",
    nameAr: "Higgsfield AI",
    purposeAr: "توليد صور وفيديو رسمي عبر Higgsfield Cloud ثم تسليم الملف لاعتماد النشر.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "تصميم",
    needsKey: true,
    envKeys: ["HF_API_KEY_ID", "HF_API_SECRET"],
    authFields: [
      {
        key: "HF_API_KEY_ID",
        labelAr: "HF_API_KEY_ID",
        placeholder: "من cloud.higgsfield.ai",
      },
      {
        key: "HF_API_SECRET",
        labelAr: "HF_API_SECRET",
        secret: true,
        placeholder: "السر المرافق للمفتاح",
      },
    ],
    authHintAr: "من Higgsfield Cloud → API credentials. المصادقة: Authorization Key ID:SECRET — بلا اعتماد على Cursor MCP.",
    tools: [
      { name: "higgsfield.health", description: "التحقق من المفاتيح" },
      { name: "higgsfield.generate_image", description: "توليد صورة Soul" },
      { name: "higgsfield.generate_video", description: "توليد فيديو Seedance/DoP" },
      { name: "higgsfield.submit_publish", description: "إرسال للاعتماد ثم النشر" },
    ],
  },
  {
    id: "liotrip-whatsapp",
    nameAr: "واتساب (Cloud API الرسمي)",
    purposeAr: "إرسال قوالب ونصوص معتمدة لجهات CRM بموافقة opt-in فقط، وفحص صحة الاتصال.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "تواصل",
    needsKey: true,
    envKeys: ["WHATSAPP_CLOUD_PHONE_NUMBER_ID", "WHATSAPP_CLOUD_ACCESS_TOKEN", "WHATSAPP_VERIFY_TOKEN"],
    authFields: [
      {
        key: "WHATSAPP_CLOUD_PHONE_NUMBER_ID",
        labelAr: "Phone Number ID",
        placeholder: "رقم طويل من Meta",
      },
      {
        key: "WHATSAPP_CLOUD_ACCESS_TOKEN",
        labelAr: "Access Token",
        secret: true,
      },
      {
        key: "WHATSAPP_VERIFY_TOKEN",
        labelAr: "Verify Token",
        secret: true,
      },
    ],
    authHintAr: "نفس حقول تبويب واتساب / تيليجرام. إن كانت محفوظة يكفي «ربط وتحقق».",
    legalNoteAr:
      "لا نربط واتساب عبر QR أو أرشيف الماك لأن ميتا تحظره وقد يُحظر الرقم — نستخدم Cloud API الرسمي فقط.",
    tools: [
      { name: "whatsapp.health", description: "فحص Graph API" },
      { name: "whatsapp.send_text", description: "نص لجهة opt-in فقط" },
      { name: "whatsapp.send_template", description: "قالب معتمد لجهة opt-in فقط" },
    ],
  },
  {
    id: "liotrip-social",
    nameAr: "نشر اجتماعي",
    purposeAr: "نشر معتمد للحسابات المتصلة فقط (فيسبوك/إنستغرام/يوتيوب/تيك توك/X).",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "تسويق",
    tools: [{ name: "social.publish", description: "publishToConnectedAccounts بعد موافقة" }],
  },
  {
    id: "liotrip-studio",
    nameAr: "استوديو فيديو/صور",
    purposeAr: "خطة أسبوعية، Nano Banana، Veo/Omni، وقص ffmpeg المحلي.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "تصميم",
    tools: [
      { name: "studio.weekly_plan", description: "خطة محتوى أسبوعية" },
      { name: "studio.generate_image", description: "توليد صورة" },
      { name: "studio.generate_video", description: "توليد فيديو" },
      { name: "studio.ffmpeg_status", description: "حالة ffmpeg المحلي" },
    ],
  },
  {
    id: "liotrip-blog",
    nameAr: "مدونة لوناليزا",
    purposeAr: "بحث مسودات المقالات وترجمتها عبر مخزن المدونة المحلي.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "محتوى",
    tools: [
      { name: "blog.research_draft", description: "اكتشاف مواضيع وكتابة مسودة" },
      { name: "blog.translate", description: "ترجمة مقال عربي↔إنجليزي" },
    ],
  },
  {
    id: "liotrip-ads",
    nameAr: "تقارير الإعلانات",
    purposeAr: "حالة جوجل/ميتا والتقارير — بلا إطلاق إلا بعد موافقة وميزانية.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "تسويق",
    tools: [
      { name: "ads.status", description: "حالة الاتصال والبيئة" },
      { name: "ads.reports", description: "آخر تقرير تيليجرام" },
      { name: "ads.lookalike", description: "جمهور مشابه من CRM opt-in (يتطلب approved)" },
      { name: "ads.ctwa", description: "حملة Click-to-WhatsApp متوقفة (يتطلب approved+budget)" },
      { name: "ads.launch_targeted_campaign", description: "إطلاق حملة ميتا مستهدفة بفيديو Reels بعد اعتماد الأدمن" },
    ],
  },
  {
    id: "mcp-github-import",
    nameAr: "مستورد GitHub لخوادم MCP",
    purposeAr: "الصقوا رابط مستودع خادم MCP عام فقط. نرفض استنساخ المشاريع الكاملة أو تطبيقات خاصة.",
    source: "github",
    version: "1.0.0",
    categoryAr: "بنية",
    needsKey: true,
    authFields: [
      {
        key: "repoUrl",
        labelAr: "رابط GitHub لخادم MCP",
        placeholder: "https://github.com/org/mcp-server",
      },
    ],
    authHintAr: "يُقبل فقط إن ذكرت الحزمة mcp / @modelcontextprotocol أو وُجد mcp.json.",
    legalNoteAr: "GitHub هنا لاستيراد خادم MCP فقط، ليس لاستنساخ مشاريع كاملة.",
    tools: [{ name: "import_mcp", description: "استيراد خادم MCP عام" }],
  },
  {
    id: "mcp-fetch",
    nameAr: "Fetch / HTTP",
    purposeAr: "جلب صفحات عامة عبر HTTP ومحول ماركداون محلي فائق السرعة — مفيد للبحث السياحي والتحقق الميداني.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "بنية",
    tools: [{ name: "fetch", description: "جلب صفحة ويب عامة وتحويلها إلى ماركداون نظيف" }],
  },
  {
    id: "mcp-memory",
    nameAr: "ذاكرة MCP",
    purposeAr: "ذاكرة ملاحظات للوكيل بين الجلسات.",
    source: "npm",
    version: "1.0.0",
    categoryAr: "بنية",
    packageName: "@modelcontextprotocol/server-memory",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
    tools: [{ name: "create_entities", description: "بعد التحقق" }],
  },
  {
    id: "mcp-filesystem",
    nameAr: "ملفات معزولة",
    purposeAr: "وصول ملفات داخل .data/mcp-sandbox فقط — بلا بقية الخادم.",
    source: "npm",
    version: "1.0.0",
    categoryAr: "بنية",
    packageName: "@modelcontextprotocol/server-filesystem",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", SANDBOX],
    cwd: SANDBOX,
    tools: [{ name: "read_file", description: "قراءة ملف من الصندوق الرملي" }],
  },
  {
    id: "liotrip-weather",
    nameAr: "الطقس والمناخ السياحي",
    purposeAr: "استعلام لحظي عن الطقس لـ 15 وجهة في تركيا واقتراح نوع الرحلات والأنشطة المناسبة للوكيل.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "سياحة",
    tools: [{ name: "weather.get_forecast", description: "جلب طقس الوجهة مع توصية تسويقية ذكية" }],
  },
  {
    id: "liotrip-web-search",
    nameAr: "البحث الحي في الويب",
    purposeAr: "بحث مباشر في الإنترنت عن أحداث السياحة، أسعار الطيران، شروط الفيزا، وتفضيلات المسافرين.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "معلومات",
    tools: [{ name: "web.search", description: "بحث مباشر في الويب عن أي موضوع سياحي" }],
  },
  {
    id: "liotrip-analytics",
    nameAr: "تحليلات الحجوزات والطلب",
    purposeAr: "تحليل طلبات السفر والفنادق الأكثر رواجاً لتوجيه الحملات والوكلاء إلى الوجهات الأكثر ربحية.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "بيانات",
    tools: [{ name: "analytics.demand_report", description: "تقرير اتجاهات الطلب والوجهات الأكثر تحويلاً" }],
  },
  {
    id: "liotrip-puppeteer",
    nameAr: "متصفح الويب التلقائي (Stealth)",
    purposeAr: "متصفح ذكي مقنع لقراءة صفحات الفنادق ومواقع الحجز دون كشفه كبوت أو حظره.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "أتمتة",
    tools: [{ name: "browser.scrape_page", description: "زيارة موقع واستخراج النصوص ومعاينة الصفحة" }],
  },
  {
    id: "liotrip-google-flow",
    nameAr: "محرك فيديو Google Flow (Ultra)",
    purposeAr: "إنتاج ريلز وفيديوهات سياحية بنماذج Omni 1.1 و Veo برصيد Ultra، وإرسالها للموافقة على تيليجرام للنشر والإعلانات.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "فيديو",
    tools: [
      { name: "flow.generate_video", description: "توليد فيديو سياحي بالذكاء الاصطناعي مع إشعار تيليجرام" },
      { name: "flow.save_session", description: "حفظ رمز الجلسة لحساب Ultra" },
    ],
  },
  {
    id: "lonaliza-platform-admin",
    nameAr: "مشرف منصة لوناليزا العام (Platform Admin)",
    purposeAr: "تدقيق وإعداد كافة أقسام المنصة الـ 19، بما فيها مجتمع السوشيال ميديا وريلز النوستر، فحص الجاهزية للإنتاج، ومراقبة أعمال الوكلاء، وحفظ المفاتيح، والربط مع تيليجرام.",
    source: "builtin",
    version: "1.1.0",
    categoryAr: "إدارة",
    tools: [
      { name: "admin.audit_platform", description: "فحص جاهزية المنصة الشامل لـ 19 قسماً وحساب النسبة المئوية والنواقص" },
      { name: "admin.get_settings_overview", description: "استعراض الإعدادات وقيم الأقسام" },
      { name: "admin.configure_setting", description: "تعديل وضبط أي إعداد وحفظه في المنصة" },
      { name: "admin.guide_api_key", description: "دليل وخطوات ورابط جلب أي مفتاح API خارجي" },
      { name: "admin.save_and_verify_key", description: "حفظ وفحص أي مفتاح API في قاعدة البيانات فوراً" },
      { name: "admin.monitor_agents_activity", description: "مراقبة خلايا الوكلاء الـ 6 والقرارات المعلقة" },
      { name: "admin.get_executive_metrics", description: "إحصائيات ومؤشرات الزيارات والحجوزات والكتالوج والسوشيال" },
      { name: "admin.send_telegram_briefing", description: "إرسال تقرير إحاطة تنفيذي مباشر إلى تيليجرام" },
      { name: "admin.get_social_community_status", description: "استعلام شامل لحالة مجتمع السوشيال ميديا وريلز النوستر ونقاط الولاء" },
      { name: "admin.test_nostr_relays", description: "فحص سرعة واتصال خوادم ريلايز النوستر وسيرفرات ميديا Blossom اللحظية عبر WebSocket" },
      { name: "admin.update_social_points", description: "تحديث وإدارة نقاط التفاعل ومكافآت محفظة الحجوزات والسقف اليومي" },
      { name: "admin.manage_nostr_relays", description: "إضافة أو تفعيل أو تعطيل خوادم ريلايز النوستر اللامركزية" },
      { name: "admin.moderate_social_content", description: "إدارة الرقابة، حظر المفاتيح، إخفاء المنشورات، وفلترة المحتوى السياحي الصارم 100%" },
      { name: "admin.manage_social_categories", description: "إدارة فئات السفر والسياحة والوجهات في مجتمع السوشيال والريلز" },
      { name: "admin.search_live_hotels", description: "بحث الفنادق الحي عبر كافة الموردين (Seeru Hotels, RateHawk, Hotelbeds, Booking) مع هوامش المنصة" },
      { name: "admin.search_live_transfers", description: "بحث سيارات التوصيل والترانسفير الحي عبر شبكة Seeru Ride وفئات الفانات والسيدان" },
      { name: "admin.search_live_flights", description: "بحث الطيران الحي متعدد الموزعين (BiletBank, PKFARE, Travelport, Seeru Flights)" },
      { name: "admin.smart_pricing_engine", description: "محرك التسعير التنافسي الذكي لمقارنة أسعار السوق وحماية جدار الأمان الربحي وضمان أرخص سعر" },
    ],
  },
  {
    id: "liotrip-computer-use",
    nameAr: "التحكم في كمبيوتر العميل (Computer Use MCP)",
    purposeAr: "أتمتة سطح المكتب لبرامج المونتاج مثل CapCut Desktop و Canva، والتحكم بالفأرة ولوحة المفاتيح وتصدير مقاطع الريلز السياحية ونقلها فورياً للاعتماد على تيليجرام.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "أتمتة المونتاج",
    tools: [
      { name: "computer.health", description: "التحقق من حالة اتصال وكيل سطح المكتب ونظام التشغيل" },
      { name: "computer.capcut_automate_video", description: "مونتاج فيديو سياحي سينمائي كامل في CapCut وقص المشاهد وتصديره" },
      { name: "computer.take_screenshot", description: "التقاط صورة حية لشاشة سطح المكتب والتايملاين" },
      { name: "computer.mouse_click", description: "النقر على إحداثيات أو عنصر في الواجهة (يمين/يسار/مزدوج)" },
      { name: "computer.mouse_drag", description: "سحب وإسقاط العناصر أو الفيديوهات إلى التايملاين" },
      { name: "computer.keyboard_type", description: "كتابة نصوص عربية أو اختصارات في البرامج النشطة" },
      { name: "computer.keyboard_hotkey", description: "إرسال اختصارات لوحة المفاتيح (Ctrl+B للقص، Space للتشغيل، إلخ)" },
      { name: "computer.get_screen_size", description: "استعلام أبعاد الشاشة ودقة العرض" },
      { name: "computer.capcut_split_clip", description: "قص وتقسيم المشهد عند نقطة زمنية محددة في التايملاين" },
      { name: "computer.capcut_add_text", description: "إضافة مسار نصوص وترجمة عربية متحركة فوق الفيديو" },
      { name: "computer.capcut_add_audio", description: "دمج مقطع صوتي وموسيقى سياحية ومزامنة مستوى الصوت" },
      { name: "computer.capcut_apply_transition", description: "تطبيق انتقالات سينمائية (Zoom/Dissolve/Glow) بين المقاطع" },
      { name: "computer.capcut_export", description: "تصدير الفيديو بأبعاد محددة (4K / 1080x1920) بصيغة MP4" },
      { name: "computer.focus_window", description: "تحويل التركيز لنافذة برنامج محددة (CapCut, Canva, Browser)" },
      { name: "computer.clipboard_sync", description: "قراءة أو كتابة نصوص وروابط في الحافظة المشتركة" },
    ],
  },
  {
    id: "liotrip-browser-use",
    nameAr: "التحكم في متصفح العميل (Browser Use MCP)",
    purposeAr: "التحكم المباشر بمتصفح العميل النشط وجلسات الويب المسجلة (CapCut Web و Canva Web) عبر CDP لإنتاج وتصدير الفيديوهات دون استهلاك خادم الوكالة.",
    source: "builtin",
    version: "1.0.0",
    categoryAr: "أتمتة المونتاج",
    tools: [
      { name: "browser.connect_user_session", description: "الربط مع متصفح العميل المفتوح عبر بروتوكول التصحيح CDP" },
      { name: "browser.capcut_web_editor", description: "فتح محرر CapCut Web ومونتاج ريلز سياحي فخم بالذكاء الاصطناعي مع حفظ الكوكيز" },
      { name: "browser.canva_web_editor", description: "توليد تصاميم سياحية فاخرة في Canva Web وتصديرها" },
      { name: "browser.navigate", description: "الانتقال لعنوان URL محدد في لسان التبويب النشط" },
      { name: "browser.click_element", description: "النقر على عنصر في الصفحة بواسطة CSS Selector أو XPath" },
      { name: "browser.fill_input", description: "إدخال نصوص في حقول الإدخال والبحث" },
      { name: "browser.upload_file", description: "رفع ملفات وسائط وفيديوهات إلى محرر الويب النشط" },
      { name: "browser.evaluate_script", description: "تنفيذ كود JavaScript في سياق صفحة المحرر النشطة" },
      { name: "browser.get_active_tab", description: "استعلام بيانات اللسان النشط والعنوان وحالة التحميل" },
      { name: "browser.capture_tab_screenshot", description: "التقاط لقطة شاشة للصفحة النشطة للتحقق من المونتاج" },
      { name: "browser.get_cookies", description: "قراءة وتأكيد كوكيز الجلسة لمحررات الفيديو (CapCut / Canva)" },
      { name: "browser.extract_rendered_video", description: "استخراج رابط الفيديو المصدر وحفظه في استوديو لوناليزا" },
    ],
  },
];

export function getMcpCatalogEntry(id: string): McpCatalogEntry | null {
  return MCP_CATALOG.find((item) => item.id === id) || null;
}

export function catalogToAddInput(entry: McpCatalogEntry, name?: string): McpAddInput {
  return {
    name: name?.trim() || entry.nameAr,
    source: entry.source,
    catalogId: entry.id,
    packageName: entry.packageName,
    repoUrl: entry.repoUrl,
    url: entry.url,
    command: entry.command,
    args: entry.args,
    cwd: entry.cwd,
    transport: entry.source === "url" ? "http" : "stdio",
  };
}

export function catalogNeedsKey(entry: McpCatalogEntry): boolean {
  return Boolean(entry.needsKey || entry.envKey || (entry.envKeys && entry.envKeys.length) || entry.authFields?.length);
}
