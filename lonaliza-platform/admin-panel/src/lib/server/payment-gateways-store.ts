/**
 * Multi-Tenant Payment Gateways Store
 *
 * Persists all gateway configurations (platform default and per-tenant)
 * in `database/data/payment-gateways.json` with AES-256-GCM encrypted secrets.
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * This store NEVER writes to `.env.local`!
 * Saving gateway configs is instantaneous, safe, and causes zero Next.js restarts.
 */

import { promises as fs } from "fs";
import path from "path";
import { GatewayRegistry } from "@/lib/gateways/core/GatewayRegistry";
import {
  encryptSecrets,
  decryptSecrets,
  redactSecrets,
} from "@/lib/gateways/core/crypto";
import { getCatalog, type CatalogEntry } from "@/lib/gateways/catalog";
import "@/lib/gateways"; // Register all 48+ gateways at load time
import { getServerEnvMap } from "@/lib/server/env-store";
import { getResellerCompanies } from "@/lib/server/resale-store";

export interface StoredGatewayConfig {
  enabled: boolean;
  testMode: boolean;
  credentials: Record<string, string>; // Stored encrypted
  updatedAt: string;
}

export interface TenantPaymentConfig {
  tenantId: string; // 'platform' or company ID
  activeGateway: string; // The primary gateway used for this tenant (default: 'iyzico')
  gateways: Record<string, StoredGatewayConfig>;
  updatedAt: string;
}

export interface PaymentGatewaysStoreFile {
  tenants: Record<string, TenantPaymentConfig>;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "payment-gateways.json");

let memoryCache: PaymentGatewaysStoreFile | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * Read the store file from disk with in-memory caching.
 * Migrates existing iyzico credentials from server-env.json into 'platform' if not yet migrated.
 */
export async function readGatewaysStore(): Promise<PaymentGatewaysStoreFile> {
  if (memoryCache) return memoryCache;

  await ensureDir();
  let fileContent = "";
  try {
    fileContent = await fs.readFile(STORE_FILE, "utf8");
  } catch {
    fileContent = "";
  }

  let store: PaymentGatewaysStoreFile;
  if (fileContent.trim()) {
    try {
      store = JSON.parse(fileContent) as PaymentGatewaysStoreFile;
      if (!store.tenants || typeof store.tenants !== "object") {
        store.tenants = {};
      }
    } catch {
      store = { tenants: {}, updatedAt: new Date().toISOString() };
    }
  } else {
    store = { tenants: {}, updatedAt: new Date().toISOString() };
  }

  // Ensure 'platform' tenant exists with iyzico as default
  if (!store.tenants.platform) {
    const envMap = await getServerEnvMap([
      "PAYMENTS_IYZICO_ENABLED",
      "IYZICO_MODE",
      "IYZICO_API_KEY",
      "IYZICO_SECRET_KEY",
      "IYZICO_BASE_URL",
    ]);

    const secretKeys = ["secretKey"];
    const rawCredentials: Record<string, string> = {
      apiKey: envMap.IYZICO_API_KEY || "",
      secretKey: envMap.IYZICO_SECRET_KEY || "",
      baseUrl: envMap.IYZICO_BASE_URL || "",
      mode: envMap.IYZICO_MODE === "production" ? "production" : "sandbox",
    };

    const encryptedCredentials = encryptSecrets(
      rawCredentials,
      secretKeys
    ) as Record<string, string>;

    store.tenants.platform = {
      tenantId: "platform",
      activeGateway: "iyzico",
      gateways: {
        iyzico: {
          enabled: envMap.PAYMENTS_IYZICO_ENABLED !== "false",
          testMode: envMap.IYZICO_MODE !== "production",
          credentials: encryptedCredentials,
          updatedAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    // Save migration
    await writeGatewaysStore(store);
  }

  memoryCache = store;
  return store;
}

/**
 * Write updated store file to disk atomically.
 */
export async function writeGatewaysStore(store: PaymentGatewaysStoreFile): Promise<void> {
  store.updatedAt = new Date().toISOString();
  memoryCache = store;

  writeQueue = writeQueue.then(async () => {
    await ensureDir();
    const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(store, null, 2), "utf8");
    await fs.rename(tempFile, STORE_FILE);
  });

  await writeQueue;
}

/**
 * Get secret keys for a given gateway kind from its metadata.
 */
export function getGatewaySecretKeys(kind: string): string[] {
  const meta = GatewayRegistry.list().find((m) => m.kind === kind);
  if (!meta) return ["secretKey", "apiKey", "merchantKey", "merchantSalt", "webhookSecret"];
  return meta.configFields.filter((f) => f.secret).map((f) => f.key);
}

/**
 * Get tenant payment configuration.
 * Returns redacted credentials safe for sending to the UI.
 */
export async function getTenantPaymentConfig(
  tenantId: string = "platform"
): Promise<{
  tenantId: string;
  activeGateway: string;
  gateways: Record<
    string,
    {
      enabled: boolean;
      testMode: boolean;
      credentials: Record<string, string>; // Redacted (••••••••)
      hasCredentials: boolean;
      updatedAt: string;
    }
  >;
}> {
  const store = await readGatewaysStore();
  const tenant = store.tenants[tenantId] || {
    tenantId,
    activeGateway: "iyzico",
    gateways: {},
    updatedAt: new Date().toISOString(),
  };

  const redactedGateways: Record<
    string,
    {
      enabled: boolean;
      testMode: boolean;
      credentials: Record<string, string>;
      hasCredentials: boolean;
      updatedAt: string;
    }
  > = {};

  for (const [kind, config] of Object.entries(tenant.gateways || {})) {
    const secretKeys = getGatewaySecretKeys(kind);
    const decrypted = decryptSecrets(config.credentials || {}, secretKeys) as Record<
      string,
      string
    >;
    const hasCredentials = Boolean(
      Object.values(decrypted).some((v) => typeof v === "string" && v.trim().length > 0)
    );
    const redacted = redactSecrets(decrypted, secretKeys) as Record<string, string>;

    redactedGateways[kind] = {
      enabled: config.enabled,
      testMode: config.testMode,
      credentials: redacted,
      hasCredentials,
      updatedAt: config.updatedAt,
    };
  }

  return {
    tenantId: tenant.tenantId,
    activeGateway: tenant.activeGateway || "iyzico",
    gateways: redactedGateways,
  };
}

/**
 * Save gateway configuration for a tenant with instant AES-256-GCM encryption.
 */
export async function saveTenantGatewayConfig(
  tenantId: string,
  gatewayKind: string,
  patch: {
    enabled?: boolean;
    testMode?: boolean;
    credentials?: Record<string, string>;
    isPrimary?: boolean;
  }
): Promise<void> {
  const store = await readGatewaysStore();
  if (!store.tenants[tenantId]) {
    store.tenants[tenantId] = {
      tenantId,
      activeGateway: "iyzico",
      gateways: {},
      updatedAt: new Date().toISOString(),
    };
  }

  const tenant = store.tenants[tenantId];
  if (!tenant.gateways[gatewayKind]) {
    tenant.gateways[gatewayKind] = {
      enabled: false,
      testMode: true,
      credentials: {},
      updatedAt: new Date().toISOString(),
    };
  }

  const target = tenant.gateways[gatewayKind];
  if (patch.enabled !== undefined) target.enabled = patch.enabled;
  if (patch.testMode !== undefined) target.testMode = patch.testMode;

  if (patch.credentials) {
    const secretKeys = getGatewaySecretKeys(gatewayKind);
    // Keep existing secret if incoming value is redacted placeholder '••••'
    const existingDecrypted = decryptSecrets(
      target.credentials || {},
      secretKeys
    ) as Record<string, string>;

    const mergedClean: Record<string, string> = { ...existingDecrypted };
    for (const [k, v] of Object.entries(patch.credentials)) {
      if (typeof v === "string") {
        const trimmed = v.trim();
        // If placeholder or empty, keep existing or clear
        if (trimmed === "••••" || trimmed === "••••••••") {
          // unchanged
        } else if (trimmed === "") {
          delete mergedClean[k];
        } else {
          mergedClean[k] = trimmed;
        }
      }
    }

    target.credentials = encryptSecrets(mergedClean, secretKeys) as Record<string, string>;
  }

  target.updatedAt = new Date().toISOString();

  if (patch.isPrimary) {
    tenant.activeGateway = gatewayKind;
  }

  await writeGatewaysStore(store);
}

/**
 * Set the primary active gateway for a tenant.
 */
export async function setTenantActiveGateway(
  tenantId: string,
  gatewayKind: string
): Promise<void> {
  const store = await readGatewaysStore();
  if (!store.tenants[tenantId]) {
    store.tenants[tenantId] = {
      tenantId,
      activeGateway: gatewayKind,
      gateways: {},
      updatedAt: new Date().toISOString(),
    };
  } else {
    store.tenants[tenantId].activeGateway = gatewayKind;
  }
  await writeGatewaysStore(store);
}

/**
 * Toggle enable/disable status for a gateway.
 */
export async function toggleTenantGateway(
  tenantId: string,
  gatewayKind: string,
  enabled: boolean
): Promise<void> {
  await saveTenantGatewayConfig(tenantId, gatewayKind, { enabled });
}

/**
 * Resolve the runtime gateway instance for a tenant.
 * Fallback hierarchy:
 *   1. Tenant's active gateway (if enabled and configured)
 *   2. Platform default gateway (iyzico)
 */
export async function resolveGatewayForTenant(
  tenantId?: string,
  requestedKind?: string
): Promise<{
  kind: string;
  instance: ReturnType<typeof GatewayRegistry.resolve>;
  testMode: boolean;
  tenantId: string;
}> {
  const store = await readGatewaysStore();
  const resolvedTenantId = tenantId && store.tenants[tenantId] ? tenantId : "platform";
  const tenant = store.tenants[resolvedTenantId] || store.tenants.platform;

  let targetKind = requestedKind || tenant.activeGateway || "iyzico";
  let gatewayConfig = tenant.gateways[targetKind];

  // If tenant's requested gateway is disabled or not configured, fallback to iyzico
  if (!gatewayConfig || !gatewayConfig.enabled) {
    targetKind = "iyzico";
    gatewayConfig = store.tenants.platform?.gateways?.iyzico;
  }

  if (!gatewayConfig) {
    throw new Error(`Payment gateway ${targetKind} is not configured on platform.`);
  }

  const secretKeys = getGatewaySecretKeys(targetKind);
  const decryptedConfig = decryptSecrets(
    gatewayConfig.credentials || {},
    secretKeys
  ) as Record<string, unknown>;

  const instance = GatewayRegistry.resolve(targetKind, decryptedConfig, {
    testMode: gatewayConfig.testMode,
  });

  return {
    kind: targetKind,
    instance,
    testMode: gatewayConfig.testMode,
    tenantId: resolvedTenantId,
  };
}

/**
 * Get catalog merged with tenant's configuration status.
 */
export async function getCatalogForTenant(
  tenantId: string = "platform"
): Promise<Array<CatalogEntry & {
  tenantEnabled: boolean;
  tenantActive: boolean;
  tenantTestMode: boolean;
  hasCredentials: boolean;
  isSystemDefault: boolean;
}>> {
  const catalog = getCatalog();
  const tenantConfig = await getTenantPaymentConfig(tenantId);

  return catalog.map((entry) => {
    const config = tenantConfig.gateways[entry.kind];
    const isSystemDefault = entry.kind === "iyzico";
    const tenantActive = tenantConfig.activeGateway === entry.kind;

    return {
      ...entry,
      tenantEnabled: Boolean(config?.enabled),
      tenantActive,
      tenantTestMode: config?.testMode ?? true,
      hasCredentials: Boolean(config?.hasCredentials),
      isSystemDefault,
    };
  });
}

/**
 * Get all available tenants (Platform + Reseller Companies) for the scope selector.
 */
export async function getAvailableTenants(): Promise<
  Array<{ id: string; name: string; isPlatform: boolean; subdomain?: string }>
> {
  const list = [
    { id: "platform", name: "منصة لوناليزا المركزية (Platform Central)", isPlatform: true },
  ];

  try {
    const companies = await getResellerCompanies();
    for (const c of companies) {
      list.push({
        id: c.id,
        name: `${c.companyNameAr || c.companyName} (${c.subdomain || c.id})`,
        isPlatform: false,
        subdomain: c.subdomain,
      });
    }
  } catch {
    /* fallback to platform only */
  }

  return list;
}
