import type { McpAddInput, McpTransport } from "./types";

export { resolveMcpFromGithub } from "./github-import";

export function resolveMcpFromNpm(packageName: string): McpAddInput {
  const name = packageName.trim();
  if (!name || /\s/.test(name) || name.startsWith("http")) {
    throw new Error("اسم حزمة npm غير صالح");
  }
  return {
    name,
    source: "npm",
    transport: "stdio",
    packageName: name,
    command: "npx",
    args: ["-y", name],
  };
}

export function resolveMcpFromUrl(rawUrl: string, transport?: McpTransport): McpAddInput {
  const url = new URL(rawUrl.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("MCP URL يجب أن يكون http أو https");
  }
  const kind = transport || (url.pathname.includes("sse") ? "sse" : "http");
  return {
    name: url.hostname,
    source: "url",
    transport: kind,
    url: url.toString(),
  };
}

export function resolveMcpOther(command: string, args: string[] = []): McpAddInput {
  const cmd = command.trim();
  if (!cmd) throw new Error("الأمر مطلوب");
  return {
    name: cmd,
    source: "other",
    transport: "stdio",
    command: cmd,
    args,
  };
}
