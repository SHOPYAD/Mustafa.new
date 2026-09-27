import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { encryptSecret, decryptSecret } from "@/lib/publish/crypto";
import type { PublishOAuthProvider } from "./types";

export const SOCIAL_PENDING_COOKIE = "alrayyan_oauth_pending";

export type PendingOAuthChoice = {
  id: string;
  label: string;
  hint?: string;
};

export type PendingOAuthSession = {
  id: string;
  provider: Extract<PublishOAuthProvider, "linkedin-page" | "gmb">;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes?: string[];
  picture?: string;
  displayName?: string;
  choices: PendingOAuthChoice[];
  expiresAt: number;
};

type PendingFile = { sessions: PendingOAuthSession[]; updatedAt: string };

function isServerlessHosting(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

function pendingPath(): string {
  const override = (process.env.SOCIAL_OAUTH_PENDING_PATH || "").trim();
  if (override) return override;
  if (isServerlessHosting()) return path.join("/tmp", "alrayyan-oauth-pending.json");
  return path.join(process.cwd(), ".data", "social", "oauth-pending.json");
}

async function readAll(): Promise<PendingOAuthSession[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(pendingPath(), "utf8")) as PendingFile;
    const now = Date.now();
    return (parsed.sessions || []).filter((row) => row.expiresAt > now);
  } catch {
    return [];
  }
}

async function writeAll(sessions: PendingOAuthSession[]): Promise<void> {
  const file = pendingPath();
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const payload: PendingFile = { sessions, updatedAt: new Date().toISOString() };
  await fs.writeFile(file, JSON.stringify(payload), { mode: 0o600 });
}

export async function savePendingOAuth(
  input: Omit<PendingOAuthSession, "id" | "expiresAt">
): Promise<PendingOAuthSession> {
  const id = randomBytes(16).toString("hex");
  const session: PendingOAuthSession = {
    ...input,
    id,
    accessToken: await encryptSecret(input.accessToken),
    refreshToken: input.refreshToken ? await encryptSecret(input.refreshToken) : undefined,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  const sessions = (await readAll()).filter((row) => row.provider !== input.provider);
  sessions.push(session);
  await writeAll(sessions);
  return { ...session, accessToken: input.accessToken, refreshToken: input.refreshToken };
}

export async function takePendingOAuth(
  id: string,
  provider: PendingOAuthSession["provider"]
): Promise<PendingOAuthSession | null> {
  const sessions = await readAll();
  const found = sessions.find((row) => row.id === id && row.provider === provider);
  if (!found) return null;
  await writeAll(sessions.filter((row) => row.id !== id));
  return {
    ...found,
    accessToken: await decryptSecret(found.accessToken),
    refreshToken: found.refreshToken ? await decryptSecret(found.refreshToken) : undefined,
  };
}

export function pendingCookieHeader(id: string, origin: string): string {
  const secure = origin.startsWith("https:") ? "; Secure" : "";
  return `${SOCIAL_PENDING_COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`;
}

export function clearPendingCookieHeader(origin: string): string {
  const secure = origin.startsWith("https:") ? "; Secure" : "";
  return `${SOCIAL_PENDING_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
