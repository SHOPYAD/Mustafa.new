import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getServerEnvMap,
  saveServerEnv,
  maskSecret,
  isMaskedPlaceholder,
} from "@/lib/server/env-store";
import {
  ensurePocketBaseApplicationSettings,
  getPocketBaseHealth,
  readPocketBaseApplicationSettings,
  readUsersGoogleProvider,
  upsertUsersGoogleProvider,
} from "@/lib/pocketbase/admin";
import {
  GOOGLE_REDIRECT_URIS,
  POCKETBASE_ADMIN_UI_URL,
  POCKETBASE_APP_NAME,
  POCKETBASE_EXPECTED_VERSION,
  POCKETBASE_PUBLIC_URL,
  DEFAULT_POCKETBASE_URL,
} from "@/lib/pocketbase/constants";

export const runtime = "nodejs";

const PB_KEYS = [
  "POCKETBASE_URL",
  "POCKETBASE_ADMIN_EMAIL",
  "POCKETBASE_ADMIN_PASSWORD",
  "POCKETBASE_GOOGLE_CLIENT_ID",
  "POCKETBASE_GOOGLE_CLIENT_SECRET",
  "POCKETBASE_GOOGLE_ENABLED",
] as const;

function flagEnabled(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

async function statusPayload() {
  const map = await getServerEnvMap(PB_KEYS);
  const health = await getPocketBaseHealth();
  const appMeta = await readPocketBaseApplicationSettings();
  const googleOnUsers = await readUsersGoogleProvider();
  const googleEnabled = flagEnabled(map.POCKETBASE_GOOGLE_ENABLED);
  const googleReady =
    googleEnabled &&
    Boolean(map.POCKETBASE_GOOGLE_CLIENT_ID) &&
    Boolean(map.POCKETBASE_GOOGLE_CLIENT_SECRET);

  return {
    ok: true,
    healthy: health.healthy,
    url: health.url,
    publicUrl: POCKETBASE_ADMIN_UI_URL,
    defaultInternalUrl: DEFAULT_POCKETBASE_URL,
    collectionsCount: health.collectionsCount,
    collectionNames: health.collectionNames,
    healthError: health.error || "",
    appName: appMeta.appName || POCKETBASE_APP_NAME,
    appURL: appMeta.appURL || POCKETBASE_PUBLIC_URL,
    expectedAppName: POCKETBASE_APP_NAME,
    expectedAppURL: POCKETBASE_PUBLIC_URL,
    pbVersion: POCKETBASE_EXPECTED_VERSION,
    currentAdminEmail: map.POCKETBASE_ADMIN_EMAIL || "",
    adminEmailMasked: map.POCKETBASE_ADMIN_EMAIL
      ? maskSecret(map.POCKETBASE_ADMIN_EMAIL, 3)
      : "",
    adminEmailConfigured: Boolean(map.POCKETBASE_ADMIN_EMAIL),
    adminPasswordConfigured: Boolean(map.POCKETBASE_ADMIN_PASSWORD),
    googleEnabled,
    googleReady,
    googleProviderPresent: googleOnUsers.providerPresent,
    googleClientIdMasked: map.POCKETBASE_GOOGLE_CLIENT_ID
      ? maskSecret(map.POCKETBASE_GOOGLE_CLIENT_ID, 6)
      : "",
    googleClientIdConfigured: Boolean(map.POCKETBASE_GOOGLE_CLIENT_ID),
    googleSecretConfigured: Boolean(map.POCKETBASE_GOOGLE_CLIENT_SECRET),
    googleRedirectUris: [...GOOGLE_REDIRECT_URIS],
    drafts: {
      POCKETBASE_URL: map.POCKETBASE_URL || DEFAULT_POCKETBASE_URL,
      POCKETBASE_ADMIN_EMAIL: map.POCKETBASE_ADMIN_EMAIL || "",
      POCKETBASE_GOOGLE_ENABLED: googleEnabled ? "true" : "false",
    },
  };
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  return NextResponse.json(await statusPayload(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { values?: Record<string, string> };
    const incoming = body.values || {};
    const current = await getServerEnvMap(PB_KEYS);
    const patch: Record<string, string> = {};

    for (const key of PB_KEYS) {
      if (!(key in incoming)) continue;
      const raw = String(incoming[key] ?? "");
      if (isMaskedPlaceholder(raw)) continue;
      patch[key] = raw.trim();
    }

    if (patch.POCKETBASE_GOOGLE_ENABLED !== undefined) {
      patch.POCKETBASE_GOOGLE_ENABLED = flagEnabled(
        patch.POCKETBASE_GOOGLE_ENABLED
      )
        ? "true"
        : "false";
    }

    await saveServerEnv(patch);
    const map = await getServerEnvMap(PB_KEYS);

    const clientId =
      (!isMaskedPlaceholder(String(incoming.POCKETBASE_GOOGLE_CLIENT_ID || "")) &&
        String(incoming.POCKETBASE_GOOGLE_CLIENT_ID || "").trim()) ||
      map.POCKETBASE_GOOGLE_CLIENT_ID ||
      current.POCKETBASE_GOOGLE_CLIENT_ID ||
      "";
    const clientSecret =
      (!isMaskedPlaceholder(
        String(incoming.POCKETBASE_GOOGLE_CLIENT_SECRET || "")
      ) &&
        String(incoming.POCKETBASE_GOOGLE_CLIENT_SECRET || "").trim()) ||
      map.POCKETBASE_GOOGLE_CLIENT_SECRET ||
      current.POCKETBASE_GOOGLE_CLIENT_SECRET ||
      "";
    const enabled =
      flagEnabled(map.POCKETBASE_GOOGLE_ENABLED) ||
      Boolean(clientId && clientSecret);

    const appSettings = await ensurePocketBaseApplicationSettings();
    let googleSyncError = "";
    const synced = await upsertUsersGoogleProvider({
      enabled,
      clientId,
      clientSecret,
    });
    if (!synced.ok) googleSyncError = synced.error || "PocketBase sync failed";
    if (!appSettings.ok && appSettings.error) {
      googleSyncError = googleSyncError
        ? `${googleSyncError}; ${appSettings.error}`
        : appSettings.error;
    }

    return NextResponse.json({
      ...(await statusPayload()),
      message: "تم الحفظ على السيرفر",
      googleSyncError,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
