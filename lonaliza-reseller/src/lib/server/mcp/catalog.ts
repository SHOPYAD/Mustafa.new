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
    nameAr: "مدونة الريان",
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
    purposeAr: "جلب صفحات عامة عبر HTTP — مفيد للبحث السياحي الرسمي.",
    source: "npm",
    version: "1.0.0",
    categoryAr: "بنية",
    packageName: "@modelcontextprotocol/server-fetch",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-fetch"],
    tools: [{ name: "fetch", description: "GET لعنوان عام" }],
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
