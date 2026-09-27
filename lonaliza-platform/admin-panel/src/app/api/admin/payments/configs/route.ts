import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getTenantPaymentConfig,
  saveTenantGatewayConfig,
  setTenantActiveGateway,
} from "@/lib/server/payment-gateways-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "platform";
    const kind = searchParams.get("kind");

    const tenantConfig = await getTenantPaymentConfig(tenantId);

    if (kind) {
      const gatewayConfig = tenantConfig.gateways[kind] || {
        enabled: false,
        testMode: true,
        credentials: {},
        hasCredentials: false,
        updatedAt: "",
      };
      return NextResponse.json({
        ok: true,
        tenantId,
        kind,
        config: gatewayConfig,
        isActive: tenantConfig.activeGateway === kind,
      });
    }

    return NextResponse.json({
      ok: true,
      tenantId,
      activeGateway: tenantConfig.activeGateway,
      gateways: tenantConfig.gateways,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load config";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      tenantId?: string;
      kind: string;
      enabled?: boolean;
      testMode?: boolean;
      credentials?: Record<string, string>;
      isPrimary?: boolean;
    };

    const tenantId = body.tenantId || "platform";
    const kind = body.kind || (body as Record<string, unknown>).gatewayKind as string;

    if (!kind) {
      return NextResponse.json({ ok: false, error: "kind is required" }, { status: 400 });
    }

    await saveTenantGatewayConfig(tenantId, kind, {
      enabled: body.enabled,
      testMode: body.testMode,
      credentials: body.credentials,
      isPrimary: body.isPrimary,
    });

    if (body.isPrimary) {
      await setTenantActiveGateway(tenantId, kind);
    }

    const updated = await getTenantPaymentConfig(tenantId);
    return NextResponse.json({
      ok: true,
      message: "تم حفظ إعدادات البوابة بنجاح وبشكل فوري",
      tenantId,
      activeGateway: updated.activeGateway,
      config: updated.gateways[kind],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save config";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
