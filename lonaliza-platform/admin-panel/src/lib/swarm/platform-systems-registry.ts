import { getProvidersRegistry } from "@/lib/server/providers-registry-store";
import { getServerEnv } from "@/lib/server/env-store";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import { getMarketingEmailSettings } from "@/lib/server/email/marketing-smtp";
import { getGoogleFlowSession } from "@/lib/server/mcp/servers/google-flow-connector";
import { isPocketBaseConfigured } from "@/lib/pocketbase/admin";
import { listAutomationJobs } from "@/lib/server/automation/store";
import { executeSwarmTool } from "@/lib/swarm/agent-tools";
import { executeMcpSwarmCall } from "@/lib/swarm/mcp-swarm-gateway";
import type { SwarmToolKey } from "@/lib/swarm/types";
import type { ThreadTaskType } from "@/lib/swarm/article-thread-checkpoint";
import { readFranceTrendsCache } from "@/lib/swarm/trends-browser-crawl";

export type PlatformSystemStatus = "executable" | "probe-only" | "not-wired";

export type PlatformSystemRow = {
  id: string;
  label: string;
  tool: string;
  connected: boolean;
  error?: string;
  status: PlatformSystemStatus;
  swarmTool?: SwarmToolKey;
  mcpTool?: string;
  adminPath?: string;
};

export type PlatformToolExecuteResult = {
  ok: boolean;
  id: string;
  tool: string;
  summary: string;
  data?: Record<string, unknown>;
  error?: string;
};

const DIRECTIVE_RULES: Array<{ id: string; pattern: RegExp }> = [
  { id: "blog", pattern: /مقال|مدون|دليل|اكتب|article|blog|سيو\b|seo\b/i },
  { id: "email", pattern: /بريد|ايميل|email|smtp|نشرة/i },
  { id: "whatsapp", pattern: /واتساب|whatsapp/i },
  { id: "google_flow", pattern: /google flow|فيديو|video|ريلز|reel/i },
  { id: "meta_ads", pattern: /اعلان|إعلان|meta ads|حملة إعلان|google ads/i },
  { id: "settings", pattern: /إعداد|اعداد|settings|env\b/i },
  { id: "flights", pattern: /طيران|flight|تذاكر/i },
  { id: "hotels", pattern: /فندق|hotel|إقام/i },
  { id: "bookings", pattern: /حجز|booking|pnr/i },
  { id: "packages", pattern: /باق|package|برنامج سياح/i },
  { id: "tours", pattern: /جول|tour|vip tour/i },
  { id: "cars", pattern: /سيار|car rental|أسطول/i },
  { id: "transfers", pattern: /ترانسفير|transfer|توصيل/i },
  { id: "visa", pattern: /تأشير|visa/i },
  { id: "payments", pattern: /دفع|payment|iyzico|stripe|فاتور/i },
  { id: "invoices", pattern: /invoice|فاتورة/i },
  { id: "customers", pattern: /عميل|customer|crm/i },
  { id: "users", pattern: /مستخدم|staff|صلاح|admin user/i },
  { id: "automation", pattern: /أتمت|automation|bullmq|worker/i },
  { id: "visual_editor", pattern: /محرر|visual|homepage|واجهة| ui\b|layout/i },
  { id: "translations", pattern: /ترجم|translation|locale/i },
  { id: "reseller", pattern: /موزع|reseller|b2b|whitelabel/i },
  { id: "leads", pattern: /ليد|lead|scout|rador/i },
  { id: "social", pattern: /nostr|سوشيال|community|مجتمع/i },
  { id: "providers", pattern: /provider|مزود|supplier/i },
  { id: "pocketbase", pattern: /pocketbase|قاعدة البيانات|database/i },
  { id: "reports", pattern: /تقرير|report|ledger|margin|مالي/i },
  { id: "coupons", pattern: /كوبون|coupon|loyalty/i },
  { id: "affiliate", pattern: /affiliate|عمولة/i },
  { id: "media", pattern: /media|وسائط|صور\b/i },
  { id: "integrations", pattern: /integration|ربط|mcp/i },
  { id: "ai_settings", pattern: /gemini|ai settings|ذكاء/i },
  { id: "reviews", pattern: /review|تقييم/i },
  { id: "cancellations", pattern: /cancel|إلغاء/i },
  { id: "gift_cards", pattern: /gift|هدية/i },
  { id: "trends", pattern: /trends|اتجاهات/i },
  { id: "images", pattern: /unsplash|pexels|stock photo/i },
  { id: "swarm", pattern: /swarm|war room|غرفة عمل|مشرف/i },
  { id: "nexus", pattern: /nexus|سلايد البطاق|هولوغر/i },
  { id: "loops", pattern: /loops|تدفق الأتمتة|visual loops|العقد والأتمتة/i },
];

export function platformToolIdForDirective(directive: string): string | null {
  const text = directive.toLowerCase();
  if (/مقال|مدون|دليل|اكتب|article|blog/.test(text) && /فرنسا|france|باريس|paris|وجهات|guide/.test(text)) {
    return null;
  }
  for (const rule of DIRECTIVE_RULES) {
    if (rule.pattern.test(directive)) return rule.id;
  }
  return null;
}

export function shouldProbeExecuteDirective(directive: string): boolean {
  return /افحص|اقرأ|حالة|probe|status|list|inventory|جرد|اعرض|show|read|inspect|execute|نفّذ|نفذ/i.test(directive);
}

export function taskTypeForSystemId(id: string): ThreadTaskType {
  const map: Record<string, ThreadTaskType> = {
    blog: "article",
    email: "email",
    whatsapp: "whatsapp",
    google_flow: "video",
    meta_ads: "ads",
    settings: "settings",
  };
  return map[id] || "general";
}

async function rowBase(): Promise<PlatformSystemRow[]> {
  const registry = await getProvidersRegistry();
  const providers = registry.providers;
  const site = await getServerEnv("NEXT_PUBLIC_SITE_URL");
  const smtp = getMarketingEmailSettings();
  const smtpReady = Boolean(smtp.enabled && smtp.host && smtp.host !== "localhost" && (smtp.username || smtp.password));
  const comms = await getCommsSettings();
  const whatsappReady = Boolean(comms.whatsappAccessToken && comms.whatsappPhoneNumberId);
  const metaId = await getServerEnv("META_APP_ID");
  const metaSecret = await getServerEnv("META_APP_SECRET");
  const adsReady = Boolean(metaId && metaSecret);
  const flow = await getGoogleFlowSession();
  const flowReady = Boolean(flow?.bearerToken || flow?.cookies);
  const flightSuppliers = ["travelport_flights", "seeru", "pkfare", "biletbank"].filter((name) =>
    Boolean(providers[name as keyof typeof providers]?.enabled)
  );
  const hotelSuppliers = ["ratehawk", "hotelbeds", "travelport_hotels", "seeru_hotels"].filter((name) =>
    Boolean(providers[name as keyof typeof providers]?.enabled)
  );
  const unsplash = await getServerEnv("UNSPLASH_ACCESS_KEY");
  const pexels = await getServerEnv("PEXELS_API_KEY");
  const pbOk = await isPocketBaseConfigured();
  const gemini = await getServerEnv("GEMINI_API_KEY");

  return [
    {
      id: "settings",
      label: "إعدادات المنصة",
      tool: "getServerEnv",
      connected: true,
      status: "executable",
      swarmTool: "control_panel_tools",
      adminPath: "/admin/settings",
      error: site ? undefined : "NEXT_PUBLIC_SITE_URL is empty",
    },
    { id: "providers", label: "موزعو الخدمات", tool: "getProvidersRegistry", connected: true, status: "executable", adminPath: "/admin/providers" },
    { id: "email", label: "حملات البريد", tool: "marketing-smtp", connected: smtpReady, status: smtpReady ? "probe-only" : "not-wired", error: smtpReady ? undefined : "SMTP host/credentials are not configured", swarmTool: "control_panel_tools", adminPath: "/admin/email-marketing" },
    { id: "whatsapp", label: "واتساب", tool: "callWhatsAppCloudTool", connected: whatsappReady, status: whatsappReady ? "executable" : "not-wired", error: whatsappReady ? undefined : "WhatsApp Cloud token or phone number id is not connected", swarmTool: "whatsapp_slots", mcpTool: "mcp_comms_whatsapp_status", adminPath: "/admin/automation" },
    { id: "meta_ads", label: "الحملات الإعلانية", tool: "mcp_meta_ads_intelligence", connected: adsReady, status: adsReady ? "executable" : "not-wired", error: adsReady ? undefined : "META_APP_ID / META_APP_SECRET is not connected", swarmTool: "ads_status", mcpTool: "mcp_meta_ads_intelligence", adminPath: "/admin/ads" },
    { id: "google_flow", label: "Google Flow / فيديو", tool: "executeGoogleFlowPipeline", connected: flowReady, status: flowReady ? "probe-only" : "not-wired", error: flowReady ? undefined : "Google Flow is not connected", mcpTool: "mcp_studio_creative_plan", adminPath: "/admin/neural-studio" },
    { id: "blog", label: "المدونة", tool: "blog_list", connected: true, status: "executable", swarmTool: "blog_list", mcpTool: "mcp_storefront_publish_blog_article", adminPath: "/admin/blog" },
    { id: "flights", label: "الطيران", tool: "runFlightSearch", connected: flightSuppliers.length > 0, status: flightSuppliers.length ? "executable" : "not-wired", error: flightSuppliers.length ? undefined : "no live flight supplier enabled", swarmTool: "flights_runtime", mcpTool: "mcp_dashboard_bookings", adminPath: "/admin/flights" },
    { id: "hotels", label: "الفنادق", tool: "runPublicHotelSearch", connected: hotelSuppliers.length > 0, status: hotelSuppliers.length ? "executable" : "not-wired", error: hotelSuppliers.length ? undefined : "no live hotel supplier enabled", swarmTool: "hotels_runtime", adminPath: "/admin/hotels" },
    { id: "bookings", label: "الحجوزات", tool: "dashboard_bookings", connected: true, status: "executable", swarmTool: "dashboard_bookings", mcpTool: "mcp_dashboard_bookings", adminPath: "/admin/bookings" },
    { id: "packages", label: "البرامج السياحية", tool: "packages_list", connected: true, status: "executable", swarmTool: "packages_list", mcpTool: "mcp_tourism_inventory", adminPath: "/admin/packages" },
    { id: "tours", label: "الجولات VIP", tool: "tours_list", connected: true, status: "executable", swarmTool: "tours_list", mcpTool: "mcp_tourism_inventory", adminPath: "/admin/tours" },
    { id: "cars", label: "أسطول السيارات", tool: "cars_list", connected: true, status: "executable", swarmTool: "cars_list", adminPath: "/admin/cars" },
    { id: "transfers", label: "ترانسفير وتأجير", tool: "SeeruRideAdapter.searchRides", connected: Boolean(providers.seeru?.enabled), status: providers.seeru?.enabled ? "executable" : "not-wired", error: providers.seeru?.enabled ? undefined : "Seeru ride supplier is not enabled", adminPath: "/admin/transfers" },
    { id: "visa", label: "التأشيرات", tool: "visa_catalog", connected: true, status: "executable", error: undefined, adminPath: "/admin/visa" },
    { id: "payments", label: "المدفوعات", tool: "mcp_admin_get_financial_ledger", connected: true, status: "executable", mcpTool: "mcp_admin_get_financial_ledger", adminPath: "/admin/payments" },
    { id: "invoices", label: "الفواتير", tool: "mcp_admin_get_financial_ledger", connected: true, status: "probe-only", mcpTool: "mcp_admin_get_financial_ledger", adminPath: "/admin/invoices" },
    { id: "customers", label: "العملاء", tool: "dashboard_bookings", connected: pbOk, status: pbOk ? "executable" : "probe-only", error: pbOk ? undefined : "PocketBase not configured; customer counts unavailable", swarmTool: "dashboard_bookings", adminPath: "/admin/customers" },
    { id: "users", label: "المستخدمون والصلاحيات", tool: "mcp_admin_manage_staff_permissions", connected: true, status: "probe-only", mcpTool: "mcp_admin_manage_staff_permissions", adminPath: "/admin/settings" },
    { id: "automation", label: "الأتمتة", tool: "listAutomationJobs", connected: true, status: "executable", adminPath: "/admin/automation" },
    { id: "visual_editor", label: "المحرر المرئي", tool: "mcp_visual_get_schema", connected: true, status: "executable", mcpTool: "mcp_visual_get_schema", adminPath: "/admin/visual-editor" },
    { id: "translations", label: "الترجمات", tool: "mcp_storefront_manage_translations", connected: true, status: "executable", mcpTool: "mcp_storefront_manage_translations", adminPath: "/admin/translations" },
    { id: "reseller", label: "شبكة الموزعين B2B", tool: "mcp_reseller_list_agencies", connected: true, status: "executable", mcpTool: "mcp_reseller_list_agencies", swarmTool: "b2b_sessions", adminPath: "/admin/resale" },
    { id: "leads", label: "ليدات B2B", tool: "leads_database", connected: true, status: "executable", swarmTool: "leads_database", mcpTool: "mcp_b2b_leads_scout", adminPath: "/admin/resale/scraper" },
    { id: "social", label: "المجتمع / Nostr", tool: "nostr_social", connected: true, status: "executable", swarmTool: "nostr_social", adminPath: "/admin/social-community" },
    { id: "pocketbase", label: "PocketBase", tool: "mcp_admin_query_database", connected: pbOk, status: pbOk ? "executable" : "not-wired", error: pbOk ? undefined : "PocketBase is not configured", mcpTool: "mcp_admin_query_database", adminPath: "/admin/pocketbase" },
    { id: "reports", label: "التقارير والهوامش", tool: "mcp_financial_margin_audit", connected: true, status: "executable", mcpTool: "mcp_financial_margin_audit", adminPath: "/admin/dashboard" },
    { id: "coupons", label: "الكوبونات", tool: "listCoupons", connected: true, status: "executable", adminPath: "/admin/marketing/coupons" },
    { id: "affiliate", label: "التسويق بالعمولة", tool: "affiliate_profiles", connected: pbOk, status: pbOk ? "executable" : "not-wired", error: pbOk ? undefined : "PocketBase is not configured", adminPath: "/admin/affiliate" },
    { id: "media", label: "مكتبة الوسائط", tool: "searchUnsplash/searchPexels", connected: Boolean(unsplash || pexels), status: Boolean(unsplash || pexels) ? "executable" : "not-wired", error: unsplash || pexels ? undefined : "UNSPLASH_ACCESS_KEY and PEXELS_API_KEY are not configured", adminPath: "/admin/media" },
    { id: "images", label: "صور الوجهة", tool: "searchUnsplash/searchPexels", connected: Boolean(unsplash || pexels), status: Boolean(unsplash || pexels) ? "executable" : "not-wired", error: unsplash || pexels ? undefined : "media API keys missing" },
    { id: "integrations", label: "التكاملات / MCP", tool: "mcp_connector_probe", connected: true, status: "executable", mcpTool: "mcp_connector_probe", adminPath: "/admin/integrations" },
    { id: "ai_settings", label: "إعدادات الذكاء", tool: "resolveGeminiApiKey", connected: Boolean(gemini), status: gemini ? "probe-only" : "not-wired", error: gemini ? undefined : "GEMINI_API_KEY is not configured", adminPath: "/admin/ai-settings" },
    { id: "reviews", label: "التقييمات", tool: "getAllReviewsAdmin", connected: true, status: "executable", adminPath: "/admin/reviews" },
    { id: "cancellations", label: "الإلغاءات", tool: "listPendingCancellations", connected: true, status: "executable", adminPath: "/admin/cancellations" },
    { id: "gift_cards", label: "بطاقات الهدايا", tool: "listAllGifts", connected: true, status: "executable", adminPath: "/admin/gift-cards" },
    { id: "trends", label: "Google Trends", tool: "readFranceTrendsCache", connected: true, status: "executable", adminPath: "/admin/automation-studio" },
    { id: "swarm", label: "المشرف / غرفة العمليات", tool: "control_panel_tools", connected: true, status: "executable", swarmTool: "control_panel_tools", adminPath: "/admin/agent-war-room" },
  ];
}

export async function inspectPlatformSystems(): Promise<PlatformSystemRow[]> {
  return rowBase();
}

/** @deprecated alias */
export async function inspectControlPanelTools(): Promise<PlatformSystemRow[]> {
  return inspectPlatformSystems();
}

export async function executeControlPanelTool(id: string): Promise<PlatformToolExecuteResult> {
  const rows = await inspectPlatformSystems();
  const row = rows.find((r) => r.id === id);
  if (!row) {
    return { ok: false, id, tool: "unknown", summary: "", error: `unknown system id: ${id}` };
  }
  if (row.status === "not-wired") {
    return { ok: false, id, tool: row.tool, summary: "", error: row.error || `${row.tool} is not wired` };
  }

  const runSwarm = async (tool: SwarmToolKey) => {
    const res = await executeSwarmTool(tool);
    return {
      ok: res.ok,
      summary: res.summaryAr,
      data: (res.payload as Record<string, unknown>) || {},
      error: res.error,
    };
  };

  const runMcp = async (tool: string) => {
    const res = await executeMcpSwarmCall(tool, { systemId: id });
    return { ok: res.ok, summary: res.summaryAr, data: res.data, error: res.error };
  };

  try {
    switch (id) {
      case "settings": {
        const site = await getServerEnv("NEXT_PUBLIC_SITE_URL");
        const registry = await getProvidersRegistry();
        return {
          ok: true,
          id,
          tool: row.tool,
          summary: `NEXT_PUBLIC_SITE_URL=${site || "(empty)"}; providers=${Object.keys(registry.providers).length}`,
          data: { siteUrl: site, providerKeys: Object.keys(registry.providers) },
        };
      }
      case "providers": {
        const registry = await getProvidersRegistry();
        const enabled = Object.entries(registry.providers)
          .filter(([, v]) => v?.enabled)
          .map(([k]) => k);
        return { ok: true, id, tool: row.tool, summary: `${enabled.length} enabled suppliers`, data: { enabled } };
      }
      case "email": {
        const smtp = getMarketingEmailSettings();
        return {
          ok: Boolean(row.connected),
          id,
          tool: row.tool,
          summary: row.connected ? `SMTP host ${smtp.host}` : row.error || "SMTP not configured",
          error: row.connected ? undefined : row.error,
          data: { enabled: smtp.enabled, host: smtp.host },
        };
      }
      case "automation": {
        const jobs = await listAutomationJobs();
        return { ok: true, id, tool: row.tool, summary: `${jobs.length} automation jobs`, data: { count: jobs.length, names: jobs.slice(0, 8).map((j) => j.name) } };
      }
      case "trends": {
        const cached = await readFranceTrendsCache();
        return {
          ok: true,
          id,
          tool: row.tool,
          summary: cached ? `${cached.hits.length} cached trend rows` : "no trends cache yet",
          data: { hits: cached?.hits?.length || 0 },
        };
      }
      case "google_flow": {
        const session = await getGoogleFlowSession();
        if (!session?.bearerToken && !session?.cookies) {
          return { ok: false, id, tool: row.tool, summary: "", error: row.error || "Google Flow is not connected" };
        }
        return {
          ok: false,
          id,
          tool: row.tool,
          summary: "",
          error: "Google Flow credentials are stored, but this probe does not call the video API",
        };
      }
      case "transfers":
        return {
          ok: false,
          id,
          tool: row.tool,
          summary: "",
          error: row.connected
            ? "Seeru is enabled in the registry, but this probe did not receive a ride-search response"
            : row.error || "Seeru ride supplier is not enabled",
        };
      case "visa": {
        const { defaultVisaData } = await import("@/data/visa");
        const countries = defaultVisaData.filter((row) => row.isActive !== false);
        return {
          ok: true,
          id,
          tool: row.tool,
          summary: `${countries.length} visa catalog countries (internal catalog, not a live embassy connector)`,
          data: { count: countries.length, source: "internal_catalog" },
        };
      }
      case "coupons": {
        const { listCoupons } = await import("@/lib/loyalty/store");
        const coupons = await listCoupons();
        return { ok: true, id, tool: row.tool, summary: `${coupons.length} coupons`, data: { count: coupons.length } };
      }
      case "affiliate": {
        const { tryCreateAdminPocketBase } = await import("@/lib/pocketbase/admin");
        const pb = await tryCreateAdminPocketBase();
        if (!pb) return { ok: false, id, tool: row.tool, summary: "", error: "PocketBase unavailable" };
        const profiles = await pb.collection("affiliate_profiles").getList(1, 20);
        return {
          ok: true,
          id,
          tool: row.tool,
          summary: `${profiles.totalItems} affiliate profiles`,
          data: { count: profiles.totalItems },
        };
      }
      case "reviews": {
        const { getAllReviewsAdmin } = await import("@/lib/server/customer-reviews-store");
        const reviews = await getAllReviewsAdmin();
        return { ok: true, id, tool: row.tool, summary: `${reviews.length} reviews`, data: { count: reviews.length } };
      }
      case "cancellations": {
        const { listPendingCancellations } = await import("@/lib/server/hotel-cancellations");
        const bookings = await listPendingCancellations();
        return {
          ok: true,
          id,
          tool: row.tool,
          summary: `${bookings.length} pending cancellations`,
          data: { count: bookings.length },
        };
      }
      case "gift_cards": {
        const { listAllGifts } = await import("@/lib/server/lonaliza-social-commerce");
        const cards = await listAllGifts();
        return { ok: true, id, tool: row.tool, summary: `${cards.length} gift cards`, data: { count: cards.length } };
      }
      default:
        if (row.swarmTool) {
          const inner = await runSwarm(row.swarmTool);
          return { ok: inner.ok, id, tool: row.swarmTool, summary: inner.summary, data: inner.data, error: inner.error };
        }
        if (row.mcpTool) {
          const inner = await runMcp(row.mcpTool);
          return { ok: inner.ok, id, tool: row.mcpTool, summary: inner.summary, data: inner.data, error: inner.error };
        }
        return { ok: false, id, tool: row.tool, summary: "", error: "no execute hook configured" };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, id, tool: row.tool, summary: "", error: msg };
  }
}
