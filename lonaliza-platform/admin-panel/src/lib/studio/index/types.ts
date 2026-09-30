export type PlatformNodeKind =
  | "screen"
  | "nav_group"
  | "nav_leaf"
  | "domain_hub"
  | "domain_item"
  | "admin_page"
  | "api_route"
  | "collection"
  | "capability"
  | "mcp_tool"
  | "agent"
  | "ui_action";

export type PlatformDefaultIntent =
  | "navigate"
  | "open_table"
  | "open_record"
  | "list"
  | "probe"
  | "command"
  | "briefing"
  | "discuss"
  | "creative";

export type PlatformRisk = "low" | "medium" | "high";

export interface PlatformIndexNode {
  id: string;
  kind: PlatformNodeKind;
  screenId?: string;
  mapId?: string;
  hubId?: string;
  labels: { ar: string; en?: string };
  keywords: string[];
  href?: string;
  route?: string;
  collection?: string;
  methods?: ("GET" | "POST" | "PUT" | "PATCH" | "DELETE")[];
  capabilityRefs: string[];
  defaultIntent: PlatformDefaultIntent;
  risk: PlatformRisk;
  evidence: string;
  parentId?: string;
}

export interface IntentLexiconEntry {
  term: string;
  nodeIds: string[];
}
