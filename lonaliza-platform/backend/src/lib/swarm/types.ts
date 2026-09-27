export type BuiltInAgentRole =
  | "sales"
  | "b2b_landing"
  | "site_advisor"
  | "ads"
  | "social"
  | "email"
  | "admin";

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
  | "launch_meta_ad";

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
