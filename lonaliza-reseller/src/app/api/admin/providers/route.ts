import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  COMING_SOON_LOCKED_AR,
  PROVIDER_IDS,
  isCatalogProviderId,
  isProviderMode,
  type CatalogProviderId,
  type ProviderClientState,
  type ProviderMode,
} from "@/lib/providers/types";
import { getCatalogProvider, listCatalogProviders } from "@/lib/providers/catalog";
import {
  getProviderRuntime,
  saveProviderLogo,
  saveProviderMode,
} from "@/lib/server/providers-registry-store";
import { getLiveProviderState, isLiveProviderId, saveLiveProvider } from "@/lib/server/providers-live";
import { isMaskedPlaceholder } from "@/lib/server/env-store";

export const runtime = "nodejs";

async function snapshot(id: CatalogProviderId): Promise<ProviderClientState> {
  const runtime = await getProviderRuntime(id);
  if (isLiveProviderId(id)) {
    const state = await getLiveProviderState(id);
    return {
      ...state,
      mode: runtime.mode,
      customLogo: runtime.customLogo ?? null,
    };
  }
  return {
    id,
    enabled: false,
    ready: false,
    connected: false,
    mode: runtime.mode,
    customLogo: runtime.customLogo ?? null,
    integration: "coming_soon",
    fields: {},
  };
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const states: Record<CatalogProviderId, ProviderClientState> = {} as Record<
    CatalogProviderId,
    ProviderClientState
  >;
  for (const id of PROVIDER_IDS) {
    states[id] = await snapshot(id);
  }

  return NextResponse.json({
    ok: true,
    catalog: listCatalogProviders().map((item) => ({
      id: item.id,
      vertical: item.vertical,
      category: item.category,
      integration: item.integration,
      name: item.name,
      nameAr: item.nameAr,
      logo: item.logo,
      noteAr: item.noteAr,
      docsUrl: item.docsUrl,
      fields: item.fields,
    })),
    states,
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      id?: string;
      enabled?: boolean;
      fields?: Record<string, string>;
      mode?: ProviderMode;
      customLogo?: string | null;
      resetLogo?: boolean;
    };
    const providerId = body.id;
    if (!providerId || !isCatalogProviderId(providerId)) {
      return NextResponse.json({ ok: false, error: "مزود غير معروف" }, { status: 400 });
    }

    const def = getCatalogProvider(providerId);
    const wantsLogo =
      body.resetLogo === true || body.customLogo !== undefined;
    const wantsSettings =
      body.enabled !== undefined ||
      body.fields !== undefined ||
      body.mode !== undefined;
    const logoOnly = wantsLogo && !wantsSettings;

    if (def.integration === "coming_soon" && !logoOnly) {
      return NextResponse.json({ ok: false, error: COMING_SOON_LOCKED_AR }, { status: 403 });
    }

    if (logoOnly) {
      const logoValue = body.resetLogo ? null : (body.customLogo ?? null);
      await saveProviderLogo(providerId, logoValue);
      return NextResponse.json({ ok: true, state: await snapshot(providerId) });
    }

    const fields = body.fields ? { ...body.fields } : undefined;
    if (fields) {
      for (const [key, value] of Object.entries(fields)) {
        if (isMaskedPlaceholder(String(value ?? ""))) {
          delete fields[key];
        }
      }
    }

    if (body.mode !== undefined) {
      if (!isProviderMode(body.mode)) {
        return NextResponse.json({ ok: false, error: "وضع غير صالح" }, { status: 400 });
      }
      await saveProviderMode(providerId, body.mode);
    }

    if (wantsLogo) {
      await saveProviderLogo(providerId, body.resetLogo ? null : (body.customLogo ?? null));
    }

    let state: ProviderClientState;
    if (isLiveProviderId(providerId)) {
      if (body.enabled !== undefined || fields) {
        state = await saveLiveProvider(providerId, { enabled: body.enabled, fields });
      } else {
        state = await getLiveProviderState(providerId);
      }
      const runtime = await getProviderRuntime(providerId);
      state = {
        ...state,
        mode: runtime.mode,
        customLogo: runtime.customLogo ?? null,
      };
    } else {
      state = await snapshot(providerId);
    }

    return NextResponse.json({ ok: true, state });
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error && typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "فشل الحفظ" },
      { status }
    );
  }
}
