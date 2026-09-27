import { spawn } from "child_process";
import path from "path";
import PocketBase from "pocketbase";
import { getServerEnv, saveServerEnv } from "@/lib/server/env-store";
import {
  DEFAULT_POCKETBASE_URL,
  POCKETBASE_APP_NAME,
  POCKETBASE_PUBLIC_URL,
} from "@/lib/pocketbase/constants";

const PB_DIR = path.join(process.cwd(), "pocketbase");
const PB_BIN = path.join(PB_DIR, "pocketbase");

export { DEFAULT_POCKETBASE_URL, POCKETBASE_PUBLIC_URL };

export async function getPocketBaseUrl(): Promise<string> {
  const url = (await getServerEnv("POCKETBASE_URL")).trim();
  return url || DEFAULT_POCKETBASE_URL;
}

export function getPocketBasePublicUrl(): string {
  return POCKETBASE_PUBLIC_URL;
}

export async function isPocketBaseConfigured(): Promise<boolean> {
  const email = (await getServerEnv("POCKETBASE_ADMIN_EMAIL")).trim();
  const password = (await getServerEnv("POCKETBASE_ADMIN_PASSWORD")).trim();
  return Boolean(email && password);
}

export async function createAdminPocketBase(): Promise<PocketBase> {
  const url = await getPocketBaseUrl();
  const email = (await getServerEnv("POCKETBASE_ADMIN_EMAIL")).trim();
  const password = (await getServerEnv("POCKETBASE_ADMIN_PASSWORD")).trim();
  const pb = new PocketBase(url);
  pb.autoCancellation(false);
  if (!email || !password) {
    throw new Error("PocketBase admin credentials are not configured");
  }
  await pb.collection("_superusers").authWithPassword(email, password);
  return pb;
}

export function serializeSuperuserRecord(
  pb: PocketBase
): Record<string, unknown> | null {
  const store = pb.authStore as { record?: unknown; model?: unknown };
  const raw = store.record || store.model;
  if (!raw || typeof raw !== "object") return null;
  try {
    return JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function upsertSuperuserCli(email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(PB_BIN, ["superuser", "upsert", email, password], {
      cwd: PB_DIR,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (err) => reject(err));
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || `superuser upsert failed (${code})`));
    });
  });
}

export async function updatePocketBaseSuperuser(opts: {
  email: string;
  password: string;
}): Promise<{ email: string }> {
  const email = opts.email.trim().toLowerCase();
  const password = opts.password;
  if (!isLikelyEmail(email)) {
    throw new Error("بريد إلكتروني غير صالح");
  }
  if (password.length < 8) {
    throw new Error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
  }

  await upsertSuperuserCli(email, password);
  await saveServerEnv({
    POCKETBASE_ADMIN_EMAIL: email,
    POCKETBASE_ADMIN_PASSWORD: password,
  });

  const url = await getPocketBaseUrl();
  const pb = new PocketBase(url);
  pb.autoCancellation(false);
  await pb.collection("_superusers").authWithPassword(email, password);
  return { email };
}

export async function tryCreateAdminPocketBase(): Promise<PocketBase | null> {
  try {
    if (!(await isPocketBaseConfigured())) return null;
    return await createAdminPocketBase();
  } catch {
    return null;
  }
}

export type PocketBaseHealth = {
  healthy: boolean;
  url: string;
  publicUrl: string;
  collectionsCount: number;
  collectionNames: string[];
  error?: string;
};

export async function getPocketBaseHealth(): Promise<PocketBaseHealth> {
  const url = await getPocketBaseUrl();
  const publicUrl = getPocketBasePublicUrl();
  try {
    const res = await fetch(`${url}/api/health`, { cache: "no-store" });
    if (!res.ok) {
      return {
        healthy: false,
        url,
        publicUrl,
        collectionsCount: 0,
        collectionNames: [],
        error: `health ${res.status}`,
      };
    }
  } catch (e) {
    return {
      healthy: false,
      url,
      publicUrl,
      collectionsCount: 0,
      collectionNames: [],
      error: e instanceof Error ? e.message : "unreachable",
    };
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return {
      healthy: true,
      url,
      publicUrl,
      collectionsCount: 0,
      collectionNames: [],
      error: "admin credentials missing or invalid",
    };
  }

  try {
    const list = await pb.collections.getFullList({ sort: "name" });
    const names = list.map((c) => c.name);
    return {
      healthy: true,
      url,
      publicUrl,
      collectionsCount: names.length,
      collectionNames: names,
    };
  } catch (e) {
    return {
      healthy: true,
      url,
      publicUrl,
      collectionsCount: 0,
      collectionNames: [],
      error: e instanceof Error ? e.message : "collections query failed",
    };
  }
}

type PocketBaseMeta = {
  appName?: string;
  appURL?: string;
  senderName?: string;
  senderAddress?: string;
  hideControls?: boolean;
};

type PocketBaseSettings = {
  meta?: PocketBaseMeta;
};

export async function ensurePocketBaseApplicationSettings(): Promise<{
  ok: boolean;
  appName: string;
  appURL: string;
  error?: string;
}> {
  try {
    const pb = await createAdminPocketBase();
    const current = (await pb.settings.getAll()) as PocketBaseSettings;
    const meta = current.meta || {};
    await pb.settings.update({
      meta: {
        ...meta,
        appName: POCKETBASE_APP_NAME,
        appURL: POCKETBASE_PUBLIC_URL,
      },
      trustedProxy: {
        headers: ["X-Real-IP", "X-Forwarded-For"],
        useLeftmostIP: false,
      },
    });
    return {
      ok: true,
      appName: POCKETBASE_APP_NAME,
      appURL: POCKETBASE_PUBLIC_URL,
    };
  } catch (e) {
    return {
      ok: false,
      appName: "",
      appURL: "",
      error: e instanceof Error ? e.message : "settings update failed",
    };
  }
}

export async function readPocketBaseApplicationSettings(): Promise<{
  appName: string;
  appURL: string;
}> {
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return { appName: "", appURL: "" };
    const current = (await pb.settings.getAll()) as PocketBaseSettings;
    return {
      appName: String(current.meta?.appName || ""),
      appURL: String(current.meta?.appURL || ""),
    };
  } catch {
    return { appName: "", appURL: "" };
  }
}

type OAuth2Provider = {
  name?: string;
  clientId?: string;
  clientSecret?: string;
  pkce?: boolean;
  displayName?: string;
  authURL?: string;
  tokenURL?: string;
  userInfoURL?: string;
};

type OAuth2Settings = {
  enabled?: boolean;
  providers?: OAuth2Provider[];
  mappedFields?: Record<string, string>;
};

export async function upsertUsersGoogleProvider(opts: {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const pb = await createAdminPocketBase();
    const users = await pb.collections.getOne("users");
    const current = (users.oauth2 || {}) as OAuth2Settings;
    const previousGoogle = (current.providers || []).find((p) => p.name === "google");
    const others = (current.providers || []).filter((p) => p.name !== "google");
    const providers: OAuth2Provider[] = [...others];

    const clientId = opts.clientId || previousGoogle?.clientId || "";
    const clientSecret = opts.clientSecret || previousGoogle?.clientSecret || "";

    // Always keep the Google provider row so Collections → users → Options shows it.
    // Omit an empty secret so PocketBase keeps the stored value (GET redacts it).
    const googleProvider: OAuth2Provider = {
      name: "google",
      displayName: "Google",
      clientId,
      pkce: true,
      authURL: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenURL: "https://oauth2.googleapis.com/token",
      userInfoURL: "https://openidconnect.googleapis.com/v1/userinfo",
    };
    if (clientSecret) googleProvider.clientSecret = clientSecret;
    providers.push(googleProvider);

    const enabled = Boolean(opts.enabled && clientId && (clientSecret || previousGoogle));
    const mappedFields = { ...(current.mappedFields || { name: "name" }) };
    mappedFields.name = mappedFields.name || "name";
    // Avatar file download from Google often fails the entire OAuth login.
    mappedFields.avatarURL = "";
    await pb.collections.update("users", {
      oauth2: {
        enabled,
        mappedFields,
        providers,
      },
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to update Google provider",
    };
  }
}

export async function readUsersGoogleProvider(): Promise<{
  enabled: boolean;
  hasClientId: boolean;
  providerPresent: boolean;
}> {
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return { enabled: false, hasClientId: false, providerPresent: false };
    const users = await pb.collections.getOne("users");
    const current = (users.oauth2 || {}) as OAuth2Settings;
    const google = (current.providers || []).find((p) => p.name === "google");
    return {
      enabled: Boolean(current.enabled && google?.clientId),
      hasClientId: Boolean(google?.clientId),
      providerPresent: Boolean(google),
    };
  } catch {
    return { enabled: false, hasClientId: false, providerPresent: false };
  }
}
