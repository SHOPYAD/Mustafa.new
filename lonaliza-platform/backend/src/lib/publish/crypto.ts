import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getServerEnv } from "@/lib/server/env-store";
import { publishDataDir } from "./paths";

const ALGO = "aes-256-gcm";
const KEY_FILE = () => path.join(publishDataDir(), "token-key");

let cachedKey: Buffer | null = null;

async function readOrCreateKeyFile(): Promise<Buffer> {
  const file = KEY_FILE();
  try {
    const raw = (await fs.readFile(file, "utf8")).trim();
    if (raw.length >= 32) return createHash("sha256").update(raw).digest();
  } catch {
    /* create below */
  }
  const generated = randomBytes(32).toString("hex");
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  await fs.writeFile(file, `${generated}\n`, { mode: 0o600 });
  return createHash("sha256").update(generated).digest();
}

export async function getPublishCryptoKey(): Promise<Buffer> {
  if (cachedKey) return cachedKey;
  const fromEnv =
    (process.env.PUBLISH_TOKEN_SECRET || "").trim() ||
    (await getServerEnv("PUBLISH_TOKEN_SECRET")) ||
    (await getServerEnv("ADMIN_SESSION_SECRET"));
  if (fromEnv.length >= 16) {
    cachedKey = createHash("sha256").update(fromEnv).digest();
    return cachedKey;
  }
  cachedKey = await readOrCreateKeyFile();
  return cachedKey;
}

/** AES-256-GCM. Empty input stays empty. Legacy plaintext (no v1: prefix) is returned as-is on decrypt. */
export async function encryptSecret(plain: string): Promise<string> {
  const value = String(plain || "");
  if (!value) return "";
  const key = await getPublishCryptoKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${enc.toString("base64url")}`;
}

export async function decryptSecret(payload: string): Promise<string> {
  const value = String(payload || "");
  if (!value) return "";
  if (!value.startsWith("v1:")) return value;
  const parts = value.split(":");
  if (parts.length !== 4) return "";
  const [, ivB64, tagB64, dataB64] = parts;
  const key = await getPublishCryptoKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const out = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return out.toString("utf8");
}

export function resetPublishCryptoCache(): void {
  cachedKey = null;
}
