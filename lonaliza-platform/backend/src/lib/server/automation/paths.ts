import path from "path";

function isServerlessHosting(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

export function automationDataDir(): string {
  if (isServerlessHosting()) return path.join("/tmp", "lonaliza-automation");
  return path.join(process.cwd(), ".data", "automation");
}

export function mcpDataDir(): string {
  if (isServerlessHosting()) return path.join("/tmp", "lonaliza-mcp");
  return path.join(process.cwd(), ".data", "mcp");
}

export function jobsStoreFile(): string {
  return path.join(automationDataDir(), "jobs.json");
}

export function settingsStoreFile(): string {
  return path.join(automationDataDir(), "settings.json");
}

export function logsStoreFile(): string {
  return path.join(automationDataDir(), "logs.json");
}

export function cronSecretFile(): string {
  return path.join(automationDataDir(), "cron-secret");
}

export function mcpRegistryFile(): string {
  return path.join(mcpDataDir(), "registry.json");
}

export function mcpSecretsFile(): string {
  return path.join(mcpDataDir(), "secrets.json");
}
