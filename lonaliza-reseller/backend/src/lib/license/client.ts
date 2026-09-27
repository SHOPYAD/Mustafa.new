import { promises as fs } from "fs";
import path from "path";
import { signLicensePayload, verifyLicenseSignature } from "./crypto";
import { getServerEnv } from "@/lib/server/env-store";
import { isOrigin } from "@/lib/server/deployment-role";

export type LicenseState = {
  valid: boolean;
  licenseKey?: string;
  boundDomain?: string;
  lastChecked?: string;
  hasActiveUpdates?: boolean;
  planType?: "enterprise" | "whitelabel_free" | "whitelabel_paid";
  errorCode?: string;
  errorMessage?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const LICENSE_CACHE_FILE = path.join(DATA_DIR, "license-cache.json");

let memoryCache: LicenseState | null = null;
let lastHeartbeatTime = 0;

/**
 * Validate and ping the license origin server.
 * Returns the current license verification state.
 */
export async function verifyLicense(): Promise<LicenseState> {
  // If running on origin (master platform), license is always valid!
  if (isOrigin()) {
    return { valid: true, boundDomain: "lonaliza.com", planType: "enterprise" };
  }

  const licenseKey = (await getServerEnv("LICENSE_KEY")).trim();
  const originUrl = (await getServerEnv("LICENSE_ORIGIN")).trim() || "https://lonaliza.com";
  const siteUrl = (await getServerEnv("NEXT_PUBLIC_SITE_URL")).trim();
  const domain = siteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");

  if (!licenseKey) {
    return {
      valid: false,
      errorCode: "missing_key",
      errorMessage: "مفتاح الترخيص غير معرّف في بيئة النظام.",
    };
  }

  // Check cache to avoid spamming the origin on every request (15 min memory cache)
  const now = Date.now();
  if (memoryCache && now - lastHeartbeatTime < 15 * 60 * 1000) {
    return memoryCache;
  }

  try {
    const payload = {
      licenseKey,
      domain,
      version: "v2.0.0",
      timestamp: now,
    };
    const signature = signLicensePayload(payload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${originUrl}/api/license/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, signature }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = (await res.json()) as {
      ok?: boolean;
      valid?: boolean;
      boundDomain?: string;
      hasActiveUpdates?: boolean;
      planType?: "enterprise" | "whitelabel_free" | "whitelabel_paid";
      error?: string;
      code?: string;
      signature?: string;
    };

    if (res.ok && data?.valid) {
      const state: LicenseState = {
        valid: true,
        licenseKey,
        boundDomain: data.boundDomain || domain,
        lastChecked: new Date().toISOString(),
        hasActiveUpdates: Boolean(data.hasActiveUpdates),
        planType: data.planType || "enterprise",
      };
      memoryCache = state;
      lastHeartbeatTime = now;

      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(LICENSE_CACHE_FILE, JSON.stringify(state, null, 2), "utf8");
      } catch {
        /* non-blocking */
      }

      return state;
    }

    // Invalid response from origin
    const failState: LicenseState = {
      valid: false,
      licenseKey,
      boundDomain: data?.boundDomain,
      errorCode: data?.code || "invalid_license",
      errorMessage: data?.error || "الترخيص غير صالح لهذا النطاق.",
    };
    memoryCache = failState;
    return failState;
  } catch (err: unknown) {
    // If network error, check persisted cache if verified within last 48 hours (grace period)
    try {
      const raw = await fs.readFile(LICENSE_CACHE_FILE, "utf8");
      const cached = JSON.parse(raw) as LicenseState;
      if (cached?.valid && cached.lastChecked) {
        const checkedDate = new Date(cached.lastChecked).getTime();
        if (now - checkedDate < 48 * 60 * 60 * 1000) {
          return cached;
        }
      }
    } catch {
      /* no cache */
    }

    return {
      valid: false,
      errorCode: "connection_failed",
      errorMessage: "تعذر التحقق من خادم الترخيص الرئيسي.",
    };
  }
}
