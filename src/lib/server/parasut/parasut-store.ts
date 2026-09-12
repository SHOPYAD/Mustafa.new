import { promises as fs } from "fs";
import path from "path";
import { getServerEnv } from "@/lib/server/env-store";
import type { ParasutConfig, MaskedParasutConfig } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const CONFIG_FILE = path.join(DATA_DIR, "parasut-config.json");

const DEFAULT_CONFIG: ParasutConfig = {
  enabled: false,
  companyId: "",
  clientId: "",
  clientSecret: "",
  username: "",
  password: "",
  environment: "production",
  defaultProductId: "",
  vatExemptionReasonCode: "302",
  vatExemptionReason: "3065 sayili KDVK 11/1-a ve 12/2 maddeleri uyarinca Hizmet Ihracati",
  note: "Hizmet yurt disinda ifa edilmis ve yurt disinda yararlanilmistir. KDV kapsami disindadir.",
};

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function getParasutConfig(): Promise<ParasutConfig> {
  let fileConfig: Partial<ParasutConfig> = {};
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf8");
    fileConfig = JSON.parse(raw);
  } catch {
    fileConfig = {};
  }

  // Env variables take precedence or provide fallbacks
  const envEnabled = await getServerEnv("NEXT_PUBLIC_PARASUT_ENABLED");
  const envCompanyId = await getServerEnv("PARASUT_COMPANY_ID");
  const envClientId = await getServerEnv("PARASUT_CLIENT_ID");
  const envClientSecret = await getServerEnv("PARASUT_CLIENT_SECRET");
  const envUsername = await getServerEnv("PARASUT_USERNAME");
  const envPassword = await getServerEnv("PARASUT_PASSWORD");
  const envEnvironment = await getServerEnv("PARASUT_ENVIRONMENT");
  const envProductId = await getServerEnv("PARASUT_DEFAULT_PRODUCT_ID");

  const enabled =
    fileConfig.enabled !== undefined
      ? fileConfig.enabled
      : envEnabled === "true" || envEnabled === "1";

  return {
    enabled,
    companyId: fileConfig.companyId || envCompanyId || DEFAULT_CONFIG.companyId,
    clientId: fileConfig.clientId || envClientId || DEFAULT_CONFIG.clientId,
    clientSecret: fileConfig.clientSecret || envClientSecret || DEFAULT_CONFIG.clientSecret,
    username: fileConfig.username || envUsername || DEFAULT_CONFIG.username,
    password: fileConfig.password || envPassword || DEFAULT_CONFIG.password,
    environment:
      fileConfig.environment ||
      (envEnvironment === "sandbox" ? "sandbox" : "production"),
    defaultProductId: fileConfig.defaultProductId || envProductId || "",
    vatExemptionReasonCode: fileConfig.vatExemptionReasonCode || DEFAULT_CONFIG.vatExemptionReasonCode,
    vatExemptionReason: fileConfig.vatExemptionReason || DEFAULT_CONFIG.vatExemptionReason,
    note: fileConfig.note || DEFAULT_CONFIG.note,
  };
}

export async function saveParasutConfig(patch: Partial<ParasutConfig>): Promise<ParasutConfig> {
  await ensureDir();
  const current = await getParasutConfig();

  // If secret or password were sent as masked/empty, preserve existing values
  const clientSecret =
    patch.clientSecret && !patch.clientSecret.includes("••••")
      ? patch.clientSecret
      : current.clientSecret;

  const password =
    patch.password && !patch.password.includes("••••")
      ? patch.password
      : current.password;

  const updated: ParasutConfig = {
    ...current,
    ...patch,
    clientSecret,
    password,
  };

  await fs.writeFile(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf8");
  return updated;
}

export async function getMaskedParasutConfig(): Promise<MaskedParasutConfig> {
  const cfg = await getParasutConfig();
  const hasClientSecret = Boolean(cfg.clientSecret && cfg.clientSecret.trim().length > 0);
  const hasPassword = Boolean(cfg.password && cfg.password.trim().length > 0);

  const clientSecretMasked = hasClientSecret
    ? `${cfg.clientSecret.slice(0, 4)}••••••••${cfg.clientSecret.slice(-4)}`
    : undefined;

  return {
    enabled: cfg.enabled,
    companyId: cfg.companyId,
    clientId: cfg.clientId,
    username: cfg.username,
    environment: cfg.environment,
    defaultProductId: cfg.defaultProductId,
    vatExemptionReasonCode: cfg.vatExemptionReasonCode,
    vatExemptionReason: cfg.vatExemptionReason,
    note: cfg.note,
    hasClientSecret,
    hasPassword,
    clientSecretMasked,
  };
}
