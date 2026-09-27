export type BuiltInAgentRole =
  | "sales"
  | "b2b_landing"
  | "site_advisor"
  | "ads"
  | "social"
  | "email"
  | "lead_scout"
  | "admin"
  | "app_concierge"
  | "app_notifications"
  | "ui_ux_architect"
  | "reseller_network_director"
  | "chief_security_auditor";

export type SwarmActionType =
  | "budget_shift"
  | "campaign_pause"
  | "content_launch"
  | "email_broadcast"
  | "pricing_tweak"
  | "create_automation_job"
  | "create_blog_article"
  | "create_tourism_service"
  | "publish_package"
  | "launch_meta_ad"
  | "publish_social_post"
  | "visual_patch_apply"
  | "reseller_margin_update"
  | "security_audit_rule"
  | "general_coordination";

export type SwarmToolKey =
  | "whatsapp_slots"
  | "comms_conversations"
  | "packages_list"
  | "blog_list"
  | "b2b_sessions"
  | "dashboard_bookings"
  | "hotels_runtime"
  | "flights_runtime"
  | "cars_list"
  | "ads_status"
  | "nostr_social"
  | "tours_list"
  | "create_blog"
  | "create_tour"
  | "publish_travel_package"
  | "create_automation_job"
  | "launch_meta_ad"
  | "launch_maps_scrape"
  | "leads_database"
  | "mcp_admin_get_financial_ledger"
  | "mcp_admin_update_currency_rates"
  | "mcp_admin_query_database"
  | "mcp_admin_manage_staff_permissions"
  | "mcp_storefront_get_page_layout"
  | "mcp_storefront_update_seo_metadata"
  | "mcp_storefront_manage_translations"
  | "mcp_storefront_publish_blog_article"
  | "mcp_reseller_list_agencies"
  | "mcp_reseller_set_pricing_margin"
  | "mcp_reseller_inspect_api_health"
  | "mcp_reseller_provision_whitelabel"
  | "mcp_visual_get_schema"
  | "mcp_visual_read_sections"
  | "mcp_visual_patch_section"
  | "mcp_visual_reorder_sections"
  | "mcp_visual_generate_component"
  | "mcp_visual_apply_theme_tokens";

export type SwarmAgentSkill = {
  id: string;
  title: string;
  markdown: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SwarmAgentRule = {
  id: string;
  title: string;
  markdown: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SwarmAgentMemoryNote = {
  id: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisteredSwarmAgent = {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  avatarIcon: string;
  color: string;
  enabled: boolean;
  isCustom: boolean;
  missionAr: string;
  systemPrompt: string;
  allowedTools: SwarmToolKey[];
  skills: SwarmAgentSkill[];
  rules: SwarmAgentRule[];
  memory: SwarmAgentMemoryNote[];
  createdAt: string;
  updatedAt: string;
};

export type SwarmRegistryFile = {
  version: 1;
  agents: RegisteredSwarmAgent[];
  updatedAt: string;
};

export type GroundedFact = {
  key: string;
  labelAr: string;
  value: string | number | boolean | null;
  source: string;
  fetchedAt: string;
  available: boolean;
};

export type SwarmToolResult = {
  tool: SwarmToolKey;
  ok: boolean;
  summaryAr: string;
  facts: GroundedFact[];
  payload?: Record<string, unknown>;
  error?: string;
};

export type ExecutableSwarmPlan = {
  actionType: SwarmActionType;
  actionPayload?: Record<string, unknown>;
};

export type LiveAgentSnapshot = {
  currentStatus: "idle" | "thinking" | "active" | "optimizing";
  currentTaskAr: string;
  keyMetric: string;
  lastActive: string;
  connected: boolean;
  metricSource: string;
  facts: GroundedFact[];
};

export type TelegramAgentSession = {
  chatId: string;
  agentKey: string;
  expiresAt: string;
};
