import { promises as fs } from "fs";
import path from "path";
import { mcpRegistryFile, mcpSecretsFile } from "@/lib/server/automation/paths";
import {
  isMcpSource,
  isMcpTransport,
  type McpAddInput,
  type McpSecretRecord,
  type McpServerPublic,
  type McpServerRecord,
  type McpToolInfo,
} from "./types";

type RegistryFile = {
  version: 1;
  servers: McpServerRecord[];
  updatedAt: string;
};

type SecretsFile = {
  version: 1;
  secrets: Record<string, McpSecretRecord>;
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `mcp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toPublic(server: McpServerRecord, secrets: Record<string, McpSecretRecord>): McpServerPublic {
  const secret = secrets[server.id];
  const { cwd: _cwd, ...rest } = server;
  return {
    ...rest,
    hasAuth: Boolean(
      secret?.apiKey ||
        secret?.oauthToken ||
        (secret?.headers && Object.keys(secret.headers).length) ||
        (secret?.env && Object.keys(secret.env).length)
    ),
  };
}

function normalizeServer(raw: unknown): McpServerRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  if (typeof rec.id !== "string" || typeof rec.name !== "string" || !isMcpSource(rec.source)) {
    return null;
  }
  return {
    id: rec.id,
    name: rec.name,
    source: rec.source,
    transport: isMcpTransport(rec.transport) ? rec.transport : rec.source === "url" ? "http" : "stdio",
    enabled: rec.enabled !== false,
    repoUrl: typeof rec.repoUrl === "string" ? rec.repoUrl : undefined,
    packageName: typeof rec.packageName === "string" ? rec.packageName : undefined,
    url: typeof rec.url === "string" ? rec.url : undefined,
    command: typeof rec.command === "string" ? rec.command : undefined,
    catalogId: typeof rec.catalogId === "string" ? rec.catalogId : undefined,
    args: Array.isArray(rec.args) ? rec.args.map(String) : [],
    cwd: typeof rec.cwd === "string" ? rec.cwd : undefined,
    hasAuth: false,
    lastTestAt: typeof rec.lastTestAt === "string" ? rec.lastTestAt : null,
    lastTestOk: typeof rec.lastTestOk === "boolean" ? rec.lastTestOk : null,
    lastError: typeof rec.lastError === "string" ? rec.lastError : null,
    tools: Array.isArray(rec.tools)
      ? rec.tools.flatMap((item): McpToolInfo[] => {
          if (!item || typeof item !== "object") return [];
          const tool = item as Record<string, unknown>;
          if (typeof tool.name !== "string") return [];
          return [
            {
              name: tool.name,
              description: typeof tool.description === "string" ? tool.description : undefined,
            },
          ];
        })
      : [],
    createdAt: typeof rec.createdAt === "string" ? rec.createdAt : nowIso(),
    updatedAt: typeof rec.updatedAt === "string" ? rec.updatedAt : nowIso(),
  };
}

async function readRegistry(): Promise<RegistryFile> {
  try {
    const raw = await fs.readFile(mcpRegistryFile(), "utf8");
    const parsed = JSON.parse(raw) as RegistryFile;
    return {
      version: 1,
      servers: (Array.isArray(parsed.servers) ? parsed.servers : [])
        .map(normalizeServer)
        .filter((item): item is McpServerRecord => item != null),
      updatedAt: parsed.updatedAt || nowIso(),
    };
  } catch {
    return { version: 1, servers: [], updatedAt: nowIso() };
  }
}

async function writeRegistry(file: RegistryFile): Promise<RegistryFile> {
  const payload: RegistryFile = { ...file, version: 1, updatedAt: nowIso() };
  await fs.mkdir(path.dirname(mcpRegistryFile()), { recursive: true });
  await fs.writeFile(mcpRegistryFile(), JSON.stringify(payload, null, 2), { mode: 0o600 });
  return payload;
}

async function readSecrets(): Promise<SecretsFile> {
  try {
    const raw = await fs.readFile(mcpSecretsFile(), "utf8");
    const parsed = JSON.parse(raw) as SecretsFile;
    return {
      version: 1,
      secrets: parsed.secrets && typeof parsed.secrets === "object" ? parsed.secrets : {},
    };
  } catch {
    return { version: 1, secrets: {} };
  }
}

async function writeSecrets(file: SecretsFile): Promise<void> {
  await fs.mkdir(path.dirname(mcpSecretsFile()), { recursive: true });
  await fs.writeFile(mcpSecretsFile(), JSON.stringify(file, null, 2), { mode: 0o600 });
}

export async function listMcpServers(): Promise<McpServerPublic[]> {
  const [registry, secrets] = await Promise.all([readRegistry(), readSecrets()]);
  return registry.servers.map((server) => toPublic(server, secrets.secrets));
}

export async function getMcpServer(id: string): Promise<McpServerRecord | null> {
  const registry = await readRegistry();
  return registry.servers.find((item) => item.id === id) || null;
}

export async function getMcpSecret(id: string): Promise<McpSecretRecord> {
  const secrets = await readSecrets();
  return secrets.secrets[id] || {};
}

export async function addMcpServer(input: McpAddInput): Promise<McpServerPublic> {
  const registry = await readRegistry();
  const ts = nowIso();
  const id = newId();
  const name =
    input.name?.trim() ||
    input.packageName?.trim() ||
    input.repoUrl?.trim() ||
    input.url?.trim() ||
    `MCP ${id}`;
  const transport = input.transport || (input.source === "url" ? "http" : "stdio");
  const record: McpServerRecord = {
    id,
    name,
    source: input.source,
    transport,
    enabled: input.enabled !== false,
    repoUrl: input.repoUrl?.trim() || undefined,
    packageName: input.packageName?.trim() || undefined,
    url: input.url?.trim() || undefined,
    command: input.command?.trim() || undefined,
    catalogId: input.catalogId?.trim() || undefined,
    args: Array.isArray(input.args) ? input.args.map(String) : [],
    cwd: input.cwd,
    hasAuth: false,
    lastTestAt: null,
    lastTestOk: null,
    lastError: null,
    tools: [],
    createdAt: ts,
    updatedAt: ts,
  };
  await writeRegistry({ ...registry, servers: [...registry.servers, record] });
  if (input.apiKey || input.oauthToken || input.headers || input.env) {
    const secrets = await readSecrets();
    secrets.secrets[id] = {
      apiKey: input.apiKey?.trim() || undefined,
      oauthToken: input.oauthToken?.trim() || undefined,
      headers: input.headers,
      env: input.env,
    };
    await writeSecrets(secrets);
  }
  const secrets = await readSecrets();
  return toPublic(record, secrets.secrets);
}

export async function patchMcpServer(
  id: string,
  patch: Partial<McpServerRecord> & { apiKey?: string; oauthToken?: string; headers?: Record<string, string>; env?: Record<string, string> }
): Promise<McpServerPublic> {
  const registry = await readRegistry();
  const existing = registry.servers.find((item) => item.id === id);
  if (!existing) throw new Error("MCP server not found");
  const next: McpServerRecord = {
    ...existing,
    ...patch,
    id,
    args: patch.args ?? existing.args,
    updatedAt: nowIso(),
  };
  await writeRegistry({
    ...registry,
    servers: registry.servers.map((item) => (item.id === id ? next : item)),
  });
  if (patch.apiKey || patch.oauthToken || patch.headers || patch.env) {
    const secrets = await readSecrets();
    const current = secrets.secrets[id] || {};
    secrets.secrets[id] = {
      ...current,
      apiKey: patch.apiKey !== undefined ? patch.apiKey.trim() || undefined : current.apiKey,
      oauthToken: patch.oauthToken !== undefined ? patch.oauthToken.trim() || undefined : current.oauthToken,
      headers: patch.headers ?? current.headers,
      env: patch.env ? { ...(current.env || {}), ...patch.env } : current.env,
    };
    await writeSecrets(secrets);
  }
  const secrets = await readSecrets();
  return toPublic(next, secrets.secrets);
}

export async function deleteMcpServer(id: string): Promise<void> {
  const registry = await readRegistry();
  await writeRegistry({ ...registry, servers: registry.servers.filter((item) => item.id !== id) });
  const secrets = await readSecrets();
  delete secrets.secrets[id];
  await writeSecrets(secrets);
}

export async function recordMcpTest(
  id: string,
  result: { ok: boolean; tools?: McpToolInfo[]; error?: string }
): Promise<McpServerPublic> {
  return patchMcpServer(id, {
    lastTestAt: nowIso(),
    lastTestOk: result.ok,
    lastError: result.ok ? null : result.error || "Test failed",
    tools: result.tools || [],
  });
}

export async function findMcpByCatalogId(catalogId: string): Promise<McpServerPublic | null> {
  const servers = await listMcpServers();
  return servers.find((item) => item.catalogId === catalogId) || null;
}

export async function listEnabledMcpTools(): Promise<Array<McpToolInfo & { serverId: string; serverName: string }>> {
  const servers = await listMcpServers();
  return servers
    .filter((server) => server.enabled && server.lastTestOk)
    .flatMap((server) =>
      server.tools.map((tool) => ({
        ...tool,
        serverId: server.id,
        serverName: server.name,
      }))
    );
}
