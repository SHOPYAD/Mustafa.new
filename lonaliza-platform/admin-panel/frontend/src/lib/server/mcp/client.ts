import path from "path";
import { callBuiltinTool, verifyBuiltinCatalog } from "./builtin";
import { getMcpSecret, getMcpServer, recordMcpTest } from "./store";
import type { McpServerRecord, McpToolInfo } from "./types";

const TEST_TIMEOUT_MS = 60_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function redactError(error: unknown): string {
  const message = error instanceof Error ? error.message : "MCP test failed";
  return message.replace(/(Bearer|token|key|secret|password)\s*[:=]\s*\S+/gi, "$1=[redacted]");
}

type ConnectedClient = {
  client: { listTools: () => Promise<{ tools?: Array<{ name: string; description?: string }> }>; callTool: (req: { name: string; arguments?: Record<string, unknown> }) => Promise<unknown>; close: () => Promise<void> };
};

async function connectSdk(server: McpServerRecord): Promise<ConnectedClient> {
  const secret = await getMcpSecret(server.id);
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const client = new Client({ name: "lonaliza-automation", version: "1.0.0" });

  if (server.transport === "stdio") {
    const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
    const nodeBinDir = path.dirname(process.execPath);
    const command = server.command && server.command !== "npx" ? server.command : path.join(nodeBinDir, "npx");
    const args = server.args.length ? server.args : server.packageName ? ["-y", server.packageName] : [];
    if (!command) throw new Error("لا يوجد أمر stdio للخادم");
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === "string") env[key] = value;
    }
    if (!env.PATH || !env.PATH.includes(nodeBinDir)) {
      env.PATH = `${nodeBinDir}:${env.PATH || "/usr/local/bin:/usr/bin:/bin"}`;
    }
    if (secret.env) Object.assign(env, secret.env);
    if (secret.apiKey) env.MCP_API_KEY = secret.apiKey;
    if (secret.oauthToken) env.MCP_OAUTH_TOKEN = secret.oauthToken;
    if (secret.apiKey && !env.GITHUB_PERSONAL_ACCESS_TOKEN) {
      env.GITHUB_PERSONAL_ACCESS_TOKEN = secret.apiKey;
    }
    const transport = new StdioClientTransport({
      command,
      args,
      env,
      cwd: server.cwd,
      stderr: "pipe",
    });
    await withTimeout(client.connect(transport), TEST_TIMEOUT_MS, "stdio connect");
    return { client };
  }

  if (!server.url) throw new Error("عنوان MCP URL مطلوب");
  const headers: Record<string, string> = { ...(secret.headers || {}) };
  if (secret.apiKey && !headers.Authorization && !headers["x-api-key"]) {
    headers.Authorization = `Bearer ${secret.apiKey}`;
  }
  if (secret.oauthToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${secret.oauthToken}`;
  }

  if (server.transport === "sse") {
    const { SSEClientTransport } = await import("@modelcontextprotocol/sdk/client/sse.js");
    const transport = new SSEClientTransport(new URL(server.url), { requestInit: { headers } });
    await withTimeout(client.connect(transport), TEST_TIMEOUT_MS, "sse connect");
  } else {
    const { StreamableHTTPClientTransport } = await import(
      "@modelcontextprotocol/sdk/client/streamableHttp.js"
    );
    const transport = new StreamableHTTPClientTransport(new URL(server.url), {
      requestInit: { headers },
    });
    await withTimeout(client.connect(transport), TEST_TIMEOUT_MS, "http connect");
  }
  return { client };
}

async function listToolsViaSdk(server: McpServerRecord): Promise<McpToolInfo[]> {
  const { client } = await connectSdk(server);
  try {
    const listed = await withTimeout(client.listTools(), TEST_TIMEOUT_MS, "listTools");
    return (listed.tools || []).map((tool) => ({
      name: tool.name,
      description: tool.description,
    }));
  } finally {
    await client.close().catch(() => undefined);
  }
}

export async function testMcpConnection(id: string): Promise<{
  ok: boolean;
  tools: McpToolInfo[];
  error?: string;
}> {
  const server = await getMcpServer(id);
  if (!server) return { ok: false, tools: [], error: "MCP server not found" };
  if (server.source === "builtin" && server.catalogId) {
    const result = await verifyBuiltinCatalog(server.catalogId, server.id);
    await recordMcpTest(id, {
      ok: result.ok,
      tools: result.tools,
      error: result.error,
    });
    return result;
  }
  try {
    const tools = await listToolsViaSdk(server);
    await recordMcpTest(id, { ok: true, tools });
    return { ok: true, tools };
  } catch (error) {
    const message = redactError(error);
    await recordMcpTest(id, { ok: false, error: message });
    return { ok: false, tools: [], error: message };
  }
}

export async function callMcpTool(
  id: string,
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const server = await getMcpServer(id);
  if (!server) return { ok: false, error: "MCP server not found" };
  if (!server.enabled) return { ok: false, error: "الخادم متوقف" };
  if (server.source === "builtin" && server.catalogId) {
    const result = await callBuiltinTool(server.catalogId, toolName, args, server.id);
    return { ok: result.ok, result: result.content, error: result.error };
  }
  const { client } = await connectSdk(server);
  try {
    const output = await withTimeout(
      client.callTool({ name: toolName, arguments: args }),
      TEST_TIMEOUT_MS,
      "callTool"
    );
    return { ok: true, result: output };
  } catch (error) {
    return { ok: false, error: redactError(error) };
  } finally {
    await client.close().catch(() => undefined);
  }
}
