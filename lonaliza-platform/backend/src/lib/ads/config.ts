import { promises as fs } from "fs";
import { getServerEnv } from "@/lib/server/env-store";
import {
  adsYamlCandidates,
  EMPTY_CREDENTIALS,
  loadAdsCredentials,
} from "./store";
import type { AdsCredentials } from "./types";

export const ADS_ENV_KEYS = [
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
  "GOOGLE_ADS_CUSTOMER_ID",
  "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
  "GOOGLE_ADS_YAML_PATH",
  "META_ADS_ACCESS_TOKEN",
  "META_ADS_AD_ACCOUNT_ID",
  "META_ADS_PAGE_ID",
  "META_ADS_APP_ID",
  "META_ADS_APP_SECRET",
  "META_ADS_PIXEL_ID",
  "ADS_TELEGRAM_CHAT_ID",
] as const;

function parseSimpleYaml(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx < 1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function readGoogleAdsYaml(): Promise<Partial<AdsCredentials>> {
  for (const file of adsYamlCandidates()) {
    try {
      const parsed = parseSimpleYaml(await fs.readFile(file, "utf8"));
      return {
        googleDeveloperToken: parsed.developer_token || parsed.developerToken || "",
        googleClientId: parsed.client_id || parsed.clientId || "",
        googleClientSecret: parsed.client_secret || parsed.clientSecret || "",
        googleRefreshToken: parsed.refresh_token || parsed.refreshToken || "",
        googleCustomerId: (parsed.customer_id || parsed.customerId || "").replace(/-/g, ""),
        googleLoginCustomerId: (
          parsed.login_customer_id ||
          parsed.loginCustomerId ||
          ""
        ).replace(/-/g, ""),
      };
    } catch {
      /* try next path */
    }
  }
  return {};
}

function pick(...values: Array<string | undefined>): string {
  for (const value of values) {
    const v = String(value || "").trim();
    if (v) return v;
  }
  return "";
}

export async function resolveAdsCredentials(): Promise<AdsCredentials> {
  const [store, yaml] = await Promise.all([loadAdsCredentials(), readGoogleAdsYaml()]);
  const env = {
    googleDeveloperToken: await getServerEnv("GOOGLE_ADS_DEVELOPER_TOKEN"),
    googleClientId: await getServerEnv("GOOGLE_ADS_CLIENT_ID"),
    googleClientSecret: await getServerEnv("GOOGLE_ADS_CLIENT_SECRET"),
    googleRefreshToken: await getServerEnv("GOOGLE_ADS_REFRESH_TOKEN"),
    googleCustomerId: (await getServerEnv("GOOGLE_ADS_CUSTOMER_ID")).replace(/-/g, ""),
    googleLoginCustomerId: (await getServerEnv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")).replace(
      /-/g,
      ""
    ),
    metaAccessToken: await getServerEnv("META_ADS_ACCESS_TOKEN"),
    metaAdAccountId: (await getServerEnv("META_ADS_AD_ACCOUNT_ID")).replace(/^act_/i, ""),
    metaPageId: await getServerEnv("META_ADS_PAGE_ID"),
    metaAppId: await getServerEnv("META_ADS_APP_ID"),
    metaAppSecret: await getServerEnv("META_ADS_APP_SECRET"),
    metaPixelId: await getServerEnv("META_ADS_PIXEL_ID"),
  };

  return {
    googleDeveloperToken: pick(
      store.googleDeveloperToken,
      env.googleDeveloperToken,
      yaml.googleDeveloperToken
    ),
    googleClientId: pick(store.googleClientId, env.googleClientId, yaml.googleClientId),
    googleClientSecret: pick(
      store.googleClientSecret,
      env.googleClientSecret,
      yaml.googleClientSecret
    ),
    googleRefreshToken: pick(
      store.googleRefreshToken,
      env.googleRefreshToken,
      yaml.googleRefreshToken
    ),
    googleCustomerId: pick(
      store.googleCustomerId,
      env.googleCustomerId,
      yaml.googleCustomerId
    ).replace(/-/g, ""),
    googleLoginCustomerId: pick(
      store.googleLoginCustomerId,
      env.googleLoginCustomerId,
      yaml.googleLoginCustomerId
    ).replace(/-/g, ""),
    metaAccessToken: pick(store.metaAccessToken, env.metaAccessToken),
    metaAdAccountId: pick(store.metaAdAccountId, env.metaAdAccountId).replace(/^act_/i, ""),
    metaPageId: pick(store.metaPageId, env.metaPageId),
    metaAppId: pick(store.metaAppId, env.metaAppId),
    metaAppSecret: pick(store.metaAppSecret, env.metaAppSecret),
    metaPixelId: pick(store.metaPixelId, env.metaPixelId),
  };
}

export function googleAdsReady(creds: AdsCredentials): boolean {
  return Boolean(
    creds.googleDeveloperToken &&
      creds.googleClientId &&
      creds.googleClientSecret &&
      creds.googleRefreshToken &&
      creds.googleCustomerId
  );
}

export function metaAdsReady(creds: AdsCredentials): boolean {
  return Boolean(creds.metaAccessToken && creds.metaAdAccountId);
}

export function googleOAuthReady(creds: AdsCredentials): boolean {
  return Boolean(creds.googleClientId && creds.googleClientSecret);
}

export function metaOAuthReady(creds: AdsCredentials): boolean {
  return Boolean(creds.metaAppId && creds.metaAppSecret);
}

export function connectionStatus(creds: AdsCredentials) {
  return {
    googleLive: googleAdsReady(creds),
    metaLive: metaAdsReady(creds),
    googleOAuth: googleOAuthReady(creds),
    metaOAuth: metaOAuthReady(creds),
    missingGoogle: (Object.keys(EMPTY_CREDENTIALS) as (keyof AdsCredentials)[])
      .filter((k) => k.startsWith("google"))
      .filter((k) => {
        if (k === "googleLoginCustomerId") return false;
        return !creds[k];
      }),
    missingMeta: (["metaAccessToken", "metaAdAccountId"] as const).filter((k) => !creds[k]),
  };
}
