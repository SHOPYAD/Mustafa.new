import { parseGithubRepoUrl } from "@/lib/server/github-skills";
import type { McpAddInput } from "./types";

export const GITHUB_MCP_ONLY_ERROR =
  "GitHub هنا لاستيراد خادم MCP فقط، ليس لاستنساخ مشاريع كاملة.";

export const GITHUB_MCP_PRIVATE_ERROR =
  "المستودع غير عام أو غير موجود — نقبل فقط تعريف خادم MCP عام تشيرون إليه صراحة.";

const MCP_NAME_RE = /(^|\/|@)mcp([-/]|$)|modelcontextprotocol/i;
const MCP_SIGNAL_RE =
  /@modelcontextprotocol|model context protocol|\bmcp[-_ ]?server\b|\bmcp\.json\b|"mcp"\s*:/i;
const APP_TOY_RE =
  /"next"\s*:|"nuxt"\s*:|"nestjs"\s*:|"django"\s*:|"rails"\s*:|"wordpress"/i;

export type McpGithubSignals = {
  packageName?: string;
  packageJsonText?: string;
  hasMcpJson?: boolean;
  readme?: string;
  description?: string;
  binField?: string;
};

export function looksLikeMcpServer(input: McpGithubSignals): boolean {
  const packageName = input.packageName?.trim() || "";
  const pkg = input.packageJsonText || "";
  const readme = input.readme || "";
  const description = input.description || "";
  const bin = input.binField || "";
  const blob = [packageName, pkg, readme, description, bin].join("\n");

  if (input.hasMcpJson) return true;
  if (MCP_NAME_RE.test(packageName)) return true;
  if (MCP_SIGNAL_RE.test(blob)) return true;

  return false;
}

export function rejectNonMcpGithub(input: McpGithubSignals): string | null {
  if (looksLikeMcpServer(input)) {
    const pkg = input.packageJsonText || "";
    if (APP_TOY_RE.test(pkg) && !MCP_SIGNAL_RE.test(pkg) && !input.hasMcpJson) {
      return GITHUB_MCP_ONLY_ERROR;
    }
    return null;
  }
  return GITHUB_MCP_ONLY_ERROR;
}

type GithubPackageJson = {
  name?: string;
  description?: string;
  bin?: string | Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type GithubRepoMeta = {
  default_branch?: string;
  full_name?: string;
  description?: string | null;
  private?: boolean;
};

async function fetchGithub(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "lonaliza-mcp-registry",
    },
    cache: "no-store",
  });
}

async function fetchGithubJson<T>(url: string): Promise<T> {
  const res = await fetchGithub(url);
  if (res.status === 404) {
    throw new Error(GITHUB_MCP_PRIVATE_ERROR);
  }
  if (res.status === 403) {
    throw new Error("تعذّر قراءة GitHub — حد المعدل أو مستودع غير عام.");
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return (await res.json()) as T;
}

async function fetchGithubText(url: string): Promise<string | null> {
  const res = await fetchGithub(url);
  if (!res.ok) return null;
  return res.text();
}

function binField(pkg: GithubPackageJson | null): string {
  if (!pkg?.bin) return "";
  if (typeof pkg.bin === "string") return pkg.bin;
  return Object.keys(pkg.bin).join(" ");
}

function packageSignals(pkg: GithubPackageJson | null): string {
  if (!pkg) return "";
  const deps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };
  return JSON.stringify({
    name: pkg.name,
    description: pkg.description,
    scripts: pkg.scripts,
    deps: Object.keys(deps),
    bin: pkg.bin,
  });
}

export async function resolveMcpFromGithub(repoUrl: string): Promise<McpAddInput> {
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) throw new Error("رابط GitHub غير صالح");

  const repoMeta = await fetchGithubJson<GithubRepoMeta>(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`
  );
  if (repoMeta.private) throw new Error(GITHUB_MCP_PRIVATE_ERROR);

  const ref = parsed.ref && parsed.ref !== "main" ? parsed.ref : repoMeta.default_branch || "main";
  const base = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${ref}`;
  const prefix = parsed.subpath ? `${parsed.subpath.replace(/\/$/, "")}/` : "";

  let pkg: GithubPackageJson | null = null;
  const pkgText = await fetchGithubText(`${base}/${prefix}package.json`);
  if (pkgText) {
    try {
      pkg = JSON.parse(pkgText) as GithubPackageJson;
    } catch {
      pkg = null;
    }
  }

  const mcpJson = await fetchGithubText(`${base}/${prefix}mcp.json`);
  const readme =
    (await fetchGithubText(`${base}/${prefix}README.md`)) ||
    (await fetchGithubText(`${base}/${prefix}readme.md`)) ||
    "";

  const rejection = rejectNonMcpGithub({
    packageName: pkg?.name,
    packageJsonText: packageSignals(pkg),
    hasMcpJson: Boolean(mcpJson && mcpJson.trim()),
    readme: readme.slice(0, 4000),
    description: repoMeta.description || pkg?.description || "",
    binField: binField(pkg),
  });
  if (rejection) throw new Error(rejection);

  const packageName = pkg?.name?.trim();
  const args = packageName ? ["-y", packageName] : ["-y", `github:${parsed.owner}/${parsed.repo}`];
  return {
    name: packageName || `${parsed.owner}/${parsed.repo}`,
    source: "github",
    transport: "stdio",
    repoUrl: `https://github.com/${parsed.owner}/${parsed.repo}`,
    packageName: packageName || undefined,
    command: "npx",
    args,
  };
}
