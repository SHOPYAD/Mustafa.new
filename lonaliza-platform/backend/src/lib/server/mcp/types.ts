export const MCP_SOURCES = ["github", "url", "npm", "other", "builtin"] as const;
export type McpSource = (typeof MCP_SOURCES)[number];

export const MCP_TRANSPORTS = ["stdio", "sse", "http"] as const;
export type McpTransport = (typeof MCP_TRANSPORTS)[number];

export function isMcpSource(value: unknown): value is McpSource {
  return typeof value === "string" && (MCP_SOURCES as readonly string[]).includes(value);
}

export function isMcpTransport(value: unknown): value is McpTransport {
  return typeof value === "string" && (MCP_TRANSPORTS as readonly string[]).includes(value);
}

export type McpToolInfo = {
  name: string;
  description?: string;
};

export type McpServerPublic = {
  id: string;
  name: string;
  source: McpSource;
  transport: McpTransport;
  enabled: boolean;
  repoUrl?: string;
  packageName?: string;
  url?: string;
  command?: string;
  catalogId?: string;
  args: string[];
  hasAuth: boolean;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastError: string | null;
  tools: McpToolInfo[];
  createdAt: string;
  updatedAt: string;
};

export type McpServerRecord = McpServerPublic & {
  cwd?: string;
};

export type McpSecretRecord = {
  apiKey?: string;
  oauthToken?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
};

export type McpAddInput = {
  name?: string;
  source: McpSource;
  transport?: McpTransport;
  repoUrl?: string;
  packageName?: string;
  url?: string;
  command?: string;
  args?: string[];
  catalogId?: string;
  cwd?: string;
  apiKey?: string;
  oauthToken?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
  enabled?: boolean;
};
