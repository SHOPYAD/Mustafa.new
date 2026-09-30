/**
 * Task-domain routing for the supervisor swarm.
 * Destination articles are not pinned to Turkey or Morocco.
 * UI, video, marketing, and booking directives each map to real MCP tools.
 */

export type TaskDomain =
  | "content"
  | "ui"
  | "video"
  | "marketing"
  | "bookings"
  | "flights"
  | "hotels"
  | "visa"
  | "payments"
  | "automation"
  | "reports"
  | "users"
  | "settings"
  | "reseller"
  | "general";

function hasAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

export function classifyTaskDomain(directive: string): TaskDomain {
  const text = directive.toLowerCase();

  if (
    hasAny(text, [
      "مقال",
      "مدون",
      "سيو",
      "seo",
      "blog",
      "article",
      "محتوى",
      "دليل",
      "اكتب",
      "أنشئ",
      "انشئ",
      "write ",
      "guide",
      "فرنسا",
      "france",
      "باريس",
      "paris",
    ])
  ) {
    return "content";
  }

  if (
    hasAny(text, [
      "واجهة",
      "تصميم",
      "مظهر",
      "سكشن",
      "ألوان",
      "الوان",
      "محرر",
      "قالب",
      "layout",
      " ui",
      "ui ",
      "editor",
      "theme",
      "homepage",
    ])
  ) {
    return "ui";
  }

  if (
    hasAny(text, [
      "فيديو",
      "ريلز",
      "ريل",
      "سوشيال",
      "انستغرام",
      "انستقرام",
      "تيك توك",
      "تيكتوك",
      "يوتيوب",
      "higgsfield",
      "capcut",
      "video",
      "reel",
    ])
  ) {
    return "video";
  }

  if (
    hasAny(text, [
      "حملة",
      "واتساب",
      "whatsapp",
      "اعلان",
      "إعلان",
      "اعلان",
      "تسويق",
      "meta",
      "ads",
      "ايميل",
      "بريد",
      "نشرة",
      "campaign",
    ])
  ) {
    return "marketing";
  }

  if (hasAny(text, ["طيران", "flight", "تذكرة", "fare"])) return "flights";
  if (hasAny(text, ["فندق", "hotel", "إقام", "room"])) return "hotels";
  if (hasAny(text, ["تأشير", "visa"])) return "visa";
  if (hasAny(text, ["دفع", "payment", "stripe", "iyzico", "فاتور", "invoice"])) return "payments";
  if (hasAny(text, ["أتمت", "automation", "bullmq", "worker"])) return "automation";
  if (hasAny(text, ["تقرير", "report", "ledger", "margin", "مالي"])) return "reports";
  if (hasAny(text, ["مستخدم", "staff", "صلاح", "permission"])) return "users";
  if (hasAny(text, ["إعداد", "settings", "env"])) return "settings";
  if (hasAny(text, ["موزع", "reseller", "b2b", "whitelabel"])) return "reseller";

  if (
    hasAny(text, [
      "حجز",
      "رحل",
      "باق",
      "سيار",
      "سائق",
      "booking",
    ])
  ) {
    return "bookings";
  }

  return "general";
}

/** Primary and secondary MCP tools that must actually be executed for this domain. */
export function mcpToolsForDomain(domain: TaskDomain): [string, string] {
  switch (domain) {
    case "content":
      return ["mcp_connector_probe", "mcp_tourism_inventory"];
    case "ui":
      return ["mcp_visual_get_schema", "mcp_storefront_get_page_layout"];
    case "video":
      return ["mcp_studio_creative_plan", "mcp_visual_read_sections"];
    case "marketing":
      return ["mcp_meta_ads_intelligence", "mcp_comms_whatsapp_status"];
    case "bookings":
      return ["mcp_dashboard_bookings", "mcp_tourism_inventory"];
    case "flights":
      return ["flights_runtime", "mcp_dashboard_bookings"];
    case "hotels":
      return ["hotels_runtime", "mcp_tourism_inventory"];
    case "visa":
      return ["mcp_connector_probe", "mcp_tourism_inventory"];
    case "payments":
      return ["mcp_admin_get_financial_ledger", "mcp_financial_margin_audit"];
    case "automation":
      return ["mcp_connector_probe", "mcp_dashboard_bookings"];
    case "reports":
      return ["mcp_financial_margin_audit", "mcp_admin_get_financial_ledger"];
    case "users":
      return ["mcp_admin_manage_staff_permissions", "mcp_connector_probe"];
    case "settings":
      return ["control_panel_tools", "mcp_connector_probe"];
    case "reseller":
      return ["mcp_reseller_list_agencies", "mcp_b2b_leads_scout"];
    default:
      return ["mcp_connector_probe", "mcp_tourism_inventory"];
  }
}
