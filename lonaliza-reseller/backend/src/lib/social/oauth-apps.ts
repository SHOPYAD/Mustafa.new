import { promises as fs } from "fs";
import path from "path";

export type OAuthAppProvider = "linkedin" | "threads" | "pinterest" | "gmb";

export type StoredOAuthApp = { clientId: string; clientSecret: string };

type AppsFile = {
  version: 1;
  apps: Partial<Record<OAuthAppProvider, StoredOAuthApp>>;
  telegramBotToken?: string;
  updatedAt: string;
};

function isServerlessHosting(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

export function getOAuthAppsPath(): string {
  const override = (process.env.SOCIAL_OAUTH_APPS_PATH || "").trim();
  if (override) return override;
  if (isServerlessHosting()) return path.join("/tmp", "alrayyan-oauth-apps.json");
  return path.join(process.cwd(), ".data", "social", "oauth-apps.json");
}

function empty(): AppsFile {
  return { version: 1, apps: {}, updatedAt: new Date().toISOString() };
}

async function readFile(): Promise<AppsFile> {
  try {
    const raw = await fs.readFile(getOAuthAppsPath(), "utf8");
    const parsed = JSON.parse(raw) as AppsFile;
    if (!parsed || parsed.version !== 1 || typeof parsed.apps !== "object") return empty();
    return parsed;
  } catch {
    return empty();
  }
}

async function writeFile(data: AppsFile): Promise<void> {
  const file = getOAuthAppsPath();
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  await fs.writeFile(file, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2), {
    mode: 0o600,
  });
}

export async function getOAuthApp(provider: OAuthAppProvider): Promise<StoredOAuthApp | null> {
  const store = await readFile();
  const row = store.apps[provider];
  if (!row?.clientId || !row?.clientSecret) return null;
  return { clientId: row.clientId.trim(), clientSecret: row.clientSecret.trim() };
}

export async function saveOAuthApp(provider: OAuthAppProvider, app: StoredOAuthApp): Promise<void> {
  const store = await readFile();
  store.apps[provider] = {
    clientId: app.clientId.trim(),
    clientSecret: app.clientSecret.trim(),
  };
  await writeFile(store);
}

export async function getTelegramBotTokenFromApps(): Promise<string> {
  const store = await readFile();
  return (store.telegramBotToken || "").trim();
}

export async function saveTelegramBotTokenToApps(token: string): Promise<void> {
  const store = await readFile();
  store.telegramBotToken = token.trim();
  await writeFile(store);
}
