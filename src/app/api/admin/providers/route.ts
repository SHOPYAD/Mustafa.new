import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  PROVIDER_IDS,
  isCatalogProviderId,
  type CatalogProviderId,
  type ProviderClientState,
} from "@/lib/providers/types";
import { getCatalogProvider, listCatalogProviders } from "@/lib/providers/catalog";
import {
  getProviderRuntime,
  providerHasRequiredFields,
  saveProviderRuntime,
} from "@/lib/server/providers-registry-store";
import { getLiveProviderState, isLiveProviderId, saveLiveProvider } from "@/lib/server/providers-live";
import { isMaskedPlaceholder, maskSecret } from "@/lib/server/env-store";

export const runtime = "nodejs";

function maskComingSoon(id: CatalogProviderId, fields: Record<string, string>): Record<string, string> {
  const def = getCatalogProvider(id);
  const out: Record<string, string> = {};
  for (const field of def.fields) {
    const value = fields[field.key] || "";
    out[field.key] = field.kind === "password" ? maskSecret(value) : value;
  }
  return out;
}

async function snapshot(id: CatalogProviderId): Promise<ProviderClientState> {
  if (isLiveProviderId(id)) {
    return getLiveProviderState(id);
  }
  const runtime = await getProviderRuntime(id);
  return {
    id,
    enabled: runtime.enabled,
    ready: providerHasRequiredFields(id, runtime.fields),
    connected: false,
    integration: "coming_soon",
    fields: maskComingSoon(id, runtime.fields),
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
    };
    const providerId = body.id;
    if (!providerId || !isCatalogProviderId(providerId)) {
      return NextResponse.json({ ok: false, error: "مزود غير معروف" }, { status: 400 });
    }

    const fields = body.fields ? { ...body.fields } : undefined;
    if (fields) {
      for (const [key, value] of Object.entries(fields)) {
        if (isMaskedPlaceholder(String(value ?? ""))) {
          delete fields[key];
        }
      }
    }

    const state = isLiveProviderId(providerId)
      ? await saveLiveProvider(providerId, { enabled: body.enabled, fields })
      : await (async () => {
          await saveProviderRuntime(providerId, { enabled: body.enabled, fields });
          return snapshot(providerId);
        })();

    return NextResponse.json({ ok: true, state });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "فشل الحفظ" },
      { status: 500 }
    );
  }
}
