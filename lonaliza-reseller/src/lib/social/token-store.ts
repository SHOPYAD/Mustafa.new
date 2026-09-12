import { createHash, randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  ACCOUNT_STATUS_AR,
  type AccountStatus,
  type PublicSocialAccount,
  type SocialPlatform,
  type StoredSocialAccount,
  type TokenStoreFile,
} from "./types";

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

export function getTokenStorePath(): string {
  const override = (process.env.SOCIAL_TOKENS_PATH || "").trim();
  if (override) return override;
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-social-tokens.json");
  }
  return path.join(process.cwd(), ".data", "social", "tokens.json");
}

function emptyStore(): TokenStoreFile {
  return { version: 1, accounts: [], updatedAt: new Date().toISOString() };
}

function isPlatform(value: unknown): value is SocialPlatform {
  return (
    value === "facebook" ||
    value === "instagram" ||
    value === "youtube" ||
    value === "tiktok" ||
    value === "x"
  );
}

function isStatus(value: unknown): value is AccountStatus {
  return (
    value === "connected" ||
    value === "disconnected" ||
    value === "needs_reauth"
  );
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeAccount(raw: unknown): StoredSocialAccount | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (!isPlatform(row.platform)) return null;
  const id = asString(row.id);
  const externalId = asString(row.externalId);
  const accessToken = asString(row.accessToken);
  if (!id || !externalId) return null;
  return {
    id,
    platform: row.platform,
    displayName: asString(row.displayName) || row.platform,
    username: asString(row.username) || undefined,
    externalId,
    status: isStatus(row.status) ? row.status : accessToken ? "connected" : "disconnected",
    scopes: asStringList(row.scopes),
    accessToken,
    refreshToken: asString(row.refreshToken) || undefined,
    tokenExpiresAt: asString(row.tokenExpiresAt) || undefined,
    pageAccessToken: asString(row.pageAccessToken) || undefined,
    pageId: asString(row.pageId) || undefined,
    instagramUserId: asString(row.instagramUserId) || undefined,
    connectedAt: asString(row.connectedAt) || new Date().toISOString(),
    lastRefreshedAt: asString(row.lastRefreshedAt) || undefined,
    lastError: asString(row.lastError) || undefined,
  };
}

async function readStore(): Promise<TokenStoreFile> {
  try {
    const raw = await fs.readFile(getTokenStorePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<TokenStoreFile>;
    const accounts = Array.isArray(parsed.accounts)
      ? parsed.accounts
          .map(sanitizeAccount)
          .filter((row): row is StoredSocialAccount => Boolean(row))
      : [];
    return {
      version: 1,
      accounts,
      updatedAt: asString(parsed.updatedAt) || new Date().toISOString(),
    };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: TokenStoreFile): Promise<void> {
  const file = getTokenStorePath();
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const payload: TokenStoreFile = {
    version: 1,
    accounts: store.accounts,
    updatedAt: new Date().toISOString(),
  };
  const tmp = `${file}.${randomBytes(6).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(payload, null, 2), { mode: 0o600 });
  await fs.rename(tmp, file);
}

export function toPublicAccount(account: StoredSocialAccount): PublicSocialAccount {
  return {
    id: account.id,
    platform: account.platform,
    displayName: account.displayName,
    username: account.username,
    externalId: account.externalId,
    status: account.status,
    statusLabel: ACCOUNT_STATUS_AR[account.status],
    scopes: [...account.scopes],
    pageId: account.pageId,
    instagramUserId: account.instagramUserId,
    connectedAt: account.connectedAt,
    lastRefreshedAt: account.lastRefreshedAt,
    lastError: account.lastError,
    hasAccessToken: Boolean(account.accessToken),
    hasRefreshToken: Boolean(account.refreshToken),
    tokenExpiresAt: account.tokenExpiresAt,
  };
}

export async function listStoredAccounts(): Promise<StoredSocialAccount[]> {
  const store = await readStore();
  return store.accounts;
}

export async function listPublicAccounts(): Promise<PublicSocialAccount[]> {
  const accounts = await listStoredAccounts();
  return accounts.map(toPublicAccount);
}

export async function getStoredAccount(
  id: string
): Promise<StoredSocialAccount | null> {
  const accounts = await listStoredAccounts();
  return accounts.find((row) => row.id === id) ?? null;
}

export async function findConnectedAccount(
  platform: SocialPlatform
): Promise<StoredSocialAccount | null> {
  const accounts = await listStoredAccounts();
  const connected = accounts.find(
    (row) =>
      row.platform === platform &&
      row.status === "connected" &&
      Boolean(row.accessToken || row.pageAccessToken)
  );
  if (connected) return connected;
  return accounts.find((row) => row.platform === platform) ?? null;
}

export function newAccountId(platform: SocialPlatform, externalId: string): string {
  const digest = createHash("sha256")
    .update(`${platform}:${externalId}`)
    .digest("hex")
    .slice(0, 16);
  return `${platform}_${digest}`;
}

export type UpsertAccountInput = Omit<
  StoredSocialAccount,
  "id" | "connectedAt" | "status"
> & {
  id?: string;
  connectedAt?: string;
  status?: AccountStatus;
};

export async function upsertStoredAccount(
  input: UpsertAccountInput
): Promise<StoredSocialAccount> {
  const store = await readStore();
  const id = input.id || newAccountId(input.platform, input.externalId);
  const existing = store.accounts.find(
    (row) =>
      row.id === id ||
      (row.platform === input.platform && row.externalId === input.externalId)
  );
  const next: StoredSocialAccount = {
    id: existing?.id || id,
    platform: input.platform,
    displayName: input.displayName,
    username: input.username,
    externalId: input.externalId,
    status: input.status ?? "connected",
    scopes: input.scopes,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken ?? existing?.refreshToken,
    tokenExpiresAt: input.tokenExpiresAt,
    pageAccessToken: input.pageAccessToken,
    pageId: input.pageId,
    instagramUserId: input.instagramUserId,
    connectedAt: existing?.connectedAt || input.connectedAt || new Date().toISOString(),
    lastRefreshedAt: input.lastRefreshedAt ?? new Date().toISOString(),
    lastError: input.lastError,
  };
  store.accounts = [
    ...store.accounts.filter((row) => row.id !== next.id),
    next,
  ];
  await writeStore(store);
  return next;
}

export async function patchStoredAccount(
  id: string,
  patch: Partial<StoredSocialAccount>
): Promise<StoredSocialAccount | null> {
  const store = await readStore();
  const index = store.accounts.findIndex((row) => row.id === id);
  if (index < 0) return null;
  const current = store.accounts[index];
  const next: StoredSocialAccount = { ...current, ...patch, id: current.id };
  store.accounts[index] = next;
  await writeStore(store);
  return next;
}

export async function removeStoredAccount(id: string): Promise<boolean> {
  const store = await readStore();
  const next = store.accounts.filter((row) => row.id !== id);
  if (next.length === store.accounts.length) return false;
  store.accounts = next;
  await writeStore(store);
  return true;
}

export function isTokenExpired(
  account: StoredSocialAccount,
  skewMs = 60_000
): boolean {
  if (!account.tokenExpiresAt) return false;
  const expires = Date.parse(account.tokenExpiresAt);
  if (!Number.isFinite(expires)) return false;
  return expires - skewMs <= Date.now();
}

export function bearerToken(account: StoredSocialAccount): string {
  if (account.platform === "facebook" || account.platform === "instagram") {
    return account.pageAccessToken || account.accessToken;
  }
  return account.accessToken;
}
